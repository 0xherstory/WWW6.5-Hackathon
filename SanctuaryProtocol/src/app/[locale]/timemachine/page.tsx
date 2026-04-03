"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";

export default function TimeMachinePage() {
  const t = useTranslations();
  const locale = useLocale();
  const [selectedDay, setSelectedDay] = useState(7);

  // TODO: 从智能合约获取用户的情绪数据
  const emotionData = null;

  return (
    <main className="min-h-screen px-6 py-16">
      <div className="max-w-4xl mx-auto">
        {/* 页面标题区 */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-8 h-px bg-accent/30" />
            <div className="w-1.5 h-1.5 border border-accent/50 rotate-45" />
            <div className="w-8 h-px bg-accent/30" />
          </div>

          <h1 className="text-h1 font-serif text-text mb-4">
            {t('timemachine.title')}
          </h1>
          <p className="text-body text-muted max-w-md mx-auto">
            {t('timemachine.subtitle')}
          </p>
        </div>

        {/* 时间选择器 */}
        <div className="relative bg-white/50 backdrop-blur-sm border border-secondary/30 p-10 mb-8">
          {/* 角落装饰 */}
          <span className="absolute top-4 left-4 w-3 h-3 border-t border-l border-accent/20" />
          <span className="absolute top-4 right-4 w-3 h-3 border-t border-r border-accent/20" />
          <span className="absolute bottom-4 left-4 w-3 h-3 border-b border-l border-accent/20" />
          <span className="absolute bottom-4 right-4 w-3 h-3 border-b border-r border-accent/20" />

          <h2 className="text-h3 font-serif text-text mb-8 text-center">
            {t('timemachine.selectTime')}
          </h2>

          <div className="space-y-8">
            {/* 天数选择 */}
            <div>
              <label className="block text-tag text-muted uppercase tracking-widest mb-4 text-center">
                {t('timemachine.daysFromToday')}
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                {[7, 14, 30, 60, 90, 180].map((day) => (
                  <button
                    key={day}
                    onClick={() => setSelectedDay(day)}
                    className={`relative py-4 border transition-all duration-300 ${
                      selectedDay === day
                        ? "border-accent bg-accent/5 text-accent"
                        : "border-secondary/30 text-muted hover:border-accent/30 hover:text-text"
                    }`}
                  >
                    <span className="text-sm font-medium">{day}</span>
                    <span className="block text-xs mt-1 opacity-60">{t('timemachine.days')}</span>
                    {selectedDay === day && (
                      <span className="absolute -top-1 -right-1 w-2 h-2 bg-accent" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* 分隔线 */}
            <div className="elegant-divider" />

            {/* 说明 */}
            <div className="bg-secondary/20 border border-secondary/30 p-6">
              <p className="text-small text-text text-center">
                <span className="text-accent">{t('timemachine.predictionMode')}：</span>
                {t('timemachine.predictionDesc', { days: selectedDay })}
              </p>
            </div>
          </div>
        </div>

        {/* 情绪预测 */}
        <div className="relative bg-white/50 backdrop-blur-sm border border-secondary/30 p-10">
          {/* 角落装饰 */}
          <span className="absolute top-4 left-4 w-3 h-3 border-t border-l border-accent/20" />
          <span className="absolute top-4 right-4 w-3 h-3 border-t border-r border-accent/20" />
          <span className="absolute bottom-4 left-4 w-3 h-3 border-b border-l border-accent/20" />
          <span className="absolute bottom-4 right-4 w-3 h-3 border-b border-r border-accent/20" />

          <h2 className="text-h3 font-serif text-text mb-8 text-center">
            {t('timemachine.emotionPrediction', { days: selectedDay })}
          </h2>

          {!emotionData && (
            <div className="text-center py-12">
              {/* 几何图标 */}
              <div className="w-16 h-16 mx-auto mb-6 flex items-center justify-center border border-accent/20">
                <span className="text-2xl text-accent/40">◉</span>
              </div>
              
              {/* 即将上线提示 */}
              <div className="bg-accent/5 border border-accent/20 rounded-lg p-4 mb-6 max-w-md mx-auto">
                <p className="text-accent font-medium mb-1">🚧 {t('timemachine.comingSoon')}</p>
                <p className="text-small text-muted">
                  {t('timemachine.comingSoonDesc')}
                </p>
              </div>
              
              <p className="text-body text-muted mb-2">
                {t('timemachine.futureStage', { days: selectedDay })}
              </p>
              <p className="text-small text-muted/70">
                {t('timemachine.completeFirstExploration')}
              </p>
            </div>
          )}
        </div>

        {/* 返回按钮 */}
        <div className="mt-12 text-center">
          <Link
            href={`/${locale}`}
            className="inline-flex items-center gap-2 text-sm text-muted hover:text-accent transition-colors duration-300"
          >
            <span>←</span>
            <span>{t('nav.backToHome')}</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
