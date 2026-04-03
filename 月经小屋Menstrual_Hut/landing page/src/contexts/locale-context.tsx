"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { type Locale, messages } from "@/i18n/messages";

const STORAGE_KEY = "menstrual-hut-locale";

type Messages = (typeof messages)[Locale];

type LocaleContextValue = {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: Messages;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

function readStoredLocale(): Locale {
  if (typeof window === "undefined") return "zh";
  const v = window.localStorage.getItem(STORAGE_KEY);
  return v === "en" ? "en" : "zh";
}

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("zh");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setLocaleState(readStoredLocale());
    setReady(true);
  }, []);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    try {
      window.localStorage.setItem(STORAGE_KEY, l);
    } catch {
      /* ignore */
    }
    document.documentElement.lang = l === "zh" ? "zh-CN" : "en";
  }, []);

  useEffect(() => {
    if (!ready) return;
    document.documentElement.lang = locale === "zh" ? "zh-CN" : "en";
  }, [locale, ready]);

  const value = useMemo<LocaleContextValue>(
    () => ({
      locale,
      setLocale,
      t: messages[locale],
    }),
    [locale, setLocale]
  );

  return (
    <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
  );
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useLocale must be used within LocaleProvider");
  return ctx;
}

export function LanguageToggle({ className }: { className?: string }) {
  const { locale, setLocale, t } = useLocale();

  return (
    <div
      className={className}
      role="group"
      aria-label={locale === "zh" ? t.switchToEn : t.switchToZh}
    >
      <div className="inline-flex rounded-full border border-stone-300/80 bg-white/95 p-0.5 shadow-md backdrop-blur-sm">
        <button
          type="button"
          onClick={() => setLocale("zh")}
          className={`rounded-full px-2.5 py-1 text-xs font-bold transition sm:px-3 sm:text-sm ${
            locale === "zh"
              ? "bg-gradient-to-r from-petal to-lilac text-white shadow-sm"
              : "text-stone-800 hover:bg-stone-100"
          }`}
          aria-pressed={locale === "zh"}
        >
          {t.langZh}
        </button>
        <button
          type="button"
          onClick={() => setLocale("en")}
          className={`rounded-full px-2.5 py-1 text-xs font-bold transition sm:px-3 sm:text-sm ${
            locale === "en"
              ? "bg-gradient-to-r from-petal to-lilac text-white shadow-sm"
              : "text-stone-800 hover:bg-stone-100"
          }`}
          aria-pressed={locale === "en"}
        >
          {t.langEn}
        </button>
      </div>
    </div>
  );
}
