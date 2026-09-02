import {
  GATE_RELICS,
  PLAYER_START,
  RULES,
  createCombat,
  type CombatState,
  type EnemyType,
  type Encounter,
} from "@rl/core";
import { ACT1_ENCOUNTERS, ENEMY_TYPES, startingPool } from "@rl/content";

export const ENCOUNTERS: Encounter[] = ACT1_ENCOUNTERS;

export const ENCOUNTER_LABELS: Record<string, string> = {
  "a1-esquiver": "1 · Esquiver",
  "a1-casser-la-ligne": "2 · Casser la ligne",
  "a1-priorites": "3 · Priorités",
  "a1-corps-et-tireur": "4 · Le corps et le tireur",
  "a1-tout-a-la-fois": "5 · Tout à la fois",
};

export const RELICS = GATE_RELICS;

/**
 * Niveaux de difficulté — OUTIL DU GATE M2, pas une fonctionnalité du jeu.
 *
 * La simulation ne sait pas répondre à « les ennemis tapent-ils assez ? » : son barème d'IA a
 * un biais défensif (point A26), et plus les dégâts montent, plus elle esquive au lieu
 * d'encaisser. Le curseur revient donc au joueur, qui tranchera en trois combats.
 */
export const DIFFICULTIES = [
  { id: "menage", label: "Ménagé", factor: 0.7 },
  { id: "normal", label: "Normal", factor: 1 },
  { id: "rude", label: "Rude", factor: 1.4 },
] as const;

export type DifficultyId = (typeof DIFFICULTIES)[number]["id"];

export function typesFor(difficulty: DifficultyId): Record<string, EnemyType> {
  const factor = DIFFICULTIES.find((d) => d.id === difficulty)?.factor ?? 1;
  if (factor === 1) return ENEMY_TYPES;
  return Object.fromEntries(
    Object.entries(ENEMY_TYPES).map(([id, type]) => [
      id,
      { ...type, attack: Math.max(1, Math.round(type.attack * factor)) },
    ]),
  );
}

export function newCombat(
  encounterId: string,
  relics: string[],
  seed: number,
  difficulty: DifficultyId,
): CombatState {
  const encounter = ENCOUNTERS.find((e) => e.id === encounterId) ?? ENCOUNTERS[0]!;
  return createCombat({
    rng: { seed, cursor: 0 },
    pool: startingPool(),
    hp: 40,
    hpMax: 40,
    encounter,
    types: typesFor(difficulty),
    playerStart: PLAYER_START,
    rules: RULES,
    relics,
  });
}
