import { useEffect, useState } from "react";
import { useLocale } from "../hooks/useLocale";
import { usePublisher } from "../hooks/usePublisher";
import PetCard from "../components/adoption/PetCard";
import AuditPanel from "../components/adoption/AuditPanel";
import Loading from "../components/common/Loading";
import Button from "../components/common/Button";
import { getReadableError } from "../utils/error";

export default function PublisherDashboard() {
  const { t } = useLocale();
  const { getMyPets, getPetApplications, auditApplication, loading } = usePublisher();
  const [pets, setPets] = useState([]);
  const [petApplications, setPetApplications] = useState({});
  const [readLoading, setReadLoading] = useState(true);
  const [readError, setReadError] = useState("");
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);

  const refresh = async () => {
    setReadLoading(true);
    setReadError("");
    try {
      const myPets = await getMyPets();
      setPets(myPets);

      const entries = await Promise.all(
        myPets.map(async (pet) => [pet.petId, await getPetApplications(pet.petId)])
      );
      setPetApplications(Object.fromEntries(entries));
    } catch (error) {
      setReadError(getReadableError(error, t));
      setPets([]);
      setPetApplications({});
    } finally {
      setReadLoading(false);
      setHasLoadedOnce(true);
    }
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAudit = async (applyId, isPass) => {
    await auditApplication(applyId, isPass);
    await refresh();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 space-y-8">
      <h1 className="text-2xl font-bold text-gray-900">{t("adoption.dashboard.publisher")}</h1>

      {!hasLoadedOnce && readLoading ? (
        <Loading className="py-16" />
      ) : readError ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 space-y-3">
          <p className="text-sm text-red-700">{readError}</p>
          <Button type="button" onClick={refresh} disabled={readLoading || loading}>
            {t("common.retry")}
          </Button>
        </div>
      ) : pets.length === 0 ? (
        <div className="text-sm text-gray-400">{t("adoption.publisher.empty")}</div>
      ) : (
        <div className="space-y-8">
          {pets.map((pet) => (
            <section key={pet.petId} className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <PetCard pet={pet} />
              <div className="bg-white border border-gray-100 rounded-xl p-4">
                <AuditPanel
                  applications={petApplications[pet.petId] || []}
                  onApprove={(id) => handleAudit(id, true)}
                  onReject={(id) => handleAudit(id, false)}
                />
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
