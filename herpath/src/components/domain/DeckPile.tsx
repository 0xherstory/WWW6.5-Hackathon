"use client";

interface DeckPileProps {
  remaining: number;
  total: number;
  isDrawing?: boolean;
}

export default function DeckPile({ remaining, total, isDrawing = false }: DeckPileProps) {
  return (
    <div className="flex flex-col items-center gap-3">
      {/* Deck visualization (larger) */}
      <div className="relative" style={{ width: "80px", height: "100px" }}>
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={`absolute border-2 bg-game-dialog ${isDrawing ? "animate-pulse" : ""}`}
            style={{
              width: "72px",
              height: "96px",
              borderColor: "#4a4a8a",
              left: `${i * 3}px`,
              top: `${i * 3}px`,
              boxShadow: isDrawing
                ? `0 0 12px rgba(160, 160, 255, 0.5), 2px 3px 0 rgba(0,0,0,0.6)`
                : "2px 3px 0 rgba(0,0,0,0.6)",
              transition: "box-shadow 0.3s",
            }}
          />
        ))}
      </div>

      {/* Card count */}
      <div className="text-center">
        <p className="text-[8px] text-game-muted tracking-widest mb-1">
          牌堆
        </p>
        <p className="text-[10px] font-bold" style={{ color: "#a0a0ff" }}>
          {remaining}
        </p>
        <p className="text-[6px] text-game-muted">
          / {total}
        </p>
      </div>
    </div>
  );
}
