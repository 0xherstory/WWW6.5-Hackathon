import { mainnet, sepolia } from "wagmi/chains";
import { avalancheFuji } from "./avalancheFuji";

export const supportedChains = [avalancheFuji, mainnet, sepolia] as const;

export type SupportedChain = (typeof supportedChains)[number];

export function getChainById(chainId: number): SupportedChain | undefined {
  return supportedChains.find((chain) => chain.id === chainId);
}

export function isSupportedChain(chainId: number): boolean {
  return supportedChains.some((chain) => chain.id === chainId);
}
