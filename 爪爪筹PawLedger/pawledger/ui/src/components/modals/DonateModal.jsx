import { useState } from "react";
import { useLocale } from "../../hooks/useLocale";
import { useDonor } from "../../hooks/useDonor";
import Modal from "../common/Modal";
import Button from "../common/Button";
import Input from "../common/Input";
import TxConfirmation from "./TxConfirmation";

export default function DonateModal({ caseId, open, onClose, onSuccess }) {
  const { t } = useLocale();
  const { donate, loading } = useDonor();
  const [amount, setAmount] = useState("");
  const [txHash, setTxHash] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [error, setError] = useState(null);

  const handleDonate = async () => {
    const val = parseFloat(amount);
    if (!val || val <= 0) return;
    setError(null);
    const t0 = Date.now();
    setStartTime(t0);
    try {
      const tx = await donate(caseId, amount);
      setTxHash(tx.hash);
      onSuccess?.();
    } catch (e) {
      setError(e.reason ?? e.message);
      setStartTime(null);
    }
  };

  const handleClose = () => {
    setAmount("");
    setTxHash(null);
    setStartTime(null);
    setError(null);
    onClose();
  };

  return (
    <Modal open={open} onClose={handleClose} title={t("donate.title")}>
      <div className="space-y-4">
        {!txHash ? (
          <>
            <Input
              label={t("donate.amount")}
              type="number"
              step="0.01"
              min="0.001"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.1"
              error={error}
            />
            {startTime && !txHash && <TxConfirmation startTime={startTime} />}
            <div className="flex gap-2 pt-1">
              <Button onClick={handleClose} variant="secondary" className="flex-1">
                {t("common.cancel")}
              </Button>
              <Button
                onClick={handleDonate}
                disabled={loading || !amount}
                className="flex-1"
              >
                {loading ? t("tx.pending") : t("donate.confirm")}
              </Button>
            </div>
          </>
        ) : (
          <>
            <TxConfirmation txHash={txHash} startTime={startTime} />
            <Button onClick={handleClose} variant="secondary" className="w-full">
              {t("common.close")}
            </Button>
          </>
        )}
      </div>
    </Modal>
  );
}
