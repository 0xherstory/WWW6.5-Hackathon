import { createConfig, http } from 'wagmi';
import { avalancheFuji } from 'viem/chains';
import { injected } from 'wagmi/connectors';

export const config = createConfig({
  chains: [avalancheFuji],
  connectors: [
    injected(),
  ],
  transports: {
    [avalancheFuji.id]: http('https://avalanche-fuji-c-chain.publicnode.com', {
      retryCount: 3,
      timeout: 30000,
    }),
  },
});
