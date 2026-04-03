import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useLocale } from "../hooks/useLocale";
import { useWallet } from "../hooks/useWallet";
import { useAdoption } from "../hooks/useAdoption";
import { usePublisher } from "../hooks/usePublisher";
import ApplicationForm from "../components/adoption/ApplicationForm";
import ApplicationCard from "../components/adoption/ApplicationCard";
import RealNameRegistration from "../components/adoption/RealNameRegistration";
import Loading from "../components/common/Loading";
import { getReadableError } from "../utils/error";

export default function AdoptionDetail() {
  const { petId } = useParams();
  const { t } = useLocale();
  const { account, isConnected } = useWallet();
  const { getPet, getApplications, getRealName, registerRealName, submitApply } = useAdoption();
  const { auditApplication } = usePublisher();

  const [pet, setPet] = useState(null);
  const [applications, setApplications] = useState([]);
  const [realName, setRealName] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const isPublisher = useMemo(() => {
    if (!account || !pet?.publisher) return false;
    return account.toLowerCase() === pet.publisher.toLowerCase();
  }, [account, pet]);

  const refresh = async () => {
    setLoading(true);
    setError("");
    try {
      const targetPet = await getPet(Number(petId));
      const targetApplies = await getApplications(Number(petId));
      setPet(targetPet);
      setApplications(targetApplies);

      if (account) {
        const info = await getRealName(account);
        setRealName(info);
      }
    } catch (e) {
      setError(getReadableError(e, t, "common.error"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [petId, account]);

  const handleRegister = async (payload) => {
    setError("");
    try {
      await registerRealName(payload);
      await refresh();
    } catch (error) {
      const message = getReadableError(error, t);
      setError(message);
      throw new Error(message);
    }
  };

  const handleApply = async (message) => {
    setError("");
    try {
      await submitApply(Number(petId), message);
      await refresh();
    } catch (error) {
      const nextError = getReadableError(error, t);
      setError(nextError);
      throw new Error(nextError);
    }
  };

  const handleAudit = async (applyId, isPass) => {
    setError("");
    try {
      await auditApplication(applyId, isPass);
      await refresh();
    } catch (error) {
      setError(getReadableError(error, t));
    }
  };

  if (loading) {
    return <Loading className="py-24" size="lg" />;
  }

  if (!pet) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-10 text-center text-red-500 text-sm">
        {error || t("common.error")}
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 space-y-8">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl bg-gray-100 overflow-hidden aspect-video">
          {pet.imageUrl ? (
            <img src={pet.imageUrl} alt={pet.petName} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full grid place-items-center text-4xl">🐾</div>
          )}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{pet.petName}</h1>
          <p className="text-sm text-gray-500 mt-1">
            {pet.breed} • {pet.age} {t("adoption.age_unit")}
          </p>
          <p className="mt-4 text-sm text-gray-700 whitespace-pre-wrap">{pet.description}</p>
          <div className="mt-4 text-xs text-gray-500 font-mono break-all">{pet.publisher}</div>
        </div>
      </div>

      {!isPublisher && isConnected && !realName?.isVerified && (
        <section className="bg-white border border-gray-100 rounded-xl p-5">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">{t("adoption.register_realname")}</h2>
          <RealNameRegistration onSubmit={handleRegister} />
        </section>
      )}

      {!isPublisher && isConnected && realName?.isVerified && !pet.isAdopted && (
        <section className="bg-white border border-gray-100 rounded-xl p-5">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">{t("adoption.apply")}</h2>
          <ApplicationForm onSubmit={handleApply} />
        </section>
      )}

      <section className="bg-white border border-gray-100 rounded-xl p-5">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">{t("adoption.applications")}</h2>
        {applications.length === 0 ? (
          <p className="text-sm text-gray-400">{t("adoption.no_applications")}</p>
        ) : (
          <div className="space-y-3">
            {applications.map((item) => (
              <ApplicationCard
                key={item.applyId}
                item={item}
                canAudit={isPublisher}
                onApprove={(id) => handleAudit(id, true)}
                onReject={(id) => handleAudit(id, false)}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
