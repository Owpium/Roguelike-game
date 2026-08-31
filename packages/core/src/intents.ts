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
  type Offset,
} from "./geometry.ts";
import { isFree, unitAt } from "./board.ts";
import type { CombatState, EnemyType, Intent, Unit } from "./types.ts";
import type { AttackShape } from "./rules.ts";

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

/**
 * Résout la forme d'un motif d'attaque (D46) au moment du télégraphe.
 *
 * La forme ne peut pas être un champ statique d'offsets : `lunge` et `line3` dépendent de
 * l'axe ennemi → cible. Elle est donc calculée ici, puis figée dans `intent.pattern` comme
 * n'importe quel motif. D28 s'applique inchangée : l'ancre suit l'unité, et les cases visées
 * se recalculent en direct pendant la phase de choix.
 *
 * Fonction pure de l'état, aucun appel au RNG (I1).
 */
export function resolveAttackPattern(anchor: Cell, target: Cell, shape: AttackShape): Offset[] {
  const a = offsetBetween(anchor, target);

  // `d`, le vecteur unitaire orthogonal à l'axe, n'existe que si l'ancre et la cible sont
  // alignées. Sinon la forme retombe sur `single`.
  const perpendicular: Offset | null =
    a.dy === 0 && a.dx !== 0 ? { dx: 0, dy: 1 } : a.dx === 0 && a.dy !== 0 ? { dx: 1, dy: 0 } : null;

  if (shape === "single" || !perpendicular) return [a];

  const plus = { dx: a.dx + perpendicular.dx, dy: a.dy + perpendicular.dy };
  if (shape === "lunge") return [a, plus];

  const minus = { dx: a.dx - perpendicular.dx, dy: a.dy - perpendicular.dy };
  return [minus, a, plus];
}

function attackIntent(
  state: CombatState,
  anchor: Cell,
  type: EnemyType,
  target: Cell,
  kind: "attack" | "charge",
  path: Offset[],
): Intent {
  const shape = state.rules.attackShapeOverride ?? type.shape ?? "single";
  return {
    kind,
    // Le motif est figé au télégraphe ; l'ancre suit l'unité (§ 8.2). C'est ce qui fait
    // qu'esquiver est la défense principale du jeu, et qu'une poussée a un effet défensif.
    // Pour une `charge`, l'ancre est la case d'ARRIVÉE : si le déplacement est bloqué,
    // l'attaque tombe une case trop court. Ce n'est pas un cas particulier, c'est D28.
    pattern: resolveAttackPattern(anchor, target, shape),
    value: type.attack,
    push: type.push ? { distance: type.push.distance, awayFromSource: true } : null,
    path,
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
    return attackIntent(state, unit.cell, type, state.player.cell, "attack", []);
  }

  const step = stepTowardsPlayer(state, unit.cell);

  // D47 — `charge` : se déplacer PUIS attaquer dans le même tour. Elle supprime l'asymétrie
  // avec le joueur, qui bouge et agit. Elle ne corrige pas l'esquive : le motif reste
  // télégraphié, simplement ancré une case plus loin.
  if (state.rules.meleeBrain === "charge" && step && manhattan(step, state.player.cell) <= type.range.max) {
    return attackIntent(state, step, type, state.player.cell, "charge", [offsetBetween(unit.cell, step)]);
  }

  return moveIntent(unit.cell, step);
}

function sniperIntent(state: CombatState, unit: Unit, type: EnemyType): Intent {
  const distance = manhattan(unit.cell, state.player.cell);
  const inRange = distance >= type.range.min && distance <= type.range.max;
  if (inRange && hasClearLine(state, unit.cell, state.player.cell)) {
    return attackIntent(state, unit.cell, type, state.player.cell, "attack", []);
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
