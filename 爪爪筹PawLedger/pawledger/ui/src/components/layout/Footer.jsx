import { useLocale } from "../../hooks/useLocale";

export default function Footer() {
  const { t } = useLocale();
  return (
    <footer className="border-t border-gray-100 bg-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-gray-400">
        <span>
          🐾 {t("app.name")} — {t("footer.tagline")}
        </span>
        <div className="flex items-center gap-3">
          <span>{t("footer.built_on")}</span>
          <span>·</span>
          <span>{t("footer.hackathon")}</span>
        </div>
      </div>
    </footer>
  );
}
