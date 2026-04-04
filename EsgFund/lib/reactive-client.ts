import { Contract, Interface, JsonRpcProvider, isAddress } from "ethers";
import {
  POLICY_EXECUTOR_ADDRESS,
  REACTIVE_POLICY_ADDRESS,
  REACTIVE_PORTFOLIO_ADDRESS,
  REACTIVE_RPC_URL,
  SEPOLIA_RPC_URL
} from "@/lib/oracle-config";

const REACTIVE_POLICY_ABI = [
  "event PolicyEvaluated(address indexed protocol,uint256 indexed sourceTxHash,uint8 action,uint8 oldRating,uint8 newRating,bool severeIncident)"
] as const;

const POLICY_EXECUTOR_ABI = [
  "event PolicyExecutionTriggered(uint256 indexed oracleTxHash,address indexed protocol,uint8 signalAction,uint8 executedAction,uint16 oldTargetBps,uint16 newTargetBps,bytes32 reactiveTxHash,address rvmId)"
] as const;

const PORTFOLIO_ABI = [
  "function positions(address asset) external view returns (uint256 units,uint16 targetBps,bool listed)"
] as const;

type PolicyLogResult = {
  txHash: string;
};

export type PortfolioExecutionResult = {
  txHash: string;
  reactiveTxHash: string;
  signalAction: number;
  executedAction: number;
  oldTargetBps: number;
  newTargetBps: number;
};

function getSepoliaProvider() {
  if (!SEPOLIA_RPC_URL) {
    return null;
  }
  return new JsonRpcProvider(SEPOLIA_RPC_URL);
}

function getReactiveProvider() {
  if (!REACTIVE_RPC_URL) {
    return null;
  }
  return new JsonRpcProvider(REACTIVE_RPC_URL);
}

function isHash32(value?: string): boolean {
  return typeof value === "string" && /^0x[0-9a-fA-F]{64}$/.test(value);
}

function toBytes32Topic(hash: string): string {
  return `0x${hash.slice(2).padStart(64, "0")}`;
}

export function validateReactiveConfig(): string | null {
  if (!SEPOLIA_RPC_URL) {
    return "Missing NEXT_PUBLIC_SEPOLIA_RPC_URL";
  }
  if (!REACTIVE_RPC_URL) {
    return "Missing NEXT_PUBLIC_REACTIVE_RPC_URL";
  }
  if (!isAddress(REACTIVE_POLICY_ADDRESS)) {
    return "Missing or invalid NEXT_PUBLIC_REACTIVE_POLICY_ADDRESS";
  }
  if (!isAddress(POLICY_EXECUTOR_ADDRESS)) {
    return "Missing or invalid NEXT_PUBLIC_POLICY_EXECUTOR_ADDRESS";
  }
  if (!isAddress(REACTIVE_PORTFOLIO_ADDRESS)) {
    return "Missing or invalid NEXT_PUBLIC_REACTIVE_PORTFOLIO_ADDRESS";
  }
  return null;
}

export async function findReactivePolicyTx(
  oracleTxHash: string,
  protocolAddress: string,
  lookbackBlocks = 20_000
): Promise<PolicyLogResult | null> {
  if (!isHash32(oracleTxHash) || !isAddress(protocolAddress) || !isAddress(REACTIVE_POLICY_ADDRESS)) {
    return null;
  }

  const provider = getReactiveProvider();
  if (!provider) {
    return null;
  }

  const iface = new Interface(REACTIVE_POLICY_ABI);
  const topic0 = iface.getEvent("PolicyEvaluated")!.topicHash;

  const latest = await provider.getBlockNumber();
  const fromBlock = Math.max(0, latest - lookbackBlocks);

  const logs = await provider.getLogs({
    address: REACTIVE_POLICY_ADDRESS,
    fromBlock,
    toBlock: latest,
    topics: [topic0, null, toBytes32Topic(oracleTxHash)]
  });

  const matched = [...logs].reverse().find((log) => {
    const parsed = iface.parseLog(log);
    if (!parsed) {
      return false;
    }
    const protocol = String(parsed.args.protocol ?? "").toLowerCase();
    return protocol === protocolAddress.toLowerCase();
  });

  if (!matched?.transactionHash) {
    return null;
  }

  return { txHash: matched.transactionHash };
}

export async function findPortfolioExecution(
  oracleTxHash: string,
  protocolAddress: string,
  lookbackBlocks = 20_000
): Promise<PortfolioExecutionResult | null> {
  if (!isHash32(oracleTxHash) || !isAddress(protocolAddress) || !isAddress(POLICY_EXECUTOR_ADDRESS)) {
    return null;
  }

  const provider = getSepoliaProvider();
  if (!provider) {
    return null;
  }

  const iface = new Interface(POLICY_EXECUTOR_ABI);
  const topic0 = iface.getEvent("PolicyExecutionTriggered")!.topicHash;
  const latest = await provider.getBlockNumber();
  const fromBlock = Math.max(0, latest - lookbackBlocks);

  const logs = await provider.getLogs({
    address: POLICY_EXECUTOR_ADDRESS,
    fromBlock,
    toBlock: latest,
    topics: [topic0, toBytes32Topic(oracleTxHash), null]
  });

  const matched = [...logs].reverse().find((log) => {
    const parsed = iface.parseLog(log);
    if (!parsed) {
      return false;
    }
    const protocol = String(parsed.args.protocol ?? "").toLowerCase();
    return protocol === protocolAddress.toLowerCase();
  });

  if (!matched?.transactionHash) {
    return null;
  }

  const parsed = iface.parseLog(matched);
  if (!parsed) {
    return null;
  }

  return {
    txHash: matched.transactionHash,
    reactiveTxHash: String(parsed.args.reactiveTxHash),
    signalAction: Number(parsed.args.signalAction),
    executedAction: Number(parsed.args.executedAction),
    oldTargetBps: Number(parsed.args.oldTargetBps),
    newTargetBps: Number(parsed.args.newTargetBps)
  };
}

export async function readPortfolioTargetBps(protocolAddress: string): Promise<number | null> {
  if (!isAddress(protocolAddress) || !isAddress(REACTIVE_PORTFOLIO_ADDRESS)) {
    return null;
  }

  const provider = getSepoliaProvider();
  if (!provider) {
    return null;
  }

  const contract = new Contract(REACTIVE_PORTFOLIO_ADDRESS, PORTFOLIO_ABI, provider);
  const result = await contract.positions(protocolAddress);
  return Number(result.targetBps);
}
