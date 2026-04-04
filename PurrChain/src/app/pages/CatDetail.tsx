import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { ethers } from "ethers";
import {
  ArrowLeft, Heart, Home, Gamepad2, MapPin,
  AlertCircle, CheckCircle, X, Loader2, ExternalLink,
  Info, Clock, CreditCard, XCircle, RotateCcw
} from "lucide-react";
import { Navbar } from "../components/Navbar";
import { useApp } from "../context/AppContext";
import { getContracts, getReadonlyContracts, ADDRESSES } from "../../lib/contracts";
import { chainStatusToLocal, getStatusLabel, type ChainCat, type CatStatus } from "../data/cats";

// ============================================================
//  ApplicationStatus 枚举（与合约一致）
// ============================================================
// 0=Applied 1=Approved 2=DepositPaid 3=PendingReturn 4=Completed 5=Failed 6=Cancelled
const APP_STATUS_LABEL = {
  zh: ["已申请·待机构审批", "审批通过·待缴保证金", "已缴款·等待回访", "取消申请·待机构确认", "领养完成", "领养失败", "已取消"],
  en: ["Applied · Awaiting Shelter", "Approved · Pay Deposit", "Deposit Paid · Awaiting Visit", "Cancelling · Awaiting Shelter", "Completed", "Failed", "Cancelled"],
};
const APP_STATUS_COLOR = ["#d97706","#16a34a","#a855f7","#ef4444","#16a34a","#888","#888"];

interface AppInfo {
  applicant: string;
  catId: bigint;
  depositAmount: bigint;
  depositTimestamp: bigint;
  cancelTimestamp: bigint;
  status: number; // 0~6
}

// ============================================================
//  从链上读单只猫
// ============================================================
function useCat(id: number) {
  const [cat, setCat] = useState<ChainCat | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const c = getReadonlyContracts();
        const raw = await c.catRegistry.getCat(id) as {
          name: string; age: bigint; gender: string; description: string;
          stageURIs: string[]; shelter: string; status: number;
        };
        const uris = Array.from(raw.stageURIs) as string[];
        const stage = (uris.reduce((last, uri, idx) =>
          uri && uri !== "" ? idx + 1 : last, 1)) as 1 | 2 | 3 | 4;

        // 读取机构地点
        let shelterLocation = "";
        try {
          const shelterInfo = await c.catRegistry.shelters(raw.shelter) as { name: string; location: string };
          shelterLocation = shelterInfo.location ?? "";
        } catch { /* ignore */ }

        // 辅助函数：从 IPFS URI 取图片 URL
        const fetchImageFromUri = async (uri: string): Promise<string> => {
          if (!uri) return "";
          try {
            const httpUri = uri.startsWith("ipfs://") ? uri.replace("ipfs://", "https://ipfs.io/ipfs/") : uri;
            const res = await fetch(httpUri, { signal: AbortSignal.timeout(8000) });
            const json = await res.json() as { image?: string };
            if (json.image) return json.image.startsWith("ipfs://") ? json.image.replace("ipfs://", "https://ipfs.io/ipfs/") : json.image;
          } catch { /* fallback */ }
          return "";
        };

        const fallbackImg = "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=600&q=80";
        const firstUri = uris.find(u => u && u !== "") ?? "";
        const image = (await fetchImageFromUri(firstUri)) || fallbackImg;

        setCat({
          id, name: raw.name, age: Number(raw.age),
          gender: raw.gender === "female" ? "female" : "male",
          description: raw.description, stageURIs: uris,
          shelter: raw.shelter, shelterLocation,
          status: chainStatusToLocal(raw.status),
          image, stage, isOnChain: true,
        });
      } catch { setCat(null); }
      finally { setLoading(false); }
    };
    load();
  }, [id]);

  return { cat, loading };
}

// ============================================================
//  Modal 组件
// ============================================================
function Modal({ onClose, title, children }: {
  onClose: () => void; title: string; children: React.ReactNode
}) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(8px)" }}>
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="relative w-full max-w-md rounded-3xl p-6"
        style={{ background: "#fffbf5", border: "1px solid rgba(249,115,22,0.2)", boxShadow: "0 20px 60px rgba(249,115,22,0.15)" }}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold" style={{ color: "#92400e" }}>{title}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg"
            style={{ background: "rgba(249,115,22,0.08)", color: "#b45309", cursor: "pointer" }}>
            <X size={15} />
          </button>
        </div>
        {children}
      </motion.div>
    </div>
  );
}

