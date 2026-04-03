import { useState } from "react";
import Button from "../common/Button";
import { useLocale } from "../../hooks/useLocale";

export default function ApplicationForm({ onSubmit, disabled }) {
  const { t } = useLocale();
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim() || disabled || submitting) return;

    setSubmitError("");
    setSubmitting(true);
    try {
      await onSubmit(message.trim());
      setMessage("");
    } catch (error) {
      const nextError = error?.message || t("common.error");
      setSubmitError(nextError);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">
        {t("adoption.apply_message")}
      </label>
      <textarea
        value={message}
        onChange={(e) => {
          setMessage(e.target.value);
          if (submitError) setSubmitError("");
        }}
        rows={4}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
        placeholder={t("adoption.apply_message_placeholder")}
      />
      {submitError && <p className="text-sm text-red-500">{submitError}</p>}
      <Button type="submit" disabled={disabled || submitting || !message.trim()}>
        {submitting ? t("common.loading") : t("adoption.apply")}
      </Button>
    </form>
  );
}
