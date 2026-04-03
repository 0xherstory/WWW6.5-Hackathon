"use client";

import { useState } from "react";
import type { NFTItem } from "@/types/nft";

interface NFTCardProps {
  nft: NFTItem;
  isUnlocked: boolean;
  isOwned: boolean;
  isLegendary: boolean;
  onClick: () => void;
}

export default function NFTCard({
  nft,
  isUnlocked,
  isOwned,
  isLegendary,
  onClick,
}: NFTCardProps) {
  const [hovered, setHovered] = useState(false);

  const borderColor = isOwned
    ? "#FFD700"
    : isUnlocked
    ? "#4a4a8a"
    : "#2a2a4a";

  const glowColor = isOwned ? "#FFD700" : "#a0a0ff";

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={isUnlocked && !isOwned ? onClick : undefined}
      className={`w-48 h-60 border-2 flex flex-col overflow-hidden transition-all ${
        isUnlocked && !isOwned ? "cursor-pointer" : ""
      }`}
      style={{
        borderColor,
        backgroundColor: "#0d0d1e",
        opacity: isOwned ? 1 : isUnlocked ? 1 : 0.5,
        transform: hovered && isUnlocked && !isOwned ? "scale(1.05)" : "scale(1)",
        boxShadow:
          isOwned || (hovered && isUnlocked && !isOwned)
            ? `0 0 20px ${glowColor}66, 0 0 40px ${glowColor}33`
            : "3px 6px 0 rgba(0,0,0,0.5)",
      }}
    >
      {/* Header */}
      <div
        className="px-3 py-2 border-b flex items-center justify-between flex-shrink-0"
        style={{
          borderColor: borderColor,
          backgroundColor: isOwned ? `#FFD7000d` : `#12122a`,
        }}
      >
        <span className="text-[8px] tracking-widest" style={{ color: glowColor }}>
          NFT
        </span>
        {isOwned && <span className="text-[10px]">✓</span>}
      </div>

      {/* Image placeholder */}
      <div
        className="h-24 flex items-center justify-center text-[48px] border-b"
        style={{
          borderColor: borderColor,
          backgroundColor: `${glowColor}08`,
        }}
      >
        {nft.leaderName.includes("Ruth") ? "⚖️" : "👑"}
      </div>

      {/* Content */}
      <div className="flex-1 px-3 py-2 flex flex-col justify-between">
        <div>
          <p className="text-[7px] text-game-muted mb-1 uppercase tracking-widest">
            {nft.leaderName}
          </p>
          <p className="text-[9px] font-bold text-game-text leading-tight">
            {nft.title}
          </p>
        </div>

        <p className="text-[6px] text-game-muted italic leading-tight">
          {nft.description.substring(0, 40)}...
        </p>
      </div>

      {/* Footer */}
      <div
        className="px-3 py-2 border-t flex items-center justify-between flex-shrink-0"
        style={{
          borderColor: borderColor,
          backgroundColor: `${glowColor}0d`,
        }}
      >
        <span className="text-[8px] font-bold" style={{ color: glowColor }}>
          {nft.price} AVAX
        </span>
        {isOwned && (
          <span className="text-[6px] text-game-text">已拥有</span>
        )}
      </div>

      {/* Legend badge */}
      {isLegendary && isOwned && (
        <div
          className="absolute top-2 right-2 px-1.5 py-0.5 text-[6px] font-bold"
          style={{
            backgroundColor: "#FFD700",
            color: "#0d0d1e",
            borderRadius: "2px",
          }}
        >
          传奇
        </div>
      )}

      {/* Lock indicator */}
      {!isUnlocked && (
        <div
          className="absolute inset-0 flex items-center justify-center text-[32px]"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.4)" }}
        >
          🔒
        </div>
      )}
    </div>
  );
}
