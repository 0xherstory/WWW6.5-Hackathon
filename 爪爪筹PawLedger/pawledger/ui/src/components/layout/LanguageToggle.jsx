import { useLocale } from "../../hooks/useLocale";

export default function LanguageToggle() {
  const { lang, toggle } = useLocale();
  return (
    <button
      onClick={toggle}
      className="text-sm text-gray-500 hover:text-gray-800 transition-colors font-medium px-2 py-1 rounded hover:bg-gray-100"
    >
      {lang === "zh" ? "EN" : "中"}
    </button>
  );
}
