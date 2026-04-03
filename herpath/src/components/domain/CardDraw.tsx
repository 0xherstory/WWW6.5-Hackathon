"use client";

import { useState } from "react";
import type { Card, CardOption } from "@/types/game";
import PixelDialog from "@/components/ui/PixelDialog";

interface CardDrawProps {
  card: Card;
  domainColor: string;
  onChoose: (option: CardOption) => void;
}

export default function CardDraw({ card, domainColor, onChoose }: CardDrawProps) {
  const [selected, setSelected] = useState<number | null>(null);
  const [confirmed, setConfirmed] = useState(false);

  function handleSelect(idx: number) {
    if (confirmed) return;
    setSelected(idx);
  }

  function handleConfirm() {
    if (selected === null || confirmed) return;
    setConfirmed(true);
    setTimeout(() => {
      onChoose(card.options[selected]);
    }, 400);
  }

  return (
    <div className="flex flex-col gap-4 animate-pixelIn">
      {/* Card header */}
      <div
        className="text-center text-[7px] tracking-widest pb-2 border-b-2"
        style={{ color: `${domainColor}99`, borderColor: `${domainColor}33` }}
      >
        {card.scene}
      </div>

      {/* Scenario */}
      <PixelDialog
        borderColor={`${domainColor}66`}
        className="text-[9px] leading-loose text-game-text whitespace-pre-line"
      >
        {card.text}
      </PixelDialog>

      {/* Options */}
      <div className="flex flex-col gap-3">
        {card.options.map((opt, idx) => {
          const isSelected = selected === idx;
          return (
            <button
              key={idx}
              onClick={() => handleSelect(idx)}
              className="pixel-btn text-left px-4 py-3 text-[8px] leading-loose whitespace-pre-line transition-all"
              style={{
                borderColor: isSelected ? domainColor : "#3a3a6a",
                backgroundColor: isSelected ? `${domainColor}18` : "#12122a",
                color: isSelected ? domainColor : "#c0c0e0",
                boxShadow: isSelected ? `0 0 10px ${domainColor}33` : undefined,
              }}
            >
              <span className="mr-2">{isSelected ? "▶" : "·"}</span>
              {opt.text}
            </button>
          );
        })}
      </div>

      {/* Confirm */}
      <button
        onClick={handleConfirm}
        disabled={selected === null || confirmed}
        className="pixel-btn py-3 text-[8px] w-full disabled:opacity-30 disabled:cursor-not-allowed"
        style={{
          borderColor: selected !== null ? domainColor : "#3a3a6a",
          backgroundColor: "#12122a",
          color: domainColor,
        }}
      >
        {confirmed ? "✦ 选择已定" : "确定选择"}
      </button>
    </div>
  );
}
