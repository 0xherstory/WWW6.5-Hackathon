// Mentor / Company / Review 详情页用模拟数据

export interface MentorDetail {
  id: string;
  name: string;
  title: string;
  domain: string;
  bio: string;
  rating: number;
  reviewCount: number;
  tags: string[];
  createdAt: string;
  stats: {
    communication: number;
    technical: number;
    responsiveness: number;
    overall: number;
  };
  distribution: { stars: number; count: number; pct: number }[];
  twitter?: string;
  github?: string;
}

export interface CompanyDetail {
  id: string;
  name: string;
  industry: string;
  region: string;
  description: string;
  score: number;
  mentorCount: number;
  reviewCount: number;
  tags: string[];
  createdAt: string;
  stats: {
    culture: number;
    growth: number;
    management: number;
    overall: number;
  };
  distribution: { stars: number; count: number; pct: number }[];
  website?: string;
}

export interface ReviewItem {
  id: string;
  author: string;
  authorAddress: string;
  rating: number;
  date: string;
  comment: string;
  tags: string[];
  txHash?: string;
  // 五个维度评分
  dimScores?: {
    growth: number;      // 成长支持
    clarity: number;     // 目标清晰度
    communication: number; // 沟通质量
    workload: number;    // 工作强度
    respect: number;     // 尊重包容
  };
  companyName?: string;  // 公司名称
  department?: string;  // 部门/业务组
}

export const MOCK_MENTOR_DETAIL: Record<string, MentorDetail> = {
  "m-demo-01": {
    id: "m-demo-01",
    name: "Alex Chen",
    title: "Solidity · DeFi 架构",
    domain: "智能合约 / 安全审计",
    bio: "资深智能合约开发者，专注于 DeFi 协议架构与安全审计。拥有 5 年区块链开发经验，曾参与多个头部 DeFi 项目的合约开发。",
    rating: 4.95,
    reviewCount: 428,
    tags: ["DeFi", "Solidity", "安全审计", "架构设计"],
    createdAt: "2023-06-15",
    stats: { communication: 4.9, technical: 5.0, responsiveness: 4.8, overall: 4.95 },
    distribution: [
      { stars: 5, count: 406, pct: 95 },
      { stars: 4, count: 18, pct: 4 },
      { stars: 3, count: 3, pct: 1 },
      { stars: 2, count: 1, pct: 0 },
      { stars: 1, count: 0, pct: 0 },
    ],
    twitter: "alexchen_eth",
    github: "alexchen-dev",
  },
  "m-demo-02": {
    id: "m-demo-02",
    name: "Jordan Wu",
    title: "全栈 · 链上产品",
    domain: "dApp / 钱包集成",
    bio: "全栈工程师，擅长将 Web2 产品思维带入 Web3。专注 dApp 开发与钱包集成，为多个知名项目提供技术支持。",
    rating: 4.91,
    reviewCount: 356,
    tags: ["dApp", "钱包集成", "前端", "产品设计"],
    createdAt: "2023-08-20",
    stats: { communication: 4.9, technical: 4.85, responsiveness: 4.95, overall: 4.91 },
    distribution: [
      { stars: 5, count: 324, pct: 91 },
      { stars: 4, count: 28, pct: 8 },
      { stars: 3, count: 4, pct: 1 },
      { stars: 2, count: 0, pct: 0 },
      { stars: 1, count: 0, pct: 0 },
    ],
    github: "jordanwu-web3",
  },
  "m-demo-03": {
    id: "m-demo-03",
    name: "Samira Okonkwo",
    title: "密码学 · L2",
    domain: "Rollup / 零知识入门",
    bio: "密码学研究人员，专注于零知识证明与 Layer2 扩容方案。曾发表多篇学术论文，致力于推动 ZK 技术的普及与应用。",
    rating: 4.88,
    reviewCount: 290,
    tags: ["零知识证明", "L2", "密码学", "Rollup"],
    createdAt: "2023-09-01",
    stats: { communication: 4.8, technical: 4.95, responsiveness: 4.85, overall: 4.88 },
    distribution: [
      { stars: 5, count: 258, pct: 89 },
      { stars: 4, count: 27, pct: 9 },
      { stars: 3, count: 5, pct: 2 },
      { stars: 2, count: 0, pct: 0 },
      { stars: 1, count: 0, pct: 0 },
    ],
    github: "samira-zk",
  },
  "m-demo-04": {
    id: "m-demo-04",
    name: "Li Wei",
    title: "Move · 基础设施",
    domain: "节点 / 索引器",
    bio: "Move 语言专家，专注于区块链基础设施与高性能节点开发。为多个公链提供节点运维与索引器搭建支持。",
    rating: 4.85,
    reviewCount: 241,
    tags: ["Move", "节点运维", "索引器", "基础设施"],
    createdAt: "2023-10-10",
    stats: { communication: 4.8, technical: 4.9, responsiveness: 4.85, overall: 4.85 },
    distribution: [
      { stars: 5, count: 208, pct: 86 },
      { stars: 4, count: 28, pct: 12 },
      { stars: 3, count: 5, pct: 2 },
      { stars: 2, count: 0, pct: 0 },
      { stars: 1, count: 0, pct: 0 },
    ],
  },
  "m-demo-05": {
    id: "m-demo-05",
    name: "Noah Park",
    title: "前端 · Web3 UX",
    domain: "RainbowKit / wagmi",
    bio: "专注 Web3 前端开发，React 技术栈深度用户。精通 RainbowKit、wagmi 等主流 Web3 库，致力于提升用户体验。",
    rating: 4.82,
    reviewCount: 198,
    tags: ["React", "RainbowKit", "wagmi", "UX"],
    createdAt: "2023-11-15",
    stats: { communication: 4.85, technical: 4.8, responsiveness: 4.8, overall: 4.82 },
    distribution: [
      { stars: 5, count: 167, pct: 84 },
      { stars: 4, count: 26, pct: 13 },
      { stars: 3, count: 5, pct: 3 },
      { stars: 2, count: 0, pct: 0 },
      { stars: 1, count: 0, pct: 0 },
    ],
  },
};

