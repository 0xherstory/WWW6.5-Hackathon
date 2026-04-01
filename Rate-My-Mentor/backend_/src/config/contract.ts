import { createPublicClient, http } from 'viem';
import { sepolia } from 'viem/chains';
import { requireEnv } from './env';

let _publicClient: ReturnType<typeof createPublicClient> | null = null;

// 懒加载：调用链上读取功能时才校验 RPC/合约地址配置
export function getPublicClient() {
  if (_publicClient) return _publicClient;
  const { RPC_URL } = requireEnv(['RPC_URL'] as const);
  _publicClient = createPublicClient({
    chain: sepolia,
    transport: http(RPC_URL),
  });
  return _publicClient;
}

export function getContractAddress(): `0x${string}` {
  const { CONTRACT_ADDRESS } = requireEnv(['CONTRACT_ADDRESS'] as const);
  return CONTRACT_ADDRESS as `0x${string}`;
}