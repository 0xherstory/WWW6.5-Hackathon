"use client";

import { Suspense, useState, useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight, Star, Users, Building2, ArrowUpRight, ChevronDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  COMPANY_RANKING_DATA,
  INDUSTRIES,
  SORT_OPTIONS,
  getTagColor,
} from "@/data/company-ranking-mock";

import type { CompanyRankItem } from "@/data/company-ranking-mock";

const PAGE_SIZE = 9;

// 内部组件使用 useSearchParams
function CompanyRankingContent() {
  const searchParams = useSearchParams();
  const initialSort = searchParams.get("sort") || "score";
  const initialIndustry = searchParams.get("industry") || "全部";

  const [sortBy, setSortBy] = useState(initialSort);
  const [industry, setIndustry] = useState(initialIndustry);
  const [currentPage, setCurrentPage] = useState(1);

  // 筛选和排序
  const filteredData = useMemo(() => {
    let data = [...COMPANY_RANKING_DATA];

    // 行业筛选
    if (industry !== "全部") {
      data = data.filter((item) => item.industry === industry);
    }

    // 排序
    data.sort((a, b) => {
      if (sortBy === "score") {
        return b.score - a.score;
      }
      return b.reviewCount - a.reviewCount;
    });

    // 重新计算排名
    return data.map((item, index) => ({ ...item, rank: index + 1 }));
  }, [sortBy, industry]);

  // 分页
  const totalPages = Math.ceil(filteredData.length / PAGE_SIZE);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  // 重置页码
  const handleIndustryChange = (value: string) => {
    setIndustry(value);
    setCurrentPage(1);
  };

  const handleSortChange = (value: string) => {
    setSortBy(value);
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* 面包屑 */}
      <div className="border-b border-border/80 bg-background/80">
        <div className="mx-auto max-w-6xl px-4 py-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground">
              首页
            </Link>
            <span>/</span>
            <span className="text-foreground">企业榜单</span>
          </div>
        </div>
      </div>

      {/* 标题 */}
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="flex items-center gap-3">
          <Building2 className="h-8 w-8 text-[#165DFF]" />
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">企业评价榜单</h1>
            <p className="text-sm text-muted-foreground">
              汇集 {filteredData.length} 家企业，{filteredData.reduce((sum, c) => sum + c.reviewCount, 0)} 条真实评价
            </p>
          </div>
        </div>
      </div>

      {/* 筛选栏 */}
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex flex-wrap items-center gap-4 rounded-lg border border-border/80 bg-card/50 p-4">
          {/* 行业筛选 */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">行业</span>
            <div className="relative">
              <select
                value={industry}
                onChange={(e) => handleIndustryChange(e.target.value)}
                className="h-9 w-32 rounded-md border border-input bg-background px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-[#165DFF]/50"
              >
                {INDUSTRIES.map((ind) => (
                  <option key={ind} value={ind}>
                    {ind}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            </div>
          </div>

          {/* 排序 */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">排序</span>
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => handleSortChange(e.target.value)}
                className="h-9 w-32 rounded-md border border-input bg-background px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-[#165DFF]/50"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            </div>
          </div>
        </div>
      </div>

      {/* 企业榜单 */}
      <div className="mx-auto max-w-6xl px-4 py-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {paginatedData.map((company) => (
            <CompanyCard key={company.id} company={company} />
          ))}
        </div>

        {/* 空状态 */}
        {paginatedData.length === 0 && (
          <div className="py-12 text-center">
            <Building2 className="mx-auto h-12 w-12 text-muted" />
            <p className="mt-4 text-muted-foreground">暂无企业数据</p>
          </div>
        )}
      </div>

      {/* 分页 */}
      {totalPages > 1 && (
        <div className="mx-auto max-w-6xl px-4 py-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              第 {currentPage} / {totalPages} 页，共 {filteredData.length} 家企业
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                const page = i + 1;
                return (
                  <Button
                    key={page}
                    variant={page === currentPage ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setCurrentPage(page)}
                    className="w-9"
                  >
                    {page}
                  </Button>
                );
              })}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 底部提示 */}
      <div className="border-t border-border/80 bg-muted/30">
        <div className="mx-auto max-w-6xl px-4 py-6">
          <p className="text-center text-xs text-muted-foreground">
            数据来源：用户真实评价，仅供参考 · 评价内容不代表平台立场
          </p>
        </div>
      </div>
    </div>
  );
}

// 企业卡片组件
function CompanyCard({ company }: { company: CompanyRankItem }) {
  const isTopThree = company.rank <= 3;

  return (
    <Link href={`/company/${company.id}`}>
      <div
        className={`group relative flex h-full flex-col rounded-lg border border-border/80 bg-card p-5 transition-all hover:border-[#165DFF]/50 hover:shadow-sm ${
          isTopThree ? "border-l-4 border-l-[#165DFF]" : ""
        }`}
      >
        {/* 排名 */}
        <div className="mb-3 flex items-center justify-between">
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${
              isTopThree
                ? "bg-[#165DFF] text-white"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {company.rank}
          </div>
          <Badge variant="outline" className="text-xs">
            {company.industry}
          </Badge>
        </div>

        {/* 企业名称 */}
        <h3 className="text-lg font-semibold tracking-tight group-hover:text-[#165DFF]">
          {company.name}
        </h3>

        {/* 评分和评价数 */}
        <div className="mt-3 flex items-center gap-4">
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
            <span className="font-semibold">{company.score.toFixed(1)}</span>
            <span className="text-xs text-muted-foreground">分</span>
          </div>
          <div className="flex items-center gap-1 text-muted-foreground">
            <Users className="h-4 w-4" />
            <span className="text-sm">{company.reviewCount} 条评价</span>
          </div>
        </div>

        {/* AI标签 */}
        <div className="mt-3 flex flex-wrap gap-1">
          {company.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant={getTagColor(tag)} className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>

        {/* 查看详情 */}
        <div className="mt-4 flex items-center justify-between text-sm font-medium text-[#165DFF]">
          <span>查看详情</span>
          <ArrowUpRight className="h-4 w-4" />
        </div>
      </div>
    </Link>
  );
}

// 加载骨架屏
function CompanyRankingSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border/80 bg-background/80">
        <div className="mx-auto max-w-6xl px-4 py-3">
          <div className="h-4 w-20 animate-pulse rounded bg-muted" />
        </div>
      </div>
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="h-10 w-40 animate-pulse rounded bg-muted" />
      </div>
      <div className="mx-auto max-w-6xl px-4">
        <div className="h-16 animate-pulse rounded-lg bg-muted" />
      </div>
      <div className="mx-auto max-w-6xl px-4 py-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="h-48 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      </div>
    </div>
  );
}

// 默认导出，用 Suspense 包裹
export default function CompanyRankingPage() {
  return (
    <Suspense fallback={<CompanyRankingSkeleton />}>
      <CompanyRankingContent />
    </Suspense>
  );
}