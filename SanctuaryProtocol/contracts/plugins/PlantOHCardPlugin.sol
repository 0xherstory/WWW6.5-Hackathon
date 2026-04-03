// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "../interfaces/ISanctuaryPlugin.sol";
import "../interfaces/ISanctuaryProtocol.sol";

/**
 * @title PlantOHCardPlugin
 * @dev 植物OH卡疗愈插件 - 庇护所协议的第一个范式插件
 * @notice 将OH卡疗愈工具封装为可插拔的协议组件
 */
contract PlantOHCardPlugin is ISanctuaryPlugin, Ownable {
    
    // ============ 数据结构 ============
    
    /// @dev 用户活动记录
    struct Activity {
        bytes32 proofHash;      // IPFS哈希
        string activityType;    // 活动类型
        uint256 timestamp;      // 时间戳
        bool exists;            // 是否存在
    }
    
    /// @dev 用户疗愈记录
    struct HealingRecord {
        uint256[] cardIds;      // 选中的卡牌ID
        bytes32 journalHash;    // 日记IPFS哈希
        uint256 duration;       // 疗愈时长（秒）
        uint256 timestamp;      // 时间戳
    }
    
    // ============ 状态变量 ============
    
    /// @notice 庇护所协议合约地址
    address public protocol;
    
    /// @notice 用户活动记录
    mapping(address => Activity[]) public userActivities;
    
    /// @notice 用户疗愈记录
    mapping(address => HealingRecord[]) public userRecords;
    
    /// @notice 用户活动计数
    mapping(address => uint256) public activityCount;
    
    /// @notice 用户记录计数
    mapping(address => uint256) public recordCount;
    
    /// @notice 用户证明哈希索引，O(1) 查找
    mapping(address => mapping(bytes32 => bool)) public userProofExists;
    
    /// @notice 最小疗愈时长（1分钟）- 测试用
    uint256 public constant MIN_HEALING_DURATION = 1 minutes;
    
    /// @notice 最小日记长度（10字符）- 测试用
    uint256 public constant MIN_JOURNAL_LENGTH = 10;
    
    // ============ 事件 ============
    
    event ActivityRecorded(address indexed user, string activityType, bytes32 proofHash);
    event HealingCompleted(address indexed user, uint256[] cardIds, bytes32 journalHash, uint256 duration);
    event ProtocolUpdated(address indexed oldProtocol, address indexed newProtocol);
    
    // ============ 修饰符 ============
    
    modifier onlyProtocol() {
        require(msg.sender == protocol, "Only protocol can call");
        _;
    }
    
    // ============ 构造函数 ============
    
    constructor(address _protocol, address _owner) Ownable(_owner) {
        require(_protocol != address(0), "Invalid protocol");
        protocol = _protocol;
    }
    
    // ============ ISanctuaryPlugin 实现 ============
    
    /**
     * @notice 获取插件信息
     */
    function getPluginInfo() external pure override returns (
        string memory name,
        string memory version,
        PluginType pluginType,
        string memory description
    ) {
        return (
            "PlantOHCard",
            "1.0.0",
            PluginType.SELF_HELP,
            "Plant-based healing OH card system with journaling and IPFS storage"
        );
    }
    
    /**
     * @notice 验证用户的工作量证明
     * @param user 用户地址
     * @param proofData 证明数据（编码的 HealingRecord）
     */
    function verifyProofOfWork(address user, bytes calldata proofData) external view override returns (bool) {
        if (proofData.length == 0) {
            // 如果没有提供证明数据，检查用户是否有活动记录
            return activityCount[user] > 0;
        }
        
        // 解码证明数据
        try this.decodeProof(proofData) returns (bytes32 proofHash) {
            // O(1) 查找
            return userProofExists[user][proofHash];
        } catch {
            return false;
        }
    }
    
    /**
     * @notice 记录用户活动
     * @param user 用户地址
     * @param activityType 活动类型
     * @param proofHash 证明哈希
     * @dev 只能由协议合约调用或用户自己记录
     */
    function recordActivity(
        address user, 
        string calldata activityType, 
        bytes32 proofHash
    ) external override {
        require(
            msg.sender == protocol || msg.sender == user,
            "Only protocol or user can record"
        );
        require(bytes(activityType).length > 0, "Empty activity type");
        require(proofHash != bytes32(0), "Invalid proof hash");
        
        userActivities[user].push(Activity({
            proofHash: proofHash,
            activityType: activityType,
            timestamp: block.timestamp,
            exists: true
        }));
        
        // 更新索引
        userProofExists[user][proofHash] = true;
        
        activityCount[user]++;
        
        emit ActivityRecorded(user, activityType, proofHash);
    }
    
    // ============ 核心功能 ============
    
    /**
     * @notice 完成疗愈并请求拨付
     * @param cardIds 选中的卡牌ID数组
     * @param journalHash 日记IPFS哈希
     * @param duration 疗愈时长（秒）
     * @param journalLength 日记长度（字符数）
     * @dev 由用户自己调用，完成疗愈后自动请求协议拨付
     */
    function completeHealingAndRequestPayout(
        uint256[] calldata cardIds,
        bytes32 journalHash,
        uint256 duration,
        uint256 journalLength
    ) external {
        address user = msg.sender;
        
        require(cardIds.length > 0, "No cards selected");
        require(journalHash != bytes32(0), "Invalid journal hash");
        require(duration >= MIN_HEALING_DURATION, "Healing too short");
        require(journalLength >= MIN_JOURNAL_LENGTH, "Journal too short");
        
        // 记录疗愈
        userRecords[user].push(HealingRecord({
            cardIds: cardIds,
            journalHash: journalHash,
            duration: duration,
            timestamp: block.timestamp
        }));
        
        recordCount[user]++;
        
        // 记录活动
        bytes32 proofHash = keccak256(abi.encodePacked(user, cardIds, journalHash, block.timestamp));
        userActivities[user].push(Activity({
            proofHash: proofHash,
            activityType: "healing_completed",
            timestamp: block.timestamp,
            exists: true
        }));
        activityCount[user]++;
        
        emit HealingCompleted(user, cardIds, journalHash, duration);
        emit ActivityRecorded(user, "healing_completed", proofHash);
        
        // 请求协议拨付
        uint256 payoutAmount = calculatePayout(cardIds.length, duration, journalLength);
        ISanctuaryProtocol(protocol).pluginRequestPayout(user, payoutAmount);
    }
    
    /**
     * @notice 计算拨付金额
     * @param cardCount 卡牌数量
     * @param duration 疗愈时长
     * @param journalLength 日记长度
     */
    function calculatePayout(
        uint256 cardCount,
        uint256 duration,
        uint256 journalLength
    ) public pure returns (uint256) {
        // 基础金额
        uint256 baseAmount = 0.01 ether;
        
        // 根据卡牌数量加成（最多3张）
        uint256 cardBonus = cardCount > 3 ? 0.005 ether : (cardCount - 1) * 0.001 ether;
        
        // 根据时长加成（最多30分钟）
        uint256 durationBonus = duration > 30 minutes ? 0.005 ether : (duration / 10 minutes) * 0.001 ether;
        
        // 根据日记长度加成（最多1000字符）
        uint256 journalBonus = journalLength > 1000 ? 0.005 ether : (journalLength / 200) * 0.001 ether;
        
        return baseAmount + cardBonus + durationBonus + journalBonus;
    }
    
    // ============ 管理员功能 ============
    
    /**
     * @notice 更新协议地址
     * @param newProtocol 新协议地址
     */
    function setProtocol(address newProtocol) external onlyOwner {
        require(newProtocol != address(0), "Invalid protocol");
        address old = protocol;
        protocol = newProtocol;
        emit ProtocolUpdated(old, newProtocol);
    }
    
    // ============ 查询函数 ============
    
    /**
     * @notice 获取用户活动列表
     */
    function getUserActivities(address user) external view returns (Activity[] memory) {
        return userActivities[user];
    }
    
    /**
     * @notice 获取用户疗愈记录
     */
    function getUserRecords(address user) external view returns (HealingRecord[] memory) {
        return userRecords[user];
    }
    
    /**
     * @notice 获取用户活动数量
     */
    function getActivityCount(address user) external view returns (uint256) {
        return activityCount[user];
    }
    
    /**
     * @notice 获取用户记录数量
     */
    function getRecordCount(address user) external view returns (uint256) {
        return recordCount[user];
    }
    
    /**
     * @notice 解码证明数据（辅助函数）
     */
    function decodeProof(bytes calldata data) external pure returns (bytes32) {
        require(data.length == 32, "Invalid proof data");
        return abi.decode(data, (bytes32));
    }
}
