'use client';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider, http } from 'wagmi';
import { avalancheFuji } from 'wagmi/chains';
import { getDefaultConfig, lightTheme, RainbowKitProvider } from '@rainbow-me/rainbowkit';
import '@rainbow-me/rainbowkit/styles.css';

const config = getDefaultConfig({
  appName: 'Evergarden',
  projectId: '190e7eaef0479f7aa3d470d25f536f4b', // 这是一个通用的测试 ID
  chains: [avalancheFuji],
  transports: { [avalancheFuji.id]: http() },
});

const gardenTheme = lightTheme({
  accentColor: '#6B8E6B',
  accentColorForeground: '#ffffff',
  borderRadius: 'large',
  fontStack: 'system',
  overlayBlur: 'small',
});

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={gardenTheme} modalSize="compact">
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}