import {
  GATE_RELICS,
  PLAYER_START,
  RULES,
  createCombat,
  type CombatState,
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

export function newCombat(encounterId: string, relics: string[], seed: number): CombatState {
  const encounter = ENCOUNTERS.find((e) => e.id === encounterId) ?? ENCOUNTERS[0]!;
  return createCombat({
    rng: { seed, cursor: 0 },
    pool: startingPool(),
    hp: 40,
    hpMax: 40,
    encounter,
    types: ENEMY_TYPES,
    playerStart: PLAYER_START,
    rules: RULES,
    relics,
  });
}

export const TYPES = ENEMY_TYPES;
