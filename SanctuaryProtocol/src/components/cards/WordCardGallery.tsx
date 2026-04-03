"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import WordCard from "./WordCard";
import { WORD_CARDS } from "@/config/cards";

interface WordCardGalleryProps {
  maxSelect?: number;
  onSelectionChange?: (selectedCards: string[]) => void;
  replaceMode?: boolean;
}

export default function WordCardGallery({
  maxSelect = 7,
  onSelectionChange,
  replaceMode = false,
}: WordCardGalleryProps) {
  const t = useTranslations();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

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

  const handleRandomSelect = () => {
    const shuffled = [...WORD_CARDS].sort(() => Math.random() - 0.5);
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
            <span className="text-small text-accent">{t('select.clickToReplaceWord')}</span>
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

      {/* 已选字卡预览 - 仅显示序号 */}
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
                <span className="text-small text-text">{t('select.wordCard')} {index + 1}</span>
                <span className="text-muted group-hover:text-accent transition-colors">×</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 分隔线 */}
      <div className="border-t border-gray-200" />

      {/* 字卡网格 */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
        {WORD_CARDS.map((card) => (
          <WordCard
            key={card.id}
            card={card}
            isSelected={!replaceMode && selectedIds.includes(card.id)}
            onClick={() => handleCardClick(card.id)}
          />
        ))}
      </div>
    </div>
  );
}
