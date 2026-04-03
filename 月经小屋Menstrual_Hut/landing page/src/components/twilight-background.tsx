"use client";

import { useMemo, type CSSProperties } from "react";
import { cn } from "@/lib/utils";

const STAR_COUNT = 96;

function starStyle(i: number) {
  const left = ((i * 47.13) % 100) + (i % 3) * 0.3;
  const top = ((i * 71.29) % 88) + (i % 5) * 0.2;
  const sizeClass =
    i % 11 === 0 ? "twilight-star-dot--lg" : i % 5 === 0 ? "twilight-star-dot--md" : "";
  const delay = ((i * 0.37) % 4).toFixed(2);
  const duration = (2.2 + (i % 5) * 0.55).toFixed(2);
  return {
    left: `${left}%`,
    top: `${top}%`,
    style: {
      animationDelay: `${delay}s`,
      animationDuration: `${duration}s`,
    } as CSSProperties,
    sizeClass,
    cross: i % 13 === 0,
  };
}

export function TwilightBackground() {
  const stars = useMemo(
    () => Array.from({ length: STAR_COUNT }, (_, i) => ({ id: i, ...starStyle(i) })),
    []
  );

  return (
    <div
      className="twilight-bg-root pointer-events-none fixed inset-0 z-0 overflow-hidden"
      aria-hidden
    >
      <div className="twilight-bg-sky" />
      <div className="twilight-bg-haze" />
      <div className="twilight-bg-nebula" />
      <div className="twilight-bg-mountains" />

      <div className="twilight-bg-moon-wrap pointer-events-auto">
        <div className="twilight-bg-moon" />
      </div>

      <div className="twilight-bg-stars" aria-hidden>
        {stars.map((s) => (
          <span
            key={s.id}
            className="twilight-star-hit"
            style={{ left: s.left, top: s.top }}
          >
            <span
              className={cn(
                "twilight-star-dot",
                s.sizeClass,
                s.cross && "twilight-star-dot--cross"
              )}
              style={s.style}
            />
          </span>
        ))}
      </div>
    </div>
  );
}
