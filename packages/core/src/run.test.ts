import { describe, expect, it } from "vitest";
import { availableNodes, createRun, enterNode, type RunContent } from "./run.ts";
import type { Encounter } from "./combat.ts";
import type { EnemyType } from "./types.ts";

const type: EnemyType = {
  id: "dummy",
  name: "Mannequin",
  hp: 3,
  armor: 0,
  brain: "melee",
  attack: 2,
  pattern: [{ dx: 0, dy: 0 }],
  range: { min: 1, max: 1 },
  push: null,
};

const encounter = (id: string): Encounter => ({
  id,
  units: [{ typeId: "dummy", cell: { x: 3, y: 2 } }],
});

const content: RunContent = {
  encountersByAct: [
    ["a", "b", "c", "d"].map(encounter),
    ["e", "f", "g", "h"].map(encounter),
    ["i", "j", "k", "l"].map(encounter),
  ],
  elitesByAct: [[encounter("e1")], [encounter("e2")], [encounter("e3")]],
  bosses: [encounter("b1"), encounter("b2"), encounter("b3")],
  types: { dummy: type },
  startingPool: Array.from({ length: 6 }, (_, i) => ({
    id: `d${i + 1}`,
    faces: ["strike", "strike", "strike", "guard", "guard", "surge"],
  })) as RunContent["startingPool"],
};

describe("structure de run", () => {
  it("a une forme d'acte fixe : 2, 3, 2, 1 nœuds", () => {
    const run = createRun(1, content);
    for (const act of run.map) {
      expect(act.ranks.map((r) => r.length)).toEqual([2, 3, 2, 1]);
    }
  });

  it("ouvre chaque acte par deux Combats", () => {
    const run = createRun(1, content);
    for (const act of run.map) {
      expect(act.ranks[0]!.map((n) => n.kind)).toEqual(["combat", "combat"]);
    }
  });

  it("ne met pas de Boutique en acte 1, mais en acte 2 et 3", () => {
    const run = createRun(1, content);
    expect(run.map[0]!.ranks[1]!.map((n) => n.kind)).toContain("event");
    expect(run.map[1]!.ranks[1]!.map((n) => n.kind)).toContain("shop");
    expect(run.map[2]!.ranks[1]!.map((n) => n.kind)).toContain("shop");
  });

  it("ne propose jamais deux fois la même rencontre dans un acte", () => {
    const run = createRun(7, content);
    for (const act of run.map) {
      const ids = act.ranks.flat().flatMap((n) => (n.kind === "combat" ? [n.encounterId] : []));
      expect(new Set(ids).size).toBe(ids.length);
    }
  });

  it("est entièrement déterminée par la graine (I1)", () => {
    const shape = (seed: number): string =>
      JSON.stringify(createRun(seed, content).map);
    expect(shape(123)).toBe(shape(123));
    expect(shape(123)).not.toBe(shape(124));
  });

  it("le Repos soigne sans dépasser les PV max", () => {
    let run = createRun(1, content);
    run.hp = 35;
    run.rank = 1;
    const restIndex = availableNodes(run).findIndex((n) => n.kind === "rest");
    run = enterNode(run, restIndex, content);
    expect(run.hp).toBe(40);
  });
});
