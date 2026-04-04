'use client'

import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Trash2 } from 'lucide-react'
import { useAccount } from 'wagmi'
import { FantasyShell } from '@/components/FantasyShell'
import { uiAssets } from '@/utils/uiAssets'
import { getOreVisual, type OreDimension } from '@/utils/oreVisuals'

interface SavedOre {
  id: string
  raw_input: string
  refined_data: {
    id: number
    text: string
    dimension: OreDimension
    score: number
  }
  created_at: string
}

interface EditingOre {
  id: number
  text: string
  dimension: OreDimension
  score: number
}

export default function MiningPage() {
  const { isConnected, address } = useAccount()
  const [input, setInput] = useState('')
  const [ores, setOres] = useState<EditingOre[]>([])
  const [savedOres, setSavedOres] = useState<SavedOre[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (!isConnected || !address) {
      setSavedOres([])
      setIsLoading(false)
      return
    }

    void fetchSavedOres()
  }, [isConnected, address])

  const fetchSavedOres = async () => {
    setIsLoading(true)
    try {
      const res = await fetch(`/api/ores/${address}`)
      const data = await res.json()
      if (data.success) {
        setSavedOres(data.ores)
      }
    } catch (error) {
      console.error('Error fetching saved ores:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAnalyze = async () => {
    if (!input.trim() || !address) return

    setIsAnalyzing(true)
    try {
      const [result] = await Promise.all([
        fetch('/api/ores/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            walletAddress: address,
            input,
          }),
        }).then((res) => res.json()),
        new Promise((resolve) => setTimeout(resolve, 1800)),
      ])

      if (result.success) {
        setOres(result.ores)
      }
    } catch (error) {
      console.error('Error analyzing ores:', error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleConfirm = async () => {
    if (!address || ores.length === 0) return

    setIsSaving(true)
    try {
      await fetch('/api/ores/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress: address,
          ores,
          rawInput: input,
        }),
      })

      setInput('')
      setOres([])
      await fetchSavedOres()
    } catch (error) {
      console.error('Error saving ores:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteOre = (id: number) => {
    setOres((current) => current.filter((ore) => ore.id !== id))
  }

  const handleAddOre = () => {
    const nextId = Math.max(0, ...ores.map((ore) => ore.id)) + 1
    setOres((current) => [
      ...current,
      { id: nextId, text: '', dimension: 'Wisdom', score: 3 },
    ])
  }

  const connectedContent = !isConnected ? (
    <div className="fantasy-card rounded-[32px] p-8 text-center text-[#5b3a1c]">
      <p className="cinzel text-2xl font-bold uppercase tracking-[0.24em] text-[#8b6914]">Wallet Required</p>
      <p className="mt-4 text-xl">Connect your wallet from the top-right corner to start collecting.</p>
    </div>
  ) : (
    <>
      <div className="fantasy-card rounded-[32px] p-6 md:p-8">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="cinzel text-sm font-bold uppercase tracking-[0.25em] text-[#8b6914]">Mining Journal</p>
            <p className="text-lg text-[#5b3a1c]">Write today's growth and let the backend extract ores.</p>
          </div>
          <span className="cinzel text-sm text-[#8b6914]">{new Date().toLocaleDateString()}</span>
        </div>

        <textarea
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Write about what you learned, built, or reflected on today..."
          className="input-magical min-h-[220px] resize-none text-lg leading-8"
        />

        <div className="mt-5 flex flex-wrap gap-3">
          <button onClick={handleAnalyze} disabled={!input.trim() || isAnalyzing} className="gold-button disabled:cursor-not-allowed disabled:opacity-60">
            {isAnalyzing ? 'Analyzing...' : 'Analyze Ores'}
          </button>
          <button onClick={() => setInput('')} className="glass-chip">Clear</button>
        </div>
      </div>

      <AnimatePresence>
        {ores.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            className="fantasy-card rounded-[32px] p-6 md:p-8"
          >
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <p className="cinzel text-sm font-bold uppercase tracking-[0.25em] text-[#8b6914]">Extracted Ores</p>
                <p className="text-lg text-[#5b3a1c]">Adjust the generated results before saving them.</p>
              </div>
              <button onClick={handleAddOre} className="glass-chip">Add Ore</button>
            </div>

            <div className="space-y-4">
              {ores.map((ore) => (
                <div key={ore.id} className="rounded-[24px] border border-[#8b6914]/20 bg-white/55 p-4 shadow-sm">
                  {(() => {
                    const visual = getOreVisual(ore.dimension, `${ore.id}-${ore.text}-${ore.dimension}`)

                    return (
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="relative flex h-12 w-12 items-center justify-center">
                            <div className={`absolute inset-1 rounded-full blur-md ${visual.glowClass}`} />
                            <img
                              src={visual.crystal}
                              alt={visual.label}
                              className="relative z-10 h-12 w-12 object-contain drop-shadow-md"
                            />
                          </div>
                          <div>
                            <p className="cinzel text-sm font-bold uppercase tracking-[0.2em] text-[#8b6914]">{visual.label}</p>
                            <p className="text-sm text-[#6b4a2c]">Quality {ore.score}/5</p>
                          </div>
                        </div>
                        <button onClick={() => handleDeleteOre(ore.id)} className="text-[#8b6914] transition hover:text-red-500">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    )
                  })()}
                  <input
                    value={ore.text}
                    onChange={(event) => {
                      const nextText = event.target.value
                      setOres((current) =>
                        current.map((item) => (item.id === ore.id ? { ...item, text: nextText } : item)),
                      )
                    }}
                    className="input-magical"
                    placeholder="Describe this ore"
                  />
                </div>
              ))}
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              <button onClick={handleConfirm} disabled={isSaving} className="gold-button disabled:cursor-not-allowed disabled:opacity-60">
                {isSaving ? 'Saving...' : 'Store in Vault'}
              </button>
              <button onClick={() => setOres([])} className="glass-chip">Discard</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )

  return (
    <FantasyShell className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-start">
      <div className="lg:col-span-3 flex items-end justify-center lg:justify-start">
        <img src={uiAssets.character} alt="Character" className="max-h-[520px] w-auto object-contain drop-shadow-2xl" />
      </div>

      <div className="lg:col-span-5 flex flex-col gap-6">{connectedContent}</div>

      <div className="lg:col-span-4 flex flex-col gap-6">
        <div className="relative mx-auto w-full max-w-[420px] pt-16">
          <img src={uiAssets.owl} alt="" className="absolute left-1/2 top-0 h-40 w-40 -translate-x-1/2 object-contain" />
          <img src={uiAssets.parchment} alt="" className="w-full object-contain drop-shadow-xl" />
          <div className="absolute inset-0 flex flex-col justify-center px-10 pb-8 pt-20 text-center text-[#5b3a1c]">
            <p className="cinzel text-base font-bold uppercase tracking-[0.25em] text-[#8b6914]">Ore Vault</p>
            <p className="mt-3 text-5xl font-bold">{savedOres.length}</p>
            <p className="mt-3 text-lg">Saved ores connected to your wallet.</p>
          </div>
        </div>

        <div className="fantasy-card rounded-[32px] p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="cinzel text-sm font-bold uppercase tracking-[0.25em] text-[#8b6914]">Recent Ores</p>
              <p className="text-base text-[#6b4a2c]">Live data from the backend.</p>
            </div>
            {isLoading && <span className="text-sm text-[#8b6914]">Loading...</span>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {savedOres.slice(0, 6).map((ore) => {
              const visual = getOreVisual(
                ore.refined_data?.dimension ?? 'Wisdom',
                `${ore.id}-${ore.refined_data?.text || ore.raw_input}`,
              )

              return (
                <div key={ore.id} className="rounded-[24px] border border-[#8b6914]/15 bg-white/60 p-3 text-center">
                  <div className="relative mx-auto flex h-16 w-16 items-center justify-center">
                    <div className={`absolute inset-2 rounded-full blur-md ${visual.glowClass}`} />
                    <img
                      src={visual.crystal}
                      alt={visual.label}
                      className="relative z-10 h-16 w-16 object-contain drop-shadow-md"
                    />
                  </div>
                  <p className="mt-2 line-clamp-2 text-sm leading-5 text-[#5b3a1c]">{ore.refined_data?.text || ore.raw_input}</p>
                </div>
              )
            })}
            {!isLoading && savedOres.length === 0 && (
              <div className="col-span-2 rounded-[24px] border border-dashed border-[#8b6914]/20 bg-white/35 px-4 py-10 text-center text-[#7b5a39]">
                No ores yet. Your first saved entry will appear here.
              </div>
            )}
          </div>
        </div>
      </div>
    </FantasyShell>
  )
}
