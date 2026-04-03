import { ReactNode } from "react";
import { Link, NavLink } from "react-router-dom";
import { useAccount } from "wagmi";

import { formatWalletLabel } from "../../lib/format";
import { useAppState } from "../../state/useAppState";
import { WalletStatusControl } from "../ui/WalletStatusControl";

interface AppHeaderProps {
  backTo?: string;
  backLabel?: string;
  rightSlot?: ReactNode;
}

export function AppHeader({ backTo, backLabel = "返回", rightSlot }: AppHeaderProps) {
  const { state } = useAppState();
  const { address: activeAddress } = useAccount();
  const address = activeAddress ?? state.session.walletAddress ?? "";
  const addressLabel = formatWalletLabel(address);

  if (backTo) {
    return (
      <header className="sticky top-0 z-40 border-b border-[var(--line)] bg-[rgba(15,15,26,0.8)] backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Link
            to={backTo}
            className="flex items-center gap-2 text-sm text-[var(--text-secondary)] transition-colors duration-300 hover:text-[var(--signal)]"
          >
            <span>←</span>
            <span>{backLabel}</span>
          </Link>
          {rightSlot}
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--line)] bg-[rgba(15,15,26,0.82)] backdrop-blur-xl">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <Link to="/discover" className="text-xl font-semibold tracking-[0.12em] text-[var(--signal)]">
          Semaphore
        </Link>
        <div className="flex items-center gap-4">
          <NavLink
            to="/discover"
            className={({ isActive }) =>
              isActive ? "text-[var(--text-primary)]" : "text-[var(--text-secondary)]"
            }
          >
            发现
          </NavLink>
          <NavLink
            to="/me"
            className={({ isActive }) =>
              isActive ? "text-[var(--text-primary)]" : "text-[var(--text-secondary)]"
            }
          >
            我的
          </NavLink>
          <div className="rounded-full border border-[var(--line)] bg-[rgba(26,26,46,0.9)] px-3 py-1.5 text-xs text-[var(--text-secondary)]">
            {addressLabel}
          </div>
          <WalletStatusControl />
        </div>
      </div>
    </header>
  );
}
