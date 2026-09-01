import { inGrid, translate, type Cell } from "./geometry.ts";
import { isFree } from "./board.ts";
import type { CombatState, Unit } from "./types.ts";

/**
 * État dérivé : recalculé, jamais persisté (combat.md § 2.2). C'est ce qui rend le rendu
 * jetable et le simulateur possible — l'interface et l'IA lisent exactement la même chose.
 */

export const cellKey = (c: Cell): string => `${c.x},${c.y}`;

/**
 * Case d'ancrage réelle d'une intention. Pour une `charge`, le motif est ancré sur la case
 * d'arrivée : il faut donc projeter le déplacement, blocages compris.
 */
export function intentAnchor(state: CombatState, unit: Unit): Cell {
  let anchor = unit.cell;
  const intent = unit.intent;
  if (!intent) return anchor;
  if (intent.kind !== "move" && intent.kind !== "charge") return anchor;
  for (const offset of intent.path) {
    const to = translate(anchor, offset);
    if (!isFree(state, to)) break;
    anchor = to;
  }
  return anchor;
}

/**
 * Menace en points de vie pesant sur chaque case. Se recalcule à chaque appel, donc les
 * cases visées suivent en direct une poussée posée pendant la phase de choix (D28).
 */
export function threatMap(state: CombatState): Map<string, number> {
  const map = new Map<string, number>();
  for (const unit of state.units) {
    const intent = unit.intent;
    if (!intent || (intent.kind !== "attack" && intent.kind !== "charge")) continue;
    const anchor = intentAnchor(state, unit);
    for (const offset of intent.pattern) {
      const cell = translate(anchor, offset);
      if (!inGrid(cell)) continue;
      map.set(cellKey(cell), (map.get(cellKey(cell)) ?? 0) + intent.value);
    }
  }
  return map;
}

/** Menace apportée par une seule unité sur une case. */
export function threatFromUnit(state: CombatState, unit: Unit, cell: Cell): number {
  const intent = unit.intent;
  if (!intent || (intent.kind !== "attack" && intent.kind !== "charge")) return 0;
  const anchor = intentAnchor(state, unit);
  return intent.pattern.some(
    (o) => translate(anchor, o).x === cell.x && translate(anchor, o).y === cell.y,
  )
    ? intent.value
    : 0;
}
