"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useAccount } from "wagmi";
import {
  ArrowLeft,
  Building2,
  Calendar,
  MapPin,
  Search,
  ShieldCheck,
  Star,
} from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { RadarChart } from "@/components/common/radar-chart";
import { cn } from "@/lib/utils";

// =====================
// 模拟数据 - 企业详情页
// =====================

// 企业信息
interface CompanyInfo {
  id: string;
  name: string;
  industry: string;
  region: string;
  description: string;
  score: number;
  reviewCount: number;
  tags: string[];
  website?: string;
  // 五个维度评分
  dimScores: {
    growth: number;
    clarity: number;
    communication: number;
    workload: number;
    respect: number;
  };
  // 部门数据
  departments: DepartmentInfo[];
}

// 部门信息
interface DepartmentInfo {
  id: string;
  name: string;
  avgScore: number;
  reviewCount: number;
  tags: string[];
  businessGroups: BusinessGroupInfo[];
}

// 业务组信息
interface BusinessGroupInfo {
  id: string;
  name: string;
  avgScore: number;
  reviewCount: number;
}

// 评价
interface Review {
  id: string;
  rating: number;
  date: string;
  comment: string;
  tags: string[];
  department: string;
  businessGroup?: string;
  dimScores: {
    growth: number;
    clarity: number;
    communication: number;
    workload: number;
    respect: number;
  };
  isPositive: boolean;
  txHash?: string;
}

