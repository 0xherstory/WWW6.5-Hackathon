import type { Leader } from "./flashback";
import type { DomainAttribute } from "./domain";

export interface PlayerProfile {
  walletAddress: string;
  currentLeader: Leader;
  attributes: Record<DomainAttribute, number>;
  sbtsMinted: string[];
  nftsOwned: string[];
  joinedAt: number; // timestamp
}

export interface RecentPurchase {
  playerAddress: string;
  leaderId: Leader;
  nftTitle: string;
  timestamp: number;
  charityAmount: string; // 0.009 AVAX
}

export interface CharityProjectStats {
  leaderId: Leader;
  projectName: string;
  projectDescription: string;
  purchaseCount: number;
  totalDonated: string; // in AVAX
  beneficiaryName: string;
}

export interface GlobalCharityStats {
  totalSBTsMinted: number;
  totalNFTsPurchased: number;
  totalDonated: string; // in AVAX
  recentPurchases: RecentPurchase[]; // last 5 purchases
  charityProjects: CharityProjectStats[];
  lastUpdated: number;
}
