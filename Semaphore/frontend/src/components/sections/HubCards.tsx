import { Button } from "../ui/Button";
import { GeneratedAvatar } from "../ui/GeneratedAvatar";
import { Panel } from "../ui/Panel";
import { useCountdown } from "../../hooks/useCountdown";
import { formatDateLabel, truncateAddress } from "../../lib/format";
import {
  AnswerRecord,
  GiftRecord,
  InviteReplyType,
  InviteRecord,
  OwnedSignalRecord,
} from "../../types/domain";

export type HubToastTone = "amber" | "violet" | "green" | "red";

const replyOptions: Array<{
  className: string;
  color: string;
  desc: string;
  icon: string;
  key: InviteReplyType;
  label: string;
}> = [
  {
    className: "border-[rgba(155,127,212,0.4)] bg-[rgba(155,127,212,0.1)]",
    color: "#9B7FD4",
    desc: "只有作者能看到",
    icon: "🔐",
    key: "private",
    label: "私信作者",
  },
  {
    className: "border-[rgba(196,168,90,0.4)] bg-[rgba(196,168,90,0.1)]",
    color: "#C4A85A",
    desc: "文章读者均可见",
    icon: "◎",
    key: "public",
    label: "文章内公开",
  },
  {
    className: "border-[rgba(74,222,128,0.3)] bg-[rgba(74,222,128,0.08)]",
    color: "#4ADE80",
    desc: "广播至全网 Feed",
    icon: "✦",
    key: "signal",
    label: "转化为新信号弹",
  },
];

export function HubEmptyState({
  description,
  title,
}: {
  description: string;
  title: string;
}) {
  return (
    <Panel className="p-5 text-center">
      <div className="text-sm text-[var(--text-secondary)]">{title}</div>
      <div className="mt-2 text-xs leading-6 text-[var(--text-muted)]">{description}</div>
    </Panel>
  );
}

export function HubToast({ message, tone }: { message: string; tone: HubToastTone }) {
  const toneClass =
    tone === "green"
      ? "border-[rgba(74,222,128,0.4)] text-[#4ADE80]"
      : tone === "red"
        ? "border-[rgba(239,68,68,0.4)] text-[#EF4444]"
        : tone === "violet"
          ? "border-[rgba(155,127,212,0.45)] text-[var(--resonance)]"
          : "border-[rgba(196,168,90,0.45)] text-[var(--signal)]";

  return (
    <div
      className={`rounded-full border bg-[rgba(24,24,42,0.96)] px-5 py-2 text-xs tracking-[0.07em] ${toneClass}`}
    >
      {message}
    </div>
  );
}

export function HubSignalCard({
  onDelete,
  signal,
}: {
  onDelete: () => void;
  signal: OwnedSignalRecord;
}) {
  const storageLabel =
    signal.visibility === "private"
      ? "◌ 仅自己可见"
      : signal.storage === "arweave"
        ? "⧫ Arweave"
        : "◎ IPFS";

  return (
    <Panel className="relative overflow-hidden p-4 pl-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-[rgba(196,168,90,0.35)]">
      <div className="absolute bottom-0 left-0 top-0 w-[2px] bg-gradient-to-b from-[var(--signal)] to-transparent" />
      <p className="font-display text-sm leading-7 text-[var(--text-secondary)]">
        {signal.content.slice(0, 120)}
        {signal.content.length > 120 ? "…" : ""}
      </p>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3 text-[10px] font-mono text-[var(--text-muted)]">
          <span>◎ {signal.resonances}</span>
          {signal.linked > 0 ? (
            <span className="rounded-full border border-[rgba(155,127,212,0.35)] bg-[rgba(155,127,212,0.12)] px-2 py-1 text-[var(--resonance)]">
              ⬡ {signal.linked} 相连
            </span>
          ) : null}
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full border border-[rgba(196,168,90,0.35)] bg-[rgba(196,168,90,0.1)] px-2 py-1 text-[10px] text-[var(--signal)]">
            {storageLabel}
          </span>
          <button
            type="button"
            onClick={onDelete}
            className="rounded-lg border border-[var(--line)] px-3 py-2 text-xs text-[var(--text-secondary)] transition-all duration-200 hover:border-[rgba(239,68,68,0.35)] hover:text-[#EF4444]"
          >
            ✕ 删除
          </button>
        </div>
      </div>
      <div className="mt-3 font-mono text-[10px] text-[var(--text-muted)]">
        Block #{signal.blockNumber} · {formatDateLabel(signal.ts)}
      </div>
    </Panel>
  );
}

