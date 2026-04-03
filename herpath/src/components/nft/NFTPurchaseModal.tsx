"use client";

import type { NFTItem } from "@/types/nft";

interface NFTPurchaseModalProps {
  nft: NFTItem;
  isLegendary: boolean;
  pending: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function NFTPurchaseModal({
  nft,
  isLegendary,
  pending,
  onConfirm,
  onCancel,
}: NFTPurchaseModalProps) {
  const charityAmount = (parseFloat(nft.price) * 0.9).toFixed(4);
  const platformAmount = (parseFloat(nft.price) * 0.1).toFixed(4);

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.7)" }}
      onClick={onCancel}
    >
      <div
        className="w-full max-w-md max-h-[80vh] overflow-y-auto border-2 flex flex-col"
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
            确认购买 NFT
          </h2>
          <button
            onClick={onCancel}
            disabled={pending}
            className="text-[12px] text-game-muted hover:text-game-text transition-colors disabled:opacity-50"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 px-4 py-4 flex flex-col gap-4">
          {/* NFT Info */}
          <div
            className="px-3 py-3 border"
            style={{
              borderColor: "#4a4a8a",
              backgroundColor: "#12122a22",
            }}
          >
            <p className="text-[9px] font-bold text-game-text mb-2">
              {nft.title}
            </p>
            <p className="text-[7px] text-game-muted">
              {nft.description}
            </p>
          </div>

          {/* Price Breakdown */}
          <div className="flex flex-col gap-2">
            <p className="text-[7px] text-game-muted uppercase tracking-widest">
              金额分配
            </p>

            <div
              className="px-3 py-2 border flex items-center justify-between"
              style={{
                borderColor: "#4a4a8a",
                backgroundColor: "#0d0d1e",
              }}
            >
              <span className="text-[7px] text-game-text">总价格</span>
              <span className="text-[8px] font-bold text-game-text">
                {nft.price} AVAX
              </span>
            </div>

            <div
              className="px-3 py-2 border flex items-center justify-between"
              style={{
                borderColor: "#50FA7B66",
                backgroundColor: "#50FA7B0d",
              }}
            >
              <div>
                <p className="text-[7px] text-game-text">公益机构 (90%)</p>
                <p className="text-[6px] text-game-muted">{nft.charity.name}</p>
              </div>
              <span className="text-[8px] font-bold" style={{ color: "#50FA7B" }}>
                {charityAmount} AVAX
              </span>
            </div>

            <div
              className="px-3 py-2 border flex items-center justify-between"
              style={{
                borderColor: "#FFD70066",
                backgroundColor: "#FFD7000d",
              }}
            >
              <span className="text-[7px] text-game-text">项目方 (10%)</span>
              <span className="text-[8px] font-bold" style={{ color: "#FFD700" }}>
                {platformAmount} AVAX
              </span>
            </div>
          </div>

          {/* Legendary status info */}
          {isLegendary && (
            <div
              className="px-3 py-2 border-2"
              style={{
                borderColor: "#FFD700",
                backgroundColor: "#FFD7000d",
              }}
            >
              <p className="text-[7px] font-bold" style={{ color: "#FFD700" }}>
                👑 传奇身份激活
              </p>
              <p className="text-[6px] text-game-muted mt-1">
                集齐全部10枚SBT！此NFT将获得金色边框和链上特殊勋章。
              </p>
            </div>
          )}

          {/* Disclaimer */}
          <div
            className="px-3 py-2 border text-[6px] leading-relaxed text-game-muted"
            style={{
              borderColor: "#4a4a8a",
              backgroundColor: "#0d0d1e",
            }}
          >
            购买即表示同意通过智能合约完成交易，90% 自动转入公益机构钱包。
          </div>
        </div>

        {/* Footer buttons */}
        <div
          className="px-4 py-3 border-t flex gap-3 flex-shrink-0"
          style={{
            borderColor: "#4a4a8a",
            backgroundColor: "#12122a",
          }}
        >
          <button
            onClick={onCancel}
            disabled={pending}
            className="flex-1 pixel-btn py-2 text-[8px] disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              borderColor: "#4a4a8a",
              backgroundColor: "#12122a",
              color: "#a0a0ff",
            }}
          >
            取消
          </button>
          <button
            onClick={onConfirm}
            disabled={pending}
            className="flex-1 pixel-btn py-2 text-[8px] disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              borderColor: pending ? "#FFD70066" : "#FFD700",
              backgroundColor: pending ? "#FFD7000d" : "#0d0d1e",
              color: "#FFD700",
              transition: "all 0.3s",
            }}
          >
            {pending ? "💫 处理中..." : "✦ 确认购买"}
          </button>
        </div>
      </div>
    </div>
  );
}
