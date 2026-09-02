import { useCallback, useMemo, useRef, useState } from "react";
import {
  DIR_VECTOR,
  cellKey,
  comboBonusByFace,
  legalEntries,
  project,
  reduce,
  threatMap,
  translate,
  type Cell,
  type CombatState,
  type GameEvent,
  type LegalEntry,
} from "@rl/core";
import { Board, type BoardHandle, type TargetKind } from "./Board.tsx";
import {
  DIFFICULTIES,
  ENCOUNTERS,
  ENCOUNTER_LABELS,
  RELICS,
  newCombat,
  typesFor,
  type DifficultyId,
} from "./setup.ts";
import { describe, faceLabel, intentLabel } from "./labels.ts";

/** Case cible d'une entrée légale — c'est elle qui sert de zone de dépôt. */
function entryCell(view: CombatState, entry: LegalEntry): Cell | null {
  const action = entry.action;
  if (action.kind === "free_step") return translate(view.player.cell, DIR_VECTOR[action.dir]);
  switch (action.action.type) {
    case "strike": {
      const unit = view.units.find((u) => u.id === (action.action as { targetId: number }).targetId);
      return unit ? unit.cell : null;
    }
    case "guard":
      return view.player.cell;
    case "step":
      return translate(view.player.cell, DIR_VECTOR[action.action.dir]);
    case "surge": {
      const { dir, distance } = action.action;
      return translate(view.player.cell, {
        dx: DIR_VECTOR[dir].dx * distance,
        dy: DIR_VECTOR[dir].dy * distance,
      });
    }
  }
}

interface Floater {
  id: number;
  cell: Cell;
  text: string;
  color: string;
}

let floaterId = 0;

