import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router";
import { Sparkles, ArrowLeft, Loader2, Package } from "lucide-react";
import { ethers } from "ethers";
import { Navbar } from "../components/Navbar";
import { useApp } from "../context/AppContext";
import { getContracts, getReadonlyContracts } from "../../lib/contracts";

const RARITY_CONFIG = {
  0: { zh: "普通", en: "Common",    color: "#9CA3AF", bg: "rgba(156,163,175,0.08)", border: "rgba(156,163,175,0.2)", pct: "60%" },
  1: { zh: "精良", en: "Fine",      color: "#34D399", bg: "rgba(52,211,153,0.08)",  border: "rgba(52,211,153,0.2)",  pct: "25%" },
  2: { zh: "稀有", en: "Rare",      color: "#60A5FA", bg: "rgba(96,165,250,0.08)",  border: "rgba(96,165,250,0.2)",  pct: "12%" },
  3: { zh: "传说", en: "Legendary", color: "#F59E0B", bg: "rgba(245,158,11,0.08)",  border: "rgba(245,158,11,0.25)", pct: "3%"  },
} as const;

const SLOT_CONFIG = {
  0: { zh: "武器", en: "Weapon", icon: "⚔️" },
  1: { zh: "背包", en: "Bag",    icon: "🎒" },
  2: { zh: "靴子", en: "Boots",  icon: "👟" },
} as const;

interface GachaResult {
  tokenId: number;
  slot: number;
  rarity: number;
  name: string;
  lore: string;
  rarityBonus: number;
  carryBonus: number;
  speedBonus: number;
}

