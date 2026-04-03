"use client";

import { useAccount } from "wagmi";

/**
 * 合约读写的统一入口（预留）
 * Day2 接入 ABI 后在此封装 useReadContract / useWriteContract
 */
export function useContractContext() {
  const { address, chainId, status } = useAccount();
  return { address, chainId, status };
}
