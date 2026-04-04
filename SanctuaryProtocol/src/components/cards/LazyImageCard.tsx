"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import type { Card } from "@/config/cards";

interface LazyImageCardProps {
  card: Card;
  onClick?: () => void;
  onDoubleClick?: () => void;
  isSelected?: boolean;
  className?: string;
  size?: "small" | "medium" | "large";
  priority?: boolean; // 是否优先加载（首屏可见）
}

export default function LazyImageCard({
  card,
  onClick,
  onDoubleClick,
  isSelected = false,
  className = "",
  size = "medium",
  priority = false,
}: LazyImageCardProps) {
  const t = useTranslations();
  const [isVisible, setIsVisible] = useState(priority); // 优先加载的直接设为可见
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // 使用 Intersection Observer 实现懒加载
  useEffect(() => {
    if (priority) return; // 优先加载的不需要观察

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: "200px", // 提前 200px 开始加载，提前准备
        threshold: 0.1,
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [priority]);

  const sizeClasses = {
    small: "w-24",
    medium: "w-full",
    large: "w-full max-w-md",
  };

  // 处理图片加载错误，切换到后备 PNG
  const handleError = () => {
    if (!hasError) {
      setHasError(true);
    }
  };

  // 确定使用哪个图片源
  const imageSrc = hasError ? card.fallbackPath : card.imagePath;

  return (
    <div
      ref={ref}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      className={`
        group relative cursor-pointer transition-all duration-500
        ${onClick ? "hover:-translate-y-1" : ""}
        ${sizeClasses[size]}
        ${className}
      `}
    >
      {/* 外层几何边框 */}
      <div
        className={`
          relative border transition-all duration-300 bg-white
          ${isSelected
            ? "border-accent shadow-geometric"
            : "border-gray-200 group-hover:border-accent/50"
          }
        `}
      >
        {/* 内层装饰边框 */}
        <div
          className={`
            absolute inset-1 border transition-all duration-300 pointer-events-none
            ${isSelected ? "border-accent/30" : "border-transparent group-hover:border-accent/10"}
          `}
        />

        {/* 角落装饰 */}
        <span
          className={`
            absolute top-2 left-2 w-2 h-2 border-t border-l transition-colors duration-300
            ${isSelected ? "border-accent" : "border-gray-300 group-hover:border-accent/40"}
          `}
        />
        <span
          className={`
            absolute top-2 right-2 w-2 h-2 border-t border-r transition-colors duration-300
            ${isSelected ? "border-accent" : "border-gray-300 group-hover:border-accent/40"}
          `}
        />
        <span
          className={`
            absolute bottom-2 left-2 w-2 h-2 border-b border-l transition-colors duration-300
            ${isSelected ? "border-accent" : "border-gray-300 group-hover:border-accent/40"}
          `}
        />
        <span
          className={`
            absolute bottom-2 right-2 w-2 h-2 border-b border-r transition-colors duration-300
            ${isSelected ? "border-accent" : "border-gray-300 group-hover:border-accent/40"}
          `}
        />

        {/* 卡牌图片容器 - 9:16 纵向比例 */}
        <div className="aspect-[9/16] relative overflow-hidden bg-gray-50 m-3">
          {isVisible ? (
            <Image
              src={imageSrc}
              alt={card.cnName}
              fill
              loading="eager"
              className={`
                object-cover transition-all duration-700
                ${isLoaded ? "opacity-100 group-hover:scale-105" : "opacity-0"}
              `}
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
              draggable={false}
              onLoad={() => setIsLoaded(true)}
              onError={handleError}
            />
          ) : (
            // 占位符 - 懒加载前的灰色背景
            <div className="w-full h-full bg-gray-100 animate-pulse" />
          )}

          {/* 加载中的占位动画 */}
          {isVisible && !isLoaded && (
            <div className="absolute inset-0 bg-gray-100 animate-pulse" />
          )}

          {/* 悬浮遮罩 */}
          <div className="absolute inset-0 bg-accent/0 group-hover:bg-accent/5 transition-colors duration-300" />

          {/* 双击提示 */}
          {onDoubleClick && (
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
              <span className="text-xs text-white bg-black/50 px-2 py-1">
                {t('select.doubleClickToView')}
              </span>
            </div>
          )}

          {/* 选中标记 */}
          {isSelected && (
            <div className="absolute inset-0 bg-accent/10 flex items-center justify-center">
              <div className="w-12 h-12 bg-accent text-white flex items-center justify-center">
                <span className="text-xl">✓</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
