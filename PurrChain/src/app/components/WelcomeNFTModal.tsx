import { useState, useEffect } from "react";
import { X, Gift, Coins, Heart, Sparkles } from "lucide-react";
import { motion } from "motion/react";
import { useApp } from "../context/AppContext";

interface WelcomeNFTModalProps {
  onClose: () => void;
}

export function WelcomeNFTModal({ onClose }: WelcomeNFTModalProps) {
  const { claimFamilyPortrait, claimWelcomeTokens, welcomeClaimed, nftClaimed } = useApp();
  const [step, setStep] = useState(0);
  useEffect(() => {
    if (nftClaimed && step === 0) setStep(1);
    if (welcomeClaimed && step <= 1) setStep(2);
  }, [nftClaimed, welcomeClaimed]);
  const [nftAnimating, setNftAnimating] = useState(false);
  const [purrAnimating, setPurrAnimating] = useState(false);

  const handleClaimNFT = async () => {
    setNftAnimating(true);
    try {
      await claimFamilyPortrait();
      setStep(1);
    } catch {
      // error handled in AppContext
    } finally {
      setNftAnimating(false);
    }
  };

  const handleClaimPURR = async () => {
    setPurrAnimating(true);
    try {
      await claimWelcomeTokens();
      setStep(2);
    } catch {
      // error handled in AppContext
    } finally {
      setPurrAnimating(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(8px)" }}
    >
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.85, opacity: 0 }}
        transition={{ type: "spring", duration: 0.5 }}
        className="relative w-full max-w-md rounded-3xl overflow-hidden"
        style={{
          background: "linear-gradient(145deg, #0D0D2B, #1A1040)",
          border: "1px solid rgba(167,139,250,0.3)",
          boxShadow: "0 0 60px rgba(124,58,237,0.4)",
        }}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full"
          style={{ background: "rgba(255,255,255,0.1)", color: "#4c4980", cursor: "pointer" }}
        >
          <X size={16} />
        </button>

        {/* Header glow */}
        <div
          className="absolute top-0 left-0 right-0 h-48 pointer-events-none"
          style={{ background: "radial-gradient(ellipse at top, rgba(124,58,237,0.3) 0%, transparent 70%)" }}
        />

        <div className="relative p-6">
          {/* Season NFT Card */}
          <div className="relative mx-auto w-48 h-64 rounded-2xl overflow-hidden mb-4"
            style={{ boxShadow: "0 0 40px rgba(124,58,237,0.6), 0 0 80px rgba(6,182,212,0.2)" }}>
            <img
              src="https://images.unsplash.com/photo-1770181180521-c1fdac4f3b33?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400"
              alt="Season 1 Family Portrait NFT"
              className="w-full h-full object-cover"
            />
            <div
              className="absolute inset-0"
              style={{ background: "linear-gradient(to bottom, transparent 40%, rgba(13,13,43,0.8) 100%)" }}
            />
            <div className="absolute bottom-3 left-3 right-3">
              <div className="text-xs mb-1" style={{ color: "#A78BFA", fontFamily: "'Space Grotesk', sans-serif" }}>
                ✨ Season 1
              </div>
              <div className="text-sm text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                猫咪全家福 NFT
              </div>
              <div className="text-xs mt-1" style={{ color: "#06B6D4" }}>每个钱包地址仅限一枚</div>
            </div>
            {nftAnimating && (
              <div
                className="absolute inset-0 animate-pulse"
                style={{ background: "linear-gradient(45deg, transparent, rgba(167,139,250,0.5), transparent)" }}
              />
            )}
          </div>

          {/* Step 0: 领取 NFT */}
          {step === 0 && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <h2 className="text-center mb-2" style={{ color: "#1e1b4b", fontFamily: "'Space Grotesk', sans-serif" }}>
                🎉 欢迎加入 PurrChain！
              </h2>
              <p className="text-center text-sm mb-4" style={{ color: "#4c4980", fontFamily: "'Nunito', sans-serif" }}>
                领取当季猫咪全家福 NFT，开始你的爱猫之旅
              </p>

              <div className="rounded-2xl p-4 mb-4" style={{ background: "rgba(109,58,238,0.06)", border: "1px solid rgba(109,58,238,0.08)" }}>
                <div className="flex items-center gap-2 mb-2">
                  <Heart size={14} className="text-rose-400" />
                  <span className="text-xs" style={{ color: "#FCA5A5", fontFamily: "'Space Grotesk', sans-serif" }}>为什么帮助猫咪？</span>
                </div>
                <p className="text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.55)", fontFamily: "'Nunito', sans-serif" }}>
                  每年有数百万只猫咪在收容所等待领养。PurrChain 通过区块链技术，让每一笔捐款透明可查，直达收容机构，帮助更多猫咪找到温暖的家。
                </p>
              </div>

              <div className="flex items-center gap-2 mb-4 p-3 rounded-xl" style={{ background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.2)" }}>
                <Sparkles size={14} style={{ color: "#A78BFA" }} />
                <span className="text-xs" style={{ color: "#C4B5FD", fontFamily: "'Nunito', sans-serif" }}>
                  不同季节的全家福 NFT 图案各不相同，越早领越珍贵！
                </span>
              </div>

              <button
                onClick={handleClaimNFT}
                disabled={nftClaimed || nftAnimating}
                className="w-full py-3 rounded-2xl text-white flex items-center justify-center gap-2 transition-all"
                style={{
                  background: nftClaimed ? "rgba(255,255,255,0.1)" : "linear-gradient(135deg, #7C3AED, #06B6D4)",
                  boxShadow: nftClaimed ? "none" : "0 0 30px rgba(124,58,237,0.5)",
                  fontFamily: "'Nunito', sans-serif",
                  cursor: nftClaimed ? "default" : "pointer",
                  opacity: nftAnimating ? 0.7 : 1,
                }}
              >
                <Gift size={16} />
                {nftAnimating ? "链上确认中..." : nftClaimed ? "已领取" : "免费领取全家福 NFT"}
              </button>
            </motion.div>
          )}

          {/* Step 1: 领取 PURR */}
          {step === 1 && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <h2 className="text-center mb-2" style={{ color: "#1e1b4b", fontFamily: "'Space Grotesk', sans-serif" }}>
                🎊 NFT 领取成功！
              </h2>
              <p className="text-center text-sm mb-4" style={{ color: "#4c4980", fontFamily: "'Nunito', sans-serif" }}>
                你还可以领取 20 $PURR 游戏代币
              </p>

              <div className="rounded-2xl p-4 mb-4" style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.2)" }}>
                <div className="flex items-center gap-3">
                  <div className="text-3xl">🪙</div>
                  <div>
                    <div className="text-sm" style={{ color: "#FCD34D", fontFamily: "'Space Grotesk', sans-serif" }}>
                      +20 $PURR 代币
                    </div>
                    <div className="text-xs" style={{ color: "#7c7aaa", fontFamily: "'Nunito', sans-serif" }}>
                      用于购买游戏道具、升级装备
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-xs text-center mb-4" style={{ color: "#7c7aaa", fontFamily: "'Nunito', sans-serif" }}>
                每个钱包地址仅可领取一次
              </div>

              <button
                onClick={handleClaimPURR}
                disabled={welcomeClaimed || purrAnimating}
                className="w-full py-3 rounded-2xl text-white flex items-center justify-center gap-2 transition-all"
                style={{
                  background: welcomeClaimed ? "rgba(255,255,255,0.1)" : "linear-gradient(135deg, #D97706, #F59E0B)",
                  boxShadow: welcomeClaimed ? "none" : "0 0 30px rgba(245,158,11,0.4)",
                  fontFamily: "'Nunito', sans-serif",
                  cursor: welcomeClaimed ? "default" : "pointer",
                  opacity: purrAnimating ? 0.7 : 1,
                }}
              >
                <Coins size={16} />
                {purrAnimating ? "链上确认中..." : welcomeClaimed ? "已领取" : "领取 20 $PURR"}
              </button>
            </motion.div>
          )}

          {/* Step 2: 完成 */}
          {step === 2 && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center">
              <div className="text-4xl mb-3">🐾</div>
              <h2 className="mb-2" style={{ color: "#1e1b4b", fontFamily: "'Space Grotesk', sans-serif" }}>
                一切准备就绪！
              </h2>
              <p className="text-sm mb-4" style={{ color: "#4c4980", fontFamily: "'Nunito', sans-serif" }}>
                开始探索猫咪档案，找到你心仪的猫咪吧！
              </p>
              <button
                onClick={onClose}
                className="w-full py-3 rounded-2xl text-white transition-all"
                style={{
                  background: "linear-gradient(135deg, #7C3AED, #06B6D4)",
                  boxShadow: "0 0 30px rgba(124,58,237,0.4)",
                  fontFamily: "'Nunito', sans-serif",
                  cursor: "pointer",
                }}
              >
                浏览猫咪档案 →
              </button>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
