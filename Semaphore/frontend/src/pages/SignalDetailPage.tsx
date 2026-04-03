import { useEffect, useRef } from "react";
import { Navigate, useLocation, useNavigate, useParams } from "react-router-dom";

import { AppHeader } from "../components/layout/AppHeader";
import { SignalCorridor } from "../components/sections/SignalCorridor";
import { Button } from "../components/ui/Button";
import { Panel } from "../components/ui/Panel";
import { useAppState } from "../state/useAppState";
export function SignalDetailPage() {
  const corridorRef = useRef<HTMLDivElement | null>(null);
  const hasScrolledToCorridor = useRef(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { signalId } = useParams();
  const { state, markSignalViewed } = useAppState();
  const signal = state.networkSignals.find((item) => item.id === signalId);

  useEffect(() => {
    if (location.state?.focusSection !== "corridor" || hasScrolledToCorridor.current) {
      return;
    }

    hasScrolledToCorridor.current = true;

    window.requestAnimationFrame(() => {
      corridorRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }, [location.state]);

  useEffect(() => {
    if (!signalId || !signal?.id || signal.blockHeight === "pending") {
      return;
    }

    markSignalViewed(signalId);
  }, [markSignalViewed, signal?.blockHeight, signal?.id, signalId]);

  if (!signal) {
    return <Navigate to="/discover" replace />;
  }

  const currentSignal = signal;
  const corridorSignals = [{ ...currentSignal, focusType: "focused" as const }];
  const publicEchoes = state.publicEchoes
    .filter((echo) => echo.signalId === currentSignal.id)
    .sort((left, right) => right.ts - left.ts);
  const walletAddress = state.session.walletAddress?.toLowerCase() ?? null;
  const isAuthor = walletAddress === currentSignal.authorAddress.toLowerCase();
  const isPendingSignal = currentSignal.blockHeight === "pending";

  function renderPrimaryActions() {
    if (isPendingSignal) {
      return (
        <>
          <Button variant="ghost" disabled>
            正在等待链上同步
          </Button>
          <Button variant="ghost" disabled>
            同步完成后可继续操作
          </Button>
        </>
      );
    }

    if (isAuthor) {
      return (
        <>
          <Button onClick={() => navigate(`/me?tab=answers&signalId=${currentSignal.id}`)}>
            查看回答 / 选择开门
          </Button>
          <Button variant="violet" onClick={() => navigate(`/signals/${currentSignal.id}/read`)}>
            查看正文
          </Button>
        </>
      );
    }

    if (currentSignal.viewerAccessState === "none") {
      return (
        <div className="flex w-full justify-center">
          <Button onClick={() => navigate(`/signals/${currentSignal.id}/respond`)}>回答问题</Button>
        </div>
      );
    }

    if (currentSignal.viewerAccessState === "pending") {
      return (
        <>
          <Button variant="ghost" disabled>
            已回应，等待作者筛选
          </Button>
          <Button variant="ghost" disabled>
            尚未获准阅读
          </Button>
        </>
      );
    }

    if (currentSignal.viewerAccessState === "expired") {
      return (
        <>
          <Button variant="ghost" disabled>
            阅读时间窗已关闭
          </Button>
          <Button variant="ghost" disabled>
            请等待新的点亮
          </Button>
        </>
      );
    }

    return (
      <>
        <Button variant="violet" onClick={() => navigate(`/signals/${currentSignal.id}/read`)}>
          进入阅读
        </Button>
      </>
    );
  }

  return (
    <div className="min-h-screen">
      <AppHeader backTo="/discover" backLabel="返回" />

      <main className="mx-auto max-w-6xl px-6 pb-16 pt-10">
        <div className="space-y-12">
          <Panel className="mx-auto max-w-3xl p-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="text-[10px] uppercase tracking-[0.3em] text-[var(--text-muted)]">The Focus Detail</div>
                <h1 className="mt-3 font-display text-4xl text-[var(--text-primary)]">{currentSignal.title}</h1>
              </div>
              <div className="rounded-full border border-[var(--line)] bg-[rgba(24,24,42,0.9)] px-4 py-2 text-xs text-[var(--text-secondary)]">
                Block #{currentSignal.blockHeight}
              </div>
            </div>

            <div className="mt-8 rounded-[2rem] border border-[rgba(196,168,90,0.18)] bg-[rgba(196,168,90,0.05)] p-6">
              <p className="text-lg font-light italic leading-8 text-[var(--text-primary)]">{currentSignal.hook}</p>
            </div>

            <div className="mt-6 rounded-[2rem] border border-white/6 bg-[rgba(5,5,8,0.55)] p-6">
              <p className="font-display text-xl italic text-[var(--signal)]">“{currentSignal.question}”</p>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">{renderPrimaryActions()}</div>
          </Panel>

          {publicEchoes.length ? (
            <div ref={corridorRef}>
              <div className="mb-3 text-center text-[10px] uppercase tracking-[0.5em] text-[var(--text-muted)]">
                The Chain Corridor
              </div>
              <SignalCorridor
                focusedPublicEchoes={publicEchoes}
                signals={corridorSignals}
                onSelect={(nextSignalId) => navigate(`/signals/${nextSignalId}`)}
              />
            </div>
          ) : null}
        </div>
      </main>
    </div>
  );
}
