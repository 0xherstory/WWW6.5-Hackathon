import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAccount, useDisconnect, useSwitchChain } from "wagmi";

import { cn } from "../../lib/cn";
import { formatWalletLabel } from "../../lib/format";
import { useAppState } from "../../state/useAppState";
import { seamphoreChain } from "../../web3/deployment";
import { clearAuthSession } from "../../lib/authSession";
import { GeneratedAvatar } from "./GeneratedAvatar";

type WalletStatusControlProps = {
  mode?: "icon" | "full";
};

export function WalletStatusControl({ mode = "icon" }: WalletStatusControlProps) {
  const navigate = useNavigate();
  const { state } = useAppState();
  const { address, chainId, isConnected } = useAccount();
  const { disconnectAsync } = useDisconnect();
  const { switchChainAsync, isPending: isSwitchingChain } = useSwitchChain();
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [hint, setHint] = useState<string | null>(null);

  const walletAddress = address ?? state.session.walletAddress ?? "";
  const walletLabel = formatWalletLabel(walletAddress);
  const isOnSupportedChain = chainId === undefined || chainId === seamphoreChain.id;

  useEffect(() => {
    if (!menuOpen) {
      return undefined;
    }

    const handleClick = (event: MouseEvent) => {
      if (!dropdownRef.current?.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [menuOpen]);

  useEffect(() => {
    if (!hint) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => setHint(null), 2200);
    return () => window.clearTimeout(timeoutId);
  }, [hint]);

  async function handleCopyAddress() {
    if (!walletAddress) {
      return;
    }

    try {
      await navigator.clipboard.writeText(walletAddress);
      setHint("地址已复制");
      setMenuOpen(false);
    } catch {
      setHint("复制失败，请重试");
    }
  }

  async function handleDisconnect() {
    try {
      clearAuthSession();
      await disconnectAsync();
      setMenuOpen(false);
      navigate("/onboarding", { replace: true });
    } catch {
      setHint("断开失败，请重试");
    }
  }

  async function handleSwitchChain() {
    if (!switchChainAsync) {
      setHint("请在钱包里切换到 Avalanche Fuji");
      return;
    }

    try {
      await switchChainAsync({ chainId: seamphoreChain.id });
    } catch {
      setHint("请在钱包里确认切网请求");
    }
  }

  if (!isConnected || !walletAddress) {
    return (
      <Link
        to="/onboarding"
        className="rounded-full border border-[var(--line)] bg-[var(--surface)] px-4 py-2 text-xs text-[var(--text-primary)] transition-colors hover:border-[rgba(196,168,90,0.35)] hover:text-[var(--signal)]"
      >
        Connect Wallet
      </Link>
    );
  }

  if (!isOnSupportedChain) {
    return (
      <div className="relative">
        <button
          type="button"
          onClick={() => void handleSwitchChain()}
          className="rounded-full border border-[rgba(239,68,68,0.35)] bg-[rgba(239,68,68,0.08)] px-4 py-2 text-xs text-[#FCA5A5] transition-colors hover:bg-[rgba(239,68,68,0.12)]"
        >
          {isSwitchingChain ? "Switching..." : "Switch to Fuji"}
        </button>
        {hint ? (
          <div className="pointer-events-none absolute right-0 top-[calc(100%+8px)] whitespace-nowrap rounded-full border border-[rgba(239,68,68,0.28)] bg-[var(--surface-raised)] px-3 py-1 text-[10px] text-[#FCA5A5]">
            {hint}
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div ref={dropdownRef} className="relative">
      <button
        type="button"
        onClick={() => setMenuOpen((value) => !value)}
        className={cn(
          "flex items-center rounded-full border border-[var(--line)] bg-[var(--surface)] transition-colors hover:border-[rgba(155,127,212,0.35)]",
          mode === "full" ? "gap-2 px-2 py-1.5" : "gap-1.5 px-2 py-1.5",
        )}
      >
        <GeneratedAvatar address={walletAddress} size={24} className="border-[rgba(51,51,74,1)]" />
        <div className="h-1.5 w-1.5 rounded-full bg-[#4ADE80]" />
        {mode === "full" ? (
          <span className="hidden text-[11px] tracking-[0.04em] text-[var(--text-primary)] sm:inline">
            {walletLabel}
          </span>
        ) : null}
      </button>

      {menuOpen ? (
        <div className="absolute right-0 top-[calc(100%+8px)] min-w-[220px] rounded-2xl border border-[var(--line)] bg-[var(--surface-raised)] py-1 shadow-[0_20px_50px_rgba(0,0,0,0.7)]">
          <div className="border-b border-[var(--line)] px-4 py-3">
            <div className="mb-1 text-[9px] uppercase tracking-[0.14em] text-[var(--text-muted)]">Connected</div>
            <div className="break-all text-[10px] leading-6 text-[var(--text-secondary)]">
              {walletAddress}
            </div>
            <div className="mt-1 text-[10px] text-[var(--text-muted)]">Avalanche Fuji</div>
          </div>
          <button
            type="button"
            onClick={() => void handleCopyAddress()}
            className="flex w-full items-center gap-2 px-4 py-2 text-left text-xs text-[var(--text-secondary)] transition-colors hover:bg-[rgba(196,168,90,0.08)] hover:text-[var(--signal)]"
          >
            ⎘ Copy address
          </button>
          <Link
            to="/me"
            onClick={() => setMenuOpen(false)}
            className="flex items-center gap-2 px-4 py-2 text-xs text-[var(--text-secondary)] transition-colors hover:bg-[rgba(155,127,212,0.08)] hover:text-[var(--resonance)]"
          >
            ↗ Personal Hub
          </Link>
          <div className="my-1 border-t border-[var(--line)]" />
          <button
            type="button"
            onClick={() => void handleDisconnect()}
            className="flex w-full items-center gap-2 px-4 py-2 text-left text-xs text-[#EF4444] transition-colors hover:bg-[rgba(239,68,68,0.08)]"
          >
            ⏻ Disconnect
          </button>
        </div>
      ) : null}

      {hint ? (
        <div className="pointer-events-none absolute right-0 top-[calc(100%+8px)] whitespace-nowrap rounded-full border border-[rgba(196,168,90,0.28)] bg-[var(--surface-raised)] px-3 py-1 text-[10px] text-[var(--signal)]">
          {hint}
        </div>
      ) : null}
    </div>
  );
}
