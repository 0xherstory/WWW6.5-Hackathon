"use client";

import type { MemoryFragment } from "./mazeData";

type Props = {
  collectedFragments: MemoryFragment[];
  totalFragments: number;
  onShowCollection: () => void;
  onBack: () => void;
  onExitGarden: () => void;
  mainTitle: string;
  mainTitleEn: string;
};

export default function GameHUD({
  collectedFragments,
  totalFragments,
  onShowCollection,
  onBack,
  onExitGarden,
  mainTitle,
  mainTitleEn,
}: Props) {
  const n = collectedFragments.length;
  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-[5500] flex flex-col px-3 pt-3 sm:px-5">
      <div className="relative flex min-h-[4.25rem] w-full items-start justify-between gap-2">
        <div className="pointer-events-auto flex shrink-0 flex-col gap-1.5">
          <button
            type="button"
            onClick={onBack}
            className="font-en flex items-center gap-1 rounded-full border border-border bg-background/95 px-3.5 py-2 text-sm text-foreground shadow-sm backdrop-blur-md"
          >
            <span aria-hidden>←</span> 返回
          </button>
          <button
            type="button"
            onClick={onExitGarden}
            className="font-en rounded-full border border-transparent px-2 py-0.5 text-left text-[11px] text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
          >
            永恒花园
          </button>
        </div>

        <div className="pointer-events-none absolute left-1/2 top-0 max-w-[min(72vw,22rem)] -translate-x-1/2 text-center">
          <div className="font-title text-base font-semibold leading-snug text-foreground sm:text-lg">{mainTitle}</div>
          <div className="font-en mt-0.5 text-[11px] leading-tight text-muted-foreground sm:text-xs">{mainTitleEn}</div>
        </div>

        <button
          type="button"
          onClick={onShowCollection}
          className="pointer-events-auto flex shrink-0 items-center gap-1 rounded-full border border-border bg-background/95 px-3.5 py-2 text-sm text-foreground shadow-sm backdrop-blur-md"
        >
          <span className="text-primary" aria-hidden>
            ✦
          </span>
          <span className="font-semibold tabular-nums">
            {n}/{totalFragments}
          </span>
        </button>
      </div>

      <p className="pointer-events-none mt-2 text-center text-[11px] text-muted-foreground sm:text-xs">点击地面移动 · 拾取发光的记忆碎片</p>
    </div>
  );
}
