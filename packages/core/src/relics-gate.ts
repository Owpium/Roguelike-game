import { manhattan, type Cell } from "./geometry.ts";
import { applyDamage, removeDying } from "./board.ts";
import type { Combo, CombatState, GameEvent } from "./types.ts";

/**
 * ÉCHAFAUDAGE POUR LE GATE M2 — à supprimer quand A10 est tranché.
 *
 * Trois reliques codées en dur. Ce **n'est pas** le système de reliques : le format de la
 * donnée d'effet est le point ouvert A10 de `docs/06-arbitrages.md`, et il n'appartient pas
 * à ce fichier de le préempter.
 *
 * Elles existent pour une raison précise, que `game-designer` a posée en rendant les règles
 * de combat : le kit de base est délibérément maigre — Garde ne fait que « +3 Bouclier » — et
 * toute la profondeur défensive est reportée sur les reliques. Évaluer le gate M2 sans
 * aucune relique, ce serait mesurer un jeu qui n'existera jamais.
 *
 * Les trois s'accrochent aux combos, parce que c'est là que vit la promesse du jeu.
 */

export interface GateRelic {
  id: string;
  name: string;
  combo: Combo;
  text: string;
}

export const GATE_RELICS: GateRelic[] = [
  {
    id: "gate-pair",
    name: "Écho de fer",
    combo: "pair",
    text: "Paire : 1 dégât à chaque ennemi adjacent.",
  },
  {
    id: "gate-echo",
    name: "Second souffle",
    combo: "echo",
    text: "Écho : tu gagnes 2 Bouclier.",
  },
  {
    id: "gate-trio",
    name: "Surcharge",
    combo: "trio",
    text: "Trio : 3 dégâts à l'ennemi le plus proche.",
  },
];

/** Décrémente le budget de déclenchements (I3). Renvoie `false` quand il est épuisé. */
function spendTrigger(state: CombatState, source: string, log: GameEvent[]): boolean {
  const used = state.triggersBySource[source] ?? 0;
  if (state.triggerBudget <= 0 || used >= state.rules.triggerBudgetPerSource) {
    log.push({ t: "TRIGGER_BUDGET_EXHAUSTED" });
    return false;
  }
  state.triggerBudget -= 1;
  state.triggersBySource[source] = used + 1;
  return true;
}

function adjacentEnemies(state: CombatState, from: Cell): number[] {
  return state.units
    .filter((u) => manhattan(u.cell, from) === 1)
    .map((u) => u.id)
    .sort((a, b) => a - b);
}

export function applyGateRelics(state: CombatState, combo: Combo, log: GameEvent[]): void {
  for (const relic of GATE_RELICS) {
    if (relic.combo !== combo) continue;
    if (!state.relics.includes(relic.id)) continue;
    if (!spendTrigger(state, relic.id, log)) continue;

    switch (relic.id) {
      case "gate-pair": {
        for (const id of adjacentEnemies(state, state.player.cell)) {
          applyDamage(state, id, 1, "player", log);
        }
        removeDying(state, log);
        break;
      }
      case "gate-echo": {
        state.player.shield += 2;
        log.push({ t: "SHIELD_GAINED", unitId: "player", amount: 2 });
        break;
      }
      case "gate-trio": {
        const nearest = [...state.units].sort(
          (a, b) =>
            manhattan(a.cell, state.player.cell) - manhattan(b.cell, state.player.cell) ||
            a.id - b.id,
        )[0];
        if (nearest) {
          applyDamage(state, nearest.id, 3, "player", log);
          removeDying(state, log);
        }
        break;
      }
    }
  }
}
