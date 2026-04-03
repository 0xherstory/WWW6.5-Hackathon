import { useMemo, useState } from "react";
import { useLocale } from "../hooks/useLocale";
import { useAdoption } from "../hooks/useAdoption";
import PetCard from "../components/adoption/PetCard";
import Loading from "../components/common/Loading";

const FILTERS = ["ALL", "AVAILABLE", "ADOPTED"];

export default function AdoptionBrowser() {
  const { t } = useLocale();
  const { pets, loading, error, refresh } = useAdoption();
  const [activeFilter, setActiveFilter] = useState("ALL");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    return pets.filter((pet) => {
      const matchFilter =
        activeFilter === "ALL" ||
        (activeFilter === "AVAILABLE" && !pet.isAdopted) ||
        (activeFilter === "ADOPTED" && pet.isAdopted);
      const value = `${pet.petName} ${pet.breed}`.toLowerCase();
      const matchSearch = !search || value.includes(search.toLowerCase());
      return matchFilter && matchSearch;
    });
  }, [pets, activeFilter, search]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">{t("adoption.browse.title")}</h1>
        <p className="text-sm text-gray-500">{t("adoption.hero.subtitle")}</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t("adoption.search_placeholder")}
          className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
        <div className="flex gap-1 flex-wrap">
          {FILTERS.map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                activeFilter === filter
                  ? "bg-emerald-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {t(`adoption.filter.${filter.toLowerCase()}`)}
            </button>
          ))}
        </div>
      </div>

      {!loading && (
        <p className="text-xs text-gray-400 mb-4">
          {filtered.length} / {pets.length}
        </p>
      )}

      {loading ? (
        <Loading className="py-20" size="lg" />
      ) : error ? (
        <div className="text-center py-20">
          <p className="text-sm text-red-500 mb-3">{t("common.error")}: {error}</p>
          <button onClick={refresh} className="text-sm text-emerald-600 hover:underline">
            {t("common.retry")}
          </button>
        </div>
      ) : filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((pet) => (
            <PetCard key={pet.petId} pet={pet} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 text-gray-400">
          <div className="text-4xl mb-3">🐾</div>
          <p className="text-sm">{t("adoption.empty")}</p>
        </div>
      )}
    </div>
  );
}
