import { getPublicClient, getWalletClient } from '@wagmi/core';
import { formatEther, parseEther, type Address } from 'viem';
import { getSanctuaryAddress, getPluginAddress, PLUGIN_CONTRACTS } from '@/config/contracts';
import { wagmiConfig } from '@/lib/web3/wagmi';

// 导出插件合约地址
export { PLUGIN_CONTRACTS };

// 全局链ID存储（由前端组件通过 useChainId() 设置）
let currentChainId: number | undefined = undefined;

/**
 * 设置当前链ID（应由 React 组件调用）
 * 用于解决 getPublicClient 返回的是 config 第一个链而非用户连接链的问题
 */
export function setCurrentChainId(chainId: number | undefined) {
  currentChainId = chainId;
}

/**
 * 获取当前链ID
 * 优先使用通过 setCurrentChainId 设置的值，fallback 到 getPublicClient
 */
function getCurrentChainId(): number | undefined {
  // 如果已通过 setCurrentChainId 设置，优先使用
  if (currentChainId !== undefined) {
    return currentChainId;
  }
  
  // Fallback：尝试从 publicClient 获取（可能不准确）
  try {
    const publicClient = getPublicClient(wagmiConfig);
    return publicClient?.chain?.id;
  } catch {
    return undefined;
  }
}

/**
 * SanctuaryProtocolV2 完整 ABI
 * �?artifacts/contracts/SanctuaryProtocolV2.sol/SanctuaryProtocolV2.json 提取
 */
