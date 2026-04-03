import { useLocale } from "../../hooks/useLocale";

const COLORS = {
  PENDING: "bg-yellow-100 text-yellow-700",
  ACTIVE: "bg-emerald-100 text-emerald-700",
  CLOSED: "bg-gray-100 text-gray-600",
  REFUNDED: "bg-red-100 text-red-600",
};

export default function StatusBadge({ status }) {
  const { t } = useLocale();
  return (
    <span
      className={`text-xs px-2 py-0.5 rounded-full font-medium whitespace-nowrap ${COLORS[status] ?? "bg-gray-100 text-gray-600"}`}
    >
      {t(`status.${status?.toLowerCase()}`)}
    </span>
  );
}
