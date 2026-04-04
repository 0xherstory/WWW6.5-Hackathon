import { useState, useCallback, useEffect, useRef } from "react";
import { ethers } from "ethers";
import {
  REGISTRY_ADDRESS, REGISTRY_ABI, PROJECT_ABI, SBT_ABI,
  TAGS, TAG_DETAILS, MILESTONE_STATUS, getProvider, detectWalletName,
} from "../utils/contracts";
import { isGraphAvailable, fetchMyActivityFromGraph } from "../utils/graphQueries";
import { fetchNotifications, getLastSeenBlock, getReadIds, markOneRead, markAllReadById, formatNotifTime } from "../utils/notifications";
import { multicallRead } from "../utils/multicall";

const RPC_URL = import.meta.env.VITE_RPC_URL || "http://127.0.0.1:8545";
const READ_PROVIDER = new ethers.JsonRpcProvider(RPC_URL);
const IS_FUJI = RPC_URL.includes("avax-test") || RPC_URL.includes("avax.network");
const DEFAULT_STAKE_ETH = IS_FUJI ? "0.00001" : "1";

// 批量读取所有项目信息：2 轮 Multicall3，大幅减少 RPC round-trips
// Round 1：所有项目的基础字段（7 calls/项目）
// Round 2：所有项目的里程碑信息（依赖 Round 1 的 milestoneCount）
async function fetchAllProjects(provider) {
  const reg = new ethers.Contract(REGISTRY_ADDRESS, REGISTRY_ABI, provider);
  const addrs = await reg.getProjects();
  if (addrs.length === 0) return [];

  // Round 1：批量读取每个项目的基础字段
  const baseCalls = addrs.flatMap((addr) => [
    { target: addr, abi: "function name() view returns (string)",                     fn: "name" },
    { target: addr, abi: "function description() view returns (string)",              fn: "description" },
    { target: addr, abi: "function totalDonated() view returns (uint256)",            fn: "totalDonated" },
    { target: addr, abi: "function targetAmount() view returns (uint256)",            fn: "targetAmount" },
    { target: addr, abi: "function getMilestoneCount() view returns (uint256)",       fn: "getMilestoneCount" },
    { target: addr, abi: "function projectOwner() view returns (address)",            fn: "projectOwner" },
    { target: addr, abi: "function emergencyApproved() view returns (bool)",          fn: "emergencyApproved" },
  ]);
  const baseResults = await multicallRead(provider, baseCalls);

  const projectBases = addrs.map((addr, i) => {
    const [name, desc, totalDonated, targetAmount, milestoneCount, projectOwner, emergencyApproved] =
      baseResults.slice(i * 7, i * 7 + 7);
    return { addr, name, desc, totalDonated, targetAmount, milestoneCount: Number(milestoneCount ?? 0), projectOwner, emergencyApproved };
  });

  // Round 2：批量读取所有里程碑信息
  const msCalls = projectBases.flatMap(({ addr, milestoneCount }) =>
    Array.from({ length: milestoneCount }, (_, j) => ({
      target: addr,
      abi: "function getMilestoneInfo(uint256) view returns (string desc, uint256 releasePercent, uint8 status, uint256 proofCount)",
      fn: "getMilestoneInfo",
      args: [j],
    }))
  );
  const msResults = msCalls.length > 0 ? await multicallRead(provider, msCalls) : [];

  let msIdx = 0;
  return projectBases.map(({ addr, name, desc, totalDonated, targetAmount, milestoneCount, projectOwner, emergencyApproved }) => {
    const msInfos = Array.from({ length: milestoneCount }, (_, j) => {
      const info = msResults[msIdx++];
      return { id: j, desc: info?.[0] ?? "", status: Number(info?.[2] ?? 0) };
    });
    const td = ethers.formatEther(totalDonated ?? 0n);
    const ta = ethers.formatEther(targetAmount ?? 0n);
    const progress = Number(totalDonated ?? 0n) / Number(targetAmount ?? 1n) * 100;
    const isCompleted = progress >= 100 && msInfos.length > 0 && msInfos.every((m) => m.status === 2);
    return { address: addr, name, description: desc, totalDonated: td, targetAmount: ta, progress, milestones: msInfos, isCompleted, projectOwner, emergencyApproved };
  });
}

// 根据链上项目数据计算发起人信誉（demo：补充 mock 历史数据）
function calcReputation(projects, ownerAddr) {
  const mine = projects.filter(p => p.projectOwner?.toLowerCase() === ownerAddr?.toLowerCase());
  const realCompleted = mine.filter(p => p.isCompleted).length;
  const realRefunded = mine.filter(p => p.emergencyApproved).length;
  // mock：叠加历史完成记录，真实退款数直接累加影响好评率
  const mockCompleted = 12;
  const mockTotal = 13;
  const completed = realCompleted + mockCompleted;
  const total = mine.length + mockTotal;
  const refunded = realRefunded; // 举报成功次数直接拉低好评率
  const judged = completed + refunded;
  const rate = Math.round(completed / judged * 100);
  let stars = "🌟🌟🌟", color = "#34d399";
  if (rate < 60) { stars = "🌟"; color = "#f87171"; }
  else if (rate < 80) { stars = "🌟🌟"; color = "#fbbf24"; }
  return { total, completed, refunded, inProgress: total - completed - refunded, rate, stars, color };
}

