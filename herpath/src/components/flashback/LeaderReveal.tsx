"use client";

import { useState, useEffect } from "react";
import type { Leader } from "@/types/flashback";
import { LEADER_META } from "@/data/flashback";

interface LeaderRevealProps {
  leader: Leader;
  onContinue: () => void;
}

export default function LeaderReveal({ leader, onContinue }: LeaderRevealProps) {
  const meta = LEADER_META[leader];
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setRevealed(true), 600);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-8 p-4">
      {/* Icon with glow */}
      <div
        className="text-7xl animate-pixelIn"
        style={{
          filter: `drop-shadow(0 0 20px ${meta.color})`,
        }}
      >
        {meta.icon}
      </div>

      {revealed && (
        <div className="flex flex-col items-center gap-4 animate-fadeIn">
          {/* Leader name */}
          <h2
            className="text-[16px] tracking-widest"
            style={{ color: meta.color }}
          >
            {meta.name}
          </h2>

          {/* Title */}
          <p className="text-[8px] text-game-muted text-center max-w-sm leading-loose">
            {meta.title}
          </p>

          {/* Story intro */}
          <div
            className="border-2 px-6 py-4 max-w-md text-center text-[8px] leading-loose"
            style={{
              borderColor: meta.color,
              backgroundColor: "#0d0d1e",
              boxShadow: `0 0 20px ${meta.color}33`,
            }}
          >
            {leader === "rbg"
              ? "法律是正义的武器。\n在最高法院的席位上，\n她为数百万人争取权利。"
              : "影响力胜于地位。\n从律师到第一夫人再到议员，\n她的韧性改变了世界。"}
          </div>

          {/* Continue button */}
          <button
            onClick={onContinue}
            className="pixel-btn px-10 py-3 text-[9px] mt-4"
            style={{
              borderColor: meta.color,
              backgroundColor: "#12122a",
              color: meta.color,
            }}
          >
            ✦ 进入她的故事
          </button>
        </div>
      )}
    </div>
  );
}
