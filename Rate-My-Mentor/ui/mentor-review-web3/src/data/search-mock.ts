// 三级层级搜索结果类型定义

export type ReviewPreview = {
  id: string;
  rating: number;
  date: string;
  comment: string;
  tags: string[];
  department?: string;
  isPositive: boolean;
};

export type SearchMentorResult = {
  id: string;
  name: string;
  title: string;
  domain: string;
  rating: number;
  reviewCount: number;
  companyId?: string;
  companyName?: string;
  dimScores?: number[]; // 5个维度评分
};

// 业务组
export type BusinessGroup = {
  id: string;
  name: string;
  avgScore: number;
  reviewCount: number;
  tags: string[];
};

// 部门
export type Department = {
  id: string;
  name: string;
  avgScore: number;
  reviewCount: number;
  tags: string[];
  businessGroups: BusinessGroup[];
};

// 公司搜索结果（含三级层级）
export type SearchCompanyResult = {
  id: string;
  name: string;
  industry: string;
  region: string;
  score: number;
  reviewCount: number;
  mentorCount: number;
  departments: Department[];
  previewReviews?: ReviewPreview[]; // 预览评价
};

// 筛选选项
export type FilterOption = {
  value: string;
  label: string;
  count: number;
};

// 排序选项
export type SortOption = {
  value: "relevance" | "score_desc" | "review_desc" | "name_asc";
  label: string;
};

