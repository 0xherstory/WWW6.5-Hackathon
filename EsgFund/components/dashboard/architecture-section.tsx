"use client";

import { useLanguage } from "@/components/i18n/language-context";

export function ArchitectureSection() {
  const { language } = useLanguage();
  const isZh = language === "zh";
  const items = isZh
    ? [
        { title: "离线评分", detail: "在后端计算 ESG 指标与总分。" },
        { title: "Oracle 层", detail: "将评分写入链上并发出事件。" },
        { title: "Reactive 策略", detail: "订阅事件并输出策略动作。" },
        { title: "Portfolio 执行", detail: "按策略更新目标仓位（accounting 模型）。" }
      ]
    : [
        { title: "Off-chain Scoring", detail: "Computes ESG metrics and total score in backend." },
        { title: "Oracle Layer", detail: "Writes score on-chain and emits events." },
        { title: "Reactive Policy", detail: "Subscribes events and evaluates policy action." },
        { title: "Portfolio Execution", detail: "Updates target allocation with accounting model." }
      ];

  return (
    <section id="architecture" className="panel" aria-labelledby="architecture-title">
      <div className="panel-head">
        <h2 id="architecture-title">{isZh ? "架构模块" : "Architecture Section"}</h2>
        <p className="panel-sub">
          {isZh ? "从离线算分到 Reactive 策略执行的端到端链路。" : "End-to-end flow from off-chain scoring to reactive portfolio execution."}
        </p>
      </div>
      <div className="method-grid">
        {items.map((item) => (
          <article key={item.title} className="info-card">
            <h3>{item.title}</h3>
            <p>{item.detail}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
