"use client";

import { useState } from "react";
import type { Leader } from "@/types/flashback";
import type { DomainCard } from "@/types/domain";
import type { MilestoneLevel } from "@/types/milestone";
import { useDomainState } from "@/hooks/useDomainState";
import { RBG_CARDS, ATTRIBUTE_META } from "@/data/rbg-cards";
import GameLayout from "@/components/layout/GameLayout";
import StatusPanel from "@/components/layout/StatusPanel";
import Dealer from "./Dealer";
import DomainChoiceCard from "./DomainChoiceCard";
import DeckPile from "./DeckPile";
import MilestoneStoryModal from "./MilestoneStoryModal";
import ProfileModal from "@/components/profile/ProfileModal";
import CharityGlobal from "@/components/charity/CharityGlobal";

interface DomainGameScreenProps {
  leader: Leader;
  onGoToNFTShop?: () => void;
  onBackHome?: () => void;
}

function drawTwoCards(): [DomainCard, DomainCard] {
  const shuffled = [...RBG_CARDS].sort(() => Math.random() - 0.5);
  return [shuffled[0], shuffled[1]];
}

export default function DomainGameScreen({
  leader,
  onGoToNFTShop,
  onBackHome,
}: DomainGameScreenProps) {
  const { state, addAttribute, recordDrawn, mintSBT } = useDomainState(leader);
  const [cards, setCards] = useState<[DomainCard, DomainCard]>(() => drawTwoCards());
  const [selectedIdx, setSelectedIdx] = useState<0 | 1 | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentMilestone, setCurrentMilestone] = useState<MilestoneLevel | null>(null);
  const [showProfile, setShowProfile] = useState(false);
  const [showCharity, setShowCharity] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [walletAddress] = useState("0x" + Math.random().toString(16).slice(2, 42));

  // Initialize on first load
  useState(() => {
    if (state.drawnCardIds.length === 0) {
      recordDrawn(cards[0].id);
      recordDrawn(cards[1].id);
    }
    return null;
  });

  function handleSelectCard(idx: 0 | 1) {
    if (confirming) return;
    setSelectedIdx(idx);
  }

  function handleConfirm() {
    if (selectedIdx === null || confirming) return;
    setConfirming(true);

    const selectedCard = cards[selectedIdx];
    const selectedAttr = selectedIdx === 0 ? selectedCard.leftAttr : selectedCard.rightAttr;

    const triggeredMilestone = addAttribute(selectedAttr, 1);

    if (triggeredMilestone) {
      setCurrentMilestone(triggeredMilestone);
    }

    // 抽牌动画：展示牌堆抽取效果
    setTimeout(() => {
      setIsDrawing(true);
      setTimeout(() => {
        const [newCard1, newCard2] = drawTwoCards();
        setCards([newCard1, newCard2]);
        recordDrawn(newCard1.id);
        recordDrawn(newCard2.id);
        setSelectedIdx(null);
        setConfirming(false);
        setIsDrawing(false);
      }, 300);
    }, 500);
  }

  const sbts =
    leader === "rbg"
      ? [
          {
            id: "rbg_eq_l5",
            name: "平权意识 Lv.5",
            icon: "✦",
            color: "#50FA7B",
            owned: state.sbtsMinted.includes("rbg_eq_l5"),
          },
          {
            id: "rbg_leg_l5",
            name: "法理精神 Lv.5",
            icon: "💛",
            color: "#FFD700",
            owned: state.sbtsMinted.includes("rbg_leg_l5"),
          },
        ]
      : [
          {
            id: "hillary_impact_l5",
            name: "影响力 Lv.5",
            icon: "👑",
            color: "#FF6B9D",
            owned: state.sbtsMinted.includes("hillary_impact_l5"),
          },
          {
            id: "hillary_resilience_l5",
            name: "韧性 Lv.5",
            icon: "🔥",
            color: "#00D4FF",
            owned: state.sbtsMinted.includes("hillary_resilience_l5"),
          },
        ];

  const remainingCards = Math.max(0, RBG_CARDS.length - state.drawnCardIds.length);

  return (
    <>
      <GameLayout
        leader={leader}
        topBar={
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-[10px] tracking-widest text-game-text">
                {leader === "rbg" ? "Ruth Bader Ginsburg" : "Hillary Clinton"}
              </h2>
              <button
                onClick={() => setShowCharity(true)}
                className="px-2 py-1 text-[7px] border hover:opacity-75 transition-opacity"
                style={{
                  borderColor: "#50FA7B",
                  backgroundColor: "#50FA7B0d",
                  color: "#50FA7B",
                }}
              >
                💚 公益
              </button>
              <button
                onClick={onGoToNFTShop}
                className="px-2 py-1 text-[7px] border hover:opacity-75 transition-opacity"
                style={{
                  borderColor: "#FFD700",
                  backgroundColor: "#FFD7000d",
                  color: "#FFD700",
                }}
              >
                🛍️ NFT商店
              </button>
              <button
                onClick={() => setShowExitConfirm(true)}
                className="px-2 py-1 text-[7px] border hover:opacity-75 transition-opacity"
                style={{
                  borderColor: "#a07070",
                  backgroundColor: "#a070700d",
                  color: "#a07070",
                }}
              >
                ✕ 退出
              </button>
            </div>
            <div className="flex items-center gap-2">
              <p className="text-[7px] text-game-muted">已选择: {state.drawnCardIds.length}</p>
              <button
                onClick={() => setShowProfile(true)}
                className="w-8 h-8 border-2 flex items-center justify-center text-[14px] hover:opacity-75 transition-opacity"
                style={{
                  borderColor: "#a0a0ff",
                  backgroundColor: "#12122a",
                }}
              >
                👤
              </button>
            </div>
          </div>
        }
        rightPanel={
          <StatusPanel
            leader={leader}
            attr1Name={
              leader === "rbg"
                ? ATTRIBUTE_META.legality.name
                : ATTRIBUTE_META.impact.name
            }
            attr1Value={
              leader === "rbg" ? state.attributes.legality : state.attributes.impact
            }
            attr1Icon={
              leader === "rbg"
                ? ATTRIBUTE_META.legality.icon
                : ATTRIBUTE_META.impact.icon
            }
            attr1Color={
              leader === "rbg"
                ? ATTRIBUTE_META.legality.color
                : ATTRIBUTE_META.impact.color
            }
            attr2Name={
              leader === "rbg"
                ? ATTRIBUTE_META.equality.name
                : ATTRIBUTE_META.resilience.name
            }
            attr2Value={
              leader === "rbg"
                ? state.attributes.equality
                : state.attributes.resilience
            }
            attr2Icon={
              leader === "rbg"
                ? ATTRIBUTE_META.equality.icon
                : ATTRIBUTE_META.resilience.icon
            }
            attr2Color={
              leader === "rbg"
                ? ATTRIBUTE_META.equality.color
                : ATTRIBUTE_META.resilience.color
            }
            maxValue={15}
            sbts={sbts}
            milestoneStatus={state.sbtsMinted.length >= 2 ? "unlocked" : "locked"}
          />
        }
      >
        <div className="flex flex-col items-center gap-8 w-full relative" style={{ minHeight: "600px" }}>
          {/* Dealer at top */}
          <Dealer color="#FFD700" dealing={selectedIdx !== null} />

          {/* Two cards in a row (平铺) */}
          <div className="flex gap-8 items-center justify-center">
            {[0, 1].map((idx) => (
              <DomainChoiceCard
                key={idx}
                card={cards[idx as 0 | 1]}
                index={idx as 0 | 1}
                selected={selectedIdx === idx}
                dimmed={selectedIdx !== null && selectedIdx !== idx}
                drawing={isDrawing}
                onSelect={() => handleSelectCard(idx as 0 | 1)}
              />
            ))}
          </div>

          {/* Confirm button */}
          <button
            onClick={handleConfirm}
            disabled={selectedIdx === null || confirming}
            className="pixel-btn px-10 py-3 text-[8px] disabled:opacity-25 disabled:cursor-not-allowed"
            style={{
              borderColor: selectedIdx !== null ? "#FFD700" : "#3a3a6a",
              backgroundColor: "#12122a",
              color: "#FFD700",
            }}
          >
            {confirming ? "✦ 命运已定" : "确定此路"}
          </button>

          {/* Deck pile at bottom left (larger) */}
          <div className="absolute bottom-8 left-8">
            <DeckPile remaining={remainingCards} total={RBG_CARDS.length} isDrawing={isDrawing} />
          </div>
        </div>
      </GameLayout>

      {/* Milestone Story Modal */}
      {currentMilestone && (
        <MilestoneStoryModal
          milestone={currentMilestone}
          onClose={() => setCurrentMilestone(null)}
          onMint={() => {
            mintSBT(currentMilestone.sbtId);
          }}
        />
      )}

      {/* Profile Modal */}
      {showProfile && (
        <ProfileModal
          leader={leader}
          walletAddress={walletAddress}
          onClose={() => setShowProfile(false)}
        />
      )}

      {/* Charity Global Modal */}
      {showCharity && (
        <CharityGlobal onClose={() => setShowCharity(false)} />
      )}

      {/* Exit Game Confirmation Modal */}
      {showExitConfirm && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.7)" }}
          onClick={() => setShowExitConfirm(false)}
        >
          <div
            className="border-2 px-6 py-6 flex flex-col gap-4"
            style={{
              borderColor: "#4a4a8a",
              backgroundColor: "#0d0d1e",
              boxShadow: "0 0 30px rgba(75, 74, 138, 0.5), 3px 6px 0 rgba(0,0,0,0.7)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-[10px] text-game-text text-center">
              确定要退出游戏吗？
            </p>
            <p className="text-[7px] text-game-muted text-center">
              你的进度已自动保存
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowExitConfirm(false)}
                className="flex-1 pixel-btn py-2 text-[8px]"
                style={{
                  borderColor: "#50FA7B",
                  backgroundColor: "#50FA7B0d",
                  color: "#50FA7B",
                }}
              >
                取消
              </button>
              <button
                onClick={onBackHome || (() => {})}
                className="flex-1 pixel-btn py-2 text-[8px]"
                style={{
                  borderColor: "#a07070",
                  backgroundColor: "#a070700d",
                  color: "#a07070",
                }}
              >
                确认退出
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
