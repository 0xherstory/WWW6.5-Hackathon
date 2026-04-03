"use client";

import { useCallback, useEffect, useRef } from "react";
import type { MemoryFragment } from "./mazeData";
import { MAZE_LEVEL } from "./mazeData";
import { MAZE_BG_STOPS, MAZE_TILE_LEFT, MAZE_TILE_RIGHT, MAZE_TILE_TOP, MAZE_TILE_WALL } from "./mazePalette";

const TILE_W = 48;
const TILE_H = 24;

/** 迷宫整体在画布内下移（等距内容默认偏上，避免贴顶） */
const MAZE_VIEW_VERTICAL_OFFSET = 72;

type Props = {
  onFragmentCollect: (fragment: MemoryFragment) => void;
  collectedIds: Set<string>;
  isPaused: boolean;
};

function bfsPath(
  grid: number[][],
  sx: number,
  sy: number,
  ex: number,
  ey: number,
): { gx: number; gy: number }[] | null {
  const rows = grid.length;
  const cols = grid[0]?.length ?? 0;
  if (grid[sy]?.[sx] !== 0 || grid[ey]?.[ex] !== 0) return null;
  const key = (x: number, y: number) => `${x},${y}`;
  const prev = new Map<string, string | null>();
  const q: { gx: number; gy: number }[] = [{ gx: sx, gy: sy }];
  prev.set(key(sx, sy), null);
  const dirs = [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
  ];
  let found: { gx: number; gy: number } | null = null;
  while (q.length) {
    const cur = q.shift()!;
    if (cur.gx === ex && cur.gy === ey) {
      found = cur;
      break;
    }
    for (const [dx, dy] of dirs) {
      const nx = cur.gx + dx;
      const ny = cur.gy + dy;
      if (ny < 0 || ny >= rows || nx < 0 || nx >= cols) continue;
      if (grid[ny][nx] !== 0) continue;
      const k = key(nx, ny);
      if (prev.has(k)) continue;
      prev.set(k, key(cur.gx, cur.gy));
      q.push({ gx: nx, gy: ny });
    }
  }
  if (!found) return null;
  const path: { gx: number; gy: number }[] = [];
  let ck = key(found.gx, found.gy);
  while (ck) {
    const [px, py] = ck.split(",").map(Number);
    path.push({ gx: px, gy: py });
    const p = prev.get(ck);
    ck = p ?? "";
  }
  path.reverse();
  return path;
}

