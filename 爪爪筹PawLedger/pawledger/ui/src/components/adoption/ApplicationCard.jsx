import Button from "../common/Button";
import { useLocale } from "../../hooks/useLocale";

const STATUS_KEYS = {
  0: "adoption.application_status.pending",
  1: "adoption.application_status.approved",
  2: "adoption.application_status.rejected",
};

export default function ApplicationCard({ item, canAudit = false, onApprove, onReject }) {
  const { t } = useLocale();

  return (
    <div className="border border-gray-200 rounded-lg p-3 bg-white">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-gray-500 font-mono truncate">{item.adopter}</p>
        <span
          className={`text-xs px-2 py-1 rounded-full ${
            item.status === 0
              ? "bg-amber-100 text-amber-700"
              : item.status === 1
              ? "bg-emerald-100 text-emerald-700"
              : "bg-rose-100 text-rose-700"
          }`}
        >
          {t(STATUS_KEYS[item.status] || STATUS_KEYS[0])}
        </span>
      </div>

      <p className="text-sm text-gray-700 mt-2 whitespace-pre-wrap">{item.applyMessage}</p>

      {canAudit && item.status === 0 && (
        <div className="flex gap-2 mt-3">
          <Button size="sm" onClick={() => onApprove?.(item.applyId)}>
            {t("adoption.audit_approve")}
          </Button>
          <Button size="sm" variant="danger" onClick={() => onReject?.(item.applyId)}>
            {t("adoption.audit_reject")}
          </Button>
        </div>
      )}
    </div>
  );
}
