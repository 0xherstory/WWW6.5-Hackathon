import { useState, useCallback } from "react";
import { parseEther } from "ethers";
import { useContract } from "./useContract";
import { useWallet } from "./useWallet";

export function useDonor() {
  const { pawLedger } = useContract();
  const { account } = useWallet();
  const [loading, setLoading] = useState(false);

  const donate = useCallback(
    async (caseId, amountEther) => {
      if (!pawLedger) throw new Error("Contract not connected");
      setLoading(true);
      try {
        const tx = await pawLedger.donate(caseId, {
          value: parseEther(String(amountEther)),
        });
        await tx.wait();
        return tx;
      } finally {
        setLoading(false);
      }
    },
    [pawLedger]
  );

  const claimRefund = useCallback(
    async (caseId) => {
      if (!pawLedger) throw new Error("Contract not connected");
      setLoading(true);
      try {
        const tx = await pawLedger.claimRefund(caseId);
        await tx.wait();
        return tx;
      } finally {
        setLoading(false);
      }
    },
    [pawLedger]
  );

  const becomeReviewer = useCallback(async () => {
    if (!pawLedger) throw new Error("Contract not connected");
    setLoading(true);
    try {
      const tx = await pawLedger.becomeReviewer();
      await tx.wait();
      return tx;
    } finally {
      setLoading(false);
    }
  }, [pawLedger]);

  const getDonationAmount = useCallback(
    async (caseId) => {
      if (!pawLedger || !account) return 0n;
      return pawLedger.donations(caseId, account);
    },
    [pawLedger, account]
  );

  return {
    loading,
    donate,
    claimRefund,
    becomeReviewer,
    getDonationAmount,
  };
}
