import { FACE_LABEL, type GameEvent, type Unit } from "@rl/core";

/** Tout ce que le joueur lit. Vocabulaire normé : Pool, Main, Face, Dépense, Relique, Intention. */

export const COMBO_LABEL: Record<string, string> = {
  pair: "Paire",
  echo: "Écho",
  trio: "Trio",
  suite: "Suite",
};

export function faceLabel(face: string): string {
  return FACE_LABEL[face as keyof typeof FACE_LABEL] ?? face;
}

export function intentLabel(unit: Unit): string {
  const intent = unit.intent;
  if (!intent) return "—";
  if (intent.kind === "attack") return `frappe ${intent.value}`;
  if (intent.kind === "charge") return `charge ${intent.value}`;
  if (intent.path.length === 0) return "bloqué";
  return "avance";
}

/** Le journal du tour, en français. Le joueur doit pouvoir nommer ce qui l'a tué. */
export function describe(event: GameEvent): string | null {
  switch (event.t) {
    case "DIE_SPENT":
      return `Dépense — ${faceLabel(event.face)}`;
    case "DAMAGE_DEALT":
      return event.targetId === "player"
        ? `Tu subis ${event.amount}`
        : `${event.amount} dégâts sur #${event.targetId}`;
    case "SHIELD_GAINED":
      return `+${event.amount} Bouclier`;
    case "UNIT_PUSHED":
      return event.blocked ? "Poussée bloquée, 1 dégât de choc" : "Poussée";
    case "UNIT_DIED":
      return `#${event.unitId} meurt`;
    case "COMBO_RESOLVED":
      return `${COMBO_LABEL[event.combo]} !`;
    case "TRIGGER_BUDGET_EXHAUSTED":
      return "Limite de déclenchements atteinte";
    case "COMBAT_WON":
      return "Combat gagné";
    case "COMBAT_LOST":
      return "Combat perdu";
    default:
      return null;
  }
}
