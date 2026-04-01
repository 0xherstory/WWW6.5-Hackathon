import { ethers } from "ethers";
import * as dotenv from "dotenv";
dotenv.config();

// Fuji deployed address (see contracts/ignition/deployments/chain-43113/deployed_addresses.json)
const REVIEW_CONTRACT_ADDRESS =
  process.env.REVIEW_CONTRACT_ADDRESS ??
  "0x3845300491F10FC8C87694C5c8D7D62bFc12e1DC";

const REVIEW_ABI = [
  "function submitReview(uint256 _credentialId, bytes32 _targetId, string calldata _targetType, uint8 _overallScore, uint8[5] calldata _dimScores, bytes32 _cid) external",
  "function getReputationScore(bytes32 _targetId) external view returns (uint128)"
];

async function main() {
  const provider = new ethers.JsonRpcProvider(process.env.AVALANCHE_FUJI_RPC_URL);
  const wallet = new ethers.Wallet(process.env.AVALANCHE_PRIVATE_KEY!, provider);

  const review = new ethers.Contract(REVIEW_CONTRACT_ADDRESS, REVIEW_ABI, wallet);

  const tokenId = BigInt(process.env.SBT_TOKEN_ID ?? "1");
  console.log("使用 tokenId:", tokenId.toString());

  const targetId = ethers.keccak256(ethers.toUtf8Bytes("mentor:0x1234"));
  const cid = ethers.keccak256(ethers.toUtf8Bytes("ipfs://QmTest123"));
  const dimScores: [number, number, number, number, number] = [4, 3, 5, 4, 4];

  console.log("正在提交评价...");
  const tx = await review.submitReview(
    tokenId,
    targetId,
    "mentor",
    4,
    dimScores,
    cid
  );
  console.log("交易已发送:", tx.hash);
  await tx.wait();
  console.log("✅ 评价提交成功！");

  const score = await review.getReputationScore(targetId);
  console.log("当前聚合评分:", score.toString());
}

main().catch(console.error);