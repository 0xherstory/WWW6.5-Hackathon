"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { useAccount } from "wagmi";
import MemoryCard from "@/components/sanctuary/MemoryCard";
import MemoryDetailModal from "@/components/sanctuary/MemoryDetailModal";

interface Memory {
  cid: string;
  spreadType: string;
  timestamp: string;
  selectedCardIds: string[];
}

interface Transaction {
  type: 'journal' | 'claim' | 'donate';
  txHash: string;
  timestamp: number;
  amount?: string;
  description: string;
}

export default function SanctuaryPage() {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const { address } = useAccount();
  const [memories, setMemories] = useState<Memory[]>([]);
  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'memories' | 'transactions'>('memories');
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const loadData = () => {
    if (!address) {
      setMemories([]);
      setTransactions([]);
      setIsLoading(false);
      return;
    }

    // 按钱包地址加载记忆
    const storageKey = `oh-card-journals-${address.toLowerCase()}`;
    const storedMemories = localStorage.getItem(storageKey);
    if (storedMemories) {
      try {
        const parsed = JSON.parse(storedMemories) as Memory[];
        setMemories(parsed.sort((a, b) => 
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        ));
        console.log('Loaded memories for', address, ':', parsed.length);
      } catch (error) {
        console.error("Failed to parse memories:", error);
      }
    } else {
      setMemories([]);
      console.log('No memories found for address:', address);
    }

    // 按钱包地址加载交易历史
    const txStorageKey = `oh-card-transactions-${address.toLowerCase()}`;
    const storedTransactions = localStorage.getItem(txStorageKey);
    if (storedTransactions) {
      try {
        const parsed = JSON.parse(storedTransactions) as Transaction[];
        setTransactions(parsed.sort((a, b) => b.timestamp - a.timestamp));
        console.log('Loaded transactions for', address, ':', parsed.length);
      } catch (error) {
        console.error("Failed to parse transactions:", error);
      }
    } else {
      setTransactions([]);
      console.log('No transactions found for address:', address);
    }

    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [address]);

  const handleMemoryClick = (memory: Memory) => {
    setSelectedMemory(memory);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedMemory(null);
  };

  const formatDate = (timestamp: number | string) => {
    return new Date(timestamp).toLocaleDateString(locale === 'zh' ? 'zh-CN' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTransactionIcon = (type: Transaction['type']) => {
    switch (type) {
      case 'journal': return '◈';
      case 'claim': return '◎';
      case 'donate': return '◉';
      default: return '◆';
    }
  };

  const getTransactionLabel = (type: Transaction['type']) => {
    switch (type) {
      case 'journal': return t('sanctuary.transactions.types.journal');
      case 'claim': return t('sanctuary.transactions.types.claim');
      case 'donate': return t('sanctuary.transactions.types.donate');
      default: return t('sanctuary.transactions.types.default');
    }
  };

  const latestMemory = memories[0];
  const totalMemories = memories.length;

  return (
    <main className="min-h-screen px-6 py-16">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-8 h-px bg-accent/30" />
            <div className="w-1.5 h-1.5 border border-accent/50 rotate-45" />
            <div className="w-8 h-px bg-accent/30" />
          </div>

          <h1 className="text-h1 font-serif text-text mb-4">
            {t('sanctuary.title')}
          </h1>
          <p className="text-body text-muted max-w-md mx-auto">
            {t('sanctuary.subtitle')}
          </p>
        </div>

        {/* Tab 切换和刷新按钮 */}
        <div className="flex justify-center items-center gap-4 mb-8">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('memories')}
              className={`px-6 py-2 border transition-all duration-300 ${
                activeTab === 'memories'
                  ? "border-accent bg-accent text-light"
                  : "border-secondary text-muted hover:border-accent/50"
              }`}
            >
              <span className="text-sm tracking-wider">{t('sanctuary.tabs.memories', { count: totalMemories })}</span>
            </button>
            <button
              onClick={() => setActiveTab('transactions')}
              className={`px-6 py-2 border transition-all duration-300 ${
                activeTab === 'transactions'
                  ? "border-accent bg-accent text-light"
                  : "border-secondary text-muted hover:border-accent/50"
              }`}
            >
              <span className="text-sm tracking-wider">{t('sanctuary.tabs.transactions', { count: transactions.length })}</span>
            </button>
          </div>
          <button
            onClick={loadData}
            className="p-2 border border-secondary text-muted hover:border-accent hover:text-accent transition-all duration-300"
            title={t('sanctuary.refreshData')}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>

        {!address ? (
          <div className="relative max-w-lg mx-auto">
            <div className="absolute inset-0 border border-accent/10" />
            <div className="absolute inset-4 border border-accent/5" />

            <div className="relative bg-white/30 backdrop-blur-sm p-16 text-center">
              <div className="w-20 h-20 mx-auto mb-8 flex items-center justify-center border border-accent/20">
                <span className="text-4xl text-accent/40">◈</span>
              </div>

              <h2 className="text-h3 font-serif text-text mb-4">
                {t('sanctuary.connectWallet.title')}
              </h2>
              <p className="text-small text-muted mb-10 max-w-xs mx-auto leading-relaxed">
                {t('sanctuary.connectWallet.desc')}
              </p>
            </div>
          </div>
        ) : isLoading ? (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-accent/20 border-t-accent" />
          </div>
        ) : activeTab === 'memories' ? (
          memories.length === 0 ? (
            <div className="relative max-w-lg mx-auto">
              <div className="absolute inset-0 border border-accent/10" />
              <div className="absolute inset-4 border border-accent/5" />

              <div className="relative bg-white/30 backdrop-blur-sm p-16 text-center">
                <div className="w-20 h-20 mx-auto mb-8 flex items-center justify-center border border-accent/20">
                  <span className="text-4xl text-accent/40">◈</span>
                </div>

                <h2 className="text-h3 font-serif text-text mb-4">
                  {t('sanctuary.empty.title')}
                </h2>
                <p className="text-small text-muted mb-10 max-w-xs mx-auto leading-relaxed">
                  {t('sanctuary.empty.desc')}
                </p>

                <button
                  onClick={() => router.push(`/${locale}/spreads`)}
                  className="group relative px-10 py-4 border border-accent bg-transparent text-text hover:bg-accent hover:text-light transition-all duration-300"
                >
                  <span className="relative z-10 text-sm tracking-widest uppercase">
                    {t('home.cta.start')}
                  </span>
                  <span className="absolute top-1 left-1 w-2 h-2 border-t border-l border-accent/50 group-hover:border-light/50 transition-colors" />
                  <span className="absolute bottom-1 right-1 w-2 h-2 border-b border-r border-accent/50 group-hover:border-light/50 transition-colors" />
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4 mb-8 max-w-md mx-auto">
                <div className="bg-white/50 backdrop-blur-sm border border-secondary/30 p-4 text-center">
                  <p className="text-2xl font-serif text-accent mb-1">{totalMemories}</p>
                  <p className="text-xs text-muted">{t('sanctuary.stats.totalMemories')}</p>
                </div>
                <div className="bg-white/50 backdrop-blur-sm border border-secondary/30 p-4 text-center">
                  <p className="text-sm font-medium text-text mb-1 truncate">
                    {latestMemory ? new Date(latestMemory.timestamp).toLocaleDateString(locale === 'zh' ? 'zh-CN' : 'en-US') : '-'}
                  </p>
                  <p className="text-xs text-muted">{t('sanctuary.stats.latestMemory')}</p>
                </div>
              </div>

              <div className="flex justify-center mb-8">
                <button
                  onClick={() => router.push(`/${locale}/spreads`)}
                  className="group relative px-8 py-3 border border-accent bg-transparent text-text hover:bg-accent hover:text-light transition-all duration-300"
                >
                  <span className="relative z-10 text-sm tracking-widest uppercase">
                    {t('sanctuary.actions.newMemory')}
                  </span>
                  <span className="absolute top-1 left-1 w-2 h-2 border-t border-l border-accent/50 group-hover:border-light/50 transition-colors" />
                  <span className="absolute bottom-1 right-1 w-2 h-2 border-b border-r border-accent/50 group-hover:border-light/50 transition-colors" />
                </button>
              </div>

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {memories.map((memory, index) => (
                  <MemoryCard
                    key={memory.cid || index}
                    memory={memory}
                    onClick={() => handleMemoryClick(memory)}
                  />
                ))}
              </div>
            </>
          )
        ) : (
          // 交易历史页面
          <div className="max-w-3xl mx-auto">
            {transactions.length === 0 ? (
              <div className="relative bg-white/30 backdrop-blur-sm p-16 text-center border border-secondary">
                <div className="w-20 h-20 mx-auto mb-8 flex items-center justify-center border border-accent/20">
                  <span className="text-4xl text-accent/40">◎</span>
                </div>
                <h2 className="text-h3 font-serif text-text mb-4">
                  {t('sanctuary.transactions.empty.title')}
                </h2>
                <p className="text-small text-muted mb-6">
                  {t('sanctuary.transactions.empty.desc')}
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-3 gap-4 mb-8 max-w-lg mx-auto">
                  <div className="bg-white/50 backdrop-blur-sm border border-secondary/30 p-4 text-center">
                    <p className="text-2xl font-serif text-accent mb-1">
                      {transactions.filter(t => t.type === 'journal').length}
                    </p>
                    <p className="text-xs text-muted">{t('sanctuary.transactions.types.journal')}</p>
                  </div>
                  <div className="bg-white/50 backdrop-blur-sm border border-secondary/30 p-4 text-center">
                    <p className="text-2xl font-serif text-accent mb-1">
                      {transactions.filter(t => t.type === 'claim').length}
                    </p>
                    <p className="text-xs text-muted">{t('sanctuary.transactions.types.claim')}</p>
                  </div>
                  <div className="bg-white/50 backdrop-blur-sm border border-secondary/30 p-4 text-center">
                    <p className="text-2xl font-serif text-accent mb-1">
                      {transactions.filter(t => t.type === 'donate').length}
                    </p>
                    <p className="text-xs text-muted">{t('sanctuary.transactions.types.donate')}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {transactions.map((tx, index) => (
                    <div
                      key={index}
                      className="relative bg-white border border-secondary p-4 hover:border-accent/50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 border border-accent/30 flex items-center justify-center flex-shrink-0">
                          <span className="text-lg text-accent">{getTransactionIcon(tx.type)}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-small font-medium text-text">
                              {getTransactionLabel(tx.type)}
                            </span>
                            <span className="text-tag text-muted">
                              {formatDate(tx.timestamp)}
                            </span>
                          </div>
                          <p className="text-small text-muted truncate">
                            {tx.description}
                          </p>
                        </div>
                        {tx.amount && (
                          <div className="text-right">
                            <span className={`text-body font-medium ${
                              tx.type === 'donate' ? 'text-error' : 'text-accent'
                            }`}>
                              {tx.type === 'donate' ? '-' : '+'}{tx.amount} AVAX
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="mt-3 pt-3 border-t border-secondary/50 flex items-center justify-between">
                        <span className="text-tag text-muted font-mono">
                          {tx.txHash.slice(0, 16)}...{tx.txHash.slice(-8)}
                        </span>
                        <a
                          href={`https://testnet.snowtrace.io/tx/${tx.txHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-small text-accent hover:text-accent-dark transition-colors"
                        >
                          {t('sanctuary.transactions.viewTx')} →
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        <div className="mt-16 text-center">
          <Link
            href={`/${locale}`}
            className="inline-flex items-center gap-2 text-sm text-muted hover:text-accent transition-colors duration-300"
          >
            <span>←</span>
            <span>{t('nav.backToHome')}</span>
          </Link>
        </div>
      </div>

      {selectedMemory && (
        <MemoryDetailModal
          memory={selectedMemory}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
        />
      )}
    </main>
  );
}
