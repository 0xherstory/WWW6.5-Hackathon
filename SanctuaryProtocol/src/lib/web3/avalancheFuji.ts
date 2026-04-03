import { Chain } from "wagmi/chains";

export const avalancheFuji: Chain = {
  id: 43113,
  name: "Avalanche Fuji",
  nativeCurrency: {
    decimals: 18,
    name: "Avalanche Fuji",
    symbol: "AVAX",
  },
  rpcUrls: {
    public: { http: ["https://api.avax-test.network/ext/bc/C/rpc"] },
    default: { http: ["https://api.avax-test.network/ext/bc/C/rpc"] },
  },
  blockExplorers: {
    default: { name: "SnowTrace", url: "https://testnet.snowtrace.io" },
  },
  testnet: true,
};
