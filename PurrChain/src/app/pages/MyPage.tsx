import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router";
import { Heart, Gift, Image, CreditCard, ArrowLeft, Loader2, ExternalLink, RefreshCw, X, ZoomIn } from "lucide-react";
import { Navbar } from "../components/Navbar";
import { useApp } from "../context/AppContext";
import { getReadonlyContracts, getContracts, ADDRESSES } from "../../lib/contracts";
import { ethers } from "ethers";

type MyTab = "donations" | "adoptions" | "nfts" | "topup";

// ── 捐赠记录面板 ──────────────────────────────────────────
interface DonationRecord {
  catId: number;
  catName: string;
  total: string;
  remaining: string;
}

function DonationsPanel({ isZh }: { isZh: boolean }) {
  const { walletAddress } = useApp();
  const navigate = useNavigate();
  const [loading,  setLoading]  = useState(true);
  const [records,  setRecords]  = useState<DonationRecord[]>([]);

  const load = useCallback(async () => {
    if (!walletAddress) { setLoading(false); return; }
    setLoading(true);
    try {
      const c = getReadonlyContracts();
      const total = Number(await c.catRegistry.catCount());
      const found: DonationRecord[] = [];
      for (let i = 0; i < total; i++) {
        try {
          const donated = await c.donationVault.userCatDonation(walletAddress, i);
          if ((donated as bigint) === 0n) continue;
          const remaining = await c.donationVault.remainingToNextMint(walletAddress, i);
          const raw = await c.catRegistry.getCat(i) as { name: string };
          found.push({
            catId: i,
            catName: raw.name || `Cat #${i}`,
            total: parseFloat(ethers.formatEther(donated as bigint)).toFixed(3),
            remaining: parseFloat(ethers.formatEther(remaining as bigint)).toFixed(3),
          });
        } catch { /* 跳过读取失败的猫 */ }
      }
      setRecords(found);
    } catch (e) {
      console.error("捐赠记录读取失败:", e);
    } finally { setLoading(false); }
  }, [walletAddress]);

  useEffect(() => { load(); }, [load]);

  if (loading) return (
    <div className="flex items-center justify-center py-16 gap-3">
      <Loader2 size={24} className="animate-spin" style={{ color: "#F97316" }} />
      <span className="text-sm" style={{ color: "#b45309" }}>{isZh ? "读取链上捐赠记录…" : "Loading donation records…"}</span>
    </div>
  );

  if (records.length === 0) return (
    <div className="text-center py-16">
      <div className="text-5xl mb-4">💝</div>
      <p className="font-bold mb-2" style={{ color: "#92400e" }}>{isZh ? "暂无捐赠记录" : "No donations yet"}</p>
      <p className="text-sm max-w-xs mx-auto mb-4" style={{ color: "#b45309" }}>
        {isZh ? "前往猫咪档案，为你心仪的猫咪捐款，记录将在这里展示" : "Visit the cat registry to donate. Records will appear here."}
      </p>
      <button onClick={load} disabled={loading}
        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold"
        style={{ background: "rgba(249,115,22,0.08)", border: "1px solid rgba(249,115,22,0.2)", color: "#c2410c", cursor: "pointer" }}>
        <RefreshCw size={12} className={loading ? "animate-spin" : ""} />
        {isZh ? "重新读取" : "Retry"}
      </button>
    </div>
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-medium" style={{ color: "#b45309" }}>
          {isZh ? `共捐助了 ${records.length} 只猫咪` : `Donated to ${records.length} cat${records.length > 1 ? "s" : ""}`}
        </p>
        <button onClick={load} disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
          style={{ background: "rgba(249,115,22,0.08)", border: "1px solid rgba(249,115,22,0.2)", color: "#c2410c", cursor: "pointer" }}>
          <RefreshCw size={12} className={loading ? "animate-spin" : ""} />
          {isZh ? "刷新" : "Refresh"}
        </button>
      </div>
      {records.map(r => (
        <div key={r.catId}
          onClick={() => navigate(`/cat/${r.catId}`)}
          className="p-4 rounded-2xl flex items-center justify-between gap-4 cursor-pointer transition-all"
          style={{ background: "#fff9f5", border: "1px solid rgba(249,115,22,0.12)" }}
          onMouseEnter={e => (e.currentTarget.style.borderColor = "rgba(249,115,22,0.35)")}
          onMouseLeave={e => (e.currentTarget.style.borderColor = "rgba(249,115,22,0.12)")}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
              style={{ background: "rgba(249,115,22,0.1)" }}>🐱</div>
            <div>
              <p className="font-bold text-sm" style={{ color: "#92400e" }}>{r.catName}</p>
              <p className="text-xs" style={{ color: "#b45309" }}>Cat #{r.catId}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm font-black" style={{ color: "#F97316" }}>{r.total} AVAX</p>
            <p className="text-xs" style={{ color: "#16a34a" }}>
              {isZh ? `距下阶段 ${r.remaining}` : `${r.remaining} to next`}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── 领养记录面板 ──────────────────────────────────────────
const APP_STATUS_LABEL_MY = {
  zh: ["已申请·待审批", "审批通过·待缴款", "已缴款·等回访", "取消中·待确认", "领养完成", "领养失败", "已取消"],
  en: ["Applied · Pending", "Approved · Pay Deposit", "Deposit Paid · Awaiting Visit", "Cancelling", "Completed", "Failed", "Cancelled"],
};
const APP_STATUS_COLOR_MY = ["#d97706","#16a34a","#a855f7","#ef4444","#16a34a","#888","#888"];

interface AdoptionRecord {
  catId: number;
  catName: string;
  status: number;
  depositAmount: string;
}

function AdoptionsPanel({ isZh }: { isZh: boolean }) {
  const { walletAddress } = useApp();
  const navigate = useNavigate();
  const [loading,  setLoading]  = useState(true);
  const [records,  setRecords]  = useState<AdoptionRecord[]>([]);

  useEffect(() => {
    if (!walletAddress) { setLoading(false); return; }
    const load = async () => {
      setLoading(true);
      try {
        const c = getReadonlyContracts();
        const total = Number(await c.catRegistry.catCount());
        const found: AdoptionRecord[] = [];
        for (let i = 0; i < total; i++) {
          try {
            const app = await c.adoptionVault.getApplication(i) as {
              applicant: string; status: bigint; depositAmount: bigint;
            };
            if (app.applicant.toLowerCase() !== walletAddress.toLowerCase()) continue;
            const status = Number(app.status);
            if (status === 6) continue; // 已取消的不显示
            const raw = await c.catRegistry.getCat(i) as { name: string };
            found.push({
              catId: i,
              catName: raw.name || `Cat #${i}`,
              status,
              depositAmount: parseFloat(ethers.formatEther(app.depositAmount)).toFixed(3),
            });
          } catch { /* 无申请或读取失败，跳过 */ }
        }
        setRecords(found);
      } catch (e) {
        console.error("领养记录读取失败:", e);
      } finally { setLoading(false); }
    };
    load();
  }, [walletAddress]);

  if (loading) return (
    <div className="flex items-center justify-center py-16 gap-3">
      <Loader2 size={24} className="animate-spin" style={{ color: "#F97316" }} />
      <span className="text-sm" style={{ color: "#b45309" }}>{isZh ? "读取领养记录…" : "Loading adoption records…"}</span>
    </div>
  );

  if (records.length === 0) return (
    <div className="text-center py-16">
      <div className="text-5xl mb-4">🏠</div>
      <p className="font-bold mb-2" style={{ color: "#92400e" }}>{isZh ? "暂无领养记录" : "No adoptions yet"}</p>
      <p className="text-sm max-w-xs mx-auto" style={{ color: "#b45309" }}>
        {isZh ? "申请线下领养后，领养流程记录将在这里展示" : "Apply for in-person adoption. Records will appear here."}
      </p>
    </div>
  );

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium mb-4" style={{ color: "#b45309" }}>
        {isZh ? `${records.length} 条领养记录` : `${records.length} adoption record${records.length > 1 ? "s" : ""}`}
      </p>
      {records.map(r => {
        const color = APP_STATUS_COLOR_MY[r.status] ?? "#888";
        const label = (isZh ? APP_STATUS_LABEL_MY.zh : APP_STATUS_LABEL_MY.en)[r.status] ?? "";
        return (
          <div key={r.catId}
            onClick={() => navigate(`/cat/${r.catId}`)}
            className="p-4 rounded-2xl flex items-center justify-between gap-4 cursor-pointer transition-all"
            style={{ background: "#fff9f5", border: "1px solid rgba(249,115,22,0.12)" }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = "rgba(249,115,22,0.35)")}
            onMouseLeave={e => (e.currentTarget.style.borderColor = "rgba(249,115,22,0.12)")}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                style={{ background: "rgba(249,115,22,0.1)" }}>🏠</div>
              <div>
                <p className="font-bold text-sm" style={{ color: "#92400e" }}>{r.catName}</p>
                <p className="text-xs font-mono" style={{ color: "#b45309" }}>Cat #{r.catId}</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs px-2 py-1 rounded-full font-semibold"
                style={{ background: `${color}18`, color, border: `1px solid ${color}30` }}>
                {label}
              </span>
              {r.depositAmount !== "0.000" && (
                <p className="text-xs mt-1" style={{ color: "#b45309" }}>
                  {isZh ? `保证金 ${r.depositAmount} AVAX` : `Deposit: ${r.depositAmount} AVAX`}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

const TABS: { id: MyTab; icon: React.ReactNode; zh: string; en: string }[] = [
  { id: "donations", icon: <Heart size={16} />,    zh: "捐赠记录", en: "Donations" },
  { id: "adoptions", icon: <Gift size={16} />,     zh: "领养记录", en: "Adoptions" },
  { id: "nfts",      icon: <Image size={16} />,    zh: "我的 NFT", en: "My NFTs" },
  { id: "topup",     icon: <CreditCard size={16} />, zh: "充值 PURR", en: "Buy PURR" },
];

// ── 充值面板 ──────────────────────────────────────────────
function TopupPanel({ isZh, purrBalance }: { isZh: boolean; purrBalance: string }) {
  const { signer, walletAddress, refreshBalance } = useApp();
  const [amount, setAmount] = useState("0.1");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleBuy = async () => {
    if (!signer) { setError(isZh ? "请先连接钱包" : "Connect wallet first"); return; }
    setLoading(true); setError(null); setSuccess(null);
    try {
      const tx = await getContracts(signer).purrToken.buyTokens({ value: ethers.parseEther(amount) });
      await (tx as ethers.ContractTransactionResponse).wait();
      setSuccess(isZh ? `充值成功！` : "Top-up successful!");
      refreshBalance();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "";
      if (!msg.includes("user rejected")) setError(isZh ? `充值失败：${msg.slice(0, 60)}` : `Failed: ${msg.slice(0, 60)}`);
    } finally { setLoading(false); }
  };

  return (
    <div className="max-w-md">
      <div className="p-5 rounded-2xl mb-5" style={{ background: "rgba(249,115,22,0.06)", border: "1px solid rgba(249,115,22,0.15)" }}>
        <p className="text-xs font-medium mb-1" style={{ color: "#b45309" }}>{isZh ? "当前余额" : "Current Balance"}</p>
        <p className="text-3xl font-black" style={{ color: "#F97316", fontFamily: "'Space Grotesk', sans-serif" }}>{purrBalance} <span className="text-lg">PURR</span></p>
      </div>
      <p className="text-sm mb-4" style={{ color: "#b45309" }}>
        {isZh ? "用 AVAX 购买 $PURR 代币，用于商店购买道具和装备。" : "Use AVAX to buy $PURR tokens for the in-game shop."}
      </p>
      <div className="flex gap-2 mb-3">
        {["0.05", "0.1", "0.5", "1.0"].map(v => (
          <button key={v} onClick={() => setAmount(v)} className="flex-1 py-2 rounded-xl text-sm font-bold"
            style={{
              background: amount === v ? "rgba(249,115,22,0.15)" : "rgba(249,115,22,0.05)",
              border: amount === v ? "1px solid rgba(249,115,22,0.4)" : "1px solid rgba(249,115,22,0.12)",
              color: amount === v ? "#F97316" : "#b45309", cursor: "pointer",
            }}>{v} AVAX</button>
        ))}
      </div>
      <input value={amount} onChange={e => setAmount(e.target.value)} type="number" step="0.01" min="0.01"
        className="w-full px-4 py-3 rounded-xl outline-none mb-3 text-sm"
        style={{ background: "rgba(249,115,22,0.05)", border: "1px solid rgba(249,115,22,0.18)", color: "#F97316" }} />
      {error && <p className="text-xs text-red-500 mb-2">{error}</p>}
      {success && <p className="text-xs text-green-600 mb-2">{success}</p>}
      <button onClick={handleBuy} disabled={loading || !parseFloat(amount)}
        className="w-full py-3.5 rounded-xl text-white font-bold flex items-center justify-center gap-2"
        style={{ background: "linear-gradient(135deg, #F97316, #fbbf24)", cursor: "pointer", opacity: loading ? 0.7 : 1 }}>
        {loading && <Loader2 size={16} className="animate-spin" />}
        {loading ? (isZh ? "处理中..." : "Processing...") : (isZh ? `购买 ${amount} AVAX 的 PURR` : `Buy PURR for ${amount} AVAX`)}
      </button>
    </div>
  );
}

// ── NFT 展示 ──────────────────────────────────────────────
// NFT 类型标签
const NFT_TYPE_LABEL: Record<number, { zh: string; en: string; color: string }> = {
  0: { zh: "Starter",       en: "Starter",        color: "#888" },
  1: { zh: "云领养",         en: "CloudAdopted",   color: "#F97316" },
  2: { zh: "Genesis ✨",     en: "Genesis ✨",      color: "#a855f7" },
  3: { zh: "全家福",         en: "FamilyPortrait", color: "#16a34a" },
  4: { zh: "初始猫",         en: "StarterCat",     color: "#0ea5e9" },
  5: { zh: "收藏",           en: "Collection",     color: "#f59e0b" },
};

interface NFTItem {
  tokenId: number;
  nftType: number;
  stage: number;
  image: string;
  name: string;
  description: string;
  metaName: string; // metadata里的name字段
}

async function ipfsToHttp(uri: string): Promise<string> {
  if (!uri) return "";
  return uri.startsWith("ipfs://")
    ? uri.replace("ipfs://", "https://ipfs.io/ipfs/")
    : uri;
}

async function fetchNFTMeta(tokenURIValue: string): Promise<{ image: string; description: string; name: string }> {
  if (!tokenURIValue) return { image: "", description: "", name: "" };
  try {
    const url = await ipfsToHttp(tokenURIValue);
    const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
    const json = await res.json() as { image?: string; name?: string; description?: string };
    return {
      image: json.image ? await ipfsToHttp(json.image) : "",
      description: json.description ?? "",
      name: json.name ?? "",
    };
  } catch { return { image: "", description: "", name: "" }; }
}

function NFTPanel({ isZh }: { isZh: boolean }) {
  const { walletAddress } = useApp();
  const [loading,  setLoading]  = useState(true);
  const [nfts,     setNfts]     = useState<NFTItem[]>([]);
  const [progress, setProgress] = useState(0);
  const [selectedNft, setSelectedNft] = useState<NFTItem | null>(null);

  useEffect(() => {
    if (!walletAddress) { setLoading(false); return; }
    let cancelled = false;

    const load = async () => {
      setLoading(true); setNfts([]);
      try {
        const { getReadonlyContracts } = await import("../../lib/contracts");
        const c = getReadonlyContracts();
        const total = Number(await c.catNFT.totalSupply());
        setProgress(0);

        const found: NFTItem[] = [];
        // 批量查询，每批 10 个
        for (let i = 0; i < total; i += 10) {
          if (cancelled) return;
          const batch = Array.from({ length: Math.min(10, total - i) }, (_, j) => i + j);
          await Promise.all(batch.map(async (tokenId) => {
            try {
              const owner = await c.catNFT.ownerOf(tokenId);
              if ((owner as string).toLowerCase() !== walletAddress.toLowerCase()) return;
              const info = await c.catNFT.nftInfo(tokenId) as {
                nftType: bigint; stage: bigint; tokenURIValue: string;
              };
              const nftType = Number(info.nftType);
              const stage   = Number(info.stage);
              const meta    = await fetchNFTMeta(info.tokenURIValue);
              const typeInfo = NFT_TYPE_LABEL[nftType];
              const displayName = stage > 0
                ? `${isZh ? (typeInfo?.zh ?? "NFT") : (typeInfo?.en ?? "NFT")} Stage ${stage}`
                : (isZh ? (typeInfo?.zh ?? "NFT") : (typeInfo?.en ?? "NFT"));
              found.push({ tokenId, nftType, stage, image: meta.image, name: displayName, description: meta.description, metaName: meta.name });
            } catch { /* token已销毁或其他错误，跳过 */ }
          }));
          setProgress(Math.round(((i + 10) / total) * 100));
        }

        if (!cancelled) setNfts(found.sort((a, b) => b.tokenId - a.tokenId));
      } catch (e) {
        console.error("NFT load error:", e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => { cancelled = true; };
  }, [walletAddress]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-16 gap-4">
      <Loader2 size={28} className="animate-spin" style={{ color: "#F97316" }} />
      <p className="text-sm" style={{ color: "#b45309" }}>
        {isZh ? `正在读取链上 NFT…（${Math.min(progress, 100)}%）` : `Loading NFTs… (${Math.min(progress, 100)}%)`}
      </p>
    </div>
  );

  if (!walletAddress || nfts.length === 0) return (
    <div className="text-center py-16">
      <div className="text-5xl mb-4">🖼️</div>
      <p className="font-bold mb-2" style={{ color: "#92400e" }}>{isZh ? "暂无 NFT" : "No NFTs yet"}</p>
      <p className="text-sm max-w-xs mx-auto mb-4" style={{ color: "#b45309" }}>
        {isZh ? "领取全家福、捐款云领养或完成线下领养后将在此显示" : "NFTs from portrait claims, donations, or adoptions will appear here"}
      </p>
      <a href={`https://testnet.snowtrace.io/address/${walletAddress}#tokentxnsErc721`}
        target="_blank" rel="noreferrer"
        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold"
        style={{ background: "rgba(249,115,22,0.1)", color: "#F97316", border: "1px solid rgba(249,115,22,0.2)" }}>
        <ExternalLink size={14} />{isZh ? "在 Snowtrace 查看" : "View on Snowtrace"}
      </a>
    </div>
  );

  return (
    <>
    <div>
      <p className="text-sm mb-4 font-medium" style={{ color: "#b45309" }}>
        {isZh ? `共 ${nfts.length} 个 NFT` : `${nfts.length} NFTs`}
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {nfts.map(nft => {
          const typeInfo = NFT_TYPE_LABEL[nft.nftType];
          return (
            <div key={nft.tokenId} className="rounded-2xl overflow-hidden cursor-pointer transition-all"
              style={{ background: "#fff9f5", border: "1px solid rgba(249,115,22,0.12)" }}
              onClick={() => setSelectedNft(nft)}
              onMouseEnter={e => (e.currentTarget.style.boxShadow = "0 8px 24px rgba(249,115,22,0.18)")}
              onMouseLeave={e => (e.currentTarget.style.boxShadow = "none")}>
              {/* 图片 */}
              <div className="aspect-square relative overflow-hidden group"
                style={{ background: "rgba(249,115,22,0.06)" }}>
                {nft.image ? (
                  <img src={nft.image} alt={nft.name}
                    className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl">🐱</div>
                )}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ background: "rgba(0,0,0,0.3)" }}>
                  <ZoomIn size={24} color="white" />
                </div>
              </div>
              {/* 信息 */}
              <div className="p-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                    style={{ background: `${typeInfo?.color ?? "#888"}18`, color: typeInfo?.color ?? "#888", border: `1px solid ${typeInfo?.color ?? "#888"}30` }}>
                    {isZh ? typeInfo?.zh : typeInfo?.en}
                  </span>
                </div>
                <p className="text-xs font-bold truncate" style={{ color: "#92400e" }}>{nft.metaName || nft.name}</p>
                <p className="text-xs font-mono mt-0.5" style={{ color: "#d97706" }}>#{nft.tokenId}</p>
                {nft.description && (
                  <p className="text-xs mt-1.5 leading-relaxed line-clamp-2" style={{ color: "#b45309" }}>{nft.description}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>

      {/* NFT 放大 Modal */}
      {selectedNft && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(12px)" }}
          onClick={() => setSelectedNft(null)}>
          <div className="relative max-w-md w-full rounded-3xl overflow-hidden"
            style={{ background: "#fffbf5", border: "1px solid rgba(249,115,22,0.2)", boxShadow: "0 20px 60px rgba(0,0,0,0.4)" }}
            onClick={e => e.stopPropagation()}>
            <button onClick={() => setSelectedNft(null)}
              className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full flex items-center justify-center"
              style={{ background: "rgba(0,0,0,0.4)", color: "white", cursor: "pointer" }}>
              <X size={16} />
            </button>
            {selectedNft.image ? (
              <img src={selectedNft.image} alt={selectedNft.name} className="w-full object-contain"
                style={{ maxHeight: "60vh", background: "#000" }} />
            ) : (
              <div className="w-full flex items-center justify-center text-8xl py-16"
                style={{ background: "rgba(249,115,22,0.06)" }}>🐱</div>
            )}
            <div className="p-5">
              <div className="flex items-center gap-2 mb-2">
                {(() => { const ti = NFT_TYPE_LABEL[selectedNft.nftType]; return (
                  <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                    style={{ background: `${ti?.color ?? "#888"}18`, color: ti?.color ?? "#888", border: `1px solid ${ti?.color ?? "#888"}30` }}>
                    {isZh ? ti?.zh : ti?.en}
                  </span>
                ); })()}
                <span className="text-xs font-mono ml-auto" style={{ color: "#d97706" }}>#{selectedNft.tokenId}</span>
              </div>
              <p className="font-bold mb-1" style={{ color: "#92400e" }}>{selectedNft.metaName || selectedNft.name}</p>
              {selectedNft.description && (
                <p className="text-sm leading-relaxed" style={{ color: "#b45309" }}>{selectedNft.description}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ── 空状态通用 ────────────────────────────────────────────
function EmptyState({ emoji, titleZh, titleEn, descZh, descEn, isZh }: {
  emoji: string; titleZh: string; titleEn: string; descZh: string; descEn: string; isZh: boolean;
}) {
  return (
    <div className="text-center py-16">
      <div className="text-5xl mb-4">{emoji}</div>
      <p className="font-bold mb-2" style={{ color: "#92400e" }}>{isZh ? titleZh : titleEn}</p>
      <p className="text-sm max-w-xs mx-auto" style={{ color: "#b45309" }}>{isZh ? descZh : descEn}</p>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────
export function MyPage() {
  const { tab } = useParams<{ tab: MyTab }>();
  const navigate = useNavigate();
  const { isConnected, connectWallet, lang, purrBalance } = useApp();
  const isZh = lang === "zh";
  const activeTab = (tab as MyTab) || "donations";

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#fffbf5" }}>
        <Navbar />
        <div className="text-center">
          <div className="text-5xl mb-4">👛</div>
          <p className="font-bold mb-4" style={{ color: "#92400e" }}>{isZh ? "请先连接钱包" : "Connect wallet first"}</p>
          <button onClick={connectWallet} className="px-6 py-3 rounded-xl text-white font-bold text-sm"
            style={{ background: "linear-gradient(135deg, #F97316, #fbbf24)", cursor: "pointer" }}>
            {isZh ? "连接钱包" : "Connect Wallet"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20" style={{ background: "#fffbf5" }}>
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <button onClick={() => navigate("/dashboard")} className="inline-flex items-center gap-2 mb-6 text-sm"
          style={{ color: "#b45309", cursor: "pointer" }}>
          <ArrowLeft size={16} />{isZh ? "返回档案馆" : "Back"}
        </button>

        <h1 className="text-2xl font-black mb-6" style={{ color: "#92400e", fontFamily: "'Space Grotesk', sans-serif" }}>
          {isZh ? "我的账户" : "My Account"}
        </h1>

        {/* Tab nav */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {TABS.map(t => (
            <button key={t.id} onClick={() => navigate(`/my/${t.id}`)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all"
              style={{
                background: activeTab === t.id ? "rgba(249,115,22,0.15)" : "rgba(249,115,22,0.05)",
                border: activeTab === t.id ? "1px solid rgba(249,115,22,0.35)" : "1px solid rgba(249,115,22,0.1)",
                color: activeTab === t.id ? "#F97316" : "#b45309",
                cursor: "pointer",
              }}>
              {t.icon}
              {isZh ? t.zh : t.en}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="p-6 rounded-3xl" style={{ background: "#fff9f5", border: "1px solid rgba(249,115,22,0.1)" }}>
          {activeTab === "donations" && <DonationsPanel isZh={isZh} />}
          {activeTab === "adoptions" && <AdoptionsPanel isZh={isZh} />}
          {activeTab === "nfts" && <NFTPanel isZh={isZh} />}
          {activeTab === "topup" && <TopupPanel isZh={isZh} purrBalance={purrBalance} />}
        </div>
      </div>
    </div>
  );
}
