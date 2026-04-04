'use client'

import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useAccount } from 'wagmi'
import { FantasyShell } from '@/components/FantasyShell'
import { uiAssets } from '@/utils/uiAssets'

interface Medal {
  id: string
  title: string
  description: string
  image_url: string
  token_id: number | null
  parent_ids: string[]
  created_at: string
}

// Medal wall tuning controls:
// - wallMaxWidth controls the full wall size
// - wallOffsetX / wallOffsetY move the whole wall block
// - medalWallSlots control each medal position and size individually
const wallMaxWidth = 700
const wallOffsetX = 0
const wallOffsetY = 0

const medalWallSlots = [
  { left: '31.3%', top: '28.0%', size: '14.0%' },
  { left: '50.2%', top: '28.0%', size: '14.0%' },
  { left: '69.3%', top: '28.5%', size: '14.5%' },
  { left: '31.3%', top: '28.0%', size: '14.0%' },
  { left: '50.2%', top: '28.0%', size: '14.0%' },
  { left: '69.3%', top: '28.5%', size: '14.5%' },
  { left: '31.3%', top: '28.0%', size: '14.0%' },
  { left: '50.2%', top: '28.0%', size: '14.0%' },
  { left: '69.3%', top: '28.5%', size: '14.5%' },
] as const

