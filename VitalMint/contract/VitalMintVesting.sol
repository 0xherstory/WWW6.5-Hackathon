// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./VitalMintToken.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title VitalMintVesting
 * @dev 奖励线性释放合约，防止用户快速抛售激励代币
 * 适用于大额奖励（如数据贡献奖励）
 */
contract VitalMintVesting is AccessControl, ReentrancyGuard {
    bytes32 public constant VESTING_MANAGER_ROLE = keccak256("VESTING_MANAGER_ROLE");

    VitalMintToken public vmtToken;

    struct VestingSchedule {
        address beneficiary;
        uint256 totalAmount;
        uint256 claimedAmount;
        uint256 startTime;
        uint256 duration;        // 释放时长（秒）
        uint256 cliff;           // 锁定期（秒）
        bool isActive;
    }

    mapping(uint256 => VestingSchedule) public vestingSchedules;
    mapping(address => uint256[]) public userVestingIds;
    uint256 public nextScheduleId;

    event VestingScheduleCreated(
        uint256 indexed scheduleId,
        address indexed beneficiary,
        uint256 totalAmount,
        uint256 startTime,
        uint256 duration,
        uint256 cliff
    );
    event VestingClaimed(uint256 indexed scheduleId, address indexed beneficiary, uint256 amount);
    event VestingRevoked(uint256 indexed scheduleId);

    constructor(address _vmtToken) {
        require(_vmtToken != address(0), "Invalid token address");
        vmtToken = VitalMintToken(_vmtToken);
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(VESTING_MANAGER_ROLE, msg.sender);
    }

    function createVestingSchedule(
        address _beneficiary,
        uint256 _totalAmount,
        uint256 _duration,
        uint256 _cliff
    ) external onlyRole(VESTING_MANAGER_ROLE) returns (uint256 scheduleId) {
        require(_beneficiary != address(0), "Invalid beneficiary");
        require(_totalAmount > 0, "Amount must be positive");
        require(_duration > 0, "Duration must be positive");
        require(_cliff <= _duration, "Cliff cannot exceed duration");

        scheduleId = nextScheduleId++;
        
        vestingSchedules[scheduleId] = VestingSchedule({
            beneficiary: _beneficiary,
            totalAmount: _totalAmount,
            claimedAmount: 0,
            startTime: block.timestamp,
            duration: _duration,
            cliff: _cliff,
            isActive: true
        });
        
        userVestingIds[_beneficiary].push(scheduleId);
        
        // 将代币转入本合约
        vmtToken.mint(address(this), _totalAmount);
        
        emit VestingScheduleCreated(scheduleId, _beneficiary, _totalAmount, block.timestamp, _duration, _cliff);
    }

    function claimVested(uint256 _scheduleId) external nonReentrant {
        VestingSchedule storage schedule = vestingSchedules[_scheduleId];
        require(schedule.isActive, "Schedule not active");
        require(schedule.beneficiary == msg.sender, "Not beneficiary");

        uint256 claimableAmount = _getClaimableAmount(_scheduleId);
        require(claimableAmount > 0, "No claimable amount");

        schedule.claimedAmount += claimableAmount;
        
        require(vmtToken.transfer(msg.sender, claimableAmount), "Transfer failed");
        
        emit VestingClaimed(_scheduleId, msg.sender, claimableAmount);
    }

    function _getClaimableAmount(uint256 _scheduleId) internal view returns (uint256) {
        VestingSchedule storage schedule = vestingSchedules[_scheduleId];
        
        if (!schedule.isActive) return 0;
        if (block.timestamp < schedule.startTime + schedule.cliff) return 0;
        if (block.timestamp >= schedule.startTime + schedule.duration) {
            return schedule.totalAmount - schedule.claimedAmount;
        }
        
        uint256 elapsed = block.timestamp - schedule.startTime;
        uint256 vestedAmount = (schedule.totalAmount * elapsed) / schedule.duration;
        return vestedAmount - schedule.claimedAmount;
    }

    function getClaimableAmount(uint256 _scheduleId) external view returns (uint256) {
        return _getClaimableAmount(_scheduleId);
    }

    function getUserVestingSchedules(address _user) external view returns (uint256[] memory) {
        return userVestingIds[_user];
    }

    function getUserTotalVesting(address _user) external view returns (uint256 totalVesting, uint256 totalClaimed, uint256 totalClaimable) {
        uint256[] memory ids = userVestingIds[_user];
        for (uint256 i = 0; i < ids.length; i++) {
            VestingSchedule storage schedule = vestingSchedules[ids[i]];
            if (schedule.isActive) {
                totalVesting += schedule.totalAmount;
                totalClaimed += schedule.claimedAmount;
                totalClaimable += _getClaimableAmount(ids[i]);
            }
        }
    }

    function revokeVestingSchedule(uint256 _scheduleId) external onlyRole(DEFAULT_ADMIN_ROLE) {
        VestingSchedule storage schedule = vestingSchedules[_scheduleId];
        require(schedule.isActive, "Schedule not active");
        
        uint256 unclaimed = schedule.totalAmount - schedule.claimedAmount;
        schedule.isActive = false;
        
        if (unclaimed > 0) {
            vmtToken.burn(unclaimed);
        }
        
        emit VestingRevoked(_scheduleId);
    }
}