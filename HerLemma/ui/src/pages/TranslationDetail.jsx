import { useState, useMemo, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { DERIVATIVE_TREE, TRANSLATIONS } from '../data/mockTree'
import { readConceptExplanations, readExplanation, voteExplanation } from '../utils/chain'

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.06 },
  },
}

const cardVariants = {
  hidden: { opacity: 0, y: 22 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
}

function Spinner() {
  return (
    <span
      className="inline-block h-5 w-5 shrink-0 rounded-full border-2 border-white/25 border-t-white"
      style={{ animation: 'spin 0.65s linear infinite' }}
      aria-hidden
    />
  )
}

export default function TranslationDetail() {
  const { id } = useParams()
  const numericId = Number(id)
  const [chainNode, setChainNode] = useState(null)
  const [relatedNodes, setRelatedNodes] = useState([])

  const fallbackNode = useMemo(
    () => DERIVATIVE_TREE.nodes.find((n) => n.id === numericId),
    [numericId]
  )
  const node = chainNode || fallbackNode

  const [votes, setVotes] = useState(0)
  const [voted, setVoted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(null)
  const [burstKey, setBurstKey] = useState(0)

  useEffect(() => {
    if (!node) return
    setVotes(node.votes)
    setVoted(false)
    setSuccess(null)
    setLoading(false)
  }, [node?.id])

  useEffect(() => {
    let cancelled = false

    async function load() {
      if (Number.isNaN(numericId)) return

      try {
        const explanation = await readExplanation(numericId)
        if (!cancelled && explanation) {
          setChainNode(explanation)
          const siblings = await readConceptExplanations(explanation.conceptId)
          if (!cancelled) {
            setRelatedNodes(siblings.filter((item) => item.id !== explanation.id).slice(0, 3))
          }
          return
        }
      } catch {
        // Fall through to curated demo data.
      }

      if (!cancelled) {
        setChainNode(null)
        setRelatedNodes([])
      }
    }

    load()

    return () => {
      cancelled = true
    }
  }, [numericId])

  const others = useMemo(() => {
    if (relatedNodes.length) return relatedNodes
    if (!node) return []
    return DERIVATIVE_TREE.nodes.filter((n) => n.id !== node.id).slice(0, 3)
  }, [node, relatedNodes])

  if (!node || Number.isNaN(numericId)) {
    return (
      <div className="bg-mesh relative min-h-[calc(100vh-4rem)] px-4 pb-16 pt-20 text-[#f0eef5] sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto max-w-lg text-center"
        >
          <p className="text-white/70">未找到该讲解</p>
          <Link
            to="/tree"
            className="mt-6 inline-block text-amber-200/90 underline decoration-amber-200/40 underline-offset-4 hover:text-amber-100"
          >
            ← 返回知识树
          </Link>
        </motion.div>
      </div>
    )
  }

  const conceptId = node?.conceptId || 'c3'
  const tb = TRANSLATIONS[conceptId]?.textbook || DERIVATIVE_TREE.textbook
  const rm = node.isRoleModel && node.roleModelInfo ? node.roleModelInfo : null

  async function handleVote() {
    if (voted || loading) return
    setLoading(true)
    setSuccess(null)
    setBurstKey((k) => k + 1)
    try {
      const result = await voteExplanation(numericId)
      setSuccess(result)
      setVotes((v) => v + 1)
      setVoted(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-mesh relative min-h-[calc(100vh-4rem)] overflow-hidden px-4 pb-20 pt-20 text-[#f0eef5] sm:px-6">
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          background:
            'radial-gradient(ellipse at 30% 0%, rgba(255,107,107,0.12), transparent 50%), radial-gradient(ellipse at 70% 100%, rgba(249,202,36,0.08), transparent 45%)',
        }}
      />

      <motion.div
        className="relative z-10 mx-auto max-w-3xl"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        <motion.div variants={cardVariants}>
          <Link
            to="/tree"
            className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-white/55 transition-colors hover:text-amber-200/90"
          >
            ← 返回知识树
          </Link>
        </motion.div>

        {/* Textbook original */}
        <motion.article
          variants={cardVariants}
          className="relative mb-6 overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0d0a14]/90 pl-1 backdrop-blur-xl"
          style={{
            boxShadow: 'inset 4px 0 0 0 #ff6b6b, 0 8px 40px rgba(0,0,0,0.35)',
          }}
        >
          <div className="border-l border-white/[0.06] bg-white/[0.03] px-5 py-5 sm:px-6 sm:py-6">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#ff8e8e]/95">
              📖 教材原文
            </p>
            <p className="mt-3 text-base leading-relaxed text-white/90 sm:text-lg">{tb.content}</p>
            <p className="mt-4 text-xs text-white/40">{tb.source}</p>
          </div>
        </motion.article>

        {/* Translation */}
        <motion.article
          variants={cardVariants}
          className="relative mb-6 rounded-2xl border border-white/[0.1] bg-white/[0.05] p-5 backdrop-blur-xl sm:p-7"
          style={{
            boxShadow: '0 12px 48px rgba(0,0,0,0.25), 0 0 0 1px rgba(255,255,255,0.04) inset',
          }}
        >
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-xs font-semibold uppercase tracking-widest text-amber-200/90">
              ✨ 她的讲解
            </p>
            <span className="flex items-center gap-2 rounded-full bg-white/[0.06] py-1 pl-1 pr-3 text-sm">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/[0.08] text-lg">
                {node.avatar}
              </span>
              <span className="font-medium text-white/95">{node.author}</span>
              <span className="font-mono text-xs text-white/40">{node.address}</span>
            </span>
          </div>

          <blockquote className="relative mt-5 border-l-2 border-amber-400/35 pl-4 text-lg leading-relaxed text-white/92 before:absolute before:left-0 before:top-0 before:text-4xl before:leading-none before:text-white/10 before:content-['\201C'] sm:text-xl sm:before:-translate-x-1 sm:before:-translate-y-1">
            <span className="relative z-[1]">{node.translation}</span>
          </blockquote>

          <div className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-white/55">
            <motion.span
              key={votes}
              initial={{ scale: 1.15, color: 'rgb(250 204 21)' }}
              animate={{ scale: 1, color: 'rgba(255,255,255,0.55)' }}
              transition={{ type: 'spring', stiffness: 400, damping: 18 }}
              className="tabular-nums"
            >
              ✅ {votes} 人听懂了
            </motion.span>
            <span className="text-white/25">·</span>
            <span className="tabular-nums">
              💰 已赚 {typeof node.earned === 'number' ? node.earned.toFixed(2) : node.earned} AVAX
            </span>
            <span className="text-white/25">·</span>
            <span className="tabular-nums">$PROVE {node.prove.toLocaleString()}</span>
          </div>
        </motion.article>

        {/* Vote */}
        <motion.div variants={cardVariants} className="relative mb-8">
          <AnimatePresence>
            {success && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ type: 'spring', stiffness: 380, damping: 28 }}
                className="mb-4 rounded-xl border border-emerald-400/25 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100/95 backdrop-blur-md"
              >
                <p className="font-medium text-emerald-50">链上确认成功</p>
                <a
                  href={success.explorerUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-1 block break-all font-mono text-xs text-emerald-200/80 underline decoration-emerald-400/40 underline-offset-2 hover:text-emerald-100"
                >
                  {success.txHash}
                </a>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="relative flex justify-center">
            <motion.span
              key={burstKey}
              className="pointer-events-none absolute left-1/2 top-1/2 -z-0 h-32 w-32 -translate-x-1/2 -translate-y-1/2 rounded-full"
              style={{
                background:
                  'radial-gradient(circle, rgba(10,191,150,0.55) 0%, rgba(0,210,211,0.2) 40%, transparent 70%)',
              }}
              initial={{ scale: 0, opacity: 0.9 }}
              animate={{ scale: 2.8, opacity: 0 }}
              transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
            />

            <motion.button
              type="button"
              disabled={voted || loading}
              onClick={handleVote}
              className="relative z-[1] min-w-[220px] rounded-2xl px-8 py-4 text-base font-bold text-white shadow-lg disabled:cursor-not-allowed disabled:opacity-60 disabled:shadow-none"
              style={{
                background: voted
                  ? 'linear-gradient(180deg, rgba(80,80,90,0.9), rgba(50,50,58,0.95))'
                  : 'linear-gradient(135deg, #00d2d3 0%, #0abf96 100%)',
                boxShadow: voted
                  ? 'none'
                  : '0 8px 32px rgba(0, 210, 211, 0.35), 0 0 0 1px rgba(255,255,255,0.12) inset',
              }}
              whileHover={
                voted || loading
                  ? {}
                  : {
                      scale: 1.02,
                      boxShadow:
                        '0 12px 40px rgba(10, 191, 150, 0.45), 0 0 48px rgba(0, 210, 211, 0.25)',
                    }
              }
              whileTap={
                voted || loading
                  ? {}
                  : {
                      scale: 0.94,
                      transition: { type: 'spring', stiffness: 500, damping: 15 },
                    }
              }
              animate={loading ? { scale: [1, 1.04, 1] } : {}}
              transition={
                loading
                  ? { repeat: Infinity, duration: 0.9, ease: 'easeInOut' }
                  : { type: 'spring', stiffness: 400, damping: 20 }
              }
            >
              <span className="flex items-center justify-center gap-2">
                {loading && <Spinner />}
                {voted ? '✅ 已投票' : loading ? '提交中…' : '我听懂了！'}
              </span>
            </motion.button>
          </div>
        </motion.div>

        {/* Role model */}
        {rm && (
          <motion.section
            variants={cardVariants}
            className="relative mb-8 overflow-hidden rounded-2xl border-2 border-amber-400/50 bg-gradient-to-br from-amber-500/[0.12] via-[#1a1510] to-[#0f0c0a] p-5 sm:p-7"
            style={{
              boxShadow:
                '0 0 60px rgba(249, 202, 36, 0.18), 0 0 120px rgba(255, 180, 80, 0.08), inset 0 1px 0 rgba(255,220,160,0.15)',
            }}
          >
            <div
              className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full blur-3xl"
              style={{ background: 'rgba(249, 202, 36, 0.22)' }}
            />
            <div
              className="pointer-events-none absolute -bottom-12 -left-12 h-40 w-40 rounded-full blur-3xl"
              style={{ background: 'rgba(255, 140, 90, 0.12)' }}
            />
            <h3 className="relative text-sm font-bold tracking-wide text-amber-200">
              ⭐ 榜样档案
            </h3>
            <dl className="relative mt-4 space-y-3 text-sm">
              <div>
                <dt className="text-xs uppercase tracking-wider text-amber-200/50">院校</dt>
                <dd className="mt-1 text-white/90">{rm.university}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wider text-amber-200/50">年份</dt>
                <dd className="mt-1 tabular-nums text-white/90">{rm.year}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wider text-amber-200/50">她说</dt>
                <dd className="mt-1 italic text-amber-50/95">&ldquo;{rm.quote}&rdquo;</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wider text-amber-200/50">影响</dt>
                <dd className="mt-1 leading-relaxed text-white/75">{rm.impact}</dd>
              </div>
            </dl>
          </motion.section>
        )}

        {/* Other translations */}
        <motion.section variants={cardVariants}>
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-widest text-white/45">
            其他讲解
          </h3>
          <div className="grid gap-4 sm:grid-cols-3">
            {others.map((o, i) => (
              <motion.div
                key={o.id}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 + i * 0.06, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              >
                <Link to={`/translation/${o.id}`} className="block h-full">
                  <motion.div
                    className="h-full rounded-xl border border-white/[0.08] bg-white/[0.04] p-4 backdrop-blur-md transition-colors hover:border-amber-400/25 hover:bg-white/[0.07]"
                    whileHover={{ y: -3 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-lg">{o.avatar}</span>
                      <span className="font-medium text-white/90">{o.author}</span>
                    </div>
                    <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-white/55">
                      {o.translation}
                    </p>
                    <p className="mt-2 text-[11px] text-amber-200/60">查看详情 →</p>
                  </motion.div>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.section>
      </motion.div>
    </div>
  )
}
