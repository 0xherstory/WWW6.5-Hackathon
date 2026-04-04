"use client";

import { useLanguage } from "@/components/i18n/language-context";
import type { EventRow } from "@/components/dashboard/types";

export function ProtocolDetailSection({ events }: { events: EventRow[] }) {
  const { language } = useLanguage();
  const isZh = language === "zh";
  const latest = events.slice(0, 3);

  return (
    <section className="panel" aria-labelledby="protocol-title">
      <div className="panel-head">
        <h2 id="protocol-title">{isZh ? "协议详情" : "Protocol Detail Section"}</h2>
        <p className="panel-sub">{isZh ? "最近事件来自 /api/events。" : "Recent events loaded from /api/events."}</p>
      </div>
      <div className="detail-grid">
        {latest.length === 0 ? (
          <article className="info-card">
            <h3>{isZh ? "暂无事件" : "No Events"}</h3>
            <p>{isZh ? "当前没有事件记录。" : "No event records available."}</p>
          </article>
        ) : (
          latest.map((event) => (
            <article key={event.id} className="info-card">
              <h3>{event.protocol_name ?? (isZh ? "未知协议" : "Unknown Protocol")}</h3>
              <p>{isZh ? "事件" : "Event"}: {event.event_type}</p>
              <p>{isZh ? "严重级别" : "Severity"}: {event.severity}</p>
              <p>{event.notes ?? (isZh ? "无备注" : "No notes")}</p>
            </article>
          ))
        )}
      </div>
    </section>
  );
}
