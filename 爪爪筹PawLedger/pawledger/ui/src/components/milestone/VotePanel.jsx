import { useState, useEffect } from "react";
import { formatEther } from "ethers";
import { useLocale } from "../../hooks/useLocale";
import { useWallet } from "../../hooks/useWallet";
import { useMilestones } from "../../hooks/useMilestones";
import Button from "../common/Button";
import TxConfirmation from "../modals/TxConfirmation";

export default function VotePanel({ caseId, milestoneIdx, milestone, raisedAmount, onVoted }) {
  const { t } = useLocale();
  const { account } = useWallet();
  const { voteMilestone, checkVoted } = useMilestones(caseId);
  const [alreadyVoted, setAlreadyVoted] = useState(false);
  const [txHash, setTxHash] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (account) {
      checkVoted(milestoneIdx).then(setAlreadyVoted);
    }
  }, [account, milestoneIdx, checkVoted]);

  if (!milestone || milestone.status !== "PENDING") return null;

  const raised = raisedAmount ?? 0n;
  const approvePct = raised > 0n
    ? Math.min(100, Number((milestone.approveWeight * 100n) / raised))
    : 0;
  const rejectPct = raised > 0n
    ? Math.min(100, Number((milestone.rejectWeight * 100n) / raised))
    : 0;

  const handleVote = async (approve) => {
    setError(null);
    setLoading(true);
    const t0 = Date.now();
    setStartTime(t0);
    try {
      const tx = await voteMilestone(milestoneIdx, approve);
      setTxHash(tx.hash);
      setAlreadyVoted(true);
      onVoted?.();
    } catch (e) {
      setError(e.reason ?? e.message);
      setStartTime(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-3 p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-3">
      {/* Vote bars */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs text-gray-500">
          <span>{t("milestone.approve_weight")}</span>
          <span className="font-medium text-emerald-600">{approvePct}%</span>
        </div>
        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-500 rounded-full transition-all duration-500"
            style={{ width: `${approvePct}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-500">
          <span>{t("milestone.reject_weight")}</span>
          <span className="font-medium text-red-500">{rejectPct}%</span>
        </div>
        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-red-400 rounded-full transition-all duration-500"
            style={{ width: `${rejectPct}%` }}
          />
        </div>
      </div>

      {txHash ? (
        <TxConfirmation txHash={txHash} startTime={startTime} />
      ) : alreadyVoted ? (
        <p className="text-xs text-gray-400 text-center">{t("milestone.already_voted")}</p>
      ) : !account ? (
        <p className="text-xs text-gray-400 text-center">{t("common.connect_wallet")}</p>
      ) : (
        <>
          {error && <p className="text-xs text-red-500">{error}</p>}
          {startTime && !txHash && <TxConfirmation startTime={startTime} />}
          <div className="flex gap-2">
            <Button
              onClick={() => handleVote(true)}
              disabled={loading}
              size="sm"
              className="flex-1"
            >
              {t("milestone.vote_approve")}
            </Button>
            <Button
              onClick={() => handleVote(false)}
              disabled={loading}
              variant="danger"
              size="sm"
              className="flex-1"
            >
              {t("milestone.vote_reject")}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