export const SANCTUARY_V2_ABI = [
  // ===== 事件 =====
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'address', name: 'recipient', type: 'address' },
      { indexed: false, internalType: 'uint256', name: 'amount', type: 'uint256' },
      { indexed: false, internalType: 'uint256', name: 'timestamp', type: 'uint256' },
    ],
    name: 'Claimed',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'address', name: 'donor', type: 'address' },
      { indexed: false, internalType: 'uint256', name: 'amount', type: 'uint256' },
      { indexed: false, internalType: 'uint256', name: 'timestamp', type: 'uint256' },
    ],
    name: 'Donated',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'bytes32', name: 'emailHash', type: 'bytes32' },
      { indexed: false, internalType: 'address', name: 'wallet', type: 'address' },
      { indexed: false, internalType: 'uint256', name: 'timestamp', type: 'uint256' },
    ],
    name: 'EmailVerified',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [{ indexed: false, internalType: 'bool', name: 'enabled', type: 'bool' }],
    name: 'EmergencyModeToggled',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [{ indexed: true, internalType: 'address', name: 'guardian', type: 'address' }],
    name: 'GuardianAdded',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [{ indexed: true, internalType: 'address', name: 'guardian', type: 'address' }],
    name: 'GuardianRemoved',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'address', name: 'plugin', type: 'address' },
      { indexed: true, internalType: 'address', name: 'user', type: 'address' },
      { indexed: false, internalType: 'uint256', name: 'amount', type: 'uint256' },
    ],
    name: 'PluginPayout',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'address', name: 'plugin', type: 'address' },
      { indexed: false, internalType: 'uint256', name: 'allowance', type: 'uint256' },
    ],
    name: 'PluginRegistered',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'address', name: 'plugin', type: 'address' },
      { indexed: true, internalType: 'address', name: 'auditor', type: 'address' },
    ],
    name: 'PluginSubmitted',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [{ indexed: true, internalType: 'address', name: 'plugin', type: 'address' }],
    name: 'PluginSuspended',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'bytes32', name: 'proposalHash', type: 'bytes32' },
      { indexed: true, internalType: 'address', name: 'guardian', type: 'address' },
    ],
    name: 'ProposalApproved',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'bytes32', name: 'proposalHash', type: 'bytes32' },
      { indexed: true, internalType: 'address', name: 'creator', type: 'address' },
    ],
    name: 'ProposalCreated',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [{ indexed: true, internalType: 'bytes32', name: 'proposalHash', type: 'bytes32' }],
    name: 'ProposalExecuted',
    type: 'event',
  },

  // ===== 常量 =====
  {
    inputs: [],
    name: 'RESERVE_RATIO',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'VERIFICATION_VALIDITY',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'VERSION',
    outputs: [{ internalType: 'string', name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function',
  },

  // ===== 核心功能：捐�?=====
  {
    inputs: [],
    name: 'donate',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },

  // ===== 核心功能：邮箱验证领�?=====
  {
    inputs: [
      { internalType: 'bytes32', name: 'emailHash', type: 'bytes32' },
      { internalType: 'address', name: 'wallet', type: 'address' },
    ],
    name: 'verifyEmail',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'bytes32', name: 'emailHash', type: 'bytes32' }],
    name: 'claimWithEmailVerification',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },

  // ===== 核心功能：插件系�?=====
  {
    inputs: [
      { internalType: 'address', name: 'plugin', type: 'address' },
      { internalType: 'address', name: 'auditor', type: 'address' },
    ],
    name: 'submitPlugin',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'plugin', type: 'address' }],
    name: 'confirmAudit',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'plugin', type: 'address' }],
    name: 'registerPlugin',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'plugin', type: 'address' }],
    name: 'suspendPlugin',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'user', type: 'address' },
      { internalType: 'uint256', name: 'amount', type: 'uint256' },
    ],
    name: 'pluginRequestPayout',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },

  // ===== 多签治理 =====
  {
    inputs: [
      { internalType: 'bytes', name: 'callData', type: 'bytes' },
      { internalType: 'address', name: 'target', type: 'address' },
      { internalType: 'uint256', name: 'value', type: 'uint256' },
    ],
    name: 'createProposal',
    outputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'bytes32', name: 'proposalHash', type: 'bytes32' }],
    name: 'approveProposal',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'bytes32', name: 'proposalHash', type: 'bytes32' }],
    name: 'executeProposal',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'newGuardian', type: 'address' }],
    name: 'addGuardian',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'guardian', type: 'address' }],
    name: 'removeGuardian',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },

  // ===== 管理员功�?=====
  {
    inputs: [{ internalType: 'uint256', name: 'newPeriod', type: 'uint256' }],
    name: 'setSandboxPeriod',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'plugin', type: 'address' },
      { internalType: 'uint256', name: 'allowance', type: 'uint256' },
    ],
    name: 'setPluginAllowance',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'toggleEmergencyMode',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'newGuardian', type: 'address' }],
    name: 'setPauseGuardian',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: 'amount', type: 'uint256' }],
    name: 'emergencyWithdrawReserve',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'pause',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'unpause',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },

  // ===== UUPS 升级 =====
  {
    inputs: [
      { internalType: 'address', name: 'newImplementation', type: 'address' },
      { internalType: 'bytes', name: 'data', type: 'bytes' },
    ],
    name: 'upgradeToAndCall',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },

  // ===== 查询函数 =====
  {
    inputs: [],
    name: 'getDynamicClaimAmount',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getPoolStatus',
    outputs: [
      { internalType: 'uint256', name: 'balance', type: 'uint256' },
      { internalType: 'uint256', name: 'reserveAmount', type: 'uint256' },
      { internalType: 'uint256', name: 'available', type: 'uint256' },
      { internalType: 'uint256', name: 'donationCount', type: 'uint256' },
      { internalType: 'uint256', name: 'claimCount', type: 'uint256' },
      { internalType: 'uint256', name: 'currentClaimAmount', type: 'uint256' },
      { internalType: 'string', name: 'mode', type: 'string' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getGuardians',
    outputs: [{ internalType: 'address[]', name: '', type: 'address[]' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getGuardianCount',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getPluginCount',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'account', type: 'address' }],
    name: 'isDonor',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: '', type: 'address' }],
    name: 'hasClaimed',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: '', type: 'address' }],
    name: 'totalDonated',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'poolBalance',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'sandboxPeriod',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'initialPluginAllowance',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'emergencyMode',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'requiredApprovals',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'paused',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'owner',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'pauseGuardian',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: '', type: 'address' }],
    name: 'isGuardian',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }],
    name: 'emailVerificationTime',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }],
    name: 'emailToWallet',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }],
    name: 'emailHashUsed',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    name: 'donations',
    outputs: [
      { internalType: 'address', name: 'donor', type: 'address' },
      { internalType: 'uint256', name: 'amount', type: 'uint256' },
      { internalType: 'uint256', name: 'timestamp', type: 'uint256' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    name: 'claims',
    outputs: [
      { internalType: 'address', name: 'recipient', type: 'address' },
      { internalType: 'uint256', name: 'amount', type: 'uint256' },
      { internalType: 'uint256', name: 'timestamp', type: 'uint256' },
      { internalType: 'bytes32', name: 'emailHash', type: 'bytes32' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: '', type: 'address' }],
    name: 'plugins',
    outputs: [
      { internalType: 'enum PluginType', name: 'pluginType', type: 'uint8' },
      { internalType: 'enum SanctuaryProtocolV2.PluginStatus', name: 'status', type: 'uint8' },
      { internalType: 'uint256', name: 'allowance', type: 'uint256' },
      { internalType: 'uint256', name: 'spentToday', type: 'uint256' },
      { internalType: 'uint256', name: 'lastPayoutReset', type: 'uint256' },
      { internalType: 'address', name: 'auditor', type: 'address' },
      { internalType: 'uint256', name: 'registeredAt', type: 'uint256' },
      { internalType: 'uint256', name: 'sandboxEnd', type: 'uint256' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    name: 'pluginList',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }],
    name: 'proposals',
    outputs: [
      { internalType: 'bytes32', name: 'proposalHash', type: 'bytes32' },
      { internalType: 'address', name: 'target', type: 'address' },
      { internalType: 'bytes', name: 'callData', type: 'bytes' },
      { internalType: 'uint256', name: 'value', type: 'uint256' },
      { internalType: 'uint256', name: 'createdAt', type: 'uint256' },
      { internalType: 'uint256', name: 'executedAt', type: 'uint256' },
      { internalType: 'uint256', name: 'approvalCount', type: 'uint256' },
      { internalType: 'bool', name: 'executed', type: 'bool' },
    ],
    stateMutability: 'view',
    type: 'function',
  },

  // ===== receive =====
  { stateMutability: 'payable', type: 'receive' },
] as const;

