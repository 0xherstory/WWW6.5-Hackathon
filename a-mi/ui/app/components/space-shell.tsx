"use client";

import Link from "next/link";
import { ReactNode } from "react";
import { WalletStatusCard } from "./wallet-status-card";

type Tone = "rose" | "sage" | "lavender" | "amber";

type StatItem = {
  label: string;
  value: string;
  hint?: string;
};

type NavLink = {
  href: string;
  label: string;
  tone?: Tone;
};

type ShellProps = {
  eyebrow: string;
  title: string;
  description: string;
  status: string;
  meta: string[];
  stats: StatItem[];
  children: ReactNode;
  aside?: ReactNode;
  navLinks: NavLink[];
};

const toneClasses: Record<Tone, string> = {
  rose:
    "border-[var(--tone-rose-border)] bg-[var(--tone-rose-bg)] text-[var(--tone-rose-text)]",
  sage:
    "border-[var(--tone-sage-border)] bg-[var(--tone-sage-bg)] text-[var(--tone-sage-text)]",
  lavender:
    "border-[var(--tone-lavender-border)] bg-[var(--tone-lavender-bg)] text-[var(--tone-lavender-text)]",
  amber:
    "border-[var(--tone-amber-border)] bg-[var(--tone-amber-bg)] text-[var(--tone-amber-text)]",
};

export function SpacePageShell({
  eyebrow,
  title,
  description,
  status,
  meta,
  stats,
  children,
  aside,
  navLinks,
}: ShellProps) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[var(--ami-shell-bg)] px-4 py-6 text-[var(--ami-text-primary)] sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-[-10%] top-[-7%] h-[24rem] w-[24rem] rounded-full bg-[radial-gradient(circle_at_center,rgba(242,222,227,0.6),rgba(242,222,227,0)_72%)]" />
        <div className="absolute right-[-8%] top-[12%] h-[28rem] w-[28rem] rounded-full bg-[radial-gradient(circle_at_center,rgba(231,240,226,0.56),rgba(231,240,226,0)_72%)]" />
        <div className="absolute bottom-[-12%] left-[20%] h-[22rem] w-[22rem] rounded-full bg-[radial-gradient(circle_at_center,rgba(238,228,245,0.46),rgba(238,228,245,0)_72%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,252,249,0.76)_0%,rgba(246,240,233,0.22)_48%,rgba(244,240,244,0.42)_100%)]" />
      </div>

      <div className="relative mx-auto max-w-7xl">
        <header className="rounded-[34px] border border-[var(--ami-border-soft)] bg-[var(--ami-surface)] px-5 py-5 shadow-[var(--ami-shadow-soft)] backdrop-blur-xl sm:px-7 sm:py-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-[var(--ami-border-soft)] bg-[rgba(255,255,255,0.62)] px-3 py-1.5 text-[0.68rem] uppercase tracking-[0.22em] text-[#9f7887]">
                <span className="h-2 w-2 rounded-full bg-[#c68ca1]" />
                {eyebrow}
              </div>
              <h1 className="mt-4 text-[clamp(2.4rem,5vw,4rem)] font-semibold tracking-[-0.05em] text-[var(--ami-text-primary)]">
                {title}
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--ami-text-body)] sm:text-base">
                {description}
              </p>
            </div>

            <div className="flex flex-col items-start gap-3 lg:items-end">
              <SpaceBadge tone="rose">{status}</SpaceBadge>
              <WalletStatusCard
                className="rounded-[24px] border border-[rgba(191,173,181,0.16)] bg-[rgba(255,255,255,0.68)] px-4 py-3 text-left shadow-[0_10px_24px_rgba(110,89,99,0.06)]"
                labelClassName="text-[0.68rem] uppercase tracking-[0.18em] text-[#9b7a88]"
                addressClassName="mt-2 text-sm font-semibold tracking-[0.04em] text-[var(--ami-text-primary)]"
                statusClassName="mt-1 text-xs tracking-[0.08em] text-[var(--ami-text-soft)]"
              />
              <Link
                href="/square"
                className="inline-flex items-center rounded-full border border-[var(--ami-border-soft)] bg-white/80 px-4 py-2.5 text-sm text-[var(--ami-text-body)] shadow-[0_8px_20px_rgba(110,89,99,0.05)] transition hover:bg-white"
              >
                返回 a.mi 主城
              </Link>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-2.5">
            {meta.map((item) => (
              <div
                key={item}
                className="rounded-full border border-[rgba(191,173,181,0.14)] bg-[rgba(255,255,255,0.58)] px-3.5 py-2 text-xs tracking-[0.08em] text-[var(--ami-text-soft)]"
              >
                {item}
              </div>
            ))}
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {stats.map((stat) => (
              <SpaceStatCard key={stat.label} {...stat} />
            ))}
          </div>
        </header>

        <section className="relative mt-6 overflow-hidden rounded-[40px] border border-[rgba(186,168,175,0.14)] bg-[linear-gradient(180deg,rgba(252,249,245,0.96)_0%,rgba(247,242,237,0.94)_52%,rgba(247,244,248,0.94)_100%)] px-5 py-6 shadow-[0_34px_90px_rgba(105,82,92,0.08)] sm:px-8 sm:py-8 lg:px-10 lg:py-10">
          <div className="absolute inset-x-16 top-0 h-px bg-[linear-gradient(90deg,rgba(213,187,194,0)_0%,rgba(213,187,194,0.62)_50%,rgba(213,187,194,0)_100%)]" />
          <div className="absolute right-[10%] top-[12%] hidden h-40 w-24 rounded-[999px] bg-[linear-gradient(180deg,rgba(255,255,255,0.9)_0%,rgba(249,246,241,0.16)_100%)] opacity-75 blur-sm lg:block" />
          <div className="absolute bottom-[14%] right-[12%] hidden h-28 w-28 rounded-full bg-[radial-gradient(circle_at_center,rgba(235,223,244,0.62),rgba(235,223,244,0)_74%)] lg:block" />

          <div className={cx("grid gap-6", aside ? "lg:grid-cols-[1.12fr_0.88fr]" : "")}>
            <div className="space-y-6">{children}</div>
            {aside ? <div className="space-y-6">{aside}</div> : null}
          </div>
        </section>

        <footer className="mt-6 flex flex-wrap gap-3 pb-4">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cx(
                "rounded-full border px-4 py-2.5 text-sm shadow-[0_8px_22px_rgba(110,89,99,0.05)] transition hover:bg-white",
                toneClasses[link.tone ?? "rose"],
              )}
            >
              {link.label}
            </Link>
          ))}
        </footer>
      </div>
    </main>
  );
}

