import React, { createContext, useContext, useState, useCallback } from "react";
import zh from "../locales/zh.json";
import en from "../locales/en.json";

const LOCALES = { zh, en };

const LocaleContext = createContext(null);

export function LocaleProvider({ children }) {
  const [lang, setLang] = useState("zh");

  const toggle = useCallback(() => setLang((l) => (l === "zh" ? "en" : "zh")), []);

  const t = useCallback((key) => LOCALES[lang][key] ?? key, [lang]);

  return <LocaleContext.Provider value={{ lang, toggle, t }}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useLocale must be used within LocaleProvider");
  return ctx;
}
