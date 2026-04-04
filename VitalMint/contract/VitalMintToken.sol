// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title VitalMint Token (VMT)
 * @dev 健康行为激励通证，支持每日铸造上限、多角色权限
 */
contract VitalMintToken is ERC20, ERC20Burnable, AccessControl, Pausable {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    bytes32 public constant REWARD_MANAGER_ROLE = keccak256("REWARD_MANAGER_ROLE");

    uint256 public constant MAX_SUPPLY = 1_000_000_000 * 10 ** 18;  // 10 亿 VMT
    uint256 public constant DAILY_MINT_LIMIT = 500_000 * 10 ** 18;   // 每日铸造上限 50 万 VMT

    uint256 public dailyMintedTotal;
    uint256 public lastResetDay;

    event DailyLimitReset(uint256 indexed day, uint256 totalMinted);

    constructor() ERC20("VitalMint Token", "VMT") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
        _grantRole(PAUSER_ROLE, msg.sender);
        _grantRole(REWARD_MANAGER_ROLE, msg.sender);
        lastResetDay = block.timestamp / 1 days;
    }

    modifier checkDailyLimit(uint256 amount) {
        uint256 currentDay = block.timestamp / 1 days;
        if (currentDay > lastResetDay) {
            dailyMintedTotal = 0;
            lastResetDay = currentDay;
            emit DailyLimitReset(currentDay, 0);
        }
        require(dailyMintedTotal + amount <= DAILY_MINT_LIMIT, "Exceeds daily mint limit");
        _;
    }

    function mint(address to, uint256 amount) 
        public 
        onlyRole(MINTER_ROLE) 
        checkDailyLimit(amount) 
        whenNotPaused 
    {
        require(totalSupply() + amount <= MAX_SUPPLY, "Exceeds max supply");
        dailyMintedTotal += amount;
        _mint(to, amount);
    }

    function pause() public onlyRole(PAUSER_ROLE) {
        _pause();
    }

    function unpause() public onlyRole(PAUSER_ROLE) {
        _unpause();
    }

    function _beforeTokenTransfer(address from, address to, uint256 amount) 
        internal 
        override 
        whenNotPaused 
    {
        super._beforeTokenTransfer(from, to, amount);
    }
}