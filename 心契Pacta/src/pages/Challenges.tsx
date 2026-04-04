import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";
import { formatEther } from "viem";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CalendarDays } from "lucide-react";
import PactaChainPanel from "@/components/PactaChainPanel";
import { usePactaDashboard } from "@/hooks/usePactaDashboard";
import { useMicroHabitStore } from "@/store/microHabitStore";
import { moduleMeta, type ReferenceModuleKey } from "@/data/microHabitReference";
import { toast } from "sonner";

export default function Challenges() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [editDrafts, setEditDrafts] = useState<
    Record<string, { title: string; quote: string; frequency: "daily" | "weekly"; reminderTime: string }>
  >({});
  const [customForm, setCustomForm] = useState<{
    title: string;
    quote: string;
    module: ReferenceModuleKey;
    frequency: "daily" | "weekly";
    reminderTime: string;
  }>({
    title: "",
    quote: "",
    module: "behavior",
    frequency: "daily",
    reminderTime: "21:00",
  });
  const { demoMode, isConnected, isFuji, pacts, rewardPoolWei, isLoading } = usePactaDashboard();
  const addedRefs = useMicroHabitStore((state) => state.added);
  const checkinToday = useMicroHabitStore((state) => state.checkinToday);
  const addCustomHabit = useMicroHabitStore((state) => state.addCustomHabit);
  const updateHabit = useMicroHabitStore((state) => state.updateHabit);
  const removeHabit = useMicroHabitStore((state) => state.removeHabit);
  const removeMany = useMicroHabitStore((state) => state.removeMany);

  const checkedDays = useMemo(
    () =>
      pacts
        .filter((p) => p.lastCheckin > 0n)
        .map((p) => new Date(Number(p.lastCheckin) * 1000)),
    [pacts],
  );

  const activePacts = pacts.filter((p) => !p.completed);
  const totalStaked = useMemo(
    () => pacts.reduce((acc, p) => acc + parseFloat(formatEther(p.totalStakeWei)), 0),
    [pacts],
  );
  const withCheckin = pacts.filter((p) => p.checkinCount > 0n).length;

  const poolLabel =
    rewardPoolWei !== undefined
      ? `${Number.parseFloat(formatEther(rewardPoolWei)).toFixed(4)}`
      : "—";

  const showStats = isConnected && isFuji && !isLoading;
  const todayKey = new Date().toISOString().slice(0, 10);
  const todayChecked = addedRefs.filter((item) => (item.checkins ?? []).includes(todayKey)).length;
  const refRate = addedRefs.length ? Math.round((todayChecked / addedRefs.length) * 100) : 0;

  const groupedRefs = useMemo(() => {
    const seed: Record<ReferenceModuleKey, typeof addedRefs> = {
      behavior: [],
      mindset: [],
      emotion: [],
      environment: [],
    };
    addedRefs.forEach((item) => {
      seed[item.module].push(item);
    });
    return seed;
  }, [addedRefs]);

  const onRefCheckin = (id: string) => {
    const result = checkinToday(id);
    if (result.ok) {
      toast.success("打卡成功", { description: "已更新水彩打卡链。" });
    } else {
      toast(result.message);
    }
  };

  const onBatchDelete = () => {
    if (!selectedIds.length) return;
    removeMany(selectedIds);
    setSelectedIds([]);
    toast.success("已批量删除参考微习惯");
  };

  const startEdit = (id: string) => {
    const item = addedRefs.find((it) => it.id === id);
    if (!item) return;
    setEditDrafts((prev) => ({
      ...prev,
      [id]: {
        title: item.title,
        quote: item.quote,
        frequency: item.frequency,
        reminderTime: item.reminderTime,
      },
    }));
    setEditingId(id);
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const saveEdit = (id: string) => {
    const draft = editDrafts[id];
    if (!draft) return;
    const trimmedTitle = draft.title.trim();
    if (!trimmedTitle) {
      toast("挑战标题不能为空");
      return;
    }
    updateHabit(id, {
      title: trimmedTitle,
      quote: draft.quote.trim(),
      frequency: draft.frequency,
      reminderTime: draft.reminderTime,
    });
    setEditingId(null);
    toast.success("挑战已更新");
  };

  const submitCustomHabit = () => {
    const trimmedTitle = customForm.title.trim();
    if (!trimmedTitle) {
      toast("请先填写挑战标题");
      return;
    }
    addCustomHabit({
      title: trimmedTitle,
      quote: customForm.quote.trim(),
      module: customForm.module,
      frequency: customForm.frequency,
      reminderTime: customForm.reminderTime,
    });
    setCustomForm({
      title: "",
      quote: "",
      module: "behavior",
      frequency: "daily",
      reminderTime: "21:00",
    });
    setShowCustomForm(false);
    toast.success("已添加自定义挑战");
  };

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-5xl font-hand font-bold text-foreground flex items-center gap-3">
          📅 我的挑战
        </h1>
        <p className="text-muted-foreground mt-1">
          {demoMode ? "演示后端数据 · 已跳过 MetaMask 校验" : "链上契约 · Avalanche Fuji"}
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
      >
        {[
          {
            label: "进行中",
            value: showStats ? activePacts.length : "—",
            emoji: "🔥",
            suffix: "个",
          },
          {
            label: "有打卡记录",
            value: showStats ? withCheckin : "—",
            emoji: "✅",
            suffix: "个",
          },
          {
            label: "总质押",
            value: showStats ? totalStaked.toFixed(3) : "—",
            emoji: "⛓️",
            suffix: " AVAX",
          },
          {
            label: "奖励池",
            value: showStats ? poolLabel : "—",
            emoji: "🏦",
            suffix: " AVAX",
          },
        ].map((stat) => (
          <div key={stat.label} className="paper-card p-4 text-center">
            <span className="text-2xl block">{stat.emoji}</span>
            <p className="font-hand text-3xl font-bold text-foreground mt-1">
              {stat.value}
              <span className="text-sm text-muted-foreground font-body">{stat.suffix}</span>
            </p>
            <p className="text-xs text-muted-foreground font-body">{stat.label}</p>
          </div>
        ))}
      </motion.div>

      {addedRefs.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="paper-card p-4 mb-8"
        >
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <p className="font-hand text-2xl text-foreground">参考微习惯</p>
              <p className="text-sm text-muted-foreground">已添加 {addedRefs.length} 项 · 今日打卡率 {refRate}%</p>
            </div>
            <div className="flex items-center gap-3">
              <div
                className="w-16 h-16 rounded-full border border-border"
                style={{
                  background: `conic-gradient(hsl(168 40% 45%) ${refRate}%, hsl(35 35% 92%) ${refRate}% 100%)`,
                }}
              >
                <div className="w-12 h-12 m-2 rounded-full bg-[hsl(var(--card))] flex items-center justify-center text-xs font-semibold">
                  {refRate}%
                </div>
              </div>
              <Button
                variant="secondary"
                size="sm"
                className="font-hand border border-border"
                onClick={() => setShowCustomForm((v) => !v)}
              >
                {showCustomForm ? "收起自定义" : "新增自定义挑战"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="font-hand"
                disabled={!selectedIds.length}
                onClick={onBatchDelete}
              >
                批量删除
              </Button>
            </div>
          </div>

          {showCustomForm && (
            <div className="mt-4 rounded-2xl border border-border/75 bg-[hsl(40_45%_98%_/0.88)] p-3 space-y-2">
              <p className="font-hand text-xl">📝 新建自定义挑战</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <input
                  placeholder="例如：每天睡前写 3 句复盘"
                  className="h-9 rounded-lg border border-border px-2 bg-background"
                  value={customForm.title}
                  onChange={(e) => setCustomForm((prev) => ({ ...prev, title: e.target.value }))}
                />
                <select
                  className="h-9 rounded-lg border border-border px-2 bg-background"
                  value={customForm.module}
                  onChange={(e) =>
                    setCustomForm((prev) => ({ ...prev, module: e.target.value as ReferenceModuleKey }))
                  }
                >
                  <option value="behavior">行为模块</option>
                  <option value="mindset">思维模块</option>
                  <option value="emotion">情绪模块</option>
                  <option value="environment">环境模块</option>
                </select>
                <select
                  className="h-9 rounded-lg border border-border px-2 bg-background"
                  value={customForm.frequency}
                  onChange={(e) =>
                    setCustomForm((prev) => ({ ...prev, frequency: e.target.value as "daily" | "weekly" }))
                  }
                >
                  <option value="daily">每日</option>
                  <option value="weekly">每周</option>
                </select>
                <input
                  type="time"
                  className="h-9 rounded-lg border border-border px-2 bg-background"
                  value={customForm.reminderTime}
                  onChange={(e) => setCustomForm((prev) => ({ ...prev, reminderTime: e.target.value }))}
                />
              </div>
              <textarea
                placeholder="可选：写一句鼓励自己的话"
                className="min-h-[68px] w-full rounded-lg border border-border px-2 py-1.5 bg-background"
                value={customForm.quote}
                onChange={(e) => setCustomForm((prev) => ({ ...prev, quote: e.target.value }))}
              />
              <div className="flex justify-end">
                <Button size="sm" variant="cyber" className="font-hand" onClick={submitCustomHabit}>
                  添加挑战
                </Button>
              </div>
            </div>
          )}

          <div className="space-y-4 mt-4">
            {(Object.keys(groupedRefs) as ReferenceModuleKey[]).map((moduleKey) => {
              const list = groupedRefs[moduleKey];
              if (!list.length) return null;
              const meta = moduleMeta[moduleKey];
              return (
                <div key={moduleKey} className="rounded-2xl border border-border/70 p-3 bg-[hsl(40_45%_98%_/0.75)]">
                  <p className="font-hand text-xl mb-2">
                    {meta.icon} {meta.name}模块
                  </p>
                  <div className="space-y-2">
                    {list.map((item) => {
                      const checkedToday = (item.checkins ?? []).includes(todayKey);
                      return (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={cn(
                            "rounded-xl border p-3 transition-all",
                            checkedToday
                              ? "bg-[hsl(150_60%_90%_/0.55)] border-[hsl(150_45%_72%)]"
                              : "bg-[hsl(40_45%_98%_/0.92)] border-border/80",
                          )}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <label className="inline-flex items-center gap-2 text-sm">
                              <input
                                type="checkbox"
                                checked={selectedIds.includes(item.id)}
                                onChange={(e) =>
                                  setSelectedIds((prev) =>
                                    e.target.checked ? [...prev, item.id] : prev.filter((v) => v !== item.id),
                                  )
                                }
                              />
                              <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                                {item.sourceTag}
                              </span>
                            </label>
                            <div className="text-xs text-muted-foreground">连续记录 {(item.checkins ?? []).length} 天</div>
                          </div>

                          {editingId === item.id ? (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-2">
                              <input
                                value={editDrafts[item.id]?.title ?? item.title}
                                className="h-9 rounded-lg border border-border px-2 bg-background"
                                onChange={(e) =>
                                  setEditDrafts((prev) => ({
                                    ...prev,
                                    [item.id]: {
                                      ...(prev[item.id] ?? {
                                        title: item.title,
                                        quote: item.quote,
                                        frequency: item.frequency,
                                        reminderTime: item.reminderTime,
                                      }),
                                      title: e.target.value,
                                    },
                                  }))
                                }
                              />
                              <select
                                className="h-9 rounded-lg border border-border px-2 bg-background"
                                value={editDrafts[item.id]?.frequency ?? item.frequency}
                                onChange={(e) =>
                                  setEditDrafts((prev) => ({
                                    ...prev,
                                    [item.id]: {
                                      ...(prev[item.id] ?? {
                                        title: item.title,
                                        quote: item.quote,
                                        frequency: item.frequency,
                                        reminderTime: item.reminderTime,
                                      }),
                                      frequency: e.target.value as "daily" | "weekly",
                                    },
                                  }))
                                }
                              >
                                <option value="daily">每日</option>
                                <option value="weekly">每周</option>
                              </select>
                              <input
                                type="time"
                                className="h-9 rounded-lg border border-border px-2 bg-background"
                                value={editDrafts[item.id]?.reminderTime ?? item.reminderTime}
                                onChange={(e) =>
                                  setEditDrafts((prev) => ({
                                    ...prev,
                                    [item.id]: {
                                      ...(prev[item.id] ?? {
                                        title: item.title,
                                        quote: item.quote,
                                        frequency: item.frequency,
                                        reminderTime: item.reminderTime,
                                      }),
                                      reminderTime: e.target.value,
                                    },
                                  }))
                                }
                              />
                              <textarea
                                className="md:col-span-3 min-h-[64px] rounded-lg border border-border px-2 py-1.5 bg-background"
                                value={editDrafts[item.id]?.quote ?? item.quote}
                                placeholder="挑战备注（可选）"
                                onChange={(e) =>
                                  setEditDrafts((prev) => ({
                                    ...prev,
                                    [item.id]: {
                                      ...(prev[item.id] ?? {
                                        title: item.title,
                                        quote: item.quote,
                                        frequency: item.frequency,
                                        reminderTime: item.reminderTime,
                                      }),
                                      quote: e.target.value,
                                    },
                                  }))
                                }
                              />
                            </div>
                          ) : (
                            <div className="mt-2">
                              <p className="font-hand text-xl">
                                #{item.methodNo} {item.title}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                频率：{item.frequency === "daily" ? "每日" : "每周"} · 提醒：{item.reminderTime}
                              </p>
                              {item.quote && <p className="text-sm text-muted-foreground mt-1">“{item.quote}”</p>}
                            </div>
                          )}

                          <div className="flex flex-wrap gap-2 mt-3">
                            <Button size="sm" variant="cyber" className="font-hand" onClick={() => onRefCheckin(item.id)}>
                              {checkedToday ? "今日已打卡" : "打卡"}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="font-hand"
                              onClick={() => (editingId === item.id ? saveEdit(item.id) : startEdit(item.id))}
                            >
                              {editingId === item.id ? "保存" : "编辑"}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="font-hand"
                              disabled={editingId !== item.id}
                              onClick={cancelEdit}
                            >
                              取消
                            </Button>
                            <Button size="sm" variant="secondary" className="font-hand border border-border" onClick={() => removeHabit(item.id)}>
                              删除
                            </Button>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-1"
        >
          <div className="paper-card p-4">
            <h2 className="font-hand text-2xl font-bold text-foreground mb-3 flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-primary" />
              最近打卡日
            </h2>
            <p className="text-xs text-muted-foreground mb-3 font-body">
              {demoMode
                ? "演示模式会把每次打卡完整写入后端数据，并高亮最近一次打卡日期。"
                : "链上仅保存每条契约的「上次打卡时间」，高亮为各契约最近一次打卡所在日期。"}
            </p>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(d) => d && setSelectedDate(d)}
              className={cn("p-3 pointer-events-auto w-full")}
              modifiers={{ checked: checkedDays }}
              modifiersStyles={{
                checked: {
                  backgroundColor: "hsl(168 38% 42% / 0.18)",
                  borderRadius: "50%",
                  fontWeight: "bold",
                  color: "hsl(168 38% 36%)",
                },
              }}
            />
            <div className="mt-3 pt-3 border-t border-border text-sm text-muted-foreground space-y-1">
              {selectedDate && (
                <p className="font-hand text-lg text-foreground mt-2">
                  {format(selectedDate, "yyyy年MM月dd日", { locale: zhCN })}
                </p>
              )}
              {!isConnected && (
                <p className="text-xs font-body">连接钱包后可同步链上挑战。</p>
              )}
            </div>
          </div>
        </motion.div>

        <div className="lg:col-span-2 space-y-4">
          {isConnected && isFuji && !isLoading && pacts.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="paper-card p-12 text-center"
            >
              <span className="text-6xl block mb-4">📝</span>
              <h3 className="font-hand text-3xl font-bold text-foreground mb-2">
                {demoMode ? "还没有演示挑战" : "还没有链上挑战"}
              </h3>
              <p className="text-muted-foreground mb-6 font-body">
                {demoMode
                  ? "在首页或习惯页选择微习惯，立即写入后端数据开始演示。"
                  : "在首页或习惯页选择微习惯，质押 AVAX 创建契约。"}
              </p>
              <Button variant="cyber" size="lg" className="font-hand" asChild>
                <Link to="/">浏览习惯</Link>
              </Button>
            </motion.div>
          ) : null}

          {(pacts.length > 0 || !isConnected || !isFuji || isLoading) && (
            <PactaChainPanel
              title="挑战详情与操作"
              hideRewardPool
              variant="default"
            />
          )}
        </div>
      </div>
    </div>
  );
}
