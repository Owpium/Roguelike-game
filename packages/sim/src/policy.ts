import {
  DIR_VECTOR,
  RULES,
  eq,
  findUnit,
  inGrid,
  legalEntries,
  project,
  reduce,
  translate,
  type Cell,
  type CombatState,
  type EnemyType,
  type LegalEntry,
} from "@rl/core";

/**
 * IA de joueur gloutonne — la plus simple des trois que `balance-simulator` devra écrire
 * (l'IA gloutonne, l'IA orientée archétype, l'IA aléatoire). Elle sert de plancher : un jeu
 * dont le taux de victoire ne se distingue pas entre ces trois-là n'a pas assez de décisions.
 *
 * Elle ne prétend pas bien jouer. Elle prétend jouer *de façon reproductible*.
 */

/** Cases visées par une intention, ancre incluse (combat.md § 8.2). */
export function threatenedCells(state: CombatState): Cell[] {
  const out: Cell[] = [];
  for (const unit of state.units) {
    if (unit.intent?.kind !== "attack") continue;
    for (const offset of unit.intent.pattern) {
      const c = translate(unit.cell, offset);
      if (inGrid(c)) out.push(c);
    }
  }
  return out;
}

function isThreatened(state: CombatState, c: Cell): boolean {
  return threatenedCells(state).some((t) => eq(t, c));
}

/** Distance au plus proche ennemi. Sert à ce que l'IA daigne avancer. */
function distanceToNearest(state: CombatState, from: Cell): number {
  let best = Infinity;
  for (const unit of state.units) {
    best = Math.min(best, Math.abs(unit.cell.x - from.x) + Math.abs(unit.cell.y - from.y));
  }
  return best;
}

function incomingDamage(state: CombatState): number {
  let total = 0;
  for (const unit of state.units) {
    if (unit.intent?.kind !== "attack") continue;
    for (const offset of unit.intent.pattern) {
      if (eq(translate(unit.cell, offset), state.player.cell)) total += unit.intent.value;
    }
  }
  return total;
}

function scoreEntry(state: CombatState, entry: LegalEntry): number {
  const view = project(state);
  const action = entry.action;

  if (action.kind === "free_step" || (action.kind === "spend" && action.action.type === "step")) {
    const dir = action.kind === "free_step" ? action.dir : action.action.type === "step" ? action.action.dir : null;
    if (!dir) return 0;
    const to = translate(view.player.cell, DIR_VECTOR[dir]);
    const escaping = isThreatened(view, view.player.cell) && !isThreatened(view, to);
    // L'esquive passe APRÈS les frappes : une première version notait le pas gratuit au-dessus
    // d'une frappe non létale, et l'IA passait la partie à fuir sans jamais tuer personne.
    if (escaping) return action.kind === "free_step" ? 6 : 3;

    // Se rapprocher quand aucune frappe n'est possible. Sans ça, l'IA reste plantée sur sa
    // case de départ à attendre que les ennemis viennent, et les combats durent trois fois
    // le budget de tours.
    const closing =
      distanceToNearest(view, to) < distanceToNearest(view, view.player.cell) &&
      !isThreatened(view, to);
    if (!closing) return 0;
    return action.kind === "free_step" ? 2 : 1;
  }

  if (action.kind !== "spend") return 0;

  switch (action.action.type) {
    case "strike": {
      const target = findUnit(view, action.action.targetId);
      if (!target) return 0;
      // Achever une unité vaut davantage que d'entamer : un ennemi mort n'agit plus.
      return target.hp <= RULES.strikeDamage ? 14 : 10;
    }
    case "guard": {
      const incoming = incomingDamage(view);
      if (incoming === 0) return 0;
      return Math.min(incoming, RULES.guardShield) >= RULES.guardShield ? 7 : 4;
    }
    case "surge": {
      const { dir, distance } = action.action;
      let killed = 0;
      for (let step = 1; step <= distance; step++) {
        const c = translate(view.player.cell, {
          dx: DIR_VECTOR[dir].dx * step,
          dy: DIR_VECTOR[dir].dy * step,
        });
        const unit = view.units.find((u) => eq(u.cell, c));
        if (unit && unit.hp <= RULES.surgeTrampleDamage) killed += 1;
      }
      const arrival = translate(view.player.cell, {
        dx: DIR_VECTOR[dir].dx * distance,
        dy: DIR_VECTOR[dir].dy * distance,
      });
      return killed * 10 + (isThreatened(view, arrival) ? 0 : 2);
    }
    default:
      return 0;
  }
}

/** Joue un tour entier : pose les entrées, conserve, valide. */
export function playTurn(state: CombatState, types: Record<string, EnemyType>): CombatState {
  let current = state;

  for (let guard = 0; guard < 12; guard += 1) {
    const entries = legalEntries(current);
    if (entries.length === 0) break;
    let best: LegalEntry | null = null;
    let bestScore = 0;
    for (const entry of entries) {
      const score = scoreEntry(current, entry);
      if (score > bestScore) {
        bestScore = score;
        best = entry;
      }
    }
    if (!best) break;
    current = reduce(current, { type: "ENTER", entry: best.action }, types).state;
  }

  // Conserver ce qui reste et qui promet : une Frappe gardée prépare une Paire au tour suivant.
  const spent = new Set(
    current.pendingActions.flatMap((a) => (a.kind === "spend" ? [a.dieId] : [])),
  );
  for (const die of current.hand) {
    if (spent.has(die.dieId)) continue;
    if (die.face !== "strike" && die.face !== "spark") continue;
    current = reduce(current, { type: "KEEP", dieId: die.dieId }, types).state;
  }

  return reduce(current, { type: "VALIDATE" }, types).state;
}
