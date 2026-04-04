import { Link } from "react-router";
import { Heart, Shield, Gamepad2, Coins, ArrowRight, ChevronDown, Globe, Lock, Zap } from "lucide-react";

export function LandingPage() {
  return (
    <div className="min-h-screen" style={{ background: "#f7f5ff", color: "#1e1b4b" }}>
      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-10 blur-3xl"
            style={{ background: "radial-gradient(circle, #7ec8e3, transparent)" }} />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full opacity-10 blur-3xl"
            style={{ background: "radial-gradient(circle, #f7a541, transparent)" }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-5 blur-3xl"
            style={{ background: "radial-gradient(circle, #a855f7, transparent)" }} />
          {/* Grid */}
          <div className="absolute inset-0" style={{
            backgroundImage: "linear-gradient(rgba(126,200,227,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(126,200,227,0.05) 1px, transparent 1px)",
            backgroundSize: "60px 60px"
          }} />
        </div>

        {/* Cat emoji floating */}
        <div className="relative z-10 flex flex-col items-center gap-8 max-w-4xl">
          <div className="flex items-center gap-3 px-4 py-2 rounded-full text-sm"
            style={{ background: "rgba(126,200,227,0.1)", border: "1px solid rgba(126,200,227,0.25)", color: "#7ec8e3" }}>
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            部署于 Avalanche C-Chain · Fuji 测试网
          </div>

          <div className="text-8xl mb-2 select-none" style={{ filter: "drop-shadow(0 0 30px rgba(247,165,65,0.5))" }}>
            🐱
          </div>

          <h1 className="text-5xl sm:text-7xl" style={{ fontWeight: 900, lineHeight: 1.1, letterSpacing: "-0.02em" }}>
            <span style={{ color: "#1e1b4b" }}>Purr</span>
            <span style={{ background: "linear-gradient(135deg, #7ec8e3, #a855f7)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Chain</span>
          </h1>

          <p className="text-xl sm:text-2xl max-w-2xl" style={{ color: "#4c4980", lineHeight: 1.6 }}>
            去中心化猫咪领养平台<br />
            <span style={{ color: "#f7a541" }}>用区块链的力量，守护每一只流浪猫咪</span>
          </p>

          <p className="text-base max-w-xl" style={{ color: "#7c7aaa", lineHeight: 1.8 }}>
            通过捐款支持真实收容所，获得动态成长 NFT，
            在放置类游戏中养育虚拟猫咪。
            所有资金流向链上透明可查，捐款直达机构钱包，平台不经手。
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            <Link to="/login"
              className="flex items-center justify-center gap-2 px-8 py-4 rounded-full transition-all hover:scale-105"
              style={{ background: "linear-gradient(135deg, #f7a541, #ff6b6b)", color: "#fff", fontWeight: 700, fontSize: "1.05rem" }}>
              进入平台
              <ArrowRight size={18} />
            </Link>
            <Link to="/register"
              className="flex items-center justify-center gap-2 px-8 py-4 rounded-full transition-all hover:scale-105"
              style={{ background: "rgba(126,200,227,0.1)", border: "1px solid rgba(126,200,227,0.35)", color: "#7ec8e3", fontWeight: 600, fontSize: "1.05rem" }}>
              机构注册
            </Link>
          </div>
        </div>

        <div className="absolute bottom-8 flex flex-col items-center gap-2 animate-bounce" style={{ color: "#444" }}>
          <span className="text-sm">了解更多</span>
          <ChevronDown size={20} />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-6 max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl mb-4" style={{ color: "#1e1b4b", fontWeight: 800 }}>为什么是 PurrChain？</h2>
          <p style={{ color: "#7c7aaa" }}>结合 Web3 与公益，打造透明、有趣、可持续的猫咪救助生态</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              icon: <Shield size={28} />,
              color: "#7ec8e3",
              title: "透明资金流向",
              desc: "所有捐款直达机构钱包，链上可查，平台完全不经手一分钱。智能合约自动执行，无需信任中间方。",
            },
            {
              icon: <Heart size={28} />,
              color: "#ff6b6b",
              title: "真实猫咪档案",
              desc: "每只猫咪都有完整的链上档案，支持线下领养，领养成功可获得 Genesis NFT 纪念。",
            },
            {
              icon: <Coins size={28} />,
              color: "#f7a541",
              title: "动态成长 NFT",
              desc: "捐款触发云领养，猫咪 NFT 随成长阶段动态更新。幼猫→少年猫→成年猫→Genesis，见证成长。",
            },
            {
              icon: <Gamepad2 size={28} />,
              color: "#a855f7",
              title: "放置类养猫游戏",
              desc: "选择你的猫咪伙伴进入游戏，派遣出猎收集材料与稀有 NFT，体力系统、装备强化，乐趣无限。",
            },
            {
              icon: <Globe size={28} />,
              color: "#4ecdc4",
              title: "全球 AVAX 支付",
              desc: "基于 Avalanche C-Chain，低Gas费、快速确认。MetaMask 一键连接，无需繁琐流程。",
            },
            {
              icon: <Zap size={28} />,
              color: "#ffd700",
              title: "$PURR 游戏代币",
              desc: "新用户免费领取 20 PURR，用于购买游戏道具、抽卡、强化装备。经济系统完整闭环。",
            },
          ].map((f, i) => (
            <div key={i} className="p-6 rounded-2xl transition-all hover:-translate-y-1"
              style={{ background: "rgba(109,58,238,0.03)", border: `1px solid rgba(${f.color === "#7ec8e3" ? "126,200,227" : f.color === "#ff6b6b" ? "255,107,107" : f.color === "#f7a541" ? "247,165,65" : f.color === "#a855f7" ? "168,85,247" : f.color === "#4ecdc4" ? "78,205,196" : "255,215,0"},0.15)` }}>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                style={{ background: `${f.color}20`, color: f.color }}>
                {f.icon}
              </div>
              <h3 className="text-lg mb-2" style={{ color: "#1e1b4b", fontWeight: 700 }}>{f.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: "#7c7aaa" }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 px-6" style={{ background: "rgba(255,255,255,0.02)" }}>
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h2 className="text-4xl mb-4" style={{ color: "#1e1b4b", fontWeight: 800 }}>三步开始你的猫咪之旅</h2>
        </div>
        <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-8">
          {[
            { step: "01", emoji: "🎁", title: "领取入场 NFT", desc: "连接钱包，免费领取当季全家福 NFT 与 20 PURR 游戏代币" },
            { step: "02", emoji: "🐾", title: "浏览猫咪档案", desc: "查看收容所的真实猫咪，选择捐款、申请领养或进入游戏" },
            { step: "03", emoji: "🎮", title: "养育虚拟猫咪", desc: "选择猫咪进入放置游戏，出猎收集 NFT 与材料碎片" },
          ].map((s, i) => (
            <div key={i} className="flex flex-col items-center text-center gap-4">
              <div className="text-5xl">{s.emoji}</div>
              <div className="text-sm px-3 py-1 rounded-full" style={{ background: "rgba(126,200,227,0.1)", color: "#7ec8e3" }}>{s.step}</div>
              <h3 style={{ color: "#1e1b4b", fontWeight: 700 }}>{s.title}</h3>
              <p className="text-sm" style={{ color: "#7c7aaa", lineHeight: 1.7 }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* NFT Types */}
      <section className="py-24 px-6 max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl mb-4" style={{ color: "#1e1b4b", fontWeight: 800 }}>NFT 生态系统</h2>
          <p style={{ color: "#7c7aaa" }}>丰富的 NFT 类型，记录你与猫咪的每一段缘分</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { emoji: "🖼️", name: "全家福", type: "FamilyPortrait", desc: "每季度限定，入场凭证", color: "#f7a541" },
            { emoji: "☁️", name: "云领养", type: "CloudAdopted", desc: "捐款达到阈值解锁", color: "#7ec8e3" },
            { emoji: "🌟", name: "Genesis", type: "Genesis", desc: "真实领养回访专属", color: "#ffd700" },
            { emoji: "🐱", name: "初始猫", type: "StarterCat", desc: "绑定真实猫咪，可成长", color: "#a855f7" },
            { emoji: "⚔️", name: "装备", type: "Equipment", desc: "抽卡获得，强化出猎", color: "#4ecdc4" },
            { emoji: "💎", name: "收藏", type: "Collection", desc: "出猎掉落，玩耍/同伴/睡觉系列", color: "#ff6b6b" },
          ].map((n, i) => (
            <div key={i} className="p-4 rounded-xl text-center"
              style={{ background: "rgba(109,58,238,0.03)", border: `1px solid ${n.color}22` }}>
              <div className="text-3xl mb-2">{n.emoji}</div>
              <div className="text-sm mb-1" style={{ color: n.color, fontWeight: 700 }}>{n.name}</div>
              <div className="text-xs" style={{ color: "#4a4a6a" }}>{n.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 text-center">
        <div className="max-w-2xl mx-auto flex flex-col items-center gap-6">
          <div className="text-6xl">😺</div>
          <h2 className="text-4xl" style={{ color: "#1e1b4b", fontWeight: 800 }}>准备好了吗？</h2>
          <p style={{ color: "#7c7aaa" }}>每一笔捐款，每一次领养，都在链上留下永久记录。<br />让我们一起，用科技守护每一只需要帮助的猫咪。</p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link to="/login"
              className="px-8 py-4 rounded-full transition-all hover:scale-105"
              style={{ background: "linear-gradient(135deg, #f7a541, #ff6b6b)", color: "#fff", fontWeight: 700 }}>
              立即进入平台 →
            </Link>
            <Link to="/register"
              className="px-8 py-4 rounded-full transition-all hover:scale-105"
              style={{ border: "1px solid rgba(126,200,227,0.35)", color: "#7ec8e3" }}>
              机构入驻申请
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 text-center border-t" style={{ borderColor: "rgba(109,58,238,0.06)", color: "#333355" }}>
        <p className="text-sm">© 2026 PurrChain · 部署于 Avalanche Fuji C-Chain (chainId: 43113) · <span style={{ color: "#f7a541" }}>链上透明，公益永存</span></p>
      </footer>
    </div>
  );
}
