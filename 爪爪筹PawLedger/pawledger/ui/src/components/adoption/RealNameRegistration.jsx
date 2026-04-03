import { useState } from "react";
import Input from "../common/Input";
import Button from "../common/Button";
import { useLocale } from "../../hooks/useLocale";

export default function RealNameRegistration({ onSubmit, disabled = false }) {
  const { t } = useLocale();
  const [form, setForm] = useState({ name: "", idCard: "", phone: "" });
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (disabled || submitting) return;
    if (!form.name.trim() || !form.idCard.trim() || !form.phone.trim()) return;

    setSubmitError("");
    setSubmitting(true);
    try {
      await onSubmit(form);
      setForm({ name: "", idCard: "", phone: "" });
    } catch (error) {
      setSubmitError(error?.message || t("common.error"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <Input
        label={t("adoption.realname.name")}
        value={form.name}
        onChange={(e) => {
          update("name", e.target.value);
          if (submitError) setSubmitError("");
        }}
        placeholder={t("adoption.realname.name_placeholder")}
      />
      <Input
        label={t("adoption.realname.id_card")}
        value={form.idCard}
        onChange={(e) => {
          update("idCard", e.target.value);
          if (submitError) setSubmitError("");
        }}
        placeholder={t("adoption.realname.id_card_placeholder")}
      />
      <Input
        label={t("adoption.realname.phone")}
        value={form.phone}
        onChange={(e) => {
          update("phone", e.target.value);
          if (submitError) setSubmitError("");
        }}
        placeholder={t("adoption.realname.phone_placeholder")}
      />
      {submitError && <p className="text-sm text-red-500">{submitError}</p>}
      <Button type="submit" disabled={disabled || submitting}>
        {submitting ? t("common.loading") : t("adoption.register_realname")}
      </Button>
    </form>
  );
}
