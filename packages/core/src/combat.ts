import {
  DIR_VECTOR,
  eq,
  inGrid,
  manhattan,
  translate,
  type Cell,
  type Dir,
} from "./geometry.ts";
import { applyDamage, assertOccupancy, findUnit, isFree, removeDying, push, unitAt } from "./board.ts";
import { computeIntent, hasClearLine } from "./intents.ts";
import { detectCombos } from "./combos.ts";
import { RULES, type RuleSet } from "./rules.ts";
import { nextInt, type RngState } from "./rng.ts";
import type {
  CombatState,
  Die,
  EnemyType,
  Face,
  GameEvent,
  HandDie,
  PendingAction,
  SpendAction,
  Unit,
} from "./types.ts";

export interface EncounterUnit {
  typeId: string;
  cell: Cell;
}

export interface Encounter {
  id: string;
  units: EncounterUnit[];
}

export interface CombatSetup {
  rng: RngState;
  /** Variante de règles. Par défaut, celles de `docs/design/combat.md`. */
  rules?: RuleSet;
  pool: Die[];
  hp: number;
  hpMax: number;
  encounter: Encounter;
  types: Record<string, EnemyType>;
  playerStart: Cell;
}

const clone = <T>(value: T): T => structuredClone(value);

/* ------------------------------------------------------------------ mise en place */

export function createCombat(setup: CombatSetup): CombatState {
  const units: Unit[] = setup.encounter.units.map((spawn, index) => {
    const type = setup.types[spawn.typeId];
    if (!type) throw new Error(`Type d'ennemi inconnu : ${spawn.typeId}`);
    return {
      id: index + 1,
      typeId: type.id,
      spawnIndex: index,
      cell: spawn.cell,
      hp: type.hp,
      hpMax: type.hp,
      shield: 0,
      armor: type.armor,
      intent: null,
    };
  });

  const state: CombatState = {
    rng: clone(setup.rng),
    rules: setup.rules ?? RULES,
    turn: 0,
    phase: "choice",
    player: { cell: setup.playerStart, hp: setup.hp, hpMax: setup.hpMax, shield: 0 },
    units,
    // La Main ne traverse pas les combats (D29) : pool complet, discard vide, Main vide.
    pool: clone(setup.pool),
    discard: [],
    hand: [],
    pendingActions: [],
    triggerBudget: RULES.triggerBudgetPerTurn,
    triggersBySource: {},
    lastTurnLog: [],
    nextUnitId: units.length + 1,
    dieRegistry: Object.fromEntries(setup.pool.map((die) => [die.id, die])),
  };

  assertOccupancy(state);
  refreshIntents(state, setup.types);
  beginTurn(state, []);
  return state;
}

function refreshIntents(state: CombatState, types: Record<string, EnemyType>): void {
  for (const unit of [...state.units].sort((a, b) => a.spawnIndex - b.spawnIndex)) {
    unit.intent = computeIntent(state, unit, types[unit.typeId]!);
  }
}

/* ------------------------------------------------------------------ tirage */

/**
 * Tirage et lancer sont un seul événement aléatoire (D20). Ordre de consommation du RNG figé
 * pour I1 : sélection de tous les dés d'abord, dans l'ordre du tirage, puis lancer de chacun
 * dans le même ordre.
 *
 * La sélection se fait par index aléatoire dans le `pool`, ce qui rend inutile un mélange
 * explicite au recyclage : la distribution est la même et le RNG est consommé une seule fois
 * par dé. Le `pool` reste donc bien un multiset, jamais une pile ordonnée (I5).
 */
function drawAndRoll(state: CombatState, log: GameEvent[]): void {
  const missing = state.rules.handSize - state.hand.length;
  if (missing <= 0) return;

  const drawn: Die[] = [];
  for (let i = 0; i < missing; i++) {
    if (state.pool.length === 0) {
      if (state.discard.length === 0) break; // pool et discard vides : Main incomplète
      state.pool = state.discard;
      state.discard = [];
    }
    const index = nextInt(state.rng, state.pool.length);
    drawn.push(state.pool.splice(index, 1)[0]!);
  }

  const rolled: HandDie[] = drawn.map((die) => ({
    dieId: die.id,
    face: die.faces[nextInt(state.rng, die.faces.length)]!,
    kept: false,
  }));

  state.hand = [...state.hand, ...rolled];
  log.push({ t: "HAND_DRAWN", faces: rolled.map((d) => d.face) });
}

function beginTurn(state: CombatState, log: GameEvent[]): void {
  state.turn += 1;
  state.triggerBudget = state.rules.triggerBudgetPerTurn;
  state.triggersBySource = {};
  log.push({ t: "TURN_START", turn: state.turn });
  drawAndRoll(state, log);
  state.pendingActions = [];
  state.phase = "choice";
}

