"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { getSpread, type SpreadType, getCardSize } from "@/config/spreads";
import ImageCard from "@/components/cards/ImageCard";
import WordCard from "@/components/cards/WordCard";
import ImageModal from "@/components/cards/ImageModal";
import { useCardStore } from "@/stores/cardStore";
import { IMAGE_CARDS, WORD_CARDS, getCardById, getWordCardById, type Card } from "@/config/cards";

type CardTypeTab = "image" | "word";

export default function SelectPage() {
  const t = useTranslations();
  const params = useParams();
  const router = useRouter();
  const spreadType = params.spreadType as SpreadType;
  const spread = getSpread(spreadType);
  const [activeTab, setActiveTab] = useState<CardTypeTab>("image");
  const [selectedImageIds, setSelectedImageIds] = useState<(string | null)[]>(
    new Array(spread?.cardCount || 1).fill(null)
  );
  const [selectedWordIds, setSelectedWordIds] = useState<(string | null)[]>(
    new Array(spread?.cardCount || 1).fill(null)
  );
  const [activeImageIndex, setActiveImageIndex] = useState<number | null>(0);
  const [activeWordIndex, setActiveWordIndex] = useState<number | null>(0);
  const [modalCard, setModalCard] = useState<Card | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const setSpreadType = useCardStore((state) => state.setSpreadType);

  if (!spread) {
    return (
      <main className="min-h-screen bg-white">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-text mb-4">{t('errors.spreadNotFound')}</h1>
            <Link href="/spreads" className="text-accent hover:text-accent-dark">
              {t('errors.backToSpreads')}
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // 处理图卡点击 - 直接替换逻辑
  const handleImageCardClick = (cardId: string) => {
    // 如果这张卡已经被选中，取消选择
    const existingIndex = selectedImageIds.findIndex((id) => id === cardId);
    if (existingIndex !== -1) {
      const newSelected = [...selectedImageIds];
      newSelected[existingIndex] = null;
      setSelectedImageIds(newSelected);
      setActiveImageIndex(existingIndex);
      return;
    }

    // 如果有激活的位置，直接替换该位置
    if (activeImageIndex !== null && activeImageIndex < spread.cardCount) {
      const newSelected = [...selectedImageIds];
      newSelected[activeImageIndex] = cardId;
      setSelectedImageIds(newSelected);
      // 自动移动到下一个空位
      const nextEmptyIndex = newSelected.findIndex((id, idx) => idx > activeImageIndex && !id);
      if (nextEmptyIndex !== -1) {
        setActiveImageIndex(nextEmptyIndex);
      } else {
        const firstEmpty = newSelected.findIndex((id) => !id);
        setActiveImageIndex(firstEmpty !== -1 ? firstEmpty : null);
      }
      return;
    }

    // 否则添加到第一个空位
    const firstEmptyIndex = selectedImageIds.findIndex((id) => !id);
    if (firstEmptyIndex !== -1) {
      const newSelected = [...selectedImageIds];
      newSelected[firstEmptyIndex] = cardId;
      setSelectedImageIds(newSelected);
      setActiveImageIndex(firstEmptyIndex);
    }
  };

  // 处理字卡点击 - 直接替换逻辑
  const handleWordCardClick = (cardId: string) => {
    // 如果这张卡已经被选中，取消选择
    const existingIndex = selectedWordIds.findIndex((id) => id === cardId);
    if (existingIndex !== -1) {
      const newSelected = [...selectedWordIds];
      newSelected[existingIndex] = null;
      setSelectedWordIds(newSelected);
      setActiveWordIndex(existingIndex);
      return;
    }

    // 如果有激活的位置，直接替换该位置
    if (activeWordIndex !== null && activeWordIndex < spread.cardCount) {
      const newSelected = [...selectedWordIds];
      newSelected[activeWordIndex] = cardId;
      setSelectedWordIds(newSelected);
      // 自动移动到下一个空位
      const nextEmptyIndex = newSelected.findIndex((id, idx) => idx > activeWordIndex && !id);
      if (nextEmptyIndex !== -1) {
        setActiveWordIndex(nextEmptyIndex);
      } else {
        const firstEmpty = newSelected.findIndex((id) => !id);
        setActiveWordIndex(firstEmpty !== -1 ? firstEmpty : null);
      }
      return;
    }

    // 否则添加到第一个空位
    const firstEmptyIndex = selectedWordIds.findIndex((id) => !id);
    if (firstEmptyIndex !== -1) {
      const newSelected = [...selectedWordIds];
      newSelected[firstEmptyIndex] = cardId;
      setSelectedWordIds(newSelected);
      setActiveWordIndex(firstEmptyIndex);
    }
  };

  // 点击左侧位置激活它
  const handlePositionClick = (index: number, type: "image" | "word") => {
    if (type === "image") {
      setActiveImageIndex(index);
      setActiveTab("image");
    } else {
      setActiveWordIndex(index);
      setActiveTab("word");
    }
  };

  // 打开大图查看
  const handleOpenModal = (card: Card | undefined) => {
    if (card) {
      setModalCard(card);
      setIsModalOpen(true);
    }
  };

  // 关闭大图查看
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setModalCard(null);
  };

  // 随机选择
  const handleRandomSelect = (type: "image" | "word") => {
    if (type === "image") {
      const shuffled = [...IMAGE_CARDS].sort(() => Math.random() - 0.5);
      const selected = shuffled.slice(0, spread.cardCount).map((card) => card.id);
      setSelectedImageIds(selected);
    } else {
      const shuffled = [...WORD_CARDS].sort(() => Math.random() - 0.5);
      const selected = shuffled.slice(0, spread.cardCount).map((card) => card.id);
      setSelectedWordIds(selected);
    }
  };

  // 重置
  const handleReset = (type: "image" | "word") => {
    if (type === "image") {
      setSelectedImageIds(new Array(spread.cardCount).fill(null));
      setActiveImageIndex(0);
    } else {
      setSelectedWordIds(new Array(spread.cardCount).fill(null));
      setActiveWordIndex(0);
    }
  };

  // 处理继续写日记按钮
  const handleContinue = () => {
    const validImageIds = selectedImageIds.filter(Boolean) as string[];
    const validWordIds = selectedWordIds.filter(Boolean) as string[];
    
    if (validImageIds.length !== spread.cardCount || validWordIds.length !== spread.cardCount) {
      return;
    }

    setSpreadType(spreadType);

    for (let i = 0; i < spread.cardCount; i++) {
      useCardStore.getState().selectCard({
        id: validImageIds[i],
        position: i * 2 + 1,
        isRevealed: false,
      });

      useCardStore.getState().selectCard({
        id: validWordIds[i],
        position: i * 2 + 2,
        isRevealed: false,
      });
    }

    router.push(`/journal/${spreadType}`);
  };

  const isImageComplete = selectedImageIds.filter(Boolean).length === spread.cardCount;
  const isWordComplete = selectedWordIds.filter(Boolean).length === spread.cardCount;
  const isComplete = isImageComplete && isWordComplete;

  // 使用统一的卡牌尺寸计算规则
  const cardSize = getCardSize(spread);

  // 渲染牌阵位置的卡牌（图卡+字卡合并显示）
  const renderSpreadCard = (index: number) => {
    const imageId = selectedImageIds[index];
    const wordId = selectedWordIds[index];
    const imageCard = imageId ? getCardById(imageId) : null;
    const wordCard = wordId ? getWordCardById(wordId) : null;
    const isImageActive = activeImageIndex === index && activeTab === "image";
    const isWordActive = activeWordIndex === index && activeTab === "word";
    const position = spread.positions[index];

    return (
      <div
        key={`card-${index}`}
        style={{ gridArea: position.gridArea }}
        className="relative flex flex-col items-center gap-1"
      >
        {/* 序号标记 */}
        <div className="absolute -top-2 -left-2 w-6 h-6 bg-accent text-white text-xs flex items-center justify-center font-medium z-10">
          {index + 1}
        </div>

        {/* 图卡区域 */}
        <div
          onClick={() => handlePositionClick(index, "image")}
          onDoubleClick={() => {
            if (imageCard) handleOpenModal(imageCard);
          }}
          className={`
            relative cursor-pointer transition-all duration-300
            ${isImageActive ? "ring-2 ring-accent" : ""}
          `}
        >
          {imageCard ? (
            <div className="aspect-[9/16] relative overflow-hidden border border-gray-200 hover:border-accent transition-colors" style={{ width: cardSize.imageWidth }}>
              <Image
                src={imageCard.imagePath}
                alt={t('select.imageCards')}
                fill
                className="object-cover"
                draggable={false}
              />
              {isImageActive && (
                <div className="absolute inset-0 bg-accent/10 flex items-center justify-center">
                  <span className="text-xs text-accent bg-white px-2 py-1">{t('select.selectImage')}</span>
                </div>
              )}
            </div>
          ) : (
            <div
              className={`
                aspect-[9/16] border flex flex-col items-center justify-center transition-colors
                ${isImageActive
                  ? "border-accent bg-accent/5"
                  : "border-dashed border-gray-300 hover:border-accent"
                }
              `}
              style={{ width: cardSize.imageWidth }}
            >
              <span className={`text-h3 font-serif ${isImageActive ? "text-accent" : "text-muted"}`}>
                {index + 1}
              </span>
              <span className="text-tag text-muted mt-1 text-center px-1">{position.name}</span>
            </div>
          )}
        </div>

        {/* 字卡文字 - 直接显示在图卡下方 */}
        <div
          onClick={() => handlePositionClick(index, "word")}
          className={`
            w-full text-center cursor-pointer transition-all duration-300 py-1
            ${isWordActive ? "bg-accent/10 ring-1 ring-accent" : "hover:bg-gray-50"}
          `}
          style={{ minHeight: cardSize.wordHeight }}
        >
          {wordCard ? (
            <span className="text-lg font-serif text-text">{wordCard.word}</span>
          ) : (
            <span className={`text-sm font-serif ${isWordActive ? "text-accent" : "text-muted"}`}>
              {t('select.selectWord')}
            </span>
          )}
        </div>
      </div>
    );
  };

  return (
    <main className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-7xl mx-auto">
          {/* 标题 */}
          <div className="text-center mb-12">
            <h1 className="text-h1 font-serif text-text mb-4">{t(`spreads.types.${spread.type}.name`)}</h1>
            <p className="text-body text-muted mb-2">{t(`spreads.types.${spread.type}.description`)}</p>
            <p className="text-small text-muted">
              {t('select.instruction', { count: spread.cardCount })}
            </p>
          </div>

          {/* 选卡区域 */}
          <div className="grid gap-8 lg:grid-cols-2">
            {/* 左侧：已选卡牌 - 牌阵布局（图卡+字卡合并） */}
            <div className="border border-gray-200 p-6">
              <h2 className="text-h3 font-serif text-text mb-4 text-center">{t('select.selectedCards')}</h2>

              {/* 进度和操作按钮 */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <span className="text-small text-muted">
                    {t('select.imageCards')} {selectedImageIds.filter(Boolean).length}/{spread.cardCount}
                  </span>
                  <span className="text-small text-muted">
                    {t('select.wordCards')} {selectedWordIds.filter(Boolean).length}/{spread.cardCount}
                  </span>
                  {isComplete && <span className="text-tag text-accent">✓ {t('select.complete')}</span>}
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      handleRandomSelect("image");
                      handleRandomSelect("word");
                    }}
                    className="text-tag text-muted hover:text-accent transition-colors"
                  >
                    {t('select.randomAll')}
                  </button>
                  {(selectedImageIds.some(Boolean) || selectedWordIds.some(Boolean)) && (
                    <button
                      onClick={() => {
                        handleReset("image");
                        handleReset("word");
                      }}
                      className="text-tag text-muted hover:text-accent transition-colors"
                    >
                      {t('select.reset')}
                    </button>
                  )}
                </div>
              </div>

              {/* 牌阵网格 - 图卡+字卡合并显示 */}
              <div
                className="grid gap-2 justify-items-center"
                style={{
                  gridTemplateAreas: spread.gridTemplate,
                  gridTemplateColumns: `repeat(${spread.gridCols}, 1fr)`
                }}
              >
                {Array.from({ length: spread.cardCount }).map((_, index) =>
                  renderSpreadCard(index)
                )}
              </div>
            </div>

            {/* 右侧：卡牌选择器 */}
            <div className="border border-gray-200 p-8">
              {/* 选项卡切换 */}
              <div className="flex gap-0 mb-6 border-b border-gray-200">
                <button
                  onClick={() => setActiveTab("image")}
                  className={`
                    flex-1 py-3 text-small font-medium transition-all
                    ${activeTab === "image"
                      ? "text-text border-b-2 border-accent"
                      : "text-muted hover:text-text"
                    }
                  `}
                >
                  {t('select.imageCards')}
                </button>
                <button
                  onClick={() => setActiveTab("word")}
                  className={`
                    flex-1 py-3 text-small font-medium transition-all
                    ${activeTab === "word"
                      ? "text-text border-b-2 border-accent"
                      : "text-muted hover:text-text"
                    }
                  `}
                >
                  {t('select.wordCards')}
                </button>
              </div>

              {/* 提示文字 */}
              <div className="mb-4 text-center">
                {activeTab === "image" && activeImageIndex !== null && (
                  <p className="text-small text-accent">
                    {t('select.positionActive', { 
                      position: activeImageIndex + 1, 
                      name: spread.positions[activeImageIndex]?.name 
                    })}
                  </p>
                )}
                {activeTab === "word" && activeWordIndex !== null && (
                  <p className="text-small text-accent">
                    {t('select.positionActive', { 
                      position: activeWordIndex + 1, 
                      name: spread.positions[activeWordIndex]?.name 
                    })}
                  </p>
                )}
              </div>

              {/* 卡牌网格 */}
              {activeTab === "image" ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-h-[600px] overflow-y-auto">
                  {IMAGE_CARDS.map((card) => (
                    <ImageCard
                      key={card.id}
                      card={card}
                      isSelected={selectedImageIds.includes(card.id)}
                      onClick={() => handleImageCardClick(card.id)}
                      onDoubleClick={() => handleOpenModal(card)}
                    />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4 max-h-[600px] overflow-y-auto">
                  {WORD_CARDS.map((card) => (
                    <WordCard
                      key={card.id}
                      card={card}
                      isSelected={selectedWordIds.includes(card.id)}
                      onClick={() => handleWordCardClick(card.id)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="mt-12 flex justify-center gap-4">
            <Link
              href="/spreads"
              className="px-8 py-3 border border-gray-300 text-text hover:border-accent hover:text-accent transition-all duration-300"
            >
              {t('nav.back')}
            </Link>
            <button
              onClick={handleContinue}
              disabled={!isComplete}
              className={`
                px-8 py-3 transition-all duration-300
                ${isComplete
                  ? "bg-accent text-white hover:bg-accent-dark"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
                }
              `}
            >
              {t('select.continueToJournal')}
            </button>
          </div>
        </div>
      </div>

      {/* 大图查看模态框 */}
      <ImageModal card={modalCard} isOpen={isModalOpen} onClose={handleCloseModal} />
    </main>
  );
}
