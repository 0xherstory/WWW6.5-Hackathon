"use client";

import { useState } from "react";
import type { Card } from "@/types/game";

interface ScenarioCardProps {
  card: Card;
  domainColor: string;
  domainIcon: string;
  onFlipped: () => void;
}

// Pixel corner decoration
function PixelCorner({ color }: { color: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="0" y="0" width="4" height="4" fill={color} />
      <rect x="4" y="0" width="4" height="4" fill={color} opacity="0.5" />
      <rect x="0" y="4" width="4" height="4" fill={color} opacity="0.5" />
    </svg>
  );
}

export default function ScenarioCard({
  card,
  domainColor,
  domainIcon,
  onFlipped,
}: ScenarioCardProps) {
  const [flipped, setFlipped] = useState(false);
  const [clicked, setClicked] = useState(false);

  function handleClick() {
    if (flipped || clicked) return;
    setClicked(true);
    setFlipped(true);
    setTimeout(onFlipped, 700);
  }

  return (
    // Card scene wrapper — defines perspective
    <div className="card-scene w-56 h-80 mx-auto cursor-pointer card-deal">
      <div
        className={`card-inner w-full h-full ${flipped ? "flipped" : ""}`}
        onClick={handleClick}
      >
        {/* ── CARD BACK ── */}
        <div
          className="card-face card-face-back w-full h-full border-2 flex flex-col items-center justify-between p-4"
          style={{
            borderColor: domainColor,
            backgroundColor: "#0d0d1e",
            boxShadow: flipped
              ? "none"
              : `0 0 24px ${domainColor}44, 4px 6px 0 rgba(0,0,0,0.8)`,
          }}
        >
          {/* Top corners */}
          <div className="w-full flex justify-between">
            <PixelCorner color={domainColor} />
            <div className="mirror-x">
              <PixelCorner color={domainColor} />
            </div>
          </div>

          {/* Center */}
          <div className="flex flex-col items-center gap-4">
            {/* Decorative ring */}
            <div
              className="w-20 h-20 border-2 flex items-center justify-center"
              style={{
                borderColor: `${domainColor}66`,
                boxShadow: `0 0 20px ${domainColor}33`,
              }}
            >
              <div
                className="w-14 h-14 border-2 flex items-center justify-center text-3xl"
                style={{
                  borderColor: domainColor,
                  boxShadow: `0 0 12px ${domainColor}88`,
                }}
              >
                <span style={{ filter: `drop-shadow(0 0 6px ${domainColor})` }}>
                  {domainIcon}
                </span>
              </div>
            </div>

            <div className="flex flex-col items-center gap-1">
              <p
                className="text-[9px] tracking-[0.3em]"
                style={{ color: domainColor }}
              >
                HERPATH
              </p>
              <p className="text-[6px] text-game-muted tracking-widest">
                命运卡
              </p>
            </div>
          </div>

          {/* Dot pattern */}
          <div className="flex gap-2">
            {[0, 1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="w-1.5 h-1.5"
                style={{
                  backgroundColor:
                    i === 2 ? domainColor : `${domainColor}44`,
                }}
              />
            ))}
          </div>

          {/* Bottom corners */}
          <div className="w-full flex justify-between rotate-180">
            <PixelCorner color={domainColor} />
            <PixelCorner color={domainColor} />
          </div>

          {/* Hint */}
          {!flipped && (
            <div
              className="absolute bottom-6 left-0 right-0 text-center text-[6px] tracking-widest animate-pulse"
              style={{ color: `${domainColor}88` }}
            >
              点击揭晓
            </div>
          )}
        </div>

        {/* ── CARD FRONT ── */}
        <div
          className="card-face card-face-front w-full h-full border-2 flex flex-col overflow-hidden"
          style={{
            borderColor: domainColor,
            backgroundColor: "#0d0d1e",
            boxShadow: `0 0 24px ${domainColor}44, 4px 6px 0 rgba(0,0,0,0.8)`,
          }}
        >
          {/* Header strip */}
          <div
            className="px-3 py-2 flex items-center gap-2 flex-shrink-0"
            style={{ backgroundColor: `${domainColor}22`, borderBottom: `2px solid ${domainColor}55` }}
          >
            <span className="text-sm" style={{ filter: `drop-shadow(0 0 4px ${domainColor})` }}>
              {domainIcon}
            </span>
            <span className="text-[7px] tracking-widest" style={{ color: domainColor }}>
              命运卡
            </span>
            <span className="ml-auto text-[6px] text-game-muted">#{card.id}</span>
          </div>

          {/* Scene label */}
          <div
            className="px-3 pt-3 pb-1 text-[6px] tracking-widest"
            style={{ color: `${domainColor}88` }}
          >
            {card.scene}
          </div>

          {/* Divider */}
          <div
            className="mx-3 my-1 h-px"
            style={{ backgroundColor: `${domainColor}33` }}
          />

          {/* Scenario text */}
          <div className="flex-1 px-3 py-2 flex items-center">
            <p
              className="text-[8px] leading-loose text-game-text whitespace-pre-line"
            >
              {card.text}
            </p>
          </div>

          {/* Bottom corner decorations */}
          <div
            className="px-3 pb-3 flex justify-between items-end"
            style={{ borderTop: `1px solid ${domainColor}22` }}
          >
            <div className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-1.5 h-1.5"
                  style={{ backgroundColor: `${domainColor}${i === 0 ? "cc" : "44"}` }}
                />
              ))}
            </div>
            <p className="text-[6px] text-game-muted tracking-widest">
              做出你的抉择
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
