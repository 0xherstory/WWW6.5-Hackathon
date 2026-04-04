// 链上评价数据结构（已删除导师姓名）
export interface OnChainReview {
  reviewer: `0x${string}`; // 评价者钱包地址
  mentorCompany: string;
  overallScore: number;
  ipfsCid: string;
  timestamp: bigint; // 上链时间
}

// SBT凭证信息
export interface CredentialSBT {
  tokenId: bigint;
  owner: `0x${string}`;
  companyName: string;
  verified: boolean;
  mintTime: bigint;
}