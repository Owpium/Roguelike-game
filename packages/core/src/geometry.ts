/**
 * La grille : 5 colonnes × 7 rangées, voisinage orthogonal uniquement.
 * Les diagonales n'existent pas dans ce jeu (docs/design/combat.md § 1).
 */

export interface Cell {
  x: number;
  y: number;
}

export interface Offset {
  dx: number;
  dy: number;
}

export const GRID_W = 5;
export const GRID_H = 7;

/** Case de départ du joueur (combat.md § 1). */
export const PLAYER_START: Cell = { x: 3, y: 5 };

export type Dir = "up" | "right" | "down" | "left";

/** Ordre de départage universel de l'IA (combat.md § 8.4). Ne jamais réordonner. */
export const DIR_ORDER: readonly Dir[] = ["up", "right", "down", "left"];

export const DIR_VECTOR: Record<Dir, Offset> = {
  up: { dx: 0, dy: -1 },
  right: { dx: 1, dy: 0 },
  down: { dx: 0, dy: 1 },
  left: { dx: -1, dy: 0 },
};

export function cell(x: number, y: number): Cell {
  return { x, y };
}

export function eq(a: Cell, b: Cell): boolean {
  return a.x === b.x && a.y === b.y;
}

export function translate(c: Cell, o: Offset): Cell {
  return { x: c.x + o.dx, y: c.y + o.dy };
}

export function offsetBetween(from: Cell, to: Cell): Offset {
  return { dx: to.x - from.x, dy: to.y - from.y };
}

export function inGrid(c: Cell): boolean {
  return c.x >= 1 && c.x <= GRID_W && c.y >= 1 && c.y <= GRID_H;
}

export function manhattan(a: Cell, b: Cell): number {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

/** Deux cases distinctes partageant `x` ou `y`. */
export function onSameLine(a: Cell, b: Cell): boolean {
  return !eq(a, b) && (a.x === b.x || a.y === b.y);
}

/** Cases strictement intermédiaires entre deux cases alignées. */
export function cellsBetween(a: Cell, b: Cell): Cell[] {
  if (!onSameLine(a, b)) return [];
  const stepX = Math.sign(b.x - a.x);
  const stepY = Math.sign(b.y - a.y);
  const out: Cell[] = [];
  let current = { x: a.x + stepX, y: a.y + stepY };
  while (!eq(current, b)) {
    out.push(current);
    current = { x: current.x + stepX, y: current.y + stepY };
  }
  return out;
}

/** Direction menant de `from` vers `to`, si les deux sont alignées. */
export function directionTo(from: Cell, to: Cell): Dir | null {
  if (!onSameLine(from, to)) return null;
  if (to.y < from.y) return "up";
  if (to.y > from.y) return "down";
  if (to.x > from.x) return "right";
  return "left";
}

export function neighbours(c: Cell): { dir: Dir; cell: Cell }[] {
  return DIR_ORDER.map((dir) => ({ dir, cell: translate(c, DIR_VECTOR[dir]) })).filter((n) =>
    inGrid(n.cell),
  );
}
