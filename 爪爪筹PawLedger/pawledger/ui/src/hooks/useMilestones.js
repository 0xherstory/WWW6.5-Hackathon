import { useState, useEffect, useCallback } from "react";
import { useContract } from "./useContract";
import { useWallet } from "./useWallet";

const MILESTONE_STATUS = ["PENDING", "APPROVED", "REJECTED"];

function normalizeMilestone(raw, idx) {
  return {
    idx,
    evidenceIPFS: raw.evidenceIPFS,
    description: raw.description,
    requestAmount: raw.requestAmount,
    approveWeight: raw.approveWeight,
    rejectWeight: raw.rejectWeight,
    submittedAt: Number(raw.submittedAt),
    status: MILESTONE_STATUS[Number(raw.status)],
    fundsReleased: raw.fundsReleased,
  };
}

export function useMilestones(caseId) {
  const { pawLedger } = useContract();
  const { account } = useWallet();
  const [milestones, setMilestones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchMilestones = useCallback(async () => {
    if (!pawLedger || caseId == null) return;
    setLoading(true);
    setError(null);
    try {
      const count = await pawLedger.getMilestonesCount(caseId);
      const list = [];
      for (let i = 0; i < Number(count); i++) {
        const raw = await pawLedger.getMilestone(caseId, i);
        list.push(normalizeMilestone(raw, i));
      }
      setMilestones(list);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [pawLedger, caseId]);

  useEffect(() => {
    fetchMilestones();
  }, [fetchMilestones]);

  const submitMilestone = useCallback(
    async (idx, ipfs, desc, amount) => {
      if (!pawLedger) throw new Error("Contract not connected");
      const tx = await pawLedger.submitMilestone(caseId, idx, ipfs, desc, amount);
      await tx.wait();
      await fetchMilestones();
      return tx;
    },
    [pawLedger, caseId, fetchMilestones]
  );

  const voteMilestone = useCallback(
    async (idx, approve) => {
      if (!pawLedger) throw new Error("Contract not connected");
      const tx = await pawLedger.voteMilestone(caseId, idx, approve);
      await tx.wait();
      await fetchMilestones();
      return tx;
    },
    [pawLedger, caseId, fetchMilestones]
  );

  const withdrawMilestone = useCallback(
    async (idx) => {
      if (!pawLedger) throw new Error("Contract not connected");
      const tx = await pawLedger.withdrawMilestone(caseId, idx);
      await tx.wait();
      await fetchMilestones();
      return tx;
    },
    [pawLedger, caseId, fetchMilestones]
  );

  const checkVoted = useCallback(
    async (idx) => {
      if (!pawLedger || !account) return false;
      return pawLedger.hasVoted(caseId, idx, account);
    },
    [pawLedger, caseId, account]
  );

  return {
    milestones,
    loading,
    error,
    refresh: fetchMilestones,
    submitMilestone,
    voteMilestone,
    withdrawMilestone,
    checkVoted,
  };
}
