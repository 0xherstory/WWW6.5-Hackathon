import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { BrowserProvider, Contract, formatEther, parseEther } from 'ethers'

const Web3Context = createContext(null)

// Contract ABIs - aligned with actual smart contracts

const PLANT_NFT_ABI = [
  "function mintPlant(tuple(address to, string species, uint8 rarity, uint8 effortLevel, string tokenURI) params) external returns (uint256)",
  "function getPlantAttributes(uint256 tokenId) external view returns (tuple(string species, uint8 rarity, uint8 effortLevel, uint256 effortWeight, uint256 growthLevel, uint256 maxGrowth, uint256 health, uint256 water, uint256 sunlight, uint256 soil, uint256 lastCareTime, uint256 careStreak))",
  "function ownerOf(uint256 tokenId) external view returns (address)",
  "function balanceOf(address owner) external view returns (uint256)",
  "function totalSupply() external view returns (uint256)",
  "function tokenURI(uint256 tokenId) external view returns (string memory)",
  "function growPlant(uint256 tokenId) external",
  "function updatePlantStats(uint256 tokenId, uint256 health, uint256 water, uint256 sunlight, uint256 soil) external",
  "function incrementCareStreak(uint256 tokenId) external",
  "function getEffortWeight(uint256 tokenId) external view returns (uint256)",
  "function getTotalPlants() external view returns (uint256)",
  "function transferFrom(address from, address to, uint256 tokenId) external",
  "function approve(address to, uint256 tokenId) external",
  "function transferOwnership(address newOwner) external",
]

const SEED_TOKEN_ABI = [
  "function balanceOf(address account) external view returns (uint256)",
  "function totalEarned(address user) external view returns (uint256)",
  "function dailyEarned(address user) external view returns (uint256)",
  "function getDailyRemaining(address user) external view returns (uint256)",
  "function convertToPleaf(uint256 amount) external",
  "function earnReward(address user, uint256 amount, string memory action) external",
  "function WATER_REWARD() external view returns (uint256)",
  "function FERTILIZE_REWARD() external view returns (uint256)",
  "function REPOT_REWARD() external view returns (uint256)",
  "function PHOTO_REWARD() external view returns (uint256)",
  "function MEDICINE_REWARD() external view returns (uint256)",
  "function CONVERSION_RATE() external view returns (uint256)",
  "function dailyRewardCap() external view returns (uint256)",
  "function ecologyMultiplier() external view returns (uint256)",
  "function setEcologyMultiplier(uint256 multiplier) external",
  "function setDailyRewardCap(uint256 cap) external",
  "function setPleafToken(address _pleafToken) external",
  "function transferOwnership(address newOwner) external",
]

const PLEAF_TOKEN_ABI = [
  "function balanceOf(address account) external view returns (uint256)",
  "function mintGovernanceReward(address to, uint256 amount) external",
  "function getVotingPower(address account) external view returns (uint256)",
  "function setSeedToken(address seedToken) external",
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function transferFrom(address from, address to, uint256 amount) external returns (bool)",
  "function transferOwnership(address newOwner) external",
]

const PLANT_CARE_ABI = [
  "function water(uint256 plantId, uint256 quality) external",
  "function fertilize(uint256 plantId, uint256 quality) external",
  "function repot(uint256 plantId, uint256 quality) external",
  "function takePhoto(uint256 plantId, uint256 quality) external",
  "function applyMedicine(uint256 plantId, uint256 quality) external",
  "function mintPlantForUser(string species, uint8 rarity, uint8 effortLevel, string tokenURI) external returns (uint256)",
  "function canPerformCare(uint256 plantId, uint8 action) external view returns (bool)",
  "function userTotalCares(address user) external view returns (uint256)",
  "function userStreak(address user) external view returns (uint256)",
  "function CARE_COOLDOWN() external view returns (uint256)",
  "function getCareHistoryLength() external view returns (uint256)",
  "function getCareRecord(uint256 index) external view returns (tuple(address caregiver, uint256 plantId, uint8 action, uint256 timestamp, uint256 reward, uint256 quality))",
]

const SEASON_MANAGER_ABI = [
  "function currentSeason() external view returns (uint8)",
  "function getSeasonEffects() external view returns (tuple(uint256 growthMultiplier, uint256 waterConsumption, uint256 breedBonus, uint256 diseaseRisk, uint256 seedRewardMultiplier))",
  "function getActiveDiseases() external view returns (uint256[] memory)",
  "function getDisease(uint256 id) external view returns (tuple(string name, uint8 peakSeason, uint256 triggerThreshold, uint256 healthImpact, uint256 spreadFactor, bool isActive))",
  "function getDiseaseCount() external view returns (uint256)",
]

