"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import type { Card } from "@/config/cards";

interface ImageModalProps {
  card: Card | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ImageModal({ card, isOpen, onClose }: ImageModalProps) {
  const t = useTranslations();
  const [imageSrc, setImageSrc] = useState<string>("");

  // 当卡牌变化时，重置图片源
  useEffect(() => {
    if (card) {
      setImageSrc(card.imagePath);
    }
  }, [card]);
  
  // ESC键关闭
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleEsc);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen || !card) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 animate-fade-in"
      onClick={onClose}
    >
      {/* 关闭按钮 */}
      <button
        onClick={onClose}
        className="absolute top-6 right-6 text-white/70 hover:text-white transition-colors z-10"
      >
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* 图片容器 - 适配屏幕 */}
      <div 
        className="relative max-w-[90vw] max-h-[90vh] animate-zoom-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 禁止右键菜单和拖拽 */}
        <div 
          className="relative"
          onContextMenu={(e) => e.preventDefault()}
        >
          <Image
            src={imageSrc || card.imagePath}
            alt={card.cnName}
            width={600}
            height={1067}
            className="max-w-full max-h-[90vh] w-auto h-auto object-contain select-none"
            draggable={false}
            onError={() => {
              // 加载失败时切换到后备 PNG
              if (imageSrc !== card.fallbackPath) {
                setImageSrc(card.fallbackPath);
              }
            }}
            style={{
              WebkitUserSelect: "none",
              MozUserSelect: "none",
              msUserSelect: "none",
              userSelect: "none",
            }}
          />
          
          {/* 透明遮罩层防止保存 */}
          <div 
            className="absolute inset-0"
            style={{ 
              background: "transparent",
              pointerEvents: "none",
            }}
          />
        </div>

        {/* 提示文字 */}
        <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/50 text-xs tracking-wider">
          {t('modal.closeHint')}
        </p>
      </div>
    </div>
  );
}