export function SpacePanel({
  children,
  tone = "rose",
  className,
}: {
  children: ReactNode;
  tone?: Tone;
  className?: string;
}) {
  const panelTones: Record<Tone, string> = {
    rose:
      "border-[rgba(186,164,172,0.14)] bg-[linear-gradient(180deg,rgba(255,252,249,0.92)_0%,rgba(250,245,240,0.9)_100%)]",
    sage:
      "border-[rgba(176,196,170,0.16)] bg-[linear-gradient(180deg,rgba(247,252,245,0.96)_0%,rgba(239,247,236,0.92)_100%)]",
    lavender:
      "border-[rgba(188,176,203,0.16)] bg-[linear-gradient(180deg,rgba(248,245,251,0.96)_0%,rgba(241,235,248,0.92)_100%)]",
    amber:
      "border-[rgba(219,203,175,0.16)] bg-[linear-gradient(180deg,rgba(252,248,239,0.96)_0%,rgba(248,242,231,0.92)_100%)]",
  };

  return (
    <article
      className={cx(
        "rounded-[32px] border p-6 shadow-[0_18px_44px_rgba(109,87,97,0.05)]",
        panelTones[tone],
        className,
      )}
    >
      {children}
    </article>
  );
}

export function SpaceSectionTitle({
  eyebrow,
  title,
  action,
}: {
  eyebrow: string;
  title: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <p className="text-[0.72rem] uppercase tracking-[0.18em] text-[#967684]">
          {eyebrow}
        </p>
        <h2 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-[var(--ami-text-primary)]">
          {title}
        </h2>
      </div>
      {action}
    </div>
  );
}

export function SpaceBadge({
  children,
  tone = "rose",
}: {
  children: ReactNode;
  tone?: Tone;
}) {
  return (
    <span
      className={cx(
        "inline-flex rounded-full border px-4 py-2 text-xs uppercase tracking-[0.16em]",
        toneClasses[tone],
      )}
    >
      {children}
    </span>
  );
}

