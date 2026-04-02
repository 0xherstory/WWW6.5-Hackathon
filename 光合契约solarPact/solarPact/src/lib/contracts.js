
import { ethers } from "ethers";

// 替换为你的部署地址
const DEFAULT_GOAL_MANAGER_ADDR = "0x775a3b22061dD88C4ad954215ED57CEDF2AC5332";
const GOAL_MANAGER_STORAGE_KEY_LEGACY = "solarpact_goal_manager_addr";
const getGoalManagerStorageKey = (chainId) => `solarpact_goal_manager_addr_${String(chainId)}`;

export const getGoalManagerAddress = (chainId) => {
  const fromEnv = import.meta?.env?.VITE_GOAL_MANAGER_ADDR;
  const fromUrl = (() => {
    if (typeof window === "undefined") return null;
    const params = new URLSearchParams(window.location.search);
    const raw = params.get("goalManager");
    if (!raw) return null;
    try {
      const normalized = ethers.getAddress(String(raw));
      if (chainId) {
        window.localStorage?.setItem(getGoalManagerStorageKey(chainId), normalized);
      }
      window.localStorage?.setItem(GOAL_MANAGER_STORAGE_KEY_LEGACY, normalized);
      params.delete("goalManager");
      const rest = params.toString();
      const nextUrl = `${window.location.pathname}${rest ? `?${rest}` : ""}${window.location.hash || ""}`;
      window.history.replaceState({}, "", nextUrl);
      return normalized;
    } catch {
      return null;
    }
  })();
  const fromStorage = typeof window !== "undefined"
    ? (chainId ? window.localStorage?.getItem(getGoalManagerStorageKey(chainId)) : null)
    : null;
  const fromLegacy = typeof window !== "undefined"
    ? window.localStorage?.getItem(GOAL_MANAGER_STORAGE_KEY_LEGACY)
    : null;
  return fromEnv || fromUrl || fromStorage || fromLegacy || DEFAULT_GOAL_MANAGER_ADDR;
};

export const setGoalManagerAddress = (addr, chainId) => {
  const normalized = ethers.getAddress(String(addr));
  if (typeof window !== "undefined") {
    if (chainId) {
      window.localStorage?.setItem(getGoalManagerStorageKey(chainId), normalized);
    }
    window.localStorage?.setItem(GOAL_MANAGER_STORAGE_KEY_LEGACY, normalized);
  }
  return normalized;
};

// 导入 ABI (建议放在 src/lib/abi/GoalManager.json)
import GoalManagerData from "./abi/GoalManager.json";
const GoalManagerABI = GoalManagerData.abi;

const STATUS_TEXT = ["开启", "已匹配", "进行中", "已完成", "失败", "已结算", "争议中"];

const toNumberSafe = (v) => {
  // ethers v6 对 uint256 通常返回 BigInt；Number(...) 用于 UI 渲染
  // 注意：这里假设这些字段在 UI 场景下不会溢出 JS Number。
  return typeof v === "bigint" ? Number(v) : Number(v ?? 0);
};

/**
 * 将合约 Goal struct 映射为前端 UI 需要的格式。
 * - status(uint8) -> statusText(string) + 一组布尔标记
 * - reward(uint256) -> rewardEth(string, ethers.formatEther)
 * - 其它 uint256(BigInt) 全部转为 Number，避免 UI 渲染报错
 */
export const mapContractGoalToUI = (goal, id) => {
  const statusNum = toNumberSafe(goal.status);

  return {
    id: toNumberSafe(id),
    creator: goal.creator,
    desc: goal.desc,

    rewardEth: ethers.formatEther(goal.reward),

    deadline: toNumberSafe(goal.deadline),
    partner: goal.partner,
    status: statusNum,
    statusText: STATUS_TEXT[statusNum] ?? `未知状态(${statusNum})`,

    totalMilestones: toNumberSafe(goal.totalMilestones),
    completedMilestones: toNumberSafe(goal.completedMilestones),
    selectedBidIndex: toNumberSafe(goal.selectedBidIndex),

    lastProofTime: toNumberSafe(goal.lastProofTime),
    pendingReview: Boolean(goal.pendingReview),

    isOpen: statusNum === 0,
    isMatched: statusNum === 1,
    isInProgress: statusNum === 2,
    isCompleted: statusNum === 3,
    isFailed: statusNum === 4,
    isSettled: statusNum === 5,
    isDisputed: statusNum === 6,
  };
};

