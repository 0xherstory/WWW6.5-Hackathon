export const ESG_ORACLE_ADDRESS = process.env.NEXT_PUBLIC_ESG_ORACLE_ADDRESS ?? "";
export const REACTIVE_POLICY_ADDRESS = process.env.NEXT_PUBLIC_REACTIVE_POLICY_ADDRESS ?? "";
export const POLICY_EXECUTOR_ADDRESS = process.env.NEXT_PUBLIC_POLICY_EXECUTOR_ADDRESS ?? "";
export const REACTIVE_PORTFOLIO_ADDRESS = process.env.NEXT_PUBLIC_REACTIVE_PORTFOLIO_ADDRESS ?? "";
export const SEPOLIA_RPC_URL = process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL ?? "";
export const REACTIVE_RPC_URL = process.env.NEXT_PUBLIC_REACTIVE_RPC_URL ?? "";
export const SEPOLIA_EXPLORER_TX_BASE =
  process.env.NEXT_PUBLIC_SEPOLIA_EXPLORER_TX_BASE ?? "https://sepolia.etherscan.io/tx/";
export const REACTIVE_EXPLORER_TX_BASE =
  process.env.NEXT_PUBLIC_REACTIVE_EXPLORER_TX_BASE ?? "https://kopli.reactscan.net/tx/";

export const PROTOCOL_ADDRESS_BY_NAME: Record<string, string | undefined> = {
  GREEN: process.env.NEXT_PUBLIC_AQUALEND_ADDRESS,
  STEADY: process.env.NEXT_PUBLIC_GRIDVAULT_ADDRESS,
  RISKY: process.env.NEXT_PUBLIC_TERRASWAP_ADDRESS,
  USD: process.env.NEXT_PUBLIC_NORTHBRIDGE_ADDRESS,
  // legacy aliases kept for compatibility with older seeded names
  AquaLend: process.env.NEXT_PUBLIC_AQUALEND_ADDRESS,
  GridVault: process.env.NEXT_PUBLIC_GRIDVAULT_ADDRESS,
  TerraSwap: process.env.NEXT_PUBLIC_TERRASWAP_ADDRESS,
  NorthBridge: process.env.NEXT_PUBLIC_NORTHBRIDGE_ADDRESS
};

export const SEPOLIA_CHAIN_ID_HEX = "0xaa36a7";
export const SEPOLIA_CHAIN_ID_DEC = 11155111;
