"use client";

import { useLanguage } from "@/components/i18n/language-context";
import type { DashboardRow } from "@/components/dashboard/types";

export function EsgDashboard({ rows }: { rows: DashboardRow[] }) {
  const { language } = useLanguage();
  const isZh = language === "zh";

  return (
    <section id="esg-dashboard" className="panel" aria-labelledby="esg-title">
      <div className="panel-head">
        <h2 id="esg-title">{isZh ? "ESG 看板" : "ESG Dashboard"}</h2>
        <p className="panel-sub">{isZh ? "离线评分与历史评级。" : "Off-chain score snapshot with historical rating."}</p>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>{isZh ? "协议" : "Protocol"}</th>
              <th>E</th>
              <th>S</th>
              <th>G</th>
              <th>{isZh ? "总分" : "Total"}</th>
              <th>{isZh ? "当前评级" : "Current Rating"}</th>
              <th>{isZh ? "历史评级" : "Historical Rating"}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.protocolId}>
                <td>{row.protocol}</td>
                <td>{row.environmental}</td>
                <td>{row.social}</td>
                <td>{row.governance}</td>
                <td>{row.total}</td>
                <td>{row.rating}</td>
                <td>{row.historicalRating}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
