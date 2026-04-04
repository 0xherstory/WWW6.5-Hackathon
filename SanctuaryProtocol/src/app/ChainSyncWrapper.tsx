"use client";

import { useChainSync } from "@/hooks/useChainSync";

export function ChainSyncWrapper({ children }: { children: React.ReactNode }) {
  useChainSync();
  return <>{children}</>;
}
