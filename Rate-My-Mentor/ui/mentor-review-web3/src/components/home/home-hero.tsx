import Link from "next/link";
import { Building2, Sparkles } from "lucide-react";
import { SearchBar } from "@/components/common/search-bar";

import { Button } from "@/components/ui/button";
import { appConfig } from "@/lib/config";
import { cn } from "@/lib/utils";

const cta = [
  {
    href: "/review",
    label: "写评价",
    sub: "为企业留下评价",
    icon: Sparkles,
    className:
      "border-[#165DFF]/40 bg-[#165DFF]/10 text-foreground hover:bg-[#165DFF]/20",
  },
  {
    href: "/company-ranking",
    label: "企业榜单",
    sub: "查看合作机构榜单",
    icon: Building2,
    className:
      "border-border bg-card hover:bg-muted/60",
  },
] as const;

const stats = [
  { value: "10K+", label: "评价记录" },
  { value: "2.8K", label: "入驻企业" },
  { value: "500+", label: "合作机构" },
] as const;

export function HomeHero() {
  return (
    <section className="relative overflow-hidden border-b border-border/60">
      {/* Background effects */}
      <div className="pointer-events-none absolute inset-0 bg-grid-pattern" aria-hidden />
      <div
        className="pointer-events-none absolute -left-1/4 top-0 h-[500px] w-[500px] rounded-full bg-[#165DFF]/10 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-1/4 bottom-0 h-[420px] w-[420px] rounded-full bg-[#0E42D2]/10 blur-3xl"
        aria-hidden
      />

      <div className="relative mx-auto max-w-6xl px-4 pb-14 pt-12 sm:px-6 sm:pb-20 sm:pt-20">
        <div className="flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#165DFF]/30 bg-[#165DFF]/10 px-4 py-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#165DFF] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#165DFF]" />
            </span>
            <span className="text-xs font-medium text-[#165DFF]">Web3 带教评价平台</span>
          </div>

          <h1 className="mt-6 max-w-4xl text-balance text-4xl font-semibold tracking-tight text-foreground sm:text-5xl md:text-6xl">
            {appConfig.name}
          </h1>
          <p className="mt-6 max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg md:text-xl">
            连接钱包，为优秀企业留下可验证评价。所有评价上链存证，不可篡改。
          </p>

          {/* Search Bar */}
          <div className="mt-8 flex w-full justify-center">
            <SearchBar />
          </div>

          {/* Stats */}
          <div className="mt-10 flex flex-wrap justify-center gap-8 sm:gap-12">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">{s.value}</p>
                <p className="mt-1 text-sm text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="mt-12 grid w-full max-w-lg gap-3 sm:grid-cols-2 sm:gap-4">
            {cta.map((item) => {
              const Icon = item.icon;
              return (
                <Button
                  key={item.href}
                  asChild
                  variant="outline"
                  size="lg"
                  className={cn(
                    "h-auto w-full flex-col items-start gap-2 rounded-xl px-5 py-4 text-left shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg",
                    item.className,
                  )}
                >
                  <Link href={item.href}>
                    <span className="flex w-full items-center gap-2">
                      <Icon className="h-5 w-5 shrink-0 text-[#165DFF]" />
                      <span className="text-base font-semibold">{item.label}</span>
                    </span>
                    <span className="text-xs font-normal text-muted-foreground">
                      {item.sub}
                    </span>
                  </Link>
                </Button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom fade */}
      <div className="pointer-events-none absolute bottom-0 inset-x-0 h-24 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
}