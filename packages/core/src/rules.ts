/**
 * Les constantes de règle, rassemblées ici pour que le simulateur puisse les faire varier
 * sans chercher dans le code. Les valeurs marquées « tuning » peuvent bouger sans que la
 * règle change (docs/design/combat.md, en-tête).
 */
export const RULES = {
  /** Taille de la Main (D11). */
  handSize: 3,
  /** Dés conservables d'un tour à l'autre (D12) — premier curseur du système. */
  keepCap: 2,
  strikeDamage: 2,
  strikeRangeMin: 1,
  strikeRangeMax: 2,
  guardShield: 3,
  surgeTrampleDamage: 1,
  surgeDistances: [2, 3] as const,
  /** Dégât de choc d'une poussée bloquée (combat.md § 7). Une poussée ne tue jamais par éjection. */
  pushBlockedDamage: 1,
  /** Garantie de terminaison pour la CI, pas une règle de jeu (combat.md § 3). */
  maxTurns: 30,
  /** Invariant I3 : plafond de déclenchements, dérivé du budget de 2 s de résolution. */
  triggerBudgetPerTurn: 20,
  triggerBudgetPerSource: 6,
  /** Ordre canonique de résolution des combos (combat.md § 11.2). C'est une règle, pas une convention. */
  comboOrder: ["pair", "echo", "trio", "suite"] as const,
} as const;
