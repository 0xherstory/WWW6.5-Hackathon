import * as React from "react";

import { cn } from "../../lib/cn";
import { Button } from "./Button";
import { BrandMark } from "./BrandMark";

interface FloatingPoint {
  id: number;
  className: string;
  driftClassName?: string;
  revealDelayMs?: number;
  size?: "sm" | "md" | "lg";
}

export interface FloatingIconsHeroProps
  extends React.HTMLAttributes<HTMLElement> {
  backgroundImageSrc?: string;
  title: string;
  subtitle: string;
  ctaText: string;
  onCtaClick?: () => void;
  ctaHref?: string;
  points: FloatingPoint[];
}

const sizeClasses: Record<NonNullable<FloatingPoint["size"]>, string> = {
  sm: "h-10 w-10",
  md: "h-14 w-14",
  lg: "h-20 w-20",
};

function GlowPoint({
  point,
  index,
}: {
  point: FloatingPoint;
  index: number;
}) {
  const sizeClass = sizeClasses[point.size ?? "md"];
  const innerSizeClass =
    point.size === "lg"
      ? "h-3.5 w-3.5"
      : point.size === "sm"
        ? "h-2 w-2"
        : "h-2.5 w-2.5";

  return (
    <div
      className={cn("absolute opacity-0 animate-threshold-point-reveal", point.className)}
      style={{
        animationDelay: `${point.revealDelayMs ?? 250 + index * 140}ms`,
      }}
    >
      <div
        className={cn(
          "relative flex items-center justify-center rounded-full",
          point.driftClassName ?? "animate-hero-orb-drift",
        )}
        style={{
          animationDelay: `${index * 0.35}s`,
          animationDuration: `${8 + (index % 4) * 1.4}s`,
        }}
      >
        <div
          className={cn(
            "animate-orb-breathe relative flex items-center justify-center rounded-full border border-[rgba(196,168,90,0.34)] bg-black/20 backdrop-blur-sm shadow-[0_0_22px_rgba(196,168,90,0.12)]",
            sizeClass,
          )}
          style={{
            animationDelay: `${index * 0.2}s`,
            animationDuration: `${4.5 + (index % 5) * 0.45}s`,
          }}
        >
          <div
            className={cn(
              "animate-threshold-core-glow rounded-full bg-[var(--signal)] shadow-[0_0_18px_6px_rgba(196,168,90,0.45)]",
              innerSizeClass,
            )}
            style={{
              animationDelay: `${point.revealDelayMs ?? 250 + index * 140}ms`,
            }}
          />
        </div>
      </div>
    </div>
  );
}

export function FloatingIconsHero({
  backgroundImageSrc,
  className,
  ctaHref,
  ctaText,
  onCtaClick,
  points,
  subtitle,
  title,
  ...props
}: FloatingIconsHeroProps) {
  return (
    <section
      className={cn(
        "relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-[var(--bg-primary)] px-6 py-20",
        className,
      )}
      {...props}
    >
      {backgroundImageSrc ? (
        <div
          className="pointer-events-none absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${backgroundImageSrc})` }}
        />
      ) : null}
      {!backgroundImageSrc ? (
        <>
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(155,127,212,0.12),transparent_32%),radial-gradient(circle_at_20%_20%,rgba(196,168,90,0.08),transparent_24%),linear-gradient(180deg,#0f0f1a_0%,#09090f_100%)]" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[42vh] bg-[radial-gradient(ellipse_at_center,rgba(196,168,90,0.08),transparent_58%)] blur-3xl" />
          <div className="pointer-events-none absolute inset-x-[-8%] bottom-[-6%] h-[38vh] bg-[linear-gradient(180deg,rgba(9,9,15,0)_0%,rgba(9,9,15,0.7)_58%,rgba(5,5,8,0.95)_100%)]" />
        </>
      ) : null}
      <div className="pointer-events-none absolute inset-0">
        {points.map((point, index) => (
          <GlowPoint key={point.id} point={point} index={index} />
        ))}
      </div>

      <div className="relative z-10 mx-auto flex max-w-4xl flex-col items-center text-center">
        <div className="animate-threshold-brand-rise mb-8 flex items-center gap-3 opacity-0 [animation-delay:180ms]">
          <BrandMark showText={false} size={36} />
          <span className="font-display text-sm uppercase tracking-[0.42em] text-[var(--text-primary)]">
            SEAMPHORE
          </span>
        </div>

        <h1 className="animate-threshold-title-rise opacity-0 font-display text-[clamp(3.3rem,9vw,7.25rem)] leading-[0.95] tracking-[0.04em] text-transparent bg-[linear-gradient(180deg,rgba(244,239,255,0.98)_0%,rgba(232,228,240,0.7)_100%)] bg-clip-text [animation-delay:520ms]">
          {title}
        </h1>

        <p className="animate-threshold-copy-rise mt-8 max-w-3xl opacity-0 text-base leading-8 text-[var(--text-secondary)] md:text-lg md:leading-9 [animation-delay:980ms]">
          {subtitle}
        </p>

        <div className="animate-threshold-cta-rise mt-12 opacity-0 [animation-delay:1480ms]">
          {onCtaClick ? (
            <Button
              onClick={onCtaClick}
              className="min-w-[260px] rounded-full border-[rgba(196,168,90,0.42)] bg-[rgba(196,168,90,0.14)] px-10 py-4 text-sm tracking-[0.12em] text-[var(--signal)] shadow-[0_20px_40px_rgba(0,0,0,0.35)] hover:-translate-y-0.5 hover:bg-[rgba(196,168,90,0.2)]"
            >
              {ctaText}
            </Button>
          ) : (
            <a
              href={ctaHref}
              className="inline-flex min-w-[260px] items-center justify-center rounded-full border border-[rgba(196,168,90,0.42)] bg-[rgba(196,168,90,0.14)] px-10 py-4 text-sm tracking-[0.12em] text-[var(--signal)] shadow-[0_20px_40px_rgba(0,0,0,0.35)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[rgba(196,168,90,0.2)]"
            >
              {ctaText}
            </a>
          )}
        </div>
      </div>
    </section>
  );
}