export default function MazeCanvas({ onFragmentCollect, collectedIds, isPaused }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef({ gx: 1, gy: 1 });
  const pathQueueRef = useRef<{ gx: number; gy: number }[]>([]);
  const keysRef = useRef<Set<string>>(new Set());
  const firedRef = useRef<Set<string>>(new Set());
  const collectedIdsRef = useRef(collectedIds);
  const onCollectRef = useRef(onFragmentCollect);
  const lastStepRef = useRef(0);
  const originRef = useRef({ ox: 0, oy: 0 });
  const hoverRef = useRef<{ gx: number; gy: number } | null>(null);
  const clickPulseRef = useRef<{ gx: number; gy: number; t: number } | null>(null);

  collectedIdsRef.current = collectedIds;
  onCollectRef.current = onFragmentCollect;

  useEffect(() => {
    if (collectedIds.size === 0) {
      firedRef.current.clear();
      pathQueueRef.current = [];
    }
  }, [collectedIds]);

  const tryCollect = useCallback((gx: number, gy: number) => {
    for (const frag of MAZE_LEVEL.fragments) {
      if (frag.gx !== gx || frag.gy !== gy) continue;
      if (collectedIdsRef.current.has(frag.id) || firedRef.current.has(frag.id)) continue;
      firedRef.current.add(frag.id);
      onCollectRef.current(frag);
    }
  }, []);

  const isoToScreen = useCallback((gx: number, gy: number, ox: number, oy: number) => {
    const sx = (gx - gy) * (TILE_W / 2) + ox;
    const sy = (gx + gy) * (TILE_H / 2) + oy;
    return { sx, sy };
  }, []);

  const stackAt = useCallback((gx: number, gy: number) => ((gx * 7 + gy * 11) % 3) + 1, []);

  /** 优先点到 emoji（大命中），否则吸附最近可走格子 */
  const pickTarget = useCallback(
    (mx: number, my: number, ox: number, oy: number, grid: number[][]) => {
      const rows = grid.length;
      const cols = grid[0]?.length ?? 0;

      for (const frag of MAZE_LEVEL.fragments) {
        if (collectedIdsRef.current.has(frag.id)) continue;
        const { sx, sy } = isoToScreen(frag.gx, frag.gy, ox, oy);
        const stack = stackAt(frag.gx, frag.gy);
        const iconY = sy - stack * 9 - 28;
        const dx = mx - sx;
        const dy = my - iconY;
        /* 光晕中心 + 略偏下（用户常点到 emoji 下方地砖） */
        if (dx * dx + dy * dy <= 105 * 105) {
          return { gx: frag.gx, gy: frag.gy };
        }
        /* 碎片所在格中心：点到脚下地板也算 */
        const dx2 = mx - sx;
        const dy2 = my - sy;
        if (dx2 * dx2 + dy2 * dy2 <= 58 * 58) {
          return { gx: frag.gx, gy: frag.gy };
        }
      }

      let best: { gx: number; gy: number } | null = null;
      let bestD = Infinity;
      for (let gy = 0; gy < rows; gy++) {
        for (let gx = 0; gx < cols; gx++) {
          if (grid[gy][gx] !== 0) continue;
          const { sx, sy } = isoToScreen(gx, gy, ox, oy);
          const d = (mx - sx) ** 2 + (my - sy) ** 2;
          if (d < bestD) {
            bestD = d;
            best = { gx, gy };
          }
        }
      }
      if (best && bestD <= 190 * 190) return best;
      return null;
    },
    [isoToScreen, stackAt],
  );

  const updateHover = useCallback(
    (mx: number, my: number, ox: number, oy: number, grid: number[][]) => {
      const t = pickTarget(mx, my, ox, oy, grid);
      hoverRef.current = t;
    },
    [pickTarget],
  );

  useEffect(() => {
    const grid = MAZE_LEVEL.grid;
    const rows = grid.length;
    const cols = grid[0]?.length ?? 0;

    const onKeyDown = (e: KeyboardEvent) => {
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "w", "a", "s", "d", "W", "A", "S", "D"].includes(e.key)) {
        e.preventDefault();
        keysRef.current.add(e.key.toLowerCase());
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      keysRef.current.delete(e.key.toLowerCase());
    };

    const handlePointer = (clientX: number, clientY: number, isClick: boolean) => {
      if (isPaused) return;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      /* 与 setTransform(dpr) 后的绘制坐标一致：用 CSS 像素对齐画布显示区域 */
      const mx = clientX - rect.left;
      const my = clientY - rect.top;
      const { ox, oy } = originRef.current;

      if (!isClick) {
        updateHover(mx, my, ox, oy, grid);
        return;
      }

      const target = pickTarget(mx, my, ox, oy, grid);
      if (!target) return;
      const p = playerRef.current;
      if (target.gx === p.gx && target.gy === p.gy) {
        tryCollect(target.gx, target.gy);
        return;
      }
      const path = bfsPath(grid, p.gx, p.gy, target.gx, target.gy);
      if (!path || path.length < 2) return;
      pathQueueRef.current = path.slice(1);
      clickPulseRef.current = { gx: target.gx, gy: target.gy, t: performance.now() };
    };

    const onClick = (e: MouseEvent) => {
      e.preventDefault();
      handlePointer(e.clientX, e.clientY, true);
    };

    const onMouseMove = (e: MouseEvent) => {
      if (isPaused) {
        hoverRef.current = null;
        return;
      }
      handlePointer(e.clientX, e.clientY, false);
    };

    const onMouseLeave = () => {
      hoverRef.current = null;
    };

    const onTouchEnd = (e: TouchEvent) => {
      if (isPaused) return;
      e.preventDefault();
      const t = e.changedTouches[0];
      if (t) handlePointer(t.clientX, t.clientY, true);
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    const canvasEl0 = canvasRef.current;
    canvasEl0?.addEventListener("click", onClick);
    canvasEl0?.addEventListener("mousemove", onMouseMove);
    canvasEl0?.addEventListener("mouseleave", onMouseLeave);
    canvasEl0?.addEventListener("touchend", onTouchEnd, { passive: false });

    const TOP = [...MAZE_TILE_TOP];
    const LEFT = [...MAZE_TILE_LEFT];
    const RIGHT = [...MAZE_TILE_RIGHT];
    const WALL = [...MAZE_TILE_WALL];

    const drawDiamondTop = (ctx: CanvasRenderingContext2D, cx: number, cy: number, w: number, h: number, fill: string) => {
      ctx.beginPath();
      ctx.moveTo(cx, cy - h / 2);
      ctx.lineTo(cx + w / 2, cy);
      ctx.lineTo(cx, cy + h / 2);
      ctx.lineTo(cx - w / 2, cy);
      ctx.closePath();
      ctx.fillStyle = fill;
      ctx.fill();
    };

    const drawBlock = (
      ctx: CanvasRenderingContext2D,
      cx: number,
      cy: number,
      stack: number,
      ci: number,
      isWall: boolean,
    ) => {
      const top = stack * 9;
      const t = isWall ? WALL : TOP;
      const l = isWall ? WALL : LEFT;
      const r = isWall ? WALL : RIGHT;
      const tc = t[ci % 3];
      const lc = l[ci % 3];
      const rc = r[ci % 3];
      const tw = TILE_W;
      const th = TILE_H;

      const y0 = cy - top;
      drawDiamondTop(ctx, cx, y0, tw, th, tc);

      ctx.beginPath();
      ctx.moveTo(cx - tw / 2, y0);
      ctx.lineTo(cx, y0 + th / 2);
      ctx.lineTo(cx, y0 + th / 2 + top);
      ctx.lineTo(cx - tw / 2, y0 + top);
      ctx.closePath();
      ctx.fillStyle = lc;
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(cx + tw / 2, y0);
      ctx.lineTo(cx, y0 + th / 2);
      ctx.lineTo(cx, y0 + th / 2 + top);
      ctx.lineTo(cx + tw / 2, y0 + top);
      ctx.closePath();
      ctx.fillStyle = rc;
      ctx.fill();
    };

    let raf = 0;
    const loop = (now: number) => {
      const canvasEl = canvasRef.current;
      const wrap = wrapRef.current;
      if (!canvasEl || !wrap) {
        raf = requestAnimationFrame(loop);
        return;
      }
      const ctx = canvasEl.getContext("2d");
      if (!ctx) {
        raf = requestAnimationFrame(loop);
        return;
      }

      if (!isPaused && now - lastStepRef.current > 95) {
        lastStepRef.current = now;
        if (pathQueueRef.current.length > 0) {
          const next = pathQueueRef.current.shift()!;
          playerRef.current = { gx: next.gx, gy: next.gy };
          tryCollect(next.gx, next.gy);
        } else {
          const p = playerRef.current;
          let dx = 0;
          let dy = 0;
          const k = keysRef.current;
          if (k.has("arrowright") || k.has("d")) dx = 1;
          if (k.has("arrowleft") || k.has("a")) dx = -1;
          if (k.has("arrowdown") || k.has("s")) dy = 1;
          if (k.has("arrowup") || k.has("w")) dy = -1;
          if (dx !== 0 && dy !== 0) dy = 0;
          if (dx !== 0 || dy !== 0) {
            const nx = p.gx + dx;
            const ny = p.gy + dy;
            if (ny >= 0 && ny < rows && nx >= 0 && nx < cols && grid[ny][nx] === 0) {
              p.gx = nx;
              p.gy = ny;
              tryCollect(nx, ny);
            }
          }
        }
      }

      let minX = Infinity;
      let minY = Infinity;
      let maxX = -Infinity;
      let maxY = -Infinity;
      for (let gy = 0; gy < rows; gy++) {
        for (let gx = 0; gx < cols; gx++) {
          const { sx, sy } = isoToScreen(gx, gy, 0, 0);
          minX = Math.min(minX, sx - TILE_W);
          maxX = Math.max(maxX, sx + TILE_W);
          minY = Math.min(minY, sy - TILE_H * 3);
          maxY = Math.max(maxY, sy + TILE_H * 3);
        }
      }
      const margin = 80;
      const ox = margin - minX;
      const oy = margin - minY + 40 + MAZE_VIEW_VERTICAL_OFFSET;
      originRef.current = { ox, oy };

      const cw = maxX - minX + margin * 2;
      const ch = maxY - minY + margin * 2 + MAZE_VIEW_VERTICAL_OFFSET;
      const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;
      const rect = wrap.getBoundingClientRect();
      const displayW = Math.max(rect.width, cw);
      const displayH = Math.max(rect.height, ch);
      canvasEl.style.width = `${displayW}px`;
      canvasEl.style.height = `${displayH}px`;
      canvasEl.width = Math.floor(displayW * dpr);
      canvasEl.height = Math.floor(displayH * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, displayW, displayH);

      const bgGrad = ctx.createLinearGradient(0, 0, 0, displayH);
      bgGrad.addColorStop(0, MAZE_BG_STOPS.top);
      bgGrad.addColorStop(0.5, MAZE_BG_STOPS.mid);
      bgGrad.addColorStop(1, MAZE_BG_STOPS.bot);
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, displayW, displayH);

      const order: { gx: number; gy: number }[] = [];
      for (let gy = 0; gy < rows; gy++) {
        for (let gx = 0; gx < cols; gx++) {
          order.push({ gx, gy });
        }
      }
      order.sort((a, b) => a.gx + a.gy - (b.gx + b.gy));

      const hov = hoverRef.current;
      const pulse = clickPulseRef.current;
      const pulseAge = pulse ? now - pulse.t : 9999;

      for (const { gx, gy } of order) {
        const wall = grid[gy][gx] === 1;
        const { sx, sy } = isoToScreen(gx, gy, ox, oy);
        const stack = wall ? 3 : stackAt(gx, gy);
        const ci = (gx + gy) % 3;

        if (hov && hov.gx === gx && hov.gy === gy && !wall) {
          const { sx: csx, sy: csy } = isoToScreen(gx, gy, ox, oy);
          const y0 = csy - stack * 9;
          ctx.save();
          ctx.beginPath();
          ctx.moveTo(csx, y0 - TILE_H / 2);
          ctx.lineTo(csx + TILE_W / 2, y0);
          ctx.lineTo(csx, y0 + TILE_H / 2);
          ctx.lineTo(csx - TILE_W / 2, y0);
          ctx.closePath();
          ctx.fillStyle = "rgba(240, 215, 225, 0.38)";
          ctx.fill();
          ctx.strokeStyle = "rgba(210, 175, 195, 0.45)";
          ctx.lineWidth = 2;
          ctx.stroke();
          ctx.restore();
        }

        if (pulse && pulse.gx === gx && pulse.gy === gy && pulseAge < 500 && !wall) {
          const { sx: psx, sy: psy } = isoToScreen(gx, gy, ox, oy);
          const y0 = psy - stack * 9;
          const alpha = 1 - pulseAge / 500;
          ctx.save();
          ctx.globalAlpha = alpha * 0.6;
          ctx.beginPath();
          ctx.moveTo(psx, y0 - TILE_H / 2 - 4);
          ctx.lineTo(psx + TILE_W / 2 + 4, y0);
          ctx.lineTo(psx, y0 + TILE_H / 2 + 4);
          ctx.lineTo(psx - TILE_W / 2 - 4, y0);
          ctx.closePath();
          ctx.strokeStyle = "rgba(200, 165, 185, 0.75)";
          ctx.lineWidth = 3;
          ctx.stroke();
          ctx.restore();
        }

        drawBlock(ctx, sx, sy, stack, ci, wall);
      }

      for (const frag of MAZE_LEVEL.fragments) {
        if (collectedIdsRef.current.has(frag.id)) continue;
        const { sx, sy } = isoToScreen(frag.gx, frag.gy, ox, oy);
        const stack = stackAt(frag.gx, frag.gy);
        const y = sy - stack * 9 - 28;
        ctx.beginPath();
        ctx.arc(sx, y, 24, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255,248,250,0.78)";
        ctx.fill();
        ctx.strokeStyle = "rgba(225,200,215,0.75)";
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.font = "24px system-ui";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(frag.icon, sx, y);
      }

      const p = playerRef.current;
      const ps = isoToScreen(p.gx, p.gy, ox, oy);
      const ph = stackAt(p.gx, p.gy);
      const py = ps.sy - ph * 9 - 6;
      ctx.fillStyle = "rgba(255,252,252,0.98)";
      ctx.beginPath();
      ctx.ellipse(ps.sx, py, 11, 15, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "rgba(210,175,190,0.38)";
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.fillStyle = "#FFF5F3";
      ctx.beginPath();
      ctx.arc(ps.sx, py - 11, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "rgba(200,170,185,0.16)";
      ctx.beginPath();
      ctx.ellipse(ps.sx, ps.sy + 4, 14, 5, 0, 0, Math.PI * 2);
      ctx.fill();

      raf = requestAnimationFrame(loop);
    };

    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      const el = canvasRef.current;
      el?.removeEventListener("click", onClick);
      el?.removeEventListener("mousemove", onMouseMove);
      el?.removeEventListener("mouseleave", onMouseLeave);
      el?.removeEventListener("touchend", onTouchEnd);
    };
  }, [isPaused, isoToScreen, pickTarget, stackAt, tryCollect, updateHover]);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;

    const syncScroll = () => {
      const { scrollHeight, clientHeight, scrollWidth, clientWidth } = wrap;
      if (scrollHeight > clientHeight) {
        wrap.scrollTop = (scrollHeight - clientHeight) / 2;
      } else {
        wrap.scrollTop = 0;
      }
      if (scrollWidth > clientWidth) {
        wrap.scrollLeft = (scrollWidth - clientWidth) / 2;
      } else {
        wrap.scrollLeft = 0;
      }
    };

    const ro = new ResizeObserver(() => requestAnimationFrame(syncScroll));
    ro.observe(canvas);
    ro.observe(wrap);
    requestAnimationFrame(() => requestAnimationFrame(syncScroll));
    return () => ro.disconnect();
  }, []);

  return (
    <div
      ref={wrapRef}
      className="mm-play-canvas flex h-[calc(100vh-7.5rem)] w-full cursor-crosshair items-center justify-center overflow-auto pt-4 pb-6"
    >
      <canvas ref={canvasRef} className="touch-manipulation select-none" />
    </div>
  );
}
