"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle2, ChevronRight, ExternalLink, Shield, Star } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { MOCK_MENTOR_DETAIL, getMentorReviews } from "@/data/detail-mock";
import type { ReviewItem } from "@/data/detail-mock";
import { cn } from "@/lib/utils";

type PageProps = {
  params: { id: string };
};

// 5个固定中英双语维度
const DIM_LABELS = [
  { en: "Growth Support", zh: "成长带教支持" },
  { en: "Expectation Clarity", zh: "带教目标清晰度" },
  { en: "Communication Quality", zh: "带教沟通质量" },
  { en: "Workload Sustainability", zh: "带教节奏合理性" },
  { en: "Respect & Inclusion", zh: "职场尊重与包容" },
] as const;

function initials(name: string) {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

function addr(address: string) {
  if (!address) return "";
  return address.length > 14 ? `${address.slice(0, 8)}...${address.slice(-6)}` : address;
}

function truncateAddress(address: string, chars = 4) {
  if (!address) return "";
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}

// 模拟5维度数据（后续替换为合约返回数据）
function getDimScores(mentorRating: number): number[] {
  const base = mentorRating;
  return [
    Math.min(5, base + Math.random() * 0.3 - 0.1),
    Math.min(5, base + Math.random() * 0.3 - 0.1),
    Math.min(5, base + Math.random() * 0.3 - 0.1),
    Math.min(5, base + Math.random() * 0.3 - 0.1),
    Math.min(5, base + Math.random() * 0.3 - 0.1),
  ].map(v => Math.round(v * 10) / 10);
}

// 模拟带教成果案例
interface Achievement {
  id: string;
  title: string;
  description: string;
  period: string;
  verified: boolean;
}

function getAchievements(mentorId: string): Achievement[] {
  return [
    { id: "a1", title: "主导 DeFi 协议架构设计", description: "带领团队完成新一代DEX协议核心架构，关键创新点获社区认可", period: "2025 Q3", verified: true },
    { id: "a2", title: "培养 3 名初级开发者", description: "通过一对一指导，帮助新人完成首个智能合约项目上线", period: "2025 Q4", verified: true },
    { id: "a3", title: "建立团队代码审查机制", description: "推动实施强制代码审查，漏洞发现率提升 40%", period: "2026 Q1", verified: true },
  ];
}

// 模拟用户身份核验状态（后续替换为真实 SBT 检查）
function checkUserVerified(): boolean {
  if (typeof window === "undefined") return false;
  const sbt = localStorage.getItem("rmm_sbt");
  return !!sbt;
}

// 加载骨架屏组件
function MentorCardSkeleton() {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex flex-col items-center">
          <div className="h-16 w-16 animate-pulse rounded-full bg-muted" />
          <div className="mt-3 h-5 w-32 animate-pulse rounded bg-muted" />
          <div className="mt-1 h-4 w-24 animate-pulse rounded bg-muted" />
          <div className="mt-2 flex gap-1.5">
            <div className="h-5 w-12 animate-pulse rounded bg-muted" />
            <div className="h-5 w-12 animate-pulse rounded bg-muted" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function DimensionSkeleton() {
  return (
    <div className="space-y-2">
      <div className="flex justify-between">
        <div className="h-4 w-24 animate-pulse rounded bg-muted" />
        <div className="h-4 w-8 animate-pulse rounded bg-muted" />
      </div>
      <div className="h-2 w-full animate-pulse rounded-full bg-muted" />
    </div>
  );
}

function ReviewCardSkeleton() {
  return (
    <Card className="p-5">
      <div className="flex gap-3">
        <div className="h-9 w-9 animate-pulse rounded-full bg-muted" />
        <div className="flex-1 space-y-2">
          <div className="flex gap-2">
            <div className="h-4 w-20 animate-pulse rounded bg-muted" />
            <div className="h-4 w-16 animate-pulse rounded bg-muted" />
          </div>
          <div className="h-3 w-full animate-pulse rounded bg-muted" />
          <div className="h-3 w-3/4 animate-pulse rounded bg-muted" />
        </div>
      </div>
    </Card>
  );
}

export default function MentorDetailPage({ params }: PageProps) {
  const router = useRouter();
  const id = decodeURIComponent(params.id);
  const mentor = MOCK_MENTOR_DETAIL[id];
  const allReviews = getMentorReviews(id);
  const achievements = getAchievements(id);

  const [loading, setLoading] = useState(true);
  const [isVerified, setIsVerified] = useState(false);
  const [filter, setFilter] = useState<"all" | "verified">("all");
  const [sortBy, setSortBy] = useState<"recent" | "rating">("recent");
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const [expandedReview, setExpandedReview] = useState<string | null>(null);

  // 模拟加载延迟
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  // 检查用户身份核验状态
  useEffect(() => {
    setIsVerified(checkUserVerified());
  }, []);

  if (!mentor) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="mb-6">
          <Link href="/mentors">
            <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground">
              <ChevronRight className="h-4 w-4 rotate-180" />
              返回榜单
            </Button>
          </Link>
        </div>
        <div className="text-center">
          <h1 className="text-2xl font-semibold">企业未找到</h1>
          <p className="mt-2 text-muted-foreground">ID: {id}</p>
        </div>
      </div>
    );
  }

  // 5维度数据
  const dimScores = getDimScores(mentor.rating);

  // 筛选和排序评价
  const filteredReviews = allReviews
    .filter(r => filter === "verified" ? !!r.txHash : true)
    .sort((a, b) => {
      if (sortBy === "rating") return b.rating - a.rating;
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });

  const verifiedCount = allReviews.filter(r => r.txHash).length;

  // 渲染带教能力维度看板
  function renderDimensionBoard() {
    return (
      <div className="space-y-4">
        {DIM_LABELS.map((dim, i) => (
          <div key={dim.en} className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-sm">
                <span className="font-medium text-foreground">{dim.zh}</span>
                <span className="ml-1.5 text-xs text-muted-foreground">({dim.en})</span>
              </span>
              <span className="text-sm font-semibold" style={{ color: "#165DFF" }}>
                {dimScores[i].toFixed(1)}
              </span>
            </div>
            <Progress value={dimScores[i] * 20} className="h-2" />
          </div>
        ))}
      </div>
    );
  }

  // 渲染单条评价卡片
  function renderReviewCard(review: ReviewItem) {
    const isExpanded = expandedReview === review.id;
    const showTruncated = !isVerified && review.comment.length > 80;

    return (
      <Card key={review.id} className="p-5 transition-shadow hover:shadow-sm">
        <div className="flex items-start gap-3">
          <Avatar className="h-9 w-9 shrink-0">
            <AvatarFallback className="bg-gradient-to-br from-[#165DFF]/10 to-[#0E42D2]/10 text-xs font-medium text-[#165DFF]">
              {initials(review.author)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-medium text-foreground">{review.author}</span>
              {review.txHash && (
                <Badge variant="outline" className="h-5 gap-1 text-[9px] border-[#165DFF]/30 bg-[#165DFF]/5 text-[#165DFF]">
                  <CheckCircle2 className="h-2.5 w-2.5" />
                  链上核验
                </Badge>
              )}
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={cn("h-3 w-3", i < review.rating ? "fill-amber-400 text-amber-400" : "fill-muted text-muted")} />
                ))}
              </div>
            </div>
            <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
              <span>{review.date}</span>
              {review.authorAddress && <span className="font-mono">{truncateAddress(review.authorAddress)}</span>}
            </div>
          </div>
          {review.txHash && (
            <a
              href={`https://testnet.snowtrace.io/tx/${review.txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border/60 bg-muted/40 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          )}
        </div>

        <div className="mt-3">
          {showTruncated && !isExpanded ? (
            <>
              <p className="text-sm leading-relaxed text-muted-foreground">{review.comment.slice(0, 80)}...</p>
              <Button
                variant="link"
                size="sm"
                className="h-auto p-0 text-[#165DFF]"
                onClick={() => setAuthDialogOpen(true)}
              >
                查看完整内容
              </Button>
            </>
          ) : (
            <p className="text-sm leading-relaxed text-foreground">{review.comment}</p>
          )}
        </div>

        {review.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {review.tags.map(tag => (
              <Badge key={tag} variant="secondary" className="text-[10px]">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {/* 维度评分 */}
        <div className="mt-3 flex flex-wrap gap-2 border-t border-border/40 pt-3">
          {DIM_LABELS.slice(0, 3).map((dim, i) => (
            <div key={dim.en} className="flex items-center gap-1 rounded bg-muted/40 px-2 py-1">
              <span className="text-[10px] text-muted-foreground">{dim.zh}</span>
              <span className="text-xs font-semibold" style={{ color: "#165DFF" }}>{dimScores[i].toFixed(1)}</span>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* 顶部导航栏由 layout 提供 */}

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        {/* 面包屑导航 */}
        <nav className="mb-6 flex items-center gap-1.5 text-sm">
          <Link href="/" className="text-muted-foreground hover:text-foreground">首页</Link>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
          <Link href="/companies" className="text-muted-foreground hover:text-foreground">企业榜单</Link>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium text-foreground">{mentor.name}</span>
        </nav>

        <div className="grid gap-6 lg:grid-cols-12">
          {/* 左侧边栏 */}
          <aside className="lg:col-span-4">
            <div className="sticky top-20 space-y-4">
              {loading ? (
                <>
                  <MentorCardSkeleton />
                  <Card>
                    <CardHeader className="pb-3"><CardTitle className="text-sm">带教能力维度</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                      {Array.from({ length: 5 }).map((_, i) => <DimensionSkeleton key={i} />)}
                    </CardContent>
                  </Card>
                </>
              ) : (
                <>
                  {/* 企业商务名片 */}
                  <Card className="border-[#E5E6EB]">
                    <CardContent className="p-5">
                      <div className="flex flex-col items-center text-center">
                        <Avatar className="h-16 w-16 border-2 border-[#165DFF]/20 shadow-sm">
                          <AvatarFallback className="bg-gradient-to-br from-[#165DFF]/10 to-[#0E42D2]/10 text-lg font-bold text-[#165DFF]">
                            {initials(mentor.name)}
                          </AvatarFallback>
                        </Avatar>
                        <h1 className="mt-3 text-lg font-semibold text-foreground">{mentor.name}</h1>
                        <p className="mt-0.5 text-sm text-muted-foreground">{mentor.title}</p>
                        <div className="mt-1 flex flex-wrap justify-center gap-1.5">
                          {mentor.tags.map(tag => (
                            <Badge key={tag} variant="secondary" className="text-[10px]">{tag}</Badge>
                          ))}
                        </div>
                      </div>

                      {/* 整体评分 */}
                      <div className="mt-5 flex items-center justify-center gap-2">
                        <div className="flex">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} className={cn("h-5 w-5", i < Math.floor(mentor.rating) ? "fill-amber-400 text-amber-400" : "fill-muted text-muted")} />
                          ))}
                        </div>
                        <span className="text-2xl font-bold" style={{ color: "#165DFF" }}>{mentor.rating.toFixed(1)}</span>
                      </div>
                      <p className="mt-1 text-center text-sm text-muted-foreground">
                        基于 {mentor.reviewCount} 条带教评价
                      </p>

                      {/* 核心数据 */}
                      <div className="mt-4 grid grid-cols-3 gap-2 rounded-lg bg-muted/30 p-3">
                        <div className="text-center">
                          <div className="text-lg font-semibold" style={{ color: "#165DFF" }}>{mentor.reviewCount}</div>
                          <div className="text-[10px] text-muted-foreground">带教评价</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-semibold" style={{ color: "#165DFF" }}>{verifiedCount}</div>
                          <div className="text-[10px] text-muted-foreground">链上核验</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-semibold" style={{ color: "#165DFF" }}>{achievements.length}</div>
                          <div className="text-[10px] text-muted-foreground">带教成果</div>
                        </div>
                      </div>

                      {/* 链上核验标识 */}
                      {verifiedCount > 0 && (
                        <div className="mt-3 flex items-center justify-center gap-1.5 rounded-lg border border-[#165DFF]/20 bg-[#165DFF]/5 py-2">
                          <Shield className="h-4 w-4 text-[#165DFF]" />
                          <span className="text-xs font-medium text-[#165DFF]">链上核验企业</span>
                        </div>
                      )}

                      {/* 简介 */}
                      <div className="mt-4">
                        <p className="text-sm leading-relaxed text-muted-foreground">{mentor.bio}</p>
                      </div>

                      {/* 写评价按钮 */}
                      <Button
                        className="mt-4 w-full bg-[#165DFF] hover:bg-[#0E42D2]"
                        size="lg"
                        onClick={() => {
                          localStorage.setItem("rmm_mentor_name", mentor.name);
                          router.push("/review");
                        }}
                      >
                        写评价
                      </Button>
                    </CardContent>
                  </Card>

                  {/* 带教能力维度看板 */}
                  <Card className="border-[#E5E6EB]">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium">带教能力维度</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {renderDimensionBoard()}
                    </CardContent>
                  </Card>
                </>
              )}
            </div>
          </aside>

          {/* 右侧主内容 */}
          <div className="lg:col-span-8 space-y-6">
            {/* 带教成果案例 */}
            <Card className="border-[#E5E6EB]">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-medium">带教成果案例</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="grid gap-4 md:grid-cols-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="h-32 animate-pulse rounded-lg bg-muted" />
                    ))}
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-3">
                    {achievements.map(achievement => (
                      <div key={achievement.id} className="rounded-lg border border-[#E5E6EB] bg-muted/20 p-4 transition-colors hover:bg-muted/40">
                        <div className="flex items-start justify-between">
                          <h4 className="text-sm font-medium text-foreground">{achievement.title}</h4>
                          {achievement.verified && (
                            <CheckCircle2 className="h-4 w-4 text-[#165DFF]" />
                          )}
                        </div>
                        <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{achievement.description}</p>
                        <div className="mt-3 flex items-center justify-between">
                          <span className="text-[10px] text-muted-foreground">{achievement.period}</span>
                          {achievement.verified && (
                            <Badge variant="outline" className="h-5 text-[9px] border-[#165DFF]/30 bg-[#165DFF]/5 text-[#165DFF]">
                              已核验
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 评价列表 */}
            <Card className="border-[#E5E6EB]">
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <CardTitle className="text-base font-medium">带教评价</CardTitle>
                <div className="flex flex-wrap items-center gap-2">
                  {/* 筛选 */}
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant={filter === "all" ? "default" : "outline"}
                      className={cn("h-7 text-xs px-3", filter === "all" && "bg-[#165DFF] hover:bg-[#0E42D2]")}
                      onClick={() => setFilter("all")}
                    >
                      全部 ({allReviews.length})
                    </Button>
                    <Button
                      size="sm"
                      variant={filter === "verified" ? "default" : "outline"}
                      className={cn("h-7 text-xs px-3 gap-1.5", filter === "verified" && "bg-[#165DFF] hover:bg-[#0E42D2]")}
                      onClick={() => setFilter("verified")}
                    >
                      <Shield className="h-3 w-3" />
                      链上核验 ({verifiedCount})
                    </Button>
                  </div>
                  {/* 排序 */}
                  <select
                    value={sortBy}
                    onChange={e => setSortBy(e.target.value as "recent" | "rating")}
                    className="h-7 rounded-md border border-border bg-background px-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#165DFF]/20"
                  >
                    <option value="recent">最新优先</option>
                    <option value="rating">评分优先</option>
                  </select>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, i) => <ReviewCardSkeleton key={i} />)}
                  </div>
                ) : filteredReviews.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-[#E5E6EB] bg-muted/20 p-8 text-center">
                    <p className="text-sm text-muted-foreground">暂无符合条件的评价</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredReviews.map(review => renderReviewCard(review))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* 底部合规提示 */}
        <div className="mt-8 rounded-lg border border-[#E5E6EB] bg-muted/20 p-4">
          <p className="text-center text-xs text-muted-foreground">
            本平台所有评价均来源于真实带教经历，链上核验评价已通过区块链技术确权，不可篡改。
            评价内容仅代表学员个人观点，不代表平台立场。 如有问题请联系平台管理员。
          </p>
        </div>
      </main>

      {/* 身份核验提示对话框 */}
      <Dialog open={authDialogOpen} onOpenChange={setAuthDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-[#165DFF]" />
              查看完整评价
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              该评价内容仅对完成身份核验的用户开放查看权限。请先完成身份核验后查看完整评价内容。
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setAuthDialogOpen(false)}>
              取消
            </Button>
            <Button className="bg-[#165DFF] hover:bg-[#0E42D2]" onClick={() => router.push("/auth")}>
              前往核验
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
