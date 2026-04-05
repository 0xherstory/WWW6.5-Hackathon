import { useState, useCallback, useRef, useMemo, useLayoutEffect, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import ForceGraph2D from 'react-force-graph-2d'
import {
  CONCEPT_GRAPH, TRANSLATIONS, TOPICS,
  conceptToGraphData,
} from '../data/mockTree'
import { readConceptExplanations } from '../utils/chain'

const avatars = ['🦊','🐱','🌸','🌙','🦋','🐰','🌺','⭐','🍀','🎀','🦄','🌻','💫','🐚','🌷']

function TranslationCard({ node, rank }) {
  const likers = useMemo(() => {
    const count = Math.min(5, Math.floor(node.votes / 60) + 2)
    return avatars.slice(0, count)
  }, [node.votes])

  return (
    <Link to={`/translation/${node.id}`} className="block">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: rank * 0.06, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className={`glass rounded-2xl p-5 border transition-all hover:shadow-[0_0_40px_rgba(255,107,107,0.1)] ${
          node.isRoleModel ? 'border-[#f9ca24]/40 shadow-[0_0_30px_rgba(249,202,36,0.08)]' : 'border-white/[0.08]'
        }`}
      >
        <div className="flex items-start gap-4">
        {/* 排名 */}
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-lg font-black ${
          rank === 0 ? 'bg-gradient-to-br from-[#f9ca24] to-[#f0932b] text-[#1a0a0a]' :
          rank === 1 ? 'bg-gradient-to-br from-[#dfe6e9] to-[#b2bec3] text-[#1a0a0a]' :
          rank === 2 ? 'bg-gradient-to-br from-[#e17055] to-[#d63031] text-white' :
          'bg-white/[0.06] text-white/40'
        }`}>
          {rank + 1}
        </div>

        <div className="flex-1 min-w-0">
          {/* 作者行 */}
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">{node.avatar}</span>
            <span className="font-semibold text-white text-sm">{node.author}</span>
            <span className="font-mono text-[10px] text-[#a29bfe]/60">{node.address}</span>
            {node.isRoleModel && (
              <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-[#f9ca24]/15 border border-[#f9ca24]/30 px-2 py-0.5 text-[10px] font-semibold text-[#f9ca24]">
                ⭐ 榜样学姐
              </span>
            )}
          </div>

          {/* 翻译内容 */}
          <p className="text-sm leading-relaxed text-white/80">
            「{node.translation}」
          </p>

          {/* 数据行 */}
          <div className="mt-3 flex items-center gap-3 text-xs">
            <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-500/15 px-2 py-1 text-emerald-300 border border-emerald-400/20">
              ✅ {node.votes} 人听懂
            </span>
            <span className="inline-flex items-center gap-1 rounded-lg bg-amber-500/15 px-2 py-1 text-amber-200 border border-amber-400/20">
              💰 {node.earned} AVAX
            </span>
            <span className="inline-flex items-center gap-1 rounded-lg bg-violet-500/15 px-2 py-1 text-violet-200 border border-violet-400/20">
              $PROVE {node.prove}
            </span>
          </div>

          {/* 点赞者头像 */}
          <div className="mt-3 flex items-center gap-1">
            <div className="flex -space-x-1">
              {likers.map((emoji, i) => (
                <span key={i} className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/[0.08] border border-white/10 text-xs">
                  {emoji}
                </span>
              ))}
            </div>
            <span className="text-[11px] text-white/35 ml-1">
              等 {node.votes} 人说"听懂了"
            </span>
          </div>

          {/* 榜样档案 */}
          {node.isRoleModel && node.roleModelInfo && (
            <div className="mt-3 rounded-lg border border-[#f9ca24]/30 bg-[#f9ca24]/[0.05] px-3 py-2">
              <p className="text-xs font-medium text-[#f9ca24]/90">
                🎓 {node.roleModelInfo.university} · {node.roleModelInfo.year}
              </p>
              <p className="mt-1 text-xs italic text-[#ffeaa7]/80">"{node.roleModelInfo.quote}"</p>
            </div>
          )}
          <p className="mt-3 text-[11px] text-[#a29bfe]/70">查看详情 →</p>
        </div>
      </div>
    </motion.div>
    </Link>
  )
}

export default function KnowledgeTree() {
  const graphRef = useRef()
  const topRef = useRef(null)
  const [searchParams] = useSearchParams()
  const [activeConcept, setActiveConcept] = useState(null)
  const [chainTranslations, setChainTranslations] = useState([])
  const [dims, setDims] = useState({ width: 1200, height: 600 })

  const tier1Data = useMemo(() => conceptToGraphData(), [])

  useEffect(() => {
    const concept = searchParams.get('concept')
    const random = searchParams.get('random')
    if (concept && TRANSLATIONS[concept] && !activeConcept) {
      setActiveConcept(concept)
    } else if (random === '1' && !activeConcept) {
      const available = Object.keys(TRANSLATIONS)
      setActiveConcept(available[Math.floor(Math.random() * available.length)])
    }
  }, [searchParams, activeConcept])

  useLayoutEffect(() => {
    const measure = () => {
      const topH = topRef.current?.offsetHeight ?? 160
      setDims({
        width: Math.max(320, window.innerWidth - 32),
        height: Math.max(400, window.innerHeight - topH - 32),
      })
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [])

  useEffect(() => {
    if (graphRef.current && !activeConcept) {
      setTimeout(() => graphRef.current?.zoomToFit?.(400, 60), 300)
    }
  }, [activeConcept, tier1Data])

  useEffect(() => {
    let cancelled = false

    async function loadConceptTranslations() {
      if (!activeConcept) {
        setChainTranslations([])
        return
      }

      try {
        const items = await readConceptExplanations(activeConcept)
        if (!cancelled) {
          setChainTranslations(items)
        }
      } catch {
        if (!cancelled) {
          setChainTranslations([])
        }
      }
    }

    loadConceptTranslations()

    return () => {
      cancelled = true
    }
  }, [activeConcept])

  // ── 第一层绘制 ──
  const drawConcept = useCallback((node, ctx) => {
    if (!Number.isFinite(node.x) || !Number.isFinite(node.y)) return
    const { x, y } = node
    const r = 32
    const hasData = !!TRANSLATIONS[node.id]

    ctx.beginPath()
    ctx.arc(x, y, r + 8, 0, 2 * Math.PI)
    ctx.fillStyle = hasData ? node.color + '20' : 'rgba(255,255,255,0.03)'
    ctx.fill()

    const grad = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, 2, x, y, r)
    if (hasData) {
      grad.addColorStop(0, node.color + 'dd')
      grad.addColorStop(1, node.color + '88')
    } else {
      grad.addColorStop(0, 'rgba(255,255,255,0.15)')
      grad.addColorStop(1, 'rgba(255,255,255,0.06)')
    }
    ctx.beginPath()
    ctx.arc(x, y, r, 0, 2 * Math.PI)
    ctx.fillStyle = grad
    ctx.fill()
    ctx.strokeStyle = hasData ? node.color + 'aa' : 'rgba(255,255,255,0.12)'
    ctx.lineWidth = 2
    ctx.stroke()

    ctx.font = '22px "Apple Color Emoji","Segoe UI Emoji",sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(node.emoji, x, y)

    ctx.font = 'bold 13px "Noto Sans SC",system-ui,sans-serif'
    ctx.fillStyle = hasData ? '#fff' : 'rgba(255,255,255,0.4)'
    ctx.textBaseline = 'top'
    ctx.shadowColor = 'rgba(0,0,0,0.9)'
    ctx.shadowBlur = 6
    ctx.fillText(node.label, x, y + r + 10)
    ctx.shadowBlur = 0

    ctx.font = '11px "Noto Sans SC",system-ui,sans-serif'
    ctx.fillStyle = hasData ? 'rgba(255,255,255,0.55)' : 'rgba(255,255,255,0.25)'
    ctx.fillText(`${node.explanationCount} 条讲解`, x, y + r + 28)

    if (hasData) {
      ctx.font = '10px "Noto Sans SC",system-ui,sans-serif'
      ctx.fillStyle = node.color + '99'
      ctx.fillText('点击查看讲解 →', x, y + r + 44)
    }
  }, [])

  const conceptPointerArea = useCallback((node, color, ctx) => {
    if (!Number.isFinite(node.x) || !Number.isFinite(node.y)) return
    ctx.fillStyle = color
    ctx.beginPath()
    ctx.arc(node.x, node.y, 50, 0, 2 * Math.PI)
    ctx.fill()
  }, [])

  const drawLink = useCallback((link, ctx) => {
    const start = link.source
    const end = link.target
    if (!Number.isFinite(start.x) || !Number.isFinite(end.x)) return
    ctx.beginPath()
    ctx.moveTo(start.x, start.y)
    ctx.lineTo(end.x, end.y)
    ctx.strokeStyle = 'rgba(162,155,254,0.3)'
    ctx.lineWidth = 1.8
    ctx.stroke()
    const angle = Math.atan2(end.y - start.y, end.x - start.x)
    const ax = end.x - Math.cos(angle) * 38
    const ay = end.y - Math.sin(angle) * 38
    ctx.beginPath()
    ctx.moveTo(ax, ay)
    ctx.lineTo(ax - 8 * Math.cos(angle - 0.4), ay - 8 * Math.sin(angle - 0.4))
    ctx.lineTo(ax - 8 * Math.cos(angle + 0.4), ay - 8 * Math.sin(angle + 0.4))
    ctx.closePath()
    ctx.fillStyle = 'rgba(162,155,254,0.5)'
    ctx.fill()
  }, [])

  const handleConceptClick = useCallback((node) => {
    if (TRANSLATIONS[node.id]) {
      setActiveConcept(node.id)
    }
  }, [])

  const conceptInfo = activeConcept ? CONCEPT_GRAPH.nodes.find(n => n.id === activeConcept) : null
  const translationData = activeConcept ? TRANSLATIONS[activeConcept] : null
  const sortedTranslations = useMemo(() => {
    if (chainTranslations.length) return [...chainTranslations].sort((a, b) => b.votes - a.votes)
    if (!translationData) return []
    return [...translationData.nodes].sort((a, b) => b.votes - a.votes)
  }, [chainTranslations, translationData])

  return (
    <div className="min-h-screen bg-mesh text-[#f0eef5]">
      <div ref={topRef} className="px-4 pt-4 pb-2 space-y-2 max-w-[1400px] mx-auto">
        <div className="flex flex-wrap items-center gap-2">
          {TOPICS.map((t) =>
            t.active ? (
              <button key={t.id} className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold bg-gradient-to-r from-[#ff6b6b]/30 to-[#f9ca24]/25 border border-[#f9ca24]/50 text-white shadow-[0_0_24px_rgba(249,202,36,0.2)]">
                <span>{t.emoji}</span>{t.name}
              </button>
            ) : (
              <span key={t.id} title="即将开放" className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium cursor-not-allowed border border-white/10 bg-white/[0.03] text-white/35 select-none">
                <span className="opacity-50">{t.emoji}</span>{t.name}
              </span>
            ),
          )}
        </div>

        <div className="flex items-center gap-2 text-sm">
          <button
            onClick={() => setActiveConcept(null)}
            className={`font-medium transition-colors ${activeConcept ? 'text-[#a29bfe] hover:text-white cursor-pointer' : 'text-white'}`}
          >
            📐 导数 · 知识图谱
          </button>
          {conceptInfo && (
            <>
              <span className="text-white/30">›</span>
              <span className="text-white font-semibold">{conceptInfo.emoji} {conceptInfo.label}</span>
              <span className="text-white/30 text-xs ml-1">· {sortedTranslations.length} 条姐妹讲解</span>
            </>
          )}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {!activeConcept ? (
          /* ── 第一层：知识点 DAG 图 ── */
          <motion.div
            key="tier1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="px-3 pb-4 max-w-[1400px] mx-auto"
          >
            <p className="text-white/35 text-xs mb-2 px-1">点击亮色节点查看姐妹讲解</p>
            <div className="rounded-2xl overflow-hidden border border-white/[0.08]" style={{ background: '#0a0612' }}>
              <ForceGraph2D
                ref={graphRef}
                graphData={tier1Data}
                width={dims.width}
                height={dims.height}
                backgroundColor="#0a0612"
                nodeCanvasObject={drawConcept}
                nodePointerAreaPaint={conceptPointerArea}
                onNodeClick={handleConceptClick}
                linkCanvasObject={drawLink}
                dagMode="td"
                dagLevelDistance={100}
                warmupTicks={100}
                cooldownTime={2000}
                d3AlphaDecay={0.03}
                d3VelocityDecay={0.4}
                enableNodeDrag={false}
                enableZoomInteraction
                enablePanInteraction
              />
            </div>
          </motion.div>
        ) : (
          /* ── 第二层：翻译排名列表 ── */
          <motion.div
            key={`tier2-${activeConcept}`}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="px-4 pb-8 max-w-4xl mx-auto"
          >
            {/* 教材原文 */}
            {translationData && (
              <div className="relative overflow-hidden rounded-xl border border-white/[0.08] bg-[#120a1c]/90 backdrop-blur-md glow-coral mb-5">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#ff6b6b] to-[#f9ca24]" />
                <div className="pl-5 pr-4 py-3">
                  <p className="text-xs text-[#ff6b6b]/80 font-semibold">📖 教材原文 · {translationData.textbook.title}</p>
                  <p className="text-sm leading-relaxed text-white/90 mt-1">{translationData.textbook.content}</p>
                  <p className="text-[11px] text-[#a29bfe]/50 mt-1">{translationData.textbook.source}</p>
                </div>
              </div>
            )}

            {/* 排名标题 */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">
                🏆 姐妹讲解排行
                <span className="text-sm font-normal text-white/40 ml-2">按"听懂了"票数排序</span>
              </h3>
            </div>

            {/* 翻译卡片列表 */}
            <div className="space-y-3">
              {sortedTranslations.map((node, i) => (
                <TranslationCard key={node.id} node={node} rank={i} />
              ))}
            </div>

            {/* 我也来翻译 */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-8"
            >
              <Link to={`/create?concept=${activeConcept}`}>
                <motion.button
                  className="w-full rounded-2xl border-2 border-dashed border-white/20 py-5 text-center text-white/60 hover:text-white hover:border-[#ff6b6b]/50 transition-all"
                  whileHover={{ scale: 1.01, background: 'rgba(255,107,107,0.05)' }}
                  whileTap={{ scale: 0.99 }}
                >
                  <span className="text-2xl">✍️</span>
                  <p className="mt-1 text-sm font-semibold">我也来讲讲</p>
                  <p className="text-xs text-white/35 mt-0.5">用你的方式讲解这个知识点，帮助下一个女生听懂</p>
                </motion.button>
              </Link>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
