"use client";

import { useState } from "react";
import type { CardOption } from "@/types/game";

interface ChoiceCardProps {
  option: CardOption;
  index: 0 | 1;
  selected: boolean;
  dimmed: boolean;
  domainColor: string;
  attrLabel: string;
  attrIcon: string;
  attrColor: string;
  onClick: () => void;
}

const FAN_CLASS = ["fan-left", "fan-right"] as const;
const TILT = ["rotate(-14deg)", "rotate(14deg)"] as const;

// Small pixel corner
function Corner({ color }: { color: string }) {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10">
      <rect x="0" y="0" width="4" height="4" fill={color} />
      <rect x="4" y="0" width="2" height="2" fill={color} opacity="0.5" />
      <rect x="0" y="4" width="2" height="2" fill={color} opacity="0.5" />
    </svg>
  );
}

export default function ChoiceCard({
  option,
  index,
  selected,
  dimmed,
  domainColor,
  attrLabel,
  attrIcon,
  attrColor,
  onClick,
}: ChoiceCardProps) {
  const [hovered, setHovered] = useState(false);

  const lift = selected ? -16 : hovered ? -8 : 0;
  const scale = selected ? 1.06 : hovered ? 1.03 : 1;
  const opacity = dimmed ? 0.35 : 1;
  const borderColor = selected ? attrColor : hovered ? domainColor : "#2a2a5a";
  const glowColor = selected ? attrColor : domainColor;

  return (
    <div
      className={`${FAN_CLASS[index]} cursor-pointer`}
      style={{
        // Fan final position is set by CSS animation keyframes
        // Override with interaction transforms after animation finishes
      }}
    >
      <div
        onClick={onClick}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="w-36 h-52 border-2 flex flex-col overflow-hidden"
        style={{
          borderColor,
          backgroundColor: "#0d0d1e",
          transform: `${TILT[index]} translateY(${lift}px) scale(${scale})`,
          transition: "transform 0.2s ease, border-color 0.2s, box-shadow 0.2s, opacity 0.3s",
          opacity,
          boxShadow: selected
            ? `0 0 20px ${glowColor}88, 0 0 40px ${glowColor}44, 3px 6px 0 rgba(0,0,0,0.7)`
            : hovered
            ? `0 0 12px ${glowColor}44, 3px 6px 0 rgba(0,0,0,0.7)`
            : "3px 6px 0 rgba(0,0,0,0.7)",
        }}
      >
        {/* Card header strip */}
        <div
          className="px-2 py-1.5 flex items-center justify-between flex-shrink-0"
          style={{
            backgroundColor: `${domainColor}18`,
            borderBottom: `1px solid ${domainColor}33`,
          }}
        >
          <span className="text-[6px] tracking-widest" style={{ color: `${domainColor}88` }}>
            选择
          </span>
          <span className="text-[8px]" style={{ color: attrColor }}>
            {attrIcon}
          </span>
        </div>

        {/* Corner decorations */}
        <div className="absolute top-6 left-1.5">
          <Corner color={borderColor} />
        </div>
        <div className="absolute top-6 right-1.5 rotate-90">
          <Corner color={borderColor} />
        </div>

        {/* Option text */}
        <div className="flex-1 px-3 py-3 flex items-center">
          <p
            className="text-[7px] leading-loose text-game-text whitespace-pre-line"
            style={{ color: selected ? "#ffffff" : "#c0c0e0" }}
          >
            {option.text}
          </p>
        </div>

        {/* Attribute gain footer */}
        <div
          className="px-2 py-2 flex items-center justify-between flex-shrink-0 border-t"
          style={{ borderColor: `${attrColor}33`, backgroundColor: `${attrColor}0d` }}
        >
          <span className="text-[6px]" style={{ color: attrColor }}>
            {attrLabel}
          </span>
          <span
            className="text-[10px] font-bold"
            style={{
              color: attrColor,
              textShadow: selected ? `0 0 8px ${attrColor}` : "none",
            }}
          >
            +{option.value}
          </span>
        </div>

        {/* Selected glow overlay */}
        {selected && (
          <div
            className="absolute inset-0 pointer-events-none animate-pulse"
            style={{
              background: `radial-gradient(ellipse at center, ${attrColor}18 0%, transparent 70%)`,
            }}
          />
        )}
      </div>
    </div>
  );
}
