import { describe, expect, it } from "vitest";
import { comboBonusByFace, detectCombos } from "./combos.ts";

describe("contrat de combo (A20)", () => {
  it("détecte une Paire sur deux faces identiques", () => {
    expect(detectCombos(["strike", "guard", "strike"])).toEqual(["pair"]);
  });

  it("les combos ne sont pas exclusifs : un Trio satisfait aussi une Paire", () => {
    expect(detectCombos(["strike", "strike", "strike"])).toEqual(["pair", "echo", "trio"]);
  });

  it("Écho exige la consécutivité", () => {
    expect(detectCombos(["strike", "guard", "strike"])).not.toContain("echo");
    expect(detectCombos(["strike", "strike", "guard"])).toContain("echo");
  });

  it("Suite exige la sous-séquence consécutive exacte", () => {
    expect(detectCombos(["strike", "guard", "surge"])).toContain("suite");
    expect(detectCombos(["strike", "surge", "guard"])).not.toContain("suite");
    expect(detectCombos(["strike", "guard", "guard", "surge"])).not.toContain("suite");
  });

  it("reste valide au-delà de trois dés, et Écho ne devient pas trivial", () => {
    // Cinq dépenses alternées : beaucoup de Frappes, mais jamais deux d'affilée.
    const sequence = ["strike", "guard", "strike", "guard", "strike"] as const;
    const combos = detectCombos(sequence);
    expect(combos).toContain("trio");
    expect(combos).not.toContain("echo");
  });

  it("rend les combos dans l'ordre canonique, quel que soit l'ordre de découverte", () => {
    // Cette séquence contient aussi « strike, guard, surge » en positions 2 à 4 : la Suite
    // se déclenche, et c'est bien l'ordre de sortie qu'on vérifie ici.
    expect(detectCombos(["surge", "strike", "guard", "surge", "surge"])).toEqual([
      "pair",
      "echo",
      "trio",
      "suite",
    ]);
  });

  it("ne détecte rien sur une séquence vide ou d'un seul dé", () => {
    expect(detectCombos([])).toEqual([]);
    expect(detectCombos(["strike"])).toEqual([]);
  });
});

describe("bonus intrinsèque du combo", () => {
  it("ne donne rien pour une dépense isolée", () => {
    expect(comboBonusByFace(["strike"]).get("strike")).toBe(0);
  });

  it("donne +1 par dépense à partir de deux faces identiques", () => {
    expect(comboBonusByFace(["strike", "strike"]).get("strike")).toBe(1);
  });

  it("donne +2 par dépense à partir de trois", () => {
    expect(comboBonusByFace(["strike", "strike", "strike"]).get("strike")).toBe(2);
  });

  it("compte chaque face séparément", () => {
    const bonus = comboBonusByFace(["strike", "strike", "guard"]);
    expect(bonus.get("strike")).toBe(1);
    expect(bonus.get("guard")).toBe(0);
  });

  it("n'exige pas la consécutivité, contrairement à Écho", () => {
    expect(comboBonusByFace(["strike", "guard", "strike"]).get("strike")).toBe(1);
  });
});
