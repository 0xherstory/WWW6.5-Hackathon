import { BrandMark } from "../ui/BrandMark";
import { GeneratedAvatar } from "../ui/GeneratedAvatar";
import { formatWalletLabel } from "../../lib/format";
import { WalletStatusControl } from "../ui/WalletStatusControl";

export type HubTab = "signals" | "answers" | "invites" | "gifts";

interface HubProfileCardProps {
  profileLabel: string;
  walletAddress: string;
}

interface HubTabsProps {
  activeTab: HubTab;
  counts: Record<HubTab, number>;
  onSelect: (tab: HubTab) => void;
}

interface HubSectionHeaderProps {
  count: number;
  icon: string;
  label: string;
  tone?: "resonance" | "signal";
}

const HUB_TABS: Array<{ key: HubTab; label: string }> = [
  { key: "signals", label: "✦ 信号弹" },
  { key: "answers", label: "◎ 收到回答" },
  { key: "invites", label: "◈ 邀请" },
  { key: "gifts", label: "♦ 礼物" },
];

export function HubHeader() {
  return (
    <nav className="sticky top-0 z-50 flex h-14 items-center justify-between border-b border-[var(--line)] bg-[rgba(9,9,15,0.96)] px-6 backdrop-blur-xl">
      <BrandMark size={26} textClassName="text-lg" />
      <span className="hidden text-[10px] tracking-[0.12em] text-[var(--text-muted)] md:inline">
        个人中心 / Personal Hub
      </span>
      <WalletStatusControl />
    </nav>
  );
}

export function HubProfileCard({ profileLabel, walletAddress }: HubProfileCardProps) {
  return (
    <div className="mb-6 flex items-start gap-4">
      <div className="relative">
        <GeneratedAvatar
          address={walletAddress || profileLabel}
          size={62}
          className="border-[rgba(51,51,74,1)]"
        />
        <div className="absolute bottom-[2px] right-[2px] h-[10px] w-[10px] rounded-full border-2 border-[var(--bg-primary)] bg-[#4ADE80]" />
      </div>
      <div>
        <div className="mb-1 font-display text-2xl text-[var(--text-primary)]">{profileLabel}</div>
        <div className="mb-2 font-mono text-[10px] text-[var(--text-muted)]">
          {formatWalletLabel(walletAddress)}
        </div>
        <div className="inline-block w-max whitespace-nowrap font-display text-sm leading-7 text-[var(--text-secondary)]">
          在这里，每一个字都是永恒的见证。信号弹升起的那一刻，它已经属于这个世界。
        </div>
      </div>
    </div>
  );
}

export function HubTabs({ activeTab, counts, onSelect }: HubTabsProps) {
  return (
    <div className="mb-6 flex rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-1">
      {HUB_TABS.map((tab) => (
        <button
          key={tab.key}
          type="button"
          onClick={() => onSelect(tab.key)}
          className={
            activeTab === tab.key
              ? "flex flex-1 items-center justify-center gap-2 rounded-xl border border-[var(--line)] bg-[var(--surface-raised)] px-3 py-2 text-sm text-[var(--signal)]"
              : "flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm text-[var(--text-muted)]"
          }
        >
          <span className="font-display text-lg leading-none">{counts[tab.key]}</span>
          <span>{tab.label}</span>
        </button>
      ))}
    </div>
  );
}

export function HubSectionHeader({
  count,
  icon,
  label,
  tone = "signal",
}: HubSectionHeaderProps) {
  const badgeTone =
    tone === "resonance"
      ? "border-[rgba(155,127,212,0.35)] bg-[rgba(155,127,212,0.12)] text-[var(--resonance)]"
      : "border-[rgba(196,168,90,0.35)] bg-[rgba(196,168,90,0.1)] text-[var(--signal)]";

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className={tone === "resonance" ? "text-[var(--resonance)]" : "text-[var(--signal)]"}>
          {icon}
        </span>
        <span className="text-[10px] uppercase tracking-[0.16em] text-[var(--text-muted)]">
          {label}
        </span>
      </div>
      <span className={`rounded-full border px-2 py-1 text-[9px] ${badgeTone}`}>{count}</span>
    </div>
  );
}
