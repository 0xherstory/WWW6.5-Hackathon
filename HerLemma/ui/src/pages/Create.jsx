import { useState, useCallback, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { HiSparkles } from 'react-icons/hi2'
import { generateExplanations, generateAnimation, chatWithAssistant, generateImage } from '../utils/ai'
import { mockChainSubmit } from '../utils/chain'
import { DERIVATIVE_TREE, TOPICS } from '../data/mockTree'

const FALLBACK = [
  { style: '生活类比', explanation: '导数就像你在山坡上骑车时，脚下这一小段路有多陡。', scene: '🚲⛰️' },
  { style: '视觉画面', explanation: '把函数曲线放大到某一点，弯线变成直线，那条直线的斜率就是导数。', scene: '🔍📐' },
  { style: '日常场景', explanation: '手机电量掉的快慢、奶茶降温的快慢——"此刻变化有多快"就是导数。', scene: '📱☕' },
]

const COLORS = [
  { bg: 'from-[#ff6b6b]/25 to-[#ff8e53]/10', border: 'border-[#ff6b6b]/30', accent: '#ff6b6b' },
  { bg: 'from-[#a29bfe]/25 to-[#6c5ce7]/10', border: 'border-[#a29bfe]/30', accent: '#a29bfe' },
  { bg: 'from-[#00d2d3]/25 to-[#0abf96]/10', border: 'border-[#00d2d3]/30', accent: '#00d2d3' },
]

const glass = 'rounded-2xl border border-white/[0.08] bg-white/[0.04] backdrop-blur-[20px]'

function useChat() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: '嗨！我是你的数学讲解助手 ✨\n有任何关于这个知识点的问题，随时问我！' }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)

  const send = useCallback(async (text) => {
    if (!text.trim() || loading) return
    const userMsg = { role: 'user', content: text }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)
    try {
      const history = [...messages.slice(-6), userMsg]
      const reply = await chatWithAssistant(history)
      setMessages(prev => [...prev, { role: 'assistant', content: reply || '抱歉，我没能理解你的问题，能换个方式问吗？' }])
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: '网络出了点问题，请稍后再试 ~' }])
    } finally {
      setLoading(false)
    }
  }, [messages, loading])

  return { messages, input, setInput, send, loading }
}

// ── Recording Hook ──
function useRecorder() {
  const [recording, setRecording] = useState(false)
  const [audioUrl, setAudioUrl] = useState(null)
  const [duration, setDuration] = useState(0)
  const mediaRef = useRef(null)
  const chunksRef = useRef([])
  const timerRef = useRef(null)

  const start = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    const mr = new MediaRecorder(stream)
    chunksRef.current = []
    mr.ondataavailable = (e) => chunksRef.current.push(e.data)
    mr.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
      setAudioUrl(URL.createObjectURL(blob))
      stream.getTracks().forEach(t => t.stop())
    }
    mr.start()
    mediaRef.current = mr
    setRecording(true)
    setDuration(0)
    setAudioUrl(null)
    timerRef.current = setInterval(() => setDuration(d => d + 1), 1000)
  }, [])

  const stop = useCallback(() => {
    mediaRef.current?.stop()
    setRecording(false)
    clearInterval(timerRef.current)
  }, [])

  const clear = useCallback(() => { setAudioUrl(null); setDuration(0) }, [])

  return { recording, audioUrl, duration, start, stop, clear }
}

