"use client";

import { useState, useMemo } from "react";
import type { Dimension, Leader } from "@/types/flashback";
import { drawMemoryCards, determineLeader } from "@/data/flashback";
import MemoryCardDisplay from "./MemoryCardDisplay";
import LeaderReveal from "./LeaderReveal";

interface FlashbackScreenProps {
  onComplete: (leader: Leader) => void;
}

type ScreenState = "playing" | "reveal";

export default function FlashbackScreen({ onComplete }: FlashbackScreenProps) {
  const [screen, setScreen] = useState<ScreenState>("playing");
  const [cardIndex, setCardIndex] = useState(0);
  const [scores, setScores] = useState<Record<Dimension, number>>({
    art: 0,
    sci: 0,
    law: 0,
  });
  const [leader, setLeader] = useState<Leader | null>(null);

  // Draw 6 cards on mount
  const cards = useMemo(() => drawMemoryCards(6), []);

  function handleSwipe(dim: Dimension) {
    // Update scores
    setScores((prev) => ({
      ...prev,
      [dim]: prev[dim] + 1,
    }));

    // Move to next card or finish
    if (cardIndex < 5) {
      setCardIndex(cardIndex + 1);
    } else {
      // Quiz complete, determine leader
      const newScores = { ...scores, [dim]: scores[dim] + 1 };
      const determinedLeader = determineLeader(newScores);
      setLeader(determinedLeader);
      setScreen("reveal");
    }
  }

  if (screen === "reveal" && leader) {
    return (
      <LeaderReveal
        leader={leader}
        onContinue={() => onComplete(leader)}
      />
    );
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-4 gap-6"
      style={{
        background: "radial-gradient(ellipse at top, rgba(160, 160, 255, 0.05) 0%, #0a0a18 60%)",
      }}
    >
      {/* Header */}
      <div className="text-center">
        <h1 className="text-[14px] tracking-widest text-game-text mb-2">
          童年闪回
        </h1>
        <p className="text-[7px] text-game-muted tracking-widest">
          直觉回应，命运引路
        </p>
      </div>

      {/* Current card */}
      {cards[cardIndex] && (
        <MemoryCardDisplay
          card={cards[cardIndex]}
          progress={cardIndex + 1}
          onSwipeLeft={() => handleSwipe(cards[cardIndex].leftDim)}
          onSwipeRight={() => handleSwipe(cards[cardIndex].rightDim)}
        />
      )}

      {/* Score display (subtle) */}
      <div className="flex gap-8 text-[8px] text-game-muted tracking-widest">
        <div>
          <span>ART</span>
          <span style={{ color: "#FF6B9D" }} className="ml-2">{scores.art}</span>
        </div>
        <div>
          <span>SCI</span>
          <span style={{ color: "#00D4FF" }} className="ml-2">{scores.sci}</span>
        </div>
        <div>
          <span>LAW</span>
          <span style={{ color: "#FFD700" }} className="ml-2">{scores.law}</span>
        </div>
      </div>
    </div>
  );
}
