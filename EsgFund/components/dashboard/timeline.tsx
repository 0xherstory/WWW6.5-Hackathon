"use client";

import { useLanguage } from "@/components/i18n/language-context";
import type { HistoryRow, PipelineHashes } from "@/components/dashboard/types";
import { REACTIVE_EXPLORER_TX_BASE, SEPOLIA_EXPLORER_TX_BASE } from "@/lib/oracle-config";

function toLocalTime(isoLike: string): string {
  const date = new Date(isoLike);
  if (Number.isNaN(date.getTime())) {
    return isoLike;
  }
  return date.toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit" });
}

function shortHash(hash: string): string {
  return `${hash.slice(0, 10)}...${hash.slice(-6)}`;
}

function buildTxUrl(base: string, hash?: string): string | null {
  if (!hash || !/^0x[0-9a-fA-F]{64}$/.test(hash)) {
    return null;
  }
  return `${base}${hash}`;
}

function TxLink({
  label,
  hash,
  base
}: {
  label: string;
  hash?: string;
  base: string;
}) {
  const url = buildTxUrl(base, hash);
  if (!hash) {
    return null;
  }

  if (!url) {
    return <p className="timeline-hash">{label}: {shortHash(hash)}</p>;
  }

  return (
    <p className="timeline-hash">
      {label}:{" "}
      <a href={url} target="_blank" rel="noreferrer">
        {shortHash(hash)}
      </a>
    </p>
  );
}

export function Timeline({
  history,
  pipelineByHistoryId
}: {
  history: HistoryRow[];
  pipelineByHistoryId: Record<number, PipelineHashes | undefined>;
}) {
  const { language } = useLanguage();
  const isZh = language === "zh";
  const latest = history.slice(0, 8);

  return (
    <section className="panel" aria-labelledby="timeline-title">
      <div className="panel-head">
        <h2 id="timeline-title">{isZh ? "时间线" : "Timeline"}</h2>
        <p className="panel-sub">{isZh ? "最近评分记录来自 /api/history。" : "Latest score entries loaded from /api/history."}</p>
      </div>
      <ul className="timeline-list">
        {latest.map((item) => {
          const hashes = pipelineByHistoryId[item.id];
          return (
            <li key={item.id}>
              <span>{toLocalTime(item.calculated_at)}</span>
              <div>
                <p>
                  {item.protocol_name} {isZh ? "评分" : "scored"} {item.total} ({item.rating})
                </p>
                <TxLink label="Oracle tx" hash={hashes?.oracleTxHash} base={SEPOLIA_EXPLORER_TX_BASE} />
                <TxLink label="Reactive tx" hash={hashes?.reactiveTxHash} base={REACTIVE_EXPLORER_TX_BASE} />
                <TxLink label="Portfolio tx" hash={hashes?.portfolioTxHash} base={SEPOLIA_EXPLORER_TX_BASE} />
              </div>
              <strong data-status={item.rating === "BB" || item.rating === "B" ? "pending" : "done"}>{item.rating}</strong>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
