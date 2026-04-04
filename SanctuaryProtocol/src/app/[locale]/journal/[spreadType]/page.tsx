"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import Image from "next/image";
import { useWalletClient, useAccount, useChainId } from "wagmi";
import { keccak256, toBytes } from "viem";
import { getSpread, type SpreadType } from "@/config/spreads";
import { useCardStore } from "@/stores/cardStore";
import { getCardById, getWordCardById, type Card } from "@/config/cards";
import { encryptData, deriveKeyFromWallet } from "@/lib/encryption";
import { uploadToIPFS } from "@/lib/ipfs";
import { completeHealingAndRequestPayout } from "@/lib/web3/pluginContract";
import { getPluginAddress } from "@/config/contracts";
import ImageModal from "@/components/cards/ImageModal";

type EncryptionStep = "idle" | "encrypting" | "uploading" | "submitting" | "success" | "error";

export default function JournalPage() {
  const t = useTranslations();
  const locale = useLocale();
  const params = useParams();
  const router = useRouter();
  const { data: walletClient } = useWalletClient();
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const spreadType = params.spreadType as SpreadType;
  const spread = getSpread(spreadType);
  const selectedCards = useCardStore((state) => state.selectedCards);

  const [content, setContent] = useState("");
  const [wordCard, setWordCard] = useState("");
  const [isEncrypting, setIsEncrypting] = useState(false);
  const [encryptionStep, setEncryptionStep] = useState<EncryptionStep>("idle");
  const [encryptionProgress, setEncryptionProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");
  const [txHash, setTxHash] = useState<string | null>(null);
  const [modalCard, setModalCard] = useState<Card | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (!spread) {
    return (
      <main className="min-h-screen bg-background px-6 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-8 h-px bg-accent/30" />
            <div className="w-1.5 h-1.5 border border-accent/50 rotate-45" />
            <div className="w-8 h-px bg-accent/30" />
          </div>
          <h1 className="text-h2 font-serif text-text mb-4">
            {t('errors.spreadNotFound')}
          </h1>
          <button
            onClick={() => router.push(`/${locale}/spreads`)}
            className="text-accent hover:text-accent-dark transition-colors border-b border-transparent hover:border-accent/30"
          >
            {t('errors.backToSpreads')}
          </button>
        </div>
      </main>
    );
  }

  const handleSubmit = async () => {
    if (!content.trim()) {
      alert(t('journal.emptyContent'));
      return;
    }

    if (!walletClient || !isConnected) {
      alert(t('wallet.connectFirst'));
      return;
    }

    setIsEncrypting(true);
    setErrorMessage("");
    setEncryptionStep("encrypting");
    setEncryptionProgress(0);

    try {
      const signMessage = async (message: string) => {
        return await walletClient.signMessage({ message });
      };
      const userAddress = walletClient.account?.address;
      const encryptionKey = await deriveKeyFromWallet(signMessage, userAddress);

      const journalData = {
        content: content.trim(),
        wordCard: wordCard || null,
        spreadType: spreadType,
        selectedCards: selectedCards.map(card => ({
          id: card.id,
          position: card.position,
          isRevealed: card.isRevealed
        })),
        timestamp: new Date().toISOString(),
        locale: locale
      };

      const startTime = localStorage.getItem('oh-card-session-start');
      const duration = startTime 
        ? Math.floor((Date.now() - new Date(startTime).getTime()) / 1000)
        : 300;

      setEncryptionProgress(30);
      await new Promise(resolve => setTimeout(resolve, 500));

      const encryptedContent = encryptData(JSON.stringify(journalData), encryptionKey);
      setEncryptionProgress(50);

      setEncryptionStep("uploading");
      setEncryptionProgress(60);

      const ipfsData = {
        encrypted: true,
        data: encryptedContent,
        timestamp: journalData.timestamp,
        spreadType: journalData.spreadType
      };

      const cid = await uploadToIPFS(ipfsData);
      setEncryptionProgress(80);

      // 暂存当前日记数据，等待交易成功后再保存到记录列表
      // 同时保存字卡信息（不解密也能显示）
      const currentJournalData = {
        cid,
        spreadType,
        timestamp: journalData.timestamp,
        selectedCardIds: selectedCards.map(c => c.id),
        wordCard: wordCard || null  // 保存字卡文本，不解密也能显示
      };

      localStorage.setItem('oh-card-current-journal', JSON.stringify({
        cid,
        content: content.trim(),
        startTime: startTime || new Date().toISOString(),
        wordCount: content.length
      }));

      setEncryptionProgress(90);
      setEncryptionStep("submitting");
      
      const journalHash = keccak256(toBytes(cid));
      // 使用所有选中的卡牌，不再过滤 position
      const cardIds = selectedCards
        .map(c => parseInt(c.id.replace(/\D/g, '')) || 1);
      
      // 确保至少有一个卡牌ID
      if (cardIds.length === 0) {
        cardIds.push(1);
      }

      const pluginAddress = getPluginAddress(chainId) as `0x${string}`;
      
      const tx = await completeHealingAndRequestPayout(
        pluginAddress,
        cardIds,
        journalHash,
        duration,
        content.length
      );

      if (tx) {
        setTxHash(tx);
        setEncryptionProgress(100);
        setEncryptionStep("success");
        
        // 获取用户钱包地址
        const userAddress = walletClient?.account?.address;
        
        // 交易成功后才保存到记录列表（按钱包地址存储）
        if (userAddress) {
          const journalStorageKey = `oh-card-journals-${userAddress.toLowerCase()}`;
          const existingJournals = JSON.parse(localStorage.getItem(journalStorageKey) || '[]');
          existingJournals.push(currentJournalData);
          localStorage.setItem(journalStorageKey, JSON.stringify(existingJournals));
          
          // 保存交易记录
          const txStorageKey = `oh-card-transactions-${userAddress.toLowerCase()}`;
          const existingTransactions = JSON.parse(localStorage.getItem(txStorageKey) || '[]');
          existingTransactions.push({
            type: 'journal',
            txHash: tx,
            timestamp: Date.now(),
            description: t('journal.txDescription', { spreadType, wordCount: content.length })
          });
          localStorage.setItem(txStorageKey, JSON.stringify(existingTransactions));
        }
        
        await new Promise(resolve => setTimeout(resolve, 1500));
        router.push(`/${locale}/success?cid=${cid}&tx=${tx}`);
      } else {
        // 交易失败，显示错误
        setErrorMessage(t('journal.txFailed'));
        setEncryptionStep("error");
        setIsEncrypting(false);
      }

    } catch (error) {
      console.error('Encryption/upload error:', error);
      setErrorMessage(error instanceof Error ? error.message : t('errors.unknown'));
      setEncryptionStep("error");
      setIsEncrypting(false);
    }
  };

  const handleOpenModal = (card: Card) => {
    setModalCard(card);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setModalCard(null);
  };

  return (
    <main className="min-h-screen bg-background px-6 py-12">
      <div className="max-w-4xl mx-auto">
        {/* 标题 */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="w-12 h-px bg-gradient-to-r from-transparent to-accent/30" />
            <div className="w-2 h-2 border border-accent/40 rotate-45" />
            <div className="w-12 h-px bg-gradient-to-l from-transparent to-accent/30" />
          </div>
          <h1 className="text-h1 font-serif text-text mb-4">
            {t('journal.title')}
          </h1>
          <p className="text-body text-muted">
            {t(`spreads.types.${spread.type}.name`)} · {t('journal.subtitle')}
          </p>
        </div>

        {/* 已选卡牌展示 */}
        <div className="relative bg-white border border-secondary p-6 sm:p-8 mb-8">
          {/* 角落装饰 */}
          <span className="absolute top-3 left-3 w-2 h-2 border-t border-l border-accent/30" />
          <span className="absolute top-3 right-3 w-2 h-2 border-t border-r border-accent/30" />
          <span className="absolute bottom-3 left-3 w-2 h-2 border-b border-l border-accent/30" />
          <span className="absolute bottom-3 right-3 w-2 h-2 border-b border-r border-accent/30" />
          
          <h2 className="text-h3 font-serif text-text mb-6 text-center">
            {t('journal.selectedCards')}
          </h2>
          {/* 牌阵网格 - 保持原有牌阵布局 */}
          <div 
            className="grid gap-4 justify-items-center"
            style={{
              gridTemplateAreas: spread.gridTemplate,
              gridTemplateColumns: `repeat(${spread.gridCols}, 1fr)`
            }}
          >
            {spread.positions.map((position, index) => {
              const imageCard = selectedCards.find(c => c.position === index * 2 + 1);
              const wordCardSelected = selectedCards.find(c => c.position === index * 2 + 2);
              const imageCardData = imageCard ? getCardById(imageCard.id) : null;
              const wordCardData = wordCardSelected ? getWordCardById(wordCardSelected.id) : null;

              return (
                <div
                  key={index}
                  style={{ gridArea: position.gridArea }}
                  className="relative flex flex-col items-center gap-2"
                >
                  <div className="text-tag text-muted text-center">
                    {t(`select.position.${position.gridArea}`)}
                  </div>
                  {imageCardData ? (
                    <div 
                      className="aspect-[9/16] relative border border-secondary overflow-hidden cursor-pointer"
                      style={{ width: 120 }}
                      onDoubleClick={() => handleOpenModal(imageCardData)}
                      title={t('journal.doubleClickToView')}
                    >
                      <Image
                        src={imageCardData.imagePath}
                        alt={imageCardData.cnName}
                        fill
                        className="object-cover"
                        draggable={false}
                      />
                    </div>
                  ) : (
                    <div 
                      className="aspect-[9/16] border border-dashed border-secondary flex items-center justify-center"
                      style={{ width: 120 }}
                    >
                      <span className="text-tag text-muted">{t('journal.imageCard')}</span>
                    </div>
                  )}
                  {wordCardData && (
                    <div className="text-center py-1 px-2 border border-secondary bg-secondary/30 min-w-[120px]">
                      <span className="text-small text-text">
                        {locale === 'en' ? wordCardData.enWord : wordCardData.word}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* 日记输入 */}
        <div className="relative bg-white border border-secondary p-6 sm:p-8 mb-8">
          {/* 角落装饰 */}
          <span className="absolute top-3 left-3 w-2 h-2 border-t border-l border-accent/30" />
          <span className="absolute top-3 right-3 w-2 h-2 border-t border-r border-accent/30" />
          <span className="absolute bottom-3 left-3 w-2 h-2 border-b border-l border-accent/30" />
          <span className="absolute bottom-3 right-3 w-2 h-2 border-b border-r border-accent/30" />
          
          <h2 className="text-h3 font-serif text-text mb-6">
            {t('journal.yourInterpretation')}
          </h2>
          <div className="relative">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={t('journal.placeholder')}
              disabled={isEncrypting}
              className="w-full h-64 p-6 bg-transparent border border-secondary text-body text-text placeholder:text-muted/50 focus:border-accent focus:outline-none resize-none transition-colors"
            />
            {/* 内层装饰边框 */}
            <span className="absolute top-1 left-1 w-2 h-2 border-t border-l border-accent/10" />
            <span className="absolute top-1 right-1 w-2 h-2 border-t border-r border-accent/10" />
            <span className="absolute bottom-1 left-1 w-2 h-2 border-b border-l border-accent/10" />
            <span className="absolute bottom-1 right-1 w-2 h-2 border-b border-r border-accent/10" />
          </div>
          <div className="mt-3 flex justify-between items-center">
            <span className="text-tag text-muted">
              {content.length} {t('journal.characters')}
            </span>
            <span className="text-tag text-muted/50">
              {t('journal.maxChars')}
            </span>
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="flex justify-center gap-4">
          <button
            onClick={() => router.back()}
            disabled={isEncrypting}
            className="group relative px-8 py-3 border border-secondary text-text hover:border-accent transition-all duration-300 disabled:opacity-50"
          >
            <span className="relative z-10 text-sm tracking-wider">{t('nav.back')}</span>
            <span className="absolute top-1 left-1 w-2 h-2 border-t border-l border-secondary/50 group-hover:border-accent/50 transition-colors" />
            <span className="absolute bottom-1 right-1 w-2 h-2 border-b border-r border-secondary/50 group-hover:border-accent/50 transition-colors" />
          </button>
          <button
            onClick={handleSubmit}
            disabled={!content.trim() || isEncrypting || !isConnected}
            className={`
              group relative px-8 py-3 border transition-all duration-300
              ${!content.trim() || isEncrypting || !isConnected
                ? "border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed"
                : "border-accent bg-transparent text-text hover:bg-accent hover:text-light"
              }
            `}
          >
            <span className="relative z-10 text-sm tracking-wider">
              {!isConnected
                ? t('wallet.connectFirst')
                : isEncrypting
                  ? t('journal.encrypting')
                  : t('journal.sealOnChain')
              }
            </span>
            {!(!content.trim() || isEncrypting || !isConnected) && (
              <>
                <span className="absolute top-1 left-1 w-2 h-2 border-t border-l border-accent/50 group-hover:border-light/50 transition-colors" />
                <span className="absolute bottom-1 right-1 w-2 h-2 border-b border-r border-accent/50 group-hover:border-light/50 transition-colors" />
              </>
            )}
          </button>
        </div>

        {/* 提示 */}
        <div className="mt-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="w-6 h-px bg-accent/20" />
            <span className="w-1 h-1 bg-accent/40 rotate-45" />
            <div className="w-6 h-px bg-accent/20" />
          </div>
          <p className="text-small text-muted">{t('journal.tip1')}</p>
          <p className="text-small text-muted/70 mt-1">{t('journal.tip2')}</p>
        </div>

        {/* 加密进度提示 */}
        {isEncrypting && encryptionStep !== "idle" && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
            <div className="relative bg-white border border-secondary p-8 max-w-md mx-4">
              {/* 角落装饰 */}
              <span className="absolute top-3 left-3 w-2 h-2 border-t border-l border-accent/30" />
              <span className="absolute top-3 right-3 w-2 h-2 border-t border-r border-accent/30" />
              <span className="absolute bottom-3 left-3 w-2 h-2 border-b border-l border-accent/30" />
              <span className="absolute bottom-3 right-3 w-2 h-2 border-b border-r border-accent/30" />

              {encryptionStep === "encrypting" && (
                <div className="text-center">
                  <div className="mb-6">
                    <div className="w-16 h-16 mx-auto border border-accent flex items-center justify-center">
                      <span className="text-2xl text-accent">◈</span>
                    </div>
                  </div>
                  <h3 className="text-h3 font-serif text-text mb-2">
                    {t('journal.encryptingTitle')}
                  </h3>
                  <p className="text-small text-muted mb-6">
                    {t('journal.encryptingDesc')}
                  </p>
                  <div className="w-full bg-secondary h-1">
                    <div
                      className="bg-accent h-1 transition-all duration-300"
                      style={{ width: `${encryptionProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {encryptionStep === "uploading" && (
                <div className="text-center">
                  <div className="mb-6">
                    <div className="w-16 h-16 mx-auto border border-accent flex items-center justify-center">
                      <span className="text-2xl text-accent">◎</span>
                    </div>
                  </div>
                  <h3 className="text-h3 font-serif text-text mb-2">
                    {t('journal.uploadingTitle')}
                  </h3>
                  <p className="text-small text-muted mb-6">
                    {t('journal.uploadingDesc')}
                  </p>
                  <div className="w-full bg-secondary h-1">
                    <div
                      className="bg-accent h-1 transition-all duration-300"
                      style={{ width: `${encryptionProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {encryptionStep === "submitting" && (
                <div className="text-center">
                  <div className="mb-6">
                    <div className="w-16 h-16 mx-auto border border-accent flex items-center justify-center">
                      <span className="text-2xl text-accent">◉</span>
                    </div>
                  </div>
                  <h3 className="text-h3 font-serif text-text mb-2">
                    {t('journal.submittingTitle')}
                  </h3>
                  <p className="text-small text-muted mb-6">
                    {t('journal.submittingDesc')}
                  </p>
                  <div className="w-full bg-secondary h-1">
                    <div
                      className="bg-accent h-1 transition-all duration-300"
                      style={{ width: `${encryptionProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {encryptionStep === "success" && (
                <div className="text-center">
                  <div className="mb-6">
                    <div className="w-16 h-16 mx-auto border border-accent bg-accent flex items-center justify-center">
                      <span className="text-2xl text-light">◆</span>
                    </div>
                  </div>
                  <h3 className="text-h3 font-serif text-text mb-2">
                    {t('journal.successTitle')}
                  </h3>
                  {txHash && (
                    <p className="text-tag text-muted mb-2 break-all">
                      {t('journal.txLabel')}: {txHash.slice(0, 20)}...
                    </p>
                  )}
                  <p className="text-small text-muted">
                    {t('journal.successDesc')}
                  </p>
                </div>
              )}

              {encryptionStep === "error" && (
                <div className="text-center">
                  <div className="mb-6">
                    <div className="w-16 h-16 mx-auto border border-error flex items-center justify-center">
                      <span className="text-2xl text-error">×</span>
                    </div>
                  </div>
                  <h3 className="text-h3 font-serif text-text mb-2">
                    {t('journal.errorTitle')}
                  </h3>
                  <p className="text-small text-error mb-6">
                    {errorMessage || t('errors.unknown')}
                  </p>
                  <button
                    onClick={() => {
                      setIsEncrypting(false);
                      setEncryptionStep("idle");
                      setErrorMessage("");
                    }}
                    className="group relative px-6 py-2 border border-accent text-text hover:bg-accent hover:text-light transition-all duration-300"
                  >
                    <span className="relative z-10 text-sm">{t('journal.retry')}</span>
                    <span className="absolute top-1 left-1 w-1.5 h-1.5 border-t border-l border-accent/50 group-hover:border-light/50 transition-colors" />
                    <span className="absolute bottom-1 right-1 w-1.5 h-1.5 border-b border-r border-accent/50 group-hover:border-light/50 transition-colors" />
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 图片大图模态框 */}
      <ImageModal card={modalCard} isOpen={isModalOpen} onClose={handleCloseModal} />
    </main>
  );
}
