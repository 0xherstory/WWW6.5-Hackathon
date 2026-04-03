"use client";

import { WagmiProvider } from "wagmi";
import { RainbowKitProvider, lightTheme, type Locale } from "@rainbow-me/rainbowkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { wagmiConfig } from "@/lib/web3/wagmi";
import dynamic from "next/dynamic";
import { useLocale } from "next-intl";

const queryClient = new QueryClient();

const customTheme = lightTheme({
  borderRadius: "none",
  fontStack: "system",
  overlayBlur: "small",
});

const ChainSyncWrapper = dynamic(
  () => import("./ChainSyncWrapper").then((mod) => mod.ChainSyncWrapper),
  { ssr: false }
);

// RainbowKit 支持的语言映射
const rainbowKitLocales: Record<string, Locale> = {
  en: "en",
  zh: "zh-CN",
};

function RainbowKitProviderWithLocale({ children }: { children: React.ReactNode }) {
  const locale = useLocale();
  const rainbowKitLocale = rainbowKitLocales[locale] || "en";

  return (
    <RainbowKitProvider
      theme={customTheme}
      modalSize="compact"
      locale={rainbowKitLocale}
    >
      {children}
    </RainbowKitProvider>
  );
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProviderWithLocale>
          <ChainSyncWrapper>
            {children}
          </ChainSyncWrapper>
        </RainbowKitProviderWithLocale>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
