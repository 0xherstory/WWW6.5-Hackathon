import { Link } from "react-router";
import { motion } from "motion/react";
import { MapPin, Heart } from "lucide-react";
import { Cat, getStatusLabel, getStatusColor } from "../data/cats";

interface CatCardProps {
  cat: Cat;
  index: number;
}

export function CatCard({ cat, index }: CatCardProps) {
  const statusLabel = getStatusLabel(cat.status);
  const statusColor = getStatusColor(cat.status);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07, duration: 0.4 }}
      whileHover={{ y: -6, scale: 1.02 }}
    >
      <Link to={`/cat/${cat.id}`} className="block">
        <div
          className="rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 group"
          style={{
            background: "linear-gradient(145deg, rgba(255,255,255,0.95), rgba(26,16,64,0.9))",
            border: "1px solid rgba(167,139,250,0.15)",
            boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
          }}
        >
          {/* Cat Image */}
          <div className="relative h-52 overflow-hidden">
            <img
              src={cat.image}
              alt={cat.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            {/* Gradient overlay */}
            <div
              className="absolute inset-0"
              style={{ background: "linear-gradient(to bottom, transparent 50%, rgba(255,255,255,0.95) 100%)" }}
            />

            {/* Status badge */}
            <div className={`absolute top-3 right-3 px-2 py-1 rounded-full text-xs border ${statusColor}`}
              style={{ fontFamily: "'Space Grotesk', sans-serif", backdropFilter: "blur(8px)" }}>
              {statusLabel}
            </div>

            {/* Stage badge */}
            <div
              className="absolute top-3 left-3 px-2 py-1 rounded-full text-xs"
              style={{
                background: "rgba(0,0,0,0.5)",
                color: "#A78BFA",
                border: "1px solid rgba(167,139,250,0.3)",
                backdropFilter: "blur(8px)",
                fontFamily: "'Space Grotesk', sans-serif"
              }}
            >
              Stage {cat.stage}
            </div>
          </div>

          {/* Cat Info */}
          <div className="p-4">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                {cat.name}
              </h3>
              <div className="flex items-center gap-1 text-xs" style={{ color: "#7c7aaa" }}>
                <span>{cat.gender === "female" ? "♀" : "♂"}</span>
                <span>{cat.age < 1 ? `${Math.round(cat.age * 12)}月龄` : `${cat.age}岁`}</span>
              </div>
            </div>

            <p className="text-xs mb-3 line-clamp-2"
              style={{ color: "rgba(255,255,255,0.55)", fontFamily: "'Nunito', sans-serif", lineHeight: "1.5" }}>
              {cat.desc}
            </p>

            <div className="flex items-center gap-1" style={{ color: "rgba(255,255,255,0.35)" }}>
              <MapPin size={11} />
              <span className="text-xs" style={{ fontFamily: "'Nunito', sans-serif" }}>
                {cat.shelter} · {cat.shelterLocation}
              </span>
            </div>

            {/* Personality tags */}
            <div className="flex gap-1 mt-3 flex-wrap">
              {(cat.personality ?? []).map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 rounded-full text-xs"
                  style={{
                    background: "rgba(124,58,237,0.15)",
                    color: "#A78BFA",
                    border: "1px solid rgba(124,58,237,0.2)",
                    fontFamily: "'Nunito', sans-serif"
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Hover action hint */}
          <div
            className="px-4 py-3 flex items-center justify-center gap-2 transition-all duration-300"
            style={{
              borderTop: "1px solid rgba(109,58,238,0.06)",
              color: "rgba(167,139,250,0.7)",
            }}
          >
            <Heart size={13} />
            <span className="text-xs" style={{ fontFamily: "'Nunito', sans-serif" }}>
              查看详情
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
