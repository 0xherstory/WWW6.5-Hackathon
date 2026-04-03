'use client';

import { useEffect } from 'react';
import { useChainId } from 'wagmi';
import { setCurrentChainId } from '@/lib/web3/sanctuaryContract';

/**
 * 链同步 Hook
 * 自动将 wagmi 的当前链 ID 同步到 sanctuaryContract
 * 解决 getPublicClient 返回 config 第一个链而非用户连接链的问题
 * 
 * 使用方式：在应用的根布局或 providers 中调用
 * ```tsx
 * function App() {
 *   useChainSync();
 *   return <>{children}</>;
 * }
 * ```
 */
export function useChainSync() {
  const chainId = useChainId();

  useEffect(() => {
    setCurrentChainId(chainId);
  }, [chainId]);

  return chainId;
}