/* ------------------------------------------------------------------ légalité */

export function freeStepsTaken(state: CombatState): number {
  return state.pendingActions.filter((a) => a.kind === "free_step").length;
}

export function freeStepAvailable(state: CombatState): boolean {
  return freeStepsTaken(state) < state.rules.freeStepsPerTurn;
}

export function keptCount(state: CombatState): number {
  return state.hand.filter((d) => d.kept).length;
}

export function spentDieIds(state: CombatState): Set<string> {
  return new Set(
    state.pendingActions.flatMap((a) => (a.kind === "spend" ? [a.dieId] : [])),
  );
}

/**
 * L'état projeté : la Main posée, appliquée depuis l'instantané de début de tour, sans les
 * combos ni la phase ennemie. C'est ce que le joueur voit pendant la phase de choix — et donc
 * ce contre quoi la légalité d'une nouvelle entrée doit être vérifiée.
 */
export function project(state: CombatState): CombatState {
  const projected = clone(state);
  const actions = projected.pendingActions;
  projected.pendingActions = [];
  const sink: GameEvent[] = [];
  for (const action of actions) {
    applyEntry(projected, action, sink);
    removeDying(projected, sink);
  }
  return projected;
}

export interface LegalEntry {
  action: PendingAction;
  label: string;
}

/** Toutes les entrées légales dans l'état courant — le simulateur s'en sert comme d'un menu. */
export function legalEntries(state: CombatState): LegalEntry[] {
  if (state.phase !== "choice") return [];
  const view = project(state);
  const out: LegalEntry[] = [];

  if (freeStepAvailable(state)) {
    for (const dir of ["up", "right", "down", "left"] as Dir[]) {
      if (isFree(view, translate(view.player.cell, DIR_VECTOR[dir]))) {
        out.push({ action: { kind: "free_step", dir }, label: `pas ${dir}` });
      }
    }
  }

  const spent = spentDieIds(state);
  for (const die of state.hand) {
    if (spent.has(die.dieId) || die.kept) continue;
    const faces: Exclude<Face, "spark">[] =
      die.face === "spark" ? ["strike", "guard", "surge"] : [die.face];

    for (const effective of faces) {
      const base = { kind: "spend" as const, dieId: die.dieId, rolled: die.face, effective };

      if (effective === "strike") {
        for (const unit of view.units) {
          if (canStrike(view, view.player.cell, unit)) {
            out.push({
              action: { ...base, action: { type: "strike", targetId: unit.id } },
              label: `frappe #${unit.id}`,
            });
          }
        }
      }

      if (effective === "guard") {
        out.push({ action: { ...base, action: { type: "guard" } }, label: "garde" });
      }

      if (effective === "surge") {
        for (const dir of ["up", "right", "down", "left"] as Dir[]) {
          for (const distance of state.rules.surgeDistances) {
            const arrival = translate(view.player.cell, {
              dx: DIR_VECTOR[dir].dx * distance,
              dy: DIR_VECTOR[dir].dy * distance,
            });
            if (isFree(view, arrival)) {
              out.push({
                action: { ...base, action: { type: "surge", dir, distance: distance as 2 | 3 } },
                label: `élan ${dir} ${distance}`,
              });
            }
          }
        }
      }

      // Dépense de secours : disponible quelle que soit la face (§ 5.5).
      for (const dir of ["up", "right", "down", "left"] as Dir[]) {
        if (isFree(view, translate(view.player.cell, DIR_VECTOR[dir]))) {
          out.push({ action: { ...base, action: { type: "step", dir } }, label: `secours ${dir}` });
        }
      }
    }
  }

  return out;
}

export function canStrike(state: CombatState, from: Cell, unit: Unit): boolean {
  const distance = manhattan(from, unit.cell);
  if (distance < RULES.strikeRangeMin || distance > RULES.strikeRangeMax) return false;
  return hasClearLine(state, from, unit.cell);
}

/* ------------------------------------------------------------------ résolution */

function moveOne(state: CombatState, dir: Dir, cause: string, log: GameEvent[]): void {
  const to = translate(state.player.cell, DIR_VECTOR[dir]);
  if (!isFree(state, to)) return; // § 10.2 : un déplacement illégal ne fait rien, il ne fait pas long feu
  const from = state.player.cell;
  state.player.cell = to;
  log.push({ t: "UNIT_MOVED", unitId: "player", from, to, cause });
}

/**
 * Élan (§ 5). Le chemin est parcouru case par case ; chaque ennemi traversé subit 1 dégât et
 * est retiré immédiatement s'il meurt, avant l'évaluation de la case suivante. La distance
 * peut se raccourcir, jamais s'allonger.
 */
