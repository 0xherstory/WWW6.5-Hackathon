import type { Leader } from "./flashback";

export interface Charity {
  id: string;
  name: string;
  description: string;
  walletAddress: string;
  sharePercent: number; // 90 for charity, 10 for platform
}

export interface NFTItem {
  id: string;
  leaderId: Leader;
  leaderName: string;
  title: string;
  description: string;
  price: string; // in AVAX, e.g., "0.01"
  image: string; // image key or URL
  charity: Charity;
  unlockCondition: "both_branches"; // Unlock when player has at least 1 SBT from each branch
  isLegendary?: boolean; // true if player has all 10 SBTs
}

export interface NFTPurchaseRecord {
  nftId: string;
  leaderId: Leader;
  purchaseTime: number;
  txHash?: string;
  charityAmount: string; // 90% goes here
  platformAmount: string; // 10% goes here
  isLegendary: boolean;
}

export interface NFTOwnership {
  ownedNFTs: string[]; // array of nftIds
  purchaseRecords: NFTPurchaseRecord[];
  totalCharityDonated: string; // total in AVAX
}
