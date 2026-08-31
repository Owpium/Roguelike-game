import { withRules, type EnemyType, type RuleSet, type RunContent } from "@rl/core";
import {
  ACT1_ENCOUNTERS,
  ENEMY_TYPES,
  ENEMY_TYPES_SINGLE,
  PLACEHOLDER_BOSS,
  PLACEHOLDER_ENCOUNTERS,
  startingPool,
} from "@rl/content";

/**
 * Le contenu tel que le simulateur le voit.
 *
 * Seul l'acte 1 est du vrai contenu. Les actes 2 et 3, les élites et les boss sont des
 * remplisseurs : ils existent pour que le moteur exécute une run entière. Aucune mesure
 * d'équilibrage tirée d'eux n'a de sens — d'où les métriques dédiées à l'acte 1.
 */
export function simContent(rules: RuleSet, types: Record<string, EnemyType>): RunContent {
  return {
    // D47 : `charge` entre à l'acte 2. Les règles ne sont donc pas constantes sur une run.
    rulesByAct: [rules, { ...rules, meleeBrain: "charge" }, { ...rules, meleeBrain: "charge" }],
    encountersByAct: [ACT1_ENCOUNTERS.slice(0, 4), PLACEHOLDER_ENCOUNTERS, PLACEHOLDER_ENCOUNTERS],
    elitesByAct: [[ACT1_ENCOUNTERS[4]!], [PLACEHOLDER_ENCOUNTERS[3]!], [PLACEHOLDER_ENCOUNTERS[3]!]],
    bosses: [PLACEHOLDER_BOSS, PLACEHOLDER_BOSS, PLACEHOLDER_BOSS],
    types,
    startingPool: startingPool(),
    rules,
  };
}

export interface Variant {
  id: string;
  label: string;
  rules: RuleSet;
  types: Record<string, EnemyType>;
}

/**
 * Les six variantes appariées de `docs/design/esquive-arbitrage.md` § 5.3. Elles tournent sur
 * les mêmes seeds : la comparaison est appariée, pas indépendante.
 */
export const VARIANTS: Variant[] = [
  {
    id: "R",
    label: "référence historique — pas gratuit, motifs d'une case",
    rules: withRules({ freeStepsPerTurn: 1 }),
    types: ENEMY_TYPES_SINGLE,
  },
  {
    id: "A",
    label: "pas gratuit supprimé seul",
    rules: withRules({ freeStepsPerTurn: 0 }),
    types: ENEMY_TYPES_SINGLE,
  },
  {
    id: "C",
    label: "charge seule",
    rules: withRules({ freeStepsPerTurn: 1, meleeBrain: "charge" }),
    types: ENEMY_TYPES_SINGLE,
  },
  {
    id: "D",
    label: "motifs D46 seuls",
    rules: withRules({ freeStepsPerTurn: 1 }),
    types: ENEMY_TYPES,
  },
  {
    id: "E",
    label: "règles en vigueur, acte 1",
    rules: withRules({}),
    types: ENEMY_TYPES,
  },
  {
    id: "F",
    label: "règles en vigueur, actes 2-3",
    rules: withRules({ meleeBrain: "charge" }),
    types: ENEMY_TYPES,
  },
];
