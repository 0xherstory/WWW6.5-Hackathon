import { BrowserProvider, Contract, isAddress } from "ethers";
import { ESG_ORACLE_ADDRESS, SEPOLIA_CHAIN_ID_DEC } from "@/lib/oracle-config";

const ORACLE_ABI = [
  "function updateScore(address protocol,uint8 environmental,uint8 social,uint8 governance,uint8 total,uint8 rating) external",
  "function getScore(address protocol) external view returns (uint8 environmental,uint8 social,uint8 governance,uint8 total,uint8 rating,uint64 updatedAt,bool severeIncident)"
] as const;

export type Rating = "AAA" | "AA" | "A" | "BBB" | "BB" | "B";

export type OracleScore = {
  environmental: number;
  social: number;
  governance: number;
  total: number;
  rating: Rating;
  updatedAt: number;
  severeIncident: boolean;
};

export function ratingToEnum(rating: Rating): number {
  if (rating === "B") return 0;
  if (rating === "BB") return 1;
  if (rating === "BBB") return 2;
  if (rating === "A") return 3;
  if (rating === "AA") return 4;
  return 5;
}

export function enumToRating(value: number): Rating {
  if (value === 0) return "B";
  if (value === 1) return "BB";
  if (value === 2) return "BBB";
  if (value === 3) return "A";
  if (value === 4) return "AA";
  return "AAA";
}

export function validateOracleConfig(protocolAddress?: string): string | null {
  if (!isAddress(ESG_ORACLE_ADDRESS)) {
    return "Missing or invalid NEXT_PUBLIC_ESG_ORACLE_ADDRESS";
  }
  if (!protocolAddress || !isAddress(protocolAddress)) {
    return "Missing or invalid protocol contract address mapping";
  }
  return null;
}

export async function updateScoreOnChain(params: {
  protocolAddress: string;
  environmental: number;
  social: number;
  governance: number;
  total: number;
  rating: Rating;
}): Promise<string> {
  if (typeof window === "undefined" || !window.ethereum) {
    throw new Error("Wallet provider not found");
  }

  const provider = new BrowserProvider(window.ethereum);
  const network = await provider.getNetwork();
  if (Number(network.chainId) !== SEPOLIA_CHAIN_ID_DEC) {
    throw new Error("Wallet is not connected to Sepolia");
  }

  const signer = await provider.getSigner();
  const contract = new Contract(ESG_ORACLE_ADDRESS, ORACLE_ABI, signer);
  const tx = await contract.updateScore(
    params.protocolAddress,
    params.environmental,
    params.social,
    params.governance,
    params.total,
    ratingToEnum(params.rating)
  );
  await tx.wait();
  return tx.hash as string;
}

export async function readScoreOnChain(protocolAddress: string): Promise<OracleScore> {
  if (typeof window === "undefined" || !window.ethereum) {
    throw new Error("Wallet provider not found");
  }

  const provider = new BrowserProvider(window.ethereum);
  const contract = new Contract(ESG_ORACLE_ADDRESS, ORACLE_ABI, provider);
  const score = await contract.getScore(protocolAddress);

  return {
    environmental: Number(score.environmental),
    social: Number(score.social),
    governance: Number(score.governance),
    total: Number(score.total),
    rating: enumToRating(Number(score.rating)),
    updatedAt: Number(score.updatedAt),
    severeIncident: Boolean(score.severeIncident)
  };
}
