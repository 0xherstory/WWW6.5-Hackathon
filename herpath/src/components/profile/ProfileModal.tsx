"use client";

import { useState } from "react";
import type { Leader } from "@/types/flashback";
import type { DomainAttribute } from "@/types/domain";
import { useDomainState } from "@/hooks/useDomainState";
import { useNFTOwnership } from "@/hooks/useNFTOwnership";
import { ATTRIBUTE_META } from "@/data/rbg-cards";
import { RBG_MILESTONES } from "@/data/rbg-milestones";
import { HILLARY_MILESTONES } from "@/data/hillary-milestones";
import { abbreviateAddress } from "@/hooks/useGlobalCharityStats";
import { NFT_CATALOG } from "@/data/nft-catalog";

interface ProfileModalProps {
  leader: Leader;
  walletAddress: string;
  onClose: () => void;
}

export default function ProfileModal({
  leader,
  walletAddress,
  onClose,
}: ProfileModalProps) {
  const { state } = useDomainState(leader);
  const { ownership } = useNFTOwnership(leader);
  const [copied, setCopied] = useState(false);

  const milestones =
    leader === "rbg" ? RBG_MILESTONES : HILLARY_MILESTONES;
  const attr1 =
    leader === "rbg" ? ("legality" as DomainAttribute) : ("impact" as DomainAttribute);
  const attr2 =
    leader === "rbg" ? ("equality" as DomainAttribute) : ("resilience" as DomainAttribute);

  const attr1Meta = ATTRIBUTE_META[attr1];
  const attr2Meta = ATTRIBUTE_META[attr2];

  // Get SBTs for each branch
  const getSBTsByBranch = () => {
    const result: { [key: string]: any[] } = {};
    milestones.branches.forEach((branch) => {
      result[branch.branchName] = branch.levels.filter((level) =>
        state.sbtsMinted.includes(level.sbtId)
      );
    });
    return result;
  };

  const sbtsByBranch = getSBTsByBranch();

  // Check NFT unlock status
  const isNFTUnlocked = state.sbtsMinted.length >= 2;
  const isLegendary = state.sbtsMinted.length === 10;

  // Get owned NFT info
  const ownedNFTs = NFT_CATALOG.filter((nft) =>
    ownership.ownedNFTs.includes(nft.id)
  );

  function handleCopyAddress() {
    navigator.clipboard.writeText(walletAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.7)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto border-2 flex flex-col"
        style={{
          borderColor: "#4a4a8a",
          backgroundColor: "#0d0d1e",
          boxShadow:
            "0 0 30px rgba(75, 74, 138, 0.5), 3px 6px 0 rgba(0,0,0,0.7)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="px-4 py-3 border-b flex items-center justify-between flex-shrink-0"
          style={{
            borderColor: "#4a4a8a",
            backgroundColor: "#12122a",
          }}
        >
          <h2 className="text-[10px] tracking-widest text-game-text">
            👤 个人档案
          </h2>
          <button
            onClick={onClose}
            className="text-[12px] text-game-muted hover:text-game-text transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 px-4 py-4 flex flex-col gap-4">
          {/* Wallet Info */}
          <div
            className="px-3 py-3 border"
            style={{
              borderColor: "#4a4a8a",
              backgroundColor: "#12122a22",
            }}
          >
            <p className="text-[7px] text-game-muted uppercase tracking-widest mb-2">
              钱包地址
            </p>
            <div className="flex items-center gap-2">
              <span className="text-[7px] font-mono text-game-text flex-1 break-all">
                {walletAddress}
              </span>
              <button
                onClick={handleCopyAddress}
                className="px-2 py-1 text-[6px] border"
                style={{
                  borderColor: "#a0a0ff",
                  backgroundColor: "#0d0d1e",
                  color: "#a0a0ff",
                }}
              >
                {copied ? "✓" : "复制"}
              </button>
            </div>
          </div>

          {/* Leader & Attributes */}
          <div className="grid grid-cols-2 gap-3">
            <div
              className="px-3 py-3 border"
              style={{
                borderColor: "#4a4a8a",
                backgroundColor: "#12122a22",
              }}
            >
              <p className="text-[7px] text-game-muted uppercase tracking-widest">
                当前领袖
              </p>
              <p className="text-[9px] font-bold text-game-text mt-1">
                {leader === "rbg" ? "Ruth Bader Ginsburg" : "Hillary Clinton"}
              </p>
            </div>

            <div
              className="px-3 py-3 border"
              style={{
                borderColor: "#4a4a8a",
                backgroundColor: "#12122a22",
              }}
            >
              <p className="text-[7px] text-game-muted uppercase tracking-widest">
                成就等级
              </p>
              <p className="text-[9px] font-bold text-game-text mt-1">
                {isLegendary ? "👑 传奇" : `⭐ ${state.sbtsMinted.length}/10`}
              </p>
            </div>
          </div>

          {/* Attributes Progress */}
          <div className="flex flex-col gap-3">
            <p className="text-[7px] text-game-muted uppercase tracking-widest">
              ── 属性值 ──
            </p>

            <div>
              <div className="flex items-center justify-between mb-1">
                <span
                  className="text-[7px]"
                  style={{ color: attr1Meta.color }}
                >
                  {attr1Meta.icon} {attr1Meta.name}
                </span>
                <span className="text-[7px]" style={{ color: `${attr1Meta.color}99` }}>
                  {state.attributes[attr1]}/15
                </span>
              </div>
              <div className="flex gap-0.5">
                {Array.from({ length: 15 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-2 flex-1 border"
                    style={{
                      borderColor: attr1Meta.color,
                      backgroundColor:
                        i < state.attributes[attr1]
                          ? attr1Meta.color
                          : "transparent",
                      boxShadow:
                        i < state.attributes[attr1]
                          ? `0 0 4px ${attr1Meta.color}66`
                          : "none",
                    }}
                  />
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <span
                  className="text-[7px]"
                  style={{ color: attr2Meta.color }}
                >
                  {attr2Meta.icon} {attr2Meta.name}
                </span>
                <span className="text-[7px]" style={{ color: `${attr2Meta.color}99` }}>
                  {state.attributes[attr2]}/15
                </span>
              </div>
              <div className="flex gap-0.5">
                {Array.from({ length: 15 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-2 flex-1 border"
                    style={{
                      borderColor: attr2Meta.color,
                      backgroundColor:
                        i < state.attributes[attr2]
                          ? attr2Meta.color
                          : "transparent",
                      boxShadow:
                        i < state.attributes[attr2]
                          ? `0 0 4px ${attr2Meta.color}66`
                          : "none",
                    }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* SBT Badges by Branch */}
          <div className="flex flex-col gap-3">
            <p className="text-[7px] text-game-muted uppercase tracking-widest">
              ── 已获勋章 ──
            </p>

            {Object.entries(sbtsByBranch).map(([branchName, sbts]) => (
              <div key={branchName}>
                <p className="text-[7px] font-bold text-game-text mb-2">
                  {branchName}
                </p>
                {sbts.length === 0 ? (
                  <p className="text-[6px] text-game-muted">
                    未获得此分支勋章
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {sbts.map((sbt) => (
                      <div
                        key={sbt.sbtId}
                        className="px-2 py-1.5 border text-[6px] text-center"
                        style={{
                          borderColor: "#50FA7B",
                          backgroundColor: "#50FA7B0d",
                          color: "#50FA7B",
                        }}
                      >
                        <p className="text-[10px] mb-0.5">{sbt.sbtIcon}</p>
                        <p className="leading-tight">{sbt.sbtName}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* NFT Status */}
          <div className="flex flex-col gap-2">
            <p className="text-[7px] text-game-muted uppercase tracking-widest">
              ── NFT 状态 ──
            </p>

            <div
              className="px-3 py-2 border"
              style={{
                borderColor: isNFTUnlocked ? "#50FA7B" : "#4a4a6a",
                backgroundColor: isNFTUnlocked ? "#50FA7B0d" : "#0d0d1e",
                color: isNFTUnlocked ? "#50FA7B" : "#7070a0",
              }}
            >
              <p className="text-[7px]">
                {isNFTUnlocked ? "✓ 已解锁" : "🔒 未解锁"}
              </p>
              <p className="text-[6px] mt-1">
                {isNFTUnlocked
                  ? "你已具备购买资格"
                  : "需要双分支各≥1枚SBT"}
              </p>
            </div>

            {ownedNFTs.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {ownedNFTs.map((nft) => (
                  <div
                    key={nft.id}
                    className="px-2 py-1.5 border text-[6px] text-center"
                    style={{
                      borderColor: "#FFD700",
                      backgroundColor: "#FFD7000d",
                      color: "#FFD700",
                    }}
                  >
                    <p className="text-[10px] mb-0.5">{nft.leaderName.includes("Ruth") ? "⚖️" : "👑"}</p>
                    <p className="leading-tight">{nft.title}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Stats Summary */}
          <div
            className="px-3 py-3 border-t grid grid-cols-3 gap-2"
            style={{
              borderColor: "#2a2a4a",
            }}
          >
            <div className="text-center">
              <p className="text-[10px] font-bold text-game-text">
                {state.sbtsMinted.length}
              </p>
              <p className="text-[6px] text-game-muted mt-0.5">已获勋章</p>
            </div>
            <div className="text-center">
              <p className="text-[10px] font-bold" style={{ color: "#FFD700" }}>
                {ownedNFTs.length}
              </p>
              <p className="text-[6px] text-game-muted mt-0.5">拥有NFT</p>
            </div>
            <div className="text-center">
              <p className="text-[10px] font-bold" style={{ color: "#50FA7B" }}>
                {ownership.totalCharityDonated}
              </p>
              <p className="text-[6px] text-game-muted mt-0.5">公益捐赠</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          className="px-4 py-3 border-t flex-shrink-0"
          style={{
            borderColor: "#4a4a8a",
            backgroundColor: "#12122a",
          }}
        >
          <button
            onClick={onClose}
            className="w-full pixel-btn py-3 text-[8px]"
            style={{
              borderColor: "#a0a0ff",
              backgroundColor: "#0d0d1e",
              color: "#a0a0ff",
            }}
          >
            ✦ 返回主界面
          </button>
        </div>
      </div>
    </div>
  );
}
