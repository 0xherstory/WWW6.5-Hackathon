'use client'

import { ConnectButton } from '@rainbow-me/rainbowkit'
import { Sparkles } from 'lucide-react'
import Link from 'next/link'
import { useAccount } from 'wagmi'
import { FantasyShell } from '@/components/FantasyShell'
import { uiAssets } from '@/utils/uiAssets'

export default function HomePage() {
  const { isConnected } = useAccount()

  return (
    <FantasyShell className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-end">
      <div className="lg:col-span-4 flex items-end justify-center">
        <img
          src={uiAssets.character}
          alt="Alchemist character"
          className="max-h-[520px] w-auto object-contain drop-shadow-2xl"
        />
      </div>

      <div className="lg:col-span-4 flex flex-col items-center justify-center text-center">
        <button
          className="group relative mx-auto flex w-full max-w-[420px] flex-col items-center"
          onClick={() => {
            const element = document.getElementById('home-primary-action')
            element?.scrollIntoView({ behavior: 'smooth', block: 'center' })
          }}
        >
          <div className="absolute inset-0 rounded-full bg-purple-300/20 blur-3xl" />
          <img
            src={uiAssets.crystal}
            alt="Floating crystal"
            className="relative z-10 w-full max-w-[360px] animate-float object-contain drop-shadow-[0_15px_40px_rgba(168,85,247,0.35)] transition-transform duration-300 group-hover:scale-[1.03]"
          />
          <span className="cinzel mt-4 text-lg font-bold uppercase tracking-[0.35em] text-[#8b6914]">
            Click to Begin
          </span>
          <img src={uiAssets.magicOrbs} alt="" className="mt-3 w-52 opacity-70 mix-blend-multiply" />
        </button>
      </div>

      <div className="lg:col-span-4 flex flex-col items-center justify-center gap-6 pb-8">
        <div className="relative w-full max-w-[440px]">
          <img src={uiAssets.owl} alt="" className="absolute -top-16 left-1/2 z-10 h-48 w-48 -translate-x-1/2 object-contain" />
          <img src={uiAssets.parchment} alt="" className="w-full object-contain drop-shadow-xl" />
          <div className="absolute inset-0 flex flex-col justify-center gap-4 px-12 pb-6 pt-20">
            {[
              'Write your daily growth',
              'Refine records into cards',
              'Awaken your soul medal',
            ].map((item, index) => (
              <div key={item} className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/70 text-[#8b6914] shadow-sm">
                    <Sparkles size={16} />
                  </span>
                  <span className="cinzel text-lg font-black text-[#3d2817]">{item}</span>
                </div>
                <span className="cinzel text-sm font-bold text-[#8b6914]">0{index + 1}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="lg:col-span-12 mt-2 flex flex-col items-center gap-8">
        <div id="home-primary-action">
          {isConnected ? (
            <Link href="/mining" className="gold-button inline-flex items-center justify-center px-10 py-4 text-lg">
              Start Collecting
            </Link>
          ) : (
            <ConnectButton.Custom>
              {({ openConnectModal }) => (
                <button onClick={openConnectModal} className="gold-button px-10 py-4 text-lg">
                  Connect Wallet
                </button>
              )}
            </ConnectButton.Custom>
          )}
        </div>

        <div className="grid w-full max-w-5xl grid-cols-1 gap-5 md:grid-cols-3">
          <FeatureCard href="/mining" title="Collect" description="Capture daily thoughts and turn them into ores with the connected backend flow." />
          <FeatureCard href="/refining" title="Refine" description="Select saved ores and refine them into milestone cards without losing the new UI." />
          <FeatureCard href="/awakening" title="Awaken" description="Combine cards, mint medals on-chain, and preserve your identity." />
        </div>
      </div>
    </FantasyShell>
  )
}

function FeatureCard({
  href,
  title,
  description,
}: {
  href: string
  title: string
  description: string
}) {
  return (
    <Link href={href} className="fantasy-card rounded-[28px] p-6 transition-transform duration-300 hover:-translate-y-1">
      <p className="cinzel text-xl font-bold uppercase tracking-[0.24em] text-[#8b6914]">{title}</p>
      <p className="mt-3 text-lg leading-7 text-[#5b3a1c]">{description}</p>
    </Link>
  )
}
