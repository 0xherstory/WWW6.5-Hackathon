"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

export type Language = "zh" | "en";

type LanguageContextValue = {
  language: Language;
  setLanguage: (value: Language) => void;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>("zh");

  useEffect(() => {
    const stored = typeof window !== "undefined" ? window.localStorage.getItem("ui_language") : null;
    if (stored === "zh" || stored === "en") {
      setLanguage(stored);
    }
  }, []);

  const value = useMemo(
    () => ({
      language,
      setLanguage: (next: Language) => {
        setLanguage(next);
        if (typeof window !== "undefined") {
          window.localStorage.setItem("ui_language", next);
        }
      }
    }),
    [language]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return ctx;
}