const GLOBAL_ECOLOGY_ABI = [
  "function ecologyIndex() external view returns (uint256)",
  "function getEcologyState() external view returns (uint8)",
  "function getCurrentMultiplier() external view returns (uint256)",
  "function getEcologyStats() external view returns (uint256 index, uint8 state, uint256 plants, uint256 healthy, uint256 dead, uint256 cares, uint256 breeds, uint256 diseased)",
  "function recalculateIndex() external",
]

const GARDEN_ENV_ABI = [
  "function getGardenInfo(address user) external view returns (uint256 plantCount, uint256 avgHealth, uint256 consecutiveDays, uint256 bonusPercentage, uint8 state)",
  "function getGardenBonus(address user) external view returns (uint256)",
  "function getGardenState(address user) external view returns (uint8)",
]

const PLANT_DAO_ABI = [
  "function createProposal(string memory title, string memory description, uint8 category) external returns (uint256)",
  "function vote(uint256 proposalId, bool support) external",
  "function finalizeProposal(uint256 proposalId) external",
  "function getProposalInfo(uint256 proposalId) external view returns (string title, string description, address proposer, uint8 category, uint256 createdTime, uint256 votingDeadline, uint256 votesFor, uint256 votesAgainst, uint8 state)",
  "function proposalCount() external view returns (uint256)",
  "function hasVoted(uint256 proposalId, address voter) external view returns (bool)",
  "function getVotingPower(address account) external view returns (uint256)",
  "function setContracts(address _seed, address _season, address _ecology, address _garden, address _care) external",
]

const MARKETPLACE_ABI = [
  "function listPlant(uint256 plantId, uint256 price) external",
  "function buyPlant(uint256 listingIndex) external",
  "function cancelListing(uint256 listingIndex) external",
  "function getActiveListings() external view returns (tuple(uint256 plantId, address seller, uint256 price, bool active, uint256 listedTime)[] memory)",
  "function getListingCount() external view returns (uint256)",
  "function listings(uint256 index) external view returns (uint256 plantId, address seller, uint256 price, bool active, uint256 listedTime)",
]

const PLANT_OFFSPRING_ABI = [
  "function mintOffspring(tuple(address to, uint256 parentTokenId, uint256 parentOffspringId, uint8 method, uint256 parentCareScore, uint256 generation, string species, string tokenURI) params) external returns (uint256)",
  "function getOffspringAttributes(uint256 tokenId) external view returns (tuple(uint256 parentTokenId, uint256 parentOffspringId, uint8 method, uint256 generation, uint256 careScore, uint256 inheritedScore, string species, uint8 rarity, uint256 health, uint256 water, uint256 sunlight, uint256 soil, uint256 growthLevel, uint256 birthTime, uint256 lastCareTime, bool isActive))",
  "function getOffspringOf(uint256 parentId) external view returns (uint256[] memory)",
  "function canBreed(uint256 parentTokenId) external view returns (bool)",
  "function getTotalOffspring() external view returns (uint256)",
  "function ownerOf(uint256 tokenId) external view returns (address)",
  "function updateOffspringStats(uint256 offspringId, uint256 health, uint256 water, uint256 sunlight, uint256 soil) external",
  "function updateCareScore(uint256 offspringId, uint256 newScore) external",
  "function growOffspring(uint256 offspringId) external",
  "function recordBreedTime(uint256 parentTokenId) external",
  "function transferOwnership(address newOwner) external",
]

// Default contract addresses (localhost hardhat)
const DEFAULT_ADDRESSES = {
  PleafToken: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
  SeedToken: "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",
  PlantNFT: "0x9fE46736679d2D9a65F0992F2272De9f3c7fa6e0",
  PlantCare: "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9",
  PlantMarketplace: "0xDc64a140Aa8E642b7e2B71E6B593a81e5a7D20e4",
  PlantDAO: "0x5FC8d32690cc91D4c39d9d3abcBD16989F875707",
  SeasonManager: "0x0165878A594ca255338adfa4d48449f69242Eb8F",
  GlobalEcology: "0xa513E6E4b8f2a923D98304ec87F64353C4D5C853",
  GardenEnvironment: "0x2279B7A0a67DB372996a5FaB50D91eAA73d2eBe6",
  PlantOffspring: "0x8A791620dd6260079BF849Dc5567aDC3F2FdC318",
}

