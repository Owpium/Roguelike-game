import type { Combo, Face } from "./types.ts";
import { COMBO_ORDER } from "./rules.ts";

/**
 * Contrat de combo (docs/design/combat.md § 11, point A20).
 *
 * Un combo est une observation sur `S`, la séquence ordonnée des faces effectives des dés
 * dépensés dans le tour. La liste est **fermée** : quatre motifs, jamais un cinquième sans
 * arbitrage. Aucun combo n'a d'effet propre en v0 — ce sont des crochets.
 *
 * Écho et Suite exigent la consécutivité : sans elle, elles deviennent triviales dès qu'une
 * relique fait dépenser cinq dés, et les reliques qui s'y accrochent perdent toute condition.
 */

type EffectiveFace = Exclude<Face, "spark">;

/** La sous-séquence consécutive exacte que cherche Suite. */
const SUITE: readonly EffectiveFace[] = ["strike", "guard", "surge"];

/**
 * Bonus intrinsèque par face, dérivé du nombre de dépenses de cette face dans le tour.
 *
 * Deux dépenses d'une même face valent mieux que deux dépenses isolées, trois encore mieux :
 * c'est ce qui rend le combo lisible sans qu'on l'explique. Le bonus est **additif et par
 * dépense**, pas multiplicatif — une Frappe seule fait 2, deux Frappes font 3 + 3, trois font
 * 4 + 4 + 4. La courbe monte comme un multiplicateur, la lecture reste une addition, et aucun
 * chiffre n'apparaît sur les dés (D13).
 *
 * Le bonus est connu AVANT la résolution, puisqu'il ne dépend que des dépenses posées. C'est
 * ce qui permet à l'interface de l'afficher pendant la phase de choix.
 */
export function comboBonusByFace(
  sequence: readonly EffectiveFace[],
): Map<EffectiveFace, number> {
  const counts = new Map<EffectiveFace, number>();
  for (const face of sequence) counts.set(face, (counts.get(face) ?? 0) + 1);

  const bonus = new Map<EffectiveFace, number>();
  for (const [face, count] of counts) {
    bonus.set(face, count >= 3 ? 2 : count >= 2 ? 1 : 0);
  }
  return bonus;
}

export function detectCombos(sequence: readonly EffectiveFace[]): Combo[] {
  const counts = new Map<EffectiveFace, number>();
  for (const face of sequence) counts.set(face, (counts.get(face) ?? 0) + 1);

  const found = new Set<Combo>();
  for (const count of counts.values()) {
    if (count >= 2) found.add("pair");
    if (count >= 3) found.add("trio");
  }
  for (let i = 0; i + 1 < sequence.length; i++) {
    if (sequence[i] === sequence[i + 1]) found.add("echo");
  }
  for (let i = 0; i + SUITE.length <= sequence.length; i++) {
    if (SUITE.every((face, k) => sequence[i + k] === face)) found.add("suite");
  }

  // Ordre canonique : il rend le résultat reproductible quand plusieurs reliques
  // s'accrochent à plusieurs combos. C'est une règle, pas une convention d'affichage.
  return COMBO_ORDER.filter((combo) => found.has(combo));
}
