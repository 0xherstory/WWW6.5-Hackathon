/**
 * 合约 ABI、地址（Day2 拿到合约后在此填写）
 * 与 wagmi `useReadContract` / `useWriteContract` 配合使用
 */

/**
 * Fuji (43113) 部署地址：来自
 * `contracts/ignition/deployments/chain-43113/deployed_addresses.json`
 */
export const internSbtAddress =
  "0x2ed074A8B95EC820578139713D02eD4A412E33B7" as const;
export const reviewContractAddress =
  "0x957ba3AEcCC6cd437e4206591BAe4624FC5a7a03" as const;

/**
 * 最小 ABI（只包含最小链路需要的方法）
 * - InternSBT: mintSBT / ownerOf / isValidCredential
 * - ReviewContract: submitReview / getReputationScore
 */
export const internSbtAbi = [
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
