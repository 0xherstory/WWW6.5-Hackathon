import { ReactNode, useMemo } from "react";
import { Link, NavLink } from "react-router-dom";

import { BrandMark } from "../ui/BrandMark";
import { useAppState } from "../../state/useAppState";
import { cn } from "../../lib/cn";
import { WalletStatusControl } from "../ui/WalletStatusControl";

interface PrototypeAppShellProps {
  activeTab: "feed" | "hub";
  children: ReactNode;
  fabTo?: string;
}

export function PrototypeAppShell({ activeTab, children, fabTo }: PrototypeAppShellProps) {
  const { state } = useAppState();
  const personalHubCount = useMemo(
    () =>
      state.answers.filter((answer) => answer.status !== "authorized").length +
      state.invites.length +
      state.gifts.length,
    [state.answers, state.gifts.length, state.invites.length],
  );

  return (
    <div className="min-h-screen bg-[#09090F] font-mono text-[var(--text-primary)]">
      <header className="sticky top-0 z-40 border-b border-[var(--line)] bg-[rgba(9,9,15,0.96)] backdrop-blur-xl">
        <div className="mx-auto flex h-[58px] max-w-[1440px] items-center justify-between px-4 md:px-6">
          <Link to="/discover" className="shrink-0">
            <BrandMark showText textClassName="text-base md:text-lg" />
          </Link>

          <div className="flex min-w-0 items-center gap-3 md:gap-4">
            <nav className="flex items-center gap-2">
              <NavItem to="/discover" label="Feed" active={activeTab === "feed"} />
              <NavItem
                to="/me"
                label="Personal Hub"
                active={activeTab === "hub"}
                badge={personalHubCount}
              />
            </nav>
            <WalletStatusControl mode="full" />
          </div>
        </div>
      </header>

      <div className="mx-auto flex min-h-[calc(100vh-58px)] max-w-[1440px] flex-col">
        <main className="relative min-w-0 flex-1">{children}</main>
      </div>

      {fabTo ? (
        <Link
          to={fabTo}
          className="fixed bottom-8 right-8 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-[linear-gradient(140deg,#D4B86A_0%,#C4A85A_55%,#A88E44_100%)] text-2xl text-[#1A1206] shadow-[0_4px_20px_rgba(196,168,90,0.45)] transition-transform hover:scale-105"
          aria-label="发出信号弹"
        >
          +
        </Link>
      ) : null}
    </div>
  );
}

interface NavItemProps {
  active: boolean;
  badge?: number;
  label: string;
  to: string;
}

function NavItem({ active, badge, label, to }: NavItemProps) {
  return (
    <NavLink
      to={to}
      className={cn(
        "flex items-center gap-2 rounded-xl border px-3 py-2 text-xs tracking-[0.04em]",
        active
          ? "border-[rgba(196,168,90,0.35)] bg-[rgba(196,168,90,0.1)] text-[var(--signal)]"
          : "border-transparent text-[var(--text-muted)] hover:border-[var(--line)] hover:bg-[var(--surface)] hover:text-[var(--text-primary)]",
      )}
    >
      <span>{label}</span>
      {badge && badge > 0 ? (
        <span className="ml-auto rounded-full border border-[rgba(155,127,212,0.35)] bg-[rgba(155,127,212,0.12)] px-1.5 py-0.5 text-[9px] text-[var(--resonance)]">
          {badge}
        </span>
      ) : null}
    </NavLink>
  );
}
