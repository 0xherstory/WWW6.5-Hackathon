"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAccount } from "wagmi";
import {
  ArrowUpRight,
  Building2,
  Calendar,
  Search,
  Star,
  Users,
  ChevronDown,
  ChevronRight,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { RadarChart } from "@/components/common/radar-chart";
import { MOCK_TOP_COMPANIES } from "@/data/home-mock";
import { cn } from "@/lib/utils";

// =====================
// 类型定义
// =====================

// 5个维度定义
const DIM_LABELS = [
  { en: "Growth Support", zh: "成长支持", key: "growth" as const },
  { en: "Expectation Clarity", zh: "预期清晰度", key: "clarity" as const },
  { en: "Communication Quality", zh: "沟通质量", key: "communication" as const },
  { en: "Workload Sustainability", zh: "工作强度", key: "workload" as const },
  { en: "Respect & Inclusion", zh: "尊重与包容", key: "respect" as const },
];

// 企业类型
interface CompanySearchResult {
  id: string;
  name: string;
  industry: string;
  region: string;
  score: number;
  reviewCount: number;
  departmentCount: number;
  departments: DepartmentInfo[];
  icon?: string;
}

interface DepartmentInfo {
  id: string;
  name: string;
  avgScore: number;
  reviewCount: number;
  tags: string[];
  businessGroups: BusinessGroupInfo[];
}

interface BusinessGroupInfo {
  id: string;
  name: string;
  avgScore: number;
  reviewCount: number;
}

// 评价类型
interface ReviewSearchResult {
  id: string;
  companyId: string;
  companyName: string;
  title: string;
  department: string;
  rating: number;
  date: string;
  comment: string;
  tags: string[];
  dimScores: {
    growth: number;
    clarity: number;
    communication: number;
    workload: number;
    respect: number;
  };
  isPositive: boolean;
}

// =====================
// 模拟数据
// =====================

// 企业数据
const MOCK_SEARCH_COMPANIES: CompanySearchResult[] = [
  {
    id: "c-nova-01",
    name: "NovaChain Labs",
    industry: "基础设施",
    region: "新加坡",
    score: 96.4,
    reviewCount: 1247,
    departmentCount: 3,
    departments: [
      { id: "d1", name: "核心协议组", avgScore: 4.92, reviewCount: 486, tags: ["EVM", "共识机制"], businessGroups: [
        { id: "bg1", name: "共识算法", avgScore: 4.95, reviewCount: 189 },
        { id: "bg2", name: "虚拟机", avgScore: 4.88, reviewCount: 156 },
      ]},
      { id: "d2", name: "DeFi 产品组", avgScore: 4.87, reviewCount: 412, tags: ["AMM", "借贷"], businessGroups: [
        { id: "bg3", name: "DEX", avgScore: 4.89, reviewCount: 234 },
      ]},
      { id: "d3", name: "开发者关系", avgScore: 4.78, reviewCount: 349, tags: ["文档", "SDK"], businessGroups: [] },
    ],
  },
  {
    id: "c-bytedance-01",
    name: "字节跳动",
    industry: "互联网",
    region: "北京",
    score: 92.3,
    reviewCount: 2156,
    departmentCount: 5,
    departments: [
      { id: "d4", name: "商业化产品部", avgScore: 4.85, reviewCount: 567, tags: ["广告", "产品"], businessGroups: [
        { id: "bg4", name: "广告产品组", avgScore: 4.88, reviewCount: 312 },
        { id: "bg5", name: "电商产品组", avgScore: 4.82, reviewCount: 255 },
      ]},
      { id: "d5", name: "抖音电商", avgScore: 4.79, reviewCount: 423, tags: ["电商", "直播"], businessGroups: [] },
    ],
  },
  {
    id: "c-alibaba-01",
    name: "阿里巴巴",
    industry: "互联网",
    region: "杭州",
    score: 91.5,
    reviewCount: 1876,
    departmentCount: 4,
    departments: [
      { id: "d6", name: "淘宝直播部", avgScore: 4.65, reviewCount: 345, tags: ["直播", "电商"], businessGroups: [
        { id: "bg6", name: "运营组", avgScore: 4.62, reviewCount: 189 },
      ]},
      { id: "d7", name: "阿里云", avgScore: 4.88, reviewCount: 534, tags: ["云计算", "B端"], businessGroups: [] },
    ],
  },
  {
    id: "c-aurora-01",
    name: "Aurora Guild",
    industry: "开发者教育",
    region: "远程",
    score: 94.8,
    reviewCount: 892,
    departmentCount: 2,
    departments: [
      { id: "d8", name: "Web3 入门", avgScore: 4.85, reviewCount: 356, tags: ["入门", "以太坊"], businessGroups: [
        { id: "bg7", name: "Solidity 基础", avgScore: 4.88, reviewCount: 198 },
      ]},
    ],
  },
  {
    id: "c-tencent-01",
    name: "腾讯",
    industry: "互联网",
    region: "深圳",
    score: 93.8,
    reviewCount: 3245,
    departmentCount: 6,
    departments: [
      { id: "d9", name: "微信支付部", avgScore: 4.75, reviewCount: 678, tags: ["支付", "金融"], businessGroups: [
        { id: "bg8", name: "支付产品组", avgScore: 4.78, reviewCount: 356 },
      ]},
    ],
  },
  {
    id: "c-meituan-01",
    name: "美团",
    industry: "本地生活",
    region: "北京",
    score: 89.2,
    reviewCount: 1567,
    departmentCount: 4,
    departments: [
      { id: "d10", name: "到店业务部", avgScore: 4.68, reviewCount: 456, tags: ["到店", "O2O"], businessGroups: [] },
    ],
  },
  {
    id: "c-didi-01",
    name: "滴滴",
    industry: "出行",
    region: "北京",
    score: 87.5,
    reviewCount: 987,
    departmentCount: 3,
    departments: [
      { id: "d11", name: "出行事业部", avgScore: 4.55, reviewCount: 345, tags: ["出行", "调度"], businessGroups: [] },
    ],
  },
  {
    id: "c-kuaishou-01",
    name: "快手",
    industry: "短视频",
    region: "北京",
    score: 90.1,
    reviewCount: 1234,
    departmentCount: 4,
    departments: [
      { id: "d12", name: "算法推荐部", avgScore: 4.72, reviewCount: 567, tags: ["算法", "推荐"], businessGroups: [] },
    ],
  },
  {
    id: "c-antgroup-01",
    name: "蚂蚁集团",
    industry: "金融科技",
    region: "杭州",
    score: 94.5,
    reviewCount: 2156,
    departmentCount: 5,
    departments: [
      { id: "d13", name: "支付技术部", avgScore: 4.88, reviewCount: 678, tags: ["支付", "安全"], businessGroups: [] },
    ],
  },
  {
    id: "c-baidu-01",
    name: "百度",
    industry: "搜索/AI",
    region: "北京",
    score: 88.3,
    reviewCount: 1432,
    departmentCount: 4,
    departments: [
      { id: "d14", name: "AI产品部", avgScore: 4.65, reviewCount: 345, tags: ["AI", "大模型"], businessGroups: [] },
    ],
  },
  {
    id: "c-xiaomi-01",
    name: "小米",
    industry: "硬件/IoT",
    region: "北京",
    score: 86.7,
    reviewCount: 876,
    departmentCount: 3,
    departments: [
      { id: "d15", name: "手机产品部", avgScore: 4.52, reviewCount: 234, tags: ["手机", "硬件"], businessGroups: [] },
    ],
  },
  {
    id: "c-huawei-01",
    name: "华为",
    industry: "通信/硬件",
    region: "深圳",
    score: 91.8,
    reviewCount: 1876,
    departmentCount: 5,
    departments: [
      { id: "d16", name: "无线产品部", avgScore: 4.82, reviewCount: 567, tags: ["5G", "通信"], businessGroups: [] },
    ],
  },
  {
    id: "c-ledger-01",
    name: "LedgerForge",
    industry: "安全审计",
    region: "香港",
    score: 93.1,
    reviewCount: 654,
    departmentCount: 2,
    departments: [
      { id: "d17", name: "智能合约审计", avgScore: 4.91, reviewCount: 412, tags: ["审计", "安全"], businessGroups: [] },
    ],
  },
  {
    id: "c-eth-asia-01",
    name: "Ethereum Foundation Asia",
    industry: "基础设施",
    region: "新加坡",
    score: 97.8,
    reviewCount: 2156,
    departmentCount: 3,
    departments: [
      { id: "d18", name: "核心研究", avgScore: 4.95, reviewCount: 876, tags: ["EVM", "EIP"], businessGroups: [] },
    ],
  },
  {
    id: "c-chainforge-01",
    name: "ChainForge Inc",
    industry: "基础设施",
    region: "旧金山",
    score: 95.1,
    reviewCount: 1089,
    departmentCount: 2,
    departments: [
      { id: "d19", name: "节点服务", avgScore: 4.90, reviewCount: 534, tags: ["RPC", "索引"], businessGroups: [] },
    ],
  },
];

// 评价数据
const MOCK_SEARCH_REVIEWS: ReviewSearchResult[] = [
  {
    id: "r1",
    companyId: "c-nova-01",
    companyName: "NovaChain Labs",
    title: "核心协议工程师",
    department: "核心协议组",
    rating: 10,
    date: "2026-03-28",
    comment: "技术氛围特别专业，团队成员都是行业顶尖的大牛。leader非常愿意带新人，每周都有技术分享会，能学到最前沿的区块链知识。福利待遇也不错，弹性工作制，不强制加班。",
    tags: ["团队专业", "技术氛围好", "福利好"],
    dimScores: { growth: 5, clarity: 5, communication: 5, workload: 4, respect: 5 },
    isPositive: true,
  },
  {
    id: "r2",
    companyId: "c-bytedance-01",
    companyName: "字节跳动",
    title: "商业化产品经理",
    department: "商业化产品部",
    rating: 9,
    date: "2026-03-27",
    comment: "带教超级负责，每周都有1v1的成长沟通，会给新人安排循序渐进的任务，能真正学到东西，团队氛围也很好，不强制加班，到点就能走。",
    tags: ["带教负责", "成长快", "氛围好"],
    dimScores: { growth: 5, clarity: 4, communication: 5, workload: 4, respect: 5 },
    isPositive: true,
  },
  {
    id: "r3",
    companyId: "c-alibaba-01",
    companyName: "阿里巴巴",
    title: "直播运营",
    department: "淘宝直播部",
    rating: 3,
    date: "2026-03-26",
    comment: "垃圾公司，快跑！入职谈好的薪资，转正直接打8折，问就是公司效益不好，天天画饼就是不兑现。部门leader PUA严重，周末经常强制加班开会。",
    tags: ["薪资克扣", "PUA", "强制加班"],
    dimScores: { growth: 2, clarity: 1, communication: 2, workload: 1, respect: 1 },
    isPositive: false,
  },
  {
    id: "r4",
    companyId: "c-aurora-01",
    companyName: "Aurora Guild",
    title: "课程研发工程师",
    department: "Web3 入门",
    rating: 9,
    date: "2026-03-25",
    comment: "团队氛围超级好，没有办公室政治，大家都是就事论事。leader很尊重下属的想法，不会瞎指挥。工作内容很有意义，能帮助更多开发者入门Web3。",
    tags: ["氛围好", "尊重想法", "有意义"],
    dimScores: { growth: 5, clarity: 4, communication: 5, workload: 4, respect: 5 },
    isPositive: true,
  },
  {
    id: "r5",
    companyId: "c-bytedance-01",
    companyName: "字节跳动",
    title: "算法工程师",
    department: "商业化产品部",
    rating: 5,
    date: "2026-03-24",
    comment: "部门内部派系斗争严重，核心业务组歧视外包人员，干一样的活外包正式员工两个价。需求一会一个变，改了十几遍最后用第一版。报销流程麻烦死了。",
    tags: ["派系斗争", "外包歧视", "需求乱改"],
    dimScores: { growth: 3, clarity: 2, communication: 2, workload: 3, respect: 2 },
    isPositive: false,
  },
  {
    id: "r6",
    companyId: "c-nova-01",
    companyName: "NovaChain Labs",
    title: "DeFi 产品经理",
    department: "DeFi 产品组",
    rating: 8,
    date: "2026-03-23",
    comment: "业务节奏快，但是能学到真东西。同事都很专业，代码review很严格，帮助养成了很好的编码习惯。mentor制度完善，新人有人带。",
    tags: ["代码质量高", "同事专业", "mentor制度好"],
    dimScores: { growth: 4, clarity: 4, communication: 5, workload: 3, respect: 4 },
    isPositive: true,
  },
  {
    id: "r7",
    companyId: "c-tencent-01",
    companyName: "腾讯",
    title: "微信产品经理",
    department: "微信支付部",
    rating: 7,
    date: "2026-03-22",
    comment: "平台大，资源多，能接触到核心业务。团队氛围还行，年轻化沟通顺畅。偶尔加班有加班费，福利待遇在互联网里算中上。",
    tags: ["平台大", "资源多", "氛围好"],
    dimScores: { growth: 4, clarity: 4, communication: 4, workload: 3, respect: 4 },
    isPositive: true,
  },
  {
    id: "r8",
    companyId: "c-alibaba-01",
    companyName: "阿里巴巴",
    title: "Java开发工程师",
    department: "阿里云",
    rating: 6,
    date: "2026-03-21",
    comment: "技术体系成熟，流程规范，适合新人学习。但部门业务方向经常变，干了半年不知道在做啥。晋升主要看年限，能力不是主要因素。",
    tags: ["体系成熟", "流程规范", "方向迷茫"],
    dimScores: { growth: 3, clarity: 3, communication: 3, workload: 3, respect: 3 },
    isPositive: true,
  },
  {
    id: "r9",
    companyId: "c-meituan-01",
    companyName: "美团",
    title: "后端开发工程师",
    department: "到店业务部",
    rating: 8,
    date: "2026-03-20",
    comment: "入职半年体验不错，mentor制度完善，每个新人都有固定导师带。部门业务增长快，接触到的项目很有挑战性，能学到很多实战技能。",
    tags: ["mentor制度好", "成长快", "项目有挑战"],
    dimScores: { growth: 4, clarity: 4, communication: 4, workload: 3, respect: 4 },
    isPositive: true,
  },
  {
    id: "r10",
    companyId: "c-didi-01",
    companyName: "滴滴",
    title: "前端开发工程师",
    department: "出行事业部",
    rating: 4,
    date: "2026-03-19",
    comment: "技术栈老旧，很多内部系统用十年前的框架。代码review流于形式，mentor根本不带人，自己摸索天天踩坑。晋升通道不透明。",
    tags: ["技术老旧", "无指导", "晋升难"],
    dimScores: { growth: 2, clarity: 2, communication: 2, workload: 4, respect: 2 },
    isPositive: false,
  },
  {
    id: "r11",
    companyId: "c-kuaishou-01",
    companyName: "快手",
    title: "算法工程师",
    department: "算法推荐部",
    rating: 4,
    date: "2026-03-18",
    comment: "内卷严重，晚上10点前走会被leader约谈。OKR定得离谱完不成，月底强制加班冲刺。工作内容重复单调，都是修修补补的活。",
    tags: ["内卷严重", "OKR压力大", "内容重复"],
    dimScores: { growth: 2, clarity: 2, communication: 2, workload: 1, respect: 2 },
    isPositive: false,
  },
  {
    id: "r12",
    companyId: "c-antgroup-01",
    companyName: "蚂蚁集团",
    title: "安全工程师",
    department: "支付技术部",
    rating: 9,
    date: "2026-03-17",
    comment: "安全支付部门，技术要求严格，代码质量很高，能接触到金融级安全架构。组内大牛很多，待遇在行业属于Top级别。",
    tags: ["技术要求高", "待遇好", "能接触核心"],
    dimScores: { growth: 5, clarity: 5, communication: 4, workload: 3, respect: 4 },
    isPositive: true,
  },
  {
    id: "r13",
    companyId: "c-baidu-01",
    companyName: "百度",
    title: "产品经理",
    department: "AI产品部",
    rating: 5,
    date: "2026-03-16",
    comment: "公司创新能力下降，内部创新项目审批流程繁琐。部门业务方向迷茫，方向变来变去。技术老旧，很多系统还是老代码。",
    tags: ["创新难", "方向迷茫", "技术老旧"],
    dimScores: { growth: 2, clarity: 2, communication: 3, workload: 3, respect: 3 },
    isPositive: false,
  },
  {
    id: "r14",
    companyId: "c-xiaomi-01",
    companyName: "小米",
    title: "产品经理",
    department: "手机产品部",
    rating: 4,
    date: "2026-03-15",
    comment: "工作强度太大了，经常凌晨一两点还在开会改方案。部门领导审美一言难尽，还天天让抄竞品。产品需求变来变去，研发天天加班。",
    tags: ["强度大", "需求乱变", "领导审美差"],
    dimScores: { growth: 3, clarity: 2, communication: 2, workload: 1, respect: 2 },
    isPositive: false,
  },
  {
    id: "r15",
    companyId: "c-huawei-01",
    companyName: "华为",
    title: "通信工程师",
    department: "无线产品部",
    rating: 8,
    date: "2026-03-14",
    comment: "5G研发部门，技术实力强，能接触到通信行业最前沿的技术。流程规范，文档完善，适合新人系统性学习。待遇在制造业里算Top。",
    tags: ["技术强", "规范完善", "待遇好"],
    dimScores: { growth: 4, clarity: 5, communication: 4, workload: 3, respect: 4 },
    isPositive: true,
  },
  {
    id: "r16",
    companyId: "c-ledger-01",
    companyName: "LedgerForge",
    title: "安全审计工程师",
    department: "智能合约审计",
    rating: 9,
    date: "2026-03-13",
    comment: "安全审计团队非常专业，代码review很严格，能学到很多安全审计技巧。项目类型丰富，接触各种新型DeFi协议，对以后自己写合约帮助很大。",
    tags: ["专业", "学得多", "有帮助"],
    dimScores: { growth: 5, clarity: 4, communication: 4, workload: 4, respect: 4 },
    isPositive: true,
  },
  {
    id: "r17",
    companyId: "c-eth-asia-01",
    companyName: "Ethereum Foundation Asia",
    title: "核心开发工程师",
    department: "核心研究",
    rating: 10,
    date: "2026-03-12",
    comment: "在这里工作是最接近以太坊核心的机会，能参与EIP讨论和实现。团队氛围开放，可以直接和Vitalik等大神交流。技术挑战性大，成长飞速。",
    tags: ["核心", "开放", "成长快"],
    dimScores: { growth: 5, clarity: 5, communication: 5, workload: 3, respect: 5 },
    isPositive: true,
  },
  {
    id: "r18",
    companyId: "c-chainforge-01",
    companyName: "ChainForge Inc",
    title: "后端工程师",
    department: "节点服务",
    rating: 6,
    date: "2026-03-11",
    comment: "索引服务文档不够完善，有些API没有示例代码。工单响应有时候要2-3天，紧急问题处理不及时。内部协作流程混乱，跨部门沟通特别费劲。",
    tags: ["文档差", "响应慢", "流程乱"],
    dimScores: { growth: 3, clarity: 2, communication: 2, workload: 3, respect: 3 },
    isPositive: false,
  },
];

// 行业列表
const INDUSTRIES = ["全部行业", "互联网", "基础设施", "安全审计", "开发者教育", "金融科技", "本地生活"];

// =====================
// 组件定义
// =====================

// 关键词高亮组件
function HighlightText({ text, query }: { text: string; query: string }) {
  if (!query) return <>{text}</>;
  const parts = text.split(new RegExp(`(${query})`, "gi"));
  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === query.toLowerCase() ? (
          <mark key={i} className="bg-[#165DFF]/20 text-[#165DFF] rounded px-0.5">
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
}

// 企业卡片骨架屏
function CompanyCardSkeleton() {
  return (
    <Card className="border-[#E5E6EB] bg-white">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 animate-pulse rounded-lg bg-muted" />
          <div className="flex-1 space-y-2">
            <div className="h-5 w-40 animate-pulse rounded bg-muted" />
            <div className="h-4 w-60 animate-pulse rounded bg-muted" />
          </div>
          <div className="h-8 w-16 animate-pulse rounded bg-muted" />
        </div>
      </CardContent>
    </Card>
  );
}

// 评价卡片骨架屏
function ReviewCardSkeleton() {
  return (
    <Card className="border-[#E5E6EB] bg-white">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-2">
            <div className="h-4 w-32 animate-pulse rounded bg-muted" />
            <div className="h-3 w-48 animate-pulse rounded bg-muted" />
          </div>
          <div className="h-5 w-12 animate-pulse rounded bg-muted" />
        </div>
        <div className="mt-3 space-y-2">
          <div className="h-3 w-full animate-pulse rounded bg-muted" />
          <div className="h-3 w-3/4 animate-pulse rounded bg-muted" />
        </div>
      </CardContent>
    </Card>
  );
}

// 企业结果卡片
function CompanyCard({ company, query }: { company: CompanySearchResult; query: string }) {
  const [expanded, setExpanded] = useState(false);
  const hasDepartments = company.departments && company.departments.length > 0;

  // 生成企业图标
  const iconUrl = company.icon || `https://api.dicebear.com/7.x/shapes/svg?seed=${encodeURIComponent(company.name)}&backgroundColor=165DFF`;

  return (
    <Card className="border-[#E5E6EB] bg-white transition-all hover:border-[#165DFF]/30 hover:shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <div className="shrink-0">
            <img
              src={iconUrl}
              alt={company.name}
              className="h-12 w-12 rounded-lg object-cover shadow-sm"
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <Link
                href={`/company/${encodeURIComponent(company.id)}`}
                className="text-base font-semibold text-[#165DFF] hover:underline"
              >
                <HighlightText text={company.name} query={query} />
              </Link>
              <Badge variant="secondary" className="text-xs font-normal text-muted-foreground">
                {company.industry}
              </Badge>
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
              <span>{company.region}</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Users className="h-3.5 w-3.5" />
                {company.departmentCount} 个部门
              </span>
              <span>•</span>
              <span>{company.reviewCount} 条评价</span>
            </div>
          </div>
          <div className="shrink-0 text-right">
            <p className="text-xl font-semibold text-[#165DFF]">{company.score.toFixed(1)}</p>
            <p className="text-xs text-muted-foreground">声誉分</p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {hasDepartments && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setExpanded(!expanded);
                }}
                className="h-8 px-2 text-sm text-muted-foreground hover:text-[#165DFF]"
              >
                {expanded ? (
                  <>
                    <ChevronDown className="mr-1 h-4 w-4" />
                    折叠
                  </>
                ) : (
                  <>
                    <ChevronRight className="mr-1 h-4 w-4" />
                    展开
                  </>
                )}
              </Button>
            )}
            <Link
              href={`/company/${encodeURIComponent(company.id)}`}
              className="inline-flex items-center gap-1 text-sm font-medium text-[#165DFF] hover:underline"
            >
              详情
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* 展开业务组 */}
        {expanded && hasDepartments && (
          <div className="mt-4 space-y-3">
            {company.departments.map((dept) => (
              <Card key={dept.id} className="border-[#E5E6EB] bg-[#F8F9FC]">
                <CardContent className="p-3">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 shrink-0 rounded border border-border/60 bg-white flex items-center justify-center">
                      <Building2 className="h-4 w-4 text-[#165DFF]/70" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-foreground">
                        <HighlightText text={dept.name} query={query} />
                      </h4>
                      <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-0.5">
                          <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                          {dept.avgScore.toFixed(2)}
                        </span>
                        <span>•</span>
                        <span>{dept.reviewCount} 条评价</span>
                      </div>
                    </div>
                    <div className="shrink-0 flex flex-wrap gap-1">
                      {dept.businessGroups.slice(0, 2).map((bg) => (
                        <Badge key={bg.id} variant="outline" className="text-[9px]">
                          <HighlightText text={bg.name} query={query} />
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// 评价结果卡片
function ReviewCard({ review, query }: { review: ReviewSearchResult; query: string }) {
  const [showDims, setShowDims] = useState(false);

  const ratingColor = review.rating >= 7 ? "#00B42A" : review.rating >= 4 ? "#86909C" : "#F53F3F";

  return (
    <Card className="border-[#E5E6EB] bg-white transition-all hover:shadow-sm">
      <CardContent className="p-5">
        {/* 标题和企业 */}
        <div className="flex items-start justify-between gap-2">
          <div>
            <h4 className="text-base font-medium text-foreground">
              <HighlightText text={review.title} query={query} />
            </h4>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <Link
                href={`/company/${encodeURIComponent(review.companyId)}`}
                className="flex items-center gap-1 text-[#165DFF] hover:underline"
              >
                <Building2 className="h-3.5 w-3.5" />
                <HighlightText text={review.companyName} query={query} />
              </Link>
              <span>•</span>
              <span>
                <HighlightText text={review.department} query={query} />
              </span>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            <div className="flex items-center gap-1">
              <span className="text-lg font-bold" style={{ color: ratingColor }}>
                {review.rating}
              </span>
              <span className="text-xs text-muted-foreground">/10</span>
            </div>
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {review.date}
            </span>
          </div>
        </div>

        {/* 评价内容 */}
        <p className="mt-3 text-sm leading-relaxed text-foreground">
          <HighlightText text={review.comment} query={query} />
        </p>

        {/* 标签 */}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {review.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="secondary" className="text-[11px]">
              {tag}
            </Badge>
          ))}
        </div>

        {/* 维度评分 */}
        <div className="mt-3">
          <Button
            variant="ghost"
            size="sm"
            className="h-auto p-0 text-xs text-muted-foreground hover:text-[#165DFF]"
            onClick={() => setShowDims(!showDims)}
          >
            {showDims ? "收起维度评分" : "查看维度评分"}
          </Button>
          {showDims && (
            <div className="mt-2 grid grid-cols-5 gap-2">
              {DIM_LABELS.map((dim) => (
                <div key={dim.key} className="text-center">
                  <p className="text-[10px] text-muted-foreground">{dim.zh}</p>
                  <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-[#165DFF]"
                      style={{ width: `${(review.dimScores[dim.key] / 5) * 100}%` }}
                    />
                  </div>
                  <p className="text-xs font-medium text-[#165DFF]">
                    {review.dimScores[dim.key].toFixed(1)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// 空状态
function EmptyState({ type, query, onAction }: { type: "all" | "company" | "review"; query: string; onAction?: () => void }) {
  const router = useRouter();
  return (
    <div className="flex flex-1 flex-col items-center justify-center py-16">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-border/60 bg-muted/40">
        <Search className="h-8 w-8 text-muted-foreground" />
      </div>
      <h2 className="mt-4 text-lg font-semibold">
        {type === "all" && `未找到与「${query}」相关的结果`}
        {type === "company" && `未找到匹配的企业`}
        {type === "review" && `未找到匹配的评价`}
      </h2>
      <p className="mt-2 text-sm text-muted-foreground">试试调整搜索关键词</p>
      {onAction && (
        <Button variant="outline" className="mt-6" onClick={onAction}>
          浏览热门企业
        </Button>
      )}
    </div>
  );
}

// =====================
// 搜索内容组件
// =====================
function SearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  const { isConnected } = useAccount();

  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState(query);
  const [activeTab, setActiveTab] = useState<"all" | "companies" | "reviews">("all");
  const [industry, setIndustry] = useState("全部行业");
  const [sortBy, setSortBy] = useState<"relevance" | "score_desc" | "date_desc">("relevance");

  // 模拟加载
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(timer);
  }, [query]);

  // 搜索过滤
  const companies = useMemo(() => {
    let list = MOCK_SEARCH_COMPANIES;
    if (query) {
      const q = query.toLowerCase();
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.departments.some(
            (d) => d.name.toLowerCase().includes(q) || d.businessGroups.some((bg) => bg.name.toLowerCase().includes(q))
          )
      );
    }
    if (industry !== "全部行业") {
      list = list.filter((c) => c.industry === industry);
    }
    return list;
  }, [query, industry]);

  // 获取本地保存的评价（用户新发布的）
  const localReviews = useMemo(() => {
    if (typeof window === "undefined") return [];
    try {
      return JSON.parse(localStorage.getItem("rmm_reviews") || "[]");
    } catch {
      return [];
    }
  }, []);

  const reviews = useMemo(() => {
    let list = [...localReviews, ...MOCK_SEARCH_REVIEWS];
    if (query) {
      const q = query.toLowerCase();
      list = list.filter(
        (r) =>
          r.companyName.toLowerCase().includes(q) ||
          r.department.toLowerCase().includes(q) ||
          r.title.toLowerCase().includes(q) ||
          r.comment.toLowerCase().includes(q)
      );
    }
    return list;
  }, [query, localReviews]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchInput.trim())}`);
    }
  };

  const hotCompanies = MOCK_TOP_COMPANIES.slice(0, 4);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* 搜索结果头部 */}
      <div className="border-b border-border/60 bg-muted/20">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
          {/* 面包屑 */}
          <nav className="mb-4 flex items-center gap-1.5 text-sm">
            <Link href="/" className="text-muted-foreground hover:text-foreground">
              首页
            </Link>
            <span className="text-muted-foreground">/</span>
            <span className="font-medium text-foreground">搜索结果</span>
          </nav>

          {/* 搜索框 */}
          <form onSubmit={handleSearch} className="mb-4">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="搜索企业名称/部门..."
                className="h-10 rounded-lg border-[#E5E6EB] pl-10 pr-20"
              />
              <Button
                type="submit"
                className="absolute right-1 top-1/2 h-8 -translate-y-1/2 bg-[#165DFF] hover:bg-[#0E42D2]"
              >
                搜索
              </Button>
            </div>
          </form>

          {/* 结果统计和Tab */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            {/* <div className="text-sm text-muted-foreground">
              {query ? (
                <>
                  <span className="font-medium text-foreground">
                    {activeTab === "all"
                      ? companies.length + reviews.length
                      : activeTab === "companies"
                      ? companies.length
                      : reviews.length}
                  </span>
                  {" "}个结果，包含 "
                  <span className="font-medium text-[#165DFF]">{query}</span>
                  "
                </>
              ) : (
                "请输入搜索关键词"
              )}
            </div> */}
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
              <TabsList className="bg-muted/50">
                <TabsTrigger
                  value="all"
                  className="data-[state=active]:bg-[#165DFF] data-[state=active]:text-white"
                >
                  全部结果 ({companies.length + reviews.length})
                </TabsTrigger>
                <TabsTrigger
                  value="companies"
                  className="data-[state=active]:bg-[#165DFF] data-[state=active]:text-white"
                >
                  企业 ({companies.length})
                </TabsTrigger>
                <TabsTrigger
                  value="reviews"
                  className="data-[state=active]:bg-[#165DFF] data-[state=active]:text-white"
                >
                  评价 ({reviews.length})
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* 筛选器 */}
          {activeTab !== "reviews" && (
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="text-xs text-muted-foreground">行业:</span>
              {INDUSTRIES.slice(0, 5).map((ind) => (
                <Badge
                  key={ind}
                  variant={industry === ind ? "default" : "outline"}
                  className={`cursor-pointer text-xs ${industry === ind ? "bg-[#165DFF]" : ""}`}
                  onClick={() => setIndustry(ind)}
                >
                  {ind}
                </Badge>
              ))}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="ml-2 h-7 rounded-md border border-input bg-background px-2 text-xs"
              >
                <option value="relevance">相关度</option>
                <option value="score_desc">评分从高到低</option>
                <option value="date_desc">最新发布</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {/* 搜索结果列表 */}
      <div className="flex-1 bg-muted/10">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
          {loading ? (
            <div className="grid gap-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <CompanyCardSkeleton key={`company-${i}`} />
              ))}
              {Array.from({ length: 2 }).map((_, i) => (
                <ReviewCardSkeleton key={`review-${i}`} />
              ))}
            </div>
          ) : activeTab === "all" ? (
            <div className="grid gap-4">
              {companies.length === 0 && reviews.length === 0 ? (
                <EmptyState type="all" query={query} onAction={() => router.push("/companies")} />
              ) : (
                <>
                  {companies.map((company) => (
                    <CompanyCard key={company.id} company={company} query={query} />
                  ))}
                  {reviews.map((review) => (
                    <ReviewCard key={review.id} review={review} query={query} />
                  ))}
                </>
              )}
            </div>
          ) : activeTab === "companies" ? (
            <div className="grid gap-4">
              {companies.length === 0 ? (
                <EmptyState type="company" query={query} onAction={() => router.push("/companies")} />
              ) : (
                companies.map((company) => (
                  <CompanyCard key={company.id} company={company} query={query} />
                ))
              )}
            </div>
          ) : (
            <div className="grid gap-4">
              {reviews.length === 0 ? (
                <EmptyState type="review" query={query} />
              ) : (
                reviews.map((review) => (
                  <ReviewCard key={review.id} review={review} query={query} />
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* 相关推荐 */}
      {!loading && (activeTab === "all" || activeTab === "companies") && companies.length > 0 && companies.length < 4 && (
        <div className="border-t border-border/60 bg-muted/20">
          <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
            <h3 className="text-lg font-semibold">热门企业</h3>
            <div className="mt-4 grid gap-4 md:grid-cols-4">
              {hotCompanies.map((company) => (
                <Link key={company.id} href={`/company/${encodeURIComponent(company.id)}`}>
                  <Card className="p-3 transition-colors hover:border-[#165DFF]/50">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-[#165DFF]" />
                      <span className="text-sm font-medium truncate">{company.name}</span>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 底部合规提示 */}
      <div className="border-t border-border/60 bg-muted/10 py-6">
        <div className="mx-auto max-w-6xl px-4 text-center text-xs text-muted-foreground sm:px-6">
          <p>评价内容仅代表个人观点，不构成投资建议。平台不对内容准确性负责。</p>
          <p className="mt-1">所有评价数据均在链上存证，确保真实不可篡改。</p>
        </div>
      </div>
    </div>
  );
}

// =====================
// 主页面组件
// =====================
export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-0 flex-1 flex-col items-center justify-center py-16">
          <Search className="h-8 w-8 animate-pulse text-muted-foreground" />
          <p className="mt-4 text-sm text-muted-foreground">加载中...</p>
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  );
}