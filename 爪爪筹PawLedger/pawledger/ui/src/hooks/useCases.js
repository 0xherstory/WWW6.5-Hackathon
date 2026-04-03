import { useState, useEffect, useCallback } from "react";
import { useContract } from "./useContract";

const STATUS = ["PENDING", "ACTIVE", "CLOSED", "REFUNDED"];

function parseMetadata(raw) {
  try {
    return JSON.parse(raw);
  } catch {
    return { title: raw, description: "", image: "" };
  }
}

function normalizeCase(raw, id) {
  const meta = parseMetadata(raw.ipfsMetadata);
  return {
    id,
    rescuer: raw.rescuer,
    title: meta.title || `Case #${id}`,
    description: meta.description || "",
    image: meta.image || "",
    goalAmount: raw.goalAmount,
    raisedAmount: raw.raisedAmount,
    deadline: Number(raw.deadline),
    status: STATUS[Number(raw.status)],
    milestoneCount: Number(raw.milestoneCount),
    approvalCount: Number(raw.approvalCount),
  };
}

export function useCases() {
  const { pawLedger } = useContract();
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCases = useCallback(async () => {
    if (!pawLedger) return;
    setLoading(true);
    setError(null);
    try {
      const count = await pawLedger.getCasesCount();
      const ids = Array.from({ length: Number(count) }, (_, i) => i);
      const raw = await Promise.all(ids.map((id) => pawLedger.cases(id)));
      setCases(raw.map((c, i) => normalizeCase(c, i)));
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [pawLedger]);

  useEffect(() => {
    fetchCases();
  }, [fetchCases]);

  const getCase = useCallback(
    async (id) => {
      if (!pawLedger) return null;
      const raw = await pawLedger.cases(id);
      return normalizeCase(raw, Number(id));
    },
    [pawLedger]
  );

  const activeCases = cases.filter((c) => c.status === "ACTIVE");
  const stats = {
    total: cases.length,
    active: activeCases.length,
    totalRaised: cases.reduce((sum, c) => sum + c.raisedAmount, 0n),
  };

  return { cases, activeCases, stats, loading, error, refresh: fetchCases, getCase };
}
