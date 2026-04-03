import { Link } from "react-router-dom";
import { formatEther } from "ethers";
import { useLocale } from "../hooks/useLocale";
import { useWallet } from "../hooks/useWallet";
import { useCases } from "../hooks/useCases";
import { useAdoption } from "../hooks/useAdoption";
import CaseCard from "../components/case/CaseCard";
import PetCard from "../components/adoption/PetCard";
import Loading from "../components/common/Loading";

const HOW_STEPS = [
  { icon: "🔗", step: "01", titleKey: "home.how.step1.title", descKey: "home.how.step1.desc" },
  { icon: "🎭", step: "02", titleKey: "home.how.step2.title", descKey: "home.how.step2.desc" },
  { icon: "🔍", step: "03", titleKey: "home.how.step3.title", descKey: "home.how.step3.desc" },
];

export default function Home() {
  const { t } = useLocale();
  const { isConnected } = useWallet();
  const { activeCases, stats, loading } = useCases();
  const { pets, loading: petsLoading } = useAdoption();

  const totalRaised =
    stats.totalRaised > 0n ? Number(formatEther(stats.totalRaised)).toFixed(2) : "0";

  const featured = activeCases.slice(0, 3);
  const featuredPets = pets.slice(0, 3);

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-emerald-50 via-white to-blue-50 py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="text-5xl mb-4">🐾</div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4 leading-tight">
            {t("home.hero.title")}
          </h1>
          <p className="text-gray-500 text-lg mb-8 leading-relaxed max-w-2xl mx-auto">
            {t("home.hero.subtitle")}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/cases"
              className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-colors"
            >
              {t("home.hero.cta.browse")}
            </Link>
            <Link
              to="/adoption/browse"
              className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
            >
              {t("home.hero.cta.adoption")}
            </Link>
            {isConnected && (
              <Link
                to="/submit"
                className="px-6 py-3 bg-white text-emerald-600 border border-emerald-200 rounded-xl font-medium hover:bg-emerald-50 transition-colors"
              >
                {t("home.hero.cta.submit")}
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-3xl font-bold text-gray-900">{stats.total}</div>
              <div className="text-sm text-gray-500 mt-1">{t("home.stats.cases")}</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-emerald-600">{stats.active}</div>
              <div className="text-sm text-gray-500 mt-1">{t("home.stats.active")}</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-900">{totalRaised}</div>
              <div className="text-sm text-gray-500 mt-1">{t("home.stats.raised")}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Cases */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">{t("home.featured.title")}</h2>
          <Link
            to="/cases"
            className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
          >
            {t("home.featured.view_all")} →
          </Link>
        </div>

        {loading ? (
          <Loading className="py-12" />
        ) : featured.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {featured.map((c) => (
              <CaseCard key={c.id} case={c} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-gray-400">
            <div className="text-4xl mb-3">🐱</div>
            <p className="text-sm">{t("home.featured.empty")}</p>
            <p className="text-xs mt-1 text-gray-300">{t("home.featured.empty.sub")}</p>
          </div>
        )}
      </section>

      {/* Featured Adoptions */}
      <section className="max-w-7xl mx-auto px-4 py-4 pb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">{t("adoption.featured.title")}</h2>
          <Link
            to="/adoption/browse"
            className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
          >
            {t("adoption.view_all")} →
          </Link>
        </div>

        {petsLoading ? (
          <Loading className="py-10" />
        ) : featuredPets.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {featuredPets.map((pet) => (
              <PetCard key={pet.petId} pet={pet} />
            ))}
          </div>
        ) : (
          <div className="text-center py-10 text-gray-400">
            <div className="text-3xl mb-2">🐕</div>
            <p className="text-sm">{t("adoption.empty")}</p>
          </div>
        )}
      </section>

      {/* How it works */}
      <section className="bg-gray-50 py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-xl font-bold text-gray-900 text-center mb-10">
            {t("home.how.title")}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {HOW_STEPS.map(({ icon, step, titleKey, descKey }) => (
              <div key={step} className="text-center">
                <div className="text-3xl mb-3">{icon}</div>
                <div className="text-xs font-mono text-emerald-500 mb-1">{step}</div>
                <h3 className="font-semibold text-gray-900 mb-2">{t(titleKey)}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{t(descKey)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
