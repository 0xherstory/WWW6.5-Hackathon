"use client";

import type { AbstractIntlMessages } from "next-intl";
import { NextIntlClientProvider, useTranslations } from "next-intl";
import Link from "next/link";
import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { avalancheFuji } from "thirdweb/chains";
import { ConnectButton } from "thirdweb/react";

import {
  hutConnectButtonClassName,
  hutConnectTheme,
} from "@/lib/thirdweb-connect-theme";
import { thirdwebClient } from "@/lib/thirdweb-client";

type Locale = "zh" | "en";

const pageMessages = {
  zh: {
    brand: "Menstrual Hut | 月经小屋",
    slogan: "No uterus, no opinion",
    connectWallet: "连接钱包",
    personalCenter: "个人中心",
    backExplore: "返回探索",
    emptyTitle: "姐妹经验",
    emptyContent:
      "暂时没有可读内容。请从首页右侧探索区选择一条话题进入，或通过完整链接访问（需包含 title 与 content 参数）。",
    footerHint: "温柔阅读 · 彼此照亮",
  },
  en: {
    brand: "Menstrual Hut | 月经小屋",
    slogan: "No uterus, no opinion",
    connectWallet: "Connect Wallet",
    personalCenter: "Profile",
    backExplore: "Back to explore",
    emptyTitle: "Sister wisdom",
    emptyContent:
      "Nothing to read yet. Open a topic from the home explore column, or use a link that includes title and content.",
    footerHint: "Read gently · Light for each other",
  },
} as const;

function safeDecodeParam(raw: string | null): string {
  if (raw == null || raw === "") return "";
  try {
    return decodeURIComponent(raw.replace(/\+/g, " "));
  } catch {
    return raw;
  }
}

function ExperienceBody({
  locale,
  onToggleLocale,
  title,
  content,
}: {
  locale: Locale;
  onToggleLocale: () => void;
  title: string;
  content: string;
}) {
  const t = useTranslations();

  const displayTitle = title.trim() || t("emptyTitle");
  const displayContent = content.trim() || t("emptyContent");

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f3e8ff] to-[#ffe4f0] text-[#4c1d95]">
      <header className="sticky top-0 z-30 border-b border-white/60 bg-white/65 px-4 py-3 backdrop-blur-md">
        <nav className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3">
          <Link href="/" className="flex items-center gap-2 rounded-lg outline-none ring-[#d946ef]/40 focus-visible:ring-2">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#f9a8d4] bg-white/90 shadow-sm">
              <svg viewBox="0 0 24 24" className="h-6 w-6 text-[#9f1239]" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M4 13c3.5-1 5.6-4.3 7.5-8 0 6 2.5 8 8.5 8-3.8 1.1-5.7 3.2-7.1 7-1.2-2.7-3.5-4.2-8.9-7z" />
              </svg>
            </span>
            <p className="text-sm font-semibold md:text-base">{t("brand")}</p>
          </Link>
          <p className="hidden text-center text-sm italic text-[#9f1239] md:block">{t("slogan")}</p>
          <div className="flex flex-wrap items-center justify-end gap-2">
            <div className="glow-hover flex shrink-0 items-center">
              <ConnectButton
                client={thirdwebClient}
                chain={avalancheFuji}
                theme={hutConnectTheme}
                connectButton={{
                  label: t("connectWallet"),
                  className: hutConnectButtonClassName,
                }}
              />
            </div>
            <Link
              href="/profile"
              className="glow-hover rounded-full border border-[#f9a8d4] bg-white px-3 py-2 text-sm font-medium text-[#9f1239]"
            >
              {t("personalCenter")}
            </Link>
            <button
              type="button"
              onClick={onToggleLocale}
              className="glow-hover rounded-full border border-[#f9a8d4] bg-white px-3 py-2 text-sm font-medium text-[#9f1239]"
            >
              {locale === "zh" ? "中 / EN" : "EN / 中"}
            </button>
          </div>
        </nav>
      </header>

      <main className="mx-auto w-full max-w-3xl px-4 py-8 md:py-12">
        <article className="rounded-3xl border border-white/70 bg-white/90 p-6 shadow-[0_12px_40px_rgba(159,18,57,0.08)] backdrop-blur-sm md:p-10">
          <h1 className="text-balance text-2xl font-bold leading-tight text-[#9f1239] md:text-3xl">
            {displayTitle}
          </h1>
          <div className="mt-8 border-t border-pink-100/90 pt-8">
            <div className="whitespace-pre-wrap text-pretty text-base leading-relaxed text-[#4c1d95] md:text-lg">
              {displayContent}
            </div>
          </div>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Link
              href="/#explore"
              className="glow-hover inline-flex w-full justify-center rounded-2xl bg-gradient-to-r from-[#f472b6] to-[#d946ef] px-5 py-3 text-center text-sm font-semibold text-white shadow-md transition sm:w-auto"
            >
              {t("backExplore")}
            </Link>
            <p className="text-center text-xs text-[#9f1239]/70 sm:text-right">{t("footerHint")}</p>
          </div>
        </article>
      </main>
    </div>
  );
}

function ExperienceWithParams() {
  const searchParams = useSearchParams();
  const urlLocale: Locale = searchParams.get("lang") === "en" ? "en" : "zh";
  const [locale, setLocale] = useState<Locale>(urlLocale);

  const title = useMemo(() => safeDecodeParam(searchParams.get("title")), [searchParams]);
  const content = useMemo(() => safeDecodeParam(searchParams.get("content")), [searchParams]);

  return (
    <NextIntlClientProvider
      locale={locale}
      messages={pageMessages[locale] as unknown as AbstractIntlMessages}
    >
      <ExperienceBody
        locale={locale}
        onToggleLocale={() => setLocale((l) => (l === "zh" ? "en" : "zh"))}
        title={title}
        content={content}
      />
    </NextIntlClientProvider>
  );
}

export default function ExperiencePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-[#f3e8ff] to-[#ffe4f0] text-sm text-[#9f1239]">
          <span className="rounded-full border border-pink-200 bg-white/80 px-5 py-3 shadow-sm">加载中…</span>
        </div>
      }
    >
      <ExperienceWithParams />
    </Suspense>
  );
}
