"use client";

import { useLanguage } from "@/components/i18n/language-context";
import type { KpiViewModel } from "@/components/dashboard/types";

export function KpiCards({ metrics }: { metrics: KpiViewModel }) {
  const { language } = useLanguage();
  const isZh = language === "zh";

  return (
    <section className="panel" aria-labelledby="kpi-title">
      <div className="panel-head">
        <h2 id="kpi-title">{isZh ? "关键指标" : "KPI Cards"}</h2>
        <p className="panel-sub">{isZh ? "来自最小后端 API 的实时指标。" : "Live indicators sourced from minimal backend APIs."}</p>
      </div>
      <div className="kpi-grid">
        <article className="kpi-card" tabIndex={0}>
          <p>{isZh ? "跟踪协议数" : "Tracked Protocols"}</p>
          <h3>{metrics.protocolCount}</h3>
          <span data-trend="flat">/api/protocols</span>
        </article>
        <article className="kpi-card" tabIndex={0}>
          <p>{isZh ? "平均 ESG 分数" : "Average ESG Score"}</p>
          <h3>{metrics.avgScore}</h3>
          <span data-trend="up">{isZh ? "最新状态" : "latest state"}</span>
        </article>
        <article className="kpi-card" tabIndex={0}>
          <p>{isZh ? "严重事件数" : "Severe Events"}</p>
          <h3>{metrics.severeEvents}</h3>
          <span data-trend={metrics.severeEvents > 0 ? "down" : "flat"}>/api/events</span>
        </article>
        <article className="kpi-card" tabIndex={0}>
          <p>{isZh ? "评分历史条目" : "Score History Rows"}</p>
          <h3>{metrics.historyCount}</h3>
          <span data-trend="flat">/api/history</span>
        </article>
      </div>
    </section>
  );
}
