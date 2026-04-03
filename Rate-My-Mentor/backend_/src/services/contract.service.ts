import { getContractAddress, getPublicClient } from '../config/contract';
// import { CONTRACT_ADDRESS, publicClient } from '../config/contract';
// G的修改理由：service 不应该在模块加载时就绑定配置和 client，而应该在真正调用时再拿。
// 这样更符合你们现在已经定下来的“懒加载 / 按需初始化 / 配置统一收口”的总体架构。
// ABI 字段命名优先跟当前真实合约保持一致。
import { OnChainReview, CredentialSBT } from '../types/contract.types';

// 合约ABI（已删除所有mentorName相关参数）
export const CONTRACT_ABI = [
  // 读取用户是否持有SBT
  {
    inputs: [{ name: 'user', type: 'address' }],
    name: 'hasValidSBT',
    outputs: [{ name: '', type: 'bool' }],
    type: 'function',
    stateMutability: 'view',
  },
  // 读取用户的SBT信息
  {
    inputs: [{ name: 'user', type: 'address' }],
    name: 'getUserSBT',
    outputs: [
      { name: 'tokenId', type: 'uint256' },
      { name: 'companyName', type: 'string' },
      { name: 'verified', type: 'bool' },
      { name: 'mintTime', type: 'uint256' },
    ],
    type: 'function',
    stateMutability: 'view',
  },
  // 读取某公司的所有评价（仅保留公司参数）
  {
    inputs: [{ name: 'mentorCompany', type: 'string' }],
    name: 'getCompanyReviews',
    outputs: [
      {
        components: [
          { name: 'reviewer', type: 'address' },
          { name: 'mentorCompany', type: 'string' },
          { name: 'overallScore', type: 'uint8' },
          { name: 'ipfsCid', type: 'string' },
          { name: 'timestamp', type: 'uint256' },
        ],
        type: 'tuple[]',
      },
    ],
    type: 'function',
    stateMutability: 'view',
  },
  // 读取公司的评价总数（仅保留公司参数）
  {
    inputs: [{ name: 'mentorCompany', type: 'string' }],
    name: 'getCompanyReviewCount',
    outputs: [{ name: '', type: 'uint256' }],
    type: 'function',
    stateMutability: 'view',
  },
] as const;

export class ContractService {
  // 1. 验证用户是否持有有效的SBT凭证（不变）
  static async checkUserHasSBT(walletAddress: `0x${string}`): Promise<boolean> {
    try {
      const publicClient = getPublicClient();//易为新添
      const contractAddress = getContractAddress();//易为新添
      
      const hasSBT = await publicClient.readContract({
        address: contractAddress,
        abi: CONTRACT_ABI,
        functionName: 'hasValidSBT',
        args: [walletAddress],
      });
      return hasSBT;
    } catch (error) {
      console.error('SBT验证失败：', error);
      return false;
    }
  }

  // 2. 获取用户的SBT凭证信息（不变）
  static async getUserSBTInfo(walletAddress: `0x${string}`): Promise<CredentialSBT | null> {
    try {
      const publicClient = getPublicClient();//易为新添
      const contractAddress = getContractAddress();//易为新添
      
      const sbtInfo = await publicClient.readContract({
        address: contractAddress,
        abi: CONTRACT_ABI,
        functionName: 'getUserSBT',
        args: [walletAddress],
      });

      return {
        tokenId: sbtInfo[0],    // 第1个值：tokenId
        owner: walletAddress,
        companyName: sbtInfo[1], // 第2个值：companyName
        verified: sbtInfo[2],    // 第3个值：verified
        mintTime: sbtInfo[3],    // 第4个值：mintTime
      };
    } catch (error) {
      console.error('获取SBT信息失败：', error);
      return null;
    }
  }

  // 3. 获取某公司的所有链上评价（仅保留公司参数）
  static async getCompanyReviews(mentorCompany: string): Promise<OnChainReview[]> {
    try {
      const publicClient = getPublicClient();//易为新添
      const contractAddress = getContractAddress();//易为新添
      
      const reviews = await publicClient.readContract({
        address: contractAddress,
        abi: CONTRACT_ABI,
        functionName: 'getCompanyReviews',
        args: [mentorCompany],
      });

      return reviews as OnChainReview[];
    } catch (error) {
      console.error('获取公司评价失败：', error);
      return [];
    }
  }

  // 4. 获取公司的评价总数（仅保留公司参数）
  static async getCompanyReviewCount(mentorCompany: string): Promise<number> {
    try {
      const publicClient = getPublicClient();//易为新添
      const contractAddress = getContractAddress();//易为新添
      
      const count = await publicClient.readContract({
        address: contractAddress,
        abi: CONTRACT_ABI,
        functionName: 'getCompanyReviewCount',
        args: [mentorCompany],
      });

      return Number(count);
    } catch (error) {
      console.error('获取评价数量失败：', error);
      return 0;
    }
  }
}
