"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";

interface JournalInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: string;
  disabled?: boolean;
}

export default function JournalInput({
  value,
  onChange,
  placeholder,
  minHeight = "280px",
  disabled = false,
}: JournalInputProps) {
  const t = useTranslations();
  const [wordCount, setWordCount] = useState(0);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    const words = value.trim().split(/\s+/).filter((word) => word.length > 0);
    setWordCount(value.trim() ? words.length : 0);
  }, [value]);

  return (
    <div className="relative">
      {/* 外层几何边框容器 */}
      <div 
        className={`
          relative border transition-all duration-300
          ${isFocused ? "border-accent" : "border-secondary/30"}
          ${disabled ? "opacity-50" : ""}
        `}
      >
        {/* 内层装饰边框 */}
        <div 
          className={`
            absolute inset-1 border pointer-events-none transition-all duration-300
            ${isFocused ? "border-accent/20" : "border-transparent"}
          `} 
        />

        {/* 角落装饰 */}
        <span 
          className={`
            absolute top-3 left-3 w-2 h-2 border-t border-l transition-colors duration-300
            ${isFocused ? "border-accent" : "border-accent/20"}
          `} 
        />
        <span 
          className={`
            absolute top-3 right-3 w-2 h-2 border-t border-r transition-colors duration-300
            ${isFocused ? "border-accent" : "border-accent/20"}
          `} 
        />
        <span 
          className={`
            absolute bottom-3 left-3 w-2 h-2 border-b border-l transition-colors duration-300
            ${isFocused ? "border-accent" : "border-accent/20"}
          `} 
        />
        <span 
          className={`
            absolute bottom-3 right-3 w-2 h-2 border-b border-r transition-colors duration-300
            ${isFocused ? "border-accent" : "border-accent/20"}
          `} 
        />

        {/* 日记输入框 */}
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder || t('journal.placeholder')}
          disabled={disabled}
          className="
            w-full p-8 bg-transparent
            text-body text-text placeholder:text-muted/50
            focus:outline-none resize-none
          "
          style={{ minHeight }}
          rows={10}
        />

        {/* 底部信息栏 */}
        <div className="flex items-center justify-between px-8 pb-6">
          {/* Word count */}
          <div className="flex items-center gap-4 text-tag text-muted">
            <span>
              <span className={isFocused ? "text-accent" : "text-text"}>{value.length}</span> {t('journal.chars')}
            </span>
            <span className="w-px h-3 bg-secondary/50" />
            <span>
              <span className={isFocused ? "text-accent" : "text-text"}>{wordCount}</span> {t('journal.words')}
            </span>
          </div>

          {/* Auto-save hint */}
          {value.length > 0 && !disabled && (
            <div className="flex items-center gap-2 text-tag text-accent/70">
              <span className="w-1 h-1 bg-accent rounded-full animate-pulse" />
              <span>{t('journal.autoSave')}</span>
            </div>
          )}
        </div>

        {/* 禁用状态遮罩 */}
        {disabled && (
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center">
            <div className="text-center">
              {/* 几何图标 */}
              <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center border border-accent/30">
                <span className="text-2xl text-accent/60">◈</span>
              </div>
              <p className="text-small text-muted uppercase tracking-widest">{t('journal.encrypting')}</p>
            </div>
          </div>
        )}
      </div>

      {/* Max chars hint */}
      <div className="mt-3 flex justify-end">
        <span className={`text-tag ${value.length > 280 ? "text-accent" : "text-muted/50"}`}>
          {t('journal.maxChars')}
        </span>
      </div>
    </div>
  );
}
