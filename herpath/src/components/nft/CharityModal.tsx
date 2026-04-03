"use client";

import type { NFTItem } from "@/types/nft";
import type { NFTPurchaseRecord } from "@/types/nft";

interface CharityModalProps {
  purchase: NFTPurchaseRecord;
  nft: NFTItem;
  onClose: () => void;
}

export default function CharityModal({
  purchase,
  nft,
  onClose,
}: CharityModalProps) {
  const isRBG = nft.leaderId === "rbg";

  const nftTitle = isRBG
    ? "法理：永恒的异议"
    : "野心：碎裂的天花板";

  const leaderTribute = isRBG
    ? "你已成功获取 RBG 的终极认可。这枚 NFT 记录了你从平凡生活琐事到最高法庭辩论的全路径抉择。你证明了：改变世界不需要震耳欲聋的咆哮，只需要如手术刀般精准的法理逻辑，以及在偏见面前永不妥协的异议精神。你不再是规则的顺从者，而是正义的微雕家。"
    : "你已正式成为 Hillary 精神的继承者。这枚 NFT 见证了你如何在权力的风暴中保持韧性，并巧妙运用影响力将阻力化为推力。你撞碎了那一面阻碍千万女性向上的玻璃天花板，而那些掉落的碎片，如今已化作你冠冕上最闪耀的功勋。你证明了：野心不是贬义词，它是推动文明向前的燃油。";

  const charityTitle = isRBG
    ? "拨开法律的迷雾"
    : "点燃未来的火种";

  const charityImpact = isRBG
    ? "你的这笔贡献将直接用于资助那些身陷职场歧视、家庭暴力或由于制度漏洞而无法发声的女性，为她们提供专业的法律咨询与出庭援助。"
    : "你的支持将用于资助偏远地区及资源匮乏背景下的女性青少年，为她们提供公共事务培训、演说技巧指导以及参与国际治理的机会。";

  const charityClosing = isRBG
    ? "正义也许会迟到，但因为你的加入，它正在加速赶来的路上。"
    : "天花板已经碎裂，现在，请引领更多人看到那片属于她们的星空。";

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.7)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-md border-2 flex flex-col animate-pulse"
        style={{
          borderColor: "#50FA7B",
          backgroundColor: "#0d0d1e",
          boxShadow:
            "0 0 40px rgba(80, 250, 123, 0.6), 0 0 80px rgba(80, 250, 123, 0.3), 3px 6px 0 rgba(0,0,0,0.7)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="px-4 py-3 border-b text-center flex-shrink-0"
          style={{
            borderColor: "#50FA7B",
            backgroundColor: "#50FA7B0d",
          }}
        >
          <h2 className="text-[11px] tracking-widest font-bold" style={{ color: "#50FA7B" }}>
            🎉 购买成功！
          </h2>
        </div>

        {/* Content */}
        <div className="flex-1 px-4 py-6 flex flex-col gap-4 overflow-y-auto max-h-[70vh]">
          {/* NFT Title & Subtitle */}
          <div className="text-center border-b pb-3" style={{ borderColor: "#2a2a4a" }}>
            <p className="text-[8px] tracking-widest text-game-muted mb-1">
              {isRBG ? "⚖️ NFT: Jurisprudence" : "🏛️ NFT: Ambition"}
            </p>
            <p className="text-[9px] font-bold text-game-text">
              {nftTitle}
            </p>
          </div>

          {/* Leader Tribute */}
          <div
            className="px-3 py-3 border"
            style={{
              borderColor: isRBG ? "#FFD700" : "#FF6B9D",
              backgroundColor: isRBG ? "#FFD7000d" : "#FF6B9D0d",
            }}
          >
            <p className="text-[8px] font-bold mb-2" style={{ color: isRBG ? "#FFD700" : "#FF6B9D" }}>
              👑 领袖致敬
            </p>
            <p className="text-[6px] leading-relaxed text-game-text">
              {leaderTribute}
            </p>
          </div>

          {/* Charity Impact */}
          <div
            className="px-3 py-3 border"
            style={{
              borderColor: "#50FA7B",
              backgroundColor: "#50FA7B0d",
            }}
          >
            <p className="text-[8px] font-bold mb-2" style={{ color: "#50FA7B" }}>
              💚 公益回响：{charityTitle}
            </p>

            {/* Donation destination */}
            <div className="mb-2 pb-2 border-b" style={{ borderColor: "rgba(80, 250, 123, 0.2)" }}>
              <p className="text-[7px] font-bold text-game-text mb-1">
                捐赠去向
              </p>
              <p className="text-[6px] text-game-text">
                本次购买金额的 <span style={{ color: "#50FA7B" }} className="font-bold">90%</span> 已通过智能合约实时划转至 <span className="font-bold">{nft.charity.name}</span>。
              </p>
            </div>

            {/* Social impact */}
            <div className="mb-2 pb-2 border-b" style={{ borderColor: "rgba(80, 250, 123, 0.2)" }}>
              <p className="text-[7px] font-bold text-game-text mb-1">
                社会影响
              </p>
              <p className="text-[6px] text-game-text">
                {charityImpact}
              </p>
            </div>

            {/* Closing message */}
            <p className="text-[6px] italic text-game-text">
              {charityClosing}
            </p>
          </div>

          {/* Transaction Details */}
          <div className="flex flex-col gap-2 pb-3 border-b" style={{ borderColor: "#2a2a4a" }}>
            <p className="text-[7px] text-game-muted uppercase tracking-widest">
              交易详情
            </p>

            <div
              className="px-3 py-2 border flex items-center justify-between"
              style={{
                borderColor: "#50FA7B66",
                backgroundColor: "#50FA7B0d",
              }}
            >
              <span className="text-[7px] text-game-text font-bold">
                公益金额
              </span>
              <span className="text-[8px] font-bold" style={{ color: "#50FA7B" }}>
                {purchase.charityAmount} AVAX
              </span>
            </div>

            <div
              className="px-3 py-2 border flex items-center justify-between"
              style={{
                borderColor: "#FFD70066",
                backgroundColor: "#FFD7000d",
              }}
            >
              <span className="text-[7px] text-game-text font-bold">
                项目方
              </span>
              <span className="text-[8px] font-bold" style={{ color: "#FFD700" }}>
                {purchase.platformAmount} AVAX
              </span>
            </div>

            <div className="text-[6px] text-game-muted italic pt-2">
              <p>交易时间: {new Date(purchase.purchaseTime).toLocaleString()}</p>
              {purchase.txHash && (
                <p className="mt-1 break-all font-mono">TX: {purchase.txHash}</p>
              )}
            </div>
          </div>

          {/* Legendary Bonus */}
          {purchase.isLegendary && (
            <div
              className="px-4 py-3 border-2"
              style={{
                borderColor: "#FFD700",
                backgroundColor: "#FFD7000d",
              }}
            >
              <p className="text-[8px] font-bold mb-1" style={{ color: "#FFD700" }}>
                👑 传奇身份特殊奖励
              </p>
              <p className="text-[7px] text-game-text leading-relaxed">
                恭喜！你已集齐全部10枚SBT。此NFT已升级为金色边框版本，并获得链上特殊勋章
                「永恒的倡导者」。
              </p>
            </div>
          )}

          {/* Inspiration quote */}
          <div className="text-center border-t pt-4" style={{ borderColor: "#2a2a4a" }}>
            <p className="text-[7px] italic text-game-muted">
              "改变需要坚持，坚持才能看见光芒。"
            </p>
            <p className="text-[6px] text-game-muted mt-2">
              — {nft.leaderName}
            </p>
          </div>
        </div>

        {/* Footer button */}
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
              borderColor: "#50FA7B",
              backgroundColor: "#50FA7B15",
              color: "#50FA7B",
            }}
          >
            ✦ 返回商店
          </button>
        </div>
      </div>
    </div>
  );
}
