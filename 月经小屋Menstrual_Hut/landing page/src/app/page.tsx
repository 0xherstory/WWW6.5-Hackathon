"use client";

import { motion } from "framer-motion";
import {
  ArrowRight,
  BookHeart,
  Globe2,
  HeartHandshake,
  Infinity,
  Link2,
  Moon,
  PenLine,
  Shield,
  Sparkles,
  Users,
} from "lucide-react";
import Link from "next/link";
import { TwilightBackground } from "@/components/twilight-background";
import { buttonVariants } from "@/components/ui/button";
import { LanguageToggle, useLocale } from "@/contexts/locale-context";
import { cn } from "@/lib/utils";

const APP_URL = "https://menstrualhut.vercel.app/";

const BLOCKCHAIN_ICONS = [Infinity, Globe2, Shield, HeartHandshake] as const;
const STEP_ICONS = [Link2, PenLine, BookHeart, Users] as const;

function MoonGlow({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "pointer-events-none absolute rounded-full bg-gradient-to-br from-moon-glow via-fuchsia-100/80 to-lilac/20 blur-3xl opacity-70 animate-shimmer",
        className
      )}
      aria-hidden
    />
  );
}

function HutSilhouette({ className }: { className?: string }) {
  return (
    <svg
      className={cn("text-hut-wooddeep/30", className)}
      viewBox="0 0 200 140"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M100 8L12 88h24v44h128V88h24L100 8z"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="2"
        opacity="0.5"
      />
      <rect x="78" y="92" width="44" height="40" rx="2" fill="#c4a574" opacity="0.45" />
      <path d="M100 20L32 82h8L100 32l60 50h8L100 20z" fill="#8b6914" opacity="0.25" />
    </svg>
  );
}

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.05 * i, duration: 0.55, ease: [0.22, 1, 0.36, 1] },
  }),
};

