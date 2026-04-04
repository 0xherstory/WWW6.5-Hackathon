"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAccount } from "wagmi";
import { ArrowUpRight, Building2, CheckCircle2, Search, Shield, Star, Users, GraduationCap } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MOCK_TOP_COMPANIES, type MockCompanyRank } from "@/data/home-mock";
import { MOCK_REVIEWS, type ReviewItem } from "@/data/detail-mock";
import { RadarChart } from "@/components/common/radar-chart";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

// 平台核心数据（后续替换为合约读）
interface PlatformStats {
  verifiedCompanies: number;
  certifiedMentors: number;
  chainReviews: number;
  verifiedUsers: number;
}

// 模拟平台数据（TODO: 替换为合约读取）
const MOCK_PLATFORM_STATS: PlatformStats = {
  verifiedCompanies: 486,
  certifiedMentors: 1247,
  chainReviews: 8234,
  verifiedUsers: 3521,
};

// 最新评价（TODO: 替换为索引服务读取）
function getLatestReviews(): (ReviewItem & { type: "company" | "mentor" })[] {
  const allReviews: (ReviewItem & { type: "company" | "mentor" })[] = [];
  Object.entries(MOCK_REVIEWS).forEach(([key, reviews]) => {
    const type = key.startsWith("c-") ? "company" : "mentor";
    reviews.forEach((review) => {
      allReviews.push({ ...review, type });
    });
  });
  return allReviews
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 4);
}

// 加载骨架屏
function StatsSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="rounded-lg border border-[#E5E6EB] bg-card p-4">
          <div className="h-4 w-24 animate-pulse rounded bg-muted" />
          <div className="mt-2 h-8 w-20 animate-pulse rounded bg-muted" />
        </div>
      ))}
    </div>
  );
}

function CompanyCardSkeleton() {
  return (
    <div className="rounded-lg border border-[#E5E6EB] bg-card p-4">
      <div className="flex items-start gap-3">
        <div className="h-10 w-10 animate-pulse rounded-lg bg-muted" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-24 animate-pulse rounded bg-muted" />
          <div className="h-3 w-16 animate-pulse rounded bg-muted" />
        </div>
        <div className="h-6 w-12 animate-pulse rounded bg-muted" />
      </div>
    </div>
  );
}

function ReviewCardSkeleton() {
  return (
    <Card className="p-4">
      <div className="flex gap-3">
        <div className="h-9 w-9 animate-pulse rounded-full bg-muted" />
        <div className="flex-1 space-y-2">
          <div className="flex gap-2">
            <div className="h-4 w-16 animate-pulse rounded bg-muted" />
            <div className="h-4 w-20 animate-pulse rounded bg-muted" />
          </div>
          <div className="h-3 w-full animate-pulse rounded bg-muted" />
          <div className="h-3 w-3/4 animate-pulse rounded bg-muted" />
        </div>
      </div>
    </Card>
  );
}

function rankColor(rank: number) {
  if (rank === 1) return "from-amber-400/30 to-amber-600/10";
  if (rank === 2) return "from-slate-300/30 to-slate-500/10";
  if (rank === 3) return "from-orange-400/30 to-orange-600/10";
  return "";
}