// ===== 类型定义 =====

export interface PoolStatus {
  balance: string;
  reserveAmount: string;
  available: string;
  donationCount: number;
  claimCount: number;
  currentClaimAmount: string;
  mode: 'emergency' | 'low' | 'conservative' | 'normal';
  isSufficient: boolean;
}

export interface PluginInfo {
  pluginType: number;
  status: number;
  allowance: bigint;
  spentToday: bigint;
  lastPayoutReset: bigint;
  auditor: Address;
  registeredAt: bigint;
  sandboxEnd: bigint;
}

export interface ProposalInfo {
  proposalHash: `0x${string}`;
  target: Address;
  callData: `0x${string}`;
  value: bigint;
  createdAt: bigint;
  executedAt: bigint;
  approvalCount: bigint;
  executed: boolean;
}

export interface DonationInfo {
  donor: Address;
  amount: bigint;
  timestamp: bigint;
}

export interface ClaimInfo {
  recipient: Address;
  amount: bigint;
  timestamp: bigint;
  emailHash: `0x${string}`;
}

// 插件状态枚�?
export enum PluginStatus {
  NONE = 0,
  PENDING_AUDIT = 1,
  IN_SANDBOX = 2,
  ACTIVE = 3,
  SUSPENDED = 4,
  DEPRECATED = 5,
}

// 插件类型枚举
export enum PluginType {
  SELF_HELP = 0,
  HUMAN_SERVICE = 1,
  HYBRID = 2,
}

const MIN_CLAIM_AMOUNT = parseEther('0.01');

// ===== 查询函数 =====

/**
 * 获取资金池状�?
 */
