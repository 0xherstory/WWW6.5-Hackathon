import { getPublicClient, getWalletClient } from '@wagmi/core';
import { formatEther, parseEther, type Address } from 'viem';
import { wagmiConfig } from '@/lib/web3/wagmi';

/**
 * PlantOHCardPlugin 完整 ABI
 * 从 artifacts/contracts/plugins/PlantOHCardPlugin.sol/PlantOHCardPlugin.json 提取
 */
export const PLANT_OH_CARD_PLUGIN_ABI = [
  // ===== 事件 =====
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'address', name: 'user', type: 'address' },
      { indexed: false, internalType: 'string', name: 'activityType', type: 'string' },
      { indexed: false, internalType: 'bytes32', name: 'proofHash', type: 'bytes32' },
    ],
    name: 'ActivityRecorded',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'address', name: 'user', type: 'address' },
      { indexed: false, internalType: 'uint256[]', name: 'cardIds', type: 'uint256[]' },
      { indexed: false, internalType: 'bytes32', name: 'journalHash', type: 'bytes32' },
      { indexed: false, internalType: 'uint256', name: 'duration', type: 'uint256' },
    ],
    name: 'HealingCompleted',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'address', name: 'previousOwner', type: 'address' },
      { indexed: true, internalType: 'address', name: 'newOwner', type: 'address' },
    ],
    name: 'OwnershipTransferred',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'address', name: 'oldProtocol', type: 'address' },
      { indexed: true, internalType: 'address', name: 'newProtocol', type: 'address' },
    ],
    name: 'ProtocolUpdated',
    type: 'event',
  },

  // ===== 常量 =====
  {
    inputs: [],
    name: 'MIN_HEALING_DURATION',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'MIN_JOURNAL_LENGTH',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },

  // ===== 核心功能 =====
  {
    inputs: [
      { internalType: 'uint256', name: 'cardCount', type: 'uint256' },
      { internalType: 'uint256', name: 'duration', type: 'uint256' },
      { internalType: 'uint256', name: 'journalLength', type: 'uint256' },
    ],
    name: 'calculatePayout',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'pure',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint256[]', name: 'cardIds', type: 'uint256[]' },
      { internalType: 'bytes32', name: 'journalHash', type: 'bytes32' },
      { internalType: 'uint256', name: 'duration', type: 'uint256' },
      { internalType: 'uint256', name: 'journalLength', type: 'uint256' },
    ],
    name: 'completeHealingAndRequestPayout',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'bytes', name: 'data', type: 'bytes' }],
    name: 'decodeProof',
    outputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }],
    stateMutability: 'pure',
    type: 'function',
  },

  // ===== ISanctuaryPlugin 实现 =====
  {
    inputs: [],
    name: 'getPluginInfo',
    outputs: [
      { internalType: 'string', name: 'name', type: 'string' },
      { internalType: 'string', name: 'version', type: 'string' },
      { internalType: 'enum PluginType', name: 'pluginType', type: 'uint8' },
      { internalType: 'string', name: 'description', type: 'string' },
    ],
    stateMutability: 'pure',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'user', type: 'address' },
      { internalType: 'bytes', name: 'proofData', type: 'bytes' },
    ],
    name: 'verifyProofOfWork',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'user', type: 'address' },
      { internalType: 'string', name: 'activityType', type: 'string' },
      { internalType: 'bytes32', name: 'proofHash', type: 'bytes32' },
    ],
    name: 'recordActivity',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },

  // ===== 查询函数 =====
  {
    inputs: [{ internalType: 'address', name: 'user', type: 'address' }],
    name: 'getActivityCount',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'user', type: 'address' }],
    name: 'getRecordCount',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'user', type: 'address' }],
    name: 'getUserActivities',
    outputs: [
      {
        components: [
          { internalType: 'bytes32', name: 'proofHash', type: 'bytes32' },
          { internalType: 'string', name: 'activityType', type: 'string' },
          { internalType: 'uint256', name: 'timestamp', type: 'uint256' },
          { internalType: 'bool', name: 'exists', type: 'bool' },
        ],
        internalType: 'struct PlantOHCardPlugin.Activity[]',
        name: '',
        type: 'tuple[]',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'user', type: 'address' }],
    name: 'getUserRecords',
    outputs: [
      {
        components: [
          { internalType: 'uint256[]', name: 'cardIds', type: 'uint256[]' },
          { internalType: 'bytes32', name: 'journalHash', type: 'bytes32' },
          { internalType: 'uint256', name: 'duration', type: 'uint256' },
          { internalType: 'uint256', name: 'timestamp', type: 'uint256' },
        ],
        internalType: 'struct PlantOHCardPlugin.HealingRecord[]',
        name: '',
        type: 'tuple[]',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },

  // ===== 状态变量查询 =====
  {
    inputs: [{ internalType: 'address', name: '', type: 'address' }],
    name: 'activityCount',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: '', type: 'address' }],
    name: 'recordCount',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
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
    name: 'protocol',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: '', type: 'address' },
      { internalType: 'uint256', name: '', type: 'uint256' },
    ],
    name: 'userActivities',
    outputs: [
      { internalType: 'bytes32', name: 'proofHash', type: 'bytes32' },
      { internalType: 'string', name: 'activityType', type: 'string' },
      { internalType: 'uint256', name: 'timestamp', type: 'uint256' },
      { internalType: 'bool', name: 'exists', type: 'bool' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: '', type: 'address' },
      { internalType: 'bytes32', name: '', type: 'bytes32' },
    ],
    name: 'userProofExists',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: '', type: 'address' },
      { internalType: 'uint256', name: '', type: 'uint256' },
    ],
    name: 'userRecords',
    outputs: [
      { internalType: 'bytes32', name: 'journalHash', type: 'bytes32' },
      { internalType: 'uint256', name: 'duration', type: 'uint256' },
      { internalType: 'uint256', name: 'timestamp', type: 'uint256' },
    ],
    stateMutability: 'view',
    type: 'function',
  },

  // ===== 管理员功能 =====
  {
    inputs: [{ internalType: 'address', name: 'newProtocol', type: 'address' }],
    name: 'setProtocol',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'renounceOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'newOwner', type: 'address' }],
    name: 'transferOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const;

// ===== 类型定义 =====

export interface PluginInfo {
  name: string;
  version: string;
  pluginType: number;
  description: string;
}

export interface Activity {
  proofHash: `0x${string}`;
  activityType: string;
  timestamp: bigint;
  exists: boolean;
}

export interface HealingRecord {
  cardIds: bigint[];
  journalHash: `0x${string}`;
  duration: bigint;
  timestamp: bigint;
}

// 插件类型枚举
export enum PluginType {
  SELF_HELP = 0,
  HUMAN_SERVICE = 1,
  HYBRID = 2,
}

// ===== 查询函数 =====

/**
 * 获取插件信息
 */
export async function getPluginInfo(pluginAddress: Address): Promise<PluginInfo | null> {
  try {
    const publicClient = getPublicClient(wagmiConfig);
    if (!pluginAddress) return null;

    const info = await publicClient.readContract({
      address: pluginAddress,
      abi: PLANT_OH_CARD_PLUGIN_ABI,
      functionName: 'getPluginInfo',
    }) as [string, string, number, string];

    return {
      name: info[0],
      version: info[1],
      pluginType: info[2],
      description: info[3],
    };
  } catch (error) {
    console.error('Failed to get plugin info:', error);
    return null;
  }
}

/**
 * 计算疗愈完成后的拨付金额
 */
export async function calculatePayout(
  pluginAddress: Address,
  cardCount: number,
  duration: number,
  journalLength: number
): Promise<string> {
  try {
    const publicClient = getPublicClient(wagmiConfig);
    if (!pluginAddress) return '0';

    const amount = await publicClient.readContract({
      address: pluginAddress,
      abi: PLANT_OH_CARD_PLUGIN_ABI,
      functionName: 'calculatePayout',
      args: [BigInt(cardCount), BigInt(duration), BigInt(journalLength)],
    }) as bigint;

    return formatEther(amount);
  } catch (error) {
    console.error('Failed to calculate payout:', error);
    return '0';
  }
}

/**
 * 获取用户活动数量
 */
export async function getActivityCount(pluginAddress: Address, user: Address): Promise<number> {
  try {
    const publicClient = getPublicClient(wagmiConfig);
    if (!pluginAddress) return 0;

    const count = await publicClient.readContract({
      address: pluginAddress,
      abi: PLANT_OH_CARD_PLUGIN_ABI,
      functionName: 'getActivityCount',
      args: [user],
    }) as bigint;

    return Number(count);
  } catch (error) {
    console.error('Failed to get activity count:', error);
    return 0;
  }
}

/**
 * 获取用户记录数量
 */
export async function getRecordCount(pluginAddress: Address, user: Address): Promise<number> {
  try {
    const publicClient = getPublicClient(wagmiConfig);
    if (!pluginAddress) return 0;

    const count = await publicClient.readContract({
      address: pluginAddress,
      abi: PLANT_OH_CARD_PLUGIN_ABI,
      functionName: 'getRecordCount',
      args: [user],
    }) as bigint;

    return Number(count);
  } catch (error) {
    console.error('Failed to get record count:', error);
    return 0;
  }
}

/**
 * 获取用户所有活动
 */
export async function getUserActivities(pluginAddress: Address, user: Address): Promise<Activity[]> {
  try {
    const publicClient = getPublicClient(wagmiConfig);
    if (!pluginAddress) return [];

    const activities = await publicClient.readContract({
      address: pluginAddress,
      abi: PLANT_OH_CARD_PLUGIN_ABI,
      functionName: 'getUserActivities',
      args: [user],
    }) as Activity[];

    return activities;
  } catch (error) {
    console.error('Failed to get user activities:', error);
    return [];
  }
}

/**
 * 获取用户所有疗愈记录
 */
export async function getUserRecords(pluginAddress: Address, user: Address): Promise<HealingRecord[]> {
  try {
    const publicClient = getPublicClient(wagmiConfig);
    if (!pluginAddress) return [];

    const records = await publicClient.readContract({
      address: pluginAddress,
      abi: PLANT_OH_CARD_PLUGIN_ABI,
      functionName: 'getUserRecords',
      args: [user],
    }) as HealingRecord[];

    return records;
  } catch (error) {
    console.error('Failed to get user records:', error);
    return [];
  }
}

/**
 * 验证工作量证明
 */
export async function verifyProofOfWork(
  pluginAddress: Address,
  user: Address,
  proofData: `0x${string}`
): Promise<boolean> {
  try {
    const publicClient = getPublicClient(wagmiConfig);
    if (!pluginAddress) return false;

    const result = await publicClient.readContract({
      address: pluginAddress,
      abi: PLANT_OH_CARD_PLUGIN_ABI,
      functionName: 'verifyProofOfWork',
      args: [user, proofData],
    }) as boolean;

    return result;
  } catch (error) {
    console.error('Failed to verify proof of work:', error);
    return false;
  }
}

/**
 * 检查用户证明是否存在
 */
export async function userProofExists(
  pluginAddress: Address,
  user: Address,
  proofHash: `0x${string}`
): Promise<boolean> {
  try {
    const publicClient = getPublicClient(wagmiConfig);
    if (!pluginAddress) return false;

    const result = await publicClient.readContract({
      address: pluginAddress,
      abi: PLANT_OH_CARD_PLUGIN_ABI,
      functionName: 'userProofExists',
      args: [user, proofHash],
    }) as boolean;

    return result;
  } catch (error) {
    console.error('Failed to check user proof exists:', error);
    return false;
  }
}

/**
 * 获取最小疗愈时长（秒）
 * 合约常量: MIN_HEALING_DURATION = 300 (5分钟)
 */
export async function getMinHealingDuration(pluginAddress: Address): Promise<number> {
  try {
    const publicClient = getPublicClient(wagmiConfig);
    if (!pluginAddress) return 300; // 默认 5 分钟（与合约常量一致）

    const duration = await publicClient.readContract({
      address: pluginAddress,
      abi: PLANT_OH_CARD_PLUGIN_ABI,
      functionName: 'MIN_HEALING_DURATION',
    }) as bigint;

    return Number(duration);
  } catch (error) {
    console.error('Failed to get min healing duration:', error);
    return 300; // 与合约常量一致
  }
}

/**
 * 获取最小时记长度
 * 合约常量: MIN_JOURNAL_LENGTH = 100 (100字)
 */
export async function getMinJournalLength(pluginAddress: Address): Promise<number> {
  try {
    const publicClient = getPublicClient(wagmiConfig);
    if (!pluginAddress) return 100; // 默认 100 字（与合约常量一致）

    const length = await publicClient.readContract({
      address: pluginAddress,
      abi: PLANT_OH_CARD_PLUGIN_ABI,
      functionName: 'MIN_JOURNAL_LENGTH',
    }) as bigint;

    return Number(length);
  } catch (error) {
    console.error('Failed to get min journal length:', error);
    return 100; // 与合约常量一致
  }
}

// ===== 写入函数 =====

/**
 * 记录用户活动
 */
export async function recordActivity(
  pluginAddress: Address,
  user: Address,
  activityType: string,
  proofHash: `0x${string}`
): Promise<`0x${string}` | null> {
  try {
    const walletClient = await getWalletClient(wagmiConfig);
    const publicClient = getPublicClient(wagmiConfig);
    if (!pluginAddress || !walletClient || !publicClient) return null;

    const hash = await walletClient.writeContract({
      address: pluginAddress,
      abi: PLANT_OH_CARD_PLUGIN_ABI,
      functionName: 'recordActivity',
      args: [user, activityType, proofHash],
      chain: publicClient.chain,
    });

    return hash;
  } catch (error) {
    console.error('Failed to record activity:', error);
    return null;
  }
}

/**
 * 完成疗愈并请求拨付
 * 这是用户完成 OH 卡疗愈后调用的核心函数
 */
export async function completeHealingAndRequestPayout(
  pluginAddress: Address,
  cardIds: number[],
  journalHash: `0x${string}`,
  duration: number,
  journalLength: number
): Promise<`0x${string}` | null> {
  try {
    const walletClient = await getWalletClient(wagmiConfig);
    const publicClient = getPublicClient(wagmiConfig);
    if (!pluginAddress || !walletClient || !publicClient) return null;

    const hash = await walletClient.writeContract({
      address: pluginAddress,
      abi: PLANT_OH_CARD_PLUGIN_ABI,
      functionName: 'completeHealingAndRequestPayout',
      args: [
        cardIds.map(id => BigInt(id)),
        journalHash,
        BigInt(duration),
        BigInt(journalLength),
      ],
      chain: publicClient.chain,
    });

    // 等待交易确认
    console.log('Waiting for transaction confirmation...', hash);
    const receipt = await publicClient.waitForTransactionReceipt({
      hash,
      timeout: 60_000, // 60秒超时
      confirmations: 1,
    });

    if (receipt.status === 'success') {
      console.log('Transaction confirmed:', receipt.transactionHash);
      return receipt.transactionHash;
    } else {
      console.error('Transaction failed:', receipt);
      return null;
    }
  } catch (error: any) {
    console.error('Failed to complete healing and request payout:', error);
    // 输出更详细的错误信息
    if (error.message) {
      console.error('Error message:', error.message);
    }
    if (error.cause) {
      console.error('Error cause:', error.cause);
    }
    if (error.details) {
      console.error('Error details:', error.details);
    }
    // 尝试获取合约回滚的原因
    if (error.message?.includes('reverted') || error.message?.includes(' revert')) {
      console.error('Contract reverted. Possible reasons:');
      console.error('  - No cards selected');
      console.error('  - Invalid journal hash');
      console.error('  - Healing too short (< 5 minutes)');
      console.error('  - Journal too short (< 100 characters)');
      console.error('  - Donors cannot claim');
      console.error('  - Insufficient pool balance');
      console.error('  - Exceeds plugin allowance');
    }
    return null;
  }
}

/**
 * 设置协议地址（仅管理员）
 */
export async function setProtocol(
  pluginAddress: Address,
  newProtocol: Address
): Promise<`0x${string}` | null> {
  try {
    const walletClient = await getWalletClient(wagmiConfig);
    const publicClient = getPublicClient(wagmiConfig);
    if (!pluginAddress || !walletClient || !publicClient) return null;

    const hash = await walletClient.writeContract({
      address: pluginAddress,
      abi: PLANT_OH_CARD_PLUGIN_ABI,
      functionName: 'setProtocol',
      args: [newProtocol],
      chain: publicClient.chain,
    });

    return hash;
  } catch (error) {
    console.error('Failed to set protocol:', error);
    return null;
  }
}
