
import { ethers } from "ethers";

// 替换为你的部署地址
const GOAL_MANAGER_ADDR = "0xD7ACd2a9FD159E69Bb102A1ca21C9a3e3A5F771B"; 

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

export const getGoalManagerContract = async () => {
  if (!window.ethereum) throw new Error("Wallet not found");
  if (!GOAL_MANAGER_ADDR || GOAL_MANAGER_ADDR === "0x..." || GOAL_MANAGER_ADDR === "...") {
    throw new Error(
      "Missing GoalManager address. Please set VITE_GOAL_MANAGER_ADDR in your env (deployed GoalManager.sol address)."
    );
  }
  
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  return new ethers.Contract(GOAL_MANAGER_ADDR, GoalManagerABI, signer);
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
  const contract = await getGoalManagerContract();
  return fetchGoalsFromContract(contract);
};

export const contractActions = {
  
  async getGoals() {
    const contract = await getContract();

    const count = await contract.goalCount();
    const goals = [];

    for (let i = 0; i < count; i++) {
      const g = await contract.goals(i);

      goals.push({
        id: i,
        title: g.desc,
        bounty: Number(g.reward) / 1e18,
        deadline: Number(g.deadline),
        creator: g.creator,
      });
    }

    return goals;
  },
  
  
  
  
  // 发起目标 [cite: 50, 51]
  createGoal: async (desc, duration, milestones, rewardEth) => {
    try {
      const contract = await getGoalManagerContract();
      const tx = await contract.createGoal(desc, duration, milestones, {
        // rewardEth 必须是 ETH 数额（单位：ETH），合约内部用 msg.value 作为 reward
        value: ethers.parseEther(String(rewardEth))
      });
      return await tx.wait(); // [cite: 51]
    } catch (error) {
      console.error("Create Goal Error:", error);
      throw error;
    }
  },

  // 参与竞拍 [cite: 54, 55]
  bid: async (goalId, shareRatio, mode, depositEth) => {
    try {
      const contract = await getGoalManagerContract();
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
      const contract = await getGoalManagerContract();
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
      const contract = await getGoalManagerContract();
      const tx = await contract.settle(goalId, reason);
      return await tx.wait(); // [cite: 86]
    } catch (error) {
      console.error("Settle Error:", error);
      throw error;
    }
  }
};