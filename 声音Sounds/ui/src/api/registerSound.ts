import { BrowserProvider, Contract } from 'ethers'
import { soundRegistryAbi } from '../abi/soundRegistry'

export type RegisterResult = {
  txHash: string
  soundId: string
  contentUri: string
}

type EthereumProvider = {
  request: (args: { method: string }) => Promise<string[]>
}

declare global {
  interface Window {
    ethereum?: EthereumProvider
  }

  interface ImportMetaEnv {
    readonly VITE_SOUND_REGISTRY_ADDRESS?: string
  }

  interface ImportMeta {
    readonly env: ImportMetaEnv
  }
}

export async function registerSound(contentUri: string): Promise<RegisterResult> {
  if (!window.ethereum) {
    throw new Error('请安装 MetaMask')
  }

  const contractAddress = import.meta.env.VITE_SOUND_REGISTRY_ADDRESS

  if (!contractAddress) {
    throw new Error('缺少合约地址')
  }

  const provider = new BrowserProvider(window.ethereum)
  const signer = await provider.getSigner()
  const contract = new Contract(contractAddress, soundRegistryAbi, signer)
  const tx = await contract.createSound(contentUri)
  await tx.wait()
  const nextId = await contract.nextId()

  return {
    txHash: tx.hash as string,
    soundId: (nextId - 1n).toString(),
    contentUri,
  }
}
