"use client";

import { useState } from "react";
import type { Leader } from "@/types/flashback";
import type { NFTItem } from "@/types/nft";
import { useDomainState } from "@/hooks/useDomainState";
import { useNFTOwnership } from "@/hooks/useNFTOwnership";
import { NFT_CATALOG } from "@/data/nft-catalog";
import GameLayout from "@/components/layout/GameLayout";
import StatusPanel from "@/components/layout/StatusPanel";
import NFTCard from "./NFTCard";
import NFTPurchaseModal from "./NFTPurchaseModal";
import CharityModal from "./CharityModal";

interface NFTShopProps {
  leader: Leader;
  onBack?: () => void;
}

export default function NFTShop({ leader, onBack }: NFTShopProps) {
  const { state: domainState } = useDomainState(leader);
  const { ownership, ownsNFT, recordPurchase, getLatestPurchase } =
    useNFTOwnership(leader);

  const [selectedNFT, setSelectedNFT] = useState<NFTItem | null>(null);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [showCharityModal, setShowCharityModal] = useState(false);
  const [purchasePending, setPurchasePending] = useState(false);

  // Get NFTs available for this leader
  const leaderNFTs = NFT_CATALOG.filter((nft) => nft.leaderId === leader);

  // Check if player has unlocked NFT purchase (has SBT from both branches)
  const hasUnlockedNFT = domainState.sbtsMinted.length >= 2;

  // Check if player has all 10 SBTs (legendary status)
  const isLegendary = domainState.sbtsMinted.length === 10;

  function handleNFTClick(nft: NFTItem) {
    if (!hasUnlockedNFT) return; // Can't click if not unlocked
    setSelectedNFT(nft);
    setShowPurchaseModal(true);
  }

  function handlePurchaseConfirm() {
    if (!selectedNFT) return;
    setPurchasePending(true);

    // Simulate contract call
    setTimeout(() => {
      const price = parseFloat(selectedNFT.price);
      const charityAmount = (price * 0.9).toFixed(4);
      const platformAmount = (price * 0.1).toFixed(4);

      recordPurchase(
        selectedNFT.id,
        charityAmount,
        platformAmount,
        isLegendary
      );

      setPurchasePending(false);
      setShowPurchaseModal(false);
      setShowCharityModal(true);
    }, 1500);
  }

  return (
    <>
      <GameLayout
        leader={leader}
        topBar={
          <div className="flex items-center justify-between">
            <h2 className="text-[10px] tracking-widest text-game-text">
              {leader === "rbg" ? "Ruth Bader Ginsburg" : "Hillary Clinton"} - NFT 商店
            </h2>
            <div className="flex items-center gap-2">
              <p className="text-[7px] text-game-muted">
                {hasUnlockedNFT ? "✓ 已解锁" : "🔒 未解锁"}
              </p>
              {onBack && (
                <button
                  onClick={onBack}
                  className="px-2 py-1 text-[7px] border hover:opacity-75 transition-opacity"
                  style={{
                    borderColor: "#a0a0ff",
                    backgroundColor: "#a0a0ff0d",
                    color: "#a0a0ff",
                  }}
                >
                  ← 返回
                </button>
              )}
            </div>
          </div>
        }
        rightPanel={
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2 pb-4 border-b" style={{ borderColor: "#2a2a4a" }}>
              <p className="text-[6px] tracking-widest text-game-muted">
                ── 解锁状态 ──
              </p>
              <div
                className="px-2 py-2 text-center text-[7px] border"
                style={{
                  borderColor: hasUnlockedNFT ? "#50FA7B" : "#4a4a6a",
                  backgroundColor: hasUnlockedNFT ? "#50FA7B0d" : "#0d0d1e",
                  color: hasUnlockedNFT ? "#50FA7B" : "#7070a0",
                }}
              >
                {hasUnlockedNFT ? "✦ 双分支各≥1枚 SBT" : "需要双分支各≥1枚"}
              </div>
            </div>

            <div className="flex flex-col gap-2 pb-4 border-b" style={{ borderColor: "#2a2a4a" }}>
              <p className="text-[6px] tracking-widest text-game-muted">
                ── 传奇身份 ──
              </p>
              <div
                className="px-2 py-2 text-center text-[7px] border"
                style={{
                  borderColor: isLegendary ? "#FFD700" : "#4a4a6a",
                  backgroundColor: isLegendary ? "#FFD7000d" : "#0d0d1e",
                  color: isLegendary ? "#FFD700" : "#7070a0",
                }}
              >
                {isLegendary ? "👑 集齐全部10枚SBT" : `${domainState.sbtsMinted.length}/10 枚SBT`}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <p className="text-[6px] tracking-widest text-game-muted">
                ── 公益贡献 ──
              </p>
              <div className="text-center">
                <p className="text-[10px] font-bold" style={{ color: "#FF6B9D" }}>
                  {ownership.totalCharityDonated} AVAX
                </p>
                <p className="text-[6px] text-game-muted mt-1">
                  已捐赠至公益机构
                </p>
              </div>
            </div>
          </div>
        }
      >
        <div className="flex flex-col items-center gap-8 w-full" style={{ minHeight: "600px" }}>
          <h1 className="text-[12px] tracking-widest text-game-text mt-8">
            ✦ NFT 商店 ✦
          </h1>

          {/* NFT Cards */}
          <div className="flex flex-wrap gap-6 justify-center w-full">
            {leaderNFTs.map((nft) => (
              <NFTCard
                key={nft.id}
                nft={nft}
                isUnlocked={hasUnlockedNFT}
                isOwned={ownsNFT(nft.id)}
                isLegendary={isLegendary}
                onClick={() => handleNFTClick(nft)}
              />
            ))}
          </div>

          {!hasUnlockedNFT && (
            <div
              className="mt-8 px-6 py-4 border-2 text-center max-w-md"
              style={{
                borderColor: "#4a4a8a",
                backgroundColor: "#12122a",
              }}
            >
              <p className="text-[8px] text-game-muted mb-2">💡 解锁提示</p>
              <p className="text-[7px] text-game-text leading-relaxed">
                需要从该领袖的两个属性分支中各获得至少一枚 SBT，才能解锁 NFT
                购买资格。继续累积属性来获取更多勋章吧！
              </p>
            </div>
          )}
        </div>
      </GameLayout>

      {/* Purchase Modal */}
      {showPurchaseModal && selectedNFT && (
        <NFTPurchaseModal
          nft={selectedNFT}
          isLegendary={isLegendary}
          pending={purchasePending}
          onConfirm={handlePurchaseConfirm}
          onCancel={() => {
            setShowPurchaseModal(false);
            setSelectedNFT(null);
          }}
        />
      )}

      {/* Charity Modal */}
      {showCharityModal && getLatestPurchase() && (
        <CharityModal
          purchase={getLatestPurchase()!}
          nft={
            NFT_CATALOG.find(
              (n) => n.id === getLatestPurchase()!.nftId
            ) || selectedNFT!
          }
          onClose={() => {
            setShowCharityModal(false);
            setSelectedNFT(null);
          }}
        />
      )}
    </>
  );
}
