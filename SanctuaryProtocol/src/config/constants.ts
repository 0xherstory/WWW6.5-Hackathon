export const APP_NAME = "植物系疗愈 OH 卡";
export const APP_DESCRIPTION = "在 Web3 的世界里，种下属于你的疗愈之树";

export const STORAGE_KEYS = {
  GUEST_MODE: "oh-card-guest-mode",
  DRAFT_JOURNAL: "oh-card-draft-journal",
  CARD_SELECTION: "oh-card-selection",
  WALLET_CONNECTED: "oh-card-wallet-connected",
} as const;

export const CHAIN_CONFIG = {
  chainId: 43113, // Avalanche Fuji Testnet
  chainName: "Avalanche Fuji",
  rpcUrl: process.env.NEXT_PUBLIC_RPC_URL || "https://api.avax-test.network/ext/bc/C/rpc",
  contractAddress: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "",
};

export const IPFS_CONFIG = {
  gateway: "https://amber-implicit-heron-963.mypinata.cloud/ipfs/",
  jwt: process.env.NEXT_PUBLIC_PINATA_JWT || "",
};

// 加密密钥 - 注意：生产环境应该使用钱包签名派生，而非环境变量
// 这是临时方案，后续会改为钱包签名派生
export const ENCRYPTION_KEY = process.env.NEXT_PUBLIC_ENCRYPTION_KEY || "";
