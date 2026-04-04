import { useState, useEffect } from "react";
import { Link } from "react-router";
import { useApp } from "../context/AppContext";
import { NFTWelcomeModal } from "../components/NFTWelcomeModal";
import { Search, MapPin, Heart, Home, Loader2, Cat, RefreshCw } from "lucide-react";
import { Navbar } from "../components/Navbar";
import { getReadonlyContracts } from "../../lib/contracts";
import { chainStatusToLocal, type ChainCat, type CatStatus } from "../data/cats";

// ============================================================
//  Status config
// ============================================================

const STATUS_CONFIG: Record<CatStatus, { zh: string; en: string; color: string; bg: string; border: string }> = {
  available:       { zh: "待领养",    en: "Available",     color: "#16a34a", bg: "rgba(22,163,74,0.1)",   border: "rgba(22,163,74,0.3)"   },
  cloudAdopted:    { zh: "云领养中",  en: "Cloud Adopted", color: "#F97316", bg: "rgba(249,115,22,0.1)",  border: "rgba(249,115,22,0.3)"  },
  pendingAdoption: { zh: "领养处理中",en: "Pending",       color: "#a855f7", bg: "rgba(168,85,247,0.1)",  border: "rgba(168,85,247,0.3)"  },
  adopted:         { zh: "已被领养",  en: "Adopted",       color: "#888",    bg: "rgba(136,136,136,0.1)", border: "rgba(136,136,136,0.3)" },
  closed:          { zh: "已关闭",    en: "Closed",        color: "#64748b", bg: "rgba(100,116,139,0.1)", border: "rgba(100,116,139,0.3)" },
};

const GENDER_LABEL = {
  zh: { male: "♂ 公猫", female: "♀ 母猫" },
  en: { male: "♂ Male", female: "♀ Female" },
};

// ============================================================
//  Component
// ============================================================

