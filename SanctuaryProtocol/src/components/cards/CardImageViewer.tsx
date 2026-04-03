import { useEffect } from "react";
import { useTranslations } from "next-intl";
import Image from "next/image";

interface CardImageViewerProps {
  src: string;
  alt: string;
  onClose: () => void;
}

export default function CardImageViewer({ src, alt, onClose }: CardImageViewerProps) {
  const t = useTranslations();
  
  // Disable right-click menu
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative max-w-2xl w-full mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 关闭按钮 */}
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors"
        >
          <svg
            className="w-8 h-8"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* 卡牌图片 - 禁止右键 */}
        <div
          className="relative aspect-[9/16] w-full rounded-2xl overflow-hidden shadow-2xl"
          onContextMenu={(e) => e.preventDefault()}
        >
          <Image
            src={src}
            alt={alt}
            fill
            className="object-contain bg-gray-900"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 60vw"
            quality={100}
            onContextMenu={(e) => e.preventDefault()}
          />
        </div>

        {/* Hint text */}
        <p className="text-center text-white/60 text-sm mt-4">
          {t('modal.closeHint')}
        </p>
      </div>
    </div>
  );
}
