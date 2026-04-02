// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Reputation {
    mapping(address => int) public score;
    address public manager;

    constructor() {
        manager = msg.sender;
    }

    modifier onlyManager() {
        require(msg.sender == manager, "Not manager");
        _;
    }

    function increase(address user) external onlyManager {
        score[user] += 1;
    }

    function decrease(address user) external onlyManager {
        score[user] -= 1;
    }
}