// Avalanche Fuji Testnet 公共 RPC 节点
const FALLBACK_RPC = "https://api.avax-test.network/ext/bc/C/rpc";
const AVAX_FUJI_CHAIN_ID = "0xa869"; // 43113 in hex

const switchToAvaxFuji = async () => {
  if (!window.ethereum) return;
  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: AVAX_FUJI_CHAIN_ID }],
    });
  } catch (switchError) {
    if (switchError.code === 4902) {
      try {
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: AVAX_FUJI_CHAIN_ID,
              chainName: "Avalanche Fuji C-Chain",
              rpcUrls: ["https://api.avax-test.network/ext/bc/C/rpc"],
              nativeCurrency: {
                name: "Avalanche",
                symbol: "AVAX",
                decimals: 18,
              },
              blockExplorerUrls: ["https://testnet.snowtrace.io/"],
            },
          ],
        });
      } catch (addError) {
        throw new Error("Failed to add Avalanche Fuji network to your wallet.");
      }
    } else {
      throw new Error("Failed to switch to Avalanche Fuji network.");
    }
  }
};

export const getGoalManagerContract = async (withSigner = false) => {
  if (withSigner) {
    if (!window.ethereum) {
      throw new Error("Wallet not found. Please install MetaMask to perform this action.");
    }
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const network = await provider.getNetwork();
      if (network.chainId !== 43113n) {
        await switchToAvaxFuji();
      }
      const providerAfterSwitch = new ethers.BrowserProvider(window.ethereum);
      const networkAfterSwitch = await providerAfterSwitch.getNetwork();
      const chainId = networkAfterSwitch.chainId;
      const goalManagerAddr = getGoalManagerAddress(chainId);
      let code = await providerAfterSwitch.getCode(goalManagerAddr);
      if (code === "0x") {
        const fallback = new ethers.JsonRpcProvider(FALLBACK_RPC);
        code = await fallback.getCode(goalManagerAddr);
        if (code === "0x") {
          if (import.meta?.env?.VITE_SKIP_CODE_CHECK === "1") {
            console.warn(`Skipping code check for ${goalManagerAddr} on chainId=${chainId}`);
          } else {
            throw new Error(
              `GoalManager contract not found at ${goalManagerAddr} on chainId=${chainId}. ` +
              `Please update VITE_GOAL_MANAGER_ADDR or localStorage key ${getGoalManagerStorageKey(chainId)}.`
            );
          }
        }
      }
      const signer = await providerAfterSwitch.getSigner();
      return new ethers.Contract(goalManagerAddr, GoalManagerABI, signer);
    } catch (error) {
      if (error.code === -32002) {
        throw new Error("Wallet connection request already pending. Please check your wallet.");
      }
      throw error;
    }
  }

  try {
    const provider = new ethers.JsonRpcProvider(FALLBACK_RPC);
    const chainId = 43113n;
    const goalManagerAddr = getGoalManagerAddress(chainId);
    const code = await provider.getCode(goalManagerAddr);
    if (code === "0x") {
      console.warn(`Contract not found at ${goalManagerAddr} on Avalanche Fuji.`);
      return {
        goalCount: async () => 0n,
        goals: async () => null
      };
    }
    return new ethers.Contract(goalManagerAddr, GoalManagerABI, provider);
  } catch (rpcError) {
    console.error("Failed to connect to Avalanche Fuji RPC:", rpcError);
    throw new Error("Failed to load data from the blockchain network.");
  }
};


