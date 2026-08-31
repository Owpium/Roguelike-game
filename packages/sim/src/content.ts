import type { RunContent } from "@rl/core";
import {
  ACT1_ENCOUNTERS,
  ENEMY_TYPES,
  PLACEHOLDER_BOSS,
  PLACEHOLDER_ENCOUNTERS,
  startingPool,
} from "@rl/content";

/**
 * Le contenu tel que le simulateur le voit.
 *
 * Seul l'acte 1 est du vrai contenu. Les actes 2 et 3, les élites et les boss sont des
 * remplisseurs (voir `packages/content/src/encounters.ts`) : ils existent pour que le moteur
 * exécute une run entière dès M1. Aucune mesure d'équilibrage tirée d'eux n'a de sens.
 */
export function simContent(): RunContent {
  const act1 = ACT1_ENCOUNTERS.slice(0, 4);
  const act1Elite = [ACT1_ENCOUNTERS[4]!];
  return {
    encountersByAct: [act1, PLACEHOLDER_ENCOUNTERS, PLACEHOLDER_ENCOUNTERS],
    elitesByAct: [act1Elite, [PLACEHOLDER_ENCOUNTERS[3]!], [PLACEHOLDER_ENCOUNTERS[3]!]],
    bosses: [PLACEHOLDER_BOSS, PLACEHOLDER_BOSS, PLACEHOLDER_BOSS],
    types: ENEMY_TYPES,
    startingPool: startingPool(),
  };
}
