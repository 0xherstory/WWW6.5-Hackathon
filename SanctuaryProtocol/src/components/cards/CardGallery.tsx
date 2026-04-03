"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import ImageCard from "./ImageCard";
import ImageModal from "./ImageModal";
import { IMAGE_CARDS, getCardById, type Card } from "@/config/cards";

interface CardGalleryProps {
  maxSelect?: number;
  onSelectionChange?: (selectedCards: string[]) => void;
  replaceMode?: boolean;
}

export default function CardGallery({
  maxSelect = 7,
  onSelectionChange,
  replaceMode = false,
}: CardGalleryProps) {
  const t = useTranslations();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [modalCard, setModalCard] = useState<Card | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 更换模式下，清空选择
  useEffect(() => {
    if (replaceMode) {
      setSelectedIds([]);
    }
  }, [replaceMode]);

  const handleCardClick = (cardId: string) => {
    if (replaceMode) {
      // 更换模式：直接返回选中的卡牌
      onSelectionChange?.([cardId]);
      return;
    }

    let newSelected: string[];

    if (selectedIds.includes(cardId)) {
      // 取消选择
      newSelected = selectedIds.filter((id) => id !== cardId);
    } else {
      // 检查是否达到最大选择数量
      if (selectedIds.length >= maxSelect) {
        return;
      }
      newSelected = [...selectedIds, cardId];
    }

    setSelectedIds(newSelected);
    onSelectionChange?.(newSelected);
  };

  const handleCardDoubleClick = (cardId: string) => {
    const card = getCardById(cardId);
    if (card) {
      setModalCard(card);
      setIsModalOpen(true);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setModalCard(null);
  };

  const handleRandomSelect = () => {
    const shuffled = [...IMAGE_CARDS].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, maxSelect).map((card) => card.id);

    setSelectedIds(selected);
    onSelectionChange?.(selected);
  };

  const handleReset = () => {
    setSelectedIds([]);
    onSelectionChange?.([]);
  };

  return (
    <div className="space-y-8">
      {/* 操作栏 */}
      <div className="flex items-center justify-between py-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          {replaceMode ? (
            <span className="text-small text-accent">{t('select.clickToReplace')}</span>
          ) : (
            <>
              <span className="text-tag text-muted uppercase tracking-widest">{t('select.selected')}</span>
              <span className="text-h3 font-serif text-accent">{selectedIds.length}</span>
              <span className="text-tag text-muted">/ {maxSelect}</span>
            </>
          )}
        </div>

        {!replaceMode && (
          <div className="flex items-center gap-3">
            {selectedIds.length > 0 && (
              <button
                onClick={handleReset}
                className="px-4 py-2 text-tag text-muted border border-gray-300 hover:border-accent hover:text-accent transition-all duration-300"
              >
                {t('select.reset')}
              </button>
            )}
            <button
              onClick={handleRandomSelect}
              className="group px-4 py-2 text-tag text-text border border-gray-300 hover:bg-accent hover:text-white hover:border-accent transition-all duration-300 flex items-center gap-2"
            >
              <span className="text-accent group-hover:text-white transition-colors">◈</span>
              <span>{t('select.randomDraw')}</span>
            </button>
          </div>
        )}
      </div>

      {/* 已选卡片预览 - 仅显示序号，不显示名称 */}
      {!replaceMode && selectedIds.length > 0 && (
        <div className="bg-gray-50 border border-gray-200 p-6">
          <p className="text-tag text-muted uppercase tracking-widest mb-4">{t('select.currentSelection')}</p>
          <div className="flex flex-wrap gap-3">
            {selectedIds.map((id, index) => (
              <div 
                key={id} 
                onClick={() => handleCardClick(id)}
                className="group flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 cursor-pointer hover:border-accent transition-colors"
              >
                <span className="text-small text-text">{t('select.card')} {index + 1}</span>
                <span className="text-muted group-hover:text-accent transition-colors">×</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 分隔线 */}
      <div className="border-t border-gray-200" />

      {/* 卡牌网格 */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
        {IMAGE_CARDS.map((card) => (
          <ImageCard
            key={card.id}
            card={card}
            isSelected={!replaceMode && selectedIds.includes(card.id)}
            onClick={() => handleCardClick(card.id)}
            onDoubleClick={() => handleCardDoubleClick(card.id)}
          />
        ))}
      </div>

      {/* 大图查看模态框 */}
      <ImageModal card={modalCard} isOpen={isModalOpen} onClose={handleCloseModal} />
    </div>
  );
}
