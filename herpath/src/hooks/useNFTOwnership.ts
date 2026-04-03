"use client";

import { useState, useCallback } from "react";
import type { Leader } from "@/types/flashback";
import type { NFTOwnership, NFTPurchaseRecord } from "@/types/nft";

const STORAGE_KEY_RBG = "herpath_nft_ownership_rbg";
const STORAGE_KEY_HILLARY = "herpath_nft_ownership_hillary";

function getStorageKey(leader: Leader): string {
  return leader === "rbg" ? STORAGE_KEY_RBG : STORAGE_KEY_HILLARY;
}

function makeDefault(): NFTOwnership {
  return {
    ownedNFTs: [],
    purchaseRecords: [],
    totalCharityDonated: "0",
  };
}

function loadOwnership(leader: Leader): NFTOwnership {
  if (typeof window === "undefined") return makeDefault();
  try {
    const raw = localStorage.getItem(getStorageKey(leader));
    return raw ? JSON.parse(raw) : makeDefault();
  } catch {
    return makeDefault();
  }
}

function saveOwnership(ownership: NFTOwnership, leader: Leader) {
  if (typeof window === "undefined") return;
  localStorage.setItem(getStorageKey(leader), JSON.stringify(ownership));
}

export function useNFTOwnership(leader: Leader) {
  const [ownership, setOwnership] = useState<NFTOwnership>(() =>
    loadOwnership(leader)
  );

  // Check if player owns a specific NFT
  const ownsNFT = useCallback(
    (nftId: string): boolean => {
      return ownership.ownedNFTs.includes(nftId);
    },
    [ownership.ownedNFTs]
  );

  // Record a successful purchase
  const recordPurchase = useCallback(
    (
      nftId: string,
      charityAmount: string,
      platformAmount: string,
      isLegendary: boolean = false,
      txHash?: string
    ) => {
      const newOwnership = { ...ownership };

      // Add NFT to owned list if not already owned
      if (!newOwnership.ownedNFTs.includes(nftId)) {
        newOwnership.ownedNFTs.push(nftId);
      }

      // Record the purchase
      const record: NFTPurchaseRecord = {
        nftId,
        leaderId: leader,
        purchaseTime: Date.now(),
        txHash,
        charityAmount,
        platformAmount,
        isLegendary,
      };
      newOwnership.purchaseRecords.push(record);

      // Update total charity donated
      const currentTotal = parseFloat(newOwnership.totalCharityDonated || "0");
      const newTotal = currentTotal + parseFloat(charityAmount);
      newOwnership.totalCharityDonated = newTotal.toFixed(4);

      setOwnership(newOwnership);
      saveOwnership(newOwnership, leader);

      return record;
    },
    [ownership, leader]
  );

  // Get the latest purchase record
  const getLatestPurchase = useCallback((): NFTPurchaseRecord | undefined => {
    return ownership.purchaseRecords[ownership.purchaseRecords.length - 1];
  }, [ownership.purchaseRecords]);

  return {
    ownership,
    ownsNFT,
    recordPurchase,
    getLatestPurchase,
  };
}
