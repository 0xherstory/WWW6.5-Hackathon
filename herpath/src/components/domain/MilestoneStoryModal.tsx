"use client";

import { useState } from "react";
import type { MilestoneLevel } from "@/types/milestone";

interface MilestoneStoryModalProps {
  milestone: MilestoneLevel;
  onClose: () => void;
  onMint: () => void;
}

export default function MilestoneStoryModal({
  milestone,
  onClose,
  onMint,
}: MilestoneStoryModalProps) {
  const [minting, setMinting] = useState(false);

  function handleMint() {
    setMinting(true);
    onMint();
    // Simulate minting animation
    setTimeout(() => {
      setMinting(false);
      onClose();
    }, 800);
  }

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.7)" }}
      onClick={onClose}
    >
      {/* Modal content */}
      <div
        className="w-full max-w-md max-h-[80vh] overflow-y-auto border-2 flex flex-col"
        style={{
          borderColor: "#4a4a8a",
          backgroundColor: "#0d0d1e",
          boxShadow: "0 0 30px rgba(75, 74, 138, 0.5), 3px 6px 0 rgba(0,0,0,0.7)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="px-4 py-3 border-b flex items-center justify-between flex-shrink-0"
          style={{
            borderColor: "#4a4a8a",
            backgroundColor: "#12122a",
          }}
        >
          <h2 className="text-[10px] tracking-widest text-game-text">
            ✨ 里程碑解锁
          </h2>
          <button
            onClick={onClose}
            className="text-[12px] text-game-muted hover:text-game-text transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 px-4 py-4 flex flex-col gap-4">
          {/* SBT Badge */}
          <div
            className="px-3 py-3 border flex flex-col items-center gap-2"
            style={{
              borderColor: "#4a4a8a",
              backgroundColor: "#12122a22",
            }}
          >
            <div className="text-[28px]">{milestone.sbtIcon}</div>
            <div className="text-center">
              <p className="text-[9px] text-game-muted">勋章名称</p>
              <p className="text-[10px] font-bold text-game-text mt-1">
                {milestone.sbtName}
              </p>
            </div>
          </div>

          {/* Situation (narrative) */}
          <div>
            <p className="text-[7px] text-game-muted uppercase tracking-widest mb-2">
              真实经历
            </p>
            <div
              className="px-3 py-2 border text-[7px] leading-relaxed text-game-text whitespace-pre-wrap"
              style={{
                borderColor: "#4a4a8a",
                backgroundColor: "#0d0d1e",
              }}
            >
              {milestone.situation}
            </div>
          </div>

          {/* Flavor text */}
          <div>
            <p className="text-[7px] text-game-muted uppercase tracking-widest mb-2">
              勋章寓意
            </p>
            <div
              className="px-3 py-2 border text-[7px] italic leading-relaxed text-game-text whitespace-pre-wrap"
              style={{
                borderColor: "#50FA7B66",
                backgroundColor: "#50FA7B0d",
              }}
            >
              {milestone.flavor}
            </div>
          </div>
        </div>

        {/* Footer buttons */}
        <div
          className="px-4 py-3 border-t flex gap-3 flex-shrink-0"
          style={{
            borderColor: "#4a4a8a",
            backgroundColor: "#12122a",
          }}
        >
          <button
            onClick={onClose}
            className="flex-1 pixel-btn py-2 text-[8px]"
            style={{
              borderColor: "#4a4a8a",
              backgroundColor: "#12122a",
              color: "#a0a0ff",
            }}
          >
            稍后再来
          </button>
          <button
            onClick={handleMint}
            disabled={minting}
            className="flex-1 pixel-btn py-2 text-[8px] disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              borderColor: minting ? "#50FA7B66" : "#50FA7B",
              backgroundColor: minting ? "#50FA7B22" : "#0d0d1e",
              color: "#50FA7B",
              transition: "all 0.3s",
            }}
          >
            {minting ? "✦ 铸造中..." : "✦ 铸造勋章"}
          </button>
        </div>
      </div>
    </div>
  );
}
