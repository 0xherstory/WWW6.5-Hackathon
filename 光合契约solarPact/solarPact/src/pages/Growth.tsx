import { motion, AnimatePresence } from "framer-motion";
import { useState, useCallback, useEffect } from "react";
import {
  CheckCircle2, Circle, Trophy, Flame, Target, Plus, Send,
  AlertTriangle, Image, Clock, MessageSquare, ChevronDown, ChevronUp,
  FileText, CalendarDays, Shield, X, Users
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

type CheckinStatus = "pending" | "confirmed" | "disputed";

interface Checkin {
  id: string;
  text: string;
  media?: string;
  timestamp: string;
  status: CheckinStatus;
  disputeReason?: string;
  day: number;
}

interface WeeklySummary {
  id: string;
  week: number;
  reflection: string;
  milestones: string[];
  confirmedBy: "none" | "publisher" | "partner" | "both";
  timestamp: string;
}

// Mock on-chain data
const initialCheckins: Checkin[] = [
  { id: "c1", text: "完成行业调研报告，分析了3个Web3项目的商业模式", day: 1, timestamp: "2026-03-25 09:30", status: "confirmed" },
  { id: "c2", text: "参加了DAO治理AMA，了解了投票机制", day: 2, timestamp: "2026-03-26 14:15", status: "confirmed" },
  { id: "c3", text: "更新了个人简历，添加Web3相关技能", day: 3, timestamp: "2026-03-27 11:00", status: "pending" },
  { id: "c4", text: "完成Solidity基础教程第1-3章", day: 5, timestamp: "2026-03-28 16:45", status: "disputed", disputeReason: "提交内容与课程不符，需要补充证据" },
];

const initialWeeklySummaries: WeeklySummary[] = [
  {
    id: "w1", week: 1,
    reflection: "本周完成了Web3基础认知重塑。从传统互联网思维转向去中心化思维模式，理解了为什么区块链对女性赋权很重要。",
    milestones: ["完成行业调研报告", "参加1次线上AMA", "更新个人简历"],
    confirmedBy: "both",
    timestamp: "2026-03-28",
  },
];

const statusConfig: Record<CheckinStatus, { label: string; labelEn: string; color: string; icon: typeof CheckCircle2 }> = {
  pending: { label: "待确认", labelEn: "Pending", color: "text-amber-400", icon: Clock },
  confirmed: { label: "已确认", labelEn: "Confirmed", color: "text-emerald-400", icon: CheckCircle2 },
  disputed: { label: "争议中", labelEn: "Disputed", color: "text-destructive", icon: AlertTriangle },
};

const Growth = () => {
  const { t, language } = useLanguage();
  const [mode, setMode] = useState<"daily" | "weekly">("daily");
  const [checkins, setCheckins] = useState<Checkin[]>(initialCheckins);
  const [weeklySummaries, setWeeklySummaries] = useState<WeeklySummary[]>(initialWeeklySummaries);
  const [activeProjects, setActiveProjects] = useState<any[]>([]);
  const [selectedProject, setSelectedProject] = useState<any>(null);

  useEffect(() => {
    const projects = JSON.parse(localStorage.getItem("active_projects") || "[]");
    setActiveProjects(projects);
    if (projects.length > 0) {
      setSelectedProject(projects[0]);
    }
  }, []);
  const [newCheckin, setNewCheckin] = useState("");
  const [showNewCheckin, setShowNewCheckin] = useState(false);
  const [disputeTarget, setDisputeTarget] = useState<string | null>(null);
  const [disputeReason, setDisputeReason] = useState("");
  const [expandedWeek, setExpandedWeek] = useState<number | null>(1);
  const [newReflection, setNewReflection] = useState("");
  const [newMilestones, setNewMilestones] = useState<string[]>([""]);

  const confirmedCount = checkins.filter(c => c.status === "confirmed").length;
  const totalCount = checkins.length;
  const progress = totalCount > 0 ? Math.round((confirmedCount / Math.max(totalCount, 30)) * 100) : 0;
  const streak = 12; // mock

  const submitCheckin = useCallback(() => {
    if (!newCheckin.trim()) return;
    const newEntry: Checkin = {
      id: `c${Date.now()}`,
      text: newCheckin,
      day: checkins.length + 1,
      timestamp: new Date().toLocaleString("zh-CN"),
      status: "pending",
    };
    setCheckins(prev => [newEntry, ...prev]);
    setNewCheckin("");
    setShowNewCheckin(false);
  }, [newCheckin, checkins.length]);

  const raiseDispute = useCallback((checkinId: string) => {
    if (!disputeReason.trim()) return;
    setCheckins(prev => prev.map(c =>
      c.id === checkinId ? { ...c, status: "disputed" as CheckinStatus, disputeReason } : c
    ));
    setDisputeTarget(null);
    setDisputeReason("");
  }, [disputeReason]);

  const submitWeeklySummary = useCallback(() => {
    if (!newReflection.trim()) return;
    const newSummary: WeeklySummary = {
      id: `w${Date.now()}`,
      week: weeklySummaries.length + 1,
      reflection: newReflection,
      milestones: newMilestones.filter(m => m.trim()),
      confirmedBy: "none",
      timestamp: new Date().toISOString().split("T")[0],
    };
    setWeeklySummaries(prev => [...prev, newSummary]);
    setNewReflection("");
    setNewMilestones([""]);
  }, [newReflection, newMilestones, weeklySummaries.length]);

  return (
    <div className="min-h-screen pt-24 pb-12 px-6">
      <div className="container mx-auto max-w-3xl">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-3xl font-bold mb-2">
            {t("growthTitle")}<span className="text-gradient-primary">{t("tracking")}</span>
          </h1>
          <p className="text-muted-foreground mb-6">{t("growthPlan")}</p>
        </motion.div>

        {/* Project Selector */}
        {activeProjects.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 flex gap-3 overflow-x-auto pb-2 scrollbar-hide"
          >
            {activeProjects.map((project) => (
              <button
                key={project.id}
                onClick={() => setSelectedProject(project)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl glass-card shrink-0 transition-all border ${
                  selectedProject?.id === project.id 
                    ? "border-primary/50 bg-primary/10 shadow-[0_0_15px_rgba(var(--primary-rgb),0.1)]" 
                    : "hover:border-primary/30"
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center text-primary font-bold">
                  {project.title.charAt(0)}
                </div>
                <div className="text-left">
                  <div className="text-sm font-bold line-clamp-1">{project.title}</div>
                  <div className="text-[10px] text-muted-foreground flex items-center gap-1">
                    <Users className="w-2.5 h-2.5" />
                    {project.partner}
                  </div>
                </div>
              </button>
            ))}
          </motion.div>
        )}

        {/* Progress overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-6 mb-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="font-display text-2xl font-bold text-gradient-primary">{progress}%</div>
              <div className="text-muted-foreground text-sm">
                {language === "zh" ? `已确认 ${confirmedCount} 次打卡` : `${confirmedCount} confirmed check-ins`}
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex flex-col items-center glass-card p-3 rounded-xl">
                <Flame className="w-5 h-5 text-secondary mb-1" />
                <span className="text-xs text-muted-foreground">{t("consecutive")}</span>
                <span className="font-display font-bold">{streak}{t("days")}</span>
              </div>
              <div className="flex flex-col items-center glass-card p-3 rounded-xl">
                <Trophy className="w-5 h-5 text-primary mb-1" />
                <span className="text-xs text-muted-foreground">SBT</span>
                <span className="font-display font-bold">2{t("sbtCount")}</span>
              </div>
              <div className="flex flex-col items-center glass-card p-3 rounded-xl">
                <Shield className="w-5 h-5 text-accent mb-1" />
                <span className="text-xs text-muted-foreground">{language === "zh" ? "争议" : "Disputes"}</span>
                <span className="font-display font-bold">{checkins.filter(c => c.status === "disputed").length}</span>
              </div>
            </div>
          </div>
          <div className="h-3 rounded-full bg-muted overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1, delay: 0.3 }}
              className="h-full rounded-full bg-gradient-to-r from-primary to-secondary"
            />
          </div>
        </motion.div>

        {/* Mode Toggle */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="flex gap-2 mb-6"
        >
          <button
            onClick={() => setMode("daily")}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition-all ${
              mode === "daily"
                ? "bg-primary/15 border border-primary/40 text-primary glow-primary"
                : "glass-card text-muted-foreground hover:text-foreground"
            }`}
          >
            <CalendarDays className="w-4 h-4" />
            {language === "zh" ? "每日打卡" : "Daily Check-in"}
          </button>
          <button
            onClick={() => setMode("weekly")}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition-all ${
              mode === "weekly"
                ? "bg-accent/15 border border-accent/40 text-accent glow-accent"
                : "glass-card text-muted-foreground hover:text-foreground"
            }`}
          >
            <FileText className="w-4 h-4" />
            {language === "zh" ? "周报总结" : "Weekly Summary"}
          </button>
        </motion.div>

        {/* ============ DAILY MODE ============ */}
        {mode === "daily" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            {/* New Check-in */}
            {!showNewCheckin ? (
              <motion.button
                onClick={() => setShowNewCheckin(true)}
                className="w-full py-4 rounded-xl border-2 border-dashed border-primary/30 text-primary hover:border-primary/60 hover:bg-primary/5 transition-all flex items-center justify-center gap-2 text-sm font-medium"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                <Plus className="w-5 h-5" />
                {language === "zh" ? "提交今日打卡" : "Submit Today's Check-in"}
              </motion.button>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card p-5 energy-border"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium">{language === "zh" ? "📝 今日进展" : "📝 Today's Progress"}</span>
                  <button onClick={() => setShowNewCheckin(false)} className="text-muted-foreground hover:text-foreground">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <textarea
                  value={newCheckin}
                  onChange={(e) => setNewCheckin(e.target.value)}
                  placeholder={language === "zh" ? "记录你今天的成长行动..." : "Record your growth action today..."}
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-border/50 text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none mb-3"
                />
                <div className="flex items-center justify-between">
                  <button className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-lg hover:bg-muted/50">
                    <Image className="w-3.5 h-3.5" />
                    {language === "zh" ? "添加图片" : "Add Image"}
                  </button>
                  <button
                    onClick={submitCheckin}
                    disabled={!newCheckin.trim()}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary to-amber-400 text-primary-foreground font-medium text-sm glow-primary hover:scale-[1.02] transition-transform disabled:opacity-40 disabled:hover:scale-100"
                  >
                    <Send className="w-4 h-4" />
                    {language === "zh" ? "提交上链" : "Submit On-Chain"}
                  </button>
                </div>
              </motion.div>
            )}

            {/* On-chain data structure info */}
            <div className="p-3 rounded-xl bg-muted/20 border border-border/30 text-xs text-muted-foreground flex items-start gap-2">
              <Shield className="w-4 h-4 shrink-0 mt-0.5 text-accent" />
              <div>
                <span className="text-foreground font-medium">
                  {language === "zh" ? "链上数据结构" : "On-Chain Data Structure"}
                </span>
                {" — "}
                {language === "zh"
                  ? "每条打卡记录包含: contentHash, timestamp, publisherSig, partnerSig, status"
                  : "Each check-in includes: contentHash, timestamp, publisherSig, partnerSig, status"}
              </div>
            </div>

            {/* Check-in List */}
            {checkins.map((checkin, i) => {
              const sc = statusConfig[checkin.status];
              const StatusIcon = sc.icon;
              return (
                <motion.div
                  key={checkin.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={`glass-card p-5 ${
                    checkin.status === "confirmed" ? "status-star" :
                    checkin.status === "disputed" ? "border-destructive/40" :
                    ""
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 border border-primary/30 flex items-center justify-center text-xs font-display font-bold text-primary">
                        D{checkin.day}
                      </div>
                      <div>
                        <span className={`inline-flex items-center gap-1 text-xs font-medium ${sc.color}`}>
                          <StatusIcon className="w-3 h-3" />
                          {language === "zh" ? sc.label : sc.labelEn}
                        </span>
                        <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                          <Clock className="w-3 h-3" />
                          {checkin.timestamp}
                        </div>
                      </div>
                    </div>

                    {/* Dispute button */}
                    {checkin.status !== "disputed" && (
                      <button
                        onClick={() => setDisputeTarget(disputeTarget === checkin.id ? null : checkin.id)}
                        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive transition-colors px-2 py-1 rounded-lg hover:bg-destructive/10"
                        title={language === "zh" ? "发起争议" : "Raise Dispute"}
                      >
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">{language === "zh" ? "争议" : "Dispute"}</span>
                      </button>
                    )}
                  </div>

                  <p className="text-sm text-foreground mb-1">{checkin.text}</p>

                  {checkin.status === "confirmed" && (
                    <span className="text-xs text-emerald-400 flex items-center gap-1 mt-2">
                      <CheckCircle2 className="w-3 h-3" />
                      {language === "zh" ? "双方已确认 · 已上链" : "Co-confirmed · On-chain"}
                    </span>
                  )}

                  {checkin.status === "disputed" && checkin.disputeReason && (
                    <div className="mt-3 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-xs">
                      <div className="flex items-center gap-1 text-destructive font-medium mb-1">
                        <AlertTriangle className="w-3 h-3" />
                        {language === "zh" ? "争议原因" : "Dispute Reason"}
                      </div>
                      <p className="text-muted-foreground">{checkin.disputeReason}</p>
                      <div className="mt-2 flex gap-2">
                        <span className="text-xs px-2 py-0.5 rounded-full bg-accent/10 border border-accent/20 text-accent">
                          {language === "zh" ? "🏛️ 等待DAO仲裁" : "🏛️ Awaiting DAO Arbitration"}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Dispute Form */}
                  <AnimatePresence>
                    {disputeTarget === checkin.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-3 overflow-hidden"
                      >
                        <div className="p-4 rounded-xl bg-destructive/5 border border-destructive/20">
                          <div className="flex items-center gap-2 mb-2 text-sm font-medium text-destructive">
                            <AlertTriangle className="w-4 h-4" />
                            {language === "zh" ? "发起争议" : "Raise Dispute"}
                          </div>
                          <textarea
                            value={disputeReason}
                            onChange={(e) => setDisputeReason(e.target.value)}
                            placeholder={language === "zh" ? "请说明争议原因..." : "Please explain the dispute..."}
                            rows={2}
                            className="w-full px-3 py-2 rounded-lg bg-muted/50 border border-border/50 text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-destructive/30 resize-none mb-3"
                          />
                          <div className="flex gap-2 justify-end">
                            <button
                              onClick={() => { setDisputeTarget(null); setDisputeReason(""); }}
                              className="px-4 py-2 rounded-lg text-xs text-muted-foreground hover:text-foreground transition-colors"
                            >
                              {language === "zh" ? "取消" : "Cancel"}
                            </button>
                            <button
                              onClick={() => raiseDispute(checkin.id)}
                              disabled={!disputeReason.trim()}
                              className="px-4 py-2 rounded-lg bg-destructive/20 border border-destructive/30 text-destructive text-xs font-medium hover:bg-destructive/30 transition-colors disabled:opacity-40"
                            >
                              {language === "zh" ? "⚠️ 确认提交争议" : "⚠️ Confirm Dispute"}
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </motion.div>
        )}

        {/* ============ WEEKLY MODE ============ */}
        {mode === "weekly" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            {/* On-chain data structure info */}
            <div className="p-3 rounded-xl bg-muted/20 border border-border/30 text-xs text-muted-foreground flex items-start gap-2">
              <Shield className="w-4 h-4 shrink-0 mt-0.5 text-accent" />
              <div>
                <span className="text-foreground font-medium">
                  {language === "zh" ? "周报链上结构" : "Weekly Summary On-Chain Structure"}
                </span>
                {" — "}
                {language === "zh"
                  ? "包含: weekNumber, reflectionHash, milestones[], publisherConfirmed, partnerConfirmed, sbtIssued"
                  : "Includes: weekNumber, reflectionHash, milestones[], publisherConfirmed, partnerConfirmed, sbtIssued"}
              </div>
            </div>

            {/* Existing Summaries */}
            {weeklySummaries.map((summary, i) => (
              <motion.div
                key={summary.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`glass-card overflow-hidden ${summary.confirmedBy === "both" ? "status-nebula" : ""}`}
              >
                <button
                  onClick={() => setExpandedWeek(expandedWeek === summary.week ? null : summary.week)}
                  className="w-full p-5 flex items-center justify-between text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent/20 to-secondary/20 border border-accent/30 flex items-center justify-center font-display font-bold text-accent">
                      W{summary.week}
                    </div>
                    <div>
                      <h3 className="font-display font-semibold text-sm">
                        {language === "zh" ? `第${summary.week}周总结` : `Week ${summary.week} Summary`}
                      </h3>
                      <p className="text-xs text-muted-foreground">{summary.timestamp}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {summary.confirmedBy === "both" && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-400/10 border border-emerald-400/30 text-emerald-400">
                        ✓ {language === "zh" ? "双方确认" : "Co-confirmed"}
                      </span>
                    )}
                    {expandedWeek === summary.week ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                  </div>
                </button>

                <AnimatePresence>
                  {expandedWeek === summary.week && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-5 space-y-4">
                        <div>
                          <h4 className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
                            <MessageSquare className="w-3 h-3" />
                            {language === "zh" ? "本周反思" : "Weekly Reflection"}
                          </h4>
                          <p className="text-sm text-foreground bg-muted/30 p-3 rounded-lg">{summary.reflection}</p>
                        </div>
                        <div>
                          <h4 className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
                            <Target className="w-3 h-3" />
                            {language === "zh" ? "里程碑确认" : "Milestone Confirmation"}
                          </h4>
                          <div className="space-y-1.5">
                            {summary.milestones.map((m, mi) => (
                              <div key={mi} className="flex items-center gap-2 text-sm">
                                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                                {m}
                              </div>
                            ))}
                          </div>
                        </div>
                        {summary.confirmedBy === "both" && (
                          <div className="p-3 rounded-lg bg-primary/5 border border-primary/20 text-xs text-muted-foreground">
                            🏅 {language === "zh" ? "本周SBT已发放 — 勇气芽凭证" : "Weekly SBT Issued — Courage Seed Credential"}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}

            {/* New Weekly Summary Form */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="glass-card p-6 energy-border"
            >
              <h3 className="font-display font-semibold mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-accent" />
                {language === "zh" ? `提交第${weeklySummaries.length + 1}周总结` : `Submit Week ${weeklySummaries.length + 1} Summary`}
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-2">
                    {language === "zh" ? "本周反思" : "Weekly Reflection"}
                  </label>
                  <textarea
                    value={newReflection}
                    onChange={(e) => setNewReflection(e.target.value)}
                    placeholder={language === "zh" ? "回顾这一周的成长和感悟..." : "Reflect on this week's growth..."}
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-border/50 text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-2">
                    {language === "zh" ? "里程碑" : "Milestones"}
                  </label>
                  {newMilestones.map((m, i) => (
                    <div key={i} className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={m}
                        onChange={(e) => {
                          const updated = [...newMilestones];
                          updated[i] = e.target.value;
                          setNewMilestones(updated);
                        }}
                        placeholder={language === "zh" ? `里程碑 ${i + 1}` : `Milestone ${i + 1}`}
                        className="flex-1 px-4 py-2 rounded-xl bg-muted/50 border border-border/50 text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
                      />
                      {i === newMilestones.length - 1 && (
                        <button
                          onClick={() => setNewMilestones(prev => [...prev, ""])}
                          className="px-3 py-2 rounded-xl bg-muted/50 border border-border/50 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <button
                  onClick={submitWeeklySummary}
                  disabled={!newReflection.trim()}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-accent to-secondary text-accent-foreground font-display font-semibold glow-accent hover:scale-[1.02] transition-transform disabled:opacity-40 disabled:hover:scale-100"
                >
                  <Send className="w-4 h-4" />
                  {language === "zh" ? "提交周报上链" : "Submit Weekly On-Chain"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Growth;
