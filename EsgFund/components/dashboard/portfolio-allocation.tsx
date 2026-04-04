"use client";

import { useLanguage } from "@/components/i18n/language-context";
import type { ProtocolRow } from "@/components/dashboard/types";

export function PortfolioAllocation({ protocols }: { protocols: ProtocolRow[] }) {
  const { language } = useLanguage();
  const isZh = language === "zh";

  return (
    <section id="portfolio-allocation" className="panel" aria-labelledby="allocation-title">
      <div className="panel-head">
        <h2 id="allocation-title">{isZh ? "ESG策略配置" : "ESG Strategy Allocation"}</h2>
        <p className="panel-sub">
          {isZh
            ? "展示数据库根据 ESG 规则计算出的目标仓位。"
            : "Shows database-computed target allocation from ESG policy rules."}
        </p>
      </div>
      <div className="allocation-list">
        {protocols.map((item) => (
          <div key={item.id} className="allocation-item">
            <div className="allocation-label-row">
              <p>{item.name}</p>
              <p>{item.target_allocation}%</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