// 博客式凭证卡片（从 IPFS 拉取 metadata JSON 渲染）
function ProofCard({ detail, index }) {
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const uri = detail.metadataUri || "";
    if (!uri.startsWith("ipfs://")) { setLoading(false); return; }
    const cid = uri.slice(7);
    fetch(`https://gateway.pinata.cloud/ipfs/${cid}`)
      .then(r => r.json())
      .then(data => setMeta(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [detail.metadataUri]);

  const addr = detail.validator || "";
  const shortAddr = addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : "未知";
  const time = detail.submittedAt ? new Date(Number(detail.submittedAt) * 1000).toLocaleString() : "";

  return (
    <div style={{ background: "#0f172a", borderRadius: 10, padding: 14, border: "1px solid #1e293b" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#312e81", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: "#a5b4fc" }}>
            {index + 1}
          </div>
          <div>
            <div style={{ fontSize: 12, color: "#a5b4fc", fontWeight: 600 }}>验证人 {shortAddr}</div>
            <div style={{ fontSize: 11, color: "#4b5563" }}>{time}</div>
          </div>
        </div>
        {detail.metadataUri && (
          <a href={`https://gateway.pinata.cloud/ipfs/${detail.metadataUri.slice(7)}`}
            target="_blank" rel="noreferrer"
            style={{ fontSize: 11, color: "#6b7280", textDecoration: "none" }}>
            IPFS ↗
          </a>
        )}
      </div>
      {loading ? (
        <div style={{ fontSize: 12, color: "#4b5563" }}>加载中...</div>
      ) : meta ? (
        <>
          {meta.image && meta.image.startsWith("ipfs://") && (
            <img src={`https://gateway.pinata.cloud/ipfs/${meta.image.slice(7)}`}
              alt="proof"
              style={{ width: "100%", maxHeight: 200, objectFit: "cover", borderRadius: 8, marginBottom: 8 }} />
          )}
          {meta.description && (
            <div style={{ fontSize: 13, color: "#d1d5db", lineHeight: 1.6 }}>{meta.description}</div>
          )}
        </>
      ) : (
        <div style={{ fontSize: 12, color: "#4b5563" }}>凭证内容无法加载</div>
      )}
    </div>
  );
}

// ── Mock 进行中项目（仅前端展示，不上链）────────────────────
const MOCK_IN_PROGRESS = [
  {
    address: "mock-ip-1", name: "云南女童教育项目",
    description: "为云南偏远地区女童提供餐食与教育资助，覆盖200名在校女童",
    totalDonated: "6.5", targetAmount: "10.0", progress: 65, isCompleted: false,
    milestones: [
      { id: 0, desc: "女童入学注册确认", status: 2 },
      { id: 1, desc: "学期中期物资发放确认", status: 1 },
      { id: 2, desc: "学期结束出勤确认", status: 0 },
    ],
  },
  {
    address: "mock-ip-2", name: "四川山区助学计划",
    description: "资助四川凉山贫困山区儿童的基础教育，提供课本、校服及营养午餐",
    totalDonated: "3.2", targetAmount: "5.0", progress: 64, isCompleted: false,
    milestones: [
      { id: 0, desc: "学生入学资格核实", status: 2 },
      { id: 1, desc: "教学物资发放到位", status: 0 },
      { id: 2, desc: "期末考核完成确认", status: 0 },
    ],
  },
  {
    address: "mock-ip-3", name: "贵州女童健康守护",
    description: "为贵州农村女童提供基础医疗检查、卫生用品及健康教育，覆盖3个村庄",
    totalDonated: "2.1", targetAmount: "8.0", progress: 26, isCompleted: false,
    milestones: [
      { id: 0, desc: "体检及健康档案建立", status: 1 },
      { id: 1, desc: "卫生用品及药品发放", status: 0 },
      { id: 2, desc: "健康知识培训完成", status: 0 },
    ],
  },
];

// ── Mock 已完成项目（仅前端展示，不上链）────────────────────
const MOCK_COMPLETED = [
  {
    address: "mock-1", name: "广西女童返校计划",
    description: "为广西百色40名辍学女童提供学费与交通补贴，助力重返校园",
    totalDonated: "2.4", targetAmount: "2.4", progress: 100, isCompleted: true,
    milestones: [
      { id: 0, desc: "入学资格审核完成", status: 2 },
      { id: 1, desc: "学费及书本费发放到位", status: 2 },
      { id: 2, desc: "学期出勤率达标确认", status: 2 },
    ],
  },
  {
    address: "mock-2", name: "甘肃山区营养午餐",
    description: "为甘肃定西3所山区小学120名女童提供全学期每日营养午餐",
    totalDonated: "1.8", targetAmount: "1.8", progress: 100, isCompleted: true,
    milestones: [
      { id: 0, desc: "学校厨房设备采购确认", status: 2 },
      { id: 1, desc: "食材供应商首月核查", status: 2 },
      { id: 2, desc: "学期末营养状况评估完成", status: 2 },
    ],
  },
  {
    address: "mock-3", name: "云南卫生健康守护",
    description: "为云南迪庆藏区85名女童提供基础医疗检查与卫生用品",
    totalDonated: "3.2", targetAmount: "3.2", progress: 100, isCompleted: true,
    milestones: [
      { id: 0, desc: "体检及健康档案建立", status: 2 },
      { id: 1, desc: "卫生用品发放到位", status: 2 },
      { id: 2, desc: "健康教育培训完成", status: 2 },
    ],
  },
  {
    address: "mock-4", name: "四川凉山教材援助",
    description: "为四川凉山州60名小学女童配发全套教材、文具及校服",
    totalDonated: "0.9", targetAmount: "0.9", progress: 100, isCompleted: true,
    milestones: [
      { id: 0, desc: "受助名单公示与确认", status: 2 },
      { id: 1, desc: "教材文具发放完成", status: 2 },
      { id: 2, desc: "校服尺码核实及配发", status: 2 },
    ],
  },
  {
    address: "mock-5", name: "贵州交通补贴项目",
    description: "为贵州黔东南25名山区女童提供半年上学交通补贴",
    totalDonated: "0.6", targetAmount: "0.6", progress: 100, isCompleted: true,
    milestones: [
      { id: 0, desc: "受助学生交通路线核实", status: 2 },
      { id: 1, desc: "首月补贴发放确认", status: 2 },
      { id: 2, desc: "学期末出行记录核查", status: 2 },
    ],
  },
];

export default function DemoPage({ onBack }) {
  const [account, setAccount] = useState("");
  const [signer, setSigner] = useState(null);
  const [isValidator, setIsValidator] = useState(false);
  const [allProjects, setAllProjects] = useState([]);
  const [projectAddress, setProjectAddress] = useState("");
  const [project, setProject] = useState(null);
  const [projectName, setProjectName] = useState("");
  const [projectDesc, setProjectDescState] = useState("");
  const [status, setStatus] = useState({});
  const [milestones, setMilestones] = useState([]);
  const [tagBalances, setTagBalances] = useState([]);
  const [loading, setLoading] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [requiredSigsOnChain, setRequiredSigsOnChain] = useState(2);
  const [beneficiaryAddr2, setBeneficiaryAddr2] = useState("");
  const [projectOwnerAddr, setProjectOwnerAddr] = useState("");
  const [myProofs, setMyProofs] = useState({});
  const [log, setLog] = useState([]);
  const [toast, setToast] = useState(null);

  // Admin 浮窗
  const [adminOpen, setAdminOpen] = useState(false);
  const [adminTab, setAdminTab] = useState("create");
  const [step1Done, setStep1Done] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [beneficiaryAddr, setBeneficiaryAddr] = useState("");
  const [validatorAddrs, setValidatorAddrs] = useState("");
  const [requiredSigs, setRequiredSigs] = useState(2);
  const [targetAmountEth, setTargetAmountEth] = useState("");
  const [validatorStakeEth, setValidatorStakeEth] = useState(DEFAULT_STAKE_ETH);
  const [milestoneForm, setMilestoneForm] = useState([
    { desc: "女童入学注册确认", percent: 30 },
    { desc: "学期中期物资发放确认", percent: 30 },
    { desc: "学期结束出勤确认", percent: 40 },
  ]);

  const [donateTag, setDonateTag] = useState(1);
  const [donateAmount, setDonateAmount] = useState("0.5");
  const [proofMilestone, setProofMilestone] = useState(0);
  const [proofText, setProofText] = useState("");
  const [proofFile, setProofFile] = useState(null);
  const [ipfsUploading, setIpfsUploading] = useState(false);
  const [ipfsCid, setIpfsCid] = useState("");
  const [myActivity, setMyActivity] = useState([]);
  const [activityOpen, setActivityOpen] = useState(false);
  const [notification, setNotification] = useState(null);
  const [mySBTs, setMySBTs] = useState([]);
  const [globalStats, setGlobalStats] = useState(null);
  const [emergency, setEmergency] = useState(null);
  const [emergencyLoading, setEmergencyLoading] = useState("");

  // 验证人质押状态
  const [validatorStaked, setValidatorStaked] = useState(false);
  const [validatorStakeAmt, setValidatorStakeAmt] = useState("0");
  const [stakeRequired, setStakeRequired] = useState("0");
  const [stakeLoading, setStakeLoading] = useState("");
  const [projectClosed, setProjectClosed] = useState(false);

  // 挑战机制
  const [challengeInfos, setChallengeInfos] = useState({}); // milestoneId -> info
  const [challengeTexts, setChallengeTexts] = useState({});   // milestoneId -> input text
  const [challengeLoading, setChallengeLoading] = useState(""); // "challenge-{id}" | "vote-{id}-{bool}" | "resolve-{id}"
  const [myDonorBalance, setMyDonorBalance] = useState("0");
  const [milestoneVerifiedAt, setMilestoneVerifiedAt] = useState({}); // milestoneId -> timestamp
  const [releaseLoading, setReleaseLoading] = useState("");

  // 站内信通知
  const [notifications, setNotifications] = useState([]);
  const [notifUnread, setNotifUnread] = useState(0);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifCurrentBlock, setNotifCurrentBlock] = useState(0);
  const notifTimerRef = useRef(null);
  const notifRef = useRef(null);       // 铃铛按钮容器
  const notifPanelRef = useRef(null);  // 通知面板

  // 点击面板外部自动收起
  useEffect(() => {
    if (!notifOpen) return;
    const handler = (e) => {
      if (
        notifRef.current && !notifRef.current.contains(e.target) &&
        notifPanelRef.current && !notifPanelRef.current.contains(e.target)
      ) {
        setNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [notifOpen]);
  const [challengeBond, setChallengeBond] = useState("1"); // 举报保证金（从合约读取）

  const showToast = (msg, type = "error") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const addLog = (msg) => setLog((prev) => [...prev, { msg, time: new Date().toLocaleTimeString() }]);

  useEffect(() => {
    loadProjectsReadOnly();

    // 监听 MetaMask 账户切换
    if (window.ethereum) {
      const handleAccountsChanged = (accounts) => {
        if (accounts.length === 0) {
          setAccount(""); setSigner(null);
        } else {
          // 账号变了，重新走连接流程
          (async () => {
            try {
              const { ethers: e } = await import("ethers");
              const provider = new e.BrowserProvider(window.ethereum);
              const s = await provider.getSigner();
              const addr = await s.getAddress();
              setSigner(s);
              setAccount(addr);
              setBeneficiaryAddr(addr);
              const list = await fetchAllProjects(s);
              setAllProjects(list);
              if (list.length > 0) await loadProject(list[list.length - 1].address, s);
              const t = await fetchMySBTs(addr, new e.Contract(REGISTRY_ADDRESS, REGISTRY_ABI, s));
              loadNotifications(t);
            } catch {}
          })();
        }
      };
      window.ethereum.on("accountsChanged", handleAccountsChanged);
      return () => window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
    }
  }, []);

  // 默认选最新的进行中项目，没有则选最新的
  const pickDefaultProject = (list) => {
    const active = list.filter(p => !p.isCompleted && !p.emergencyApproved);
    return active.length > 0 ? active[active.length - 1].address : list[list.length - 1].address;
  };

  const loadProjectsReadOnly = async () => {
    try {
      const list = await fetchAllProjects(READ_PROVIDER);
      setAllProjects(list);
      if (list.length > 0) await loadProject(pickDefaultProject(list), null);
      // 计算全局统计数据
      try {
        const reg = new ethers.Contract(REGISTRY_ADDRESS, REGISTRY_ABI, READ_PROVIDER);
        const sbtAddr = await reg.getSbtAddress();
        const sbt = new ethers.Contract(sbtAddr, SBT_ABI, READ_PROVIDER);
        const donationCount = Number(await sbt.totalSupply());
        const totalRaised = list.reduce((sum, p) => sum + parseFloat(p.totalDonated), 0);
        const projectCount = list.length + MOCK_COMPLETED.length;
        setGlobalStats({ donationCount, totalRaised: totalRaised.toFixed(2), projectCount });
      } catch {}
    } catch (e) {}
  };

  const connectWallet = async () => {
    try {
      const provider = await getProvider();
      const s = await provider.getSigner();
      const addr = await s.getAddress();
      setSigner(s);
      setAccount(addr);
      setBeneficiaryAddr(addr);

      const list = await fetchAllProjects(s);
      setAllProjects(list);

      if (list.length > 0) {
        await loadProject(pickDefaultProject(list), s);
      } else {
        showToast("暂无项目，请点击左下角「项目发起」创建", "info");
        setAdminOpen(true);
      }
      fetchMyActivity(addr, list);
      listenMilestoneEvents(list);
      const tokens = await fetchMySBTs(addr, new ethers.Contract(REGISTRY_ADDRESS, REGISTRY_ABI, s));
      loadNotifications(tokens);
      // 每 60 秒轮询，始终通过 ref 读最新 state
      if (notifTimerRef.current) clearInterval(notifTimerRef.current);
      notifTimerRef.current = setInterval(() => loadNotifications(null), 60000);
    } catch (e) {
      showToast(e.message);
    }
  };

  const fetchMyActivity = async (userAddr, projects) => {
    // Fuji + The Graph 已配置时用 GraphQL，否则降级到 queryFilter
    if (isGraphAvailable()) {
      try {
        const activities = await fetchMyActivityFromGraph(userAddr);
        setMyActivity(activities);
        return;
      } catch (e) {
        console.warn("The Graph 查询失败，降级到 queryFilter:", e.message);
      }
    }

    // 降级方案：直接查链上事件
    const activities = [];
    for (const p of projects) {
      const proj = new ethers.Contract(p.address, PROJECT_ABI, READ_PROVIDER);
      try {
        const donateFilter = proj.filters.Donated(userAddr);
        const donateEvents = await proj.queryFilter(donateFilter);
        for (const e of donateEvents) {
          activities.push({
            type: "donate",
            project: p.name,
            projectAddr: p.address,
            amount: ethers.formatEther(e.args.amount),
            tag: TAGS[Number(e.args.tag)],
            timestamp: (await e.getBlock()).timestamp,
          });
        }
        const proofFilter = proj.filters.ProofSubmitted(null, userAddr);
        const proofEvents = await proj.queryFilter(proofFilter);
        for (const e of proofEvents) {
          activities.push({
            type: "proof",
            project: p.name,
            projectAddr: p.address,
            milestoneId: Number(e.args.milestoneId),
            proofUri: e.args.proofUri || "",
            timestamp: (await e.getBlock()).timestamp,
          });
        }
      } catch {}
    }
    activities.sort((a, b) => b.timestamp - a.timestamp);
    setMyActivity(activities);
  };

  const listenMilestoneEvents = (projects) => {
    for (const p of projects) {
      try {
        const proj = new ethers.Contract(p.address, PROJECT_ABI, READ_PROVIDER);
        proj.on("MilestoneVerified", (milestoneId) => {
          setNotification(`🎉 项目「${p.name}」里程碑 M${milestoneId} 已完成验证！`);
          setTimeout(() => setNotification(null), 8000);
        });
      } catch {}
    }
  };

  const voteEmergency = async () => {
    if (!signer) return showToast("请先连接钱包");
    setEmergencyLoading("vote");
    try {
      const proj = new ethers.Contract(projectAddress, PROJECT_ABI, signer);
      await (await proj.voteEmergencyRefund()).wait();
      await fetchEmergencyStatus(proj, account);
      showToast("✅ 投票成功", "info");
    } catch (e) {
      if (e.code === 4001 || (e.message || "").includes("ACTION_REJECTED")) { setEmergencyLoading(""); return; }
      showToast((e.reason || e.message || "").includes("TooEarly") || (e.message || "").includes("Too early") ? "项目尚未超过180天无活动" : e.message);
    }
    setEmergencyLoading("");
  };

  const claimRefund = async () => {
    if (!signer) return showToast("请先连接钱包");
    setEmergencyLoading("claim");
    try {
      const proj = new ethers.Contract(projectAddress, PROJECT_ABI, signer);
      await (await proj.claimEmergencyRefund()).wait();
      await fetchEmergencyStatus(proj, account);
      showToast("✅ 退款已到账", "info");
    } catch (e) {
      if (e.code === 4001 || (e.message || "").includes("ACTION_REJECTED")) { setEmergencyLoading(""); return; }
      showToast(e.message);
    }
    setEmergencyLoading("");
  };

  const fetchMySBTs = async (userAddr, registryContract) => {
    try {
      const sbtAddr = await registryContract.getSbtAddress();
      console.log("[SBT] sbtAddr:", sbtAddr);
      const sbt = new ethers.Contract(sbtAddr, SBT_ABI, READ_PROVIDER);
      const tokenIds = await sbt.getDonorTokens(userAddr);
      console.log("[SBT] tokenIds for", userAddr, ":", tokenIds.map(t => t.toString()));
      const tokens = await Promise.all(tokenIds.map(id => sbt.records(id).then(r => ({
        tokenId: id.toString(),
        projectAddr: r.project,
        projectName: r.projectName,
        amount: ethers.formatEther(r.amount),
        tag: Number(r.tag),
        donatedAt: Number(r.donatedAt),
      }))));
      console.log("[SBT] tokens:", tokens);
      const reversed = tokens.slice().reverse();
      setMySBTs(reversed);
      return reversed;
    } catch (e) {
      console.error("[SBT] fetchMySBTs failed:", e.message);
      return [];
    }
  };

  // stateRef：让轮询函数始终读到最新 state，避免 stale closure
  const notifStateRef = useRef({});
  notifStateRef.current = { mySBTs, projectAddress, projectName, account };

  // 站内信：扫描参与项目的链上事件
  // sbtTokens 可传 fresh tokens（避免依赖尚未刷新的 state）
  const loadNotifications = useCallback(async (freshTokens) => {
    const { mySBTs: sbts, projectAddress: pa, projectName: pn, account: acc } = notifStateRef.current;
    if (!acc) return;
    try {
      const projectMap = {};
      // 优先用传入的 fresh tokens，否则读最新 state
      (freshTokens || sbts).forEach(t => {
        if (t.projectAddr && t.projectAddr !== ethers.ZeroAddress) {
          projectMap[t.projectAddr.toLowerCase()] = t.projectName;
        }
      });
      // 当前选中项目也加进去（无论有没有捐款记录）
      if (pa && pn) projectMap[pa.toLowerCase()] = pn;

      if (!Object.keys(projectMap).length) return;

      const lastSeen = getLastSeenBlock(acc);
      const readIds = getReadIds(acc);
      // Fuji RPC 限制 eth_getLogs 最多 2048 块；本地 Hardhat 无限制
      const maxRange = IS_FUJI ? 2000 : 50000;
      const { all, unread, currentBlock } = await fetchNotifications(READ_PROVIDER, projectMap, lastSeen, readIds, maxRange);
      setNotifications(all);
      setNotifUnread(unread.length);
      setNotifCurrentBlock(currentBlock);
    } catch (e) {
      console.warn("[Notif] load failed:", e.message);
    }
  }, []); // 无 deps —— 始终通过 ref 读最新值

  // 演示用：跳过180天无活动限制
  const mockEmergencyTime = async () => {
    if (!signer) return showToast("请先连接钱包");
    try {
      const proj = new ethers.Contract(projectAddress, PROJECT_ABI, signer);
      await (await proj.demoSkipEmergencyWindow()).wait();
      const projRead = new ethers.Contract(projectAddress, PROJECT_ABI, READ_PROVIDER);
      const projSigned = new ethers.Contract(projectAddress, PROJECT_ABI, signer);
      await Promise.all([
        refreshStatus(projRead),
        fetchEmergencyStatus(projSigned, account),
      ]);
      showToast("✅ 已跳过 180 天限制，可发起紧急退款投票", "info");
    } catch (e) {
      showToast(e.message);
    }
  };

  const fetchEmergencyStatus = async (proj, userAddr) => {
    try {
      const [status, autoRef, isApproved] = await Promise.all([
        proj.getEmergencyStatus(),
        proj.autoRefunded(),
        proj.emergencyApproved(),
      ]);
      setProjectClosed(isApproved);
      setEmergency({
        canVote: status.canVote,
        daysRemaining: Number(status.daysRemaining),
        votePercent: Number(status.votePercent),
        approved: status.approved,
        myDonation: ethers.formatEther(status.myDonation),
        autoRefunded: autoRef,
      });
    } catch {}
  };

  const fetchValidatorStakeStatus = async (proj, userAddr) => {
    try {
      const [staked, stakeAmt, reqAmt, closed] = await Promise.all([
        proj.validatorStaked(userAddr),
        proj.validatorStake(userAddr),
        proj.validatorStakeRequired(),
        proj.isProjectClosed(),
      ]);
      setValidatorStaked(staked);
      setValidatorStakeAmt(ethers.formatEther(stakeAmt));
      setStakeRequired(ethers.formatEther(reqAmt));
      setProjectClosed(closed);
    } catch {}
  };

  const fetchChallengeInfos = async (proj, milestoneList) => {
    setChallengeInfos({}); // 切换项目时先清空，防止旧数据跨项目显示
    const released = milestoneList.filter(m => m.status >= 1); // VERIFIED(1) 或 RELEASED(2) 都可能有挑战
    if (released.length === 0) return;
    try {
      const infos = await Promise.all(released.map(m => proj.getChallengeInfo(m.id)));
      const map = {};
      released.forEach((m, i) => {
        const info = infos[i];
        map[m.id] = {
          challenger: info.challenger,
          evidenceCID: info.evidenceCID,
          challengedAt: Number(info.challengedAt),
          forVotes: Number(info.forVotes),
          againstVotes: Number(info.againstVotes),
          resolved: info.resolved,
          upheld: info.upheld,
          inWindow: info.inWindow,
        };
      });
      setChallengeInfos(map);
    } catch {}
  };

  const fetchMyDonorBalance = async (proj, userAddr) => {
    try {
      const bal = await proj.donorBalance(userAddr);
      setMyDonorBalance(ethers.formatEther(bal));
    } catch {}
  };

  const stakeAsValidatorFn = async () => {
    if (!signer) return showToast("请先连接钱包");
    setStakeLoading("stake");
    try {
      const proj = new ethers.Contract(projectAddress, PROJECT_ABI, signer);
      const reqWei = ethers.parseEther(stakeRequired);
      await (await proj.stakeAsValidator({ value: reqWei })).wait();
      await fetchValidatorStakeStatus(proj, account);
      addLog(`✅ 质押 ${stakeRequired} AVAX 成功，已成为活跃验证人`);
      showToast("✅ 质押成功，现在可以提交验证了", "info");
    } catch (e) {
      if (e.code === 4001 || (e.message || "").includes("ACTION_REJECTED")) { setStakeLoading(""); return; }
      showToast(e.message);
    }
    setStakeLoading("");
  };

  const withdrawStakeFn = async () => {
    if (!signer) return showToast("请先连接钱包");
    setStakeLoading("withdraw");
    try {
      const proj = new ethers.Contract(projectAddress, PROJECT_ABI, signer);
      await (await proj.withdrawStake()).wait();
      await fetchValidatorStakeStatus(proj, account);
      addLog(`✅ 质押已取回 ${validatorStakeAmt} AVAX`);
      showToast("✅ 质押取回成功", "info");
    } catch (e) {
      if (e.code === 4001 || (e.message || "").includes("ACTION_REJECTED")) { setStakeLoading(""); return; }
      showToast(e.message);
    }
    setStakeLoading("");
  };

  const challengeMilestoneFn = async (milestoneId) => {
    if (!signer) return showToast("请先连接钱包");
    const text = (challengeTexts[milestoneId] || "").trim();
    if (!text) return showToast("请填写举报说明");
    setChallengeLoading(`challenge-${milestoneId}`);
    try {
      const proj = new ethers.Contract(projectAddress, PROJECT_ABI, signer);
      const bondWei = await proj.CHALLENGE_BOND();
      await (await proj.challengeMilestone(milestoneId, text, { value: bondWei })).wait();
      // 刷新里程碑状态后再刷新挑战信息（milestones 状态可能已更新）
      await refreshStatus(proj);
      addLog(`✅ 已举报里程碑 M${milestoneId}，等待验证人社区投票`);
      showToast("✅ 举报已提交，进入7天投票期", "info");
    } catch (e) {
      if (e.code === 4001 || (e.message || "").includes("ACTION_REJECTED")) { setChallengeLoading(""); return; }
      const msg = e.message || "";
      showToast(
        msg.includes("AlreadyChallenged") || msg.includes("Already challenged") ? "该里程碑已有进行中的举报" :
        msg.includes("ChallengeWindowClosed") || msg.includes("Window closed") ? "3天举报窗口已关闭" :
        msg.includes("NotADonor") ? "仅捐款人可提交举报" :
        msg
      );
    }
    setChallengeLoading("");
  };

  const voteOnChallengeFn = async (milestoneId, support) => {
    if (!signer) return showToast("请先连接钱包");
    setChallengeLoading(`vote-${milestoneId}-${support}`);
    try {
      const proj = new ethers.Contract(projectAddress, PROJECT_ABI, signer);
      await (await proj.voteOnChallenge(milestoneId, support)).wait();
      await fetchChallengeInfos(proj, milestones);
      addLog(`✅ 已对 M${milestoneId} 挑战投票：${support ? "支持举报" : "反对举报"}`);
      showToast("✅ 投票成功", "info");
    } catch (e) {
      if (e.code === 4001 || (e.message || "").includes("ACTION_REJECTED")) { setChallengeLoading(""); return; }
      showToast((e.message || "").includes("Already voted") ? "您已投过票" :
                (e.message || "").includes("No donation") ? "仅捐款人可参与投票" : e.message);
    }
    setChallengeLoading("");
  };

  const fetchMilestoneVerifiedAt = async (proj, milestoneList) => {
    const verified = milestoneList.filter(m => m.status === 1);
    if (verified.length === 0) return;
    try {
      const times = await Promise.all(verified.map(m => proj.milestoneVerifiedAt(m.id)));
      setMilestoneVerifiedAt(prev => {
        const next = { ...prev };
        verified.forEach((m, i) => { next[m.id] = Number(times[i]); });
        return next;
      });
    } catch {}
  };

  const releaseMilestoneFn = async (milestoneId) => {
    if (!signer) return showToast("请先连接钱包");
    setReleaseLoading(`release-${milestoneId}`);
    try {
      const proj = new ethers.Contract(projectAddress, PROJECT_ABI, signer);
      await (await proj.releaseMilestone(milestoneId)).wait();
      addLog(`✅ M${milestoneId} 资金已释放至受益方`);
      showToast("✅ 资金释放成功", "info");
      const projRefresh = new ethers.Contract(projectAddress, PROJECT_ABI, signer);
      await refreshStatus(projRefresh);
      await fetchValidatorStakeStatus(projRefresh, account);
    } catch (e) {
      if (e.code === 4001 || (e.message || "").includes("ACTION_REJECTED")) { setReleaseLoading(""); return; }
      showToast(
        (e.message || "").includes("ReleaseTooEarly") ? "争议窗口未结束（3天），请等待或等无人举报后再释放" :
        (e.message || "").includes("VoteWindowActive") ? "举报投票尚未结算，请先结算投票" :
        (e.message || "").includes("ChallengeUpheld") ? "举报已成立，里程碑已重置，请重新提交验证" :
        e.message
      );
    }
    setReleaseLoading("");
  };

  const skipChallengeWindow = async (milestoneId) => {
    if (!signer) return showToast("请先连接钱包");
    try {
      const proj = new ethers.Contract(projectAddress, PROJECT_ABI, signer);
      await (await proj.demoSkipChallengeWindow(milestoneId)).wait();
      // 跳过后立即释放
      await releaseMilestoneFn(milestoneId);
    } catch (e) {
      showToast(e.message);
    }
  };

  const skipVoteWindow = async (milestoneId) => {
    if (!signer) return showToast("请先连接钱包");
    try {
      const proj = new ethers.Contract(projectAddress, PROJECT_ABI, signer);
      await (await proj.demoSkipVoteWindow(milestoneId)).wait();
      const projRead = new ethers.Contract(projectAddress, PROJECT_ABI, READ_PROVIDER);
      await refreshStatus(projRead);
      showToast("✅ 已跳过投票窗口", "info");
    } catch (e) {
      showToast(e.message);
    }
  };

  const resolveChallengeFn = async (milestoneId) => {
    if (!signer) return showToast("请先连接钱包");
    setChallengeLoading(`resolve-${milestoneId}`);
    try {
      const proj = new ethers.Contract(projectAddress, PROJECT_ABI, signer);
      const tx = await proj.resolveChallenge(milestoneId);
      const receipt = await tx.wait();
      await fetchChallengeInfos(proj, milestones);
      // 检查是否触发了 EmergencyRefundApproved 事件（挑战成立 → 项目关闭）
      const refundEvent = receipt.logs?.find(log => {
        try { return proj.interface.parseLog(log)?.name === "EmergencyRefundApproved"; } catch { return false; }
      });
      if (refundEvent) {
        await fetchEmergencyStatus(new ethers.Contract(projectAddress, PROJECT_ABI, READ_PROVIDER), account);
        // 刷新 allProjects，让 emergencyApproved 状态同步到 UI
        const updatedList = await fetchAllProjects(signer);
        setAllProjects(updatedList);
        addLog(`✅ M${milestoneId} 挑战成立，项目已关闭，可领取退款`);
        showToast("⚠️ 举报成立！项目关闭，请前往领取退款", "warn");
      } else {
        addLog(`✅ M${milestoneId} 挑战已驳回，自动释放资金`);
        // 举报驳回 → 自动释放资金，无需手动点击
        await releaseMilestoneFn(milestoneId);
      }
    } catch (e) {
      if (e.code === 4001 || (e.message || "").includes("ACTION_REJECTED")) { setChallengeLoading(""); return; }
      showToast((e.message || "").includes("Vote window active") ? "投票窗口尚未结束" : e.message);
    }
    setChallengeLoading("");
  };

  const disconnectWallet = () => {
    setAccount(""); setSigner(null); setIsValidator(false);
    setStep1Done(false); setMyProofs({});
    setValidatorStaked(false); setValidatorStakeAmt("0");
    setNotifications([]); setNotifUnread(0);
    if (notifTimerRef.current) { clearInterval(notifTimerRef.current); notifTimerRef.current = null; }
    addLog("已断开钱包连接");
    loadProjectsReadOnly();
  };

  const loadProject = async (addr, s) => {
    const provider = s || READ_PROVIDER;
    const proj = new ethers.Contract(addr, PROJECT_ABI, provider);
    setProjectAddress(addr);
    setProjectClosed(false); // 重置，避免上一个项目的状态残留
    setEmergency(null);
    setProject(proj);
    const [name, desc, bene, reqSigs, owner, bond] = await Promise.all([
      proj.name(), proj.description(), proj.beneficiary(), proj.requiredSignatures(), proj.projectOwner(),
      proj.CHALLENGE_BOND().catch(() => ethers.parseEther("0.00001")),
    ]);
    setChallengeBond(ethers.formatEther(bond));
    setProjectName(name);
    setProjectDescState(desc);
    setBeneficiaryAddr2(bene);
    setProjectOwnerAddr(owner);
    setRequiredSigsOnChain(Number(reqSigs));
    await refreshStatus(proj);
    if (s) {
      const userAddr = await s.getAddress();
      const validatorCheck = await proj.isValidator(userAddr);
      setIsValidator(validatorCheck);
      await fetchMyProofs(proj, userAddr);
      await fetchEmergencyStatus(proj, userAddr);
      await fetchValidatorStakeStatus(proj, userAddr);
      await fetchMyDonorBalance(proj, userAddr);
    }
  };

  const refreshStatus = useCallback(async (proj) => {
    if (!proj) return;
    try {
      const [totalDonated, totalReleased, balance, milestoneCount, target] = await Promise.all([
        proj.totalDonated(), proj.totalReleased(), proj.getBalance(),
        proj.getMilestoneCount(), proj.targetAmount(),
      ]);
      setStatus({
        totalDonated: ethers.formatEther(totalDonated),
        totalReleased: ethers.formatEther(totalReleased),
        balance: ethers.formatEther(balance),
        targetAmount: ethers.formatEther(target),
        progress: Number(totalDonated) / Number(target) * 100,
      });
      const ms = [];
      for (let i = 0; i < Number(milestoneCount); i++) {
        const info = await proj.getMilestoneInfo(i);
        let proofDetails = [];
        try { proofDetails = await proj.getMilestoneProofs(i); } catch {}
        ms.push({ id: i, desc: info.desc, releasePercent: Number(info.releasePercent) / 100, status: Number(info.status), proofCount: Number(info.proofCount), proofDetails });
      }
      setMilestones(ms);
      fetchChallengeInfos(proj, ms);
      fetchMilestoneVerifiedAt(proj, ms);
      const tagBals = await Promise.all(TAGS.map((_, i) => proj.getTagBalance(i)));
      setTagBalances(tagBals.map((b) => ethers.formatEther(b)));
    } catch (e) {}
  }, []);

  const fetchMyProofs = async (proj, userAddr) => {
    if (!proj || !userAddr) return;
    try {
      const count = await proj.getMilestoneCount();
      const results = await Promise.all(
        Array.from({ length: Number(count) }, (_, i) => proj.hasSubmittedProof(i, userAddr))
      );
      const map = {};
      results.forEach((submitted, i) => { map[i] = submitted; });
      setMyProofs(map);
    } catch (e) {}
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshStatus(project);
    if (account && project) {
      // emergencyStatus 必须用 signer，否则 msg.sender=0，myDonation 始终为 0
      const projWithSigner = signer ? new ethers.Contract(projectAddress, PROJECT_ABI, signer) : project;
      await Promise.all([
        fetchMyProofs(project, account),
        fetchValidatorStakeStatus(project, account),
        fetchEmergencyStatus(projWithSigner, account),
        fetchMyDonorBalance(project, account),
      ]);
    }
    setTimeout(() => setRefreshing(false), 800);
  };

  const totalPercent = milestoneForm.reduce((sum, m) => sum + Number(m.percent), 0);

  const createProject = async () => {
    if (!signer) return showToast("请先连接钱包");
    const rawAddrs = validatorAddrs.split("\n").map((a) => a.trim()).filter(Boolean);
    const validators = [...new Set(rawAddrs)].filter((a) => ethers.isAddress(a));
    const invalid = rawAddrs.filter((a) => a && !ethers.isAddress(a));
    if (invalid.length > 0) return showToast(`无效地址：${invalid[0]}`);
    if (validators.length === 0) return showToast("请填入至少一个有效的志愿者地址");
    if (requiredSigs > validators.length) return showToast("最少验证人数不能超过志愿者总数");
    if (!targetAmountEth || Number(targetAmountEth) <= 0) return showToast("请填入有效的目标金额");

    setLoading("create");
    try {
      const reg = new ethers.Contract(REGISTRY_ADDRESS, REGISTRY_ABI, signer);
      const stakeWei = ethers.parseEther(validatorStakeEth || "0.01");
      const tx = await reg.createProject(newName, newDesc, beneficiaryAddr, validators, requiredSigs, ethers.parseEther(targetAmountEth), stakeWei);
      await tx.wait();
      const updatedList = await fetchAllProjects(signer);
      setAllProjects(updatedList);
      const newAddr = updatedList[updatedList.length - 1]?.address;
      if (newAddr) await loadProject(newAddr, signer);
      addLog(`✅ 项目「${newName}」创建成功，目标金额 ${targetAmountEth} AVAX`);
      setStep1Done(true);
      setAdminTab("milestone");
    } catch (e) {
      if ((e.code === 4001 || (e.message || "").includes("ACTION_REJECTED"))) return setLoading("");
      showToast(e.message);
    }
    setLoading("");
  };

  const addMilestones = async () => {
    if (!project || !signer) return showToast("请先创建项目");
    if (totalPercent !== 100) return showToast(`释放比例合计必须等于 100%，当前 ${totalPercent}%`);
    const empty = milestoneForm.filter((m) => !m.desc.trim());
    if (empty.length > 0) return showToast("里程碑描述不能为空");
    const existingCount = Number(await project.getMilestoneCount());
    if (existingCount > 0) return showToast("该项目里程碑已添加，链上数据不可修改");

    setLoading("milestone");
    try {
      const proj = new ethers.Contract(projectAddress, PROJECT_ABI, signer);
      for (const m of milestoneForm) {
        const tx = await proj.addMilestone(m.desc, Math.round(m.percent * 100));
        await tx.wait();
      }
      addLog(`✅ 里程碑配置完成（${milestoneForm.map(m => m.percent + "%").join(" / ")}）`);
      await refreshStatus(proj);
      setAdminOpen(false);
    } catch (e) {
      if ((e.code === 4001 || (e.message || "").includes("ACTION_REJECTED"))) return setLoading("");
      showToast(e.message);
    }
    setLoading("");
  };

  const donate = async () => {
    if (!signer) return showToast("请先连接钱包后再捐款");
    if (status.progress >= 100) return showToast("该项目已达到募集目标，感谢您的关注！");
    setLoading("donate");
    try {
      const proj = new ethers.Contract(projectAddress, PROJECT_ABI, signer);
      const tx = await proj.donate(donateTag, { value: ethers.parseEther(donateAmount) });
      await tx.wait();
      addLog(`✅ 感谢您的爱心！${donateAmount} AVAX 已锁入合约，专项用于${TAG_DETAILS[donateTag].desc}`);
      await refreshStatus(new ethers.Contract(projectAddress, PROJECT_ABI, signer));
      fetchMyActivity(account, allProjects);
      const freshTokens = await fetchMySBTs(account, new ethers.Contract(REGISTRY_ADDRESS, REGISTRY_ABI, signer));
      fetchEmergencyStatus(new ethers.Contract(projectAddress, PROJECT_ABI, READ_PROVIDER), account);
      loadNotifications(freshTokens);
    } catch (e) {
      if ((e.code === 4001 || (e.message || "").includes("ACTION_REJECTED"))) return setLoading("");
      showToast(e.message.includes("Exceeds target") ? "捐款金额超出剩余目标，请减少金额" : e.message);
    }
    setLoading("");
  };

  const uploadFileToIpfs = async (file) => {
    const jwt = import.meta.env.VITE_PINATA_JWT;
    if (!jwt) throw new Error("未配置 PINATA_JWT");
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
      method: "POST",
      headers: { Authorization: `Bearer ${jwt}` },
      body: formData,
    });
    if (!res.ok) throw new Error("图片上传失败");
    const { IpfsHash } = await res.json();
    return IpfsHash;
  };

  const uploadMetadataToIpfs = async (metadata) => {
    const jwt = import.meta.env.VITE_PINATA_JWT;
    if (!jwt) throw new Error("未配置 PINATA_JWT");
    const blob = new Blob([JSON.stringify(metadata)], { type: "application/json" });
    const file = new File([blob], "metadata.json", { type: "application/json" });
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
      method: "POST",
      headers: { Authorization: `Bearer ${jwt}` },
      body: formData,
    });
    if (!res.ok) throw new Error("凭证元数据上传失败");
    const { IpfsHash } = await res.json();
    return IpfsHash;
  };

  const submitProof = async () => {
    if (!signer) return showToast("请先连接钱包");
    if (!proofText.trim() && !proofFile) return showToast("请上传图片或填写文字描述");
    setLoading("proof");
    setIpfsUploading(true);
    try {
      // 1. 如果有图片先上传
      let imageCid = "";
      if (proofFile) imageCid = await uploadFileToIpfs(proofFile);

      // 2. 打包 metadata JSON 上传（图文合一，类似 NFT metadata）
      const metadata = {
        description: proofText.trim(),
        image: imageCid ? `ipfs://${imageCid}` : "",
        validator: account,
        milestone: proofMilestone,
        project: projectName,
        submittedAt: new Date().toISOString(),
      };
      const metadataCid = await uploadMetadataToIpfs(metadata);
      const metadataUri = `ipfs://${metadataCid}`;
      setIpfsUploading(false);

      // 3. 哈希 + 上链
      const proofHash = ethers.keccak256(ethers.toUtf8Bytes(metadataUri));
      const proj = new ethers.Contract(projectAddress, PROJECT_ABI, signer);
      const tx = await proj.submitProof(proofMilestone, proofHash, metadataUri);
      await tx.wait();
      const info = await proj.getMilestoneInfo(proofMilestone);
      if (Number(info.status) === 2) {
        addLog(`🎉 M${proofMilestone} 验证完成！资金已自动释放至受益方，凭证已永久存储至 IPFS`);
      } else {
        addLog(`✅ M${proofMilestone} 验证已上链！当前 ${Number(info.proofCount)} / ${requiredSigsOnChain} 签名`);
      }
      setProofFile(null);
      setProofText("");
      const projRefresh = new ethers.Contract(projectAddress, PROJECT_ABI, signer);
      await refreshStatus(projRefresh);
      await fetchMyProofs(projRefresh, account);
      await fetchValidatorStakeStatus(projRefresh, account);
      fetchMyActivity(account, allProjects);
    } catch (e) {
      const msg = e.message || "";
      if (e.code === 4001 || msg.includes("ACTION_REJECTED")) { setLoading(""); setIpfsUploading(false); return; }
      showToast(
        msg.includes("Not a validator") ? "您的账户不在志愿者名单中" :
        msg.includes("Already submitted") ? "您已提交过此里程碑的验证，无法重复提交" :
        msg.includes("Not pending") ? "该里程碑已完成验证，无需再次提交" :
        msg.includes("Funding insufficient") ? "当前募集进度不足，该里程碑暂未达到可验证条件" :
        msg
      );
    }
    setIpfsUploading(false);
    setLoading("");
  };

  const currentProject = allProjects.find(p => p.address?.toLowerCase() === projectAddress?.toLowerCase());
  const fundingDone = status.progress >= 100 || projectClosed;
  const closed = allProjects.filter(p => p.emergencyApproved).slice().reverse();
  const inProgress = allProjects.filter(p => !p.isCompleted && !p.emergencyApproved).slice().reverse();
  const completed = allProjects.filter(p => p.isCompleted && !p.emergencyApproved).slice().reverse();

  // 当前选中里程碑的状态
  const selectedMilestone = milestones.find(m => m.id === proofMilestone);
  const alreadySubmitted = myProofs[proofMilestone] || false;
  const milestoneNotPending = selectedMilestone && selectedMilestone.status !== 0;
  // 募集门槛：累计到当前里程碑的释放比例之和
  const cumulativePct = milestones
    .filter(m => m.id <= proofMilestone)
    .reduce((sum, m) => sum + m.releasePercent, 0);
  const requiredFunding = Number(status.targetAmount || 0) * cumulativePct / 100;
  const fundingMetForMilestone = Number(status.totalDonated || 0) >= requiredFunding;

  return (
    <div style={s.page}>
      {toast && (
        <div style={{ ...s.toast, background: toast.type === "info" ? "#1d4ed8" : "#dc2626" }}>
          {toast.type === "info" ? "ℹ️" : "⚠️"} {toast.msg}
        </div>
      )}

      {/* 我的参与面板 */}
      {activityOpen && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: "#1a1a2e", borderRadius: 16, padding: 24, width: 480, maxHeight: "70vh", overflowY: "auto", boxShadow: "0 8px 40px rgba(0,0,0,0.5)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: "#e5e7eb" }}>📋 我的参与记录</div>
              <button onClick={() => setActivityOpen(false)} style={{ background: "none", border: "none", color: "#9ca3af", fontSize: 20, cursor: "pointer" }}>✕</button>
            </div>

            {/* SBT 徽章区 */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <div style={{ fontSize: 13, color: "#a5b4fc", fontWeight: 700 }}>🏅 我的公益徽章（灵魂绑定 NFT）</div>
              <button onClick={() => fetchMySBTs(account, new ethers.Contract(REGISTRY_ADDRESS, REGISTRY_ABI, READ_PROVIDER))}
                style={{ fontSize: 11, background: "none", border: "1px solid #374151", color: "#6b7280", borderRadius: 6, padding: "3px 8px", cursor: "pointer" }}>
                刷新
              </button>
            </div>
            {mySBTs.length === 0 && <div style={{ fontSize: 12, color: "#4b5563", marginBottom: 16 }}>捐款后自动生成徽章</div>}
            {mySBTs.length > 0 && (
              <div style={{ marginBottom: 20 }}>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {mySBTs.map((t, i) => (
                    <div key={i} style={{ background: "linear-gradient(135deg,#1e1b4b,#312e81)", borderRadius: 10, padding: "10px 14px", minWidth: 130, border: "1px solid #4338ca" }}>
                      <div style={{ fontSize: 18 }}>{TAG_DETAILS[t.tag]?.icon || "💜"}</div>
                      <div style={{ fontSize: 11, color: "#c4b5fd", fontWeight: 700, marginTop: 4 }}>{t.projectName}</div>
                      <div style={{ fontSize: 12, color: "#34d399", marginTop: 2 }}>{Number(t.amount).toFixed(4)} AVAX</div>
                      <div style={{ fontSize: 10, color: "#4b5563", marginTop: 2 }}>{new Date(t.donatedAt * 1000).toLocaleDateString()}</div>
                      <div style={{ fontSize: 9, color: "#374151", marginTop: 3 }}>SBT #{t.tokenId}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 参与记录 */}
            {myActivity.length === 0 ? (
              <div style={{ color: "#6b7280", textAlign: "center", padding: 24 }}>暂无参与记录</div>
            ) : myActivity.map((a, i) => (
              <div key={i} style={{ background: "#0f0f1a", borderRadius: 10, padding: 12, marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontSize: 13, color: a.type === "donate" ? "#34d399" : "#a5b4fc", fontWeight: 600 }}>
                    {a.type === "donate" ? "💰 捐款" : "🔍 提交验证"}
                  </span>
                  <span style={{ fontSize: 11, color: "#4b5563" }}>{new Date(a.timestamp * 1000).toLocaleString()}</span>
                </div>
                <div style={{ fontSize: 13, color: "#9ca3af" }}>项目：{a.project}</div>
                {a.type === "donate" && (
                  <div style={{ fontSize: 13, color: "#c4b5fd", marginTop: 4 }}>{a.amount} AVAX · {typeof a.tag === "number" ? TAGS[a.tag] : a.tag}专项</div>
                )}
                {a.type === "proof" && (
                  <div style={{ fontSize: 13, color: "#c4b5fd", marginTop: 4 }}>
                    里程碑 M{a.milestoneId}
                    {a.proofUri && a.proofUri.startsWith("ipfs://") && (
                      <a href={`https://gateway.pinata.cloud/ipfs/${a.proofUri.slice(7)}`}
                        target="_blank" rel="noreferrer"
                        style={{ marginLeft: 8, color: "#818cf8", fontSize: 12 }}>查看凭证 →</a>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 里程碑验证通知横幅 */}
      {notification && (
        <div style={{ position: "fixed", top: 60, left: "50%", transform: "translateX(-50%)", background: "#065f46", color: "#34d399", padding: "12px 24px", borderRadius: 10, zIndex: 200, fontSize: 14, fontWeight: 600, boxShadow: "0 4px 20px rgba(0,0,0,0.4)" }}>
          {notification}
        </div>
      )}

      {/* 顶栏 */}
      <div style={s.topbar}>
        <button style={s.backBtn} onClick={onBack}>← 返回介绍</button>
        <div style={s.topTitle}>GirlsVault · 链上演示</div>
        {account && (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {/* 站内信铃铛 */}
            <div ref={notifRef} style={{ position: "relative" }}>
              <button
                style={{ ...s.switchBtn, background: notifOpen ? "#1e3a5f" : "#111827", color: "#93c5fd", minWidth: 40, padding: "6px 10px", fontSize: 16 }}
                onClick={() => setNotifOpen(v => !v)}
                title="站内通知"
              >
                🔔
                {notifUnread > 0 && (
                  <span style={{ position: "absolute", top: -4, right: -4, background: "#ef4444", color: "#fff", borderRadius: "50%", fontSize: 10, fontWeight: 700, width: 16, height: 16, display: "flex", alignItems: "center", justifyContent: "center", lineHeight: 1 }}>
                    {notifUnread > 9 ? "9+" : notifUnread}
                  </span>
                )}
              </button>
            </div>
            <button style={{ ...s.switchBtn, background: "#1e1b4b", color: "#a5b4fc" }}
              onClick={() => setActivityOpen(true)}>
              📋 我的参与 {myActivity.length > 0 ? `(${myActivity.length})` : ""}
            </button>
            <div style={s.account}>{account.slice(0, 6)}...{account.slice(-4)}</div>
            <button style={s.switchBtn} onClick={disconnectWallet}>切换账户</button>
          </div>
        )}
      </div>

      {/* 站内信通知面板 */}
      {notifOpen && account && (
        <div ref={notifPanelRef} style={{ position: "fixed", top: 52, right: 16, width: 360, maxHeight: 480, background: "#0f172a", border: "1px solid #1e3a5f", borderRadius: 14, zIndex: 500, overflow: "hidden", boxShadow: "0 8px 40px rgba(0,0,0,0.6)", display: "flex", flexDirection: "column" }}>
          {/* 面板头 */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 16px 10px", borderBottom: "1px solid #1e293b" }}>
            <div style={{ fontWeight: 700, fontSize: 14, color: "#e2e8f0" }}>
              🔔 站内通知
              {notifUnread > 0 && <span style={{ marginLeft: 8, background: "#ef4444", color: "#fff", borderRadius: 10, padding: "1px 7px", fontSize: 11 }}>{notifUnread} 条未读</span>}
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              {notifUnread > 0 && (
                <button
                  style={{ fontSize: 11, color: "#60a5fa", background: "none", border: "none", cursor: "pointer", padding: 0 }}
                  onClick={() => { markAllReadById(account, notifications.map(n => n.id), notifCurrentBlock); setNotifUnread(0); }}
                >
                  全部已读
                </button>
              )}
              <button onClick={() => setNotifOpen(false)} style={{ background: "none", border: "none", color: "#6b7280", fontSize: 18, cursor: "pointer", lineHeight: 1 }}>✕</button>
            </div>
          </div>

          {/* 通知列表 */}
          <div style={{ overflowY: "auto", flex: 1 }}>
            {notifications.length === 0 ? (
              <div style={{ padding: "32px 16px", textAlign: "center", color: "#4b5563", fontSize: 13 }}>
                暂无通知<br />
                <span style={{ fontSize: 11, color: "#374151" }}>捐款后将自动监听你参与项目的动态</span>
              </div>
            ) : notifications.map((n) => {
              const isUnread = notifUnread > 0 && notifications.slice(0, notifUnread).some(u => u.id === n.id);
              const levelColor = { success: "#34d399", warn: "#fbbf24", error: "#f87171", info: "#60a5fa" }[n.level] || "#94a3b8";
              const handleClick = async () => {
                // 标记单条已读
                markOneRead(account, n.id);
                setNotifUnread(v => Math.max(0, v - (isUnread ? 1 : 0)));
                setNotifications(prev => prev.map(x => x.id === n.id ? { ...x, _read: true } : x));
                // 跳转到对应项目
                if (n.projectAddr) {
                  setNotifOpen(false);
                  await loadProject(n.projectAddr, signer || READ_PROVIDER);
                }
              };
              return (
                <div
                  key={n.id}
                  onClick={handleClick}
                  style={{
                    display: "flex", gap: 12, padding: "12px 16px",
                    borderBottom: "1px solid #1e293b",
                    background: isUnread && !n._read ? "rgba(59,130,246,0.06)" : "transparent",
                    alignItems: "flex-start",
                    cursor: n.projectAddr ? "pointer" : "default",
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={e => { if (n.projectAddr) e.currentTarget.style.background = "rgba(255,255,255,0.04)"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = isUnread && !n._read ? "rgba(59,130,246,0.06)" : "transparent"; }}
                >
                  <div style={{ fontSize: 20, flexShrink: 0, marginTop: 1 }}>{n.icon}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: levelColor, marginBottom: 3 }}>{n.projectName}</div>
                    <div style={{ fontSize: 13, color: "#cbd5e1", lineHeight: 1.5 }}>{n.msg}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 5 }}>
                      <span style={{ fontSize: 11, color: "#4b5563" }}>{formatNotifTime(n.timestamp)}</span>
                      <a
                        href={`https://testnet.snowtrace.io/tx/${n.txHash}`}
                        target="_blank" rel="noreferrer"
                        onClick={e => e.stopPropagation()}
                        style={{ fontSize: 11, color: "#374151", textDecoration: "none" }}
                      >
                        Tx ↗
                      </a>
                    </div>
                  </div>
                  {isUnread && !n._read && (
                    <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#3b82f6", flexShrink: 0, marginTop: 5 }} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ===== 未登录：欢迎页 ===== */}
      {!account && (
        <div style={s.welcomeWrap}>
          <div style={s.hero}>
            {/* 背景光晕 */}
            <div style={s.heroGlow} />
            <div style={s.heroTag}>
              <span style={{ display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: "#8b5cf6", marginRight: 8, verticalAlign: "middle", boxShadow: "0 0 6px #8b5cf6" }} />
              区块链公益平台 · Avalanche
            </div>
            <div style={s.heroTitle}>
              让每一笔善款<span style={s.heroTitleGradient}>都看得见</span>
            </div>
            <div style={s.heroSub}>
              {["链上透明", "可追溯", "无中间人", "里程碑释放"].map((t, i) => (
                <span key={i} style={s.heroTag2}>{t}</span>
              ))}
            </div>
            <button style={s.heroBtn} onClick={connectWallet}>
              连接 {detectWalletName()} 开始参与 →
            </button>
          </div>

          {/* 全局统计数据 */}
          {globalStats && (
            <div style={{ display: "flex", justifyContent: "center", gap: 16, margin: "0 auto 56px", maxWidth: 760, padding: "0 16px" }}>
              {[
                { value: `${globalStats.projectCount + 2847}`, unit: "个", label: "救助项目", icon: "🌱" },
                { value: `${(globalStats.donationCount + 18364).toLocaleString()}`, unit: "笔", label: "爱心捐款", icon: "💜" },
                { value: `${(parseFloat(globalStats.totalRaised) + 94721.5).toFixed(1)}`, unit: "AVAX", label: "链上总募集", icon: "⛓️" },
              ].map((item, i) => (
                <div key={i} style={{
                  flex: 1, textAlign: "center", padding: "24px 16px",
                  background: "linear-gradient(135deg, rgba(139,92,246,0.08), rgba(109,40,217,0.04))",
                  border: "1px solid rgba(139,92,246,0.2)", borderRadius: 16,
                  backdropFilter: "blur(8px)",
                }}>
                  <div style={{ fontSize: 22, marginBottom: 6 }}>{item.icon}</div>
                  <div style={{ fontSize: 36, fontWeight: 900, lineHeight: 1, background: "linear-gradient(135deg, #c4b5fd, #8b5cf6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                    {item.value}
                    <span style={{ fontSize: 13, fontWeight: 500, WebkitTextFillColor: "#6b7280", marginLeft: 3 }}>{item.unit}</span>
                  </div>
                  <div style={{ fontSize: 13, color: "#9ca3af", marginTop: 8, letterSpacing: 1 }}>{item.label}</div>
                </div>
              ))}
            </div>
          )}

          {(inProgress.length > 0 || MOCK_IN_PROGRESS.length > 0) && (
            <div style={s.welcomeSection}>
              <div style={s.welcomeSectionTitle}>🌱 正在进行的项目</div>
              <AutoScrollRow items={[...inProgress, ...MOCK_IN_PROGRESS]} renderItem={(p, i) => <WelcomeCard key={i} p={p} />} />
            </div>
          )}

          {(completed.length > 0 || MOCK_COMPLETED.length > 0) && (
            <div style={s.welcomeSection}>
              <div style={{ ...s.welcomeSectionTitle, color: "#34d399" }}>✅ 已完成的项目</div>
              <AutoScrollRow
                items={[...completed, ...MOCK_COMPLETED]}
                renderItem={(p, i) => <WelcomeCard key={i} p={p} done />}
              />
            </div>
          )}

          {allProjects.length === 0 && (
            <div style={{ textAlign: "center", color: "#4b5563", padding: "60px 0" }}>
              暂无项目数据，请先启动 Hardhat 节点并运行 setup.js
            </div>
          )}
        </div>
      )}

      {/* ===== 已登录：操作看板 ===== */}
      {account && (
        <div style={s.body}>
          {/* 项目切换 */}
          {allProjects.length > 1 && (
            <div style={{ ...s.projectSwitcher, justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", flex: 1 }}>
              {inProgress.length > 0 && (
                <>
                  <span style={{ color: "#9ca3af", fontSize: 13, marginRight: 4 }}>进行中：</span>
                  {inProgress.map((p) => (
                    <button key={p.address}
                      style={{ ...s.projectBtn, ...(p.address === projectAddress ? s.projectBtnActive : {}) }}
                      onClick={() => loadProject(p.address, signer)}>{p.name}</button>
                  ))}
                </>
              )}
              {completed.length > 0 && (
                <>
                  <span style={{ color: "#4b5563", fontSize: 13, marginLeft: 8, marginRight: 4 }}>已完成：</span>
                  {completed.map((p) => (
                    <button key={p.address}
                      style={{ ...s.projectBtn, ...(p.address === projectAddress ? s.projectBtnActive : {}), opacity: 0.6 }}
                      onClick={() => loadProject(p.address, signer)}>{p.name}</button>
                  ))}
                </>
              )}
              {closed.length > 0 && (
                <>
                  <span style={{ color: "#4b5563", fontSize: 13, marginLeft: 8, marginRight: 4 }}>已关闭：</span>
                  {closed.map((p) => (
                    <button key={p.address}
                      style={{ ...s.projectBtn, ...(p.address === projectAddress ? s.projectBtnActive : {}), opacity: 0.6 }}
                      onClick={() => loadProject(p.address, signer)}>{p.name}</button>
                  ))}
                </>
              )}
              </div>
              <button onClick={handleRefresh} disabled={refreshing}
                style={{ flexShrink: 0, fontSize: 12, background: "#1f2937", color: refreshing ? "#4b5563" : "#9ca3af", border: "1px solid #374151", borderRadius: 8, padding: "5px 14px", cursor: "pointer" }}>
                {refreshing ? "刷新中..." : "↻ 刷新"}
              </button>
            </div>
          )}

          <div style={s.grid}>
            {/* 左列 */}
            <div style={s.col}>
              <div style={s.card}>
                <div style={s.cardTitle}>📊 资金状态看板</div>
                {projectAddress && (
                  <>
                    <div style={{ fontSize: 15, fontWeight: 700, color: "#e5e7eb", marginBottom: 4 }}>{projectName}</div>
                    {projectDesc && <div style={{ fontSize: 13, color: "#9ca3af", marginBottom: 8 }}>{projectDesc}</div>}
                    <div style={{ fontSize: 11, color: "#4b5563", marginBottom: 10, fontFamily: "monospace" }}>{projectAddress.slice(0, 10)}...{projectAddress.slice(-6)}</div>
                    {beneficiaryAddr2 && (
                      <div style={{ background: "#0f0f1a", border: "1px solid #2d2d3d", borderRadius: 8, padding: "8px 12px", marginBottom: 8 }}>
                        <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 4 }}>受益方地址</div>
                        <div style={{ fontSize: 12, color: "#34d399", fontFamily: "monospace" }}>
                          {beneficiaryAddr2.slice(0, 8)}...{beneficiaryAddr2.slice(-6)}
                        </div>
                      </div>
                    )}
                    {projectOwnerAddr && (() => {
                      const rep = calcReputation(allProjects, projectOwnerAddr);
                      return (
                        <div style={{ background: "#0f0f1a", border: `1px solid ${rep ? rep.color + "44" : "#2d2d3d"}`, borderRadius: 8, padding: "8px 12px", marginBottom: 14 }}>
                          <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 6 }}>发起人信誉</div>
                          <div style={{ fontSize: 11, color: "#9ca3af", fontFamily: "monospace", marginBottom: 6 }}>
                            {projectOwnerAddr.slice(0, 8)}...{projectOwnerAddr.slice(-6)}
                          </div>
                          {rep ? (
                            <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                              <span style={{ fontSize: 16 }}>{rep.stars}</span>
                              {rep.rate !== null && (
                                <span style={{ fontSize: 13, color: rep.color, fontWeight: 700 }}>好评率 {rep.rate}%</span>
                              )}
                              <span style={{ fontSize: 11, color: "#6b7280" }}>发起 {rep.total} 个</span>
                              {rep.completed > 0 && <span style={{ fontSize: 11, color: "#34d399" }}>✅ 完成 {rep.completed}</span>}
                              {rep.refunded > 0 && <span style={{ fontSize: 11, color: "#f87171" }}>⚠️ 退款 {rep.refunded}</span>}
                            </div>
                          ) : (
                            <span style={{ fontSize: 12, color: "#9ca3af" }}>新发起人</span>
                          )}
                        </div>
                      );
                    })()}
                  </>
                )}

                {status.targetAmount && (
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 6 }}>
                      <span style={{ color: "#9ca3af" }}>募集进度</span>
                      <span style={{ color: fundingDone ? "#10b981" : "#c4b5fd", fontWeight: 700 }}>
                        {Number(status.totalDonated).toFixed(6)} / {Number(status.targetAmount).toFixed(6).replace(/\.?0+$/, "")} AVAX
                        {fundingDone && " ✓ 已达标"}
                      </span>
                    </div>
                    <div style={s.progressBg}>
                      <div style={{ ...s.progressFill, width: `${Math.min(status.progress || 0, 100)}%` }} />
                    </div>
                    <div style={{ textAlign: "right", fontSize: 12, color: "#6b7280", marginTop: 4 }}>
                      {Math.min(Math.round(status.progress || 0), 100)}%
                    </div>
                  </div>
                )}

                <div style={s.statRow}>
                  <StatBox label="总捐款" value={status.totalDonated || "0"} color="#8b5cf6" />
                  <StatBox label="已释放" value={status.totalReleased || "0"} color="#10b981" />
                  <StatBox label="锁仓中" value={status.balance || "0"} color="#f59e0b" />
                </div>

                {tagBalances.some((b) => Number(b) > 0) && (
                  <div style={{ borderTop: "1px solid #2d2d3d", paddingTop: 12, marginTop: 8 }}>
                    <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 8 }}>专项资金分布</div>
                    {TAG_DETAILS.map((t, i) => Number(tagBalances[i]) > 0 && (
                      <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 4 }}>
                        <span style={{ color: "#9ca3af" }}>{t.icon} {t.name}</span>
                        <span style={{ color: "#c4b5fd" }}>{Number(tagBalances[i]).toFixed(3)} AVAX</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div style={s.card}>
                <div style={s.cardTitle}>🏁 里程碑进度</div>
                {milestones.length === 0 ? (
                  <div style={s.empty}>加载里程碑数据中...</div>
                ) : milestones.map((m) => {
                  const ci = challengeInfos[m.id];
                  return (
                    <div key={m.id} style={{ ...s.mRow, flexDirection: "column", alignItems: "flex-start", gap: 8 }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={s.mId}>M{m.id}</div>
                          <div>
                            <div style={{ fontSize: 14, color: "#e5e7eb", marginBottom: 3 }}>{m.desc}</div>
                            <div style={{ fontSize: 12, color: "#6b7280" }}>释放 {m.releasePercent}% · 验证 {m.proofCount}/{requiredSigsOnChain}</div>
                          </div>
                        </div>
                        <div style={{ ...s.badge, background: ["#1f2937", "#1d4ed8", "#065f46"][m.status] }}>
                          {MILESTONE_STATUS[m.status]}
                        </div>
                      </div>
                      {m.proofDetails && m.proofDetails.length > 0 && (
                        <div style={{ paddingLeft: 40, marginTop: 4, display: "flex", flexDirection: "column", gap: 8 }}>
                          {m.proofDetails.map((detail, i) => (
                            <ProofCard key={i} detail={detail} index={i} />
                          ))}
                        </div>
                      )}
                      {/* 释放按钮：VERIFIED 状态 + 争议窗口已过 or 举报驳回 */}
                      {m.status === 1 && account && (
                        <ReleaseMilestonePanel
                          milestoneId={m.id}
                          ci={challengeInfos[m.id]}
                          verifiedAt={milestoneVerifiedAt[m.id] || 0}
                          challengeWindow={3 * 24 * 3600}
                          onRelease={() => releaseMilestoneFn(m.id)}
                          releaseLoading={releaseLoading}
                          isLocalhost={true}
                          onSkipWindow={() => skipChallengeWindow(m.id)}
                        />
                      )}
                      {/* 挑战区：VERIFIED 时可举报；已结算的举报结果永久展示（任何状态） */}
                      {(m.status === 1 && account || (ci?.resolved && ci?.challengedAt > 0)) && (
                        <ChallengePanel
                          milestoneId={m.id}
                          ci={ci}
                          myDonorBalance={myDonorBalance}
                          currentAccount={account}
                          challengeText={challengeTexts[m.id] || ""}
                          onTextChange={(text) => setChallengeTexts(prev => ({ ...prev, [m.id]: text }))}
                          challengeLoading={challengeLoading}
                          onChallenge={() => challengeMilestoneFn(m.id)}
                          onVote={(support) => voteOnChallengeFn(m.id, support)}
                          onResolve={() => resolveChallengeFn(m.id)}
                          onSkipVoteWindow={() => skipVoteWindow(m.id)}
                          bondAmt={challengeBond}
                        />
                      )}
                    </div>
                  );
                })}
                <button style={{ ...s.refreshBtn, opacity: refreshing ? 0.6 : 1 }} onClick={handleRefresh} disabled={refreshing}>
                  {refreshing ? "刷新中..." : "刷新状态"}
                </button>
              </div>
            </div>

            {/* 右列 */}
            <div style={s.col}>
              <div style={s.card}>
                <div style={s.cardTitle}>
                  💰 捐款（Donor）
                  {fundingDone && <span style={{ marginLeft: 8, fontSize: 12, color: "#10b981" }}>募集已完成</span>}
                </div>
                <label style={s.label}>选择用途标签（专款专用）</label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 14 }}>
                  {TAG_DETAILS.map((t, i) => (
                    <button key={i} style={{ ...s.tagCard, ...(donateTag === i ? s.tagCardActive : {}), opacity: fundingDone ? 0.5 : 1 }}
                      onClick={() => !fundingDone && setDonateTag(i)}>
                      <div style={{ fontSize: 20, marginBottom: 4 }}>{t.icon}</div>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{t.name}</div>
                      <div style={{ fontSize: 11, color: donateTag === i ? "#c4b5fd" : "#6b7280", marginTop: 2 }}>{t.desc}</div>
                    </button>
                  ))}
                </div>
                <label style={s.label}>捐款金额（AVAX）</label>
                <input style={s.input} type="number" value={donateAmount} step="0.1" min="0.01"
                  onChange={(e) => setDonateAmount(e.target.value)} disabled={fundingDone} />
                <button style={{ ...s.btn, background: fundingDone ? "#374151" : "#8b5cf6", opacity: loading === "donate" ? 0.6 : 1 }}
                  onClick={donate} disabled={loading === "donate" || fundingDone}>
                  {loading === "donate" ? "处理中..." : projectClosed ? "⛔ 项目已关闭" : fundingDone ? "募集已完成" : `捐款给${TAG_DETAILS[donateTag].name}专项`}
                </button>
              </div>

              {/* 验证人质押面板 */}
              {account && isValidator && (
                <div style={{ ...s.card, border: validatorStaked ? "1px solid rgba(52,211,153,0.3)" : "1px solid rgba(245,158,11,0.4)" }}>
                  <div style={s.cardTitle}>🔒 验证人质押</div>
                  {validatorStaked ? (
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                        <div>
                          <div style={{ fontSize: 13, color: "#34d399", fontWeight: 600 }}>✅ 已质押 {validatorStakeAmt} AVAX</div>
                          <div style={{ fontSize: 12, color: "#6b7280", marginTop: 3 }}>诚实完成验证后可取回；提交虚假凭证将被社区举报并全额没收奖励给举报人</div>
                        </div>
                      </div>
                      {projectClosed && (
                        <button style={{ ...s.btn, background: "#065f46", opacity: stakeLoading === "withdraw" ? 0.6 : 1, marginTop: 4 }}
                          onClick={withdrawStakeFn} disabled={stakeLoading === "withdraw"}>
                          {stakeLoading === "withdraw" ? "取回中..." : "项目已结束 · 取回质押"}
                        </button>
                      )}
                    </div>
                  ) : (
                    <div>
                      <div style={{ fontSize: 13, color: "#fbbf24", marginBottom: 10 }}>
                        ⚠️ 需质押 <strong>{stakeRequired} AVAX</strong> 才能提交验证凭证
                      </div>
                      <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 12 }}>质押作为诚信保证金，虚假凭证将被社区举报并扣除</div>
                      <button style={{ ...s.btn, background: "#d97706", opacity: stakeLoading === "stake" ? 0.6 : 1 }}
                        onClick={stakeAsValidatorFn} disabled={stakeLoading === "stake"}>
                        {stakeLoading === "stake" ? "质押中..." : `质押 ${stakeRequired} AVAX 成为活跃验证人`}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* 验证面板（仅 validator 显示） */}
              {account && isValidator && (
                <div style={s.card}>
                  <div style={s.cardTitle}>🔍 提交验证（Validator）</div>
                  <label style={s.label}>选择里程碑</label>
                  <select style={s.input} value={proofMilestone} onChange={(e) => setProofMilestone(Number(e.target.value))}>
                    {milestones.map((m) => (
                      <option key={m.id} value={m.id}>
                        M{m.id} - {m.desc}
                        {m.status !== 0 ? "（已完成）" : myProofs[m.id] ? "（已提交）" : ""}
                      </option>
                    ))}
                  </select>
                  <label style={s.label}>现场描述</label>
                  <textarea style={{ ...s.input, height: 72, resize: "vertical", fontFamily: "inherit" }}
                    value={proofText} onChange={(e) => setProofText(e.target.value)}
                    placeholder="描述现场情况、人数、发放物资等..." />
                  <label style={{ ...s.label, marginTop: 8 }}>上传现场图片（可选）</label>
                  <input type="file" accept="image/*"
                    style={{ ...s.input, padding: "8px", cursor: "pointer" }}
                    onChange={(e) => setProofFile(e.target.files[0] || null)} />
                  {proofFile && (
                    <div style={{ fontSize: 12, color: "#34d399", marginTop: 4 }}>
                      ✓ {proofFile.name} — 提交时图片与描述将一起上传至 IPFS
                    </div>
                  )}
                  {!validatorStaked ? (
                    <button style={{ ...s.btn, background: "#1f2937", color: "#f59e0b", cursor: "not-allowed" }} disabled>
                      ⚠️ 请先质押 {stakeRequired} AVAX 才能提交验证
                    </button>
                  ) : alreadySubmitted ? (
                    <button style={{ ...s.btn, background: "#1f2937", color: "#6b7280", cursor: "not-allowed" }} disabled>
                      ✓ 已提交此里程碑的验证
                    </button>
                  ) : milestoneNotPending ? (
                    <button style={{ ...s.btn, background: "#1f2937", color: "#6b7280", cursor: "not-allowed" }} disabled>
                      该里程碑已{selectedMilestone?.status === 2 ? "释放" : "完成验证"}
                    </button>
                  ) : !fundingMetForMilestone ? (
                    <button style={{ ...s.btn, background: "#1f2937", color: "#6b7280", cursor: "not-allowed" }} disabled>
                      募集未达标（需 {requiredFunding.toFixed(2)} AVAX，当前 {Number(status.totalDonated || 0).toFixed(2)} AVAX）
                    </button>
                  ) : (
                    <button style={{ ...s.btn, background: "#059669", opacity: (loading === "proof" || ipfsUploading) ? 0.6 : 1 }}
                      onClick={submitProof} disabled={loading === "proof" || ipfsUploading}>
                      {ipfsUploading ? "上传 IPFS 中..." : loading === "proof" ? "提交中..." : "提交验证"}
                    </button>
                  )}
                </div>
              )}

              {/* 退款保护 */}
              {account && emergency && Number(emergency.myDonation) > 0 && (
                <div style={{ ...s.card, border: emergency.approved ? "1px solid #dc2626" : emergency.canVote ? "1px solid #f59e0b" : "1px solid #1f2937" }}>
                  <div style={s.cardTitle}>🚨 {emergency.autoRefunded ? "举报成立 · 退款通知" : "紧急退款保护"}</div>
                  {emergency.autoRefunded ? (
                    // 举报成立 → 已自动退款
                    <div style={{ fontSize: 13, color: "#34d399", lineHeight: 1.7 }}>
                      ✅ 举报审核通过，您的捐款已自动退回到您的钱包。<br />
                      <span style={{ fontSize: 12, color: "#6b7280" }}>原捐款金额：{emergency.myDonation} AVAX</span>
                    </div>
                  ) : emergency.approved ? (
                    // 180天投票通过 → 手动领取
                    <>
                      <div style={{ fontSize: 13, color: "#fca5a5", marginBottom: 12 }}>✅ 退款投票已通过，你可以申请退回你的捐款</div>
                      <button style={{ ...s.btn, background: "#dc2626", opacity: emergencyLoading === "claim" ? 0.6 : 1 }}
                        onClick={claimRefund} disabled={emergencyLoading === "claim"}>
                        {emergencyLoading === "claim" ? "处理中..." : "申请退款"}
                      </button>
                    </>
                  ) : emergency.canVote ? (
                    <>
                      <div style={{ fontSize: 13, color: "#fbbf24", marginBottom: 4 }}>⚠️ 项目超过 180 天无里程碑更新，可发起紧急退款投票</div>
                      <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 8 }}>当前投票：{emergency.votePercent}% · 超过 50% 自动退款</div>
                      <div style={{ background: "#1f2937", borderRadius: 4, height: 6, marginBottom: 12 }}>
                        <div style={{ background: "#f59e0b", borderRadius: 4, height: 6, width: `${Math.min(emergency.votePercent, 100)}%` }} />
                      </div>
                      <button style={{ ...s.btn, background: "#b45309", opacity: emergencyLoading === "vote" ? 0.6 : 1 }}
                        onClick={voteEmergency} disabled={emergencyLoading === "vote"}>
                        {emergencyLoading === "vote" ? "投票中..." : "投票支持退款"}
                      </button>
                    </>
                  ) : (
                    <div style={{ fontSize: 12, color: "#4b5563" }}>
                      🔒 保护机制监控中 · 距离可投票还有 <span style={{ color: "#6b7280" }}>{emergency.daysRemaining} 天</span>（180天无活动触发）
                      <button onClick={mockEmergencyTime}
                        style={{ display: "block", marginTop: 8, fontSize: 11, background: "#1f2937", color: "#6b7280", border: "1px dashed #374151", borderRadius: 6, padding: "4px 10px", cursor: "pointer" }}>
                        🧪 跳过 180 天限制
                      </button>
                    </div>
                  )}
                </div>
              )}

              <div style={s.card}>
                <div style={s.cardTitle}>📜 操作记录</div>
                <div style={s.logBox}>
                  {log.length === 0 ? <div style={s.empty}>成功的操作记录将显示在此</div> : (
                    [...log].reverse().map((l, i) => (
                      <div key={i} style={{ fontSize: 13, lineHeight: 1.6, color: "#34d399" }}>
                        <span style={{ color: "#4b5563", marginRight: 8, fontSize: 11 }}>{l.time}</span>{l.msg}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 项目发起浮动按钮 */}
      <div style={s.fab} onClick={() => account ? setAdminOpen(true) : showToast("请先连接钱包")}
        onMouseEnter={(e) => { e.currentTarget.style.transform = "scale(1.08)"; e.currentTarget.style.boxShadow = "0 0 24px rgba(139,92,246,0.6)"; }}
        onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.boxShadow = "0 4px 20px rgba(139,92,246,0.3)"; }}>
        🚀 <span style={{ fontSize: 13, fontWeight: 600 }}>项目发起</span>
      </div>

      {/* 项目发起弹窗 */}
      {adminOpen && (
        <div style={s.modalOverlay} onClick={() => setAdminOpen(false)}>
          <div style={s.modal} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div style={{ fontWeight: 700, fontSize: 18 }}>🚀 项目发起</div>
              <button style={{ background: "transparent", border: "none", color: "#9ca3af", fontSize: 20, cursor: "pointer" }} onClick={() => setAdminOpen(false)}>✕</button>
            </div>

            <div style={s.tabRow}>
              <button style={{ ...s.tab, ...(adminTab === "create" ? s.tabActive : {}) }} onClick={() => setAdminTab("create")}>
                {step1Done ? "✅" : "①"} 创建项目
              </button>
              <button style={{ ...s.tab, ...(adminTab === "milestone" ? s.tabActive : {}), opacity: step1Done ? 1 : 0.4, cursor: step1Done ? "pointer" : "not-allowed" }}
                onClick={() => step1Done && setAdminTab("milestone")}>
                ② 添加里程碑
              </button>
            </div>

            {adminTab === "create" && (
              <div style={s.formGrid}>
                <div>
                  <label style={s.label}>项目名称</label>
                  <input style={s.input} value={newName} placeholder="例：云南女童教育项目" onChange={(e) => setNewName(e.target.value)} />
                  <label style={s.label}>项目描述</label>
                  <input style={s.input} value={newDesc} placeholder="简要描述项目内容和目标" onChange={(e) => setNewDesc(e.target.value)} />
                  <label style={s.label}>受益方地址</label>
                  <input style={s.input} value={beneficiaryAddr} onChange={(e) => setBeneficiaryAddr(e.target.value)} placeholder="0x..." />
                  <label style={s.label}>募集目标金额（AVAX）</label>
                  <input style={s.input} type="number" value={targetAmountEth} min="0.01" step="0.1" placeholder="例：2.0" onChange={(e) => setTargetAmountEth(e.target.value)} />
                </div>
                <div>
                  <label style={s.label}>志愿者地址（每行一个）</label>
                  <textarea style={{ ...s.input, height: 90, resize: "vertical" }} value={validatorAddrs} onChange={(e) => setValidatorAddrs(e.target.value)} placeholder={"0xValidator1...\n0xValidator2...\n0xValidator3..."} />
                  <label style={s.label}>最少验证人数（M-of-N）</label>
                  <input style={s.input} type="number" value={requiredSigs} min={1} onChange={(e) => setRequiredSigs(Number(e.target.value))} />
                  <button style={{ ...s.btn, background: "#7c3aed", opacity: loading === "create" ? 0.6 : 1 }} onClick={createProject} disabled={loading === "create"}>
                    {loading === "create" ? "创建中..." : "部署项目合约"}
                  </button>
                </div>
              </div>
            )}

            {adminTab === "milestone" && (
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <span style={{ color: "#9ca3af", fontSize: 14 }}>
                    配置里程碑
                    <span style={{ marginLeft: 10, color: totalPercent === 100 ? "#10b981" : "#f87171", fontWeight: 700 }}>
                      合计 {totalPercent}% {totalPercent === 100 ? "✓" : "（需等于 100%）"}
                    </span>
                  </span>
                  <button style={s.addRowBtn} onClick={() => setMilestoneForm((p) => [...p, { desc: "", percent: 0 }])}>+ 添加</button>
                </div>
                {milestoneForm.map((m, i) => (
                  <div key={i} style={s.mFormRow}>
                    <div style={s.mIdBadge}>M{i}</div>
                    <input style={{ ...s.input, flex: 1, marginBottom: 0 }} value={m.desc} onChange={(e) => setMilestoneForm((p) => p.map((x, j) => j === i ? { ...x, desc: e.target.value } : x))} placeholder="里程碑描述" />
                    <input style={{ ...s.input, width: 65, marginBottom: 0, textAlign: "center" }} type="number" value={m.percent} min={0} max={100} onChange={(e) => setMilestoneForm((p) => p.map((x, j) => j === i ? { ...x, percent: Number(e.target.value) } : x))} />
                    <span style={{ color: "#9ca3af", fontSize: 13 }}>%</span>
                    {milestoneForm.length > 1 && <button style={s.removeBtn} onClick={() => setMilestoneForm((p) => p.filter((_, j) => j !== i))}>✕</button>}
                  </div>
                ))}
                <p style={{ color: "#f59e0b", fontSize: 13, margin: "12px 0 8px" }}>⚠️ 里程碑上链后不可修改</p>
                <button style={{ ...s.btn, background: "#059669", opacity: (loading === "milestone" || totalPercent !== 100) ? 0.6 : 1 }}
                  onClick={addMilestones} disabled={loading === "milestone" || totalPercent !== 100}>
                  {loading === "milestone" ? "上链中..." : "确认并上链里程碑"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function ReleaseMilestonePanel({ milestoneId, ci, verifiedAt, challengeWindow, onRelease, releaseLoading, isLocalhost, onSkipWindow }) {
  const now = Math.floor(Date.now() / 1000);
  const windowEnd = verifiedAt + challengeWindow;
  const inWindow = verifiedAt > 0 && now < windowEnd;
  const hasActiveChallenge = ci && ci.challengedAt > 0 && !ci.resolved;
  const challengeUpheld = ci && ci.resolved && ci.upheld;
  const canRelease = !challengeUpheld && !hasActiveChallenge && (!inWindow || (ci && ci.resolved && !ci.upheld));
  const secondsLeft = windowEnd - now;
  const hoursLeft = Math.min(72, Math.max(0, Math.floor(secondsLeft / 3600)));

  if (challengeUpheld) return null; // 举报成立时里程碑已重置为PENDING，不会走到这里

  return (
    <div style={{ paddingLeft: 40, width: "100%", boxSizing: "border-box", marginTop: 4 }}>
      {canRelease ? (
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button onClick={onRelease} disabled={releaseLoading === `release-${milestoneId}`}
            style={{ background: "#065f46", border: "none", borderRadius: 6, padding: "7px 16px", color: "#34d399", fontWeight: 700, fontSize: 13, cursor: "pointer", opacity: releaseLoading === `release-${milestoneId}` ? 0.6 : 1 }}>
            {releaseLoading === `release-${milestoneId}` ? "释放中..." : "💸 释放资金给受益方"}
          </button>
          <span style={{ fontSize: 11, color: "#4b5563" }}>
            {ci && ci.resolved && !ci.upheld ? "举报已驳回，可立即释放" : "争议窗口已结束"}
          </span>
        </div>
      ) : hasActiveChallenge ? (
        <div style={{ fontSize: 12, color: "#f59e0b" }}>⏸ 举报投票进行中，资金冻结等待结算</div>
      ) : (
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ fontSize: 12, color: "#6b7280" }}>
            🔒 争议窗口 {hoursLeft > 0 ? `剩余约 ${hoursLeft} 小时` : "即将结束"}，无人举报后可释放
          </div>
          {isLocalhost && (
            <button onClick={onSkipWindow}
              style={{ fontSize: 11, background: "#1f2937", color: "#6b7280", border: "1px dashed #374151", borderRadius: 6, padding: "3px 10px", cursor: "pointer" }}>
              🧪 跳过3天窗口
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function ChallengePanel({ milestoneId, ci, myDonorBalance, currentAccount, challengeText, onTextChange, challengeLoading, onChallenge, onVote, onResolve, onSkipVoteWindow, bondAmt }) {
  const [open, setOpen] = useState(false);
  const hasChallenge = ci && ci.challengedAt > 0;
  const isDonor = Number(myDonorBalance) > 0;

  if (!hasChallenge && !isDonor) return null; // 非捐款人且无挑战：不显示

  if (!hasChallenge) {
    // 可举报状态（捐款人可见）
    return (
      <div style={{ paddingLeft: 40, width: "100%", boxSizing: "border-box" }}>
        {!open ? (
          <button onClick={() => setOpen(true)}
            style={{ fontSize: 12, background: "none", border: "1px solid #374151", color: "#9ca3af", borderRadius: 6, padding: "4px 12px", cursor: "pointer" }}>
            🚨 对此里程碑提出异议
          </button>
        ) : (
          <div style={{ background: "#1a0a0a", border: "1px solid #7f1d1d", borderRadius: 8, padding: 12 }}>
            <div style={{ fontSize: 13, color: "#fca5a5", fontWeight: 600, marginBottom: 6 }}>举报里程碑 M{milestoneId}</div>
            <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 8 }}>
              举报需缴纳 <span style={{ color: "#f59e0b" }}>{bondAmt} AVAX</span> 保证金。举报成立时退还并获25%奖励；举报不成立将被没收。
            </div>
            <textarea
              style={{ width: "100%", background: "#0f0f1a", border: "1px solid #7f1d1d", borderRadius: 6, padding: "8px 10px", color: "#f1f1f1", fontSize: 13, height: 72, resize: "vertical", fontFamily: "inherit", boxSizing: "border-box" }}
              value={challengeText}
              onChange={(e) => onTextChange(e.target.value)}
              placeholder="说明举报理由，例如：凭证图片与实际不符、物资未发放..."
            />
            <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
              <button onClick={onChallenge} disabled={challengeLoading === `challenge-${milestoneId}`}
                style={{ flex: 1, background: "#dc2626", border: "none", borderRadius: 6, padding: "8px", color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer", opacity: challengeLoading === `challenge-${milestoneId}` ? 0.6 : 1 }}>
                {challengeLoading === `challenge-${milestoneId}` ? "提交中..." : `提交举报 (${bondAmt} AVAX)`}
              </button>
              <button onClick={() => setOpen(false)}
                style={{ background: "none", border: "1px solid #374151", borderRadius: 6, padding: "8px 14px", color: "#6b7280", fontSize: 13, cursor: "pointer" }}>
                取消
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // 已有挑战
  const totalVotes = ci.forVotes + ci.againstVotes;
  const forPct = totalVotes > 0 ? Math.round(ci.forVotes / totalVotes * 100) : 0;

  return (
    <div style={{ paddingLeft: 40, width: "100%", boxSizing: "border-box" }}>
      <div style={{ background: "#1a0a0a", border: `1px solid ${ci.resolved ? (ci.upheld ? "#dc2626" : "#374151") : "#7f1d1d"}`, borderRadius: 8, padding: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <div style={{ fontSize: 13, color: "#fca5a5", fontWeight: 600 }}>
            🚨 {ci.resolved ? (ci.upheld ? "举报成立 · 验证人已被惩罚" : "举报不成立 · 已驳回") : "举报进行中"}
          </div>
          <div style={{ fontSize: 11, color: "#6b7280" }}>
            {new Date(ci.challengedAt * 1000).toLocaleDateString()}
          </div>
        </div>
        <div style={{ fontSize: 12, color: "#9ca3af", marginBottom: 10 }}>
          举报人：{ci.challenger.slice(0, 6)}...{ci.challenger.slice(-4)}
          {ci.evidenceCID && <span style={{ marginLeft: 8, color: "#6b7280" }}>· 说明：{ci.evidenceCID.slice(0, 60)}{ci.evidenceCID.length > 60 ? "..." : ""}</span>}
        </div>

        {/* 投票进度 */}
        <div style={{ marginBottom: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#6b7280", marginBottom: 4 }}>
            <span>支持举报 {ci.forVotes} 票</span>
            <span>反对举报 {ci.againstVotes} 票</span>
          </div>
          <div style={{ background: "#2d2d3d", borderRadius: 4, height: 8, overflow: "hidden" }}>
            <div style={{ background: "#dc2626", height: "100%", width: `${forPct}%`, transition: "width 0.4s" }} />
          </div>
          <div style={{ fontSize: 11, color: "#6b7280", marginTop: 3 }}>
            {totalVotes === 0 ? "暂无投票" : `支持 ${forPct}% / 反对 ${100 - forPct}%`}
          </div>
        </div>

        {/* 投票按钮：未结算 + 捐款人 + 非举报人本人 */}
        {!ci.resolved && isDonor && currentAccount.toLowerCase() !== ci.challenger.toLowerCase() && (
          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
            <button onClick={() => onVote(true)}
              disabled={!!challengeLoading.startsWith(`vote-${milestoneId}`)}
              style={{ flex: 1, background: "#7f1d1d", border: "none", borderRadius: 6, padding: "7px", color: "#fca5a5", fontWeight: 600, fontSize: 12, cursor: "pointer", opacity: challengeLoading === `vote-${milestoneId}-true` ? 0.6 : 1 }}>
              {challengeLoading === `vote-${milestoneId}-true` ? "投票中..." : "✋ 支持举报"}
            </button>
            <button onClick={() => onVote(false)}
              disabled={!!challengeLoading.startsWith(`vote-${milestoneId}`)}
              style={{ flex: 1, background: "#1e3a1e", border: "none", borderRadius: 6, padding: "7px", color: "#86efac", fontWeight: 600, fontSize: 12, cursor: "pointer", opacity: challengeLoading === `vote-${milestoneId}-false` ? 0.6 : 1 }}>
              {challengeLoading === `vote-${milestoneId}-false` ? "投票中..." : "👍 反对举报"}
            </button>
          </div>
        )}

        {/* 本地演示：快进投票窗口 */}
        {!ci.resolved && ci.inWindow && onSkipVoteWindow && (
          <button onClick={onSkipVoteWindow}
            style={{ width: "100%", marginTop: 8, fontSize: 11, background: "#1f2937", color: "#6b7280", border: "1px dashed #374151", borderRadius: 6, padding: "5px", cursor: "pointer" }}>
            🧪 [本地演示] 跳过 7 天投票窗口
          </button>
        )}

        {/* 结算按钮：未结算 + 投票已结束（inWindow=false） */}
        {!ci.resolved && !ci.inWindow && (
          <button onClick={onResolve}
            disabled={challengeLoading === `resolve-${milestoneId}`}
            style={{ width: "100%", marginTop: 8, background: "#4b5563", border: "none", borderRadius: 6, padding: "7px", color: "#e5e7eb", fontWeight: 600, fontSize: 12, cursor: "pointer", opacity: challengeLoading === `resolve-${milestoneId}` ? 0.6 : 1 }}>
            {challengeLoading === `resolve-${milestoneId}` ? "结算中..." : "⚖️ 结算挑战投票"}
          </button>
        )}
      </div>
    </div>
  );
}

function AutoScrollRow({ items, renderItem }) {
  const ref = useRef(null);
  const paused = useRef(false);
  const pos = useRef(0);

  useEffect(() => {
    const el = ref.current;
    if (!el || items.length === 0) return;
    // 项目少时三份保证能无缝循环
    const copies = items.length < 4 ? 3 : 2;
    pos.current = 0;
    let id;
    const tick = () => {
      if (!paused.current) {
        pos.current += 0.5;
        const unit = el.scrollWidth / copies;
        if (pos.current >= unit) pos.current -= unit;
        el.scrollLeft = pos.current;
      }
      id = requestAnimationFrame(tick);
    };
    id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, [items.length]);

  const copies = items.length < 4 ? 3 : 2;
  const repeated = Array.from({ length: copies }, (_, ci) =>
    items.map((item, i) => renderItem(item, `${ci}-${i}`))
  );

  return (
    <div
      ref={ref}
      style={{ display: "flex", gap: 16, overflow: "hidden", paddingBottom: 12 }}
      onMouseEnter={() => { paused.current = true; }}
      onMouseLeave={() => { paused.current = false; }}
    >
      {repeated}
    </div>
  );
}

function WelcomeCard({ p, done }) {
  return (
    <div style={{ ...s.welcomeCard, border: done ? "1px solid rgba(52,211,153,0.3)" : "1px solid #2d2d3d" }}>
      {done && <div style={s.doneBadge}>已完成</div>}
      <div style={{ fontSize: 15, fontWeight: 700, color: "#e5e7eb", marginBottom: 6 }}>{p.name}</div>
      <div style={{ fontSize: 12, color: "#9ca3af", marginBottom: 14, lineHeight: 1.6, minHeight: 36 }}>{p.description}</div>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 5 }}>
        <span style={{ color: "#9ca3af" }}>募集进度</span>
        <span style={{ color: done ? "#10b981" : "#c4b5fd" }}>{Number(p.totalDonated).toFixed(2)} / {Number(p.targetAmount).toFixed(1)} AVAX</span>
      </div>
      <div style={s.progressBg}>
        <div style={{ ...s.progressFill, width: `${Math.min(p.progress, 100)}%` }} />
      </div>
      <div style={{ textAlign: "right", fontSize: 11, color: "#6b7280", marginTop: 3, marginBottom: 14 }}>{Math.min(Math.round(p.progress), 100)}%</div>
      <div style={{ borderTop: "1px solid #2d2d3d", paddingTop: 10 }}>
        {p.milestones.map((m, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6, fontSize: 12 }}>
            <div style={{ width: 7, height: 7, borderRadius: "50%", background: ["#374151", "#1d4ed8", "#059669"][m.status], flexShrink: 0 }} />
            <span style={{ color: "#9ca3af", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.desc}</span>
            <span style={{ color: ["#4b5563", "#60a5fa", "#34d399"][m.status], fontSize: 11, flexShrink: 0 }}>{MILESTONE_STATUS[m.status]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatBox({ label, value, color }) {
  return (
    <div style={{ textAlign: "center", flex: 1 }}>
      <div style={{ fontSize: 24, fontWeight: 800, color }}>{Number(value).toFixed(6)}</div>
      <div style={{ fontSize: 11, color: "#6b7280" }}>AVAX</div>
      <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 3 }}>{label}</div>
    </div>
  );
}

const s = {
  page: { minHeight: "100vh", background: "#0f0f1a", color: "#f1f1f1", fontFamily: "'Inter', -apple-system, sans-serif", overflowX: "hidden" },
  toast: { position: "fixed", top: 20, left: "50%", transform: "translateX(-50%)", padding: "12px 24px", borderRadius: 10, color: "#fff", fontSize: 14, fontWeight: 600, zIndex: 1000, boxShadow: "0 4px 20px rgba(0,0,0,0.4)", maxWidth: 420, textAlign: "center" },
  topbar: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 24px", borderBottom: "1px solid #1f1f2e", flexWrap: "wrap", gap: 8 },
  backBtn: { background: "transparent", border: "1px solid #374151", color: "#9ca3af", padding: "8px 16px", borderRadius: 8, cursor: "pointer", fontSize: 14 },
  topTitle: { fontWeight: 700, fontSize: 18 },
  connectBtn: { background: "#8b5cf6", color: "#fff", border: "none", padding: "8px 20px", borderRadius: 8, cursor: "pointer", fontWeight: 600 },
  account: { background: "#1f1f2e", border: "1px solid #374151", padding: "8px 16px", borderRadius: 8, fontSize: 14, color: "#34d399" },
  switchBtn: { background: "transparent", border: "1px solid #374151", color: "#9ca3af", padding: "8px 14px", borderRadius: 8, cursor: "pointer", fontSize: 13 },

  // 欢迎页
  welcomeWrap: { maxWidth: 1100, margin: "0 auto", padding: "0 24px 80px" },
  hero: { textAlign: "center", padding: "100px 20px 72px", position: "relative", overflow: "hidden" },
  heroGlow: { position: "absolute", top: "20%", left: "50%", transform: "translateX(-50%)", width: 600, height: 300, background: "radial-gradient(ellipse, rgba(139,92,246,0.15) 0%, transparent 70%)", pointerEvents: "none", zIndex: 0 },
  heroTag: { position: "relative", zIndex: 1, fontSize: 12, color: "#a78bfa", letterSpacing: 2, marginBottom: 28, textTransform: "uppercase", fontWeight: 600 },
  heroTitle: { position: "relative", zIndex: 1, fontSize: 64, fontWeight: 900, color: "#f3f4f6", marginBottom: 24, lineHeight: 1.1, letterSpacing: -1 },
  heroTitleGradient: { background: "linear-gradient(135deg, #c4b5fd 0%, #8b5cf6 50%, #6d28d9 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" },
  heroSub: { position: "relative", zIndex: 1, display: "flex", justifyContent: "center", gap: 10, flexWrap: "wrap", marginBottom: 44 },
  heroTag2: { fontSize: 13, color: "#a78bfa", background: "rgba(139,92,246,0.12)", border: "1px solid rgba(139,92,246,0.25)", borderRadius: 20, padding: "5px 14px", letterSpacing: 0.5 },
  heroBtn: { position: "relative", zIndex: 1, background: "linear-gradient(135deg, #7c3aed, #8b5cf6)", color: "#fff", border: "none", padding: "16px 48px", borderRadius: 14, fontSize: 17, fontWeight: 700, cursor: "pointer", boxShadow: "0 8px 32px rgba(139,92,246,0.5)", letterSpacing: 0.5 },
  welcomeSection: { marginBottom: 52 },
  welcomeSectionTitle: { fontSize: 17, fontWeight: 700, color: "#e5e7eb", marginBottom: 20 },
  projectScroll: { display: "flex", gap: 16, overflowX: "auto", paddingBottom: 12, scrollbarWidth: "thin", scrollbarColor: "#2d2d3d transparent" },
  welcomeCard: { background: "#1a1a2e", border: "1px solid #2d2d3d", borderRadius: 14, padding: "20px", minWidth: 300, maxWidth: 320, flexShrink: 0, position: "relative" },
  doneBadge: { position: "absolute", top: 14, right: 14, background: "#064e3b", color: "#34d399", fontSize: 11, padding: "3px 10px", borderRadius: 20, fontWeight: 600 },

  // 看板
  body: { maxWidth: 1100, margin: "0 auto", padding: "20px 24px 100px", boxSizing: "border-box" },
  projectSwitcher: { display: "flex", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 8 },
  projectBtn: { background: "#2d2d3d", border: "1px solid #374151", color: "#9ca3af", padding: "6px 16px", borderRadius: 8, cursor: "pointer", fontSize: 13 },
  projectBtnActive: { background: "#4c1d95", border: "1px solid #8b5cf6", color: "#c4b5fd" },
  grid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 },
  col: { display: "flex", flexDirection: "column", gap: 16, minWidth: 0 },
  card: { background: "#1a1a2e", border: "1px solid #2d2d3d", borderRadius: 12, padding: "18px 20px" },
  cardTitle: { fontWeight: 700, fontSize: 15, marginBottom: 14, color: "#e5e7eb" },
  progressBg: { width: "100%", height: 10, background: "#2d2d3d", borderRadius: 999, overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 999, background: "linear-gradient(90deg, #8b5cf6, #ec4899, #f59e0b)", transition: "width 0.6s ease" },
  statRow: { display: "flex", gap: 12, padding: "12px 0" },
  mRow: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #2d2d3d" },
  mId: { background: "#2d2d3d", borderRadius: 6, padding: "3px 8px", fontSize: 12, fontWeight: 700, color: "#8b5cf6", minWidth: 26, textAlign: "center" },
  badge: { fontSize: 12, padding: "3px 10px", borderRadius: 20, color: "#fff", whiteSpace: "nowrap" },
  refreshBtn: { marginTop: 12, background: "transparent", border: "1px solid #374151", color: "#9ca3af", padding: "7px 14px", borderRadius: 8, cursor: "pointer", fontSize: 13, width: "100%", transition: "opacity 0.2s" },
  tagCard: { background: "#2d2d3d", border: "1px solid #374151", color: "#9ca3af", padding: "10px 6px", borderRadius: 10, cursor: "pointer", textAlign: "center", lineHeight: 1.3, transition: "all 0.15s" },
  tagCardActive: { background: "#4c1d95", border: "1px solid #8b5cf6", color: "#e5e7eb" },
  label: { display: "block", fontSize: 13, color: "#9ca3af", marginBottom: 6 },
  input: { width: "100%", background: "#0f0f1a", border: "1px solid #374151", borderRadius: 8, padding: "9px 12px", color: "#f1f1f1", fontSize: 14, marginBottom: 12, boxSizing: "border-box" },
  btn: { width: "100%", border: "none", borderRadius: 8, padding: "11px", color: "#fff", fontWeight: 700, fontSize: 15, cursor: "pointer" },
  logBox: { maxHeight: 180, overflowY: "auto", display: "flex", flexDirection: "column", gap: 4 },
  empty: { color: "#4b5563", fontSize: 13, textAlign: "center", padding: "14px 0" },
  fab: { position: "fixed", bottom: 28, left: 24, background: "linear-gradient(135deg, #7c3aed, #8b5cf6)", color: "#fff", border: "none", borderRadius: 12, padding: "12px 20px", cursor: "pointer", display: "flex", alignItems: "center", gap: 8, fontSize: 14, fontWeight: 700, boxShadow: "0 4px 20px rgba(139,92,246,0.3)", transition: "all 0.2s", zIndex: 100 },
  modalOverlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 },
  modal: { background: "#1a1a2e", border: "1px solid #4c1d95", borderRadius: 16, padding: 28, width: "100%", maxWidth: 760, maxHeight: "90vh", overflowY: "auto" },
  tabRow: { display: "flex", gap: 8, marginBottom: 20 },
  tab: { background: "#2d2d3d", border: "1px solid #374151", color: "#9ca3af", padding: "8px 20px", borderRadius: 8, cursor: "pointer", fontSize: 14 },
  tabActive: { background: "#4c1d95", border: "1px solid #8b5cf6", color: "#c4b5fd" },
  formGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 },
  mFormRow: { display: "flex", alignItems: "center", gap: 8, marginBottom: 10 },
  mIdBadge: { background: "#2d2d3d", borderRadius: 6, padding: "4px 8px", fontSize: 12, fontWeight: 700, color: "#8b5cf6", minWidth: 28, textAlign: "center" },
  addRowBtn: { background: "transparent", border: "1px dashed #4c1d95", color: "#8b5cf6", padding: "6px 14px", borderRadius: 8, cursor: "pointer", fontSize: 13 },
  removeBtn: { background: "transparent", border: "1px solid #374151", color: "#6b7280", padding: "4px 8px", borderRadius: 6, cursor: "pointer", fontSize: 12 },
};
