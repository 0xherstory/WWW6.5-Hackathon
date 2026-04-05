import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { HiLockClosed } from 'react-icons/hi'
import { getConnectedAccount, readProfileSummary, shortenAddress, withdrawPendingRewards } from '../utils/chain'

const glass =
  'rounded-2xl border border-white/[0.08] bg-white/[0.04] backdrop-blur-[20px] shadow-[0_8px_32px_rgba(0,0,0,0.2)]'

function AvalancheMark({ className }) {
  return (
    <svg className={className} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path fill="#E84142" d="M16 3L3 27h26L16 3zm0 6.2L22.4 23H9.6L16 9.2z" />
    </svg>
  )
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.06 },
  },
}

const item = {
  hidden: { opacity: 0, y: 22 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
}

const earnedBadges = [
  { id: 'first-voice', title: 'First Voice', emoji: '🎤', desc: '首条讲解被验证', glow: 'from-coral-500/30 to-amber-400/20' },
  { id: 'first-earn', title: 'First Earning', emoji: '💰', desc: '首次赚到 AVAX', glow: 'from-amber-400/25 to-coral-500/20' },
  { id: 'translator', title: 'Math Translator', emoji: '📐', desc: '10条讲解被验证', glow: 'from-violet-500/35 to-coral-400/15' },
  { id: 'reviewer', title: 'Trusted Reviewer', emoji: '👁️', desc: '验证他人50次', glow: 'from-violet-400/30 to-violet-600/20' },
]

const lockedBadges = [
  { id: 'viral', title: 'Viral Explainer', emoji: '🔥', desc: '需要单条100+听懂' },
  { id: 'brand', title: 'Brand Pick', emoji: '⭐', desc: '需要被品牌选中' },
]

const incomeRows = [
  { time: '2026-04-02 21:14', type: '悬赏奖金', amount: '0.42' },
  { time: '2026-03-28 16:03', type: '打赏', amount: '0.08' },
  { time: '2026-03-15 09:41', type: '悬赏奖金', amount: '0.65' },
  { time: '2026-03-01 12:22', type: '打赏', amount: '0.12' },
]

function MiniChain() {
  const nodes = 8
  return (
    <div className="flex items-center justify-center gap-0 py-4">
      {Array.from({ length: nodes }, (_, i) => (
        <div key={i} className="flex items-center">
          <motion.div
            className="relative h-3 w-3 rounded-full bg-gradient-to-br from-coral-400 to-violet-500 shadow-[0_0_12px_rgba(255,107,107,0.5)]"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.4 + i * 0.06, type: 'spring', stiffness: 380, damping: 18 }}
          />
          {i < nodes - 1 && (
            <div
              className="h-[2px] w-6 bg-gradient-to-r from-white/25 to-white/10 sm:w-8"
              aria-hidden
            />
          )}
        </div>
      ))}
    </div>
  )
}

