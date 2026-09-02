import { describe, expect, it } from "vitest";
import { createCombat, canStrike, legalEntries, reduce, type Encounter } from "./combat.ts";
import { RULES, withRules } from "./rules.ts";
import { cell } from "./geometry.ts";
import type { CombatState, Die, EnemyType, Face } from "./types.ts";

const dummy: EnemyType = {
  id: "dummy",
  name: "Mannequin",
  hp: 10,
  armor: 0,
  brain: "melee",
  attack: 2,
  pattern: [{ dx: 0, dy: 0 }],
  range: { min: 1, max: 1 },
  push: null,
};

const TYPES: Record<string, EnemyType> = {
  dummy,
  fragile: { ...dummy, id: "fragile", hp: 1 },
  ram: { ...dummy, id: "ram", hp: 7, push: { distance: 1 } },
};

/** Un pool dont toutes les faces sont connues : les tests ne dépendent pas du hasard. */
function loadedPool(face: Face): Die[] {
  return Array.from({ length: 6 }, (_, i) => ({
    id: `d${i + 1}`,
    faces: [face, face, face, face, face, face] as Die["faces"],
  }));
}

function setup(encounter: Encounter, face: Face = "strike", rules = RULES): CombatState {
  return createCombat({
    rng: { seed: 1, cursor: 0 },
    pool: loadedPool(face),
    hp: 40,
    hpMax: 40,
    encounter,
    types: TYPES,
    playerStart: cell(3, 5),
    rules,
  });
}

describe("Frappe", () => {
  it("porte à distance 1 et 2 en ligne orthogonale", () => {
    const state = setup({ id: "t", units: [{ typeId: "dummy", cell: cell(3, 3) }] });
    expect(canStrike(state, cell(3, 4), state.units[0]!)).toBe(true);
    expect(canStrike(state, cell(3, 5), state.units[0]!)).toBe(true);
    expect(canStrike(state, cell(3, 6), state.units[0]!)).toBe(false);
  });

  it("ne porte pas en diagonale : les diagonales n'existent pas", () => {
    const state = setup({ id: "t", units: [{ typeId: "dummy", cell: cell(2, 4) }] });
    expect(canStrike(state, cell(3, 5), state.units[0]!)).toBe(false);
  });

  it("est bloquée à distance 2 par un corps intercalé", () => {
    const state = setup({
      id: "t",
      units: [
        { typeId: "dummy", cell: cell(3, 4) },
        { typeId: "dummy", cell: cell(3, 3) },
      ],
    });
    const behind = state.units.find((u) => u.cell.y === 3)!;
    expect(canStrike(state, cell(3, 5), behind)).toBe(false);
  });

  it("inflige ses dégâts à la validation, pas à la pose", () => {
    const state = setup({ id: "t", units: [{ typeId: "dummy", cell: cell(3, 4) }] });
    const target = state.units[0]!.id;
    const posed = reduce(
      state,
      {
        type: "ENTER",
        entry: {
          kind: "spend",
          dieId: state.hand[0]!.dieId,
          rolled: "strike",
          effective: "strike",
          action: { type: "strike", targetId: target },
        },
      },
      TYPES,
    ).state;

    expect(posed.units[0]!.hp).toBe(10);
    const resolved = reduce(posed, { type: "VALIDATE" }, TYPES).state;
    expect(resolved.units[0]!.hp).toBe(10 - RULES.strikeDamage);
  });
});

describe("Garde", () => {
  it("s'accumule dans le tour et disparaît intégralement en fin de tour", () => {
    let state = setup({ id: "t", units: [{ typeId: "dummy", cell: cell(1, 1) }] }, "guard");
    for (const die of state.hand.slice(0, 2)) {
      state = reduce(
        state,
        {
          type: "ENTER",
          entry: {
            kind: "spend",
            dieId: die.dieId,
            rolled: "guard",
            effective: "guard",
            action: { type: "guard" },
          },
        },
        TYPES,
      ).state;
    }
    const after = reduce(state, { type: "VALIDATE" }, TYPES).state;
    expect(after.player.shield).toBe(0);
  });
});

describe("Élan", () => {
  it("traverse les ennemis, les piétine, et peut finir sur la case d'un mort", () => {
    const state = setup(
      {
        id: "t",
        units: [
          { typeId: "fragile", cell: cell(3, 4) },
          { typeId: "fragile", cell: cell(3, 3) },
        ],
      },
      "surge",
    );
    const after = reduce(
      reduce(
        state,
        {
          type: "ENTER",
          entry: {
            kind: "spend",
            dieId: state.hand[0]!.dieId,
            rolled: "surge",
            effective: "surge",
            action: { type: "surge", dir: "up", distance: 2 },
          },
        },
        TYPES,
      ).state,
      { type: "VALIDATE" },
      TYPES,
    ).state;

    expect(after.units).toHaveLength(0);
    expect(after.player.cell).toEqual(cell(3, 3));
  });

  it("raccourcit quand la case d'arrivée reste occupée", () => {
    const state = setup(
      {
        id: "t",
        units: [{ typeId: "dummy", cell: cell(3, 3) }],
      },
      "surge",
    );
    const after = reduce(
      reduce(
        state,
        {
          type: "ENTER",
          entry: {
            kind: "spend",
            dieId: state.hand[0]!.dieId,
            rolled: "surge",
            effective: "surge",
            action: { type: "surge", dir: "up", distance: 2 },
          },
        },
        TYPES,
      ).state,
      { type: "VALIDATE" },
      TYPES,
    ).state;

    // Le survivant occupe (3,3) : l'Élan s'arrête sur la dernière case libre du chemin.
    expect(after.units[0]!.hp).toBe(10 - RULES.surgeTrampleDamage);
    expect(after.player.cell).toEqual(cell(3, 4));
  });
});