export async function getPoolStatus(): Promise<PoolStatus> {
  try {
    const publicClient = getPublicClient(wagmiConfig);
    const chainId = getCurrentChainId();
    const sanctuaryAddress = getSanctuaryAddress(chainId) as Address;

    if (!sanctuaryAddress) {
      return {
        balance: '0',
        reserveAmount: '0',
        available: '0',
        donationCount: 0,
        claimCount: 0,
        currentClaimAmount: '0',
        mode: 'emergency',
        isSufficient: false,
      };
    }

    const status = await publicClient.readContract({
      address: sanctuaryAddress,
      abi: SANCTUARY_V2_ABI,
      functionName: 'getPoolStatus',
    }) as [bigint, bigint, bigint, bigint, bigint, bigint, string];

    const available = parseFloat(formatEther(status[2]));

    return {
      balance: formatEther(status[0]),
      reserveAmount: formatEther(status[1]),
      available: formatEther(status[2]),
      donationCount: Number(status[3]),
      claimCount: Number(status[4]),
      currentClaimAmount: formatEther(status[5]),
      mode: status[6] as PoolStatus['mode'],
      isSufficient: available > 0,
    };
  } catch (error) {
    console.error('Failed to fetch pool status:', error);
    return {
      balance: '0',
      reserveAmount: '0',
      available: '0',
      donationCount: 0,
      claimCount: 0,
      currentClaimAmount: '0',
      mode: 'emergency',
      isSufficient: false,
    };
  }
}

/**
 * 检查邮箱是否已领取
 */
export async function hasEmailClaimed(emailHash: `0x${string}`): Promise<boolean> {
  try {
    const publicClient = getPublicClient(wagmiConfig);
    const chainId = getCurrentChainId();
    const sanctuaryAddress = getSanctuaryAddress(chainId) as Address;

    if (!sanctuaryAddress) return false;

    const claimed = await publicClient.readContract({
      address: sanctuaryAddress,
      abi: SANCTUARY_V2_ABI,
      functionName: 'emailHashUsed',
      args: [emailHash],
    });

    return Boolean(claimed);
  } catch (error) {
    console.error('Failed to check email claim status:', error);
    return false;
  }
}

/**
 * 检查地址是否是捐赠者
 */
export async function isDonor(address: Address): Promise<boolean> {
  try {
    const publicClient = getPublicClient(wagmiConfig);
    const chainId = getCurrentChainId();
    const sanctuaryAddress = getSanctuaryAddress(chainId) as Address;

    if (!sanctuaryAddress) return false;

    return await publicClient.readContract({
      address: sanctuaryAddress,
      abi: SANCTUARY_V2_ABI,
      functionName: 'isDonor',
      args: [address],
    }) as boolean;
  } catch (error) {
    console.error('Failed to check donor status:', error);
    return false;
  }
}

/**
 * 检查地址是否已领�? */
export async function hasAddressClaimed(address: Address): Promise<boolean> {
  try {
    const publicClient = getPublicClient(wagmiConfig);
    const chainId = getCurrentChainId();
    const sanctuaryAddress = getSanctuaryAddress(chainId) as Address;

    if (!sanctuaryAddress) return false;

    return await publicClient.readContract({
      address: sanctuaryAddress,
      abi: SANCTUARY_V2_ABI,
      functionName: 'hasClaimed',
      args: [address],
    }) as boolean;
  } catch (error) {
    console.error('Failed to check address claim status:', error);
    return false;
  }
}

/**
 * 获取动态领取金�? */
export async function getDynamicClaimAmount(): Promise<string> {
  try {
    const publicClient = getPublicClient(wagmiConfig);
    const chainId = getCurrentChainId();
    const sanctuaryAddress = getSanctuaryAddress(chainId) as Address;

    if (!sanctuaryAddress) return '0';

    const amount = await publicClient.readContract({
      address: sanctuaryAddress,
      abi: SANCTUARY_V2_ABI,
      functionName: 'getDynamicClaimAmount',
    }) as bigint;

    return formatEther(amount);
  } catch (error) {
    console.error('Failed to get dynamic claim amount:', error);
    return '0';
  }
}

