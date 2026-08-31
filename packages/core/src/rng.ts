/**
 * Générateur pseudo-aléatoire seedé — invariant I1 (déterminisme).
 *
 * La valeur produite est une fonction pure de `(seed, cursor)` : reprendre une partie
 * depuis un état sérialisé redonne exactement la même suite. Aucun `Math.random` ne doit
 * exister dans ce paquet.
 */

export interface RngState {
  seed: number;
  cursor: number;
}

/** splitmix32 — mélange `(seed, cursor)` en un entier 32 bits. */
function mix(seed: number, cursor: number): number {
  let z = (seed + Math.imul(cursor + 1, 0x9e3779b9)) >>> 0;
  z = Math.imul(z ^ (z >>> 16), 0x21f0aaad) >>> 0;
  z = Math.imul(z ^ (z >>> 15), 0x735a2d97) >>> 0;
  return (z ^ (z >>> 15)) >>> 0;
}

/** Consomme un tirage et avance le curseur. */
export function nextUint32(rng: RngState): number {
  const value = mix(rng.seed, rng.cursor);
  rng.cursor += 1;
  return value;
}

/** Entier dans `[0, bound)`. `bound` doit être strictement positif. */
export function nextInt(rng: RngState, bound: number): number {
  if (bound <= 0) throw new Error(`nextInt: bound doit être > 0, reçu ${bound}`);
  return Math.floor((nextUint32(rng) / 0x1_0000_0000) * bound);
}

/** Élément au hasard. Le tableau ne doit pas être vide. */
export function pick<T>(rng: RngState, items: readonly T[]): T {
  if (items.length === 0) throw new Error("pick: tableau vide");
  return items[nextInt(rng, items.length)]!;
}

/** Fisher-Yates seedé. Renvoie une copie, ne modifie pas l'entrée. */
export function shuffle<T>(rng: RngState, items: readonly T[]): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = nextInt(rng, i + 1);
    const a = out[i]!;
    const b = out[j]!;
    out[i] = b;
    out[j] = a;
  }
  return out;
}
