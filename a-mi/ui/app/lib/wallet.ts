"use client";

export const WALLET_STORAGE_KEY = "ami-wallet-address";

type EthereumRequestArgs = {
  method: string;
  params?: unknown[] | object;
};

export type EthereumProvider = {
  isMetaMask?: boolean;
  request: (args: EthereumRequestArgs) => Promise<unknown>;
  on?: (eventName: string, listener: (...args: unknown[]) => void) => void;
  removeListener?: (eventName: string, listener: (...args: unknown[]) => void) => void;
};

type WalletConnectionError = Error & {
  code?: number;
};

declare global {
  interface Window {
    ethereum?: EthereumProvider;
  }
}

export function formatAddress(address: string) {
  if (!address) {
    return "";
  }

  if (address.length <= 10) {
    return address;
  }

  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function getWalletErrorMessage(error: unknown) {
  const walletError = error as WalletConnectionError | undefined;

  if (walletError?.code === 4001) {
    return "User rejected wallet connection";
  }

  if (walletError?.message) {
    return walletError.message;
  }

  return "Wallet connection failed";
}

export async function connectWallet() {
  if (typeof window === "undefined" || !window.ethereum) {
    throw new Error("MetaMask is not installed");
  }

  if (!window.ethereum.isMetaMask) {
    throw new Error("MetaMask is not installed");
  }

  const accounts = await window.ethereum.request({
    method: "eth_requestAccounts",
  });

  const address = getFirstAccount(accounts);

  if (!address) {
    throw new Error("Wallet connection failed");
  }

  persistWalletAddress(address);

  return address;
}

export async function switchWallet() {
  if (typeof window === "undefined" || !window.ethereum) {
    throw new Error("MetaMask is not installed");
  }

  if (!window.ethereum.isMetaMask) {
    throw new Error("MetaMask is not installed");
  }

  try {
    await window.ethereum.request({
      method: "wallet_requestPermissions",
      params: [{ eth_accounts: {} }],
    });
  } catch (error) {
    const walletError = error as WalletConnectionError | undefined;

    if (walletError?.code === 4001) {
      throw error;
    }
  }

  const address = await connectWallet();
  persistWalletAddress(address);
  return address;
}

export async function getConnectedWalletAddress() {
  if (typeof window === "undefined") {
    return "";
  }

  if (!window.ethereum) {
    return readStoredWalletAddress();
  }

  try {
    const accounts = await window.ethereum.request({
      method: "eth_accounts",
    });
    const address = getFirstAccount(accounts);

    if (address) {
      persistWalletAddress(address);
      return address;
    }
  } catch {
    return readStoredWalletAddress();
  }

  clearWalletAddress();
  return "";
}

export function readStoredWalletAddress() {
  if (typeof window === "undefined") {
    return "";
  }

  return window.localStorage.getItem(WALLET_STORAGE_KEY) ?? "";
}

export function persistWalletAddress(address: string) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(WALLET_STORAGE_KEY, address);
}

export function clearWalletAddress() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(WALLET_STORAGE_KEY);
}

function getFirstAccount(accounts: unknown) {
  if (!Array.isArray(accounts) || accounts.length === 0) {
    return "";
  }

  const [address] = accounts;

  return typeof address === "string" ? address : "";
}
