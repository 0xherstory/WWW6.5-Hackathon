import { motion } from "framer-motion";
import { formatEther } from "viem";
import { Activity, BarChart3, Flame, RefreshCcw, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePactaDashboard } from "@/hooks/usePactaDashboard";

export default function Overview() {
  const {
    demoMode,
    wallet,
    overview,
    pacts,
    isLoading,
    resetDemoData,
    isResettingDemoData,
  } = usePactaDashboard();

  const completionPercent = Math.round((overview?.completionRate ?? 0) * 100);
  const totalStaked = overview ? Number.parseFloat(formatEther(BigInt(overview.totalStakedWei))).toFixed(3) : "0.000";

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4"
      >
        <div>
          <h1 className="text-5xl font-hand font-bold text-foreground flex items-center gap-3">
            <BarChart3 className="w-10 h-10 text-primary" />
            用户总览
          </h1>
          <p className="text-muted-foreground mt-2">
            {demoMode ? "演示后端生成的整体坚持报告" : "基于链上挑战与后端承接记录的整体坚持报告"}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {demoMode && (
            <Button
              type="button"
              variant="secondary"
              className="font-hand border border-border"
              disabled={isResettingDemoData}
              onClick={() => void resetDemoData()}
            >
              <RefreshCcw className="w-4 h-4" />
              {isResettingDemoData ? "重置中…" : "重置演示数据"}
            </Button>
          )}
          <div className="paper-card px-4 py-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Wallet className="w-4 h-4 text-primary" />
              <span className="font-mono text-foreground">{wallet.slice(0, 8)}…{wallet.slice(-4)}</span>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="grid grid-cols-2 lg:grid-cols-5 gap-4"
      >
        {[
          { label: "挑战总数", value: overview?.totalPacts ?? 0, suffix: "个", icon: "🧾" },
          { label: "进行中", value: overview?.activePacts ?? 0, suffix: "个", icon: "🔥" },
          { label: "累计打卡", value: overview?.totalCheckins ?? 0, suffix: "次", icon: "✅" },
          { label: "最佳连续", value: overview?.bestStreak ?? 0, suffix: "天", icon: "🏆" },
          { label: "总质押", value: totalStaked, suffix: " AVAX", icon: "⛓️" },
        ].map((item) => (
          <div key={item.label} className="paper-card p-4 text-center">
            <span className="text-2xl block">{item.icon}</span>
            <p className="font-hand text-3xl font-bold text-foreground mt-1">
              {isLoading ? "—" : item.value}
              <span className="text-sm text-muted-foreground font-body">{item.suffix}</span>
            </p>
            <p className="text-xs text-muted-foreground font-body">{item.label}</p>
          </div>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2 space-y-6"
        >
          <div className="paper-card p-6">
            <div className="flex items-center gap-2 mb-4">
              <Activity className="w-5 h-5 text-primary" />
              <h2 className="font-hand text-2xl font-bold text-foreground">整体节奏</h2>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">完成率</span>
                <span className="font-hand text-lg text-foreground">{completionPercent}%</span>
              </div>
              <div className="h-3 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full bg-primary transition-all"
                  style={{ width: `${completionPercent}%` }}
                />
              </div>
              <p className="text-sm text-muted-foreground leading-6">
                当前活跃连续天数 {overview?.currentActiveStreak ?? 0} 天，系统会持续根据打卡记录更新整体坚持报告。
              </p>
            </div>
          </div>

          <div className="paper-card p-6">
            <div className="flex items-center gap-2 mb-4">
              <Flame className="w-5 h-5 text-primary" />
              <h2 className="font-hand text-2xl font-bold text-foreground">当前挑战亮点</h2>
            </div>
            <div className="space-y-3">
              {pacts.slice(0, 4).map((pact) => (
                <div key={pact.id.toString()} className="rounded-2xl border border-border/70 px-4 py-4">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <h3 className="font-hand text-xl text-foreground">{pact.habitName}</h3>
                    <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
                      连续 {pact.currentStreak} 天
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground leading-6">{pact.summary}</p>
                  {pact.latestEncouragement && (
                    <p className="text-sm text-primary mt-2">“{pact.latestEncouragement}”</p>
                  )}
                </div>
              ))}

              {!isLoading && pacts.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  还没有挑战数据，先创建一个微习惯，报告就会开始累计。
                </p>
              )}
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.12 }}
          className="space-y-6"
        >
          <div className="paper-card p-6">
            <h2 className="font-hand text-2xl font-bold text-foreground mb-4">分类分布</h2>
            <div className="space-y-3">
              {(overview?.categories ?? []).map((item) => (
                <div key={item.category} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{item.category}</span>
                  <span className="font-hand text-lg text-foreground">{item.count}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="paper-card p-6">
            <h2 className="font-hand text-2xl font-bold text-foreground mb-4">下一步建议</h2>
            <div className="space-y-3">
              {(overview?.recommendations ?? []).map((item) => (
                <div key={item} className="rounded-2xl border border-primary/10 bg-primary/5 px-4 py-3 text-sm text-foreground leading-6">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
