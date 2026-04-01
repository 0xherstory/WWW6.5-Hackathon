"use client";

const MAX = 3;

interface AttributeBarProps {
  label: string;
  value: number;
  color: string;
  icon: string;
}

export default function AttributeBar({ label, value, color, icon }: AttributeBarProps) {
  const filled = Math.min(value, MAX);

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <span className="text-[7px] tracking-widest" style={{ color }}>
          {icon} {label}
        </span>
        <span className="text-[7px]" style={{ color: `${color}99` }}>
          {value}/{MAX}
        </span>
      </div>
      <div className="flex gap-1">
        {Array.from({ length: MAX }).map((_, i) => (
          <div
            key={i}
            className="h-3 flex-1 border-2 transition-all duration-300"
            style={{
              borderColor: color,
              backgroundColor: i < filled ? color : "transparent",
              boxShadow: i < filled ? `0 0 6px ${color}66` : "none",
            }}
          />
        ))}
      </div>
    </div>
  );
}