export const fetchGoalsFromContract = async (contract) => {
  const goalCountBn = await contract.goalCount();
  const goalCount = toNumberSafe(goalCountBn);

  const goalsRaw = await Promise.all(
    Array.from({ length: goalCount }, (_, i) => contract.goals(i))
  );

  return goalsRaw.map((g, i) => mapContractGoalToUI(g, i));
};

export const fetchGoals = async () => {
  const contract = await getGoalManagerContract(false);
  return fetchGoalsFromContract(contract);
};

export const contractActions = {
  
  async getGoals() {
    const contract = await getGoalManagerContract(false);

    // 优先使用合约的视图函数一次性获取所有数据
    if (typeof contract.getGoals === "function") {
      try {
        const arr = await contract.getGoals();
        const mapped = arr.map((g, i) => ({
          id: i,
          title: g.desc,
          bounty: Number(g.reward) / 1e18,
          deadline: Number(g.deadline),
          creator: g.creator,
        }));
        console.log("contract.getGoals raw:", arr);
        console.log("contract.getGoals mapped:", mapped);
        return mapped;
      } catch (e) {
        console.warn("contract.getGoals failed, fallback to goalCount/goals:", e);
      }
    }
    
    // 兼容回退：逐个读取
    const countBn = await contract.goalCount();
    const count = toNumberSafe(countBn);
    const out = [];
    for (let i = 0; i < count; i++) {
      const g = await contract.goals(i);
      out.push({
        id: i,
        title: g.desc,
        bounty: Number(g.reward) / 1e18,
        deadline: Number(g.deadline),
        creator: g.creator,
      });
    }
    console.log("contract.goals count:", count);
    console.log("contract.goals mapped:", out);
    return out;
  },
  
  
  
  
  // 发起目标 [cite: 50, 51]
  createGoal: async (desc, duration, milestones, rewardEth) => {
    try {
      const contract = await getGoalManagerContract(true);
      const tx = await contract.createGoal(desc, duration, milestones, {
        value: ethers.parseEther(String(rewardEth)),
      });
      const receipt = await tx.wait();
      console.log("createGoal receipt:", receipt);
      console.log("当前合约地址:", contract.target);
      try {
        const updated = setGoalManagerAddress(contract.target, 43113n);
        console.log("已同步 GoalManager 合约地址到本地:", updated);
      } catch (syncError) {
        console.warn("同步合约地址失败:", syncError);
      }
      try {
        const goals = await contractActions.getGoals();
        console.log("createGoal 后读取 goals:", goals);
      } catch (readError) {
        console.warn("createGoal 后读取失败:", readError);
      }
      return receipt;
    } catch (error) {
      console.error("Create Goal Error:", error);
      throw error;
    }
  },
    
  // 参与竞拍 [cite: 54, 55]
  bid: async (goalId, shareRatio, mode, depositEth) => {
    try {
      const contract = await getGoalManagerContract(true);
      const tx = await contract.bid(goalId, shareRatio, mode, {
        // depositEth 必须是 ETH 数额（单位：ETH），合约内部用 msg.value 作为 deposit
        value: ethers.parseEther(String(depositEth))
      });
      return await tx.wait(); // [cite: 55]
    } catch (error) {
      console.error("Bid Error:", error);
      throw error;
    }
  },

  // 提交证明 [cite: 64, 65]
  submitProof: async (goalId, proofHash) => {
    try {
      const contract = await getGoalManagerContract(true);
      const tx = await contract.submitProof(goalId, proofHash);
      return await tx.wait(); // [cite: 66]
    } catch (error) {
      console.error("Submit Proof Error:", error);
      throw error;
    }
  },

  // 仲裁结算 [cite: 77, 79]
  settle: async (goalId, reason) => {
    try {
      const contract = await getGoalManagerContract(true);
      const tx = await contract.settle(goalId, reason);
      return await tx.wait(); // [cite: 86]
    } catch (error) {
      console.error("Settle Error:", error);
      throw error;
    }
  }
};
