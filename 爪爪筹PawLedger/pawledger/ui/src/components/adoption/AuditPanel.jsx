import { useLocale } from "../../hooks/useLocale";
import ApplicationCard from "./ApplicationCard";

export default function AuditPanel({ applications, onApprove, onReject }) {
  const { t } = useLocale();

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-gray-900">{t("adoption.applications")}</h3>
      {applications.length === 0 ? (
        <p className="text-sm text-gray-400">{t("adoption.no_applications")}</p>
      ) : (
        applications.map((item) => (
          <ApplicationCard
            key={item.applyId}
            item={item}
            canAudit
            onApprove={onApprove}
            onReject={onReject}
          />
        ))
      )}
    </div>
  );
}