export default function LandingPage() {
  const { t } = useLocale();

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <TwilightBackground />
      <div className="relative z-10">
      <MoonGlow className="-top-32 left-1/2 h-96 w-[min(100vw,720px)] -translate-x-1/2" />
      <div className="pointer-events-none absolute bottom-[20%] left-[-5%] hidden w-40 md:block">
        <HutSilhouette className="h-auto w-full opacity-60" />
      </div>

      <motion.header
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="sticky top-0 z-50 border-b border-stone-300/60 bg-hut-cream/95 backdrop-blur-md"
      >
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:flex-nowrap sm:gap-4 sm:px-6">
          <Link
            href="/"
            className="flex min-w-0 items-center gap-2 text-stone-900 transition hover:text-petal-deep"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-petal/20 bg-gradient-to-br from-moon-glow to-fuchsia-100 shadow-card">
              <Moon className="h-4 w-4 text-petal" strokeWidth={2} />
            </span>
            <span className="font-display text-sm font-bold tracking-tight text-stone-900 sm:text-base">
              {t.brand}
            </span>
          </Link>
          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <LanguageToggle />
            <p className="max-w-[min(100%,11rem)] text-right font-display text-[10px] font-bold leading-tight text-stone-900 sm:max-w-[14rem] sm:text-xs md:max-w-none md:text-sm">
              {t.tagline}
            </p>
          </div>
        </div>
      </motion.header>

      <main>
        <section className="relative px-4 pb-20 pt-12 sm:px-6 sm:pb-28 sm:pt-16 md:pt-20">
          <div className="mx-auto max-w-3xl text-center">
            <motion.div
              custom={0}
              initial="hidden"
              animate="show"
              variants={fadeUp}
              className="mb-4 inline-flex items-center gap-2 rounded-full border border-stone-300/80 bg-white/95 px-3 py-1.5 text-xs font-semibold text-stone-900 shadow-md backdrop-blur-sm sm:text-sm"
            >
              <Sparkles className="h-3.5 w-3.5 shrink-0 text-petal" strokeWidth={2.5} />
              <span>{t.heroBadge}</span>
            </motion.div>
            <motion.h1
              custom={1}
              initial="hidden"
              animate="show"
              variants={fadeUp}
              className="font-display text-balance bg-gradient-to-r from-petal via-lilac to-petal-light bg-clip-text text-4xl font-bold tracking-tight text-transparent sm:text-5xl md:text-6xl"
            >
              {t.brand}
            </motion.h1>
            <motion.p
              custom={2}
              initial="hidden"
              animate="show"
              variants={fadeUp}
              className="mt-3 font-display text-lg font-semibold text-fuchsia-200 sm:text-xl"
            >
              {t.tagline}
            </motion.p>
            <motion.p
              custom={3}
              initial="hidden"
              animate="show"
              variants={fadeUp}
              className="mx-auto mt-5 max-w-xl text-pretty text-base leading-relaxed text-stone-200 sm:text-lg"
            >
              {t.heroSubtitle}
            </motion.p>
            <motion.div
              custom={4}
              initial="hidden"
              animate="show"
              variants={fadeUp}
              className="mt-10 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center"
            >
              <a
                href={APP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(buttonVariants({ size: "lg" }), "w-full sm:w-auto")}
              >
                {t.ctaEnter}
                <ArrowRight className="h-5 w-5" />
              </a>
              <a
                href="#why"
                className={cn(
                  buttonVariants({ variant: "secondary", size: "lg" }),
                  "w-full sm:w-auto"
                )}
              >
                {t.ctaLearnMore}
              </a>
            </motion.div>
          </div>
        </section>

        <section
          id="why"
          className="relative bg-section-soft px-4 py-16 sm:px-6 sm:py-20"
        >
          <div className="mx-auto max-w-3xl">
            <motion.h2
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.5 }}
              className="font-display text-center text-2xl font-bold text-fuchsia-200 sm:text-3xl"
            >
              {t.whyTitle}
            </motion.h2>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.5, delay: 0.08 }}
              className="mx-auto mt-6 max-w-2xl space-y-4 rounded-2xl border border-white/10 bg-slate-950/55 p-6 text-pretty text-left text-base leading-[1.85] text-stone-100 shadow-lg backdrop-blur-md sm:p-8 sm:text-lg"
            >
              {t.whyPoints.map((point, i) => (
                <p key={i}>
                  <span className="font-semibold text-fuchsia-300">{point.label}</span>
                  {" — "}
                  <span className="text-stone-200">{point.body}</span>
                </p>
              ))}
            </motion.div>
          </div>
        </section>

        <section className="px-4 py-16 sm:px-6 sm:py-20">
          <div className="mx-auto max-w-5xl">
            <motion.h2
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              className="text-center font-display text-2xl font-bold text-fuchsia-200 sm:text-3xl"
            >
              {t.blockchainTitle}
            </motion.h2>
            <div className="mt-12 grid gap-5 sm:grid-cols-2">
              {t.blockchainCards.map((item, i) => {
                const Icon = BLOCKCHAIN_ICONS[i];
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-40px" }}
                    transition={{ delay: i * 0.06, duration: 0.45 }}
                    className="group rounded-2xl border border-petal/10 bg-white/85 p-6 text-stone-800 shadow-card backdrop-blur-sm transition hover:border-lilac/30 hover:shadow-moon"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-moon-glow to-fuchsia-50 text-petal transition group-hover:scale-105">
                      <Icon className="h-6 w-6" strokeWidth={1.75} />
                    </div>
                    <h3 className="mt-4 font-display text-lg font-semibold text-petal-deep">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-stone-600 sm:text-base">
                      {item.desc}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="relative overflow-hidden border-y border-white/10 bg-gradient-to-b from-fuchsia-950/25 via-slate-900/40 to-slate-950/30 px-4 py-16 sm:px-6 sm:py-20">
          <div className="relative mx-auto max-w-3xl text-center">
            <motion.h2
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="font-display text-2xl font-bold text-fuchsia-200 sm:text-3xl"
            >
              {t.whatTitle}
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.06 }}
              className="mt-6 text-pretty text-base leading-[1.85] text-stone-200 sm:text-lg"
            >
              {t.whatBody}
            </motion.p>
          </div>
        </section>

        <section id="how" className="px-4 py-16 sm:px-6 sm:py-20">
          <div className="mx-auto max-w-5xl">
            <motion.h2
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center font-display text-2xl font-bold text-fuchsia-200 sm:text-3xl"
            >
              {t.howTitle}
            </motion.h2>
            <div className="mt-12 flex flex-col gap-6 md:flex-row md:items-stretch md:justify-between md:gap-4">
              {t.howSteps.map((s, i) => {
                const Icon = STEP_ICONS[i];
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08 }}
                    className="relative flex flex-1 flex-col rounded-2xl border border-petal/10 bg-white/85 p-5 text-center text-stone-800 shadow-card md:min-w-0"
                  >
                    {i < 3 && (
                      <div
                        className="absolute -bottom-3 left-1/2 hidden h-0.5 w-[calc(100%+1rem)] -translate-x-1/2 bg-gradient-to-r from-transparent via-petal/20 to-transparent md:block md:top-1/2 md:left-full md:h-0.5 md:w-8 md:translate-x-0 md:-translate-y-1/2"
                        aria-hidden
                      />
                    )}
                    <span className="font-display text-3xl font-bold text-petal/40">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div className="mx-auto mt-3 flex h-11 w-11 items-center justify-center rounded-full bg-moon-glow text-petal">
                      <Icon className="h-5 w-5" strokeWidth={2} />
                    </div>
                    <p className="mt-3 font-display font-semibold text-petal-deep">
                      {s.primary}
                    </p>
                    <p className="mt-1 text-xs text-stone-500 sm:text-sm">{s.secondary}</p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="bg-hut-sand/50 px-4 py-16 sm:px-6 sm:py-20">
          <div className="mx-auto max-w-2xl">
            <motion.h2
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center font-display text-2xl font-bold text-fuchsia-200 sm:text-3xl"
            >
              {t.mvpTitle}
            </motion.h2>
            <motion.ul
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="mt-8 space-y-3 rounded-2xl border border-petal/10 bg-white/80 p-6 shadow-card"
            >
              {t.mvpItems.map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-stone-700">
                  <span
                    className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-gradient-to-br from-petal to-lilac"
                    aria-hidden
                  />
                  <span>{item}</span>
                </li>
              ))}
            </motion.ul>
          </div>
        </section>

        <section className="px-4 py-16 sm:px-6 sm:py-20">
          <div className="mx-auto max-w-3xl text-center">
            <motion.h2
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="font-display text-2xl font-bold text-fuchsia-200 sm:text-3xl"
            >
              {t.trackTitle}
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.06 }}
              className="mt-4 font-display text-lg font-medium text-lilac sm:text-xl"
            >
              {t.trackSubtitle}
            </motion.p>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.12 }}
              className="mt-6 text-pretty text-base leading-[1.85] text-stone-200 sm:text-lg"
            >
              {t.trackBody}
            </motion.p>
          </div>
        </section>

        <section className="border-t border-petal/10 bg-gradient-to-b from-transparent to-moon-glow/40 px-4 py-16 sm:px-6 sm:py-20">
          <div className="mx-auto max-w-5xl">
            <motion.h2
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center font-display text-2xl font-bold text-fuchsia-200 sm:text-3xl"
            >
              {t.futureTitle}
            </motion.h2>
            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {t.futureCards.map((card, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="rounded-2xl border border-white/60 bg-white/85 p-6 text-center text-stone-800 shadow-card backdrop-blur-sm"
                >
                  <h3 className="font-display text-lg font-semibold text-petal-deep">
                    {card.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-stone-600 sm:text-base">
                    {card.text}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="relative px-4 pb-24 pt-12 sm:px-6 sm:pb-32 sm:pt-16">
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-fuchsia-50/80 to-transparent" />
          <div className="relative mx-auto max-w-3xl text-center">
            <HutSilhouette className="mx-auto mb-8 h-24 w-auto text-hut-wood/40 sm:h-28" />
            <motion.blockquote
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="font-display text-balance text-xl font-medium leading-relaxed text-fuchsia-100 sm:text-2xl"
            >
              {t.closingQuote}
            </motion.blockquote>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="mt-10"
            >
              <a
                href={APP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(buttonVariants({ size: "lg" }), "min-w-[min(100%,280px)]")}
              >
                {t.ctaEnterClosing}
                <Moon className="h-5 w-5" />
              </a>
            </motion.div>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/10 bg-hut-cream/95 py-6 text-center text-xs text-stone-600">
        <p>{t.footer}</p>
      </footer>
      </div>
    </div>
  );
}
