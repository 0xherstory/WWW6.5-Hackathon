import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { Plus, CheckCircle, AlertCircle, X, Loader2, ExternalLink, Cat, Home, Clock, ChevronDown, ChevronUp } from "lucide-react";
import { Navbar } from "../components/Navbar";
import { useApp } from "../context/AppContext";
import { getContracts, getReadonlyContracts, ADDRESSES } from "../../lib/contracts";
import { ethers } from "ethers";

// 预设的 stageURIs（IPFS 上已有的图片）
const PRESET_STAGE_URIS = [
  {
    label: "幼猫 Stage 1",
    uri: "ipfs://bafybeiewjp2e4gmewiotq6pi2snbfta2gltblnaymdhbzkhv2hcq3psij4/cat_stage1.json",
  },
  {
    label: "少年猫 Stage 2",
    uri: "ipfs://bafybeiewjp2e4gmewiotq6pi2snbfta2gltblnaymdhbzkhv2hcq3psij4/cat_stage2_junior.json",
  },
  {
    label: "成年猫 Stage 3",
    uri: "ipfs://bafybeiewjp2e4gmewiotq6pi2snbfta2gltblnaymdhbzkhv2hcq3psij4/cat_stage3.json",
  },
];

const GENESIS_PRESET_URI = "ipfs://bafybeiewjp2e4gmewiotq6pi2snbfta2gltblnaymdhbzkhv2hcq3psij4/genesis.json";

const STAGE_LABELS = ["Stage 1 幼猫", "Stage 2 少年猫", "Stage 3 成年猫"];

interface CatRecord {
  id: number;
  name: string;
  age: number;
  gender: string;
  description: string;
  stageURIs: string[];
  status: number;
}

interface AdoptionApp {
  catId: number;
  catName: string;
  applicant: string;
  status: number;
  depositAmount: string;
}

const APP_STATUS_ZH = ["已申请·待审批", "审批通过·待缴款", "已缴款·等回访", "取消中·待确认", "已完成", "失败", "已取消"];
const APP_STATUS_EN = ["Applied·Pending", "Approved·Pay Deposit", "Deposit Paid·Awaiting Visit", "Cancelling", "Done", "Failed", "Cancelled"];
const APP_STATUS_COLOR = ["#d97706","#16a34a","#a855f7","#ef4444","#16a34a","#888","#888"];

const STATUS_LABEL: Record<number, { zh: string; en: string; color: string }> = {
  0: { zh: "可领养", en: "Available",        color: "#16a34a" },
  1: { zh: "云领养中", en: "Cloud Adopted",  color: "#F97316" },
  2: { zh: "申请中", en: "Pending Adoption", color: "#a855f7" },
  3: { zh: "已领养", en: "Adopted",          color: "#888" },
};

