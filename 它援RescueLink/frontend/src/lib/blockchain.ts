/**
 * RescueLink Blockchain Service
 * Handles all Avalanche Fuji testnet interactions.
 *
 * Environment variables (set in Vercel / .env):
 *   VITE_AVALANCHE_FUJI_RPC_URL   – Avalanche Fuji RPC endpoint
 *   VITE_RESCUELINK_CONTRACT_ADDR – Deployed RescueLink contract address
 *
 * Chain ID: 43113 (Avalanche Fuji C-Chain testnet)
 */

import {
  createPublicClient,
  createWalletClient,
  http,
  custom,
  encodeFunctionData,
  keccak256,
  toBytes,
  type Hex,
} from 'viem';
import { avalancheFuji } from 'viem/chains';

// ─── Config ──────────────────────────────────────────────────────────
const RPC_URL =
  import.meta.env.VITE_AVALANCHE_FUJI_RPC_URL ||
  'https://api.avax-test.network/ext/bc/C/rpc';

const CONTRACT_ADDRESS: Hex =
  (import.meta.env.VITE_RESCUELINK_CONTRACT_ADDR as Hex) ||
  '0x0000000000000000000000000000000000000000';

// ─── ABI ─────────────────────────────────────────────────────────────
export const RESCUELINK_ABI = [
  {
    name: 'createCase',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'caseId', type: 'bytes32' },
      { name: 'metaHash', type: 'bytes32' },
    ],
    outputs: [],
  },
  {
    name: 'addUpdate',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'caseId', type: 'bytes32' },
      { name: 'updateHash', type: 'bytes32' },
      { name: 'updateType', type: 'string' },
    ],
    outputs: [],
  },
  // TODO: future functions
  // confirmService(bytes32 caseId, string serviceType, bytes32 receiptHash)
  // transferCase(bytes32 caseId, address newOwner)
  // redeemPoints(bytes32 redeemHash)
] as const;

// ─── Clients ─────────────────────────────────────────────────────────
export const publicClient = createPublicClient({
  chain: avalancheFuji,
  transport: http(RPC_URL),
});

// ─── Network Switching ───────────────────────────────────────────────

export const FUJI_CHAIN_ID = 43113;
export const FUJI_CHAIN_HEX = '0xa869';

/** Switch to Avalanche Fuji or add it to the wallet */
export async function switchNetwork() {
  const ethereum = window.ethereum;
  if (!ethereum) return;

  try {
    await ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: FUJI_CHAIN_HEX }],
    });
  } catch (switchError: any) {
    // 4902: chain not added to wallet
    if (switchError.code === 4902) {
      try {
        await ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId: FUJI_CHAIN_HEX,
              chainName: 'Avalanche Fuji Testnet',
              nativeCurrency: { name: 'AVAX', symbol: 'AVAX', decimals: 18 },
              rpcUrls: [RPC_URL],
              blockExplorerUrls: ['https://testnet.snowtrace.io/'],
            },
          ],
        });
      } catch (addError) {
        console.error('Could not add Fuji network', addError);
      }
    }
    console.error('Could not switch to Fuji network', switchError);
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────

/** Deterministic caseId from a unique off-chain identifier */
export function generateCaseId(uniqueString: string): Hex {
  return keccak256(toBytes(uniqueString));
}

/** Hash key metadata fields into a single bytes32 */
export function generateMetaHash(meta: {
  title: string;
  description: string;
  helpTypes: string[];
  contactVisibility: string;
  timestamp: number;
  city?: string;
  animalType?: string;
}): Hex {
  const raw = JSON.stringify(meta);
  return keccak256(toBytes(raw));
}

// ─── Contract interaction ────────────────────────────────────────────

export interface CreateCaseOnChainResult {
  txHash: string;
  caseIdBytes32: Hex;
  metaHashBytes32: Hex;
}

/**
 * Call createCase on-chain via browser wallet (MetaMask / Rabby etc.)
 * Falls back to a mock if no wallet or contract is not deployed yet.
 */
