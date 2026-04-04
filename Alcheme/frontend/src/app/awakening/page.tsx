'use client'

import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useAccount } from 'wagmi'
import { useMintMedal } from '@/hooks/useContracts'
import { FantasyShell } from '@/components/FantasyShell'
import { uiAssets } from '@/utils/uiAssets'

interface Card {
  id: string
  title: string
  image_url: string
  created_at: string
}

interface Medal {
  id: string
  title: string
  description: string
  image_url: string
  token_id: number | null
  parent_ids: string[]
  created_at: string
}

export default function AwakeningPage() {
  const { isConnected, address } = useAccount()
  const [cards, setCards] = useState<Card[]>([])
  const [medals, setMedals] = useState<Medal[]>([])
  const [selectedCards, setSelectedCards] = useState<string[]>([])
  const [selectedMedal, setSelectedMedal] = useState<string | null>(null)
  const [showSelection, setShowSelection] = useState(false)
  const [isAwakening, setIsAwakening] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [newMedal, setNewMedal] = useState<Medal | null>(null)
  const [editableTitle, setEditableTitle] = useState('')
  const [isPersistingMint, setIsPersistingMint] = useState(false)
  const [hasMintedCurrent, setHasMintedCurrent] = useState(false)
  const [lastHandledMintHash, setLastHandledMintHash] = useState<`0x${string}` | undefined>(undefined)

  // Tuning knobs for this page:
  // - ritualDoorWidth controls the idle door size
  // - ritualDoorOffsetY controls the door vertical offset
  // - resultMedalSize controls the preview medal diameter
  const ritualDoorWidth = 700
  const ritualDoorOffsetY = -50
  const resultMedalSize = 260

  const { mintMedal, isPending: isMinting, isConfirmed: mintConfirmed, receipt, hash } = useMintMedal()

  useEffect(() => {
    if (!isConnected || !address) {
      setIsLoading(false)
      return
    }

    void fetchData()
  }, [isConnected, address])

  useEffect(() => {
    if (
      isPersistingMint &&
      mintConfirmed &&
      receipt &&
      hash &&
      hash !== lastHandledMintHash &&
      receipt.transactionHash === hash &&
      newMedal
    ) {
      const medalMintedEvent = receipt.logs.find((log) => {
        return log.topics[0] === '0xdccdb8897eec6a644b93d2ff2b1d5a7fee4603857d745585ad971dfcd0ccd299'
      })

      if (medalMintedEvent && medalMintedEvent.topics[2]) {
        const tokenId = BigInt(medalMintedEvent.topics[2])

        fetch(`/api/medals/${newMedal.id}/mint`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tokenId: tokenId.toString() }),
        })
          .then(() => {
            setSelectedCards([])
            setSelectedMedal(null)
            setHasMintedCurrent(true)
            setLastHandledMintHash(hash)
            void fetchData()
          })
          .catch((error) => {
            console.error('Error syncing minted medal:', error)
          })
          .finally(() => {
            setIsPersistingMint(false)
          })
      }
    }
  }, [hash, isPersistingMint, lastHandledMintHash, mintConfirmed, receipt, newMedal])

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const [cardsRes, medalsRes] = await Promise.all([
        fetch(`/api/cards/${address}`).then((res) => res.json()),
        fetch(`/api/medals/${address}`).then((res) => res.json()),
      ])

      if (cardsRes.success) setCards(cardsRes.cards)
      if (medalsRes.success) setMedals(medalsRes.medals)
    } catch (error) {
      console.error('Error fetching awakening data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAwaken = async () => {
    if (!address || selectedCards.length === 0) return

    setIsAwakening(true)
    setShowSelection(false)

    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:30001'
      const [result] = await Promise.all([
        fetch(`${backendUrl}/api/medals/awaken`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            walletAddress: address,
            cardIds: selectedCards,
            existingMedalId: selectedMedal,
          }),
        }).then((res) => res.json()),
        new Promise((resolve) => setTimeout(resolve, 2400)),
      ])

      if (result.success) {
        setNewMedal(result.medal)
        setEditableTitle(result.medal.title)
        setHasMintedCurrent(false)
        setIsPersistingMint(false)
      }
    } catch (error) {
      console.error('Error awakening medal:', error)
    } finally {
      setIsAwakening(false)
    }
  }

  const handleMint = async () => {
    if (!newMedal || isPersistingMint || hasMintedCurrent) return

    if (editableTitle !== newMedal.title) {
      await fetch(`/api/medals/${newMedal.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: editableTitle }),
      })
    }

    try {
      setIsPersistingMint(true)
      mintMedal(newMedal.image_url, editableTitle, newMedal.description)
    } catch (error) {
      setIsPersistingMint(false)
      console.error('Error minting medal:', error)
    }
  }

  const handleContinueAwakening = async () => {
    setSelectedCards([])
    setSelectedMedal(null)
    setNewMedal(null)
    setEditableTitle('')
    setHasMintedCurrent(false)
    setIsPersistingMint(false)
    await fetchData()
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
            <p className="mt-4 text-xl">Connect your wallet to awaken or evolve medals.</p>
          </div>
        ) : newMedal ? (
          <div className="fantasy-card w-full max-w-[400px] rounded-[32px] p-6 text-center">
            <p className="cinzel text-sm font-bold uppercase tracking-[0.25em] text-[#8b6914]">Medal Forged</p>
            <div
              className="relative mx-auto mt-4"
              style={{ height: `${resultMedalSize}px`, width: `${resultMedalSize}px` }}
            >
              <div className="absolute inset-0 rounded-full bg-yellow-300/20 blur-3xl" />
              <div className="relative z-10 h-full w-full rounded-full bg-white/35 p-2 shadow-2xl">
                <img
                  src={newMedal.image_url}
                  alt={newMedal.title}
                  className="h-full w-full rounded-full object-contain"
                />
              </div>
            </div>
            <input value={editableTitle} onChange={(event) => setEditableTitle(event.target.value)} className="input-magical mt-4 text-center text-lg" />
            <p className="mt-3 text-base leading-7 text-[#5b3a1c]">{newMedal.description}</p>
            {hasMintedCurrent ? (
              <button onClick={() => void handleContinueAwakening()} className="gold-button mt-4 w-full">
                Continue Awakening
              </button>
            ) : (
              <button onClick={handleMint} disabled={isMinting || isPersistingMint} className="gold-button mt-4 w-full disabled:cursor-not-allowed disabled:opacity-60">
                {isMinting || isPersistingMint ? 'Minting...' : 'Mint On-Chain'}
              </button>
            )}
          </div>
        ) : (
          <>
            <button
              onClick={() => setShowSelection((current) => !current)}
              className="group relative w-full"
              style={{ maxWidth: `${ritualDoorWidth}px`, transform: `translateY(${ritualDoorOffsetY}px)` }}
            >
              <div className="absolute inset-0 rounded-full bg-yellow-200/20 blur-3xl" />
              <img src={uiAssets.awakenDoor} alt="Awaken door" className="relative z-10 w-full object-contain drop-shadow-[0_15px_40px_rgba(139,92,246,0.35)] transition-transform duration-300 group-hover:scale-[1.02]" />
              <p className="cinzel mt-3 text-center text-lg font-bold uppercase tracking-[0.3em] text-[#8b6914]">Open Ritual</p>
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
                      <p className="cinzel text-sm font-bold uppercase tracking-[0.25em] text-[#8b6914]">Awakening Ritual</p>
                      <p className="text-lg text-[#5b3a1c]">Pick milestone cards, and optionally evolve an existing medal.</p>
                    </div>
                    <span className="text-sm text-[#8b6914]">{selectedCards.length} cards</span>
                  </div>

                  <div>
                    <p className="cinzel text-xs font-bold uppercase tracking-[0.2em] text-[#8b6914]">Cards</p>
                    <div className="mt-3 grid grid-cols-2 gap-4 md:grid-cols-3">
                      {cards.map((card) => {
                        const selected = selectedCards.includes(card.id)
                        return (
                          <button
                            key={card.id}
                            onClick={() => {
                              setSelectedCards((current) =>
                                current.includes(card.id)
                                  ? current.filter((id) => id !== card.id)
                                  : [...current, card.id],
                              )
                            }}
                            className={`overflow-hidden rounded-[24px] border p-2 transition ${
                              selected ? 'border-[#8b6914] bg-white/80 shadow-lg' : 'border-[#8b6914]/15 bg-white/50'
                            }`}
                          >
                            <img src={card.image_url} alt={card.title} className="aspect-[3/4] w-full rounded-[18px] object-cover" />
                            <p className="mt-2 line-clamp-2 text-sm leading-5 text-[#5b3a1c]">{card.title}</p>
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {medals.length > 0 && (
                    <div className="mt-6">
                      <p className="cinzel text-xs font-bold uppercase tracking-[0.2em] text-[#8b6914]">Optional Evolution Target</p>
                      <div className="mt-3 grid grid-cols-2 gap-4 md:grid-cols-3">
                        {medals.map((medal) => {
                          const selected = selectedMedal === medal.id
                          return (
                            <button
                              key={medal.id}
                              onClick={() => setSelectedMedal((current) => (current === medal.id ? null : medal.id))}
                              className={`overflow-hidden rounded-[24px] border p-2 transition ${
                                selected ? 'border-[#8b6914] bg-white/80 shadow-lg' : 'border-[#8b6914]/15 bg-white/50'
                              }`}
                            >
                              <img src={medal.image_url} alt={medal.title} className="aspect-square w-full rounded-[18px] object-cover" />
                              <p className="mt-2 line-clamp-2 text-sm leading-5 text-[#5b3a1c]">{medal.title}</p>
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  <div className="mt-5 flex gap-3">
                    <button onClick={handleAwaken} disabled={selectedCards.length === 0 || isAwakening} className="gold-button disabled:cursor-not-allowed disabled:opacity-60">
                      {isAwakening ? 'Awakening...' : selectedMedal ? 'Evolve Medal' : 'Awaken Medal'}
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
            <p className="cinzel text-base font-bold uppercase tracking-[0.25em] text-[#8b6914]">Honor Archive</p>
            <p className="mt-3 text-5xl font-bold">{cards.length}</p>
            <p className="mt-2 text-lg">available cards</p>
            <p className="mt-4 text-3xl font-bold">{medals.length}</p>
            <p className="text-lg">stored medals</p>
          </div>
        </div>

        <div className="fantasy-card rounded-[32px] p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="cinzel text-sm font-bold uppercase tracking-[0.25em] text-[#8b6914]">Medal Shelf</p>
              <p className="text-base text-[#6b4a2c]">Most recent medals from the backend.</p>
            </div>
            {isLoading && <span className="text-sm text-[#8b6914]">Loading...</span>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {medals.slice(0, 4).map((medal) => (
              <div key={medal.id} className="overflow-hidden rounded-[24px] border border-[#8b6914]/15 bg-white/60 p-2 text-center">
                <img src={medal.image_url} alt={medal.title} className="aspect-square w-full rounded-[18px] object-cover" />
                <p className="mt-2 line-clamp-2 text-sm leading-5 text-[#5b3a1c]">{medal.title}</p>
              </div>
            ))}
            {!isLoading && medals.length === 0 && (
              <div className="col-span-2 rounded-[24px] border border-dashed border-[#8b6914]/20 bg-white/35 px-4 py-10 text-center text-[#7b5a39]">
                Your first medal will appear here.
              </div>
            )}
          </div>
        </div>
      </div>
    </FantasyShell>
  )
}