// 模拟数据 - 带三级层级的公司
export const MOCK_SEARCH_COMPANIES_WITH_HIERARCHY: SearchCompanyResult[] = [
  {
    id: "c-nova-01",
    name: "NovaChain Labs",
    industry: "基础设施",
    region: "新加坡",
    score: 96.4,
    reviewCount: 1247,
    mentorCount: 42,
    departments: [
      {
        id: "d-1",
        name: "核心协议组",
        avgScore: 4.92,
        reviewCount: 486,
        tags: ["EVM", "共识机制"],
        businessGroups: [
          { id: "bg-1", name: "共识算法", avgScore: 4.95, reviewCount: 189, tags: ["PoS", "BFT"] },
          { id: "bg-2", name: "虚拟机", avgScore: 4.88, reviewCount: 156, tags: ["EVM", "Gas优化"] },
          { id: "bg-3", name: "网络层", avgScore: 4.91, reviewCount: 141, tags: ["P2P", "RPC"] },
        ],
      },
      {
        id: "d-2",
        name: "DeFi 产品组",
        avgScore: 4.87,
        reviewCount: 412,
        tags: ["AMM", "借贷"],
        businessGroups: [
          { id: "bg-4", name: "DEX", avgScore: 4.89, reviewCount: 234, tags: ["AMM", "流动性"] },
          { id: "bg-5", name: "借贷协议", avgScore: 4.85, reviewCount: 178, tags: ["Compound", "Aave"] },
        ],
      },
      {
        id: "d-3",
        name: "开发者关系",
        avgScore: 4.78,
        reviewCount: 349,
        tags: ["文档", "SDK"],
        businessGroups: [
          { id: "bg-6", name: "技术文档", avgScore: 4.76, reviewCount: 189, tags: ["API", "教程"] },
          { id: "bg-7", name: "SDK开发", avgScore: 4.80, reviewCount: 160, tags: ["JavaScript", "Rust"] },
        ],
      },
    ],
    previewReviews: [
      {
        id: "sr1",
        rating: 5,
        date: "2026-03-28",
        comment: "核心协议组工作氛围特别专业，团队成员都是行业顶尖的大牛。leader非常愿意带新人，每周都有技术分享会，能学到最前沿的区块链知识。",
        tags: ["团队专业", "技术氛围好", "福利好"],
        department: "核心协议组",
        isPositive: true,
      },
      {
        id: "sr2",
        rating: 2,
        date: "2026-03-12",
        comment: "技术氛围确实好，但是加班太严重了。天天晚上10点以后才能走，周末还要随时待命。leader PUA 严重，说什么年轻时候不拼命什么时候拼命。",
        tags: ["加班多", "PUA", "画饼"],
        department: "核心协议组",
        isPositive: false,
      },
    ],
  },
  {
    id: "c-aurora-01",
    name: "Aurora Guild",
    industry: "开发者教育",
    region: "远程",
    score: 94.8,
    reviewCount: 892,
    mentorCount: 38,
    departments: [
      {
        id: "d-4",
        name: "Web3 入门",
        avgScore: 4.85,
        reviewCount: 356,
        tags: ["入门", "以太坊"],
        businessGroups: [
          { id: "bg-8", name: "Solidity 基础", avgScore: 4.88, reviewCount: 198, tags: ["智能合约", "入门"] },
          { id: "bg-9", name: "前端集成", avgScore: 4.82, reviewCount: 158, tags: ["wagmi", "RainbowKit"] },
        ],
      },
      {
        id: "d-5",
        name: "进阶课程",
        avgScore: 4.79,
        reviewCount: 298,
        tags: ["DeFi", "安全"],
        businessGroups: [
          { id: "bg-10", name: "DeFi 协议开发", avgScore: 4.81, reviewCount: 167, tags: ["AMM", "借贷"] },
          { id: "bg-11", name: "安全审计入门", avgScore: 4.77, reviewCount: 131, tags: ["静态分析", "常见漏洞"] },
        ],
      },
    ],
    previewReviews: [
      {
        id: "sr3",
        rating: 5,
        date: "2026-03-25",
        comment: "Web3入门课程质量很高，老师讲解清晰，从基础到实战循序渐进。适合零基础入门，课后还有Discord社群答疑。",
        tags: ["课程好", "讲解清晰", "社群答疑"],
        department: "Web3 入门",
        isPositive: true,
      },
      {
        id: "sr4",
        rating: 3,
        date: "2026-03-15",
        comment: "进阶课程内容不错，但是节奏太快了。很多概念一笔带过，基础不扎实的同学听起来会很吃力。",
        tags: ["节奏快", "内容深", "适合进阶"],
        department: "进阶课程",
        isPositive: false,
      },
    ],
  },
  {
    id: "c-ledger-01",
    name: "LedgerForge",
    industry: "安全审计",
    region: "香港",
    score: 93.1,
    reviewCount: 654,
    mentorCount: 31,
    departments: [
      {
        id: "d-6",
        name: "智能合约审计",
        avgScore: 4.91,
        reviewCount: 412,
        tags: ["审计", "安全"],
        businessGroups: [
          { id: "bg-12", name: "DeFi 审计", avgScore: 4.93, reviewCount: 234, tags: ["协议审计", "代币"] },
          { id: "bg-13", name: "NFT 审计", avgScore: 4.89, reviewCount: 178, tags: ["ERC-721", "ERC-1155"] },
        ],
      },
      {
        id: "d-7",
        name: "渗透测试",
        avgScore: 4.85,
        reviewCount: 242,
        tags: ["渗透", "红队"],
        businessGroups: [
          { id: "bg-14", name: "链上分析", avgScore: 4.86, reviewCount: 142, tags: ["MEV", "套利"] },
        ],
      },
    ],
    previewReviews: [
      {
        id: "sr5",
        rating: 5,
        date: "2026-03-22",
        comment: "智能合约审计团队非常专业，代码review很严格。能学到很多安全审计技巧，对以后自己写合约帮助很大。",
        tags: ["专业", "学得多", "有帮助"],
        department: "智能合约审计",
        isPositive: true,
      },
      {
        id: "sr6",
        rating: 2,
        date: "2026-03-10",
        comment: "工作压力太大了，项目周期紧，经常加班到深夜。leader只关注进度，不关心团队成员的身体健康。",
        tags: ["压力大", "加班多", "不顾健康"],
        department: "智能合约审计",
        isPositive: false,
      },
    ],
  },
  {
    id: "c-chainforge-01",
    name: "ChainForge Inc",
    industry: "基础设施",
    region: "旧金山",
    score: 95.1,
    reviewCount: 1089,
    mentorCount: 55,
    departments: [
      {
        id: "d-8",
        name: "节点服务",
        avgScore: 4.90,
        reviewCount: 534,
        tags: ["RPC", "归档节点"],
        businessGroups: [
          { id: "bg-15", name: "RPC 服务", avgScore: 4.92, reviewCount: 312, tags: ["高可用", "全球部署"] },
          { id: "bg-16", name: "索引服务", avgScore: 4.88, reviewCount: 222, tags: ["The Graph", "子图"] },
        ],
      },
    ],
    previewReviews: [
      {
        id: "sr7",
        rating: 5,
        date: "2026-03-20",
        comment: "RPC服务非常稳定，全球节点覆盖广，延迟很低。技术支持响应及时，有专属技术客户经理。",
        tags: ["稳定", "延迟低", "服务好"],
        department: "节点服务",
        isPositive: true,
      },
      {
        id: "sr8",
        rating: 3,
        date: "2026-03-08",
        comment: "索引服务文档不够完善，有些API没有示例代码。工单响应有时候要2-3天，紧急问题处理不及时。",
        tags: ["文档差", "响应慢", "API不全"],
        department: "节点服务",
        isPositive: false,
      },
    ],
  },
  {
    id: "c-eth-asia-01",
    name: "Ethereum Foundation Asia",
    industry: "基础设施",
    region: "新加坡",
    score: 97.8,
    reviewCount: 2156,
    mentorCount: 68,
    departments: [
      {
        id: "d-9",
        name: "核心研究",
        avgScore: 4.95,
        reviewCount: 876,
        tags: ["研究", "EIP"],
        businessGroups: [
          { id: "bg-17", name: "EVM 改进", avgScore: 4.96, reviewCount: 423, tags: ["EIP", " gas优化"] },
          { id: "bg-18", name: "共识研究", avgScore: 4.94, reviewCount: 312, tags: ["PoS", "Casper"] },
          { id: "bg-19", name: "Layer2 研究", avgScore: 4.95, reviewCount: 141, tags: ["ZK", "Optimistic"] },
        ],
      },
    ],
    previewReviews: [
      {
        id: "sr9",
        rating: 5,
        date: "2026-03-28",
        comment: "在这里工作是最接近以太坊核心的机会，能参与EIP讨论和实现。团队氛围开放，可以直接和Vitalik等大神交流。",
        tags: ["核心", "开放", "成长快"],
        department: "核心研究",
        isPositive: true,
      },
      {
        id: "sr10",
        rating: 4,
        date: "2026-03-18",
        comment: "研究工作很有挑战性，需要扎实的密码学和计算机基础。福利待遇顶级，但工作强度也不低。",
        tags: ["挑战", "福利好", "强度高"],
        department: "核心研究",
        isPositive: true,
      },
    ],
  },
  {
    id: "c-web3-acad-01",
    name: "Web3 Academy",
    industry: "开发者教育",
    region: "伦敦",
    score: 93.7,
    reviewCount: 756,
    mentorCount: 48,
    departments: [],
    previewReviews: [
      {
        id: "sr11",
        rating: 4,
        date: "2026-03-22",
        comment: "课程体系完善，从入门到高级都有覆盖。导师都是业界资深工程师，讲课风格幽默易懂。",
        tags: ["完善", "专业", "易懂"],
        isPositive: true,
      },
      {
        id: "sr12",
        rating: 3,
        date: "2026-03-12",
        comment: "课程价格偏贵，性价比一般。实战项目偏少，更多是理论讲解。找工作时发现和市场需求有脱节。",
        tags: ["价格贵", "实战少", "脱节"],
        isPositive: false,
      },
    ],
  },
  {
    id: "c-secu-01",
    name: "SecuChain Labs",
    industry: "安全审计",
    region: "特拉维夫",
    score: 94.2,
    reviewCount: 534,
    mentorCount: 36,
    departments: [],
    previewReviews: [
      {
        id: "sr13",
        rating: 5,
        date: "2026-03-25",
        comment: "安全审计水平一流，项目经验丰富的审计师很多。能接触到各种新型协议，成长很快。",
        tags: ["一流", "经验多", "成长快"],
        isPositive: true,
      },
      {
        id: "sr14",
        rating: 2,
        date: "2026-03-05",
        comment: "团队内部竞争激烈，资源分配不均。核心组拿好项目，边缘组只能做辅助工作。晋升机制不透明。",
        tags: ["竞争激烈", "不公", "晋升难"],
        isPositive: false,
      },
    ],
  },
];

