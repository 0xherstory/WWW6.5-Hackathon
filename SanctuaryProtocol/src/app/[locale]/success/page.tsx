"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useClaimStore } from "@/stores/claimStore";
import { useCardStore } from "@/stores/cardStore";

interface JournalRecord {
  cid: string;
  content: string;
  startTime: string;
  wordCount: number;
}

export default function SuccessPage() {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isAnimating, setIsAnimating] = useState(true);
  const { hasClaimed, claimAmount, claimTxHash } = useClaimStore();
  const [journalRecord, setJournalRecord] = useState<JournalRecord | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);

  useEffect(() => {
    // 清除卡牌选择状态，防止下次进入时读到脏数据
    useCardStore.getState().clearSelection();

    // 从 URL 获取交易哈希
    const urlTx = searchParams.get('tx');
    if (urlTx) {
      setTxHash(urlTx);
    }

    // 从 localStorage 获取日记记录
    const stored = localStorage.getItem('oh-card-current-journal');
    if (stored) {
      try {
        setJournalRecord(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse journal record:", e);
      }
    }

    const timer = setTimeout(() => {
      setIsAnimating(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, [searchParams]);

  const explorerUrl = txHash || claimTxHash
    ? `https://testnet.snowtrace.io/tx/${txHash || claimTxHash}`
    : null;

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(locale === 'zh' ? 'zh-CN' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <main className="min-h-screen bg-background px-6 py-16">
      <div className="max-w-2xl mx-auto">
        {/* 标题区域 */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="w-12 h-px bg-gradient-to-r from-transparent to-accent/30" />
            <div className="w-2 h-2 border border-accent/40 rotate-45" />
            <div className="w-12 h-px bg-gradient-to-l from-transparent to-accent/30" />
          </div>
          
          {isAnimating ? (
            <div className="mb-8">
              <div className="w-20 h-20 mx-auto mb-6 border border-accent flex items-center justify-center animate-pulse">
                <span className="text-4xl text-accent">◆</span>
              </div>
              <h1 className="text-h1 font-serif text-text mb-4">
                {t('success.title')}
              </h1>
              <p className="text-body text-muted">
                {t('success.subtitle')}
              </p>
            </div>
          ) : (
            <div className="mb-8">
              <div className="w-20 h-20 mx-auto mb-6 border border-accent bg-accent flex items-center justify-center">
                <span className="text-4xl text-light">◆</span>
              </div>
              <h1 className="text-h1 font-serif text-text mb-4">
                {t('success.title')}
              </h1>
              <p className="text-body text-muted">
                {t('success.message')}
              </p>
            </div>
          )}
        </div>

        {/* 日记记录卡片 */}
        {journalRecord && (
          <div className="relative bg-white border border-secondary p-6 sm:p-8 mb-8">
            <span className="absolute top-3 left-3 w-2 h-2 border-t border-l border-accent/30" />
            <span className="absolute top-3 right-3 w-2 h-2 border-t border-r border-accent/30" />
            <span className="absolute bottom-3 left-3 w-2 h-2 border-b border-l border-accent/30" />
            <span className="absolute bottom-3 right-3 w-2 h-2 border-b border-r border-accent/30" />
            
            <h3 className="text-h3 font-serif text-text mb-6 text-center">
              {t('success.journal.title')}
            </h3>

            <div className="space-y-4">
              <div className="flex justify-between items-center py-3 border-b border-secondary/50">
                <span className="text-small text-muted">{t('success.journal.recordTime')}</span>
                <span className="text-body text-text">{formatDate(journalRecord.startTime)}</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-secondary/50">
                <span className="text-small text-muted">{t('success.journal.wordCount')}</span>
                <span className="text-body text-text">{journalRecord.wordCount} {t('success.journal.words')}</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-secondary/50">
                <span className="text-small text-muted">{t('success.journal.ipfs')}</span>
                <span className="text-tag text-muted font-mono">
                  {journalRecord.cid.slice(0, 12)}...{journalRecord.cid.slice(-8)}
                </span>
              </div>
              {txHash && (
                <div className="flex justify-between items-center py-3">
                  <span className="text-small text-muted">{t('success.journal.blockchain')}</span>
                  <a
                    href={explorerUrl || ''}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-small text-accent hover:text-accent-dark transition-colors"
                  >
                    {t('success.journal.viewTx')} →
                  </a>
                </div>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-secondary/50">
              <p className="text-small text-muted mb-2">{t('success.journal.preview')}</p>
              <p className="text-body text-text line-clamp-3">
                {journalRecord.content.slice(0, 100)}
                {journalRecord.content.length > 100 ? '...' : ''}
              </p>
            </div>
          </div>
        )}

        {/* 领取资金卡片 */}
        {hasClaimed && claimAmount && (
          <div className="relative bg-secondary/30 border border-secondary p-6 sm:p-8 mb-8">
            <span className="absolute top-3 left-3 w-2 h-2 border-t border-l border-accent/30" />
            <span className="absolute top-3 right-3 w-2 h-2 border-t border-r border-accent/30" />
            <span className="absolute bottom-3 left-3 w-2 h-2 border-b border-l border-accent/30" />
            <span className="absolute bottom-3 right-3 w-2 h-2 border-b border-r border-accent/30" />
            
            <h3 className="text-h3 font-serif text-text mb-6 text-center">
              {t('success.claim.title')}
            </h3>

            <div className="space-y-4">
              <div className="flex justify-between items-center py-3 border-b border-secondary/50">
                <span className="text-small text-muted">{t('success.claim.amount')}</span>
                <span className="text-h3 font-serif text-accent">{claimAmount} AVAX</span>
              </div>
              {claimTxHash && (
                <div className="flex justify-between items-center py-3">
                  <span className="text-small text-muted">{t('success.claim.txHash')}</span>
                  <a
                    href={`https://testnet.snowtrace.io/tx/${claimTxHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-small text-accent hover:text-accent-dark transition-colors"
                  >
                    {t('success.claim.viewTx')} →
                  </a>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 信息卡片 */}
        <div className="relative bg-white border border-secondary p-6 sm:p-8 mb-8">
          <span className="absolute top-3 left-3 w-2 h-2 border-t border-l border-accent/30" />
          <span className="absolute top-3 right-3 w-2 h-2 border-t border-r border-accent/30" />
          <span className="absolute bottom-3 left-3 w-2 h-2 border-b border-l border-accent/30" />
          <span className="absolute bottom-3 right-3 w-2 h-2 border-b border-r border-accent/30" />
          
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 border border-accent/30 flex items-center justify-center flex-shrink-0">
                <span className="text-lg text-accent">◈</span>
              </div>
              <div>
                <h3 className="font-medium text-text mb-1">
                  {t('success.privacy.title')}
                </h3>
                <p className="text-small text-muted">
                  {t('success.privacy.desc')}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 border border-accent/30 flex items-center justify-center flex-shrink-0">
                <span className="text-lg text-accent">◎</span>
              </div>
              <div>
                <h3 className="font-medium text-text mb-1">
                  {t('success.timeWitness.title')}
                </h3>
                <p className="text-small text-muted">
                  {t('success.timeWitness.desc')}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 border border-accent/30 flex items-center justify-center flex-shrink-0">
                <span className="text-lg text-accent">◉</span>
              </div>
              <div>
                <h3 className="font-medium text-text mb-1">
                  {t('success.collectiveResonance.title')}
                </h3>
                <p className="text-small text-muted">
                  {t('success.collectiveResonance.desc')}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="space-y-4">
          {!hasClaimed && (
            <button
              onClick={() => router.push(`/${locale}/claim`)}
              className="group relative w-full py-4 border border-accent bg-accent text-light hover:bg-transparent hover:text-text transition-all duration-300"
            >
              <span className="relative z-10 text-sm tracking-wider">{t('success.applyClaim')}</span>
              <span className="absolute top-1 left-1 w-2 h-2 border-t border-l border-light/50 group-hover:border-accent/50 transition-colors" />
              <span className="absolute bottom-1 right-1 w-2 h-2 border-b border-r border-light/50 group-hover:border-accent/50 transition-colors" />
            </button>
          )}

          <button
            onClick={() => router.push(`/${locale}/sanctuary`)}
            className="group relative w-full py-4 border border-secondary text-text hover:border-accent transition-all duration-300"
          >
            <span className="relative z-10 text-sm tracking-wider">{t('success.viewInSanctuary')}</span>
            <span className="absolute top-1 left-1 w-2 h-2 border-t border-l border-secondary/50 group-hover:border-accent/50 transition-colors" />
            <span className="absolute bottom-1 right-1 w-2 h-2 border-b border-r border-secondary/50 group-hover:border-accent/50 transition-colors" />
          </button>

          <div className="flex gap-4">
            <button
              onClick={() => router.push(`/${locale}/spreads`)}
              className="group relative flex-1 py-3 border border-secondary text-text hover:border-accent transition-all duration-300"
            >
              <span className="relative z-10 text-sm tracking-wider">{t('success.exploreMore')}</span>
              <span className="absolute top-1 left-1 w-2 h-2 border-t border-l border-secondary/50 group-hover:border-accent/50 transition-colors" />
              <span className="absolute bottom-1 right-1 w-2 h-2 border-b border-r border-secondary/50 group-hover:border-accent/50 transition-colors" />
            </button>
            <button
              onClick={() => router.push(`/${locale}/launch`)}
              className="group relative flex-1 py-3 border border-secondary text-text hover:border-accent transition-all duration-300"
            >
              <span className="relative z-10 text-sm tracking-wider">{t('nav.launch')}</span>
              <span className="absolute top-1 left-1 w-2 h-2 border-t border-l border-secondary/50 group-hover:border-accent/50 transition-colors" />
              <span className="absolute bottom-1 right-1 w-2 h-2 border-b border-r border-secondary/50 group-hover:border-accent/50 transition-colors" />
            </button>
          </div>
        </div>

        {/* 提示 */}
        <div className="mt-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="w-6 h-px bg-accent/20" />
            <span className="w-1 h-1 bg-accent/40 rotate-45" />
            <div className="w-6 h-px bg-accent/20" />
          </div>
          <p className="text-small text-muted">{t('success.tip1')}</p>
          <p className="text-small text-muted/70 mt-1">{t('success.tip2')}</p>
        </div>
      </div>
    </main>
  );
}