export async function createCaseOnChain(
  caseIdBytes32: Hex,
  metaHashBytes32: Hex,
): Promise<CreateCaseOnChainResult> {
  console.log('─── [Blockchain Debug: createCaseOnChain] ───');
  console.log('1. Contract Address from .env:', CONTRACT_ADDRESS);
  console.log('2. Parameters:', { caseIdBytes32, metaHashBytes32 });

  // Check if contract is correctly loaded from .env
  if (!CONTRACT_ADDRESS || CONTRACT_ADDRESS === '0x0000000000000000000000000000000000000000') {
    console.error('[blockchain] Error: Contract address is not set in .env or is zero address');
    throw new Error('合约地址未配置，请检查 .env 文件并重启 Vite 服务（npm run dev）');
  }

  const ethereum = window.ethereum;
  if (!ethereum) {
    console.error('[blockchain] Error: No wallet detected');
    throw new Error('未检测到钱包，请安装 MetaMask 或其他钱包');
  }

  // Ensure correct network
  console.log('3. Switching/Checking Network (Target: 43113)...');
  await switchNetwork();

  // 1. Get user accounts
  const accounts = await ethereum.request({ method: 'eth_requestAccounts' }) as string[];
  const account = accounts[0] as Hex;
  const currentChainId = await ethereum.request({ method: 'eth_chainId' });
  console.log('4. Current Wallet State:', { account, currentChainId });

  // 2. Setup wallet client with viem
  const walletClient = createWalletClient({
    account,
    chain: avalancheFuji,
    transport: custom(ethereum),
  });

  // 3. Send transaction using writeContract
  try {
    console.log('5. Executing writeContract: createCase...');
    const txHash = await walletClient.writeContract({
      address: CONTRACT_ADDRESS,
      abi: RESCUELINK_ABI,
      functionName: 'createCase',
      args: [caseIdBytes32, metaHashBytes32],
    });

    console.log('6. writeContract Success! TxHash:', txHash);
    return {
      txHash,
      caseIdBytes32,
      metaHashBytes32,
    };
  } catch (error: any) {
    console.error('❌ [blockchain] writeContract Failed!');
    console.error('Error Message:', error.message);
    console.error('Error Object:', error);
    
    // Check for common revert reasons
    if (error.message.includes('user rejected')) {
      throw new Error('用户取消了签名交易');
    } else if (error.message.includes('insufficient funds')) {
      throw new Error('账户余额不足以支付 Gas 费用（请在 Fuji Faucet 领取测试币）');
    } else if (error.message.includes('revert')) {
      throw new Error(`合约执行回退 (Revert): ${error.shortMessage || '请检查合约逻辑或参数'}`);
    }
    
    throw error;
  }
}

// ─── addUpdate on-chain ──────────────────────────────────────────────

export interface AddUpdateOnChainResult {
  txHash: string;
}

/**
 * Call addUpdate on-chain. Falls back to mock if contract not deployed.
 */
export async function addUpdateOnChain(
  caseIdBytes32: Hex,
  updateHashBytes32: Hex,
  updateType: string,
): Promise<AddUpdateOnChainResult> {
  if (!CONTRACT_ADDRESS || CONTRACT_ADDRESS === '0x0000000000000000000000000000000000000000') {
    throw new Error('合约地址未配置，请检查 .env 文件并重启服务');
  }

  const ethereum = window.ethereum;
  if (!ethereum) {
    throw new Error('未检测到钱包');
  }

  // Ensure correct network
  await switchNetwork();

  const [account] = await ethereum.request({ method: 'eth_requestAccounts' }) as string[];

  const walletClient = createWalletClient({
    account: account as Hex,
    chain: avalancheFuji,
    transport: custom(ethereum),
  });

  const txHash = await walletClient.writeContract({
    address: CONTRACT_ADDRESS,
    abi: RESCUELINK_ABI,
    functionName: 'addUpdate',
    args: [caseIdBytes32, updateHashBytes32, updateType],
  });

  return { txHash };
}
