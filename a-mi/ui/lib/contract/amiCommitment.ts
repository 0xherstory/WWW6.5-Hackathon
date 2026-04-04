import { BrowserProvider, Contract, getAddress } from "ethers";
import amiCommitmentAbi from "./AmiCommitmentABI.json";
import { AMI_COMMITMENT_ADDRESS, SEPOLIA_CHAIN_ID } from "./config";
import type { CheckIn, Commitment } from "./types";

type BrowserEthereumProvider = {
  isMetaMask?: boolean;
  request: (args: { method: string; params?: unknown[] | object }) => Promise<unknown>;
  on?: (eventName: string, listener: (...args: unknown[]) => void) => void;
  removeListener?: (eventName: string, listener: (...args: unknown[]) => void) => void;
};

type CommitmentTuple = {
  id: bigint;
  creator: string;
  title: string;
  durationDays: bigint;
  reminder: string;
  createdAt: bigint;
  active: boolean;
};

type CheckInTuple = {
  id: bigint;
  commitmentId: bigint;
  creator: string;
  content: string;
  mood: string;
  proofURI: string;
  createdAt: bigint;
};

declare global {
  interface Window {
    ethereum?: BrowserEthereumProvider;
  }
}

export async function createCommitment(
  title: string,
  durationDays: number,
  reminder: string,
) {
  const contract = await getAmiCommitmentWriteContract();
  const tx = await contract.createCommitment(title, BigInt(durationDays), reminder);
  const receipt = await tx.wait();

  return {
    hash: tx.hash as string,
    receipt,
  };
}

export async function getMyCommitmentIds() {
  const contract = await getAmiCommitmentReadContract();
  const ids = (await contract.getMyCommitments()) as bigint[];

  return ids.map(toNumber);
}

export async function getCommitment(id: number | bigint) {
  const contract = await getAmiCommitmentReadContract();
  const commitment = (await contract.getCommitment(BigInt(id))) as CommitmentTuple;

  return normalizeCommitment(commitment);
}

export async function getMyCommitmentsDetailed() {
  const ids = await getMyCommitmentIds();
  const commitments = await Promise.all(ids.map((id) => getCommitment(id)));

  return sortByCreatedAt(commitments);
}

export async function getCommitmentsByOwner(owner: string) {
  const contract = await getAmiCommitmentReadContract();
  const ids = (await contract.getCommitmentsByOwner(owner)) as bigint[];

  return ids.map(toNumber);
}

export async function getCommitmentsByOwnerDetailed(owner: string) {
  const ids = await getCommitmentsByOwner(owner);
  const commitments = await Promise.all(ids.map((id) => getCommitment(id)));

  return sortByCreatedAt(commitments);
}

export async function createCheckIn(
  commitmentId: number | bigint,
  content: string,
  mood: string,
  proofURI: string,
) {
  const contract = await getAmiCommitmentWriteContract();
  const tx = await contract.createCheckIn(BigInt(commitmentId), content, mood, proofURI);
  const receipt = await tx.wait();

  return {
    hash: tx.hash as string,
    receipt,
  };
}

export async function getCheckInCount(commitmentId: number | bigint) {
  const contract = await getAmiCommitmentReadContract();
  const count = (await contract.getCheckInCount(BigInt(commitmentId))) as bigint;

  return toNumber(count);
}

export async function getCheckInIdsByCommitment(commitmentId: number | bigint) {
  const contract = await getAmiCommitmentReadContract();
  const ids = (await contract.getCheckInIdsByCommitment(BigInt(commitmentId))) as bigint[];

  return ids.map(toNumber);
}

export async function getCheckIn(id: number | bigint) {
  const contract = await getAmiCommitmentReadContract();
  const checkIn = (await contract.getCheckIn(BigInt(id))) as CheckInTuple;

  return normalizeCheckIn(checkIn);
}

export async function getCheckInsByCommitmentDetailed(commitmentId: number | bigint) {
  const ids = await getCheckInIdsByCommitment(commitmentId);
  const checkIns = await Promise.all(ids.map((id) => getCheckIn(id)));

  return sortByCreatedAt(checkIns);
}

