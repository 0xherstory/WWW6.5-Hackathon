import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { PrototypeAppShell } from "../components/layout/PrototypeAppShell";
import { GeneratedAvatar } from "../components/ui/GeneratedAvatar";
import { useCountdown } from "../hooks/useCountdown";
import { cn } from "../lib/cn";
import { formatRelativeTimeLabel, truncateAddress } from "../lib/format";
import { useAppState } from "../state/useAppState";
import { AnswerRecord, GiftRecord, InviteRecord, InviteReplyType } from "../types/domain";

type InboxItem =
  | { kind: "answer"; id: string; ts: number; value: AnswerRecord }
  | { kind: "invite"; id: string; ts: number; value: InviteRecord }
  | { kind: "gift"; id: string; ts: number; value: GiftRecord };

const REPLY_OPTIONS: Array<{ key: InviteReplyType; label: string; desc: string; tone: string }> = [
  { key: "private", label: "私信作者", desc: "只有作者能看到", tone: "border-[rgba(155,127,212,0.35)] bg-[rgba(155,127,212,0.08)] text-[var(--resonance)]" },
  { key: "public", label: "文章内公开", desc: "文章读者都能看到", tone: "border-[rgba(196,168,90,0.35)] bg-[rgba(196,168,90,0.08)] text-[var(--signal)]" },
  { key: "signal", label: "发成信号弹", desc: "广播到首页 Feed", tone: "border-[rgba(74,222,128,0.3)] bg-[rgba(74,222,128,0.08)] text-[#4ADE80]" },
];

export function InboxPage() {
  const [openedGifts, setOpenedGifts] = useState<Record<number, boolean>>({});
  const {
    state,
    authorizeAnswer,
    setInviteReplyText,
    setInviteReplyType,
    skipInvite,
    submitInviteReply,
    toggleInviteReplying,
  } = useAppState();

  const items = useMemo<InboxItem[]>(() => {
    return [
      ...state.answers.map((answer) => ({
        kind: "answer" as const,
        id: `answer-${answer.id}`,
        ts: answer.ts,
        value: answer,
      })),
      ...state.invites.map((invite) => ({
        kind: "invite" as const,
        id: `invite-${invite.id}`,
        ts: invite.ts,
        value: invite,
      })),
      ...state.gifts.map((gift) => ({
        kind: "gift" as const,
        id: `gift-${gift.id}`,
        ts: gift.ts,
        value: gift,
      })),
    ].sort((left, right) => right.ts - left.ts);
  }, [state.answers, state.gifts, state.invites]);

  const unreadCount = state.answers.filter((answer) => answer.status !== "authorized").length + state.invites.length + state.gifts.length;

  function toggleGift(giftId: number) {
    setOpenedGifts((previous) => ({
      ...previous,
      [giftId]: !previous[giftId],
    }));
  }

  return (
    <PrototypeAppShell activeTab="hub">
      <div className="mx-auto w-full max-w-[620px] px-5 pb-20 pt-7">
        <div className="mb-5">
          <div className="mb-1 flex items-center gap-2">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#C4A85A" strokeWidth="2">
              <path d="M4 4h16v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4z" />
              <path d="M4 9l8 5 8-5" />
            </svg>
            <span className="text-[11px] uppercase tracking-[0.16em] text-[var(--text-muted)]">Inbox</span>
          </div>
          <div className="text-[11px] text-[var(--text-muted)] opacity-70">
            {unreadCount} 条待处理 · {items.length} 条消息
          </div>
        </div>

        <div className="mb-6 h-px bg-[linear-gradient(to_right,rgba(155,127,212,0.5),rgba(196,168,90,0.2),transparent)]" />

        <div className="space-y-4">
          {items.length ? (
            items.map((item) => {
              if (item.kind === "answer") {
                return <AnswerInboxCard key={item.id} answer={item.value} onAuthorize={authorizeAnswer} />;
              }

              if (item.kind === "invite") {
                return (
                  <InviteInboxCard
                    key={item.id}
                    invite={item.value}
                    onReplyText={setInviteReplyText}
                    onReplyType={setInviteReplyType}
                    onSkip={skipInvite}
                    onSubmit={submitInviteReply}
                    onToggle={toggleInviteReplying}
                  />
                );
              }

              return (
                <GiftInboxCard
                  key={item.id}
                  expanded={Boolean(openedGifts[item.value.id])}
                  gift={item.value}
                  onToggle={() => toggleGift(item.value.id)}
                />
              );
            })
          ) : (
            <div className="rounded-[18px] border border-[var(--line)] bg-[var(--surface)] px-5 py-10 text-center">
              <div className="text-sm text-[var(--text-secondary)]">收件箱还是空的。</div>
              <div className="mt-2 text-xs leading-6 text-[var(--text-muted)]">别人回应你、邀请你、送你礼物时，都会在这里出现。</div>
            </div>
          )}
        </div>
      </div>
    </PrototypeAppShell>
  );
}