/**
 * 获取插件信息
 */
export async function getPluginInfo(pluginAddress: Address): Promise<PluginInfo | null> {
  try {
    const publicClient = getPublicClient(wagmiConfig);
    const chainId = getCurrentChainId();
    const sanctuaryAddress = getSanctuaryAddress(chainId) as Address;

    if (!sanctuaryAddress) return null;

    const info = await publicClient.readContract({
      address: sanctuaryAddress,
      abi: SANCTUARY_V2_ABI,
      functionName: 'plugins',
      args: [pluginAddress],
    }) as [number, number, bigint, bigint, bigint, Address, bigint, bigint];

    return {
      pluginType: info[0],
      status: info[1],
      allowance: info[2],
      spentToday: info[3],
      lastPayoutReset: info[4],
      auditor: info[5],
      registeredAt: info[6],
      sandboxEnd: info[7],
    };
  } catch (error) {
    console.error('Failed to get plugin info:', error);
    return null;
  }
}

/**
 * 获取守护者列�? */
export async function getGuardians(): Promise<Address[]> {
  try {
    const publicClient = getPublicClient(wagmiConfig);
    const chainId = getCurrentChainId();
    const sanctuaryAddress = getSanctuaryAddress(chainId) as Address;

    if (!sanctuaryAddress) return [];

    return await publicClient.readContract({
      address: sanctuaryAddress,
      abi: SANCTUARY_V2_ABI,
      functionName: 'getGuardians',
    }) as Address[];
  } catch (error) {
    console.error('Failed to get guardians:', error);
    return [];
  }
}

/**
 * 获取提案信息
 */
export async function getProposalInfo(proposalHash: `0x${string}`): Promise<ProposalInfo | null> {
  try {
    const publicClient = getPublicClient(wagmiConfig);
    const chainId = getCurrentChainId();
    const sanctuaryAddress = getSanctuaryAddress(chainId) as Address;

    if (!sanctuaryAddress) return null;

    const info = await publicClient.readContract({
      address: sanctuaryAddress,
      abi: SANCTUARY_V2_ABI,
      functionName: 'proposals',
      args: [proposalHash],
    }) as [`0x${string}`, Address, `0x${string}`, bigint, bigint, bigint, bigint, boolean];

    return {
      proposalHash: info[0],
      target: info[1],
      callData: info[2],
      value: info[3],
      createdAt: info[4],
      executedAt: info[5],
      approvalCount: info[6],
      executed: info[7],
    };
  } catch (error) {
    console.error('Failed to get proposal info:', error);
    return null;
  }
}

// ===== 写入函数 =====

/**
 * 捐赠
 */
export async function donate(amount: string): Promise<`0x${string}` | null> {
  try {
    const walletClient = await getWalletClient(wagmiConfig);
    const publicClient = getPublicClient(wagmiConfig);
    const chainId = getCurrentChainId();
    const sanctuaryAddress = getSanctuaryAddress(chainId) as Address;

    if (!sanctuaryAddress || !walletClient || !publicClient) return null;

    const hash = await walletClient.writeContract({
      address: sanctuaryAddress,
      abi: SANCTUARY_V2_ABI,
      functionName: 'donate',
      value: parseEther(amount),
      chain: publicClient.chain,
    });

    return hash;
  } catch (error) {
    console.error('Failed to donate:', error);
    return null;
  }
}

/**
 * 在链上验证邮箱（管理员功能）
 */
export async function verifyEmail(
  emailHash: `0x${string}`,
  wallet: Address
): Promise<`0x${string}` | null> {
  try {
    const walletClient = await getWalletClient(wagmiConfig);
    const publicClient = getPublicClient(wagmiConfig);
    const chainId = getCurrentChainId();
    const sanctuaryAddress = getSanctuaryAddress(chainId) as Address;

    if (!sanctuaryAddress || !walletClient || !publicClient) return null;

    const hash = await walletClient.writeContract({
      address: sanctuaryAddress,
      abi: SANCTUARY_V2_ABI,
      functionName: 'verifyEmail',
      args: [emailHash, wallet],
      chain: publicClient.chain,
    });

    return hash;
  } catch (error) {
    console.error('Failed to verify email:', error);
    return null;
  }
}

