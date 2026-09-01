/**
 * Vérification de fumée du combat, dans un vrai navigateur aux dimensions d'un téléphone.
 *
 * Elle ne remplace pas le gate M2 — la question « est-ce agréable ? » se juge au pouce. Elle
 * vérifie ce qu'une machine peut vérifier : que la page ne déborde pas latéralement, que les
 * cases restent au-dessus de la cible tactile minimale, et qu'un tour se joue sans erreur.
 *
 *   pnpm --filter @rl/app build && pnpm --filter @rl/app smoke
 */
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const OUT = "packages/app/dist-smoke";
const URL = process.env.SMOKE_URL ?? "http://127.0.0.1:4173/";
const MIN_TOUCH_PX = 44;

mkdirSync(OUT, { recursive: true });

// `CHROMIUM_PATH` permet d'utiliser un Chromium déjà présent sur la machine plutôt que
// celui que Playwright télécharge. Sans elle, la résolution normale de Playwright s'applique.
const browser = await chromium.launch(
  process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {},
);
const page = await browser.newPage({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 2,
  isMobile: true,
  hasTouch: true,
});

const errors = [];
page.on("pageerror", (e) => errors.push(String(e)));
await page.goto(URL, { waitUntil: "networkidle" });
await page.waitForTimeout(300);

const layout = await page.evaluate(() => ({
  scrollW: document.documentElement.scrollWidth,
  innerW: window.innerWidth,
}));
const box = await page.locator("canvas").boundingBox();
const cell = box.width / 5;

await page.getByRole("button", { name: /Valider/ }).click();
await page.waitForTimeout(250);
await page.screenshot({ path: `${OUT}/combat.png` });
await browser.close();

const problems = [];
if (layout.scrollW > layout.innerW) {
  problems.push(`débordement latéral : ${layout.scrollW}px pour ${layout.innerW}px de large`);
}
if (cell < MIN_TOUCH_PX) {
  problems.push(`cases de ${Math.round(cell)}px, sous la cible tactile de ${MIN_TOUCH_PX}px`);
}
problems.push(...errors);

if (problems.length > 0) {
  console.error("ÉCHEC :\n- " + problems.join("\n- "));
  process.exit(1);
}
console.log(`OK — cases de ${Math.round(cell)}px, aucun débordement, aucune erreur.`);
