// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title PleafToken
 * @dev $PLEAF 治理代币
 * - 可自由转移和交易
 * - 通过 $SEED 转换获得（100 SEED → 1 PLEAF）
 * - 用于市场交易和 DAO 投票
 * - 1 PLEAF = 1 投票权
 */
contract PleafToken is ERC20, Ownable {
    // SeedToken 合约地址（允许调用 mintForConversion）
    address public seedToken;

    // 事件
    event PleafMinted(address indexed to, uint256 amount, string reason);
    event PleafBurned(address indexed from, uint256 amount, string reason);

    constructor() ERC20("Plant DAO Leaf", "PLEAF") {}

    /**
     * @dev 设置 SeedToken 合约地址
     */
    function setSeedToken(address _seedToken) external onlyOwner {
        seedToken = _seedToken;
    }

    /**
     * @dev 由 SeedToken 合约调用，在 SEED→PLEAF 转换时铸造
     */
    function mintForConversion(address to, uint256 amount) external {
        require(msg.sender == seedToken, "Only SeedToken can mint");
        _mint(to, amount);
        emit PleafMinted(to, amount, "SEED conversion");
    }

    /**
     * @dev 治理奖励铸造（仅 owner/DAO 可调用）
     */
    function mintGovernanceReward(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
        emit PleafMinted(to, amount, "Governance reward");
    }

    /**
     * @dev 查询用户的投票权（= PLEAF 余额）
     */
    function getVotingPower(address account) external view returns (uint256) {
        return balanceOf(account);
    }
}