import { useState, useEffect } from "react";
import { formatEther } from "ethers";
import { useLocale } from "../hooks/useLocale";
import { useWallet } from "../hooks/useWallet";
import { useUserRole } from "../hooks/useUserRole";
import { useCases } from "../hooks/useCases";
import { useReviewer } from "../hooks/useReviewer";
import ReviewCard from "../components/review/ReviewCard";
import Card from "../components/common/Card";
import Loading from "../components/common/Loading";

export default function ReviewerDashboard() {
  const { t } = useLocale();
  const { account, isConnected } = useWallet();
  const { isReviewer, reviewerThreshold } = useUserRole();
  const { cases, loading: loadingCases, refresh } = useCases();
  const { pawBalance, checkReviewed } = useReviewer();
  const [reviewedMap, setReviewedMap] = useState({});

  const pendingCases = cases.filter((c) => c.status === "PENDING");

  // Pre-fetch hasReviewed for all pending cases
  useEffect(() => {
    if (!account || pendingCases.length === 0) return;
    Promise.all(pendingCases.map((c) => checkReviewed(c.id))).then((results) => {
      const map = {};
      pendingCases.forEach((c, i) => { map[c.id] = results[i]; });
      setReviewedMap(map);
    });
  }, [account, pendingCases.length, checkReviewed]);

  if (!isConnected) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center text-gray-400">
        <p className="text-2xl mb-3">🔗</p>
        <p>{t("common.connect_wallet")}</p>
      </div>
    );
  }

  if (!isReviewer) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center text-gray-400">
        <p className="text-4xl mb-3">🔒</p>
        <p className="text-sm">{t("reviewer.access_denied")}</p>
        <p className="text-xs mt-1">
          {t("reviewer.min_donation_prefix")}{" "}
          {Number(formatEther(reviewerThreshold ?? 0n)).toFixed(2)}{" "}
          {t("reviewer.min_donation_suffix")}
        </p>
      </div>
    );
  }

  const pawFormatted = Number(formatEther(pawBalance)).toFixed(2);

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-gray-900">{t("reviewer.title")}</h1>
        <Card className="px-4 py-2 text-center">
          <p className="text-lg font-bold text-purple-600">{pawFormatted}</p>
          <p className="text-xs text-gray-400">{t("reviewer.paw_balance")}</p>
        </Card>
      </div>

      <section>
        <h2 className="text-base font-semibold text-gray-900 mb-4">
          {t("reviewer.pending_queue")}
          {pendingCases.length > 0 && (
            <span className="ml-2 text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-medium">
              {pendingCases.length}
            </span>
          )}
        </h2>

        {loadingCases ? (
          <Loading className="py-12" />
        ) : pendingCases.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-4xl mb-3">✅</p>
            <p className="text-sm">{t("reviewer.no_pending")}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingCases.map((c) => (
              <ReviewCard
                key={c.id}
                case={c}
                alreadyReviewed={reviewedMap[c.id] ?? false}
                onReviewed={() => {
                  setReviewedMap((m) => ({ ...m, [c.id]: true }));
                  refresh();
                }}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
