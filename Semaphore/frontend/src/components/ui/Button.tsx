import { ButtonHTMLAttributes, ReactNode } from "react";

import { cn } from "../../lib/cn";

type Variant = "amber" | "violet" | "ghost" | "green" | "danger";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  children: ReactNode;
}

const variantClasses: Record<Variant, string> = {
  amber:
    "border border-[rgba(196,168,90,0.35)] bg-[rgba(196,168,90,0.1)] text-[var(--signal)] hover:bg-[rgba(196,168,90,0.2)]",
  violet:
    "border border-[rgba(155,127,212,0.35)] bg-[rgba(155,127,212,0.12)] text-[var(--resonance)] hover:bg-[rgba(155,127,212,0.2)]",
  ghost:
    "border border-[var(--line)] bg-transparent text-[var(--text-secondary)] hover:border-[var(--line-strong)] hover:text-[var(--text-primary)]",
  green:
    "border border-[rgba(74,222,128,0.3)] bg-[rgba(74,222,128,0.1)] text-[#4ADE80]",
  danger:
    "border border-[rgba(239,68,68,0.35)] bg-[rgba(239,68,68,0.1)] text-[#EF4444] hover:bg-[rgba(239,68,68,0.2)]",
};

export function Button({
  children,
  className,
  variant = "amber",
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm tracking-[0.08em] transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-45",
        variantClasses[variant],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
