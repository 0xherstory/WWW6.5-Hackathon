"use client";

import { useState } from "react";
import Image from "next/image";
import { useTranslations, useLocale } from "next-intl";
import { getCardById, getWordCardById } from "@/config/cards";
import { getSpread } from "@/config/spreads";
import { formatDistanceToNow } from "@/utils/date";

interface MemoryCardProps {
  memory: {
    cid: string;
    spreadType: string;
    timestamp: string;
    selectedCardIds: string[];
  };
  onClick?: () => void;
}

export default function MemoryCard({ memory, onClick }: MemoryCardProps) {
  const t = useTranslations();
  const locale = useLocale();
  const spread = getSpread(memory.spreadType as "single" | "three" | "five" | "seven" | "ten");
  
  const firstImageCard = memory.selectedCardIds[0]
    ? getCardById(memory.selectedCardIds[0])
    : null;
  
  const firstWordCard = memory.selectedCardIds[1]
    ? getWordCardById(memory.selectedCardIds[1])
    : null;

  const timeAgo = formatDistanceToNow(new Date(memory.timestamp), locale);

  return (
    <div
      onClick={onClick}
      className="group relative bg-white/50 backdrop-blur-sm border border-secondary/30 p-4 cursor-pointer hover:border-accent/50 transition-all duration-300"
    >
      <span className="absolute top-2 left-2 w-2 h-2 border-t border-l border-accent/20 group-hover:border-accent/50 transition-colors" />
      <span className="absolute top-2 right-2 w-2 h-2 border-t border-r border-accent/20 group-hover:border-accent/50 transition-colors" />
      <span className="absolute bottom-2 left-2 w-2 h-2 border-b border-l border-accent/20 group-hover:border-accent/50 transition-colors" />
      <span className="absolute bottom-2 right-2 w-2 h-2 border-b border-r border-accent/20 group-hover:border-accent/50 transition-colors" />

      <div className="flex gap-4">
        {firstImageCard && (
          <div className="relative w-16 h-24 flex-shrink-0 overflow-hidden border border-gray-200">
            <Image
              src={firstImageCard.imagePath}
              alt={firstImageCard.cnName}
              fill
              className="object-cover"
              draggable={false}
            />
          </div>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-sm font-medium text-text truncate">
              {spread?.name || memory.spreadType}
            </h3>
            <span className="text-xs text-muted ml-2 flex-shrink-0">{timeAgo}</span>
          </div>

          {firstWordCard && (
            <p className="text-lg font-serif text-accent mb-2">
              {locale === 'en' ? firstWordCard.enWord : firstWordCard.word}
            </p>
          )}

          <div className="flex items-center gap-2 text-xs text-muted">
            <span>{t('sanctuary.memory.cards')}: {memory.selectedCardIds.length}</span>
            <span>·</span>
            <span className="truncate">{memory.cid.slice(0, 8)}...</span>
          </div>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
        <span className="text-xs text-muted">
          {t('sanctuary.memory.noContent')}
        </span>
        <span className="text-xs text-accent group-hover:underline">
          {t('sanctuary.memory.view')} →
        </span>
      </div>
    </div>
  );
}
