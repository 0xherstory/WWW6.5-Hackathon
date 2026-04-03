// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./UserManagement.sol";

contract RiskManagement is AccessControl, ReentrancyGuard {
    bytes32 public constant DAO_ROLE = keccak256("DAO_ROLE");

    UserManagement userManagement;

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
        string location;
    }
    
    mapping(address => RiskEvent[]) private userRiskHistory;
    uint256 public totalEventsLogged;
    
    event RiskEventLogged(address indexed user, uint256 indexed eventId, uint16 risk);
    
    constructor(address admin, address _userManagement) {
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(DAO_ROLE, admin);
        userManagement = UserManagement(_userManagement);
    }

    function submitRiskEvent(
        uint16 _accelLoad,
        uint16 _postureLoad,
        uint16 _durationScore,
        uint8 _symptomsFlag,
        string calldata _activityType,
        string calldata _location
    ) external nonReentrant {
        require(userManagement.registeredUsers(msg.sender), "User not registered");

        uint16 totalRisk = _computeRisk(_accelLoad, _postureLoad, _durationScore, msg.sender, _symptomsFlag);

        uint256 newEventId = totalEventsLogged++;
        
        RiskEvent memory newEvent = RiskEvent({
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
        });
        
        userRiskHistory[msg.sender].push(newEvent);

        emit RiskEventLogged(msg.sender, newEventId, totalRisk);
    }

    function _computeRisk(
        uint16 _accel,
        uint16 _posture,
        uint16 _duration,
        address _user,
        uint8 _symptoms
    ) internal pure returns (uint16) {
        // 计算风险评分逻辑
        return uint16(_accel + _posture + _duration); // 这里只是简单示范，实际需要根据健康评分公式来实现
    }
}