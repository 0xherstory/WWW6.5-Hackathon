// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title UserManagement
 * @dev 修复了 Counters 库依赖问题，适配 OpenZeppelin 5.0+ 标准
 */
contract UserManagement is AccessControl {
    // 替代 Counters 库，直接使用简单的 uint256 自增
    uint256 private _nextUserId = 1; 
    
    bytes32 public constant DAO_ROLE = keccak256("DAO_ROLE");
    
    struct UserProfile {
        uint256 userId;
        address userAddress;
        uint8 vulnerabilityScore;
        uint8 baselineRisk;
        bool hasRetinalDetachment;
        bool hasRetinalHoles;
        bool postOpStatus;
        uint8 surgeryType;
        uint8 laserTreatmentCount;
        uint256 registeredAt;
        bool isActive;
        bytes32 dataSharingLevel;
    }
    
    mapping(address => UserProfile) public profiles;
    mapping(address => bool) public registeredUsers;
    
    uint256 public totalUsers;
    
    event UserRegistered(address indexed user, uint256 userId);
    event ProfileUpdated(address indexed user);
    
    modifier onlyRegistered() {
        require(registeredUsers[msg.sender], "User not registered");
        _;
    }
    
    constructor(address admin) {
        // 设置初始管理员
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(DAO_ROLE, admin);
    }

    /**
     * @dev 用户注册函数
     */
    function registerUser(
        uint8 _vulnerabilityScore,
        uint8 _baselineRisk,
        bool _hasRetinalDetachment,
        bool _hasRetinalHoles,
        bool _postOpStatus,
        uint8 _surgeryType,
        uint8 _laserTreatmentCount,
        bytes32 _dataSharingLevel
    ) external {
        require(!registeredUsers[msg.sender], "User already registered");

        uint256 newUserId = _nextUserId;
        _nextUserId++; // 自增 ID
        
        profiles[msg.sender] = UserProfile({
            userId: newUserId,
            userAddress: msg.sender,
            vulnerabilityScore: _vulnerabilityScore,
            baselineRisk: _baselineRisk,
            hasRetinalDetachment: _hasRetinalDetachment,
            hasRetinalHoles: _hasRetinalHoles,
            postOpStatus: _postOpStatus,
            surgeryType: _surgeryType,
            laserTreatmentCount: _laserTreatmentCount,
            registeredAt: block.timestamp,
            isActive: true,
            dataSharingLevel: _dataSharingLevel
        });

        registeredUsers[msg.sender] = true;
        totalUsers++;

        emit UserRegistered(msg.sender, newUserId);
    }

    /**
     * @dev 获取用户信息（解决结构体返回问题）
     */
    function getUserProfile(address _user) external view returns (UserProfile memory) {
        require(registeredUsers[_user], "User not found");
        return profiles[_user];
    }

    /**
     * @dev 示例：仅限 DAO 角色或特定权限调用的管理功能
     */
    function deactivateUser(address _user) external onlyRole(DAO_ROLE) {
        require(registeredUsers[_user], "User not registered");
        profiles[_user].isActive = false;
    }
}