export function SpaceButton({
  children,
  tone = "rose",
  type = "button",
  onClick,
  disabled,
  className,
}: {
  children: ReactNode;
  tone?: Tone;
  type?: "button" | "submit";
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}) {
  const buttonTones: Record<Tone, string> = {
    rose:
      "bg-[linear-gradient(135deg,#c58ca2_0%,#b97c95_100%)] text-[#fffafc] shadow-[0_16px_34px_rgba(182,122,146,0.2)] hover:shadow-[0_22px_40px_rgba(182,122,146,0.24)]",
    sage:
      "bg-[linear-gradient(135deg,#8fb488_0%,#7aa57b_100%)] text-[#f8fff8] shadow-[0_16px_34px_rgba(122,165,123,0.2)] hover:shadow-[0_22px_40px_rgba(122,165,123,0.24)]",
    lavender:
      "bg-[linear-gradient(135deg,#a894c6_0%,#8f80af_100%)] text-[#fcfbff] shadow-[0_16px_34px_rgba(143,128,175,0.2)] hover:shadow-[0_22px_40px_rgba(143,128,175,0.24)]",
    amber:
      "bg-[linear-gradient(135deg,#d8b988_0%,#c9a56e_100%)] text-[#fffaf1] shadow-[0_16px_34px_rgba(201,165,110,0.18)] hover:shadow-[0_22px_40px_rgba(201,165,110,0.22)]",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cx(
        "inline-flex min-w-[190px] items-center justify-center rounded-full px-6 py-3.5 text-sm font-semibold transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:hover:translate-y-0",
        buttonTones[tone],
        className,
      )}
    >
      {children}
    </button>
  );
}

export function SpaceField({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="grid gap-2 text-sm font-medium text-[#5d4952]">
      {label}
      {children}
    </label>
  );
}

export function SpaceInput({
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cx(
        "rounded-[22px] border border-[rgba(181,160,168,0.18)] bg-[rgba(255,255,255,0.88)] px-4 py-3.5 text-sm text-[#4e3c44] outline-none transition focus:border-[rgba(185,133,154,0.4)]",
        className,
      )}
    />
  );
}

export function SpaceSelect({
  className,
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={cx(
        "rounded-[22px] border border-[rgba(181,160,168,0.18)] bg-[rgba(255,255,255,0.88)] px-4 py-3.5 text-sm text-[#4e3c44] outline-none transition focus:border-[rgba(185,133,154,0.4)]",
        className,
      )}
    >
      {children}
    </select>
  );
}

export function SpaceTextarea({
  className,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={cx(
        "rounded-[24px] border border-[rgba(181,160,168,0.18)] bg-[rgba(255,255,255,0.88)] px-4 py-3.5 text-sm text-[#4e3c44] outline-none transition focus:border-[rgba(185,133,154,0.4)]",
        className,
      )}
    />
  );
}

export function SpaceListItem({
  title,
  description,
  meta,
}: {
  title: string;
  description: string;
  meta?: string;
}) {
  return (
    <div className="rounded-[24px] border border-[rgba(182,162,169,0.12)] bg-[var(--ami-surface-strong)] px-5 py-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-sm font-semibold text-[var(--ami-text-primary)]">{title}</h3>
          <p className="mt-2 text-sm leading-7 text-[var(--ami-text-body)]">{description}</p>
        </div>
        {meta ? (
          <span className="text-xs uppercase tracking-[0.14em] text-[#9b7c89]">
            {meta}
          </span>
        ) : null}
      </div>
    </div>
  );
}

export function SpaceEmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-[28px] border border-dashed border-[rgba(190,171,178,0.28)] bg-[rgba(255,255,255,0.42)] px-6 py-8 text-center">
      <p className="text-lg font-semibold text-[var(--ami-text-primary)]">{title}</p>
      <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-[var(--ami-text-body)]">
        {description}
      </p>
      {action ? <div className="mt-5 flex justify-center">{action}</div> : null}
    </div>
  );
}

function SpaceStatCard({ label, value, hint }: StatItem) {
  return (
    <div className="rounded-[26px] border border-[rgba(191,173,181,0.14)] bg-[rgba(255,255,255,0.58)] px-5 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.35)]">
      <p className="text-[0.72rem] uppercase tracking-[0.16em] text-[#9b7a88]">
        {label}
      </p>
      <p className="mt-3 text-[1.7rem] font-semibold tracking-[-0.04em] text-[var(--ami-text-primary)]">
        {value}
      </p>
      {hint ? <p className="mt-2 text-sm leading-6 text-[var(--ami-text-body)]">{hint}</p> : null}
    </div>
  );
}

function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}