export const MOCK_COMPANY_DETAIL: Record<string, CompanyDetail> = {
  "c-demo-01": {
    id: "c-demo-01",
    name: "NovaChain Labs",
    industry: "基础设施",
    region: "新加坡",
    description: "NovaChain Labs 是一家专注于区块链基础设施开发的科技公司，致力于为 Web3 开发者提供安全、高效的区块链解决方案。",
    score: 96.4,
    mentorCount: 42,
    reviewCount: 156,
    tags: ["基础设施", "Layer1", "节点服务", "RPC"],
    createdAt: "2022-05-01",
    stats: { culture: 4.9, growth: 4.8, management: 4.7, overall: 96.4 },
    distribution: [
      { stars: 5, count: 140, pct: 90 },
      { stars: 4, count: 12, pct: 8 },
      { stars: 3, count: 4, pct: 2 },
      { stars: 2, count: 0, pct: 0 },
      { stars: 1, count: 0, pct: 0 },
    ],
    website: "novachain.io",
  },
  "c-demo-02": {
    id: "c-demo-02",
    name: "Aurora Guild",
    industry: "开发者教育",
    region: "远程",
    description: "Aurora Guild 是一个去中心化开发者社区，专注于 Web3 人才培养与技术布道。通过线上课程、社群辅导等方式培养新一代区块链开发者。",
    score: 94.8,
    mentorCount: 38,
    reviewCount: 124,
    tags: ["开发者教育", "Web3培训", "社群", "课程"],
    createdAt: "2022-08-15",
    stats: { culture: 4.85, growth: 4.7, management: 4.6, overall: 94.8 },
    distribution: [
      { stars: 5, count: 108, pct: 87 },
      { stars: 4, count: 12, pct: 10 },
      { stars: 3, count: 4, pct: 3 },
      { stars: 2, count: 0, pct: 0 },
      { stars: 1, count: 0, pct: 0 },
    ],
    website: "auroraguild.xyz",
  },
  "c-demo-03": {
    id: "c-demo-03",
    name: "LedgerForge",
    industry: "安全审计",
    region: "香港",
    description: "LedgerForge 是领先的安全审计机构，团队由多位顶尖安全研究员组成。已为超过 50 个项目提供智能合约审计服务，发现并修复数百个高危漏洞。",
    score: 93.1,
    mentorCount: 31,
    reviewCount: 98,
    tags: ["安全审计", "智能合约", "渗透测试", "漏洞修复"],
    createdAt: "2022-03-20",
    stats: { culture: 4.7, growth: 4.6, management: 4.7, overall: 93.1 },
    distribution: [
      { stars: 5, count: 82, pct: 84 },
      { stars: 4, count: 11, pct: 11 },
      { stars: 3, count: 5, pct: 5 },
      { stars: 2, count: 0, pct: 0 },
      { stars: 1, count: 0, pct: 0 },
    ],
  },
  "c-demo-04": {
    id: "c-demo-04",
    name: "Citadel DAO Tools",
    industry: "DAO 工具",
    region: "北美",
    description: "Citadel DAO Tools 提供一站式 DAO 治理工具集，包括投票系统、提案管理、链上签名等核心功能。帮助组织实现透明、高效的链上治理。",
    score: 91.5,
    mentorCount: 27,
    reviewCount: 76,
    tags: ["DAO工具", "投票系统", "提案管理", "治理"],
    createdAt: "2023-01-10",
    stats: { culture: 4.65, growth: 4.5, management: 4.55, overall: 91.5 },
    distribution: [
      { stars: 5, count: 61, pct: 80 },
      { stars: 4, count: 10, pct: 13 },
      { stars: 3, count: 5, pct: 7 },
      { stars: 2, count: 0, pct: 0 },
      { stars: 1, count: 0, pct: 0 },
    ],
  },
  "c-demo-05": {
    id: "c-demo-05",
    name: "Zenith Pay",
    industry: "支付 / RWA",
    region: "欧盟",
    description: "Zenith Pay 致力于构建合规的链上支付基础设施，支持法币与加密货币的无缝转换。专注于 RWA（真实世界资产）代币化与跨境支付场景。",
    score: 90.2,
    mentorCount: 24,
    reviewCount: 65,
    tags: ["支付", "RWA", "合规", "跨境支付"],
    createdAt: "2023-02-28",
    stats: { culture: 4.55, growth: 4.5, management: 4.45, overall: 90.2 },
    distribution: [
      { stars: 5, count: 51, pct: 78 },
      { stars: 4, count: 10, pct: 15 },
      { stars: 3, count: 4, pct: 7 },
      { stars: 2, count: 0, pct: 0 },
      { stars: 1, count: 0, pct: 0 },
    ],
  },
};

