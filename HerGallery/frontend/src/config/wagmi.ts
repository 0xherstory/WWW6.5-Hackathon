import { createConfig, http } from 'wagmi';
import { avalancheFuji } from 'viem/chains';
import { injected } from 'wagmi/connectors';

export const config = createConfig({
  chains: [avalancheFuji],
  connectors: [
    injected(),
  ],
  transports: {
    [avalancheFuji.id]: http('https://api.avax-test.network/ext/bc/C/rpc', {
      retryCount: 3,
      timeout: 30000,
    }),
  },
});
