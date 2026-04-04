"use client";

import { useLanguage } from "@/components/i18n/language-context";

export function Hero() {
  const { language } = useLanguage();
  const isZh = language === "zh";

  return (
    <section id="overview" className="hero-panel">
      <p className="eyebrow">{isZh ? "策略驱动的可持续配置" : "Policy-driven sustainable allocation"}</p>
      <h1>{isZh ? "Reactive ESG 基金仪表盘" : "Reactive ESG Fund Dashboard"}</h1>
      <p>
        {isZh
          ? "当前为黑客松开发用静态/最小联调界面。下方数据来自本地与最小后端，不代表真实投资建议。"
          : "Static UI scaffold for hackathon development. Data shown below is local/mock plus minimal backend integration and is not investment advice."}
      </p>
      <div className="hero-tags" aria-label="Context tags">
        <span>{isZh ? "ESG驱动再平衡" : "ESG-led rebalancing"}</span>
        <span>{isZh ? "机构级看板" : "Institutional dashboard"}</span>
        <span>{isZh ? "演示数据" : "Demo data"}</span>
      </div>
    </section>
  );
}
