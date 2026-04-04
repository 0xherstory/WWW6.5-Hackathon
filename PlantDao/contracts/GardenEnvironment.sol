// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title GardenEnvironment
 * @dev 个人花园环境系统
 * - 基于用户所有植物的整体健康状况
 * - 影响奖励加成或衰减
 */
contract GardenEnvironment is Ownable {
    // 花园状态
    enum GardenState { Thriving, Normal, Neglected }

    struct GardenData {
        uint256 plantCount;
        uint256 totalHealth;       // 所有植物健康值总和
        uint256 consecutiveDays;   // 连续照顾天数
        uint256 lastCareDay;       // 最后照顾日
        uint256 bonusPercentage;   // 奖励加成百分比 (100=基准)
    }

    mapping(address => GardenData) public gardens;

    // 参数
    uint256 public thrivingBonus = 120;    // 健康花园 +20%
    uint256 public normalBonus = 100;      // 正常 0%
    uint256 public neglectedPenalty = 80;  // 荒废 -20%
    uint256 public thrivingAvgHealth = 70; // 平均健康>70=健康
    uint256 public neglectedAvgHealth = 30; // 平均健康<30=荒废

    event GardenUpdated(address indexed user, GardenState state, uint256 bonus);
    event ConsecutiveStreakUpdated(address indexed user, uint256 streakDays);

    constructor() {}

    // ============ 数据更新 ============

    function addPlantToGarden(address user, uint256 health) external onlyOwner {
        gardens[user].plantCount++;
        gardens[user].totalHealth += health;
        _updateBonus(user);
    }

    function removePlantFromGarden(address user, uint256 health) external onlyOwner {
        if (gardens[user].plantCount > 0) {
            gardens[user].plantCount--;
            if (gardens[user].totalHealth >= health) {
                gardens[user].totalHealth -= health;
            }
        }
        _updateBonus(user);
    }

    function updatePlantHealth(address user, uint256 oldHealth, uint256 newHealth) external onlyOwner {
        if (gardens[user].totalHealth >= oldHealth) {
            gardens[user].totalHealth -= oldHealth;
        }
        gardens[user].totalHealth += newHealth;
        _updateBonus(user);
    }

    function recordDailyCare(address user) external onlyOwner {
        uint256 today = block.timestamp / 1 days;
        uint256 lastDay = gardens[user].lastCareDay / 1 days;

        if (today == lastDay + 1) {
            gardens[user].consecutiveDays++;
        } else if (today > lastDay + 1) {
            gardens[user].consecutiveDays = 1;
        }

        gardens[user].lastCareDay = block.timestamp;
        _updateBonus(user);

        emit ConsecutiveStreakUpdated(user, gardens[user].consecutiveDays);
    }

    // ============ 内部函数 ============

    function _updateBonus(address user) internal {
        GardenData storage garden = gardens[user];

        if (garden.plantCount == 0) {
            garden.bonusPercentage = normalBonus;
            emit GardenUpdated(user, GardenState.Normal, normalBonus);
            return;
        }

        uint256 avgHealth = garden.totalHealth / garden.plantCount;
        GardenState state;

        if (avgHealth >= thrivingAvgHealth && garden.consecutiveDays >= 3) {
            garden.bonusPercentage = thrivingBonus;
            state = GardenState.Thriving;
        } else if (avgHealth < neglectedAvgHealth) {
            garden.bonusPercentage = neglectedPenalty;
            state = GardenState.Neglected;
        } else {
            garden.bonusPercentage = normalBonus;
            state = GardenState.Normal;
        }

        emit GardenUpdated(user, state, garden.bonusPercentage);
    }

    // ============ DAO 可调参数 ============

    function setThresholds(uint256 thriving, uint256 neglected) external onlyOwner {
        thrivingAvgHealth = thriving;
        neglectedAvgHealth = neglected;
    }

    function setBonuses(uint256 thriving, uint256 normal, uint256 neglected) external onlyOwner {
        thrivingBonus = thriving;
        normalBonus = normal;
        neglectedPenalty = neglected;
    }

    // ============ View Functions ============

    function getGardenState(address user) external view returns (GardenState) {
        GardenData storage garden = gardens[user];
        if (garden.plantCount == 0) return GardenState.Normal;

        uint256 avgHealth = garden.totalHealth / garden.plantCount;
        if (avgHealth >= thrivingAvgHealth && garden.consecutiveDays >= 3) return GardenState.Thriving;
        if (avgHealth < neglectedAvgHealth) return GardenState.Neglected;
        return GardenState.Normal;
    }

    function getGardenBonus(address user) external view returns (uint256) {
        return gardens[user].bonusPercentage;
    }

    function getAverageHealth(address user) external view returns (uint256) {
        if (gardens[user].plantCount == 0) return 0;
        return gardens[user].totalHealth / gardens[user].plantCount;
    }

    function getGardenInfo(address user) external view returns (
        uint256 plantCount,
        uint256 avgHealth,
        uint256 consecutiveDays,
        uint256 bonusPercentage,
        GardenState state
    ) {
        GardenData storage garden = gardens[user];
        uint256 avg = garden.plantCount > 0 ? garden.totalHealth / garden.plantCount : 0;

        GardenState s = GardenState.Normal;
        if (avg >= thrivingAvgHealth && garden.consecutiveDays >= 3) s = GardenState.Thriving;
        else if (avg < neglectedAvgHealth) s = GardenState.Neglected;

        return (garden.plantCount, avg, garden.consecutiveDays, garden.bonusPercentage, s);
    }
}