// 模拟导师数据
export const MOCK_SEARCH_MENTORS: SearchMentorResult[] = [
  { id: "m-alex-01", name: "Alex Chen", title: "Solitiy · DeFi 架构", domain: "智能合约 / 安全审计", rating: 4.95, reviewCount: 428, companyId: "c-nova-01", companyName: "NovaChain Labs", dimScores: [4.9, 4.8, 4.9, 4.7, 5.0] },
  { id: "m-jordan-01", name: "Jordan Wu", title: "全栈 · 链上产品", domain: "dApp / 钱包集成", rating: 4.91, reviewCount: 356, companyId: "c-aurora-01", companyName: "Aurora Guild", dimScores: [4.8, 4.9, 4.8, 4.9, 4.9] },
  { id: "m-samira-01", name: "Samira Okonkwo", title: "密码学 · L2", domain: "Rollup / 零知识入门", rating: 4.88, reviewCount: 290, companyId: "c-nova-01", companyName: "NovaChain Labs", dimScores: [4.9, 4.7, 4.8, 4.9, 4.9] },
  { id: "m-liwei-01", name: "Li Wei", title: "Move · 基础设施", domain: "节点 / 索引器", rating: 4.85, reviewCount: 241, companyId: "c-chainforge-01", companyName: "ChainForge Inc", dimScores: [4.8, 4.9, 4.7, 4.8, 4.9] },
  { id: "m-noah-01", name: "Noah Park", title: "前端 · Web3 UX", domain: "RainbowKit / wagmi", rating: 4.82, reviewCount: 198, companyId: "c-aurora-01", companyName: "Aurora Guild", dimScores: [4.7, 4.8, 4.9, 4.8, 4.8] },
  { id: "m-elena-01", name: "Elena Rossi", title: "代币经济 · 治理", domain: "DAO / 激励设计", rating: 4.79, reviewCount: 176, companyId: "c-ledger-01", companyName: "LedgerForge", dimScores: [4.8, 4.9, 4.7, 4.8, 4.7] },
  { id: "m-marcus-01", name: "Marcus Bell", title: "安全 · 渗透", domain: "审计前置 / 漏洞赏金", rating: 4.76, reviewCount: 154, companyId: "c-ledger-01", companyName: "LedgerForge", dimScores: [4.9, 4.6, 4.8, 4.7, 4.8] },
  { id: "m-vitalik-01", name: "Vitalik Dev", title: "以太坊核心开发", domain: "EVM / 共识机制", rating: 4.98, reviewCount: 892, companyId: "c-eth-asia-01", companyName: "Ethereum Foundation Asia", dimScores: [5.0, 4.9, 5.0, 4.9, 5.0] },
  { id: "m-defi-master-01", name: "DeFi Master", title: "DeFi 协议设计", domain: "AMM / 借贷", rating: 4.92, reviewCount: 567, companyId: "c-nova-01", companyName: "NovaChain Labs", dimScores: [4.9, 4.8, 4.9, 4.8, 4.9] },
  { id: "m-yuki-01", name: "Yuki Tanaka", title: "NFT · 游戏化", domain: "动态 NFT / 元数据", rating: 4.73, reviewCount: 132, companyId: "c-ledger-01", companyName: "LedgerForge", dimScores: [4.6, 4.7, 4.8, 4.7, 4.8] },
];

