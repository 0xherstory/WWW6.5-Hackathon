import Link from "next/link";
import { ArrowUpRight, Building2, MapPin, Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { MockCompanyRank } from "@/data/home-mock";
import { cn } from "@/lib/utils";

function rankColor(rank: number) {
  if (rank === 1) return "from-amber-400/30 to-amber-600/10";
  if (rank === 2) return "from-slate-300/30 to-slate-500/10";
  if (rank === 3) return "from-orange-400/30 to-orange-600/10";
  return "";
}

export function CompanyTopGrid({ items }: { items: MockCompanyRank[] }) {
  return (
    <section className="border-t border-border/60 bg-muted/20">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
              Top 10 企业
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              按机构声誉分排序（演示数据）
            </p>
          </div>
          <Link
            href="/companies"
            className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-[#165DFF] hover:underline sm:mt-0"
          >
            查看完整榜单
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
          {items.map((c) => (
            <Link key={c.id} href={`/company/${encodeURIComponent(c.id)}`}>
              <Card
                className={cn(
                  "group h-full cursor-pointer transition-all hover:-translate-y-1 hover:border-[#165DFF]/50 hover:shadow-lg",
                  c.rank <= 3 && "relative overflow-hidden border-[#165DFF]/30",
                )}
              >
                {c.rank <= 3 && (
                  <div
                    className={cn(
                      "pointer-events-none absolute inset-0 opacity-50",
                      rankColor(c.rank),
                    )}
                  />
                )}

                <CardHeader className="relative flex flex-row items-start gap-4 space-y-0 pb-3">
                  <div className={cn(
                    "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-border/80 bg-muted/50 transition-colors group-hover:border-[#165DFF]/40",
                    c.rank === 1 && "border-amber-400/50 bg-amber-50 dark:bg-amber-950/30",
                    c.rank === 2 && "border-slate-400/50 bg-slate-50 dark:bg-slate-950/30",
                    c.rank === 3 && "border-orange-400/50 bg-orange-50 dark:bg-orange-950/30",
                  )}>
                    <Building2 className={cn(
                      "h-6 w-6",
                      c.rank === 1 && "text-amber-600 dark:text-amber-400",
                      c.rank === 2 && "text-slate-600 dark:text-slate-400",
                      c.rank === 3 && "text-orange-600 dark:text-orange-400",
                      c.rank > 3 && "text-[#165DFF]",
                    )} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge
                        variant="secondary"
                        className={cn(
                          "font-mono",
                          c.rank === 1 && "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400",
                          c.rank === 2 && "bg-slate-100 text-slate-700 dark:bg-slate-950/50 dark:text-slate-400",
                          c.rank === 3 && "bg-orange-100 text-orange-700 dark:bg-orange-950/50 dark:text-orange-400",
                        )}
                      >
                        #{c.rank}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {c.industry}
                      </span>
                    </div>
                    <CardTitle className="mt-1.5 text-lg leading-tight group-hover:text-[#165DFF] transition-colors">
                      {c.name}
                    </CardTitle>
                    <CardDescription className="mt-1 flex items-center gap-1 text-xs">
                      <MapPin className="h-3.5 w-3.5 shrink-0" />
                      {c.region}
                    </CardDescription>
                  </div>
                  <div className="text-right">
                    <p className={cn(
                      "text-2xl font-semibold tabular-nums",
                      c.rank === 1 && "text-amber-600 dark:text-amber-400",
                      c.rank === 2 && "text-slate-600 dark:text-slate-400",
                      c.rank === 3 && "text-orange-600 dark:text-orange-400",
                      c.rank > 3 && "text-[#165DFF]",
                    )}>
                      {c.score.toFixed(1)}
                    </p>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      声誉分
                    </p>
                  </div>
                </CardHeader>
                <CardContent className="relative pb-5">
                  <p className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    合作带教{" "}
                    <span className="font-medium text-foreground">
                      {c.mentorLinked}
                    </span>{" "}
                    位
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
