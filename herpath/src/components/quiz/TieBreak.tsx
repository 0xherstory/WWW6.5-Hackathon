"use client";

import PixelDialog from "@/components/ui/PixelDialog";
import { DOMAIN_META } from "@/data/questions";
import type { Domain } from "@/types/game";

interface TieBreakProps {
  candidates: Domain[];
  onChoose: (domain: Domain) => void;
}

const COLOR_MAP: Record<Domain, string> = {
  art: "#FF6B9D",
  science: "#00D4FF",
  law: "#FFD700",
};

export default function TieBreak({ candidates, onChoose }: TieBreakProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 gap-6">
      <PixelDialog className="w-full max-w-lg animate-pixelIn text-center">
        <p className="text-game-muted text-[8px] mb-2">── 命运的交叉点 ──</p>
        <p className="text-game-text text-[10px] leading-loose mb-6">
          你的边界，不只一条路。
          <br />
          <span className="text-game-muted text-[8px]">选择你更想踏入的领域——</span>
        </p>

        <div className="flex gap-4 justify-center">
          {candidates.map((domain) => {
            const meta = DOMAIN_META[domain];
            const color = COLOR_MAP[domain];
            return (
              <button
                key={domain}
                onClick={() => onChoose(domain)}
                className="pixel-btn flex-1 flex flex-col items-center gap-3 py-5 px-3"
                style={{ borderColor: color, backgroundColor: "#12122a" }}
              >
                <span className="text-3xl">{meta.icon}</span>
                <span className="text-[8px]" style={{ color }}>
                  {meta.label}
                </span>
                <span className="text-[7px] text-game-muted leading-relaxed">
                  {meta.tagline}
                </span>
              </button>
            );
          })}
        </div>
      </PixelDialog>
    </div>
  );
}
