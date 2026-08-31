import { describe, expect, it } from "vitest";
import { nextInt, nextUint32, shuffle, type RngState } from "./rng.ts";

describe("RNG — invariant I1", () => {
  it("produit la même suite pour la même graine", () => {
    const a: RngState = { seed: 42, cursor: 0 };
    const b: RngState = { seed: 42, cursor: 0 };
    const left = Array.from({ length: 50 }, () => nextUint32(a));
    const right = Array.from({ length: 50 }, () => nextUint32(b));
    expect(left).toEqual(right);
  });

  it("produit des suites différentes pour des graines différentes", () => {
    const a: RngState = { seed: 1, cursor: 0 };
    const b: RngState = { seed: 2, cursor: 0 };
    expect(nextUint32(a)).not.toBe(nextUint32(b));
  });

  it("est une fonction pure de (graine, curseur) : reprendre au milieu donne la même valeur", () => {
    const continuous: RngState = { seed: 7, cursor: 0 };
    for (let i = 0; i < 10; i++) nextUint32(continuous);
    const expected = nextUint32(continuous);

    // C'est ce qui rend « l'état est la sauvegarde » possible : on reprend au curseur 10.
    const resumed: RngState = { seed: 7, cursor: 10 };
    expect(nextUint32(resumed)).toBe(expected);
  });

  it("borne nextInt dans [0, bound)", () => {
    const rng: RngState = { seed: 3, cursor: 0 };
    for (let i = 0; i < 500; i++) {
      const value = nextInt(rng, 6);
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(6);
    }
  });

  it("mélange sans perdre ni dupliquer d'élément", () => {
    const rng: RngState = { seed: 9, cursor: 0 };
    const input = [1, 2, 3, 4, 5, 6];
    const output = shuffle(rng, input);
    expect([...output].sort()).toEqual(input);
    expect(input).toEqual([1, 2, 3, 4, 5, 6]);
  });
});
