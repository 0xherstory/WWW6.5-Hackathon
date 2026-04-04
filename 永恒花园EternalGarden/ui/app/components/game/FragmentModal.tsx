"use client";

import type { MemoryFragment } from "./mazeData";

type Props = {
  fragment: MemoryFragment;
  onClose: () => void;
};

export default function FragmentModal({ fragment, onClose }: Props) {
  return (
    <div
      className="fixed inset-0 z-[6000] flex items-center justify-center bg-black/40 p-4 backdrop-blur-md"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="relative w-full max-w-md rounded-[28px] bg-background p-8 shadow-[0_24px_80px_rgba(0,0,0,0.12)]"
        style={{ animation: "modal-in 0.38s cubic-bezier(0.22, 1, 0.36, 1) both" }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-labelledby="frag-title"
      >
        <div className="mb-3 flex justify-center text-6xl drop-shadow-sm">{fragment.icon}</div>
        <p className="font-en text-center text-sm font-medium text-year-muted">{fragment.year}</p>
        <h3 id="frag-title" className="font-title mt-2 text-center text-2xl font-bold text-foreground">
          {fragment.title}
        </h3>
        <p className="mt-4 text-center text-sm leading-relaxed text-muted-foreground">{fragment.content}</p>

        <div
          className="mx-auto my-6 h-px max-w-[200px]"
          style={{
            background: "linear-gradient(90deg, transparent, hsl(var(--primary) / 0.45), transparent)",
          }}
        />

        <p className="mb-6 text-center text-sm font-medium text-primary">✦ 记忆碎片已收集 ✦</p>

        <button
          type="button"
          onClick={onClose}
          className="fragment-modal-sage font-en w-full rounded-full py-3.5 text-sm font-medium text-white shadow-md transition-transform hover:scale-[1.02] active:scale-[0.99]"
        >
          继续探索
        </button>
      </div>
    </div>
  );
}
