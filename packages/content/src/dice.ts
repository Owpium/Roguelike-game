import type { Die, Face } from "@rl/core";

/**
 * Le dé de départ : 3 Frappe, 2 Garde, 1 Élan (D17). Aucun Éclat — l'Éclat s'obtient, et
 * c'est ce qui en fait une progression visible.
 */
export const STARTING_DIE_FACES: [Face, Face, Face, Face, Face, Face] = [
  "strike",
  "strike",
  "strike",
  "guard",
  "guard",
  "surge",
];

/** Le pool de départ : 6 dés identiques (D19). */
export function startingPool(): Die[] {
  return Array.from({ length: 6 }, (_, i) => ({
    id: `d${i + 1}`,
    faces: [...STARTING_DIE_FACES] as Die["faces"],
  }));
}
