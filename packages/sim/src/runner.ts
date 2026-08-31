import {
  RULES,
  availableNodes,
  createRun,
  enterNode,
  resolveCombat,
  type RunContent,
  type RunState,
} from "@rl/core";
import { playTurn } from "./policy.ts";
import { accumulateTurn, emptyMetrics, type RunMetrics } from "./metrics.ts";

export interface RunResult {
  seed: number;
  outcome: "won" | "dead";
  hp: number;
  metrics: RunMetrics;
  history: string[];
}

/** Choix de nœud : se soigner quand on est bas, éviter l'élite quand on est fragile. */
function chooseNode(run: RunState): number {
  const nodes = availableNodes(run);
  const ratio = run.hp / run.hpMax;

  const rest = nodes.findIndex((n) => n.kind === "rest");
  if (rest >= 0 && ratio < 0.7) return rest;

  const combat = nodes.findIndex((n) => n.kind === "combat");
  if (combat >= 0) return combat;

  return 0;
}

export function simulateRun(seed: number, content: RunContent): RunResult {
  let run = createRun(seed, content);
  const metrics = emptyMetrics();
  const maxTurns = (content.rules ?? RULES).maxTurns;

  while (run.status === "choosing" || run.status === "fighting") {
    if (run.status === "choosing") {
      run = enterNode(run, chooseNode(run), content);
      continue;
    }

    const isBoss = run.currentNode?.kind === "boss";
    // Seul l'acte 1 est du contenu réel : tout le reste est un remplisseur et ne compte pas.
    const measured = run.act === 0;
    const hpBefore = run.combat!.player.hp;
    let combat = run.combat!;
    let turns = 0;

    while (combat.phase === "choice" && turns < maxTurns + 2) {
      const outcome = playTurn(combat, content.types);
      if (measured) accumulateTurn(metrics, outcome.log, outcome.attackers);
      combat = outcome.state;
      turns += 1;
    }

    if (measured) {
      metrics.encounters += 1;
      metrics.hpLost += hpBefore - combat.player.hp;
      if (isBoss) {
        metrics.encountersBoss += 1;
        metrics.turnsBoss += turns;
      } else {
        metrics.encountersNormal += 1;
        metrics.turnsNormal += turns;
      }
    }

    run = resolveCombat({ ...run, combat });
  }

  return {
    seed,
    outcome: run.status === "won" ? "won" : "dead",
    hp: run.hp,
    metrics,
    history: run.history,
  };
}
