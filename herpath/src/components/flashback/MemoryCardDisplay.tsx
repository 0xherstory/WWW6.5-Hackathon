"use client";

import type { MemoryCard } from "@/types/flashback";

interface MemoryCardDisplayProps {
  card: MemoryCard;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  progress: number; // 0-6, which card we're on
}

// Pixel art placeholder SVG for each scene
function PixelArt({ imageKey }: { imageKey: string }) {
  const artMap: Record<string, JSX.Element> = {
    broken_instrument: (
      <svg width="200" height="160" viewBox="0 0 200 160">
        <rect x="40" y="40" width="120" height="80" fill="#4a4a7a" />
        <rect x="50" y="50" width="100" height="60" fill="#6a6aaa" />
        <rect x="60" y="60" width="30" height="40" fill="#ffffff" opacity="0.3" />
        <line x1="80" y1="50" x2="80" y2="110" stroke="#2a2a5a" strokeWidth="2" />
        <line x1="120" y1="50" x2="120" y2="110" stroke="#2a2a5a" strokeWidth="2" />
        <circle cx="70" cy="90" r="8" fill="#ff6b9d" opacity="0.5" />
        <circle cx="130" cy="90" r="8" fill="#00d4ff" opacity="0.5" />
      </svg>
    ),
    rule_book: (
      <svg width="200" height="160" viewBox="0 0 200 160">
        <rect x="50" y="30" width="100" height="100" fill="#8b7355" />
        <line x1="100" y1="30" x2="100" y2="130" stroke="#5a4a3a" strokeWidth="2" />
        <line x1="55" y1="50" x2="145" y2="50" stroke="#d4a574" strokeWidth="1" />
        <line x1="55" y1="65" x2="145" y2="65" stroke="#d4a574" strokeWidth="1" />
        <line x1="55" y1="80" x2="145" y2="80" stroke="#d4a574" strokeWidth="1" />
        <line x1="55" y1="95" x2="145" y2="95" stroke="#ff6b9d" strokeWidth="2" />
        <line x1="55" y1="110" x2="145" y2="110" stroke="#d4a574" strokeWidth="1" />
      </svg>
    ),
    blackboard_formula: (
      <svg width="200" height="160" viewBox="0 0 200 160">
        <rect x="20" y="20" width="160" height="120" fill="#1a1a3a" />
        <text x="100" y="60" textAnchor="middle" fill="#ffffff" fontSize="24" fontFamily="monospace">
          ∫∞π
        </text>
        <text x="100" y="90" textAnchor="middle" fill="#ffd700" fontSize="14" fontFamily="monospace">
          = ∇²Ψ
        </text>
      </svg>
    ),
    distant_noise: (
      <svg width="200" height="160" viewBox="0 0 200 160">
        <circle cx="100" cy="80" r="50" fill="none" stroke="#00d4ff" strokeWidth="2" opacity="0.6" />
        <circle cx="100" cy="80" r="35" fill="none" stroke="#00d4ff" strokeWidth="2" opacity="0.4" />
        <circle cx="100" cy="80" r="20" fill="none" stroke="#00d4ff" strokeWidth="2" opacity="0.2" />
        <line x1="100" y1="20" x2="100" y2="50" stroke="#00d4ff" strokeWidth="2" />
        <line x1="150" y1="80" x2="170" y2="80" stroke="#00d4ff" strokeWidth="2" />
      </svg>
    ),
    blank_wall: (
      <svg width="200" height="160" viewBox="0 0 200 160">
        <rect x="20" y="20" width="160" height="120" fill="#c0c0c0" />
        <circle cx="60" cy="60" r="15" fill="#ff6b9d" opacity="0.7" />
        <circle cx="100" cy="50" r="20" fill="#ffd700" opacity="0.6" />
        <circle cx="140" cy="80" r="18" fill="#00d4ff" opacity="0.5" />
        <line x1="50" y1="120" x2="150" y2="120" stroke="#808080" strokeWidth="3" />
      </svg>
    ),
    ancient_scroll: (
      <svg width="200" height="160" viewBox="0 0 200 160">
        <rect x="30" y="40" width="140" height="80" fill="#e8d7c3" />
        <circle cx="40" cy="50" r="8" fill="#8b7355" />
        <circle cx="160" cy="50" r="8" fill="#8b7355" />
        <line x1="40" y1="50" x2="160" y2="50" stroke="#8b7355" strokeWidth="1" />
        <text x="100" y="85" textAnchor="middle" fill="#8b7355" fontSize="18" fontFamily="serif">
          ≈ ∼ ≈
        </text>
      </svg>
    ),
    street_dispute: (
      <svg width="200" height="160" viewBox="0 0 200 160">
        <line x1="100" y1="20" x2="100" y2="140" stroke="#808080" strokeWidth="4" />
        <rect x="30" y="80" width="50" height="40" fill="#ff6b9d" opacity="0.5" />
        <rect x="120" y="80" width="50" height="40" fill="#00d4ff" opacity="0.5" />
        <text x="55" y="110" textAnchor="middle" fill="#ffffff" fontSize="12">vs</text>
        <text x="145" y="110" textAnchor="middle" fill="#ffffff" fontSize="12">vs</text>
      </svg>
    ),
    glowing_plant: (
      <svg width="200" height="160" viewBox="0 0 200 160">
        <line x1="100" y1="130" x2="100" y2="60" stroke="#2a5a2a" strokeWidth="3" />
        <circle cx="100" cy="50" r="18" fill="#00d4ff" opacity="0.8" />
        <circle cx="85" cy="65" r="12" fill="#00d4ff" opacity="0.6" />
        <circle cx="115" cy="65" r="12" fill="#00d4ff" opacity="0.6" />
        <circle cx="100" cy="50" r="8" fill="#ffffff" opacity="0.4" />
      </svg>
    ),
    code_loop: (
      <svg width="200" height="160" viewBox="0 0 200 160">
        <circle cx="100" cy="80" r="45" fill="none" stroke="#00d4ff" strokeWidth="3" />
        <text x="100" y="85" textAnchor="middle" fill="#00d4ff" fontSize="16" fontFamily="monospace">
          while(1)
        </text>
      </svg>
    ),
    ruined_plaza: (
      <svg width="200" height="160" viewBox="0 0 200 160">
        <rect x="30" y="70" width="30" height="70" fill="#8b7355" opacity="0.6" />
        <rect x="70" y="80" width="40" height="60" fill="#8b7355" opacity="0.4" />
        <rect x="120" y="65" width="30" height="75" fill="#8b7355" opacity="0.5" />
        <path d="M 40 50 Q 60 30 80 50" stroke="#ff6b9d" strokeWidth="2" fill="none" />
      </svg>
    ),
    city_badge: (
      <svg width="200" height="160" viewBox="0 0 200 160">
        <circle cx="100" cy="80" r="40" fill="none" stroke="#ffd700" strokeWidth="3" />
        <circle cx="100" cy="80" r="30" fill="none" stroke="#ffd700" strokeWidth="2" />
        <line x1="70" y1="80" x2="130" y2="80" stroke="#ffd700" strokeWidth="2" />
        <line x1="100" y1="50" x2="100" y2="110" stroke="#ffd700" strokeWidth="2" />
      </svg>
    ),
    meteor: (
      <svg width="200" height="160" viewBox="0 0 200 160">
        <circle cx="140" cy="40" r="12" fill="#ffd700" />
        <line x1="140" y1="40" x2="80" y2="120" stroke="#ffd700" strokeWidth="2" />
        <circle cx="135" cy="50" r="6" fill="#ffd700" opacity="0.5" />
        <circle cx="110" cy="85" r="4" fill="#ffd700" opacity="0.3" />
      </svg>
    ),
    abandoned_court: (
      <svg width="200" height="160" viewBox="0 0 200 160">
        <rect x="40" y="30" width="120" height="100" fill="#6a5a4a" />
        <rect x="60" y="50" width="20" height="70" fill="#4a4a6a" />
        <rect x="120" y="50" width="20" height="70" fill="#4a4a6a" />
        <line x1="70" y1="90" x2="130" y2="90" stroke="#ffd700" strokeWidth="3" />
      </svg>
    ),
    robot_love: (
      <svg width="200" height="160" viewBox="0 0 200 160">
        <rect x="60" y="50" width="40" height="50" fill="#8a8a8a" />
        <circle cx="70" cy="65" r="5" fill="#00d4ff" />
        <circle cx="90" cy="65" r="5" fill="#00d4ff" />
        <circle cx="80" cy="85" r="4" fill="#ff6b9d" />
        <path d="M 100 70 Q 110 60 120 70" stroke="#ff6b9d" strokeWidth="2" fill="none" />
      </svg>
    ),
    world_restart: (
      <svg width="200" height="160" viewBox="0 0 200 160">
        <circle cx="100" cy="80" r="50" fill="none" stroke="#4a4a8a" strokeWidth="2" />
        <circle cx="100" cy="80" r="40" fill="none" stroke="#00d4ff" strokeWidth="1" opacity="0.5" />
        <text x="100" y="90" textAnchor="middle" fill="#ffd700" fontSize="20">↻</text>
      </svg>
    ),
  };

  return artMap[imageKey] || artMap.blank_wall;
}

