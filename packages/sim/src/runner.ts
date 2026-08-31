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

export interface RunResult {
  seed: number;
  outcome: "won" | "dead";
  hp: number;
  turns: number;
  encounters: number;
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
  let turns = 0;
  let encounters = 0;

  while (run.status === "choosing" || run.status === "fighting") {
    if (run.status === "choosing") {
      run = enterNode(run, chooseNode(run), content);
      continue;
    }

    encounters += 1;
    let combat = run.combat!;
    let safety = 0;
    while (combat.phase === "choice" && safety < RULES.maxTurns + 2) {
      combat = playTurn(combat, content.types);
      turns += 1;
      safety += 1;
    }
    run = resolveCombat({ ...run, combat });
  }

  return {
    seed,
    outcome: run.status === "won" ? "won" : "dead",
    hp: run.hp,
    turns,
    encounters,
    history: run.history,
  };
}
