'use client'

import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'

// 合约地址 - 需要部署后更新
const ALCHEME_SBT_ADDRESS = (process.env.NEXT_PUBLIC_ALCHEME_SBT_ADDRESS || '0x0000000000000000000000000000000000000000') as `0x${string}`

const isValidAddress = (addr: string): addr is `0x${string}` => {
  return /^0x[a-fA-F0-9]{40}$/.test(addr) && addr !== '0x0000000000000000000000000000000000000000'
}

const CONTRACT_ADDRESS = isValidAddress(ALCHEME_SBT_ADDRESS) ? ALCHEME_SBT_ADDRESS : undefined

// AlchemeSBT ABI
const AlchemeSBTABI = [
  {
    "inputs": [
      { "name": "uri", "type": "string" },
      { "name": "title", "type": "string" },
      { "name": "description", "type": "string" }
    ],
    "name": "mint",
    "outputs": [{ "name": "tokenId", "type": "uint256" }],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "name": "tokenId", "type": "uint256" },
      { "name": "newUri", "type": "string" },
      { "name": "newTitle", "type": "string" },
      { "name": "newDescription", "type": "string" }
    ],
    "name": "evolve",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "name": "tokenId", "type": "uint256" }],
    "name": "tokenURI",
    "outputs": [{ "name": "", "type": "string" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "name": "tokenId", "type": "uint256" }],
    "name": "getMedalData",
    "outputs": [
      {
        "components": [
          { "name": "title", "type": "string" },
          { "name": "description", "type": "string" },
          { "name": "createdAt", "type": "uint256" },
          { "name": "creator", "type": "address" }
        ],
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "name": "owner_", "type": "address" }],
    "name": "getTokensByOwner",
    "outputs": [{ "name": "", "type": "uint256[]" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "name": "owner_", "type": "address" }],
    "name": "balanceOf",
    "outputs": [{ "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  }
] as const

// 读取用户勋章
export function useUserMedals(address: `0x${string}` | undefined) {
  return useReadContract({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: AlchemeSBTABI,
    functionName: 'getTokensByOwner',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && !!CONTRACT_ADDRESS,
    },
  })
}

// 读取勋章详情
export function useMedalData(tokenId: bigint | undefined) {
  return useReadContract({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: AlchemeSBTABI,
    functionName: 'getMedalData',
    args: tokenId !== undefined ? [tokenId] : undefined,
    query: {
      enabled: tokenId !== undefined && !!CONTRACT_ADDRESS,
    },
  })
}

// 读取tokenURI
export function useTokenURI(tokenId: bigint | undefined) {
  return useReadContract({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: AlchemeSBTABI,
    functionName: 'tokenURI',
    args: tokenId !== undefined ? [tokenId] : undefined,
    query: {
      enabled: tokenId !== undefined && !!CONTRACT_ADDRESS,
    },
  })
}

// 铸造勋章 - 用户为自己铸造
export function useMintMedal() {
  const { writeContract, isPending, error, data: hash } = useWriteContract()
  
  const { data: receipt, isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  })

  const mintMedal = (uri: string, title: string, description: string) => {
    if (!CONTRACT_ADDRESS) throw new Error('Contract address not configured')
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: AlchemeSBTABI,
      functionName: 'mint',
      args: [uri, title, description],
    })
  }

  return { 
    mintMedal, 
    isPending, 
    isConfirming, 
    isConfirmed, 
    error, 
    hash,
    receipt,
  }
}

// 进化勋章
export function useEvolveMedal() {
  const { writeContract, isPending, error, data: hash } = useWriteContract()
  
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  })

  const evolveMedal = (tokenId: bigint, newUri: string, newTitle: string, newDescription: string) => {
    if (!CONTRACT_ADDRESS) throw new Error('Contract address not configured')
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: AlchemeSBTABI,
      functionName: 'evolve',
      args: [tokenId, newUri, newTitle, newDescription],
    })
  }

  return { 
    evolveMedal, 
    isPending, 
    isConfirming, 
    isConfirmed, 
    error, 
    hash 
  }
}

// 读取用户余额
export function useMedalBalance(address: `0x${string}` | undefined) {
  return useReadContract({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: AlchemeSBTABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && !!CONTRACT_ADDRESS,
    },
  })
}