function resolveSurge(state: CombatState, dir: Dir, distance: number, log: GameEvent[]): void {
  const vector = DIR_VECTOR[dir];
  const from = state.player.cell;
  const path: Cell[] = [];
  for (let step = 1; step <= distance; step++) {
    const c = translate(from, { dx: vector.dx * step, dy: vector.dy * step });
    if (!inGrid(c)) break;
    path.push(c);
  }

  for (const c of path) {
    const victim = unitAt(state, c);
    if (victim) {
      applyDamage(state, victim.id, state.rules.surgeTrampleDamage, "player", log);
      removeDying(state, log);
    }
  }

  for (let i = path.length - 1; i >= 0; i--) {
    if (isFree(state, path[i]!)) {
      const to = path[i]!;
      state.player.cell = to;
      log.push({ t: "UNIT_MOVED", unitId: "player", from, to, cause: "surge" });
      return;
    }
  }
}

function applySpend(state: CombatState, action: SpendAction, log: GameEvent[]): void {
  switch (action.type) {
    case "strike": {
      const target = findUnit(state, action.targetId);
      // § 10.5 : une dépense dont la cible a disparu fait long feu. Le dé est bel et bien
      // dépensé et compte pour les combos — surtuer ne doit pas casser un combo.
      if (!target) return;
      applyDamage(state, target.id, state.rules.strikeDamage, "player", log);
      return;
    }
    case "guard":
      state.player.shield += state.rules.guardShield;
      log.push({ t: "SHIELD_GAINED", unitId: "player", amount: state.rules.guardShield });
      return;
    case "surge":
      resolveSurge(state, action.dir, action.distance, log);
      return;
    case "step":
      moveOne(state, action.dir, "spend_step", log);
      return;
  }
}

function applyEntry(state: CombatState, entry: PendingAction, log: GameEvent[]): void {
  if (entry.kind === "free_step") {
    moveOne(state, entry.dir, "free_step", log);
    return;
  }
  log.push({ t: "DIE_SPENT", dieId: entry.dieId, face: entry.effective, actionKind: entry.action.type });
  applySpend(state, entry.action, log);
}

function resolveEnemy(state: CombatState, unit: Unit, log: GameEvent[]): void {
  const intent = unit.intent;
  if (!intent) return;

  if (intent.kind === "attack") {
    for (const offset of intent.pattern) {
      const cell = translate(unit.cell, offset);
      if (!inGrid(cell)) continue;
      if (!eq(cell, state.player.cell)) continue; // pas de tir fratricide en v0
      applyDamage(state, "player", intent.value, unit.id, log);
      if (intent.push) {
        const dir = directionAway(unit.cell, cell);
        if (dir) push(state, "player", dir, intent.push.distance, unit.id, log);
      }
    }
  } else if (intent.kind === "move") {
    for (const offset of intent.path) {
      const to = translate(unit.cell, offset);
      if (!isFree(state, to)) break; // s'arrête devant le premier blocage
      const from = unit.cell;
      unit.cell = to;
      log.push({ t: "UNIT_MOVED", unitId: unit.id, from, to, cause: "intent" });
    }
  } else {
    throw new Error(
      `Intention « ${intent.kind} » non implémentée : elle entre avec le contenu des actes 2 et 3.`,
    );
  }

  log.push({ t: "INTENT_RESOLVED", unitId: unit.id });
}

function directionAway(source: Cell, target: Cell): Dir | null {
  const dx = target.x - source.x;
  const dy = target.y - source.y;
  if (dx === 0 && dy === 0) return null;
  if (Math.abs(dx) >= Math.abs(dy)) return dx > 0 ? "right" : "left";
  return dy > 0 ? "down" : "up";
}

/* ------------------------------------------------------------------ réducteur */

export type CombatAction =
  | { type: "ENTER"; entry: PendingAction }
  | { type: "KEEP"; dieId: string }
  | { type: "UNKEEP"; dieId: string }
  | { type: "UNDO" }
  | { type: "UNDO_ALL" }
  | { type: "VALIDATE" };

export interface ReduceResult {
  state: CombatState;
  log: GameEvent[];
}

