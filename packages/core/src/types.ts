import type { Cell, Dir, Offset } from "./geometry.ts";
import type { RngState } from "./rng.ts";

/**
 * Vocabulaire (CLAUDE.md) : Pool / Main / Face / Dépense / Relique / Intention côté joueur,
 * `pool` / `hand` / `face` / `spend` / `relic` / `intent` dans le code. Aucun synonyme.
 */

/** Les quatre faces. Étiquettes joueur : Frappe, Garde, Élan, Éclat. */
export type Face = "strike" | "guard" | "surge" | "spark";

export const FACE_LABEL: Record<Face, string> = {
  strike: "Frappe",
  guard: "Garde",
  surge: "Élan",
  spark: "Éclat",
};

/** Un dé du pool. Six faces, chacune tirable. */
export interface Die {
  id: string;
  faces: [Face, Face, Face, Face, Face, Face];
}

/** Un dé en Main : la face montrée, et s'il est conservé pour le tour suivant. */
export interface HandDie {
  dieId: string;
  face: Face;
  kept: boolean;
}

export type SpendAction =
  | { type: "strike"; targetId: number }
  | { type: "guard" }
  | { type: "surge"; dir: Dir; distance: 2 | 3 }
  /** Dépense de secours (combat.md § 5.5) : un pas, quelle que soit la face. */
  | { type: "step"; dir: Dir };

export type PendingAction =
  | { kind: "free_step"; dir: Dir }
  | {
      kind: "spend";
      dieId: string;
      /** Face effectivement montrée par le dé. */
      rolled: Face;
      /** Face retenue pour les combos et les crochets : la face choisie si Éclat. */
      effective: Exclude<Face, "spark">;
      action: SpendAction;
    };

export interface Player {
  cell: Cell;
  hp: number;
  hpMax: number;
  shield: number;
}

export type IntentKind = "attack" | "move" | "charge" | "support" | "zone";

export interface Intent {
  kind: IntentKind;
  /** Offsets figés au télégraphe, relatifs à l'ancre — qui suit l'unité (combat.md § 8.2). */
  pattern: Offset[];
  value: number;
  push: { distance: number; awayFromSource: boolean } | null;
  /** Pour `move` et `charge`. */
  path: Offset[];
}

export interface Unit {
  id: number;
  typeId: string;
  spawnIndex: number;
  cell: Cell;
  hp: number;
  hpMax: number;
  shield: number;
  armor: number;
  intent: Intent | null;
}

export type Brain = "melee" | "sniper";

export interface EnemyType {
  id: string;
  name: string;
  hp: number;
  armor: number;
  brain: Brain;
  /** Dégâts de l'attaque de base. */
  attack: number;
  /** Motif de l'attaque, offsets relatifs à la case visée. `[{dx:0,dy:0}]` = une seule case. */
  pattern: Offset[];
  /** Portée d'attaque, en distance de Manhattan pour `melee`, en ligne dégagée pour `sniper`. */
  range: { min: number; max: number };
  push: { distance: number } | null;
}

export type Phase = "choice" | "won" | "lost";

export interface CombatState {
  rng: RngState;
  turn: number;
  phase: Phase;
  player: Player;
  units: Unit[];
  /** Dés pas encore tirés ce combat. */
  pool: Die[];
  /** Dés dépensés ou défaussés. */
  discard: Die[];
  hand: HandDie[];
  pendingActions: PendingAction[];
  triggerBudget: number;
  triggersBySource: Record<string, number>;
  /** Journal du tour précédent, conservé pour le rejeu visuel (combat.md § 3, phase 5). */
  lastTurnLog: GameEvent[];
  nextUnitId: number;
  /** Les dés en Main ne portent que leur face : le dé lui-même se retrouve ici. */
  dieRegistry: Record<string, Die>;
}

export type Combo = "pair" | "echo" | "trio" | "suite";

/**
 * Journal d'événements — le seul jeu de crochets auquel les reliques pourront s'accrocher
 * (combat.md § 10.9). Toute addition à cette liste est un changement de contrat.
 */
export type GameEvent =
  | { t: "TURN_START"; turn: number }
  | { t: "HAND_DRAWN"; faces: Face[] }
  | { t: "DIE_SPENT"; dieId: string; face: Face; actionKind: SpendAction["type"] }
  | { t: "UNIT_MOVED"; unitId: number | "player"; from: Cell; to: Cell; cause: string }
  | { t: "DAMAGE_DEALT"; sourceId: number | "player" | null; targetId: number | "player"; amount: number }
  | { t: "SHIELD_GAINED"; unitId: number | "player"; amount: number }
  | { t: "UNIT_PUSHED"; unitId: number | "player"; from: Cell; to: Cell; blocked: boolean }
  | { t: "UNIT_DIED"; unitId: number }
  | { t: "COMBO_DETECTED"; combo: Combo }
  | { t: "COMBO_RESOLVED"; combo: Combo }
  | { t: "PLAYER_PHASE_END" }
  | { t: "INTENT_RESOLVED"; unitId: number }
  | { t: "ENEMY_PHASE_END" }
  | { t: "TURN_END" }
  | { t: "TRIGGER_BUDGET_EXHAUSTED" }
  | { t: "COMBAT_WON" }
  | { t: "COMBAT_LOST" };