/**
 * 使用邮箱验证领取援助
 */
export async function claimWithEmailVerification(
  emailHash: `0x${string}`
): Promise<`0x${string}` | null> {
  try {
    const walletClient = await getWalletClient(wagmiConfig);
    const publicClient = getPublicClient(wagmiConfig);
    const chainId = getCurrentChainId();
    const sanctuaryAddress = getSanctuaryAddress(chainId) as Address;

    if (!sanctuaryAddress || !walletClient || !publicClient) return null;

    const hash = await walletClient.writeContract({
      address: sanctuaryAddress,
      abi: SANCTUARY_V2_ABI,
      functionName: 'claimWithEmailVerification',
      args: [emailHash],
      chain: publicClient.chain,
    });

    return hash;
  } catch (error) {
    console.error('Failed to claim aid:', error);
    return null;
  }
}

/**
 * 提交插件审核
 */
export async function submitPlugin(
  plugin: Address,
  auditor: Address
): Promise<`0x${string}` | null> {
  try {
    const walletClient = await getWalletClient(wagmiConfig);
    const publicClient = getPublicClient(wagmiConfig);
    const chainId = getCurrentChainId();
    const sanctuaryAddress = getSanctuaryAddress(chainId) as Address;

    if (!sanctuaryAddress || !walletClient || !publicClient) return null;

    const hash = await walletClient.writeContract({
      address: sanctuaryAddress,
      abi: SANCTUARY_V2_ABI,
      functionName: 'submitPlugin',
      args: [plugin, auditor],
      chain: publicClient.chain,
    });

    return hash;
  } catch (error) {
    console.error('Failed to submit plugin:', error);
    return null;
  }
}

/**
 * 确认审计
 */
export async function confirmAudit(plugin: Address): Promise<`0x${string}` | null> {
  try {
    const walletClient = await getWalletClient(wagmiConfig);
    const publicClient = getPublicClient(wagmiConfig);
    const chainId = getCurrentChainId();
    const sanctuaryAddress = getSanctuaryAddress(chainId) as Address;

    if (!sanctuaryAddress || !walletClient || !publicClient) return null;

    const hash = await walletClient.writeContract({
      address: sanctuaryAddress,
      abi: SANCTUARY_V2_ABI,
      functionName: 'confirmAudit',
      args: [plugin],
      chain: publicClient.chain,
    });

    return hash;
  } catch (error) {
    console.error('Failed to confirm audit:', error);
    return null;
  }
}

/**
 * 注册插件
 */
export async function registerPlugin(plugin: Address): Promise<`0x${string}` | null> {
  try {
    const walletClient = await getWalletClient(wagmiConfig);
    const publicClient = getPublicClient(wagmiConfig);
    const chainId = getCurrentChainId();
    const sanctuaryAddress = getSanctuaryAddress(chainId) as Address;

    if (!sanctuaryAddress || !walletClient || !publicClient) return null;

    const hash = await walletClient.writeContract({
      address: sanctuaryAddress,
      abi: SANCTUARY_V2_ABI,
      functionName: 'registerPlugin',
      args: [plugin],
      chain: publicClient.chain,
    });

    return hash;
  } catch (error) {
    console.error('Failed to register plugin:', error);
    return null;
  }
}

/**
 * 暂停插件
 */
export async function suspendPlugin(plugin: Address): Promise<`0x${string}` | null> {
  try {
    const walletClient = await getWalletClient(wagmiConfig);
    const publicClient = getPublicClient(wagmiConfig);
    const chainId = getCurrentChainId();
    const sanctuaryAddress = getSanctuaryAddress(chainId) as Address;

    if (!sanctuaryAddress || !walletClient || !publicClient) return null;

    const hash = await walletClient.writeContract({
      address: sanctuaryAddress,
      abi: SANCTUARY_V2_ABI,
      functionName: 'suspendPlugin',
      args: [plugin],
      chain: publicClient.chain,
    });

    return hash;
  } catch (error) {
    console.error('Failed to suspend plugin:', error);
    return null;
  }
}