export function Web3Provider({ children }) {
  const [account, setAccount] = useState(null)
  const [provider, setProvider] = useState(null)
  const [signer, setSigner] = useState(null)
  const [contracts, setContracts] = useState({})
  const [chainId, setChainId] = useState(null)
  const [connecting, setConnecting] = useState(false)
  const [addresses, setAddresses] = useState(DEFAULT_ADDRESSES)

  // Try to load addresses from deployment.json on mount
  useEffect(() => {
    fetch('/deployment.json')
      .then(r => r.json())
      .then(data => {
        if (data?.contracts) {
          setAddresses(prev => ({ ...prev, ...data.contracts }))
        }
      })
      .catch(() => {
        // Use default addresses
      })
  }, [])

  const connectWallet = useCallback(async () => {
    if (!window.ethereum) {
      alert('请安装 MetaMask 钱包！')
      return false
    }
    try {
      setConnecting(true)
      const browserProvider = new BrowserProvider(window.ethereum)
      const accounts = await browserProvider.send('eth_requestAccounts', [])
      const sign = await browserProvider.getSigner()
      const network = await browserProvider.getNetwork()

      setProvider(browserProvider)
      setSigner(sign)
      setAccount(accounts[0])
      setChainId(Number(network.chainId))

      // Init contracts with signer
      const contractInstances = {
        plantNFT: new Contract(addresses.PlantNFT, PLANT_NFT_ABI, sign),
        seedToken: new Contract(addresses.SeedToken, SEED_TOKEN_ABI, sign),
        pleafToken: new Contract(addresses.PleafToken, PLEAF_TOKEN_ABI, sign),
        plantCare: new Contract(addresses.PlantCare, PLANT_CARE_ABI, sign),
        plantDAO: new Contract(addresses.PlantDAO, PLANT_DAO_ABI, sign),
        seasonManager: new Contract(addresses.SeasonManager, SEASON_MANAGER_ABI, sign),
        globalEcology: new Contract(addresses.GlobalEcology, GLOBAL_ECOLOGY_ABI, sign),
        gardenEnv: new Contract(addresses.GardenEnvironment, GARDEN_ENV_ABI, sign),
        marketplace: new Contract(addresses.PlantMarketplace, MARKETPLACE_ABI, sign),
        plantOffspring: new Contract(addresses.PlantOffspring, PLANT_OFFSPRING_ABI, sign),
      }
      setContracts(contractInstances)
      return true
    } catch (err) {
      console.error('连接钱包失败:', err)
      return false
    } finally {
      setConnecting(false)
    }
  }, [addresses])

  const disconnectWallet = useCallback(() => {
    setAccount(null)
    setProvider(null)
    setSigner(null)
    setContracts({})
  }, [])

  // Listen for account/chain changes
  useEffect(() => {
    if (!window.ethereum) return
    const handleAccountsChanged = (accounts) => {
      if (accounts.length === 0) disconnectWallet()
      else setAccount(accounts[0])
    }
    const handleChainChanged = () => window.location.reload()

    window.ethereum.on('accountsChanged', handleAccountsChanged)
    window.ethereum.on('chainChanged', handleChainChanged)
    return () => {
      window.ethereum.removeListener('accountsChanged', handleAccountsChanged)
      window.ethereum.removeListener('chainChanged', handleChainChanged)
    }
  }, [disconnectWallet])

  // Auto-connect
  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.request({ method: 'eth_accounts' }).then(accounts => {
        if (accounts.length > 0) connectWallet()
      })
    }
  }, [connectWallet])

  const value = {
    account, provider, signer, contracts, chainId, connecting, addresses,
    connectWallet, disconnectWallet, setAddresses,
    formatEther, parseEther,
  }

  return <Web3Context.Provider value={value}>{children}</Web3Context.Provider>
}

export function useWeb3() {
  const ctx = useContext(Web3Context)
  if (!ctx) throw new Error('useWeb3 must be used within Web3Provider')
  return ctx
}

export function useReadContract(contractName, methodName, args = []) {
  const { contracts } = useWeb3()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const refresh = useCallback(async () => {
    if (!contracts[contractName]) { setLoading(false); return }
    try {
      setLoading(true)
      setError(null)
      const result = await contracts[contractName][methodName](...args)
      setData(result)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [contracts, contractName, methodName, JSON.stringify(args)])

  useEffect(() => { refresh() }, [refresh])
  return { data, loading, error, refresh }
}