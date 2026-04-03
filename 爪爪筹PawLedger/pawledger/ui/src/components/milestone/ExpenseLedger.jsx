import { useState, useEffect } from "react";
import { formatEther } from "ethers";
import { useContract } from "../../hooks/useContract";
import { useLocale } from "../../hooks/useLocale";
import { NETWORK } from "../../config";
import Loading from "../common/Loading";

export default function ExpenseLedger({ caseId }) {
  const { t } = useLocale();
  const { pawLedger } = useContract();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!pawLedger || caseId == null) return;
    setLoading(true);
    pawLedger
      .queryFilter(pawLedger.filters.MilestoneWithdrawn(caseId))
      .then((logs) => {
        const parsed = logs.map((log) => ({
          txHash: log.transactionHash,
          blockNumber: log.blockNumber,
          idx: Number(log.args.idx),
          amount: log.args.amount,
        }));
        setEvents(parsed.sort((a, b) => a.blockNumber - b.blockNumber));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [pawLedger, caseId]);

  if (loading) return <Loading className="py-6" />;

  if (events.length === 0) {
    return (
      <p className="text-sm text-gray-400 text-center py-4">
        {t("ledger.no_records")}
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {events.map((ev) => (
        <div key={ev.txHash} className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-emerald-500 rounded-full flex-shrink-0" />
            <div>
              <p className="text-gray-800 font-medium">
                {t("milestone.title")} #{ev.idx + 1} — {t("milestone.withdraw")}
              </p>
              <a
                href={`${NETWORK.blockExplorer}/tx/${ev.txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-gray-400 hover:text-emerald-600 font-mono"
              >
                {ev.txHash.slice(0, 10)}…
              </a>
            </div>
          </div>
          <span className="font-medium text-gray-900">
            -{Number(formatEther(ev.amount)).toFixed(4)} AVAX
          </span>
        </div>
      ))}
    </div>
  );
}
