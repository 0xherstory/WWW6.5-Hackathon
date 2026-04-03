import { Link } from "react-router-dom";
import Card from "../common/Card";
import { useLocale } from "../../hooks/useLocale";

export default function PetCard({ pet, className = "" }) {
  const { t } = useLocale();
  const statusKey = pet.isAdopted ? "adoption.pet_status.adopted" : "adoption.pet_status.available";

  return (
    <Card className={`p-4 flex flex-col gap-3 ${className}`}>
      <div className="aspect-video rounded-lg bg-gray-100 overflow-hidden">
        {pet.imageUrl ? (
          <img src={pet.imageUrl} alt={pet.petName} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full grid place-items-center text-3xl">🐶</div>
        )}
      </div>

      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold text-gray-900 leading-tight">{pet.petName}</h3>
          <p className="text-xs text-gray-500 mt-1">
            {pet.breed} • {pet.age} {t("adoption.age_unit")}
          </p>
        </div>
        <span
          className={`text-xs px-2 py-1 rounded-full ${
            pet.isAdopted ? "bg-gray-100 text-gray-500" : "bg-emerald-100 text-emerald-700"
          }`}
        >
          {t(statusKey)}
        </span>
      </div>

      <p className="text-sm text-gray-600 line-clamp-2 min-h-[2.5rem]">{pet.description}</p>

      <div className="pt-1 flex items-center justify-between">
        <span className="text-xs text-gray-400">
          {t("adoption.applications")}: {pet.totalApplyCount}
        </span>
        <Link
          to={`/adoption/${pet.petId}`}
          className="text-xs text-emerald-600 hover:text-emerald-700 font-medium"
        >
          {t("adoption.view_detail")} →
        </Link>
      </div>
    </Card>
  );
}