describe("bonus de combo appliqué à la résolution", () => {
  function spendStrikes(count: number): CombatState {
    let state = setup({ id: "t", units: [{ typeId: "dummy", cell: cell(3, 4) }] });
    const target = state.units[0]!.id;
    for (const die of state.hand.slice(0, count)) {
      state = reduce(
        state,
        {
          type: "ENTER",
          entry: {
            kind: "spend",
            dieId: die.dieId,
            rolled: "strike",
            effective: "strike",
            action: { type: "strike", targetId: target },
          },
        },
        TYPES,
      ).state;
    }
    return reduce(state, { type: "VALIDATE" }, TYPES).state;
  }

  it("une Frappe seule inflige les dégâts de base", () => {
    expect(spendStrikes(1).units[0]!.hp).toBe(10 - 2);
  });

  it("deux Frappes valent 3 chacune, pas 2", () => {
    expect(spendStrikes(2).units[0]!.hp).toBe(10 - 3 - 3);
  });

  it("trois Frappes valent 4 chacune", () => {
    // 12 dégâts sur 10 PV : la cible meurt, ce qui est le propos du combo.
    expect(spendStrikes(3).units).toHaveLength(0);
  });

  it("amplifie aussi la Garde", () => {
    let state = setup({ id: "t", units: [{ typeId: "dummy", cell: cell(1, 1) }] }, "guard");
    for (const die of state.hand.slice(0, 2)) {
      state = reduce(
        state,
        {
          type: "ENTER",
          entry: {
            kind: "spend",
            dieId: die.dieId,
            rolled: "guard",
            effective: "guard",
            action: { type: "guard" },
          },
        },
        TYPES,
      ).state;
    }
    const { log } = reduce(state, { type: "VALIDATE" }, TYPES);
    const gains = log.flatMap((e) => (e.t === "SHIELD_GAINED" ? [e.amount] : []));
    expect(gains).toEqual([4, 4]);
  });

  it("ne bonifie pas une dépense de secours : il n'y a rien à amplifier", () => {
    let state = setup({ id: "t", units: [{ typeId: "dummy", cell: cell(1, 1) }] });
    for (const [i, die] of state.hand.slice(0, 2).entries()) {
      state = reduce(
        state,
        {
          type: "ENTER",
          entry: {
            kind: "spend",
            dieId: die.dieId,
            rolled: "strike",
            effective: "strike",
            action: { type: "step", dir: i === 0 ? "up" : "down" },
          },
        },
        TYPES,
      ).state;
    }
    const { log } = reduce(state, { type: "VALIDATE" }, TYPES);
    expect(log.some((e) => e.t === "DAMAGE_DEALT")).toBe(false);
  });
});

describe("Main et report", () => {
  it("complète la Main à trois dés", () => {
    const state = setup({ id: "t", units: [{ typeId: "dummy", cell: cell(1, 1) }] });
    expect(state.hand).toHaveLength(RULES.handSize);
  });

  it("garde les dés non dépensés avec leur face et ne relance que les dépensés", () => {
    let state = setup({ id: "t", units: [{ typeId: "dummy", cell: cell(3, 4) }] });
    const [spentDie, keptA, keptB] = state.hand;
    state = reduce(
      state,
      {
        type: "ENTER",
        entry: {
          kind: "spend",
          dieId: spentDie!.dieId,
          rolled: "strike",
          effective: "strike",
          action: { type: "strike", targetId: state.units[0]!.id },
        },
      },
      TYPES,
    ).state;

    const after = reduce(state, { type: "VALIDATE" }, TYPES).state;
    const ids = after.hand.map((d) => d.dieId);
    expect(ids).toContain(keptA!.dieId);
    expect(ids).toContain(keptB!.dieId);
    expect(after.discard.map((d) => d.id)).toEqual([spentDie!.dieId]);
    expect(after.hand).toHaveLength(RULES.handSize);
  });

  it("ne relance rien quand rien n'est dépensé", () => {
    const state = setup({ id: "t", units: [{ typeId: "dummy", cell: cell(1, 1) }] });
    const before = state.hand.map((d) => d.dieId);
    const after = reduce(state, { type: "VALIDATE" }, TYPES).state;
    expect(after.hand.map((d) => d.dieId)).toEqual(before);
    expect(after.discard).toHaveLength(0);
  });
});

