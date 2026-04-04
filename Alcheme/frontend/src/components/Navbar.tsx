'use client'

import { ConnectButton } from '@rainbow-me/rainbowkit'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'

const navItems = [
  { href: '/mining', label: '采集', icon: '⛏️' },
  { href: '/refining', label: '精炼', icon: '⚗️' },
  { href: '/awakening', label: '觉醒', icon: '✨' },
  { href: '/profile', label: '灵魂', icon: '🔮' },
]

export function Navbar() {
  const pathname = usePathname()

  return (
    <nav className="glass sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl">🔮</span>
            <span className="text-xl font-bold text-gradient">
              Alcheme
            </span>
          </Link>

          <div className="hidden md:flex items-center space-x-6">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-all duration-300 ${
                  pathname === item.href
                    ? 'bg-purple-500/20 text-purple-400'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}
          </div>

          <ConnectButton.Custom>
            {({ account, chain, openAccountModal, openChainModal, openConnectModal, mounted }) => {
              const ready = mounted
              const connected = ready && account && chain

              return (
                <div
                  {...(!ready && {
                    'aria-hidden': true,
                    style: {
                      opacity: 0,
                      pointerEvents: 'none',
                      userSelect: 'none',
                    },
                  })}
                >
                  {(() => {
                    if (!connected) {
                      return (
                        <button onClick={openConnectModal} className="btn-magical">
                          连接钱包
                        </button>
                      )
                    }

                    if (chain.unsupported) {
                      return (
                        <button onClick={openChainModal} className="btn-magical bg-red-500">
                          错误网络
                        </button>
                      )
                    }

                    return (
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={openChainModal}
                          className="glass px-3 py-2 rounded-lg flex items-center space-x-2"
                        >
                          {chain.hasIcon && (
                            <div className="w-5 h-5 rounded-full overflow-hidden">
                              {chain.iconUrl && (
                                <img
                                  alt={chain.name ?? 'Chain icon'}
                                  src={chain.iconUrl}
                                  className="w-5 h-5"
                                />
                              )}
                            </div>
                          )}
                          <span className="text-sm text-gray-300">{chain.name}</span>
                        </button>

                        <button
                          onClick={openAccountModal}
                          className="glass px-4 py-2 rounded-lg flex items-center space-x-2"
                        >
                          <span className="text-sm text-gray-300">
                            {account.displayName}
                          </span>
                          <span className="text-xs text-purple-400">
                            {account.displayBalance}
                          </span>
                        </button>
                      </div>
                    )
                  })()}
                </div>
              )
            }}
          </ConnectButton.Custom>
        </div>
      </div>

      {/* 移动端底部导航 */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 glass z-50">
        <div className="flex justify-around py-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center py-2 px-4 rounded-lg transition-all ${
                pathname === item.href
                  ? 'text-purple-400'
                  : 'text-gray-500'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="text-xs mt-1">{item.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </nav>
  )
}
