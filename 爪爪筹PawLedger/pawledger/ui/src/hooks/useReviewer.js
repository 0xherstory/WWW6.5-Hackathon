import { useState, useEffect, useCallback } from "react";
import { useContract } from "./useContract";
import { useWallet } from "./useWallet";

export function useReviewer() {
  const { pawLedger, pawToken } = useContract();
  const { account } = useWallet();
  const [pawBalance, setPawBalance] = useState(0n);
  const [loading, setLoading] = useState(false);

  const fetchPawBalance = useCallback(async () => {
    if (!pawToken || !account) return;
    try {
      const bal = await pawToken.balanceOf(account);
      setPawBalance(bal);
    } catch (e) {
      console.error("fetchPawBalance:", e);
    }
  }, [pawToken, account]);

  useEffect(() => {
    fetchPawBalance();
  }, [fetchPawBalance]);

  const reviewCase = useCallback(
    async (caseId, approve) => {
      if (!pawLedger) throw new Error("Contract not connected");
      setLoading(true);
      try {
        const tx = await pawLedger.reviewCase(caseId, approve);
        await tx.wait();
        await fetchPawBalance();
        return tx;
      } finally {
        setLoading(false);
      }
    },
    [pawLedger, fetchPawBalance]
  );

  const checkReviewed = useCallback(
    async (caseId) => {
      if (!pawLedger || !account) return false;
      return pawLedger.hasReviewed(caseId, account);
    },
    [pawLedger, account]
  );

  return {
    pawBalance,
    loading,
    reviewCase,
    checkReviewed,
    refreshBalance: fetchPawBalance,
  };
}