/**
 * 创建多签提案
 */
export async function createProposal(
  callData: `0x${string}`,
  target: Address,
  value: bigint
): Promise<`0x${string}` | null> {
  try {
    const walletClient = await getWalletClient(wagmiConfig);
    const publicClient = getPublicClient(wagmiConfig);
    const chainId = getCurrentChainId();
    const sanctuaryAddress = getSanctuaryAddress(chainId) as Address;

    if (!sanctuaryAddress || !walletClient || !publicClient) return null;

    const hash = await walletClient.writeContract({
      address: sanctuaryAddress,
      abi: SANCTUARY_V2_ABI,
      functionName: 'createProposal',
      args: [callData, target, value],
      chain: publicClient.chain,
    });

    return hash;
  } catch (error) {
    console.error('Failed to create proposal:', error);
    return null;
  }
}

/**
 * 批准提案
 */
export async function approveProposal(
  proposalHash: `0x${string}`
): Promise<`0x${string}` | null> {
  try {
    const walletClient = await getWalletClient(wagmiConfig);
    const publicClient = getPublicClient(wagmiConfig);
    const chainId = getCurrentChainId();
    const sanctuaryAddress = getSanctuaryAddress(chainId) as Address;

    if (!sanctuaryAddress || !walletClient || !publicClient) return null;

    const hash = await walletClient.writeContract({
      address: sanctuaryAddress,
      abi: SANCTUARY_V2_ABI,
      functionName: 'approveProposal',
      args: [proposalHash],
      chain: publicClient.chain,
    });

    return hash;
  } catch (error) {
    console.error('Failed to approve proposal:', error);
    return null;
  }
}

/**
 * 执行提案
 */
export async function executeProposal(
  proposalHash: `0x${string}`
): Promise<`0x${string}` | null> {
  try {
    const walletClient = await getWalletClient(wagmiConfig);
    const publicClient = getPublicClient(wagmiConfig);
    const chainId = getCurrentChainId();
    const sanctuaryAddress = getSanctuaryAddress(chainId) as Address;

    if (!sanctuaryAddress || !walletClient || !publicClient) return null;

    const hash = await walletClient.writeContract({
      address: sanctuaryAddress,
      abi: SANCTUARY_V2_ABI,
      functionName: 'executeProposal',
      args: [proposalHash],
      chain: publicClient.chain,
    });

    return hash;
  } catch (error) {
    console.error('Failed to execute proposal:', error);
    return null;
  }
}

// ===== 向后兼容的函数（v2.1 兼容层）=====

/**
 * @deprecated 使用 donate() 替代
 * 旧的捐赠函数（兼�?v2.1�?
 */
export async function donateAndMint(cardId: number, amount: string): Promise<string | null> {
  console.warn('donateAndMint is deprecated, use donate instead');
  const result = await donate(amount);
  return result;
}

/**
 * @deprecated 使用 claimWithEmailVerification() 替代
 * 旧的领取函数（兼�?v2.1�?
 */
export async function claimAid(emailHash: `0x${string}`): Promise<string | null> {
  console.warn('claimAid is deprecated, use claimWithEmailVerification instead');
  const result = await claimWithEmailVerification(emailHash);
  return result;
}

/**
 * @deprecated 使用 verifyEmail() 替代
 * 旧的邮箱验证函数（兼�?v2.1�?
 */
export async function verifyEmailOnChain(emailHash: `0x${string}`): Promise<string | null> {
  console.warn('verifyEmailOnChain is deprecated, use verifyEmail instead');
  // 需�?wallet 参数，这里无法直接兼�?
  console.error('verifyEmailOnChain requires wallet address parameter in v2.2');
  return null;
}
