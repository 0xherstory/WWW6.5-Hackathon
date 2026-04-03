import { ethers } from "ethers";
import * as dotenv from "dotenv";
dotenv.config();

const DAO_ADDRESS = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";
const REVIEW_CONTRACT_ADDRESS = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";

const DAO_ABI = [
  "function createProposal(uint256 _reviewId, uint8 _action, uint256 _tokenId) external returns (uint32)",
  "function vote(uint32 proposalId, bool support, uint256 _tokenId) external",
  "function finalizeProposal(uint32 proposalId) external",
  "function executeProposal(uint32 proposalId) external",
  "function proposals(uint256 id) external view returns (address proposer, uint32 id, uint32 deadline, bool executed, uint32 votesFor, uint32 votesAgainst, uint32 executionTime, uint32 snapshotTotalSupply, uint256 targetReviewId, uint8 action)"
];

const REVIEW_ABI = [
  "function getReputationScore(bytes32 _targetId) external view returns (uint128)",
  "function reviews(uint256 reviewId) external view returns (uint256 reviewId, uint256 credentialId, bytes32 targetId, bytes32 cid, uint32 createdAt, uint8 status, uint8 overallScore, uint8 growthScore, uint8 clarityScore, uint8 communicationScore, uint8 workloadScore, uint8 respectScore)"
];

async function main() {
  const provider = new ethers.JsonRpcProvider(process.env.AVALANCHE_FUJI_RPC_URL);
  const wallet = new ethers.Wallet(process.env.AVALANCHE_PRIVATE_KEY!, provider);

  const dao = new ethers.Contract(DAO_ADDRESS, DAO_ABI, wallet);
  const review = new ethers.Contract(REVIEW_CONTRACT_ADDRESS, REVIEW_ABI, wallet);

  const targetId = ethers.keccak256(ethers.toUtf8Bytes("mentor:0x1234"));
  const reviewId = 1n;
  const tokenId = 1n;

  // 查看评价当前状态
  const scoreBefore = await review.getReputationScore(targetId);
  console.log("申诉前聚合评分:", scoreBefore.toString());

  // 1. 发起申诉提案（Action: 0=Restore, 1=Revoke）
  console.log("发起申诉提案...");
  const tx1 = await dao.createProposal(reviewId, 1, tokenId); // 1 = Revoke
  await tx1.wait();
  console.log("✅ 提案创建成功");

  // 获取提案 ID（从0开始）
  const proposalId = 0;

  // 2. 投票
  console.log("正在投票...");
  const tx2 = await dao.vote(proposalId, true, tokenId); // true = 支持
  await tx2.wait();
  console.log("✅ 投票成功");

  // 查看提案状态
  const proposal = await dao.proposals(proposalId);
  console.log("赞成票:", proposal.votesFor.toString());
  console.log("反对票:", proposal.votesAgainst.toString());
  console.log("截止时间:", new Date(Number(proposal.deadline) * 1000).toLocaleString());
  console.log("投票期还没结束，需要等待", Number(proposal.deadline) - Math.floor(Date.now()/1000), "秒后才能 finalize");
}

main().catch(console.error);