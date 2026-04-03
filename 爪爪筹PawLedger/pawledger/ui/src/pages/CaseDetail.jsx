import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { formatEther } from "ethers";
import { useLocale } from "../hooks/useLocale";
import { useWallet } from "../hooks/useWallet";
import { useCases } from "../hooks/useCases";
import { useMilestones } from "../hooks/useMilestones";
import StatusBadge from "../components/case/StatusBadge";
import FundingProgress from "../components/case/FundingProgress";
import MilestoneTimeline from "../components/milestone/MilestoneTimeline";
import ExpenseLedger from "../components/milestone/ExpenseLedger";
import DonateModal from "../components/modals/DonateModal";
import Button from "../components/common/Button";
import Loading from "../components/common/Loading";
import Card from "../components/common/Card";

export default function CaseDetail() {
  const { id } = useParams();
  const { t } = useLocale();
  const { isConnected } = useWallet();
  const { getCase } = useCases();
  const [caseData, setCaseData] = useState(null);
  const [loadingCase, setLoadingCase] = useState(true);
  const [donateOpen, setDonateOpen] = useState(false);

  const { milestones, loading: loadingMilestones, refresh: refreshMilestones } = useMilestones(Number(id));

  useEffect(() => {
    setLoadingCase(true);
    getCase(id)
      .then(setCaseData)
      .catch(console.error)
      .finally(() => setLoadingCase(false));
  }, [id, getCase]);

  const handleDonateSuccess = () => {
    setDonateOpen(false);
    getCase(id).then(setCaseData);
  };

  if (loadingCase) return <Loading className="py-24" size="lg" />;

  if (!caseData) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center text-gray-400">
        <p>{t("common.error")}</p>
        <Link to="/cases" className="text-sm text-emerald-600 hover:underline mt-2 inline-block">
          ← {t("nav.cases")}
        </Link>
      </div>
    );
  }

  const deadline = new Date(caseData.deadline * 1000);
  const daysLeft = Math.max(0, Math.ceil((deadline - Date.now()) / 86400000));
  const canDonate = isConnected && caseData.status === "ACTIVE" && daysLeft > 0;

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 space-y-6">
      {/* Back */}
      <Link to="/cases" className="text-sm text-gray-400 hover:text-gray-600">
        ← {t("nav.cases")}
      </Link>

      {/* Header */}
      <div className="space-y-3">
        <div className="flex items-start gap-3">
          <h1 className="text-2xl font-bold text-gray-900 flex-1">{caseData.title}</h1>
          <StatusBadge status={caseData.status} />
        </div>
        {caseData.description && (
          <p className="text-gray-600 leading-relaxed">{caseData.description}</p>
        )}
        <p className="text-xs text-gray-400 font-mono truncate">
          {t("case.rescuer")}: {caseData.rescuer}
        </p>
      </div>

      {/* Funding card */}
      <Card className="p-5 space-y-4">
        <FundingProgress raisedAmount={caseData.raisedAmount} goalAmount={caseData.goalAmount} />
        <div className="flex flex-wrap gap-4 text-xs text-gray-500">
          <span>
            {t("case.deadline")}:{" "}
            <span className="font-medium text-gray-800">{deadline.toLocaleDateString()}</span>
            {daysLeft > 0 ? ` (${daysLeft} ${t("common.days_left")})` : ` (${t("common.expired")})`}
          </span>
          <span>
            {t("case.milestones")}:{" "}
            <span className="font-medium text-gray-800">{caseData.milestoneCount}</span>
          </span>
          <span>
            {t("case.approval_count")}:{" "}
            <span className="font-medium text-gray-800">{caseData.approvalCount}</span>
          </span>
        </div>
        {canDonate ? (
          <Button onClick={() => setDonateOpen(true)} className="w-full">
            {t("case.donate")}
          </Button>
        ) : !isConnected ? (
          <p className="text-xs text-gray-400 text-center">{t("common.connect_wallet")}</p>
        ) : null}
      </Card>

      {/* Milestones */}
      <section>
        <h2 className="text-base font-semibold text-gray-900 mb-4">{t("milestone.title")}</h2>
        <MilestoneTimeline
          caseId={Number(id)}
          milestones={milestones}
          loading={loadingMilestones}
          raisedAmount={caseData.raisedAmount}
          onUpdate={refreshMilestones}
        />
      </section>

      {/* Expense Ledger */}
      <section>
        <h2 className="text-base font-semibold text-gray-900 mb-3">{t("case.expense_ledger")}</h2>
        <Card className="p-4">
          <ExpenseLedger caseId={Number(id)} />
        </Card>
      </section>

      <DonateModal
        caseId={Number(id)}
        open={donateOpen}
        onClose={() => setDonateOpen(false)}
        onSuccess={handleDonateSuccess}
      />
    </div>
  );
}