export function getContractErrorMessage(error: unknown) {
  if (typeof error === "object" && error && "message" in error) {
    const message = String(error.message);

    if (message.includes("Wrong network")) {
      return "请先切换到 Sepolia 测试网络";
    }

    if (message.includes("No contract code found")) {
      return "当前合约地址无有效部署，请检查配置";
    }

    if (message.includes("Invalid AmiCommitment contract address")) {
      return "当前合约地址格式不正确，请检查配置";
    }

    if (message.includes("user rejected")) {
      return "你取消了 MetaMask 确认";
    }

    if (message.includes("Duration must be > 0")) {
      return "预计周期必须大于 0 天";
    }

    if (message.includes("Title required")) {
      return "约定标题不能为空";
    }

    if (message.includes("Content required")) {
      return "请先填写今日打卡内容";
    }

    if (message.includes("Mood required")) {
      return "请先选择今日心情";
    }

    if (message.includes("Commitment inactive")) {
      return "当前约定已不可打卡";
    }

    if (message.includes("Not commitment creator")) {
      return "只有约定创建者本人可以打卡";
    }

    if (message.includes("Commitment not found")) {
      return "未找到对应的约定";
    }

    return message;
  }

  return "合约调用失败，请稍后再试";
}

async function getAmiCommitmentWriteContract() {
  const provider = await getBrowserProvider();
  const signer = await provider.getSigner();
  const contractAddress = getNormalizedContractAddress();

  await validateContractAccess(provider, signer, contractAddress);

  return new Contract(contractAddress, amiCommitmentAbi, signer);
}

async function getAmiCommitmentReadContract() {
  const provider = await getBrowserProvider();
  const signer = await provider.getSigner();
  const contractAddress = getNormalizedContractAddress();

  await validateContractAccess(provider, signer, contractAddress);

  return new Contract(contractAddress, amiCommitmentAbi, provider);
}

async function getBrowserProvider() {
  if (typeof window === "undefined" || !window.ethereum) {
    throw new Error("请先安装并连接 MetaMask");
  }

  return new BrowserProvider(window.ethereum);
}

async function validateContractAccess(
  provider: BrowserProvider,
  signer: Awaited<ReturnType<BrowserProvider["getSigner"]>>,
  contractAddress: string,
) {
  const network = await provider.getNetwork();
  const chainId = Number(network.chainId);
  const signerAddress = await signer.getAddress();
  const deployedCode = await provider.getCode(contractAddress);

  console.debug("[AmiCommitment] preflight", {
    chainId,
    signerAddress,
    contractAddress,
    deployedCode,
  });

  if (chainId !== SEPOLIA_CHAIN_ID) {
    throw new Error(
      `Wrong network: expected Sepolia (${SEPOLIA_CHAIN_ID}), got ${chainId}.`,
    );
  }

  if (deployedCode === "0x") {
    throw new Error(
      `No contract code found at ${contractAddress} on Sepolia. Check the deployed contract address.`,
    );
  }
}

function getNormalizedContractAddress() {
  if (!AMI_COMMITMENT_ADDRESS) {
    throw new Error("Missing AmiCommitment contract address configuration.");
  }

  try {
    return getAddress(AMI_COMMITMENT_ADDRESS);
  } catch {
    throw new Error(`Invalid AmiCommitment contract address: ${AMI_COMMITMENT_ADDRESS}`);
  }
}

function normalizeCommitment(commitment: CommitmentTuple): Commitment {
  return {
    id: toNumber(commitment.id),
    creator: commitment.creator,
    title: commitment.title,
    durationDays: toNumber(commitment.durationDays),
    reminder: commitment.reminder,
    createdAt: toTimestampMs(commitment.createdAt),
    active: commitment.active,
  };
}

function normalizeCheckIn(checkIn: CheckInTuple): CheckIn {
  return {
    id: toNumber(checkIn.id),
    commitmentId: toNumber(checkIn.commitmentId),
    creator: checkIn.creator,
    content: checkIn.content,
    mood: checkIn.mood,
    proofURI: checkIn.proofURI,
    createdAt: toTimestampMs(checkIn.createdAt),
  };
}

function sortByCreatedAt<T extends { createdAt: number }>(items: T[]) {
  return [...items].sort((left, right) => right.createdAt - left.createdAt);
}

function toTimestampMs(value: bigint) {
  return toNumber(value) * 1000;
}

function toNumber(value: bigint) {
  return Number(value);
}
