import { BrowserProvider, Contract, getAddress } from "ethers";
import amiCommitmentV2Abi from "./AmiCommitmentV2ABI.json";
import { AMI_COMMITMENT_V2_ADDRESS, SEPOLIA_CHAIN_ID } from "./config";
import type { Commitment } from "./types";

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

type WitnessRecordTuple = {
  id: bigint;
  commitmentId: bigint;
  witness: string;
  commitmentOwner: string;
  createdAt: bigint;
};

export type NormalizedWitnessRecord = {
  id: number;
  commitmentId: number;
  witness: string;
  commitmentOwner: string;
  createdAt: number;
};

declare global {
  interface Window {
    ethereum?: BrowserEthereumProvider;
  }
}

export async function createWitness(commitmentId: number | bigint) {
  const contract = await getAmiCommitmentV2WriteContract();
  const tx = await contract.createWitness(BigInt(commitmentId));
  const receipt = await tx.wait();

  return {
    hash: tx.hash as string,
    receipt,
  };
}

export async function getCommitment(id: number | bigint) {
  const contract = await getAmiCommitmentV2ReadContract();
  const commitment = (await contract.getCommitment(BigInt(id))) as CommitmentTuple;

  return normalizeCommitment(commitment);
}

export async function getWitnessesByCommitment(commitmentId: number | bigint) {
  const contract = await getAmiCommitmentV2ReadContract();
  return (await contract.getWitnessesByCommitment(BigInt(commitmentId))) as string[];
}

export async function getWitnessCountByCommitment(commitmentId: number | bigint) {
  const contract = await getAmiCommitmentV2ReadContract();
  const count = (await contract.getWitnessCountByCommitment(BigInt(commitmentId))) as bigint;

  return toNumber(count);
}

export async function getWitnessRecord(witnessRecordId: number | bigint) {
  const contract = await getAmiCommitmentV2ReadContract();
  const witnessRecord = (await contract.getWitnessRecord(BigInt(witnessRecordId))) as WitnessRecordTuple;

  return normalizeWitnessRecord(witnessRecord);
}

export async function getWitnessRecordIdsByWitness(address: string) {
  const contract = await getAmiCommitmentV2ReadContract();
  const ids = (await contract.getWitnessRecordIdsByWitness(address)) as bigint[];

  return ids.map(toNumber);
}

export async function getWitnessRecordIdsByOwner(address: string) {
  const contract = await getAmiCommitmentV2ReadContract();
  const ids = (await contract.getWitnessRecordIdsByOwner(address)) as bigint[];

  return ids.map(toNumber);
}

export function getContractV2ErrorMessage(error: unknown) {
  if (typeof error === "object" && error && "message" in error) {
    const message = String(error.message);

    if (message.includes("Wrong network")) {
      return "请先切换到 Sepolia 测试网络";
    }

    if (message.includes("No contract code found")) {
      return "当前 V2 合约地址无有效部署，请检查配置";
    }

    if (message.includes("Invalid AmiCommitmentV2 contract address")) {
      return "当前 V2 合约地址格式不正确，请检查配置";
    }

    if (message.includes("user rejected")) {
      return "你取消了 MetaMask 确认";
    }

    if (message.includes("Already witnessed")) {
      return "你已经见证过这份约定了";
    }

    if (message.includes("Cannot witness own commitment")) {
      return "不能见证自己的约定";
    }

    if (message.includes("Commitment inactive")) {
      return "当前约定已不可见证";
    }

    if (message.includes("Commitment not found")) {
      return "未找到对应的约定";
    }

    return message;
  }

  return "V2 合约调用失败，请稍后再试";
}

async function getAmiCommitmentV2WriteContract() {
  const provider = await getBrowserProvider();
  const signer = await provider.getSigner();
  const contractAddress = getNormalizedContractAddress();

  await validateContractAccess(provider, signer, contractAddress);

  return new Contract(contractAddress, amiCommitmentV2Abi, signer);
}

async function getAmiCommitmentV2ReadContract() {
  const provider = await getBrowserProvider();
  const signer = await provider.getSigner();
  const contractAddress = getNormalizedContractAddress();

  await validateContractAccess(provider, signer, contractAddress);

  return new Contract(contractAddress, amiCommitmentV2Abi, provider);
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

  console.debug("[AmiCommitmentV2] preflight", {
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
  if (!AMI_COMMITMENT_V2_ADDRESS) {
    throw new Error("Missing AmiCommitmentV2 contract address configuration.");
  }

  try {
    return getAddress(AMI_COMMITMENT_V2_ADDRESS);
  } catch {
    throw new Error(`Invalid AmiCommitmentV2 contract address: ${AMI_COMMITMENT_V2_ADDRESS}`);
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

function normalizeWitnessRecord(witnessRecord: WitnessRecordTuple): NormalizedWitnessRecord {
  return {
    id: toNumber(witnessRecord.id),
    commitmentId: toNumber(witnessRecord.commitmentId),
    witness: witnessRecord.witness,
    commitmentOwner: witnessRecord.commitmentOwner,
    createdAt: toTimestampMs(witnessRecord.createdAt),
  };
}

function toTimestampMs(value: bigint) {
  return toNumber(value) * 1000;
}

function toNumber(value: bigint) {
  return Number(value);
}
