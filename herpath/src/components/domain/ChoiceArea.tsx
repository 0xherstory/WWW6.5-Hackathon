"use client";

import { useState } from "react";
import type { Card, CardOption, Domain } from "@/types/game";
import Dealer from "./Dealer";
import ChoiceCard from "./ChoiceCard";
import { getSBTByAttr } from "@/data/cards";

const ATTR_META: Record<string, { label: string; icon: string }> = {
  creativity: { label: "创作力", icon: "✦" },
  resilience:  { label: "坚韧",   icon: "⊘" },
  curiosity:   { label: "求知欲", icon: "◎" },
  rigor:       { label: "严谨",   icon: "⊕" },
  justice:     { label: "正义感", icon: "⚖" },
  courage:     { label: "勇气",   icon: "⚡" },
};

interface ChoiceAreaProps {
  card: Card;
  domain: Domain;
  domainColor: string;
  onChoose: (option: CardOption) => void;
}

export default function ChoiceArea({ card, domain: _domain, domainColor, onChoose }: ChoiceAreaProps) {
  const [selectedIdx, setSelectedIdx] = useState<0 | 1 | null>(null);
  const [confirmed, setConfirmed] = useState(false);

  function handleSelect(idx: 0 | 1) {
    if (confirmed) return;
    setSelectedIdx(idx);
  }

  function handleConfirm() {
    if (selectedIdx === null || confirmed) return;
    setConfirmed(true);
    setTimeout(() => {
      onChoose(card.options[selectedIdx]);
    }, 350);
  }

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      {/* Dealer at top */}
      <Dealer color={domainColor} dealing={selectedIdx !== null} />

      {/* Scene recap */}
      <p className="text-[7px] text-game-muted tracking-widest max-w-xs text-center px-4">
        做出你的抉择
      </p>

      {/* Fan of choice cards */}
      <div
        className="relative flex items-center justify-center"
        style={{ height: "220px", width: "100%" }}
      >
        {card.options.map((opt, rawIdx) => {
          const idx = rawIdx as 0 | 1;
          const sbtDef = getSBTByAttr(opt.attribute);
          const am = ATTR_META[opt.attribute];
          return (
            <div
              key={idx}
              className="absolute"
              style={{ top: "20px" }}
            >
              <ChoiceCard
                option={opt}
                index={idx}
                selected={selectedIdx === idx}
                dimmed={selectedIdx !== null && selectedIdx !== idx}
                domainColor={domainColor}
                attrLabel={am.label}
                attrIcon={am.icon}
                attrColor={sbtDef?.color ?? domainColor}
                onClick={() => handleSelect(idx)}
              />
            </div>
          );
        })}
      </div>

      {/* Confirm button */}
      <button
        onClick={handleConfirm}
        disabled={selectedIdx === null || confirmed}
        className="pixel-btn px-10 py-3 text-[8px] disabled:opacity-25 disabled:cursor-not-allowed transition-all"
        style={{
          borderColor: selectedIdx !== null ? domainColor : "#3a3a6a",
          backgroundColor: "#12122a",
          color: domainColor,
          boxShadow: selectedIdx !== null ? `0 0 14px ${domainColor}33` : "none",
        }}
      >
        {confirmed ? "✦ 命运已定" : "确定此路"}
      </button>
    </div>
  );
}
