'use client'

import { useEffect, useMemo, useState } from 'react'
import { useAccount, useConnect, useDisconnect } from 'wagmi'

function formatAddress(address?: string) {
  if (!address) return ''
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

export default function WalletConnectButton() {
  const [mounted, setMounted] = useState(false)

  const { address, isConnected } = useAccount()
  const { connect, connectors, isPending, error } = useConnect()
  const { disconnect } = useDisconnect()

  useEffect(() => {
    setMounted(true)
  }, [])

  const preferredConnector = useMemo(() => {
    return (
      connectors.find((connector) => connector.id === 'metaMask') ??
      connectors.find((connector) => connector.id === 'injected') ??
      connectors[0]
    )
  }, [connectors])

  if (!mounted) {
    return (
      <div className="h-[46px] w-[132px] rounded-full border border-white/40 bg-white/68 shadow-[0_10px_28px_rgba(118,130,112,0.10),inset_0_1px_0_rgba(255,255,255,0.55)] backdrop-blur-md" />
    )
  }

  if (isConnected) {
    return (
      <button
        onClick={() => disconnect()}
        className="rounded-full border border-white/40 bg-white/68 px-5 py-3 text-sm text-[#556157] shadow-[0_10px_28px_rgba(118,130,112,0.10),inset_0_1px_0_rgba(255,255,255,0.55)] backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#f3f6f0] active:scale-[0.985]"
        title="Click to disconnect"
      >
        {formatAddress(address)}
      </button>
    )
  }

  if (!preferredConnector) {
    return (
      <p className="text-center text-sm text-[#b26b6b]">
        No wallet connector found.
      </p>
    )
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        onClick={() => connect({ connector: preferredConnector })}
        className="rounded-full border border-white/40 bg-white/68 px-5 py-3 text-sm text-[#556157] shadow-[0_10px_28px_rgba(118,130,112,0.10),inset_0_1px_0_rgba(255,255,255,0.55)] backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#f3f6f0] active:scale-[0.985] disabled:cursor-not-allowed disabled:opacity-60"
        disabled={isPending}
      >
        {isPending ? 'Connecting...' : 'Connect Wallet'}
      </button>

      {error && (
        <p className="max-w-[260px] text-center text-xs text-[#b26b6b]">
          {error.message || 'Connection failed'}
        </p>
      )}
    </div>
  )
}