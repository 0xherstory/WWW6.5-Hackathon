import { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { X, Sparkles, Coins, Gift, Heart, CheckCircle, Loader2 } from "lucide-react";
import { getReadonlyContracts } from "../../lib/contracts";

interface Props { onClose: () => void; }

export function NFTWelcomeModal({ onClose }: Props) {
  const {
    claimAll,
    claimWelcomeTokens,
    isConnected, connectWallet,
    nftClaimed, welcomeClaimed,
    isLoading, error, clearError,
  } = useApp();

  const [localError, setLocalError] = useState<string | null>(null);
  const [claiming, setClaiming]     = useState(false);
  const [done, setDone]             = useState(false);
  const [portraitImg, setPortraitImg] = useState<string | null>(null);

  // 从链上读取当季全家福图片
  useEffect(() => {
    const fetchImg = async () => {
      try {
        const c = getReadonlyContracts();
        const season = await c.catNFT.currentSeason() as bigint;
        const uri    = await c.catNFT.seasonURIs(Number(season)) as string;
        if (!uri) return;
        const httpUri = uri.startsWith("ipfs://")
          ? uri.replace("ipfs://", "https://ipfs.io/ipfs/") : uri;
        const res  = await fetch(httpUri, { signal: AbortSignal.timeout(6000) });
        const json = await res.json() as { image?: string };
        if (json.image) {
          setPortraitImg(
            json.image.startsWith("ipfs://")
              ? json.image.replace("ipfs://", "https://ipfs.io/ipfs/")
              : json.image
          );
        }
      } catch { /* 使用默认猫咪 emoji */ }
    };
    fetchImg();
  }, []);

  const alreadyDone = nftClaimed && welcomeClaimed;

  const handleClaim = async () => {
    if (!isConnected) { await connectWallet(); return; }
    setClaiming(true); setLocalError(null); clearError();
    try {
      if (nftClaimed && welcomeClaimed) return;
      // claimAll 内部处理两步，且直接从 receipt 拿 tokenId，不依赖 state 时序
      if (!welcomeClaimed || !nftClaimed) {
        await claimAll();
      }
      setDone(true);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "";
      if (!msg.includes("user rejected")) setLocalError(msg.slice(0, 100));
    } finally { setClaiming(false); }
  };

  const showError    = localError || error;
  const isProcessing = claiming || isLoading;

  const btnText = () => {
    if (isProcessing) return "处理中…";
    if (!isConnected) return "🔗 连接钱包并领取";
    if (nftClaimed && !welcomeClaimed) return "🪙 领取 20 PURR";
    return "🎁 免费领取 NFT + 20 PURR";
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(8px)" }}>
      <div className="relative w-full max-w-lg rounded-3xl overflow-hidden"
        style={{ background: "linear-gradient(145deg, #12102b, #1a1535)", border: "1px solid rgba(126,200,227,0.2)" }}>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 blur-3xl opacity-30 pointer-events-none"
          style={{ background: "radial-gradient(circle, #f7a541, transparent)" }} />
        <button onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center z-10"
          style={{ background: "rgba(109,58,238,0.08)", color: "#888", cursor: "pointer" }}>
          <X size={16} />
        </button>

        <div className="p-8 flex flex-col items-center gap-5 relative">
          {/* NFT 卡片 — 显示真实图片 */}
          <div className="relative">
            <div className="w-48 h-48 rounded-2xl overflow-hidden flex items-center justify-center"
              style={{
                background: portraitImg ? "transparent" : "linear-gradient(135deg, #1a1040, #2d1060)",
                border: "2px solid rgba(247,165,65,0.4)",
                boxShadow: "0 0 40px rgba(247,165,65,0.15)",
              }}>
              {portraitImg ? (
                <img src={portraitImg} alt="全家福 NFT" className="w-full h-full object-cover" />
              ) : (
                <div className="flex flex-col items-center">
                  <div className="text-6xl mb-2" style={{ filter: "drop-shadow(0 0 20px rgba(247,165,65,0.6))" }}>🐱</div>
                  <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "rgba(247,165,65,0.2)", color: "#f7a541" }}>Season 1</span>
                  <span className="text-sm mt-1 font-bold" style={{ color: "#e2d9f3" }}>猫咪全家福</span>
                </div>
              )}
            </div>
            <Sparkles size={20} color="#f7a541" className="absolute -top-2 -right-2 animate-spin" style={{ animationDuration: "3s" }} />
            <Sparkles size={14} color="#7ec8e3" className="absolute -bottom-2 -left-2 animate-spin" style={{ animationDuration: "4s" }} />
          </div>

          {(done || alreadyDone) ? (
            <div className="flex flex-col items-center gap-4 text-center w-full">
              <div className="text-5xl animate-bounce">🎊</div>
              <h2 className="text-xl font-black" style={{ color: "#f7a541" }}>
                {alreadyDone && !done ? "您已完成新手礼包领取！" : "领取成功！"}
              </h2>
              <p style={{ color: "#a09cc0" }}>
                已拥有 <span style={{ color: "#f7a541" }}>Season 1 全家福 NFT</span> 与{" "}
                <span style={{ color: "#4ecdc4" }}>20 $PURR</span>，快去浏览猫咪档案吧 🐱
              </p>
              <button onClick={onClose} className="w-full py-3 rounded-xl font-bold"
                style={{ background: "linear-gradient(135deg, #7ec8e3, #a855f7)", color: "#1e1b4b", cursor: "pointer" }}>
                开始探索猫咪档案 →
              </button>
            </div>
          ) : (
            <>
              <div className="text-center w-full">
                <h2 className="text-xl font-black mb-1" style={{ color: "#f7a541" }}>🎉 欢迎加入 PurrChain！</h2>
                {nftClaimed && !welcomeClaimed ? (
                  <p className="text-sm" style={{ color: "#a09cc0" }}>
                    检测到您已持有全家福 NFT，还差最后一步——领取{" "}
                    <span style={{ color: "#4ecdc4" }}>20 $PURR</span> 新手代币！
                  </p>
                ) : (
                  <p className="text-sm" style={{ color: "#a09cc0" }}>
                    作为新用户，免费领取<span style={{ color: "#f7a541" }}>当季全家福 NFT</span> 和{" "}
                    <span style={{ color: "#4ecdc4" }}>20 $PURR</span> 新手代币！
                  </p>
                )}
              </div>

              <div className="w-full space-y-2">
                {[
                  { icon: <Gift size={15} />, color: "#f7a541", done: nftClaimed, zh: "领取 Season 1 全家福 NFT" },
                  { icon: <Coins size={15} />, color: "#4ecdc4", done: welcomeClaimed, zh: "领取 20 $PURR 新手代币" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl"
                    style={{ background: "rgba(109,58,238,0.04)", border: `1px solid ${item.done ? item.color + "40" : "rgba(109,58,238,0.1)"}` }}>
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: `${item.color}20`, color: item.color }}>
                      {item.done ? <CheckCircle size={15} /> : item.icon}
                    </div>
                    <span className="text-sm flex-1" style={{ color: item.done ? item.color : "#a09cc0" }}>{item.zh}</span>
                    {item.done && <span className="text-xs font-semibold" style={{ color: item.color }}>✓ 已完成</span>}
                  </div>
                ))}
              </div>

              <div className="w-full p-3 rounded-xl text-xs text-center"
                style={{ background: "rgba(126,200,227,0.06)", border: "1px solid rgba(126,200,227,0.12)", color: "#7c7aaa" }}>
                <Heart size={11} className="inline mr-1" />
                每年有数万只流浪猫因缺乏资源而无法获救。PurrChain 让每一笔善意都透明可查，直达需要帮助的猫咪。
              </div>

              {showError && <p className="text-xs text-center" style={{ color: "#ff6b6b" }}>⚠️ {showError}</p>}

              <button onClick={handleClaim} disabled={isProcessing}
                className="w-full py-4 rounded-xl font-bold text-base flex items-center justify-center gap-2 transition-opacity hover:opacity-90 disabled:opacity-60"
                style={{ background: "linear-gradient(135deg, #f7a541, #ff6b6b)", color: "#1e1b4b", cursor: "pointer" }}>
                {isProcessing && <Loader2 size={16} className="animate-spin" />}
                {btnText()}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

