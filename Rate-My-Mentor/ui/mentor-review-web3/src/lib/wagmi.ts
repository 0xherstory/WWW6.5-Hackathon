import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { avalancheFuji } from "wagmi/chains";

const projectId =
  process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? "demo-placeholder";

export const wagmiConfig = getDefaultConfig({
  appName: "Rate My Mentor",
  projectId,
  chains: [avalancheFuji],
  ssr: true,
});
