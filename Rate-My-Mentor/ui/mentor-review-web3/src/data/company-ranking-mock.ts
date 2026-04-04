import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export interface CompanyRankItem {
  id: string;
  rank: number;
  name: string;
  industry: string;
  score: number;
  reviewCount: number;
  tags: string[];
  description: string;
}

// 行业列表
export const INDUSTRIES = [
  "全部",
  "互联网",
  "电商",
  "AI/科技",
  "金融",
  "本地服务",
  "出行",
  "短视频",
] as const;

// 排序选项
export const SORT_OPTIONS = [
  { value: "score", label: "综合评分" },
  { value: "reviewCount", label: "评价数量" },
] as const;

// 企业模拟数据
export const COMPANY_RANKING_DATA: CompanyRankItem[] = [
  {
    id: "c-bytedance-01",
    rank: 1,
    name: "字节跳动",
    industry: "互联网",
    score: 9.2,
    reviewCount: 328,
    tags: ["成长快", "福利好", "竞争大"],
    description: "字节跳动，俗称BAT三巨头之一，移动办公时代的开创者",
  },
  {
    id: "c-tencent-01",
    rank: 2,
    name: "腾讯",
    industry: "互联网",
    score: 8.8,
    reviewCount: 286,
    tags: ["稳定", "福利好", "养老"],
    description: "中国最大的互联网公司之一，游戏、社交、金融全覆盖",
  },
  {
    id: "c-alibaba-01",
    rank: 3,
    name: "阿里巴巴",
    industry: "电商",
    score: 8.5,
    reviewCount: 264,
    tags: ["体系成熟", "PUA", "卷"],
    description: "电商巨头，淘宝、天猫、阿里云",
  },
  {
    id: "c-meituan-01",
    rank: 4,
    name: "美团",
    industry: "本地服务",
    score: 8.2,
    reviewCount: 189,
    tags: ["氛围好", "成长快", "加班多"],
    description: "本地生活服务龙头，外卖、酒旅到店全覆盖",
  },
  {
    id: "c-baidu-01",
    rank: 5,
    name: "百度",
    industry: "AI/科技",
    score: 8.0,
    reviewCount: 156,
    tags: ["技术强", "养老", "业务迷茫"],
    description: "搜索老大哥，AI转型中",
  },
  {
    id: "c-didi-01",
    rank: 6,
    name: "滴滴",
    industry: "出行",
    score: 7.8,
    reviewCount: 142,
    tags: ["wlb", "业务稳定", "创新少"],
    description: "出行平台龙头",
  },
  {
    id: "c-kuaishou-01",
    rank: 7,
    name: "快手",
    industry: "短视频",
    score: 7.6,
    reviewCount: 128,
    tags: ["氛围好", "扁平", "变动大"],
    description: "短视频双雄之一，直播电商",
  },
  {
    id: "c-antgroup-01",
    rank: 8,
    name: "蚂蚁集团",
    industry: "金融",
    score: 7.5,
    reviewCount: 118,
    tags: ["高薪", "卷", "业务强"],
    description: "支付宝母公司，支付金融科技",
  },
  {
    id: "c-xiaomi-01",
    rank: 9,
    name: "小米",
    industry: "互联网",
    score: 7.8,
    reviewCount: 98,
    tags: ["厚道", "性价比", "手机业务压力大"],
    description: "手机+loT+汽车生态",
  },
  {
    id: "c-huawei-01",
    rank: 10,
    name: "华为",
    industry: "AI/科技",
    score: 8.3,
    reviewCount: 95,
    tags: ["高薪", "狼性", "研发强"],
    description: "中国科技企业标杆",
  },
  {
    id: "c-jd-01",
    rank: 11,
    name: "京东",
    industry: "电商",
    score: 7.2,
    reviewCount: 145,
    tags: ["物流强", "福利好", "卷"],
    description: "自建物流电商",
  },
  {
    id: "c-pinduoduo-01",
    rank: 12,
    name: "拼多多",
    industry: "电商",
    score: 7.0,
    reviewCount: 112,
    tags: ["增长猛", "卷王", "单休"],
    description: "社交电商新贵",
  },
  {
    id: "c-netEase-01",
    rank: 13,
    name: "网易",
    industry: "互联网",
    score: 7.9,
    reviewCount: 88,
    tags: ["游戏强", "wlb", "稳定"],
    description: "游戏、邮箱、音乐",
  },
  {
    id: "c-xiecheng-01",
    rank: 14,
    name: "携程",
    industry: "本地服务",
    score: 7.3,
    reviewCount: 76,
    tags: ["旅游", "wlb", "业务复苏"],
    description: "在线旅游龙头",
  },
  {
    id: "c-mayi-01",
    rank: 15,
    name: "蚂蚁金服",
    industry: "金融",
    score: 7.5,
    reviewCount: 68,
    tags: ["高薪", "技术强", "卷"],
    description: "金融科技公司",
  },
  {
    id: "c-sensetime-01",
    rank: 16,
    name: "商汤科技",
    industry: "AI/科技",
    score: 6.8,
    reviewCount: 52,
    tags: ["技术强", "落地难", "烧钱"],
    description: "AI四小龙之一",
  },
  {
    id: "c-meituan-02",
    rank: 17,
    name: "小红书",
    industry: "互联网",
    score: 7.6,
    reviewCount: 45,
    tags: ["社区好", "增长快", "业务广"],
    description: "种草社区",
  },
  {
    id: "c-bilibili-01",
    rank: 18,
    name: "B站",
    industry: "短视频",
    score: 6.5,
    reviewCount: 78,
    tags: ["社区强", "增长难", "商业化"],
    description: "年轻社区",
  },
  {
    id: "c-zhipu-01",
    rank: 19,
    name: "智谱AI",
    industry: "AI/科技",
    score: 7.0,
    reviewCount: 35,
    tags: ["大模型", "技术前沿", "创业公司"],
    description: "国产大模型",
  },
  {
    id: "c-mo-mo-01",
    rank: 20,
    name: "陌陌",
    industry: "互联网",
    score: 5.8,
    reviewCount: 42,
    tags: ["业务下滑", "老年化", "创新少"],
    description: "陌生人社交",
  },
];

// 获取企业图标
export function getCompanyIcon(name: string): string {
  const seed = name.replace(/[^a-zA-Z]/g, "");
  return `https://api.dicebear.com/7.x/shapes/svg?seed=${seed}&backgroundColor=165DFF`;
}

// 标签颜色
export function getTagColor(tag: string): "default" | "secondary" | "destructive" | "outline" {
  const negativeTags = ["卷", "PUA", "单休", "业务下滑", "老年化", "创新少", "烧钱", "落地难"];
  const positiveTags = ["成长快", "福利好", "稳定", "高薪", "厚道", "wlb", "技术强", "体系成熟"];

  if (negativeTags.includes(tag)) return "destructive";
  if (positiveTags.includes(tag)) return "default";
  return "secondary";
}

// 格式化评分
export function formatScore(score: number): string {
  return score.toFixed(1);
}