// 搜索函数 - 支持公司名称/部门/业务组/导师名字全维度模糊搜索
export function searchCompanies(query: string): SearchCompanyResult[] {
  if (!query.trim()) return MOCK_SEARCH_COMPANIES_WITH_HIERARCHY;

  const q = query.toLowerCase();

  return MOCK_SEARCH_COMPANIES_WITH_HIERARCHY.filter((company) => {
    // 匹配公司名称
    if (company.name.toLowerCase().includes(q)) return true;
    // 匹配行业
    if (company.industry.toLowerCase().includes(q)) return true;
    // 匹配部门名称
    if (company.departments?.some(d => d.name.toLowerCase().includes(q))) return true;
    // 匹配业务组名称
    if (company.departments?.some(d => d.businessGroups?.some(bg => bg.name.toLowerCase().includes(q)))) return true;
    return false;
  }).map(company => {
    // 过滤匹配到的部门/业务组
    const filteredDeps = company.departments?.map(dep => ({
      ...dep,
      businessGroups: dep.businessGroups?.filter(bg =>
        bg.name.toLowerCase().includes(q) || q.length < 2
      )
    })).filter(dep =>
      dep.name.toLowerCase().includes(q) ||
      dep.businessGroups?.some(bg => bg.name.toLowerCase().includes(q)) ||
      q.length < 2
    );

    return {
      ...company,
      departments: filteredDeps
    };
  });
}

export function searchMentors(query: string): SearchMentorResult[] {
  if (!query.trim()) return MOCK_SEARCH_MENTORS;

  const q = query.toLowerCase();
  return MOCK_SEARCH_MENTORS.filter(
    (m) =>
      m.name.toLowerCase().includes(q) ||
      m.title.toLowerCase().includes(q) ||
      m.domain.toLowerCase().includes(q) ||
      m.companyName?.toLowerCase().includes(q)
  );
}

// 获取行业筛选选项
export function getIndustryFilters(companies: SearchCompanyResult[]): FilterOption[] {
  const industryMap = new Map<string, number>();
  companies.forEach(c => {
    industryMap.set(c.industry, (industryMap.get(c.industry) || 0) + 1);
  });
  return Array.from(industryMap.entries()).map(([value, count]) => ({
    value,
    label: value,
    count
  }));
}

// 获取地区筛选选项
export function getRegionFilters(companies: SearchCompanyResult[]): FilterOption[] {
  const regionMap = new Map<string, number>();
  companies.forEach(c => {
    regionMap.set(c.region, (regionMap.get(c.region) || 0) + 1);
  });
  return Array.from(regionMap.entries()).map(([value, count]) => ({
    value,
    label: value,
    count
  }));
}

// 获取导师领域筛选选项
export function getDomainFilters(mentors: SearchMentorResult[]): FilterOption[] {
  const domainMap = new Map<string, number>();
  mentors.forEach(m => {
    const domains = m.domain.split(/[/,]/).map(d => d.trim());
    domains.forEach(d => {
      if (d) domainMap.set(d, (domainMap.get(d) || 0) + 1);
    });
  });
  return Array.from(domainMap.entries()).map(([value, count]) => ({
    value,
    label: value,
    count
  })).slice(0, 10);
}