export default function Profile() {
  const [summary, setSummary] = useState(null)
  const [withdrawing, setWithdrawing] = useState(false)
  const [withdrawTx, setWithdrawTx] = useState(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const account = await getConnectedAccount()
        if (!account) return
        const profileSummary = await readProfileSummary(account)
        if (!cancelled) {
          setSummary(profileSummary)
        }
      } catch {
        if (!cancelled) {
          setSummary(null)
        }
      }
    }

    load()

    return () => {
      cancelled = true
    }
  }, [])

  const statCards = useMemo(() => {
    if (!summary) {
      return [
        { label: '我的讲解', value: '12 条' },
        { label: '被听懂', value: '1,847 次' },
        { label: '已赚', value: '2.4 AVAX', accent: true },
      ]
    }

    return [
      { label: '我的讲解', value: `${summary.explanationsCreated} 条` },
      { label: '被听懂', value: `${summary.understoodVotesReceived.toLocaleString()} 次` },
      { label: '已赚', value: `${summary.avaxEarned} AVAX`, accent: true },
    ]
  }, [summary])

  const unlockedBadgeIds = useMemo(() => {
    if (!summary) return new Set(earnedBadges.map((badge) => badge.id))

    const next = new Set()
    if (summary.explanationsCreated >= 1) next.add('first-voice')
    if (Number(summary.avaxEarned) > 0) next.add('first-earn')
    if (summary.explanationsValidated >= 10) next.add('translator')
    if (summary.understoodVotesCast >= 50) next.add('reviewer')
    if (summary.understoodVotesReceived >= 100) next.add('viral')
    return next
  }, [summary])

  async function handleWithdraw() {
    try {
      setWithdrawing(true)
      setWithdrawTx(null)
      const tx = await withdrawPendingRewards()
      setWithdrawTx(tx)
    } catch (error) {
      window.alert(error?.message || '提现失败，请稍后重试。')
    } finally {
      setWithdrawing(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] overflow-hidden bg-[#0a0612] bg-mesh text-[#f0eef5]">
      <div
        className="pointer-events-none absolute inset-0 opacity-50"
        style={{
          background:
            'radial-gradient(ellipse at 30% 0%, rgba(255,107,107,0.1), transparent 50%), radial-gradient(ellipse at 90% 60%, rgba(108,92,231,0.12), transparent 45%)',
        }}
      />

      <motion.div
        className="relative z-10 mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:max-w-4xl lg:py-14"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {/* Header */}
        <motion.header variants={item} className={`${glass} overflow-hidden p-6 md:p-8`}>
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <motion.div
                className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-gradient-to-br from-coral-500/20 to-violet-500/25 text-3xl shadow-[0_0_32px_rgba(255,107,107,0.25)]"
                whileHover={{ scale: 1.05 }}
              >
                🌸
              </motion.div>
              <div>
                <h1 className="text-2xl font-bold text-white md:text-3xl">{summary ? '链上讲解者' : '小花'}</h1>
                <p className="mt-1 font-mono text-sm text-white/50">{summary ? shortenAddress(summary.address) : '0x3f…a2'}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-xl border border-amber-400/25 bg-amber-400/10 px-4 py-3">
              <span className="text-lg font-semibold text-amber-200/95">$PROVE</span>
              <span className="text-2xl font-bold tabular-nums text-white">{summary ? summary.proveBalance : 956}</span>
            </div>
          </div>
        </motion.header>

        {/* Stats */}
        <motion.div
          variants={item}
          className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3"
        >
          {statCards.map((s) => (
            <motion.div
              key={s.label}
              variants={item}
              className={`${glass} px-5 py-5 text-center`}
              whileHover={{ y: -2, boxShadow: '0 12px 40px rgba(162,155,254,0.12)' }}
            >
              <p className="text-xs uppercase tracking-[0.15em] text-white/40">{s.label}</p>
              <p
                className={`mt-2 text-xl font-semibold tabular-nums md:text-2xl ${
                  s.accent ? 'text-amber-200/95' : 'text-white'
                }`}
              >
                {s.value}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* SBT */}
        <motion.section variants={item} className="mt-10">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.25em] text-white/40">成就 SBT</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {earnedBadges.map((b, i) => (
              <motion.div
                key={b.id}
                variants={item}
                custom={i}
                className={`relative overflow-hidden rounded-2xl border p-5 ${
                  unlockedBadgeIds.has(b.id) ? 'border-white/[0.1]' : 'border-white/[0.06] opacity-55 grayscale'
                }`}
                style={{
                  background: 'linear-gradient(145deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)',
                  boxShadow: '0 0 48px rgba(162, 155, 254, 0.08), inset 0 1px 0 rgba(255,255,255,0.06)',
                }}
                whileHover={{ scale: 1.02 }}
              >
                <div
                  className={`pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gradient-to-br ${b.glow} blur-2xl opacity-90`}
                />
                <div className="relative flex items-start gap-3">
                  <span className="text-2xl drop-shadow-[0_0_8px_rgba(249,202,36,0.4)]">{b.emoji}</span>
                  <div>
                    <h3 className="font-semibold text-white">{b.title}</h3>
                    <p className="mt-1 text-sm text-white/55">{b.desc}</p>
                  </div>
                </div>
                <motion.div
                  className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-white/[0.06]"
                  animate={{ opacity: [0.5, 0.85, 0.5] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                />
              </motion.div>
            ))}

            {lockedBadges.map((b) => (
              <motion.div
                key={b.id}
                variants={item}
                className={`relative rounded-2xl border bg-black/25 p-5 ${
                  unlockedBadgeIds.has(b.id) ? 'border-white/[0.1]' : 'border-white/[0.06] opacity-55 grayscale'
                }`}
              >
                {!unlockedBadgeIds.has(b.id) && (
                  <div className="absolute right-4 top-4 text-white/40">
                    <HiLockClosed className="text-lg" aria-label="未解锁" />
                  </div>
                )}
                <div className="flex items-start gap-3">
                  <span className="text-2xl opacity-50">{b.emoji}</span>
                  <div>
                    <h3 className="font-semibold text-white/70">{b.title}</h3>
                    <p className="mt-1 text-sm text-white/40">{b.desc}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Inspired */}
        <motion.section variants={item} className={`${glass} mt-10 p-6 md:p-8`}>
          <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-white/40">我启发了</h2>
          <p className="mt-3 text-lg text-white/85 md:text-xl">
            我的讲解已有 <span className="bg-gradient-to-r from-coral-400 to-amber-300 bg-clip-text font-bold text-transparent">{summary ? summary.explanationsValidated : 8}</span>{' '}
            条被社区完成验证
          </p>
          <MiniChain />
          <p className="text-center text-xs text-white/35">灵感在链上连成一条温柔的线</p>
        </motion.section>

        {/* Income */}
        <motion.section variants={item} className={`${glass} mt-8 p-6 md:p-8`}>
          <div className="mb-4 flex items-center gap-2">
            <AvalancheMark className="h-5 w-5 shrink-0 opacity-90" />
            <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-white/40">收入记录</h2>
          </div>
          <ul className="divide-y divide-white/[0.06]">
            {(summary
              ? [
                  { label: '累计已赚', value: `${summary.avaxEarned} AVAX` },
                  { label: '待提现', value: `${summary.pendingAvax} AVAX` },
                  { label: 'Bounty 获胜次数', value: `${summary.bountyWins} 次` },
                  { label: '已拥有成就 SBT', value: `${summary.badges} 枚` },
                ]
              : incomeRows.map((row) => ({ label: `${row.type} · ${row.time}`, value: `+${row.amount} AVAX` }))
            ).map((row) => (
              <motion.li
                key={row.label}
                variants={item}
                className="flex items-center justify-between py-4 first:pt-0"
              >
                <p className="text-sm font-medium text-white/85">{row.label}</p>
                <span className="font-mono text-sm font-semibold text-amber-200/90">{row.value}</span>
              </motion.li>
            ))}
          </ul>
          {summary && (
            <div className="mt-5 flex items-center justify-between gap-4 rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-3">
              <div>
                <p className="text-sm font-medium text-white/85">提取待领取收益</p>
                <p className="mt-1 text-xs text-white/40">当前可提：{summary.pendingAvax} AVAX</p>
              </div>
              <button
                type="button"
                disabled={withdrawing || Number(summary.pendingAvax) <= 0}
                onClick={handleWithdraw}
                className="rounded-full border border-amber-400/20 bg-amber-400/10 px-4 py-2 text-sm font-semibold text-amber-200 disabled:opacity-40"
              >
                {withdrawing ? '提现中…' : '提现'}
              </button>
            </div>
          )}
          {withdrawTx && (
            <a
              href={withdrawTx.explorerUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-4 block text-xs font-mono text-emerald-300/80 underline decoration-emerald-400/30 underline-offset-2"
            >
              提现交易：{withdrawTx.txHash}
            </a>
          )}
        </motion.section>
      </motion.div>
    </div>
  )
}
