"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useTranslations, useLocale } from "next-intl";
import { IMAGE_CARDS } from "@/config/cards";
import { getPoolStatus, type PoolStatus } from "@/lib/web3/sanctuaryContract";

// 画廊卡牌组件 - 带懒加载和 fallback
function GalleryCard({
  card,
  isHovered,
  onHover,
  onLeave,
  locale,
  t,
}: {
  card: (typeof IMAGE_CARDS)[0];
  isHovered: boolean;
  onHover: () => void;
  onLeave: () => void;
  locale: string;
  t: (key: string) => string;
}) {
  const [imgSrc, setImgSrc] = useState(card.imagePath);
  const [hasError, setHasError] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "100px", threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleError = useCallback(() => {
    if (!hasError) {
      setImgSrc(card.fallbackPath);
      setHasError(true);
    }
  }, [hasError, card.fallbackPath]);

  return (
    <div
      ref={ref}
      className="relative aspect-[9/16] overflow-hidden border border-secondary hover:border-accent transition-all duration-300 cursor-pointer group"
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
    >
      {isVisible ? (
        <>
          <Image
            src={imgSrc}
            alt={card.cnName}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 33vw, (max-width: 768px) 25vw, (max-width: 1024px) 20vw, 16vw"
            draggable={false}
            onError={handleError}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="absolute bottom-0 left-0 right-0 p-2 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
            <p className="text-[10px] sm:text-xs font-medium truncate">
              {locale === "zh" ? card.cnName : card.name}
            </p>
            <p className="text-white/70 text-[8px] sm:text-[10px]">
              {t("launch.gallery.track")} {card.trackId} · {t("launch.gallery.stage")} {card.stage}
            </p>
          </div>
          {isHovered && (
            <div className="absolute top-2 right-2 w-5 h-5 sm:w-6 sm:h-6 bg-accent flex items-center justify-center">
              <svg
                className="w-3 h-3 sm:w-4 sm:h-4 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </div>
          )}
        </>
      ) : (
        <div className="w-full h-full bg-gray-100 animate-pulse" />
      )}
    </div>
  );
}

