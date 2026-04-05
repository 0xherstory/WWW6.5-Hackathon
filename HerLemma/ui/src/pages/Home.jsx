import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import CountUp from 'react-countup'
import { useEffect, useRef, useState } from 'react'
import { useInView } from 'framer-motion'
import { readGlobalStats } from '../utils/chain'

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
}
const item = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
}

const DEMO_EXPLANATIONS = [
  { style: '🚲 骑车上坡', text: '导数就是你脚底下这一小段路有多陡。上坡=正，下坡=负，山顶=零。', author: '小雨', avatar: '🦊', votes: 312 },
  { style: '✏️ 画眉毛', text: '导数就是"眉笔在这一点该往哪个方向画"。眉头上扬=正，眉峰=零，眉尾下降=负。', author: '小鹿', avatar: '🐚', votes: 321 },
  { style: '🌸 花开延时', text: '导数就是"花瓣此刻张开的速度"。含苞时慢，盛开前最快，全开后就不动了。', author: '一一', avatar: '🍀', votes: 267 },
]

const RELAY_STORIES = [
  { from: '小雨', fromAvatar: '🦊', to: '小鱼', toAvatar: '🌸', concept: '导数定义', quote: '小雨用"骑车上坡"讲导数，小鱼听懂后写了"每天称体重"的版本' },
  { from: '小鹿', fromAvatar: '🐚', to: '糖糖', toAvatar: '🎀', concept: '导数定义', quote: '小鹿用"画眉毛"讲导数，糖糖受启发写了"烤蛋糕温度曲线"' },
]

const FALLBACK_STATS = {
  participants: 4832,
  understoodVotes: 9871,
  explanations: 47,
  bountyCount: 1284,
}

function SmallStat({ end, label, suffix = '' }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true })
  return (
    <div ref={ref} className="text-center">
      <div className="text-2xl font-bold text-white tabular-nums md:text-3xl">
        {inView ? <CountUp end={end} duration={2} separator="," suffix={suffix} /> : '0'}
      </div>
      <p className="mt-1 text-xs text-white/45 leading-relaxed">{label}</p>
    </div>
  )
}