export default function Create() {
  // ── State ──
  const [step, setStep] = useState(1)
  const [aiResults, setAiResults] = useState([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [genId, setGenId] = useState(0)

  const [selectedIdx, setSelectedIdx] = useState(-1)
  const [editedTexts, setEditedTexts] = useState(['', '', ''])
  const [editingIdx, setEditingIdx] = useState(-1)

  const [generatedImages, setGeneratedImages] = useState([null, null, null])
  const [imageLoading, setImageLoading] = useState(-1)

  const [animHtml, setAnimHtml] = useState('')
  const [animLoading, setAnimLoading] = useState(false)

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [txResult, setTxResult] = useState(null)

  const chat = useChat()
  const recorder = useRecorder()
  const chatEndRef = useRef(null)

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [chat.messages])

  const textbook = DERIVATIVE_TREE.textbook
  const selectedText = selectedIdx >= 0 ? editedTexts[selectedIdx] : ''

  // ── Handlers ──
  const handleGenerate = useCallback(async () => {
    setAiResults([])
    setIsGenerating(true)
    setStep(1)
    setSelectedIdx(-1)
    setEditedTexts(['', '', ''])
    setGeneratedImages([null, null, null])
    setAnimHtml('')
    setTxResult(null)
    try {
      const raw = await generateExplanations('导数', textbook.content)
      const normalized = ['生活类比', '视觉画面', '日常场景'].map((label, i) => {
        const found = raw.find(r => r.style === label || r.style?.includes(label.slice(0, 2)))
        return found || raw[i] || FALLBACK[i]
      })
      setAiResults(normalized.filter(Boolean))
      setEditedTexts(normalized.map(n => n.explanation || ''))
      setStep(2)
    } catch {
      setAiResults(FALLBACK)
      setEditedTexts(FALLBACK.map(f => f.explanation))
      setStep(2)
    } finally {
      setIsGenerating(false)
      setGenId(g => g + 1)
    }
  }, [textbook.content])

  const handleGenerateImage = useCallback(async (idx) => {
    setImageLoading(idx)
    try {
      const text = editedTexts[idx] || aiResults[idx]?.explanation || ''
      const style = aiResults[idx]?.style || '数学讲解'
      const url = await generateImage(text, style)
      setGeneratedImages(prev => { const next = [...prev]; next[idx] = url; return next })
    } catch {
      const fallback = 'data:image/svg+xml,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="400" height="240"><rect fill="#1a1028" width="400" height="240"/><text x="200" y="120" text-anchor="middle" fill="rgba(255,255,255,0.4)" font-size="14" font-family="system-ui">图片生成失败，请重试</text></svg>`)
      setGeneratedImages(prev => { const next = [...prev]; next[idx] = fallback; return next })
    }
    setImageLoading(-1)
  }, [editedTexts, aiResults])

  const handleGenerateAnim = useCallback(async () => {
    setAnimLoading(true)
    setAnimHtml('')
    try {
      const html = await generateAnimation(selectedText, '导数')
      setAnimHtml(html)
    } catch { setAnimHtml('') }
    finally { setAnimLoading(false) }
  }, [selectedText])

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      const res = await mockChainSubmit()
      setTxResult(res)
      setStep(5)
    } finally { setIsSubmitting(false) }
  }

  const canFinalize = selectedIdx >= 0 && generatedImages[selectedIdx]

  return (
    <div className="min-h-screen bg-mesh text-[#f0eef5]">
      <div className="mx-auto max-w-[1400px] px-4 py-6 flex gap-4">

        {/* ══════ 左侧：创作流程 ══════ */}
        <div className="flex-1 min-w-0 space-y-6">

          <motion.header initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-2xl font-bold">
              <span className="bg-gradient-to-r from-coral-400 via-amber-300 to-violet-400 bg-clip-text text-transparent">
                创作讲解
              </span>
            </h1>
            <p className="mt-1 text-xs text-white/40">选知识点 → AI 灵感 → 编辑配图 → 生成动画 → 上链</p>
          </motion.header>

          {/* ── Step 1: 知识点 + AI 生成 ── */}
          <div className={`${glass} p-5`}>
            <p className="text-xs font-semibold text-white/30 uppercase tracking-widest mb-3">1 · 知识点</p>
            <div className="flex flex-wrap gap-2 mb-4">
              {TOPICS.map(t => (
                <span key={t.id} className={`rounded-full px-3 py-1.5 text-xs font-medium ${t.active ? 'bg-gradient-to-r from-coral-500/90 to-amber-400/85 text-[#1a0a0a]' : 'border border-white/10 text-white/30 cursor-not-allowed'}`}>
                  {t.emoji} {t.name}
                </span>
              ))}
            </div>
            <div className="rounded-xl bg-black/20 border border-white/[0.06] px-4 py-3 mb-4">
              <p className="text-[11px] text-violet-300/70 font-medium">教材原文 · {textbook.title}</p>
              <p className="text-sm text-white/75 font-mono mt-1">{textbook.content}</p>
            </div>
            <motion.button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full rounded-xl py-3 text-sm font-semibold text-[#1a0a0a] disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #ff6b6b, #a29bfe, #f9ca24)', backgroundSize: '200% auto' }}
              animate={{ backgroundPosition: ['0% center', '100% center', '0% center'] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              <HiSparkles className="inline mr-1.5" />
              {isGenerating ? '生成中…' : 'AI 帮我讲解'}
            </motion.button>
          </div>

          {/* ── Step 2: 灵感卡片（可编辑 + 生成配图） ── */}
          <AnimatePresence>
            {step >= 2 && aiResults.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                <p className="text-xs font-semibold text-white/30 uppercase tracking-widest">2 · 选一个灵感，编辑并生成配图</p>
                <div className="grid gap-3 md:grid-cols-3">
                  {aiResults.map((item, i) => {
                    const c = COLORS[i]
                    const isSelected = selectedIdx === i
                    const isEditing = editingIdx === i
                    const img = generatedImages[i]
                    return (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        onClick={() => setSelectedIdx(i)}
                        className={`${glass} overflow-hidden cursor-pointer transition-all ${isSelected ? `ring-2 ring-[${c.accent}]/60 shadow-[0_0_30px_${c.accent}20]` : 'hover:border-white/15'}`}
                      >
                        {/* 配图区 */}
                        <div className={`relative h-32 flex items-center justify-center bg-gradient-to-br ${c.bg}`}>
                          {img ? (
                            <img src={img} alt="" className="w-full h-full object-cover" />
                          ) : imageLoading === i ? (
                            <motion.div className="h-8 w-8 rounded-full border-2 border-t-white/60 border-r-transparent border-b-white/20 border-l-transparent" animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} />
                          ) : (
                            <span className="text-4xl select-none">{item.scene || ['🚲⛰️','🔍📐','📱☕'][i]}</span>
                          )}
                          <div className="absolute bottom-0 inset-x-0 h-6 bg-gradient-to-t from-[#0a0612]/80 to-transparent" />
                        </div>

                        <div className="p-4 space-y-2">
                          <span className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${c.border} bg-white/[0.03]`} style={{ color: c.accent }}>
                            {item.style}
                          </span>

                          {isEditing ? (
                            <textarea
                              value={editedTexts[i]}
                              onChange={e => setEditedTexts(prev => { const n = [...prev]; n[i] = e.target.value; return n })}
                              onBlur={() => setEditingIdx(-1)}
                              autoFocus
                              rows={4}
                              className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm text-white/90 resize-none focus:outline-none focus:border-violet-400/40"
                              onClick={e => e.stopPropagation()}
                            />
                          ) : (
                            <p
                              className="text-sm text-white/75 leading-relaxed cursor-text hover:text-white/90 transition-colors"
                              onClick={e => { e.stopPropagation(); setEditingIdx(i) }}
                              title="点击编辑"
                            >
                              {editedTexts[i]}
                            </p>
                          )}

                          {/* 生成配图按钮 */}
                          {!img && imageLoading !== i && (
                            <button
                              onClick={e => { e.stopPropagation(); handleGenerateImage(i) }}
                              className="w-full mt-1 rounded-lg border border-dashed border-white/15 py-2 text-xs text-white/40 hover:text-white/70 hover:border-white/30 transition-colors"
                            >
                              🎨 生成配图
                            </button>
                          )}
                          {img && <p className="text-[10px] text-emerald-400/60 mt-1">✅ 配图已生成</p>}
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Step 3: 动画 + 录音（配图完成后出现） ── */}
          <AnimatePresence>
            {canFinalize && (
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                <p className="text-xs font-semibold text-white/30 uppercase tracking-widest">3 · 增强讲解（可选）</p>

                <div className="grid gap-4 md:grid-cols-2">
                  {/* 数学动画 */}
                  <div className={`${glass} p-5`}>
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-sm font-semibold text-white/70">✨ 数学动画</p>
                      <motion.button
                        onClick={handleGenerateAnim}
                        disabled={animLoading}
                        className="rounded-lg bg-gradient-to-r from-violet-500/80 to-[#00d2d3]/80 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                      >
                        {animLoading ? '生成中…' : '生成动画'}
                      </motion.button>
                    </div>
                    {animLoading && (
                      <div className="flex items-center justify-center py-10">
                        <motion.div className="h-8 w-8 rounded-full border-2 border-t-violet-400 border-r-transparent border-b-[#00d2d3] border-l-transparent" animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} />
                      </div>
                    )}
                    {animHtml && !animLoading && (
                      <iframe srcDoc={animHtml} title="动画" sandbox="allow-scripts" className="w-full rounded-lg border border-white/[0.08]" style={{ height: 280 }} />
                    )}
                    {!animHtml && !animLoading && (
                      <p className="text-xs text-white/25 text-center py-8">AI 将根据你的讲解生成数学可视化动画</p>
                    )}
                  </div>

                  {/* 录音 */}
                  <div className={`${glass} p-5`}>
                    <p className="text-sm font-semibold text-white/70 mb-3">🎙️ 语音讲解（可选）</p>
                    <div className="flex flex-col items-center gap-3 py-4">
                      {!recorder.recording && !recorder.audioUrl && (
                        <motion.button
                          onClick={recorder.start}
                          className="h-20 w-20 rounded-full bg-gradient-to-br from-[#ff6b6b] to-[#ee5a24] flex items-center justify-center text-white text-2xl shadow-lg"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          🎤
                        </motion.button>
                      )}
                      {recorder.recording && (
                        <>
                          <motion.div
                            className="h-20 w-20 rounded-full bg-[#ff6b6b] flex items-center justify-center text-white shadow-lg"
                            animate={{ scale: [1, 1.1, 1], boxShadow: ['0 0 0 0 rgba(255,107,107,0.4)', '0 0 0 20px rgba(255,107,107,0)', '0 0 0 0 rgba(255,107,107,0.4)'] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                            onClick={recorder.stop}
                          >
                            <span className="text-xl">⏹️</span>
                          </motion.div>
                          <p className="text-sm text-[#ff6b6b] font-mono tabular-nums">{Math.floor(recorder.duration / 60)}:{String(recorder.duration % 60).padStart(2, '0')}</p>
                          <p className="text-xs text-white/30">点击停止录音</p>
                        </>
                      )}
                      {recorder.audioUrl && !recorder.recording && (
                        <div className="w-full space-y-2">
                          <audio src={recorder.audioUrl} controls className="w-full h-10 rounded-lg" style={{ filter: 'invert(0.85) hue-rotate(180deg)' }} />
                          <div className="flex gap-2">
                            <button onClick={recorder.clear} className="flex-1 rounded-lg border border-white/10 py-1.5 text-xs text-white/40 hover:text-white/70">重录</button>
                            <button className="flex-1 rounded-lg bg-emerald-500/20 border border-emerald-400/20 py-1.5 text-xs text-emerald-300">✅ 已保存</button>
                          </div>
                        </div>
                      )}
                      {!recorder.recording && !recorder.audioUrl && (
                        <p className="text-xs text-white/25">用你的声音讲解这个知识点</p>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Step 4: 定稿 + 提交 ── */}
          <AnimatePresence>
            {canFinalize && (
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className={`${glass} p-5`}>
                <p className="text-xs font-semibold text-white/30 uppercase tracking-widest mb-3">4 · 定稿</p>
                <div className="rounded-xl bg-black/20 border border-white/[0.06] p-4 mb-4">
                  <div className="flex gap-4">
                    {generatedImages[selectedIdx] && (
                      <img src={generatedImages[selectedIdx]} alt="" className="w-28 h-20 rounded-lg object-cover shrink-0" />
                    )}
                    <div>
                      <p className="text-xs text-[#f9ca24]/70 font-medium mb-1">{aiResults[selectedIdx]?.style}</p>
                      <p className="text-sm text-white/85 leading-relaxed">{editedTexts[selectedIdx]}</p>
                    </div>
                  </div>
                  {animHtml && <p className="text-xs text-violet-300/50 mt-2">📊 附带数学动画</p>}
                  {recorder.audioUrl && <p className="text-xs text-[#ff6b6b]/50 mt-1">🎙️ 附带语音讲解</p>}
                </div>
                <motion.button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="w-full rounded-xl py-3 text-sm font-semibold bg-gradient-to-r from-[#ff6b6b] via-[#a29bfe] to-[#f9ca24] text-[#1a0a0a] disabled:opacity-50"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  {isSubmitting ? '正在上链…' : '✨ 提交上链'}
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* 上链结果 */}
          {txResult && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`${glass} border-emerald-500/20 bg-emerald-500/[0.06] p-5`}>
              <p className="text-lg font-semibold text-emerald-300">✅ 已上链！</p>
              <p className="mt-2 break-all font-mono text-xs text-white/60">{txResult.txHash}</p>
              <a href={txResult.explorerUrl} target="_blank" rel="noreferrer" className="mt-3 inline-flex text-sm text-amber-300/80 hover:text-amber-200">
                在 Snowtrace 查看 ↗
              </a>
            </motion.div>
          )}
        </div>

        {/* ══════ 右侧：AI Chatbot ══════ */}
        <div className="hidden lg:flex w-[340px] shrink-0 flex-col">
          <div className={`${glass} flex flex-col h-[calc(100vh-7rem)] sticky top-16`}>
            <div className="px-4 py-3 border-b border-white/[0.06]">
              <p className="text-sm font-semibold text-white/80">💬 数学问答助手</p>
              <p className="text-[10px] text-white/30">有任何疑问随时问我</p>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
              {chat.messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-r from-coral-500/30 to-violet-500/20 text-white/90 rounded-br-md'
                      : 'bg-white/[0.06] text-white/75 rounded-bl-md'
                  }`}>
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </div>
              ))}
              {chat.loading && (
                <div className="flex justify-start">
                  <div className="bg-white/[0.06] rounded-2xl rounded-bl-md px-4 py-3">
                    <motion.div className="flex gap-1">
                      {[0, 1, 2].map(i => (
                        <motion.span key={i} className="h-1.5 w-1.5 rounded-full bg-white/40"
                          animate={{ y: [0, -4, 0] }}
                          transition={{ duration: 0.6, delay: i * 0.15, repeat: Infinity }}
                        />
                      ))}
                    </motion.div>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            <div className="px-3 py-3 border-t border-white/[0.06]">
              <div className="flex gap-2">
                <input
                  value={chat.input}
                  onChange={e => chat.setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), chat.send(chat.input))}
                  placeholder="问个问题…"
                  className="flex-1 bg-black/20 border border-white/10 rounded-xl px-3 py-2 text-sm text-white/90 placeholder:text-white/25 focus:outline-none focus:border-violet-400/40"
                />
                <motion.button
                  onClick={() => chat.send(chat.input)}
                  disabled={chat.loading || !chat.input.trim()}
                  className="shrink-0 rounded-xl bg-gradient-to-r from-coral-500/80 to-violet-500/80 px-3 py-2 text-xs font-semibold text-white disabled:opacity-40"
                  whileTap={{ scale: 0.95 }}
                >
                  发送
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
