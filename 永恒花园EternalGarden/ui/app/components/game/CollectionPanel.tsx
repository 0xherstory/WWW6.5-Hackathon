"use client";

import type { MemoryFragment } from "./mazeData";

type Props = {
  collectedFragments: MemoryFragment[];
  onClose: () => void;
};

export default function CollectionPanel({ collectedFragments, onClose }: Props) {
  return (
    <div
      className="fixed inset-0 z-[6000] flex items-center justify-center bg-black/35 p-4 backdrop-blur-md"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-border bg-background p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-labelledby="collection-title"
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 id="collection-title" className="font-title text-xl text-foreground">
            记忆图鉴
          </h3>
          <button type="button" onClick={onClose} className="collection-close rounded-full px-3 py-1 text-sm text-muted-foreground transition-colors">
            关闭
          </button>
        </div>
        <p className="mb-4 text-xs text-muted-foreground">已收集 {collectedFragments.length} 枚碎片</p>
        <ul className="flex flex-col gap-3">
          {collectedFragments.map((f) => (
            <li key={f.id} className="rounded-xl border border-border bg-background/90 p-4">
              <div className="flex items-start gap-3">
                <span className="text-2xl">{f.icon}</span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline gap-2">
                    <span className="font-en text-year-muted text-xs">{f.year}</span>
                    <span className="font-title text-sm font-semibold text-foreground">{f.title}</span>
                  </div>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{f.content}</p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
