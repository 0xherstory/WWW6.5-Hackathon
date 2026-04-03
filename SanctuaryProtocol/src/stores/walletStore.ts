import { create } from "zustand";
import { persist } from "zustand/middleware";

interface WalletState {
  address: string | null;
  isConnected: boolean;
  isGuest: boolean;
  setAddress: (address: string | null) => void;
  setConnected: (connected: boolean) => void;
  setGuest: (isGuest: boolean) => void;
  disconnect: () => void;
}

export const useWalletStore = create<WalletState>()(
  persist(
    (set) => ({
      address: null,
      isConnected: false,
      isGuest: false,
      setAddress: (address) => set({ address }),
      setConnected: (isConnected) => set({ isConnected }),
      setGuest: (isGuest) => set({ isGuest }),
      disconnect: () => set({ address: null, isConnected: false, isGuest: false }),
    }),
    {
      name: "wallet-storage",
    }
  )
);