export const MOCK_REVIEWS: Record<string, ReviewItem[]> = {
  "m-demo-01": [
    {
      id: "r1",
      author: "匿名用户",
      authorAddress: "0x1234...abcd",
      rating: 5,
      date: "2026-03-28",
      comment: "字节跳动抖音电商运营部，带教超級負責！每周都有1v1的成長沟通，会根据你的能力安排任务，新人也能接触到核心业务。团队氛围特别好，不强制加班，到点就能走。组长是个技术大牛，问啥都耐心解答的那种。",
      tags: ["带教负责", "团队氛围好", "不加班", "成长快"],
      txHash: "0xabcd...1234",
      companyName: "字节跳动",
      department: "抖音电商运营部",
      dimScores: { growth: 5, clarity: 4, communication: 5, workload: 4, respect: 5 },
    },
    {
      id: "r2",
      author: "匿名用户",
      authorAddress: "0x5678...efgh",
      rating: 2,
      date: "2026-03-25",
      comment: "垃圾公司，快跑！入职3个月天天无偿加班，周末还要随时待命，部门领导PUA一套一套的。画的饼一个都没兑现，承诺的13薪拖到现在都没发。已经提离职了，浪费老子时间。",
      tags: ["无偿加班", "PUA", "画饼", "13薪不发"],
      txHash: "0xefgh...5678",
      companyName: "某互联网小厂",
      department: "技术部",
      dimScores: { growth: 1, clarity: 2, communication: 1, workload: 1, respect: 2 },
    },
    {
      id: "r3",
      author: "匿名用户",
      authorAddress: "0x9abc...ijkl",
      rating: 5,
      date: "2026-03-22",
      comment: "腾讯游戏事业部yyds！福利拉满，三餐免费、班车免费、健身房免费，不打卡不强制加班。同事都是大佬而且很友好，新人带教体系特别完善。本废物也能学到东西，感动哭了。",
      tags: ["福利好", "不打卡", "带教完善", "同事友好"],
      txHash: "0xijkl...9abc",
      companyName: "腾讯",
      department: "游戏事业部",
      dimScores: { growth: 5, clarity: 5, communication: 5, workload: 4, respect: 5 },
    },
    {
      id: "r4",
      author: "匿名用户",
      authorAddress: "0xdef0...mnop",
      rating: 1,
      date: "2026-03-18",
      comment: "加班时间长到离谱！天天晚上10点以后才能走，周末还要随时回消息。带教特别没耐心，问个问题就阴阳怪气说这么简单还要问。干了一个月就跑了，身体实在扛不住，钱没赚到命快没了。",
      tags: ["加班多", "带教态度差", "随时待命", "身体扛不住"],
      companyName: "某创业公司",
      department: "市场部",
      dimScores: { growth: 2, clarity: 2, communication: 2, workload: 1, respect: 2 },
    },
    {
      id: "r5",
      author: "匿名用户",
      authorAddress: "0x1111...2222",
      rating: 4,
      date: "2026-03-15",
      comment: "美团到店产品部，整体还行吧。同事都特别nice，没有那些有的没的办公室政治。新人入职有完整的培训体系，带教会手把手教，不会让你瞎摸索。加班不多，基本7点左右就能走。",
      tags: ["氛围好", "培训完善", "不加班", "同事nice"],
      txHash: "0x2222...1111",
      companyName: "美团",
      department: "到店产品部",
      dimScores: { growth: 4, clarity: 5, communication: 4, workload: 4, respect: 4 },
    },
    {
      id: "r6",
      author: "匿名用户",
      authorAddress: "0x3333...4444",
      rating: 3,
      date: "2026-03-10",
      comment: "阿里云待了一年，技術体系确实成熟，流程也规范，适合新人学习。但部门业务方向经常性变，干了半年不知道在做啥。晋升主要看年限和组别，能力不是主要因素。",
      tags: ["体系成熟", "流程规范", "方向迷茫", "晋升难"],
      companyName: "阿里巴巴",
      department: "阿里云",
      dimScores: { growth: 3, clarity: 3, communication: 3, workload: 3, respect: 3 },
    },
    {
      id: "r7",
      author: "匿名用户",
      authorAddress: "0x5555...6666",
      rating: 5,
      date: "2026-03-05",
      comment: "华为无线部门真的可以！5G研发，技术实力强，能接触到行业最前沿的技术。流程文档都完善，适合新人系统性学习。待遇在制造业里算top了，社保公积金拉满。",
      tags: ["技术强", "规范完善", "待遇好", "适合深耕"],
      companyName: "华为",
      department: "无线产品部",
      dimScores: { growth: 4, clarity: 5, communication: 4, workload: 3, respect: 4 },
    },
    {
      id: "r8",
      author: "匿名用户",
      authorAddress: "0x7777...8888",
      rating: 2,
      date: "2026-03-01",
      comment: "快手算法部真的太卷了。晚上10点前走会被leader约谈，OKR定得离谱根本完不成，月底强制加班冲刺。做的事情也很重复单调，核心算法根本接触不到。mentor忙死，根本没时间管新人。",
      tags: ["内卷严重", "OKR压力大", "内容重复", "无指导"],
      companyName: "快手",
      department: "算法推荐部",
      dimScores: { growth: 2, clarity: 2, communication: 2, workload: 1, respect: 2 },
    },
  ],
  "c-demo-01": [
    {
      id: "cr1",
      author: "匿名用户",
      authorAddress: "0xaaaa...bbbb",
      rating: 5,
      date: "2026-03-28",
      comment: "NovaChain Labs 的 RPC 服务用了大半年了，真的稳！延迟比我们之前用的几家都低好多。团队响应也及时，有次凌晨提工单都很快有人回。技术哥专业，沟通起来很顺畅。",
      tags: ["稳定", "低延迟", "专业", "响应快"],
      txHash: "0xbbbb...aaaa",
      companyName: "NovaChain Labs",
      department: "节点服务",
      dimScores: { growth: 5, clarity: 4, communication: 5, workload: 4, respect: 5 },
    },
    {
      id: "cr2",
      author: "匿名用户",
      authorAddress: "0xcccc...dddd",
      rating: 4,
      date: "2026-03-25",
      comment: "节点部署文档写得挺详细的，小白也能跟着教程一步步搞定。出了问题技术支持也能快速定位解决，节省了我们好多时间。基础设施这块确实靠谱。",
      tags: ["文档完善", "技术支持", "可靠", "易上手"],
      txHash: "0xdddd...cccc",
      companyName: "NovaChain Labs",
      department: "技术支持",
      dimScores: { growth: 4, clarity: 5, communication: 5, workload: 4, respect: 4 },
    },
    {
      id: "cr3",
      author: "匿名用户",
      authorAddress: "0xeeee...ffff",
      rating: 3,
      date: "2026-03-20",
      comment: "服务稳定性没话说，但价格确实偏高了一些。之前买的套餐用起来还不错，但想升配发现价格肉疼。建议出更多套餐选择真的会灵活很多。",
      tags: ["价格偏高", "服务好", "灵活度不够"],
      companyName: "NovaChain Labs",
      department: "商务",
      dimScores: { growth: 4, clarity: 3, communication: 4, workload: 4, respect: 4 },
    },
    {
      id: "cr4",
      author: "匿名用户",
      authorAddress: "0x8888...9999",
      rating: 5,
      date: "2026-03-15",
      comment: "跟 NovaChain 合作两年了，一直很稳定。他们对新公链的支持速度也很快，基本新链上线一周内就能接入。售后有问题也积极响应，会推荐给其他兄弟部门。",
      tags: ["长期合作", "更新快", "售后好", "推荐"],
      txHash: "0x9999...8888",
      companyName: "NovaChain Labs",
      department: "生态合作",
      dimScores: { growth: 5, clarity: 5, communication: 4, workload: 5, respect: 5 },
    },
    {
      id: "cr5",
      author: "匿名用户",
      authorAddress: "0x0000...1111",
      rating: 4,
      date: "2026-03-10",
      comment: "API 设计合理，SDK 文档清晰。集成过程比预期顺利太多，没踩什么坑。主要是文档写得好，很多问题看看文档就懂了。会给朋友推荐！",
      tags: ["SDK好用", "文档清晰", "易集成", "推荐"],
      txHash: "0x1111...0000",
      companyName: "NovaChain Labs",
      department: "研发",
      dimScores: { growth: 4, clarity: 5, communication: 4, workload: 4, respect: 4 },
    },
    {
      id: "cr6",
      author: "匿名用户",
      authorAddress: "0x2222...3333",
      rating: 2,
      date: "2026-03-05",
      comment: "说好的99.99%可用性，结果上个月挂了两次。工单响应倒是快，但问题定位花了好几天。期间客户一直在问，我们也很尴尬。希望稳定性方面能再加强吧。",
      tags: ["不稳定", "响应快", "定位慢"],
      companyName: "NovaChain Labs",
      department: "运维",
      dimScores: { growth: 3, clarity: 2, communication: 3, workload: 3, respect: 3 },
    },
    {
      id: "cr7",
      author: "匿名用户",
      authorAddress: "0x4444...5555",
      rating: 5,
      date: "2026-03-01",
      comment: "用他们家 RPC 做链上数据索引，查询速度比之前快了一倍不止。技术文档很全，SDK 也很完善，集成体验很好。价格合理，会继续用。",
      tags: ["速度快", "文档全", "性价比高"],
      txHash: "0x5555...4444",
      companyName: "NovaChain Labs",
      department: "数据组",
      dimScores: { growth: 5, clarity: 5, communication: 4, workload: 4, respect: 5 },
    },
    {
      id: "cr8",
      author: "匿名用户",
      authorAddress: "0x6666...7777",
      rating: 4,
      date: "2026-02-25",
      comment: "节点服务还行吧，中规中矩。主要是他们在业内的口碑比较好，用起来比较放心。偶尔有些小问题但都能及时解决，整体体验还是ok的。",
      tags: ["口碑好", "稳定", "放心"],
      companyName: "NovaChain Labs",
      department: "技术选型",
      dimScores: { growth: 4, clarity: 4, communication: 4, workload: 4, respect: 4 },
    },
  ],
};

export function getMentorReviews(id: string): ReviewItem[] {
  return MOCK_REVIEWS[id] ?? [];
}

export function getCompanyReviews(id: string): ReviewItem[] {
  return MOCK_REVIEWS[id] ?? [];
}