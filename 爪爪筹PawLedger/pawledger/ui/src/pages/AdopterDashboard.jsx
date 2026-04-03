import { useEffect, useState } from "react";
import { useLocale } from "../hooks/useLocale";
import { useWallet } from "../hooks/useWallet";
import { useAdoption } from "../hooks/useAdoption";
import RealNameRegistration from "../components/adoption/RealNameRegistration";
import ApplicationCard from "../components/adoption/ApplicationCard";
import { getReadableError } from "../utils/error";

export default function AdopterDashboard() {
  const { t } = useLocale();
  const { account } = useWallet();
  const { getMyApplications, getRealName, registerRealName } = useAdoption();
  const [applications, setApplications] = useState([]);
  const [realName, setRealName] = useState(null);
  const [error, setError] = useState("");

  const refresh = async () => {
    if (!account) {
      setApplications([]);
      setRealName(null);
      setError("");
      return;
    }
    setError("");
    try {
      const [myApplications, info] = await Promise.all([
        getMyApplications(),
        getRealName(account),
      ]);
      setApplications(myApplications);
      setRealName(info);
    } catch (e) {
      setError(getReadableError(e, t));
    }
  };

  useEffect(() => {
    setApplications([]);
    setRealName(null);
    setError("");
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account]);

  const handleRegister = async (payload) => {
    setError("");
    try {
      await registerRealName(payload);
      await refresh();
    } catch (e) {
      const message = getReadableError(e, t);
      setError(message);
      throw new Error(message);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 space-y-8">
      <h1 className="text-2xl font-bold text-gray-900">{t("adoption.dashboard.adopter")}</h1>

      {!realName?.isVerified ? (
        <section className="bg-white border border-gray-100 rounded-xl p-5">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">{t("adoption.register_realname")}</h2>
          <RealNameRegistration onSubmit={handleRegister} />
        </section>
      ) : (
        <section className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-sm text-emerald-700">
          {t("adoption.realname.verified")}
        </section>
      )}

      <section className="bg-white border border-gray-100 rounded-xl p-5">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">{t("adoption.my_applications")}</h2>
        {error ? (
          <p className="text-sm text-red-500">{error}</p>
        ) : applications.length === 0 ? (
          <p className="text-sm text-gray-400">{t("adoption.no_my_applications")}</p>
        ) : (
          <div className="space-y-3">
            {applications.map((item) => (
              <ApplicationCard key={item.applyId} item={item} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
