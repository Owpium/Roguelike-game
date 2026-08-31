import { eq, inGrid, translate, type Cell, type Dir, DIR_VECTOR } from "./geometry.ts";
import type { CombatState, GameEvent, Unit } from "./types.ts";

export type TargetRef = number | "player";

export function unitAt(state: CombatState, c: Cell): Unit | undefined {
  return state.units.find((u) => eq(u.cell, c));
}

export function isOccupied(state: CombatState, c: Cell): boolean {
  return eq(state.player.cell, c) || state.units.some((u) => eq(u.cell, c));
}

/** Une case libre est dans la grille et n'est occupée par personne. */
export function isFree(state: CombatState, c: Cell): boolean {
  return inGrid(c) && !isOccupied(state, c);
}

export function findUnit(state: CombatState, id: number): Unit | undefined {
  return state.units.find((u) => u.id === id);
}

/**
 * Invariant du moteur : au plus une unité par case, à tout instant (combat.md § 10.2).
 * Une violation est un crash, pas un avertissement.
 */
export function assertOccupancy(state: CombatState): void {
  const seen = new Set<string>();
  for (const c of [state.player.cell, ...state.units.map((u) => u.cell)]) {
    const key = `${c.x},${c.y}`;
    if (seen.has(key)) throw new Error(`Invariant d'occupation violé en (${c.x}, ${c.y})`);
    seen.add(key);
  }
}

/**
 * Application d'une instance de dégâts (combat.md § 4) : Armure, puis Bouclier, puis PV.
 * Une instance est atomique : jamais fractionnée entre deux cibles, jamais recomposée.
 */
export function applyDamage(
  state: CombatState,
  target: TargetRef,
  amount: number,
  source: TargetRef | null,
  log: GameEvent[],
): void {
  if (target === "player") {
    const dealt = Math.max(0, amount);
    const absorbed = Math.min(state.player.shield, dealt);
    state.player.shield -= absorbed;
    state.player.hp -= dealt - absorbed;
    log.push({ t: "DAMAGE_DEALT", sourceId: source, targetId: "player", amount: dealt });
    return;
  }
  const unit = findUnit(state, target);
  if (!unit) return;
  const afterArmor = Math.max(0, amount - unit.armor);
  const absorbed = Math.min(unit.shield, afterArmor);
  unit.shield -= absorbed;
  unit.hp -= afterArmor - absorbed;
  log.push({ t: "DAMAGE_DEALT", sourceId: source, targetId: unit.id, amount: afterArmor });
}

/**
 * Retire les unités mourantes à la fin de l'effet atomique courant, par `id` croissant
 * (combat.md § 10.4). Ne jamais retirer au milieu d'un effet.
 */
export function removeDying(state: CombatState, log: GameEvent[]): void {
  const dying = state.units.filter((u) => u.hp <= 0).sort((a, b) => a.id - b.id);
  if (dying.length === 0) return;
  for (const unit of dying) log.push({ t: "UNIT_DIED", unitId: unit.id });
  const dead = new Set(dying.map((u) => u.id));
  state.units = state.units.filter((u) => !dead.has(u.id));
}

/**
 * Poussée (combat.md § 7). Une case à la fois ; dès qu'une case est indisponible, la poussée
 * s'arrête et l'unité subit un unique dégât de choc. Une poussée hors grille ne tue pas.
 */
export function push(
  state: CombatState,
  target: TargetRef,
  dir: Dir,
  distance: number,
  source: TargetRef | null,
  log: GameEvent[],
): void {
  const vector = DIR_VECTOR[dir];
  const getCell = (): Cell => (target === "player" ? state.player.cell : findUnit(state, target)!.cell);
  const setCell = (c: Cell): void => {
    if (target === "player") state.player.cell = c;
    else findUnit(state, target)!.cell = c;
  };
  if (target !== "player" && !findUnit(state, target)) return;

  const from = getCell();
  let blocked = false;
  for (let step = 0; step < distance; step++) {
    const next = translate(getCell(), vector);
    if (!isFree(state, next)) {
      blocked = true;
      break;
    }
    setCell(next);
  }
  log.push({ t: "UNIT_PUSHED", unitId: target, from, to: getCell(), blocked });
  if (blocked) applyDamage(state, target, state.rules.pushBlockedDamage, source, log);
}
