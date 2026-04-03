"use client";

import { useState, useCallback } from "react";
import type { GlobalCharityStats, RecentPurchase, CharityProjectStats } from "@/types/profile";
import { CHARITY_RBG, CHARITY_HILLARY } from "@/data/nft-catalog";

const STORAGE_KEY = "herpath_global_charity_stats";

// Generate a random Ethereum-like address
function generateRandomAddress(): string {
  const chars = "0123456789abcdef";
  let addr = "0x";
  for (let i = 0; i < 40; i++) {
    addr += chars[Math.floor(Math.random() * chars.length)];
  }
  return addr;
}

// Abbreviate wallet address (show first 6 and last 4 chars)
export function abbreviateAddress(addr: string): string {
  return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
}

function makeDefaultStats(): GlobalCharityStats {
  // Simulate initial data
  const rbgPurchases = Math.floor(Math.random() * 50) + 30;
  const hillaryPurchases = Math.floor(Math.random() * 45) + 25;

  const recentPurchases: RecentPurchase[] = [];
  const now = Date.now();

  // Generate 5 recent purchases
  for (let i = 0; i < 5; i++) {
    const isRBG = Math.random() > 0.5;
    recentPurchases.push({
      playerAddress: generateRandomAddress(),
      leaderId: isRBG ? "rbg" : "hillary",
      nftTitle: isRBG ? "法律的守护者" : "权力的塑造者",
      timestamp: now - i * 3600000 - Math.random() * 3600000, // Spread over time
      charityAmount: "0.009",
    });
  }

  const charityProjects: CharityProjectStats[] = [
    {
      leaderId: "rbg",
      projectName: CHARITY_RBG.name,
      projectDescription: CHARITY_RBG.description,
      purchaseCount: rbgPurchases,
      totalDonated: (rbgPurchases * 0.009).toFixed(4),
      beneficiaryName: "女性法律援助基金会",
    },
    {
      leaderId: "hillary",
      projectName: CHARITY_HILLARY.name,
      projectDescription: CHARITY_HILLARY.description,
      purchaseCount: hillaryPurchases,
      totalDonated: (hillaryPurchases * 0.009).toFixed(4),
      beneficiaryName: "全球女性领导力中心",
    },
  ];

  const totalPurchases = rbgPurchases + hillaryPurchases;
  const totalSBTs = Math.floor(totalPurchases * 2.5); // Estimate: ~2.5 SBTs per NFT purchase

  return {
    totalSBTsMinted: totalSBTs,
    totalNFTsPurchased: totalPurchases,
    totalDonated: ((rbgPurchases + hillaryPurchases) * 0.009).toFixed(4),
    recentPurchases: recentPurchases.sort(
      (a, b) => b.timestamp - a.timestamp
    ),
    charityProjects,
    lastUpdated: now,
  };
}

function loadStats(): GlobalCharityStats {
  if (typeof window === "undefined") return makeDefaultStats();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : makeDefaultStats();
  } catch {
    return makeDefaultStats();
  }
}

function saveStats(stats: GlobalCharityStats) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
}

export function useGlobalCharityStats() {
  const [stats, setStats] = useState<GlobalCharityStats>(() => loadStats());

  // Record a new NFT purchase in global stats
  const recordGlobalPurchase = useCallback(
    (
      playerAddress: string,
      leaderId: "rbg" | "hillary",
      nftTitle: string
    ) => {
      const newStats = { ...stats };

      // Add to recent purchases (keep only last 5)
      const newPurchase: RecentPurchase = {
        playerAddress,
        leaderId,
        nftTitle,
        timestamp: Date.now(),
        charityAmount: "0.009",
      };
      newStats.recentPurchases = [
        newPurchase,
        ...newStats.recentPurchases.slice(0, 4),
      ];

      // Update charity project stats
      const projectIndex = newStats.charityProjects.findIndex(
        (p) => p.leaderId === leaderId
      );
      if (projectIndex >= 0) {
        const project = newStats.charityProjects[projectIndex];
        project.purchaseCount += 1;
        project.totalDonated = (
          parseFloat(project.totalDonated) + 0.009
        ).toFixed(4);
      }

      // Update totals
      newStats.totalNFTsPurchased += 1;
      newStats.totalDonated = (parseFloat(newStats.totalDonated) + 0.009).toFixed(4);
      newStats.lastUpdated = Date.now();

      setStats(newStats);
      saveStats(newStats);

      return newStats;
    },
    [stats]
  );

  // Estimate SBT count based on NFT purchases
  const estimateTotalSBTs = useCallback((): number => {
    return Math.floor(stats.totalNFTsPurchased * 2.5);
  }, [stats.totalNFTsPurchased]);

  return {
    stats,
    recordGlobalPurchase,
    estimateTotalSBTs,
  };
}
