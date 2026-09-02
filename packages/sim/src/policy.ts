import {
  DIR_VECTOR,
  cellKey as key,
  eq,
  findUnit,
  legalEntries,
  manhattan,
  project,
  reduce,
  threatFromUnit as threatFrom,
  threatMap,
  translate,
  type Cell,
  type CombatState,
  type EnemyType,
  type GameEvent,
  type LegalEntry,
} from "@rl/core";

/**
 * IA de joueur gloutonne, barème exprimé en **une seule monnaie : les points de vie**.
 *
 * C'est une exigence de validité de la campagne de mesure, pas une conception d'IA
 * (`docs/design/esquive-arbitrage.md` § 5.5). Le barème précédent était calibré sous les
 * règles actuelles — une esquive y valait 3, une Frappe non létale 10 — donc il aurait
 * comparé des pondérations en croyant comparer des règles : privée du pas gratuit, cette IA
 * n'aurait jamais fui, et aurait rendu D44 artificiellement efficace.
 *
 * Aucun seuil, aucune constante ne change d'une variante à l'autre.
 */

function scoreEntry(view: CombatState, threat: Map<string, number>, entry: LegalEntry): number {
  const here = threat.get(key(view.player.cell)) ?? 0;
  const action = entry.action;
  if (action.kind === "free_step") {
    const to = translate(view.player.cell, DIR_VECTOR[action.dir]);
    return here - (threat.get(key(to)) ?? 0);
  }

  switch (action.action.type) {
    case "step": {
      const to = translate(view.player.cell, DIR_VECTOR[action.action.dir]);
      return here - (threat.get(key(to)) ?? 0);
    }

    case "guard":
      return Math.min(here, view.rules.guardShield);

    case "strike": {
      const target = findUnit(view, action.action.targetId);
      if (!target) return 0;
      const lethal = target.hp <= view.rules.strikeDamage;
      // Une frappe létale vaut les dégâts qu'elle inflige plus la menace qu'elle annule.
      return view.rules.strikeDamage + (lethal ? threatFrom(view, target, view.player.cell) : 0);
    }

    case "surge": {
      const { dir, distance } = action.action;
      let trampled = 0;
      let lethal = 0;
      for (let step = 1; step <= distance; step++) {
        const c = translate(view.player.cell, {
          dx: DIR_VECTOR[dir].dx * step,
          dy: DIR_VECTOR[dir].dy * step,
        });
        const unit = view.units.find((u) => eq(u.cell, c));
        if (!unit) continue;
        trampled += 1;
        if (unit.hp <= view.rules.surgeTrampleDamage) lethal += 1;
      }
      const arrival = translate(view.player.cell, {
        dx: DIR_VECTOR[dir].dx * distance,
        dy: DIR_VECTOR[dir].dy * distance,
      });
      return here - (threat.get(key(arrival)) ?? 0) + 2 * lethal + trampled;
    }
  }
}

/**
 * Départage quand rien ne vaut plus de zéro : se rapprocher de l'ennemi le plus proche.
 *
 * Le barème du § 5.5 n'a pas de terme pour l'approche, et sans ce départage l'IA passe son
 * tour dès qu'aucune frappe n'est possible et qu'aucune menace ne pèse — ce qui gonfle les
 * tours par rencontre dans **toutes** les variantes, mais pas de la même quantité. C'est un
 * ordre lexicographique, pas une pondération : aucune constante n'entre dans le score, donc
 * la neutralité du barème vis-à-vis des règles est préservée.
 */
function closingRank(view: CombatState, entry: LegalEntry): number {
  const action = entry.action;
  const dir =
    action.kind === "free_step" ? action.dir : action.action.type === "step" ? action.action.dir : null;
  if (!dir) return 0;
  const to = translate(view.player.cell, DIR_VECTOR[dir]);
  const nearest = (from: Cell): number =>
    view.units.reduce((best, u) => Math.min(best, manhattan(u.cell, from)), Infinity);
  return nearest(to) < nearest(view.player.cell) ? 1 : 0;
}

export interface TurnOutcome {
  state: CombatState;
  log: GameEvent[];
  /** Unités dont l'intention résolue ce tour était `attack` ou `charge`. */
  attackers: number[];
}

export function playTurn(state: CombatState, types: Record<string, EnemyType>): TurnOutcome {
  let current = state;

  for (let guard = 0; guard < 12; guard += 1) {
    const view = project(current);
    const entries = legalEntries(current, view);
    if (entries.length === 0) break;
    const threat = threatMap(view);

    let best: LegalEntry | null = null;
    let bestScore = 0;
    for (const entry of entries) {
      const score = scoreEntry(view, threat, entry);
      // Départage à score égal : l'ordre de `legalEntries`, qui est déjà déterministe.
      if (score > bestScore) {
        bestScore = score;
        best = entry;
      }
    }

    if (!best) {
      const closing = entries.find((e) => closingRank(view, e) === 1);
      if (!closing) break;
      best = closing;
    }

    current = reduce(current, { type: "ENTER", entry: best.action }, types).state;
  }

  const attackers = current.units
    .filter((u) => u.intent?.kind === "attack" || u.intent?.kind === "charge")
    .map((u) => u.id);
  const validated = reduce(current, { type: "VALIDATE" }, types);
  return { state: validated.state, log: validated.log, attackers };
}
