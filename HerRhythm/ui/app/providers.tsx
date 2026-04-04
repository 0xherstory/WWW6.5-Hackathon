"use client";

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { config } from "@/lib/wagmi";
import { BackgroundAudioProvider } from "@/components/BackgroundAudioProvider";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <BackgroundAudioProvider>{children}</BackgroundAudioProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}