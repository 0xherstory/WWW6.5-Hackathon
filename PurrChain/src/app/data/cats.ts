// ============================================================
//  cats.ts — 只保留类型定义和工具函数，不含假数据
// ============================================================

export type CatStatus = "available" | "cloudAdopted" | "pendingAdoption" | "adopted" | "closed";

export interface Cat {
  id: number;
  name: string;
  age: number;
  gender: "male" | "female";
  desc: string;
  fullDesc: string;
  status: CatStatus;
  shelter: string;
  shelterLocation: string;
  image: string;
  stage: 1 | 2 | 3;
  personality: string[];
  weight: string;
  vaccinated: boolean;
  neutered: boolean;
}

// 已清空假数据，只显示链上真实猫咪
export const CATS: Cat[] = [];

export const SHELTERS: { id: number; name: string; location: string; catCount: number; status: string }[] = [];

// ============================================================
//  ChainCat — 从链上读取的猫咪数据结构
// ============================================================

export interface ChainCat {
  id: number;
  name: string;
  age: number;
  gender: string;
  description: string;
  stageURIs: string[];
  shelter: string;
  shelterLocation: string;
  status: CatStatus;
  image: string;
  stage: 1 | 2 | 3 | 4;
  isOnChain: boolean;
}

// ============================================================
//  getStatusLabel — 支持中英文
// ============================================================

export function getStatusLabel(status: CatStatus, lang: "zh" | "en" = "zh"): string {
  if (lang === "en") {
    switch (status) {
      case "available":       return "Available";
      case "cloudAdopted":    return "Cloud Adopted";
      case "pendingAdoption": return "Pending";
      case "adopted":         return "Adopted";
      case "closed":          return "Closed";
    }
  }
  switch (status) {
    case "available":       return "待领养";
    case "cloudAdopted":    return "云领养中";
    case "pendingAdoption": return "领养处理中";
    case "adopted":         return "已被领养";
    case "closed":          return "已关闭";
  }
}

export function getStatusColor(status: CatStatus): string {
  switch (status) {
    case "available":       return "text-emerald-400 bg-emerald-400/10 border-emerald-400/30";
    case "cloudAdopted":    return "text-cyan-400 bg-cyan-400/10 border-cyan-400/30";
    case "pendingAdoption": return "text-amber-400 bg-amber-400/10 border-amber-400/30";
    case "adopted":         return "text-purple-400 bg-purple-400/10 border-purple-400/30";
    case "closed":          return "text-gray-400 bg-gray-400/10 border-gray-400/30";
  }
}

export function chainStatusToLocal(n: number): CatStatus {
  switch (n) {
    case 0: return "available";
    case 1: return "cloudAdopted";
    case 2: return "pendingAdoption";
    case 3: return "adopted";
    case 4: return "closed";
    default: return "available";
  }
}
