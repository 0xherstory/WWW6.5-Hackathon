import { ethers } from "ethers";

// ─── 配置 ────────────────────────────────────────────────────
const CONTRACT_ADDRESS = "0x你部署后的合约地址";
const ABI = [
  "function createCase(bytes32 caseId, bytes32 metaHash) external",
  "function addEvidence(bytes32 caseId, bytes32 evidenceHash, string evidenceType) external",
  "function confirmService(bytes32 caseId, string serviceType, bytes32 receiptHash) external",
  "function transferCase(bytes32 caseId, address newOwner) external",
  "function redeemPoints(bytes32 redeemHash) external",
];

// ─── 工具函数 ─────────────────────────────────────────────────
export function hashData(data: object): string {
  return ethers.keccak256(ethers.toUtf8Bytes(JSON.stringify(data)));
}

export function hashString(str: string): string {
  return ethers.keccak256(ethers.toUtf8Bytes(str));
}

async function getContract() {
  if (!window.ethereum) throw new Error("请先安装 MetaMask");
  const provider = new ethers.BrowserProvider(window.ethereum);
  await provider.send("eth_requestAccounts", []);
  const signer = await provider.getSigner();
  return new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
}

// ─── 核心方法 ─────────────────────────────────────────────────

/** 1. 发起 Case 时调用 */
export async function onCreateCase(caseDbId: string, meta: {
  title: string;
  city: string;
  animalType: string;
}) {
  const contract = await getContract();
  const caseId  = hashString(caseDbId);            // DB 里的 Case ID → bytes32
  const metaHash = hashData({ ...meta, caseDbId }); // 摘要哈希

  const tx = await contract.createCase(caseId, metaHash);
  const receipt = await tx.wait();
  return receipt.hash; // 存回你的数据库
}

/** 2. 上传凭证时调用 */
export async function onAddEvidence(caseDbId: string, evidence: {
  description: string;
  imageUrl?: string;
  type: "medical" | "progress" | "receipt";
}) {
  const contract = await getContract();
  const caseId      = hashString(caseDbId);
  const evidenceHash = hashData(evidence);

  const tx = await contract.addEvidence(caseId, evidenceHash, evidence.type);
  const receipt = await tx.wait();
  return receipt.hash;
}

/** 3. 服务完成签收时调用 */
export async function onConfirmService(caseDbId: string, service: {
  type: "medical" | "transport" | "foster" | "neuter";
  provider: string;
  completedAt: number;
}) {
  const contract = await getContract();
  const caseId      = hashString(caseDbId);
  const receiptHash  = hashData(service);

  const tx = await contract.confirmService(caseId, service.type, receiptHash);
  const receipt = await tx.wait();
  return receipt.hash;
}

/** 4. 接管 Case 时调用 */
export async function onTransferCase(caseDbId: string, newOwnerAddress: string) {
  const contract = await getContract();
  const caseId = hashString(caseDbId);

  const tx = await contract.transferCase(caseId, newOwnerAddress);
  const receipt = await tx.wait();
  return receipt.hash;
}

/** 5. 积分核销时调用 */
export async function onRedeemPoints(userId: string, amount: number, item: string) {
  const contract = await getContract();
  const redeemHash = hashData({ userId, amount, item, time: Date.now() });

  const tx = await contract.redeemPoints(redeemHash);
  const receipt = await tx.wait();
  return receipt.hash;
}

/** 生成 Sepolia Etherscan 链接（放在 Case 页展示） */
export function etherscanUrl(txHash: string) {
  return `https://sepolia.etherscan.io/tx/${txHash}`;
}
