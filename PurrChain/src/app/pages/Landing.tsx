import { useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { Wallet, Building2, Shield, Coins, Gamepad2, Heart, ExternalLink } from "lucide-react";
import { useApp } from "../context/AppContext";
import { Navbar } from "../components/Navbar";

// ── 浮动粒子背景（暖色调） ──────────────────────────────────
function WarmParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const particles: { x: number; y: number; r: number; alpha: number; speed: number; color: string }[] = [];
    const colors = ["rgba(249,115,22,", "rgba(251,191,36,", "rgba(234,88,12,", "rgba(252,211,77,"];
    for (let i = 0; i < 120; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 2 + 0.5,
        alpha: Math.random(),
        speed: Math.random() * 0.3 + 0.05,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }
    let animId: number;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.alpha += p.speed * 0.015;
        const a = (Math.sin(p.alpha) + 1) / 2;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `${p.color}${(a * 0.5).toFixed(2)})`;
        ctx.fill();
      });
      animId = requestAnimationFrame(draw);
    };
    draw();
    const handleResize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    window.addEventListener("resize", handleResize);
    return () => { cancelAnimationFrame(animId); window.removeEventListener("resize", handleResize); };
  }, []);
  return <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />;
}

// ── 内容数据 ──────────────────────────────────────────────
const FEATURES = [
  {
    icon: <Shield size={24} />,
    color: "#F97316",
    zh: { title: "区块链透明", desc: "所有捐款流向链上公开，直达机构钱包，平台完全不经手，真正做到透明可查。" },
    en: { title: "On-chain Transparent", desc: "All donation flows are public on-chain, sent directly to shelter wallets. Zero platform handling." },
  },
  {
    icon: <Heart size={24} />,
    color: "#ef4444",
    zh: { title: "真实领养", desc: "每只猫咪都有真实档案，支持线下领养。保证金制度保障猫咪健康归宿。" },
    en: { title: "Real Adoption", desc: "Every cat has a verified on-chain profile. Deposit system ensures healthy rehoming." },
  },
  {
    icon: <Coins size={24} />,
    color: "#fbbf24",
    zh: { title: "动态成长 NFT", desc: "云领养的猫咪随时间成长，NFT 图案随之更新。真实领养更可获得 Genesis 专属 NFT。" },
    en: { title: "Dynamic Growth NFT", desc: "Cloud-adopted cats grow over time, updating their NFT artwork. Real adoption unlocks Genesis NFT." },
  },
  {
    icon: <Gamepad2 size={24} />,
    color: "#a855f7",
    zh: { title: "放置类游戏", desc: "选择你的初始猫咪，派它出去探险。归来时带回稀有道具和 NFT，寓教于乐。" },
    en: { title: "Idle Game", desc: "Pick your starter cat and send it on adventures. Bring back rare items and NFTs on return." },
  },
];

const STEPS = [
  {
    num: "01",
    zh: { title: "连接钱包", desc: "使用 MetaMask 连接 Avalanche Fuji 测试网" },
    en: { title: "Connect Wallet", desc: "Connect MetaMask to Avalanche Fuji Testnet" },
  },
  {
    num: "02",
    zh: { title: "领取全家福 NFT", desc: "每季限量全家福 NFT，每个地址仅限一枚" },
    en: { title: "Claim Family Portrait NFT", desc: "Seasonal limited NFT, one per address" },
  },
  {
    num: "03",
    zh: { title: "领取 20 $PURR", desc: "初始游戏代币，用于购买道具和装备" },
    en: { title: "Claim 20 $PURR", desc: "Starter tokens to buy items and equipment" },
  },
  {
    num: "04",
    zh: { title: "选择你的猫咪", desc: "从真实收容猫咪档案中选择初始伙伴" },
    en: { title: "Choose Your Cat", desc: "Pick your starter companion from real shelter cats" },
  },
];

const STATS = [
  { zh: "链上资产",    en: "On-chain",    value: "100%", note: { zh: "透明", en: "Transparent" } },
  { zh: "平台手续费",  en: "Platform Fee", value: "0%",  note: { zh: "零抽成", en: "Zero" } },
  { zh: "捐款到账",    en: "Direct",       value: "直达", note: { zh: "机构钱包", en: "To Shelter" } },
  { zh: "NFT 成长",    en: "NFT Growth",   value: "动态", note: { zh: "同步更新", en: "Dynamic" } },
];

