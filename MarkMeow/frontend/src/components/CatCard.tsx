import { Cat } from "lucide-react";

interface CatCardProps {
  cat: {
    id: string;
    cat_id: string;
    gender: string;
    city: string;
    is_neutered: boolean;
    photo_url: string;
    created_at: string;
    neutered_at: string | null;
    neutered_proof_url: string | null;
  };
  onClick: () => void;
}

const CatCard = ({ cat, onClick }: CatCardProps) => {
  return (
    <div
      className="bg-card rounded-lg shadow-sm border border-border overflow-hidden cursor-pointer hover:shadow-md transition-shadow duration-300 group"
      onClick={onClick}
    >
      <div className="aspect-square overflow-hidden bg-muted">
        <img
          src={cat.photo_url}
          alt={`猫咪 ${cat.cat_id}`}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
      </div>
      <div className="p-3 space-y-1">
        <div className="flex items-center gap-1.5">
          <Cat className="w-4 h-4 text-primary" />
          <span className="font-semibold text-foreground text-sm">ID: {cat.cat_id}</span>
        </div>
        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
          <span className="bg-muted px-2 py-0.5 rounded-full">
            {cat.gender === "male" ? "♂ 公" : "♀ 母"}
          </span>
          <span className="bg-muted px-2 py-0.5 rounded-full">{cat.city}</span>
          <span
            className={`px-2 py-0.5 rounded-full ${
              cat.is_neutered
                ? "bg-primary/10 text-primary"
                : "bg-secondary/30 text-secondary-foreground"
            }`}
          >
            {cat.is_neutered ? "✅ 已绝育" : "❌ 未绝育"}
          </span>
        </div>
      </div>
    </div>
  );
};

export default CatCard;
