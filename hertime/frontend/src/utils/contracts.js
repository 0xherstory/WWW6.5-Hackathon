import { ethers } from 'ethers'
import deployedLocalhost from './deployed.localhost.json'
import deployedFuji from './deployed.fuji.json'

// 按 chainId 选择部署地址
const DEPLOYED_BY_CHAIN = {
  31337: deployedLocalhost, // Hardhat 本地节点
  43113: deployedFuji,      // Avalanche Fuji 测试网
}

// ABIs - 只包含前端需要的函数
const TOKEN_ABI = [
  "function balanceOf(address) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function registered(address) view returns (bool)",
  "event WelcomeMint(address indexed member, uint256 amount)",
  "event ServiceMint(address indexed provider, uint256 amount, bytes32 indexed serviceId)",
  "event ServiceBurn(address indexed requester, uint256 amount, bytes32 indexed serviceId)",
]

const SERVICE_ABI = [
  "function register() external",
  "function invite(address member) external",
  "function inviteBatch(address[] calldata members) external",
  "function isInvited(address) view returns (bool)",
  "function postService(uint8 tag, uint256 numHours, bool isAnonymous) external returns (bytes32)",
  "function acceptService(bytes32 id) external",
  "function adjustHours(bytes32 id, uint256 newHours) external",
  "function confirmCompletion(bytes32 id) external",
  "function cancelService(bytes32 id) external",
  "function cancelMatched(bytes32 id) external",
  "function getAllServiceIds() view returns (bytes32[])",
  "function getOpenServices() view returns (bytes32[])",
  "function services(bytes32) view returns (bytes32 id, address requester, address actualRequester, address provider, uint8 tag, uint256 numHours, uint8 status, bool requesterConfirmed, bool providerConfirmed, uint256 createdAt)",
  "event ServicePosted(bytes32 indexed id, uint8 tag, uint256 numHours, bool isAnonymous)",
  "event ServiceCompleted(bytes32 indexed id)",
  "event ServiceMatched(bytes32 indexed id, address indexed provider)",
]

const REPUTATION_ABI = [
  "function getAvgScore(address) view returns (uint256)",
  "function getServiceCount(address, uint8) view returns (uint256)",
  "function getTotalServiceCount(address) view returns (uint256)",
  "function hasSubmitted(bytes32, address) view returns (bool)",
  "function bothSubmitted(bytes32) view returns (bool)",
  "function getMyScore(bytes32) view returns (uint8)",
  "function submitRating(bytes32 serviceId, uint8 score, bytes32 commentHash) external",
  "event RatingSubmitted(bytes32 indexed serviceId, address indexed rater)",
  "event RatingRevealed(bytes32 indexed serviceId, uint8 score0, uint8 score1)",
]

const SKILL_NFT_ABI = [
  "function getSkills(address) view returns (bool[6])",
  "function hasSkill(address, uint8) view returns (bool)",
  "function tokenIdOf(address, uint8) view returns (uint256)",
  "function balanceOf(address) view returns (uint256)",
  "event SkillMinted(address indexed member, uint8 indexed skill, uint256 tokenId)",
]

/**
 * 根据 signer 所在网络自动选择合约地址
 * @returns { token, service, reputation, skillNFT, deployed, networkName }
 */
export async function getContracts(signer) {
  const network = await signer.provider.getNetwork()
  const chainId = Number(network.chainId)

  const deployed = DEPLOYED_BY_CHAIN[chainId]
  if (!deployed) {
    throw new Error(
      `不支持的网络 chainId=${chainId}。请切换到 Hardhat 本地节点 (31337) 或 Fuji 测试网 (43113)`
    )
  }

  const { HerTimeToken, HerTimeService, HerTimeReputation, HerTimeSkillNFT } = deployed.contracts
  return {
    token:      new ethers.Contract(HerTimeToken,      TOKEN_ABI,      signer),
    service:    new ethers.Contract(HerTimeService,    SERVICE_ABI,    signer),
    reputation: new ethers.Contract(HerTimeReputation, REPUTATION_ABI, signer),
    skillNFT:   new ethers.Contract(HerTimeSkillNFT,   SKILL_NFT_ABI,  signer),
    deployed,
    networkName: deployed.network,
    chainId,
  }
}
