"use client";

import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";

export default function CounselorPage() {
  const t = useTranslations();
  const locale = useLocale();

  return (
    <main className="min-h-screen bg-background">
      <section className="relative min-h-screen flex flex-col items-center justify-center px-6 py-20 overflow-hidden">
        {/* 几何装饰背景元素 */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* 左上角装饰 */}
          <div className="absolute top-20 left-10 w-32 h-32 border border-accent/10 rotate-45" />
          <div className="absolute top-32 left-24 w-16 h-16 border border-primary/10 rotate-12" />
          
          {/* 右下角装饰 */}
          <div className="absolute bottom-20 right-10 w-40 h-40 border border-accent/10 -rotate-12" />
          <div className="absolute bottom-32 right-24 w-20 h-20 border border-gold/10 rotate-45" />
          
          {/* 中心淡色圆环 */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-accent/5" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full border border-primary/5" />
        </div>

        <div className="relative max-w-2xl mx-auto text-center">
          {/* 顶部装饰 */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="w-12 h-px bg-gradient-to-r from-transparent to-accent/30" />
            <div className="w-2 h-2 border border-accent/40 rotate-45" />
            <div className="w-12 h-px bg-gradient-to-l from-transparent to-accent/30" />
          </div>

          {/* 图标 */}
          <div
            className="w-20 h-20 mx-auto mb-8 border-2 border-accent/30 flex items-center justify-center animate-fade-in-scale"
            style={{ animationDelay: '0ms' }}
          >
            <span className="text-4xl">💬</span>
          </div>

          {/* 主标题 */}
          <h1
            className="text-3xl sm:text-4xl font-serif text-text mb-4 tracking-tight animate-fade-in-up"
            style={{ animationDelay: '100ms' }}
          >
            {t('counselor.title')}
          </h1>

          {/* 副标题 */}
          <p
            className="text-lg text-muted mb-8 max-w-xl mx-auto animate-fade-in-up"
            style={{ animationDelay: '200ms' }}
          >
            {t('counselor.subtitle')}
          </p>

          {/* 即将开放标记 */}
          <div
            className="inline-flex items-center gap-2 px-6 py-3 border border-accent/30 bg-accent/5 mb-12 animate-fade-in-up"
            style={{ animationDelay: '300ms' }}
          >
            <span className="w-2 h-2 bg-accent rounded-full animate-pulse" />
            <span className="text-accent font-medium">{t('counselor.comingSoon')}</span>
          </div>

          {/* 功能预览卡片 */}
          <div
            className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12 text-left animate-fade-in-up"
            style={{ animationDelay: '400ms' }}
          >
            <FeatureCard
              icon="🤝"
              title={t('counselor.features.matching.title')}
              desc={t('counselor.features.matching.desc')}
            />
            <FeatureCard
              icon="🔒"
              title={t('counselor.features.privacy.title')}
              desc={t('counselor.features.privacy.desc')}
            />
            <FeatureCard
              icon="💰"
              title={t('counselor.features.funding.title')}
              desc={t('counselor.features.funding.desc')}
            />
            <FeatureCard
              icon="✓"
              title={t('counselor.features.verified.title')}
              desc={t('counselor.features.verified.desc')}
            />
          </div>

          {/* 描述文本 */}
          <p
            className="text-body text-muted/80 mb-12 max-w-lg mx-auto leading-relaxed animate-fade-in-up"
            style={{ animationDelay: '500ms' }}
          >
            {t('counselor.description')}
          </p>

          {/* 返回按钮 */}
          <div
            className="animate-fade-in-up"
            style={{ animationDelay: '600ms' }}
          >
            <Link
              href={`/${locale}`}
              className="inline-flex items-center gap-2 px-8 py-3 border border-primary text-primary hover:bg-primary hover:text-white transition-all duration-300"
            >
              <span>←</span>
              <span>{t('nav.backToHome')}</span>
            </Link>
          </div>

          {/* 底部装饰 */}
          <div className="flex items-center justify-center gap-4 mt-16">
            <div className="w-8 h-px bg-accent/20" />
            <div className="w-1 h-1 bg-accent/40 rotate-45" />
            <div className="w-8 h-px bg-accent/20" />
          </div>
        </div>
      </section>
    </main>
  );
}

// 功能预览卡片组件
function FeatureCard({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  return (
    <div className="group relative p-5 bg-white/50 border border-secondary/50 hover:border-accent transition-all duration-300">
      {/* 角落装饰 */}
      <span className="absolute top-2 left-2 w-2 h-2 border-t border-l border-accent/30 group-hover:border-accent transition-colors" />
      <span className="absolute top-2 right-2 w-2 h-2 border-t border-r border-accent/30 group-hover:border-accent transition-colors" />
      <span className="absolute bottom-2 left-2 w-2 h-2 border-b border-l border-accent/30 group-hover:border-accent transition-colors" />
      <span className="absolute bottom-2 right-2 w-2 h-2 border-b border-r border-accent/30 group-hover:border-accent transition-colors" />

      <div className="flex items-start gap-3">
        <span className="text-2xl">{icon}</span>
        <div>
          <h3 className="font-medium text-text mb-1">{title}</h3>
          <p className="text-sm text-muted">{desc}</p>
        </div>
      </div>
    </div>
  );
}
