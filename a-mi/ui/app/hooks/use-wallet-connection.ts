"use client";

import { useCallback, useEffect, useState } from "react";

const WALLET_STORAGE_KEY = "ami-wallet-address";

type WalletConnectionError = Error & {
  code?: number;
};

type EthereumRequestArgs = {
  method: string;
  params?: unknown[] | object;
};

type EthereumProvider = {
  isMetaMask?: boolean;
  request: (args: EthereumRequestArgs) => Promise<unknown>;
  on?: (event: string, listener: (...args: unknown[]) => void) => void;
  removeListener?: (event: string, listener: (...args: unknown[]) => void) => void;
};

function getEthereumProvider() {
  if (typeof window === "undefined") {
    return undefined;
  }

  return (window as Window & { ethereum?: EthereumProvider }).ethereum;
}

function normalizeWalletAddress(address: unknown) {
  return typeof address === "string" ? address.trim() : "";
}

function persistWalletAddress(address: string) {
  if (typeof window === "undefined") {
    return;
  }

  if (address) {
    window.localStorage.setItem(WALLET_STORAGE_KEY, address);
    return;
  }

  window.localStorage.removeItem(WALLET_STORAGE_KEY);
}

async function readConnectedWallet() {
  const ethereum = getEthereumProvider();

  if (!ethereum?.request) {
    return "";
  }

  const accounts = await ethereum.request({ method: "eth_accounts" });

  if (!Array.isArray(accounts) || accounts.length === 0) {
    return "";
  }

  return normalizeWalletAddress(accounts[0]);
}

async function requestWalletConnection() {
  const ethereum = getEthereumProvider();

  if (!ethereum) {
    throw new Error("未检测到 MetaMask。");
  }

  if (!ethereum.isMetaMask) {
    throw new Error("当前钱包提供方不是 MetaMask。");
  }

  const accounts = await ethereum.request({ method: "eth_requestAccounts" });

  if (!Array.isArray(accounts) || accounts.length === 0) {
    throw new Error("未获取到钱包账户。");
  }

  const address = normalizeWalletAddress(accounts[0]);

  if (!address) {
    throw new Error("未获取到钱包账户。");
  }

  return address;
}

function getWalletErrorMessage(error: unknown) {
  const walletError = error as WalletConnectionError | undefined;

  if (walletError?.code === 4001) {
    return "你已取消钱包连接。";
  }

  if (walletError?.message) {
    return walletError.message;
  }

  return "钱包连接失败。";
}

export function useWalletConnection() {
  const [walletAddress, setWalletAddress] = useState("");
  const [walletErrorMessage, setWalletErrorMessage] = useState("");
  const [isConnectingWallet, setIsConnectingWallet] = useState(false);

  const refreshWallet = useCallback(async () => {
    try {
      const connectedAddress = await readConnectedWallet();
      setWalletAddress(connectedAddress);
      persistWalletAddress(connectedAddress);
    } catch (error) {
      setWalletAddress("");
      setWalletErrorMessage(getWalletErrorMessage(error));
    }
  }, []);

  useEffect(() => {
    let isActive = true;

    const handleStorage = () => {
      void refreshWallet();
    };

    const handleAccountsChanged = (...args: unknown[]) => {
      const accounts = Array.isArray(args[0]) ? args[0] : [];
      const nextAddress = normalizeWalletAddress(accounts[0]);

      if (!isActive) {
        return;
      }

      setWalletAddress(nextAddress);
      persistWalletAddress(nextAddress);
      setWalletErrorMessage("");
    };

    const ethereum = getEthereumProvider();

    void refreshWallet();
    window.addEventListener("storage", handleStorage);
    ethereum?.on?.("accountsChanged", handleAccountsChanged);

    return () => {
      isActive = false;
      window.removeEventListener("storage", handleStorage);
      ethereum?.removeListener?.("accountsChanged", handleAccountsChanged);
    };
  }, [refreshWallet]);

  const connectOrSwitchWallet = useCallback(async () => {
    if (isConnectingWallet) {
      return "";
    }

    setIsConnectingWallet(true);
    setWalletErrorMessage("");

    try {
      const address = await requestWalletConnection();
      setWalletAddress(address);
      persistWalletAddress(address);
      return address;
    } catch (error) {
      setWalletErrorMessage(getWalletErrorMessage(error));
      return "";
    } finally {
      setIsConnectingWallet(false);
    }
  }, [isConnectingWallet]);

  return {
    walletAddress,
    walletErrorMessage,
    isConnectingWallet,
    connectOrSwitchWallet,
    refreshWallet,
  };
}