export function App(): JSX.Element {
  const [encounterId, setEncounterId] = useState(ENCOUNTERS[0]!.id);
  const [relics, setRelics] = useState<string[]>(RELICS.map((r) => r.id));
  const [seed, setSeed] = useState(1);
  const [panelOpen, setPanelOpen] = useState(false);
  const [difficulty, setDifficulty] = useState<DifficultyId>("normal");
  const TYPES = useMemo(() => typesFor(difficulty), [difficulty]);
  const [combat, setCombat] = useState<CombatState>(() =>
    newCombat(encounterId, relics, seed, "normal"),
  );
  const [selected, setSelected] = useState<string | null>(null);
  const [hovered, setHovered] = useState<Cell | null>(null);
  const [log, setLog] = useState<GameEvent[]>([]);
  const [floaters, setFloaters] = useState<Floater[]>([]);
  const board = useRef<BoardHandle>(null);

  const view = useMemo(() => project(combat), [combat]);
  const threat = useMemo(() => threatMap(view), [view]);
  const entries = useMemo(() => legalEntries(combat, view), [combat, view]);

  const spent = useMemo(
    () => new Set(combat.pendingActions.flatMap((a) => (a.kind === "spend" ? [a.dieId] : []))),
    [combat],
  );

  /** Entrées disponibles pour le dé sélectionné, indexées par case de dépôt. */
  const dropTargets = useMemo(() => {
    const map = new Map<string, { entry: LegalEntry; kind: TargetKind }>();
    if (!selected) return map;
    for (const entry of entries) {
      if (entry.action.kind !== "spend" || entry.action.dieId !== selected) continue;
      const cell = entryCell(view, entry);
      // Une case ne porte qu'une entrée : les cibles d'une Frappe, d'une Garde, d'un Élan et
      // d'une dépense de secours sont des cases distinctes tant qu'aucun Éclat n'est en Main.
      if (cell && !map.has(cellKey(cell))) {
        map.set(cellKey(cell), {
          entry,
          kind: entry.action.action.type === "step" ? "move" : "action",
        });
      }
    }
    return map;
  }, [entries, selected, view]);

  const targetKinds = useMemo(
    () => new Map([...dropTargets].map(([k, v]) => [k, v.kind] as const)),
    [dropTargets],
  );

  /** Le combo en cours de constitution, calculé sur les dépenses déjà posées. */
  const comboPreview = useMemo(() => {
    const spends = combat.pendingActions.flatMap((a) => (a.kind === "spend" ? [a] : []));
    const counts = new Map<string, number>();
    for (const s of spends) counts.set(s.effective, (counts.get(s.effective) ?? 0) + 1);
    const bonuses = comboBonusByFace(spends.map((s) => s.effective));
    return [...counts]
      .filter(([, n]) => n >= 2)
      .map(([face, n]) => ({ face, n, bonus: bonuses.get(face as never) ?? 0 }));
  }, [combat.pendingActions]);

  const restart = useCallback(
    (id: string, chosen: string[], s: number, d: DifficultyId = difficulty) => {
      setCombat(newCombat(id, chosen, s, d));
      setSelected(null);
      setLog([]);
      setFloaters([]);
    },
    [difficulty],
  );

  const commit = useCallback(
    (cell: Cell) => {
      const found = dropTargets.get(cellKey(cell));
      if (!found) return;
      setCombat((c) => reduce(c, { type: "ENTER", entry: found.entry.action }, TYPES).state);
      setSelected(null);
      setHovered(null);
    },
    [dropTargets],
  );

  const validate = useCallback(() => {
    const before = new Map(view.units.map((u) => [u.id, u.cell] as const));
    const playerCell = view.player.cell;
    const result = reduce(combat, { type: "VALIDATE" }, TYPES);
    setLog(result.log);
    setSelected(null);

    const next: Floater[] = [];
    for (const event of result.log) {
      if (event.t === "DAMAGE_DEALT") {
        const cell = event.targetId === "player" ? playerCell : before.get(event.targetId);
        if (cell) {
          next.push({
            id: floaterId++,
            cell,
            text: `-${event.amount}`,
            color: event.targetId === "player" ? "#e08a72" : "#f0e3c8",
          });
        }
      }
      if (event.t === "SHIELD_GAINED" && event.unitId === "player") {
        next.push({ id: floaterId++, cell: playerCell, text: `+${event.amount}◇`, color: "#8fb0c0" });
      }
    }
    setFloaters(next);
    window.setTimeout(() => setFloaters([]), 950);
    setCombat(result.state);
  }, [combat, view]);

  const over = combat.phase !== "choice";
  const carried = combat.hand.filter((d) => !spent.has(d.dieId)).length;

  return (
    <div className="app">
      <div className="hud">
        <div className="setup">
          <select
            value={encounterId}
            onChange={(e) => {
              setEncounterId(e.target.value);
              restart(e.target.value, relics, seed);
            }}
          >
            {ENCOUNTERS.map((e) => (
              <option key={e.id} value={e.id}>
                {ENCOUNTER_LABELS[e.id] ?? e.id}
              </option>
            ))}
          </select>
          <select
            value={difficulty}
            onChange={(e) => {
              const d = e.target.value as DifficultyId;
              setDifficulty(d);
              restart(encounterId, relics, seed, d);
            }}
          >
            {DIFFICULTIES.map((d) => (
              <option key={d.id} value={d.id}>
                {d.label}
              </option>
            ))}
          </select>
          <button className="mini" onClick={() => setPanelOpen((v) => !v)}>
            Reliques · {relics.length}/{RELICS.length}
          </button>
          <button
            className="mini"
            onClick={() => {
              const s = seed + 1;
              setSeed(s);
              restart(encounterId, relics, s);
            }}
          >
            Rejouer
          </button>
        </div>

        {panelOpen && (
          <div className="relics">
            {RELICS.map((r) => {
              const on = relics.includes(r.id);
              return (
                <button
                  key={r.id}
                  className="relic-row"
                  data-on={on}
                  onClick={() => {
                    const next = on ? relics.filter((x) => x !== r.id) : [...relics, r.id];
                    setRelics(next);
                    restart(encounterId, next, seed);
                  }}
                >
                  <span className="mark">{on ? "●" : "○"}</span>
                  <span className="body">
                    <b>{r.name}</b>
                    <i>{r.text}</i>
                  </span>
                </button>
              );
            })}
            <p className="hint-line">
              Changer une relique relance le combat. Une relique s'accroche à un combo : elle
              ajoute son effet par-dessus le bonus de dégâts que le combo donne déjà.
            </p>
          </div>
        )}

        <div className="hud-row">
          <span className="hp">
            {view.player.hp}
            <small> / {view.player.hpMax} PV</small>
          </span>
          {view.player.shield > 0 && <span className="shield">◇ {view.player.shield}</span>}
          <span className="turn">
            tour {combat.turn} · pool {combat.pool.length} · défausse {combat.discard.length}
          </span>
        </div>
        <div className="hp-bar">
          <i style={{ width: `${(view.player.hp / view.player.hpMax) * 100}%` }} />
        </div>
        <div className="intents">
          {view.units.map((u) => (
            <span key={u.id}>
              <b>#{u.id}</b> {TYPES[u.typeId]?.name ?? u.typeId} · {u.hp} PV · {intentLabel(u)}
            </span>
          ))}
        </div>
      </div>

      <div style={{ position: "relative", minHeight: 0 }}>
        <Board ref={board} view={view} threat={threat} targets={targetKinds} hovered={hovered} onPick={commit} />
        <div className="floaters">
          {floaters.map((f) => {
            const p = board.current?.centerOf(f.cell);
            if (!p) return null;
            return (
              <span key={f.id} className="floater" style={{ left: p.x, top: p.y, color: f.color }}>
                {f.text}
              </span>
            );
          })}
        </div>
      </div>

      <div className="tray">
        {!over && comboPreview.length > 0 && (
          <div className="combo">
            {comboPreview.map((c) => (
              <span key={c.face}>
                {faceLabel(c.face)} ×{c.n} <b>+{c.bonus}</b> par dépense
              </span>
            ))}
          </div>
        )}

        {over ? (
          <div className="banner" data-outcome={combat.phase}>
            {combat.phase === "won" ? "Combat gagné" : "Combat perdu"}
          </div>
        ) : (
          <div className="hand">
            {combat.hand.map((die) => (
              <button
                key={die.dieId}
                className="die"
                data-selected={selected === die.dieId}
                data-spent={spent.has(die.dieId)}
                disabled={spent.has(die.dieId)}
                onPointerDown={(e) => {
                  if (spent.has(die.dieId)) return;
                  e.currentTarget.setPointerCapture(e.pointerId);
                  setSelected(die.dieId);
                }}
                onPointerMove={(e) => {
                  if (selected !== die.dieId) return;
                  setHovered(board.current?.cellAt(e.clientX, e.clientY) ?? null);
                }}
                onPointerUp={(e) => {
                  const cell = board.current?.cellAt(e.clientX, e.clientY);
                  // Relâcher sur la grille valide la dépense ; relâcher sur le dé le laisse
                  // sélectionné, pour qu'un simple tap puis un tap sur la case marche aussi.
                  if (cell) commit(cell);
                  setHovered(null);
                }}
              >
                <span className="face">{faceLabel(die.face)}</span>
                <span className="hint">
                  {spent.has(die.dieId)
                    ? "joué"
                    : selected === die.dieId
                      ? "choisis une case"
                      : "reste en main"}
                </span>
              </button>
            ))}
          </div>
        )}

        {log.length > 0 && (
          <div className="log">
            {log.map(describe).filter(Boolean).join(" · ")}
          </div>
        )}

        <div className="actions">
          <button
            className="big"
            disabled={over || combat.pendingActions.length === 0}
            onClick={() => setCombat((c) => reduce(c, { type: "UNDO" }, TYPES).state)}
          >
            Annuler
          </button>
          {over ? (
            <button className="big primary" onClick={() => restart(encounterId, relics, seed + 1)}>
              Rejouer
            </button>
          ) : (
            <button className="big primary" onClick={validate}>
              Valider
              {carried > 0 ? ` · ${carried} en main` : ""}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
