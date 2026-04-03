interface ProgressBarProps {
  xp: number;
}

const XP_BABY = 100;
const XP_TEENAGER = 300;
const XP_ADULT = 600;

const ProgressBar = ({ xp }: ProgressBarProps) => {
  let percent = 0;
  if (xp < XP_BABY) percent = (xp / XP_BABY) * 25;
  else if (xp < XP_TEENAGER) percent = 25 + ((xp - XP_BABY) / (XP_TEENAGER - XP_BABY)) * 25;
  else if (xp < XP_ADULT) percent = 50 + ((xp - XP_TEENAGER) / (XP_ADULT - XP_TEENAGER)) * 25;
  else percent = 100;

  const milestones = [
    { label: "Egg", pos: 0 },
    { label: "Baby", pos: 25 },
    { label: "Teen", pos: 50 },
    { label: "Adult", pos: 75 },
    { label: "🏆", pos: 100 },
  ];

  return (
    <div className="w-full space-y-1">
      <div className="flex justify-between text-xs font-semibold text-muted-foreground">
        <span>XP: {xp}</span>
        <span>Next: {xp < XP_BABY ? XP_BABY : xp < XP_TEENAGER ? XP_TEENAGER : XP_ADULT}</span>
      </div>
      <div className="relative w-full h-5 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all duration-700 ease-out"
          style={{ width: `${percent}%` }}
        />
        {milestones.map((m) => (
          <div
            key={m.label}
            className="absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-card border border-border"
            style={{ left: `${m.pos}%`, transform: `translateX(-50%) translateY(-50%)` }}
          />
        ))}
      </div>
      <div className="flex justify-between text-[10px] text-muted-foreground">
        {milestones.map((m) => (
          <span key={m.label}>{m.label}</span>
        ))}
      </div>
    </div>
  );
};

export default ProgressBar;
