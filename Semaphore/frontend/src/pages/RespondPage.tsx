import { useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";

import { useAppState } from "../state/useAppState";

export function RespondPage() {
  const navigate = useNavigate();
  const { signalId } = useParams();
  const { state, submitResponse } = useAppState();
  const signal = state.networkSignals.find((item) => item.id === signalId);
  const [content, setContent] = useState("");
  const [isSealing, setIsSealing] = useState(false);
  const [stage, setStage] = useState<"writing" | "waiting">("writing");

  if (!signal) {
    return <Navigate to="/discover" replace />;
  }

  const walletAddress = state.session.walletAddress?.toLowerCase() ?? null;
  const isAuthor = walletAddress === signal.authorAddress.toLowerCase();

  if (isAuthor || signal.viewerAccessState !== "none") {
    return <Navigate to={`/signals/${signal.id}`} replace />;
  }

  function handleSeal() {
    if (!signalId || !content.trim()) {
      return;
    }

    setIsSealing(true);

    void submitResponse(signalId, content.trim())
      .then(() => {
        setContent("");
        setIsSealing(false);
        setStage("waiting");
        window.setTimeout(() => {
          navigate(`/signals/${signalId}`, { replace: true });
        }, 1600);
      })
      .catch((error) => {
        window.alert(error instanceof Error ? error.message : "提交失败，请重试。");
        setIsSealing(false);
      });
  }

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-[var(--bg-deep)] animate-fade-up">
      <header className="space-y-4 p-12 text-center">
        <p className="text-[10px] uppercase tracking-[0.5em] text-[var(--text-muted)]">Responding to</p>
        <div className="mx-auto max-w-2xl text-sm italic text-[#C4B8E8] opacity-60">{signal.hook}</div>
        <h2 className="font-display text-2xl italic text-[var(--signal)]">“{signal.question}”</h2>
      </header>

      <main className="flex flex-1 flex-col items-center px-6">
        {stage === "writing" ? (
          <textarea
            autoFocus
            value={content}
            onChange={(event) => setContent(event.target.value)}
            placeholder="在这里写下你的回响..."
            className="w-full max-w-3xl flex-1 resize-none border-none bg-transparent py-10 text-lg leading-[2] text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)]"
          />
        ) : (
          <div className="flex w-full max-w-3xl flex-1 items-center justify-center py-10 text-center">
            <div className="space-y-5">
              <div className="text-[10px] uppercase tracking-[0.5em] text-[var(--text-muted)]">Waiting for Resonance</div>
              <p className="font-display text-2xl italic text-[var(--signal)]">文字已经安静落下。</p>
              <p className="max-w-md text-sm leading-7 text-[var(--text-secondary)]">
                它会停留在作者那里，等待被看见、被筛选、被轻轻点亮。
              </p>
            </div>
          </div>
        )}
      </main>

      <footer className="flex flex-col items-center gap-6 bg-gradient-to-t from-[var(--bg-primary)] to-transparent p-12">
        {stage === "writing" ? (
          <>
            <button
              onClick={handleSeal}
              disabled={!content.trim() || isSealing}
              className={
                isSealing
                  ? "rounded-full border border-[rgba(196,168,90,0.3)] bg-[rgba(196,168,90,0.1)] px-16 py-4 text-[11px] uppercase tracking-[0.4em] text-[var(--text-muted)]"
                  : "rounded-full border border-[rgba(196,168,90,0.3)] px-16 py-4 text-[11px] uppercase tracking-[0.4em] text-[var(--signal)] transition-all duration-700 hover:bg-[rgba(196,168,90,0.1)] hover:shadow-[0_0_30px_rgba(196,168,90,0.2)]"
              }
            >
              {isSealing ? "封缄中..." : "封缄 (Seal & Send)"}
            </button>
            <button
              onClick={() => navigate(-1)}
              className="text-[9px] uppercase tracking-[0.3em] text-[var(--text-muted)] transition-colors hover:text-[#C4B8E8]"
            >
              放弃并返回
            </button>
          </>
        ) : (
          <button
            onClick={() => navigate(`/signals/${signal.id}`, { replace: true })}
            className="text-[9px] uppercase tracking-[0.3em] text-[var(--text-muted)] transition-colors hover:text-[#C4B8E8]"
          >
            回到信号页
          </button>
        )}
      </footer>
    </div>
  );
}