export function reduce(
  previous: CombatState,
  action: CombatAction,
  types: Record<string, EnemyType>,
): ReduceResult {
  if (previous.phase !== "choice") return { state: previous, log: [] };
  const state = clone(previous);

  switch (action.type) {
    case "ENTER": {
      const entry = action.entry;
      if (entry.kind === "spend") {
        const die = state.hand.find((d) => d.dieId === entry.dieId);
        if (!die || die.kept || spentDieIds(state).has(entry.dieId)) {
          return { state: previous, log: [] };
        }
      } else if (!freeStepAvailable(state)) {
        return { state: previous, log: [] };
      }
      state.pendingActions.push(entry);
      return { state, log: [] };
    }

    case "KEEP": {
      if (keptCount(state) >= state.rules.keepCap) return { state: previous, log: [] };
      if (spentDieIds(state).has(action.dieId)) return { state: previous, log: [] };
      const die = state.hand.find((d) => d.dieId === action.dieId);
      if (die) die.kept = true;
      return { state, log: [] };
    }

    case "UNKEEP": {
      const die = state.hand.find((d) => d.dieId === action.dieId);
      if (die) die.kept = false;
      return { state, log: [] };
    }

    case "UNDO":
      // Annulation LIFO : retirer une entrée au milieu obligerait à définir une sémantique
      // de réordonnancement, donc une UI de tri, donc un geste composé (combat.md § 3).
      state.pendingActions.pop();
      return { state, log: [] };

    case "UNDO_ALL":
      state.pendingActions = [];
      return { state, log: [] };

    case "VALIDATE":
      return validate(state, types);
  }
}

function validate(state: CombatState, types: Record<string, EnemyType>): ReduceResult {
  const log: GameEvent[] = [];
  const entries = state.pendingActions;
  state.pendingActions = [];

  // 1. Les entrées du joueur, dans l'ordre choisi.
  for (const entry of entries) {
    applyEntry(state, entry, log);
    removeDying(state, log);
    assertOccupancy(state);
    if (state.player.hp <= 0) return lose(state, log);
  }

  // 2. Les combos, dans l'ordre canonique.
  const sequence = entries.flatMap((e) => (e.kind === "spend" ? [e.effective] : []));
  const combos = detectCombos(sequence);
  for (const combo of combos) log.push({ t: "COMBO_DETECTED", combo });
  for (const combo of combos) {
    // Aucun combo n'a d'effet propre en v0 : ce sont des crochets pour les reliques.
    log.push({ t: "COMBO_RESOLVED", combo });
  }

  log.push({ t: "PLAYER_PHASE_END" });

  // 3. Victoire — testée après la phase du joueur, combos inclus (§ 13.1).
  if (state.units.length === 0) {
    endTurnBookkeeping(state, log, types, { skipIntents: true });
    log.push({ t: "COMBAT_WON" });
    state.phase = "won";
    state.lastTurnLog = log;
    return { state, log };
  }

  // 4. La phase ennemie, par index de spawn croissant.
  for (const unit of [...state.units].sort((a, b) => a.spawnIndex - b.spawnIndex)) {
    if (!findUnit(state, unit.id)) continue;
    resolveEnemy(state, findUnit(state, unit.id)!, log);
    removeDying(state, log);
    assertOccupancy(state);
    if (state.player.hp <= 0) return lose(state, log);
  }
  log.push({ t: "ENEMY_PHASE_END" });

  // 5. Fin de tour.
  endTurnBookkeeping(state, log, types, { skipIntents: false });

  if (state.turn >= state.rules.maxTurns) return lose(state, log);

  beginTurn(state, log);
  state.lastTurnLog = log;
  return { state, log };
}

function endTurnBookkeeping(
  state: CombatState,
  log: GameEvent[],
  types: Record<string, EnemyType>,
  options: { skipIntents: boolean },
): void {
  state.player.shield = 0;

  const keptIds = new Set(state.hand.filter((d) => d.kept).map((d) => d.dieId));
  const byId = new Map<string, HandDie>(state.hand.map((d) => [d.dieId, d]));

  for (const die of state.hand) {
    if (keptIds.has(die.dieId)) continue;
    state.discard.push(dieRecord(state, die.dieId));
  }
  state.hand = [...keptIds].map((id) => byId.get(id)!);

  log.push({ t: "TURN_END" });
  if (!options.skipIntents) {
    for (const unit of [...state.units].sort((a, b) => a.spawnIndex - b.spawnIndex)) {
      unit.intent = computeIntent(state, unit, types[unit.typeId]!);
    }
  }
}

/**
 * Les dés en Main ne portent que leur face ; le dé lui-même vit dans le pool ou le discard.
 * On le reconstitue depuis le registre du combat.
 */
function dieRecord(state: CombatState, dieId: string): Die {
  const known = state.dieRegistry[dieId];
  if (!known) throw new Error(`Dé inconnu : ${dieId}`);
  return known;
}

function lose(state: CombatState, log: GameEvent[]): ReduceResult {
  log.push({ t: "COMBAT_LOST" });
  state.phase = "lost";
  state.lastTurnLog = log;
  return { state, log };
}