export default function LaunchPage() {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [poolStatus, setPoolStatus] = useState<PoolStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 加载资金池状态
  useEffect(() => {
    const loadPoolStatus = async () => {
      setIsLoading(true);
      const status = await getPoolStatus();
      setPoolStatus(status);
      setIsLoading(false);
    };

    loadPoolStatus();
    // 每 30 秒刷新一次
    const interval = setInterval(loadPoolStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <main className="min-h-screen bg-background px-4 sm:px-6 py-12 sm:py-16">
      <div className="max-w-6xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif text-text mb-4">
            {t('launch.title')}
          </h1>
          <p className="text-base sm:text-lg text-muted max-w-3xl mx-auto mb-4">
            {t('launch.subtitle')}
          </p>
        </div>

        {/* 1. 庇护所资金池状态 */}
        <div className="max-w-4xl mx-auto mb-12">
          <div className="relative bg-white border border-secondary p-6 sm:p-8">
            {/* 角落装饰 */}
            <span className="absolute top-3 left-3 w-2 h-2 border-t border-l border-accent/30" />
            <span className="absolute top-3 right-3 w-2 h-2 border-t border-r border-accent/30" />
            <span className="absolute bottom-3 left-3 w-2 h-2 border-b border-l border-accent/30" />
            <span className="absolute bottom-3 right-3 w-2 h-2 border-b border-r border-accent/30" />
            
            <h2 className="text-lg sm:text-xl font-serif text-text mb-6 text-center">
              {t('launch.pool.title')}
            </h2>

            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-4 sm:gap-6 text-center">
                <div>
                  <p className="text-2xl sm:text-3xl font-serif text-accent">{poolStatus?.balance || "0"} AVAX</p>
                  <p className="text-xs sm:text-sm text-muted">{t('launch.pool.balance')}</p>
                </div>
                <div>
                  <p className="text-2xl sm:text-3xl font-serif text-accent">{poolStatus?.donationCount || 0}</p>
                  <p className="text-xs sm:text-sm text-muted">{t('launch.pool.donors')}</p>
                </div>
                <div>
                  <p className="text-2xl sm:text-3xl font-serif text-accent">{poolStatus?.claimCount || 0}</p>
                  <p className="text-xs sm:text-sm text-muted">{t('launch.pool.helped')}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 2. 资金流转提示 */}
        <div className="max-w-4xl mx-auto mb-12">
          <div className="relative bg-accent/5 border border-accent/20 p-6 sm:p-8">
            {/* 角落装饰 */}
            <span className="absolute top-3 left-3 w-2 h-2 border-t border-l border-accent/30" />
            <span className="absolute top-3 right-3 w-2 h-2 border-t border-r border-accent/30" />
            <span className="absolute bottom-3 left-3 w-2 h-2 border-b border-l border-accent/30" />
            <span className="absolute bottom-3 right-3 w-2 h-2 border-b border-r border-accent/30" />
            
            <h2 className="text-lg sm:text-xl font-serif text-text mb-6 text-center">
              {t('launch.flow.title')}
            </h2>

            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 text-sm text-text">
              <div className="flex items-center gap-2 bg-white px-4 py-2 border border-secondary">
                <span className="text-lg">🎨</span>
                <span>{t('launch.flow.step1')}</span>
              </div>
              <span className="text-accent text-xl">→</span>
              <div className="flex items-center gap-2 bg-white px-4 py-2 border border-secondary">
                <span className="text-lg">🏦</span>
                <span>{t('launch.flow.step2')}</span>
              </div>
              <span className="text-accent text-xl">→</span>
              <div className="flex items-center gap-2 bg-white px-4 py-2 border border-secondary">
                <span className="text-lg">🌱</span>
                <span>{t('launch.flow.step3')}</span>
              </div>
              <span className="text-accent text-xl">→</span>
              <div className="flex items-center gap-2 bg-white px-4 py-2 border border-secondary">
                <span className="text-lg">💎</span>
                <span>{t('launch.flow.step4')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 3. 选择你的模式 */}
        <div className="mb-12">
          <h2 className="text-xl sm:text-2xl font-serif text-text mb-6 sm:mb-8 text-center">
            {t('launch.modes.title')}
          </h2>

          <div className="grid md:grid-cols-2 gap-4 sm:gap-6 max-w-4xl mx-auto">
            {/* 疗愈者模式 */}
            <button
              onClick={() => router.push(`/${locale}/spreads`)}
              className="group relative bg-white border border-secondary p-6 sm:p-8 text-left hover:border-accent transition-all duration-300"
            >
              <span className="absolute top-3 left-3 w-2 h-2 border-t border-l border-accent/30 group-hover:border-accent transition-colors" />
              <span className="absolute top-3 right-3 w-2 h-2 border-t border-r border-accent/30 group-hover:border-accent transition-colors" />
              <span className="absolute bottom-3 left-3 w-2 h-2 border-b border-l border-accent/30 group-hover:border-accent transition-colors" />
              <span className="absolute bottom-3 right-3 w-2 h-2 border-b border-r border-accent/30 group-hover:border-accent transition-colors" />

              <div className="w-12 h-12 mb-4 border border-accent/30 flex items-center justify-center">
                <span className="text-xl">◈</span>
              </div>
              <h3 className="text-lg sm:text-xl font-serif text-text mb-2">
                {t('launch.modes.healer.name')}
              </h3>
              <p className="text-sm text-muted mb-3 italic">
                "{t('launch.modes.healer.tagline')}"
              </p>
              <p className="text-sm text-text/80 mb-4">
                {t('launch.modes.healer.desc')}
              </p>
              <div className="text-sm text-muted mb-4">
                <strong>{t('launch.modes.healer.processTitle')}</strong>
              </div>
              <ol className="text-sm text-text/80 space-y-1 mb-6">
                <li>{t('launch.modes.healer.step1')}</li>
                <li>{t('launch.modes.healer.step2')}</li>
                <li>{t('launch.modes.healer.step3')}</li>
                <li>{t('launch.modes.healer.step4')}</li>
              </ol>
              <div className="flex items-center text-sm text-accent group-hover:underline">
                {t('launch.modes.healer.cta')} →
              </div>
            </button>

            {/* 守护者模式 */}
            <button
              onClick={() => router.push(`/${locale}/guardian`)}
              className="group relative bg-white border border-secondary p-6 sm:p-8 text-left hover:border-accent transition-all duration-300"
            >
              <span className="absolute top-3 left-3 w-2 h-2 border-t border-l border-accent/30 group-hover:border-accent transition-colors" />
              <span className="absolute top-3 right-3 w-2 h-2 border-t border-r border-accent/30 group-hover:border-accent transition-colors" />
              <span className="absolute bottom-3 left-3 w-2 h-2 border-b border-l border-accent/30 group-hover:border-accent transition-colors" />
              <span className="absolute bottom-3 right-3 w-2 h-2 border-b border-r border-accent/30 group-hover:border-accent transition-colors" />

              <div className="w-12 h-12 mb-4 border border-accent/30 flex items-center justify-center">
                <span className="text-xl">◉</span>
              </div>
              <h3 className="text-lg sm:text-xl font-serif text-text mb-2">
                {t('launch.modes.guardian.name')}
              </h3>
              <p className="text-sm text-muted mb-3 italic">
                "{t('launch.modes.guardian.tagline')}"
              </p>
              <p className="text-sm text-text/80 mb-4">
                {t('launch.modes.guardian.desc')}
              </p>
              <div className="text-sm text-muted mb-4">
                <strong>{t('launch.modes.guardian.processTitle')}</strong>
              </div>
              <ol className="text-sm text-text/80 space-y-1 mb-6">
                <li>{t('launch.modes.guardian.step1')}</li>
                <li>{t('launch.modes.guardian.step2')}</li>
                <li>{t('launch.modes.guardian.step3')}</li>
                <li>{t('launch.modes.guardian.step4')}</li>
              </ol>
              <div className="flex items-center text-sm text-accent group-hover:underline">
                {t('launch.modes.guardian.cta')} →
              </div>
            </button>
          </div>

          <p className="text-center text-sm text-muted mt-4">
            {t('launch.modes.note')}
          </p>
        </div>

        {/* 4. 30张OH卡画廊展示 */}
        <div className="mb-12">
          <h2 className="text-xl sm:text-2xl font-serif text-text mb-4 sm:mb-6 text-center">
            {t('launch.gallery.title')}
          </h2>
          <p className="text-center text-sm text-muted mb-4 sm:mb-6">
            {t('launch.gallery.subtitle')}
          </p>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 sm:gap-4 max-w-6xl mx-auto">
            {IMAGE_CARDS.slice(0, 30).map((card) => (
              <GalleryCard
                key={card.id}
                card={card}
                isHovered={hoveredCard === card.id}
                onHover={() => setHoveredCard(card.id)}
                onLeave={() => setHoveredCard(null)}
                locale={locale}
                t={t}
              />
            ))}
          </div>
        </div>

        {/* 5. 真实用户故事 */}
        <div className="max-w-5xl mx-auto mb-12">
          <div className="relative bg-white border border-secondary p-6 sm:p-8">
            {/* 角落装饰 */}
            <span className="absolute top-3 left-3 w-2 h-2 border-t border-l border-accent/30" />
            <span className="absolute top-3 right-3 w-2 h-2 border-t border-r border-accent/30" />
            <span className="absolute bottom-3 left-3 w-2 h-2 border-b border-l border-accent/30" />
            <span className="absolute bottom-3 right-3 w-2 h-2 border-b border-r border-accent/30" />
            
            <h2 className="text-xl sm:text-2xl font-serif text-text mb-6 sm:mb-8 text-center">
              {t('launch.stories.title')}
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6 sm:gap-8">
              {/* 用户故事 1 */}
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 border border-accent/30 flex items-center justify-center flex-shrink-0">
                    <span className="text-xl text-accent">◈</span>
                  </div>
                  <div>
                    <p className="text-sm text-muted mb-2">{t('launch.stories.healer.role')}</p>
                    <p className="text-text/80 text-sm leading-relaxed">
                      &ldquo;{t('launch.stories.healer.content')}&rdquo;
                    </p>
                  </div>
                </div>
              </div>

              {/* 用户故事 2 */}
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 border border-accent/30 flex items-center justify-center flex-shrink-0">
                    <span className="text-xl">💎</span>
                  </div>
                  <div>
                    <p className="text-sm text-muted mb-2">{t('launch.stories.guardian.role')}</p>
                    <p className="text-text/80 text-sm leading-relaxed">
                      &ldquo;{t('launch.stories.guardian.content')}&rdquo;
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 6. 核心原则 */}
        <div className="max-w-4xl mx-auto">
          <div className="relative bg-secondary/30 border border-secondary p-6 sm:p-8">
            {/* 角落装饰 */}
            <span className="absolute top-3 left-3 w-2 h-2 border-t border-l border-accent/30" />
            <span className="absolute top-3 right-3 w-2 h-2 border-t border-r border-accent/30" />
            <span className="absolute bottom-3 left-3 w-2 h-2 border-b border-l border-accent/30" />
            <span className="absolute bottom-3 right-3 w-2 h-2 border-b border-r border-accent/30" />
            
            <h3 className="text-lg sm:text-xl font-serif text-text mb-6 sm:mb-8 text-center">
              {t('launch.principles.title')}
            </h3>
            <div className="grid sm:grid-cols-3 gap-6 sm:gap-8">
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-3 border border-accent/30 flex items-center justify-center">
                  <span className="text-xl">◈</span>
                </div>
                <h4 className="font-medium text-text mb-1">{t('launch.principles.privacy.title')}</h4>
                <p className="text-sm text-muted">{t('launch.principles.privacy.desc')}</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-3 border border-accent/30 flex items-center justify-center">
                  <span className="text-xl">◎</span>
                </div>
                <h4 className="font-medium text-text mb-1">{t('launch.principles.decentralized.title')}</h4>
                <p className="text-sm text-muted">{t('launch.principles.decentralized.desc')}</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-3 border border-accent/30 flex items-center justify-center">
                  <span className="text-xl">◉</span>
                </div>
                <h4 className="font-medium text-text mb-1">{t('launch.principles.transparent.title')}</h4>
                <p className="text-sm text-muted">{t('launch.principles.transparent.desc')}</p>
              </div>
            </div>
          </div>
        </div>

        {/* 即将推出的服务 */}
        <div className="mt-12 mb-8">
          <h2 className="text-xl sm:text-2xl font-serif text-text mb-6 sm:mb-8 text-center">
            {t('launch.upcoming.title')}
          </h2>

          <div className="grid md:grid-cols-2 gap-4 sm:gap-6 max-w-4xl mx-auto">
            {/* 心理咨询服务 */}
            <button
              onClick={() => router.push(`/${locale}/counselor`)}
              className="group relative bg-white/50 border border-secondary/50 p-6 sm:p-8 text-left hover:border-accent transition-all duration-300"
            >
              <span className="absolute top-3 left-3 w-2 h-2 border-t border-l border-accent/30 group-hover:border-accent transition-colors" />
              <span className="absolute top-3 right-3 w-2 h-2 border-t border-r border-accent/30 group-hover:border-accent transition-colors" />
              <span className="absolute bottom-3 left-3 w-2 h-2 border-b border-l border-accent/30 group-hover:border-accent transition-colors" />
              <span className="absolute bottom-3 right-3 w-2 h-2 border-b border-r border-accent/30 group-hover:border-accent transition-colors" />

              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 border border-accent/30 flex items-center justify-center">
                  <span className="text-xl text-accent">◎</span>
                </div>
                <span className="text-xs bg-accent/10 text-accent px-2 py-1 rounded">{t('launch.upcoming.soon')}</span>
              </div>
              <h3 className="text-lg sm:text-xl font-serif text-text mb-2">
                {t('launch.upcoming.counseling.title')}
              </h3>
              <p className="text-sm text-muted mb-3">
                {t('launch.upcoming.counseling.desc')}
              </p>
              <div className="flex items-center text-sm text-accent group-hover:underline">
                {t('launch.upcoming.learnMore')} →
              </div>
            </button>

            {/* CBT认知行为疗法 */}
            <button
              onClick={() => router.push(`/${locale}/cbt`)}
              className="group relative bg-white/50 border border-secondary/50 p-6 sm:p-8 text-left hover:border-accent transition-all duration-300"
            >
              <span className="absolute top-3 left-3 w-2 h-2 border-t border-l border-accent/30 group-hover:border-accent transition-colors" />
              <span className="absolute top-3 right-3 w-2 h-2 border-t border-r border-accent/30 group-hover:border-accent transition-colors" />
              <span className="absolute bottom-3 left-3 w-2 h-2 border-b border-l border-accent/30 group-hover:border-accent transition-colors" />
              <span className="absolute bottom-3 right-3 w-2 h-2 border-b border-r border-accent/30 group-hover:border-accent transition-colors" />

              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 border border-accent/30 flex items-center justify-center">
                  <span className="text-xl text-accent">◉</span>
                </div>
                <span className="text-xs bg-accent/10 text-accent px-2 py-1 rounded">{t('launch.upcoming.soon')}</span>
              </div>
              <h3 className="text-lg sm:text-xl font-serif text-text mb-2">
                {t('launch.upcoming.cbt.title')}
              </h3>
              <p className="text-sm text-muted mb-3">
                {t('launch.upcoming.cbt.desc')}
              </p>
              <div className="flex items-center text-sm text-accent group-hover:underline">
                {t('launch.upcoming.learnMore')} →
              </div>
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