describe("annulation", () => {
  it("retire la dernière entrée (LIFO) et rien d'autre", () => {
    let state = setup({ id: "t", units: [{ typeId: "dummy", cell: cell(1, 1) }] }, "guard");
    for (const die of state.hand.slice(0, 2)) {
      state = reduce(
        state,
        {
          type: "ENTER",
          entry: {
            kind: "spend",
            dieId: die.dieId,
            rolled: "guard",
            effective: "guard",
            action: { type: "guard" },
          },
        },
        TYPES,
      ).state;
    }
    const undone = reduce(state, { type: "UNDO" }, TYPES).state;
    expect(undone.pendingActions).toHaveLength(1);
    expect(reduce(undone, { type: "UNDO_ALL" }, TYPES).state.pendingActions).toHaveLength(0);
  });
});

describe("légalité", () => {
  it("n'offre aucun pas gratuit : D44 l'a supprimé des règles de base", () => {
    const state = setup({ id: "t", units: [{ typeId: "dummy", cell: cell(1, 1) }] });
    expect(legalEntries(state).some((e) => e.action.kind === "free_step")).toBe(false);
  });

  it("en offre exactement un quand une relique en accorde un (D45)", () => {
    const state = setup(
      { id: "t", units: [{ typeId: "dummy", cell: cell(1, 1) }] },
      "strike",
      withRules({ freeStepsPerTurn: 1 }),
    );
    expect(legalEntries(state).some((e) => e.action.kind === "free_step")).toBe(true);
    const after = reduce(
      state,
      { type: "ENTER", entry: { kind: "free_step", dir: "up" } },
      TYPES,
    ).state;
    expect(legalEntries(after).some((e) => e.action.kind === "free_step")).toBe(false);
  });

  it("propose la dépense de secours quelle que soit la face", () => {
    const state = setup({ id: "t", units: [{ typeId: "dummy", cell: cell(1, 1) }] }, "guard");
    const rescue = legalEntries(state).filter(
      (e) => e.action.kind === "spend" && e.action.action.type === "step",
    );
    expect(rescue.length).toBeGreaterThan(0);
  });

  it("un Éclat propose les trois faces", () => {
    const state = setup({ id: "t", units: [{ typeId: "dummy", cell: cell(3, 4) }] }, "spark");
    const faces = new Set(
      legalEntries(state).flatMap((e) => (e.action.kind === "spend" ? [e.action.effective] : [])),
    );
    expect(faces).toEqual(new Set(["strike", "guard", "surge"]));
  });
});

describe("victoire et défaite", () => {
  it("gagne dès que la phase du joueur a tué le dernier ennemi", () => {
    const state = setup({ id: "t", units: [{ typeId: "fragile", cell: cell(3, 4) }] });
    const after = reduce(
      reduce(
        state,
        {
          type: "ENTER",
          entry: {
            kind: "spend",
            dieId: state.hand[0]!.dieId,
            rolled: "strike",
            effective: "strike",
            action: { type: "strike", targetId: state.units[0]!.id },
          },
        },
        TYPES,
      ).state,
      { type: "VALIDATE" },
      TYPES,
    );
    expect(after.state.phase).toBe("won");
    expect(after.log.map((e) => e.t)).toContain("COMBAT_WON");
  });

  it("émet le journal dans l'ordre chronologique du contrat", () => {
    const state = setup({ id: "t", units: [{ typeId: "dummy", cell: cell(3, 4) }] });
    const { log } = reduce(
      reduce(
        state,
        {
          type: "ENTER",
          entry: {
            kind: "spend",
            dieId: state.hand[0]!.dieId,
            rolled: "strike",
            effective: "strike",
            action: { type: "strike", targetId: state.units[0]!.id },
          },
        },
        TYPES,
      ).state,
      { type: "VALIDATE" },
      TYPES,
    );
    const kinds = log.map((e) => e.t);
    expect(kinds.indexOf("DIE_SPENT")).toBeLessThan(kinds.indexOf("PLAYER_PHASE_END"));
    expect(kinds.indexOf("PLAYER_PHASE_END")).toBeLessThan(kinds.indexOf("ENEMY_PHASE_END"));
    expect(kinds.indexOf("ENEMY_PHASE_END")).toBeLessThan(kinds.indexOf("TURN_END"));
  });
});

describe("déterminisme du combat", () => {
  it("deux combats issus de la même graine tirent la même Main", () => {
    const encounter: Encounter = { id: "t", units: [{ typeId: "dummy", cell: cell(3, 3) }] };
    const mixed: Die[] = Array.from({ length: 6 }, (_, i) => ({
      id: `d${i + 1}`,
      faces: ["strike", "strike", "strike", "guard", "guard", "surge"] as Die["faces"],
    }));
    const build = (): CombatState =>
      createCombat({
        rng: { seed: 99, cursor: 0 },
        pool: mixed,
        hp: 40,
        hpMax: 40,
        encounter,
        types: TYPES,
        playerStart: cell(3, 5),
      });
    expect(build().hand).toEqual(build().hand);
  });
});
