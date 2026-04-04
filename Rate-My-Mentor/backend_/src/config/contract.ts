import { createPublicClient, http } from 'viem';
import { avalancheFuji } from 'viem/chains';

// 直接从 process.env 读取，避开 requireEnv 的限制
function getChainEnv() {
  return {
    RPC_URL: process.env.RPC_URL!,
    CONTRACT_ADDRESS: process.env.CONTRACT_ADDRESS! as `0x${string}`,
  };
}

let _publicClient: ReturnType<typeof createPublicClient> | null = null;

export function getPublicClient() {
  if (_publicClient) return _publicClient;

  const { RPC_URL } = getChainEnv();
  _publicClient = createPublicClient({
    chain: avalancheFuji,
    transport: http(RPC_URL),
  });

  return _publicClient;
}

export function getContractAddress(): `0x${string}` {
  const { CONTRACT_ADDRESS } = getChainEnv();
  return CONTRACT_ADDRESS;
}

//4.3版本 补上缺失的 getChainEnv 函数备份
//import { createPublicClient, http } from 'viem';
//import { avalancheFuji } from 'viem/chains';
//import { requireEnv } from './env';

// ✅ 修复：补上缺失的 getChainEnv 函数
//function getChainEnv() {
  //return {
    //RPC_URL: requireEnv('RPC_URL'),
    //CONTRACT_ADDRESS: requireEnv('CONTRACT_ADDRESS'),
  //};
//}

//let _publicClient: ReturnType<typeof createPublicClient> | null = null;

// 懒加载：只有真正读取链上数据时才校验环境变量并初始化 client
//export function getPublicClient() {
  //if (_publicClient) return _publicClient;

  //const { RPC_URL } = getChainEnv();
  //_publicClient = createPublicClient({
    //chain: avalancheFuji,
    //transport: http(RPC_URL),
  //});

  //return _publicClient;
//}

// 按需读取合约地址，避免模块加载时因配置缺失直接报错
//export function getContractAddress(): `0x${string}` {
  //const { CONTRACT_ADDRESS } = getChainEnv();
  //return CONTRACT_ADDRESS as `0x${string}`;
//}

//20260402改前版本备份：
//import { createPublicClient, http } from 'viem';
//import { sepolia } from 'viem/chains';
//import { env } from './env';

// 初始化区块链客户端，用于读取合约数据、验证SBT持有情况
//export const publicClient = createPublicClient({
//  chain: sepolia,
//  transport: http(env.RPC_URL),
//});

// 合约地址导出，所有文件都从这里拿
//export const CONTRACT_ADDRESS = env.CONTRACT_ADDRESS as `0x${string}`;

//G的修改根据：
//这个文件我建议你以易为版本为主，但吸收福安版本里“统一导出常量”的使用便利性。
//因为从工程稳健性上看，易为版本好一些：
//第一，用了 requireEnv()，这意味着只有在真正调用链上读取时才检查环境变量。这样后端启动时不会因为某些暂时不用的链配置缺失而直接炸掉，容错更强。
//第二，做了懒加载 _publicClient，避免重复创建 client，这比每次模块加载就立刻初始化更稳。
//第三，把“读取 client”和“读取合约地址”都做成函数，这更适合后面在服务里按需调用。
//福安版本的优点主要是简单、直观：
//publicClient 直接导出
//CONTRACT_ADDRESS 直接导出
//这会让调用方写起来更短，但代价是模块一 import 就强依赖环境变量。
