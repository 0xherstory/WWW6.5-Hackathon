// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title Ulysses Protocol
 * @dev 基于行为金融学设计的禁买对赌协议。
 * 核心公式：W = sqrt(P * PRECISION) * min(T, 3 days)
 */
contract UlyssesProtocol is ReentrancyGuard, Ownable {
    // --- 结构体定义 ---
    struct StakeInfo {
        uint256 amount;      // 质押的本金 P
        uint256 weight;      // 计算出的权重 W
        uint256 startTime;   // 挑战开始时间
        uint256 unlockTime;  // 计划解锁事件
        uint256 rewardDebt;  // 奖励债务
        bool isActive;       // 该笔质押是否处于激活状态
    }

    // --- 全局变量 ---
    IERC20 public immutable stakingToken; 
    address public watcher;               
    
    uint256 public accRewardPerWeight;    
    uint256 public totalWeight;           
    uint256 public constant PRECISION = 1e18; 

    // 使用嵌套映射：用户地址 => 目标代币地址 => 质押信息
    mapping(address => mapping(address => StakeInfo)) public userStakes;

    // --- 事件 ---
    event Staked(address indexed user, address indexed target, uint256 amount, uint256 weight, uint256 startTime, uint256 unlockTime);
    event Slashed(address indexed offender, address indexed target, uint256 amount, uint256 accIncrease, uint256 endTime);
    event Claimed(address indexed user, address indexed target, uint256 principal, uint256 reward, uint256 endTime);

    constructor(address _stakingToken, address _watcher) Ownable(msg.sender) {
        stakingToken = IERC20(_stakingToken);
        watcher = _watcher;
    }

    /**
     * @dev 内部平方根算法 (Babylonian method)
     */
    function _sqrt(uint256 y) internal pure returns (uint256 z) {
        if (y > 3) {
            z = y;
            uint256 x = y / 2 + 1;
            while (x < z) {
                z = x;
                x = (y / x + x) / 2;
            }
        } else if (y != 0) {
            z = 1;
        }
    }

    /**
     * @notice 发起一笔针对特定代币的禁买挑战
     * @param _amount 质押金额
     * @param _duration 锁定时间（秒）
     * @param _target 严禁购买的目标代币地址
     */
    function stake(uint256 _amount, uint256 _duration, address _target) external nonReentrant {
        require(_amount > 0, "Amount zero");
        require(_target != address(0), "Target cannot be zero address");
        require(_target != address(stakingToken), "Target cannot be the staking token");
        require(!userStakes[msg.sender][_target].isActive, "Target already under challenge");

        stakingToken.transferFrom(msg.sender, address(this), _amount);

        // 数学模型还原：W = sqrt(P * PRECISION) * min(T, 3 days)
        // 引入 PRECISION 放大 P，防止 sqrt 后的数值过小导致精度丢失
        uint256 effectiveDuration = _duration > 3 days ? 3 days : _duration;
        uint256 weight = _sqrt(_amount * PRECISION) * effectiveDuration; 

        userStakes[msg.sender][_target] = StakeInfo({
            amount: _amount,
            weight: weight,
            startTime: block.timestamp,
            unlockTime: block.timestamp + _duration,
            rewardDebt: (weight * accRewardPerWeight) / PRECISION,
            isActive: true
        });

        totalWeight += weight;

        emit Staked(msg.sender, _target, _amount, weight, block.timestamp, block.timestamp + _duration);
    }

    /**
     * @notice 罚没违约者。由 Watcher 后端调用。
     * @param _offender 违约者地址
     * @param _target 违约者购买的代币地址
     */
    function slash(address _offender, address _target) external {
        require(msg.sender == watcher, "Only Watcher");
        
        StakeInfo storage info = userStakes[_offender][_target];
        require(info.isActive, "No active challenge for this target");

        uint256 slashAmount = info.amount;
        uint256 weight = info.weight;

        // 更新全局收益系数 Acc
        uint256 increase = (slashAmount * PRECISION) / totalWeight;
        accRewardPerWeight += increase;

        totalWeight -= weight;
        
        // 彻底清理映射，允许用户下次重新开启该代币的挑战，获取 Gas 返还
        delete userStakes[_offender][_target];

        emit Slashed(_offender, _target, slashAmount, increase, block.timestamp);
    }

    /**
     * @notice 挑战成功，领取本金和意志力分红
     * @param _target 对应的挑战代币地址
     */
    function claim(address _target) external nonReentrant {
        StakeInfo storage info = userStakes[msg.sender][_target];
        require(info.isActive, "No active challenge");
        require(block.timestamp >= info.unlockTime, "Still locked");

        uint256 reward = (info.weight * accRewardPerWeight / PRECISION) - info.rewardDebt;
        uint256 principal = info.amount;
        uint256 totalPayout = principal + reward;

        totalWeight -= info.weight;
        
        // 彻底清理映射，允许用户下次重新开启该代币的挑战，获取 Gas 返还
        delete userStakes[msg.sender][_target];

        stakingToken.transfer(msg.sender, totalPayout);

        emit Claimed(msg.sender, _target, principal, reward, block.timestamp);
    }

    /**
     * @dev 查看特定挑战的实时预期分红
     */
    function getPendingReward(address _user, address _target) external view returns (uint256) {
        StakeInfo storage info = userStakes[_user][_target];
        if (!info.isActive) return 0;
        return (info.weight * accRewardPerWeight / PRECISION) - info.rewardDebt;
    }

    // 只有owner可以更新watcher地址
    function setWatcher(address _newWatcher) external onlyOwner {
        require(_newWatcher != address(0), "Invalid address");
        watcher = _newWatcher;
    }
}
