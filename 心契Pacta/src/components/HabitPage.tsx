import { useMemo, useState } from "react";
import { categoryInfo, type HabitCategory, type Habit } from "@/data/habitsData";
import HabitCard from "./HabitCard";
import CreatePactDialog from "./CreatePactDialog";
import PactaChainPanel from "./PactaChainPanel";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useHabitTemplateStore } from "@/store/habitTemplateStore";

interface HabitPageProps {
  category: HabitCategory;
}

export default function HabitPage({ category }: HabitPageProps) {
  const [tab, setTab] = useState<"quantity" | "time">("quantity");
  const [selectedHabit, setSelectedHabit] = useState<Habit | null>(null);
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [customDraft, setCustomDraft] = useState<Omit<Habit, "id">>({
    name: "",
    description: "",
    emoji: "📝",
    category,
    type: "quantity",
    defaultStake: 0.1,
  });
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [editDraft, setEditDraft] = useState<Omit<Habit, "id"> | null>(null);

  const allHabits = useHabitTemplateStore((state) => state.getHabitsForCategory(category));
  const addCustomHabit = useHabitTemplateStore((state) => state.addCustomHabit);
  const updateHabitTemplate = useHabitTemplateStore((state) => state.updateHabitTemplate);
  const removeCustomHabit = useHabitTemplateStore((state) => state.removeCustomHabit);

  const info = categoryInfo[category];
  const filtered = useMemo(() => allHabits.filter((h) => h.type === tab), [allHabits, tab]);

  const submitCustom = () => {
    const name = customDraft.name.trim();
    if (!name) {
      toast("请填写挑战名称");
      return;
    }
    addCustomHabit({
      ...customDraft,
      category,
      name,
      description: customDraft.description.trim() || "我的自定义挑战",
      emoji: customDraft.emoji.trim() || "📝",
      defaultStake: Math.max(0.01, Number(customDraft.defaultStake) || 0.1),
    });
    setCustomDraft({
      name: "",
      description: "",
      emoji: "📝",
      category,
      type: tab,
      defaultStake: 0.1,
    });
    setShowCustomForm(false);
    toast.success("已新增自定义挑战");
  };

  const startEdit = (habit: Habit) => {
    setEditingHabit(habit);
    setEditDraft({
      name: habit.name,
      description: habit.description,
      emoji: habit.emoji,
      category: habit.category,
      type: habit.type,
      defaultStake: habit.defaultStake,
    });
  };

  const saveEdit = () => {
    if (!editingHabit || !editDraft) return;
    const name = editDraft.name.trim();
    if (!name) {
      toast("挑战名称不能为空");
      return;
    }
    updateHabitTemplate(editingHabit.id, {
      name,
      description: editDraft.description.trim() || "微挑战",
      emoji: editDraft.emoji.trim() || "📝",
      type: editDraft.type,
      defaultStake: Math.max(0.01, Number(editDraft.defaultStake) || 0.1),
    });
    setEditingHabit(null);
    setEditDraft(null);
    toast.success("挑战已更新");
  };

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-5xl font-hand font-bold text-foreground flex items-center gap-3">
          {info.emoji} {info.label}
        </h1>
        <p className="text-muted-foreground mt-1">{info.labelEn}</p>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4 flex-wrap items-center">
        <button
          onClick={() => setTab("quantity")}
          className={`px-4 py-2 rounded-lg font-hand text-lg transition-all ${
            tab === "quantity"
              ? "bg-primary text-primary-foreground glow-cyber"
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          }`}
        >
          📊 按数量
        </button>
        <button
          onClick={() => setTab("time")}
          className={`px-4 py-2 rounded-lg font-hand text-lg transition-all ${
            tab === "time"
              ? "bg-primary text-primary-foreground glow-cyber"
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          }`}
        >
          ⏱️ 按时间
        </button>
        <Button
          size="sm"
          variant="secondary"
          className="font-hand border border-border"
          onClick={() => setShowCustomForm((v) => !v)}
        >
          {showCustomForm ? "收起自定义" : "新增自定义挑战"}
        </Button>
      </div>

      {showCustomForm && (
        <div className="paper-card p-4 mb-6 space-y-2">
          <p className="font-hand text-2xl">✨ 新增自定义挑战</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <input
              value={customDraft.name}
              onChange={(e) => setCustomDraft((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="挑战名称，例如：晚饭后走 10 分钟"
              className="h-9 rounded-lg border border-border px-2 bg-background"
            />
            <input
              value={customDraft.description}
              onChange={(e) => setCustomDraft((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="挑战描述（可选）"
              className="h-9 rounded-lg border border-border px-2 bg-background"
            />
            <input
              value={customDraft.emoji}
              onChange={(e) => setCustomDraft((prev) => ({ ...prev, emoji: e.target.value }))}
              placeholder="emoji，例如：🌟"
              className="h-9 rounded-lg border border-border px-2 bg-background"
            />
            <select
              value={customDraft.type}
              onChange={(e) =>
                setCustomDraft((prev) => ({ ...prev, type: e.target.value as "quantity" | "time" }))
              }
              className="h-9 rounded-lg border border-border px-2 bg-background"
            >
              <option value="quantity">按数量</option>
              <option value="time">按时间</option>
            </select>
            <input
              type="number"
              min={0.01}
              step={0.01}
              value={customDraft.defaultStake}
              onChange={(e) => setCustomDraft((prev) => ({ ...prev, defaultStake: Number(e.target.value) }))}
              placeholder="默认质押"
              className="h-9 rounded-lg border border-border px-2 bg-background"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button size="sm" variant="outline" onClick={() => setShowCustomForm(false)}>
              取消
            </Button>
            <Button size="sm" variant="cyber" className="font-hand" onClick={submitCustom}>
              添加
            </Button>
          </div>
        </div>
      )}

      {editingHabit && editDraft && (
        <div className="paper-card p-4 mb-6 space-y-2">
          <p className="font-hand text-2xl">✏️ 编辑挑战</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <input
              value={editDraft.name}
              onChange={(e) => setEditDraft((prev) => (prev ? { ...prev, name: e.target.value } : prev))}
              className="h-9 rounded-lg border border-border px-2 bg-background"
            />
            <input
              value={editDraft.description}
              onChange={(e) => setEditDraft((prev) => (prev ? { ...prev, description: e.target.value } : prev))}
              className="h-9 rounded-lg border border-border px-2 bg-background"
            />
            <input
              value={editDraft.emoji}
              onChange={(e) => setEditDraft((prev) => (prev ? { ...prev, emoji: e.target.value } : prev))}
              className="h-9 rounded-lg border border-border px-2 bg-background"
            />
            <select
              value={editDraft.type}
              onChange={(e) =>
                setEditDraft((prev) => (prev ? { ...prev, type: e.target.value as "quantity" | "time" } : prev))
              }
              className="h-9 rounded-lg border border-border px-2 bg-background"
            >
              <option value="quantity">按数量</option>
              <option value="time">按时间</option>
            </select>
            <input
              type="number"
              min={0.01}
              step={0.01}
              value={editDraft.defaultStake}
              onChange={(e) =>
                setEditDraft((prev) => (prev ? { ...prev, defaultStake: Number(e.target.value) } : prev))
              }
              className="h-9 rounded-lg border border-border px-2 bg-background"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setEditingHabit(null);
                setEditDraft(null);
              }}
            >
              取消
            </Button>
            <Button size="sm" variant="cyber" className="font-hand" onClick={saveEdit}>
              保存
            </Button>
          </div>
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((habit, i) => (
          <HabitCard
            key={habit.id}
            habit={habit}
            index={i}
            onEdit={startEdit}
            isCustom={habit.id.startsWith("custom-")}
            onDeleteCustom={(h) => {
              removeCustomHabit(h.id);
              toast.success("已删除自定义挑战");
            }}
            onCreatePact={(h) => setSelectedHabit(h)}
          />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="paper-card p-12 text-center text-muted-foreground">
          <p className="font-hand text-2xl">暂无此类习惯</p>
        </div>
      )}

      <CreatePactDialog
        habit={selectedHabit}
        open={!!selectedHabit}
        onOpenChange={(open) => { if (!open) setSelectedHabit(null); }}
      />

      <div className="mt-14 pt-8 border-t border-dashed border-border/80">
        <PactaChainPanel variant="compact" title="我的链上挑战" />
      </div>
    </div>
  );
}
