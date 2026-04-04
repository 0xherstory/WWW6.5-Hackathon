"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useTranslations, useLocale } from "next-intl";
import { useWalletClient } from "wagmi";
import { getCardById, getWordCardById } from "@/config/cards";
import { getSpread } from "@/config/spreads";
import { decryptData, deriveKeyFromWallet, hasCachedKey, decryptWithFallback } from "@/lib/encryption";
import { downloadFromIPFS } from "@/lib/ipfs";
import { formatDistanceToNow } from "@/utils/date";

interface MemoryDetailModalProps {
  memory: {
    cid: string;
    spreadType: string;
    timestamp: string;
    selectedCardIds: string[];
    wordCard?: string | null;  // 字卡文本（不解密也能显示）
  };
  isOpen: boolean;
  onClose: () => void;
}

interface DecryptedContent {
  content: string;
  wordCard: string | null;
  spreadType: string;
  selectedCards: Array<{
    id: string;
    position: number;
    isRevealed: boolean;
  }>;
  timestamp: string;
  locale: string;
}

export default function MemoryDetailModal({
  memory,
  isOpen,
  onClose,
}: MemoryDetailModalProps) {
  const t = useTranslations();
  const locale = useLocale();
  const { data: walletClient } = useWalletClient();
  const [decryptedContent, setDecryptedContent] = useState<DecryptedContent | null>(null);
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [decryptError, setDecryptError] = useState("");
  const [showDecryptButton, setShowDecryptButton] = useState(true);

  const spread = memory.spreadType 
    ? getSpread(memory.spreadType as "single" | "three" | "five" | "seven" | "ten")
    : null;
  const timeAgo = formatDistanceToNow(new Date(memory.timestamp), locale);

  // 如果有缓存的密钥，自动尝试解密
  useEffect(() => {
    if (isOpen && hasCachedKey() && !decryptedContent) {
      handleDecrypt();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleDecrypt = async () => {
    if (!walletClient) {
      setDecryptError(t('sanctuary.connectWalletFirst'));
      return;
    }

    setIsDecrypting(true);
    setDecryptError("");

    try {
      const ipfsData = await downloadFromIPFS(memory.cid) as { encrypted: boolean; data: string };
      
      if (ipfsData.encrypted) {
        // 使用 decryptWithFallback 尝试多种密钥格式（兼容旧数据）
        const signMessage = async (message: string) => {
          return await walletClient.signMessage({ message });
        };
        const userAddress = walletClient.account?.address;
        
        const decrypted = await decryptWithFallback(ipfsData.data, signMessage, userAddress);
        const content = JSON.parse(decrypted) as DecryptedContent;
        setDecryptedContent(content);
        setShowDecryptButton(false);
      }
    } catch (error) {
      console.error("Decryption error:", error);
      setDecryptError(t('sanctuary.memory.decryptFailed'));
    } finally {
      setIsDecrypting(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-white border-b border-gray-100 p-4 flex items-center justify-between">
          <h2 className="text-lg font-medium text-text">
            {spread?.name || memory.spreadType}
          </h2>
          <button
            onClick={onClose}
            className="text-muted hover:text-text transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6">
          <div className="flex items-center gap-4 mb-6 text-sm text-muted">
            <span>{t('sanctuary.memory.createdAt')}: {timeAgo}</span>
            <span>·</span>
            <span>CID: {memory.cid.slice(0, 12)}...</span>
          </div>

          <div className="mb-6">
            <h3 className="text-sm font-medium text-text mb-3">{t('sanctuary.memory.cards')}</h3>
            <div className={`grid gap-3 ${
              memory.spreadType === 'single' ? 'grid-cols-1 max-w-[200px] mx-auto' :
              memory.spreadType === 'three' ? 'grid-cols-3' :
              memory.spreadType === 'five' ? 'grid-cols-3 sm:grid-cols-5' :
              memory.spreadType === 'seven' ? 'grid-cols-3 sm:grid-cols-4' :
              memory.spreadType === 'ten' ? 'grid-cols-3 sm:grid-cols-4 md:grid-cols-5' :
              'grid-cols-2 sm:grid-cols-3 md:grid-cols-4'
            }`}>
              {memory.selectedCardIds.slice(0, spread?.positions.length || memory.selectedCardIds.length).map((cardId, index) => {
                const imageCard = getCardById(cardId);
                const wordCard = getWordCardById(cardId);
                const position = spread?.positions[index];
                
                if (imageCard) {
                  return (
                    <div key={index} className="relative aspect-[9/16] overflow-hidden border border-gray-200 rounded">
                      <Image
                        src={imageCard.imagePath}
                        alt={imageCard.cnName}
                        fill
                        className="object-cover"
                        draggable={false}
                      />
                      <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1 text-center">
                        {memory.wordCard || decryptedContent?.wordCard || imageCard.cnName}
                      </div>
                      {position && (
                        <div className="absolute top-0 left-0 bg-accent/80 text-white text-xs px-2 py-1">
                          {position.name}
                        </div>
                      )}
                    </div>
                  );
                }
                
                if (wordCard) {
                  return (
                    <div key={index} className="aspect-[9/16] border border-gray-200 rounded flex items-center justify-center bg-gray-50">
                      <span className="text-lg font-serif text-text">
                        {locale === 'en' ? wordCard.enWord : wordCard.word}
                      </span>
                    </div>
                  );
                }
                
                return null;
              })}
            </div>
          </div>

          <div className="border-t border-gray-100 pt-6">
            <h3 className="text-sm font-medium text-text mb-3">
              {t('sanctuary.memory.decrypt')}
            </h3>

            {decryptedContent ? (
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-text whitespace-pre-wrap leading-relaxed">
                  {decryptedContent.content}
                </p>
                {decryptedContent.wordCard && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <span className="text-sm text-muted">{t('sanctuary.wordCard')}: </span>
                    <span className="text-lg font-serif text-accent">{decryptedContent.wordCard}</span>
                  </div>
                )}
              </div>
            ) : showDecryptButton ? (
              <div className="space-y-3">
                {decryptError && (
                  <p className="text-sm text-red-500">{decryptError}</p>
                )}
                <button
                  onClick={handleDecrypt}
                  disabled={isDecrypting}
                  className="w-full px-4 py-3 border border-dashed border-gray-300 text-muted rounded-lg hover:border-accent hover:text-accent transition-colors disabled:opacity-50"
                >
                  {isDecrypting ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      {t('sanctuary.decrypting')}
                    </span>
                  ) : (
                    <span>🔐 {t('sanctuary.memory.noContent')}</span>
                  )}
                </button>
                <p className="text-xs text-muted text-center">
                  {t('sanctuary.decryptHint')}
                </p>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
