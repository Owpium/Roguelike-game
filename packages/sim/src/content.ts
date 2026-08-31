import { withRules, type EnemyType, type RuleSet, type RunContent } from "@rl/core";
import {
  ACT1_ENCOUNTERS,
  ENEMY_TYPES,
  ENEMY_TYPES_D46,
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
    label: "référence — règles actuelles",
    rules: withRules({}),
    types: ENEMY_TYPES,
  },
  {
    id: "A",
    label: "piste 1 seule — pas gratuit supprimé",
    rules: withRules({ freeStepsPerTurn: 0 }),
    types: ENEMY_TYPES,
  },
  {
    id: "C",
    label: "piste 3 seule — charge",
    rules: withRules({ meleeBrain: "charge" }),
    types: ENEMY_TYPES,
  },
  {
    id: "D",
    label: "motifs seuls — roster D46",
    rules: withRules({}),
    types: ENEMY_TYPES_D46,
  },
  {
    id: "E",
    label: "paquet recommandé, acte 1",
    rules: withRules({ freeStepsPerTurn: 0 }),
    types: ENEMY_TYPES_D46,
  },
  {
    id: "F",
    label: "paquet recommandé, actes 2-3",
    rules: withRules({ freeStepsPerTurn: 0, meleeBrain: "charge" }),
    types: ENEMY_TYPES_D46,
  },
];
