"use client";

import { useState, useCallback } from "react";
import type { Domain, CardOption, Attribute } from "@/types/game";
import { DOMAIN_META } from "@/data/questions";
import { getDomainSBTs, getSBTByAttr, drawCard } from "@/data/cards";
import { useGameState } from "@/hooks/useGameState";
import AttributeBar from "./AttributeBar";
import BadgePanel from "./BadgePanel";
import ScenarioCard from "./ScenarioCard";
import ChoiceArea from "./ChoiceArea";
import Dealer from "./Dealer";
import HighlightModal from "./HighlightModal";
import MilestoneModal from "./MilestoneModal";
import type { Card, SBTDefinition } from "@/types/game";

interface DomainScreenProps {
  domain: Domain;
  onMilestoneEnter: () => void;
}

const DOMAIN_COLOR: Record<Domain, string> = {
  art: "#FF6B9D",
  science: "#00D4FF",
  law: "#FFD700",
};

const ATTR_META: Record<string, { label: string; icon: string }> = {
  creativity: { label: "创作力", icon: "✦" },
  resilience: { label: "坚韧",   icon: "⊘" },
  curiosity:  { label: "求知欲", icon: "◎" },
  rigor:      { label: "严谨",   icon: "⊕" },
  justice:    { label: "正义感", icon: "⚖" },
  courage:    { label: "勇气",   icon: "⚡" },
};

type ScreenState = "idle" | "card" | "choosing" | "highlight" | "milestone";

interface GainFlash {
  attribute: Attribute;
  value: number;
  key: number; // force re-mount for repeated same-attr gains
}

