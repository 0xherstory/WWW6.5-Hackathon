import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getRandomHabit, type Habit } from "@/data/habitsData";
import { Button } from "@/components/ui/button";
import { Shuffle, Zap } from "lucide-react";
import CreatePactDialog from "@/components/CreatePactDialog";
import { cn } from "@/lib/utils";

export default function RandomPicker({ compact = false }: { compact?: boolean }) {
  const [habit, setHabit] = useState<Habit | null>(null);
  const [spinning, setSpinning] = useState(false);
  const [selectedHabit, setSelectedHabit] = useState<Habit | null>(null);

  const pick = useCallback(() => {
    setSpinning(true);
    let count = 0;
    const interval = setInterval(() => {
      setHabit(getRandomHabit());
      count++;
      if (count > 8) {
        clearInterval(interval);
        setSpinning(false);
      }
    }, 100);
  }, []);

  return (
    <div className={cn("flex flex-col items-center", compact ? "gap-4" : "gap-6")}>
      <Button
        variant="cyber"
        size={compact ? "default" : "lg"}
        onClick={pick}
        disabled={spinning}
        className={cn(
          "rounded-2xl animate-pulse-glow",
          compact ? "text-base px-6 py-5" : "text-xl px-10 py-7",
        )}
      >
        <Shuffle className="w-6 h-6 mr-2" />
        {spinning ? "抽取中..." : "今天做什么？"}
      </Button>

      <AnimatePresence mode="wait">
        {habit && (
          <motion.div
            key={habit.id}
            initial={{ scale: 0.8, opacity: 0, rotateZ: -5 }}
            animate={{ scale: 1, opacity: 1, rotateZ: 0 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className={cn("paper-card w-full text-center", compact ? "p-5 max-w-xs" : "p-8 max-w-sm")}
          >
            <span className={cn("block mb-3", compact ? "text-4xl" : "text-5xl")}>{habit.emoji}</span>
            <h3 className={cn("font-hand font-bold text-foreground mb-2", compact ? "text-2xl" : "text-3xl")}>
              {habit.name}
            </h3>
            <p className={cn("text-muted-foreground", compact ? "mb-3 text-sm" : "mb-4")}>{habit.description}</p>
            <div className={cn("flex items-center justify-center gap-2 text-muted-foreground", compact ? "text-xs mb-3" : "text-sm mb-4")}>
              <span className="px-2 py-1 rounded-full bg-muted">
                {habit.type === "quantity" ? "按数量" : "按时间"}
              </span>
              <span>·</span>
              <span className="text-primary font-semibold">{habit.defaultStake} AVAX</span>
            </div>
            <Button variant="cyber" className={cn("w-full", compact && "h-9 text-sm")} onClick={() => setSelectedHabit(habit)}>
              <Zap className="w-4 h-4" />
              创建挑战
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      <CreatePactDialog
        habit={selectedHabit}
        open={!!selectedHabit}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedHabit(null);
          }
        }}
      />
    </div>
  );
}
