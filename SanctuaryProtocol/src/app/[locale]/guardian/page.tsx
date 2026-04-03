"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useTranslations, useLocale } from "next-intl";
import { useAccount } from "wagmi";
import { IMAGE_CARDS, getCardById } from "@/config/cards";
import { donate, getPoolStatus, type PoolStatus } from "@/lib/web3/sanctuaryContract";
import WalletButton from "@/components/wallet/WalletButton";

interface CollectedCard {
  cardId: string;
  timestamp: number;
  donationAmount: string;
  txHash?: string;
}

export default function GuardianPage() {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const { isConnected, address } = useAccount();
  
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [donationAmount, setDonationAmount] = useState("0.01");
  const [isProcessing, setIsProcessing] = useState(false);
  const [poolStatus, setPoolStatus] = useState<PoolStatus | null>(null);
  const [isLoadingStatus, setIsLoadingStatus] = useState(true);
  const [collectedCards, setCollectedCards] = useState<CollectedCard[]>([]);
  const [activeTab, setActiveTab] = useState<"collect" | "collection">("collect");

  // 加载资金池状态和收藏的卡牌
  useEffect(() => {
    const loadData = async () => {
      setIsLoadingStatus(true);
      const status = await getPoolStatus();
      setPoolStatus(status);
      setIsLoadingStatus(false);
    };

    loadData();
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  // 从本地存储加载收藏的卡牌
  useEffect(() => {
    if (address) {
      const stored = localStorage.getItem(`guardian-collection-${address}`);
      if (stored) {
        try {
          setCollectedCards(JSON.parse(stored));
        } catch (e) {
          console.error("Failed to parse collection:", e);
        }
      }
    }
  }, [address]);

  const handleDonate = async () => {
    if (!selectedCard || !isConnected || !address) return;
    
    setIsProcessing(true);
    
    try {
      const txHash = await donate(donationAmount);
      
      if (txHash) {
        // 保存到收藏记录
        const newCollection: CollectedCard = {
          cardId: selectedCard,
          timestamp: Date.now(),
          donationAmount,
          txHash
        };
        
        const updatedCollection = [...collectedCards, newCollection];
        setCollectedCards(updatedCollection);
        localStorage.setItem(`guardian-collection-${address}`, JSON.stringify(updatedCollection));
        
        // 保存交易记录（按钱包地址隔离）
        const card = IMAGE_CARDS.find(c => c.id === selectedCard);
        const storageKey = address ? `oh-card-transactions-${address}` : 'oh-card-transactions';
        const existingTransactions = JSON.parse(localStorage.getItem(storageKey) || '[]');
        existingTransactions.push({
          type: 'donate',
          txHash: txHash,
          timestamp: Date.now(),
          amount: donationAmount,
          description: t('guardian.transactionDescription', { cardName: locale === 'zh' ? card?.cnName : card?.name || selectedCard, amount: donationAmount })
        });
        localStorage.setItem(storageKey, JSON.stringify(existingTransactions));
        
        // 刷新资金池状态
        const newStatus = await getPoolStatus();
        setPoolStatus(newStatus);
        
        // 切换到收藏展示
        setActiveTab("collection");
        setSelectedCard(null);
      } else {
        alert(t('guardian.donateFailed'));
      }
    } catch (error) {
      console.error("Donation error:", error);
      alert(t('guardian.donateError'));
    } finally {
      setIsProcessing(false);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString(locale === 'zh' ? 'zh-CN' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <main className="min-h-screen bg-background px-4 sm:px-6 py-12 sm:py-16">
      <div className="max-w-6xl mx-auto">
        {/* 标题区域 */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="w-12 h-px bg-gradient-to-r from-transparent to-accent/30" />
            <div className="w-2 h-2 border border-accent/40 rotate-45" />
            <div className="w-12 h-px bg-gradient-to-l from-transparent to-accent/30" />
          </div>
          <h1 className="text-h1 font-serif text-text mb-4">
            {t('guardian.title')}
          </h1>
          <p className="text-body text-muted max-w-2xl mx-auto mb-2">
            {t('guardian.subtitle')}
          </p>
          <p className="text-small text-muted/70">
            {t('guardian.description')}
          </p>
        </div>

        {/* 钱包连接按钮 */}
        <div className="flex justify-center mb-8">
          <WalletButton />
        </div>

        {/* Tab 切换 */}
        {isConnected && collectedCards.length > 0 && (
          <div className="flex justify-center gap-2 mb-8">
            <button
              onClick={() => setActiveTab("collect")}
              className={`px-6 py-2 border transition-all duration-300 ${
                activeTab === "collect"
                  ? "border-accent bg-accent text-light"
                  : "border-secondary text-muted hover:border-accent/50"
              }`}
            >
              <span className="text-sm tracking-wider">{t('guardian.tab.collect')}</span>
            </button>
            <button
              onClick={() => setActiveTab("collection")}
              className={`px-6 py-2 border transition-all duration-300 ${
                activeTab === "collection"
                  ? "border-accent bg-accent text-light"
                  : "border-secondary text-muted hover:border-accent/50"
              }`}
            >
              <span className="text-sm tracking-wider">
                {t('guardian.tab.collection', { count: collectedCards.length })}
              </span>
            </button>
          </div>
        )}

        {/* 资金池状态 */}
        <div className="max-w-4xl mx-auto mb-12">
          <div className="relative bg-white border border-secondary p-6 sm:p-8">
            <span className="absolute top-3 left-3 w-2 h-2 border-t border-l border-accent/30" />
            <span className="absolute top-3 right-3 w-2 h-2 border-t border-r border-accent/30" />
            <span className="absolute bottom-3 left-3 w-2 h-2 border-b border-l border-accent/30" />
            <span className="absolute bottom-3 right-3 w-2 h-2 border-b border-r border-accent/30" />
            
            <h2 className="text-h3 font-serif text-text mb-6 text-center">
              {t('guardian.pool.title')}
            </h2>
            {isLoadingStatus ? (
              <div className="flex justify-center py-8">
                <div className="w-8 h-8 border border-accent border-t-transparent animate-spin" />
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-4 sm:gap-6 text-center">
                <div>
                  <p className="text-h2 font-serif text-accent">
                    {poolStatus?.balance || "0"} AVAX
                  </p>
                  <p className="text-small text-muted">{t('guardian.pool.balance')}</p>
                  <p className="text-tag text-muted/60 mt-1">
                    {t('guardian.pool.reserve')}: {poolStatus?.reserveAmount || "0"}
                  </p>
                </div>
                <div>
                  <p className="text-h2 font-serif text-accent">
                    {poolStatus?.donationCount || 0}
                  </p>
                  <p className="text-small text-muted">{t('guardian.pool.donations')}</p>
                </div>
                <div>
                  <p className="text-h2 font-serif text-accent">
                    {poolStatus?.claimCount || 0}
                  </p>
                  <p className="text-small text-muted">{t('guardian.pool.helped')}</p>
                </div>
              </div>
            )}

            {poolStatus && (
              <div className="mt-6 pt-4 border-t border-secondary/50 text-center">
                <p className="text-small text-muted">
                  {t('guardian.pool.currentClaim')}: <span className="text-accent font-medium">{poolStatus.currentClaimAmount} AVAX</span>
                  <span className="mx-2">·</span>
                  {t('guardian.pool.mode')}: <span className="text-accent font-medium">
                    {t(`guardian.pool.modes.${poolStatus.mode}`)}
                  </span>
                </p>
              </div>
            )}
          </div>
        </div>

        {/* 收藏卡牌界面 */}
        {activeTab === "collect" && (
          <>
            {/* 卡牌选择 */}
            <div className="mb-8">
              <h2 className="text-h3 font-serif text-text mb-4 sm:mb-6 text-center">
                {t('guardian.select.title')}
              </h2>
              <p className="text-center text-small text-muted mb-4 sm:mb-6">
                {t('guardian.select.hint')}
              </p>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 sm:gap-4 max-w-6xl mx-auto">
                {IMAGE_CARDS.slice(0, 30).map((card) => (
                  <div
                    key={card.id}
                    onClick={() => setSelectedCard(card.id)}
                    className={`relative aspect-[9/16] overflow-hidden border cursor-pointer transition-all duration-300 ${
                      selectedCard === card.id
                        ? "border-accent ring-1 ring-accent"
                        : "border-secondary hover:border-accent/50"
                    }`}
                  >
                    <Image
                      src={card.imagePath}
                      alt={locale === 'zh' ? card.cnName : card.name}
                      fill
                      className="object-cover"
                      draggable={false}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-2 text-white">
                      <p className="text-tag font-medium truncate">{locale === 'zh' ? card.cnName : card.name}</p>
                      <p className="text-tag text-white/70">{t('launch.gallery.track')} {card.trackId} · {t('launch.gallery.stage')} {card.stage}</p>
                    </div>
                    {selectedCard === card.id && (
                      <div className="absolute top-2 right-2 w-5 h-5 sm:w-6 sm:h-6 bg-accent flex items-center justify-center">
                        <svg className="w-3 h-3 sm:w-4 sm:h-4 text-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* 捐赠设置 */}
            {selectedCard && (
              <div className="max-w-md mx-auto mb-12">
                <div className="relative bg-white border border-secondary p-6 sm:p-8">
                  <span className="absolute top-3 left-3 w-2 h-2 border-t border-l border-accent/30" />
                  <span className="absolute top-3 right-3 w-2 h-2 border-t border-r border-accent/30" />
                  <span className="absolute bottom-3 left-3 w-2 h-2 border-b border-l border-accent/30" />
                  <span className="absolute bottom-3 right-3 w-2 h-2 border-b border-r border-accent/30" />
                  
                  <h3 className="text-h3 font-serif text-text mb-6 text-center">
                    {t('guardian.donation.title')}
                  </h3>

                  <div className="mb-4">
                    <label className="block text-small text-muted mb-2">
                      {t('guardian.donation.amount')}
                    </label>
                    <input
                      type="number"
                      value={donationAmount}
                      onChange={(e) => setDonationAmount(e.target.value)}
                      step="0.001"
                      min="0.001"
                      className="w-full px-4 py-3 border border-secondary focus:border-accent focus:outline-none text-body"
                    />
                    <p className="text-tag text-muted mt-2">
                      {t('guardian.donation.suggestion')}
                    </p>
                  </div>

                  <div className="flex gap-2 mb-6">
                    {["0.01", "0.05", "0.1", "0.5"].map((amount) => (
                      <button
                        key={amount}
                        onClick={() => setDonationAmount(amount)}
                        className={`flex-1 py-2 text-sm border transition-all duration-300 ${
                          donationAmount === amount
                            ? "bg-accent text-light border-accent"
                            : "border-secondary text-text hover:border-accent"
                        }`}
                      >
                        {amount}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={handleDonate}
                    disabled={isProcessing || !donationAmount || parseFloat(donationAmount) <= 0 || !isConnected}
                    className="w-full py-4 bg-accent text-light font-medium hover:bg-accent-dark transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {!isConnected
                      ? t('guardian.donation.connectWallet')
                      : isProcessing
                        ? t('guardian.donation.processing')
                        : t('guardian.donation.confirm', { amount: donationAmount })
                    }
                  </button>

                  <p className="text-tag text-muted text-center mt-4">
                    {t('guardian.donation.securityNote')}
                  </p>
                </div>
              </div>
            )}
          </>
        )}

        {/* 我的收藏界面 */}
        {activeTab === "collection" && collectedCards.length > 0 && (
          <div className="mb-12">
            <h2 className="text-h3 font-serif text-text mb-8 text-center">
              {t('guardian.collection.title')}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 max-w-6xl mx-auto">
              {collectedCards.map((item, index) => {
                const card = getCardById(item.cardId);
                if (!card) return null;
                
                return (
                  <div
                    key={index}
                    className="relative bg-white border border-secondary overflow-hidden group"
                  >
                    <div className="aspect-[9/16] relative overflow-hidden">
                      <Image
                        src={card.imagePath}
                        alt={locale === 'zh' ? card.cnName : card.name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        draggable={false}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
                      <p className="text-small font-medium">{locale === 'zh' ? card.cnName : card.name}</p>
                      <p className="text-tag text-white/70">
                        {formatDate(item.timestamp)}
                      </p>
                    </div>
                    <div className="absolute top-2 right-2 bg-accent/90 text-light text-tag px-2 py-1">
                      {item.donationAmount} AVAX
                    </div>
                    {item.txHash && (
                      <a
                        href={`https://testnet.snowtrace.io/tx/${item.txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="absolute top-2 left-2 w-6 h-6 bg-white/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <svg className="w-3 h-3 text-text" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 守护者权益 */}
        <div className="max-w-4xl mx-auto mb-12">
          <div className="relative bg-secondary/30 border border-secondary p-6 sm:p-8">
            <span className="absolute top-3 left-3 w-2 h-2 border-t border-l border-accent/30" />
            <span className="absolute top-3 right-3 w-2 h-2 border-t border-r border-accent/30" />
            <span className="absolute bottom-3 left-3 w-2 h-2 border-b border-l border-accent/30" />
            <span className="absolute bottom-3 right-3 w-2 h-2 border-b border-r border-accent/30" />

            <h3 className="text-h3 font-serif text-text mb-6 sm:mb-8 text-center">
              {t('guardian.benefits.title')}
            </h3>
            <div className="grid sm:grid-cols-3 gap-6 sm:gap-8">
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-3 border border-accent/30 flex items-center justify-center">
                  <span className="text-xl text-accent">◈</span>
                </div>
                <h4 className="font-medium text-text mb-1">{t('guardian.benefits.collectible.title')}</h4>
                <p className="text-small text-muted">{t('guardian.benefits.collectible.desc')}</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-3 border border-accent/30 flex items-center justify-center">
                  <span className="text-xl text-accent">◎</span>
                </div>
                <h4 className="font-medium text-text mb-1">{t('guardian.benefits.transparency.title')}</h4>
                <p className="text-small text-muted">{t('guardian.benefits.transparency.desc')}</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-3 border border-accent/30 flex items-center justify-center">
                  <span className="text-xl text-accent">◉</span>
                </div>
                <h4 className="font-medium text-text mb-1">{t('guardian.benefits.impact.title')}</h4>
                <p className="text-small text-muted">{t('guardian.benefits.impact.desc')}</p>
              </div>
            </div>
          </div>
        </div>

        {/* 返回按钮 */}
        <div className="text-center">
          <button
            onClick={() => router.push(`/${locale}/launch`)}
            className="group relative inline-flex items-center gap-2 px-6 py-3 border border-secondary text-text hover:border-accent transition-all duration-300"
          >
            <span className="text-sm tracking-wider">{t('guardian.backToHome')}</span>
            <span className="absolute top-1 left-1 w-2 h-2 border-t border-l border-secondary/50 group-hover:border-accent/50 transition-colors" />
            <span className="absolute bottom-1 right-1 w-2 h-2 border-b border-r border-secondary/50 group-hover:border-accent/50 transition-colors" />
          </button>
        </div>
      </div>
    </main>
  );
}
