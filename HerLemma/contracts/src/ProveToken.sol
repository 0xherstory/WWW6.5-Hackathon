// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./Owned.sol";

error ProveTokenNotMinter();
error NonTransferable();

contract ProveToken is Owned {
    string public constant name = "HerLemma PROVE";
    string public constant symbol = "PROVE";
    uint8 public constant decimals = 18;

    uint256 public totalSupply;

    mapping(address => uint256) public balanceOf;
    mapping(address => bool) public minters;

    event Transfer(address indexed from, address indexed to, uint256 value);
    event MinterUpdated(address indexed account, bool allowed);

    constructor(address initialOwner) Owned(initialOwner) {
        minters[initialOwner] = true;
        emit MinterUpdated(initialOwner, true);
    }

    modifier onlyMinter() {
        if (!minters[msg.sender]) revert ProveTokenNotMinter();
        _;
    }

    function setMinter(address account, bool allowed) external onlyOwner {
        if (account == address(0)) revert ZeroAddress();
        minters[account] = allowed;
        emit MinterUpdated(account, allowed);
    }

    function mint(address to, uint256 amount) external onlyMinter {
        if (to == address(0)) revert ZeroAddress();
        totalSupply += amount;
        balanceOf[to] += amount;
        emit Transfer(address(0), to, amount);
    }

    function allowance(address, address) external pure returns (uint256) {
        return 0;
    }

    function approve(address, uint256) external pure returns (bool) {
        revert NonTransferable();
    }

    function transfer(address, uint256) external pure returns (bool) {
        revert NonTransferable();
    }

    function transferFrom(address, address, uint256) external pure returns (bool) {
        revert NonTransferable();
    }
}
