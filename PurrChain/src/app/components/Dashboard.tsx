import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { useApp } from "../context/AppContext";
import { NFTWelcomeModal } from "./NFTWelcomeModal";
import { Search, Filter, MapPin, Heart, Gamepad2, Home } from "lucide-react";

const STATUS_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  Available: { label: "待领养", color: "#4ecdc4", bg: "rgba(78,205,196,0.1)" },
  CloudAdopted: { label: "已云领养", color: "#f7a541", bg: "rgba(247,165,65,0.1)" },
  PendingAdoption: { label: "申请中", color: "#a855f7", bg: "rgba(168,85,247,0.1)" },
  Adopted: { label: "已有家", color: "#888", bg: "rgba(136,136,136,0.1)" },
};

const GENDER_LABEL = { male: "♂ 公猫", female: "♀ 母猫" };

export function Dashboard() {
  const { nftClaimed, isConnected } = useApp();
  const navigate = useNavigate();
  // 初始不显示，等钱包连接后再判断是否弹出
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  // 钱包连接后，若未领取全家福则自动弹窗
  useEffect(() => {
    if (isConnected && !nftClaimed) {
      setShowModal(true);
    }
  }, [isConnected, nftClaimed]);

  const filtered = cats.filter(cat => {
    const matchSearch = cat.name.includes(search) || cat.breed.includes(search) || cat.shelter.includes(search);
    const matchStatus = filterStatus === "all" || cat.status === filterStatus;
    return matchSearch && matchStatus;
  });

  return (
    <div className="min-h-screen pt-20" style={{ background: "#f7f5ff" }}>
      {showModal && <NFTWelcomeModal onClose={() => setShowModal(false)} />}

      {/* Header */}
      <div className="px-6 py-8 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl" style={{ color: "#1e1b4b", fontWeight: 800 }}>
              🐾 猫咪档案馆
            </h1>
            <p className="text-sm mt-1" style={{ color: "#7c7aaa" }}>
              {filtered.length} 只猫咪等待您的关注 · 由 <span style={{ color: "#7ec8e3" }}>CatRegistry.sol</span> 链上存储
            </p>
          </div>

          {!nftClaimed && (
            <button onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm animate-pulse"
              style={{
                background: "linear-gradient(135deg, #f7a541, #ff6b6b)",
                color: "#1e1b4b",
                fontWeight: 700,
                cursor: "pointer",
                animationDuration: "2s",
              }}>
              🎁 领取全家福 NFT + 20 PURR
            </button>
          )}
        </div>

        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#7c7aaa" }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="搜索猫咪名字、品种、收容机构..."
              className="w-full pl-10 pr-4 py-3 rounded-xl outline-none"
              style={{ background: "rgba(109,58,238,0.06)", border: "1px solid rgba(126,200,227,0.12)", color: "#1e1b4b" }}
            />
          </div>
          <div className="flex gap-2">
            {[
              { val: "all", label: "全部" },
              { val: "Available", label: "待领养" },
              { val: "CloudAdopted", label: "已云领养" },
              { val: "Adopted", label: "已领养" },
            ].map(f => (
              <button key={f.val} onClick={() => setFilterStatus(f.val)}
                className="px-4 py-2 rounded-xl text-sm transition-all"
                style={{
                  background: filterStatus === f.val ? "rgba(126,200,227,0.2)" : "rgba(109,58,238,0.04)",
                  border: filterStatus === f.val ? "1px solid rgba(126,200,227,0.4)" : "1px solid rgba(109,58,238,0.06)",
                  color: filterStatus === f.val ? "#7ec8e3" : "#6060a0",
                  cursor: "pointer",
                }}>
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Cat Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(cat => {
            const statusInfo = STATUS_LABELS[cat.status];
            const isAdopted = cat.status === "Adopted";
            return (
              <Link key={cat.id} to={`/cat/${cat.id}`}
                className="group block rounded-2xl overflow-hidden transition-all hover:-translate-y-1 hover:shadow-2xl"
                style={{ background: "rgba(109,58,238,0.03)", border: "1px solid rgba(126,200,227,0.08)" }}>

                {/* Cat Image */}
                <div className="relative overflow-hidden" style={{ height: "200px" }}>
                  <img src={cat.imageUrl} alt={cat.name}
                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    style={{ filter: isAdopted ? "grayscale(40%)" : "none" }} />
                  <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(10,8,25,0.7), transparent)" }} />

                  {/* Status badge */}
                  <div className="absolute top-3 right-3 px-3 py-1 rounded-full text-xs"
                    style={{ background: statusInfo.bg, color: statusInfo.color, border: `1px solid ${statusInfo.color}33`, backdropFilter: "blur(8px)" }}>
                    {isAdopted && <Home size={10} className="inline mr-1" />}
                    {statusInfo.label}
                  </div>

                  {/* Stage badge */}
                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs"
                    style={{ background: "rgba(168,85,247,0.2)", color: "#a855f7", border: "1px solid rgba(168,85,247,0.3)", backdropFilter: "blur(8px)" }}>
                    Stage {cat.stage}
                  </div>
                </div>

                {/* Cat Info */}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-lg" style={{ color: "#1e1b4b", fontWeight: 700 }}>{cat.name}</h3>
                      <p className="text-xs" style={{ color: "#7c7aaa" }}>
                        {GENDER_LABEL[cat.gender]} · {cat.age}岁 · {cat.breed}
                      </p>
                    </div>
                  </div>

                  <p className="text-sm mb-3 line-clamp-2" style={{ color: "#8080a0", lineHeight: 1.6 }}>
                    {cat.desc}
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs" style={{ color: "#7c7aaa" }}>
                      <MapPin size={12} />
                      {cat.shelter}
                    </div>
                    {cat.donationTotal > 0 && (
                      <div className="flex items-center gap-1 text-xs" style={{ color: "#f7a541" }}>
                        <Heart size={11} />
                        <span>{cat.donationTotal.toFixed(2)} AVAX 已捐</span>
                      </div>
                    )}
                  </div>

                  {/* Quick action hint */}
                  <div className="mt-3 pt-3 flex items-center gap-2 text-xs" style={{ borderTop: "1px solid rgba(109,58,238,0.06)", color: "#7ec8e3" }}>
                    {!isAdopted ? (
                      <>
                        <Heart size={12} />
                        <span>可捐款 / 领养</span>
                        <span className="mx-1">·</span>
                        <Gamepad2 size={12} />
                        <span>进入游戏</span>
                      </>
                    ) : (
                      <span style={{ color: "#888" }}>🏠 此猫咪已找到家庭</span>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">🔍</div>
            <p style={{ color: "#7c7aaa" }}>没有找到符合条件的猫咪</p>
          </div>
        )}
      </div>
    </div>
  );
}
