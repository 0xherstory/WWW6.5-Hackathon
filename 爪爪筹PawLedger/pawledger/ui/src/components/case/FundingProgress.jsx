import { formatEther } from "ethers";
import { useLocale } from "../../hooks/useLocale";

export default function FundingProgress({ raisedAmount, goalAmount }) {
  const { t } = useLocale();
  const raised = Number(formatEther(raisedAmount ?? 0n));
  const goal = Number(formatEther(goalAmount ?? 0n));
  const pct = goal > 0 ? Math.min(100, Math.round((raised / goal) * 100)) : 0;

  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-xs text-gray-500">
        <span>
          {t("case.raised")}:{" "}
          <span className="font-medium text-gray-900">{raised.toFixed(4)} AVAX</span>
        </span>
        <span className="font-medium text-gray-700">{pct}%</span>
      </div>
      <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-emerald-500 rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="text-xs text-gray-400">
        {t("case.goal")}: {goal.toFixed(4)} AVAX
      </p>
    </div>
  );
}
