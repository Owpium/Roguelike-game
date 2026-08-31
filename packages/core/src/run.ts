import { PLAYER_START } from "./geometry.ts";
import { createCombat, type Encounter } from "./combat.ts";
import { nextInt, type RngState } from "./rng.ts";
import type { CombatState, Die, EnemyType } from "./types.ts";
import { RULES, type RuleSet } from "./rules.ts";

/**
 * La structure de run (docs/design/run.md).
 *
 * La forme d'un acte est FIXE, jamais tirée au sort : 4 rangs, connexions complètes entre
 * rangs consécutifs. Seul le contenu des nœuds est tiré, et il l'est à la génération de la
 * run — pas à l'entrée du nœud — pour qu'une run soit rejouable à l'identique (I1).
 */

export type NodeKind = "combat" | "elite" | "rest" | "shop" | "event" | "boss";

export interface MapNode {
  kind: NodeKind;
  encounterId: string | null;
}

export interface ActMap {
  ranks: MapNode[][];
}

export interface RunContent {
  /** Rencontres normales, par acte (index 0 = acte 1). */
  encountersByAct: Encounter[][];
  /** Rencontres d'élite, par acte. */
  elitesByAct: Encounter[][];
  /** Un boss par acte. */
  bosses: Encounter[];
  types: Record<string, EnemyType>;
  startingPool: Die[];
  /** Variante de règles appliquée par défaut à tous les combats de la run. */
  rules?: RuleSet;
  /**
   * Règles par acte, index 0 = acte 1. D47 fait entrer `charge` à l'acte 2 : le cerveau des
   * ennemis n'est donc pas constant sur une run.
   */
  rulesByAct?: RuleSet[];
}

export interface RunState {
  rng: RngState;
  hp: number;
  hpMax: number;
  pool: Die[];
  coins: number;
  relics: string[];
  map: ActMap[];
  act: number;
  rank: number;
  combat: CombatState | null;
  currentNode: MapNode | null;
  status: "choosing" | "fighting" | "won" | "dead";
  /** Journal lisible de la run : ce que le simulateur agrège. */
  history: string[];
}

export const RUN_RULES = {
  startingHp: 40,
  /**
   * D36 — un seul chiffre de soin, 12 PV (30 % du max), au Repos comme après un boss.
   * À 10 et 5, le minimum de marge de survie tombait sur le boss 3, ce qui contredisait le
   * pic de mortalité en acte 2 qu'exige `run.md` § 5.3.
   */
  restHeal: 12,
  bossHeal: 12,
  coins: { combat: [10, 14], elite: [22, 28], boss: [30, 35] },
} as const;

const ACT_COUNT = 3;

function pickWithoutReplacement(rng: RngState, available: Encounter[]): Encounter {
  if (available.length === 0) throw new Error("Catalogue de rencontres épuisé");
  return available.splice(nextInt(rng, available.length), 1)[0]!;
}

function buildAct(rng: RngState, actIndex: number, content: RunContent): ActMap {
  const pool = [...(content.encountersByAct[actIndex] ?? [])];
  const elites = [...(content.elitesByAct[actIndex] ?? [])];
  const combat = (): MapNode => ({ kind: "combat", encounterId: pickWithoutReplacement(rng, pool).id });

  return {
    ranks: [
      // Rang 1 : toujours deux Combats. On choisit quelle menace on affronte, pas si on se bat.
      [combat(), combat()],
      // Rang 2 : Combat, Repos, et un troisième. Pas de Boutique en acte 1 : au premier rang 2
      // le joueur n'a gagné qu'une rencontre, il n'a rien à dépenser.
      [
        combat(),
        { kind: "rest", encounterId: null },
        { kind: actIndex === 0 ? "event" : "shop", encounterId: null },
      ],
      [combat(), { kind: "elite", encounterId: pickWithoutReplacement(rng, elites).id }],
      [{ kind: "boss", encounterId: content.bosses[actIndex]!.id }],
    ],
  };
}

