import { useLocale } from "../../hooks/useLocale";
import { NETWORK } from "../../config";

export default function TxConfirmation({ txHash, startTime }) {
  const { t } = useLocale();
  const elapsed = txHash && startTime
    ? ((Date.now() - startTime) / 1000).toFixed(1)
    : null;

  return (
    <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4">
      {elapsed ? (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-emerald-700 font-medium text-sm">
            <span>✅</span>
            <span>{t("tx.confirmed_in").replace("{time}", elapsed)}</span>
          </div>
          {txHash && (
            <a
              href={`${NETWORK.blockExplorer}/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-emerald-600 hover:underline"
            >
              {t("tx.view_explorer")} ↗
            </a>
          )}
        </div>
      ) : (
        <div className="flex items-center gap-2 text-gray-500 text-sm">
          <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <span>{t("tx.pending")}</span>
        </div>
      )}
    </div>
  );
}
