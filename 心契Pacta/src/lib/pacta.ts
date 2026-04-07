export type FrequencyKey = "daily" | "weekdays" | "custom";

/** 已部署的 Pacta 合约（优先读取 .env 的 VITE_PACTA_ADDRESS） */
const ADDRESS_FROM_ENV = (import.meta.env.VITE_PACTA_ADDRESS ?? "").trim();
export const PACTA_ADDRESS = (ADDRESS_FROM_ENV || "0xe55910885090A7aa6592887306c6044210DC24bc") as `0x${string}`;

/** 与合约约定：0 每天 / 1 工作日 / 2 自定义（若链上不同请改此处） */
export const FREQUENCY_TO_UINT: Record<FrequencyKey, bigint> = {
  daily: 0n,
  weekdays: 1n,
  custom: 2n,
};

export const UINT_TO_FREQUENCY_LABEL: Record<string, string> = {
  "0": "每天",
  "1": "工作日",
  "2": "自定义",
};

const FUJI_CHAIN_HEX = "0xa869";

const ADD_CHAIN_PARAMS = {
  chainId: FUJI_CHAIN_HEX,
  chainName: "Avalanche Fuji Testnet",
  nativeCurrency: {
    name: "AVAX",
    symbol: "AVAX",
    decimals: 18,
  },
  rpcUrls: ["https://api.avax-test.network/ext/bc/C/rpc"],
  blockExplorerUrls: ["https://testnet.snowtrace.io"],
} as const;

declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
    };
  }
}

export function isMetaMaskBrowser(): boolean {
  return typeof window !== "undefined" && !!window.ethereum;
}

/** MetaMask：添加 Fuji 网络 */
export async function addFujiEthereumChain(): Promise<void> {
  if (!window.ethereum) throw new Error("未检测到钱包");
  await window.ethereum.request({
    method: "wallet_addEthereumChain",
    params: [ADD_CHAIN_PARAMS],
  });
}

/** 先切换再添加（由调用方处理 4902） */
export async function switchFujiEthereumChain(): Promise<void> {
  if (!window.ethereum) throw new Error("未检测到钱包");
  await window.ethereum.request({
    method: "wallet_switchEthereumChain",
    params: [{ chainId: FUJI_CHAIN_HEX }],
  });
}