// 模拟企业数据 - 必须和评价列表1:1匹配
// 支持id和name两种查询方式
const MOCK_COMPANY_DATA: Record<string, CompanyInfo> = {
  "NovaChain Labs": {
    id: "c-nova-01",
    name: "NovaChain Labs",
    industry: "基础设施",
    region: "新加坡",
    description: "NovaChain Labs 是一家专注于区块链基础设施开发的科技公司，致力于为 Web3 开发者提供安全、高效的区块链解决方案。",
    score: 4.56,
    reviewCount: 12,
    tags: ["基础设施", "Layer1", "节点服务", "RPC"],
    website: "novachain.io",
    dimScores: { growth: 4.7, clarity: 4.5, communication: 4.6, workload: 3.8, respect: 4.8 },
    departments: [
      {
        id: "d1",
        name: "核心协议组",
        avgScore: 4.72,
        reviewCount: 5,
        tags: ["EVM", "共识机制"],
        businessGroups: [
          { id: "bg1", name: "共识算法", avgScore: 4.85, reviewCount: 2 },
          { id: "bg2", name: "虚拟机", avgScore: 4.65, reviewCount: 3 },
        ],
      },
      {
        id: "d2",
        name: "DeFi 产品组",
        avgScore: 4.45,
        reviewCount: 4,
        tags: ["AMM", "借贷"],
        businessGroups: [
          { id: "bg3", name: "DEX", avgScore: 4.52, reviewCount: 2 },
          { id: "bg4", name: "借贷协议", avgScore: 4.38, reviewCount: 2 },
        ],
      },
      {
        id: "d3",
        name: "开发者关系",
        avgScore: 4.35,
        reviewCount: 3,
        tags: ["文档", "SDK"],
        businessGroups: [
          { id: "bg5", name: "技术文档", avgScore: 4.28, reviewCount: 1 },
          { id: "bg6", name: "SDK开发", avgScore: 4.42, reviewCount: 2 },
        ],
      },
    ],
  },
  "c-nova-01": {
    id: "c-nova-01",
    name: "NovaChain Labs",
    industry: "基础设施",
    region: "新加坡",
    description: "NovaChain Labs 是一家专注于区块链基础设施开发的科技公司，致力于为 Web3 开发者提供安全、高效的区块链解决方案。",
    score: 4.56,
    reviewCount: 12,
    tags: ["基础设施", "Layer1", "节点服务", "RPC"],
    website: "novachain.io",
    dimScores: { growth: 4.7, clarity: 4.5, communication: 4.6, workload: 3.8, respect: 4.8 },
    departments: [
      {
        id: "d1",
        name: "核心协议组",
        avgScore: 4.72,
        reviewCount: 5,
        tags: ["EVM", "共识机制"],
        businessGroups: [
          { id: "bg1", name: "共识算法", avgScore: 4.85, reviewCount: 2 },
          { id: "bg2", name: "虚拟机", avgScore: 4.65, reviewCount: 3 },
        ],
      },
    ],
  },
  "字节跳动": {
    id: "c-bytedance-01",
    name: "字节跳动",
    industry: "互联网",
    region: "北京",
    description: "字节跳动是全球最具影响力的内容平台之一，拥有抖音、今日头条等产品。",
    score: 4.23,
    reviewCount: 18,
    tags: ["互联网", "短视频", "AI"],
    website: "bytedance.com",
    dimScores: { growth: 4.5, clarity: 4.0, communication: 4.2, workload: 3.5, respect: 4.0 },
    departments: [
      {
        id: "d4",
        name: "商业化产品部",
        avgScore: 4.35,
        reviewCount: 8,
        tags: ["广告", "产品"],
        businessGroups: [
          { id: "bg4", name: "广告产品组", avgScore: 4.38, reviewCount: 5 },
        ],
      },
    ],
  },
  "c-bytedance-01": {
    id: "c-bytedance-01",
    name: "字节跳动",
    industry: "互联网",
    region: "北京",
    description: "字节跳动是全球最具影响力的内容平台之一，拥有抖音、今日头条等产品。",
    score: 4.23,
    reviewCount: 18,
    tags: ["互联网", "短视频", "AI"],
    website: "bytedance.com",
    dimScores: { growth: 4.5, clarity: 4.0, communication: 4.2, workload: 3.5, respect: 4.0 },
    departments: [
      {
        id: "d4",
        name: "商业化产品部",
        avgScore: 4.35,
        reviewCount: 8,
        tags: ["广告", "产品"],
        businessGroups: [],
      },
    ],
  },
  "阿里巴巴": {
    id: "c-alibaba-01",
    name: "阿里巴巴",
    industry: "互联网",
    region: "杭州",
    description: "阿里巴巴是全球领先的电子商务和云计算公司。",
    score: 4.15,
    reviewCount: 15,
    tags: ["互联网", "电商", "云计算"],
    website: "alibaba.com",
    dimScores: { growth: 4.0, clarity: 3.8, communication: 4.0, workload: 3.2, respect: 3.8 },
    departments: [],
  },
  "c-alibaba-01": {
    id: "c-alibaba-01",
    name: "阿里巴巴",
    industry: "互联网",
    region: "杭州",
    description: "阿里巴巴是全球领先的电子商务和云计算公司。",
    score: 4.15,
    reviewCount: 15,
    tags: ["互联网", "电商", "云计算"],
    website: "alibaba.com",
    dimScores: { growth: 4.0, clarity: 3.8, communication: 4.0, workload: 3.2, respect: 3.8 },
    departments: [],
  },
  "腾讯": {
    id: "c-tencent-01",
    name: "腾讯",
    industry: "互联网",
    region: "深圳",
    description: "腾讯是中国领先的互联网科技公司，拥有微信、QQ等产品。",
    score: 4.38,
    reviewCount: 20,
    tags: ["互联网", "社交", "游戏"],
    website: "tencent.com",
    dimScores: { growth: 4.3, clarity: 4.2, communication: 4.4, workload: 3.6, respect: 4.2 },
    departments: [],
  },
  "c-tencent-01": {
    id: "c-tencent-01",
    name: "腾讯",
    industry: "互联网",
    region: "深圳",
    description: "腾讯是中国领先的互联网科技公司，拥有微信、QQ等产品。",
    score: 4.38,
    reviewCount: 20,
    tags: ["互联网", "社交", "游戏"],
    website: "tencent.com",
    dimScores: { growth: 4.3, clarity: 4.2, communication: 4.4, workload: 3.6, respect: 4.2 },
    departments: [],
  },
  "美团": {
    id: "c-meituan-01",
    name: "美团",
    industry: "本地生活",
    region: "北京",
    description: "美团是中国领先的本地生活服务平台。",
    score: 3.92,
    reviewCount: 10,
    tags: ["本地生活", "外卖", "O2O"],
    website: "meituan.com",
    dimScores: { growth: 4.0, clarity: 3.8, communication: 4.0, workload: 3.0, respect: 3.8 },
    departments: [],
  },
  "c-meituan-01": {
    id: "c-meituan-01",
    name: "美团",
    industry: "本地生活",
    region: "北京",
    description: "美团是中国领先的本地生活服务平台。",
    score: 3.92,
    reviewCount: 10,
    tags: ["本地生活", "外卖", "O2O"],
    website: "meituan.com",
    dimScores: { growth: 4.0, clarity: 3.8, communication: 4.0, workload: 3.0, respect: 3.8 },
    departments: [],
  },
  "滴滴": {
    id: "c-didi-01",
    name: "滴滴",
    industry: "出行",
    region: "北京",
    description: "滴滴是中国领先的出行平台。",
    score: 3.75,
    reviewCount: 8,
    tags: ["出行", "交通", "平台"],
    website: "didiglobal.com",
    dimScores: { growth: 3.5, clarity: 3.6, communication: 3.8, workload: 3.2, respect: 3.6 },
    departments: [],
  },
  "c-didi-01": {
    id: "c-didi-01",
    name: "滴滴",
    industry: "出行",
    region: "北京",
    description: "滴滴是中国领先的出行平台。",
    score: 3.75,
    reviewCount: 8,
    tags: ["出行", "交通", "平台"],
    website: "didiglobal.com",
    dimScores: { growth: 3.5, clarity: 3.6, communication: 3.8, workload: 3.2, respect: 3.6 },
    departments: [],
  },
  "快手": {
    id: "c-kuaishou-01",
    name: "快手",
    industry: "短视频",
    region: "北京",
    description: "快手是中国领先的短视频平台。",
    score: 4.01,
    reviewCount: 9,
    tags: ["短视频", "直播", "AI推荐"],
    website: "kuaishou.com",
    dimScores: { growth: 4.2, clarity: 3.8, communication: 4.0, workload: 3.2, respect: 3.8 },
    departments: [],
  },
  "c-kuaishou-01": {
    id: "c-kuaishou-01",
    name: "快手",
    industry: "短视频",
    region: "北京",
    description: "快手是中国领先的短视频平台。",
    score: 4.01,
    reviewCount: 9,
    tags: ["短视频", "直播", "AI推荐"],
    website: "kuaishou.com",
    dimScores: { growth: 4.2, clarity: 3.8, communication: 4.0, workload: 3.2, respect: 3.8 },
    departments: [],
  },
  "蚂蚁集团": {
    id: "c-antgroup-01",
    name: "蚂蚁集团",
    industry: "金融科技",
    region: "杭州",
    description: "蚂蚁集团是中国领先的金融科技公司。",
    score: 4.45,
    reviewCount: 14,
    tags: ["金融科技", "支付", "区块链"],
    website: "antgroup.com",
    dimScores: { growth: 4.5, clarity: 4.4, communication: 4.3, workload: 3.8, respect: 4.3 },
    departments: [],
  },
  "c-antgroup-01": {
    id: "c-antgroup-01",
    name: "蚂蚁集团",
    industry: "金融科技",
    region: "杭州",
    description: "蚂蚁集团是中国领先的金融科技公司。",
    score: 4.45,
    reviewCount: 14,
    tags: ["金融科技", "支付", "区块链"],
    website: "antgroup.com",
    dimScores: { growth: 4.5, clarity: 4.4, communication: 4.3, workload: 3.8, respect: 4.3 },
    departments: [],
  },
  "百度": {
    id: "c-baidu-01",
    name: "百度",
    industry: "搜索/AI",
    region: "北京",
    description: "百度是中国领先的搜索引擎和AI公司。",
    score: 3.83,
    reviewCount: 7,
    tags: ["搜索", "AI", "自动驾驶"],
    website: "baidu.com",
    dimScores: { growth: 3.8, clarity: 3.6, communication: 3.8, workload: 3.4, respect: 3.6 },
    departments: [],
  },
  "c-baidu-01": {
    id: "c-baidu-01",
    name: "百度",
    industry: "搜索/AI",
    region: "北京",
    description: "百度是中国领先的搜索引擎和AI公司。",
    score: 3.83,
    reviewCount: 7,
    tags: ["搜索", "AI", "自动驾驶"],
    website: "baidu.com",
    dimScores: { growth: 3.8, clarity: 3.6, communication: 3.8, workload: 3.4, respect: 3.6 },
    departments: [],
  },
  "小米": {
    id: "c-xiaomi-01",
    name: "小米",
    industry: "硬件/IoT",
    region: "北京",
    description: "小米是中国领先的硬件和IoT公司。",
    score: 3.67,
    reviewCount: 6,
    tags: ["硬件", "IoT", "手机"],
    website: "xiaomi.com",
    dimScores: { growth: 3.6, clarity: 3.5, communication: 3.6, workload: 3.0, respect: 3.5 },
    departments: [],
  },
  "c-xiaomi-01": {
    id: "c-xiaomi-01",
    name: "小米",
    industry: "硬件/IoT",
    region: "北京",
    description: "小米是中国领先的硬件和IoT公司。",
    score: 3.67,
    reviewCount: 6,
    tags: ["硬件", "IoT", "手机"],
    website: "xiaomi.com",
    dimScores: { growth: 3.6, clarity: 3.5, communication: 3.6, workload: 3.0, respect: 3.5 },
    departments: [],
  },
  "华为": {
    id: "c-huawei-01",
    name: "华为",
    industry: "通信/硬件",
    region: "深圳",
    description: "华为是全球领先的通信设备和智能终端提供商。",
    score: 4.18,
    reviewCount: 12,
    tags: ["通信", "5G", "芯片"],
    website: "huawei.com",
    dimScores: { growth: 4.2, clarity: 4.3, communication: 4.0, workload: 3.6, respect: 4.0 },
    departments: [],
  },
  "c-huawei-01": {
    id: "c-huawei-01",
    name: "华为",
    industry: "通信/硬件",
    region: "深圳",
    description: "华为是全球领先的通信设备和智能终端提供商。",
    score: 4.18,
    reviewCount: 12,
    tags: ["通信", "5G", "芯片"],
    website: "huawei.com",
    dimScores: { growth: 4.2, clarity: 4.3, communication: 4.0, workload: 3.6, respect: 4.0 },
    departments: [],
  },
  "Aurora Guild": {
    id: "c-aurora-01",
    name: "Aurora Guild",
    industry: "开发者教育",
    region: "远程",
    description: "Aurora Guild 是 Web3 开发者教育平台。",
    score: 4.48,
    reviewCount: 6,
    tags: ["Web3", "教育", "开发者"],
    website: "auroraguild.io",
    dimScores: { growth: 4.8, clarity: 4.5, communication: 4.6, workload: 4.2, respect: 4.5 },
    departments: [],
  },
  "c-aurora-01": {
    id: "c-aurora-01",
    name: "Aurora Guild",
    industry: "开发者教育",
    region: "远程",
    description: "Aurora Guild 是 Web3 开发者教育平台。",
    score: 4.48,
    reviewCount: 6,
    tags: ["Web3", "教育", "开发者"],
    website: "auroraguild.io",
    dimScores: { growth: 4.8, clarity: 4.5, communication: 4.6, workload: 4.2, respect: 4.5 },
    departments: [],
  },
  "LedgerForge": {
    id: "c-ledger-01",
    name: "LedgerForge",
    industry: "安全审计",
    region: "香港",
    description: "LedgerForge 是区块链安全审计公司。",
    score: 4.31,
    reviewCount: 5,
    tags: ["安全", "审计", "智能合约"],
    website: "ledgerforge.io",
    dimScores: { growth: 4.5, clarity: 4.3, communication: 4.4, workload: 4.0, respect: 4.2 },
    departments: [],
  },
  "c-ledger-01": {
    id: "c-ledger-01",
    name: "LedgerForge",
    industry: "安全审计",
    region: "香港",
    description: "LedgerForge 是区块链安全审计公司。",
    score: 4.31,
    reviewCount: 5,
    tags: ["安全", "审计", "智能合约"],
    website: "ledgerforge.io",
    dimScores: { growth: 4.5, clarity: 4.3, communication: 4.4, workload: 4.0, respect: 4.2 },
    departments: [],
  },
  "Ethereum Foundation Asia": {
    id: "c-eth-asia-01",
    name: "Ethereum Foundation Asia",
    industry: "基础设施",
    region: "新加坡",
    description: "Ethereum Foundation Asia 是以太坊在亚洲的研究机构。",
    score: 4.78,
    reviewCount: 4,
    tags: ["以太坊", "区块链", "研究"],
    website: "ethereum.org",
    dimScores: { growth: 5.0, clarity: 4.8, communication: 4.9, workload: 4.2, respect: 4.9 },
    departments: [],
  },
  "c-eth-asia-01": {
    id: "c-eth-asia-01",
    name: "Ethereum Foundation Asia",
    industry: "基础设施",
    region: "新加坡",
    description: "Ethereum Foundation Asia 是以太坊在亚洲的研究机构。",
    score: 4.78,
    reviewCount: 4,
    tags: ["以太坊", "区块链", "研究"],
    website: "ethereum.org",
    dimScores: { growth: 5.0, clarity: 4.8, communication: 4.9, workload: 4.2, respect: 4.9 },
    departments: [],
  },
  "ChainForge Inc": {
    id: "c-chainforge-01",
    name: "ChainForge Inc",
    industry: "基础设施",
    region: "旧金山",
    description: "ChainForge Inc 是区块链基础设施公司。",
    score: 4.51,
    reviewCount: 3,
    tags: ["基础设施", "RPC", "索引"],
    website: "chainforge.io",
    dimScores: { growth: 4.6, clarity: 4.4, communication: 4.5, workload: 4.0, respect: 4.4 },
    departments: [],
  },
  "c-chainforge-01": {
    id: "c-chainforge-01",
    name: "ChainForge Inc",
    industry: "基础设施",
    region: "旧金山",
    description: "ChainForge Inc 是区块链基础设施公司。",
    score: 4.51,
    reviewCount: 3,
    tags: ["基础设施", "RPC", "索引"],
    website: "chainforge.io",
    dimScores: { growth: 4.6, clarity: 4.4, communication: 4.5, workload: 4.0, respect: 4.4 },
    departments: [],
  },
};

