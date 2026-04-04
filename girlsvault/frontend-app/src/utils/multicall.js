import { ethers } from "ethers";

// Multicall3 在 Avalanche Fuji 和大多数网络上的标准部署地址
// https://www.multicall3.com/
const MULTICALL3_ADDRESS = "0xcA11bde05977b3631167028862bE2a173976CA11";

const MULTICALL3_ABI = [
  "function aggregate3(tuple(address target, bool allowFailure, bytes callData)[] calls) view returns (tuple(bool success, bytes returnData)[] returnData)",
];

/**
 * 批量调用合约 view 函数，减少 RPC round-trips
 *
 * @param {ethers.Provider} provider
 * @param {Array<{ target: string, abi: string, fn: string, args?: any[] }>} calls
 * @returns {Promise<Array<any>>} 解码后的结果数组，失败项返回 null
 */
export async function multicallRead(provider, calls) {
  if (calls.length === 0) return [];

  try {
    const mc = new ethers.Contract(MULTICALL3_ADDRESS, MULTICALL3_ABI, provider);
    const ifaces = calls.map((c) => new ethers.Interface([c.abi]));

    const encoded = calls.map((c, i) => ({
      target: c.target,
      allowFailure: true,
      callData: ifaces[i].encodeFunctionData(c.fn, c.args || []),
    }));

    const results = await mc.aggregate3(encoded);

    return results.map((r, i) => {
      if (!r.success) return null;
      const decoded = ifaces[i].decodeFunctionResult(calls[i].fn, r.returnData);
      // 单返回值直接解包，多返回值保持数组
      return decoded.length === 1 ? decoded[0] : Array.from(decoded);
    });
  } catch {
    // Multicall3 不可用时（如本地 Hardhat 未部署）降级为并行独立调用
    return Promise.all(
      calls.map((c) => {
        const contract = new ethers.Contract(c.target, [c.abi], provider);
        return contract[c.fn](...(c.args || [])).catch(() => null);
      })
    );
  }
}
