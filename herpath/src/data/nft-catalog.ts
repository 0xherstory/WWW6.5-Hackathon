import type { NFTItem } from "@/types/nft";

export const CHARITY_RBG = {
  id: "charity_rbg",
  name: "女性法律援助基金",
  description: "为全球女性提供法律援助和平等权益保护",
  walletAddress: "0x1234567890123456789012345678901234567890", // Placeholder - update with actual address
  sharePercent: 90,
};

export const CHARITY_HILLARY = {
  id: "charity_hillary",
  name: "女性全球领导力培训计划",
  description: "培养全球女性领导者，推动社会进步",
  walletAddress: "0x0987654321098765432109876543210987654321", // Placeholder - update with actual address
  sharePercent: 90,
};

export const NFT_CATALOG: NFTItem[] = [
  {
    id: "nft_rbg_001",
    leaderId: "rbg",
    leaderName: "Ruth Bader Ginsburg",
    title: "法律的守护者",
    description: "致敬 RBG 在法律领域的不朽传奇。此 NFT 代表平等、正义与不屈的精神。",
    price: "0.01",
    image: "rbg_nft_001",
    charity: CHARITY_RBG,
    unlockCondition: "both_branches",
  },
  {
    id: "nft_hillary_001",
    leaderId: "hillary",
    leaderName: "Hillary Clinton",
    title: "权力的塑造者",
    description: "致敬 Hillary 在全球政治与外交舞台上的卓越成就。此 NFT 代表影响力、韧性与永恒的斗志。",
    price: "0.01",
    image: "hillary_nft_001",
    charity: CHARITY_HILLARY,
    unlockCondition: "both_branches",
  },
];

// Helper function to get NFT by leader
export function getNFTByLeader(leaderId: "rbg" | "hillary"): NFTItem | undefined {
  return NFT_CATALOG.find((nft) => nft.leaderId === leaderId);
}

// Helper function to get charity by leader
export function getCharityByLeader(leaderId: "rbg" | "hillary") {
  return leaderId === "rbg" ? CHARITY_RBG : CHARITY_HILLARY;
}
