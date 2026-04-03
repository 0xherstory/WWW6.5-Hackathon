import { MouseEvent, useState } from "react";

import { truncateAddress } from "../../lib/format";
import { PublicEchoRecord, SignalRecord } from "../../types/domain";

interface SignalCorridorProps {
  focusedPublicEchoes?: PublicEchoRecord[];
  signals: SignalRecord[];
  onSelect: (signalId: string) => void;
}

export function SignalCorridor({
  focusedPublicEchoes = [],
  signals,
  onSelect,
}: SignalCorridorProps) {
  const [hasMoved, setHasMoved] = useState(false);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [proximityId, setProximityId] = useState<string | null>(null);
  const showCorridorLine = signals.length > 0;

  function handleMouseMove(event: MouseEvent<HTMLDivElement>) {
    if (!hasMoved) {
      setHasMoved(true);
    }

    let closestId: string | null = null;
    let minDistance = 300;

    signals.forEach((signal) => {
      const element = document.getElementById(`card-${signal.id}`);

      if (!element) {
        return;
      }

      const rect = element.getBoundingClientRect();
      const distance = Math.abs(event.clientY - (rect.top + rect.height / 2));

      if (distance < minDistance) {
        minDistance = distance;
        closestId = signal.id;
      }
    });

    setProximityId(closestId);
  }

  return (
    <div className="relative w-full py-20" onMouseMove={handleMouseMove}>
      {showCorridorLine ? (
        <div className="pointer-events-none absolute left-1/2 top-0 bottom-0 w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-[rgba(196,168,90,0.3)] to-transparent shadow-[0_0_15px_rgba(196,168,90,0.1)]" />
      ) : null}

      <div className="relative mx-auto max-w-xl space-y-24 px-6">
        {signals.map((signal) => {
          const isInitial = !hasMoved && signal.focusType === "focused";
          const isActive = isInitial || hoveredId === signal.id || proximityId === signal.id;
          const typeLabel =
            signal.focusType === "mother" ? "母" : signal.focusType === "focused" ? "焦点" : "衍生";

          return (
            <section
              key={signal.id}
              className="group space-y-6 transition-all duration-700"
              onMouseEnter={() => setHoveredId(signal.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              <div
                id={`card-${signal.id}`}
                className="relative mx-auto w-[90%]"
              >
                <div
                  className={
                    isActive
                      ? "absolute left-1/2 top-1/2 z-10 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[var(--signal)] bg-[var(--bg-deep)] shadow-[0_0_15px_#C4A85A]"
                      : "absolute left-1/2 top-1/2 z-10 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[rgba(196,168,90,0.2)] bg-[var(--bg-deep)]"
                  }
                >
                  <div
                    className={
                      isActive
                        ? "absolute inset-0 m-auto h-1 w-1 rounded-full bg-[var(--signal)]"
                        : "absolute inset-0 m-auto h-1 w-1 rounded-full bg-[rgba(196,168,90,0.3)]"
                    }
                  />
                </div>

                <div
                  onClick={() => onSelect(signal.id)}
                  className={
                    isActive
                      ? "w-full cursor-pointer rounded-[2.5rem] border border-[rgba(196,168,90,0.3)] bg-[rgba(196,168,90,0.05)] p-10 backdrop-blur-md transition-all duration-700"
                      : "w-full cursor-pointer rounded-[2.5rem] border border-white/10 bg-white/[0.02] p-10 opacity-40 backdrop-blur-md transition-all duration-700"
                  }
                >
                  <div className="mb-4 flex justify-between font-mono text-[10px] tracking-[0.18em] text-[var(--text-muted)]">
                    <span className={isActive ? "text-[#C4B8E8]" : ""}>
                      {signal.authorLabel} ({typeLabel})
                    </span>
                    <span>{signal.createdLabel}</span>
                  </div>
                  <p className="mb-8 text-lg font-light italic leading-relaxed">{signal.hook}</p>
                  <div className="rounded-[1.5rem] border border-white/5 bg-black/40 p-6">
                    <p
                      className={
                        isActive
                          ? "font-display text-sm italic text-[var(--signal)]"
                          : "font-display text-sm italic text-[rgba(196,168,90,0.4)]"
                      }
                    >
                      问：{signal.question}
                    </p>
                  </div>
                </div>
              </div>

              {signal.focusType === "focused" && focusedPublicEchoes.length ? (
                <div className="mx-auto w-[82%] space-y-4">
                  {focusedPublicEchoes.map((echo) => (
                    <div
                      key={echo.id}
                      className={
                        isActive
                          ? "rounded-[1.75rem] border border-[rgba(196,168,90,0.18)] bg-[rgba(196,168,90,0.05)] p-5 backdrop-blur-md transition-all duration-700"
                          : "rounded-[1.75rem] border border-white/8 bg-white/[0.02] p-5 opacity-50 backdrop-blur-md transition-all duration-700"
                      }
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="font-mono text-[11px] text-[var(--text-secondary)]">
                          {truncateAddress(echo.from)}
                        </div>
                        <div className="text-[10px] uppercase tracking-[0.18em] text-[var(--text-muted)]">
                          {new Date(echo.ts * 1000).toLocaleDateString("zh-CN").replaceAll("/", ".")}
                        </div>
                      </div>
                      <p className="mt-4 text-sm leading-7 text-[var(--text-primary)]">{echo.message}</p>
                    </div>
                  ))}
                </div>
              ) : null}
            </section>
          );
        })}
      </div>
    </div>
  );
}
