import { motion } from "framer-motion";
import type { Habit } from "@/data/habitsData";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Zap } from "lucide-react";

interface HabitCardProps {
  habit: Habit;
  onCreatePact?: (habit: Habit) => void;
  onEdit?: (habit: Habit) => void;
  onDeleteCustom?: (habit: Habit) => void;
  isCustom?: boolean;
  index?: number;
}

export default function HabitCard({
  habit,
  onCreatePact,
  onEdit,
  onDeleteCustom,
  isCustom = false,
  index = 0,
}: HabitCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      className="paper-card p-5 flex flex-col gap-3"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{habit.emoji}</span>
          <div>
            <h3 className="font-hand text-xl font-semibold text-foreground">{habit.name}</h3>
            <p className="text-sm text-muted-foreground">{habit.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          {isCustom && <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">自定义</span>}
          <span className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground">
            {habit.type === "quantity" ? "按数量" : "按时间"}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between mt-auto pt-2 border-t border-border">
        <span className="text-sm text-muted-foreground">
          质押 <span className="text-primary font-semibold">{habit.defaultStake} AVAX</span>
        </span>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={() => onEdit?.(habit)}>
            <Pencil className="w-3 h-3" />
            编辑
          </Button>
          {isCustom && (
            <Button size="sm" variant="secondary" className="border border-border" onClick={() => onDeleteCustom?.(habit)}>
              <Trash2 className="w-3 h-3" />
              删除
            </Button>
          )}
          <Button variant="cyber" size="sm" onClick={() => onCreatePact?.(habit)}>
            <Zap className="w-3 h-3" />
            创建挑战
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
