"use client";

import { cn } from "@/lib/utils";

interface RingChartProps {
  value: number; // 0-5
  size?: number;
  strokeWidth?: number;
  showLabel?: boolean;
  label?: string;
}

export function RingChart({ value, size = 120, strokeWidth = 8, showLabel = true, label }: RingChartProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (value / 5) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        {/* Background ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-muted/30"
        />
        {/* Progress ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={circumference - progress}
          strokeLinecap="round"
          className="text-accent transition-all duration-700"
        />
      </svg>
      {showLabel && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-foreground">{value.toFixed(1)}</span>
          {label && <span className="text-[10px] text-muted-foreground">{label}</span>}
        </div>
      )}
    </div>
  );
}

interface ScoreBarProps {
  label: string;
  value: number;
  max?: number;
}

export function ScoreBar({ label, value, max = 5 }: ScoreBarProps) {
  const pct = (value / max) * 100;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium tabular-nums">{value.toFixed(1)}</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-muted/40">
        <div
          className="h-full rounded-full bg-accent transition-all duration-700"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}