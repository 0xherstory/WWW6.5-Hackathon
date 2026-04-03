"use client";

import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface RatingDisplayProps {
  value: number;
  max?: number;
  size?: "sm" | "md" | "lg";
  showValue?: boolean;
}

export function RatingDisplay({ value, max = 5, size = "md", showValue = true }: RatingDisplayProps) {
  const iconSize = size === "sm" ? "h-3.5 w-3.5" : size === "lg" ? "h-5 w-5" : "h-4 w-4";
  const full = Math.floor(value);
  const partial = value - full;

  return (
    <div className="inline-flex items-center gap-1">
      <div className="flex items-center">
        {Array.from({ length: max }).map((_, i) => {
          const filled = i < full || (i === full && partial >= 0.5);
          return (
            <Star
              key={i}
              className={cn(
                iconSize,
                filled
                  ? "fill-accent text-accent"
                  : partial > 0 && i === full
                  ? "fill-muted text-muted-foreground"
                  : "fill-muted text-muted-foreground",
              )}
            />
          );
        })}
      </div>
      {showValue && (
        <span className={cn("font-semibold tabular-nums", size === "sm" && "text-xs", size === "md" && "text-sm", size === "lg" && "text-base")}>
          {value.toFixed(1)}
        </span>
      )}
    </div>
  );
}

interface RatingBarsProps {
  distribution: { stars: number; count: number; pct: number }[];
}

export function RatingBars({ distribution }: RatingBarsProps) {
  const reversed = [...distribution].reverse();

  return (
    <div className="space-y-1.5">
      {reversed.map((d) => (
        <div key={d.stars} className="flex items-center gap-2 text-xs">
          <span className="w-6 shrink-0 text-right text-muted-foreground">{d.stars}星</span>
          <div className="h-2 w-32 flex-1 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-accent transition-all duration-500"
              style={{ width: `${d.pct}%` }}
            />
          </div>
          <span className="w-8 text-right tabular-nums text-muted-foreground">{d.count}</span>
          <span className="w-10 text-right tabular-nums text-muted-foreground">{d.pct}%</span>
        </div>
      ))}
    </div>
  );
}

interface StatsGridProps {
  stats: Record<string, number>;
  labels: Record<string, string>;
}

export function StatsGrid({ stats, labels }: StatsGridProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {Object.entries(stats).map(([key, value]) => (
        <div key={key} className="rounded-lg border border-border/60 bg-muted/30 p-3 text-center">
          <p className="text-xl font-semibold text-foreground">{value.toFixed(1)}</p>
          <p className="mt-1 text-xs text-muted-foreground">{labels[key] ?? key}</p>
        </div>
      ))}
    </div>
  );
}