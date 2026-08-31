import type { EnemyType } from "@rl/core";

/**
 * Les trois ennemis de départ (docs/design/combat.md § 9). Chacun enseigne exactement une
 * chose, et ils sont conçus pour être rencontrés dans cet ordre.
 */

/** Enseigne : l'intention vise une case, pas toi. Le mètre étalon du jeu. */
const prowler: EnemyType = {
  id: "prowler",
  name: "Rôdeur",
  hp: 4,
  armor: 0,
  brain: "melee",
  attack: 2,
  pattern: [{ dx: 0, dy: 0 }],
  range: { min: 1, max: 1 },
  push: null,
};

/** Enseigne : la ligne et la portée. Plus grosse frappe de l'acte 1, corps le plus fragile. */
const watcher: EnemyType = {
  id: "watcher",
  name: "Guetteur",
  hp: 3,
  armor: 0,
  brain: "sniper",
  attack: 3,
  pattern: [{ dx: 0, dy: 0 }],
  range: { min: 2, max: 4 },
  push: null,
};

/** Enseigne : la menace qu'on ne supprime pas ce tour-ci. Sa poussée punit une position. */
const ram: EnemyType = {
  id: "ram",
  name: "Bélier",
  hp: 7,
  armor: 0,
  brain: "melee",
  attack: 2,
  pattern: [{ dx: 0, dy: 0 }],
  range: { min: 1, max: 1 },
  push: { distance: 1 },
};

export const ENEMY_TYPES: Record<string, EnemyType> = {
  prowler,
  watcher,
  ram,
};

/**
 * Roster D46 — la grammaire des motifs appliquée aux trois ennemis de départ.
 *
 * Le Rôdeur reste `single` : sa leçon est « l'intention vise une case, pas toi », et elle
 * exige que toute esquive fonctionne. Le Guetteur passe en `line3` — il tire le long d'une
 * ligne, la forme dit la même chose que sa leçon. Le Bélier passe en `lunge`, deux cases
 * contiguës dans son axe de charge.
 */
export const ENEMY_TYPES_D46: Record<string, EnemyType> = {
  prowler: { ...prowler, shape: "single" },
  watcher: { ...watcher, shape: "line3" },
  ram: { ...ram, shape: "lunge" },
};