export function HubAnswerCard({
  answer,
  onAuthorize,
  onLater,
}: {
  answer: AnswerRecord;
  onAuthorize: () => void;
  onLater: () => void;
}) {
  return (
    <Panel className={answer.status === "authorized" ? "border-[rgba(74,222,128,0.3)] p-4" : "p-4"}>
      <div className="mb-3 flex items-center gap-3">
        <SenderAvatar address={answer.from} size={30} />
        <div className="flex-1">
          <div className="font-mono text-[11px] text-[var(--text-secondary)]">
            {answer.ens ?? truncateAddress(answer.from)}
          </div>
          <div className="text-[9px] text-[var(--text-muted)]">{formatDateLabel(answer.ts)}</div>
        </div>
        {answer.status === "authorized" ? <HubCountdownBadge endTime={answer.authorizedAt} /> : null}
        {answer.status === "authorizing" ? (
          <span className="rounded-full border border-[rgba(196,168,90,0.35)] bg-[rgba(196,168,90,0.1)] px-2 py-1 text-[9px] text-[var(--signal)]">
            授权中
          </span>
        ) : null}
      </div>

      <p className="font-display text-sm leading-7 text-[var(--text-secondary)]">{answer.preview}</p>
      <div className="mt-3 rounded-lg border border-[var(--line)] bg-[rgba(24,24,42,0.9)] px-3 py-2 text-[10px] text-[var(--text-muted)]">
        关联文章：{answer.article}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {answer.status === "pending" ? (
          <>
            <Button onClick={onAuthorize}>⬡ 开门授权</Button>
            <Button variant="ghost" onClick={onLater}>
              稍后处理
            </Button>
          </>
        ) : null}
        {answer.status === "authorized" ? <Button variant="green">✓ 限时阅读中</Button> : null}
      </div>
    </Panel>
  );
}

