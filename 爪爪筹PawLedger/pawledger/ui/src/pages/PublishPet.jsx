import { useState } from "react";
import { useLocale } from "../hooks/useLocale";
import { usePublisher } from "../hooks/usePublisher";
import Input from "../components/common/Input";
import Button from "../components/common/Button";

export default function PublishPet() {
  const { t } = useLocale();
  const { publishPet, loading } = usePublisher();
  const [form, setForm] = useState({
    petName: "",
    breed: "",
    age: "",
    description: "",
    imageUrl: "",
  });
  const [status, setStatus] = useState({ type: "", message: "" });

  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const submit = async (e) => {
    e.preventDefault();
    setStatus({ type: "", message: "" });
    try {
      await publishPet(form);
      setStatus({ type: "ok", message: t("adoption.publish_success") });
      setForm({ petName: "", breed: "", age: "", description: "", imageUrl: "" });
    } catch (e2) {
      setStatus({ type: "error", message: e2.message || t("common.error") });
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">{t("adoption.publish.title")}</h1>

      <form onSubmit={submit} className="bg-white border border-gray-100 rounded-xl p-5 space-y-4">
        <Input
          label={t("adoption.pet_name")}
          value={form.petName}
          onChange={(e) => update("petName", e.target.value)}
          required
        />
        <Input
          label={t("adoption.breed")}
          value={form.breed}
          onChange={(e) => update("breed", e.target.value)}
          required
        />
        <Input
          label={t("adoption.age")}
          type="number"
          min="0"
          value={form.age}
          onChange={(e) => update("age", e.target.value)}
          required
        />

        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">{t("adoption.description")}</label>
          <textarea
            value={form.description}
            onChange={(e) => update("description", e.target.value)}
            rows={5}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <Input
          label={t("adoption.image")}
          value={form.imageUrl}
          onChange={(e) => update("imageUrl", e.target.value)}
          placeholder="https://..."
        />

        <Button type="submit" disabled={loading}>
          {loading ? t("common.loading") : t("adoption.publish")}
        </Button>

        {status.message && (
          <p className={`text-sm ${status.type === "ok" ? "text-emerald-600" : "text-red-500"}`}>
            {status.message}
          </p>
        )}
      </form>
    </div>
  );
}