export default function MemoryCardDisplay({ card, onSwipeLeft, onSwipeRight, progress }: MemoryCardDisplayProps) {
  return (
    <div className="flex flex-col items-center gap-6 animate-fadeIn">
      {/* Progress indicator */}
      <div className="flex gap-1">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="w-2 h-2 border border-game-border transition-all"
            style={{
              backgroundColor: i < progress ? "#a0a0ff" : "transparent",
            }}
          />
        ))}
      </div>

      {/* Card */}
      <div
        className="w-72 h-96 border-2 flex flex-col overflow-hidden relative"
        style={{
          borderColor: "#4a4a8a",
          backgroundColor: "#0d0d1e",
          boxShadow: "0 0 24px rgba(160, 160, 255, 0.3), 4px 6px 0 rgba(0,0,0,0.8)",
        }}
      >
        {/* Pixel art area */}
        <div
          className="flex-1 flex items-center justify-center bg-gradient-to-b"
          style={{
            background: "linear-gradient(to bottom, #1a1a3a 0%, #0d0d1e 100%)",
          }}
        >
          <PixelArt imageKey={card.imageKey} />
        </div>

        {/* Scene text */}
        <div
          className="px-4 py-3 text-center border-t border-b text-[9px] leading-relaxed text-game-text"
          style={{ borderColor: "#4a4a8a", backgroundColor: "#12122a" }}
        >
          {card.scene}
        </div>

        {/* Choice display */}
        <div className="flex flex-1">
          {/* Left choice */}
          <div
            className="flex-1 flex flex-col justify-center items-center p-3 text-left cursor-pointer transition-colors hover:bg-opacity-20"
            style={{
              backgroundColor: "#0d0d1e",
              "--hover-bg": "#a0a0ff",
              borderRight: "1px solid #4a4a8a",
            } as React.CSSProperties}
            onClick={onSwipeLeft}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.backgroundColor = "rgba(160, 160, 255, 0.1)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.backgroundColor = "#0d0d1e";
            }}
          >
            <span className="text-[7px] text-game-muted mb-2 tracking-widest">← 左滑</span>
            <p className="text-[8px] leading-relaxed text-game-text">{card.leftText}</p>
            <span className="text-[10px] font-bold text-game-muted mt-2">+{card.leftDim.toUpperCase()}</span>
          </div>

          {/* Right choice */}
          <div
            className="flex-1 flex flex-col justify-center items-center p-3 text-right cursor-pointer transition-colors hover:bg-opacity-20"
            onClick={onSwipeRight}
            style={{
              backgroundColor: "#0d0d1e",
            } as React.CSSProperties}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.backgroundColor = "rgba(255, 107, 157, 0.1)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.backgroundColor = "#0d0d1e";
            }}
          >
            <span className="text-[7px] text-game-muted mb-2 tracking-widest">右滑 →</span>
            <p className="text-[8px] leading-relaxed text-game-text">{card.rightText}</p>
            <span className="text-[10px] font-bold text-game-muted mt-2">+{card.rightDim.toUpperCase()}</span>
          </div>
        </div>
      </div>

      {/* Button hints */}
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
