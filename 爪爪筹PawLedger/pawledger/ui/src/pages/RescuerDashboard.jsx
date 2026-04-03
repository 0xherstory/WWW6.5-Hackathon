import { useState } from "react";
import { Link } from "react-router-dom";
import { formatEther, parseEther } from "ethers";
import { useLocale } from "../hooks/useLocale";
import { useWallet } from "../hooks/useWallet";
import { useCases } from "../hooks/useCases";
import { useMilestones } from "../hooks/useMilestones";
import StatusBadge from "../components/case/StatusBadge";
import FundingProgress from "../components/case/FundingProgress";
import Button from "../components/common/Button";
import Card from "../components/common/Card";
import Input from "../components/common/Input";
import Loading from "../components/common/Loading";
import TxConfirmation from "../components/modals/TxConfirmation";

// Sub-component: milestone actions for a single case
function MilestoneActions({ caseData }) {
  const { t } = useLocale();
  const { milestones, loading, submitMilestone, withdrawMilestone } = useMilestones(caseData.id);
  const [submitForm, setSubmitForm] = useState({ desc: "", amount: "" });
  const [txState, setTxState] = useState(null); // { hash, startTime }
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  // Next milestone index to submit
  const nextIdx = milestones.length === 0
    ? 0
    : milestones[milestones.length - 1].status === "REJECTED"
      ? milestones.length - 1
      : milestones.length;
  const allSubmitted = nextIdx >= caseData.milestoneCount;

  // Approved but not yet withdrawn
  const withdrawable = milestones.filter((m) => m.status === "APPROVED" && !m.fundsReleased);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    const t0 = Date.now();
    setTxState({ startTime: t0 });
    try {
      const tx = await submitMilestone(
        nextIdx,
        "QmMockEvidence000000000000000000000000000000000",
        submitForm.desc,
        parseEther(submitForm.amount)
      );
      setTxState({ hash: tx.hash, startTime: t0 });
      setSubmitForm({ desc: "", amount: "" });
    } catch (e) {
      setError(e.reason ?? e.message);
      setTxState(null);
    } finally {
      setBusy(false);
    }
  };

  const handleWithdraw = async (idx) => {
    setError(null);
    setBusy(true);
    const t0 = Date.now();
    setTxState({ startTime: t0 });
    try {
      const tx = await withdrawMilestone(idx);
      setTxState({ hash: tx.hash, startTime: t0 });
    } catch (e) {
      setError(e.reason ?? e.message);
      setTxState(null);
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <Loading className="py-4" />;

  return (
    <div className="mt-3 space-y-3 border-t border-gray-50 pt-3">
      {/* Withdraw approved milestones */}
      {withdrawable.map((m) => (
        <div key={m.idx} className="flex items-center justify-between text-sm">
          <span className="text-gray-600">
            {t("milestone.title")} #{m.idx + 1} — {Number(formatEther(m.requestAmount)).toFixed(4)} AVAX
          </span>
          <Button onClick={() => handleWithdraw(m.idx)} disabled={busy} size="sm">
            {t("rescuer.withdraw")}
          </Button>
        </div>
      ))}

      {/* Submit next milestone */}
      {caseData.status === "ACTIVE" && !allSubmitted && (
        <form onSubmit={handleSubmit} className="space-y-2">
          <p className="text-xs font-medium text-gray-600">
            {t("rescuer.submit_milestone")} #{nextIdx + 1}
          </p>
          <Input
            placeholder={t("rescuer.milestone_desc_placeholder")}
            value={submitForm.desc}
            onChange={(e) => setSubmitForm((f) => ({ ...f, desc: e.target.value }))}
          />
          <Input
            type="number"
            step="0.001"
            min="0.001"
            placeholder={t("rescuer.milestone_amount_placeholder")}
            value={submitForm.amount}
            onChange={(e) => setSubmitForm((f) => ({ ...f, amount: e.target.value }))}
          />
          {error && <p className="text-xs text-red-500">{error}</p>}
          {txState && <TxConfirmation txHash={txState.hash} startTime={txState.startTime} />}
          <Button type="submit" disabled={busy} size="sm" className="w-full">
            {busy ? t("tx.pending") : t("common.submit")}
          </Button>
        </form>
      )}
    </div>
  );
}

export default function RescuerDashboard() {
  const { t } = useLocale();
  const { account, isConnected } = useWallet();
  const { cases, loading } = useCases();

  if (!isConnected) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center text-gray-400">
        <p className="text-2xl mb-3">🔗</p>
        <p>{t("common.connect_wallet")}</p>
      </div>
    );
  }

  const myCases = cases.filter(
    (c) => c.rescuer?.toLowerCase() === account?.toLowerCase()
  );

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{t("rescuer.title")}</h1>
        <Link to="/submit">
          <Button size="sm">{t("nav.submit")}</Button>
        </Link>
      </div>

      {loading ? (
        <Loading className="py-16" />
      ) : myCases.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">🐾</p>
          <p className="text-sm">{t("rescuer.no_cases")}</p>
          <Link to="/submit" className="text-emerald-600 text-sm hover:underline mt-2 inline-block">
            {t("nav.submit")} →
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {myCases.map((c) => (
            <Card key={c.id} className="p-5">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-gray-900 text-sm truncate">{c.title}</h3>
                    <StatusBadge status={c.status} />
                  </div>
                  <FundingProgress raisedAmount={c.raisedAmount} goalAmount={c.goalAmount} />
                </div>
                <Link
                  to={`/case/${c.id}`}
                  className="text-xs text-emerald-600 hover:underline whitespace-nowrap"
                >
                  {t("case.view_detail")} →
                </Link>
              </div>
              {(c.status === "ACTIVE" || c.status === "CLOSED") && (
                <MilestoneActions caseData={c} />
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
