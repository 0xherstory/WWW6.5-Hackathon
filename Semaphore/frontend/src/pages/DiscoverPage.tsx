import { PrototypeAppShell } from "../components/layout/PrototypeAppShell";
import { SignalCard } from "../components/sections/SignalCard";
import { useAppState } from "../state/useAppState";

export function DiscoverPage() {
  const { state } = useAppState();
  const signals = [...state.networkSignals].sort((left, right) => right.createdAt - left.createdAt);

  return (
    <PrototypeAppShell activeTab="feed" fabTo="/compose">
      <div className="mx-auto w-full max-w-[620px] px-5 pb-24 pt-7">
        <div className="mb-5">
          <div className="mb-1 flex items-center gap-2">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="#C4A85A">
              <path d="M12 2L9.5 9.5L2 12L9.5 14.5L12 22L14.5 14.5L22 12L14.5 9.5L12 2Z" />
            </svg>
            <span className="text-[11px] uppercase tracking-[0.16em] text-[var(--text-muted)]">Signal Feed</span>
          </div>
          <div className="text-[11px] text-[var(--text-muted)] opacity-70">
            {signals.length} transmissions · permanently stored
          </div>
        </div>

        <div className="mb-6 h-px bg-[linear-gradient(to_right,rgba(196,168,90,0.5),rgba(155,127,212,0.2),transparent)]" />

        <div className="space-y-4">
          {signals.length ? (
            signals.map((signal) => <SignalCard key={signal.id} signal={signal} />)
          ) : (
            <div className="rounded-[18px] border border-[var(--line)] bg-[var(--surface)] px-5 py-10 text-center">
              <div className="text-sm text-[var(--text-secondary)]">还没有公开信号弹。</div>
              <div className="mt-2 text-xs leading-6 text-[var(--text-muted)]">右下角的 `+` 会沿用你现在的发布逻辑。</div>
            </div>
          )}
        </div>
      </div>
    </PrototypeAppShell>
  );
}
