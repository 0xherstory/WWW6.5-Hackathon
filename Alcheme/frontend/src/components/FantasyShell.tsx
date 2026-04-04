'use client'

import { ConnectButton } from '@rainbow-me/rainbowkit'
import { Sparkles } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { PropsWithChildren } from 'react'
import { shellNavItems, uiAssets } from '@/utils/uiAssets'

export function FantasyShell({
  children,
  className = '',
}: PropsWithChildren<{ className?: string }>) {
  const pathname = usePathname()

  return (
    <div
      className="fantasy-page"
      style={{
        backgroundImage: `url(${uiAssets.background})`,
      }}
    >
      <div className="sparkle-layer pointer-events-none">
        {Array.from({ length: 24 }).map((_, index) => (
          <span
            key={index}
            className="absolute animate-pulse"
            style={{
              left: `${(index * 37) % 100}%`,
              top: `${(index * 19) % 100}%`,
              animationDuration: `${2 + (index % 4)}s`,
            }}
          >
            <Sparkles className="text-white/35" size={8 + (index % 5) * 2} />
          </span>
        ))}
      </div>

      <div className="fantasy-panel">
        <header className="flex items-start justify-between gap-6">
          <Link href="/" className="shrink-0">
            <img
              src={uiAssets.logo}
              alt="Alcheme"
              className="h-28 w-auto object-contain md:h-36"
            />
          </Link>

          <div className="flex items-start gap-3 md:gap-4">
            <nav className="flex gap-2 md:gap-4">
              {shellNavItems.map((item) => {
                const active = pathname === item.href

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="nav-image-button"
                    aria-label={item.label}
                  >
                    <img
                      src={item.image}
                      alt={item.label}
                      className={`h-14 w-14 object-contain transition-all md:h-20 md:w-20 ${
                        active ? 'drop-shadow-[0_0_16px_rgba(255,215,0,0.9)]' : ''
                      }`}
                    />
                  </Link>
                )
              })}
            </nav>

            <ConnectButton.Custom>
              {({ account, chain, openAccountModal, openChainModal, openConnectModal, mounted }) => {
                if (!mounted) return <div className="hidden md:block h-12 w-32" />

                if (!account || !chain) {
                  return (
                    <button onClick={openConnectModal} className="gold-chip hidden md:block">
                      Connect Wallet
                    </button>
                  )
                }

                if (chain.unsupported) {
                  return (
                    <button onClick={openChainModal} className="gold-chip hidden md:block">
                      Wrong Network
                    </button>
                  )
                }

                return (
                  <div className="hidden md:flex flex-col items-end gap-2">
                    <button onClick={openChainModal} className="glass-chip">
                      {chain.name}
                    </button>
                    <button onClick={openAccountModal} className="gold-chip">
                      {account.displayName}
                    </button>
                  </div>
                )
              }}
            </ConnectButton.Custom>
          </div>
        </header>

        <div className={`mt-2 flex-1 ${className}`}>{children}</div>
      </div>
    </div>
  )
}