// 模拟评价数据 - 共12条，正负各一半
const MOCK_REVIEWS: Review[] = [
  // 正面评价 - 核心协议组
  {
    id: "r1",
    rating: 5,
    date: "2026-03-28",
    comment: "核心协议组工作氛围特别专业，团队成员都是行业顶尖的大牛。leader非常愿意带新人，每周都有技术分享会，能学到最前沿的区块链知识。福利待遇也不错，弹性工作制，不强制加班。",
    tags: ["团队专业", "技术氛围好", "福利好", "弹性工作"],
    department: "核心协议组",
    businessGroup: "共识算法",
    dimScores: { growth: 5, clarity: 5, communication: 5, workload: 4, respect: 5 },
    isPositive: true,
  },
  {
    id: "r2",
    rating: 5,
    date: "2026-03-25",
    comment: "参与了一个从0到1的项目，团队执行力很强，学到了很多实战经验。leader不画饼，承诺的晋升都能兑现。技术栈很新，能接触到最前沿的东西。",
    tags: ["成长快", "晋升透明", "技术新", "团队强"],
    department: "核心协议组",
    businessGroup: "虚拟机",
    dimScores: { growth: 5, clarity: 4, communication: 5, workload: 4, respect: 5 },
    isPositive: true,
  },
  // 正面评价 - DeFi产品组
  {
    id: "r3",
    rating: 4,
    date: "2026-03-22",
    comment: "DeFi产品组业务节奏快，但是能学到真东西。同事都很专业，代码review很严格，帮助我养成了很好的编码习惯。mentor制度完善，新人有人带。",
    tags: ["代码质量高", "同事专业", "mentor制度好", "成长快"],
    department: "DeFi 产品组",
    businessGroup: "DEX",
    dimScores: { growth: 4, clarity: 4, communication: 5, workload: 3, respect: 4 },
    isPositive: true,
  },
  // 正面评价 - 开发者关系
  {
    id: "r4",
    rating: 5,
    date: "2026-03-20",
    comment: "DevRel团队氛围超级好，没有办公室政治，大家都是就事论事。leader很尊重下属的想法，不会瞎指挥。工作内容很有意义，能帮助更多开发者入门Web3。",
    tags: ["氛围好", "尊重想法", "有意义", "不内卷"],
    department: "开发者关系",
    businessGroup: "SDK开发",
    dimScores: { growth: 5, clarity: 4, communication: 5, workload: 5, respect: 5 },
    isPositive: true,
  },
  // 正面评价 - 核心协议组
  {
    id: "r5",
    rating: 4,
    date: "2026-03-18",
    comment: "公司技术氛围浓厚，各种技术分享会很多。社保公积金缴纳比例高，年假也比一般公司多。适合想深耕技术的人。",
    tags: ["技术氛围好", "社保高", "年假多", "适合深耕"],
    department: "核心协议组",
    businessGroup: "共识算法",
    dimScores: { growth: 4, clarity: 5, communication: 4, workload: 4, respect: 4 },
    isPositive: true,
  },
  // 正面评价 - DeFi产品组
  {
    id: "r6",
    rating: 5,
    date: "2026-03-15",
    comment: "团队效率很高，没有无效会议。code review很规范，能学到很多。leader技术能力强，还会主动分享行业动态。福利方面，三餐免费+健身房+租房补贴。",
    tags: ["效率高", "规范", "三餐免费", "补贴多"],
    department: "DeFi 产品组",
    businessGroup: "借贷协议",
    dimScores: { growth: 5, clarity: 5, communication: 4, workload: 4, respect: 5 },
    isPositive: true,
  },
  // 负面评价 - 核心协议组
  {
    id: "r7",
    rating: 2,
    date: "2026-03-12",
    comment: "技术氛围确实好，但是加班太严重了。天天晚上10点以后才能走，周末还要随时待命。leaderPUA严重，说什么年轻时候不拼命什么时候拼命，纯纯画饼。",
    tags: ["加班多", "PUA", "画饼", "随时待命"],
    department: "核心协议组",
    businessGroup: "虚拟机",
    dimScores: { growth: 3, clarity: 2, communication: 2, workload: 1, respect: 2 },
    isPositive: false,
  },
  // 负面评价 - DeFi产品组
  {
    id: "r8",
    rating: 1,
    date: "2026-03-10",
    comment: "垃圾公司，快跑！入职3个月天天无偿加班，周末还要随时待命，部门领导PUA一套一套的，画的饼一个都没兑现。承诺的13薪拖到现在都没发，已经准备提离职了。",
    tags: ["无偿加班", "PUA", "画饼", "13薪不发"],
    department: "DeFi 产品组",
    businessGroup: "DEX",
    dimScores: { growth: 1, clarity: 1, communication: 1, workload: 1, respect: 1 },
    isPositive: false,
  },
  // 负面评价 - 开发者关系
  {
    id: "r9",
    rating: 2,
    date: "2026-03-08",
    comment: "工作内容太杂了，什么都要干。写文档、录视频、还要帮其他组做测试，完全没有专注方向。leader不懂技术瞎指挥，提的需求一会一个变。",
    tags: ["工作杂", "需求乱变", "不懂技术", "没方向"],
    department: "开发者关系",
    businessGroup: "技术文档",
    dimScores: { growth: 2, clarity: 2, communication: 2, workload: 3, respect: 2 },
    isPositive: false,
  },
  // 负面评价 - 核心协议组
  {
    id: "r10",
    rating: 3,
    date: "2026-03-05",
    comment: "技术确实能学到东西，但是氛围太卷了。天天有人加班到十一二点，不走都不好意思。福利虽然不错，但是用命换的，不值得。",
    tags: ["太卷", "加班多", "用命换", "福利虚"],
    department: "核心协议组",
    businessGroup: "共识算法",
    dimScores: { growth: 4, clarity: 3, communication: 3, workload: 1, respect: 3 },
    isPositive: false,
  },
  // 负面评价 - DeFi产品组
  {
    id: "r11",
    rating: 2,
    date: "2026-03-02",
    comment: "管理制度混乱，一个需求改十几遍，最后用第一版。leader审美一言难尽，还天天让抄竞品。报销流程麻烦死了，几十块报销拖一个月。",
    tags: ["需求乱改", "报销慢", "管理乱", "抄竞品"],
    department: "DeFi 产品组",
    businessGroup: "借贷协议",
    dimScores: { growth: 2, clarity: 2, communication: 2, workload: 3, respect: 2 },
    isPositive: false,
  },
  // 负面评价 - 开发者关系
  {
    id: "r12",
    rating: 2,
    date: "2026-02-28",
    comment: "整个部门不受重视资源倾斜给核心业务组，devrel就是打杂的。晋升看不到希望，leader只会画饼说以后会重视，从来没兑现过。",
    tags: ["不受重视", "打杂", "晋升难", "画饼"],
    department: "开发者关系",
    businessGroup: "SDK开发",
    dimScores: { growth: 2, clarity: 2, communication: 3, workload: 3, respect: 2 },
    isPositive: false,
  },
];