function AnswerInboxCard({
  answer,
  onAuthorize,
}: {
  answer: AnswerRecord;
  onAuthorize: (answerId: number) => Promise<void>;
}) {
  const { label, isExpired } = useCountdown(answer.authorizedAt);

  return (
    <div className="relative overflow-hidden rounded-[18px] border border-[rgba(155,127,212,0.3)] bg-[var(--surface)] px-4 py-4">
      {answer.status !== "authorized" ? (
        <div className="absolute right-4 top-4 h-2 w-2 rounded-full bg-[var(--resonance)] shadow-[0_0_8px_rgba(155,127,212,0.7)]" />
      ) : null}

      <div className="mb-3 flex items-center gap-2">
        <span className="rounded-full border border-[rgba(155,127,212,0.4)] bg-[rgba(155,127,212,0.12)] px-2 py-1 text-[9px] uppercase tracking-[0.1em] text-[var(--resonance)]">
          ◈ 信号弹开门邀请
        </span>
        {answer.status === "authorizing" ? (
          <span className="rounded-full border border-[rgba(196,168,90,0.35)] bg-[rgba(196,168,90,0.08)] px-2 py-1 text-[9px] text-[var(--signal)]">
            授权中
          </span>
        ) : null}
        {answer.status === "authorized" ? (
          <span
            className={cn(
              "rounded-full border px-2 py-1 text-[9px]",
              isExpired
                ? "border-[rgba(239,68,68,0.35)] bg-[rgba(239,68,68,0.08)] text-[#EF4444]"
                : "border-[rgba(74,222,128,0.3)] bg-[rgba(74,222,128,0.08)] text-[#4ADE80]",
            )}
          >
            {isExpired ? "已过期" : `✓ ${label}`}
          </span>
        ) : null}
      </div>

      <SenderBlock address={answer.from} ens={answer.ens} timeLabel={formatRelativeTimeLabel(answer.ts)} />

      <div className="mb-3 inline-flex rounded-md border border-[var(--line)] bg-[var(--surface-raised)] px-3 py-2 text-[10px] text-[var(--text-muted)]">
        📎 {answer.article}
      </div>

      <p className="text-sm leading-7 text-[var(--text-secondary)]">{answer.preview}</p>

      <div className="mt-4 flex flex-wrap gap-2">
        {answer.status === "pending" ? (
          <>
            <button
              type="button"
              onClick={() => void onAuthorize(answer.id)}
              className="rounded-xl border border-[rgba(196,168,90,0.35)] bg-[rgba(196,168,90,0.08)] px-4 py-2 text-[11px] tracking-[0.06em] text-[var(--signal)] transition-colors hover:bg-[rgba(196,168,90,0.14)]"
            >
              ⬡ 开门授权
            </button>
            <Link
              to="/me?tab=answers"
              className="rounded-xl border border-[var(--line)] px-4 py-2 text-[11px] tracking-[0.06em] text-[var(--text-secondary)] transition-colors hover:border-[var(--line-strong)] hover:text-[var(--text-primary)]"
            >
              稍后
            </Link>
          </>
        ) : null}
        {answer.status === "authorized" ? (
          <Link
            to="/me?tab=answers"
            className="rounded-xl border border-[rgba(74,222,128,0.3)] bg-[rgba(74,222,128,0.08)] px-4 py-2 text-[11px] tracking-[0.06em] text-[#4ADE80]"
          >
            ✓ 已开门授权
          </Link>
        ) : null}
      </div>
    </div>
  );
}

