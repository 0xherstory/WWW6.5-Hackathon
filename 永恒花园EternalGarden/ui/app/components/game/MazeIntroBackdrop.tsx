"use client";

import { useId, useMemo } from "react";
import { MAZE_LEVEL } from "@/components/game/mazeData";
import {
  MAZE_INTRO_GLOW_CENTER,
  MAZE_INTRO_SKY,
  MAZE_TILE_LEFT,
  MAZE_TILE_RIGHT,
  MAZE_TILE_TOP,
  MAZE_TILE_WALL,
} from "@/components/game/mazePalette";

const TILE_W = 48;
const TILE_H = 24;

function isoToScreen(gx: number, gy: number) {
  const sx = (gx - gy) * (TILE_W / 2);
  const sy = (gx + gy) * (TILE_H / 2);
  return { sx, sy };
}

function stackAt(gx: number, gy: number) {
  return ((gx * 7 + gy * 11) % 3) + 1;
}

const TOP = [...MAZE_TILE_TOP];
const LEFT = [...MAZE_TILE_LEFT];
const RIGHT = [...MAZE_TILE_RIGHT];
const WALL = [...MAZE_TILE_WALL];

type Poly = { key: string; pts: string; fill: string };

export default function MazeIntroBackdrop() {
  const uid = useId().replace(/:/g, "");
  const { polygons, viewBox } = useMemo(() => {
    const grid = MAZE_LEVEL.grid;
    const rows = grid.length;
    const cols = grid[0]?.length ?? 0;

    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    const bump = (x: number, y: number) => {
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
    };

    for (let gy = 0; gy < rows; gy++) {
      for (let gx = 0; gx < cols; gx++) {
        const { sx: cx, sy } = isoToScreen(gx, gy);
        const stack = stackAt(gx, gy);
        const top = stack * 9;
        const y0 = sy - top;
        const tw = TILE_W;
        const th = TILE_H;
        bump(cx, y0 - th / 2);
        bump(cx + tw / 2, y0);
        bump(cx, y0 + th / 2);
        bump(cx - tw / 2, y0);
        bump(cx - tw / 2, y0 + top);
        bump(cx, y0 + th / 2 + top);
        bump(cx + tw / 2, y0 + top);
      }
    }

    const margin = 80;
    const ox = margin - minX;
    const oy = margin - minY + 40;
    const cw = maxX - minX + margin * 2;
    const ch = maxY - minY + margin * 2;

    const order: { gx: number; gy: number }[] = [];
    for (let gy = 0; gy < rows; gy++) {
      for (let gx = 0; gx < cols; gx++) order.push({ gx, gy });
    }
    order.sort((a, b) => a.gx + a.gy - (b.gx + b.gy));

    const items: Poly[] = [];
    for (const { gx, gy } of order) {
      const wall = grid[gy][gx] === 1;
      const { sx: cx, sy } = isoToScreen(gx, gy);
      const cx2 = cx + ox;
      const sy2 = sy + oy;
      const stack = stackAt(gx, gy);
      const top = stack * 9;
      const y0 = sy2 - top;
      const ci = (gx + gy) % 3;
      const t = wall ? WALL : TOP;
      const l = wall ? WALL : LEFT;
      const r = wall ? WALL : RIGHT;
      const tc = t[ci % 3];
      const lc = l[ci % 3];
      const rc = r[ci % 3];
      const tw = TILE_W;
      const th = TILE_H;

      const topPts = `${cx2},${y0 - th / 2} ${cx2 + tw / 2},${y0} ${cx2},${y0 + th / 2} ${cx2 - tw / 2},${y0}`;
      const leftPts = `${cx2 - tw / 2},${y0} ${cx2},${y0 + th / 2} ${cx2},${y0 + th / 2 + top} ${cx2 - tw / 2},${y0 + top}`;
      const rightPts = `${cx2 + tw / 2},${y0} ${cx2},${y0 + th / 2} ${cx2},${y0 + th / 2 + top} ${cx2 + tw / 2},${y0 + top}`;

      items.push({ key: `t-${gx}-${gy}`, pts: topPts, fill: tc });
      items.push({ key: `l-${gx}-${gy}`, pts: leftPts, fill: lc });
      items.push({ key: `r-${gx}-${gy}`, pts: rightPts, fill: rc });
    }

    return { polygons: items, viewBox: `0 0 ${cw} ${ch}` };
  }, []);

  const skyId = `maze-intro-sky-${uid}`;
  const glowId = `maze-intro-glow-${uid}`;

  return (
    <svg
      className="pointer-events-none absolute inset-0 h-full w-full select-none"
      viewBox={viewBox}
      preserveAspectRatio="xMidYMid slice"
      aria-hidden
    >
      <defs>
        <linearGradient id={skyId} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={MAZE_INTRO_SKY.top} />
          <stop offset="50%" stopColor={MAZE_INTRO_SKY.mid} />
          <stop offset="100%" stopColor={MAZE_INTRO_SKY.bot} />
        </linearGradient>
        <radialGradient id={glowId} cx="42%" cy="18%" r="0.75">
          <stop offset="0%" stopColor={MAZE_INTRO_GLOW_CENTER} stopOpacity="0.32" />
          <stop offset="100%" stopColor="#F4EEF4" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${skyId})`} />
      <rect width="100%" height="100%" fill={`url(#${glowId})`} />
      <g className="maze-intro-blocks" opacity={0.98}>
        {polygons.map((p) => (
          <polygon key={p.key} points={p.pts} fill={p.fill} stroke="none" />
        ))}
      </g>
    </svg>
  );
}