export default function Home() {
  const [stats, setStats] = useState(FALLBACK_STATS)

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const globalStats = await readGlobalStats()
        if (!cancelled && globalStats) {
          setStats({
            participants: globalStats.totalParticipants || FALLBACK_STATS.participants,
            understoodVotes: globalStats.totalUnderstoodVotes || FALLBACK_STATS.understoodVotes,
            explanations: globalStats.totalExplanations || FALLBACK_STATS.explanations,
            bountyCount: globalStats.totalBounties || FALLBACK_STATS.bountyCount,
          })
        }
      } catch {
        // Keep editorial fallback data for demo mode.
      }
    }

    load()

    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="bg-mesh relative min-h-screen overflow-hidden text-[#f0eef5]">
      <div className="pointer-events-none absolute inset-0 opacity-30" style={{ background: 'radial-gradient(circle at 50% -10%, rgba(255,107,107,0.18), transparent 55%)' }} />

      <motion.div className="relative z-10 mx-auto max-w-5xl px-5 pb-24 pt-12 md:px-8 md:pt-20" variants={container} initial="hidden" animate="show">

        {/* ── Hero：核心主张 ── */}
        <motion.div variants={item} className="text-center">
          <p className="text-xs uppercase tracking-[0.4em] text-[#ff6b6b]/60 mb-4">Math is not gendered. Understanding is.</p>
          <motion.h1
            className="mx-auto max-w-4xl text-3xl font-bold leading-snug tracking-tight md:text-5xl lg:text-6xl"
            style={{ backgroundImage: 'linear-gradient(105deg, #ff6b6b, #f9ca24 40%, #a29bfe 70%, #ff6b6b)', backgroundSize: '200% auto', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}
            animate={{ backgroundPosition: ['0% center', '100% center', '0% center'] }}
            transition={{ duration: 14, repeat: Infinity, ease: 'linear' }}
          >
            谁说女生学不好数学？
          </motion.h1>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-white/55 md:text-lg">
            数学从来不分性别，但理解方式可以不同。<br/>
            HerLemma 让女生用适合自己的方式打开数学，<br className="hidden md:block" />
            在互相讲解中携手打破偏见。
          </p>
        </motion.div>

        <motion.div variants={item} className="mt-10 flex flex-col sm:flex-row justify-center gap-3">
          <Link to="/tree?concept=c3">
            <motion.span
              className="inline-flex items-center gap-2 rounded-full px-8 py-3.5 text-base font-semibold text-[#1a0a0a] shadow-lg"
              style={{ background: 'linear-gradient(135deg, #ff6b6b, #ff8e53, #f9ca24)', boxShadow: '0 6px 28px rgba(255,107,107,0.35)' }}
              whileHover={{ scale: 1.03, boxShadow: '0 10px 44px rgba(255,107,107,0.5)' }}
              whileTap={{ scale: 0.98 }}
            >
              看看她们怎么讲数学
            </motion.span>
          </Link>
          <Link to="/tree?random=1">
            <motion.span
              className="inline-flex items-center gap-2 rounded-full px-8 py-3.5 text-base font-semibold text-white border border-white/20"
              style={{ background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(12px)' }}
              whileHover={{ scale: 1.03, background: 'rgba(255,255,255,0.1)' }}
              whileTap={{ scale: 0.98 }}
            >
              我也来讲一个知识点
            </motion.span>
          </Link>
        </motion.div>

        {/* ── 同一个概念，不同的入口 ── */}
        <motion.section variants={item} className="mt-20 md:mt-28">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white md:text-3xl">同一个概念，每个人都有自己的入口</h2>
            <p className="mt-2 text-sm text-white/40">不是标准答案不够好，是每个人卡住的地方不一样</p>
          </div>

          <div className="glass rounded-2xl p-5 border border-white/[0.08] mb-4">
            <p className="text-xs text-[#ff6b6b]/60 font-medium">📖 教材写的</p>
            <p className="text-sm text-white/50 mt-1 font-mono">f'(x₀) = lim(Δx→0) [f(x₀+Δx) - f(x₀)] / Δx</p>
          </div>

          <p className="text-xs text-white/30 text-center mb-3">↓ 她们是这样理解的 ↓</p>

          <div className="grid gap-3 md:grid-cols-3">
            {DEMO_EXPLANATIONS.map((e, i) => (
              <motion.div
                key={i}
                className="glass rounded-2xl p-5 border border-white/[0.08] hover:border-white/20 transition-colors"
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
              >
                <p className="text-xs text-[#f9ca24]/80 font-semibold mb-2">{e.style}</p>
                <p className="text-sm text-white/85 leading-relaxed">「{e.text}」</p>
                <div className="mt-3 flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-xs text-white/40">
                    <span>{e.avatar}</span>{e.author}
                  </span>
                  <span className="text-xs text-emerald-300/70">✅ {e.votes} 人说听懂了</span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* ── 讲解的接力 ── */}
        <motion.section variants={item} className="mt-20 md:mt-28">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white md:text-3xl">一个女生听懂了，下一个女生也会</h2>
            <p className="mt-2 text-sm text-white/40">每一次讲解都是一次接力——她听懂的方式，会帮到下一个人</p>
          </div>

          <div className="space-y-3 max-w-2xl mx-auto">
            {RELAY_STORIES.map((s, i) => (
              <motion.div
                key={i}
                className="glass rounded-xl px-5 py-4 border border-white/[0.06]"
                initial={{ opacity: 0, x: -16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">{s.fromAvatar}</span>
                  <span className="text-xs text-white/60 font-medium">{s.from}</span>
                  <span className="text-[#a29bfe]/50 text-xs">→ 启发了 →</span>
                  <span className="text-lg">{s.toAvatar}</span>
                  <span className="text-xs text-white/60 font-medium">{s.to}</span>
                  <span className="ml-auto text-[10px] text-[#a29bfe]/40 bg-[#a29bfe]/10 rounded-full px-2 py-0.5">{s.concept}</span>
                </div>
                <p className="text-sm text-white/70 leading-relaxed">{s.quote}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* ── 她们走到了这里 ── */}
        <motion.section variants={item} className="mt-20 md:mt-28">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white md:text-3xl">她们从这里出发，走到了这里</h2>
            <p className="mt-2 text-sm text-white/40">在 HerLemma 讲过数学的女生，后来做到了什么</p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {[
              { avatar: '🦊', name: '小雨', from: '高二开始在平台讲导数', to: '北京大学 · 数学科学学院', year: '2025', stat: '她的讲解帮助了 312 人', tag: '🏅 平台讲解量 Top 3', color: 'from-[#ff6b6b]/15 to-[#ff6b6b]/5', border: 'border-[#ff6b6b]/25' },
              { avatar: '🐚', name: '小鹿', from: '用"画眉毛"讲导数走红', to: 'MIT · 数学系全额奖学金', year: '2026', stat: '单条讲解 321 人说听懂', tag: '🔥 阅读量最高讲解', color: 'from-[#f9ca24]/15 to-[#f9ca24]/5', border: 'border-[#f9ca24]/25' },
              { avatar: '🌙', name: '小月', from: '在平台讲几何意义和竞赛题', to: 'CMO 银牌 → 清华大学姚班', year: '2025', stat: '她的讲解被 3 所高中引用', tag: '🏆 竞赛方向标杆', color: 'from-[#a29bfe]/15 to-[#a29bfe]/5', border: 'border-[#a29bfe]/25' },
            ].map((p, i) => (
              <motion.div
                key={i}
                className={`rounded-2xl p-5 border bg-gradient-to-br ${p.color} ${p.border} backdrop-blur-sm`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12 }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-3xl">{p.avatar}</span>
                  <div>
                    <p className="font-semibold text-white text-sm">{p.name}</p>
                    <p className="text-[11px] text-white/35">{p.from}</p>
                  </div>
                </div>
                <div className="rounded-lg bg-black/20 px-3 py-2.5 mb-3">
                  <p className="text-sm font-semibold text-white/90">🎓 {p.to}</p>
                  <p className="text-[11px] text-white/40 mt-0.5">{p.year}</p>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-white/40">{p.stat}</span>
                  <span className="bg-white/[0.06] rounded-full px-2 py-0.5 text-white/50">{p.tag}</span>
                </div>
              </motion.div>
            ))}
          </div>

          <p className="text-center text-xs text-white/25 mt-6">数据来源：HerLemma 链上记录 · Avalanche Fuji Testnet</p>
        </motion.section>

        {/* ── 为什么这件事重要 ── */}
        <motion.section variants={item} className="mt-20 md:mt-28">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white md:text-3xl">这不只是一个学习工具</h2>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {[
              { emoji: '💡', title: '用适合她的方式', desc: '每个人卡住的地方不同。同伴用生活语言讲出的解释，往往比课本更容易听懂。' },
              { emoji: '🤝', title: '讲解就是携手', desc: '当一个女生用自己的话讲数学，她在帮下一个女生，也在加深自己的理解。这是费曼学习法的链式反应。' },
              { emoji: '📊', title: '每一次互助都是证据', desc: '多少女生在教数学、多少人被教懂——这些链上数据构成一份不可篡改的群体证明。偏见不攻自破。' },
            ].map((c, i) => (
              <motion.div
                key={i}
                className="glass rounded-2xl p-6 border border-white/[0.06] text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <span className="text-3xl">{c.emoji}</span>
                <h3 className="mt-3 text-base font-semibold text-white">{c.title}</h3>
                <p className="mt-2 text-sm text-white/45 leading-relaxed">{c.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* ── 集体证据 ── */}
        <motion.section variants={item} className="mt-20 md:mt-28">
          <p className="text-xs uppercase tracking-[0.3em] text-white/20 text-center mb-6">On-chain Proof</p>
          <div className="glass rounded-2xl p-8 border border-white/[0.06]">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <SmallStat end={stats.participants} label="位女生参与过讲解或验证" />
              <SmallStat end={stats.understoodVotes} label="次「我听懂了」在女生之间发生" />
              <SmallStat end={stats.explanations} label="条讲解已被提交到链上" />
              <SmallStat end={stats.bountyCount} label="个悬赏问题等待被讲清楚" />
            </div>
          </div>
        </motion.section>

        {/* ── CTA ── */}
        <motion.div variants={item} className="mt-20 md:mt-28 text-center">
          <p className="text-white/40 text-sm mb-2">她们已经在路上了。</p>
          <p className="text-lg text-white/70 mb-8">下一个打破偏见的，可能是你。</p>
          <Link to="/tree?random=1">
            <motion.span
              className="inline-flex items-center gap-2 rounded-full px-10 py-4 text-base font-semibold text-[#1a0a0a] shadow-lg"
              style={{ background: 'linear-gradient(135deg, #ff6b6b, #ff8e53, #f9ca24)', boxShadow: '0 6px 28px rgba(255,107,107,0.35)' }}
              whileHover={{ scale: 1.03, boxShadow: '0 10px 44px rgba(255,107,107,0.5)' }}
              whileTap={{ scale: 0.98 }}
            >
              开始讲给下一位女生听
            </motion.span>
          </Link>
        </motion.div>

      </motion.div>
    </div>
  )
}
