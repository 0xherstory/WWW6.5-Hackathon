/**
 * 合约地址配置
 * 部署后更新为真实地址
 */

// Hardhat 本地网络 (31337)
const HARDHAT_ADDRESSES = {
  // SanctuaryProtocolV2.sol - 资金池托管合约 v2.2
  SANCTUARY_PROTOCOL_V2: process.env.NEXT_PUBLIC_SANCTUARY_V2_ADDRESS_HARDHAT || "",
  
  // PlantOHCardPlugin.sol - 插件合约
  PLANT_OH_CARD_PLUGIN: process.env.NEXT_PUBLIC_PLUGIN_ADDRESS_HARDHAT || "",
};

// Avalanche Fuji Testnet (43113)
const FUJI_ADDRESSES = {
  // SanctuaryProtocolV2.sol - 资金池托管合约 v2.2
  // 部署地址: 0xc7df8398F5b6571883Fe75Be3B48CEE355b0dA28 (更新于 2026-04-02)
  SANCTUARY_PROTOCOL_V2: process.env.NEXT_PUBLIC_SANCTUARY_V2_ADDRESS_FUJI || "0xc7df8398F5b6571883Fe75Be3B48CEE355b0dA28",
  
  // PlantOHCardPlugin.sol - 插件合约 V2（降低最小日记长度到10字符）
  // 部署地址: 0xb2bD4E12aa38a9CbA65822bE3B35f49f30d5162B (更新于 2026-04-02)
  PLANT_OH_CARD_PLUGIN: process.env.NEXT_PUBLIC_PLUGIN_ADDRESS_FUJI || "0xb2bD4E12aa38a9CbA65822bE3B35f49f30d5162B",
  
  // 旧版合约（向后兼容）
  PLANT_OH_CARD: process.env.NEXT_PUBLIC_PLANT_OH_CARD_ADDRESS || "",
  SANCTUARY_PROTOCOL: process.env.NEXT_PUBLIC_SANCTUARY_ADDRESS || "",
};

// Avalanche Mainnet (43114)
const AVALANCHE_ADDRESSES = {
  // SanctuaryProtocolV2.sol - 资金池托管合约 v2.2
  SANCTUARY_PROTOCOL_V2: process.env.NEXT_PUBLIC_SANCTUARY_V2_ADDRESS || "",
  
  // PlantOHCardPlugin.sol - 插件合约
  PLANT_OH_CARD_PLUGIN: process.env.NEXT_PUBLIC_PLUGIN_ADDRESS || "",
  
  // 旧版合约（向后兼容）
  PLANT_OH_CARD: process.env.NEXT_PUBLIC_PLANT_OH_CARD_ADDRESS || "",
  SANCTUARY_PROTOCOL: process.env.NEXT_PUBLIC_SANCTUARY_ADDRESS || "",
};

export const CONTRACT_ADDRESSES = {
  ...FUJI_ADDRESSES,
  PLANT_OH_CARD: process.env.NEXT_PUBLIC_PLANT_OH_CARD_ADDRESS || "",
  SANCTUARY_PROTOCOL: process.env.NEXT_PUBLIC_SANCTUARY_ADDRESS || "",
} as const;

/**
 * 插件合约地址（按网络）
 */
export const PLUGIN_CONTRACTS = {
  // Hardhat 本地网络
  31337: {
    PLANT_OH_CARD_PLUGIN: HARDHAT_ADDRESSES.PLANT_OH_CARD_PLUGIN,
  },
  // Fuji Testnet
  43113: {
    PLANT_OH_CARD_PLUGIN: FUJI_ADDRESSES.PLANT_OH_CARD_PLUGIN,
  },
  // Avalanche Mainnet
  43114: {
    PLANT_OH_CARD_PLUGIN: AVALANCHE_ADDRESSES.PLANT_OH_CARD_PLUGIN,
  },
} as const;

/**
 * Sanctuary V2 合约地址（按网络）
 */
export const SANCTUARY_V2_CONTRACTS = {
  // Hardhat 本地网络
  31337: HARDHAT_ADDRESSES.SANCTUARY_PROTOCOL_V2,
  // Fuji Testnet
  43113: FUJI_ADDRESSES.SANCTUARY_PROTOCOL_V2,
  // Avalanche Mainnet
  43114: AVALANCHE_ADDRESSES.SANCTUARY_PROTOCOL_V2,
} as const;

/**
 * 获取当前网络的合约地址
 * @param chainId 链ID (31337 = Hardhat, 43113 = Avalanche Fuji Testnet, 43114 = Avalanche Mainnet)
 */
export function getPlantOHCardAddress(chainId?: number): string {
  return CONTRACT_ADDRESSES.PLANT_OH_CARD;
}

/**
 * 获取 Sanctuary V2 合约地址
 * @param chainId 链ID
 */
export function getSanctuaryAddress(chainId?: number): string {
  // 如果指定了链ID，返回对应网络的地址
  if (chainId && SANCTUARY_V2_CONTRACTS[chainId as keyof typeof SANCTUARY_V2_CONTRACTS]) {
    return SANCTUARY_V2_CONTRACTS[chainId as keyof typeof SANCTUARY_V2_CONTRACTS];
  }
  // 否则返回环境变量中的地址（向后兼容）
  return process.env.NEXT_PUBLIC_SANCTUARY_V2_ADDRESS || CONTRACT_ADDRESSES.SANCTUARY_PROTOCOL;
}

/**
 * 获取插件合约地址
 * @param chainId 链ID
 */
export function getPluginAddress(chainId?: number): string {
  if (chainId && PLUGIN_CONTRACTS[chainId as keyof typeof PLUGIN_CONTRACTS]) {
    return PLUGIN_CONTRACTS[chainId as keyof typeof PLUGIN_CONTRACTS].PLANT_OH_CARD_PLUGIN;
  }
  return PLUGIN_CONTRACTS[43113].PLANT_OH_CARD_PLUGIN; // 默认返回 Fuji 地址
}

/**
 * 链ID配置
 */
export const CHAIN_IDS = {
  HARDHAT: 31337,
  AVALANCHE_FUJI: 43113,
  AVALANCHE: 43114,
} as const;

/**
 * 网络配置
 */
export const NETWORKS = {
  [CHAIN_IDS.HARDHAT]: {
    name: "Hardhat Local",
    rpcUrl: "http://127.0.0.1:8545",
    nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  },
  [CHAIN_IDS.AVALANCHE_FUJI]: {
    name: "Avalanche Fuji Testnet",
    rpcUrl: "https://api.avax-test.network/ext/bc/C/rpc",
    nativeCurrency: { name: "Avalanche", symbol: "AVAX", decimals: 18 },
  },
  [CHAIN_IDS.AVALANCHE]: {
    name: "Avalanche C-Chain",
    rpcUrl: "https://api.avax.network/ext/bc/C/rpc",
    nativeCurrency: { name: "Avalanche", symbol: "AVAX", decimals: 18 },
  },
} as const;
