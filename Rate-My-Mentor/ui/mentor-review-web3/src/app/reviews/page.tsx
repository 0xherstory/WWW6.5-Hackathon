"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Search, Star, Clock, ArrowUpRight, ShieldCheck } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  MOCK_REVIEWS,
  sortByNewest,
  sortByScore,
  type ReviewItem,
} from "@/data/review-list-mock";
import { cn } from "@/lib/utils";

// 5个维度标签
const DIM_LABELS = [
  { en: "Growth", zh: "成长支持" },
  { en: "Clarity", zh: "目标清晰度" },
  { en: "Communication", zh: "沟通质量" },
  { en: "Workload", zh: "工作强度" },
  { en: "Respect", zh: "尊重包容" },
];

// 格式化时间
function formatTimeAgo(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const days = Math.floor(diff / (24 * 60 * 60 * 1000));
  const hours = Math.floor(diff / (60 * 60 * 1000));
  const minutes = Math.floor(diff / (60 * 1000));

  if (days > 30) {
    return new Date(timestamp).toLocaleDateString("zh-CN", {
      month: "short",
      day: "numeric",
    });
  }
  if (days > 0) return `${days}天前`;
  if (hours > 0) return `${hours}小时前`;
  if (minutes > 0) return `${minutes}分钟前`;
  return "刚刚";
}

// 评价卡片组件
function ReviewCard({
  review,
}: {
  review: ReviewItem;
}) {
  const [expanded, setExpanded] = useState(false);
  const lines = review.content.split("\n").length;
  const isLongContent = lines > 3 || review.content.length > 150;

  return (
    <Card
      className={cn(
        "border-l-[2px] bg-white transition-all hover:shadow-sm",
        review.isPositive
          ? "border-l-[#00B42A]"
          : "border-l-[#F53F3F]"
      )}
    >
      <CardContent className="p-4">
        {/* 头部：公司和评分 */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-sm font-medium text-foreground">
                {review.companyName}
              </h3>
              <Badge variant="secondary" className="text-xs">
                {review.department}
              </Badge>
            </div>
            <div className="mt-1.5 flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    "h-3.5 w-3.5",
                    i < review.overallScore
                      ? "fill-amber-400 text-amber-400"
                      : "fill-muted text-muted"
                  )}
                />
              ))}
              <span className="ml-1 text-sm font-semibold text-[#165DFF]">
                {review.overallScore}.0
              </span>
            </div>
          </div>

          {/* 匿名标识 */}
          <div className="shrink-0 flex items-center gap-1 text-xs text-muted-foreground">
            <ShieldCheck className="h-3.5 w-3.5 text-green-500" />
            <span>匿名用户</span>
          </div>
        </div>

        {/* 评价内容 */}
        <div className="mt-3">
          <p
            className={cn(
              "text-sm leading-relaxed text-foreground/90",
              !expanded && isLongContent && "line-clamp-3"
            )}
          >
            {review.content}
          </p>
          {isLongContent && (
            <Button
              variant="link"
              size="sm"
              onClick={() => setExpanded(!expanded)}
              className="h-auto p-0 text-xs text-[#165DFF]"
            >
              {expanded ? "收起" : "展开全文"}
            </Button>
          )}
        </div>

        {/* 维度评分 */}
        <div className="mt-3 flex flex-wrap gap-2">
          {review.tags.map((tag) => (
            <Badge
              key={tag}
              variant="outline"
              className="text-xs font-normal"
            >
              {tag}
            </Badge>
          ))}
        </div>

        {/* 底部：时间和链上标识 */}
        <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>{formatTimeAgo(review.createdAt)}</span>
          </div>
          <div className="flex items-center gap-1">
            <ShieldCheck className="h-3 w-3 text-green-500" />
            <span>链上身份核验</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// 骨架屏
function ReviewCardSkeleton() {
  return (
    <Card className="border-l-[2px] border-l-muted bg-white">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 space-y-2">
            <div className="h-4 w-40 animate-pulse rounded bg-muted" />
            <div className="h-3 w-24 animate-pulse rounded bg-muted" />
          </div>
        </div>
        <div className="mt-3 space-y-2">
          <div className="h-3 w-full animate-pulse rounded bg-muted" />
          <div className="h-3 w-3/4 animate-pulse rounded bg-muted" />
        </div>
        <div className="mt-3 flex gap-2">
          <div className="h-5 w-16 animate-pulse rounded bg-muted" />
          <div className="h-5 w-16 animate-pulse rounded bg-muted" />
        </div>
      </CardContent>
    </Card>
  );
}

// 主组件
export default function ReviewsPage() {
  const [sortBy, setSortBy] = useState<"newest" | "score">("newest");
  const [filter, setFilter] = useState<"all" | "positive" | "negative">("all");

  const filteredReviews = useMemo(() => {
    let reviews = MOCK_REVIEWS;
    if (filter === "positive") {
      reviews = reviews.filter((r) => r.isPositive);
    } else if (filter === "negative") {
      reviews = reviews.filter((r) => !r.isPositive);
    }
    return sortBy === "newest" ? sortByNewest(reviews) : sortByScore(reviews);
  }, [sortBy, filter]);

  const positiveCount = MOCK_REVIEWS.filter((r) => r.isPositive).length;
  const negativeCount = MOCK_REVIEWS.filter((r) => !r.isPositive).length;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* 头部 */}
      <div className="border-b border-border/60 bg-muted/20">
        <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">评价广场</h1>
            <p className="text-sm text-muted-foreground">
              匿名评价，链上存证，真实反映职场体验
            </p>
          </div>
        </div>
      </div>

      {/* 筛选和排序 */}
      <div className="border-b border-border/60 bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-4">
            <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
              <TabsList className="bg-muted/50">
                <TabsTrigger
                  value="all"
                  className="data-[state=active]:bg-[#165DFF] data-[state=active]:text-white"
                >
                  全部 ({MOCK_REVIEWS.length})
                </TabsTrigger>
                <TabsTrigger
                  value="positive"
                  className="data-[state=active]:bg-[#165DFF] data-[state=active]:text-white"
                >
                  正面 ({positiveCount})
                </TabsTrigger>
                <TabsTrigger
                  value="negative"
                  className="data-[state=active]:bg-[#165DFF] data-[state=active]:text-white"
                >
                  负面 ({negativeCount})
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">排序:</span>
            <Tabs value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
              <TabsList className="bg-muted/50">
                <TabsTrigger
                  value="newest"
                  className="data-[state=active]:bg-[#165DFF] data-[state=active]:text-white"
                >
                  最新发布
                </TabsTrigger>
                <TabsTrigger
                  value="score"
                  className="data-[state=active]:bg-[#165DFF] data-[state=active]:text-white"
                >
                  评分高低
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
      </div>

      {/* 评价列表 */}
      <div className="flex-1 bg-muted/10">
        <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
          {filteredReviews.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Search className="h-12 w-12 text-muted-foreground" />
              <h2 className="mt-4 text-lg font-semibold">暂无评价</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                成为第一个评价的人吧
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredReviews.map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 底部提示 */}
      <div className="border-t border-border/60 bg-muted/10 py-6">
        <div className="mx-auto max-w-4xl px-4 text-center text-xs text-muted-foreground sm:px-6">
          <p>评价内容仅代表个人观点，不构成投资建议。平台不对内容准确性负责。</p>
          <p className="mt-1">所有评价数据均在链上存证，确保真实不可篡改。</p>
        </div>
      </div>
    </div>
  );
}
