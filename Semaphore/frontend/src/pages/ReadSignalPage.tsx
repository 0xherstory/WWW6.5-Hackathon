import { CSSProperties, useEffect, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { useWalletClient } from "wagmi";

import { useCountdown } from "../hooks/useCountdown";
import { useAppState } from "../state/useAppState";
import { decryptSignalContent } from "../web3/lit";

type RitualType = "crane" | "star" | null;

export function ReadSignalPage() {
  const navigate = useNavigate();
  const { signalId } = useParams();
  const { state, submitEcho } = useAppState();
  const { data: walletClient } = useWalletClient();
  const signal = state.networkSignals.find((item) => item.id === signalId);
  const [stage, setStage] = useState<"floating" | "exploding" | "reading">("floating");
  const [echoText, setEchoText] = useState("");
  const [isWriting, setIsWriting] = useState(false);
  const [ritualType, setRitualType] = useState<RitualType>(null);
  const [contentHtml, setContentHtml] = useState<string | null>(null);
  const [decryptError, setDecryptError] = useState<string | null>(null);
  const [decryptedCid, setDecryptedCid] = useState<string | null>(null);
  const walletAddress = state.session.walletAddress?.toLowerCase() ?? null;
  const isAuthor = signal ? walletAddress === signal.authorAddress.toLowerCase() : false;
  const accessEndTime = signal && !isAuthor ? signal.accessExpiresAt : null;
  const { label, isExpired } = useCountdown(accessEndTime);

  const [particles] = useState(() =>
    Array.from({ length: 30 }, () => {
      const angle = Math.random() * Math.PI * 2;
      const distance = 100 + Math.random() * 150;

      return {
        tx: `${Math.cos(angle) * distance}px`,
        ty: `${Math.sin(angle) * distance}px`,
      };
    }),
  );

  useEffect(() => {
    if (!signal || !isExpired || isAuthor || stage !== "reading") {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      navigate(`/signals/${signal.id}`, { replace: true });
    }, 1400);

    return () => window.clearTimeout(timeoutId);
  }, [isAuthor, isExpired, navigate, signal, stage]);

  useEffect(() => {
    if (!walletClient || !signal || !signal.encryptedContentCID || stage !== "reading") {
      return;
    }

    let cancelled = false;

    void decryptSignalContent(walletClient, {
      encryptedCid: signal.encryptedContentCID,
    })
      .then((nextContentHtml) => {
        if (!cancelled) {
          setContentHtml(nextContentHtml);
          setDecryptedCid(signal.encryptedContentCID);
        }
      })
      .catch((error) => {
        if (cancelled) {
          return;
        }

        setDecryptedCid(signal.encryptedContentCID);
        setDecryptError(error instanceof Error ? error.message : "正文解密失败，请重试。");
      });

    return () => {
      cancelled = true;
    };
  }, [signal, stage, walletClient]);

  if (!signal) {
    return <Navigate to="/discover" replace />;
  }

  const currentSignal = signal;

  if (!isAuthor && (currentSignal.viewerAccessState !== "authorized" || currentSignal.blockHeight === "pending")) {
    return <Navigate to={`/signals/${currentSignal.id}`} replace />;
  }

  function startExplosion() {
    setStage("exploding");

    window.setTimeout(() => {
      setStage("reading");
    }, 600);
  }

  function handleRitual(type: RitualType | "signal") {
    if (!signalId) {
      return;
    }

    if (type === "signal") {
      navigate(`/compose?parentId=${currentSignal.id}`, {
        state: {
          draftText: echoText.trim(),
          parentTitle: currentSignal.title,
        },
      });
      return;
    }

    setRitualType(type);

    void submitEcho(signalId, type === "crane" ? "private" : "public", echoText || "收下这份回响。")
      .then(() => {
        window.setTimeout(() => {
          navigate(`/signals/${signalId}`, {
            replace: true,
            state: type === "star" ? { focusSection: "corridor" } : null,
          });
        }, 2500);
      })
      .catch((error) => {
        window.alert(error instanceof Error ? error.message : "提交失败，请重试。");
        setRitualType(null);
      });
  }

  return (
    <div className="fixed inset-0 z-[200] overflow-hidden bg-[var(--bg-deep)] text-[var(--text-primary)]">
      {stage === "floating" && (
        <div className="fixed inset-0 flex items-center justify-center">
          <button onClick={startExplosion} className="group flex cursor-pointer flex-col items-center">
            <div className="animate-orb-breathe relative flex h-24 w-24 items-center justify-center rounded-full border border-[rgba(196,168,90,0.4)] bg-black/20 backdrop-blur-sm">
              <div className="h-2 w-2 rounded-full bg-[var(--signal)] shadow-[0_0_15px_#C4A85A]" />
            </div>
            <p className="mt-8 text-[10px] uppercase tracking-[0.5em] text-[rgba(196,168,90,0.6)] transition-all group-hover:text-[var(--signal)]">
              Click to Unseal Article
            </p>
          </button>
        </div>
      )}

      {stage === "exploding" && (
        <div className="fixed inset-0 flex items-center justify-center">
          {particles.map((particle, index) => (
            <div
              key={`${particle.tx}-${particle.ty}-${index}`}
              className="particle"
              style={
                {
                  "--tx": particle.tx,
                  "--ty": particle.ty,
                } as CSSProperties
              }
            />
          ))}
        </div>
      )}

      {stage === "reading" && (
        <div className="h-full overflow-y-auto overscroll-y-contain">
          <div className="fixed top-8 left-1/2 flex -translate-x-1/2 items-center gap-3 opacity-40">
            <svg className="h-4 w-4 animate-spin-slow" viewBox="0 0 24 24" fill="none" stroke="#C4A85A">
              <path d="M12 2v20M17 5H7M17 19H7M7 5c0 4.4 3.6 8 8 8s8-3.6 8-8" strokeWidth="1.5" />
            </svg>
            <span className="text-[9px] uppercase tracking-[0.4em] text-[var(--signal)]">
              {accessEndTime && !isExpired ? `阅读时间窗 ${label}` : "The Sands of Echoes"}
            </span>
          </div>

          {!isWriting ? (
            <button
              onClick={() => navigate(-1)}
              className="fixed right-8 top-8 text-[var(--text-muted)] transition-colors hover:text-[#C4B8E8]"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          ) : null}

          <main className="mx-auto w-full max-w-2xl space-y-12 px-6 pb-20 pt-32">
            <h1 className="font-display text-center text-3xl tracking-[0.2em] text-[var(--text-primary)]">
              《{currentSignal.title}》
            </h1>
            {contentHtml && decryptedCid === currentSignal.encryptedContentCID ? (
              <div
                className="semaphore-prose"
                dangerouslySetInnerHTML={{ __html: contentHtml }}
              />
            ) : decryptError && decryptedCid === currentSignal.encryptedContentCID ? (
              <div className="rounded-3xl border border-red-800/40 bg-red-950/20 px-6 py-5 text-sm leading-7 text-red-200">
                {decryptError}
              </div>
            ) : (
              <div className="rounded-3xl border border-[rgba(196,168,90,0.16)] bg-[rgba(196,168,90,0.05)] px-6 py-5 text-sm leading-7 text-[var(--text-secondary)]">
                正在向 Lit 请求密钥并解开正文...
              </div>
            )}
          </main>

          <section className="mx-auto w-full max-w-2xl space-y-12 border-t border-white/5 px-6 pb-48 pt-20">
            <div className="space-y-4 text-center">
              <h3 className="font-display text-xl italic text-[var(--signal)]">阅后，你感到了什么回响？</h3>
              <p className="text-xs font-light text-[var(--text-muted)]">
                想到什么就写下来吧，不用完整，不用漂亮，她也想收到你的信号。
              </p>
            </div>

            <textarea
              value={echoText}
              onChange={(event) => setEchoText(event.target.value)}
              onFocus={() => setIsWriting(true)}
              onBlur={() => setIsWriting(false)}
              placeholder="写下你的回响..."
              className="h-40 w-full resize-none border-none bg-transparent text-lg leading-relaxed text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)]"
            />

            <div className="flex flex-wrap justify-center gap-4">
              <button
                onClick={() => handleRitual("crane")}
                className="rounded-full border border-[rgba(196,168,90,0.3)] px-6 py-3 text-[10px] uppercase tracking-[0.2em] text-[var(--signal)] transition-all hover:bg-[rgba(196,168,90,0.1)]"
              >
                悄悄送给作者
              </button>
              <button
                onClick={() => handleRitual("star")}
                className="rounded-full border border-[rgba(196,168,90,0.3)] px-6 py-3 text-[10px] uppercase tracking-[0.2em] text-[var(--signal)] transition-all hover:bg-[rgba(196,168,90,0.1)]"
              >
                留在文章下
              </button>
              <button
                onClick={() => handleRitual("signal")}
                className="rounded-full border border-[rgba(196,168,90,0.3)] px-6 py-3 text-[10px] uppercase tracking-[0.2em] text-[var(--signal)] transition-all hover:bg-[rgba(196,168,90,0.1)]"
              >
                发射出我的信号弹
              </button>
            </div>
          </section>
        </div>
      )}

      {stage === "reading" && isExpired && !isAuthor ? (
        <div className="fixed inset-0 z-[240] flex items-center justify-center bg-[rgba(5,5,8,0.72)] backdrop-blur-sm">
          <div className="space-y-4 px-6 text-center">
            <div className="text-[10px] uppercase tracking-[0.5em] text-[var(--text-muted)]">Window Closed</div>
            <p className="font-display text-2xl italic text-[var(--signal)]">这道光已经缓缓合上。</p>
            <p className="mx-auto max-w-md text-sm leading-7 text-[var(--text-secondary)]">
              阅读时间窗口已结束，系统会带你回到信号页。
            </p>
          </div>
        </div>
      ) : null}

      {ritualType ? (
        <div className="fixed inset-0 z-[250] flex items-center justify-center bg-[rgba(5,5,8,0.9)] backdrop-blur-sm">
          {ritualType === "crane" ? (
            <div className="animate-float-up-out flex flex-col items-center gap-6">
              <svg className="h-20 w-20 text-[rgba(196,168,90,0.8)]" viewBox="0 0 100 100" fill="none" stroke="currentColor">
                <path d="M10 50L40 20L60 40L90 10L70 80L40 50L10 50Z" strokeWidth="2" />
              </svg>
              <p className="text-[11px] uppercase tracking-[0.4em] text-[rgba(196,168,90,0.6)]">Floating to the Author</p>
            </div>
          ) : (
            <div className="animate-shimmer-fade-out flex flex-col items-center gap-6">
              <svg className="h-16 w-16 text-[var(--signal)]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l2.4 7.2h7.6l-6 4.8 2.4 7.2-6-4.8-6 4.8 2.4-7.2-6-4.8h7.6z" />
              </svg>
              <p className="text-[11px] uppercase tracking-[0.4em] text-[rgba(196,168,90,0.6)]">Staying as a Star</p>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