export function Dashboard() {
  const { nftClaimed, welcomeClaimed, isConnected, lang, walletAddress, starterCatId } = useApp();
  const isZh = lang === "zh";
  const [showModal, setShowModal] = useState(isConnected && (!nftClaimed || !welcomeClaimed));
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "myCloud" | CatStatus>("all");
  const [cats, setCats] = useState<ChainCat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // 用户云领养的猫 ID 集合（用于"我的云领养"tab）
  const [myCloudCatIds, setMyCloudCatIds] = useState<Set<number>>(new Set());

  const loadCats = async () => {
    try {
      setLoading(true);
      setError(null);
      const c = getReadonlyContracts();
      const countRaw = await c.catRegistry.catCount();
      const count = Number(countRaw);

      if (count === 0) { setCats([]); return; }

      const results: ChainCat[] = [];
      for (let i = 0; i < count; i++) {
        try {
          const cat = await c.catRegistry.getCat(i) as {
            id: bigint; name: string; age: bigint; gender: string;
            description: string; stageURIs: string[]; shelter: string; status: number;
          };
          const uris = Array.from(cat.stageURIs) as string[];
          const stage = (uris.reduce((last, uri, idx) =>
            uri && uri !== "" ? idx + 1 : last, 1)) as 1 | 2 | 3 | 4;
          const firstUri = uris.find(u => u && u !== "") ?? "";
          let image = "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=600&q=80";
          if (firstUri) {
            try {
              const httpUri = firstUri.startsWith("ipfs://")
                ? firstUri.replace("ipfs://", "https://ipfs.io/ipfs/") : firstUri;
              const res = await fetch(httpUri, { signal: AbortSignal.timeout(5000) });
              const json = await res.json() as { image?: string };
              if (json.image) {
                image = json.image.startsWith("ipfs://")
                  ? json.image.replace("ipfs://", "https://ipfs.io/ipfs/") : json.image;
              }
            } catch { /* fallback */ }
          }
          let shelterLocation = "";
          try {
            const shelterInfo = await c.catRegistry.shelters(cat.shelter) as { location: string };
            shelterLocation = shelterInfo.location ?? "";
          } catch { /* fallback */ }
          results.push({
            id: Number(cat.id), name: cat.name, age: Number(cat.age),
            gender: cat.gender === "female" ? "female" : "male",
            description: cat.description, stageURIs: uris,
            shelter: cat.shelter, shelterLocation,
            status: chainStatusToLocal(cat.status),
            image, stage, isOnChain: true,
          });
        } catch { /* skip */ }
      }
      setCats(results);

      // 查用户的云领养记录：捐款过（userCatDonation > 0）或用来进入游戏的初始猫
      if (walletAddress) {
        const cloudIds = new Set<number>();
        // 1. 捐款过的猫
        for (let i = 0; i < count; i++) {
          try {
            const donated = await c.donationVault.userCatDonation(walletAddress, i);
            if ((donated as bigint) > 0n) cloudIds.add(i);
          } catch { /* skip */ }
        }
        setMyCloudCatIds(cloudIds);
      }
    } catch {
      setError(isZh ? "读取链上数据失败，请检查网络" : "Failed to load chain data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadCats(); }, []);

  // 把「进入过游戏的初始猫」也归入云领养
  useEffect(() => {
    if (starterCatId !== null) {
      setMyCloudCatIds(prev => {
        if (prev.has(starterCatId)) return prev;
        const next = new Set(prev);
        next.add(starterCatId);
        return next;
      });
    }
  }, [starterCatId]);

  const filtered = cats.filter(cat => {
    const matchSearch = cat.name.toLowerCase().includes(search.toLowerCase()) ||
      cat.description.toLowerCase().includes(search.toLowerCase());
    let matchStatus = false;
    if (filterStatus === "all") {
      // 默认不显示 closed（归入「已关闭」单独tab）
      matchStatus = cat.status !== "closed";
    } else if (filterStatus === "myCloud") {
      matchStatus = myCloudCatIds.has(cat.id);
    } else {
      matchStatus = cat.status === filterStatus;
    }
    return matchSearch && matchStatus;
  });

  const statusCounts = {
    all: cats.filter(c => c.status !== "closed").length,
    available: cats.filter(c => c.status === "available").length,
    cloudAdopted: cats.filter(c => c.status === "cloudAdopted").length,
    pendingAdoption: cats.filter(c => c.status === "pendingAdoption").length,
    adopted: cats.filter(c => c.status === "adopted").length,
    closed: cats.filter(c => c.status === "closed").length,
    myCloud: myCloudCatIds.size,
  };

  return (
    <div className="min-h-screen pt-20" style={{ background: "#fffbf5" }}>
      <Navbar />
      {showModal && <NFTWelcomeModal onClose={() => setShowModal(false)} />}

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-black mb-1" style={{ color: "#92400e", fontFamily: "'Space Grotesk', sans-serif" }}>
              {isZh ? "🐱 猫咪档案馆" : "🐱 Cat Registry"}
            </h1>
            <p className="text-sm" style={{ color: "#b45309" }}>
              {isZh
                ? `链上共 ${cats.length} 只猫咪，均为真实收容所数据`
                : `${cats.length} cats on-chain, all from real shelters`}
            </p>
          </div>
          <button
            onClick={loadCats}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-all"
            style={{ background: "rgba(249,115,22,0.08)", border: "1px solid rgba(249,115,22,0.2)", color: "#c2410c", cursor: "pointer" }}
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            {isZh ? "刷新" : "Refresh"}
          </button>
        </div>

        {/* Search + Filter */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#F97316" }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={isZh ? "搜索猫咪名字或描述..." : "Search cats..."}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl outline-none text-sm"
              style={{
                background: "rgba(249,115,22,0.05)",
                border: "1px solid rgba(249,115,22,0.18)",
                color: "#92400e",
              }}
            />
          </div>

          <div className="flex gap-2 flex-wrap">
            {([
              { key: "all",            zhLabel: "全部",     enLabel: "All"          },
              { key: "available",      zhLabel: "待领养",   enLabel: "Available"    },
              { key: "pendingAdoption",zhLabel: "领养处理中",enLabel: "Pending"      },
              { key: "adopted",        zhLabel: "已被领养", enLabel: "Adopted"      },
              { key: "closed",         zhLabel: "已关闭",   enLabel: "Closed"       },
              ...(walletAddress ? [{ key: "myCloud", zhLabel: "我的云领养", enLabel: "My Cloud" }] : []),
            ] as const).map(({ key, zhLabel, enLabel }) => {
              const count = statusCounts[key as keyof typeof statusCounts] ?? 0;
              const active = filterStatus === key;
              const isCloud = key === "myCloud";
              const isClosed = key === "closed";
              return (
                <button
                  key={key}
                  onClick={() => setFilterStatus(key as typeof filterStatus)}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
                  style={{
                    background: active
                      ? isCloud ? "rgba(168,85,247,0.15)" : isClosed ? "rgba(100,116,139,0.15)" : "rgba(249,115,22,0.15)"
                      : "rgba(249,115,22,0.05)",
                    border: active
                      ? isCloud ? "1px solid rgba(168,85,247,0.4)" : isClosed ? "1px solid rgba(100,116,139,0.4)" : "1px solid rgba(249,115,22,0.4)"
                      : "1px solid rgba(249,115,22,0.12)",
                    color: active
                      ? isCloud ? "#a855f7" : isClosed ? "#64748b" : "#F97316"
                      : "#b45309",
                    cursor: "pointer",
                  }}
                >
                  {isZh ? zhLabel : enLabel} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="p-4 rounded-2xl mb-6 text-sm"
            style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#dc2626" }}>
            {error}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Loader2 size={36} className="animate-spin" style={{ color: "#F97316" }} />
            <p className="text-sm" style={{ color: "#b45309" }}>
              {isZh ? "从 Avalanche 链上加载中..." : "Loading from Avalanche..."}
            </p>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && cats.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-20 h-20 rounded-3xl flex items-center justify-center text-4xl"
              style={{ background: "rgba(249,115,22,0.08)", border: "2px dashed rgba(249,115,22,0.2)" }}>
              🐾
            </div>
            <p className="font-bold text-lg" style={{ color: "#92400e" }}>
              {isZh ? "暂无猫咪档案" : "No cats yet"}
            </p>
            <p className="text-sm text-center max-w-xs" style={{ color: "#b45309" }}>
              {isZh
                ? "收容机构注册并通过审批后，即可上传猫咪档案"
                : "Shelters can add cats after registration and approval"}
            </p>
            <Link to="/institution/register"
              className="px-5 py-2.5 rounded-xl text-sm font-bold text-white"
              style={{ background: "linear-gradient(135deg, #F97316, #fbbf24)" }}>
              {isZh ? "机构注册" : "Register Institution"}
            </Link>
          </div>
        )}

        {/* No results */}
        {!loading && !error && cats.length > 0 && filtered.length === 0 && (
          <div className="text-center py-16">
            <Cat size={36} className="mx-auto mb-3" style={{ color: "#F97316", opacity: 0.4 }} />
            <p style={{ color: "#b45309" }}>{isZh ? "没有符合条件的猫咪" : "No cats match your search"}</p>
          </div>
        )}

        {/* Cat Grid */}
        {!loading && filtered.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map(cat => {
              const st = STATUS_CONFIG[cat.status];
              const isAdopted = cat.status === "adopted";
              return (
                <Link key={cat.id} to={`/cat/${cat.id}`} className="group block">
                  <div
                    className="rounded-3xl overflow-hidden transition-all duration-300 group-hover:-translate-y-1"
                    style={{
                      background: "#fff9f5",
                      border: "1px solid rgba(249,115,22,0.12)",
                      boxShadow: "0 4px 16px rgba(249,115,22,0.06)",
                    }}
                    onMouseEnter={e => (e.currentTarget.style.boxShadow = "0 12px 32px rgba(249,115,22,0.16)")}
                    onMouseLeave={e => (e.currentTarget.style.boxShadow = "0 4px 16px rgba(249,115,22,0.06)")}
                  >
                    {/* Image */}
                    <div className="relative" style={{ aspectRatio: "1" }}>
                      <img
                        src={cat.image}
                        alt={cat.name}
                        className="w-full h-full object-cover"
                        style={{ filter: isAdopted ? "grayscale(30%)" : "none" }}
                      />
                      <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(146,64,14,0.5), transparent 60%)" }} />
                      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                        <span className="px-2.5 py-1 rounded-full text-xs font-semibold"
                          style={{ background: st.bg, color: st.color, border: `1px solid ${st.border}` }}>
                          {isAdopted && <Home size={9} className="inline mr-1" />}
                          {isZh ? st.zh : st.en}
                        </span>
                        <span className="px-2 py-1 rounded-full text-xs"
                          style={{ background: "rgba(255,255,255,0.2)", color: "#fff", backdropFilter: "blur(4px)" }}>
                          Stage {cat.stage}
                        </span>
                      </div>
                    </div>

                    {/* Info */}
                    <div className="p-4">
                      <h3 className="font-black text-lg mb-0.5" style={{ color: "#92400e", fontFamily: "'Space Grotesk', sans-serif" }}>
                        {cat.name}
                      </h3>
                      <p className="text-xs mb-2" style={{ color: "#b45309" }}>
                        {isZh ? GENDER_LABEL.zh[cat.gender as "male" | "female"] : GENDER_LABEL.en[cat.gender as "male" | "female"]}
                        {" · "}
                        {cat.age < 1
                          ? (isZh ? `${Math.round(cat.age * 12)} 月龄` : `${Math.round(cat.age * 12)}mo`)
                          : (isZh ? `${cat.age} 岁` : `${cat.age}yr`)}
                      </p>
                      <p className="text-xs leading-relaxed line-clamp-2 mb-3" style={{ color: "#78350f" }}>
                        {cat.description}
                      </p>

                      <div className="flex items-center gap-1.5 text-xs" style={{ color: "#b45309" }}>
                        <MapPin size={11} style={{ color: "#F97316" }} />
                        <span className="truncate text-[10px]" style={{ maxWidth: "140px" }}>
                          {cat.shelterLocation
                            ? cat.shelterLocation
                            : `${cat.shelter.slice(0, 8)}...${cat.shelter.slice(-4)}`}
                        </span>
                      </div>

                      <div className="mt-3 pt-3 flex gap-2" style={{ borderTop: "1px solid rgba(249,115,22,0.1)" }}>
                        {!isAdopted && (
                          <div className="flex items-center gap-1 text-xs" style={{ color: "#F97316" }}>
                            <Heart size={11} />
                            {isZh ? "可捐款" : "Donate"}
                          </div>
                        )}
                        <span className="ml-auto text-xs font-medium px-2 py-0.5 rounded-full"
                          style={{ background: "rgba(249,115,22,0.08)", color: "#c2410c" }}>
                          #{cat.id}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
