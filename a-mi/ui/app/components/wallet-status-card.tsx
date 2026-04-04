"use client";

import { useWalletAccount } from "../lib/use-wallet-account";
import { WalletSwitcher } from "./wallet-switcher";

type WalletStatusCardProps = {
  label?: string;
  className?: string;
  labelClassName?: string;
  addressClassName?: string;
  statusClassName?: string;
  actionsClassName?: string;
  switchButtonClassName?: string;
  switchMessageClassName?: string;
};

export function WalletStatusCard({
  label = "当前住民",
  className,
  labelClassName,
  addressClassName,
  statusClassName,
  actionsClassName,
  switchButtonClassName,
  switchMessageClassName,
}: WalletStatusCardProps) {
  const { displayAddress, mounted, statusText } = useWalletAccount();

  return (
    <div className={className}>
      <p className={labelClassName}>{label}</p>
      <p className={addressClassName}>{mounted ? displayAddress : "请先连接钱包"}</p>
      <p className={statusClassName}>{mounted ? statusText : "正在读取钱包状态"}</p>
      <WalletSwitcher
        className={actionsClassName ?? "mt-3 flex w-full flex-col items-start gap-2"}
        buttonClassName={
          switchButtonClassName ??
          "inline-flex min-h-10 items-center justify-center rounded-full border border-[rgba(176,148,138,0.24)] bg-[rgba(255,250,246,0.82)] px-4 py-2 text-sm font-medium tracking-[0.04em] text-[#6E6058] shadow-[0_8px_18px_rgba(116,104,97,0.08)] backdrop-blur-sm transition hover:bg-[rgba(255,248,242,0.95)] disabled:cursor-not-allowed disabled:opacity-70"
        }
        messageClassName={
          switchMessageClassName ??
          "rounded-full bg-[rgba(255,252,250,0.72)] px-3 py-1.5 text-xs tracking-[0.04em] text-[#7B6C65] shadow-[0_6px_16px_rgba(116,104,97,0.06)] backdrop-blur-sm"
        }
      />
    </div>
  );
}
