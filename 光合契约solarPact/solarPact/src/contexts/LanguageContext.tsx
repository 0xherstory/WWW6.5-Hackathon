import React, { createContext, useContext, useState, useCallback } from "react";

export type Language = "zh" | "en";

type TranslationKey = keyof typeof translations.zh;

const translations = {
  zh: {
    // Brand
    brand: "光合契约",
    brandEn: "SolarPact",
    tagline: "让女性的成长成为可投资的资产",
    
    // Nav
    navHome: "首页",
    navMarket: "需求市场",
    navCreate: "发布需求",
    navGrowth: "成长追踪",
    navLeaderboard: "排行榜",
    
    // Auth
    connectWallet: "连接钱包",
    disconnect: "断开连接",
    selectRole: "选择角色",
    rolePublisher: "需求发布者",
    rolePartner: "成长伙伴",
    rolePublisherDesc: "发布成长需求，质押奖金",
    rolePartnerDesc: "竞拍成为他人的成长伙伴",
    walletConnected: "已连接",
    loginRequired: "请先登录",
    loginRequiredDesc: "该功能需要连接钱包后使用",
    selectRoleFirst: "请先选择角色",
    selectRoleFirstDesc: "请选择你的角色后再继续操作",
    wrongRole: "角色不匹配",
    wrongRoleDesc: "该功能仅对需求发布者开放，请切换角色后重试。",
    switchRole: "切换角色",
    
    // Landing
    heroTitle1: "让女性的成长",
    heroTitle2: "成为可投资的资产",
    heroDesc: "全球首个「女性勇气预言机」——在这里，恐惧不再是弱点，而是一种可以被验证、被投资、被复利的资产。",
    heroExplore: "探索需求市场",
    heroPublish: "发布我的需求",
    builtOn: "基于 Avalanche 构建",
    
    // Stats
    activeNeeds: "活跃需求",
    growthPartners: "成长伙伴",
    successRate: "契约成功率",
    totalPool: "累计奖金池",
    
    // Features
    fourModules: "四大核心",
    modules: "模块",
    emotionAsset: "情绪资产化",
    emotionAssetDesc: "将情绪结构化，转化为链上可验证的成长任务资产",
    growthNetwork: "成长互助网络",
    growthNetworkDesc: "他人竞拍成为你的成长伙伴，用外部投资驱动行动",
    smartContract: "智能合约保障",
    smartContractDesc: "双向质押 + 自动结算，无需信任第三方",
    onChainRecord: "链上永久记录",
    onChainRecordDesc: "每次行动生成不可转让的成长凭证（SBT）",
    
    // Flow
    coreFlow: "核心",
    flow: "流程",
    step01: "发布需求",
    step01Desc: "创建链上任务，存入奖金",
    step02: "竞拍伙伴",
    step02Desc: "他人竞拍成为成长伙伴",
    step03: "签订契约",
    step03Desc: "智能合约自动锁定质押",
    step04: "执行打卡",
    step04Desc: "每周链上记录成长行为",
    step05: "结果结算",
    step05Desc: "自动分配奖金与NFT",
    
    // Blockchain
    whyBlockchain: "为什么必须用",
    blockchain: "区块链",
    fundCustody: "资金托管",
    antiDefault: "防赖账",
    behaviorRecord: "行为记录",
    antiTamper: "防篡改",
    autoExecute: "自动执行",
    trustless: "无需信任",
    crossPlatform: "跨平台资产",
    nftPermanent: "NFT永久存在",
    
    // CTA
    ctaTitle1: "我们把焦虑，变成了",
    ctaTitle2: "生产力",
    ctaDesc: "这不是一个应用，这是全球第一个「女性勇气预言机」",
    startNow: "立即开始",
    
    // Marketplace
    marketTitle: "需求",
    market: "市场",
    marketDesc: "发现正在等待投资的成长需求",
    searchPlaceholder: "搜索需求...",
    filter: "筛选",
    all: "全部",
    career: "职场",
    relationship: "婚恋",
    self: "自我",
    health: "健康",
    transformation: "转型",
    bidding: "竞拍中",
    inProgress: "进行中",
    joinBid: "参与竞拍",
    viewProgress: "查看进度",
    bids: "竞拍",
    sponsored: "品牌赞助",
    sponsoredChallenge: "赞助挑战",
    
    // Growth
    growthTitle: "成长",
    tracking: "追踪",
    growthPlan: "30天职场转型计划 — 每周链上打卡",
    completed: "完成",
    tasks: "个任务",
    consecutive: "连续",
    days: "天",
    sbtCount: "枚",
    weekLabel: "Week",
    done: "完成",
    onChain: "已上链 ✓",
    submitCheckin: "提交本周打卡",
    
    // Levels
    levelSeed: "🌱 勇气种子",
    levelBreaker: "🔥 破壁者",
    levelConqueror: "⛰️ 征服者",
    
    // Language
    langSwitch: "EN",
    
    // Footer
    copyright: "© 2026 光合契约 SolarPact. Built on Avalanche.",
    footerSlogan: "让女性的成长成为可以被投资的资产",
  },
  en: {
    brand: "SolarPact",
    brandEn: "SolarPact",
    tagline: "Turn women's growth into investable assets",
    
    navHome: "Home",
    navMarket: "Market",
    navCreate: "Create",
    navGrowth: "Growth",
    navLeaderboard: "Leaderboard",
    
    connectWallet: "Connect Wallet",
    disconnect: "Disconnect",
    selectRole: "Select Role",
    rolePublisher: "Demand Publisher",
    rolePartner: "Growth Partner",
    rolePublisherDesc: "Publish growth demands and stake bounties",
    rolePartnerDesc: "Bid to become someone's growth partner",
    walletConnected: "Connected",
    loginRequired: "Login Required",
    loginRequiredDesc: "Please connect your wallet to access this feature",
    selectRoleFirst: "Select Role First",
    selectRoleFirstDesc: "Please select your role before continuing",
    wrongRole: "Wrong Role",
    wrongRoleDesc: "This feature is only available for Demand Publishers. Please switch your role.",
    switchRole: "Switch Role",
    
    heroTitle1: "Turn Women's Growth",
    heroTitle2: "Into Investable Assets",
    heroDesc: "The world's first 'Women's Courage Oracle' — where fear is no longer weakness, but an asset that can be verified, invested in, and compounded.",
    heroExplore: "Explore Market",
    heroPublish: "Publish Demand",
    builtOn: "Built on Avalanche",
    
    activeNeeds: "Active Demands",
    growthPartners: "Growth Partners",
    successRate: "Success Rate",
    totalPool: "Total Pool",
    
    fourModules: "Four Core",
    modules: "Modules",
    emotionAsset: "Emotion Tokenization",
    emotionAssetDesc: "Structure emotions into on-chain verifiable growth task assets",
    growthNetwork: "Growth Network",
    growthNetworkDesc: "Others bid to become your growth partner, driving action through investment",
    smartContract: "Smart Contract Security",
    smartContractDesc: "Dual-staking + auto-settlement, no third-party trust needed",
    onChainRecord: "Permanent On-Chain Record",
    onChainRecordDesc: "Every action generates non-transferable growth credentials (SBT)",
    
    coreFlow: "Core",
    flow: "Process",
    step01: "Publish Demand",
    step01Desc: "Create on-chain task, deposit bounty",
    step02: "Bid for Partner",
    step02Desc: "Others bid to become growth partner",
    step03: "Sign Contract",
    step03Desc: "Smart contract auto-locks stakes",
    step04: "Check-in",
    step04Desc: "Weekly on-chain growth records",
    step05: "Settlement",
    step05Desc: "Auto-distribute bounty & NFT",
    
    whyBlockchain: "Why Must We Use",
    blockchain: "Blockchain",
    fundCustody: "Fund Custody",
    antiDefault: "Anti-default",
    behaviorRecord: "Behavior Record",
    antiTamper: "Anti-tamper",
    autoExecute: "Auto Execute",
    trustless: "Trustless",
    crossPlatform: "Cross-platform Assets",
    nftPermanent: "NFT Permanence",
    
    ctaTitle1: "We turned anxiety into",
    ctaTitle2: "productivity",
    ctaDesc: "This is not an app — it's the world's first 'Women's Courage Oracle'",
    startNow: "Start Now",
    
    marketTitle: "Demand",
    market: "Market",
    marketDesc: "Discover growth demands waiting for investment",
    searchPlaceholder: "Search demands...",
    filter: "Filter",
    all: "All",
    career: "Career",
    relationship: "Relationship",
    self: "Self",
    health: "Health",
    transformation: "Transformation",
    bidding: "Bidding",
    inProgress: "In Progress",
    joinBid: "Join Bid",
    viewProgress: "View Progress",
    bids: "Bids",
    sponsored: "Sponsored",
    sponsoredChallenge: "Sponsored Challenge",
    
    growthTitle: "Growth",
    tracking: "Tracking",
    growthPlan: "30-Day Career Transformation — Weekly On-Chain Check-ins",
    completed: "Completed",
    tasks: "tasks",
    consecutive: "Streak",
    days: "days",
    sbtCount: "",
    weekLabel: "Week",
    done: "done",
    onChain: "On-chain ✓",
    submitCheckin: "Submit Weekly Check-in",
    
    levelSeed: "🌱 Courage Seed",
    levelBreaker: "🔥 Breaker",
    levelConqueror: "⛰️ Conqueror",
    
    langSwitch: "中文",
    
    copyright: "© 2026 SolarPact 光合契约. Built on Avalanche.",
    footerSlogan: "Turn women's growth into investable assets",
  },
} as const;

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey) => string;
  toggleLanguage: () => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>("zh");

  const t = useCallback(
    (key: TranslationKey): string => {
      return translations[language][key] || key;
    },
    [language]
  );

  const toggleLanguage = useCallback(() => {
    setLanguage((prev) => (prev === "zh" ? "en" : "zh"));
  }, []);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, toggleLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used within LanguageProvider");
  return context;
};