export function Landing() {
  const { isConnected, connectWallet, lang } = useApp();
  const navigate = useNavigate();
  const isZh = lang === "zh";

  const handleConnectAndGo = () => {
    if (!isConnected) connectWallet();
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen relative overflow-x-hidden" style={{ background: "#fffbf5", fontFamily: "'Nunito', sans-serif" }}>
      <Navbar />
      <WarmParticles />

      {/* Warm gradient orbs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[600px] rounded-full opacity-20"
          style={{ background: "radial-gradient(ellipse, #F97316 0%, transparent 70%)" }} />
        <div className="absolute top-1/3 -left-40 w-96 h-96 rounded-full opacity-10"
          style={{ background: "radial-gradient(ellipse, #fbbf24 0%, transparent 70%)" }} />
        <div className="absolute top-1/2 -right-40 w-96 h-96 rounded-full opacity-10"
          style={{ background: "radial-gradient(ellipse, #ef4444 0%, transparent 70%)" }} />
      </div>

      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 pt-20">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>

          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs mb-6"
            style={{ background: "rgba(249,115,22,0.12)", border: "1px solid rgba(249,115,22,0.3)", color: "#c2410c" }}>
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "#F97316" }} />
            {isZh ? "部署在 Avalanche C-Chain · Fuji 测试网" : "Deployed on Avalanche C-Chain · Fuji Testnet"}
            <ExternalLink size={10} />
          </div>

          {/* Title */}
          <h1 className="mb-4" style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: "clamp(2.5rem, 8vw, 5rem)",
            fontWeight: 900, lineHeight: 1.1, letterSpacing: "-0.02em",
          }}>
            <span style={{ background: "linear-gradient(135deg, #F97316, #fbbf24)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Purr
            </span>
            <span style={{ color: "#92400e" }}>Chain</span>
          </h1>

          <div className="text-5xl mb-6">🐾</div>

          <p className="max-w-xl mx-auto mb-8 text-lg" style={{ color: "#78350f", lineHeight: 1.7 }}>
            {isZh
              ? <>去中心化猫咪领养平台。用区块链记录每一只猫的故事，<br className="hidden sm:block" />让每一笔捐款都透明可查，直达收容机构。</>
              : <>Decentralized cat adoption platform. Record every cat's story on the blockchain,<br className="hidden sm:block" />making every donation transparent and direct.</>
            }
          </p>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <motion.button
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}
              onClick={handleConnectAndGo}
              className="flex items-center gap-2 px-8 py-4 rounded-2xl text-white text-base font-bold"
              style={{ background: "linear-gradient(135deg, #F97316, #fbbf24)", boxShadow: "0 0 40px rgba(249,115,22,0.4)", fontFamily: "'Space Grotesk', sans-serif", cursor: "pointer" }}>
              <Wallet size={18} />
              {isConnected
                ? (isZh ? "进入猫咪档案" : "View Cat Registry")
                : (isZh ? "连接钱包 · 用户入场" : "Connect Wallet · Get Started")}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}
              onClick={() => navigate("/institution/register")}
              className="flex items-center gap-2 px-8 py-4 rounded-2xl text-base font-bold"
              style={{ background: "rgba(249,115,22,0.08)", border: "1px solid rgba(249,115,22,0.25)", color: "#92400e", fontFamily: "'Space Grotesk', sans-serif", cursor: "pointer" }}>
              <Building2 size={18} />
              {isZh ? "机构注册入驻" : "Register Institution"}
            </motion.button>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.8 }}
          className="mt-20 grid grid-cols-2 sm:grid-cols-4 gap-4 w-full max-w-2xl">
          {STATS.map((s, i) => (
            <div key={i} className="text-center p-4 rounded-2xl"
              style={{ background: "rgba(249,115,22,0.06)", border: "1px solid rgba(249,115,22,0.12)" }}>
              <div className="text-2xl font-black mb-0.5" style={{ color: "#F97316", fontFamily: "'Space Grotesk', sans-serif" }}>
                {s.value}
              </div>
              <div className="text-xs font-semibold" style={{ color: "#b45309" }}>
                {isZh ? s.zh : s.en}
              </div>
              <div className="text-xs mt-0.5" style={{ color: "#d97706" }}>
                {isZh ? s.note.zh : s.note.en}
              </div>
            </div>
          ))}
        </motion.div>

        <div className="mt-12 text-xs animate-bounce" style={{ color: "#d97706" }}>
          {isZh ? "向下探索" : "Scroll to explore"} ↓
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────── */}
      <section className="relative py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.6 }}
            className="text-center mb-14">
            <h2 className="text-3xl font-black mb-3" style={{ color: "#92400e", fontFamily: "'Space Grotesk', sans-serif" }}>
              {isZh ? "为什么选择 PurrChain？" : "Why PurrChain?"}
            </h2>
            <p className="text-sm max-w-md mx-auto" style={{ color: "#b45309" }}>
              {isZh ? "用 Web3 技术解决传统领养中信任缺失的问题" : "Using Web3 to solve trust issues in traditional adoption"}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {FEATURES.map((f, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="p-6 rounded-3xl"
                style={{ background: "#fff9f5", border: "1px solid rgba(249,115,22,0.12)", boxShadow: "0 4px 16px rgba(249,115,22,0.06)" }}>
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4"
                  style={{ background: `${f.color}18`, color: f.color, border: `1px solid ${f.color}30` }}>
                  {f.icon}
                </div>
                <h3 className="font-black mb-2" style={{ color: "#92400e", fontFamily: "'Space Grotesk', sans-serif" }}>
                  {isZh ? f.zh.title : f.en.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: "#b45309" }}>
                  {isZh ? f.zh.desc : f.en.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────── */}
      <section className="relative py-24 px-6" style={{ background: "rgba(249,115,22,0.03)" }}>
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.6 }}
            className="text-center mb-14">
            <h2 className="text-3xl font-black mb-3" style={{ color: "#92400e", fontFamily: "'Space Grotesk', sans-serif" }}>
              {isZh ? "四步开始你的旅程" : "Get Started in 4 Steps"}
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {STEPS.map((s, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="relative p-6 rounded-3xl"
                style={{ background: "#fff9f5", border: "1px solid rgba(249,115,22,0.12)" }}>
                <div className="text-4xl font-black mb-3" style={{ color: "rgba(249,115,22,0.15)", fontFamily: "'Space Grotesk', sans-serif" }}>
                  {s.num}
                </div>
                <h3 className="font-black mb-2" style={{ color: "#92400e" }}>
                  {isZh ? s.zh.title : s.en.title}
                </h3>
                <p className="text-xs leading-relaxed" style={{ color: "#b45309" }}>
                  {isZh ? s.zh.desc : s.en.desc}
                </p>
                {i < STEPS.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-3 w-5 h-0.5 z-10" style={{ background: "rgba(249,115,22,0.3)" }} />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Footer ───────────────────────────────────── */}
      <section className="relative py-24 px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}>
          <div className="text-5xl mb-4">🐱</div>
          <h2 className="text-3xl font-black mb-4" style={{ color: "#92400e", fontFamily: "'Space Grotesk', sans-serif" }}>
            {isZh ? "每只猫咪都值得被记住" : "Every cat deserves to be remembered"}
          </h2>
          <p className="text-sm mb-8 max-w-md mx-auto" style={{ color: "#b45309" }}>
            {isZh
              ? "加入 PurrChain，用区块链的力量为流浪猫咪撑起一片温暖的天空"
              : "Join PurrChain and use the power of blockchain to give stray cats a warm home"}
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}
            onClick={handleConnectAndGo}
            className="px-10 py-4 rounded-2xl text-white font-bold text-base"
            style={{ background: "linear-gradient(135deg, #F97316, #fbbf24)", boxShadow: "0 0 40px rgba(249,115,22,0.35)", fontFamily: "'Space Grotesk', sans-serif", cursor: "pointer" }}>
            {isZh ? "立即开始 →" : "Start Now →"}
          </motion.button>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="relative border-t py-8 px-6 text-center" style={{ borderColor: "rgba(249,115,22,0.12)" }}>
        <p className="text-xs" style={{ color: "#b45309" }}>
          PurrChain · {isZh ? "部署在" : "Deployed on"} Avalanche Fuji C-Chain (chainId: 43113)
          {" · "}{isZh ? "平台不经手任何捐款" : "Zero platform custody of donations"}
        </p>
      </footer>
    </div>
  );
}
