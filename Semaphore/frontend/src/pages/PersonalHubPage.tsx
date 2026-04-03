import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import {
  HubAnswerCard,
  HubEmptyState,
  HubGiftCard,
  HubInviteCard,
  HubSignalCard,
  HubToast,
  HubToastTone,
} from "../components/sections/HubCards";
import {
  HubProfileCard,
  HubSectionHeader,
  HubTab,
  HubTabs,
} from "../components/sections/HubHeader";
import { PrototypeAppShell } from "../components/layout/PrototypeAppShell";
import { formatWalletLabel } from "../lib/format";
import { useAppState } from "../state/useAppState";
import { OwnedSignalRecord } from "../types/domain";
import { Button } from "../components/ui/Button";
import { Panel } from "../components/ui/Panel";

function asTab(value: string | null): HubTab | null {
  if (value === "signals" || value === "answers" || value === "invites" || value === "gifts") {
    return value;
  }

  return null;
}

export function PersonalHubPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const {
    state,
    authorizeAnswer,
    deleteSignal,
    setInviteReplyText,
    setInviteReplyType,
    submitInviteReply,
    toggleInviteReplying,
  } = useAppState();
  const requestedTab = asTab(searchParams.get("tab"));
  const focusedSignalId = searchParams.get("signalId");
  const activeTab = requestedTab ?? "signals";
  const [deleteTarget, setDeleteTarget] = useState<OwnedSignalRecord | null>(null);
  const [toast, setToast] = useState<{ message: string; tone: HubToastTone } | null>(null);

  const walletAddress = state.session.walletAddress ?? "";
  const profileLabel = formatWalletLabel(walletAddress, state.session.walletName ?? "已连接钱包");
  const totalResonances = state.ownSignals.reduce((sum, signal) => sum + signal.resonances, 0);
  const authorizedCount = state.answers.filter((answer) => answer.status === "authorized").length;

  function showToast(message: string, tone: HubToastTone = "amber") {
    setToast({ message, tone });
    window.setTimeout(() => setToast(null), 2400);
  }

  function selectTab(nextTab: HubTab) {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set("tab", nextTab);

    if (nextTab !== "answers") {
      nextParams.delete("signalId");
    }

    setSearchParams(nextParams, { replace: true });
  }

  function handleAuthorize(answerId: number) {
    showToast("正在链上广播授权交易…", "amber");
    void authorizeAnswer(answerId)
      .then(() => {
        showToast("授权成功！24 小时限时阅读已开启 ✓", "green");
      })
      .catch((error) => {
        showToast(error instanceof Error ? error.message : "授权失败，请重试。", "red");
      });
  }

  function handleSubmitInvite(inviteId: number) {
    const invite = state.invites.find((item) => item.id === inviteId);

    if (!invite?.replyType || !invite.replyText.trim()) {
      return;
    }

    if (invite.source === "granted-access" && invite.replyType === "signal") {
      navigate(`/compose?parentId=${invite.signalId}`, {
        state: {
          draftText: invite.replyText.trim(),
          parentTitle: invite.article,
        },
      });
      showToast("已带着这段回响前往新的信号弹草稿。", "violet");
      return;
    }

    void submitInviteReply(inviteId)
      .then(() => {
        showToast(invite.replyType === "public" ? "回响已留在文章下 ✓" : "回复已发送 ✓", "violet");
      })
      .catch((error) => {
        showToast(error instanceof Error ? error.message : "发送失败，请重试。", "red");
      });
  }

  function handleLaterAnswer() {
    showToast("这条回应已留在待处理中。", "violet");
  }

  async function handleDeleteSignal(target: OwnedSignalRecord) {
    try {
      await deleteSignal(target.id);
      setDeleteTarget(null);
      showToast("信号弹已删除，相连信号流已保留 ◈", "amber");
    } catch (error) {
      showToast(error instanceof Error ? error.message : "删除失败，请重试。", "red");
    }
  }

  const visibleAnswers = focusedSignalId
    ? state.answers.filter((answer) => answer.signalId === focusedSignalId)
    : state.answers;
  const visibleInvites = focusedSignalId
    ? state.invites.filter((invite) => invite.signalId === focusedSignalId && !invite.submitted)
    : state.invites.filter((invite) => !invite.submitted);
  const inviteCount = visibleInvites.length;

  return (
    <PrototypeAppShell activeTab="hub">
      <div className="mx-auto max-w-5xl px-6 pb-16 pt-8">
        <HubProfileCard profileLabel={profileLabel} walletAddress={walletAddress} />
        <HubTabs
          activeTab={activeTab}
          counts={{
            signals: state.ownSignals.length,
            answers: totalResonances,
            invites: authorizedCount,
            gifts: state.gifts.length,
          }}
          onSelect={selectTab}
        />

        {activeTab === "signals" ? (
          <section className="space-y-4">
            <HubSectionHeader icon="✦" label="发出的信号弹" count={state.ownSignals.length} />
            {state.ownSignals.map((signal) => (
              <HubSignalCard key={signal.id} signal={signal} onDelete={() => setDeleteTarget(signal)} />
            ))}
            {!state.ownSignals.length ? (
              <HubEmptyState
                title="还没有发出的信号弹。"
                description="你发布的公开或私密内容会出现在这里。"
              />
            ) : null}
          </section>
        ) : null}

        {activeTab === "answers" ? (
          <section className="space-y-4">
            <HubSectionHeader
              icon="◎"
              label="收到的回答"
              count={visibleAnswers.length}
              tone="resonance"
            />
            {visibleAnswers.map((answer) => (
              <HubAnswerCard
                key={answer.id}
                answer={answer}
                onAuthorize={() => handleAuthorize(answer.id)}
                onLater={handleLaterAnswer}
              />
            ))}
            {focusedSignalId && !visibleAnswers.length ? (
              <HubEmptyState
                title="这条信号弹暂时还没有收到新的回答。"
                description="有新的授权请求时，这里会自动更新。"
              />
            ) : null}
            {!focusedSignalId && !visibleAnswers.length ? (
              <HubEmptyState
                title="还没有收到回答。"
                description="别人回应你的信号后，这里会显示待授权和已开门的记录。"
              />
            ) : null}
          </section>
        ) : null}

        {activeTab === "invites" ? (
          <section className="space-y-4">
            <HubSectionHeader icon="◈" label="待处理邀请" count={inviteCount} />
            {visibleInvites.map((invite) => (
              <HubInviteCard
                key={invite.id}
                invite={invite}
                onToggle={() => toggleInviteReplying(invite.id)}
                onReplyType={(replyType) => setInviteReplyType(invite.id, replyType)}
                onReplyText={(value) => setInviteReplyText(invite.id, value)}
                onSubmit={() => handleSubmitInvite(invite.id)}
              />
            ))}
            {!visibleInvites.length ? (
              <HubEmptyState
                title="暂时没有待处理邀请。"
                description="别人邀请你阅读、回复或继续传递信号时，会出现在这里。"
              />
            ) : null}
          </section>
        ) : null}

        {activeTab === "gifts" ? (
          <section className="space-y-4">
            <HubSectionHeader icon="♦" label="礼物 · 阅后感" count={state.gifts.length} />
            {state.gifts.map((gift) => (
              <HubGiftCard key={gift.id} gift={gift} />
            ))}
            {!state.gifts.length ? (
              <HubEmptyState
                title="还没有收到礼物。"
                description="当别人留下公开回响或感受时，这里会显示对应记录。"
              />
            ) : null}
          </section>
        ) : null}
      </div>

      {deleteTarget ? (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-[rgba(9,9,15,0.85)] px-6 backdrop-blur-xl">
          <Panel className="w-full max-w-[380px] border-[rgba(239,68,68,0.35)] p-6">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full border border-[rgba(239,68,68,0.35)] bg-[rgba(239,68,68,0.1)] text-[#EF4444]">
                !
              </div>
              <div>
                <div className="text-base text-[var(--text-primary)]">确认删除信号弹</div>
                <div className="text-[10px] text-[var(--text-muted)]">此操作不可撤销</div>
              </div>
            </div>
            <div className="mb-3 rounded-xl border border-[var(--line)] bg-[var(--surface)] px-3 py-3 font-display text-sm leading-7 text-[var(--text-secondary)]">
              {deleteTarget.content.slice(0, 90)}
              {deleteTarget.content.length > 90 ? "…" : ""}
            </div>
            {deleteTarget.linked > 0 ? (
              <div className="mb-4 flex gap-2 rounded-xl border border-[rgba(196,168,90,0.35)] bg-[rgba(196,168,90,0.1)] px-3 py-3 text-sm leading-6 text-[var(--signal)]">
                <span>✦</span>
                <span>
                  此信号弹已触发 {deleteTarget.linked} 条相连信号流，删除后将仅移除此节点，后续相连的信号弹将被完整保留。
                </span>
              </div>
            ) : null}
            <div className="flex gap-3">
              <Button variant="ghost" className="flex-1" onClick={() => setDeleteTarget(null)}>
                取消
              </Button>
              <Button
                variant="danger"
                className="flex-1"
                onClick={() => void handleDeleteSignal(deleteTarget)}
              >
                确认删除
              </Button>
            </div>
          </Panel>
        </div>
      ) : null}

      {toast ? (
        <div className="pointer-events-none fixed bottom-6 left-1/2 z-[300] -translate-x-1/2">
          <HubToast message={toast.message} tone={toast.tone} />
        </div>
      ) : null}
    </PrototypeAppShell>
  );
}