export default function HomePage() {
  const router = useRouter();
  const { isConnected } = useAccount();
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isVerified, setIsVerified] = useState(false);

  // 模拟加载延迟
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  // 检查用户 SBT 持有状态（TODO: 替换为合约读取）
  useEffect(() => {
    if (typeof window !== "undefined") {
      const sbt = localStorage.getItem("rmm_sbt");
      setIsVerified(!!sbt);
    }
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const latestReviews = getLatestReviews();
  const topCompanies = MOCK_TOP_COMPANIES.slice(0, 8);

  // 信任标签
  const trustTags = [
    { icon: Shield, text: "链上存证" },
    { icon: CheckCircle2, text: "身份核验" },
    { icon: Users, text: "真实评价" },
  ];

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* 核心搜索 Hero 区 */}
      <section className="relative overflow-hidden border-b border-border/60 bg-gradient-to-b from-background to-muted/30">
        {/* 背景效果 */}
        <div className="pointer-events-none absolute inset-0 bg-grid-pattern opacity-50" />
        <div className="pointer-events-none absolute -left-1/4 top-0 h-[400px] w-[400px] rounded-full bg-[#165DFF]/8 blur-3xl" />
        <div className="pointer-events-none absolute -right-1/4 bottom-0 h-[300px] w-[300px] rounded-full bg-[#0E42D2]/8 blur-3xl" />

        <div className="relative mx-auto max-w-4xl px-4 py-16 sm:px-6 sm:py-20">
          <div className="text-center">
            <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl md:text-5xl">
              Rate my mentor
            </h1>
            <p className="mt-4 text-base text-muted-foreground sm:text-lg">
              真实的职场带教体验，帮助后来者做出更好的选择
            </p>
          </div>

          {/* 大尺寸全局搜索框 */}
          <form onSubmit={handleSearch} className="mt-8">
            <div className="relative mx-auto max-w-2xl">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜索企业名称/带教名字..."
                className="h-14 rounded-xl border-[#E5E6EB] bg-background pl-12 pr-32 text-base shadow-sm focus-visible:ring-2 focus-visible:ring-[#165DFF]/50"
              />
              <Button
                type="submit"
                className="absolute right-2 top-1/2 h-10 -translate-y-1/2 rounded-lg bg-[#165DFF] px-6 hover:bg-[#0E42D2]"
              >
                搜索
              </Button>
            </div>
          </form>

          {/* 4个信任标签 */}
          <div className="mt-6 flex flex-wrap justify-center gap-4">
            {trustTags.map((tag) => {
              const Icon = tag.icon;
              return (
                <div
                  key={tag.text}
                  className="flex items-center gap-1.5 rounded-full border border-[#E5E6EB] bg-background/80 px-3 py-1.5 text-sm text-muted-foreground"
                >
                  <Icon className="h-4 w-4 text-[#165DFF]" />
                  <span>{tag.text}</span>
                </div>
              );
            })}
          </div>

          {/* 发布评价按钮 */}
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link href="/review" className="group">
              <div className="flex items-center gap-4 rounded-lg border border-[#E5E6EB] bg-white px-6 py-4 shadow-sm transition-all hover:border-[#165DFF]/50 hover:shadow-md w-72">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-[#165DFF]">
                  <GraduationCap className="h-6 w-6 text-white" />
                </div>
                <div className="text-left">
                  <p className="text-base font-semibold text-foreground">Mentor 评价</p>
                  <p className="text-xs text-muted-foreground">分享带教体验</p>
                </div>
                <ArrowUpRight className="ml-auto h-5 w-5 text-muted-foreground transition-colors group-hover:text-[#165DFF]" />
              </div>
            </Link>
            {/* <Link href="/review?tab=company" className="group">
              <div className="flex items-center gap-4 rounded-lg border border-[#E5E6EB] bg-white px-6 py-4 shadow-sm transition-all hover:border-[#165DFF]/50 hover:shadow-md w-72">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-[#165DFF]">
                  <Building2 className="h-6 w-6 text-white" />
                </div>
                <div className="text-left">
                  <p className="text-base font-semibold text-foreground">企业评价</p>
                  <p className="text-xs text-muted-foreground">分享职场体验</p>
                </div>
                <ArrowUpRight className="ml-auto h-5 w-5 text-muted-foreground transition-colors group-hover:text-[#165DFF]" />
              </div>
            </Link> */}
          </div>
        </div>
      </section>

      {/* 平台核心数据看板 */}
      <section className="border-b border-border/60 bg-muted/20">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
          {loading ? (
            <StatsSkeleton />
          ) : (
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              <div className="rounded-lg border border-[#E5E6EB] bg-card p-4 transition-colors hover:border-[#165DFF]/30">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Building2 className="h-4 w-4 text-[#165DFF]" />
                  <span>已评价企业</span>
                </div>
                <p className="mt-1 text-2xl font-semibold text-foreground">
                  {MOCK_PLATFORM_STATS.verifiedCompanies.toLocaleString()}
                </p>
              </div>
              <div className="rounded-lg border border-[#E5E6EB] bg-card p-4 transition-colors hover:border-[#165DFF]/30">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <GraduationCap className="h-4 w-4 text-[#165DFF]" />
                  <span>已评价带教</span>
                </div>
                <p className="mt-1 text-2xl font-semibold text-foreground">
                  {MOCK_PLATFORM_STATS.certifiedMentors.toLocaleString()}
                </p>
              </div>
              <div className="rounded-lg border border-[#E5E6EB] bg-card p-4 transition-colors hover:border-[#165DFF]/30">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-[#165DFF]" />
                  <span>已上链评价</span>
                </div>
                <p className="mt-1 text-2xl font-semibold text-foreground">
                  {MOCK_PLATFORM_STATS.chainReviews.toLocaleString()}
                </p>
              </div>
              <div className="rounded-lg border border-[#E5E6EB] bg-card p-4 transition-colors hover:border-[#165DFF]/30">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="h-4 w-4 text-[#165DFF]" />
                  <span>已验证用户</span>
                </div>
                <p className="mt-1 text-2xl font-semibold text-foreground">
                  {MOCK_PLATFORM_STATS.verifiedUsers.toLocaleString()}
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 企业榜单 */}
      <section className="border-b border-border/60">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
                热门企业榜单
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                按机构声誉分排序
              </p>
            </div>
            <Link
              href="/company-ranking"
              className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-[#165DFF] hover:underline sm:mt-0"
            >
              查看全部 <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            {loading
              ? Array.from({ length: 4 }).map((_, i) => <CompanyCardSkeleton key={i} />)
              : topCompanies.map((company) => (
                  <Link key={company.id} href={`/company/${encodeURIComponent(company.id)}`}>
                    <Card
                      className={cn(
                        "group h-full cursor-pointer overflow-hidden transition-all hover:-translate-y-1 hover:border-[#165DFF]/50 hover:shadow-md",
                        company.rank <= 3 && "relative overflow-hidden border-[#165DFF]/30",
                      )}
                    >
                      {company.rank <= 3 && (
                        <div
                          className={cn(
                            "pointer-events-none absolute inset-0 opacity-30",
                            rankColor(company.rank),
                          )}
                        />
                      )}
                      <CardContent className="relative p-4">
                        <div className="flex items-start gap-3">
                          {/* 企业图标 */}
                          <div className="relative">
                            {company.icon ? (
                              <img
                                src={company.icon}
                                alt={company.name}
                                className="h-11 w-11 rounded-xl object-cover shadow-sm"
                              />
                            ) : (
                              <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-border/60 bg-muted/50">
                                <Building2 className="h-5 w-5 text-[#165DFF]" />
                              </div>
                            )}
                            {company.rank <= 3 && (
                              <div className={cn(
                                "absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold text-white",
                                company.rank === 1 && "bg-amber-500",
                                company.rank === 2 && "bg-slate-400",
                                company.rank === 3 && "bg-orange-500",
                              )}>
                                {company.rank}
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-foreground truncate group-hover:text-[#165DFF]">
                              {company.name}
                            </p>
                            <p className="mt-0.5 text-xs text-muted-foreground truncate">
                              {company.industry}
                            </p>
                          </div>
                        </div>
                        <div className="mt-3 flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">{company.region}</span>
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                            <span className="font-semibold text-[#165DFF]">
                              {company.score.toFixed(1)}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
          </div>
        </div>
      </section>

      {/* 最新评价预览区 */}
      <section className="border-b border-border/60">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
                最新评价
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                最近提交的带教评价
              </p>
            </div>
            <Link
              href="/search"
              className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-[#165DFF] hover:underline sm:mt-0"
            >
              评价广场
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {loading
              ? Array.from({ length: 4 }).map((_, i) => <ReviewCardSkeleton key={i} />)
              : latestReviews.map((review) => (
                  <Card key={review.id} className="p-4 transition-shadow hover:shadow-sm relative">
                    {/* 评价时间 - 右上角 */}
                    <div className="absolute top-3 right-3 text-xs text-muted-foreground">
                      {review.date}
                    </div>

                    {/* 公司和部门 */}
                    <div className="flex items-center gap-2 pr-16">
                      <Badge variant="outline" className="h-5 text-[9px] border-[#165DFF]/30 bg-[#165DFF]/5 text-[#165DFF]">
                        {review.type === "company" ? "企业" : "带教"}
                      </Badge>
                      <span className="text-sm font-medium text-foreground truncate">
                        {review.companyName || "某公司"}
                      </span>
                    </div>
                    {review.department && (
                      <p className="mt-0.5 text-xs text-muted-foreground truncate pr-16">
                        {review.department}
                      </p>
                    )}

                    {/* 评分 */}
                    <div className="mt-2 flex items-center gap-2">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex items-center gap-0.5 cursor-help">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                  key={i}
                                  className={cn(
                                    "h-3 w-3",
                                    i < review.rating
                                      ? "fill-amber-400 text-amber-400"
                                      : "fill-muted text-muted",
                                  )}
                                />
                              ))}
                            </div>
                          </TooltipTrigger>
                          {review.dimScores && (
                            <TooltipContent sideOffset={5}>
                              <RadarChart
                                data={[
                                  { label: "成长", value: review.dimScores.growth },
                                  { label: "清晰", value: review.dimScores.clarity },
                                  { label: "沟通", value: review.dimScores.communication },
                                  { label: "强度", value: review.dimScores.workload },
                                  { label: "尊重", value: review.dimScores.respect },
                                ]}
                                size={120}
                              />
                            </TooltipContent>
                          )}
                        </Tooltip>
                      </TooltipProvider>
                      <span className="text-sm font-semibold text-[#165DFF]">
                        {review.rating}.0
                      </span>
                    </div>

                    {/* 评价内容 */}
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground line-clamp-2">
                      {review.comment}
                    </p>

                    {/* 权限控制：未核验用户查看完整评价 */}
                    {/* {!isVerified && review.comment.length > 80 && (
                      <Button
                        variant="link"
                        size="sm"
                        className="mt-2 h-auto p-0 text-[#165DFF]"
                        onClick={() => router.push("/auth")}
                      >
                        查看完整评价（需先完成身份核验）
                      </Button>
                    )} */}

                    {/* 标签 */}
                    <div className="mt-3">
                      {review.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {review.tags.slice(0, 3).map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-[10px]">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
          </div>
        </div>
      </section>

      {/* 底部 CTA */}
      <section className="bg-muted/30">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
          <Card className="border-[#E5E6EB] bg-gradient-to-r from-[#165DFF]/5 to-[#0E42D2]/5 p-6 sm:p-8">
            <div className="flex flex-col items-center text-center sm:flex-row sm:text-left sm:items-start sm:justify-between">
              <div>
                <h3 className="text-lg font-semibold text-foreground">
                  连接钱包，发表你的评价
                </h3>
                <p className="mt-2 max-w-md text-sm text-muted-foreground">
                  真实带教体验值得被更多人看见。完成身份核验后即可为企业或带教留下评价，所有数据上链存证。
                </p>
              </div>
              <Button
                className="mt-4 bg-[#165DFF] hover:bg-[#0E42D2] sm:mt-0"
                size="lg"
                onClick={() => router.push("/auth")}
              >
                立即参与
              </Button>
            </div>
          </Card>
        </div>
      </section>

      {/* 底部合规提示 */}
      <div className="border-t border-border/60 bg-muted/20">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
          <p className="text-center text-xs text-muted-foreground">
            本平台所有评价均来源于真实带教经历，链上核验评价已通过区块链技术确权，不可篡改。
            评价内容仅代表学员个人观点，不代表平台立场。如有问题请联系平台管理员。
          </p>
        </div>
      </div>
    </div>
  );
}
