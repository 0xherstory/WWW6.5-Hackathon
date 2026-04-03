// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./IToken.sol";

contract Token is IToken {
    string public name = "LearnToken";
    string public symbol = "LT";
    uint8 public decimals = 18;
    uint256 public totalSupply;

    mapping(address => uint256) private balances;
    mapping(address => mapping(address => uint256)) private allowances;

    constructor(uint256 _initialSupply) {
        totalSupply = _initialSupply * (10 ** uint256(decimals));
        balances[msg.sender] = totalSupply;
    }

    function mint(address to, uint256 amount) external override {
        totalSupply += amount;
        balances[to] += amount;
    }

    function balanceOf(address account) external view override returns (uint256) {
        return balances[account];
    }

    function transfer(address recipient, uint256 amount) external override returns (bool) {
        require(balances[msg.sender] >= amount, "Insufficient balance");
        balances[msg.sender] -= amount;
        balances[recipient] += amount;
        return true;
    }
}