"use client";

import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";

export default function Home() {
  const t = useTranslations();
  const locale = useLocale();

  return (
    <main className="min-h-screen bg-background">
      {/* Hero Section */}
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

        <div className="relative max-w-4xl mx-auto text-center">
          {/* 顶部装饰 */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="w-12 h-px bg-gradient-to-r from-transparent to-accent/30" />
            <div className="w-2 h-2 border border-accent/40 rotate-45" />
            <div className="w-12 h-px bg-gradient-to-l from-transparent to-accent/30" />
          </div>

          {/* 主标题 */}
          <h1
            className="text-4xl sm:text-5xl md:text-6xl font-serif text-text mb-6 tracking-tight animate-fade-in-up"
            style={{ animationDelay: '0ms' }}
          >
            {t('home.title')}
          </h1>

          {/* 副标题 */}
          <p
            className="text-xl sm:text-2xl text-muted mb-4 max-w-2xl mx-auto leading-relaxed animate-fade-in-up"
            style={{ animationDelay: '100ms' }}
          >
            {t('home.subtitle')}
          </p>

          <p
            className="text-body text-muted/70 mb-12 max-w-xl mx-auto animate-fade-in-up"
            style={{ animationDelay: '200ms' }}
          >
            {t('home.description')}
          </p>

          {/* 分隔线 */}
          <div className="elegant-divider max-w-xs mx-auto mb-12" />

          {/* 核心原则 */}
          <div
            className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-16 max-w-3xl mx-auto animate-fade-in-up"
            style={{ animationDelay: '300ms' }}
          >
            <PrincipleItem
              icon="◈"
              title={t('home.principles.privacy.title')}
              desc={t('home.principles.privacy.desc')}
            />
            <PrincipleItem
              icon="◎"
              title={t('home.principles.decentralized.title')}
              desc={t('home.principles.decentralized.desc')}
            />
            <PrincipleItem
              icon="◉"
              title={t('home.principles.transparent.title')}
              desc={t('home.principles.transparent.desc')}
            />
          </div>

          {/* 三个主要服务按钮 */}
          <div
            className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-4xl mx-auto mb-12 animate-fade-in-up"
            style={{ animationDelay: '400ms' }}
          >
            <ServiceCard
              href={`/${locale}/launch`}
              icon="◈"
              title={t('home.services.ohcards.title')}
              desc={t('home.services.ohcards.desc')}
              highlight
            />
            <ServiceCard
              href={`/${locale}/counselor`}
              icon="◎"
              title={t('home.services.counseling.title')}
              desc={t('home.services.counseling.desc')}
              comingSoon
            />
            <ServiceCard
              href={`/${locale}/cbt`}
              icon="◉"
              title={t('home.services.cbt.title')}
              desc={t('home.services.cbt.desc')}
              comingSoon
            />
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

// 核心原则项组件
function PrincipleItem({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  return (
    <div className="text-center group">
      <div className="w-12 h-12 mx-auto mb-3 border border-accent/30 flex items-center justify-center group-hover:border-accent transition-colors">
        <span className="text-xl text-accent">{icon}</span>
      </div>
      <h4 className="font-medium text-text mb-1">{title}</h4>
      <p className="text-sm text-muted">{desc}</p>
    </div>
  );
}

// 服务卡片组件
function ServiceCard({ 
  href, 
  icon, 
  title, 
  desc, 
  highlight = false,
  comingSoon = false 
}: { 
  href: string; 
  icon: string; 
  title: string; 
  desc: string;
  highlight?: boolean;
  comingSoon?: boolean;
}) {
  const t = useTranslations();
  
  return (
    <Link
      href={href}
      className={`
        group relative p-6 text-left transition-all duration-300
        ${highlight 
          ? "bg-white border-2 border-accent hover:shadow-lg" 
          : "bg-white/50 border border-secondary/50 hover:border-accent"
        }
      `}
    >
      {/* 角落装饰 */}
      <span className="absolute top-3 left-3 w-2 h-2 border-t border-l border-accent/30 group-hover:border-accent transition-colors" />
      <span className="absolute top-3 right-3 w-2 h-2 border-t border-r border-accent/30 group-hover:border-accent transition-colors" />
      <span className="absolute bottom-3 left-3 w-2 h-2 border-b border-l border-accent/30 group-hover:border-accent transition-colors" />
      <span className="absolute bottom-3 right-3 w-2 h-2 border-b border-r border-accent/30 group-hover:border-accent transition-colors" />

      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 border border-accent/30 flex items-center justify-center text-2xl">
          {icon}
        </div>
        {comingSoon && (
          <span className="text-xs bg-accent/10 text-accent px-2 py-1 rounded">{t('home.comingSoon')}</span>
        )}
      </div>

      <h3 className="text-lg font-serif text-text mb-2">{title}</h3>
      <p className="text-sm text-muted">{desc}</p>

      <div className="mt-4 flex items-center text-sm text-accent group-hover:underline">
        {comingSoon ? t('home.learnMore') : t('home.experienceNow')} →
      </div>
    </Link>
  );
}
