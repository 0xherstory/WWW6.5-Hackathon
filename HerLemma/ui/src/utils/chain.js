import { ethers } from 'ethers'

const FALLBACK_RPC = 'https://api.avax-test.network/ext/bc/C/rpc'
const FUJI_CHAIN_HEX = '0xa869'

const contractAddresses = {
  manager: import.meta.env.VITE_EXPLANATION_MANAGER_ADDRESS || '',
  prove: import.meta.env.VITE_PROVE_TOKEN_ADDRESS || '',
  index: import.meta.env.VITE_STEM_INDEX_ADDRESS || '',
  credential: import.meta.env.VITE_CREDENTIAL_ADDRESS || '',
}

const FUJI_PARAMS = {
  chainId: FUJI_CHAIN_HEX,
  chainName: 'Avalanche Fuji C-Chain',
  nativeCurrency: { name: 'Avalanche', symbol: 'AVAX', decimals: 18 },
  rpcUrls: [import.meta.env.VITE_AVALANCHE_FUJI_RPC || FALLBACK_RPC],
  blockExplorerUrls: ['https://testnet.snowtrace.io'],
}

const managerAbi = [
  'function createExplanation(bytes32 conceptKey, string style, string excerpt, string contentURI) returns (uint256 explanationId)',
  'function voteUnderstood(uint256 explanationId)',
  'function tipExplanation(uint256 explanationId) payable',
  'function createBounty(bytes32 conceptKey, string promptExcerpt, string promptURI, uint64 duration) payable returns (uint256 bountyId)',
  'function submitBountyResponse(uint256 bountyId, string style, string excerpt, string contentURI) returns (uint256 explanationId)',
  'function voteBountyResponse(uint256 bountyId, uint256 explanationId)',
  'function settleBounty(uint256 bountyId)',
  'function withdraw()',
  'function getExplanation(uint256 explanationId) view returns ((uint256 id, bytes32 conceptKey, address author, uint256 bountyId, string style, string excerpt, string contentURI, uint64 createdAt, uint32 understoodCount, uint128 totalTipsWei, bool hasFirstValidation))',
  'function getConceptExplanationIds(bytes32 conceptKey) view returns (uint256[])',
  'function getAuthorExplanationIds(address author) view returns (uint256[])',
  'function getBountyResponseIds(uint256 bountyId) view returns (uint256[])',
  'function pendingWithdrawals(address account) view returns (uint256)',
]

const proveAbi = [
  'function balanceOf(address account) view returns (uint256)',
]

const indexAbi = [
  'function globalStats() view returns ((uint256 totalParticipants, uint256 totalExplanations, uint256 totalUnderstoodVotes, uint256 totalTipsWei, uint256 totalBounties, uint256 totalBountyRewardsWei, uint256 totalPlatformFeesWei))',
  'function conceptStats(bytes32 conceptKey) view returns ((uint256 explanations, uint256 understoodVotes, uint256 tipsWei, uint256 bounties, uint256 bountyRewardsWei))',
  'function userStats(address account) view returns ((uint256 explanationsCreated, uint256 explanationsValidated, uint256 understoodVotesReceived, uint256 understoodVotesCast, uint256 avaxEarnedWei, uint256 proveEarned, uint256 bountyWins))',
]

const credentialAbi = [
  'function balanceOf(address owner) view returns (uint256)',
]

const avatarPool = ['🦊', '🐱', '🌸', '🌙', '🦋', '🐰', '🌺', '⭐', '🍀', '🎀', '🦄', '🌻', '💫', '🐚', '🌷', '🍓', '🦢', '🌈']
const namePool = ['小鹿', '小雨', '一一', '圆圆', '小花', '小夏', '思思', '悠悠', '小满', '知知', '阿月', '星星', '小梨', '朝朝', '晚晚', '糖糖']

export function isChainConfigured() {
  return Boolean(contractAddresses.manager && contractAddresses.prove && contractAddresses.index && contractAddresses.credential)
}

