import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { formatEther } from "ethers";
import { useLocale } from "../hooks/useLocale";
import { useWallet } from "../hooks/useWallet";
import { useCases } from "../hooks/useCases";
import { useDonor } from "../hooks/useDonor";
import { useUserRole } from "../hooks/useUserRole";
import Button from "../components/common/Button";
import Card from "../components/common/Card";
import Loading from "../components/common/Loading";
import TxConfirmation from "../components/modals/TxConfirmation";

export default function DonorDashboard() {
  const { t } = useLocale();
  const { account, isConnected } = useWallet();
  const { cases, loading: loadingCases } = useCases();
  const { getDonationAmount, claimRefund, becomeReviewer, loading } = useDonor();
  const { isReviewer, canBecomeReviewer, totalDonated, reviewerThreshold } = useUserRole();

  const [myDonations, setMyDonations] = useState([]); // [{ caseId, amount, caseData }]
  const [loadingDonations, setLoadingDonations] = useState(false);
  const [reviewerTx, setReviewerTx] = useState(null);
  const [reviewerStartTime, setReviewerStartTime] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!account || cases.length === 0) return;
    setLoadingDonations(true);
    Promise.all(cases.map((c) => getDonationAmount(c.id)))
      .then((amounts) => {
        const donated = cases
          .map((c, i) => ({ ...c, donated: amounts[i] }))
          .filter((c) => c.donated > 0n);
        setMyDonations(donated);
      })
      .catch(console.error)
      .finally(() => setLoadingDonations(false));
  }, [account, cases, getDonationAmount]);

  const handleBecomeReviewer = async () => {
    setError(null);
    const t0 = Date.now();
    setReviewerStartTime(t0);
    try {
      const tx = await becomeReviewer();
      setReviewerTx(tx.hash);
    } catch (e) {
      setError(e.reason ?? e.message);
      setReviewerStartTime(null);
    }
  };

  const handleClaimRefund = async (caseId) => {
    try {
      await claimRefund(caseId);
    } catch (e) {
      console.error(e);
    }
  };

  if (!isConnected) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center text-gray-400">
        <p className="text-2xl mb-3">🔗</p>
        <p>{t("common.connect_wallet")}</p>
      </div>
    );
  }

  const totalDonatedEther = totalDonated > 0n
    ? Number(formatEther(totalDonated)).toFixed(4)
    : "0";
  const thresholdEther = reviewerThreshold > 0n
    ? Number(formatEther(reviewerThreshold)).toFixed(2)
    : "0.1";

  // Cases where user donated and can claim refund
  const refundable = myDonations.filter(
    (c) => c.status === "REFUNDED" && c.donated > 0n
  );

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 space-y-8">
      <h1 className="text-2xl font-bold text-gray-900">{t("donor.title")}</h1>

      {/* Summary stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="p-4 text-center">
          <p className="text-2xl font-bold text-emerald-600">{totalDonatedEther}</p>
          <p className="text-xs text-gray-500 mt-1">{t("donor.total_donated")} (AVAX)</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-2xl font-bold text-gray-900">{myDonations.length}</p>
          <p className="text-xs text-gray-500 mt-1">{t("donor.my_donations")}</p>
        </Card>
      </div>

      {/* Become Reviewer */}
      {!isReviewer && (
        <Card className="p-5 bg-purple-50 border-purple-100">
          <h2 className="font-semibold text-gray-900 text-sm mb-1">
            {t("donor.become_reviewer")}
          </h2>
          <p className="text-xs text-gray-500 mb-3">{t("donor.become_reviewer_desc")}</p>
          <div className="w-full h-2 bg-purple-100 rounded-full mb-3">
            <div
              className="h-full bg-purple-500 rounded-full transition-all"
              style={{
                width: reviewerThreshold > 0n
                  ? `${Math.min(100, Number((totalDonated * 100n) / reviewerThreshold))}%`
                  : "0%",
              }}
            />
          </div>
          <p className="text-xs text-gray-400 mb-3">
            {totalDonatedEther} / {thresholdEther} AVAX
          </p>
          {reviewerTx ? (
            <TxConfirmation txHash={reviewerTx} startTime={reviewerStartTime} />
          ) : (
            <>
              {error && <p className="text-xs text-red-500 mb-2">{error}</p>}
              {reviewerStartTime && !reviewerTx && (
                <TxConfirmation startTime={reviewerStartTime} />
              )}
              <Button
                onClick={handleBecomeReviewer}
                disabled={!canBecomeReviewer || loading}
                size="sm"
                variant={canBecomeReviewer ? "primary" : "secondary"}
              >
                {t("role.become_reviewer")}
              </Button>
            </>
          )}
        </Card>
      )}

      {/* My Donations */}
      <section>
        <h2 className="text-base font-semibold text-gray-900 mb-3">{t("donor.my_donations")}</h2>
        {loadingCases || loadingDonations ? (
          <Loading className="py-8" />
        ) : myDonations.length === 0 ? (
          <div className="text-center py-10 text-gray-400">
            <p className="text-3xl mb-2">🌱</p>
            <p className="text-sm">{t("donor.no_donations")}</p>
            <Link to="/cases" className="text-emerald-600 text-sm hover:underline mt-1 inline-block">
              {t("nav.cases")} →
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {myDonations.map((c) => (
              <Card key={c.id} className="p-4 flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{c.title}</p>
                  <p className="text-xs text-gray-400">
                    {Number(formatEther(c.donated)).toFixed(4)} AVAX
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Link
                    to={`/case/${c.id}`}
                    className="text-xs text-emerald-600 hover:underline"
                  >
                    {t("case.view_detail")}
                  </Link>
                  {c.status === "REFUNDED" && (
                    <Button
                      onClick={() => handleClaimRefund(c.id)}
                      disabled={loading}
                      size="sm"
                      variant="outline"
                    >
                      {t("donor.refund")}
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Pending milestones to vote — link to case detail */}
      {myDonations.filter((c) => c.status === "ACTIVE").length > 0 && (
        <section>
          <h2 className="text-base font-semibold text-gray-900 mb-3">
            {t("donor.pending_votes")}
          </h2>
          <div className="space-y-2">
            {myDonations
              .filter((c) => c.status === "ACTIVE")
              .map((c) => (
                <Card key={c.id} className="p-4 flex items-center justify-between">
                  <p className="text-sm text-gray-700">{c.title}</p>
                  <Link to={`/case/${c.id}`}>
                    <Button size="sm" variant="outline">
                      {t("case.view_detail")} →
                    </Button>
                  </Link>
                </Card>
              ))}
          </div>
        </section>
      )}
    </div>
  );
}