export default function DomainScreen({ domain, onMilestoneEnter }: DomainScreenProps) {
  const meta = DOMAIN_META[domain];
  const color = DOMAIN_COLOR[domain];
  const domainSBTs = getDomainSBTs(domain);

  const { progress, applyAttribute, mintSBT, recordDrawn } = useGameState(domain);
  const [screen, setScreen] = useState<ScreenState>("idle");
  const [currentCard, setCurrentCard] = useState<Card | null>(null);
  const [pendingSBT, setPendingSBT] = useState<SBTDefinition | null>(null);
  const [gainFlash, setGainFlash] = useState<GainFlash | null>(null);

  const attrPairs: Attribute[] =
    domain === "art"
      ? ["creativity", "resilience"]
      : domain === "science"
      ? ["curiosity", "rigor"]
      : ["justice", "courage"];

  function handleDraw() {
    const card = drawCard(domain, progress.drawnCardIds);
    if (!card) return;
    setCurrentCard(card);
    recordDrawn(card.id);
    setScreen("card");
  }

  function handleCardFlipped() {
    setScreen("choosing");
  }

  const handleChoose = useCallback(
    (option: CardOption) => {
      // Show floating gain immediately
      setGainFlash({ attribute: option.attribute, value: option.value, key: Date.now() });

      const triggered = applyAttribute(option.attribute, option.value);

      // Brief pause just for the gain float to register before transitioning
      setTimeout(() => {
        if (triggered) {
          const sbtDef = getSBTByAttr(option.attribute);
          if (sbtDef && !progress.mintedSBTs.includes(sbtDef.id)) {
            setPendingSBT(sbtDef);
            setScreen("highlight");
            return;
          }
        }
        setScreen("idle");
      }, 400);
    },
    [applyAttribute, progress.mintedSBTs]
  );

  function handleMinted() {
    if (!pendingSBT) return;
    mintSBT(pendingSBT.id, pendingSBT.attribute as Attribute);
    const newMinted = [...progress.mintedSBTs, pendingSBT.id];
    const allOwned = domainSBTs.every((s) => newMinted.includes(s.id));
    setPendingSBT(null);
    setScreen(allOwned ? "milestone" : "idle");
  }

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: `radial-gradient(ellipse at top, ${color}08 0%, #0a0a18 60%)` }}
    >
      {/* ── Header ── */}
      <div
        className="border-b-2 px-4 py-3 flex items-center justify-between"
        style={{ borderColor: `${color}33`, backgroundColor: "#0d0d1e" }}
      >
        <div className="flex items-center gap-2">
          <span className="text-lg" style={{ filter: `drop-shadow(0 0 6px ${color})` }}>
            {meta.icon}
          </span>
          <span className="text-[10px] tracking-widest" style={{ color }}>
            {meta.label}
          </span>
        </div>
        <span className="text-[7px] text-game-muted tracking-widest">
          {meta.tagline}
        </span>
      </div>

      {/* ── Main Layout ── */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: card area */}
        <div className="flex-1 flex flex-col justify-center p-5 gap-5">

          {/* Attribute bars + floating gain indicators */}
          <div className="relative flex flex-col gap-3">
            {attrPairs.map((attr, idx) => {
              const am = ATTR_META[attr];
              const sbtDef = getSBTByAttr(attr);
              const isGaining = gainFlash?.attribute === attr;
              return (
                <div key={attr} className="relative">
                  <AttributeBar
                    label={am.label}
                    value={progress.attributes[attr] ?? 0}
                    color={sbtDef?.color ?? color}
                    icon={am.icon}
                  />
                  {/* Floating +N indicator */}
                  {isGaining && gainFlash && (
                    <span
                      key={gainFlash.key}
                      className="gain-float absolute right-0 text-[11px] font-bold"
                      style={{
                        top: idx === 0 ? "-2px" : "-2px",
                        color: sbtDef?.color ?? color,
                        textShadow: `0 0 8px ${sbtDef?.color ?? color}`,
                      }}
                    >
                      +{gainFlash.value}
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Card area */}
          <div className="flex-1 flex flex-col justify-center items-center min-h-[340px]">

            {/* IDLE */}
            {screen === "idle" && (
              <div className="flex flex-col items-center gap-4 animate-fadeIn">
                <Dealer color={color} dealing={false} />
                {progress.milestoneUnlocked ? (
                  <div
                    className="text-center text-[8px] leading-loose border-2 px-6 py-4 whitespace-pre-line"
                    style={{ borderColor: color, color }}
                  >
                    {`✦ 里程碑已解锁\n前往追寻领袖足迹`}
                  </div>
                ) : (
                  <>
                    <p className="text-[7px] text-game-muted tracking-widest">
                      积累属性值，铸造属于你的徽章
                    </p>
                    <button
                      onClick={handleDraw}
                      className="pixel-btn px-10 py-4 text-[10px]"
                      style={{
                        borderColor: color,
                        backgroundColor: "#12122a",
                        color,
                        boxShadow: `0 0 20px ${color}22`,
                      }}
                    >
                      ✦ 抽取命运卡
                    </button>
                  </>
                )}
              </div>
            )}

            {/* CARD */}
            {screen === "card" && currentCard && (
              <div className="flex flex-col items-center gap-4">
                <Dealer color={color} dealing={false} />
                <ScenarioCard
                  card={currentCard}
                  domainColor={color}
                  domainIcon={meta.icon}
                  onFlipped={handleCardFlipped}
                />
              </div>
            )}

            {/* CHOOSING */}
            {screen === "choosing" && currentCard && (
              <ChoiceArea
                card={currentCard}
                domain={domain}
                domainColor={color}
                onChoose={handleChoose}
              />
            )}
          </div>
        </div>

        {/* Right: badge panel */}
        <div
          className="w-36 border-l-2 p-3 flex flex-col justify-start pt-6"
          style={{ borderColor: `${color}22`, backgroundColor: "#0b0b1a" }}
        >
          <BadgePanel sbts={domainSBTs} minted={progress.mintedSBTs} />
        </div>
      </div>

      {/* ── Modals ── */}
      {screen === "highlight" && pendingSBT && (
        <HighlightModal sbt={pendingSBT} onMint={handleMinted} />
      )}
      {screen === "milestone" && (
        <MilestoneModal domain={domain} onContinue={onMilestoneEnter} />
      )}
    </div>
  );
}
