// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./VitalMintToken.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title VitalMintDataHub
 * @dev 健康数据存储、授权管理与激励分发
 * 支持饮食记录、医疗记录、当天健康状况记录的激励
 */
contract VitalMintDataHub is AccessControl, ReentrancyGuard, Pausable {
    bytes32 public constant REWARD_CONFIG_ROLE = keccak256("REWARD_CONFIG_ROLE");

    VitalMintToken public vmtToken;

    // ============ 数据结构 ============

    enum RecordType {
        DAILY_HEALTH,   // 当天健康状况
        DIET,           // 饮食记录
        MEDICAL         // 医疗记录
    }

    struct HealthRecord {
        bytes32 dataHash;       // IPFS 存储的数据哈希
        uint256 timestamp;      // 记录时间
        RecordType recordType;  // 记录类型
        uint256 cyclePhase;     // 周期阶段 (0-3)
        bool isActive;          // 是否有效
        uint256 rewardClaimed;  // 已领取的奖励金额
    }

    struct DataGrant {
        address researcher;      // 研究机构地址
        uint256 expiry;          // 授权过期时间戳
        bool isGranted;          // 是否已授权
        uint256 rewardPerRecord; // 每条记录的奖励基数
    }

    struct UserRewardInfo {
        uint256 lastClaimDay;    // 上次领取挖矿奖励的日期
        uint256 streakDays;      // 连续打卡天数
        uint256 totalRewards;    // 累计获得奖励
    }

    // ============ 存储映射 ============

    // 用户 => 记录ID => 健康记录
    mapping(address => mapping(uint256 => HealthRecord)) public healthRecords;
    mapping(address => uint256) public userRecordCount;

    // 用户 => 研究机构 => 授权信息
    mapping(address => mapping(address => DataGrant)) public dataGrants;

    // 用户 => 日期 => 是否已领取每日挖矿奖励
    mapping(address => mapping(uint256 => bool)) public dailyMiningClaimed;

    // 用户奖励信息
    mapping(address => UserRewardInfo) public userRewardInfo;

    // ============ 奖励配置 ============

    struct RewardConfig {
        uint256 dailyHealthReward;   // 每日健康记录奖励
        uint256 dietRecordReward;    // 饮食记录奖励
        uint256 medicalRecordReward; // 医疗记录奖励
        uint256 streakBonus;         // 连续打卡奖励
        uint256 dataContributionBase; // 数据贡献基础奖励
    }

    RewardConfig public rewardConfig;

    // ============ 事件 ============

    event HealthRecordStored(
        address indexed user, 
        uint256 recordId, 
        RecordType recordType, 
        bytes32 dataHash
    );
    event DataGranted(address indexed user, address indexed researcher, uint256 expiry);
    event DataRevoked(address indexed user, address indexed researcher);
    event DailyMiningRewardClaimed(address indexed user, uint256 amount, uint256 streak);
    event RecordRewardClaimed(address indexed user, uint256 recordId, uint256 amount);
    event DataContributionRewarded(address indexed user, address indexed researcher, uint256 amount);
    event RewardConfigUpdated(RewardConfig newConfig);

    // ============ 构造函数 ============

    constructor(address _vmtToken) {
        require(_vmtToken != address(0), "Invalid token address");
        vmtToken = VitalMintToken(_vmtToken);
        
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(REWARD_CONFIG_ROLE, msg.sender);

        // 初始化奖励配置
        rewardConfig = RewardConfig({
            dailyHealthReward: 10 * 10 ** 18,   // 10 VMT
            dietRecordReward: 5 * 10 ** 18,     // 5 VMT
            medicalRecordReward: 20 * 10 ** 18, // 20 VMT
            streakBonus: 5 * 10 ** 18,          // 5 VMT
            dataContributionBase: 50 * 10 ** 18 // 50 VMT
        });
    }

    // ============ 数据存储 ============

    /**
     * @dev 存储健康记录（饮食/医疗/当天健康状况）
     * @param _dataHash IPFS 存储的数据哈希
     * @param _recordType 记录类型
     * @param _cyclePhase 周期阶段 (0=月经期,1=卵泡期,2=排卵期,3=黄体期)
     * @return recordId 记录ID
     */
    function storeHealthRecord(
        bytes32 _dataHash,
        RecordType _recordType,
        uint256 _cyclePhase
    ) external whenNotPaused returns (uint256 recordId) {
        require(_dataHash != bytes32(0), "Invalid data hash");
        require(_cyclePhase <= 3, "Invalid cycle phase");

        recordId = userRecordCount[msg.sender];
        
        healthRecords[msg.sender][recordId] = HealthRecord({
            dataHash: _dataHash,
            timestamp: block.timestamp,
            recordType: _recordType,
            cyclePhase: _cyclePhase,
            isActive: true,
            rewardClaimed: 0
        });
        
        userRecordCount[msg.sender]++;

        emit HealthRecordStored(msg.sender, recordId, _recordType, _dataHash);
        
        // 自动触发该记录的奖励
        _claimRecordReward(msg.sender, recordId);
    }

    /**
     * @dev 批量存储多条健康记录
     */
    function batchStoreHealthRecords(
        bytes32[] calldata _dataHashes,
        RecordType[] calldata _recordTypes,
        uint256[] calldata _cyclePhases
    ) external whenNotPaused {
        require(_dataHashes.length == _recordTypes.length, "Length mismatch");
        require(_dataHashes.length == _cyclePhases.length, "Length mismatch");
        require(_dataHashes.length <= 10, "Max 10 records per batch");

        for (uint256 i = 0; i < _dataHashes.length; i++) {
            storeHealthRecord(_dataHashes[i], _recordTypes[i], _cyclePhases[i]);
        }
    }

    // ============ 奖励机制 ============

    /**
     * @dev 内部函数：为单条记录发放奖励
     */
    function _claimRecordReward(address _user, uint256 _recordId) internal {
        HealthRecord storage record = healthRecords[_user][_recordId];
        require(record.isActive, "Record not active");
        require(record.rewardClaimed == 0, "Reward already claimed");

        uint256 rewardAmount = 0;
        
        if (record.recordType == RecordType.DAILY_HEALTH) {
            rewardAmount = rewardConfig.dailyHealthReward;
        } else if (record.recordType == RecordType.DIET) {
            rewardAmount = rewardConfig.dietRecordReward;
        } else if (record.recordType == RecordType.MEDICAL) {
            rewardAmount = rewardConfig.medicalRecordReward;
        }

        require(rewardAmount > 0, "No reward for this record type");
        
        record.rewardClaimed = rewardAmount;
        
        // 更新用户累计奖励
        userRewardInfo[_user].totalRewards += rewardAmount;
        
        // 铸造并发放奖励
        vmtToken.mint(_user, rewardAmount);
        
        emit RecordRewardClaimed(_user, _recordId, rewardAmount);
    }

    /**
     * @dev 用户领取每日健康行为挖矿奖励（连续打卡激励）
     */
    function claimDailyMiningReward() external nonReentrant whenNotPaused {
        uint256 currentDay = block.timestamp / 1 days;
        require(!dailyMiningClaimed[msg.sender][currentDay], "Already claimed today");
        
        // 检查今天是否有至少一条健康记录
        uint256 todayRecordCount = 0;
        uint256 totalRecords = userRecordCount[msg.sender];
        for (uint256 i = 0; i < totalRecords; i++) {
            if (healthRecords[msg.sender][i].timestamp / 1 days == currentDay) {
                todayRecordCount++;
            }
        }
        require(todayRecordCount >= 1, "No health record today");

        UserRewardInfo storage info = userRewardInfo[msg.sender];
        uint256 lastClaimDay = info.lastClaimDay;
        
        // 更新连续打卡天数
        if (lastClaimDay == currentDay - 1) {
            info.streakDays++;
        } else if (lastClaimDay != currentDay) {
            info.streakDays = 1;
        }
        
        uint256 reward = rewardConfig.dailyHealthReward;
        if (info.streakDays >= 7 && info.streakDays % 7 == 0) {
            reward += rewardConfig.streakBonus;
        }
        
        dailyMiningClaimed[msg.sender][currentDay] = true;
        info.lastClaimDay = currentDay;
        info.totalRewards += reward;
        
        vmtToken.mint(msg.sender, reward);
        
        emit DailyMiningRewardClaimed(msg.sender, reward, info.streakDays);
    }

    // ============ 数据授权 ============

    /**
     * @dev 授权研究机构访问匿名数据
     * @param _researcher 研究机构地址
     * @param _durationDays 授权天数
     * @param _rewardPerRecord 每条数据的奖励金额
     */
    function grantDataAccess(
        address _researcher,
        uint256 _durationDays,
        uint256 _rewardPerRecord
    ) external whenNotPaused {
        require(_researcher != address(0), "Invalid researcher address");
        require(_durationDays > 0 && _durationDays <= 365, "Invalid duration");
        require(_rewardPerRecord > 0, "Reward per record must be positive");

        uint256 expiry = block.timestamp + (_durationDays * 1 days);
        dataGrants[msg.sender][_researcher] = DataGrant({
            researcher: _researcher,
            expiry: expiry,
            isGranted: true,
            rewardPerRecord: _rewardPerRecord
        });

        emit DataGranted(msg.sender, _researcher, expiry);
    }

    /**
     * @dev 撤销数据授权
     */
    function revokeDataAccess(address _researcher) external {
        require(dataGrants[msg.sender][_researcher].isGranted, "No active grant");
        delete dataGrants[msg.sender][_researcher];
        emit DataRevoked(msg.sender, _researcher);
    }

    /**
     * @dev 研究机构调用：确认使用用户数据并发放奖励
     * @param _user 用户地址
     * @param _recordIds 使用的记录ID列表
     */
    function confirmDataUsage(
        address _user,
        uint256[] calldata _recordIds
    ) external nonReentrant whenNotPaused {
        DataGrant storage grant = dataGrants[_user][msg.sender];
        require(grant.isGranted, "No active grant");
        require(grant.expiry > block.timestamp, "Grant expired");

        uint256 totalReward = 0;
        
        for (uint256 i = 0; i < _recordIds.length; i++) {
            HealthRecord storage record = healthRecords[_user][_recordIds[i]];
            require(record.isActive, "Invalid or inactive record");
            totalReward += grant.rewardPerRecord;
        }
        
        require(totalReward > 0, "No reward to distribute");
        
        // 更新用户累计奖励
        userRewardInfo[_user].totalRewards += totalReward;
        
        vmtToken.mint(_user, totalReward);
        
        emit DataContributionRewarded(_user, msg.sender, totalReward);
    }

    /**
     * @dev 研究机构查询用户授权数据列表
     */
    function getAuthorizedRecordHashes(
        address _user,
        uint256 _startId,
        uint256 _endId
    ) external view returns (bytes32[] memory, RecordType[] memory) {
        require(dataGrants[_user][msg.sender].isGranted, "Not authorized");
        require(dataGrants[_user][msg.sender].expiry > block.timestamp, "Grant expired");
        require(_endId > _startId, "Invalid range");
        
        uint256 count = _endId - _startId;
        bytes32[] memory hashes = new bytes32[](count);
        RecordType[] memory types = new RecordType[](count);
        
        for (uint256 i = 0; i < count; i++) {
            uint256 recordId = _startId + i;
            if (healthRecords[_user][recordId].isActive) {
                hashes[i] = healthRecords[_user][recordId].dataHash;
                types[i] = healthRecords[_user][recordId].recordType;
            }
        }
        
        return (hashes, types);
    }

    // ============ 查询函数 ============

    function getUserRecordCount(address _user) external view returns (uint256) {
        return userRecordCount[_user];
    }

    function getUserStreakDays(address _user) external view returns (uint256) {
        return userRewardInfo[_user].streakDays;
    }

    function getUserTotalRewards(address _user) external view returns (uint256) {
        return userRewardInfo[_user].totalRewards;
    }

    function hasClaimedToday(address _user) external view returns (bool) {
        uint256 currentDay = block.timestamp / 1 days;
        return dailyMiningClaimed[_user][currentDay];
    }

    // ============ 管理员函数 ============

    function updateRewardConfig(RewardConfig calldata _newConfig) external onlyRole(REWARD_CONFIG_ROLE) {
        rewardConfig = _newConfig;
        emit RewardConfigUpdated(_newConfig);
    }

    function pause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _pause();
    }

    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
    }
}