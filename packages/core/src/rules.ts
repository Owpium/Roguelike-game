/**
 * Les constantes de règle.
 *
 * Elles sont un **paramètre du combat**, pas une constante de module : le simulateur doit
 * pouvoir comparer deux variantes sur quelques milliers de runs sans toucher au code. C'est
 * la seule façon d'arbitrer une règle par la mesure au lieu de l'argument.
 *
 * Les valeurs ci-dessous sont celles de `docs/design/combat.md`.
 */
/**
 * D46 — grammaire fermée des motifs d'attaque, dérivée au télégraphe de l'axe ennemi → cible.
 * Soit `a` l'offset vers la case visée et `d` le vecteur unitaire orthogonal à cet axe :
 * `single` = [a] · `lunge` = [a, a+d] · `line3` = [a−d, a, a+d].
 * Si l'ennemi et la cible ne sont pas alignés, `d` n'existe pas et la forme retombe sur `single`.
 */
export type AttackShape = "single" | "lunge" | "line3";

export interface RuleSet {
  /** Taille de la Main (D11). */
  handSize: number;
  /** Dés conservables d'un tour à l'autre (D12) — premier curseur du système. */
  keepCap: number;
  /**
   * Pas gratuits par tour (D18). À 0, tout déplacement se paie en dés via la dépense de
   * secours, qui suffit seule à garantir qu'aucun tirage ne bloque le joueur.
   */
  freeStepsPerTurn: number;
  /**
   * D46. Force la forme de tous les motifs d'attaque, quelle que soit celle du type
   * d'ennemi. `null` = chaque type utilise la sienne. Levier de contrôle pour la mesure.
   */
  attackShapeOverride: AttackShape | null;
  /**
   * D47. Cerveau des types `melee`. `approach` = se déplacer OU attaquer (historique),
   * `charge` = se déplacer PUIS attaquer dans le même tour.
   */
  meleeBrain: "approach" | "charge";
  strikeDamage: number;
  strikeRangeMin: number;
  strikeRangeMax: number;
  guardShield: number;
  surgeTrampleDamage: number;
  surgeDistances: readonly number[];
  /** Dégât de choc d'une poussée bloquée. Une poussée ne tue jamais par éjection. */
  pushBlockedDamage: number;
  /** Garantie de terminaison pour la CI, pas une règle de jeu. */
  maxTurns: number;
  /** Invariant I3 : plafond de déclenchements, dérivé du budget de 2 s de résolution. */
  triggerBudgetPerTurn: number;
  triggerBudgetPerSource: number;
}

export const RULES: RuleSet = {
  handSize: 3,
  keepCap: 2,
  // D44 : le pas gratuit est supprimé. Tout déplacement se paie — dépense de secours ou Élan.
  freeStepsPerTurn: 0,
  attackShapeOverride: null,
  // D47 : `charge` entre à l'acte 2. L'acte 1 garde `approach`, une nouveauté par rencontre.
  meleeBrain: "approach",
  strikeDamage: 2,
  strikeRangeMin: 1,
  strikeRangeMax: 2,
  guardShield: 3,
  surgeTrampleDamage: 1,
  surgeDistances: [2, 3],
  pushBlockedDamage: 1,
  maxTurns: 30,
  triggerBudgetPerTurn: 20,
  triggerBudgetPerSource: 6,
};

/** Une variante de règles, pour comparaison en simulation. */
export function withRules(overrides: Partial<RuleSet>): RuleSet {
  return { ...RULES, ...overrides };
}

/**
 * Ordre canonique de résolution des combos (combat.md § 11.2). Ce n'est pas un réglage :
 * c'est ce qui rend le résultat reproductible quand plusieurs reliques s'accrochent à
 * plusieurs combos. Il ne fait donc pas partie du `RuleSet`.
 */
export const COMBO_ORDER = ["pair", "echo", "trio", "suite"] as const;
