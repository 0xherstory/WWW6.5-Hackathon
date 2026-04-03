"use client";

import { ThirdwebProvider } from "thirdweb/react";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return <ThirdwebProvider>{children}</ThirdwebProvider>;
}
