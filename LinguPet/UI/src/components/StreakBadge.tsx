interface StreakBadgeProps {
  streak: number;
  dailyProgress: number;
  dailyGoal: number;
}

const StreakBadge = ({ streak, dailyProgress, dailyGoal }: StreakBadgeProps) => {
  const goalMet = dailyProgress >= dailyGoal;
  const progressPercent = Math.min(100, (dailyProgress / dailyGoal) * 100);

  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-card border border-border">
      {/* Streak */}
      <div className="flex items-center gap-1">
        <span className={`text-2xl ${streak > 0 ? "animate-pulse" : ""}`}>
          {streak > 0 ? "🔥" : "❄️"}
        </span>
        <div>
          <p className="text-lg font-extrabold leading-none">{streak}</p>
          <p className="text-[10px] text-muted-foreground">day streak</p>
        </div>
      </div>

      {/* Divider */}
      <div className="w-px h-8 bg-border" />

      {/* Daily Goal */}
      <div className="flex-1">
        <div className="flex justify-between text-xs mb-1">
          <span className="font-semibold">
            {goalMet ? "✅ Goal met!" : "Today's Goal"}
          </span>
          <span className="text-muted-foreground">
            {dailyProgress}/{dailyGoal} min
          </span>
        </div>
        <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${progressPercent}%`,
              backgroundColor: goalMet ? "hsl(var(--secondary))" : "hsl(var(--primary))",
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default StreakBadge;
