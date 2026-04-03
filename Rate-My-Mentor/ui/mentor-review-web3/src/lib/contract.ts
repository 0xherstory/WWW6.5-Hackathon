/**
 * 前端合约地址与 ABI 配置
 * 当前仅保留 MVP 主链路真实使用到的地址和方法
 * 网络：Avalanche Fuji (43113)
 */

export const internSbtAddress =
  "0x6eDE9DbCF9DfEDF9Bf2e59484874B760d0731f77" as const;

export const reviewContractAddress =
  "0x3845300491F10FC8C87694C5c8D7D62bFc12e1DC" as const;

export const REVIEW_CONTRACT_ADDRESS = reviewContractAddress;

/**
 * InternSBT 最小 ABI
 * 当前前端主链路会用到：
 * - mintSBT：身份验证后铸造 SBT
 * - ownerOf：查询 token owner
 * - isValidCredential：校验凭证是否有效
 */
export const internSbtAbi = [
  {
    type: "function",
    name: "balanceOf",
    stateMutability: "view",
    inputs: [{ name: "owner", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function",
    name: "mintSBT",
    stateMutability: "nonpayable",
    inputs: [
      { name: "_credentialId", type: "string" },
      { name: "_companyId", type: "string" },
      { name: "_credentialHash", type: "bytes32" },
      { name: "_expireTime", type: "uint256" },
      { name: "_signature", type: "bytes" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "ownerOf",
    stateMutability: "view",
    inputs: [{ name: "tokenId", type: "uint256" }],
    outputs: [{ name: "owner", type: "address" }],
  },
  {
    type: "function",
    name: "isValidCredential",
    stateMutability: "view",
    inputs: [{ name: "_tokenId", type: "uint256" }],
    outputs: [{ name: "", type: "bool" }],
  },
  {
    type: "event",
    name: "SBTMinted",
    inputs: [
      { name: "walletAddress", type: "address", indexed: true },
      { name: "tokenId", type: "uint256", indexed: true },
      { name: "credentialHash", type: "bytes32", indexed: true },
    ],
  },
] as const;

/**
 * ReviewContract 最小 ABI
 * 当前前端主链路会用到：
 * - submitReview：提交评价
 * - getReputationScore：读取目标声誉分
 */
export const reviewContractAbi = [
  {
    type: "function",
    name: "submitReview",
    stateMutability: "nonpayable",
    inputs: [
      { name: "_credentialId", type: "uint256" },
      { name: "_targetId", type: "bytes32" },
      { name: "_targetType", type: "string" },
      { name: "_overallScore", type: "uint8" },
      { name: "_dimScores", type: "uint8[5]" },
      { name: "_cid", type: "bytes32" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "getReputationScore",
    stateMutability: "view",
    inputs: [{ name: "_targetId", type: "bytes32" }],
    outputs: [{ name: "", type: "uint128" }],
  },
] as const;



// /**
//  * 合约 ABI 和地址配置
//  * 部署网络: Avalanche Fuji (chain-43113)
//  */

// // === 合约地址 ===
// export const INTERN_SBT_ADDRESS = "0x0F51f416471AD9678251b68948d1bEE72925822a";
// export const REVIEW_CONTRACT_ADDRESS = "0x3845300491F10FC8C87694C5c8D7D62bFc12e1DC";
// export const REVIEW_DAO_ADDRESS = "0x481D0fd5a05eEdc6971c165BBC2D2aB1a2Dce744";

// // === InternSBT ABI ===
// export const internSbtAbi = [
//   {
//     name: "ownerOf",
//     type: "function",
//     inputs: [{ name: "tokenId", type: "uint256" }],
//     outputs: [{ name: "", type: "address" }],
//     stateMutability: "view",
//   },
//   {
//     name: "isValidCredential",
//     type: "function",
//     inputs: [{ name: "", type: "uint256" }],
//     outputs: [{ name: "", type: "bool" }],
//     stateMutability: "view",
//   },
// ] as const;

// // === ReviewContract ABI ===
// export const reviewContractAbi = [
//   {
//     name: "submitReview",
//     type: "function",
//     inputs: [
//       { name: "_credentialId", type: "uint256" },
//       { name: "_targetId", type: "bytes32" },
//       { name: "_targetType", type: "string" },
//       { name: "_overallScore", type: "uint8" },
//       { name: "_dimScores", type: "uint8[5]" },
//       { name: "_cid", type: "bytes32" },
//     ],
//     outputs: [],
//     stateMutability: "nonpayable",
//   },
//   {
//     name: "updateReviewStatus",
//     type: "function",
//     inputs: [
//       { name: "_reviewId", type: "uint256" },
//       { name: "_newStatus", type: "uint8" },
//     ],
//     outputs: [],
//     stateMutability: "nonpayable",
//   },
//   {
//     name: "getReputationScore",
//     type: "function",
//     inputs: [{ name: "_targetId", type: "bytes32" }],
//     outputs: [{ name: "", type: "uint128" }],
//     stateMutability: "view",
//   },
//   {
//     name: "reviews",
//     type: "function",
//     inputs: [{ name: "", type: "uint256" }],
//     outputs: [
//       { name: "credentialId", type: "uint256" },
//       { name: "targetId", type: "bytes32" },
//       { name: "cid", type: "bytes32" },
//       { name: "createdAt", type: "uint32" },
//       { name: "status", type: "uint8" },
//       { name: "overallScore", type: "uint8" },
//       { name: "growthScore", type: "uint8" },
//       { name: "clarityScore", type: "uint8" },
//       { name: "communicationScore", type: "uint8" },
//       { name: "workloadScore", type: "uint8" },
//       { name: "respectScore", type: "uint8" },
//     ],
//     stateMutability: "view",
//   },
//   {
//     name: "targetStats",
//     type: "function",
//     inputs: [{ name: "", type: "bytes32" }],
//     outputs: [
//       { name: "totalScore", type: "uint128" },
//       { name: "reviewCount", type: "uint128" },
//     ],
//     stateMutability: "view",
//   },
//   {
//     name: "hasReviewed",
//     type: "function",
//     inputs: [
//       { name: "", type: "uint256" },
//       { name: "", type: "bytes32" },
//     ],
//     outputs: [{ name: "", type: "bool" }],
//     stateMutability: "view",
//   },
// ] as const;

// // === ReviewDAO ABI ===
// export const reviewDaoAbi = [] as const;