export function shortenAddress(address) {
  if (!address) return ''
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

export function formatAvax(weiLike, digits = 2) {
  const wei = BigInt(weiLike || 0)
  return Number(ethers.formatEther(wei)).toFixed(digits)
}

function addressFingerprint(address = '') {
  return [...address.toLowerCase()].reduce((acc, char) => acc + char.charCodeAt(0), 0)
}

function pseudoProfile(address) {
  const seed = addressFingerprint(address)
  return {
    avatar: avatarPool[seed % avatarPool.length],
    author: namePool[seed % namePool.length],
    address: shortenAddress(address),
  }
}

function safeDecodeConceptKey(rawKey) {
  try {
    return ethers.decodeBytes32String(rawKey)
  } catch {
    return rawKey
  }
}

function explanationToUi(explanation, userStats) {
  const profile = pseudoProfile(explanation.author)
  const proveEarned = Number(userStats?.proveEarned ?? 0) / 1e18
  const bountyWins = Number(userStats?.bountyWins ?? 0)
  const understoodCount = Number(explanation.understoodCount)
  const createdAt = Number(explanation.createdAt)

  return {
    id: Number(explanation.id),
    conceptId: safeDecodeConceptKey(explanation.conceptKey),
    author: profile.author,
    avatar: profile.avatar,
    address: profile.address,
    fullAddress: explanation.author,
    translation: explanation.excerpt,
    style: explanation.style,
    votes: understoodCount,
    prove: Math.round(proveEarned),
    earned: formatAvax(userStats?.avaxEarnedWei ?? explanation.totalTipsWei),
    isRoleModel: proveEarned >= 1000 || bountyWins >= 3,
    roleModelInfo: proveEarned >= 1000 || bountyWins >= 3
      ? {
          university: '链上榜样学姐',
          year: new Date(createdAt * 1000).getFullYear() || 2026,
          quote: '她的讲解正在帮助更多女生把数学讲清楚。',
          impact: `已有 ${understoodCount} 位学习者标记“我听懂了”。`,
        }
      : null,
  }
}

function makeMockTx() {
  return new Promise((resolve) => {
    setTimeout(() => {
      const txHash = `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`
      resolve({
        txHash,
        blockNumber: 28847000 + Math.floor(Math.random() * 1000),
        gasUsed: '0.00024',
        network: 'Avalanche Fuji',
        explorerUrl: `https://testnet.snowtrace.io/tx/${txHash}`,
      })
    }, 800 + Math.random() * 400)
  })
}

export const mockChainSubmit = makeMockTx

function getInjectedEthereum() {
  if (typeof window === 'undefined') return null
  return window.ethereum ?? null
}

async function ensureFujiChain() {
  const ethereum = getInjectedEthereum()
  if (!ethereum) throw new Error('请先安装 MetaMask')

  try {
    await ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: FUJI_CHAIN_HEX }],
    })
  } catch (error) {
    if (error?.code === 4902) {
      await ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [FUJI_PARAMS],
      })
      return
    }
    throw error
  }
}

async function getBrowserProvider({ requestAccounts = false } = {}) {
  const ethereum = getInjectedEthereum()
  if (!ethereum) throw new Error('请先安装 MetaMask')
  if (requestAccounts) {
    await ethereum.request({ method: 'eth_requestAccounts' })
  }
  await ensureFujiChain()
  return new ethers.BrowserProvider(ethereum)
}

async function getReadProvider() {
  const ethereum = getInjectedEthereum()
  if (ethereum) return new ethers.BrowserProvider(ethereum)
  return new ethers.JsonRpcProvider(import.meta.env.VITE_AVALANCHE_FUJI_RPC || FALLBACK_RPC)
}

function getContracts(providerOrSigner) {
  return {
    manager: new ethers.Contract(contractAddresses.manager, managerAbi, providerOrSigner),
    prove: new ethers.Contract(contractAddresses.prove, proveAbi, providerOrSigner),
    index: new ethers.Contract(contractAddresses.index, indexAbi, providerOrSigner),
    credential: new ethers.Contract(contractAddresses.credential, credentialAbi, providerOrSigner),
  }
}

async function getWriteContracts() {
  const provider = await getBrowserProvider({ requestAccounts: true })
  const signer = await provider.getSigner()
  return { signer, ...getContracts(signer) }
}

export async function getConnectedAccount() {
  const ethereum = getInjectedEthereum()
  if (!ethereum) return null
  const accounts = await ethereum.request({ method: 'eth_accounts' })
  return accounts?.[0] ?? null
}

export async function connectWallet() {
  const provider = await getBrowserProvider({ requestAccounts: true })
  const signer = await provider.getSigner()
  return signer.address
}

export function subscribeWallet(callback) {
  const ethereum = getInjectedEthereum()
  if (!ethereum?.on) return () => {}

  const handleAccounts = (accounts) => callback(accounts?.[0] ?? null)
  const handleChain = async () => callback(await getConnectedAccount())

  ethereum.on('accountsChanged', handleAccounts)
  ethereum.on('chainChanged', handleChain)

  return () => {
    ethereum.removeListener?.('accountsChanged', handleAccounts)
    ethereum.removeListener?.('chainChanged', handleChain)
  }
}

export function conceptIdToBytes32(conceptId) {
  return ethers.encodeBytes32String(conceptId)
}