// 5个维度定义
const DIM_LABELS = [
  { en: "Growth Support", zh: "成长支持", key: "growth" as const },
  { en: "Expectation Clarity", zh: "预期清晰度", key: "clarity" as const },
  { en: "Communication Quality", zh: "沟通质量", key: "communication" as const },
  { en: "Workload Sustainability", zh: "工作强度", key: "workload" as const },
  { en: "Respect & Inclusion", zh: "尊重与包容", key: "respect" as const },
];

// =====================
// 组件定义
// =====================

// 骨架屏
function ReviewCardSkeleton() {
  return (
    <Card className="border-l-[2px] border-l-muted bg-white">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex gap-2">
            <div className="h-5 w-20 animate-pulse rounded bg-muted" />
            <div className="h-5 w-16 animate-pulse rounded bg-muted" />
          </div>
          <div className="flex gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-3.5 w-3.5 animate-pulse rounded-full bg-muted" />
            ))}
          </div>
        </div>
        <div className="mt-3 space-y-2">
          <div className="h-3 w-full animate-pulse rounded bg-muted" />
          <div className="h-3 w-3/4 animate-pulse rounded bg-muted" />
        </div>
      </CardContent>
    </Card>
  );
}

// 评价卡片
function ReviewCard({ review }: { review: Review }) {
  const [expanded, setExpanded] = useState(false);
  const isLong = review.comment.length > 120;

  return (
    <Card
      className={cn(
        "border-l-[3px] bg-white",
        review.isPositive
          ? "border-l-green-500"
          : "border-l-red-500"
      )}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-[10px]">
              {review.department}
            </Badge>
            {review.businessGroup && (
              <Badge variant="secondary" className="text-[9px]">
                {review.businessGroup}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-0.5 cursor-help">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={cn(
                          "h-3.5 w-3.5",
                          i < review.rating
                            ? "fill-amber-400 text-amber-400"
                            : "fill-muted text-muted"
                        )}
                      />
                    ))}
                  </div>
                </TooltipTrigger>
                <TooltipContent sideOffset={5}>
                  <RadarChart
                    data={[
                      { label: "成长", value: review.dimScores.growth },
                      { label: "清晰", value: review.dimScores.clarity },
                      { label: "沟通", value: review.dimScores.communication },
                      { label: "强度", value: review.dimScores.workload },
                      { label: "尊重", value: review.dimScores.respect },
                    ]}
                    size={100}
                  />
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <span className="text-sm font-semibold text-[#165DFF]">
              {review.rating}.0
            </span>
          </div>
        </div>

        <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
          <Calendar className="h-3 w-3" />
          <span>{review.date}</span>
        </div>

        <p className={cn(
          "mt-3 text-sm leading-relaxed text-foreground",
          !expanded && isLong && "line-clamp-3"
        )}>
          {review.comment}
        </p>
        {isLong && (
          <Button
            variant="link"
            size="sm"
            className="mt-1 h-auto p-0 text-xs text-[#165DFF]"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? "收起" : "展开全文"}
          </Button>
        )}

        <div className="mt-3 flex flex-wrap gap-1.5">
          {review.tags.map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className={cn(
                "text-[10px]",
                review.isPositive
                  ? "bg-green-50 text-green-700"
                  : "bg-red-50 text-red-700"
              )}
            >
              {tag}
            </Badge>
          ))}
        </div>

        {review.txHash && (
          <div className="mt-3 flex items-center gap-1 text-[10px] text-muted-foreground">
            <ShieldCheck className="h-3 w-3" />
            <span className="truncate max-w-[200px]">{review.txHash}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// 主页面组件
export default function CompanyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isConnected } = useAccount();
  const companyName = decodeURIComponent(params.id as string);

  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDept, setSelectedDept] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"newest" | "score_desc" | "score_asc">("newest");

  // SBT持有状态检查
  const [hasSBT, setHasSBT] = useState(false);
  useEffect(() => {
    if (typeof window !== "undefined") {
      const sbt = localStorage.getItem("rmm_sbt");
      setHasSBT(!!sbt);
    }
  }, []);

  // 模拟加载
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(timer);
  }, []);

  // 获取企业数据
  const company = MOCK_COMPANY_DATA[companyName];
  const allReviews = company ? MOCK_REVIEWS : [];

  // 筛选和排序
  const filteredReviews = useMemo(() => {
    let reviews = allReviews;

    // 按部门筛选
    if (selectedDept) {
      reviews = reviews.filter((r) => r.department === selectedDept);
    }

    // 排序
    if (sortBy === "newest") {
      reviews = [...reviews].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    } else if (sortBy === "score_desc") {
      reviews = [...reviews].sort((a, b) => b.rating - a.rating);
    } else if (sortBy === "score_asc") {
      reviews = [...reviews].sort((a, b) => a.rating - b.rating);
    }

    return reviews;
  }, [allReviews, selectedDept, sortBy]);

  // 提取标签
  const positiveTags = useMemo(() => {
    const tagCount = new Map<string, number>();
    allReviews.filter((r) => r.isPositive).forEach((r) => {
      r.tags.forEach((tag) => {
        tagCount.set(tag, (tagCount.get(tag) || 0) + 1);
      });
    });
    return Array.from(tagCount.entries())
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count);
  }, [allReviews]);

  const negativeTags = useMemo(() => {
    const tagCount = new Map<string, number>();
    allReviews.filter((r) => !r.isPositive).forEach((r) => {
      r.tags.forEach((tag) => {
        tagCount.set(tag, (tagCount.get(tag) || 0) + 1);
      });
    });
    return Array.from(tagCount.entries())
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count);
  }, [allReviews]);

  // 计算维度平均分
  const dimAverages = useMemo(() => {
    if (allReviews.length === 0) return DIM_LABELS.map((d) => ({ ...d, value: 0 }));
    const totals = { growth: 0, clarity: 0, communication: 0, workload: 0, respect: 0 };
    allReviews.forEach((r) => {
      totals.growth += r.dimScores.growth;
      totals.clarity += r.dimScores.clarity;
      totals.communication += r.dimScores.communication;
      totals.workload += r.dimScores.workload;
      totals.respect += r.dimScores.respect;
    });
    const count = allReviews.length;
    return DIM_LABELS.map((d) => ({
      ...d,
      value: Number((totals[d.key] / count).toFixed(2)),
    }));
  }, [allReviews]);

  // 未找到企业
  if (!company) {
    return (
      <div className="flex min-h-screen flex-col">
        <div className="border-b border-border/60 bg-muted/20">
          <div className="mx-auto max-w-5xl px-4 py-3 sm:px-6">
            <nav className="flex items-center gap-1.5 text-sm">
              <Link href="/" className="text-muted-foreground hover:text-foreground">首页</Link>
              <span className="text-muted-foreground">/</span>
              <Link href="/companies" className="text-muted-foreground hover:text-foreground">企业榜单</Link>
              <span className="text-muted-foreground">/</span>
              <span className="font-medium text-foreground">{companyName}</span>
            </nav>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-semibold">企业未找到</h1>
            <p className="mt-2 text-muted-foreground">ID: {companyName}</p>
            <Link href="/companies">
              <Button variant="outline" className="mt-6">
                <ArrowLeft className="mr-2 h-4 w-4" />
                返回企业榜单
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      {/* 面包屑 */}
      <div className="border-b border-border/60 bg-muted/20">
        <div className="mx-auto max-w-5xl px-4 py-3 sm:px-6">
          <nav className="flex items-center gap-1.5 text-sm">
            <Link href="/" className="text-muted-foreground hover:text-foreground">
              首页
            </Link>
            <span className="text-muted-foreground">/</span>
            <Link href="/companies" className="text-muted-foreground hover:text-foreground">
              企业榜单
            </Link>
            <span className="text-muted-foreground">/</span>
            <span className="font-medium text-foreground">{company.name}</span>
          </nav>
        </div>
      </div>

      <div className="flex-1">
        <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
          {/* 企业头卡 */}
          <Card className="mb-6 border-[#E5E6EB]">
            <CardContent className="p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-start gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-border/60 bg-muted/50">
                    <Building2 className="h-7 w-7 text-[#165DFF]" />
                  </div>
                  <div>
                    <h1 className="text-xl font-semibold">{company.name}</h1>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                      <Badge variant="secondary" className="text-xs">
                        {company.industry}
                      </Badge>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {company.region}
                      </span>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {company.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-[10px]">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-3">
                  <div className="flex items-center gap-2">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex items-center gap-1">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={cn(
                                  "h-4 w-4",
                                  i < Math.floor(company.score)
                                    ? "fill-amber-400 text-amber-400"
                                    : "fill-muted text-muted"
                                )}
                              />
                            ))}
                            <span className="ml-1 text-lg font-semibold text-[#165DFF]">
                              {company.score.toFixed(1)}
                            </span>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent sideOffset={5}>
                          <RadarChart
                            data={dimAverages.map((d) => ({ label: d.zh, value: d.value }))}
                            size={120}
                          />
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-green-600">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    <span>链上核验 不可篡改</span>
                  </div>
                  <Button
                    className="bg-[#165DFF] hover:bg-[#0E42D2]"
                    onClick={() => {
                      if (!hasSBT) {
                        alert("需完成职场身份验证，持有SBT才可发布评价");
                        router.push("/auth");
                        return;
                      }
                      router.push(`/review?company=${encodeURIComponent(company.name)}`);
                    }}
                  >
                    发布评价
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 下属部门快速入口 */}
          <section className="mb-6">
            <h2 className="mb-3 text-lg font-semibold">下属部门</h2>
            <div className="grid gap-3 sm:grid-cols-3">
              <Card
                className={cn(
                  "cursor-pointer transition-all hover:border-[#165DFF]/50",
                  !selectedDept && "border-[#165DFF]/30 bg-[#165DFF]/5"
                )}
                onClick={() => setSelectedDept(null)}
              >
                <CardContent className="p-4">
                  <p className="text-sm font-medium">全部部门</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {allReviews.length} 条评价
                  </p>
                </CardContent>
              </Card>
              {company.departments.map((dept) => (
                <Card
                  key={dept.id}
                  className={cn(
                    "cursor-pointer transition-all hover:border-[#165DFF]/50",
                    selectedDept === dept.name && "border-[#165DFF]/30 bg-[#165DFF]/5"
                  )}
                  onClick={() => setSelectedDept(dept.name)}
                >
                  <CardContent className="p-4">
                    <p className="text-sm font-medium">{dept.name}</p>
                    <div className="mt-1 flex items-center gap-2">
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={cn(
                              "h-3 w-3",
                              i < Math.floor(dept.avgScore)
                                ? "fill-amber-400 text-amber-400"
                                : "fill-muted text-muted"
                            )}
                          />
                        ))}
                      </div>
                      <span className="text-xs font-medium text-[#165DFF]">
                        {dept.avgScore.toFixed(1)}
                      </span>
                    </div>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {dept.tags.slice(0, 2).map((tag) => (
                        <Badge key={tag} variant="outline" className="text-[9px]">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* 评价维度看板 */}
          <section className="mb-6">
            <h2 className="mb-3 text-lg font-semibold">评价维度全景</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {/* 左侧：维度评分 */}
              <Card className="border-[#E5E6EB]">
                <CardContent className="p-4">
                  <div className="space-y-4">
                    {dimAverages.map((dim) => (
                      <div key={dim.key}>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">
                            {dim.zh} ({dim.en})
                          </span>
                          <span className="font-semibold text-[#165DFF]">
                            {dim.value.toFixed(2)}
                          </span>
                        </div>
                        <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full rounded-full bg-[#165DFF] transition-all"
                            style={{ width: `${(dim.value / 5) * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* 右侧：评分分布 */}
              <Card className="border-[#E5E6EB]">
                <CardContent className="p-4">
                  <h3 className="mb-3 text-sm font-medium">评分分布</h3>
                  <div className="space-y-2">
                    {[5, 4, 3, 2, 1].map((stars) => {
                      const count = allReviews.filter((r) => r.rating === stars).length;
                      const pct = allReviews.length > 0 ? (count / allReviews.length) * 100 : 0;
                      return (
                        <div key={stars} className="flex items-center gap-2">
                          <span className="w-6 text-xs text-muted-foreground">{stars}星</span>
                          <div className="flex-1 h-3 overflow-hidden rounded-full bg-muted">
                            <div
                              className={cn(
                                "h-full rounded-full",
                                stars >= 4 ? "bg-green-500" : stars === 3 ? "bg-amber-400" : "bg-red-400"
                              )}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="w-8 text-right text-xs text-muted-foreground">
                            {count}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* AI提取标签云 */}
          <section className="mb-6">
            <h2 className="mb-3 text-lg font-semibold">AI提取标签</h2>
            <Tabs defaultValue="positive">
              <TabsList className="bg-muted/50">
                <TabsTrigger
                  value="positive"
                  className="data-[state=active]:bg-green-500 data-[state=active]:text-white"
                >
                  正向标签 ({positiveTags.length})
                </TabsTrigger>
                <TabsTrigger
                  value="negative"
                  className="data-[state=active]:bg-red-500 data-[state=active]:text-white"
                >
                  负向标签 ({negativeTags.length})
                </TabsTrigger>
              </TabsList>
              <TabsContent value="positive" className="mt-3">
                <div className="flex flex-wrap gap-2">
                  {positiveTags.map(({ tag, count }) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="bg-green-50 text-green-700 hover:bg-green-100"
                    >
                      {tag} ({count})
                    </Badge>
                  ))}
                </div>
              </TabsContent>
              <TabsContent value="negative" className="mt-3">
                <div className="flex flex-wrap gap-2">
                  {negativeTags.map(({ tag, count }) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="bg-red-50 text-red-700 hover:bg-red-100"
                    >
                      {tag} ({count})
                    </Badge>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </section>

          {/* 全量评价列表 */}
          <section>
            <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-lg font-semibold">
                全部评价（共{filteredReviews.length}条）
              </h2>
              <div className="flex items-center gap-2">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                  className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm"
                >
                  <option value="newest">最新发布</option>
                  <option value="score_desc">评分从高到低</option>
                  <option value="score_asc">评分从低到高</option>
                </select>
              </div>
            </div>

            <div className="grid gap-4">
              {loading
                ? Array.from({ length: 4 }).map((_, i) => <ReviewCardSkeleton key={i} />)
                : filteredReviews.map((review) => (
                    <ReviewCard key={review.id} review={review} />
                  ))}
            </div>

            {!loading && filteredReviews.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12">
                <Search className="h-12 w-12 text-muted-foreground" />
                <h2 className="mt-4 text-lg font-semibold">暂无评价</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  成为第一个评价的人吧
                </p>
              </div>
            )}
          </section>
        </div>
      </div>

      {/* 底部合规提示 */}
      <div className="border-t border-border/60 bg-muted/10 py-6">
        <div className="mx-auto max-w-5xl px-4 text-center text-xs text-muted-foreground sm:px-6">
          <p>评价内容仅代表个人观点，不构成投资建议。平台不对内容准确性负责。</p>
          <p className="mt-1">所有评价数据均在链上存证，确保真实不可篡改。</p>
        </div>
      </div>
    </div>
  );
}
