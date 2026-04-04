'use client'

import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useAccount } from 'wagmi'
import { FantasyShell } from '@/components/FantasyShell'
import { uiAssets } from '@/utils/uiAssets'

interface Ore {
  id: string
  refined_data: {
    text: string
    dimension: 'Wisdom' | 'Will' | 'Creation' | 'Connection'
    score: number
  }
  created_at: string
}

interface Card {
  id: string
  title: string
  image_url: string
  created_at: string
}

const dimensionInfo = {
  Wisdom: { label: 'Wisdom', gradient: 'ore-gradient-wisdom', crystal: uiAssets.crystals[0] },
  Will: { label: 'Will', gradient: 'ore-gradient-will', crystal: uiAssets.crystals[4] },
  Creation: { label: 'Creation', gradient: 'ore-gradient-creation', crystal: uiAssets.crystals[2] },
  Connection: { label: 'Connection', gradient: 'ore-gradient-connection', crystal: uiAssets.crystals[5] },
} as const

export default function RefiningPage() {
  const { isConnected, address } = useAccount()
  const [ores, setOres] = useState<Ore[]>([])
  const [cards, setCards] = useState<Card[]>([])
  const [selectedOres, setSelectedOres] = useState<string[]>([])
  const [showSelection, setShowSelection] = useState(false)
  const [isRefining, setIsRefining] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [newCard, setNewCard] = useState<Card | null>(null)
  const [editableTitle, setEditableTitle] = useState('')

  useEffect(() => {
    if (!isConnected || !address) {
      setIsLoading(false)
      return
    }

    void fetchData()
  }, [isConnected, address])

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const [oresRes, cardsRes] = await Promise.all([
        fetch(`/api/ores/${address}`).then((res) => res.json()),
        fetch(`/api/cards/${address}`).then((res) => res.json()),
      ])

      if (oresRes.success) setOres(oresRes.ores)
      if (cardsRes.success) setCards(cardsRes.cards)
    } catch (error) {
      console.error('Error fetching refining data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRefine = async () => {
    if (!address || selectedOres.length === 0) return

    setIsRefining(true)
    setShowSelection(false)

    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:30001'
      const [result] = await Promise.all([
        fetch(`${backendUrl}/api/cards/refine`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            walletAddress: address,
            oreIds: selectedOres,
          }),
        }).then((res) => res.json()),
        new Promise((resolve) => setTimeout(resolve, 2200)),
      ])

      if (result.success) {
        setNewCard(result.card)
        setEditableTitle(result.card.title)
      }
    } catch (error) {
      console.error('Error refining ores:', error)
    } finally {
      setIsRefining(false)
    }
  }

  const handleSaveCard = async () => {
    if (!newCard) return

    try {
      if (editableTitle !== newCard.title) {
        await fetch(`/api/cards/${newCard.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: editableTitle }),
        })
      }

      setNewCard(null)
      setSelectedOres([])
      await fetchData()
    } catch (error) {
      console.error('Error saving card:', error)
    }
  }

  return (
    <FantasyShell className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-start">
      <div className="lg:col-span-3 flex items-end justify-center lg:justify-start">
        <img src={uiAssets.character} alt="Character" className="max-h-[520px] w-auto object-contain drop-shadow-2xl" />
      </div>

      <div className="lg:col-span-5 flex flex-col items-center gap-6">
        {!isConnected ? (
          <div className="fantasy-card w-full rounded-[32px] p-8 text-center text-[#5b3a1c]">
            <p className="cinzel text-2xl font-bold uppercase tracking-[0.24em] text-[#8b6914]">Wallet Required</p>
            <p className="mt-4 text-xl">Connect your wallet to refine saved ores into cards.</p>
          </div>
        ) : newCard ? (
          <div className="fantasy-card w-full max-w-[420px] rounded-[32px] p-6 text-center">
            <p className="cinzel text-sm font-bold uppercase tracking-[0.25em] text-[#8b6914]">Refining Complete</p>
            <div className="mt-4 overflow-hidden rounded-[28px] border border-[#8b6914]/20 bg-white/60 p-3 shadow-sm">
              <img src={newCard.image_url} alt={newCard.title} className="aspect-[3/4] w-full rounded-[22px] object-cover" />
            </div>
            <input value={editableTitle} onChange={(event) => setEditableTitle(event.target.value)} className="input-magical mt-4 text-center text-lg" />
            <button onClick={handleSaveCard} className="gold-button mt-4 w-full">Store Card</button>
          </div>
        ) : (
          <>
            <button onClick={() => setShowSelection((current) => !current)} className="group relative w-full max-w-[420px]">
              <div className="absolute inset-0 rounded-full bg-purple-300/20 blur-3xl" />
              <img src={uiAssets.cauldron} alt="Cauldron" className="relative z-10 w-full object-contain drop-shadow-[0_15px_40px_rgba(168,85,247,0.35)] transition-transform duration-300 group-hover:scale-[1.02]" />
              <p className="cinzel mt-3 text-center text-lg font-bold uppercase tracking-[0.3em] text-[#8b6914]">Click to Refine</p>
            </button>

            <AnimatePresence>
              {showSelection && (
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 16 }}
                  className="fantasy-card w-full rounded-[32px] p-6"
                >
                  <div className="mb-5 flex items-center justify-between gap-4">
                    <div>
                      <p className="cinzel text-sm font-bold uppercase tracking-[0.25em] text-[#8b6914]">Ore Cabinet</p>
                      <p className="text-lg text-[#5b3a1c]">Choose the ores you want to refine into a milestone card.</p>
                    </div>
                    <span className="text-sm text-[#8b6914]">{selectedOres.length} selected</span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                    {ores.map((ore) => {
                      const selected = selectedOres.includes(ore.id)
                      const info = dimensionInfo[ore.refined_data.dimension]
                      return (
                        <button
                          key={ore.id}
                          onClick={() => {
                            setSelectedOres((current) =>
                              current.includes(ore.id)
                                ? current.filter((id) => id !== ore.id)
                                : [...current, ore.id],
                            )
                          }}
                          className={`rounded-[24px] border p-4 text-center transition ${
                            selected ? 'border-[#8b6914] bg-white/80 shadow-lg' : 'border-[#8b6914]/15 bg-white/50'
                          }`}
                        >
                          <div className="relative mx-auto flex h-16 w-16 items-center justify-center">
                            <div className={`absolute inset-2 rounded-full blur-md ${info.gradient}`} />
                            <img
                              src={info.crystal}
                              alt={info.label}
                              className="relative z-10 h-16 w-16 object-contain drop-shadow-md"
                            />
                          </div>
                          <p className="cinzel mt-2 text-xs font-bold uppercase tracking-[0.2em] text-[#8b6914]">{info.label}</p>
                          <p className="mt-2 line-clamp-2 text-sm leading-5 text-[#5b3a1c]">{ore.refined_data.text}</p>
                        </button>
                      )
                    })}
                  </div>

                  <div className="mt-5 flex gap-3">
                    <button onClick={handleRefine} disabled={selectedOres.length === 0 || isRefining} className="gold-button disabled:cursor-not-allowed disabled:opacity-60">
                      {isRefining ? 'Refining...' : 'Refine Selected'}
                    </button>
                    <button onClick={() => setShowSelection(false)} className="glass-chip">Close</button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </div>

      <div className="lg:col-span-4 flex flex-col gap-6">
        <div className="relative mx-auto w-full max-w-[420px] pt-16">
          <img src={uiAssets.owl} alt="" className="absolute left-1/2 top-0 h-40 w-40 -translate-x-1/2 object-contain" />
          <img src={uiAssets.parchment} alt="" className="w-full object-contain drop-shadow-xl" />
          <div className="absolute inset-0 flex flex-col justify-center px-10 pb-8 pt-20 text-center text-[#5b3a1c]">
            <p className="cinzel text-base font-bold uppercase tracking-[0.25em] text-[#8b6914]">Inventory</p>
            <p className="mt-3 text-5xl font-bold">{ores.length}</p>
            <p className="mt-2 text-lg">refinable ores</p>
            <p className="mt-4 text-3xl font-bold">{cards.length}</p>
            <p className="text-lg">existing cards</p>
          </div>
        </div>

        <div className="fantasy-card rounded-[32px] p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="cinzel text-sm font-bold uppercase tracking-[0.25em] text-[#8b6914]">Card Gallery</p>
              <p className="text-base text-[#6b4a2c]">Latest refined cards from the backend.</p>
            </div>
            {isLoading && <span className="text-sm text-[#8b6914]">Loading...</span>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {cards.slice(0, 4).map((card) => (
              <div key={card.id} className="overflow-hidden rounded-[24px] border border-[#8b6914]/15 bg-white/60 p-2">
                <img src={card.image_url} alt={card.title} className="aspect-[3/4] w-full rounded-[18px] object-cover" />
                <p className="mt-2 line-clamp-2 text-sm leading-5 text-[#5b3a1c]">{card.title}</p>
              </div>
            ))}
            {!isLoading && cards.length === 0 && (
              <div className="col-span-2 rounded-[24px] border border-dashed border-[#8b6914]/20 bg-white/35 px-4 py-10 text-center text-[#7b5a39]">
                Your first refined card will appear here.
              </div>
            )}
          </div>
        </div>
      </div>
    </FantasyShell>
  )
}
