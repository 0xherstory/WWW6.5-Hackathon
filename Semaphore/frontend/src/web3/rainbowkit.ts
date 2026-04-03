import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import {
  coinbaseWallet,
  injectedWallet,
  metaMaskWallet,
  walletConnectWallet,
} from "@rainbow-me/rainbowkit/wallets";
import { QueryClient } from "@tanstack/react-query";
import { http } from "wagmi";

import { APP_URL, FUJI_RPC_URL, seamphoreChain } from "./deployment";

const walletConnectProjectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID?.trim();
export const hasWalletConnectProjectId = Boolean(walletConnectProjectId);
const availableWallets = hasWalletConnectProjectId
  ? [metaMaskWallet, injectedWallet, walletConnectWallet, coinbaseWallet]
  : [metaMaskWallet];

export const wagmiConfig = getDefaultConfig({
  appDescription: "A private signal system for kindred spirits.",
  appName: "Semaphore",
  appUrl: APP_URL,
  chains: [seamphoreChain],
  projectId: walletConnectProjectId ?? "local-injected-only",
  ssr: false,
  transports: {
    [seamphoreChain.id]: http(FUJI_RPC_URL),
  },
  wallets: [
    {
      groupName: "Available",
      wallets: availableWallets,
    },
  ],
});

export const queryClient = new QueryClient();
