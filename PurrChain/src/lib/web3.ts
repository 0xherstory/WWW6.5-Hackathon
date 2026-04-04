import { ethers } from "ethers";
import { FUJI_CHAIN_ID, FUJI_NETWORK } from "./contracts";

// ============================================================
//  MetaMask 连接与网络管理
// ============================================================

/** 检查 MetaMask 是否已安装 */
export function isMetaMaskInstalled(): boolean {
  return typeof window !== "undefined" && !!window.ethereum;
}

/** 切换到 Fuji 测试网，如果没有则自动添加 */
export async function switchToFuji(): Promise<void> {
  if (!window.ethereum) throw new Error("MetaMask 未安装");

  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: FUJI_NETWORK.chainId }],
    });
  } catch (err: unknown) {
    // 错误码 4902 表示该网络不存在，需要先添加
    if ((err as { code?: number }).code === 4902) {
      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [FUJI_NETWORK],
      });
    } else {
      throw err;
    }
  }
}

/** 连接钱包，返回地址和 signer */
export async function connectWallet(): Promise<{
  address: string;
  signer: ethers.Signer;
  provider: ethers.BrowserProvider;
}> {
  if (!isMetaMaskInstalled()) {
    throw new Error("请先安装 MetaMask 钱包插件");
  }

  // 请求用户授权
  await window.ethereum.request({ method: "eth_requestAccounts" });

  const provider = new ethers.BrowserProvider(window.ethereum);

  // 检查并切换到 Fuji 网络
  const network = await provider.getNetwork();
  if (Number(network.chainId) !== FUJI_CHAIN_ID) {
    await switchToFuji();
    // 切换后重新获取 provider
    await provider._detectNetwork();
  }

  const signer = await provider.getSigner();
  const address = await signer.getAddress();

  return { address, signer, provider };
}

/** 格式化地址显示，如 0xABCD...1234 */
export function formatAddress(address: string): string {
  if (!address) return "";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

/** 格式化 PURR 余额显示（从 wei 转成整数显示） */
export function formatPurr(wei: bigint): string {
  return Number(ethers.formatEther(wei)).toFixed(0);
}

/** 格式化 AVAX 余额显示 */
export function formatAvax(wei: bigint, decimals = 4): string {
  return Number(ethers.formatEther(wei)).toFixed(decimals);
}

/** 监听账户切换 */
export function onAccountChange(callback: (address: string | null) => void): () => void {
  if (!window.ethereum) return () => {};

  const handler = (accounts: string[]) => {
    callback(accounts.length > 0 ? accounts[0] : null);
  };

  window.ethereum.on("accountsChanged", handler);
  return () => window.ethereum?.removeListener("accountsChanged", handler);
}

/** 监听网络切换 */
export function onChainChange(callback: (chainId: number) => void): () => void {
  if (!window.ethereum) return () => {};

  const handler = (chainIdHex: string) => {
    callback(parseInt(chainIdHex, 16));
  };

  window.ethereum.on("chainChanged", handler);
  return () => window.ethereum?.removeListener("chainChanged", handler);
}

// window.ethereum 类型声明（TypeScript 需要）
declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
      on: (event: string, handler: (...args: unknown[]) => void) => void;
      removeListener: (event: string, handler: (...args: unknown[]) => void) => void;
    };
  }
}
