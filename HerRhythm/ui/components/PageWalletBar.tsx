'use client'

import WalletConnectButton from '@/components/WalletConnectButton'

export default function PageWalletBar() {
  return (
    <div className="pointer-events-none absolute right-6 top-6 z-30 md:right-10 md:top-8">
      <div className="pointer-events-auto">
        <WalletConnectButton />
      </div>
    </div>
  )
}