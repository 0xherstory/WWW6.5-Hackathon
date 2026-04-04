// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title GlobalEcology
 * @dev 全局生态指数系统
 * - 三层环境反馈的核心
 * - 数据来源: 全网植物平均健康值 + 活跃照顾数 + 繁殖成功率 + 死亡率
 * - 三档状态: 繁荣/平衡/衰退
 */
contract GlobalEcology is Ownable {
    // 生态状态
    enum EcologyState { Thriving, Balanced, Declining }

    // 全局生态指数 (0-100)
    uint256 public ecologyIndex = 70; // 初始平衡
    uint256 public lastUpdateTime;

    // 生态参数
    uint256 public thrivingThreshold = 75;  // >75 = 繁荣
    uint256 public decliningThreshold = 40; // <40 = 衰退

    // 统计数据
    uint256 public totalPlants;
    uint256 public totalHealthyPlants;     // health > 60
    uint256 public totalDeadPlants;
    uint256 public totalCareActions;       // 总照顾次数
    uint256 public totalBreeds;            // 总繁殖次数
    uint256 public successfulBreeds;       // 成功繁殖次数
    uint256 public totalDiseasedPlants;    // 患病植物数

    // 奖励倍率
    uint256 public thrivingMultiplier = 130;  // 1.3x
    uint256 public balancedMultiplier = 100;  // 1.0x
    uint256 public decliningMultiplier = 70;  // 0.7x

    // 生态事件
    struct EcologyEvent {
        string name;
        string description;
        uint256 impact;      // 对生态指数的影响
        uint256 timestamp;
        bool resolved;
    }

    EcologyEvent[] public ecologyEvents;

    event EcologyUpdated(uint256 newIndex, EcologyState state);
    event EcologyEventTriggered(uint256 indexed eventId, string name, uint256 impact);
    event EcologyEventResolved(uint256 indexed eventId);

    constructor() {
        lastUpdateTime = block.timestamp;
    }

    // ============ 数据更新（由其他合约调用） ============

    function registerPlant() external onlyOwner {
        totalPlants++;
    }

    function removePlant(bool wasHealthy) external onlyOwner {
        totalPlants--;
        if (!wasHealthy) totalDeadPlants++;
        else totalHealthyPlants = totalHealthyPlants > 0 ? totalHealthyPlants - 1 : 0;
    }

    function recordCareAction() external onlyOwner {
        totalCareActions++;
    }

    function recordBreed(bool success) external onlyOwner {
        totalBreeds++;
        if (success) successfulBreeds++;
    }

    function recordDisease(bool infected) external onlyOwner {
        if (infected) totalDiseasedPlants++;
        else totalDiseasedPlants = totalDiseasedPlants > 0 ? totalDiseasedPlants - 1 : 0;
    }

    function updateHealthStatus(bool wasHealthy, bool isHealthy) external onlyOwner {
        if (!wasHealthy && isHealthy) totalHealthyPlants++;
        if (wasHealthy && !isHealthy) totalHealthyPlants = totalHealthyPlants > 0 ? totalHealthyPlants - 1 : 0;
    }

    // ============ 生态指数计算 ============

    function recalculateIndex() external {
        if (totalPlants == 0) return;

        // 因子1: 平均健康 (0-40分)
        uint256 healthScore = (totalHealthyPlants * 40) / totalPlants;

        // 因子2: 活跃度 (0-20分) - 基于照顾/植物比
        uint256 activityRatio = totalPlants > 0 ? (totalCareActions * 100) / totalPlants : 0;
        uint256 activityScore = activityRatio > 100 ? 20 : (activityRatio * 20) / 100;

        // 因子3: 繁殖成功率 (0-20分)
        uint256 breedScore = totalBreeds > 0 ? (successfulBreeds * 20) / totalBreeds : 10;

        // 因子4: 死亡率 (0-20分, 反向)
        uint256 deathRate = totalPlants > 0 ? (totalDeadPlants * 100) / (totalPlants + totalDeadPlants) : 0;
        uint256 survivalScore = deathRate > 50 ? 0 : 20 - (deathRate * 20) / 50;

        // 因子5: 病害惩罚
        uint256 diseaseRate = totalPlants > 0 ? (totalDiseasedPlants * 100) / totalPlants : 0;
        uint256 diseasePenalty = diseaseRate > 30 ? 15 : (diseaseRate * 15) / 30;

        uint256 newIndex = healthScore + activityScore + breedScore + survivalScore;
        if (newIndex > diseasePenalty) newIndex -= diseasePenalty;
        else newIndex = 0;

        if (newIndex > 100) newIndex = 100;

        ecologyIndex = newIndex;
        lastUpdateTime = block.timestamp;

        emit EcologyUpdated(newIndex, getEcologyState());
    }

    // ============ 生态事件 ============

    function triggerEvent(string memory name, string memory description, uint256 impact) external onlyOwner {
        ecologyEvents.push(EcologyEvent({
            name: name,
            description: description,
            impact: impact,
            timestamp: block.timestamp,
            resolved: false
        }));

        // 事件影响生态指数
        if (ecologyIndex > impact) ecologyIndex -= impact;
        else ecologyIndex = 0;

        emit EcologyEventTriggered(ecologyEvents.length - 1, name, impact);
    }

    function resolveEvent(uint256 eventId) external onlyOwner {
        ecologyEvents[eventId].resolved = true;
        // 恢复部分生态指数
        uint256 recovery = ecologyEvents[eventId].impact / 2;
        ecologyIndex = ecologyIndex + recovery > 100 ? 100 : ecologyIndex + recovery;
        emit EcologyEventResolved(eventId);
    }

    // ============ DAO 可调参数 ============

    function setThresholds(uint256 thriving, uint256 declining) external onlyOwner {
        thrivingThreshold = thriving;
        decliningThreshold = declining;
    }

    function setMultipliers(uint256 thriving, uint256 balanced, uint256 declining) external onlyOwner {
        thrivingMultiplier = thriving;
        balancedMultiplier = balanced;
        decliningMultiplier = declining;
    }

    // ============ View Functions ============

    function getEcologyState() public view returns (EcologyState) {
        if (ecologyIndex > thrivingThreshold) return EcologyState.Thriving;
        if (ecologyIndex < decliningThreshold) return EcologyState.Declining;
        return EcologyState.Balanced;
    }

    function getCurrentMultiplier() external view returns (uint256) {
        EcologyState state = getEcologyState();
        if (state == EcologyState.Thriving) return thrivingMultiplier;
        if (state == EcologyState.Declining) return decliningMultiplier;
        return balancedMultiplier;
    }

    function getEcologyStats() external view returns (
        uint256 index,
        EcologyState state,
        uint256 plants,
        uint256 healthy,
        uint256 dead,
        uint256 cares,
        uint256 breeds,
        uint256 diseased
    ) {
        return (
            ecologyIndex,
            getEcologyState(),
            totalPlants,
            totalHealthyPlants,
            totalDeadPlants,
            totalCareActions,
            totalBreeds,
            totalDiseasedPlants
        );
    }

    function getEventCount() external view returns (uint256) {
        return ecologyEvents.length;
    }
}