import { useState, useMemo, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CONCEPT_GRAPH, TRANSLATIONS, TOPICS, TOPIC_GRAPHS, TOPIC_LAYOUTS,
} from '../data/mockTree'

const avatars = ['🦊','🐱','🌸','🌙','🦋','🐰','🌺','⭐','🍀','🎀','🦄','🌻','💫','🐚','🌷']

function TranslationCard({ node, rank }) {
  const likers = useMemo(() => avatars.slice(0, Math.min(5, Math.floor(node.votes / 60) + 2)), [node.votes])
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: rank * 0.06, duration: 0.4 }}
      className={`glass rounded-2xl p-5 border transition-all hover:shadow-[0_0_40px_rgba(255,107,107,0.1)] ${
        node.isRoleModel ? 'border-[#f9ca24]/40 shadow-[0_0_30px_rgba(249,202,36,0.08)]' : 'border-white/[0.08]'
      }`}
    >
      <div className="flex items-start gap-4">
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-lg font-black ${
          rank === 0 ? 'bg-gradient-to-br from-[#f9ca24] to-[#f0932b] text-[#1a0a0a]' :
          rank === 1 ? 'bg-gradient-to-br from-[#dfe6e9] to-[#b2bec3] text-[#1a0a0a]' :
          rank === 2 ? 'bg-gradient-to-br from-[#e17055] to-[#d63031] text-white' :
          'bg-white/[0.06] text-white/40'
        }`}>{rank + 1}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">{node.avatar}</span>
            <span className="font-semibold text-white text-sm">{node.author}</span>
            <span className="font-mono text-[10px] text-[#a29bfe]/60">{node.address}</span>
            {node.isRoleModel && (
              <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-[#f9ca24]/15 border border-[#f9ca24]/30 px-2 py-0.5 text-[10px] font-semibold text-[#f9ca24]">⭐ 榜样学姐</span>
            )}
          </div>
          <p className="text-sm leading-relaxed text-white/80">「{node.translation}」</p>
          <div className="mt-3 flex items-center gap-3 text-xs">
            <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-500/15 px-2 py-1 text-emerald-300 border border-emerald-400/20">✅ {node.votes} 人听懂</span>
            <span className="inline-flex items-center gap-1 rounded-lg bg-amber-500/15 px-2 py-1 text-amber-200 border border-amber-400/20">💰 {node.earned} AVAX</span>
            <span className="inline-flex items-center gap-1 rounded-lg bg-violet-500/15 px-2 py-1 text-violet-200 border border-violet-400/20">$PROVE {node.prove}</span>
          </div>
          <div className="mt-3 flex items-center gap-1">
            <div className="flex -space-x-1">
              {likers.map((emoji, i) => (
                <span key={i} className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/[0.08] border border-white/10 text-xs">{emoji}</span>
              ))}
            </div>
            <span className="text-[11px] text-white/35 ml-1">等 {node.votes} 人说"听懂了"</span>
          </div>
          {node.isRoleModel && node.roleModelInfo && (
            <div className="mt-3 rounded-lg border border-[#f9ca24]/30 bg-[#f9ca24]/[0.05] px-3 py-2">
              <p className="text-xs font-medium text-[#f9ca24]/90">🎓 {node.roleModelInfo.university} · {node.roleModelInfo.year}</p>
              <p className="mt-1 text-xs italic text-[#ffeaa7]/80">"{node.roleModelInfo.quote}"</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

// 知识点路径布局数据
const PATH_LAYOUT = [
  [{ id: 'c1' }],
  [{ id: 'c1b' }],
  [{ id: 'c2' }],
  [{ id: 'c3' }],
  [{ id: 'c4' }, { id: 'c5' }],
  [{ id: 'c7' }, { id: 'c5b' }],
  [{ id: 'c7b' }, { id: 'c6' }],
  [{ id: 'c8' }],
  [{ id: 'c8b' }],
]

export default function KnowledgeTree() {
  const [searchParams] = useSearchParams()
  const [activeTopic, setActiveTopic] = useState('derivative')
  const [activeConcept, setActiveConcept] = useState(null)

  const currentGraph = activeTopic === 'derivative' || TOPIC_GRAPHS[activeTopic] === 'default'
    ? CONCEPT_GRAPH
    : TOPIC_GRAPHS[activeTopic]

  const currentLayout = activeTopic === 'derivative' || TOPIC_LAYOUTS[activeTopic] === 'default'
    ? PATH_LAYOUT
    : TOPIC_LAYOUTS[activeTopic]

  const conceptMap = useMemo(() => Object.fromEntries((currentGraph?.nodes || []).map(n => [n.id, n])), [currentGraph])
  const currentTopic = TOPICS.find(t => t.id === activeTopic)

  useEffect(() => {
    const concept = searchParams.get('concept')
    const random = searchParams.get('random')
    if (concept && TRANSLATIONS[concept]) setActiveConcept(concept)
    else if (random === '1') {
      const available = Object.keys(TRANSLATIONS)
      setActiveConcept(available[Math.floor(Math.random() * available.length)])
    }
  }, [searchParams])

  const conceptInfo = activeConcept ? conceptMap[activeConcept] : null
  const translationData = activeConcept ? TRANSLATIONS[activeConcept] : null
  const sortedTranslations = useMemo(() => {
    if (!translationData) return []
    return [...translationData.nodes].sort((a, b) => b.votes - a.votes)
  }, [translationData])

  return (
    <div className="min-h-screen bg-mesh text-[#f0eef5]">
      <div className="px-4 pt-4 pb-2 space-y-2 max-w-5xl mx-auto">
        <div className="flex flex-wrap items-center gap-2">
          {TOPICS.map(t => (
            <button
              key={t.id}
              onClick={() => { setActiveTopic(t.id); setActiveConcept(null) }}
              className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition-all ${
                activeTopic === t.id
                  ? 'bg-gradient-to-r from-[#ff6b6b]/30 to-[#f9ca24]/25 border border-[#f9ca24]/50 text-white shadow-[0_0_24px_rgba(249,202,36,0.2)]'
                  : 'border border-white/15 bg-white/[0.05] text-white/60 hover:text-white hover:border-white/25'
              }`}
            >
              <span>{t.emoji}</span>{t.name}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 text-sm">
          <button onClick={() => setActiveConcept(null)} className={`font-medium transition-colors ${activeConcept ? 'text-[#a29bfe] hover:text-white cursor-pointer' : 'text-white'}`}>
            {currentTopic?.emoji} {currentTopic?.name} · 知识路径
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
          /* ── 第一层：知识路径卡片 ── */
          <motion.div key="tier1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="px-4 pb-12 max-w-3xl mx-auto">
            <p className="text-white/30 text-xs mb-6 text-center">点击亮色卡片查看姐妹讲解</p>

            <div className="relative">
              {/* 中央连接线 */}
              <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-[#a29bfe]/30 via-[#ff6b6b]/20 to-[#f9ca24]/30 -translate-x-1/2" />

              <div className="space-y-4 relative">
                {currentLayout.map((row, ri) => (
                  <div key={ri} className={`flex justify-center gap-4 ${row.length > 1 ? '' : ''}`}>
                    {row.map(({ id }) => {
                      const c = conceptMap[id]
                      if (!c) return null
                      const hasData = !!TRANSLATIONS[id]
                      return (
                        <motion.div
                          key={id}
                          initial={{ opacity: 0, y: 16 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: ri * 0.08, duration: 0.4 }}
                          onClick={() => hasData && setActiveConcept(id)}
                          className={`relative z-10 w-full max-w-[280px] rounded-2xl p-4 border backdrop-blur-sm transition-all ${
                            hasData
                              ? 'cursor-pointer border-white/20 bg-white/[0.07] hover:bg-white/[0.10] hover:border-white/30 hover:shadow-[0_0_30px_' + c.color + '25] group'
                              : 'cursor-default border-white/[0.08] bg-white/[0.03]'
                          }`}
                        >
                          {/* 发光背景 */}
                          {hasData && (
                            <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: `radial-gradient(circle at center, ${c.color}10, transparent 70%)` }} />
                          )}

                          <div className="relative flex items-center gap-3">
                            <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-xl ${
                              hasData
                                ? 'bg-gradient-to-br shadow-lg'
                                : 'bg-white/[0.04]'
                            }`} style={hasData ? { background: `linear-gradient(135deg, ${c.color}40, ${c.color}15)`, boxShadow: `0 4px 16px ${c.color}20` } : {}}>
                              <span className={hasData ? '' : 'opacity-40'}>{c.emoji}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={`font-semibold text-sm ${hasData ? 'text-white' : 'text-white/30'}`}>{c.label}</p>
                              <p className={`text-xs mt-0.5 ${hasData ? 'text-white/45' : 'text-white/20'}`}>{c.desc}</p>
                            </div>
                            <div className="text-right shrink-0">
                              <p className={`text-xs font-mono ${hasData ? 'text-white/50' : 'text-white/20'}`}>{c.explanationCount}</p>
                              <p className={`text-[10px] ${hasData ? 'text-white/30' : 'text-white/15'}`}>条讲解</p>
                            </div>
                          </div>

                          {hasData && (
                            <div className="relative mt-2 flex items-center justify-end">
                              <span className="text-[10px] font-medium opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: c.color }}>
                                查看讲解 →
                              </span>
                            </div>
                          )}
                        </motion.div>
                      )
                    })}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        ) : (
          /* ── 第二层：讲解排名列表 ── */
          <motion.div key={`tier2-${activeConcept}`} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="px-4 pb-8 max-w-4xl mx-auto">
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

            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">
                🏆 姐妹讲解排行
                <span className="text-sm font-normal text-white/40 ml-2">按"听懂了"票数排序</span>
              </h3>
            </div>

            <div className="space-y-3">
              {sortedTranslations.map((node, i) => (
                <TranslationCard key={node.id} node={node} rank={i} />
              ))}
            </div>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="mt-8">
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
