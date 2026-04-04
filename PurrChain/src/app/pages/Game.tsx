import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { ArrowLeft, Zap, Package, ChevronRight, X, Clock, Trophy, Sparkles, Loader2, Plus, Sword, ShoppingBag as BagIcon, Wind, ZoomIn } from "lucide-react";
import { Navbar } from "../components/Navbar";
import { useApp } from "../context/AppContext";
import { getReadonlyContracts, getContracts, ADDRESSES } from "../../lib/contracts";
import { ethers } from "ethers";

type HuntDuration = "short" | "medium" | "long";
type HuntItem = "none" | "food" | "can";
type CatState = "idle" | "hunting" | "returning" | "settling";

interface HuntState {
  active: boolean;
  startTime: number;
  duration: number;
  durationLabel: HuntDuration;
  item: HuntItem;
  useBooster: boolean;
  catTokenId: number;   // 链上 NFT tokenId（非 catRegistry id）
  chainStarted: boolean; // 是否已发起链上 startHunt
}

interface EquipmentItem {
  tokenId: number;
  slot: number;
  rarity: number;
  name: string;
  lore: string;
  rarityBonus: number;
  carryBonus: number;
  speedBonus: number;
  image?: string; // 从 localStorage 管理员配置读取
}

interface CollectionNFT {
  tokenId: number;
  name: string;
  image: string;
  description: string;
  seriesId: number;
}

const RARITY_LABELS = ["普通", "精良", "稀有", "传说"];
const RARITY_COLORS = ["#9CA3AF", "#34D399", "#60A5FA", "#FBBF24"];
const SLOT_ICONS  = ["⚔️", "🎒", "👟"];
const SLOT_LABELS = ["武器", "背包", "靴子"];

// ── 碎片本地存储 helpers ───────────────────────────────────
const FRAGS_KEY = (addr: string) => `purr_frags_${addr.toLowerCase()}`;
function loadLocalFrags(addr: string): number {
  try { return parseInt(localStorage.getItem(FRAGS_KEY(addr)) ?? "0") || 0; } catch { return 0; }
}
function saveLocalFrags(addr: string, n: number) {
  try { localStorage.setItem(FRAGS_KEY(addr), String(Math.max(0, n))); } catch {}
}

// ── IPFS helper ───────────────────────────────────────────
function ipfsToHttp(uri: string) {
  if (!uri) return "";
  return uri.startsWith("ipfs://") ? uri.replace("ipfs://", "https://ipfs.io/ipfs/") : uri;
}

// ── 出猎 localStorage key（带地址，防止多账号混用）─────────
const HUNT_KEY = (catId: string | undefined, addr: string) =>
  `hunt_${catId}_${addr.toLowerCase()}`;

// ── 出猎配置 ─────────────────────────────────────────────
// ms 是前端倒计时时长（演示用短时长，链上有真实时长）
const HUNT_CONFIG: Record<HuntDuration, {
  labelZh: string; labelEn: string;
  durationIdx: number;  // 对应合约 HuntDuration enum: 0=Short 1=Mid 2=Long
  stamina: number;
  baseMaterials: [number, number]; // 链下估算范围，实际以链上为准
}> = {
  short:  { labelZh: "短途 10s", labelEn: "Short 10s",  durationIdx: 0, stamina: 1, baseMaterials: [1, 3]  },
  medium: { labelZh: "中途 20s", labelEn: "Mid 20s",    durationIdx: 1, stamina: 2, baseMaterials: [3, 8]  },
  long:   { labelZh: "长途 40s", labelEn: "Long 40s",   durationIdx: 2, stamina: 3, baseMaterials: [10, 20] },
};

const ITEM_CONFIG: Record<HuntItem, {
  labelZh: string; labelEn: string; icon: string;
  descZh: string; descEn: string;
  itemIdx: number;  // 合约 HuntItem enum: 0=None 1=Food 2=Can
}> = {
  none: { labelZh: "不携带", labelEn: "None",     icon: "🚫", descZh: "无 NFT 掉落",              descEn: "No NFT drop",              itemIdx: 0 },
  food: { labelZh: "猫粮",   labelEn: "Cat Food", icon: "🐟", descZh: "普通80% / 稀有15% / 珍稀5%", descEn: "80% Cmn/15% Rare/5% Epic",  itemIdx: 1 },
  can:  { labelZh: "罐罐",   labelEn: "Cat Can",  icon: "🥫", descZh: "普通50% / 稀有35% / 珍稀15%", descEn: "50% Cmn/35% Rare/15% Epic", itemIdx: 2 },
};

// ── 极简高级感小猫 SVG ──────────────────────────────────────────
function CatSVG({ state }: { state: CatState }) {
  const isHunting = state === "hunting";
  
  // 莫兰迪配色系统
  const colors = {
    main: "#E5D3C2",   // 奶油米色（主体）
    accent: "#BDB2A7", // 灰褐色（花纹/阴影）
    nose: "#E8A89A",   // 干枯玫瑰粉（鼻子/肉垫）
    eye: "#3D352E",    // 深咖色（眼睛）
    line: "#6B5E4C",   // 极细轮廓线
  };

  return (
    <svg viewBox="0 0 140 170" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-sm">
      {/* 1. 灵动的尾巴 - 放在身体后面 */}
      <motion.path 
        d="M90 145 C115 145 125 120 115 105 C110 95 100 95 95 105" 
        stroke={colors.main} strokeWidth="8" strokeLinecap="round" fill="none"
        animate={state === "idle" ? { d: [
          "M90 145 C115 145 125 120 115 105 C110 95 100 95 95 105",
          "M90 145 C120 140 130 110 120 95 C115 85 105 85 100 95",
          "M90 145 C115 145 125 120 115 105 C110 95 100 95 95 105"
        ] } : {}}
        transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }} 
      />
      {/* 尾巴细轮廓线 */}
      <path d="M90 145 C115 145 125 120 115 105 C110 95 100 95 95 105" stroke={colors.line} strokeWidth="1" strokeLinecap="round" fill="none" opacity="0.3" />

      {/* 2. 身体 - 优雅的椭圆比例 */}
      <motion.ellipse 
        cx="70" cy="115" rx="36" ry="42" fill={colors.main} stroke={colors.line} strokeWidth="1"
        animate={state === "idle" ? { ry: [42, 44, 42] } : {}} 
        transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }} 
      />
      {/* 腹部花纹 - 莫兰迪深色 */}
      <ellipse cx="70" cy="125" rx="20" ry="25" fill="white" opacity="0.3" />

      {/* 3. 爪子与肉垫 (Paw Pads) - 增加真实感 */}
      {/* 左脚 */}
      <g transform="translate(45, 148)">
        <ellipse cx="0" cy="0" rx="12" ry="8" fill={colors.main} stroke={colors.line} strokeWidth="1" />
        <circle cx="0" cy="1" r="4" fill={colors.nose} opacity="0.8" /> {/* 掌心垫 */}
        <circle cx="-5" cy="-3" r="2" fill={colors.nose} opacity="0.6" /> {/* 指垫 */}
        <circle cx="0" cy="-4" r="2" fill={colors.nose} opacity="0.6" />
        <circle cx="5" cy="-3" r="2" fill={colors.nose} opacity="0.6" />
      </g>
      {/* 右脚 */}
      <g transform="translate(95, 148)">
        <ellipse cx="0" cy="0" rx="12" ry="8" fill={colors.main} stroke={colors.line} strokeWidth="1" />
        <circle cx="0" cy="1" r="4" fill={colors.nose} opacity="0.8" />
        <circle cx="-5" cy="-3" r="2" fill={colors.nose} opacity="0.6" />
        <circle cx="0" cy="-4" r="2" fill={colors.nose} opacity="0.6" />
        <circle cx="5" cy="-3" r="2" fill={colors.nose} opacity="0.6" />
      </g>

      {/* 4. 头部 - 比例略小更显精致 */}
      <g transform="translate(70, 65)">
        <circle r="32" fill={colors.main} stroke={colors.line} strokeWidth="1" />
        
        {/* 耳朵 - 带点微颤动 */}
        <motion.path 
          d="M-28 -15 L-35 -40 L-10 -30 Z" fill={colors.main} stroke={colors.line} strokeWidth="1" 
          animate={state === "settling" ? { rotate: [-2, 2, -2] } : {}} transition={{ repeat: Infinity, duration: 0.2 }}
        />
        <motion.path 
          d="M28 -15 L35 -40 L10 -30 Z" fill={colors.main} stroke={colors.line} strokeWidth="1" 
          animate={state === "settling" ? { rotate: [2, -2, 2] } : {}} transition={{ repeat: Infinity, duration: 0.2 }}
        />
        {/* 耳内粉色 */}
        <path d="M-26 -18 L-30 -32 L-15 -26 Z" fill={colors.nose} opacity="0.4" />
        <path d="M26 -18 L30 -32 L15 -26 Z" fill={colors.nose} opacity="0.4" />

        {/* 眼睛 - 极其清爽的设计 */}
        {!isHunting ? (
          <>
            <motion.g animate={{ scaleY: [1, 0.1, 1] }} transition={{ repeat: Infinity, duration: 4, times: [0, 0.05, 0.1] }}>
              <circle cx="-13" cy="2" r="5" fill={colors.eye} />
              <circle cx="-11.5" cy="0" r="1.5" fill="white" />
              <circle cx="13" cy="2" r="5" fill={colors.eye} />
              <circle cx="11.5" cy="0" r="1.5" fill="white" />
            </motion.g>
          </>
        ) : (
          <>
            <path d="M-18 2 Q-13 -3 -8 2" stroke={colors.eye} strokeWidth="2" strokeLinecap="round" fill="none" />
            <path d="M8 2 Q13 -3 18 2" stroke={colors.eye} strokeWidth="2" strokeLinecap="round" fill="none" />
          </>
        )}

        {/* 鼻子与胡须区域 */}
        <path d="M-2 10 L0 8 L2 10 L0 12 Z" fill={colors.nose} />
        <path d="M-5 14 Q0 18 5 14" stroke={colors.line} strokeWidth="1" fill="none" />
        <line x1="0" y1="12" x2="0" y2="16" stroke={colors.line} strokeWidth="0.8" />

        {/* 精细胡须 (Whiskers) - 极细半透明 */}
        {[-5, 0, 5].map((y, i) => (
          <g key={i} opacity="0.4">
            <line x1="-35" y1={12+y} x2="-15" y2={14+y/2} stroke={colors.line} strokeWidth="0.5" />
            <line x1="15" y1={14+y/2} x2="35" y2={12+y} stroke={colors.line} strokeWidth="0.5" />
          </g>
        ))}

        {/* 腮红 */}
        <circle cx="-20" cy="12" r="5" fill={colors.nose} opacity="0.2" />
        <circle cx="20" cy="12" r="5" fill={colors.nose} opacity="0.2" />
      </g>
    </svg>
  );
}

