// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract Badge {
    string public constant name = "Learning Badge";

    mapping(address => uint256) public userBadges;

    event BadgeIssued(address indexed user, uint256 badgeId);

    function issueBadge(address user, uint256 badgeId) external {
        require(user != address(0), "Invalid address");
        userBadges[user] = badgeId;

        emit BadgeIssued(user, badgeId);
    }

    function getBadge(address user) external view returns (uint256) {
        return userBadges[user];
    }
}