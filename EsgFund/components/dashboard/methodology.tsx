"use client";

import { useLanguage } from "@/components/i18n/language-context";

export function Methodology() {
  const { language } = useLanguage();
  const isZh = language === "zh";

  const items = isZh
    ? [
        { title: "环境 (25)", description: "能源效率、碳强度与基础设施可持续信号。" },
        { title: "社会 (35)", description: "社区信任、贡献者稳定性与事件透明度。" },
        { title: "治理 (40)", description: "链上权限控制、资金治理纪律与投票质量。" }
      ]
    : [
        { title: "Environmental (25)", description: "Energy efficiency, carbon intensity, and sustainable infra signals." },
        { title: "Social (35)", description: "Community trust, contributor stability, and incident transparency." },
        { title: "Governance (40)", description: "On-chain controls, treasury policy discipline, and voting quality." }
      ];

  return (
    <section className="panel" aria-labelledby="methodology-title">
      <div className="panel-head">
        <h2 id="methodology-title">{isZh ? "方法论" : "Methodology"}</h2>
        <p className="panel-sub">
          {isZh ? "加权评分模型：环境 25，社会 35，治理 40。" : "Weighted scoring model: Environmental 25, Social 35, Governance 40."}
        </p>
      </div>
      <div className="method-grid">
        {items.map((item) => (
          <article key={item.title} className="info-card">
            <h3>{item.title}</h3>
            <p>{item.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
