"use client";

import { useGlobalCharityStats, abbreviateAddress } from "@/hooks/useGlobalCharityStats";

interface CharityGlobalProps {
  onClose: () => void;
}

export default function CharityGlobal({ onClose }: CharityGlobalProps) {
  const { stats, estimateTotalSBTs } = useGlobalCharityStats();

  const totalSBTs = estimateTotalSBTs();

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.7)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-4xl max-h-[90vh] overflow-y-auto border-2 flex flex-col"
        style={{
          borderColor: "#50FA7B",
          backgroundColor: "#0d0d1e",
          boxShadow:
            "0 0 40px rgba(80, 250, 123, 0.4), 0 0 80px rgba(80, 250, 123, 0.2), 3px 6px 0 rgba(0,0,0,0.7)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="px-4 py-3 border-b flex items-center justify-between flex-shrink-0"
          style={{
            borderColor: "#50FA7B",
            backgroundColor: "#50FA7B0d",
          }}
        >
          <h2 className="text-[11px] tracking-widest font-bold" style={{ color: "#50FA7B" }}>
            💚 全球公益进展
          </h2>
          <button
            onClick={onClose}
            className="text-[12px] text-game-muted hover:text-game-text transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 px-4 py-4 flex flex-col gap-6">
          {/* Global Stats */}
          <div className="grid grid-cols-4 gap-3">
            <div
              className="px-3 py-3 border text-center"
              style={{
                borderColor: "#50FA7B",
                backgroundColor: "#50FA7B0d",
              }}
            >
              <p className="text-[10px] font-bold" style={{ color: "#50FA7B" }}>
                {totalSBTs}
              </p>
              <p className="text-[6px] text-game-muted mt-1">
                总铸造勋章
              </p>
            </div>

            <div
              className="px-3 py-3 border text-center"
              style={{
                borderColor: "#FFD700",
                backgroundColor: "#FFD7000d",
              }}
            >
              <p className="text-[10px] font-bold" style={{ color: "#FFD700" }}>
                {stats.totalNFTsPurchased}
              </p>
              <p className="text-[6px] text-game-muted mt-1">
                总购买NFT
              </p>
            </div>

            <div
              className="px-3 py-3 border text-center col-span-2"
              style={{
                borderColor: "#FF6B9D",
                backgroundColor: "#FF6B9D0d",
              }}
            >
              <p className="text-[10px] font-bold" style={{ color: "#FF6B9D" }}>
                {stats.totalDonated} AVAX
              </p>
              <p className="text-[6px] text-game-muted mt-1">
                总捐赠金额 (≈ ${(parseFloat(stats.totalDonated) * 30).toFixed(0)})
              </p>
            </div>
          </div>

          {/* Recent Purchases */}
          <div>
            <p className="text-[8px] tracking-widest text-game-muted uppercase mb-2">
              ── 最近购买 ──
            </p>
            <div className="flex flex-col gap-1">
              {stats.recentPurchases.map((purchase, idx) => (
                <div
                  key={idx}
                  className="px-3 py-2 border flex items-center justify-between"
                  style={{
                    borderColor: purchase.leaderId === "rbg" ? "#FFD700" : "#FF6B9D",
                    backgroundColor:
                      purchase.leaderId === "rbg"
                        ? "#FFD7000d"
                        : "#FF6B9D0d",
                  }}
                >
                  <div className="flex items-center gap-2 flex-1">
                    <span className="text-[8px]">
                      {purchase.leaderId === "rbg" ? "⚖️" : "👑"}
                    </span>
                    <span className="text-[7px] font-mono text-game-text">
                      {abbreviateAddress(purchase.playerAddress)}
                    </span>
                    <span className="text-[6px] text-game-muted">
                      购买了 {purchase.nftTitle}
                    </span>
                  </div>
                  <span className="text-[6px] text-game-muted">
                    {new Date(purchase.timestamp).toLocaleDateString("zh-CN", {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Charity Projects */}
          <div>
            <p className="text-[8px] tracking-widest text-game-muted uppercase mb-2">
              ── 公益项目 ──
            </p>

            <div className="grid grid-cols-2 gap-4">
              {stats.charityProjects.map((project) => (
                <div
                  key={project.leaderId}
                  className="px-4 py-3 border flex flex-col gap-2"
                  style={{
                    borderColor:
                      project.leaderId === "rbg" ? "#FFD700" : "#FF6B9D",
                    backgroundColor:
                      project.leaderId === "rbg"
                        ? "#FFD7000d"
                        : "#FF6B9D0d",
                  }}
                >
                  {/* Header */}
                  <div>
                    <p className="text-[8px] font-bold text-game-text">
                      {project.leaderId === "rbg" ? "⚖️" : "👑"} {project.projectName}
                    </p>
                    <p className="text-[6px] text-game-muted mt-0.5">
                      {project.beneficiaryName}
                    </p>
                  </div>

                  {/* Description */}
                  <p className="text-[6px] text-game-muted italic">
                    {project.projectDescription}
                  </p>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t" style={{ borderColor: "rgba(255,255,255,0.1)" }}>
                    <div>
                      <p className="text-[10px] font-bold" style={{ color: project.leaderId === "rbg" ? "#FFD700" : "#FF6B9D" }}>
                        {project.purchaseCount}
                      </p>
                      <p className="text-[6px] text-game-muted">购买次数</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold" style={{ color: project.leaderId === "rbg" ? "#FFD700" : "#FF6B9D" }}>
                        {project.totalDonated}
                      </p>
                      <p className="text-[6px] text-game-muted">已捐赠AVAX</p>
                    </div>
                  </div>

                  {/* Impact message */}
                  <p className="text-[6px] text-game-text italic pt-2 border-t" style={{ borderColor: "rgba(255,255,255,0.1)" }}>
                    {project.leaderId === "rbg"
                      ? "✨ 为女性法律权益发声"
                      : "✨ 培养全球女性领导者"}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Impact Summary */}
          <div
            className="px-4 py-4 border-2"
            style={{
              borderColor: "#50FA7B",
              backgroundColor: "#50FA7B0d",
            }}
          >
            <p className="text-[8px] font-bold" style={{ color: "#50FA7B" }}>
              🌍 全球影响力
            </p>
            <p className="text-[7px] text-game-text mt-2 leading-relaxed">
              截至目前，全球 HerPath
              玩家已通过购买领袖NFT，捐赠{" "}
              <span style={{ color: "#FF6B9D" }} className="font-bold">
                {stats.totalDonated} AVAX
              </span>
              （约 $
              {(parseFloat(stats.totalDonated) * 30).toFixed(0)}
              ）给女性法律援助基金和全球女性领导力项目。每一笔捐赠都在推动性别平等向前迈进。
            </p>
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
              borderColor: "#50FA7B",
              backgroundColor: "#50FA7B15",
              color: "#50FA7B",
            }}
          >
            ✦ 关闭
          </button>
        </div>
      </div>
    </div>
  );
}
