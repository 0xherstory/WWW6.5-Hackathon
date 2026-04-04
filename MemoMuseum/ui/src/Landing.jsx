import React from 'react';

export default function Landing({ onEnterApp }) {
  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 font-sans selection:bg-indigo-500/30 overflow-x-hidden">
      {/* 顶部导航 */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-black/20 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 animate-pulse" />
            <span className="text-xl font-black tracking-widest uppercase">Memo_Museum</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="https://github.com/FireCrazyBaby/memory-museum" target="_blank" rel="noreferrer" className="text-sm font-bold text-slate-400 hover:text-white transition-colors hidden md:block">
              GitHub 源码
            </a>
            <button onClick={onEnterApp} className="px-6 py-2.5 rounded-full bg-white/10 border border-white/20 text-white font-bold text-sm hover:bg-white hover:text-black transition-all duration-300">
              Launch App
            </button>
          </div>
        </div>
      </nav>

      {/* Hero 核心首屏 */}
      <section className="relative pt-40 pb-20 md:pt-52 md:pb-32 px-6">
        {/* 背景光晕装饰 */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none" />
        
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs font-bold tracking-widest text-indigo-400 mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            POWERED BY AVALANCHE FUJI TESTNET
          </div>
          
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-8 leading-tight">
            将记忆与契约，<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
              刻入永恒的赛博星海。
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-slate-400 font-bold max-w-2xl mx-auto mb-12 leading-relaxed">
            MemoMuseum 是一个去中心化的生命纪事与契约网络。通过 3D 空间算法与智能合约，我们构建了一个数字疗愈社区与社交见证协议。用代码，守护微观的自我与宏观的生态。
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button onClick={onEnterApp} className="w-full sm:w-auto px-8 py-4 rounded-full bg-indigo-600 text-white font-black text-sm tracking-widest shadow-[0_0_40px_rgba(79,70,229,0.4)] hover:bg-indigo-500 hover:scale-105 transition-all duration-300">
              进入公共纪念馆 🌌
            </button>
            <a href="#features" className="w-full sm:w-auto px-8 py-4 rounded-full bg-white/5 border border-white/10 text-white font-black text-sm tracking-widest hover:bg-white/10 transition-all duration-300">
              探索核心机制 ↓
            </a>
          </div>
        </div>
      </section>

      {/* 核心特性 / 黑客松赛道对应点 */}
      <section id="features" className="py-24 px-6 bg-black/40 border-y border-white/5 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-black tracking-tighter mb-4">TECH & VISION</h2>
            <p className="text-slate-400 font-bold">响应 Life & Co-existence 赛道，探索去中心化的治愈力量。</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* 卡片 1 */}
            <div className="p-8 rounded-3xl bg-white/5 border border-white/10 hover:border-indigo-500/50 transition-colors">
              <div className="text-4xl mb-6">🪐</div>
              <h3 className="text-xl font-black mb-3">3D 深空纪事</h3>
              <p className="text-sm font-bold text-slate-400 leading-relaxed">
                利用地理位置与哈希算法，将用户的情感、悼词或高光时刻转化为 100vh 全屏交互式 3D 星海上的微光节点，打造沉浸式疗愈空间。
              </p>
            </div>
            
            {/* 卡片 2 */}
            <div className="p-8 rounded-3xl bg-white/5 border border-white/10 hover:border-amber-500/50 transition-colors">
              <div className="text-4xl mb-6">⚖️</div>
              <h3 className="text-xl font-black mb-3">去中心化社交见证</h3>
              <p className="text-sm font-bold text-slate-400 leading-relaxed">
                用户可发起带有代币质押的成长契约。到期后进入 3 天全宇宙公示期，由“见证广场”的陌生人节点投票决议契约是否达成。
              </p>
            </div>
            
            {/* 卡片 3 */}
            <div className="p-8 rounded-3xl bg-white/5 border border-white/10 hover:border-green-500/50 transition-colors">
              <div className="text-4xl mb-6">🌱</div>
              <h3 className="text-xl font-black mb-3">生态救助转化</h3>
              <p className="text-sm font-bold text-slate-400 leading-relaxed">
                若契约失败或遭遇质疑，质押的 MTK 资产将自动流入流浪动物救助基金或社区互助池，实现微观失败向宏观善意的价值转化。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 数据安全承诺 */}
      <section className="py-32 px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-black tracking-tighter mb-8">SECURED BY BLOCKCHAIN</h2>
          <p className="text-xl font-bold text-slate-400 mb-12">
            每一段记忆、每一次投票、每一笔资金的流转，均由 Avalanche Fuji 测试网上的智能合约严格执行，无人可以篡改你的赛博星轨。
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-xs font-mono opacity-50">
            <span className="px-4 py-2 rounded-lg border border-white/20 bg-white/5">MemoContract: 0xd1bb...2fF3</span>
            <span className="px-4 py-2 rounded-lg border border-white/20 bg-white/5">TokenContract: 0x874A...BEeE</span>
          </div>
        </div>
      </section>

      {/* 底部版权 */}
      <footer className="border-t border-white/10 py-8 text-center text-xs font-bold text-slate-500">
        <p>Built for WWW6.5 Hackathon • MemoMuseum © 2024</p>
      </footer>
    </div>
  );
}