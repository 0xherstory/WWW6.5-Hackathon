import { motion } from "framer-motion";
import { CheckCircle2, Circle, Trophy, Flame, Target } from "lucide-react";
import React, { useEffect, useRef, useState } from 'react';
import type { Contract } from "ethers";
import { contractActions, fetchGoalsFromContract, getGoalManagerContract } from '../lib/contracts';

const weeks = [
  {
    week: 1,
    title: "认知重塑",
    tasks: [
      { text: "完成行业调研报告", done: true },
      { text: "参加1次线上分享会", done: true },
      { text: "更新个人简历", done: true },
    ],
    sbt: "勇气芽 SBT",
  },
  {
    week: 2,
    title: "技能提升",
    tasks: [
      { text: "完成Web3基础课程", done: true },
      { text: "提交课程作业", done: true },
      { text: "参加社区AMA", done: false },
    ],
    sbt: "破壁者 SBT",
  },
  {
    week: 3,
    title: "实战演练",
    tasks: [
      { text: "投递3份目标岗位", done: false },
      { text: "完成1次模拟面试", done: false },
      { text: "获得面试反馈", done: false },
    ],
    sbt: null,
  },
];

type GoalUI = {
  id: number;
  creator: string;
  desc: string;
  rewardEth: string;
  deadline: number;
  partner: string;
  status: number;
  statusText: string;
  totalMilestones: number;
  completedMilestones: number;
  selectedBidIndex: number;
  lastProofTime: number;
  pendingReview: boolean;
  isOpen: boolean;
  isMatched: boolean;
  isInProgress: boolean;
  isCompleted: boolean;
  isFailed: boolean;
  isSettled: boolean;
  isDisputed: boolean;
};