function formatTxResult(txHash, receipt) {
  return {
    txHash,
    blockNumber: receipt?.blockNumber ?? null,
    gasUsed: receipt?.gasPrice ? ethers.formatEther(receipt.gasUsed * receipt.gasPrice) : null,
    network: 'Avalanche Fuji',
    explorerUrl: `https://testnet.snowtrace.io/tx/${txHash}`,
  }
}

export async function submitExplanation({ conceptId, style, excerpt, contentURI = '' }) {
  if (!isChainConfigured()) return makeMockTx()

  const { manager } = await getWriteContracts()
  const tx = await manager.createExplanation(
    conceptIdToBytes32(conceptId),
    style || '姐妹讲解',
    excerpt,
    contentURI
  )
  const receipt = await tx.wait()
  return formatTxResult(tx.hash, receipt)
}

export async function voteExplanation(explanationId) {
  if (!isChainConfigured()) return makeMockTx()

  const { manager } = await getWriteContracts()
  const tx = await manager.voteUnderstood(explanationId)
  const receipt = await tx.wait()
  return formatTxResult(tx.hash, receipt)
}

export async function tipExplanation(explanationId, amountAvax) {
  if (!isChainConfigured()) return makeMockTx()

  const { manager } = await getWriteContracts()
  const tx = await manager.tipExplanation(explanationId, {
    value: ethers.parseEther(String(amountAvax)),
  })
  const receipt = await tx.wait()
  return formatTxResult(tx.hash, receipt)
}

export async function withdrawPendingRewards() {
  if (!isChainConfigured()) return makeMockTx()

  const { manager } = await getWriteContracts()
  const tx = await manager.withdraw()
  const receipt = await tx.wait()
  return formatTxResult(tx.hash, receipt)
}

export async function readGlobalStats() {
  if (!isChainConfigured()) return null
  const provider = await getReadProvider()
  const { index } = getContracts(provider)
  const stats = await index.globalStats()
  return {
    totalParticipants: Number(stats.totalParticipants),
    totalExplanations: Number(stats.totalExplanations),
    totalUnderstoodVotes: Number(stats.totalUnderstoodVotes),
    totalTipsAvax: Number(ethers.formatEther(stats.totalTipsWei)),
    totalBounties: Number(stats.totalBounties),
    totalBountyRewardsAvax: Number(ethers.formatEther(stats.totalBountyRewardsWei)),
    totalPlatformFeesAvax: Number(ethers.formatEther(stats.totalPlatformFeesWei)),
  }
}

export async function readConceptExplanations(conceptId) {
  if (!isChainConfigured()) return []
  const provider = await getReadProvider()
  const { manager, index } = getContracts(provider)
  const ids = await manager.getConceptExplanationIds(conceptIdToBytes32(conceptId))
  if (!ids.length) return []

  const explanations = await Promise.all(ids.map((id) => manager.getExplanation(id)))
  const uniqueAuthors = [...new Set(explanations.map((item) => item.author.toLowerCase()))]
  const userStatsList = await Promise.all(uniqueAuthors.map(async (author) => [author, await index.userStats(author)]))
  const userStatsMap = Object.fromEntries(userStatsList)

  return explanations
    .map((item) => explanationToUi(item, userStatsMap[item.author.toLowerCase()]))
    .sort((a, b) => b.votes - a.votes)
}

export async function readExplanation(explanationId) {
  if (!isChainConfigured()) return null
  const provider = await getReadProvider()
  const { manager, index } = getContracts(provider)
  const explanation = await manager.getExplanation(explanationId)
  const userStats = await index.userStats(explanation.author)
  return explanationToUi(explanation, userStats)
}

export async function readProfileSummary(account) {
  if (!isChainConfigured() || !account) return null

  const provider = await getReadProvider()
  const { manager, prove, index, credential } = getContracts(provider)

  const [userStats, proveBalance, badgeCount, explanationIds, pendingWei] = await Promise.all([
    index.userStats(account),
    prove.balanceOf(account),
    credential.balanceOf(account),
    manager.getAuthorExplanationIds(account),
    manager.pendingWithdrawals(account),
  ])

  return {
    address: account,
    proveBalance: Math.round(Number(proveBalance) / 1e18),
    badges: Number(badgeCount),
    explanationsCreated: Number(userStats.explanationsCreated),
    explanationsValidated: Number(userStats.explanationsValidated),
    understoodVotesReceived: Number(userStats.understoodVotesReceived),
    understoodVotesCast: Number(userStats.understoodVotesCast),
    avaxEarned: formatAvax(userStats.avaxEarnedWei),
    pendingAvax: formatAvax(pendingWei),
    bountyWins: Number(userStats.bountyWins),
    explanationIds: explanationIds.map((id) => Number(id)),
  }
}
