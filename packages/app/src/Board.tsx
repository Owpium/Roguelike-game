import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import {
  GRID_H,
  GRID_W,
  cellKey,
  eq,
  type Cell,
  type CombatState,
} from "@rl/core";

export interface BoardHandle {
  /** Case sous un point écran, ou `null`. Sert au drag d'un dé vers la grille. */
  cellAt(clientX: number, clientY: number): Cell | null;
  /** Centre d'une case en coordonnées du conteneur, pour ancrer les indicateurs. */
  centerOf(cell: Cell): { x: number; y: number } | null;
}

interface Props {
  /** L'état PROJETÉ : la Main déjà posée, appliquée. C'est ce que le joueur doit voir. */
  view: CombatState;
  threat: Map<string, number>;
  targets: Set<string>;
  hovered: Cell | null;
  onPick(cell: Cell): void;
}

const COLORS = {
  cell: "#161d21",
  cellLine: "#263137",
  threat: "#c4553c",
  target: "#d3a055",
  player: "#d3a055",
  shield: "#6f8794",
  enemy: "#8b5b52",
  enemyLine: "#c07d6f",
  ink: "#e6ebe8",
  inkSoft: "#93a1a8",
};

export const Board = forwardRef<BoardHandle, Props>(function Board(
  { view, threat, targets, hovered, onPick },
  ref,
) {
  const wrap = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const [size, setSize] = useState({ cell: 56, x: 0, y: 0 });

  // Le canvas se dimensionne sur la place réellement disponible : la grille ne doit jamais
  // pousser la Main hors de la zone du pouce.
  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const measure = (): void => {
      const rect = el.getBoundingClientRect();
      const cell = Math.floor(Math.min((rect.width - 8) / GRID_W, (rect.height - 8) / GRID_H));
      const w = cell * GRID_W;
      const h = cell * GRID_H;
      setSize({ cell, x: Math.round((rect.width - w) / 2), y: Math.round((rect.height - h) / 2) });
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useImperativeHandle(ref, () => ({
    cellAt(clientX, clientY) {
      const el = canvas.current;
      if (!el) return null;
      const rect = el.getBoundingClientRect();
      const x = Math.floor((clientX - rect.left) / size.cell) + 1;
      const y = Math.floor((clientY - rect.top) / size.cell) + 1;
      if (x < 1 || x > GRID_W || y < 1 || y > GRID_H) return null;
      return { x, y };
    },
    centerOf(cell) {
      return {
        x: size.x + (cell.x - 0.5) * size.cell,
        y: size.y + (cell.y - 0.5) * size.cell,
      };
    },
  }));

  useEffect(() => {
    const el = canvas.current;
    if (!el) return;
    const dpr = window.devicePixelRatio || 1;
    const w = size.cell * GRID_W;
    const h = size.cell * GRID_H;
    el.width = w * dpr;
    el.height = h * dpr;
    el.style.width = `${w}px`;
    el.style.height = `${h}px`;
    const ctx = el.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    draw(ctx, size.cell, view, threat, targets, hovered);
  }, [size, view, threat, targets, hovered]);

  return (
    <div className="board" ref={wrap} style={{ width: "100%", height: "100%" }}>
      <canvas
        ref={canvas}
        onPointerDown={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const x = Math.floor((e.clientX - rect.left) / size.cell) + 1;
          const y = Math.floor((e.clientY - rect.top) / size.cell) + 1;
          if (x >= 1 && x <= GRID_W && y >= 1 && y <= GRID_H) onPick({ x, y });
        }}
      />
    </div>
  );
});

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number): void {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}

function draw(
  ctx: CanvasRenderingContext2D,
  cell: number,
  view: CombatState,
  threat: Map<string, number>,
  targets: Set<string>,
  hovered: Cell | null,
): void {
  const w = cell * GRID_W;
  const h = cell * GRID_H;
  ctx.clearRect(0, 0, w, h);

  const at = (c: Cell): { x: number; y: number } => ({ x: (c.x - 1) * cell, y: (c.y - 1) * cell });

  for (let y = 1; y <= GRID_H; y++) {
    for (let x = 1; x <= GRID_W; x++) {
      const c = { x, y };
      const p = at(c);
      ctx.fillStyle = COLORS.cell;
      roundRect(ctx, p.x + 2, p.y + 2, cell - 4, cell - 4, 6);
      ctx.fill();
      ctx.strokeStyle = COLORS.cellLine;
      ctx.lineWidth = 1;
      ctx.stroke();

      // Cases visées par une intention. Elles se recalculent à chaque rendu, donc une
      // poussée posée pendant la phase de choix déplace le surlignage en direct (D28).
      const menace = threat.get(cellKey(c)) ?? 0;
      if (menace > 0) {
        ctx.fillStyle = COLORS.threat;
        ctx.globalAlpha = Math.min(0.16 + menace * 0.06, 0.4);
        roundRect(ctx, p.x + 2, p.y + 2, cell - 4, cell - 4, 6);
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.strokeStyle = COLORS.threat;
        ctx.lineWidth = 2;
        roundRect(ctx, p.x + 3, p.y + 3, cell - 6, cell - 6, 5);
        ctx.stroke();
      }

      if (targets.has(cellKey(c))) {
        ctx.strokeStyle = COLORS.target;
        ctx.lineWidth = hovered && eq(hovered, c) ? 4 : 2.5;
        ctx.setLineDash(hovered && eq(hovered, c) ? [] : [5, 4]);
        roundRect(ctx, p.x + 4, p.y + 4, cell - 8, cell - 8, 5);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }
  }

  // Ennemis
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  for (const unit of view.units) {
    const p = at(unit.cell);
    const cx = p.x + cell / 2;
    const cy = p.y + cell / 2;
    ctx.fillStyle = COLORS.enemy;
    roundRect(ctx, p.x + 9, p.y + 9, cell - 18, cell - 18, 7);
    ctx.fill();
    ctx.strokeStyle = COLORS.enemyLine;
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = COLORS.ink;
    ctx.font = `700 ${Math.round(cell * 0.3)}px ui-monospace, monospace`;
    ctx.fillText(String(unit.hp), cx, cy - cell * 0.04);

    ctx.fillStyle = COLORS.inkSoft;
    ctx.font = `600 ${Math.round(cell * 0.17)}px ui-monospace, monospace`;
    const badge =
      unit.intent?.kind === "attack" || unit.intent?.kind === "charge"
        ? `-${unit.intent.value}`
        : unit.intent?.path.length
          ? "→"
          : "·";
    ctx.fillText(badge, cx, cy + cell * 0.26);

    if (unit.shield > 0) {
      ctx.fillStyle = COLORS.shield;
      ctx.fillText(`◇${unit.shield}`, cx, cy - cell * 0.28);
    }
  }

  // Joueur
  const p = at(view.player.cell);
  const cx = p.x + cell / 2;
  const cy = p.y + cell / 2;
  ctx.beginPath();
  ctx.arc(cx, cy, cell * 0.31, 0, Math.PI * 2);
  ctx.fillStyle = COLORS.player;
  ctx.fill();
  if (view.player.shield > 0) {
    ctx.beginPath();
    ctx.arc(cx, cy, cell * 0.39, 0, Math.PI * 2);
    ctx.strokeStyle = COLORS.shield;
    ctx.lineWidth = 3.5;
    ctx.stroke();
    ctx.fillStyle = COLORS.shield;
    ctx.font = `700 ${Math.round(cell * 0.19)}px ui-monospace, monospace`;
    ctx.fillText(String(view.player.shield), cx, p.y + cell * 0.13);
  }
}
