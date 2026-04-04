"use client";

import type { WitnessPerson, WitnessRecord } from "@/lib/contract/types";
import {
  formatRelativeTime,
  getWitnessDisplayName,
} from "../lib/witness";

export function WitnessBadge({
  count,
  className,
}: {
  count: number;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border border-[rgba(166,154,165,0.16)] bg-[rgba(255,252,250,0.76)] px-3 py-1.5 text-[0.72rem] tracking-[0.08em] text-[#826d77] ${className ?? ""}`}
    >
      <EyeIcon className="h-3.5 w-3.5" />
      <span>{count}</span>
    </span>
  );
}

export function WitnessSummary({
  witnesses,
  maxVisible = 2,
  emptyText = "暂无见证",
  hint,
  interactive = false,
  onClick,
}: {
  witnesses: WitnessPerson[];
  maxVisible?: number;
  emptyText?: string;
  hint?: string;
  interactive?: boolean;
  onClick?: () => void;
}) {
  const content = (
    <div className="rounded-[22px] border border-[rgba(182,162,169,0.12)] bg-[rgba(255,255,255,0.68)] px-4 py-3">
      <div className="flex items-center gap-2 text-sm text-[#6f5f67]">
        <EyeIcon className="h-4 w-4 text-[#8f7a84]" />
        <span>{formatWitnessSummary(witnesses, maxVisible, emptyText)}</span>
      </div>
      {hint ? <p className="mt-2 text-xs leading-6 text-[#9b8a92]">{hint}</p> : null}
    </div>
  );

  if (interactive && onClick) {
    return (
      <button type="button" onClick={onClick} className="w-full text-left">
        {content}
      </button>
    );
  }

  return content;
}

export function WitnessRecordList({
  records,
  emptyTitle = "还没有见证记录",
  emptyDescription = "当你与他人开始互相见证，记录会出现在这里。",
  maxItems = 6,
}: {
  records: WitnessRecord[];
  emptyTitle?: string;
  emptyDescription?: string;
  maxItems?: number;
}) {
  const visibleRecords = [...records]
    .sort((left, right) => right.createdAt - left.createdAt)
    .slice(0, maxItems);

  if (!visibleRecords.length) {
    return (
      <div className="rounded-[24px] border border-[rgba(181,160,168,0.12)] bg-[rgba(255,255,255,0.78)] px-5 py-6">
        <p className="text-base font-semibold text-[#5f4b54]">{emptyTitle}</p>
        <p className="mt-2 text-sm leading-7 text-[#7d6a73]">{emptyDescription}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {visibleRecords.map((record) => {
        const typeLabel = record.type === "received" ? "别人见证我" : "我见证别人";
        const typeClassName =
          record.type === "received"
            ? "bg-[rgba(255,244,247,0.86)] text-[#8a6472] border-[rgba(201,165,176,0.16)]"
            : "bg-[rgba(245,250,244,0.88)] text-[#678063] border-[rgba(163,190,160,0.16)]";

        return (
          <div
            key={record.id}
            className="rounded-[24px] border border-[rgba(181,160,168,0.12)] bg-[rgba(255,255,255,0.82)] px-5 py-4"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex min-w-0 gap-3">
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[rgba(247,239,244,0.86)] text-[#8d7680]">
                  <EyeIcon className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm leading-7 text-[#5f4b54]">
                    {formatWitnessRecordText(record)}
                  </p>
                  <p className="mt-1 text-xs tracking-[0.08em] text-[#9a8790]">
                    {formatRelativeTime(record.createdAt)}
                  </p>
                </div>
              </div>
              <span
                className={`inline-flex shrink-0 rounded-full border px-3 py-1.5 text-[0.68rem] tracking-[0.12em] ${typeClassName}`}
              >
                {typeLabel}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function formatWitnessSummary(
  witnesses: WitnessPerson[],
  maxVisible: number,
  emptyText: string,
) {
  if (!witnesses.length) {
    return emptyText;
  }

  const names = witnesses
    .slice(0, Math.max(1, maxVisible))
    .map((item) => getWitnessDisplayName(item));

  if (witnesses.length > maxVisible) {
    return `${names.join("、")}等 ${witnesses.length} 人已见证`;
  }

  return `${names.join("、")}已见证`;
}

function formatWitnessRecordText(record: WitnessRecord) {
  if (record.type === "received") {
    const witness = getWitnessDisplayName({
      name: record.witnessName,
      address: record.witnessAddress,
    });

    return `${witness} 已见证你的 ${record.commitmentTitle} 约定`;
  }

  const targetUser = getWitnessDisplayName({
    name: record.targetUserName,
    address: record.targetUserAddress,
  });

  return `我已见证 ${targetUser} 的 ${record.commitmentTitle} 约定`;
}

function EyeIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M2.6 12c2.2-3.6 5.41-5.4 9.4-5.4s7.2 1.8 9.4 5.4c-2.2 3.6-5.41 5.4-9.4 5.4S4.8 15.6 2.6 12Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="2.8" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  );
}
