import { Link } from "react-router-dom";

import { GeneratedAvatar } from "../ui/GeneratedAvatar";
import { formatDateTimeLabel, truncateAddress } from "../../lib/format";
import { useAppState } from "../../state/useAppState";
import { SignalRecord } from "../../types/domain";

interface SignalCardProps {
  signal: SignalRecord;
}

export function SignalCard({ signal }: SignalCardProps) {
  const { state, getSignalViewCount } = useAppState();
  const viewerAddress = state.session.walletAddress?.toLowerCase() ?? null;
  const isAuthor = viewerAddress === signal.authorAddress.toLowerCase();
  const viewCount = getSignalViewCount(signal.id);
  const primaryHref =
    isAuthor || signal.viewerAccessState === "authorized" ? `/signals/${signal.id}/read` : `/signals/${signal.id}`;
  const signalLabel = signal.parentId ? "Letter" : "Signal";
  const detailHref = `/signals/${signal.id}`;

  return (
    <article className="overflow-hidden rounded-[18px] border border-[var(--line)] bg-[var(--surface)] px-5 py-4 transition-transform duration-200 hover:-translate-y-0.5 hover:border-[rgba(196,168,90,0.24)]">
      <div className="mb-3 flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <GeneratedAvatar address={signal.authorAddress} size={36} className="border-[rgba(51,51,74,1)]" />
          <div>
            <div className="text-xs tracking-[0.04em] text-[var(--text-secondary)]">
              {signal.authorLabel || truncateAddress(signal.authorAddress)}
            </div>
            <div className="mt-1 text-[10px] tracking-[0.03em] text-[var(--text-muted)]">
              Block #{signal.blockHeight} · {formatDateTimeLabel(signal.createdAt)}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-1.5 text-[9px] uppercase tracking-[0.08em]">
          <span className="rounded-full border border-[rgba(196,168,90,0.4)] bg-[rgba(196,168,90,0.08)] px-2 py-1 text-[var(--signal)]">
            {signalLabel}
          </span>
          {!signal.readable ? (
            <span className="rounded-full border border-[rgba(155,127,212,0.35)] bg-[rgba(155,127,212,0.08)] px-2 py-1 text-[var(--resonance)]">
              🔐 Enc
            </span>
          ) : null}
          <span className="rounded-full border border-[rgba(155,127,212,0.28)] bg-[rgba(155,127,212,0.05)] px-2 py-1 text-[var(--resonance)]">
            ◎ IPFS
          </span>
        </div>
      </div>

      <Link
        to={detailHref}
        className="block rounded-2xl pl-12 font-display text-[15px] leading-8 text-[var(--text-primary)] transition-colors hover:text-[var(--signal)]"
      >
        {signal.hook}
      </Link>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--line)] pl-12 pt-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-full border border-[var(--line)] px-3 py-1 text-[11px] text-[var(--text-muted)]">
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              aria-hidden="true"
            >
              <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6Z" />
              <circle cx="12" cy="12" r="2.5" />
            </svg>
            <span>{viewCount}</span>
          </span>
        </div>

        {signal.txHash ? (
          <Link
            to={primaryHref}
            className="text-[10px] tracking-[0.03em] text-[var(--text-muted)] opacity-70 transition-opacity hover:opacity-100"
          >
            {signal.txHash.slice(0, 12)}... ↗
          </Link>
        ) : (
          <span className="text-[10px] tracking-[0.03em] text-[var(--text-muted)] opacity-60">暂无交易哈希</span>
        )}
      </div>
    </article>
  );
}
