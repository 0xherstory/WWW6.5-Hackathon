import { Link } from "react-router-dom";
import { useLocale } from "../../hooks/useLocale";
import Card from "../common/Card";
import StatusBadge from "./StatusBadge";
import FundingProgress from "./FundingProgress";

export default function CaseCard({ case: c }) {
  const { t } = useLocale();
  const deadline = new Date(c.deadline * 1000);
  const daysLeft = Math.max(0, Math.ceil((deadline - Date.now()) / 86400000));

  return (
    <Card className="p-5 hover:shadow-md transition-shadow flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 flex-1">{c.title}</h3>
        <StatusBadge status={c.status} />
      </div>

      {c.description && (
        <p className="text-xs text-gray-500 line-clamp-2">{c.description}</p>
      )}

      <FundingProgress raisedAmount={c.raisedAmount} goalAmount={c.goalAmount} />

      <div className="flex items-center justify-between pt-1">
        <span className="text-xs text-gray-400">
          {daysLeft > 0 ? `${daysLeft} ${t("common.days_left")}` : t("common.expired")}
        </span>
        <Link
          to={`/case/${c.id}`}
          className="text-xs text-emerald-600 hover:text-emerald-700 font-medium"
        >
          {t("case.view_detail")} →
        </Link>
      </div>
    </Card>
  );
}
