"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "next/navigation";
import { locales, type Locale } from "@/i18n";

export default function LocaleSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const switchLocale = (newLocale: Locale) => {
    if (newLocale === locale) return;

    // 获取当前路径，去掉 locale 前缀
    const segments = pathname.split('/');
    
    // 如果第二个 segment 是当前 locale，替换它
    if (segments[1] === locale) {
      segments[1] = newLocale;
    } else {
      // 否则在开头插入 locale
      segments.splice(1, 0, newLocale);
    }
    
    const newPath = segments.join('/') || `/${newLocale}`;
    window.location.href = newPath;
  };

  return (
    <div className="flex items-center gap-1 text-xs">
      {locales.map((lang, index) => (
        <span key={lang} className="flex items-center">
          <button
            onClick={() => switchLocale(lang)}
            className={`
              px-2 py-1 transition-colors duration-300 cursor-pointer
              ${locale === lang 
                ? "text-accent font-medium" 
                : "text-muted hover:text-text"
              }
            `}
            type="button"
          >
            {lang === 'zh' ? '中' : 'EN'}
          </button>
          {index < locales.length - 1 && (
            <span className="text-accent/30">|</span>
          )}
        </span>
      ))}
    </div>
  );
}
