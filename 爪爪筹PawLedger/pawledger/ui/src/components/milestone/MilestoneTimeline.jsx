import { formatEther } from "ethers";
import { useLocale } from "../../hooks/useLocale";
import StatusBadge from "../case/StatusBadge";
import VotePanel from "./VotePanel";
import Loading from "../common/Loading";

const STATUS_ICON = {
  PENDING: "⏳",
  APPROVED: "✅",
  REJECTED: "❌",
};

export default function MilestoneTimeline({ caseId, milestones, loading, raisedAmount, onUpdate }) {
  const { t } = useLocale();

  if (loading) return <Loading className="py-8" />;

  if (!milestones || milestones.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400 text-sm">
        {t("milestone.no_records")}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {milestones.map((m) => (
        <div key={m.idx} className="relative pl-8">
          {/* Timeline spine */}
          <div className="absolute left-2.5 top-0 bottom-0 w-0.5 bg-gray-100" />
          {/* Timeline dot */}
          <div className="absolute left-0 top-1 w-5 h-5 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center text-xs">
            {STATUS_ICON[m.status] ?? "●"}
          </div>

          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {t("milestone.title")} #{m.idx + 1}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">{m.description}</p>
              </div>
              <StatusBadge status={m.status} milestoneStatus />
            </div>

            <div className="flex flex-wrap gap-4 text-xs text-gray-500">
              <span>
                {t("milestone.request_amount")}:{" "}
                <span className="font-medium text-gray-900">
                  {Number(formatEther(m.requestAmount)).toFixed(4)} AVAX
                </span>
              </span>
              {m.submittedAt > 0 && (
                <span>
                  {new Date(m.submittedAt * 1000).toLocaleDateString()}
                </span>
              )}
              {m.fundsReleased && (
                <span className="text-emerald-600 font-medium">
                  {t("milestone.funds_released")}
                </span>
              )}
            </div>

            {m.evidenceIPFS && (
              <p className="text-xs text-gray-400 truncate">
                {t("milestone.evidence")}: <span className="font-mono">{m.evidenceIPFS}</span>
              </p>
            )}

            <VotePanel
              caseId={caseId}
              milestoneIdx={m.idx}
              milestone={m}
              raisedAmount={raisedAmount}
              onVoted={onUpdate}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