function InviteInboxCard({
  invite,
  onReplyText,
  onReplyType,
  onSkip,
  onSubmit,
  onToggle,
}: {
  invite: InviteRecord;
  onReplyText: (inviteId: number, value: string) => void;
  onReplyType: (inviteId: number, replyType: InviteReplyType) => void;
  onSkip: (inviteId: number) => void;
  onSubmit: (inviteId: number) => Promise<void>;
  onToggle: (inviteId: number) => void;
}) {
  return (
    <div className="relative overflow-hidden rounded-[18px] border border-[rgba(155,127,212,0.24)] bg-[var(--surface)] px-4 py-4">
      <div className="absolute right-4 top-4 h-2 w-2 rounded-full bg-[var(--resonance)] shadow-[0_0_8px_rgba(155,127,212,0.7)]" />

      <div className="mb-3 flex items-center gap-2">
        <span className="rounded-full border border-[rgba(155,127,212,0.4)] bg-[rgba(155,127,212,0.12)] px-2 py-1 text-[9px] uppercase tracking-[0.1em] text-[var(--resonance)]">
          ◈ 邀请
        </span>
      </div>

      <SenderBlock address={invite.from} ens={invite.ens} timeLabel={formatRelativeTimeLabel(invite.ts)} />

      <div className="mb-3 inline-flex rounded-md border border-[var(--line)] bg-[var(--surface-raised)] px-3 py-2 text-[10px] text-[var(--text-muted)]">
        📎 {invite.article}
      </div>

      <p className="text-sm leading-7 text-[var(--text-secondary)]">{invite.excerpt}</p>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onToggle(invite.id)}
          className="rounded-xl border border-[rgba(196,168,90,0.35)] bg-[rgba(196,168,90,0.08)] px-4 py-2 text-[11px] tracking-[0.06em] text-[var(--signal)] transition-colors hover:bg-[rgba(196,168,90,0.14)]"
        >
          {invite.replying ? "▲ 收起回复" : "↩ 回复邀请"}
        </button>
        <Link
          to="/me?tab=invites"
          className="rounded-xl border border-[var(--line)] px-4 py-2 text-[11px] tracking-[0.06em] text-[var(--text-secondary)] transition-colors hover:border-[var(--line-strong)] hover:text-[var(--text-primary)]"
        >
          进入我的邀请页
        </Link>
      </div>

      {invite.replying ? (
        <div className="mt-4 rounded-2xl border border-[var(--line)] bg-[rgba(24,24,42,0.9)] p-3">
          <div className="mb-2 text-[9px] uppercase tracking-[0.12em] text-[var(--text-muted)]">选择回应方式</div>
          <div className="space-y-2">
            {REPLY_OPTIONS.map((option) => {
              const selected = invite.replyType === option.key;

              return (
                <button
                  key={option.key}
                  type="button"
                  onClick={() => onReplyType(invite.id, option.key)}
                  className={cn(
                    "w-full rounded-xl border px-3 py-3 text-left transition-colors",
                    selected ? option.tone : "border-[var(--line)] bg-[#111120] text-[var(--text-secondary)]",
                  )}
                >
                  <div className="text-sm">{option.label}</div>
                  <div className="mt-1 text-[10px] text-[var(--text-muted)]">{option.desc}</div>
                </button>
              );
            })}
          </div>

          <textarea
            value={invite.replyText}
            onChange={(event) => onReplyText(invite.id, event.target.value)}
            placeholder={invite.replyType === "signal" ? "写下你的信号弹内容..." : "写下你的回应..."}
            className="mt-3 min-h-[96px] w-full resize-none rounded-xl border border-[var(--line)] bg-[#111120] px-4 py-3 text-sm leading-7 text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)]"
          />

          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => void onSubmit(invite.id)}
              disabled={!invite.replyType || !invite.replyText.trim()}
              className="rounded-xl border border-[rgba(155,127,212,0.35)] bg-[rgba(155,127,212,0.1)] px-4 py-2 text-[11px] tracking-[0.06em] text-[var(--resonance)] transition-opacity disabled:opacity-40"
            >
              发送回应 ↑
            </button>
            <button
              type="button"
              onClick={() => onSkip(invite.id)}
              className="rounded-xl border border-[var(--line)] px-4 py-2 text-[11px] tracking-[0.06em] text-[var(--text-secondary)] transition-colors hover:border-[var(--line-strong)] hover:text-[var(--text-primary)]"
            >
              稍后
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function GiftInboxCard({
  expanded,
  gift,
  onToggle,
}: {
  expanded: boolean;
  gift: GiftRecord;
  onToggle: () => void;
}) {
  const preview = expanded || gift.message.length < 88 ? gift.message : `${gift.message.slice(0, 88)}…`;

  return (
    <div className="relative overflow-hidden rounded-[18px] border border-[rgba(196,168,90,0.24)] bg-[var(--surface)] px-4 py-4">
      <div className="absolute right-4 top-4 h-2 w-2 rounded-full bg-[var(--signal)] shadow-[0_0_8px_rgba(196,168,90,0.7)]" />

      <div className="mb-3 flex items-center gap-2">
        <span className="rounded-full border border-[rgba(196,168,90,0.35)] bg-[rgba(196,168,90,0.08)] px-2 py-1 text-[9px] uppercase tracking-[0.1em] text-[var(--signal)]">
          ♦ 礼物
        </span>
      </div>

      <SenderBlock address={gift.from} ens={gift.ens} timeLabel={formatRelativeTimeLabel(gift.ts)} />

      <div className="mb-3 inline-flex rounded-md border border-[var(--line)] bg-[var(--surface-raised)] px-3 py-2 text-[10px] text-[var(--text-muted)]">
        📎 {gift.article}
      </div>

      <p className="text-sm leading-7 text-[var(--text-secondary)]">{preview}</p>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onToggle}
          className="rounded-xl border border-[rgba(196,168,90,0.35)] bg-[rgba(196,168,90,0.08)] px-4 py-2 text-[11px] tracking-[0.06em] text-[var(--signal)] transition-colors hover:bg-[rgba(196,168,90,0.14)]"
        >
          {expanded ? "收起礼物" : "♦ 查看礼物"}
        </button>
        <Link
          to="/compose"
          state={{ draftText: gift.message, parentTitle: gift.article }}
          className="rounded-xl border border-[rgba(155,127,212,0.35)] bg-[rgba(155,127,212,0.08)] px-4 py-2 text-[11px] tracking-[0.06em] text-[var(--resonance)] transition-colors hover:bg-[rgba(155,127,212,0.14)]"
        >
          ↩ 写一封回信
        </Link>
      </div>
    </div>
  );
}

function SenderBlock({ address, ens, timeLabel }: { address: string; ens: string | null; timeLabel: string }) {
  return (
    <div className="mb-3 flex items-center gap-3">
      <GeneratedAvatar address={address} size={32} className="border-[rgba(51,51,74,1)]" />
      <div>
        <div className="text-xs text-[var(--text-secondary)]">{ens ?? truncateAddress(address)}</div>
        <div className="mt-0.5 text-[10px] text-[var(--text-muted)]">{timeLabel}</div>
      </div>
    </div>
  );
}
