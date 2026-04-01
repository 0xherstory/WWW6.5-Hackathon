"use client";

import { useState, useEffect } from "react";
import PixelDialog from "@/components/ui/PixelDialog";
import { DOMAIN_META } from "@/data/questions";
import type { Domain } from "@/types/game";

interface QuizResultProps {
  domain: Domain;
  onEnter: () => void;
}

const COLOR_MAP: Record<Domain, string> = {
  art: "#FF6B9D",
  science: "#00D4FF",
  law: "#FFD700",
};

export default function QuizResult({ domain, onEnter }: QuizResultProps) {
  const meta = DOMAIN_META[domain];
  const color = COLOR_MAP[domain];
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setRevealed(true), 400);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 gap-8">
      {/* Domain icon reveal */}
      <div
        className="text-6xl animate-pixelIn"
        style={{ filter: `drop-shadow(0 0 12px ${color})` }}
      >
        {meta.icon}
      </div>

      {revealed && (
        <PixelDialog
          borderColor={color}
          className="w-full max-w-lg animate-fadeIn text-center"
        >
          {/* Domain label */}
          <p
            className="text-[8px] mb-2 tracking-widest"
            style={{ color: `${color}99` }}
          >
            ── 你的领域 ──
          </p>

          <h2
            className="text-[14px] mb-2 tracking-wide"
            style={{ color }}
          >
            {meta.label}
          </h2>

          <p
            className="text-[9px] mb-6"
            style={{ color: `${color}cc` }}
          >
            {meta.tagline}
          </p>

          {/* Lore */}
          <p className="text-game-text text-[8px] leading-loose whitespace-pre-line mb-6 text-left border-t border-game-border pt-4">
            {meta.lore}
          </p>

          <button
            onClick={onEnter}
            className="pixel-btn w-full py-3 text-[9px]"
            style={{ borderColor: color, backgroundColor: "#12122a", color }}
          >
            ✦ 进入 {meta.label}
          </button>
        </PixelDialog>
      )}
    </div>
  );
}
