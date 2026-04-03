import { useState, useMemo } from "react";
import { useLocale } from "../hooks/useLocale";
import { useCases } from "../hooks/useCases";
import CaseCard from "../components/case/CaseCard";
import Loading from "../components/common/Loading";

const FILTERS = ["ALL", "ACTIVE", "PENDING", "CLOSED", "REFUNDED"];

export default function CaseBrowser() {
  const { t } = useLocale();
  const { cases, loading, error, refresh } = useCases();
  const [activeFilter, setActiveFilter] = useState("ALL");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    return cases.filter((c) => {
      const matchStatus = activeFilter === "ALL" || c.status === activeFilter;
      const matchSearch =
        !search || c.title.toLowerCase().includes(search.toLowerCase());
      return matchStatus && matchSearch;
    });
  }, [cases, activeFilter, search]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">{t("nav.cases")}</h1>
        <p className="text-sm text-gray-500">{t("home.hero.subtitle")}</p>
      </div>

      {/* Search + Filter bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t("nav.cases") + "..."}
          className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
        <div className="flex gap-1 flex-wrap">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                activeFilter === f
                  ? "bg-emerald-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {f === "ALL" ? (t("nav.cases")) : t(`status.${f.toLowerCase()}`)}
            </button>
          ))}
        </div>
      </div>

      {/* Results count */}
      {!loading && (
        <p className="text-xs text-gray-400 mb-4">
          {filtered.length} / {cases.length}
        </p>
      )}

      {/* Content */}
      {loading ? (
        <Loading className="py-20" size="lg" />
      ) : error ? (
        <div className="text-center py-20">
          <p className="text-sm text-red-500 mb-3">{t("common.error")}: {error}</p>
          <button
            onClick={refresh}
            className="text-sm text-emerald-600 hover:underline"
          >
            {t("common.retry")}
          </button>
        </div>
      ) : filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((c) => (
            <CaseCard key={c.id} case={c} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 text-gray-400">
          <div className="text-4xl mb-3">🔍</div>
          <p className="text-sm">{t("case.no_cases")}</p>
        </div>
      )}
    </div>
  );
}
