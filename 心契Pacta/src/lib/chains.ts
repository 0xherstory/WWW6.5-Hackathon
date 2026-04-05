import { defineChain } from "viem";

/** Avalanche Fuji Testnet — RPC / 浏览器与部署说明一致 */
export const avalancheFuji = defineChain({
  id: 43_113,
  name: "Avalanche Fuji Testnet",
  nativeCurrency: {
    decimals: 18,
    name: "Avalanche",
    symbol: "AVAX",
  },
  rpcUrls: {
    default: { http: ["https://api.avax-test.network/ext/bc/C/rpc"] },
  },
  blockExplorers: {
    default: {
      name: "Snowtrace",
      url: "https://testnet.snowtrace.io",
    },
  },
  testnet: true,
});

export const FUJI_CHAIN_ID = avalancheFuji.id;
