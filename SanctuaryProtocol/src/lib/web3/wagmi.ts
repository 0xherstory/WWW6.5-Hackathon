import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { avalancheFuji, avalanche, hardhat } from "wagmi/chains";

// 检测环境
const isDevelopment = process.env.NODE_ENV === "development";

// 配置链
const chains = isDevelopment 
  ? [hardhat, avalancheFuji, avalanche] 
  : [avalancheFuji, avalanche];

export const wagmiConfig = getDefaultConfig({
  appName: "疗愈庇护所",
  projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || "00000000000000000000000000000000", // 临时假值，生产环境请替换为真实的 projectId
  chains: chains as any,
  ssr: true,
});
