// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * Pacta - Micro Habit Staking
 * - createPact: stake into global reward pool
 * - checkin: max once per 24h, within 36h keeps streak
 * - complete automatically when checkinCount reaches durationDays
 * - claimReward: principal + pool reward share
 */
contract Pacta {
    struct Pact {
        address user;
        string habitName;
        uint256 dailyStakeWei;
        uint256 totalStakeWei;
        uint256 frequency; // 0 daily / 1 weekdays / 2 custom
        uint256 startTime;
        uint256 lastCheckin;
        uint256 durationDays;
        uint256 checkinCount;
        uint256 streak;
        bool completed;
        bool claimed;
    }

    uint256 public pactCounter;
    uint256 public rewardPoolWei;
    uint16 public rewardRateBps = 1000; // default 10%

    address public owner;

    mapping(uint256 => Pact) private pacts;
    mapping(address => uint256[]) public userPactIds;

    uint256 private constant CHECKIN_COOLDOWN = 24 hours;
    uint256 private constant STREAK_WINDOW = 36 hours;

    event PactCreated(
        uint256 indexed pactId,
        address indexed user,
        string habitName,
        uint256 dailyStakeWei,
        uint256 totalStakeWei,
        uint256 durationDays
    );
    event CheckedIn(
        uint256 indexed pactId,
        address indexed user,
        uint256 checkinCount,
        uint256 streak,
        bool completed
    );
    event RewardClaimed(
        uint256 indexed pactId,
        address indexed user,
        uint256 principalWei,
        uint256 bonusWei
    );
    event RewardRateUpdated(uint16 oldRateBps, uint16 newRateBps);

    error NotOwner();
    error InvalidAmount();
    error InvalidDuration();
    error PactNotFound();
    error NotPactOwner();
    error AlreadyCompleted();
    error AlreadyClaimed();
    error CheckinTooFrequent();
    error PactNotCompleted();
    error InsufficientPool();

    modifier onlyOwner() {
        if (msg.sender != owner) revert NotOwner();
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function setRewardRateBps(uint16 newRateBps) external onlyOwner {
        require(newRateBps <= 5000, "rate too high"); // max 50%
        uint16 oldRate = rewardRateBps;
        rewardRateBps = newRateBps;
        emit RewardRateUpdated(oldRate, newRateBps);
    }

    function createPact(
        string calldata habitName,
        uint256 frequency,
        uint256 durationDays,
        uint256 dailyStakeWei
    ) external payable {
        if (durationDays == 0) revert InvalidDuration();
        if (dailyStakeWei == 0) revert InvalidAmount();

        uint256 totalStakeWei = dailyStakeWei * durationDays;
        if (msg.value != totalStakeWei) revert InvalidAmount();

        pactCounter += 1;
        uint256 pactId = pactCounter;

        Pact storage p = pacts[pactId];
        p.user = msg.sender;
        p.habitName = habitName;
        p.dailyStakeWei = dailyStakeWei;
        p.totalStakeWei = totalStakeWei;
        p.frequency = frequency;
        p.startTime = block.timestamp;
        p.lastCheckin = 0;
        p.durationDays = durationDays;
        p.checkinCount = 0;
        p.streak = 0;
        p.completed = false;
        p.claimed = false;

        userPactIds[msg.sender].push(pactId);
        rewardPoolWei += msg.value;

        emit PactCreated(
            pactId,
            msg.sender,
            habitName,
            dailyStakeWei,
            totalStakeWei,
            durationDays
        );
    }

    function checkin(uint256 pactId) external {
        Pact storage p = pacts[pactId];
        if (p.user == address(0)) revert PactNotFound();
        if (p.user != msg.sender) revert NotPactOwner();
        if (p.completed) revert AlreadyCompleted();

        if (p.lastCheckin > 0) {
            uint256 elapsed = block.timestamp - p.lastCheckin;
            if (elapsed < CHECKIN_COOLDOWN) revert CheckinTooFrequent();
            if (elapsed <= STREAK_WINDOW) {
                p.streak += 1;
            } else {
                p.streak = 1;
            }
        } else {
            p.streak = 1;
        }

        p.lastCheckin = block.timestamp;
        p.checkinCount += 1;

        if (p.checkinCount >= p.durationDays) {
            p.completed = true;
        }

        emit CheckedIn(pactId, msg.sender, p.checkinCount, p.streak, p.completed);
    }

    function claimReward(uint256 pactId) external {
        Pact storage p = pacts[pactId];
        if (p.user == address(0)) revert PactNotFound();
        if (p.user != msg.sender) revert NotPactOwner();
        if (!p.completed) revert PactNotCompleted();
        if (p.claimed) revert AlreadyClaimed();

        uint256 principal = p.totalStakeWei;
        uint256 bonus = (rewardPoolWei * rewardRateBps) / 10000;
        uint256 payout = principal + bonus;

        if (rewardPoolWei < payout || address(this).balance < payout) revert InsufficientPool();

        p.claimed = true;
        rewardPoolWei -= payout;

        (bool ok, ) = payable(msg.sender).call{value: payout}("");
        require(ok, "transfer failed");

        emit RewardClaimed(pactId, msg.sender, principal, bonus);
    }

    function getPact(uint256 pactId) external view returns (Pact memory) {
        Pact memory p = pacts[pactId];
        if (p.user == address(0)) revert PactNotFound();
        return p;
    }

    function getUserPactIds(address user) external view returns (uint256[] memory) {
        return userPactIds[user];
    }

    function getRewardPool() external view returns (uint256) {
        return rewardPoolWei;
    }
}
