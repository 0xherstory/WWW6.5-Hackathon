// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./VitalMintDataHub.sol";

/**
 * @title VitalMintHealthRecords
 * @dev 健康记录专用接口，提供便捷的饮食、医疗、日常状况记录方法
 * 作为 DataHub 的封装层，简化前端调用
 */
contract VitalMintHealthRecords {
    VitalMintDataHub public dataHub;

    event DietRecorded(address indexed user, bytes32 dataHash, uint256 calories, string mealType);
    event MedicalRecorded(address indexed user, bytes32 dataHash, string recordType);
    event DailyHealthRecorded(address indexed user, bytes32 dataHash, uint256 energyLevel, uint256 painLevel);

    constructor(address _dataHub) {
        require(_dataHub != address(0), "Invalid data hub address");
        dataHub = VitalMintDataHub(_dataHub);
    }

    /**
     * @dev 记录饮食数据
     * @param _dataHash IPFS 存储的饮食数据哈希
     * @param _cyclePhase 当前周期阶段
     * @param _calories 估算卡路里（仅用于链上事件，不存储隐私）
     * @param _mealType 餐次类型：breakfast/lunch/dinner/snack
     */
    function recordDiet(
        bytes32 _dataHash,
        uint256 _cyclePhase,
        uint256 _calories,
        string calldata _mealType
    ) external returns (uint256 recordId) {
        recordId = dataHub.storeHealthRecord(
            _dataHash,
            VitalMintDataHub.RecordType.DIET,
            _cyclePhase
        );
        emit DietRecorded(msg.sender, _dataHash, _calories, _mealType);
    }

    /**
     * @dev 记录医疗数据（症状、检查结果、用药等）
     * @param _dataHash IPFS 存储的医疗数据哈希
     * @param _cyclePhase 当前周期阶段
     * @param _recordType 记录类型：symptom/diagnosis/medication/test_result
     */
    function recordMedical(
        bytes32 _dataHash,
        uint256 _cyclePhase,
        string calldata _recordType
    ) external returns (uint256 recordId) {
        recordId = dataHub.storeHealthRecord(
            _dataHash,
            VitalMintDataHub.RecordType.MEDICAL,
            _cyclePhase
        );
        emit MedicalRecorded(msg.sender, _dataHash, _recordType);
    }

    /**
     * @dev 记录当天健康状况
     * @param _dataHash IPFS 存储的健康状况数据哈希
     * @param _cyclePhase 当前周期阶段
     * @param _energyLevel 精力水平 (1-10)
     * @param _painLevel 疼痛水平 (0-10)
     */
    function recordDailyHealth(
        bytes32 _dataHash,
        uint256 _cyclePhase,
        uint256 _energyLevel,
        uint256 _painLevel
    ) external returns (uint256 recordId) {
        require(_energyLevel >= 1 && _energyLevel <= 10, "Energy level must be 1-10");
        require(_painLevel >= 0 && _painLevel <= 10, "Pain level must be 0-10");
        
        recordId = dataHub.storeHealthRecord(
            _dataHash,
            VitalMintDataHub.RecordType.DAILY_HEALTH,
            _cyclePhase
        );
        emit DailyHealthRecorded(msg.sender, _dataHash, _energyLevel, _painLevel);
    }

    /**
     * @dev 完整的一天健康打卡（同时记录日常状况 + 饮食 + 症状）
     */
    function completeDailyCheckIn(
        bytes32 _dailyHealthHash,
        bytes32[] calldata _dietHashes,
        bytes32[] calldata _medicalHashes,
        uint256 _cyclePhase,
        uint256 _energyLevel,
        uint256 _painLevel
    ) external returns (uint256[] memory recordIds) {
        uint256 totalRecords = 1 + _dietHashes.length + _medicalHashes.length;
        recordIds = new uint256[](totalRecords);
        uint256 idx = 0;
        
        // 记录日常健康状况
        recordIds[idx] = dataHub.storeHealthRecord(
            _dailyHealthHash,
            VitalMintDataHub.RecordType.DAILY_HEALTH,
            _cyclePhase
        );
        emit DailyHealthRecorded(msg.sender, _dailyHealthHash, _energyLevel, _painLevel);
        idx++;
        
        // 记录所有饮食
        for (uint256 i = 0; i < _dietHashes.length; i++) {
            recordIds[idx] = dataHub.storeHealthRecord(
                _dietHashes[i],
                VitalMintDataHub.RecordType.DIET,
                _cyclePhase
            );
            emit DietRecorded(msg.sender, _dietHashes[i], 0, "");
            idx++;
        }
        
        // 记录所有医疗/症状
        for (uint256 i = 0; i < _medicalHashes.length; i++) {
            recordIds[idx] = dataHub.storeHealthRecord(
                _medicalHashes[i],
                VitalMintDataHub.RecordType.MEDICAL,
                _cyclePhase
            );
            emit MedicalRecorded(msg.sender, _medicalHashes[i], "");
            idx++;
        }
    }

    /**
     * @dev 领取每日挖矿奖励
     */
    function claimDailyReward() external {
        dataHub.claimDailyMiningReward();
    }

    /**
     * @dev 获取用户今日打卡状态
     */
    function getTodayCheckInStatus(address _user) external view returns (bool hasRecorded) {
        uint256 currentDay = block.timestamp / 1 days;
        uint256 totalRecords = dataHub.getUserRecordCount(_user);
        
        for (uint256 i = 0; i < totalRecords; i++) {
            // 注意：这里简化处理，实际需要从 DataHub 获取每条记录的时间戳
            // 生产环境建议在 DataHub 中添加专用查询函数
            if (dataHub.hasClaimedToday(_user)) {
                return true;
            }
        }
        return false;
    }
}