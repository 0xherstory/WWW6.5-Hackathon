"use client";

import { useState } from "react";
import type { SBTDefinition } from "@/types/game";

interface HighlightModalProps {
  sbt: SBTDefinition;
  onMint: () => void;
}

export default function HighlightModal({ sbt, onMint }: HighlightModalProps) {
  const [minting, setMinting] = useState(false);
  const [done, setDone] = useState(false);

  async function handleMint() {
    setMinting(true);
    // TODO M3: call smart contract mintSBT()
    await new Promise((r) => setTimeout(r, 1200));
    setDone(true);
    setTimeout(onMint, 800);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.85)", backdropFilter: "blur(4px)" }}
    >
      <div
        className="w-full max-w-md flex flex-col gap-6 p-6 border-2 animate-pixelIn"
        style={{
          borderColor: sbt.color,
          backgroundColor: "#0d0d1e",
          boxShadow: `0 0 40px ${sbt.color}44, 4px 4px 0 rgba(0,0,0,0.8)`,
        }}
      >
        {/* Icon */}
        <div
          className="text-5xl text-center"
          style={{ filter: `drop-shadow(0 0 16px ${sbt.color})` }}
        >
          {sbt.icon}
        </div>

        {/* Title */}
        <div className="text-center">
          <p className="text-[7px] tracking-widest mb-2" style={{ color: `${sbt.color}88` }}>
            ── 高光时刻 ──
          </p>
          <h3 className="text-[13px]" style={{ color: sbt.color }}>
            {sbt.highlightTitle}
          </h3>
        </div>

        {/* Story */}
        <p
          className="text-[8px] leading-loose whitespace-pre-line text-game-text border-t border-b py-4"
          style={{ borderColor: `${sbt.color}33` }}
        >
          {sbt.highlightStory}
        </p>

        {/* Mint button */}
        {!done ? (
          <button
            onClick={handleMint}
            disabled={minting}
            className="pixel-btn py-3 text-[9px] w-full"
            style={{
              borderColor: sbt.color,
              backgroundColor: minting ? `${sbt.color}22` : "#12122a",
              color: sbt.color,
            }}
          >
            {minting ? (
              <span className="animate-pulse">正在铸造中…</span>
            ) : (
              `✦ 铸造「${sbt.name}」`
            )}
          </button>
        ) : (
          <div
            className="text-center text-[9px] py-3 border-2 animate-fadeIn"
            style={{ borderColor: sbt.color, color: sbt.color }}
          >
            ✦ 徽章已铸造
          </div>
        )}
      </div>
    </div>
  );
}
