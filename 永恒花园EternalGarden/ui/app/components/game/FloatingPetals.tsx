"use client";

type Props = {
  /** intro：略少；introRich：开场页专用，更丰富但仍不抢字 */
  variant?: "default" | "intro" | "introRich";
};

export default function FloatingPetals({ variant = "default" }: Props) {
  const count = variant === "introRich" ? 16 : variant === "intro" ? 8 : 18;
  const opacityMul = variant === "introRich" ? 0.68 : variant === "intro" ? 0.45 : 1;
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden>
      {Array.from({ length: count }).map((_, i) => (
        <span
          key={i}
          className="absolute rounded-[50%_0_50%_0] opacity-0"
          style={{
            width: `${6 + (i % 7) * 2}px`,
            height: `${6 + (i % 7) * 2}px`,
            left: `${(i * 5.7) % 100}%`,
            background:
              i % 4 === 0
                ? `rgba(248,228,236,${0.38 * opacityMul})`
                : i % 4 === 1
                  ? `rgba(236,228,248,${0.32 * opacityMul})`
                  : i % 4 === 2
                    ? `rgba(255,236,228,${0.34 * opacityMul})`
                    : `rgba(242,220,232,${0.28 * opacityMul})`,
            animation: `petal-drift ${14 + (i % 9)}s linear infinite`,
            animationDelay: `${(i % 11) * 0.85}s`,
          }}
        />
      ))}
    </div>
  );
}
