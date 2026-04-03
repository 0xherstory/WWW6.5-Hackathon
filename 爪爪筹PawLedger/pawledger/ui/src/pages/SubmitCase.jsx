import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { parseEther } from "ethers";
import { useLocale } from "../hooks/useLocale";
import { useWallet } from "../hooks/useWallet";
import { useContract } from "../hooks/useContract";
import Input from "../components/common/Input";
import Button from "../components/common/Button";
import Card from "../components/common/Card";
import TxConfirmation from "../components/modals/TxConfirmation";
import ImageUpload from "../components/common/ImageUpload";
import { uploadFileToIPFS, hasPinataConfig } from "../utils/uploadToIPFS";

export default function SubmitCase() {
  const { t } = useLocale();
  const { isConnected } = useWallet();
  const { pawLedger } = useContract();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    description: "",
    goal: "",
    duration: "30",
    milestones: "3",
  });
  const [images, setImages] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [txHash, setTxHash] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [txError, setTxError] = useState(null);

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const validate = () => {
    const errs = {};
    if (!form.title.trim()) errs.title = t("common.error");
    if (!form.goal || Number(form.goal) <= 0) errs.goal = t("common.error");
    if (!form.duration || Number(form.duration) < 1) errs.duration = t("common.error");
    if (!form.milestones || Number(form.milestones) < 1) errs.milestones = t("common.error");
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setTxError(null);
    setLoading(true);

    // Upload images to IPFS (Pinata), collect CIDs
    let imageCIDs = [];
    if (images.length > 0 && hasPinataConfig) {
      setUploading(true);
      try {
        imageCIDs = await Promise.all(images.map((f) => uploadFileToIPFS(f)));
        imageCIDs = imageCIDs.filter(Boolean);
      } catch (err) {
        setTxError(t("submit.upload_error"));
        setLoading(false);
        setUploading(false);
        return;
      }
      setUploading(false);
    }

    const metadata = JSON.stringify({
      title: form.title.trim(),
      description: form.description.trim(),
      images: imageCIDs,
    });

    const t0 = Date.now();
    setStartTime(t0);

    try {
      const tx = await pawLedger.submitCase(
        metadata,
        parseEther(form.goal),
        Number(form.duration),
        Number(form.milestones)
      );
      await tx.wait();
      setTxHash(tx.hash);
    } catch (e) {
      setTxError(e.reason ?? e.message);
      setStartTime(null);
    } finally {
      setLoading(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center text-gray-400">
        <p className="text-2xl mb-3">🔗</p>
        <p>{t("submit.connect_first")}</p>
      </div>
    );
  }

  if (txHash) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 space-y-6 text-center">
        <TxConfirmation txHash={txHash} startTime={startTime} />
        <p className="text-sm text-gray-600">{t("submit.success")}</p>
        <Button onClick={() => navigate("/dashboard/rescuer")} className="mx-auto">
          {t("nav.dashboard.rescuer")} →
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">{t("submit.title")}</h1>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label={t("submit.case_title")}
            value={form.title}
            onChange={set("title")}
            placeholder={t("submit.case_title_placeholder")}
            error={errors.title}
          />
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              {t("submit.description")}
            </label>
            <textarea
              value={form.description}
              onChange={set("description")}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
              placeholder={t("submit.description_placeholder")}
            />
          </div>
          <Input
            label={t("submit.goal")}
            type="number"
            step="0.01"
            min="0.01"
            value={form.goal}
            onChange={set("goal")}
            placeholder="1.0"
            error={errors.goal}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label={t("submit.duration")}
              type="number"
              min="1"
              max="365"
              value={form.duration}
              onChange={set("duration")}
              error={errors.duration}
            />
            <Input
              label={t("submit.milestones")}
              type="number"
              min="1"
              max="10"
              value={form.milestones}
              onChange={set("milestones")}
              error={errors.milestones}
            />
          </div>

          <ImageUpload files={images} onChange={setImages} max={5} />

          {!hasPinataConfig && images.length > 0 && (
            <p className="text-xs text-amber-600 bg-amber-50 rounded-lg px-3 py-2">
              ⚠️ {t("submit.upload_no_ipfs")}
            </p>
          )}

          {uploading && (
            <p className="text-xs text-emerald-600 animate-pulse">{t("submit.upload_uploading")}</p>
          )}

          {txError && <p className="text-xs text-red-500">{txError}</p>}
          {startTime && !txHash && <TxConfirmation startTime={startTime} />}

          <Button type="submit" disabled={loading || uploading} className="w-full">
            {uploading ? t("submit.upload_uploading") : loading ? t("tx.pending") : t("submit.submit")}
          </Button>
        </form>
      </Card>
    </div>
  );
}