export function ShelterManage() {
  const navigate = useNavigate();
  const { signer, isConnected, connectWallet, walletAddress, lang } = useApp();
  const isZh = lang === "zh";

  const [shelterStatus,   setShelterStatus]   = useState<number | null>(null);
  const [shelterName,     setShelterName]     = useState("");
  const [shelterNotFound, setShelterNotFound] = useState(false);
  const [myCats,        setMyCats]        = useState<CatRecord[]>([]);
  const [loadingCats,   setLoadingCats]   = useState(false);
  const [showForm,      setShowForm]      = useState(false);

  // 领养申请管理
  const [adoptionApps,   setAdoptionApps]   = useState<AdoptionApp[]>([]);
  const [loadingApps,    setLoadingApps]    = useState(false);
  const [showAdoptions,  setShowAdoptions]  = useState(true);
  const [appActionLoading, setAppActionLoading] = useState<number | null>(null);
  const [appActionResult,  setAppActionResult]  = useState<string | null>(null);

  // 新建猫咪表单（3个URI，不含genesis）
  const [form, setForm] = useState({
    name: "", age: "1", gender: "female", description: "",
    uri0: "", uri1: "", uri2: "",
  });
  const [txLoading, setTxLoading] = useState(false);
  const [txSuccess, setTxSuccess] = useState<string | null>(null);
  const [txError,   setTxError]   = useState<string | null>(null);

  // 编辑已有猫咪（状态 + 所有阶段URI + 描述）
  const [editCatId,     setEditCatId]     = useState<number | null>(null);
  const [editStatus,    setEditStatus]    = useState<number>(0);
  const [editGenesis,   setEditGenesis]   = useState("");
  const [editStage0,    setEditStage0]    = useState("");
  const [editStage1,    setEditStage1]    = useState("");
  const [editStage2,    setEditStage2]    = useState("");
  const [editDesc,      setEditDesc]      = useState("");
  const [editLoading,   setEditLoading]   = useState(false);
  const [editResult,    setEditResult]    = useState<string | null>(null);

  // 检查机构状态
  useEffect(() => {
    if (!walletAddress) return;
    const check = async () => {
      try {
        const c = getReadonlyContracts();
        const info = await c.catRegistry.shelters(walletAddress) as {
          name: string; status: number;
        };
        const name = info.name || "";
        setShelterName(name);
        if (!name) {
          // 链上没有这个地址的记录（name为空字符串说明从未注册）
          setShelterNotFound(true);
          setShelterStatus(null);
        } else {
          setShelterNotFound(false);
          setShelterStatus(Number(info.status));
        }
      } catch {
        setShelterNotFound(true);
        setShelterStatus(null);
      }
    };
    check();
  }, [walletAddress]);

  // 读取该机构名下所有猫咪
  useEffect(() => {
    if (!walletAddress || shelterStatus !== 1) return;
    const load = async () => {
      setLoadingCats(true);
      try {
        const c = getReadonlyContracts();
        const total = Number(await c.catRegistry.catCount());
        const cats: CatRecord[] = [];
        for (let i = 0; i < total; i++) {
          try {
            const raw = await c.catRegistry.getCat(i) as {
              name: string; age: bigint; gender: string; description: string;
              stageURIs: string[]; shelter: string; status: number;
            };
            if (raw.shelter.toLowerCase() !== walletAddress.toLowerCase()) continue;
            cats.push({
              id: i, name: raw.name, age: Number(raw.age),
              gender: raw.gender, description: raw.description,
              stageURIs: Array.from(raw.stageURIs),
              status: Number(raw.status),
            });
          } catch {}
        }
        setMyCats(cats);
      } finally { setLoadingCats(false); }
    };
    load();
  }, [walletAddress, shelterStatus]);

  // 读取该机构名下猫咪的所有待处理领养申请
  const loadAdoptionApps = useCallback(async () => {
    if (!walletAddress || shelterStatus !== 1) return;
    setLoadingApps(true);
    try {
      const c = getReadonlyContracts();
      const total = Number(await c.catRegistry.catCount());
      const apps: AdoptionApp[] = [];
      for (let i = 0; i < total; i++) {
        try {
          const raw = await c.catRegistry.getCat(i) as { shelter: string; name: string };
          if (raw.shelter.toLowerCase() !== walletAddress.toLowerCase()) continue;
          const app = await c.adoptionVault.getApplication(i) as {
            applicant: string; status: bigint; depositAmount: bigint;
          };
          const appStatus = Number(app.status);
          // 只显示进行中的：0=已申请, 3=取消中
          if (appStatus !== 0 && appStatus !== 3) continue;
          if (app.applicant === ethers.ZeroAddress) continue;
          apps.push({
            catId: i,
            catName: raw.name || `Cat #${i}`,
            applicant: app.applicant,
            status: appStatus,
            depositAmount: parseFloat(ethers.formatEther(app.depositAmount)).toFixed(3),
          });
        } catch { /* 无申请或读取失败 */ }
      }
      setAdoptionApps(apps);
    } catch (e) {
      console.error("读取领养申请失败:", e);
    } finally { setLoadingApps(false); }
  }, [walletAddress, shelterStatus]);

  useEffect(() => { loadAdoptionApps(); }, [loadAdoptionApps]);

  // 审批领养申请
  const handleApproveApp = async (catId: number) => {
    if (!signer) { setAppActionResult(isZh ? "请先连接钱包" : "Connect wallet"); return; }
    setAppActionLoading(catId); setAppActionResult(null);
    try {
      const c = getContracts(signer);
      const tx = await (c.adoptionVault as unknown as { approveApplication: (id: number) => Promise<ethers.ContractTransactionResponse> }).approveApplication(catId);
      await tx.wait();
      setAppActionResult(isZh ? `✅ 已批准 Cat #${catId} 的领养申请` : `✅ Approved Cat #${catId}`);
      await loadAdoptionApps();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "";
      if (!msg.includes("user rejected")) setAppActionResult(isZh ? `❌ 失败：${msg.slice(0,60)}` : `❌ Failed: ${msg.slice(0,60)}`);
    } finally { setAppActionLoading(null); }
  };

  // 拒绝领养申请
  const handleRejectApp = async (catId: number) => {
    if (!signer) { setAppActionResult(isZh ? "请先连接钱包" : "Connect wallet"); return; }
    setAppActionLoading(catId * -1 - 1); setAppActionResult(null);
    try {
      const c = getContracts(signer);
      const tx = await (c.adoptionVault as unknown as { rejectApplication: (id: number) => Promise<ethers.ContractTransactionResponse> }).rejectApplication(catId);
      await tx.wait();
      setAppActionResult(isZh ? `已拒绝 Cat #${catId} 的领养申请` : `Rejected Cat #${catId}`);
      await loadAdoptionApps();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "";
      if (!msg.includes("user rejected")) setAppActionResult(isZh ? `❌ 失败：${msg.slice(0,60)}` : `❌ Failed: ${msg.slice(0,60)}`);
    } finally { setAppActionLoading(null); }
  };

  // 确认归还
  const handleConfirmReturn = async (catId: number, healthy: boolean) => {
    if (!signer) return;
    setAppActionLoading(catId); setAppActionResult(null);
    try {
      const c = getContracts(signer);
      const tx = await (c.adoptionVault as unknown as { confirmReturn: (id: number, h: boolean) => Promise<ethers.ContractTransactionResponse> }).confirmReturn(catId, healthy);
      await tx.wait();
      setAppActionResult(healthy
        ? (isZh ? `✅ 已确认健康归还，保证金已退还` : `✅ Confirmed healthy return, deposit refunded`)
        : (isZh ? `已确认不健康归还，保证金转给机构` : `Confirmed unhealthy return, deposit sent to shelter`));
      await loadAdoptionApps();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "";
      if (!msg.includes("user rejected")) setAppActionResult(`❌ ${msg.slice(0,60)}`);
    } finally { setAppActionLoading(null); }
  };

  const handleSubmit = async () => {
    if (!signer) { setTxError(isZh ? "请先连接钱包" : "Connect wallet first"); return; }
    if (!form.name.trim()) { setTxError(isZh ? "请填写猫咪名字" : "Enter cat name"); return; }

    setTxLoading(true); setTxError(null); setTxSuccess(null);
    try {
      const c = getContracts(signer);
      // 新合约只接收 3 个 URI（stage0/1/2），genesis 由单独入口设置
      const stageURIs: [string, string, string] = [
        form.uri0.trim(), form.uri1.trim(), form.uri2.trim(),
      ];
      const tx = await c.catRegistry.addCat(
        form.name.trim(),
        parseInt(form.age) || 1,
        form.gender,
        form.description.trim(),
        stageURIs
      );
      await (tx as ethers.ContractTransactionResponse).wait();
      setTxSuccess(isZh ? `✅ 猫咪「${form.name}」已成功登记上链！` : `✅ Cat "${form.name}" registered on-chain!`);
      setForm({ name: "", age: "1", gender: "female", description: "", uri0: "", uri1: "", uri2: "" });
      // 刷新列表
      const c2 = getReadonlyContracts();
      const total = Number(await c2.catRegistry.catCount());
      const cats: CatRecord[] = [];
      for (let i = 0; i < total; i++) {
        try {
          const raw = await c2.catRegistry.getCat(i) as {
            name: string; age: bigint; gender: string; description: string;
            stageURIs: string[]; shelter: string; status: number;
          };
          if (raw.shelter.toLowerCase() !== walletAddress!.toLowerCase()) continue;
          cats.push({ id: i, name: raw.name, age: Number(raw.age), gender: raw.gender, description: raw.description, stageURIs: Array.from(raw.stageURIs), status: Number(raw.status) });
        } catch {}
      }
      setMyCats(cats);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "";
      if (!msg.includes("user rejected")) {
        if (msg.includes("Not approved shelter")) setTxError(isZh ? "机构尚未通过审批" : "Shelter not approved");
        else setTxError(msg.slice(0, 100));
      }
    } finally { setTxLoading(false); }
  };

  // 编辑猫咪：更新状态 / 描述 / 各阶段 URI
  const handleEditCat = async () => {
    if (!signer || editCatId === null) return;
    setEditLoading(true); setEditResult(null);
    try {
      const contract = new ethers.Contract(
        ADDRESSES.catRegistry,
        [
          "function updateCatStatus(uint256 _catId, uint8 _status) external",
          "function updateCatStageURI(uint256 _catId, uint8 _stage, string calldata _uri) external",
        ],
        signer
      );
      const cat = myCats.find(c => c.id === editCatId);

      // 更新状态
      if (cat && editStatus !== cat.status) {
        const tx = await contract.updateCatStatus(editCatId, editStatus);
        await tx.wait();
      }
      // 更新各阶段 URI（只有填了才更新）
      const stageUpdates: [number, string][] = [
        [0, editStage0], [1, editStage1], [2, editStage2], [3, editGenesis],
      ];
      for (const [stage, uri] of stageUpdates) {
        if (uri.trim()) {
          const tx = await contract.updateCatStageURI(editCatId, stage, uri.trim());
          await tx.wait();
        }
      }
      setEditResult(isZh ? "✅ 更新成功" : "✅ Updated");
      // 刷新
      const c2 = getReadonlyContracts();
      const updatedCat = await c2.catRegistry.getCat(editCatId) as {
        name: string; age: bigint; gender: string; description: string;
        stageURIs: string[]; shelter: string; status: number;
      };
      setMyCats(prev => prev.map(c => c.id === editCatId ? {
        ...c, status: Number(updatedCat.status), stageURIs: Array.from(updatedCat.stageURIs),
        description: updatedCat.description,
      } : c));
      setEditGenesis(""); setEditStage0(""); setEditStage1(""); setEditStage2(""); setEditDesc("");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "";
      if (!msg.includes("user rejected")) setEditResult(isZh ? `❌ 失败：${msg.slice(0, 80)}` : `❌ Failed: ${msg.slice(0, 80)}`);
    } finally { setEditLoading(false); }
  };

  const UriField = ({ idx, value, onChange }: { idx: number; value: string; onChange: (v: string) => void }) => (
    <div className="mb-3">
      <label className="block text-xs font-semibold mb-1.5" style={{ color: "#92400e" }}>
        {STAGE_LABELS[idx]}
        <span className="font-normal ml-1" style={{ color: "#b45309" }}>
          {isZh ? "（可选，若该阶段无图可留空）" : "(optional)"}
        </span>
      </label>
      {/* 预设快选 */}
      <div className="flex flex-wrap gap-1.5 mb-1.5">
        <button onClick={() => onChange(PRESET_STAGE_URIS[idx].uri)}
          className="px-2 py-1 rounded-lg text-xs"
          style={{ background: "rgba(249,115,22,0.1)", color: "#c2410c", border: "1px solid rgba(249,115,22,0.2)", cursor: "pointer" }}>
          {isZh ? "使用默认图片" : "Use default image"}
        </button>
        {value && (
          <button onClick={() => onChange("")}
            className="px-2 py-1 rounded-lg text-xs"
            style={{ background: "rgba(220,38,38,0.08)", color: "#dc2626", border: "1px solid rgba(220,38,38,0.15)", cursor: "pointer" }}>
            {isZh ? "清空" : "Clear"}
          </button>
        )}
      </div>
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="ipfs://... 或留空"
        className="w-full px-3 py-2 rounded-xl outline-none text-xs font-mono"
        style={{ background: "rgba(249,115,22,0.04)", border: "1px solid rgba(249,115,22,0.15)", color: "#92400e" }}
      />
    </div>
  );

  // ── 未连接钱包 ──────────────────────────────────────────
  if (!isConnected) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "#fffbf5" }}>
      <Navbar />
      <div className="text-center">
        <div className="text-5xl mb-4">🔐</div>
        <p className="font-bold mb-4" style={{ color: "#92400e" }}>{isZh ? "请先连接机构钱包" : "Connect your shelter wallet"}</p>
        <button onClick={connectWallet} className="px-6 py-3 rounded-xl text-white font-bold text-sm"
          style={{ background: "linear-gradient(135deg, #F97316, #fbbf24)", cursor: "pointer" }}>
          {isZh ? "连接钱包" : "Connect Wallet"}
        </button>
      </div>
    </div>
  );

  // ── 未注册机构 ──────────────────────────────────────────
  if (shelterNotFound) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "#fffbf5" }}>
      <Navbar />
      <div className="text-center max-w-sm px-6">
        <div className="text-5xl mb-4">🏠</div>
        <p className="font-bold mb-2" style={{ color: "#92400e" }}>{isZh ? "当前钱包未注册机构" : "No shelter registered"}</p>
        <p className="text-sm mb-5" style={{ color: "#b45309" }}>
          {isZh ? "请先前往「机构注册」页面申请注册，待管理员审批通过后即可登记猫咪。" : "Register your shelter first, then wait for admin approval."}
        </p>
        <button onClick={() => navigate("/institution/register")}
          className="px-6 py-3 rounded-xl text-white font-bold text-sm"
          style={{ background: "linear-gradient(135deg, #F97316, #fbbf24)", cursor: "pointer" }}>
          {isZh ? "前往注册" : "Register Shelter"}
        </button>
      </div>
    </div>
  );

  // ── 待审批 ──────────────────────────────────────────────
  if (shelterStatus === 0) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "#fffbf5" }}>
      <Navbar />
      <div className="text-center max-w-sm px-6">
        <div className="text-5xl mb-4">⏳</div>
        <p className="font-bold mb-2" style={{ color: "#92400e" }}>{isZh ? "机构审批中" : "Pending Approval"}</p>
        <p className="text-sm" style={{ color: "#b45309" }}>
          {isZh ? `「${shelterName}」的注册申请正在审核中，请等待管理员审批通过后再登记猫咪。` : `"${shelterName}" is awaiting admin approval.`}
        </p>
      </div>
    </div>
  );

  // ── 已审批机构主界面 ────────────────────────────────────
  return (
    <div className="min-h-screen pt-20" style={{ background: "#fffbf5" }}>
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-black" style={{ color: "#92400e", fontFamily: "'Space Grotesk', sans-serif" }}>
              🏠 {shelterName || (isZh ? "机构管理" : "Shelter Management")}
            </h1>
            <p className="text-sm mt-1" style={{ color: "#b45309" }}>
              {isZh ? `已审批 · 共 ${myCats.length} 只猫咪` : `Approved · ${myCats.length} cats registered`}
            </p>
          </div>
          <button onClick={() => { setShowForm(true); setTxSuccess(null); setTxError(null); }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-bold"
            style={{ background: "linear-gradient(135deg, #F97316, #fbbf24)", cursor: "pointer" }}>
            <Plus size={15} />{isZh ? "登记新猫咪" : "Add Cat"}
          </button>
        </div>

        {/* 领养申请管理 */}
        <div className="mb-8 rounded-2xl overflow-hidden"
          style={{ background: "#fff9f5", border: "1px solid rgba(249,115,22,0.12)" }}>
          <button
            onClick={() => setShowAdoptions(v => !v)}
            className="w-full flex items-center justify-between px-5 py-4"
            style={{ cursor: "pointer", background: "transparent" }}>
            <div className="flex items-center gap-2">
              <Home size={16} color="#F97316" />
              <span className="font-bold" style={{ color: "#92400e" }}>
                {isZh ? "领养申请管理" : "Adoption Requests"}
              </span>
              {adoptionApps.length > 0 && (
                <span className="px-2 py-0.5 rounded-full text-xs font-bold"
                  style={{ background: "rgba(217,119,6,0.15)", color: "#d97706", border: "1px solid rgba(217,119,6,0.3)" }}>
                  {adoptionApps.length}
                </span>
              )}
            </div>
            {showAdoptions ? <ChevronUp size={16} color="#b45309" /> : <ChevronDown size={16} color="#b45309" />}
          </button>

          {showAdoptions && (
            <div className="px-5 pb-5">
              {appActionResult && (
                <div className="mb-3 px-4 py-2.5 rounded-xl text-xs font-semibold"
                  style={{
                    background: appActionResult.startsWith("✅") || appActionResult.startsWith("已确认健康") ? "rgba(22,163,74,0.1)" : "rgba(249,115,22,0.08)",
                    color: appActionResult.startsWith("✅") || appActionResult.startsWith("已确认健康") ? "#16a34a" : "#c2410c",
                    border: "1px solid currentColor",
                  }}>
                  {appActionResult}
                </div>
              )}

              {loadingApps ? (
                <div className="flex items-center justify-center py-8 gap-2">
                  <Loader2 size={18} className="animate-spin" style={{ color: "#F97316" }} />
                  <span className="text-sm" style={{ color: "#b45309" }}>{isZh ? "读取申请中…" : "Loading…"}</span>
                </div>
              ) : adoptionApps.length === 0 ? (
                <div className="py-8 text-center">
                  <div className="text-3xl mb-2">🏠</div>
                  <p className="text-sm" style={{ color: "#b45309" }}>
                    {isZh ? "暂无待处理的领养申请" : "No pending adoption requests"}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {adoptionApps.map(app => {
                    const color = APP_STATUS_COLOR[app.status] ?? "#888";
                    const label = isZh ? APP_STATUS_ZH[app.status] : APP_STATUS_EN[app.status];
                    const isApprovingThis = appActionLoading === app.catId;
                    const isRejectingThis = appActionLoading === (app.catId * -1 - 1);
                    return (
                      <div key={app.catId} className="p-4 rounded-2xl"
                        style={{ background: "rgba(249,115,22,0.04)", border: "1px solid rgba(249,115,22,0.1)" }}>
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className="font-bold text-sm" style={{ color: "#92400e" }}>{app.catName}</span>
                              <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                                style={{ background: `${color}18`, color, border: `1px solid ${color}30` }}>
                                {label}
                              </span>
                            </div>
                            <p className="text-xs font-mono" style={{ color: "#d97706" }}>
                              {isZh ? "申请人：" : "Applicant: "}{app.applicant.slice(0,8)}…{app.applicant.slice(-6)}
                            </p>
                          </div>
                          <Clock size={14} color={color} />
                        </div>

                        {/* status=0: 待审批 → 审批/拒绝 */}
                        {app.status === 0 && (
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              onClick={() => handleApproveApp(app.catId)}
                              disabled={isApprovingThis || isRejectingThis}
                              className="py-2.5 rounded-xl text-white text-xs font-bold flex items-center justify-center gap-1.5"
                              style={{ background: isApprovingThis ? "rgba(22,163,74,0.4)" : "linear-gradient(135deg,#16a34a,#15803d)", cursor: "pointer", opacity: isApprovingThis ? 0.7 : 1 }}>
                              {isApprovingThis ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle size={12} />}
                              {isZh ? "批准申请" : "Approve"}
                            </button>
                            <button
                              onClick={() => handleRejectApp(app.catId)}
                              disabled={isApprovingThis || isRejectingThis}
                              className="py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5"
                              style={{ background: isRejectingThis ? "rgba(220,38,38,0.08)" : "rgba(220,38,38,0.08)", border: "1px solid rgba(220,38,38,0.25)", color: "#dc2626", cursor: "pointer", opacity: isRejectingThis ? 0.7 : 1 }}>
                              {isRejectingThis ? <Loader2 size={12} className="animate-spin" /> : <X size={12} />}
                              {isZh ? "拒绝申请" : "Reject"}
                            </button>
                          </div>
                        )}

                        {/* status=3: 用户申请取消，等机构确认归还 */}
                        {app.status === 3 && (
                          <div>
                            <p className="text-xs mb-2" style={{ color: "#b45309" }}>
                              {isZh ? "用户申请取消领养，请确认猫咪归还情况：" : "User requested cancellation. Confirm cat return:"}
                            </p>
                            <div className="grid grid-cols-2 gap-2">
                              <button
                                onClick={() => handleConfirmReturn(app.catId, true)}
                                disabled={isApprovingThis}
                                className="py-2.5 rounded-xl text-white text-xs font-bold flex items-center justify-center gap-1.5"
                                style={{ background: "linear-gradient(135deg,#16a34a,#15803d)", cursor: "pointer", opacity: isApprovingThis ? 0.7 : 1 }}>
                                {isApprovingThis ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle size={12} />}
                                {isZh ? "健康归还" : "Healthy Return"}
                              </button>
                              <button
                                onClick={() => handleConfirmReturn(app.catId, false)}
                                disabled={isApprovingThis}
                                className="py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5"
                                style={{ background: "rgba(220,38,38,0.08)", border: "1px solid rgba(220,38,38,0.25)", color: "#dc2626", cursor: "pointer" }}>
                                {isZh ? "不健康归还" : "Unhealthy Return"}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* 我的猫咪列表 */}
        {loadingCats ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 size={28} className="animate-spin" style={{ color: "#F97316" }} />
          </div>
        ) : myCats.length === 0 ? (
          <div className="p-12 rounded-2xl text-center"
            style={{ background: "rgba(249,115,22,0.03)", border: "1px dashed rgba(249,115,22,0.15)" }}>
            <div className="text-5xl mb-3">🐱</div>
            <p className="font-bold mb-2" style={{ color: "#92400e" }}>{isZh ? "还没有登记猫咪" : "No cats registered yet"}</p>
            <p className="text-sm" style={{ color: "#b45309" }}>
              {isZh ? "点击右上角「登记新猫咪」开始添加" : "Click 'Add Cat' to get started"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {myCats.map(cat => {
              const st = STATUS_LABEL[cat.status] ?? STATUS_LABEL[0];
              const isEditing = editCatId === cat.id;
              const hasGenesis = cat.stageURIs[3] && cat.stageURIs[3].length > 0;
              return (
                <div key={cat.id} className="rounded-2xl overflow-hidden"
                  style={{ background: "#fff9f5", border: "1px solid rgba(249,115,22,0.1)" }}>
                  <div className="p-4 flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-xl"
                      style={{ background: "rgba(249,115,22,0.1)" }}>
                      <Cat size={20} style={{ color: "#F97316" }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold" style={{ color: "#92400e" }}>{cat.name}</span>
                        <span className="px-2 py-0.5 rounded-full text-xs font-semibold"
                          style={{ background: `${st.color}18`, color: st.color, border: `1px solid ${st.color}30` }}>
                          {isZh ? st.zh : st.en}
                        </span>
                        {hasGenesis && (
                          <span className="px-2 py-0.5 rounded-full text-xs font-semibold"
                            style={{ background: "rgba(168,85,247,0.12)", color: "#a855f7", border: "1px solid rgba(168,85,247,0.3)" }}>
                            ✨ Genesis
                          </span>
                        )}
                      </div>
                      <p className="text-xs mb-1" style={{ color: "#b45309" }}>
                        {cat.gender === "female" ? "♀" : "♂"} · {cat.age}{isZh ? "岁" : "yr"}
                      </p>
                      <p className="text-xs truncate" style={{ color: "#78350f" }}>{cat.description}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs font-mono" style={{ color: "#d97706" }}>Cat #{cat.id}</span>
                        <a href={`https://testnet.snowtrace.io/address/${ADDRESSES.catRegistry}`}
                          target="_blank" rel="noreferrer"
                          className="flex items-center gap-1 text-xs" style={{ color: "#F97316" }}>
                          <ExternalLink size={10} />Snowtrace
                        </a>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        if (isEditing) { setEditCatId(null); setEditResult(null); }
                        else {
                          setEditCatId(cat.id);
                          setEditStatus(cat.status);
                          setEditGenesis("");
                          setEditStage0("");
                          setEditStage1("");
                          setEditStage2("");
                          setEditDesc("");
                          setEditResult(null);
                        }
                      }}
                      className="flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-semibold"
                      style={{ background: isEditing ? "rgba(249,115,22,0.15)" : "rgba(249,115,22,0.07)", border: "1px solid rgba(249,115,22,0.2)", color: "#c2410c", cursor: "pointer" }}>
                      {isEditing ? (isZh ? "收起" : "Close") : (isZh ? "编辑" : "Edit")}
                    </button>
                  </div>

                  {/* 编辑面板 */}
                  {isEditing && (
                    <div className="px-4 pb-4 border-t" style={{ borderColor: "rgba(249,115,22,0.1)" }}>
                      {/* 状态 */}
                      <p className="text-xs font-semibold mt-3 mb-2" style={{ color: "#F97316" }}>
                        {isZh ? "更新猫咪状态" : "Update Status"}
                      </p>
                      <div className="flex gap-2 flex-wrap mb-4">
                        {([
                          { val: 0, zh: "待领养", en: "Available" },
                          { val: 1, zh: "云领养中", en: "Cloud Adopted" },
                        ] as const).map(opt => (
                          <button key={opt.val} onClick={() => setEditStatus(opt.val)}
                            className="px-3 py-1.5 rounded-xl text-xs font-semibold"
                            style={{
                              background: editStatus === opt.val ? "rgba(249,115,22,0.15)" : "rgba(249,115,22,0.05)",
                              border: editStatus === opt.val ? "1px solid rgba(249,115,22,0.4)" : "1px solid rgba(249,115,22,0.12)",
                              color: editStatus === opt.val ? "#F97316" : "#b45309", cursor: "pointer",
                            }}>
                            {isZh ? opt.zh : opt.en}
                          </button>
                        ))}
                      </div>

                      {/* 各成长阶段 URI */}
                      <p className="text-xs font-semibold mb-2" style={{ color: "#F97316" }}>
                        📷 {isZh ? "成长阶段图片 URI（留空不修改）" : "Stage URIs (leave blank = no change)"}
                      </p>
                      {[
                        { label: isZh ? "Stage 1 幼猫" : "Stage 1 Kitten", val: editStage0, set: setEditStage0, preset: PRESET_STAGE_URIS[0].uri, cur: cat.stageURIs[0] },
                        { label: isZh ? "Stage 2 少年猫" : "Stage 2 Junior", val: editStage1, set: setEditStage1, preset: PRESET_STAGE_URIS[1].uri, cur: cat.stageURIs[1] },
                        { label: isZh ? "Stage 3 成年猫" : "Stage 3 Adult", val: editStage2, set: setEditStage2, preset: PRESET_STAGE_URIS[2].uri, cur: cat.stageURIs[2] },
                      ].map(({ label, val, set, preset, cur }) => (
                        <div key={label} className="mb-3">
                          <label className="block text-xs font-medium mb-1" style={{ color: "#92400e" }}>{label}</label>
                          {cur && <p className="text-xs mb-1 font-mono truncate" style={{ color: "#d97706" }}>
                            {isZh ? "当前：" : "Now: "}{cur.slice(0, 45)}…
                          </p>}
                          <div className="flex gap-1.5 mb-1">
                            <button onClick={() => set(preset)} className="px-2 py-1 rounded-lg text-xs"
                              style={{ background: "rgba(249,115,22,0.1)", color: "#c2410c", border: "1px solid rgba(249,115,22,0.2)", cursor: "pointer" }}>
                              {isZh ? "使用默认" : "Default"}
                            </button>
                            {val && <button onClick={() => set("")} className="px-2 py-1 rounded-lg text-xs"
                              style={{ background: "rgba(220,38,38,0.07)", color: "#dc2626", border: "1px solid rgba(220,38,38,0.15)", cursor: "pointer" }}>
                              {isZh ? "清空" : "Clear"}
                            </button>}
                          </div>
                          <input value={val} onChange={e => set(e.target.value)} placeholder="ipfs://... 或留空"
                            className="w-full px-3 py-2 rounded-xl outline-none text-xs font-mono"
                            style={{ background: "rgba(249,115,22,0.04)", border: "1px solid rgba(249,115,22,0.15)", color: "#92400e" }} />
                        </div>
                      ))}

                      {/* Genesis URI */}
                      <p className="text-xs font-semibold mb-1.5 mt-1" style={{ color: "#a855f7" }}>
                        ✨ {isZh ? "Stage 4 Genesis（真实领养专属）" : "Stage 4 Genesis (adoption reward)"}
                      </p>
                      {hasGenesis && <p className="text-xs mb-1 font-mono truncate" style={{ color: "#d97706" }}>
                        {isZh ? "当前：" : "Now: "}{cat.stageURIs[3].slice(0, 45)}…
                      </p>}
                      <div className="flex gap-1.5 mb-1.5">
                        <button onClick={() => setEditGenesis(GENESIS_PRESET_URI)} className="px-2 py-1 rounded-lg text-xs"
                          style={{ background: "rgba(168,85,247,0.1)", color: "#a855f7", border: "1px solid rgba(168,85,247,0.2)", cursor: "pointer" }}>
                          {isZh ? "使用默认图片" : "Use default"}
                        </button>
                        {editGenesis && <button onClick={() => setEditGenesis("")} className="px-2 py-1 rounded-lg text-xs"
                          style={{ background: "rgba(220,38,38,0.07)", color: "#dc2626", border: "1px solid rgba(220,38,38,0.15)", cursor: "pointer" }}>
                          {isZh ? "清空" : "Clear"}
                        </button>}
                      </div>
                      <input value={editGenesis} onChange={e => setEditGenesis(e.target.value)}
                        placeholder={hasGenesis ? cat.stageURIs[3] : "ipfs://..."}
                        className="w-full px-3 py-2 rounded-xl outline-none text-xs font-mono mb-4"
                        style={{ background: "rgba(168,85,247,0.04)", border: "1px solid rgba(168,85,247,0.18)", color: "#92400e" }} />

                      {editResult && <p className="text-xs mb-2 font-semibold"
                        style={{ color: editResult.startsWith("✅") ? "#16a34a" : "#dc2626" }}>{editResult}</p>}
                      <button onClick={handleEditCat} disabled={editLoading}
                        className="w-full py-2.5 rounded-xl text-white text-sm font-bold flex items-center justify-center gap-2"
                        style={{ background: "linear-gradient(135deg,#F97316,#ea580c)", cursor: "pointer", opacity: editLoading ? 0.7 : 1 }}>
                        {editLoading && <Loader2 size={13} className="animate-spin" />}
                        {isZh ? "保存更新" : "Save Changes"}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── 登记猫咪 Modal ── */}
      <AnimatePresence>
        {showForm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(8px)" }}>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-lg rounded-3xl p-6 overflow-y-auto"
              style={{ background: "#fffbf5", border: "1px solid rgba(249,115,22,0.2)", boxShadow: "0 20px 60px rgba(249,115,22,0.15)", maxHeight: "90vh" }}>

              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-bold" style={{ color: "#92400e" }}>
                  {isZh ? "🐱 登记新猫咪" : "🐱 Register New Cat"}
                </h3>
                <button onClick={() => { setShowForm(false); setTxSuccess(null); setTxError(null); }}
                  className="p-1.5 rounded-lg" style={{ background: "rgba(249,115,22,0.08)", color: "#b45309", cursor: "pointer" }}>
                  <X size={15} />
                </button>
              </div>

              {/* 基本信息 */}
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: "#92400e" }}>
                    {isZh ? "猫咪名字 *" : "Name *"}
                  </label>
                  <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                    placeholder={isZh ? "如：小雀" : "e.g. Luna"}
                    className="w-full px-3 py-2 rounded-xl outline-none text-sm"
                    style={{ background: "rgba(249,115,22,0.05)", border: "1px solid rgba(249,115,22,0.2)", color: "#92400e" }} />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: "#92400e" }}>
                    {isZh ? "年龄（岁）" : "Age (yrs)"}
                  </label>
                  <input value={form.age} onChange={e => setForm(p => ({ ...p, age: e.target.value }))}
                    type="number" min="0" max="20"
                    className="w-full px-3 py-2 rounded-xl outline-none text-sm"
                    style={{ background: "rgba(249,115,22,0.05)", border: "1px solid rgba(249,115,22,0.2)", color: "#92400e" }} />
                </div>
              </div>

              <div className="mb-3">
                <label className="block text-xs font-semibold mb-1.5" style={{ color: "#92400e" }}>
                  {isZh ? "性别" : "Gender"}
                </label>
                <div className="flex gap-3">
                  {[{ v: "female", zh: "♀ 母猫", en: "♀ Female" }, { v: "male", zh: "♂ 公猫", en: "♂ Male" }].map(opt => (
                    <button key={opt.v} onClick={() => setForm(p => ({ ...p, gender: opt.v }))}
                      className="flex-1 py-2 rounded-xl text-sm font-semibold"
                      style={{
                        background: form.gender === opt.v ? "rgba(249,115,22,0.15)" : "rgba(249,115,22,0.05)",
                        border: form.gender === opt.v ? "1px solid rgba(249,115,22,0.4)" : "1px solid rgba(249,115,22,0.12)",
                        color: form.gender === opt.v ? "#F97316" : "#b45309", cursor: "pointer",
                      }}>
                      {isZh ? opt.zh : opt.en}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-xs font-semibold mb-1.5" style={{ color: "#92400e" }}>
                  {isZh ? "描述" : "Description"}
                </label>
                <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                  rows={2} placeholder={isZh ? "介绍一下这只猫咪…" : "Describe this cat…"}
                  className="w-full px-3 py-2 rounded-xl outline-none text-sm resize-none"
                  style={{ background: "rgba(249,115,22,0.05)", border: "1px solid rgba(249,115,22,0.2)", color: "#92400e" }} />
              </div>

              {/* stageURIs */}
              <div className="p-4 rounded-2xl mb-4" style={{ background: "rgba(249,115,22,0.04)", border: "1px solid rgba(249,115,22,0.1)" }}>
                <p className="text-xs font-bold mb-3" style={{ color: "#F97316" }}>
                  {isZh ? "NFT 成长阶段图片（IPFS metadata URI）" : "Growth Stage NFT URIs (IPFS metadata)"}
                </p>
                <p className="text-xs mb-3" style={{ color: "#b45309" }}>
                  {isZh ? "点击「使用默认图片」快速填入已有的 IPFS 资源，或粘贴你自己的 URI。成年猫可只填 Stage 3。" : "Click 'Use default image' to fill in existing IPFS assets, or paste your own URIs."}
                </p>
                <UriField idx={0} value={form.uri0} onChange={v => setForm(p => ({ ...p, uri0: v }))} />
                <UriField idx={1} value={form.uri1} onChange={v => setForm(p => ({ ...p, uri1: v }))} />
                <UriField idx={2} value={form.uri2} onChange={v => setForm(p => ({ ...p, uri2: v }))} />
              </div>

              {txError   && <div className="flex items-center gap-2 mb-3 text-xs text-red-500"><AlertCircle size={13} />{txError}</div>}
              {txSuccess && <div className="flex items-center gap-2 mb-3 text-xs" style={{ color: "#16a34a" }}><CheckCircle size={13} />{txSuccess}</div>}

              <button onClick={handleSubmit} disabled={txLoading}
                className="w-full py-4 rounded-xl text-white font-bold flex items-center justify-center gap-2"
                style={{ background: "linear-gradient(135deg, #F97316, #fbbf24)", cursor: "pointer", opacity: txLoading ? 0.7 : 1 }}>
                {txLoading && <Loader2 size={16} className="animate-spin" />}
                {txLoading ? (isZh ? "链上处理中…" : "Processing…") : (isZh ? "确认登记上链" : "Register On-Chain")}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
