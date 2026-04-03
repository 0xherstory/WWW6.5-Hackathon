import { useState } from "react";
import { formatEther } from "ethers";
import { useLocale } from "../../hooks/useLocale";
import { useReviewer } from "../../hooks/useReviewer";
import Card from "../common/Card";
import Button from "../common/Button";
import TxConfirmation from "../modals/TxConfirmation";

export default function ReviewCard({ case: c, alreadyReviewed, onReviewed }) {
  const { t } = useLocale();
  const { reviewCase, loading } = useReviewer();
  const [txHash, setTxHash] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [error, setError] = useState(null);

  const deadline = new Date(c.deadline * 1000).toLocaleDateString();
  const goal = Number(formatEther(c.goalAmount)).toFixed(2);

  const handleReview = async (approve) => {
    setError(null);
    const t0 = Date.now();
    setStartTime(t0);
    try {
      const tx = await reviewCase(c.id, approve);
      setTxHash(tx.hash);
      onReviewed?.();
    } catch (e) {
      setError(e.reason ?? e.message);
      setStartTime(null);
    }
  };

  return (
    <Card className="p-5 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="font-semibold text-gray-900 text-sm truncate">{c.title}</h3>
          <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{c.description}</p>
        </div>
        <span className="text-xs text-gray-400 whitespace-nowrap">#{c.id}</span>
      </div>

      <div className="flex flex-wrap gap-4 text-xs text-gray-500">
        <span>
          {t("case.goal")}:{" "}
          <span className="font-medium text-gray-800">{goal} AVAX</span>
        </span>
        <span>
          {t("case.deadline")}: <span className="font-medium text-gray-800">{deadline}</span>
        </span>
        <span>
          {t("case.milestones")}:{" "}
          <span className="font-medium text-gray-800">{c.milestoneCount}</span>
        </span>
      </div>

      {txHash ? (
        <TxConfirmation txHash={txHash} startTime={startTime} />
      ) : alreadyReviewed ? (
        <p className="text-xs text-gray-400">{t("reviewer.reviewed")} ✓</p>
      ) : (
        <>
          {error && <p className="text-xs text-red-500">{error}</p>}
          {startTime && !txHash && <TxConfirmation startTime={startTime} />}
          <div className="flex gap-2 pt-1">
            <Button
              onClick={() => handleReview(true)}
              disabled={loading}
              size="sm"
              className="flex-1"
            >
              {t("reviewer.approve")}
            </Button>
            <Button
              onClick={() => handleReview(false)}
              disabled={loading}
              variant="danger"
              size="sm"
              className="flex-1"
            >
              {t("reviewer.reject")}
            </Button>
          </div>
        </>
      )}
    </Card>
  );
}