export function Gacha() {
  const navigate = useNavigate();
  const { isConnected, signer, walletAddress, lang } = useApp();
  const isZh = lang === "zh";

  const [tickets,   setTickets]   = useState<number | null>(null);
  const [materials, setMaterials] = useState<number | null>(null);
  const [isRolling, setIsRolling] = useState(false);
  const [isMerging, setIsMerging] = useState(false);
  const [result,    setResult]    = useState<GachaResult | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [error,     setError]     = useState<string | null>(null);

  const loadStats = async () => {
    if (!walletAddress) return;
    try {
      const c = getReadonlyContracts();
      const [t, m] = await Promise.all([
        c.gameContract.gachaTickets(walletAddress),
        c.gameContract.materialBalance(walletAddress),
      ]);
      setTickets(Number(t));
      setMaterials(Number(m));
    } catch { /* ignore */ }
  };

  useEffect(() => { loadStats(); }, [walletAddress]);

  const handleMerge = async () => {
    if (!signer || !materials || materials < 10) return;
    setIsMerging(true); setError(null);
    try {
      const c = getContracts(signer);
      const tx = await c.gameContract.mergeFragments(1);
      await (tx as ethers.ContractTransactionResponse).wait();
      await loadStats();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "";
      if (!msg.includes("user rejected")) setError(isZh ? "合成失败，请重试" : "Merge failed, try again");
    } finally { setIsMerging(false); }
  };

  const handleGacha = async () => {
    if (!signer || !tickets || tickets < 1) return;
    setIsRolling(true); setError(null); setResult(null);
    try {
      const c = getContracts(signer);
      const tx = await c.gameContract.gacha();
      const receipt = await (tx as ethers.ContractTransactionResponse).wait();

      let equipTokenId: number | null = null;
      if (receipt) {
        for (const log of receipt.logs) {
          try {
            const iface = new ethers.Interface(["event GachaResult(address indexed player, uint256 equipTokenId, uint8 rarity)"]);
            const parsed = iface.parseLog({ topics: log.topics as string[], data: log.data });
            if (parsed) { equipTokenId = Number(parsed.args[1]); break; }
          } catch { /* not this log */ }
        }
      }

      if (equipTokenId !== null) {
        const eq = await getReadonlyContracts().equipmentNFT.getEquipment(equipTokenId);
        const e = eq as { slot: number; rarity: number; name: string; lore: string; rarityBonus: number; carryBonus: number; speedBonus: number };
        setResult({ tokenId: equipTokenId, slot: Number(e.slot), rarity: Number(e.rarity), name: e.name, lore: e.lore, rarityBonus: Number(e.rarityBonus), carryBonus: Number(e.carryBonus), speedBonus: Number(e.speedBonus) });
        setShowResult(true);
      }
      await loadStats();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "";
      if (!msg.includes("user rejected")) setError(isZh ? "抽卡失败，请重试" : "Gacha failed, please retry");
    } finally { setIsRolling(false); }
  };

  const hasTickets = tickets !== null && tickets > 0;
  const canMerge   = isConnected && materials !== null && materials >= 10;

  return (
    <div className="min-h-screen" style={{ background: "#fffbf5", fontFamily: "'Nunito', sans-serif" }}>
      <Navbar />

      {/* 背景装饰 */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] rounded-full opacity-15"
          style={{ background: "radial-gradient(ellipse, #F97316 0%, transparent 70%)" }} />
        <div className="absolute bottom-0 right-0 w-64 h-64 rounded-full opacity-10"
          style={{ background: "radial-gradient(ellipse, #fbbf24 0%, transparent 70%)" }} />
      </div>

      <div className="relative max-w-2xl mx-auto px-4 pt-24 pb-16">

        <motion.button initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate(-1)} className="flex items-center gap-2 mb-8 text-sm" style={{ color: "#b45309", cursor: "pointer" }}>
          <ArrowLeft size={16} />{isZh ? "返回" : "Back"}
        </motion.button>

        {/* 标题 */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <div className="text-5xl mb-3">✨</div>
          <h1 className="font-black mb-2" style={{ color: "#92400e", fontFamily: "'Space Grotesk', sans-serif", fontSize: "1.8rem" }}>
            {isZh ? "装备抽卡" : "Equipment Gacha"}
          </h1>
          <p className="text-sm" style={{ color: "#b45309" }}>
            {isZh ? "消耗抽卡券获得随机装备 NFT" : "Spend tickets to get random equipment NFTs"}
          </p>
        </motion.div>

        {/* 资产卡片 */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="p-5 rounded-2xl text-center"
            style={{ background: "white", border: "1px solid rgba(249,115,22,0.15)", boxShadow: "0 2px 12px rgba(249,115,22,0.06)" }}>
            <div className="text-3xl font-black mb-1" style={{ color: "#F97316", fontFamily: "'Space Grotesk', sans-serif" }}>
              {tickets === null ? "…" : tickets}
            </div>
            <div className="text-xs font-medium" style={{ color: "#b45309" }}>🎟️ {isZh ? "抽卡券" : "Tickets"}</div>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            className="p-5 rounded-2xl text-center"
            style={{ background: "white", border: "1px solid rgba(168,85,247,0.15)", boxShadow: "0 2px 12px rgba(168,85,247,0.06)" }}>
            <div className="text-3xl font-black mb-1" style={{ color: "#a855f7", fontFamily: "'Space Grotesk', sans-serif" }}>
              {materials === null ? "…" : materials}
            </div>
            <div className="text-xs font-medium" style={{ color: "#b45309" }}>🔩 {isZh ? "材料碎片" : "Fragments"}</div>
          </motion.div>
        </div>

        {/* 碎片合成 */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="mb-5 p-4 rounded-2xl"
          style={{ background: "white", border: "1px solid rgba(249,115,22,0.12)", boxShadow: "0 2px 8px rgba(249,115,22,0.04)" }}>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-bold mb-0.5" style={{ color: "#92400e" }}>{isZh ? "碎片合成" : "Merge Fragments"}</div>
              <div className="text-xs" style={{ color: "#b45309" }}>
                {isZh ? "10 碎片 → 1 抽卡券" : "10 fragments → 1 ticket"}
                {materials !== null && <span className="ml-2" style={{ color: "#d97706" }}>({isZh ? `可合成 ${Math.floor(materials / 10)} 张` : `Can merge ${Math.floor(materials / 10)}`})</span>}
              </div>
            </div>
            <button onClick={handleMerge} disabled={isMerging || !canMerge}
              className="px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2"
              style={{
                background: canMerge ? "linear-gradient(135deg,#F97316,#fbbf24)" : "rgba(249,115,22,0.08)",
                color: canMerge ? "white" : "rgba(180,120,50,0.4)",
                cursor: canMerge ? "pointer" : "default",
                boxShadow: canMerge ? "0 4px 12px rgba(249,115,22,0.25)" : "none",
              }}>
              {isMerging && <Loader2 size={14} className="animate-spin" />}
              <Package size={14} />
              {isZh ? "合成" : "Merge"}
            </button>
          </div>
          {/* 进度条 */}
          {materials !== null && (
            <div className="mt-3">
              <div className="w-full rounded-full h-1.5 overflow-hidden" style={{ background: "rgba(249,115,22,0.08)" }}>
                <div className="h-1.5 rounded-full transition-all"
                  style={{ width: `${(materials % 10) * 10}%`, background: "linear-gradient(90deg,#a855f7,#F97316)" }} />
              </div>
              <div className="text-xs mt-1 text-right" style={{ color: "#d97706" }}>{materials % 10}/10</div>
            </div>
          )}
        </motion.div>

        {/* 稀有度说明 */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          className="grid grid-cols-4 gap-2 mb-6">
          {(Object.entries(RARITY_CONFIG) as [string, typeof RARITY_CONFIG[keyof typeof RARITY_CONFIG]][]).map(([k, v]) => (
            <div key={k} className="p-3 rounded-xl text-center"
              style={{ background: v.bg, border: `1px solid ${v.border}` }}>
              <div className="text-xs font-bold mb-0.5" style={{ color: v.color }}>{isZh ? v.zh : v.en}</div>
              <div className="text-xs" style={{ color: "#b45309" }}>{v.pct}</div>
            </div>
          ))}
        </motion.div>

        {/* 错误提示 */}
        {error && (
          <div className="mb-4 p-3 rounded-xl text-sm text-center"
            style={{ background: "rgba(239,68,68,0.06)", color: "#dc2626", border: "1px solid rgba(239,68,68,0.15)" }}>
            {error}
          </div>
        )}

        {/* 抽卡按钮 */}
        {!isConnected ? (
          <div className="text-center py-6 rounded-2xl" style={{ background: "rgba(249,115,22,0.04)", border: "1px solid rgba(249,115,22,0.1)" }}>
            <p className="text-sm font-medium" style={{ color: "#b45309" }}>{isZh ? "请先连接钱包" : "Connect wallet first"}</p>
          </div>
        ) : (
          <motion.button whileHover={{ scale: hasTickets ? 1.02 : 1 }} whileTap={{ scale: 0.98 }}
            onClick={handleGacha} disabled={isRolling || !hasTickets}
            className="w-full py-5 rounded-2xl font-black text-base flex items-center justify-center gap-3"
            style={{
              background: hasTickets ? "linear-gradient(135deg,#F97316,#fbbf24)" : "rgba(249,115,22,0.08)",
              color: hasTickets ? "white" : "rgba(180,120,50,0.4)",
              cursor: hasTickets ? "pointer" : "default",
              boxShadow: hasTickets ? "0 6px 28px rgba(249,115,22,0.35)" : "none",
            }}>
            {isRolling
              ? <><Loader2 size={20} className="animate-spin" />{isZh ? "抽取中…" : "Rolling…"}</>
              : <><Sparkles size={20} />{isZh ? "抽取装备（消耗 1 券）" : "Roll Equipment (1 ticket)"}</>}
          </motion.button>
        )}

        {/* 获取途径 */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="mt-6 p-4 rounded-2xl"
          style={{ background: "white", border: "1px solid rgba(249,115,22,0.1)", boxShadow: "0 2px 8px rgba(249,115,22,0.04)" }}>
          <div className="text-xs font-bold mb-3" style={{ color: "#92400e" }}>
            🎟️ {isZh ? "如何获得抽卡券" : "How to get tickets"}
          </div>
          {[
            { icon: "🐱", zh: "持有猫咪 NFT 每 7 天领取 1 张（点周券领取）", en: "Hold Cat NFT → claim 1/week" },
            { icon: "💰", zh: "每消费 50 PURR 自动奖励 1 张",              en: "Spend 50 PURR → earn 1 ticket automatically" },
            { icon: "🔩", zh: "10 个材料碎片合成 1 张（上方按钮）",         en: "10 fragments → merge 1 ticket (above)" },
          ].map(item => (
            <div key={item.zh} className="flex items-center gap-2 py-1.5 text-xs"
              style={{ color: "#b45309", borderBottom: "1px solid rgba(249,115,22,0.06)" }}>
              <span>{item.icon}</span>
              <span>{isZh ? item.zh : item.en}</span>
            </div>
          ))}
        </motion.div>
      </div>

      {/* ── 抽卡结果弹窗 ── */}
      <AnimatePresence>
        {showResult && result && (() => {
          const rarity = RARITY_CONFIG[result.rarity as keyof typeof RARITY_CONFIG];
          const slot   = SLOT_CONFIG[result.slot as keyof typeof SLOT_CONFIG];
          return (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4"
              style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(12px)" }}>
              <motion.div
                initial={{ scale: 0.7, opacity: 0, y: 30 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ type: "spring", damping: 14 }}
                className="relative w-full max-w-sm rounded-3xl p-8 text-center"
                style={{
                  background: "#fffbf5",
                  border: `2px solid ${rarity.border}`,
                  boxShadow: `0 0 60px ${rarity.color}30`,
                }}>
                {/* 稀有度光晕 */}
                <div className="absolute inset-0 rounded-3xl pointer-events-none"
                  style={{ background: `radial-gradient(ellipse at top, ${rarity.bg}, transparent 60%)` }} />

                <div className="relative">
                  <div className="text-6xl mb-4">{slot.icon}</div>
                  <div className="text-xs mb-2 px-3 py-1 rounded-full inline-block font-bold"
                    style={{ background: rarity.bg, color: rarity.color, border: `1px solid ${rarity.border}` }}>
                    {isZh ? rarity.zh : rarity.en} · {isZh ? slot.zh : slot.en}
                  </div>
                  <h2 className="text-xl font-black mt-2 mb-2" style={{ color: "#92400e", fontFamily: "'Space Grotesk', sans-serif" }}>
                    {result.name}
                  </h2>
                  <p className="text-sm mb-5 leading-relaxed" style={{ color: "#b45309" }}>{result.lore}</p>

                  <div className="grid grid-cols-3 gap-2 mb-6">
                    {[
                      { label: isZh ? "稀有加成" : "Rarity+", value: `+${(result.rarityBonus / 100).toFixed(1)}%`, color: "#F97316" },
                      { label: isZh ? "携带加成" : "Carry+",  value: `+${(result.carryBonus  / 100).toFixed(1)}%`, color: "#a855f7" },
                      { label: isZh ? "速度加成" : "Speed+",  value: `+${(result.speedBonus  / 100).toFixed(1)}%`, color: "#34D399" },
                    ].map(stat => (
                      <div key={stat.label} className="p-2.5 rounded-xl"
                        style={{ background: "rgba(249,115,22,0.06)", border: "1px solid rgba(249,115,22,0.1)" }}>
                        <div className="text-xs mb-0.5" style={{ color: "#b45309" }}>{stat.label}</div>
                        <div className="text-sm font-black" style={{ color: stat.color }}>{stat.value}</div>
                      </div>
                    ))}
                  </div>

                  <p className="text-xs mb-4" style={{ color: "#d97706" }}>
                    Token #{result.tokenId} · {isZh ? "已存入您的背包" : "Added to your bag"}
                  </p>

                  <button onClick={() => setShowResult(false)}
                    className="w-full py-3.5 rounded-2xl text-white font-black text-sm"
                    style={{ background: "linear-gradient(135deg,#F97316,#fbbf24)", cursor: "pointer", boxShadow: "0 4px 16px rgba(249,115,22,0.3)" }}>
                    {isZh ? "收入背包！" : "Collect!"}
                  </button>
                </div>
              </motion.div>
            </div>
          );
        })()}
      </AnimatePresence>
    </div>
  );
}
