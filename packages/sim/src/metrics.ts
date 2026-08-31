import type { GameEvent } from "@rl/core";

/**
 * Les métriques de `docs/design/esquive-arbitrage.md` § 5.2, définies sur le journal
 * d'événements et sur rien d'autre.
 *
 * **Toutes sont restreintes à l'acte 1**, seul contenu réel. Une première version les
 * agrégeait sur la run entière : les remplisseurs des actes 2 et 3, qui empilent quatre ou
 * cinq ennemis, dominaient alors les moyennes et faisaient dire n'importe quoi au taux de
 * contact de la variante de référence.
 */
export interface RunMetrics {
  encounters: number;
  turnsNormal: number;
  encountersNormal: number;
  turnsBoss: number;
  encountersBoss: number;
  hpLost: number;
  /** Intentions `attack` ou `charge` effectivement résolues. */
  attackIntents: number;
  /** Instances de dégâts atteignant le joueur. Le Bouclier n'annule pas un contact :
   *  on mesure la géométrie, pas la mitigation. */
  contacts: number;
  diceSpent: number;
  rescueSpends: number;
}

export function emptyMetrics(): RunMetrics {
  return {
    encounters: 0,
    turnsNormal: 0,
    encountersNormal: 0,
    turnsBoss: 0,
    encountersBoss: 0,
    hpLost: 0,
    attackIntents: 0,
    contacts: 0,
    diceSpent: 0,
    rescueSpends: 0,
  };
}

/** Dépouille le journal d'un tour. `attackers` vient de l'état d'avant la validation. */
export function accumulateTurn(m: RunMetrics, log: GameEvent[], attackers: number[]): void {
  const attacking = new Set(attackers);
  for (const event of log) {
    switch (event.t) {
      case "INTENT_RESOLVED":
        if (attacking.has(event.unitId)) m.attackIntents += 1;
        break;
      case "DAMAGE_DEALT":
        if (event.targetId === "player" && event.sourceId !== null) m.contacts += 1;
        break;
      case "DIE_SPENT":
        m.diceSpent += 1;
        if (event.actionKind === "step") m.rescueSpends += 1;
        break;
      default:
        break;
    }
  }
}

export interface Aggregate {
  runs: number;
  contact: number;
  hpPerEncounter: number;
  turnsPerNormal: number;
  turnsPerBoss: number;
  zeroDamageShare: number;
  rescueShare: number;
}

export function aggregate(all: RunMetrics[]): Aggregate {
  const sum = (pick: (m: RunMetrics) => number): number => all.reduce((t, m) => t + pick(m), 0);
  const safe = (a: number, b: number): number => (b === 0 ? 0 : a / b);
  return {
    runs: all.length,
    contact: safe(sum((m) => m.contacts), sum((m) => m.attackIntents)),
    hpPerEncounter: safe(sum((m) => m.hpLost), sum((m) => m.encounters)),
    turnsPerNormal: safe(sum((m) => m.turnsNormal), sum((m) => m.encountersNormal)),
    turnsPerBoss: safe(sum((m) => m.turnsBoss), sum((m) => m.encountersBoss)),
    zeroDamageShare: safe(all.filter((m) => m.hpLost === 0).length, all.length),
    rescueShare: safe(sum((m) => m.rescueSpends), sum((m) => m.diceSpent)),
  };
}