export function HubInviteCard({
  invite,
  onReplyText,
  onReplyType,
  onSubmit,
  onToggle,
}: {
  invite: InviteRecord;
  onReplyText: (value: string) => void;
  onReplyType: (replyType: InviteReplyType) => void;
  onSubmit: () => void;
  onToggle: () => void;
}) {
  return (
    <Panel className="overflow-hidden p-0">
      <div className="p-4">
        <div className="mb-3 flex items-center gap-3">
          <SenderAvatar address={invite.from} size={30} />
          <div className="flex-1">
            <div className="font-mono text-[11px] text-[var(--text-secondary)]">
              {invite.ens ?? truncateAddress(invite.from)}
            </div>
            <div className="text-[9px] text-[var(--text-muted)]">{formatDateLabel(invite.ts)} 发出邀请</div>
          </div>
          <span className="rounded-full border border-[rgba(196,168,90,0.35)] bg-[rgba(196,168,90,0.1)] px-2 py-1 text-[9px] text-[var(--signal)]">
            邀请
          </span>
        </div>

        <div className="mb-3 rounded-lg border border-[var(--line)] bg-[rgba(24,24,42,0.9)] px-3 py-2 text-[10px] text-[var(--text-muted)]">
          {invite.article}
        </div>
        <p className="font-display text-sm leading-7 text-[var(--text-secondary)]">{invite.excerpt}</p>

        <div className="mt-4 flex gap-2">
          <Button variant={invite.replying ? "violet" : "amber"} className="w-full" onClick={onToggle}>
            {invite.replying ? "▲ 收起" : "↩ 回复邀请"}
          </Button>
        </div>
      </div>

      {invite.replying ? (
        <div className="border-t border-[var(--line)] bg-[rgba(24,24,42,0.9)] p-4">
          <div className="mb-3 text-[9px] uppercase tracking-[0.12em] text-[var(--text-muted)]">
            选择回复方式
          </div>
          <div className="space-y-2">
            {replyOptions.map((option) => {
              const selected = invite.replyType === option.key;

              return (
                <button
                  key={option.key}
                  type="button"
                  onClick={() => onReplyType(option.key)}
                  className={
                    selected
                      ? `flex w-full items-center gap-3 rounded-xl border px-3 py-3 text-left ${option.className}`
                      : "flex w-full items-center gap-3 rounded-xl border border-[var(--line)] bg-[rgba(17,17,32,0.9)] px-3 py-3 text-left"
                  }
                >
                  <span style={{ color: option.color }}>{option.icon}</span>
                  <div>
                    <div className="text-sm text-[var(--text-primary)]">{option.label}</div>
                    <div className="text-[9px] text-[var(--text-muted)]">{option.desc}</div>
                  </div>
                </button>
              );
            })}
          </div>

          <textarea
            value={invite.replyText}
            onChange={(event) => onReplyText(event.target.value)}
            placeholder={invite.replyType === "signal" ? "写下你的信号弹内容…" : "写下你的回复…"}
            className="mt-3 min-h-[88px] w-full resize-none rounded-xl border border-[var(--line)] bg-[rgba(17,17,32,0.9)] px-3 py-3 font-display text-sm leading-7 text-[var(--text-primary)] outline-none"
          />

          <Button
            variant={invite.replyType && invite.replyText.trim() ? "violet" : "ghost"}
            className="mt-3 w-full"
            onClick={onSubmit}
            disabled={!invite.replyType || !invite.replyText.trim()}
          >
            发送回复 ↑
          </Button>
        </div>
      ) : null}
    </Panel>
  );
}

export function HubGiftCard({ gift }: { gift: GiftRecord }) {
  return (
    <Panel className="p-4 transition-all duration-200 hover:border-[rgba(196,168,90,0.35)]">
      <div className="mb-3 flex items-center gap-3">
        <SenderAvatar address={gift.from} size={28} />
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[11px] text-[var(--text-secondary)]">
              {gift.ens ?? truncateAddress(gift.from)}
            </span>
            <span className="rounded-full border border-[rgba(196,168,90,0.35)] bg-[rgba(196,168,90,0.1)] px-2 py-1 text-[9px] text-[var(--signal)]">
              {gift.type}
            </span>
          </div>
          <div className="text-[9px] text-[var(--text-muted)]">
            {formatDateLabel(gift.ts)} · {gift.article}
          </div>
        </div>
      </div>
      <p className="border-l border-[rgba(196,168,90,0.35)] pl-4 font-display text-[15px] leading-8 text-[var(--text-primary)]">
        {gift.message}
      </p>
    </Panel>
  );
}

function SenderAvatar({ address, size }: { address: string; size: number }) {
  return <GeneratedAvatar address={address} size={size} className="border-[rgba(51,51,74,1)]" />;
}

function HubCountdownBadge({ endTime }: { endTime: number | null }) {
  const { label, isExpired } = useCountdown(endTime);

  if (!endTime) {
    return null;
  }

  return (
    <span
      className={
        isExpired
          ? "inline-flex items-center gap-1 rounded-full border border-[rgba(239,68,68,0.35)] bg-[rgba(239,68,68,0.1)] px-2 py-1 text-[9px] text-[#EF4444]"
          : "inline-flex items-center gap-1 rounded-full border border-[rgba(74,222,128,0.3)] bg-[rgba(74,222,128,0.1)] px-2 py-1 text-[9px] text-[#4ADE80]"
      }
    >
      {label}
    </span>
  );
}
