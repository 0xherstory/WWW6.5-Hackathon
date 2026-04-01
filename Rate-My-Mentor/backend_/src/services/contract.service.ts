import { getContractAddress, getPublicClient } from '../config/contract';
import { OnChainReview, CredentialSBT } from '../types/contract.types';

// 合约ABI，合约同学写好后替换这里的内容
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
  // 读取所有评价（按公司）
  {
    inputs: [{ name: 'companyName', type: 'string' }],
    name: 'getCompanyReviews',
    outputs: [
      {
        components: [
          { name: 'reviewer', type: 'address' },
          { name: 'companyName', type: 'string' },
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
  // 读取公司评价总数
  {
    inputs: [{ name: 'companyName', type: 'string' }],
    name: 'getCompanyReviewCount',
    outputs: [{ name: '', type: 'uint256' }],
    type: 'function',
    stateMutability: 'view',
  },
] as const;

export class ContractService {
  // 1. 验证用户是否持有有效的SBT凭证
  static async checkUserHasSBT(walletAddress: `0x${string}`): Promise<boolean> {
    try {
      const publicClient = getPublicClient();
      const CONTRACT_ADDRESS = getContractAddress();
      const hasSBT = await publicClient.readContract({
        address: CONTRACT_ADDRESS,
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

  // 2. 获取用户的SBT凭证信息
  static async getUserSBTInfo(walletAddress: `0x${string}`): Promise<CredentialSBT | null> {
    try {
      const publicClient = getPublicClient();
      const CONTRACT_ADDRESS = getContractAddress();
      const sbtInfo = await publicClient.readContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'getUserSBT',
        args: [walletAddress],
      });

      return {
        tokenId: sbtInfo.tokenId,
        owner: walletAddress,
        companyName: sbtInfo.companyName,
        verified: sbtInfo.verified,
        mintTime: sbtInfo.mintTime,
      };
    } catch (error) {
      console.error('获取SBT信息失败：', error);
      return null;
    }
  }

  // 3. 获取某个公司的所有链上评价
  static async getCompanyReviews(companyName: string): Promise<OnChainReview[]> {
    try {
      const publicClient = getPublicClient();
      const CONTRACT_ADDRESS = getContractAddress();
      const reviews = await publicClient.readContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'getCompanyReviews',
        args: [companyName],
      });

      return reviews as OnChainReview[];
    } catch (error) {
      console.error('获取公司评价失败：', error);
      return [];
    }
  }

  // 4. 获取公司的评价总数
  static async getCompanyReviewCount(companyName: string): Promise<number> {
    try {
      const publicClient = getPublicClient();
      const CONTRACT_ADDRESS = getContractAddress();
      const count = await publicClient.readContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'getCompanyReviewCount',
        args: [companyName],
      });

      return Number(count);
    } catch (error) {
      console.error('获取评价数量失败：', error);
      return 0;
    }
  }
}