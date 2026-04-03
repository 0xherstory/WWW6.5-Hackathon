// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./IToken.sol";
import "./Badge.sol";

contract LearningRecord {
    IToken public token;
    Badge public badge;

    struct LearningData {
        uint256 totalLearningTime;
        uint256 totalTokensEarned;
        uint256 lastUpdated;
    }

    mapping(address => LearningData) public learningRecords;

    event LearningDataRecorded(address indexed user, uint256 totalLearningTime, uint256 totalTokensEarned);

    constructor(address _tokenAddress, address _badgeAddress) {
        token = IToken(_tokenAddress);
        badge = Badge(_badgeAddress);
    }

    function recordLearning(address user, uint256 learningTime, uint256 rewardAmount) external {
        LearningData storage record = learningRecords[user];
        
        // 更新学习记录
        record.totalLearningTime += learningTime;
        record.totalTokensEarned += rewardAmount;
        record.lastUpdated = block.timestamp;

        // 发放代币奖励
        token.mint(user, rewardAmount);

        emit LearningDataRecorded(user, record.totalLearningTime, record.totalTokensEarned);
    }

    function getLearningData(address user) external view returns (uint256, uint256, uint256) {
        LearningData memory record = learningRecords[user];
        return (record.totalLearningTime, record.totalTokensEarned, record.lastUpdated);
    }

    function issueBadgeForLearning(address user) external {
        uint256 totalLearningTime = learningRecords[user].totalLearningTime;

        if (totalLearningTime >= 1000) {
            badge.issueBadge(user, 1); // 颁发徽章
        }
    }
}