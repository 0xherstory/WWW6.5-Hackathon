// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

interface IUserManagement {
    function registeredUsers(address user) external view returns (bool);
}

contract RiskManagement is AccessControl, ReentrancyGuard {
    bytes32 public constant DAO_ROLE = keccak256("DAO_ROLE");
    bytes32 public constant INSTITUTION_ROLE = keccak256("INSTITUTION_ROLE"); // 研究机构角色

    IUserManagement public userManagement;

    struct RiskEvent {
        uint256 eventId;
        address user;
        uint64 timestamp;
        uint16 accelLoad;
        uint16 postureLoad;
        uint16 durationScore;
        uint8 symptomsFlag;
        uint16 totalRisk;
        string activityType;
        string location; // 在前端建议改为 Date/Time 展示
    }

    mapping(address => RiskEvent[]) private userRiskHistory;
    uint256 public totalEventsLogged;
    uint256 public dataAccessFee = 0.01 ether; // 机构购买单次数据的费用

    event RiskEventLogged(address indexed user, uint256 indexed eventId, uint16 risk);
    event DataPurchased(address indexed institution, uint256 count);

    constructor(address admin, address _userManagement) {
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(DAO_ROLE, admin);
        userManagement = IUserManagement(_userManagement);
    }

    /**
     * @notice 用户提交风险事件
     * 逻辑：执行 FMEA 风险评估并存证
     */
    function submitRiskEvent(
        uint16 _accelLoad,
        uint16 _postureLoad,
        uint16 _durationScore,
        uint8 _symptomsFlag,
        string calldata _activityType,
        string calldata _location
    ) external nonReentrant {
        require(userManagement.registeredUsers(msg.sender), "EyeChain: User not registered");

        // 幂等性/防刷检查
        uint256 historyCount = userRiskHistory[msg.sender].length;
        if (historyCount > 0) {
            require(block.timestamp - userRiskHistory[msg.sender][historyCount-1].timestamp > 30 seconds, "EyeChain: Anti-spam 30s");
        }

        // 调用硬核 FMEA RPN 算法
        uint16 totalRisk = _computeRisk(_accelLoad, _postureLoad, _durationScore, _symptomsFlag);

        uint256 newEventId = totalEventsLogged++;
        userRiskHistory[msg.sender].push(RiskEvent({
            eventId: newEventId,
            user: msg.sender,
            timestamp: uint64(block.timestamp),
            accelLoad: _accelLoad,
            postureLoad: _postureLoad,
            durationScore: _durationScore,
            symptomsFlag: _symptomsFlag,
            totalRisk: totalRisk,
            activityType: _activityType,
            location: _location
        }));

        emit RiskEventLogged(msg.sender, newEventId, totalRisk);
    }

    /**
     * @dev 内部算法：FMEA RPN (Severity * Occurrence * Detection)
     * 确保单一指标过高（如低头6小时）会直接导致爆表
     */
    function _computeRisk(
        uint16 _accel,
        uint16 _posture,
        uint16 _duration,
        uint8 _symptoms
    ) internal pure returns (uint16) {
        uint32 s = (_posture / 10) + 1;   // Posture Load -> Severity
        uint32 o = (_duration / 10) + 1;  // Duration Score -> Occurrence
        
        uint32 rpn = s * o; // 乘法效应

        if (_accel > 70) rpn = (rpn * 15) / 10; // 动态波动惩罚
        if (_symptoms > 0) rpn += 30;           // 探测失效惩罚

        return rpn > 100 ? 100 : uint16(rpn);
    }

    /**
     * @notice 商业逻辑：机构支付费用购买匿名数据
     * 解决“只出不进”问题：资金进入 DAO 合约
     */
    function purchaseData(uint256 _requestCount) external payable onlyRole(INSTITUTION_ROLE) {
        require(msg.value >= dataAccessFee * _requestCount, "EyeChain: Insufficient payment");
        // 逻辑：此时数据将通过后端/预言机脱敏发往机构
        emit DataPurchased(msg.sender, _requestCount);
    }

    // --- 查询函数 ---

    function getUserHistory(address _user) external view returns (RiskEvent[] memory) {
        return userRiskHistory[_user];
    }

    function getLastEvent(address _user) external view returns (RiskEvent memory) {
        uint256 len = userRiskHistory[_user].length;
        require(len > 0, "No records");
        return userRiskHistory[_user][len - 1];
    }

    // DAO 管理：调整数据售价或提取资金
    function withdrawFunds() external onlyRole(DAO_ROLE) {
        payable(msg.sender).transfer(address(this).balance);
    }
}
