// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract HerRhythmCheckIn {
    mapping(address => uint256) public lastCheckInDay;
    mapping(address => uint256) public streakCount;
    mapping(address => uint256) public totalCheckIns;
    mapping(address => mapping(uint256 => bool)) public checkedInOnDay;

    event CheckedIn(
        address indexed user,
        uint256 indexed day,
        uint256 streak,
        uint256 totalCheckIns
    );

    function checkIn() external {
        uint256 today = block.timestamp / 1 days;

        require(!checkedInOnDay[msg.sender][today], "Already checked in today");

        if (lastCheckInDay[msg.sender] + 1 == today) {
            streakCount[msg.sender] += 1;
        } else {
            streakCount[msg.sender] = 1;
        }

        lastCheckInDay[msg.sender] = today;
        totalCheckIns[msg.sender] += 1;
        checkedInOnDay[msg.sender][today] = true;

        emit CheckedIn(
            msg.sender,
            today,
            streakCount[msg.sender],
            totalCheckIns[msg.sender]
        );
    }

    function hasCheckedInToday(address user) external view returns (bool) {
        uint256 today = block.timestamp / 1 days;
        return checkedInOnDay[user][today];
    }

    function getStreak(address user) external view returns (uint256) {
        return streakCount[user];
    }

    function getTotalCheckIns(address user) external view returns (uint256) {
        return totalCheckIns[user];
    }

    function getLastCheckInDay(address user) external view returns (uint256) {
        return lastCheckInDay[user];
    }
}