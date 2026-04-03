"use client";

import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { SPREADS, getAllSpreads } from "@/config/spreads";

export default function SpreadsPage() {
  const t = useTranslations();
  const locale = useLocale();
  const spreads = getAllSpreads();

  return (
    <main className="min-h-screen px-6 py-16">
      <div className="max-w-5xl mx-auto">
        {/* 页面标题区 */}
        <div className="text-center mb-16">
          {/* 顶部装饰 */}
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-8 h-px bg-accent/30" />
            <div className="w-1.5 h-1.5 border border-accent/50 rotate-45" />
            <div className="w-8 h-px bg-accent/30" />
          </div>
          
          <h1 className="text-h1 font-serif text-text mb-4">
            {t('spreads.title')}
          </h1>
          <p className="text-body text-muted max-w-md mx-auto">
            {t('spreads.subtitle')}
          </p>
        </div>

        {/* 牌阵网格 */}
        <div className="grid gap-6 md:grid-cols-2">
          {spreads.map((spread, index) => (
            <SpreadCard key={spread.type} spread={spread} index={index} t={t} locale={locale} />
          ))}
        </div>

        {/* 返回按钮 */}
        <div className="mt-16 text-center">
          <Link
            href={`/${locale}`}
            className="inline-flex items-center gap-2 text-sm text-muted hover:text-accent transition-colors duration-300"
          >
            <span>←</span>
            <span>{t('spreads.backToHome')}</span>
          </Link>
        </div>
      </div>
    </main>
  );
}

// 牌阵卡片组件
function SpreadCard({ spread, index, t, locale }: { spread: typeof SPREADS.single; index: number; t: ReturnType<typeof useTranslations>; locale: string }) {
  // 几何图标映射
  const geometricIcons: Record<string, string> = {
    single: "◆",
    dual: "◈",
    triple: "◉",
    johari: "✦",
  };

  return (
    <Link href={`/${locale}/select/${spread.type}`} className="group block">
      <div className="relative bg-white/50 backdrop-blur-sm border border-secondary/30 p-8 transition-all duration-500 hover:border-accent/40 hover:shadow-card-hover">
        {/* 角落装饰 */}
        <span className="absolute top-4 left-4 w-3 h-3 border-t border-l border-accent/20 group-hover:border-accent/40 transition-colors" />
        <span className="absolute top-4 right-4 w-3 h-3 border-t border-r border-accent/20 group-hover:border-accent/40 transition-colors" />
        <span className="absolute bottom-4 left-4 w-3 h-3 border-b border-l border-accent/20 group-hover:border-accent/40 transition-colors" />
        <span className="absolute bottom-4 right-4 w-3 h-3 border-b border-r border-accent/20 group-hover:border-accent/40 transition-colors" />

        <div className="flex items-start gap-6">
          {/* 几何图标 */}
          <div className="flex-shrink-0 w-16 h-16 flex items-center justify-center border border-accent/20 group-hover:border-accent/40 group-hover:bg-accent/5 transition-all duration-300">
            <span className="text-3xl text-accent/60 group-hover:text-accent transition-colors">
              {geometricIcons[spread.type] || "◆"}
            </span>
          </div>

          <div className="flex-1">
            {/* 序号 */}
            <div className="text-tag text-accent/50 mb-2 tracking-widest">
              {String(index + 1).padStart(2, "0")}
            </div>

            {/* 名称 */}
            <h2 className="text-h3 font-serif text-text mb-3 group-hover:text-accent transition-colors duration-300">
              {t(`spreads.types.${spread.type}.name`)}
            </h2>

            {/* 描述 */}
            <p className="text-small text-muted mb-4 leading-relaxed">
              {t(`spreads.types.${spread.type}.description`)}
            </p>

            {/* 卡牌数量 */}
            <div className="flex items-center gap-4 text-tag text-muted/70">
              <span className="flex items-center gap-1">
                <span className="text-accent/40">◆</span>
                <span>{spread.cardCount} {t('spreads.cards')}</span>
              </span>
            </div>
          </div>
        </div>

        {/* 悬浮指示 */}
        <div className="absolute right-8 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <span className="text-accent text-xl">→</span>
        </div>
      </div>
    </Link>
  );
}
