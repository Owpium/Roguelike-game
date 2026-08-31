import { VARIANTS, simContent, type Variant } from "./content.ts";
import { aggregate, type RunMetrics } from "./metrics.ts";
import { simulateRun } from "./runner.ts";

/**
 * `pnpm sim --seed 42` — joue une run complète en console, sans un seul pixel.
 * `pnpm sim --seed 1 --runs 400 --variant A` — agrège une variante.
 * `pnpm sim --campaign --runs 400` — les six variantes appariées sur les mêmes seeds.
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
const campaign = process.argv.includes("--campaign");

function measure(variant: Variant, count: number): RunMetrics[] {
  const content = simContent(variant.rules, variant.types);
  return Array.from({ length: count }, (_, i) => simulateRun(seed + i, content).metrics);
}

function pct(value: number): string {
  return `${(value * 100).toFixed(1)} %`;
}

if (campaign) {
  console.log(`Campagne — ${runs} seeds par variante, mêmes seeds partout (comparaison appariée)`);
  console.log("Métriques : docs/design/esquive-arbitrage.md § 5.2\n");
  const header = ["var", "contact", "pv/renc", "tours/renc", "runs0", "secours"];
  console.log(header.map((h, i) => h.padEnd(i === 0 ? 4 : 12)).join(""));
  for (const variant of VARIANTS) {
    const a = aggregate(measure(variant, runs));
    const row = [
      variant.id.padEnd(4),
      pct(a.contact).padEnd(12),
      a.hpPerEncounter.toFixed(2).padEnd(12),
      a.turnsPerNormal.toFixed(1).padEnd(12),
      pct(a.zeroDamageShare).padEnd(12),
      pct(a.rescueShare).padEnd(12),
    ];
    console.log(row.join(""));
  }
  console.log("\nToutes les métriques portent sur l'acte 1, seul contenu réel. Le taux de");
  console.log("victoire n'est pas décisionnel : les actes 2 et 3 sont des remplisseurs.");
} else if (runs === 1) {
  const variant = VARIANTS.find((v) => v.id === flag("variant", "R")) ?? VARIANTS[0]!;
  const result = simulateRun(seed, simContent(variant.rules, variant.types));
  console.log(`seed ${result.seed} — variante ${variant.id} (${variant.label})`);
  console.log(result.outcome === "won" ? "VICTOIRE" : "MORT");
  for (const line of result.history) console.log(line);
  console.log(`${result.metrics.encounters} rencontres, ${result.hp} PV`);
} else {
  const variant = VARIANTS.find((v) => v.id === flag("variant", "R"));
  if (!variant) {
    console.error(`Variante inconnue. Connues : ${VARIANTS.map((v) => v.id).join(", ")}`);
    process.exit(1);
  }
  const a = aggregate(measure(variant, runs));
  console.log(`${runs} runs depuis la seed ${seed} — variante ${variant.id} (${variant.label})`);
  console.log(`contact              : ${pct(a.contact)}`);
  console.log(`pv perdus / rencontre: ${a.hpPerEncounter.toFixed(2)}`);
  console.log(`tours / rencontre    : ${a.turnsPerNormal.toFixed(1)} (boss : ${a.turnsPerBoss.toFixed(1)})`);
  console.log(`runs sans un dégât   : ${pct(a.zeroDamageShare)}`);
  console.log(`dépenses de secours  : ${pct(a.rescueShare)}`);
}
