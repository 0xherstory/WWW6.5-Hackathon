// src/wagmi.js
import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import { avalancheFuji } from 'wagmi/chains'

// WalletConnect Project ID
// 这是项目级别的 ID，所有用户共用同一个
// 获取方式：https://cloud.walletconnect.com/ → Create Project
const projectId = import.meta.env.VITE_WALLET_CONNECT_PROJECT_ID || '21fef4886a0f62625843647d5f98e74b'

export const config = getDefaultConfig({
  appName: 'IsleLight',
  projectId: projectId,
  chains: [avalancheFuji], // Avalanche Fuji Testnet
  ssr: true,
})