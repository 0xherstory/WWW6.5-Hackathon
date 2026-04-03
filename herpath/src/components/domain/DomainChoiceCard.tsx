"use client";

import { useState } from "react";
import type { DomainCard } from "@/types/domain";
import { ATTRIBUTE_META } from "@/data/rbg-cards";

interface DomainChoiceCardProps {
  card: DomainCard;
  index: 0 | 1; // left or right
  selected: boolean;
  dimmed: boolean;
  drawing?: boolean;
  onSelect: () => void;
}

export default function DomainChoiceCard({
  card,
  index,
  selected,
  dimmed,
  drawing = false,
  onSelect,
}: DomainChoiceCardProps) {
  const [hovered, setHovered] = useState(false);
  const leftMeta = ATTRIBUTE_META[card.leftAttr];
  const rightMeta = ATTRIBUTE_META[card.rightAttr];

  // Choose which attribute to highlight based on index
  const displayMeta = index === 0 ? leftMeta : rightMeta;
  const displayText = index === 0 ? card.leftText : card.rightText;

  const lift = selected ? -16 : hovered ? -8 : 0;
  const scale = selected ? 1.06 : hovered ? 1.03 : 1;
  const opacity = dimmed ? 0.35 : 1;
  const borderColor = selected ? displayMeta.color : hovered ? displayMeta.color : "#2a2a5a";
  const glowColor = displayMeta.color;

  // 平铺动画：从牌堆飞入
  const animClass = drawing ? "animate-cardDeal" : "animate-fadeIn";

  return (
    <div
      onClick={onSelect}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`${animClass} cursor-pointer w-40 h-56 border-2 flex flex-col overflow-hidden`}
      style={{
        borderColor,
        backgroundColor: "#0d0d1e",
        transform: `translateY(${lift}px) scale(${scale})`,
        transition: "transform 0.2s ease, border-color 0.2s, box-shadow 0.2s, opacity 0.3s",
        opacity,
        boxShadow: selected
          ? `0 0 20px ${glowColor}88, 0 0 40px ${glowColor}44, 3px 6px 0 rgba(0,0,0,0.7)`
          : hovered
          ? `0 0 12px ${glowColor}44, 3px 6px 0 rgba(0,0,0,0.7)`
          : "3px 6px 0 rgba(0,0,0,0.7)",
      }}
    >
      {/* Card header */}
      <div
        className="px-2 py-1.5 flex items-center justify-between flex-shrink-0 text-[6px]"
        style={{
          backgroundColor: `${glowColor}18`,
          borderBottom: `1px solid ${glowColor}33`,
          color: glowColor,
        }}
      >
        <span>{displayMeta.icon}</span>
        <span>{displayMeta.name}</span>
      </div>

      {/* Situation (small) */}
      <div className="px-2 py-1.5 text-[7px] text-game-muted border-b" style={{ borderColor: `${glowColor}22` }}>
        {card.situation.substring(0, 20)}...
      </div>

      {/* Decision text */}
      <div className="flex-1 px-2 py-2 flex items-center">
        <p className="text-[7px] leading-tight text-game-text">{displayText}</p>
      </div>

      {/* Attribute gain footer */}
      <div
        className="px-2 py-1.5 flex items-center justify-between flex-shrink-0 text-[7px] border-t"
        style={{
          borderColor: `${glowColor}33`,
          backgroundColor: `${glowColor}0d`,
          color: glowColor,
        }}
      >
        <span>{displayMeta.icon}</span>
        <span className="font-bold">+1</span>
      </div>

      {/* Selected glow */}
      {selected && (
        <div
          className="absolute inset-0 pointer-events-none animate-pulse"
          style={{
            background: `radial-gradient(ellipse at center, ${glowColor}18 0%, transparent 70%)`,
          }}
        />
      )}
    </div>
  );
}
