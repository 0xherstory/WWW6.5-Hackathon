// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title SeedToken
 * @dev $SEED 行为价值代币
 * - 不可转移（只能通过照顾植物获得）
 * - 每日上限 100 SEED/人
 * - 转换比率 1000 SEED → 1 PLEAF
 * - 奖励受生态倍率影响
 */
contract SeedToken is ERC20, Ownable {
    // 护理动作奖励基数 (已调整)
    uint256 public constant WATER_REWARD = 5e18;     // 浇水 5 $SEED
    uint256 public constant FERTILIZE_REWARD = 5e18; // 施肥 5 $SEED
    uint256 public constant REPOT_REWARD = 10e18;    // 换盆 10 $SEED
    uint256 public constant PHOTO_REWARD = 2e18;     // 拍照 2 $SEED
    uint256 public constant MEDICINE_REWARD = 5e18;  // 打药 5 $SEED

    uint256 public constant QUALITY_BASE = 100;

    // 转换比率: 1000 $SEED → 1 $PLEAF
    uint256 public constant CONVERSION_RATE = 1000;

    // 每日奖励上限
    uint256 public dailyRewardCap = 100e18; // 100 SEED/天/人

    address public pleafToken;
    bool public transfersEnabled = false;

    // 用户累计
    mapping(address => uint256) public totalEarned;
    // 每日上限追踪
    mapping(address => uint256) public dailyEarned;
    mapping(address => uint256) public lastRewardDay;

    // 生态倍率 (由外部设置)
    uint256 public ecologyMultiplier = 100; // 100=1.0x

    event SeedEarned(address indexed user, uint256 amount, string action);
    event SeedsConverted(address indexed user, uint256 seedAmount, uint256 pleafAmount);
    event DailyCapUpdated(uint256 newCap);

    constructor() ERC20("Plant DAO Seed", "SEED") {}

    function setPleafToken(address _pleafToken) external onlyOwner {
        pleafToken = _pleafToken;
    }

    function setDailyRewardCap(uint256 cap) external onlyOwner {
        dailyRewardCap = cap;
        emit DailyCapUpdated(cap);
    }

    function setEcologyMultiplier(uint256 multiplier) external onlyOwner {
        ecologyMultiplier = multiplier;
    }

    /**
     * @dev 发放奖励（含每日上限检查）
     * 注意: 金额应在调用前由 PlantCare 计算好（含所有倍率）
     */
    function earnReward(address user, uint256 amount, string memory action) external onlyOwner {
        _resetDailyIfNeeded(user);
        require(dailyEarned[user] + amount <= dailyRewardCap, "Daily reward cap reached");
        _mint(user, amount);
        totalEarned[user] += amount;
        dailyEarned[user] += amount;
        emit SeedEarned(user, amount, action);
    }

    function _resetDailyIfNeeded(address user) internal {
        uint256 today = block.timestamp / 1 days;
        if (lastRewardDay[user] != today) {
            lastRewardDay[user] = today;
            dailyEarned[user] = 0;
        }
    }

    function calculateReward(
        uint256 baseReward,
        uint256 effortWeight,
        uint256 quality,
        uint256 consistency
    ) external pure returns (uint256) {
        uint256 reward = baseReward * effortWeight / 100;
        reward = reward * quality / QUALITY_BASE;
        reward = reward * (QUALITY_BASE + consistency) / QUALITY_BASE;
        return reward;
    }

    function convertToPleaf(uint256 amount) external {
        require(pleafToken != address(0), "PLEAF token not set");
        require(amount >= CONVERSION_RATE * 1e18, "Minimum conversion is 1000 SEED");
        require(balanceOf(msg.sender) >= amount, "Insufficient SEED balance");

        _burn(msg.sender, amount);
        uint256 pleafAmount = amount / CONVERSION_RATE;
        IPleafToken(pleafToken).mintForConversion(msg.sender, pleafAmount);

        emit SeedsConverted(msg.sender, amount, pleafAmount);
    }

    function transfer(address to, uint256 amount) public override returns (bool) {
        require(transfersEnabled || msg.sender == owner(), "SEED is non-transferable");
        return super.transfer(to, amount);
    }

    function transferFrom(address from, address to, uint256 amount) public override returns (bool) {
        require(transfersEnabled || from == owner(), "SEED is non-transferable");
        return super.transferFrom(from, to, amount);
    }

    function setTransfersEnabled(bool enabled) external onlyOwner {
        transfersEnabled = enabled;
    }

    function getDailyRemaining(address user) external view returns (uint256) {
        uint256 today = block.timestamp / 1 days;
        if (lastRewardDay[user] != today) return dailyRewardCap;
        return dailyRewardCap >= dailyEarned[user] ? dailyRewardCap - dailyEarned[user] : 0;
    }

    function getTotalEarned(address user) external view returns (uint256) {
        return totalEarned[user];
    }
}

interface IPleafToken {
    function mintForConversion(address to, uint256 amount) external;
}