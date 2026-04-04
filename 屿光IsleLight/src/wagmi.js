// src/wagmi.js
import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import { avalancheFuji } from 'wagmi/chains'

export const config = getDefaultConfig({
  appName: 'Isleland',
  projectId: '21fef4886a0f62625843647d5f98e74b', // WalletConnect Project ID
  chains: [avalancheFuji], // Avalanche Fuji Testnet
  ssr: true,
})