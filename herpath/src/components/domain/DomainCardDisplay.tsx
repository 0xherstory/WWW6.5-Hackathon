"use client";

import type { DomainCard } from "@/types/domain";
import { ATTRIBUTE_META } from "@/data/rbg-cards";

interface DomainCardDisplayProps {
  card: DomainCard;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
}

export default function DomainCardDisplay({
  card,
  onSwipeLeft,
  onSwipeRight,
}: DomainCardDisplayProps) {
  const leftMeta = ATTRIBUTE_META[card.leftAttr];
  const rightMeta = ATTRIBUTE_META[card.rightAttr];

  return (
    <div className="flex flex-col items-center gap-6 animate-fadeIn">
      {/* Card */}
      <div
        className="w-72 h-96 border-2 flex flex-col overflow-hidden relative"
        style={{
          borderColor: "#4a4a8a",
          backgroundColor: "#0d0d1e",
          boxShadow: "0 0 24px rgba(160, 160, 255, 0.3), 4px 6px 0 rgba(0,0,0,0.8)",
        }}
      >
        {/* Situation area */}
        <div
          className="flex-1 flex items-center justify-center px-6 py-4 text-center border-b"
          style={{ borderColor: "#4a4a8a", backgroundColor: "#12122a" }}
        >
          <p className="text-[9px] leading-relaxed text-game-text whitespace-pre-line">
            {card.situation}
          </p>
        </div>

        {/* Choice display */}
        <div className="flex flex-1" style={{ borderLeft: "2px solid #4a4a8a" }}>
          {/* Left choice */}
          <div
            className="flex-1 flex flex-col justify-center items-center p-3 text-left cursor-pointer transition-colors"
            onClick={onSwipeLeft}
            style={{ backgroundColor: "#0d0d1e" }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.backgroundColor = "rgba(160, 160, 255, 0.1)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.backgroundColor = "#0d0d1e";
            }}
          >
            <span className="text-[7px] text-game-muted mb-2 tracking-widest">← 左滑</span>
            <p className="text-[7px] leading-relaxed text-game-text">{card.leftText}</p>
            <div className="flex items-center gap-1 mt-2">
              <span style={{ color: leftMeta.color }}>{leftMeta.icon}</span>
              <span className="text-[7px]" style={{ color: leftMeta.color }}>
                {leftMeta.name}
              </span>
            </div>
          </div>

          {/* Right choice */}
          <div
            className="flex-1 flex flex-col justify-center items-center p-3 text-right cursor-pointer transition-colors"
            onClick={onSwipeRight}
            style={{ backgroundColor: "#0d0d1e" }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.backgroundColor = "rgba(255, 107, 157, 0.1)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.backgroundColor = "#0d0d1e";
            }}
          >
            <span className="text-[7px] text-game-muted mb-2 tracking-widest">右滑 →</span>
            <p className="text-[7px] leading-relaxed text-game-text">{card.rightText}</p>
            <div className="flex items-center justify-end gap-1 mt-2">
              <span className="text-[7px]" style={{ color: rightMeta.color }}>
                {rightMeta.name}
              </span>
              <span style={{ color: rightMeta.color }}>{rightMeta.icon}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex gap-4">
        <button
          onClick={onSwipeLeft}
          className="pixel-btn px-6 py-2 text-[8px]"
          style={{
            borderColor: "#a0a0ff",
            backgroundColor: "#12122a",
            color: "#a0a0ff",
          }}
        >
          ← 左滑
        </button>
        <button
          onClick={onSwipeRight}
          className="pixel-btn px-6 py-2 text-[8px]"
          style={{
            borderColor: "#ff6b9d",
            backgroundColor: "#12122a",
            color: "#ff6b9d",
          }}
        >
          右滑 →
        </button>
      </div>
    </div>
  );
}
