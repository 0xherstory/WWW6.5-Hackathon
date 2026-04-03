import { useLocale } from "../../hooks/useLocale";
import { useUserRole } from "../../hooks/useUserRole";
import { useWallet } from "../../hooks/useWallet";

export default function RoleIndicator() {
  const { t } = useLocale();
  const { isConnected } = useWallet();
  const { isReviewer, isDonor } = useUserRole();

  if (!isConnected) return null;

  if (isReviewer) {
    return (
      <span className="text-xs px-2 py-0.5 rounded-full font-medium whitespace-nowrap bg-purple-100 text-purple-700">
        {t("role.reviewer")}
      </span>
    );
  }

  if (isDonor) {
    return (
      <span className="text-xs px-2 py-0.5 rounded-full font-medium whitespace-nowrap bg-blue-100 text-blue-700">
        {t("role.donor")}
      </span>
    );
  }

  return null;
}
