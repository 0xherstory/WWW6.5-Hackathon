"use client";

import type { SBTDefinition, SBTId } from "@/types/game";

interface BadgePanelProps {
  sbts: SBTDefinition[];
  minted: SBTId[];
}

export default function BadgePanel({ sbts, minted }: BadgePanelProps) {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-[7px] tracking-widest text-game-muted text-center">
        ── 徽章 ──
      </p>
      {sbts.map((sbt) => {
        const owned = minted.includes(sbt.id);
        return (
          <div
            key={sbt.id}
            className="flex items-center gap-3 px-3 py-2 border-2 transition-all duration-500"
            style={{
              borderColor: owned ? sbt.color : "#2a2a4a",
              backgroundColor: owned ? `${sbt.color}15` : "transparent",
              boxShadow: owned ? `0 0 12px ${sbt.color}33` : "none",
            }}
          >
            <span
              className="text-lg w-6 text-center"
              style={{
                color: owned ? sbt.color : "#2a2a4a",
                filter: owned ? `drop-shadow(0 0 4px ${sbt.color})` : "none",
              }}
            >
              {sbt.icon}
            </span>
            <div className="flex flex-col gap-0.5">
              <span
                className="text-[8px]"
                style={{ color: owned ? sbt.color : "#2a2a4a" }}
              >
                {sbt.name}
              </span>
              {owned && (
                <span className="text-[6px] text-game-muted tracking-widest">
                  已铸造
                </span>
              )}
              {!owned && (
                <span className="text-[6px] tracking-widest" style={{ color: "#2a2a4a" }}>
                  未解锁
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
