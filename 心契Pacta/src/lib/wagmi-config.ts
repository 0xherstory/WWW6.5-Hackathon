import { createConfig, http } from "wagmi";
import { injected } from "wagmi/connectors";
import { avalancheFuji } from "./chains";

const fujiRpc = avalancheFuji.rpcUrls.default.http[0];

export const wagmiConfig = createConfig({
  chains: [avalancheFuji],
  connectors: [injected({ shimDisconnect: true })],
  transports: {
    [avalancheFuji.id]: http(fujiRpc),
  },
  ssr: false,
});