export function createRun(seed: number, content: RunContent): RunState {
  const rng: RngState = { seed, cursor: 0 };
  const map = Array.from({ length: ACT_COUNT }, (_, act) => buildAct(rng, act, content));
  return {
    rng,
    hp: RUN_RULES.startingHp,
    hpMax: RUN_RULES.startingHp,
    pool: structuredClone(content.startingPool),
    coins: 0,
    relics: [],
    map,
    act: 0,
    rank: 0,
    combat: null,
    currentNode: null,
    status: "choosing",
    history: [],
  };
}

export function availableNodes(run: RunState): MapNode[] {
  if (run.status !== "choosing") return [];
  return run.map[run.act]!.ranks[run.rank]!;
}

function findEncounter(content: RunContent, id: string): Encounter {
  const all = [...content.encountersByAct.flat(), ...content.elitesByAct.flat(), ...content.bosses];
  const found = all.find((e) => e.id === id);
  if (!found) throw new Error(`Rencontre inconnue : ${id}`);
  return found;
}

function coinsFor(rng: RngState, range: readonly [number, number]): number {
  return range[0] + nextInt(rng, range[1] - range[0] + 1);
}

/** Entre dans un nœud du rang courant. Les nœuds sans combat sont résolus immédiatement. */
export function enterNode(run: RunState, index: number, content: RunContent): RunState {
  const state = structuredClone(run);
  const node = availableNodes(state)[index];
  if (!node) throw new Error(`Nœud ${index} inexistant au rang courant`);
  state.currentNode = node;

  if (node.kind === "combat" || node.kind === "elite" || node.kind === "boss") {
    state.combat = createCombat({
      rng: state.rng,
      pool: state.pool,
      hp: state.hp,
      hpMax: state.hpMax,
      encounter: findEncounter(content, node.encounterId!),
      types: content.types,
      playerStart: PLAYER_START,
      rules: content.rulesByAct?.[state.act] ?? content.rules ?? RULES,
    });
    // Le combat possède désormais le curseur du RNG : la run le récupère à la sortie.
    state.status = "fighting";
    state.history.push(`acte ${state.act + 1} rang ${state.rank + 1} — ${node.kind} ${node.encounterId}`);
    return state;
  }

  if (node.kind === "rest") {
    const healed = Math.min(RUN_RULES.restHeal, state.hpMax - state.hp);
    state.hp += healed;
    state.history.push(`acte ${state.act + 1} rang ${state.rank + 1} — repos, +${healed} PV`);
  } else {
    // Boutique et Événement n'ont pas encore de contenu : aucune relique n'existe avant M3.
    state.history.push(`acte ${state.act + 1} rang ${state.rank + 1} — ${node.kind} (sans effet en M1)`);
  }
  return advance(state);
}

/** À appeler quand le combat courant est terminé. Applique les récompenses et avance. */
export function resolveCombat(run: RunState): RunState {
  const state = structuredClone(run);
  const combat = state.combat;
  const node = state.currentNode;
  if (!combat || !node) throw new Error("Aucun combat en cours");

  state.rng = combat.rng;
  state.hp = combat.player.hp;
  state.combat = null;

  if (combat.phase === "lost") {
    state.status = "dead";
    state.history.push(`mort à l'acte ${state.act + 1} rang ${state.rank + 1}`);
    return state;
  }

  const kind = node.kind === "combat" ? "combat" : node.kind === "elite" ? "elite" : "boss";
  state.coins += coinsFor(state.rng, RUN_RULES.coins[kind]);
  if (node.kind === "boss" && state.act < ACT_COUNT - 1) {
    state.hp = Math.min(state.hpMax, state.hp + RUN_RULES.bossHeal);
  }
  state.history.push(`  victoire en ${combat.turn} tours, ${state.hp} PV restants`);
  return advance(state);
}

function advance(state: RunState): RunState {
  state.currentNode = null;
  state.rank += 1;
  if (state.rank >= state.map[state.act]!.ranks.length) {
    state.rank = 0;
    state.act += 1;
  }
  if (state.act >= ACT_COUNT) {
    state.status = "won";
    return state;
  }
  state.status = "choosing";
  return state;
}
