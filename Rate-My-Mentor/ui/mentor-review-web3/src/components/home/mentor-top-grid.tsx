import Link from "next/link";
import { ArrowUpRight, Star, TrendingUp } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { MockMentorRank } from "@/data/home-mock";
import { cn } from "@/lib/utils";

function initials(name: string) {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

function rankColor(rank: number) {
  if (rank === 1) return "from-amber-400 to-amber-600";
  if (rank === 2) return "from-slate-300 to-slate-500";
  if (rank === 3) return "from-orange-400 to-orange-600";
  return "";
}

export function MentorTopGrid({ items }: { items: MockMentorRank[] }) {
  return (
    <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
            Top 10 Mentor
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            按综合评分与评价量排序（演示数据）
          </p>
        </div>
        <Link
          href="/mentors"
          className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-accent hover:underline sm:mt-0"
        >
          查看完整榜单
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {items.map((m) => (
          <Link key={m.id} href={`/mentor/${encodeURIComponent(m.id)}`}>
            <Card
              className={cn(
                "group h-full cursor-pointer transition-all hover:-translate-y-1 hover:border-accent/50 hover:shadow-lg",
                m.rank <= 3 && "relative overflow-hidden border-accent/30 bg-accent/[0.02]",
              )}
            >
              {m.rank <= 3 && (
                <div
                  className={cn(
                    "pointer-events-none absolute inset-0 bg-gradient-to-br opacity-40",
                    rankColor(m.rank),
                  )}
                />
              )}

              <CardHeader className="relative space-y-3 pb-2">
                <div className="flex items-start justify-between gap-2">
                  <Badge
                    variant={m.rank <= 3 ? "accent" : "secondary"}
                    className={cn(
                      "font-mono tabular-nums",
                      m.rank === 1 && "bg-amber-500/20 text-amber-600 dark:text-amber-400",
                    )}
                  >
                    #{m.rank}
                  </Badge>
                  {m.trendPct !== 0 && (
                    <span
                      className={cn(
                        "inline-flex items-center gap-0.5 text-xs font-medium",
                        m.trendPct > 0 ? "text-accent" : "text-muted-foreground",
                      )}
                    >
                      <TrendingUp
                        className={cn(
                          "h-3.5 w-3.5",
                          m.trendPct < 0 && "rotate-180",
                        )}
                      />
                      {m.trendPct > 0 ? "+" : ""}
                      {m.trendPct}%
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <Avatar className={cn(
                    "h-11 w-11 border-2 transition-colors group-hover:border-accent/50",
                    m.rank === 1 && "border-amber-400/50",
                    m.rank === 2 && "border-slate-400/50",
                    m.rank === 3 && "border-orange-400/50",
                  )}>
                    <AvatarFallback className={cn(
                      "bg-gradient-to-br text-xs font-bold text-white",
                      m.rank === 1 && "from-amber-500 to-amber-700",
                      m.rank === 2 && "from-slate-500 to-slate-700",
                      m.rank === 3 && "from-orange-500 to-orange-700",
                      m.rank > 3 && "from-zinc-800 to-zinc-600 dark:from-zinc-200 dark:to-zinc-400 dark:text-zinc-900",
                    )}>
                      {initials(m.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <CardTitle className="truncate text-base leading-tight">
                      {m.name}
                    </CardTitle>
                    <CardDescription className="truncate text-xs">
                      {m.title}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="relative space-y-2 pb-5">
                <p className="line-clamp-2 text-xs text-muted-foreground">
                  {m.domain}
                </p>
                <div className="flex items-center justify-between text-sm">
                  <span className="inline-flex items-center gap-1 font-medium text-foreground">
                    <Star className="h-4 w-4 fill-accent/80 text-accent" />
                    {m.rating.toFixed(2)}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {m.reviewCount} 条评价
                  </span>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
}