import { ethers } from "ethers";
import deployedLocalhost from "./deployed.localhost.json";
import deployedFuji from "./deployed.fuji.json";

const RPC_URL = import.meta.env.VITE_RPC_URL || "http://127.0.0.1:8545";
const isFuji = RPC_URL.includes("avax-test") || RPC_URL.includes("avax.network");
const deployed = isFuji ? deployedFuji : deployedLocalhost;

export const REGISTRY_ADDRESS = deployed.registryAddress;

export const REGISTRY_ABI = [
  "function createProject(string,string,address,address[],uint256,uint256,uint256) returns (address)",
  "function getProjects() view returns (address[])",
  "function getProjectCount() view returns (uint256)",
  "function getSbtAddress() view returns (address)",
];

export const SBT_ABI = [
  "function getDonorTokens(address) view returns (uint256[])",
  "function records(uint256) view returns (address donor, address project, string projectName, uint256 amount, uint8 tag, uint256 donatedAt)",
  "function totalSupply() view returns (uint256)",
  "event Minted(address indexed donor, uint256 indexed tokenId, address indexed project, uint256 amount)",
];

export const PROJECT_ABI = [
  "function name() view returns (string)",
  "function description() view returns (string)",
  "function beneficiary() view returns (address)",
  "function projectOwner() view returns (address)",
  "function totalDonated() view returns (uint256)",
  "function totalReleased() view returns (uint256)",
  "function getBalance() view returns (uint256)",
  "function targetAmount() view returns (uint256)",
  "function isFundingComplete() view returns (bool)",
  "function getMilestoneCount() view returns (uint256)",
  "function getMilestoneInfo(uint256) view returns (string desc, uint256 releasePercent, uint8 status, uint256 proofCount)",
  "function getTagBalance(uint8) view returns (uint256)",
  "function donate(uint8) payable",
  "function addMilestone(string,uint256)",
  "function submitProof(uint256,bytes32,string)",
  "function submitAggregatedProof(uint256,bytes32,string,bytes[])",
  "function DOMAIN_SEPARATOR() view returns (bytes32)",
  // 验证人质押
  "function validatorStakeRequired() view returns (uint256)",
  "function validatorStake(address) view returns (uint256)",
  "function validatorStaked(address) view returns (bool)",
  "function stakePool() view returns (uint256)",
  "function stakeAsValidator() payable",
  "function withdrawStake()",
  "function isProjectClosed() view returns (bool)",
  // 里程碑挑战
  "function CHALLENGE_BOND() view returns (uint256)",
  "function VOTE_WINDOW() view returns (uint256)",
  "function CHALLENGE_WINDOW() view returns (uint256)",
  "function milestoneVerifiedAt(uint256) view returns (uint256)",
  "function releaseMilestone(uint256)",
  "function challengeMilestone(uint256,string) payable",
  "function voteOnChallenge(uint256,bool)",
  "function resolveChallenge(uint256)",
  "function getChallengeInfo(uint256) view returns (address challenger, string evidenceCID, uint256 challengedAt, uint256 forVotes, uint256 againstVotes, bool resolved, bool upheld, bool inWindow)",
  "function hasVotedOnChallenge(uint256,address) view returns (bool)",
  // 事件
  "event ValidatorStaked(address indexed validator, uint256 amount)",
  "event ValidatorSlashed(address indexed validator, uint256 slashAmount)",
  "event MilestoneChallenged(uint256 indexed milestoneId, address indexed challenger, string evidenceCID)",
  "event ChallengeVoted(uint256 indexed milestoneId, address indexed voter, bool support, uint256 weight)",
  "event ChallengeResolved(uint256 indexed milestoneId, bool upheld, uint256 totalSlashed)",
  "function getMilestoneProofs(uint256) view returns (tuple(address validator, string metadataUri, uint256 submittedAt)[])",
  "function requiredSignatures() view returns (uint256)",
  "function isValidator(address) view returns (bool)",
  "function hasSubmittedProof(uint256,address) view returns (bool)",
  "function donorBalance(address) view returns (uint256)",
  "function hasVotedEmergency(address) view returns (bool)",
  "function emergencyApproved() view returns (bool)",
  "function autoRefunded() view returns (bool)",
  "function lastActivityAt() view returns (uint256)",
  "function voteEmergencyRefund()",
  "function claimEmergencyRefund()",
  "function getEmergencyStatus() view returns (bool canVote, uint256 daysRemaining, uint256 votePercent, bool approved, uint256 myDonation)",
  "function demoSkipChallengeWindow(uint256)",
  "function demoSkipVoteWindow(uint256)",
  "function demoSkipEmergencyWindow()",
  "event Donated(address indexed donor, uint256 amount, uint8 tag)",
  "event MilestoneVerified(uint256 indexed milestoneId)",
  "event EmergencyVoted(address indexed donor, uint256 amount, uint256 totalVotes)",
  "event EmergencyRefundApproved()",
  "event FundsReleased(uint256 indexed milestoneId, address beneficiary, uint256 amount)",
  "event ProofSubmitted(uint256 indexed milestoneId, address indexed validator, bytes32 proofHash, string proofUri)",
];

export const TAGS = ["教育", "餐食", "医疗", "物资", "交通"];

export const TAG_DETAILS = [
  { icon: "📚", name: "教育", desc: "教材、文具、学费补贴" },
  { icon: "🍱", name: "餐食", desc: "每日营养餐、课间加餐" },
  { icon: "🏥", name: "医疗", desc: "基础医疗、卫生用品" },
  { icon: "📦", name: "物资", desc: "校服、书包、生活用品" },
  { icon: "🚌", name: "交通", desc: "上学交通补贴" },
];

export const MILESTONE_STATUS = ["等待验证", "已验证", "已释放"];

export async function getProvider() {
  // 优先使用 Core Wallet（Avalanche 原生钱包），其次 MetaMask
  const provider = window.avalanche || window.ethereum;
  if (!provider) throw new Error("请先安装 MetaMask 或 Core Wallet");
  await provider.request({ method: "eth_requestAccounts" });
  return new ethers.BrowserProvider(provider);
}

export function detectWalletName() {
  if (window.avalanche) return "Core Wallet";
  if (window.ethereum?.isMetaMask) return "MetaMask";
  return "钱包";
}
