import React, { createContext, useContext, useState, useCallback } from "react";

type Lang = "en" | "cn";

interface LanguageContextType {
  lang: Lang;
  toggle: () => void;
  t: (en: string, cn: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLang] = useState<Lang>("en");
  const toggle = useCallback(() => setLang((l) => (l === "en" ? "cn" : "en")), []);
  const t = useCallback((en: string, cn: string) => (lang === "en" ? en : cn), [lang]);

  return (
    <LanguageContext.Provider value={{ lang, toggle, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
};