export default function ProfilePage() {
  const { isConnected, address } = useAccount()
  const [medals, setMedals] = useState<Medal[]>([])
  const [selectedMedal, setSelectedMedal] = useState<Medal | null>(null)
  const [nickname, setNickname] = useState('')
  const [editingNickname, setEditingNickname] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const storedNickname = localStorage.getItem('userNickname')
    if (storedNickname) {
      setNickname(storedNickname)
      setEditingNickname(storedNickname)
    }
  }, [])

  useEffect(() => {
    if (!isConnected || !address) {
      setIsLoading(false)
      return
    }

    void fetchMedals()
  }, [isConnected, address])

  const fetchMedals = async () => {
    setIsLoading(true)
    try {
      const res = await fetch(`/api/medals/${address}`)
      const data = await res.json()
      if (data.success) {
        setMedals(data.medals)
      }
    } catch (error) {
      console.error('Error fetching medals:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveNickname = () => {
    const nextName = editingNickname.trim()
    setNickname(nextName)
    localStorage.setItem('userNickname', nextName)
    setIsEditing(false)
  }

  return (
    <FantasyShell className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-start">
      <div className="lg:col-span-3 flex items-end justify-center lg:justify-start">
        <img src={uiAssets.character} alt="Character" className="max-h-[520px] w-auto object-contain drop-shadow-2xl" />
      </div>

      <div className="lg:col-span-5 flex items-center justify-center">
        {!isConnected ? (
          <div className="fantasy-card w-full rounded-[32px] p-8 text-center text-[#5b3a1c]">
            <p className="cinzel text-2xl font-bold uppercase tracking-[0.24em] text-[#8b6914]">Wallet Required</p>
            <p className="mt-4 text-xl">Connect your wallet to browse your medals and soul archive.</p>
          </div>
        ) : (
          <div
            className="relative w-full"
            style={{
              maxWidth: `${wallMaxWidth}px`,
              transform: `translate(${wallOffsetX}px, ${wallOffsetY}px)`,
            }}
          >
            <img src={uiAssets.medalWall} alt="Medal wall" className="mx-auto w-full object-contain opacity-95" />
            <div className="absolute inset-0 overflow-visible">
              {medalWallSlots.map((slot, index) => {
                const medal = medals[index]
                return (
                  <button
                    key={index}
                    onClick={() => medal && setSelectedMedal(medal)}
                    className={`absolute flex items-center justify-center rounded-full ${medal ? 'hover:scale-105' : 'border border-dashed border-[#8b6914]/15'} transition`}
                    style={{
                      left: slot.left,
                      top: slot.top,
                      width: slot.size,
                      height: slot.size,
                      transform: 'translate(-50%, -50%)',
                    }}
                  >
                    {medal ? (
                      <img src={medal.image_url} alt={medal.title} className="h-full w-full rounded-full object-cover shadow-lg" />
                    ) : null}
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </div>

      <div className="lg:col-span-4 flex flex-col gap-6">
        <div className="relative mx-auto w-full max-w-[420px] pt-16">
          <img src={uiAssets.owl} alt="" className="absolute left-1/2 top-0 h-40 w-40 -translate-x-1/2 object-contain" />
          <img src={uiAssets.parchment} alt="" className="w-full object-contain drop-shadow-xl" />
          <div className="absolute inset-0 flex flex-col justify-center px-10 pb-8 pt-20 text-center text-[#5b3a1c]">
            <p className="cinzel text-base font-bold uppercase tracking-[0.25em] text-[#8b6914]">Soul Archive</p>
            <p className="mt-3 text-5xl font-bold">{medals.length}</p>
            <p className="mt-2 text-lg">medals recorded</p>
            <p className="mt-4 text-base">Wallet</p>
            <p className="text-sm">{address ? `${address.slice(0, 6)}...${address.slice(-4)}` : '--'}</p>
          </div>
        </div>

        <div className="fantasy-card rounded-[32px] p-6">
          <p className="cinzel text-sm font-bold uppercase tracking-[0.25em] text-[#8b6914]">Profile Name</p>
          {isEditing ? (
            <div className="mt-4 flex gap-3">
              <input value={editingNickname} onChange={(event) => setEditingNickname(event.target.value)} className="input-magical flex-1" placeholder="Choose a name" />
              <button onClick={handleSaveNickname} className="gold-button">Save</button>
            </div>
          ) : (
            <button onClick={() => setIsEditing(true)} className="mt-4 w-full rounded-[24px] border border-[#8b6914]/15 bg-white/55 px-4 py-4 text-left text-lg text-[#5b3a1c] transition hover:bg-white/75">
              {nickname || 'Add your archive name'}
            </button>
          )}
        </div>

        <div className="fantasy-card rounded-[32px] p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="cinzel text-sm font-bold uppercase tracking-[0.25em] text-[#8b6914]">Recent Medals</p>
              <p className="text-base text-[#6b4a2c]">Open any medal for details.</p>
            </div>
            {isLoading && <span className="text-sm text-[#8b6914]">Loading...</span>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {medals.slice(0, 4).map((medal) => (
              <button key={medal.id} onClick={() => setSelectedMedal(medal)} className="overflow-hidden rounded-[24px] border border-[#8b6914]/15 bg-white/60 p-2 text-center transition hover:scale-[1.02]">
                <img src={medal.image_url} alt={medal.title} className="aspect-square w-full rounded-[18px] object-cover" />
                <p className="mt-2 line-clamp-2 text-sm leading-5 text-[#5b3a1c]">{medal.title}</p>
              </button>
            ))}
            {!isLoading && medals.length === 0 && (
              <div className="col-span-2 rounded-[24px] border border-dashed border-[#8b6914]/20 bg-white/35 px-4 py-10 text-center text-[#7b5a39]">
                No medals minted yet.
              </div>
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {selectedMedal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-6 backdrop-blur-sm"
            onClick={() => setSelectedMedal(null)}
          >
            <motion.div
              initial={{ scale: 0.92, y: 18 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.92, y: 18 }}
              className="fantasy-card w-full max-w-2xl rounded-[32px] p-6 md:p-8"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="grid grid-cols-1 gap-6 md:grid-cols-[280px_1fr] md:items-center">
                <img src={selectedMedal.image_url} alt={selectedMedal.title} className="aspect-square w-full rounded-[28px] object-cover shadow-2xl" />
                <div>
                  <p className="cinzel text-sm font-bold uppercase tracking-[0.25em] text-[#8b6914]">Medal Detail</p>
                  <h2 className="mt-3 text-3xl font-bold text-[#3d2817]">{selectedMedal.title}</h2>
                  <p className="mt-3 text-lg leading-8 text-[#5b3a1c]">{selectedMedal.description}</p>
                  <div className="mt-5 space-y-2 text-base text-[#6b4a2c]">
                    <p>Created: {new Date(selectedMedal.created_at).toLocaleDateString()}</p>
                    <p>Token ID: {selectedMedal.token_id ?? 'Not minted yet'}</p>
                    <p>Parent cards: {selectedMedal.parent_ids?.length || 0}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </FantasyShell>
  )
}