// ── 温暖极简小屋场景 ──────────────────────────────────────────
function CozyRoom({ catState, catName, isZh }: { catState: CatState; catName: string; isZh: boolean }) {
  return (
    <div className="relative w-full h-full overflow-hidden rounded-2xl select-none"
      style={{ background: "linear-gradient(180deg, #F8F5F0 0%, #E8E2D8 100%)" }}>
      
      {/* 极简背景底纹：将原本明显的脚印改为极淡的底色纹理 */}
      <svg className="absolute inset-0 w-full h-full" style={{ opacity: 0.03 }} xmlns="http://www.w3.org/2000/svg">
        {Array.from({ length: 6 }).map((_, i) => Array.from({ length: 4 }).map((_, j) => (
          <circle key={`${i}-${j}`} cx={i * 80 + 20} cy={j * 90 + 30} r="1.5" fill="#6B5E4C" />
        )))}
      </svg>

      {/* 极简拱形窗户：模拟午后阳光的清爽感 */}
      <div className="absolute top-5 left-5 rounded-t-full overflow-hidden"
        style={{ width: 90, height: 100, border: "1.5px solid #6B5E4C", background: "#F0F7F9", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
        {/* 窗外简笔风景 */}
        <div className="absolute bottom-0 left-0 right-0 h-12" style={{ background: "#DDE8D0", clipPath: "polygon(0 40%, 40% 10%, 70% 30%, 100% 0%, 100% 100%, 0 100%)" }} />
        <motion.div className="absolute" style={{ top: 15, left: 20, width: 12, height: 12, borderRadius: "50%", background: "#FFF9C4" }}
          animate={{ opacity: [0.6, 0.9, 0.6] }} transition={{ repeat: Infinity, duration: 4 }} />
        {/* 窗户十字格 */}
        <div className="absolute inset-0" style={{ borderRight: "1px solid rgba(107,94,76,0.2)", left: "50%" }} />
        <div className="absolute top-1/2 left-0 right-0" style={{ borderBottom: "1px solid rgba(107,94,76,0.2)" }} />
      </div>

      {/* 莫兰迪色系书架：扁平化色块设计 */}
      <div className="absolute top-5 right-5 rounded-lg overflow-hidden"
        style={{ width: 70, background: "#DBCBB4", border: "1.5px solid #6B5E4C", padding: "8px 6px" }}>
        {[["#BDB2A7","#E8A89A"],["#A3B18A","#E9EDC6"],["#D4A373","#BDB2A7"]].map((row, ri) => (
          <div key={ri} className="flex items-end gap-1 mb-2">
            {row.map((c, ci) => (
              <div key={ci} className="rounded-sm" style={{ width: 12, height: 14 + (ci % 2) * 4, background: c, border: "0.5px solid rgba(0,0,0,0.1)" }} />
            ))}
          </div>
        ))}
      </div>

      {/* 地面：原木色调，极细木纹线 */}
      <div className="absolute bottom-0 left-0 right-0 h-28 rounded-b-2xl overflow-hidden"
        style={{ background: "#D0B8A8", borderTop: "1.5px solid #6B5E4C" }}>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="absolute left-0 right-0" style={{ top: (i + 1) * 28, height: "1px", background: "#6B5E4C", opacity: 0.1 }} />
        ))}
      </div>

      {/* 猫咪坐垫：圆形的扁平化地毯 */}
      <div className="absolute" style={{ bottom: 75, left: "50%", transform: "translateX(-50%)", width: 160, height: 35 }}>
        <div className="absolute inset-0 rounded-full" style={{ background: "#EAE2D6", border: "1.5px solid #BDB2A7" }} />
        <div className="absolute" style={{ inset: "4px", borderRadius: "50%", border: "1px dashed #BDB2A7", opacity: 0.5 }} />
      </div>

      {/* 猫咪动画容器 */}
      <motion.div className="absolute" style={{ bottom: 65, left: "50%", translateX: "-50%", width: 120, height: 160, x: "-50%" }}
        animate={
          catState === "hunting"   ? { x: ["-50%", "-130%", "-600%"] as unknown as number[], opacity: [1, 1, 0] } :
          catState === "returning" ? { x: ["600%", "30%", "-50%"] as unknown as number[], opacity: [0, 1, 1] } :
          catState === "settling"  ? { y: [0, -6, 0] } :
          { y: [0, -5, 0] }
        }
        transition={
          catState === "hunting" || catState === "returning" ? { duration: 1.6, ease: [0.4, 0, 0.2, 1] } :
          { repeat: Infinity, duration: 3, ease: "easeInOut" }
        }>
        {/* 这里调用你修改后的 CatSVG */}
        <CatSVG state={catState === "settling" ? "idle" : catState} />
      </motion.div>

      {/* 状态文字标签：改用半透明的毛玻璃高级感 */}
      {catState === "hunting" && (
        <motion.div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center">
            <div className="text-3xl mb-3">🌿</div>
            <p className="text-xs font-medium px-4 py-2 rounded-full" 
              style={{ background: "rgba(255,255,255,0.8)", color: "#6B5E4C", backdropFilter: "blur(8px)", border: "1px solid rgba(107,94,76,0.1)" }}>
              {isZh ? "正在野外探险..." : "Exploration in progress..."}
            </p>
          </motion.div>
        </motion.div>
      )}

      {/* 底部信息标签：极简设计 */}
      <motion.div className="absolute whitespace-nowrap px-4 py-1.5 rounded-full text-[11px] font-bold tracking-wider"
        style={{ 
          bottom: 16, 
          left: "50%", 
          transform: "translateX(-50%)", 
          background: "rgba(255,255,255,0.7)", 
          color: "#4A3728", 
          border: "1px solid rgba(74,55,40,0.1)", 
          boxShadow: "0 4px 12px rgba(0,0,0,0.03)",
          backdropFilter: "blur(10px)" 
        }}
        animate={catState === "returning" ? { scale: [1, 1.1, 1] } : {}} transition={{ duration: 0.5 }}>
        {catState === "hunting"   ? (isZh ? "EXPLORING" : "EXPLORING") :
         catState === "returning" ? (isZh ? "WELCOME HOME!" : "WELCOME HOME!") :
         catState === "settling"  ? (isZh ? "SETTLING..." : "SETTLING...") :
         `· ${catName.toUpperCase()} ·`}
      </motion.div>

      {/* 庆祝特效：改用莫兰迪色的小装饰 */}
      {catState === "returning" && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {["✨","🤎","🤍","🌿","✨"].map((item, i) => (
            <motion.div key={i} className="absolute text-sm" style={{ left: `${20 + i * 15}%`, top: "30%" }}
              initial={{ y: 0, opacity: 0 }} animate={{ y: [-20, -100], opacity: [0, 1, 0], rotate: [0, 45] }}
              transition={{ delay: i * 0.1, duration: 1.5, repeat: 1 }}>{item}</motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
// ── 主组件 ────────────────────────────────────────────────
export function Game() {
  const { catId } = useParams();
  const navigate  = useNavigate();
  const { signer, walletAddress, refreshBalance, lang } = useApp();
  const isZh = lang === "zh";

  // ── 猫咪数据 ──
  const [cat, setCat]           = useState<{ id: number; name: string; image: string; stage: number; catTokenId: number | null } | null>(null);
  const [catLoading, setCatLoading] = useState(true);
  const [catError,   setCatError]   = useState<string | null>(null);

  useEffect(() => {
    if (!catId || !walletAddress) return;
    const load = async () => {
      setCatLoading(true); setCatError(null);
      try {
        const c = getReadonlyContracts();
        const raw = await c.catRegistry.getCat(Number(catId)) as { name: string; stageURIs: string[]; shelter: string };
        if (!raw.shelter || raw.shelter === "0x0000000000000000000000000000000000000000") {
          setCatError(isZh ? "找不到该猫咪" : "Cat not found"); return;
        }
        const uris  = Array.from(raw.stageURIs) as string[];
        const stage = uris.reduce((last, uri, idx) => uri && uri !== "" ? idx + 1 : last, 1);
        const firstUri = uris.find(u => u && u !== "") ?? "";
        let image = "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=600&q=80";
        if (firstUri) {
          try {
            const res = await fetch(ipfsToHttp(firstUri), { signal: AbortSignal.timeout(5000) });
            const json = await res.json() as { image?: string };
            if (json.image) image = ipfsToHttp(json.image);
          } catch { /* fallback */ }
        }

        // 找用户持有的该猫 CatNFT tokenId（StarterCat or CloudAdopted or Genesis）
        let catTokenId: number | null = null;
        try {
          const total = Number(await c.catNFT.totalSupply());
          const bal   = Number(await c.catNFT.balanceOf(walletAddress));
          if (bal > 0) {
            for (let i = total - 1; i >= 0 && catTokenId === null; i--) {
              try {
                const owner = await c.catNFT.ownerOf(i);
                if ((owner as string).toLowerCase() !== walletAddress.toLowerCase()) continue;
                const info = await c.catNFT.nftInfo(i) as { nftType: bigint; linkedRealCatId: bigint };
                const nType = Number(info.nftType);
                if ((nType === 1 || nType === 2 || nType === 4) && Number(info.linkedRealCatId) === Number(catId)) {
                  catTokenId = i;
                }
              } catch { /* skip */ }
            }
          }
        } catch { /* ignore */ }

        setCat({ id: Number(catId), name: raw.name, image, stage, catTokenId });
      } catch { setCatError(isZh ? "读取猫咪数据失败" : "Failed to load cat"); }
      finally { setCatLoading(false); }
    };
    load();
  }, [catId, walletAddress, isZh]);

  // ── 链上数据：体力、道具库存（链上购买，刷新从链上读）──
  const [stamina,      setStamina]      = useState(5);
  const [foodCount,    setFoodCount]    = useState(0);
  const [canCount,     setCanCount]     = useState(0);
  const [boosterCount, setBoosterCount] = useState(0);
  const [chainLoading, setChainLoading] = useState(false);

  // ── 碎片：链下存储，以地址为 key ──
  const [fragments, setFragments] = useState(0);
  useEffect(() => {
    if (walletAddress) setFragments(loadLocalFrags(walletAddress));
  }, [walletAddress]);
  const addFragments = useCallback((n: number) => {
    if (!walletAddress) return;
    const newVal = loadLocalFrags(walletAddress) + n;
    saveLocalFrags(walletAddress, newVal);
    setFragments(newVal);
  }, [walletAddress]);

  const loadChainData = useCallback(async () => {
    if (!walletAddress) return;
    setChainLoading(true);
    try {
      const c = getReadonlyContracts();
      const [st, food, can, boost] = await Promise.all([
        c.gameContract.staminaOf(walletAddress),
        c.gameContract.foodBalance(walletAddress),
        c.gameContract.canBalance(walletAddress),
        c.gameContract.boosterBalance(walletAddress),
      ]);
      setStamina(Number(st));
      setFoodCount(Number(food));
      setCanCount(Number(can));
      setBoosterCount(Number(boost));
    } catch { /* ignore */ }
    finally { setChainLoading(false); }
  }, [walletAddress]);

  useEffect(() => { loadChainData(); }, [loadChainData]);

  // ── 装备 NFT（带图片）──
  const [equipments,    setEquipments]    = useState<EquipmentItem[]>([]);
  const [equipsLoading, setEquipsLoading] = useState(false);
  const [zoomedEquip,   setZoomedEquip]   = useState<EquipmentItem | null>(null);
  const [zoomedCol,     setZoomedCol]     = useState<CollectionNFT | null>(null);

  // 当前猫身上已装备的 tokenId（从链上读）
  const [equippedSlots, setEquippedSlots] = useState<Record<number, number>>({});

  const loadEquipments = useCallback(async () => {
    if (!walletAddress) return;
    setEquipsLoading(true);
    try {
      const c = getReadonlyContracts();

      // 先检查余额，0 则直接结束，不扫链
      const balRaw  = await c.equipmentNFT.balanceOf(walletAddress);
      const balance = Number(balRaw);
      if (balance === 0) { setEquipments([]); return; }

      // 用 totalSupply 遍历（装备总量通常很小），比扫 200000 个区块快得多
      const totalRaw = await c.equipmentNFT.totalSupply();
      const total    = Number(totalRaw);

      const found: EquipmentItem[] = [];
      for (let id = 0; id < total; id++) {
        try {
          const owner = await c.equipmentNFT.ownerOf(id);
          if ((owner as string).toLowerCase() !== walletAddress.toLowerCase()) continue;
          const eq = await c.equipmentNFT.getEquipment(id);
          const e = eq as { slot: bigint; rarity: bigint; name: string; lore: string; rarityBonus: bigint; safetyBonus: bigint; carryBonus: bigint; speedBonus: bigint };
          // 先 push 无图片条目，让列表立即渲染，不阻塞
          found.push({ tokenId: id, slot: Number(e.slot), rarity: Number(e.rarity), name: e.name, lore: e.lore, rarityBonus: Number(e.rarityBonus), carryBonus: Number(e.carryBonus), speedBonus: Number(e.speedBonus), image: "" });
        } catch { /* token 已 burn 或其他错误，跳过 */ }
      }
      setEquipments(found);

      // 图片异步加载，不阻塞列表显示
      found.forEach(async (eq, idx) => {
        try {
          const uri = await c.equipmentNFT.tokenURI(eq.tokenId) as string;
          if (!uri) return;
          const res  = await fetch(ipfsToHttp(uri), { signal: AbortSignal.timeout(8000) });
          const json = await res.json() as { image?: string };
          if (json.image) {
            setEquipments(prev => prev.map((item, i) =>
              i === idx ? { ...item, image: ipfsToHttp(json.image!) } : item
            ));
          }
        } catch { /* URI 未设置或网络失败，显示 slot 图标占位 */ }
      });

    } catch { /* ignore */ }
    finally { setEquipsLoading(false); }
  }, [walletAddress]);

  useEffect(() => { loadEquipments(); }, [loadEquipments]);

  // 读取当前猫装备槽位
  const loadEquippedSlots = useCallback(async () => {
    if (!cat?.catTokenId) return;
    try {
      const c = getReadonlyContracts();
      const MAX = BigInt("0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff");
      const slots: Record<number, number> = {};
      for (let s = 0; s <= 2; s++) {
        const raw = await c.equipmentNFT.getSlotEquipment(cat.catTokenId, s);
        if ((raw as bigint) !== MAX) slots[s] = Number(raw);
      }
      setEquippedSlots(slots);
    } catch { /* ignore */ }
  }, [cat?.catTokenId]);

  useEffect(() => { loadEquippedSlots(); }, [loadEquippedSlots]);

  // ── 收藏 NFT ──
  const [collections, setCollections] = useState<CollectionNFT[]>([]);
  const [colsLoading, setColsLoading] = useState(false);

  const loadCollections = useCallback(async () => {
    if (!walletAddress) return;
    setColsLoading(true);
    try {
      const c = getReadonlyContracts();
      const total = Number(await c.catNFT.totalSupply());
      const found: CollectionNFT[] = [];
      for (let i = total - 1; i >= 0 && found.length < 30; i--) {
        try {
          const owner = await c.catNFT.ownerOf(i);
          if ((owner as string).toLowerCase() !== walletAddress.toLowerCase()) continue;
          const info = await c.catNFT.nftInfo(i) as { nftType: bigint; seriesId: bigint; tokenURIValue: string };
          if (Number(info.nftType) !== 5) continue;
          let name = `Collection #${i}`, image = "", description = "";
          if (info.tokenURIValue) {
            try {
              const res = await fetch(ipfsToHttp(info.tokenURIValue), { signal: AbortSignal.timeout(6000) });
              const json = await res.json() as { name?: string; image?: string; description?: string };
              if (json.name) name = json.name;
              if (json.description) description = json.description;
              if (json.image) image = ipfsToHttp(json.image);
            } catch { /* fallback */ }
          }
          found.push({ tokenId: i, name, image, description, seriesId: Number(info.seriesId) });
        } catch { /* skip */ }
      }
      setCollections(found);
    } catch { /* ignore */ }
    finally { setColsLoading(false); }
  }, [walletAddress]);

  useEffect(() => { loadCollections(); }, [loadCollections]);

  // ── 出猎状态 ──
  const [catState,    setCatState]    = useState<CatState>("idle");
  const [hunt,        setHunt]        = useState<HuntState | null>(null);
  const [timeLeft,    setTimeLeft]    = useState(0);
  const [showSettle,  setShowSettle]  = useState(false);  // 倒计时结束，等待用户结算
  const [settling,    setSettling]    = useState(false);  // 正在提交链上 settleHunt
  const [settleResult, setSettleResult] = useState<{ materials: number; nftDropped: boolean; seriesId: number } | null>(null);
  const [showRewards, setShowRewards] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── UI 状态 ──
  const [showHuntModal, setShowHuntModal] = useState(false);
  const [huntConfig, setHuntConfig] = useState<{ duration: HuntDuration; item: HuntItem; booster: boolean; equip: Record<number, number | null> }>(
    { duration: "short", item: "none", booster: false, equip: { 0: null, 1: null, 2: null } }
  );
  const [toast,         setToast]       = useState<string | null>(null);
  const [buyingStamina, setBuyingStamina] = useState(false);
  const [buyingItem,    setBuyingItem]    = useState<string | null>(null);
  const [activePanel,   setActivePanel]   = useState<"bag" | "frags" | "tips">("bag");
  const [startingHunt,  setStartingHunt]  = useState(false);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3500); };

  // ── 恢复出猎（退出再进）──
  useEffect(() => {
    if (!catId || !walletAddress) return;
    const key = HUNT_KEY(catId, walletAddress);
    const savedHunt = localStorage.getItem(key);
    if (!savedHunt) return;
    const h: HuntState = JSON.parse(savedHunt);
    if (!h.active) return;
    const elapsed = Date.now() - h.startTime;
    if (elapsed >= h.duration) {
      // 倒计时已结束，显示结算按钮
      setCatState("returning");
      setHunt(null);
      localStorage.removeItem(key);
      setTimeout(() => { setCatState("settling"); setShowSettle(true); }, 1500);
    } else {
      setHunt(h);
      setCatState("hunting");
      setTimeLeft(Math.ceil((h.duration - elapsed) / 1000));
    }
  }, [catId, walletAddress]);

  // ── 倒计时 ──
  useEffect(() => {
    if (hunt && catState === "hunting") {
      timerRef.current = setInterval(() => {
        const elapsed   = Date.now() - hunt.startTime;
        const remaining = hunt.duration - elapsed;
        if (remaining <= 0) {
          clearInterval(timerRef.current!);
          const key = HUNT_KEY(catId, walletAddress ?? "");
          localStorage.removeItem(key);
          setHunt(null);
          setCatState("returning");
          setTimeout(() => { setCatState("settling"); setShowSettle(true); }, 1500);
        } else {
          setTimeLeft(Math.ceil(remaining / 1000));
        }
      }, 500);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [hunt, catState, catId, walletAddress]);

  const formatTime = (s: number) => {
    if (s <= 0) return "0s";
    const m = Math.floor(s / 60); const sec = s % 60;
    return m > 0 ? `${m}m ${sec}s` : `${sec}s`;
  };

  // ── 购买体力（链上）──
  const handleBuyStamina = async () => {
    if (!signer || stamina >= 5 || buyingStamina) return;
    setBuyingStamina(true);
    try {
      const c = getContracts(signer);
      const tx = await c.gameContract.buyStamina(1);
      await (tx as ethers.ContractTransactionResponse).wait();
      await loadChainData();
      refreshBalance();
      showToast(isZh ? "✅ 体力 +1" : "✅ Stamina +1");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "";
      if (!msg.includes("user rejected")) showToast(isZh ? "❌ 购买失败（PURR 不足？）" : "❌ Failed (not enough PURR?)");
    } finally { setBuyingStamina(false); }
  };

  // ── 购买道具（链上）──
  const handleBuyItem = async (type: "food" | "can" | "booster") => {
    if (!signer || buyingItem) return;
    setBuyingItem(type);
    try {
      const c = getContracts(signer);
      let tx;
      if (type === "food")    tx = await c.gameContract.buyCatFood(1);
      else if (type === "can") tx = await c.gameContract.buyCatCan(1);
      else                    tx = await c.gameContract.buyBooster(1);
      await (tx as ethers.ContractTransactionResponse).wait();
      await loadChainData();
      refreshBalance();
      const names: Record<string, string> = { food: isZh ? "猫粮" : "Cat Food", can: isZh ? "罐罐" : "Cat Can", booster: isZh ? "加速符" : "Booster" };
      showToast(`✅ ${isZh ? "购买成功：" : "Bought: "}${names[type]}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "";
      if (!msg.includes("user rejected")) showToast(isZh ? "❌ 购买失败（PURR 不足？）" : "❌ Failed (not enough PURR?)");
    } finally { setBuyingItem(null); }
  };

  // ── 装备穿戴（链上）──
  const handleEquip = async (catTokenId: number, equipTokenId: number) => {
    if (!signer) return;
    try {
      const c = getContracts(signer);
      const tx = await c.gameContract.equipItem(catTokenId, equipTokenId);
      await (tx as ethers.ContractTransactionResponse).wait();
      await loadEquippedSlots();
      showToast(isZh ? "✅ 装备成功" : "✅ Equipped");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "";
      if (!msg.includes("user rejected")) showToast(isZh ? "❌ 装备失败" : "❌ Equip failed");
    }
  };

  // ── 开始出猎（链上 startHunt → 存 localStorage）──
  const doStartHunt = async () => {
    if (!signer || !walletAddress || !cat) return;
    const cfg = HUNT_CONFIG[huntConfig.duration];
    if (stamina < cfg.stamina) return;
    if (huntConfig.item === "food" && foodCount < 1) { showToast(isZh ? "❌ 没有猫粮" : "❌ No cat food"); return; }
    if (huntConfig.item === "can"  && canCount  < 1) { showToast(isZh ? "❌ 没有罐罐" : "❌ No cat can"); return; }
    if (huntConfig.booster && boosterCount < 1) { showToast(isZh ? "❌ 没有加速符" : "❌ No booster"); return; }

    // 需要 catTokenId 才能调用链上 startHunt
    if (cat.catTokenId === null) {
      showToast(isZh ? "❌ 找不到你持有的该猫 NFT" : "❌ Can't find your cat NFT"); return;
    }

    setStartingHunt(true);
    setShowHuntModal(false);
    try {
      // 1. 如果选了装备，先链上 equip
      for (const [slot, equipTokenId] of Object.entries(huntConfig.equip)) {
        if (equipTokenId !== null) {
          const currentlyEquipped = equippedSlots[Number(slot)];
          if (currentlyEquipped !== equipTokenId) {
            try {
              const c = getContracts(signer);
              const tx = await c.gameContract.equipItem(cat.catTokenId, equipTokenId);
              await (tx as ethers.ContractTransactionResponse).wait();
            } catch { /* 非致命，继续 */ }
          }
        }
      }

      // 2. 链上 startHunt（扣体力 + 道具）
      const c = getContracts(signer);
      const durationIdx = cfg.durationIdx;
      const itemIdx     = ITEM_CONFIG[huntConfig.item].itemIdx;
      const tx = await c.gameContract.startHunt(cat.catTokenId, durationIdx, itemIdx, huntConfig.booster);
      const receipt = await (tx as ethers.ContractTransactionResponse).wait();

      // 3. 从事件读取实际出猎时长
      let effectiveDurationMs = cfg.durationIdx === 0 ? 2 * 3600 * 1000 :
                                cfg.durationIdx === 1 ? 4 * 3600 * 1000 : 8 * 3600 * 1000;
      if (receipt) {
        for (const log of receipt.logs) {
          try {
            const iface = new ethers.Interface(["event HuntStarted(uint256 indexed catTokenId, uint8 duration, uint8 item, uint256 effectiveDuration)"]);
            const parsed = iface.parseLog({ topics: log.topics as string[], data: log.data });
            if (parsed) { effectiveDurationMs = Number(parsed.args[3]) * 1000; break; }
          } catch { /* not this log */ }
        }
      }

      // 4. 存 localStorage（以地址为 key）
      const newHunt: HuntState = {
        active: true,
        startTime: Date.now(),
        duration: effectiveDurationMs,
        durationLabel: huntConfig.duration,
        item: huntConfig.item,
        useBooster: huntConfig.booster,
        catTokenId: cat.catTokenId,
        chainStarted: true,
      };
      localStorage.setItem(HUNT_KEY(catId, walletAddress), JSON.stringify(newHunt));
      setHunt(newHunt);
      setCatState("hunting");
      setTimeLeft(Math.ceil(effectiveDurationMs / 1000));

      // 5. 刷新链上数据（体力已被合约扣除）
      await loadChainData();
      refreshBalance();

    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "";
      if (!msg.includes("user rejected")) showToast(isZh ? "❌ 出猎失败，请重试" : "❌ Failed to start hunt");
    } finally { setStartingHunt(false); }
  };

  // ── 结算（链上 settleHunt）──
  const doSettle = async () => {
    if (!signer || !walletAddress || !cat?.catTokenId) return;
    setSettling(true);
    try {
      const c = getContracts(signer);
      const tx = await c.gameContract.settleHunt(cat.catTokenId);
      const receipt = await (tx as ethers.ContractTransactionResponse).wait();

      // 解析 HuntSettled 事件
      let materials = 0, nftDropped = false, seriesId = 0;
      if (receipt) {
        for (const log of receipt.logs) {
          try {
            const iface = new ethers.Interface(["event HuntSettled(uint256 indexed catTokenId, uint256 materials, bool nftDropped, uint32 seriesId)"]);
            const parsed = iface.parseLog({ topics: log.topics as string[], data: log.data });
            if (parsed) {
              materials   = Number(parsed.args[1]);
              nftDropped  = Boolean(parsed.args[2]);
              seriesId    = Number(parsed.args[3]);
              break;
            }
          } catch { /* not this log */ }
        }
      }

      // 碎片存到 localStorage
      addFragments(materials);

      setSettleResult({ materials, nftDropped, seriesId });
      setShowSettle(false);
      setShowRewards(true);
      setCatState("idle");

      // 刷新链上状态
      await loadChainData();
      if (nftDropped) await loadCollections();
      refreshBalance();

    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "";
      if (msg.includes("not back yet")) {
        showToast(isZh ? "⏰ 探险还未结束，请稍等" : "⏰ Not back yet, please wait");
      } else if (!msg.includes("user rejected")) {
        showToast(isZh ? "❌ 结算失败，请重试" : "❌ Settle failed, try again");
      }
    } finally { setSettling(false); }
  };

  // ── Loading / Error ──
  if (!walletAddress) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4" style={{ background: "#fffbf5" }}>
      <Navbar />
      <div className="text-5xl">🔐</div>
      <p className="font-bold" style={{ color: "#92400e" }}>{isZh ? "请先连接钱包" : "Please connect your wallet"}</p>
      <button onClick={() => navigate("/dashboard")} className="px-5 py-2.5 rounded-xl text-white font-bold text-sm"
        style={{ background: "linear-gradient(135deg,#F97316,#fbbf24)", cursor: "pointer" }}>
        {isZh ? "返回" : "Back"}
      </button>
    </div>
  );
  if (catLoading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "#fffbf5" }}>
      <Navbar /><Loader2 size={32} className="animate-spin" style={{ color: "#F97316" }} />
    </div>
  );
  if (catError || !cat) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4" style={{ background: "#fffbf5" }}>
      <Navbar />
      <div className="text-5xl">😿</div>
      <p className="font-bold" style={{ color: "#92400e" }}>{catError ?? (isZh ? "找不到该猫咪" : "Cat not found")}</p>
      <button onClick={() => navigate("/dashboard")} className="px-5 py-2.5 rounded-xl text-white font-bold text-sm"
        style={{ background: "linear-gradient(135deg,#F97316,#fbbf24)", cursor: "pointer" }}>
        {isZh ? "返回" : "Back"}
      </button>
    </div>
  );

  const dur = HUNT_CONFIG[huntConfig.duration];
  const noNftWarning = cat.catTokenId === null;

  // ── Series 名称映射（从已加载的 collections 推断）──
  const getSeriesName = (id: number) => {
    const found = collections.find(c => c.seriesId === id);
    if (found) return found.name;
    return id === 0 ? (isZh ? "小猫玩耍" : "Cat Playing") :
           id === 1 ? (isZh ? "小猫同伴" : "Cat Companion") :
                      (isZh ? "小猫睡觉" : "Cat Sleeping");
  };

  return (
    <div className="min-h-screen" style={{ background: "#fffbf5", fontFamily: "'Nunito', sans-serif" }}>
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-20 pb-10">

        <button onClick={() => navigate(`/cat/${cat.id}`)} className="flex items-center gap-2 mb-5 text-sm" style={{ color: "#b45309", cursor: "pointer" }}>
          <ArrowLeft size={15} />{isZh ? `返回 ${cat.name} 的档案` : `Back to ${cat.name}`}
        </button>

        {/* ── 无 NFT 警告 ── */}
        {noNftWarning && (
          <div className="mb-4 p-3 rounded-xl text-sm" style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#dc2626" }}>
            ⚠️ {isZh ? "你还没有该猫咪的 NFT，请先在猫咪档案页领取或云领养后再进行探险。" : "You don't own an NFT for this cat. Please claim or cloud-adopt first."}
          </div>
        )}

        {/* ── 状态栏 ── */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl p-4 mb-5 flex flex-wrap gap-4 items-center justify-between"
          style={{ background: "white", border: "1px solid rgba(249,115,22,0.15)", boxShadow: "0 2px 12px rgba(249,115,22,0.06)" }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0" style={{ border: "2px solid rgba(249,115,22,0.25)" }}>
              <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
            </div>
            <div>
              <div className="text-sm font-bold" style={{ color: "#92400e" }}>{cat.name}</div>
              <div className="text-xs" style={{ color: "#F97316" }}>Stage {cat.stage}</div>
            </div>
          </div>

          {/* 体力 */}
          <div className="flex items-center gap-2">
            <Zap size={14} style={{ color: "#F97316" }} />
            <span className="text-xs font-medium" style={{ color: "#b45309" }}>{isZh ? "体力" : "SP"}</span>
            <div className="flex gap-1">
              {[1,2,3,4,5].map(i => (
                <div key={i} className="w-4 h-4 rounded-sm transition-all"
                  style={{ background: i <= stamina ? "#F97316" : "rgba(249,115,22,0.1)", boxShadow: i <= stamina ? "0 0 6px rgba(249,115,22,0.3)" : "none" }} />
              ))}
            </div>
            <span className="text-xs font-bold" style={{ color: "#F97316" }}>{stamina}/5</span>
            <button onClick={handleBuyStamina} disabled={stamina >= 5 || buyingStamina || !signer}
              title={isZh ? "花 8 PURR 购买 1 点体力" : "Buy 1 stamina for 8 PURR"}
              className="w-6 h-6 rounded-full flex items-center justify-center ml-0.5"
              style={{ background: stamina < 5 && signer ? "rgba(249,115,22,0.15)" : "rgba(249,115,22,0.05)", border: "1px solid rgba(249,115,22,0.3)", color: stamina < 5 && signer ? "#F97316" : "#d4a57a", cursor: stamina < 5 && signer ? "pointer" : "default" }}>
              {buyingStamina ? <Loader2 size={10} className="animate-spin" /> : <Plus size={10} />}
            </button>
          </div>

          {/* 碎片（链下）*/}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl"
            style={{ background: "rgba(168,85,247,0.07)", border: "1px solid rgba(168,85,247,0.15)" }}>
            <Sparkles size={13} style={{ color: "#a855f7" }} />
            <span className="text-sm font-bold" style={{ color: "#a855f7" }}>{fragments}</span>
            <span className="text-xs" style={{ color: "#b45309" }}>{isZh ? "碎片" : "frags"}</span>
          </div>

          {chainLoading && <Loader2 size={14} className="animate-spin" style={{ color: "#F97316", opacity: 0.4 }} />}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* ── 左：场景 ── */}
          <div className="lg:col-span-2">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="relative rounded-2xl overflow-hidden"
              style={{ height: 360, boxShadow: "0 4px 24px rgba(249,115,22,0.1)" }}>
              <CozyRoom catState={catState} catName={cat.name} isZh={isZh} />
              {catState === "hunting" && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2 rounded-full"
                  style={{ background: "rgba(255,255,255,0.92)", border: "1px solid rgba(249,115,22,0.3)", boxShadow: "0 2px 12px rgba(249,115,22,0.15)" }}>
                  <Clock size={14} style={{ color: "#F97316" }} />
                  <span className="text-sm font-bold" style={{ color: "#c2410c" }}>{formatTime(timeLeft)} {isZh ? "后归来" : "remaining"}</span>
                </motion.div>
              )}
            </motion.div>

            {/* 出猎 / 结算 按钮 */}
            <div className="mt-4">
              {catState === "settling" ? (
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  onClick={() => setShowSettle(true)}
                  className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl text-sm font-black text-white"
                  style={{ background: "linear-gradient(135deg,#a855f7,#F97316)", boxShadow: "0 4px 20px rgba(168,85,247,0.3)", cursor: "pointer" }}>
                  <Trophy size={16} />{isZh ? "🎉 点击结算战利品！" : "🎉 Claim your loot!"}
                </motion.button>
              ) : (
                <motion.button whileHover={{ scale: catState === "idle" && stamina > 0 && !noNftWarning ? 1.02 : 1 }} whileTap={{ scale: 0.98 }}
                  onClick={() => catState === "idle" && stamina > 0 && !noNftWarning && !startingHunt && setShowHuntModal(true)}
                  disabled={catState !== "idle" || stamina === 0 || noNftWarning || startingHunt}
                  className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl text-sm font-black"
                  style={{
                    background: catState !== "idle" || stamina === 0 || noNftWarning || startingHunt ? "rgba(249,115,22,0.06)" : "linear-gradient(135deg,#F97316,#fbbf24)",
                    color: catState !== "idle" || stamina === 0 || noNftWarning || startingHunt ? "rgba(180,120,50,0.4)" : "white",
                    cursor: catState !== "idle" || stamina === 0 || noNftWarning || startingHunt ? "default" : "pointer",
                    boxShadow: catState === "idle" && stamina > 0 && !noNftWarning && !startingHunt ? "0 4px 20px rgba(249,115,22,0.3)" : "none",
                    border: catState !== "idle" || stamina === 0 || noNftWarning || startingHunt ? "1px solid rgba(249,115,22,0.1)" : "none",
                  }}>
                  {startingHunt      ? <><Loader2 size={16} className="animate-spin" />{isZh ? "发起链上交易…" : "Submitting tx…"}</> :
                   catState === "hunting"  ? <><Clock size={16} />{isZh ? "探险中…" : "Exploring…"}</> :
                   catState === "returning" ? <><Trophy size={16} />{isZh ? "归来中…" : "Returning…"}</> :
                   stamina === 0     ? (isZh ? "体力耗尽，点体力旁 + 购买" : "No stamina — buy via + button") :
                   noNftWarning      ? (isZh ? "需要持有该猫 NFT" : "Need cat NFT first") :
                   <><ChevronRight size={16} />{isZh ? "派出探险" : "Start Hunt"}</>}
                </motion.button>
              )}
            </div>

            {/* ── 收藏 NFT ── */}
            <div className="mt-6">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles size={14} style={{ color: "#a855f7" }} />
                <span className="text-sm font-bold" style={{ color: "#92400e" }}>{isZh ? "收藏系列 NFT" : "Collection NFTs"}</span>
                {collections.length > 0 && (
                  <span className="text-xs px-2 py-0.5 rounded-full font-bold"
                    style={{ background: "rgba(168,85,247,0.1)", color: "#a855f7", border: "1px solid rgba(168,85,247,0.2)" }}>
                    {collections.length}
                  </span>
                )}
              </div>
              {colsLoading ? (
                <div className="flex justify-center py-4"><Loader2 size={20} className="animate-spin" style={{ color: "#a855f7" }} /></div>
              ) : collections.length === 0 ? (
                <div className="py-6 text-center rounded-2xl" style={{ background: "rgba(249,115,22,0.03)", border: "1px dashed rgba(249,115,22,0.15)" }}>
                  <div className="text-3xl mb-2">🐾</div>
                  <p className="text-xs" style={{ color: "#b45309" }}>{isZh ? "携带猫粮或罐罐出猎可带回收藏 NFT" : "Bring food/can to get Collection NFTs"}</p>
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {collections.map(col => (
                    <div key={col.tokenId}
                      className="rounded-xl overflow-hidden cursor-pointer transition-transform hover:scale-105"
                      onClick={() => setZoomedCol(col)}
                      style={{ background: "white", border: "1px solid rgba(168,85,247,0.15)", boxShadow: "0 2px 8px rgba(168,85,247,0.06)" }}>
                      <div className="aspect-square" style={{ background: "rgba(168,85,247,0.04)" }}>
                        {col.image
                          ? <img src={col.image} alt={col.name} className="w-full h-full object-cover" />
                          : <div className="w-full h-full flex items-center justify-center text-3xl">🐾</div>}
                      </div>
                      <div className="p-2">
                        <p className="text-xs font-bold truncate" style={{ color: "#92400e" }}>{col.name}</p>
                        {col.description && <p className="text-xs mt-0.5 line-clamp-2" style={{ color: "#b45309" }}>{col.description}</p>}
                        <p className="text-xs font-mono mt-0.5" style={{ color: "#d97706" }}>#{col.tokenId}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ── 右：Tab 面板 ── */}
          <div className="flex flex-col gap-4">
            <div className="flex gap-1 p-1 rounded-xl" style={{ background: "rgba(249,115,22,0.06)" }}>
              {([
                { id: "bag"   as const, icon: <BagIcon size={12} />,  zh: "装备", en: "Gear"  },
                { id: "frags" as const, icon: <Sparkles size={12} />, zh: "碎片", en: "Frags" },
                { id: "tips"  as const, icon: <span style={{ fontSize: 11 }}>💡</span>, zh: "提示", en: "Tips" },
              ]).map(t => (
                <button key={t.id} onClick={() => setActivePanel(t.id)}
                  className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs font-bold transition-all"
                  style={{ background: activePanel === t.id ? "white" : "transparent", color: activePanel === t.id ? "#F97316" : "#b45309", cursor: "pointer", boxShadow: activePanel === t.id ? "0 1px 6px rgba(249,115,22,0.1)" : "none" }}>
                  {t.icon}{isZh ? t.zh : t.en}
                </button>
              ))}
            </div>

            {/* 装备背包面板 */}
            {activePanel === "bag" && (
              <div className="rounded-2xl p-4" style={{ background: "white", border: "1px solid rgba(249,115,22,0.12)" }}>
                <div className="flex items-center gap-2 mb-3">
                  <Package size={14} style={{ color: "#F97316" }} />
                  <span className="text-sm font-bold" style={{ color: "#92400e" }}>{isZh ? "装备背包" : "Equipment"}</span>
                </div>
                {equipsLoading ? (
                  <div className="flex justify-center py-6"><Loader2 size={20} className="animate-spin" style={{ color: "#F97316" }} /></div>
                ) : equipments.length === 0 ? (
                  <div className="py-6 text-center">
                    <div className="text-4xl mb-2">🎒</div>
                    <p className="text-xs mb-3" style={{ color: "#b45309" }}>{isZh ? "还没有装备，去抽卡获得！" : "No equipment yet!"}</p>
                    <button onClick={() => navigate("/gacha")} className="px-4 py-2 rounded-xl text-xs font-bold text-white"
                      style={{ background: "linear-gradient(135deg,#F97316,#fbbf24)", cursor: "pointer" }}>
                      {isZh ? "前往抽卡" : "Go Gacha"}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-72 overflow-y-auto">
                    {equipments.map(eq => {
                      const isEquipped = Object.values(equippedSlots).includes(eq.tokenId);
                      return (
                        <div key={eq.tokenId}
                          onClick={() => setZoomedEquip(eq)}
                          className="p-3 rounded-xl cursor-pointer transition-all"
                          style={{ background: isEquipped ? "rgba(52,211,153,0.06)" : "rgba(249,115,22,0.04)", border: `1px solid ${isEquipped ? "rgba(52,211,153,0.3)" : "rgba(249,115,22,0.1)"}` }}
                          onMouseEnter={e => (e.currentTarget.style.borderColor = "rgba(249,115,22,0.3)")}
                          onMouseLeave={e => (e.currentTarget.style.borderColor = isEquipped ? "rgba(52,211,153,0.3)" : "rgba(249,115,22,0.1)")}>
                          <div className="flex items-center gap-2">
                            {/* 装备图片缩略图 */}
                            {eq.image ? (
                              <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0" style={{ border: "1px solid rgba(249,115,22,0.15)" }}>
                                <img src={ipfsToHttp(eq.image)} alt={eq.name} className="w-full h-full object-cover" />
                              </div>
                            ) : (
                              <span className="text-xl flex-shrink-0 w-10 text-center">{SLOT_ICONS[eq.slot]}</span>
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="text-xs font-bold truncate" style={{ color: "#92400e" }}>{eq.name}</span>
                                <span className="text-xs px-1.5 py-0.5 rounded-full flex-shrink-0"
                                  style={{ background: `${RARITY_COLORS[eq.rarity]}18`, color: RARITY_COLORS[eq.rarity], border: `1px solid ${RARITY_COLORS[eq.rarity]}30`, fontSize: "10px" }}>
                                  {RARITY_LABELS[eq.rarity]}
                                </span>
                                {isEquipped && <span className="text-xs px-1.5 py-0.5 rounded-full flex-shrink-0" style={{ background: "rgba(52,211,153,0.12)", color: "#059669", fontSize: "10px" }}>✓ {isZh ? "已装备" : "On"}</span>}
                              </div>
                              <div className="text-xs" style={{ color: "#b45309" }}>{SLOT_LABELS[eq.slot]} #{eq.tokenId}</div>
                            </div>
                            <div className="flex items-center gap-1">
                              <ZoomIn size={12} style={{ color: "#d97706" }} />
                              {catState === "idle" && cat.catTokenId && !isEquipped && (
                                <button onClick={e => { e.stopPropagation(); handleEquip(cat.catTokenId!, eq.tokenId); }}
                                  className="flex-shrink-0 px-2 py-1 rounded-lg text-xs font-semibold ml-1"
                                  style={{ background: "rgba(249,115,22,0.1)", color: "#c2410c", border: "1px solid rgba(249,115,22,0.2)", cursor: "pointer" }}>
                                  {isZh ? "装备" : "Equip"}
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* 碎片面板 */}
            {activePanel === "frags" && (
              <div className="rounded-2xl p-4" style={{ background: "white", border: "1px solid rgba(249,115,22,0.12)" }}>
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles size={14} style={{ color: "#a855f7" }} />
                  <span className="text-sm font-bold" style={{ color: "#92400e" }}>{isZh ? "材料碎片" : "Fragments"}</span>
                </div>
                <div className="text-center py-2">
                  <div className="text-5xl font-black mb-1" style={{ color: "#a855f7" }}>{fragments}</div>
                  <p className="text-xs mb-3" style={{ color: "#b45309" }}>{isZh ? "10 碎片 = 1 抽卡券（合成在抽卡页）" : "10 frags = 1 ticket (merge on Gacha page)"}</p>
                  <div className="w-full bg-orange-50 rounded-full h-2 mb-4 overflow-hidden" style={{ border: "1px solid rgba(249,115,22,0.1)" }}>
                    <div className="h-2 rounded-full transition-all" style={{ width: `${(fragments % 10) * 10}%`, background: "linear-gradient(90deg,#a855f7,#F97316)" }} />
                  </div>
                  <button onClick={() => navigate("/gacha")} className="w-full py-3 rounded-xl text-white text-sm font-bold"
                    style={{ background: "linear-gradient(135deg,#a855f7,#F97316)", cursor: "pointer", boxShadow: "0 4px 16px rgba(168,85,247,0.2)" }}>
                    ✨ {isZh ? "前往抽卡合成" : "Go to Gacha"}
                  </button>
                </div>
              </div>
            )}

            {/* 提示面板 */}
            {activePanel === "tips" && (
              <div className="rounded-2xl p-4" style={{ background: "white", border: "1px solid rgba(249,115,22,0.12)" }}>
                <div className="text-sm font-bold mb-3" style={{ color: "#92400e" }}>💡 {isZh ? "游戏提示" : "Tips"}</div>
                <ul className="space-y-2 text-xs" style={{ color: "#b45309" }}>
                  <li className="flex items-start gap-2"><Zap size={12} className="mt-0.5 flex-shrink-0" style={{ color: "#F97316" }} /><span>{isZh ? "体力每8小时自然恢复1点，可花8 PURR购买" : "Stamina restores 1/8h, or buy for 8 PURR"}</span></li>
                  <li className="flex items-start gap-2"><span className="flex-shrink-0">🐟</span><span>{isZh ? "携带猫粮或罐罐可带回收藏系列NFT" : "Food/can guarantees a Collection NFT drop"}</span></li>
                  <li className="flex items-start gap-2"><Sword size={12} className="mt-0.5 flex-shrink-0" style={{ color: "#F97316" }} /><span>{isZh ? "武器装备提高 NFT 稀有度概率" : "Weapon raises NFT rarity chance"}</span></li>
                  <li className="flex items-start gap-2"><BagIcon size={12} className="mt-0.5 flex-shrink-0" style={{ color: "#F97316" }} /><span>{isZh ? "背包装备增加碎片产出量" : "Bag boosts fragment yield"}</span></li>
                  <li className="flex items-start gap-2"><Wind size={12} className="mt-0.5 flex-shrink-0" style={{ color: "#F97316" }} /><span>{isZh ? "靴子装备缩短探险时长" : "Boots shortens hunt duration"}</span></li>
                  <li className="flex items-start gap-2"><span className="flex-shrink-0">⛓️</span><span>{isZh ? "出猎会发起链上交易扣除体力和道具，结束后需点击「结算」再次上链 mint NFT 和碎片" : "Hunt submits a tx for stamina/items. After return, click Settle to mint NFTs and record fragments on-chain"}</span></li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── 出猎配置弹窗 ── */}
      <AnimatePresence>
        {showHuntModal && (
          <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.4)", backdropFilter: "blur(8px)" }}>
            <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }}
              className="w-full max-w-md rounded-3xl p-6 overflow-y-auto"
              style={{ background: "#fffbf5", border: "1px solid rgba(249,115,22,0.2)", boxShadow: "0 20px 60px rgba(249,115,22,0.2)", maxHeight: "92vh" }}>

              <div className="flex justify-between items-center mb-5">
                <h3 className="font-black text-lg" style={{ color: "#92400e" }}>🐾 {isZh ? "配置探险" : "Configure Hunt"}</h3>
                <button onClick={() => setShowHuntModal(false)} className="p-1.5 rounded-lg"
                  style={{ background: "rgba(249,115,22,0.08)", color: "#b45309", cursor: "pointer" }}><X size={15} /></button>
              </div>

              {/* 时长选择 */}
              <div className="mb-5">
                <label className="text-xs font-bold mb-2 block" style={{ color: "#b45309" }}>{isZh ? "探险时长" : "Duration"}</label>
                <div className="grid grid-cols-3 gap-2">
                  {(Object.entries(HUNT_CONFIG) as [HuntDuration, typeof HUNT_CONFIG[HuntDuration]][]).map(([key, val]) => (
                    <button key={key} onClick={() => setHuntConfig(c => ({ ...c, duration: key }))}
                      className="py-3 px-2 rounded-xl text-center transition-all"
                      style={{ background: huntConfig.duration === key ? "rgba(249,115,22,0.15)" : "rgba(249,115,22,0.04)", border: huntConfig.duration === key ? "2px solid rgba(249,115,22,0.5)" : "1px solid rgba(249,115,22,0.12)", color: huntConfig.duration === key ? "#c2410c" : "#b45309", cursor: "pointer" }}>
                      <div className="text-xs font-bold">{isZh ? val.labelZh : val.labelEn}</div>
                      <div className="text-xs mt-0.5" style={{ color: "#F97316" }}>⚡{val.stamina}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* 道具选择 */}
              <div className="mb-5">
                <label className="text-xs font-bold mb-2 block" style={{ color: "#b45309" }}>
                  {isZh ? "携带道具（携带猫粮/罐罐必然掉落 NFT）" : "Item (food/can = guaranteed NFT drop)"}
                </label>
                <div className="space-y-2">
                  {(Object.entries(ITEM_CONFIG) as [HuntItem, typeof ITEM_CONFIG[HuntItem]][]).map(([key, val]) => {
                    const count = key === "food" ? foodCount : key === "can" ? canCount : null;
                    const selected = huntConfig.item === key;
                    return (
                      <div key={key} className="flex items-center gap-3 p-3 rounded-xl transition-all"
                        style={{ background: selected ? "rgba(249,115,22,0.1)" : "rgba(249,115,22,0.03)", border: selected ? "2px solid rgba(249,115,22,0.4)" : "1px solid rgba(249,115,22,0.1)", cursor: "pointer" }}
                        onClick={() => setHuntConfig(c => ({ ...c, item: key }))}>
                        <span className="text-2xl">{val.icon}</span>
                        <div className="flex-1">
                          <div className="text-xs font-bold" style={{ color: "#92400e" }}>
                            {isZh ? val.labelZh : val.labelEn}
                            {count !== null && <span className="ml-1.5 font-normal" style={{ color: "#d97706" }}>({isZh ? "库存" : "stock"}: {count})</span>}
                          </div>
                          <div className="text-xs" style={{ color: "#b45309" }}>{isZh ? val.descZh : val.descEn}</div>
                        </div>
                        {val.itemIdx > 0 && count !== null && (
                          <button onClick={e => { e.stopPropagation(); handleBuyItem(key as "food" | "can"); }}
                            disabled={!!buyingItem || !signer}
                            className="flex-shrink-0 px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1"
                            style={{ background: "rgba(249,115,22,0.12)", color: "#c2410c", border: "1px solid rgba(249,115,22,0.25)", cursor: signer ? "pointer" : "default" }}>
                            {buyingItem === key ? <Loader2 size={10} className="animate-spin" /> : <Plus size={10} />}
                            {key === "food" ? "5" : "15"} PURR
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 加速符 */}
              <div className="mb-5">
                <div className="flex items-center gap-3 p-3 rounded-xl transition-all"
                  style={{ background: huntConfig.booster ? "rgba(249,115,22,0.1)" : "rgba(249,115,22,0.03)", border: huntConfig.booster ? "2px solid rgba(249,115,22,0.4)" : "1px solid rgba(249,115,22,0.1)" }}>
                  <div className="flex items-center gap-3 flex-1 cursor-pointer" onClick={() => setHuntConfig(c => ({ ...c, booster: !c.booster }))}>
                    <span className="text-2xl">⚡</span>
                    <div>
                      <div className="text-xs font-bold" style={{ color: "#92400e" }}>
                        {isZh ? "加速符（时长减半）" : "Booster (half time)"}
                        <span className="ml-1.5 font-normal" style={{ color: "#d97706" }}>({isZh ? "库存" : "stock"}: {boosterCount})</span>
                      </div>
                      <div className="text-xs" style={{ color: "#b45309" }}>10 PURR</div>
                    </div>
                  </div>
                  <button onClick={e => { e.stopPropagation(); handleBuyItem("booster"); }} disabled={!!buyingItem || !signer}
                    className="flex-shrink-0 px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1"
                    style={{ background: "rgba(249,115,22,0.12)", color: "#c2410c", border: "1px solid rgba(249,115,22,0.25)", cursor: signer ? "pointer" : "default" }}>
                    {buyingItem === "booster" ? <Loader2 size={10} className="animate-spin" /> : <Plus size={10} />}
                    {isZh ? "购买" : "Buy"}
                  </button>
                </div>
              </div>

              {/* 装备选择（出发前选，会自动上链 equip）*/}
              {equipments.length > 0 && (
                <div className="mb-5">
                  <label className="text-xs font-bold mb-2 block" style={{ color: "#b45309" }}>
                    ⚔️ {isZh ? "选择出猎装备（点击选中，出发时自动装备）" : "Equipment (click to select, auto-equip on departure)"}
                  </label>
                  <div className="space-y-1.5">
                    {equipments.slice(0, 9).map(eq => {
                      const isSel = huntConfig.equip[eq.slot] === eq.tokenId;
                      const isAlreadyOn = equippedSlots[eq.slot] === eq.tokenId;
                      return (
                        <div key={eq.tokenId}
                          onClick={() => setHuntConfig(p => ({ ...p, equip: { ...p.equip, [eq.slot]: isSel ? null : eq.tokenId } }))}
                          className="flex items-center gap-2 p-2.5 rounded-xl cursor-pointer transition-all"
                          style={{ background: isSel ? "rgba(249,115,22,0.12)" : "rgba(249,115,22,0.03)", border: isSel ? "1px solid rgba(249,115,22,0.35)" : "1px solid rgba(249,115,22,0.08)" }}>
                          {eq.image
                            ? <div className="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0"><img src={ipfsToHttp(eq.image)} alt={eq.name} className="w-full h-full object-cover" /></div>
                            : <span className="flex-shrink-0">{SLOT_ICONS[eq.slot]}</span>}
                          <span className="text-xs font-semibold flex-1 truncate" style={{ color: "#92400e" }}>{eq.name}</span>
                          {isAlreadyOn && !isSel && <span className="text-xs px-1.5 rounded-full" style={{ background: "rgba(52,211,153,0.12)", color: "#059669", fontSize: "10px" }}>✓{isZh ? "已穿" : "On"}</span>}
                          <span className="text-xs px-1.5 py-0.5 rounded-full flex-shrink-0"
                            style={{ background: `${RARITY_COLORS[eq.rarity]}18`, color: RARITY_COLORS[eq.rarity], fontSize: "10px" }}>
                            {RARITY_LABELS[eq.rarity]}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 总消耗提示 */}
              <div className="flex justify-between items-center mb-4 px-3 py-2.5 rounded-xl"
                style={{ background: "rgba(249,115,22,0.06)", border: "1px solid rgba(249,115,22,0.12)" }}>
                <span className="text-xs font-medium" style={{ color: "#b45309" }}>{isZh ? "总消耗" : "Total cost"}</span>
                <span className="text-xs font-bold" style={{ color: "#c2410c" }}>⚡{dur.stamina} 体力 + 道具</span>
              </div>

              <button onClick={doStartHunt} disabled={stamina < dur.stamina || startingHunt}
                className="w-full py-4 rounded-2xl font-black text-sm"
                style={{ background: stamina >= dur.stamina && !startingHunt ? "linear-gradient(135deg,#F97316,#fbbf24)" : "rgba(249,115,22,0.08)", color: stamina >= dur.stamina && !startingHunt ? "white" : "rgba(180,120,50,0.4)", cursor: stamina >= dur.stamina && !startingHunt ? "pointer" : "default", boxShadow: stamina >= dur.stamina && !startingHunt ? "0 4px 20px rgba(249,115,22,0.3)" : "none" }}>
                {startingHunt ? <span className="flex items-center justify-center gap-2"><Loader2 size={16} className="animate-spin" />{isZh ? "提交链上交易…" : "Submitting…"}</span> :
                 stamina < dur.stamina ? (isZh ? "体力不足" : "Not enough stamina") :
                 `🐾 ${isZh ? "出发探险！（链上扣体力）" : "Start Exploring! (on-chain)"}`}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── 结算弹窗 ── */}
      <AnimatePresence>
        {showSettle && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(12px)" }}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 15 }}
              className="w-full max-w-sm rounded-3xl p-6 text-center"
              style={{ background: "#fffbf5", border: "1px solid rgba(168,85,247,0.3)", boxShadow: "0 20px 60px rgba(168,85,247,0.2)" }}>
              <motion.div animate={{ rotate: [0, -10, 10, -5, 5, 0] }} transition={{ duration: 0.5 }} className="text-5xl mb-3">🎁</motion.div>
              <h3 className="font-black text-lg mb-2" style={{ color: "#92400e" }}>{cat.name} {isZh ? "探险归来！" : "is back!"}</h3>
              <p className="text-sm mb-5" style={{ color: "#b45309" }}>
                {isZh ? "需要上链一次来确认战利品并 mint NFT" : "One tx needed to confirm loot & mint NFT"}
              </p>
              <button onClick={doSettle} disabled={settling}
                className="w-full py-4 rounded-2xl text-white font-black text-sm flex items-center justify-center gap-2"
                style={{ background: settling ? "rgba(168,85,247,0.3)" : "linear-gradient(135deg,#a855f7,#F97316)", cursor: settling ? "default" : "pointer", boxShadow: settling ? "none" : "0 4px 20px rgba(168,85,247,0.35)" }}>
                {settling ? <><Loader2 size={16} className="animate-spin" />{isZh ? "链上结算中…" : "Settling on-chain…"}</> :
                 <>⛓️ {isZh ? "确认结算（发起交易）" : "Confirm & Settle (1 tx)"}</>}
              </button>
              {!settling && (
                <p className="text-xs mt-3" style={{ color: "#d97706" }}>
                  {isZh ? "* 碎片和收藏 NFT 将在交易确认后到账" : "* Fragments & Collection NFT credited after tx confirms"}
                </p>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── 奖励结果弹窗 ── */}
      <AnimatePresence>
        {showRewards && settleResult && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(12px)" }}>
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", damping: 14 }}
              className="w-full max-w-sm rounded-3xl p-6 text-center"
              style={{ background: "#fffbf5", border: "1px solid rgba(249,115,22,0.25)", boxShadow: "0 20px 60px rgba(249,115,22,0.2)" }}>
              <motion.div animate={{ rotate: [0, -10, 10, -5, 5, 0] }} transition={{ duration: 0.5 }} className="text-5xl mb-3">🎉</motion.div>
              <h3 className="font-black text-lg mb-1" style={{ color: "#92400e" }}>{isZh ? "战利品结算完成！" : "Loot settled!"}</h3>
              <p className="text-sm mb-4" style={{ color: "#b45309" }}>{isZh ? "已上链记录，以下奖励已到账" : "On-chain confirmed! Rewards credited:"}</p>
              <div className="space-y-2 mb-5">
                <div className="flex items-center justify-between px-4 py-2.5 rounded-xl"
                  style={{ background: "rgba(168,85,247,0.08)", border: "1px solid rgba(168,85,247,0.15)" }}>
                  <span className="text-sm font-semibold" style={{ color: "#92400e" }}>✨ {isZh ? "材料碎片" : "Fragments"}</span>
                  <span className="text-sm font-black" style={{ color: "#a855f7" }}>+{settleResult.materials}</span>
                </div>
                {settleResult.nftDropped ? (
                  <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.15 }}
                    className="flex items-center justify-between px-4 py-2.5 rounded-xl"
                    style={{ background: "rgba(249,115,22,0.08)", border: "1px solid rgba(249,115,22,0.18)" }}>
                    <span className="text-sm font-semibold" style={{ color: "#92400e" }}>🐾 {getSeriesName(settleResult.seriesId)} NFT</span>
                    <span className="text-xs px-2 py-0.5 rounded-full font-bold"
                      style={{ background: settleResult.seriesId === 2 ? "rgba(245,158,11,0.15)" : settleResult.seriesId === 1 ? "rgba(96,165,250,0.15)" : "rgba(156,163,175,0.15)", color: settleResult.seriesId === 2 ? "#d97706" : settleResult.seriesId === 1 ? "#3b82f6" : "#9CA3AF" }}>
                      {settleResult.seriesId === 2 ? (isZh ? "珍稀" : "Epic") : settleResult.seriesId === 1 ? (isZh ? "稀有" : "Rare") : (isZh ? "普通" : "Common")}
                    </span>
                  </motion.div>
                ) : (
                  <div className="px-4 py-2.5 rounded-xl text-sm" style={{ background: "rgba(249,115,22,0.04)", color: "#b45309" }}>
                    {isZh ? "本次未携带道具，无 NFT 掉落" : "No item brought, no NFT this time"}
                  </div>
                )}
              </div>
              <button onClick={() => { setShowRewards(false); setSettleResult(null); }}
                className="w-full py-3.5 rounded-2xl text-white font-black text-sm"
                style={{ background: "linear-gradient(135deg,#F97316,#fbbf24)", cursor: "pointer", boxShadow: "0 4px 16px rgba(249,115,22,0.3)" }}>
                {isZh ? "太棒了！继续冒险" : "Awesome! Keep exploring"}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── 收藏 NFT 放大弹窗 ── */}
      <AnimatePresence>
        {zoomedCol && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(12px)" }}
            onClick={() => setZoomedCol(null)}>
            <motion.div initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.85, opacity: 0 }}
              transition={{ type: "spring", damping: 18 }}
              className="w-full max-w-xs rounded-3xl overflow-hidden"
              style={{ background: "#fffbf5", border: "2px solid rgba(168,85,247,0.3)", boxShadow: "0 20px 60px rgba(168,85,247,0.25)" }}
              onClick={e => e.stopPropagation()}>
              {/* 图片区 */}
              <div className="aspect-square w-full" style={{ background: "linear-gradient(135deg, rgba(168,85,247,0.08), rgba(168,85,247,0.15))" }}>
                {zoomedCol.image
                  ? <img src={zoomedCol.image} alt={zoomedCol.name} className="w-full h-full object-contain p-4" />
                  : <div className="w-full h-full flex items-center justify-center text-8xl">🐾</div>}
              </div>
              {/* 信息区 */}
              <div className="p-5">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-black text-lg" style={{ color: "#92400e" }}>{zoomedCol.name}</h3>
                  <button onClick={() => setZoomedCol(null)} className="p-1 rounded-lg flex-shrink-0 ml-2"
                    style={{ background: "rgba(168,85,247,0.08)", color: "#7c3aed", cursor: "pointer" }}>
                    <X size={14} />
                  </button>
                </div>
                <div className="flex gap-2 mb-3 flex-wrap">
                  <span className="text-xs px-2 py-1 rounded-full font-bold"
                    style={{ background: "rgba(168,85,247,0.12)", color: "#7c3aed", border: "1px solid rgba(168,85,247,0.3)" }}>
                    ✦ {isZh ? "收藏系列" : "Collection"}
                  </span>
                  <span className="text-xs px-2 py-1 rounded-full font-mono"
                    style={{ background: "rgba(168,85,247,0.06)", color: "#a855f7" }}>
                    #{zoomedCol.tokenId}
                  </span>
                  <span className="text-xs px-2 py-1 rounded-full"
                    style={{ background: "rgba(249,115,22,0.06)", color: "#d97706" }}>
                    {isZh ? "系列" : "Series"} {zoomedCol.seriesId}
                  </span>
                </div>
                {zoomedCol.description && (
                  <p className="text-xs leading-relaxed p-3 rounded-xl"
                    style={{ color: "#b45309", background: "rgba(168,85,247,0.04)", border: "1px solid rgba(168,85,247,0.1)" }}>
                    {zoomedCol.description}
                  </p>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── 装备放大弹窗 ── */}
      <AnimatePresence>
        {zoomedEquip && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(12px)" }}
            onClick={() => setZoomedEquip(null)}>
            <motion.div initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.85, opacity: 0 }}
              transition={{ type: "spring", damping: 18 }}
              className="w-full max-w-xs rounded-3xl overflow-hidden"
              style={{ background: "#fffbf5", border: `2px solid ${RARITY_COLORS[zoomedEquip.rarity]}40`, boxShadow: `0 20px 60px ${RARITY_COLORS[zoomedEquip.rarity]}30` }}
              onClick={e => e.stopPropagation()}>
              {/* 图片区 */}
              <div className="aspect-square w-full" style={{ background: `linear-gradient(135deg, ${RARITY_COLORS[zoomedEquip.rarity]}10, ${RARITY_COLORS[zoomedEquip.rarity]}20)` }}>
                {zoomedEquip.image
                  ? <img src={ipfsToHttp(zoomedEquip.image)} alt={zoomedEquip.name} className="w-full h-full object-contain p-4" />
                  : <div className="w-full h-full flex items-center justify-center text-8xl">{SLOT_ICONS[zoomedEquip.slot]}</div>}
              </div>
              {/* 信息区 */}
              <div className="p-5">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-black text-lg" style={{ color: "#92400e" }}>{zoomedEquip.name}</h3>
                  <button onClick={() => setZoomedEquip(null)} className="p-1 rounded-lg flex-shrink-0 ml-2" style={{ background: "rgba(249,115,22,0.08)", color: "#b45309", cursor: "pointer" }}><X size={14} /></button>
                </div>
                <div className="flex gap-2 mb-3 flex-wrap">
                  <span className="text-xs px-2 py-1 rounded-full font-bold" style={{ background: `${RARITY_COLORS[zoomedEquip.rarity]}18`, color: RARITY_COLORS[zoomedEquip.rarity], border: `1px solid ${RARITY_COLORS[zoomedEquip.rarity]}40` }}>
                    {RARITY_LABELS[zoomedEquip.rarity]}
                  </span>
                  <span className="text-xs px-2 py-1 rounded-full" style={{ background: "rgba(249,115,22,0.08)", color: "#c2410c", border: "1px solid rgba(249,115,22,0.2)" }}>
                    {SLOT_ICONS[zoomedEquip.slot]} {SLOT_LABELS[zoomedEquip.slot]}
                  </span>
                  <span className="text-xs px-2 py-1 rounded-full font-mono" style={{ background: "rgba(249,115,22,0.04)", color: "#d97706" }}>#{zoomedEquip.tokenId}</span>
                </div>
                {zoomedEquip.lore && (
                  <p className="text-xs italic mb-3 p-3 rounded-xl" style={{ color: "#b45309", background: "rgba(249,115,22,0.04)", border: "1px solid rgba(249,115,22,0.08)" }}>
                    「{zoomedEquip.lore}」
                  </p>
                )}
                <div className="grid grid-cols-2 gap-2">
                  {zoomedEquip.rarityBonus > 0 && (
                    <div className="p-2 rounded-xl text-center" style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)" }}>
                      <div className="text-xs" style={{ color: "#d97706" }}>🏆 {isZh ? "稀有加成" : "Rarity"}</div>
                      <div className="text-sm font-black" style={{ color: "#FBBF24" }}>+{(zoomedEquip.rarityBonus / 100).toFixed(1)}%</div>
                    </div>
                  )}
                  {zoomedEquip.carryBonus > 0 && (
                    <div className="p-2 rounded-xl text-center" style={{ background: "rgba(96,165,250,0.08)", border: "1px solid rgba(96,165,250,0.2)" }}>
                      <div className="text-xs" style={{ color: "#3b82f6" }}>🎒 {isZh ? "携带加成" : "Carry"}</div>
                      <div className="text-sm font-black" style={{ color: "#60A5FA" }}>+{(zoomedEquip.carryBonus / 100).toFixed(1)}%</div>
                    </div>
                  )}
                  {zoomedEquip.speedBonus > 0 && (
                    <div className="p-2 rounded-xl text-center" style={{ background: "rgba(52,211,153,0.08)", border: "1px solid rgba(52,211,153,0.2)" }}>
                      <div className="text-xs" style={{ color: "#10b981" }}>💨 {isZh ? "速度加成" : "Speed"}</div>
                      <div className="text-sm font-black" style={{ color: "#34D399" }}>+{(zoomedEquip.speedBonus / 100).toFixed(1)}%</div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[200] px-5 py-3 rounded-2xl text-sm font-bold pointer-events-none"
          style={{ background: "#fffbf5", color: "#92400e", border: "1px solid rgba(249,115,22,0.3)", boxShadow: "0 8px 32px rgba(249,115,22,0.2)" }}>
          {toast}
        </div>
      )}
    </div>
  );
}
