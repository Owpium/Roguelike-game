import {
  DIR_ORDER,
  DIR_VECTOR,
  cellsBetween,
  eq,
  manhattan,
  offsetBetween,
  onSameLine,
  translate,
  type Cell,
} from "./geometry.ts";
import { isFree, unitAt } from "./board.ts";
import type { CombatState, EnemyType, Intent, Unit } from "./types.ts";

/**
 * IA ennemie (docs/design/combat.md § 8.4).
 *
 * Toute décision est une fonction pure de l'état : aucun appel au RNG. C'est ce qui permet à
 * `balance-simulator` de rejouer une partie à l'identique, et au joueur de raisonner.
 * Ordre de départage universel des directions : Haut, Droite, Bas, Gauche.
 */

/** Ligne orthogonale dégagée entre deux cases (personne sur les cases intermédiaires). */
export function hasClearLine(state: CombatState, from: Cell, to: Cell): boolean {
  if (!onSameLine(from, to)) return false;
  return cellsBetween(from, to).every((c) => !unitAt(state, c) && !eq(state.player.cell, c));
}

function freeNeighbours(state: CombatState, from: Cell): { dir: (typeof DIR_ORDER)[number]; cell: Cell }[] {
  return DIR_ORDER.map((dir) => ({ dir, cell: translate(from, DIR_VECTOR[dir]) })).filter((n) =>
    isFree(state, n.cell),
  );
}

/** Marche d'une case vers le joueur. Renvoie `null` si l'unité est bloquée. */
export function stepTowardsPlayer(state: CombatState, from: Cell): Cell | null {
  const target = state.player.cell;
  const options = freeNeighbours(state, from);
  const current = manhattan(from, target);

  const closer = options.filter((o) => manhattan(o.cell, target) < current);
  if (closer.length > 0) return closer[0]!.cell;

  const neutral = options.filter((o) => manhattan(o.cell, target) === current);
  if (neutral.length > 0) return neutral[0]!.cell;

  // Un ennemi se laisse bloquer par un corps : c'est une tactique du joueur, pas un bug.
  return null;
}

function attackIntent(unit: Unit, type: EnemyType, target: Cell): Intent {
  return {
    kind: "attack",
    // Le motif est figé au télégraphe ; l'ancre suit l'unité (§ 8.2). C'est ce qui fait
    // qu'esquiver est la défense principale du jeu, et qu'une poussée a un effet défensif.
    pattern: type.pattern.map((o) => {
      const anchor = offsetBetween(unit.cell, target);
      return { dx: anchor.dx + o.dx, dy: anchor.dy + o.dy };
    }),
    value: type.attack,
    push: type.push ? { distance: type.push.distance, awayFromSource: true } : null,
    path: [],
  };
}

function moveIntent(from: Cell, to: Cell | null): Intent {
  return {
    kind: "move",
    pattern: [],
    value: 0,
    push: null,
    path: to ? [offsetBetween(from, to)] : [],
  };
}

function meleeIntent(state: CombatState, unit: Unit, type: EnemyType): Intent {
  if (manhattan(unit.cell, state.player.cell) <= type.range.max) {
    return attackIntent(unit, type, state.player.cell);
  }
  return moveIntent(unit.cell, stepTowardsPlayer(state, unit.cell));
}

function sniperIntent(state: CombatState, unit: Unit, type: EnemyType): Intent {
  const distance = manhattan(unit.cell, state.player.cell);
  const inRange = distance >= type.range.min && distance <= type.range.max;
  if (inRange && hasClearLine(state, unit.cell, state.player.cell)) {
    return attackIntent(unit, type, state.player.cell);
  }

  // Il ne se déplace jamais sur une case à distance <= 1 du joueur.
  const options = freeNeighbours(state, unit.cell).filter(
    (o) => manhattan(o.cell, state.player.cell) > 1,
  );

  // (a) une case qui donnerait immédiatement une ligne dégagée à bonne portée
  const opening = options.filter((o) => {
    const d = manhattan(o.cell, state.player.cell);
    return d >= type.range.min && d <= type.range.max && hasClearLine(state, o.cell, state.player.cell);
  });
  if (opening.length > 0) return moveIntent(unit.cell, opening[0]!.cell);

  // (b) la case qui minimise min(|dx|, |dy|) — donc celle qui se rapproche d'un alignement
  if (options.length > 0) {
    const score = (c: Cell): number =>
      Math.min(Math.abs(c.x - state.player.cell.x), Math.abs(c.y - state.player.cell.y));
    const best = options.reduce((a, b) => (score(b.cell) < score(a.cell) ? b : a));
    if (score(best.cell) < score(unit.cell)) return moveIntent(unit.cell, best.cell);
  }

  // (c) rester en place
  return moveIntent(unit.cell, null);
}

export function computeIntent(state: CombatState, unit: Unit, type: EnemyType): Intent {
  switch (type.brain) {
    case "melee":
      return meleeIntent(state, unit, type);
    case "sniper":
      return sniperIntent(state, unit, type);
  }
}