const Growth = () => {
  const totalTasks = weeks.flatMap((w) => w.tasks).length;
  const doneTasks = weeks.flatMap((w) => w.tasks).filter((t) => t.done).length;
  const progress = Math.round((doneTasks / totalTasks) * 100);

  const contractRef = useRef<Contract | null>(null);
  const refreshInFlightRef = useRef(false);
  const [goals, setGoals] = useState<GoalUI[]>([]);
  const [goalsLoading, setGoalsLoading] = useState(false);
  const [bidSubmitting, setBidSubmitting] = useState(false);
  const [bidForm, setBidForm] = useState({
    shareRatio: 20, // 0-100
    mode: 1, // 0=STRICT, 1=GROWTH
    depositEth: "0.01",
  });

  const shortenAddress = (addr: string) => {
    if (!addr) return "-";
    if (addr === "0x0000000000000000000000000000000000000000") return "-";
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const refreshGoals = async () => {
    if (!contractRef.current) return;
    if (refreshInFlightRef.current) return;
    refreshInFlightRef.current = true;
    setGoalsLoading(true);
    try {
      const next = await fetchGoalsFromContract(contractRef.current);
      setGoals(next);
    } catch (err) {
      console.error("Fetch goals error:", err);
    } finally {
      setGoalsLoading(false);
      refreshInFlightRef.current = false;
    }
  };

  const handleBid = async (goalId: number) => {
    if (bidSubmitting) return;
    if (!bidForm.depositEth) return;

    const depositEth = bidForm.depositEth.trim();
    const shareRatio = Number(bidForm.shareRatio);
    const mode = Number(bidForm.mode); // SettlementMode

    if (!Number.isFinite(shareRatio) || shareRatio < 0 || shareRatio > 100) {
      alert("分成比例 shareRatio 必须在 0-100 之间");
      return;
    }
    if (!depositEth || Number(depositEth) <= 0) {
      alert("保证金 depositEth 必须为大于 0 的 ETH 数额");
      return;
    }

    setBidSubmitting(true);
    try {
      await contractActions.bid(goalId, shareRatio, mode, depositEth);
      await refreshGoals();
    } catch (err) {
      console.error("Bid failed:", err);
      alert("竞拍失败，请查看控制台错误信息");
    } finally {
      setBidSubmitting(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    let contract: Contract | undefined;

    const onGoalEvent = () => {
      if (cancelled) return;
      refreshGoals();
    };

    const init = async () => {
      try {
        contract = await getGoalManagerContract();
        if (cancelled) return;
        contractRef.current = contract;
        await refreshGoals();

        // 实时监听：任意关键状态变化都触发前端重新拉取 goals
        contract.on("GoalCreated", onGoalEvent);
        contract.on("ProofSubmitted", onGoalEvent);
        contract.on("GoalSettled", onGoalEvent);
        contract.on("GoalDisputed", onGoalEvent);
      } catch (err) {
        console.error("Init GoalManager listener error:", err);
      }
    };

    init();

    return () => {
      cancelled = true;
      if (!contract) return;
      contract.off("GoalCreated", onGoalEvent);
      contract.off("ProofSubmitted", onGoalEvent);
      contract.off("GoalSettled", onGoalEvent);
      contract.off("GoalDisputed", onGoalEvent);
    };
  }, []);

  return (
    <div className="min-h-screen pt-24 pb-12 px-6">
      <div className="container mx-auto max-w-3xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-3xl font-bold mb-2">
            成长<span className="text-gradient-primary">追踪</span>
          </h1>
          <p className="text-muted-foreground mb-8">30天职场转型计划 — 每周链上打卡</p>
        </motion.div>

        {/* Progress overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-6 mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="font-display text-2xl font-bold text-gradient-primary">{progress}%</div>
              <div className="text-muted-foreground text-sm">
                完成 {doneTasks}/{totalTasks} 个任务
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex flex-col items-center glass-card p-3 rounded-xl">
                <Flame className="w-5 h-5 text-secondary mb-1" />
                <span className="text-xs text-muted-foreground">连续</span>
                <span className="font-display font-bold">12天</span>
              </div>
              <div className="flex flex-col items-center glass-card p-3 rounded-xl">
                <Trophy className="w-5 h-5 text-primary mb-1" />
                <span className="text-xs text-muted-foreground">SBT</span>
                <span className="font-display font-bold">2枚</span>
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="h-3 rounded-full bg-muted overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1, delay: 0.3 }}
              className="h-full rounded-full bg-gradient-to-r from-primary to-secondary"
            />
          </div>
        </motion.div>

        {/* Weekly timeline */}
        <div className="space-y-6">
          {weeks.map((week, wi) => (
            <motion.div
              key={week.week}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + wi * 0.1 }}
              className="glass-card p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 border border-primary/30 flex items-center justify-center font-display font-bold text-primary">
                    {week.week}
                  </div>
                  <div>
                    <h3 className="font-display font-semibold">Week {week.week}: {week.title}</h3>
                    <p className="text-xs text-muted-foreground">
                      {week.tasks.filter((t) => t.done).length}/{week.tasks.length} 完成
                    </p>
                  </div>
                </div>
                {week.sbt && (
                  <span className="text-xs px-3 py-1 rounded-full bg-primary/10 border border-primary/30 text-primary">
                    🏅 {week.sbt}
                  </span>
                )}
              </div>

              <div className="space-y-3">
                {week.tasks.map((task, ti) => (
                  <div
                    key={ti}
                    className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${
                      task.done ? "bg-primary/5" : "bg-muted/30"
                    }`}
                  >
                    {task.done ? (
                      <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                    ) : (
                      <Circle className="w-5 h-5 text-muted-foreground shrink-0" />
                    )}
                    <span className={`text-sm ${task.done ? "text-foreground" : "text-muted-foreground"}`}>
                      {task.text}
                    </span>
                    {task.done && (
                      <span className="ml-auto text-xs text-muted-foreground">已上链 ✓</span>
                    )}
                  </div>
                ))}
              </div>

              {week.tasks.some((t) => !t.done) && (
                <button className="mt-4 w-full py-2.5 rounded-xl bg-primary/10 border border-primary/30 text-primary text-sm font-medium hover:bg-primary/20 transition-colors flex items-center justify-center gap-2">
                  <Target className="w-4 h-4" />
                  提交本周打卡
                </button>
              )}
            </motion.div>
          ))}
        </div>

        {/* On-chain goals */}
        <div className="mt-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="flex items-center justify-between mb-4"
          >
            <h2 className="font-display text-2xl font-bold">
              链上成长<span className="text-gradient-primary">目标</span>
            </h2>
            {goalsLoading && <span className="text-xs text-muted-foreground">加载中...</span>}
          </motion.div>

          <div className="glass-card p-5 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">分成比例 (%)</label>
                <input
                  type="number"
                  value={bidForm.shareRatio}
                  min={0}
                  max={100}
                  onChange={(e) => setBidForm((p) => ({ ...p, shareRatio: Number(e.target.value) }))}
                  className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-border/50 text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">结算模式</label>
                <select
                  value={bidForm.mode}
                  onChange={(e) => setBidForm((p) => ({ ...p, mode: Number(e.target.value) }))}
                  className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-border/50 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                >
                  <option value={0}>STRICT（严格）</option>
                  <option value={1}>GROWTH（成长）</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">保证金 (ETH)</label>
                <input
                  type="text"
                  value={bidForm.depositEth}
                  onChange={(e) => setBidForm((p) => ({ ...p, depositEth: e.target.value }))}
                  placeholder="0.01"
                  className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-border/50 text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              该合约的 `createGoal` / `bid` 使用 `msg.value`，因此本页输入的奖励/押金单位均为 ETH。
            </p>
          </div>

          <div className="space-y-4">
            {goals.length === 0 ? (
              <div className="text-sm text-muted-foreground glass-card p-5">
                暂无链上目标（或尚未初始化钱包/合约地址）。
              </div>
            ) : (
              goals.map((g, i) => {
                const deadlineText = g.deadline ? new Date(g.deadline * 1000).toLocaleString() : "-";
                const progressText = `${g.completedMilestones}/${g.totalMilestones}`;

                return (
                  <motion.div
                    key={g.id ?? i}
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="glass-card p-5 hover:border-primary/30 transition-all"
                  >
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="min-w-0">
                        <div className="font-display font-semibold text-lg truncate">{g.desc}</div>
                        <div className="flex flex-wrap gap-2 mt-2">
                          <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 border border-primary/30 text-primary">
                            {g.statusText}
                          </span>
                          <span className="text-xs text-muted-foreground">ID #{g.id}</span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-xs text-muted-foreground">奖励</div>
                        <div className="font-display font-bold text-primary">{g.rewardEth} ETH</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm text-muted-foreground mb-3">
                      <div>截止：{deadlineText}</div>
                      <div>进度：{progressText}</div>
                      <div>待审核：{g.pendingReview ? "是" : "否"}</div>
                    </div>

                    <div className="flex items-center justify-between gap-3">
                      <div className="text-xs text-muted-foreground">
                        {g.partner ? `伙伴：${shortenAddress(g.partner)}` : "伙伴：-"}
                      </div>
                      <button
                        disabled={!g.isOpen || bidSubmitting}
                        onClick={() => handleBid(g.id)}
                        className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${
                          g.isOpen
                            ? "bg-primary/10 border-primary/30 text-primary hover:bg-primary/20"
                            : "bg-muted/30 border-border/50 text-muted-foreground cursor-not-allowed"
                        }`}
                      >
                        {g.isOpen ? (bidSubmitting ? "提交中..." : "参与竞拍") : "当前不可竞拍"}
                      </button>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Growth;
