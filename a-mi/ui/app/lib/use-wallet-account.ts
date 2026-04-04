"use client";

import { useEffect, useMemo, useState } from "react";
import {
  clearWalletAddress,
  formatAddress,
  getConnectedWalletAddress,
  persistWalletAddress,
  readStoredWalletAddress,
} from "./wallet";

export function useWalletAccount() {
  const [walletAddress, setWalletAddress] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const syncWallet = async () => {
      const nextAddress = await getConnectedWalletAddress();

      if (isMounted) {
        setWalletAddress(nextAddress);
      }
    };

    const handleAccountsChanged = (...args: unknown[]) => {
      const [accounts] = args;

      if (Array.isArray(accounts) && typeof accounts[0] === "string") {
        persistWalletAddress(accounts[0]);
        setWalletAddress(accounts[0]);
        return;
      }

      clearWalletAddress();
      setWalletAddress("");
    };

    const handleStorage = () => {
      setWalletAddress(readStoredWalletAddress());
    };

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    setWalletAddress(readStoredWalletAddress());
    void syncWallet();

    window.addEventListener("storage", handleStorage);
    window.ethereum?.on?.("accountsChanged", handleAccountsChanged);

    return () => {
      isMounted = false;
      window.removeEventListener("storage", handleStorage);
      window.ethereum?.removeListener?.("accountsChanged", handleAccountsChanged);
    };
  }, []);

  return useMemo(
    () => ({
      walletAddress,
      mounted,
      isConnected: Boolean(walletAddress),
      displayAddress: walletAddress ? formatAddress(walletAddress) : "未连接钱包",
      statusText: walletAddress ? "钱包已连接" : "请先连接钱包",
    }),
    [mounted, walletAddress],
  );
}
