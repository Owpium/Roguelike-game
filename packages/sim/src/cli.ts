import { simulateRun } from "./runner.ts";
import { VARIANTS, simContent } from "./content.ts";

/**
 * `pnpm sim --seed 42` — joue une run complète en console, sans un seul pixel.
 * `pnpm sim --seed 1 --runs 200` — agrège N runs consécutives.
 */

function arg(name: string, fallback: number): number {
  const index = process.argv.indexOf(`--${name}`);
  if (index === -1) return fallback;
  const value = Number(process.argv[index + 1]);
  return Number.isFinite(value) ? value : fallback;
}

function flag(name: string, fallback: string): string {
  const index = process.argv.indexOf(`--${name}`);
  return index === -1 ? fallback : (process.argv[index + 1] ?? fallback);
}

const seed = arg("seed", 42);
const runs = arg("runs", 1);
const variantName = flag("variant", "base");
const variant = VARIANTS[variantName];
if (!variant) {
  console.error(`Variante inconnue : ${variantName}. Connues : ${Object.keys(VARIANTS).join(", ")}`);
  process.exit(1);
}
const content = simContent(variant);

if (runs === 1) {
  const result = simulateRun(seed, content);
  console.log(`seed ${result.seed} — variante « ${variantName} » — ${result.outcome === "won" ? "VICTOIRE" : "MORT"}`);
  for (const line of result.history) console.log(line);
  console.log(`${result.encounters} rencontres, ${result.turns} tours, ${result.hp} PV`);
} else {
  const results = Array.from({ length: runs }, (_, i) => simulateRun(seed + i, content));
  const won = results.filter((r) => r.outcome === "won").length;
  const turns = results.map((r) => r.turns).sort((a, b) => a - b);
  const hps = results.map((r) => r.hp).sort((a, b) => a - b);
  const median = (xs: number[]): number => xs[Math.floor(xs.length / 2)] ?? 0;
  const untouched = results.filter((r) => r.hp === 40).length;
  console.log(`${runs} runs depuis la seed ${seed} — variante « ${variantName} »`);
  console.log(`victoires : ${won} (${((won / runs) * 100).toFixed(1)} %)`);
  console.log(`tours par run : médiane ${median(turns)}, min ${turns[0]}, max ${turns[turns.length - 1]}`);
  console.log(`PV en fin de run : médiane ${median(hps)}, min ${hps[0]}`);
  console.log(`runs terminées sans perdre un seul PV : ${untouched} (${((untouched / runs) * 100).toFixed(1)} %)`);
  console.log("Rappel : les actes 2 et 3 sont des remplisseurs, ces chiffres ne mesurent pas l'équilibrage.");
}
