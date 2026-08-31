import { describe, expect, it } from "vitest";
import { detectCombos } from "./combos.ts";

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