// ============================================================
//  主组件
// ============================================================
export function CatDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    isConnected, connectWallet, signer, walletAddress,
    starterCatClaimed, claimStarterCat, starterCatId,
    purrBalance, lang,
  } = useApp();

  const isZh = lang === "zh";
  const catId = Number(id);
  const { cat, loading } = useCat(catId);

  // 阶段图片切换
  const [selectedStage, setSelectedStage] = useState<number | null>(null);
  const [stageImages, setStageImages] = useState<Record<number, string>>({});

  // Modal 状态
  const [showAdoptModal,  setShowAdoptModal]  = useState(false);
  const [showDonateModal, setShowDonateModal] = useState(false);
  const [showGameModal,   setShowGameModal]   = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showCancelModal,  setShowCancelModal]  = useState(false);

  // 交易状态
  const [txLoading, setTxLoading] = useState(false);
  const [txSuccess, setTxSuccess] = useState<string | null>(null);
  const [txError,   setTxError]   = useState<string | null>(null);

  // 捐款数据
  const [donateAmount,    setDonateAmount]    = useState("0.1");
  const [donationTotal,   setDonationTotal]   = useState("0");
  const [remainingToNext, setRemainingToNext] = useState("0.1");
  const [donateNFTNotice, setDonateNFTNotice] = useState<string | null>(null);

  // 领养申请数据
  const [appInfo,       setAppInfo]       = useState<AppInfo | null>(null);
  const [depositAmount, setDepositAmount] = useState("0.1");
  const [lockRemaining, setLockRemaining] = useState<number>(0);

  // 加载各阶段图片
  useEffect(() => {
    if (!cat) return;
    const fetchStageImg = async (uri: string, stage: number) => {
      if (!uri) return;
      try {
        const httpUri = uri.startsWith("ipfs://") ? uri.replace("ipfs://", "https://ipfs.io/ipfs/") : uri;
        const res = await fetch(httpUri, { signal: AbortSignal.timeout(8000) });
        const json = await res.json() as { image?: string };
        if (json.image) {
          const imgUrl = json.image.startsWith("ipfs://") ? json.image.replace("ipfs://", "https://ipfs.io/ipfs/") : json.image;
          setStageImages(prev => ({ ...prev, [stage]: imgUrl }));
        }
      } catch { /* ignore */ }
    };
    cat.stageURIs.forEach((uri, idx) => { if (uri) fetchStageImg(uri, idx + 1); });
  }, [cat]);

  // 读取申请状态
  const loadAppInfo = useCallback(async () => {
    try {
      const c = getReadonlyContracts();
      const raw = await c.adoptionVault.getApplication(catId) as AppInfo;
      setAppInfo(raw);
      const da = await c.adoptionVault.adoptionDepositAmount();
      setDepositAmount(parseFloat(ethers.formatEther(da as bigint)).toString());
      if (Number(raw.status) === 2) {
        const rem = await c.adoptionVault.remainingLockTime(catId);
        setLockRemaining(Number(rem));
      }
    } catch { setAppInfo(null); }
  }, [catId]);

  // 读取捐款数据
  useEffect(() => {
    if (!walletAddress || !cat) return;
    const c = getReadonlyContracts();
    c.donationVault.userCatDonation(walletAddress, catId)
      .then(v => setDonationTotal(parseFloat(ethers.formatEther(v as bigint)).toFixed(3)))
      .catch(() => {});
    c.donationVault.remainingToNextMint(walletAddress, catId)
      .then(v => setRemainingToNext(parseFloat(ethers.formatEther(v as bigint)).toFixed(3)))
      .catch(() => {});
  }, [walletAddress, catId, cat]);

  useEffect(() => { loadAppInfo(); }, [loadAppInfo]);

  // ── 判断当前用户和猫的关系 ──────────────────────────────
  const myApp = appInfo && appInfo.applicant.toLowerCase() === walletAddress?.toLowerCase()
    ? appInfo : null;
  const appStatus = myApp ? Number(myApp.status) : -1;

  // 捐款：Available / CloudAdopted / PendingAdoption 均可（Adopted / Closed 不行）
  const canDonate = cat?.status === "available" || cat?.status === "cloudAdopted" || cat?.status === "pendingAdoption";
  // 申请领养：Available 或 CloudAdopted
  const canApply  = cat?.status === "available" || cat?.status === "cloudAdopted";
  // 已关闭机构的猫，禁止所有交互
  const isClosed  = cat?.status === "closed";
  // 是否已有我的申请在进行中
  const hasActiveApp = appStatus >= 0 && appStatus <= 3;

  // ── 交易封装 ──────────────────────────────────────────────
  const tx = async (label: string, fn: () => Promise<ethers.ContractTransactionResponse>) => {
    if (!signer) { setTxError(isZh ? "请先连接钱包" : "Connect wallet first"); return false; }
    setTxLoading(true); setTxError(null); setTxSuccess(null);
    try {
      const res = await fn();
      await res.wait();
      setTxSuccess(label);
      await loadAppInfo();
      return true;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "";
      if (!msg.includes("user rejected")) {
        let friendly = msg.slice(0, 100);
        if (msg.includes("not available for adoption")) friendly = isZh ? "该猫咪当前状态不允许申请领养" : "Cat not available for adoption";
        if (msg.includes("application already exists")) friendly = isZh ? "已存在进行中的申请" : "Application already exists";
        if (msg.includes("not approved yet"))           friendly = isZh ? "申请尚未被机构审批通过" : "Application not approved yet";
        if (msg.includes("incorrect deposit amount"))   friendly = isZh ? "保证金金额不正确" : "Incorrect deposit amount";
        if (msg.includes("cat not available"))          friendly = isZh ? "该猫咪当前不接受捐款" : "Cat not available for donation";
        setTxError(friendly);
      }
      return false;
    } finally { setTxLoading(false); }
  };

  const handleApply = () => tx(
    isZh ? "领养申请已提交！等待机构审核" : "Application submitted! Awaiting shelter review",
    () => getContracts(signer!).adoptionVault.applyAdoption(catId) as Promise<ethers.ContractTransactionResponse>
  ).then(ok => { if (ok) { setTimeout(() => { setShowAdoptModal(false); setTxSuccess(null); }, 2500); } });

  const handlePayDeposit = () => tx(
    isZh ? "保证金已缴纳！等待一年回访" : "Deposit paid! Awaiting home visit.",
    () => getContracts(signer!).adoptionVault.payDeposit(catId, { value: ethers.parseEther(depositAmount) }) as Promise<ethers.ContractTransactionResponse>
  ).then(ok => { if (ok) { setTimeout(() => { setShowDepositModal(false); setTxSuccess(null); }, 2500); } });

  const handleCancel = () => tx(
    isZh ? "已发起取消，等待机构确认归还" : "Cancellation requested, awaiting shelter confirmation",
    () => getContracts(signer!).adoptionVault.cancelAdoption(catId) as Promise<ethers.ContractTransactionResponse>
  ).then(ok => { if (ok) { setTimeout(() => { setShowCancelModal(false); setTxSuccess(null); }, 2500); } });

  const handleForceWithdraw = () => tx(
    isZh ? "已强制取回保证金" : "Deposit force-withdrawn",
    () => getContracts(signer!).adoptionVault.forceWithdraw(catId) as Promise<ethers.ContractTransactionResponse>
  );

  const handleDonate = () => {
    // 捐款前记录当前阶段
    const prevStagePromise = walletAddress
      ? getReadonlyContracts().donationVault.donationStage(walletAddress, catId).catch(() => 0n)
      : Promise.resolve(0n);

    return tx(
      isZh ? `感谢您的爱心！已捐赠 ${donateAmount} AVAX` : `Donated ${donateAmount} AVAX!`,
      () => getContracts(signer!).donationVault.donate(catId, { value: ethers.parseEther(donateAmount) }) as Promise<ethers.ContractTransactionResponse>
    ).then(async (ok) => {
      if (ok) {
        const c2 = getReadonlyContracts();
        const [t, r, prevStage, newStage] = await Promise.all([
          c2.donationVault.userCatDonation(walletAddress!, catId),
          c2.donationVault.remainingToNextMint(walletAddress!, catId),
          prevStagePromise,
          c2.donationVault.donationStage(walletAddress!, catId),
        ]);
        setDonationTotal(parseFloat(ethers.formatEther(t as bigint)).toFixed(3));
        setRemainingToNext(parseFloat(ethers.formatEther(r as bigint)).toFixed(3));

        // 判断是否获得了新NFT
        const prev = Number(prevStage);
        const next = Number(newStage);
        if (next > prev) {
          if (next >= 3) {
            // 已满级
            setDonateNFTNotice(isZh ? "💝 感谢您长期的爱心支持！" : "💝 Thank you for your continued support!");
          } else {
            setDonateNFTNotice(isZh ? `🎉 您已获得新的 NFT（Stage ${next}），可在「我的 NFT」中查看！` : `🎉 You got a new NFT (Stage ${next})! Check "My NFTs".`);
          }
          setTimeout(() => setDonateNFTNotice(null), 6000);
        }
        setTimeout(() => { setShowDonateModal(false); setTxSuccess(null); }, 2000);
      }
    });
  };

  const handleGameEnter = async () => {
    if (!starterCatClaimed) await claimStarterCat(catId);
    setShowGameModal(false);
    navigate(`/game/${catId}`);
  };

  // ── 辅助：格式化倒计时 ────────────────────────────────────
  const formatDuration = (secs: number) => {
    const d = Math.floor(secs / 86400);
    const h = Math.floor((secs % 86400) / 3600);
    return isZh ? `${d} 天 ${h} 小时` : `${d}d ${h}h`;
  };

  // ── 渲染：领养操作区 ──────────────────────────────────────
  const renderAdoptionSection = () => {
    if (!isConnected) return null;

    // 有我的进行中申请
    if (hasActiveApp && myApp) {
      const color = APP_STATUS_COLOR[appStatus];
      const label = (isZh ? APP_STATUS_LABEL.zh : APP_STATUS_LABEL.en)[appStatus];
      return (
        <div className="p-4 rounded-2xl" style={{ background: `${color}12`, border: `1px solid ${color}30` }}>
          <div className="flex items-center gap-2 mb-3">
            <Clock size={14} style={{ color }} />
            <span className="text-sm font-bold" style={{ color }}>{isZh ? "我的领养申请" : "My Application"}</span>
          </div>
          <p className="text-xs font-semibold mb-3" style={{ color }}>{label}</p>

          {/* 状态 0: 已申请，等机构审批 */}
          {appStatus === 0 && (
            <p className="text-xs" style={{ color: "#b45309" }}>
              {isZh ? "机构将审核您的申请，审批通过后可缴纳保证金。" : "Shelter will review your application. Pay deposit after approval."}
            </p>
          )}

          {/* 状态 1: 审批通过，待缴款 */}
          {appStatus === 1 && (
            <button onClick={() => setShowDepositModal(true)}
              className="w-full py-3 rounded-xl text-white text-sm font-bold flex items-center justify-center gap-2"
              style={{ background: "linear-gradient(135deg, #16a34a, #15803d)", cursor: "pointer" }}>
              <CreditCard size={15} />
              {isZh ? `缴纳 ${depositAmount} AVAX 保证金` : `Pay ${depositAmount} AVAX Deposit`}
            </button>
          )}

          {/* 状态 2: 已缴款，等回访 */}
          {appStatus === 2 && (
            <div className="space-y-2">
              <p className="text-xs" style={{ color: "#b45309" }}>
                {lockRemaining > 0
                  ? (isZh ? `回访解锁还需：${formatDuration(lockRemaining)}` : `Lock period remaining: ${formatDuration(lockRemaining)}`)
                  : (isZh ? "锁定期已过，等待 Owner 发起回访" : "Lock period elapsed, awaiting owner visit confirmation")}
              </p>
              <button onClick={() => setShowCancelModal(true)}
                className="w-full py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2"
                style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#ef4444", cursor: "pointer" }}>
                <RotateCcw size={13} />
                {isZh ? "申请取消领养" : "Request Cancellation"}
              </button>
            </div>
          )}

          {/* 状态 3: 取消中，等机构确认 */}
          {appStatus === 3 && (
            <div className="space-y-2">
              <p className="text-xs" style={{ color: "#b45309" }}>
                {isZh ? "已发起取消，等待机构确认归还猫咪。机构超过 30 天未处理可强制取回保证金。" : "Cancellation in progress. If shelter doesn't respond in 30 days, you can force withdraw."}
              </p>
              {myApp.cancelTimestamp > 0n && Date.now() / 1000 >= Number(myApp.cancelTimestamp) + 30 * 86400 && (
                <button onClick={handleForceWithdraw} disabled={txLoading}
                  className="w-full py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2"
                  style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)", color: "#dc2626", cursor: "pointer" }}>
                  {txLoading ? <Loader2 size={13} className="animate-spin" /> : <XCircle size={13} />}
                  {isZh ? "强制取回保证金" : "Force Withdraw"}
                </button>
              )}
            </div>
          )}
        </div>
      );
    }

    // 无进行中申请 — 显示申请按钮
    return (
      <button
        onClick={() => canApply && setShowAdoptModal(true)}
        disabled={!canApply}
        className="flex items-center justify-center gap-3 py-4 rounded-2xl transition-all font-bold w-full"
        style={{
          background: canApply ? "rgba(22,163,74,0.12)" : "rgba(136,136,136,0.08)",
          border: canApply ? "1px solid rgba(22,163,74,0.35)" : "1px solid rgba(136,136,136,0.2)",
          color: canApply ? "#16a34a" : "#888",
          cursor: canApply ? "pointer" : "default",
        }}>
        <Home size={20} />
        {!canApply
          ? (isZh ? "🏠 此猫咪已有家" : "🏠 Has a Home")
          : (isZh ? "申请线下领养" : "Apply to Adopt")}
      </button>
    );
  };

  // ── Loading / Not Found ───────────────────────────────────
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "#fffbf5" }}>
      <Navbar />
      <Loader2 size={32} className="animate-spin" style={{ color: "#F97316" }} />
    </div>
  );

  if (!cat) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "#fffbf5" }}>
      <Navbar />
      <div className="text-center pt-20">
        <div className="text-5xl mb-4">😿</div>
        <p className="text-xl font-bold" style={{ color: "#92400e" }}>{isZh ? "找不到这只猫咪" : "Cat not found"}</p>
        <button onClick={() => navigate("/dashboard")} className="mt-4 text-sm" style={{ color: "#F97316", cursor: "pointer" }}>
          ← {isZh ? "返回档案馆" : "Back"}
        </button>
      </div>
    </div>
  );

  const STATUS_COLOR: Record<CatStatus, string> = {
    available: "#16a34a", cloudAdopted: "#F97316",
    pendingAdoption: "#a855f7", adopted: "#888888", closed: "#64748b",
  };
  const statusColor = STATUS_COLOR[cat.status];
  const statusLabel = getStatusLabel(cat.status, lang);
  const isMyStarterCat = starterCatId === cat.id;

  return (
    <div className="min-h-screen pt-20" style={{ background: "#fffbf5" }}>
      <Navbar />

      {/* 全局错误提示 */}
      <AnimatePresence>
        {txError && (
          <motion.div
            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-[200] px-6 py-3 rounded-2xl text-sm flex items-center gap-2"
            style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)", color: "#dc2626", backdropFilter: "blur(12px)", maxWidth: "90vw" }}>
            <AlertCircle size={14} />{txError}
            <button onClick={() => setTxError(null)} style={{ cursor: "pointer" }}><X size={12} /></button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-5xl mx-auto px-6 py-8">
        <button onClick={() => navigate("/dashboard")} className="inline-flex items-center gap-2 mb-6 text-sm" style={{ color: "#b45309", cursor: "pointer" }}>
          <ArrowLeft size={16} />{isZh ? "返回档案馆" : "Back to Registry"}
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* ── 左栏：图片 ── */}
          <div>
            <div className="relative rounded-2xl overflow-hidden" style={{ aspectRatio: "1" }}>
              <img
                src={selectedStage ? (stageImages[selectedStage] || cat.image) : cat.image}
                alt={cat.name} className="w-full h-full object-cover"
                style={{ transition: "opacity 0.3s" }}
              />
              <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(146,64,14,0.6), transparent 60%)" }} />
              <div className="absolute bottom-4 left-4 right-4 flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-semibold"
                  style={{ background: `${statusColor}20`, color: statusColor, border: `1px solid ${statusColor}40` }}>
                  {(cat.status === "adopted" || cat.status === "pendingAdoption") && <Home size={10} className="inline mr-1" />}
                  {statusLabel}
                </span>
                <span className="px-3 py-1 rounded-full text-xs"
                  style={{ background: "rgba(249,115,22,0.2)", color: "#F97316", border: "1px solid rgba(249,115,22,0.3)" }}>
                  Stage {cat.stage}
                </span>
              </div>
            </div>

            {/* 成长阶段 — 可点击切换图片 */}
            <div className="mt-4 p-4 rounded-2xl" style={{ background: "rgba(249,115,22,0.04)", border: "1px solid rgba(249,115,22,0.1)" }}>
              <p className="text-sm mb-3 font-semibold" style={{ color: "#F97316" }}>{isZh ? "点击阶段查看对应照片" : "Click stage to view photo"}</p>
              <div className="flex gap-2">
                {[{ n: 1, zh: "幼猫", en: "Kitten" }, { n: 2, zh: "少年", en: "Junior" }, { n: 3, zh: "成年", en: "Adult" }, { n: 4, zh: "✨Genesis", en: "✨Genesis" }].map(({ n, zh, en }) => {
                  const hasUri = cat.stageURIs[n - 1] && cat.stageURIs[n - 1] !== "";
                  const isSelected = selectedStage === n;
                  const isUnlocked = n <= cat.stage;
                  return (
                    <button key={n}
                      onClick={() => {
                        if (!hasUri) return;
                        setSelectedStage(isSelected ? null : n);
                      }}
                      className="flex-1 py-2 px-1 rounded-xl text-center text-xs font-bold transition-all"
                      style={{
                        background: isSelected ? "rgba(249,115,22,0.3)" : isUnlocked ? "rgba(249,115,22,0.15)" : "rgba(249,115,22,0.04)",
                        border: isSelected ? "2px solid rgba(249,115,22,0.7)" : isUnlocked ? "1px solid rgba(249,115,22,0.35)" : "1px solid rgba(249,115,22,0.1)",
                        color: isUnlocked ? "#F97316" : "#d4a57a",
                        cursor: hasUri ? "pointer" : "default",
                        transform: isSelected ? "scale(1.05)" : "scale(1)",
                      }}>
                      {isZh ? zh : en}
                    </button>
                  );
                })}
              </div>
              {selectedStage && !stageImages[selectedStage] && cat.stageURIs[selectedStage - 1] && (
                <p className="text-xs mt-2 text-center" style={{ color: "#b45309" }}>
                  {isZh ? "图片加载中…" : "Loading image…"}
                </p>
              )}
            </div>

            {/* 链上信息 */}
            <div className="mt-4 p-4 rounded-2xl text-xs space-y-1.5"
              style={{ background: "rgba(249,115,22,0.04)", border: "1px solid rgba(249,115,22,0.1)" }}>
              <p className="font-semibold" style={{ color: "#F97316" }}>🔗 {isZh ? "链上信息" : "On-chain"} (Fuji)</p>
              <p style={{ color: "#b45309" }}>Cat ID: #{cat.id}</p>
              <p className="font-mono" style={{ color: "#b45309" }}>{cat.shelter.slice(0, 10)}...{cat.shelter.slice(-6)}</p>
              <a href={`https://testnet.snowtrace.io/address/${ADDRESSES.catRegistry}`}
                target="_blank" rel="noreferrer" className="flex items-center gap-1 mt-1" style={{ color: "#F97316" }}>
                <ExternalLink size={10} />{isZh ? "在浏览器查看" : "View on Explorer"}
              </a>
            </div>
          </div>

          {/* ── 右栏：信息+操作 ── */}
          <div className="flex flex-col gap-5">
            <div>
              <h1 className="text-4xl mb-1 font-black" style={{ color: "#92400e", fontFamily: "'Space Grotesk', sans-serif" }}>{cat.name}</h1>
              <p className="text-sm" style={{ color: "#b45309" }}>
                {cat.gender === "male" ? (isZh ? "♂ 公猫" : "♂ Male") : (isZh ? "♀ 母猫" : "♀ Female")}
                {" · "}
                {cat.age < 1
                  ? (isZh ? `${Math.round(cat.age * 12)} 月龄` : `${Math.round(cat.age * 12)}mo`)
                  : (isZh ? `${cat.age} 岁` : `${cat.age}yr`)}
              </p>
            </div>

            <div className="flex items-center gap-2 text-sm" style={{ color: "#92400e" }}>
              <MapPin size={14} style={{ color: "#F97316" }} />
              <span>{isZh ? "收容机构：" : "Shelter: "}
                <span className="font-mono text-xs" style={{ color: "#F97316" }}>
                  {cat.shelter.slice(0, 6)}...{cat.shelter.slice(-4)}
                </span>
              </span>
            </div>

            {/* 机构地点 */}
            {cat.shelterLocation && (
              <div className="flex items-center gap-2 text-sm -mt-3" style={{ color: "#b45309" }}>
                <MapPin size={13} style={{ color: "#F97316", opacity: 0.6 }} />
                <span>{isZh ? "地点：" : "Location: "}<span style={{ color: "#92400e" }}>{cat.shelterLocation}</span></span>
              </div>
            )}

            <div className="p-5 rounded-2xl" style={{ background: "rgba(249,115,22,0.04)", border: "1px solid rgba(249,115,22,0.1)" }}>
              <p className="text-sm leading-relaxed" style={{ color: "#78350f" }}>{cat.description}</p>
            </div>

            {/* 捐款后NFT提示 */}
            <AnimatePresence>
              {donateNFTNotice && (
                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="px-4 py-3 rounded-2xl text-sm font-semibold flex items-center gap-2"
                  style={{ background: "rgba(22,163,74,0.1)", border: "1px solid rgba(22,163,74,0.25)", color: "#16a34a" }}>
                  <CheckCircle size={15} />{donateNFTNotice}
                </motion.div>
              )}
            </AnimatePresence>

            {/* 捐款进度 */}
            {walletAddress && canDonate && (
              <div className="p-4 rounded-2xl" style={{ background: "rgba(249,115,22,0.07)", border: "1px solid rgba(249,115,22,0.15)" }}>
                <div className="flex items-center gap-2 mb-1">
                  <Heart size={14} color="#F97316" />
                  <span className="text-sm font-bold" style={{ color: "#F97316" }}>{isZh ? "我的捐款进度" : "My Donation"}</span>
                </div>
                <p className="text-xs" style={{ color: "#b45309" }}>
                  {isZh ? "已累计：" : "Total: "}<span style={{ color: "#F97316" }}>{donationTotal} AVAX</span>
                  {" · "}{isZh ? "距下阶段：" : "Next: "}<span style={{ color: "#16a34a" }}>{remainingToNext} AVAX</span>
                </p>
              </div>
            )}

            {!isConnected ? (
              <button onClick={connectWallet} className="w-full py-4 rounded-2xl text-white font-bold"
                style={{ background: "linear-gradient(135deg, #F97316, #fbbf24)", cursor: "pointer" }}>
                {isZh ? "🔗 连接钱包以互动" : "Connect Wallet"}
              </button>
            ) : isClosed ? (
              <div className="p-4 rounded-2xl text-center"
                style={{ background: "rgba(100,116,139,0.08)", border: "1px solid rgba(100,116,139,0.2)" }}>
                <p className="text-sm font-semibold" style={{ color: "#64748b" }}>
                  🔒 {isZh ? "该机构已关闭，猫咪档案仅供查看" : "Shelter closed — archive view only"}
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {/* 领养区 */}
                {renderAdoptionSection()}

                {/* 捐款 + 游戏 */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => canDonate && setShowDonateModal(true)}
                    disabled={!canDonate}
                    className="flex items-center justify-center gap-2 py-4 rounded-2xl transition-all font-semibold"
                    style={{
                      background: canDonate ? "rgba(249,115,22,0.12)" : "rgba(136,136,136,0.06)",
                      border: canDonate ? "1px solid rgba(249,115,22,0.3)" : "1px solid rgba(136,136,136,0.15)",
                      color: canDonate ? "#F97316" : "#888",
                      cursor: canDonate ? "pointer" : "default",
                    }}>
                    <Heart size={18} />
                    {canDonate ? (isZh ? "爱心捐款" : "Donate") : (isZh ? "不可捐款" : "Closed")}
                  </button>

                  <button onClick={() => setShowGameModal(true)}
                    className="flex items-center justify-center gap-2 py-4 rounded-2xl transition-all font-semibold"
                    style={{ background: "rgba(168,85,247,0.12)", border: "1px solid rgba(168,85,247,0.3)", color: "#a855f7", cursor: "pointer" }}>
                    <Gamepad2 size={18} />{isZh ? "进入游戏" : "Play Game"}
                  </button>
                </div>

                {/* 捐款说明 */}
                {!canDonate && cat.status !== "adopted" && (
                  <div className="flex items-start gap-2 px-3 py-2.5 rounded-xl text-xs"
                    style={{ background: "rgba(249,115,22,0.05)", border: "1px solid rgba(249,115,22,0.12)", color: "#b45309" }}>
                    <Info size={12} className="mt-0.5 flex-shrink-0" />
                    {isZh ? "仅 Available / CloudAdopted 状态的猫咪可接受捐款" : "Donations only available when cat is Available or CloudAdopted"}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── 申请领养 Modal ── */}
      <AnimatePresence>
        {showAdoptModal && (
          <Modal onClose={() => { setShowAdoptModal(false); setTxSuccess(null); setTxError(null); }}
            title={isZh ? "🏠 申请线下领养" : "Apply to Adopt"}>
            <p className="text-sm mb-4 leading-relaxed" style={{ color: "#78350f" }}>
              {isZh
                ? "提交申请后，机构将审核您的资质。审核通过后需在链上缴纳保证金，一年回访通过后退还并获得 Genesis NFT。"
                : "Shelter will review your application. On approval, pay a deposit. After a 1-year home visit, you'll get your deposit back + Genesis NFT."}
            </p>
            {[
              { zh: "提交申请 → 猫咪状态变为申请中", en: "Submit → Cat status = Pending" },
              { zh: "机构审核通过 → 缴纳 " + depositAmount + " AVAX 保证金", en: "Shelter approves → Pay " + depositAmount + " AVAX deposit" },
              { zh: "一年后回访通过 → 退还保证金 + Genesis NFT", en: "Home visit passed → Deposit returned + Genesis NFT" },
            ].map((s, i) => (
              <div key={i} className="flex items-start gap-3 mb-2">
                <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-xs mt-0.5 font-bold"
                  style={{ background: "rgba(22,163,74,0.15)", color: "#16a34a" }}>{i + 1}</div>
                <p className="text-sm" style={{ color: "#78350f" }}>{isZh ? s.zh : s.en}</p>
              </div>
            ))}
            {txError && <p className="text-xs text-red-500 mt-3">{txError}</p>}
            <div className="mt-4">
              {txSuccess ? (
                <div className="flex items-center justify-center gap-2 py-3 rounded-xl"
                  style={{ background: "rgba(22,163,74,0.1)", color: "#16a34a" }}>
                  <CheckCircle size={16} /><span className="text-sm">{txSuccess}</span>
                </div>
              ) : (
                <button onClick={handleApply} disabled={txLoading}
                  className="w-full py-4 rounded-xl text-white font-bold flex items-center justify-center gap-2"
                  style={{ background: "linear-gradient(135deg, #16a34a, #15803d)", cursor: "pointer", opacity: txLoading ? 0.7 : 1 }}>
                  {txLoading && <Loader2 size={16} className="animate-spin" />}
                  {isZh ? "确认提交领养申请" : "Submit Application"}
                </button>
              )}
            </div>
          </Modal>
        )}
      </AnimatePresence>

      {/* ── 缴纳保证金 Modal ── */}
      <AnimatePresence>
        {showDepositModal && (
          <Modal onClose={() => { setShowDepositModal(false); setTxSuccess(null); setTxError(null); }}
            title={isZh ? "💳 缴纳领养保证金" : "Pay Adoption Deposit"}>
            <div className="p-4 rounded-2xl mb-4" style={{ background: "rgba(22,163,74,0.07)", border: "1px solid rgba(22,163,74,0.2)" }}>
              <p className="text-sm font-bold mb-1" style={{ color: "#16a34a" }}>
                {isZh ? `保证金金额：${depositAmount} AVAX` : `Deposit: ${depositAmount} AVAX`}
              </p>
              <p className="text-xs" style={{ color: "#b45309" }}>
                {isZh ? "保证金锁定 1 年，回访通过后全额退还 + 获得 Genesis NFT" : "Locked for 1 year. Returned + Genesis NFT after home visit."}
              </p>
            </div>
            {txError && <p className="text-xs text-red-500 mb-3">{txError}</p>}
            {txSuccess ? (
              <div className="flex items-center justify-center gap-2 py-3 rounded-xl"
                style={{ background: "rgba(22,163,74,0.1)", color: "#16a34a" }}>
                <CheckCircle size={16} /><span className="text-sm">{txSuccess}</span>
              </div>
            ) : (
              <button onClick={handlePayDeposit} disabled={txLoading}
                className="w-full py-4 rounded-xl text-white font-bold flex items-center justify-center gap-2"
                style={{ background: "linear-gradient(135deg, #16a34a, #15803d)", cursor: "pointer", opacity: txLoading ? 0.7 : 1 }}>
                {txLoading && <Loader2 size={16} className="animate-spin" />}
                {isZh ? `确认缴纳 ${depositAmount} AVAX` : `Pay ${depositAmount} AVAX`}
              </button>
            )}
          </Modal>
        )}
      </AnimatePresence>

      {/* ── 取消领养 Modal ── */}
      <AnimatePresence>
        {showCancelModal && (
          <Modal onClose={() => { setShowCancelModal(false); setTxSuccess(null); setTxError(null); }}
            title={isZh ? "↩ 申请取消领养" : "Request Cancellation"}>
            <div className="p-4 rounded-2xl mb-4" style={{ background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.2)" }}>
              <p className="text-sm" style={{ color: "#78350f" }}>
                {isZh
                  ? "取消后机构将确认猫咪归还情况。健康归还全额退款；不健康则保证金转给机构。机构 30 天内未处理可强制取回保证金。"
                  : "Shelter will confirm cat return. Full refund if healthy, deposit to shelter if not. Force withdraw after 30 days if no response."}
              </p>
            </div>
            {txError && <p className="text-xs text-red-500 mb-3">{txError}</p>}
            {txSuccess ? (
              <div className="flex items-center justify-center gap-2 py-3 rounded-xl"
                style={{ background: "rgba(22,163,74,0.1)", color: "#16a34a" }}>
                <CheckCircle size={16} /><span className="text-sm">{txSuccess}</span>
              </div>
            ) : (
              <button onClick={handleCancel} disabled={txLoading}
                className="w-full py-4 rounded-xl text-white font-bold flex items-center justify-center gap-2"
                style={{ background: "linear-gradient(135deg, #ef4444, #dc2626)", cursor: "pointer", opacity: txLoading ? 0.7 : 1 }}>
                {txLoading && <Loader2 size={16} className="animate-spin" />}
                {isZh ? "确认申请取消领养" : "Confirm Cancellation"}
              </button>
            )}
          </Modal>
        )}
      </AnimatePresence>

      {/* ── 捐款 Modal ── */}
      <AnimatePresence>
        {showDonateModal && (
          <Modal onClose={() => { setShowDonateModal(false); setTxSuccess(null); setTxError(null); }}
            title={isZh ? `💝 捐款给 ${cat.name}` : `Donate to ${cat.name}`}>
            <p className="text-sm mb-4 leading-relaxed" style={{ color: "#78350f" }}>
              {isZh
                ? "捐款通过 DonationVault 直接转入机构钱包，平台完全不经手。每累计 0.1 AVAX 自动解锁成长阶段 NFT。"
                : "Funds go directly to the shelter. Every 0.1 AVAX = one Growth NFT auto-minted."}
            </p>
            <div className="flex gap-2 mb-3">
              {["0.05", "0.1", "0.5", "1.0"].map(v => (
                <button key={v} onClick={() => setDonateAmount(v)} className="flex-1 py-2 rounded-xl text-sm font-semibold"
                  style={{
                    background: donateAmount === v ? "rgba(249,115,22,0.15)" : "rgba(249,115,22,0.05)",
                    border: donateAmount === v ? "1px solid rgba(249,115,22,0.4)" : "1px solid rgba(249,115,22,0.12)",
                    color: donateAmount === v ? "#F97316" : "#b45309", cursor: "pointer",
                  }}>{v}</button>
              ))}
            </div>
            <input value={donateAmount} onChange={e => setDonateAmount(e.target.value)}
              type="number" step="0.01" min="0.01"
              className="w-full px-4 py-3 rounded-xl outline-none mb-3 text-sm"
              style={{ background: "rgba(249,115,22,0.05)", border: "1px solid rgba(249,115,22,0.2)", color: "#F97316" }} />
            <div className="p-3 rounded-xl mb-4 text-sm"
              style={{ background: "rgba(249,115,22,0.05)", border: "1px solid rgba(249,115,22,0.12)", color: "#b45309" }}>
              {isZh ? "已累计：" : "Total: "}<span style={{ color: "#F97316" }}>{donationTotal} AVAX</span>
              {" · "}{isZh ? "距下阶段：" : "Next: "}<span style={{ color: "#16a34a" }}>{remainingToNext} AVAX</span>
            </div>
            {txError && <p className="text-xs text-red-500 mb-2">{txError}</p>}
            {txSuccess ? (
              <div className="flex items-center justify-center gap-2 py-3 rounded-xl"
                style={{ background: "rgba(249,115,22,0.1)", color: "#F97316" }}>
                <Heart size={16} /><span className="text-sm">{txSuccess}</span>
              </div>
            ) : (
              <button onClick={handleDonate} disabled={txLoading || !parseFloat(donateAmount)}
                className="w-full py-4 rounded-xl text-white font-bold flex items-center justify-center gap-2"
                style={{ background: "linear-gradient(135deg, #F97316, #fbbf24)", cursor: "pointer", opacity: txLoading ? 0.7 : 1 }}>
                {txLoading && <Loader2 size={16} className="animate-spin" />}
                {txLoading ? (isZh ? "链上处理中..." : "Processing...") : (isZh ? `❤️ 捐款 ${donateAmount} AVAX` : `Donate ${donateAmount} AVAX`)}
              </button>
            )}
          </Modal>
        )}
      </AnimatePresence>

      {/* ── 游戏 Modal ── */}
      <AnimatePresence>
        {showGameModal && (
          <Modal onClose={() => setShowGameModal(false)} title={isZh ? "🎮 进入游戏" : "Enter Game"}>
            <div className="text-center">
              <div className="w-24 h-24 mx-auto mb-4 rounded-2xl overflow-hidden"
                style={{ boxShadow: "0 0 30px rgba(249,115,22,0.3)" }}>
                <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
              </div>
              <p className="text-sm mb-3 font-bold" style={{ color: "#92400e" }}>
                {isZh ? `选择 ${cat.name} 作为游戏伙伴` : `Choose ${cat.name} as companion`}
              </p>
              {!starterCatClaimed ? (
                <div className="space-y-2 mb-4 text-left">
                  {[
                    {
                      icon: "🎲",
                      zh: `随机获得 ${cat.name} 的一张成长阶段 NFT（免费）`,
                      en: `Get a random Growth Stage NFT for ${cat.name} (free)`,
                    },
                    { icon: "🎮", zh: "解锁放置类游戏", en: "Unlock idle game" },
                  ].map(item => (
                    <div key={item.zh} className="flex items-center gap-2 px-3 py-2 rounded-xl"
                      style={{ background: "rgba(249,115,22,0.08)", border: "1px solid rgba(249,115,22,0.15)" }}>
                      <span>{item.icon}</span>
                      <span className="text-xs font-medium" style={{ color: "#78350f" }}>{isZh ? item.zh : item.en}</span>
                    </div>
                  ))}
                  <p className="text-xs px-1" style={{ color: "#b45309" }}>
                    {isZh
                      ? "💡 NFT 阶段随机，取决于该猫咪当前已有的成长图片"
                      : "💡 NFT stage is random based on available growth images"}
                  </p>
                </div>
              ) : isMyStarterCat ? (
                <p className="text-sm mb-4" style={{ color: "#b45309" }}>
                  {isZh ? `继续与 ${cat.name} 的冒险！` : `Continue with ${cat.name}!`}
                </p>
              ) : (
                <div className="p-3 rounded-xl mb-4 text-left"
                  style={{ background: "rgba(249,115,22,0.08)", border: "1px solid rgba(249,115,22,0.2)" }}>
                  <p className="text-xs" style={{ color: "#b45309" }}>
                    {isZh ? `已有初始猫咪，将切换到 ${cat.name}（余额: ${purrBalance} PURR）`
                      : `Will switch to ${cat.name} (Balance: ${purrBalance} PURR)`}
                  </p>
                </div>
              )}
              <button onClick={handleGameEnter} disabled={txLoading}
                className="w-full py-4 rounded-xl text-white font-bold flex items-center justify-center gap-2"
                style={{ background: "linear-gradient(135deg, #F97316, #fbbf24)", cursor: "pointer", opacity: txLoading ? 0.7 : 1 }}>
                {txLoading && <Loader2 size={16} className="animate-spin" />}
                🚀 {isZh ? "出发！" : "Let's go!"}
              </button>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
}
