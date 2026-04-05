import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export const DEMO_WALLET = "0xde1a000000000000000000000000000000000001" as const;

type DemoModeState = {
  enabled: boolean;
  wallet: `0x${string}`;
  setEnabled: (enabled: boolean) => void;
  toggleEnabled: () => void;
};

export const useDemoModeStore = create<DemoModeState>()(
  persist(
    (set) => ({
      enabled: true,
      wallet: DEMO_WALLET,
      setEnabled: (enabled) => set({ enabled }),
      toggleEnabled: () => set((state) => ({ enabled: !state.enabled })),
    }),
    {
      name: "pacta-demo-mode",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        enabled: state.enabled,
        wallet: state.wallet,
      }),
    },
  ),
);
