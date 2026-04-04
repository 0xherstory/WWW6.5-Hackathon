"use client";

import { ReactNode } from "react";

type Tone = "rose" | "sage" | "lavender" | "amber";

const toneClassNames: Record<Tone, string> = {
  rose:
    "border-[rgba(203,172,184,0.24)] bg-[linear-gradient(180deg,rgba(255,251,250,0.94)_0%,rgba(255,244,246,0.92)_100%)]",
  sage:
    "border-[rgba(173,199,171,0.24)] bg-[linear-gradient(180deg,rgba(248,253,246,0.95)_0%,rgba(240,248,237,0.92)_100%)]",
  lavender:
    "border-[rgba(191,181,210,0.24)] bg-[linear-gradient(180deg,rgba(250,247,253,0.95)_0%,rgba(241,236,248,0.92)_100%)]",
  amber:
    "border-[rgba(223,205,172,0.24)] bg-[linear-gradient(180deg,rgba(255,250,243,0.95)_0%,rgba(249,242,230,0.92)_100%)]",
};

export function SceneStatusRail({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={`space-y-2.5 ${className ?? ""}`.trim()}>{children}</div>;
}

export function SceneStatusCard({
  eyebrow,
  title,
  description,
  tone = "rose",
  action,
  footer,
  className,
}: {
  eyebrow: string;
  title: string;
  description: string;
  tone?: Tone;
  action?: ReactNode;
  footer?: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`min-w-0 overflow-hidden rounded-[24px] border px-4 py-3.5 shadow-[0_14px_30px_rgba(97,76,82,0.08)] backdrop-blur-md ${toneClassNames[tone]} ${className ?? ""}`.trim()}
    >
      <p className="break-words text-[0.68rem] tracking-[0.18em] text-[#8f7780]">
        {eyebrow}
      </p>
      <h2 className="mt-1.5 break-words text-[0.98rem] font-semibold tracking-[0.01em] text-[#4d3a42]">
        {title}
      </h2>
      <p className="mt-1.5 break-words text-[0.92rem] leading-5.5 text-[#67545c]">{description}</p>
      {action ? <div className="mt-3">{action}</div> : null}
      {footer ? <div className="mt-2.5">{footer}</div> : null}
    </section>
  );
}
