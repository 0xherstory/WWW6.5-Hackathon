// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title HerRiseToken
 * @dev ERC-20 token with minting permissions and faucet functionality
 */
contract HerRiseToken is ERC20, Ownable {
    // Minter permission management
    mapping(address => bool) public minters;
    
    // Faucet management
    uint256 public constant FAUCET_AMOUNT = 1000 * 10**18; // 1000 HRT
    mapping(address => bool) public hasClaimed;
    
    event MinterSet(address indexed minter, bool status);
    event FaucetClaimed(address indexed user, uint256 amount);
    
    constructor() ERC20("HerRise Token", "HRT") Ownable(msg.sender) {
        // Owner is automatically a minter
        minters[msg.sender] = true;
    }
    
    /**
     * @dev Set minter permission for an address
     * @param minter Address to set permission for
     * @param status True to grant minting permission, false to revoke
     */
    function setMinter(address minter, bool status) external onlyOwner {
        require(minter != address(0), "Invalid minter address");
        minters[minter] = status;
        emit MinterSet(minter, status);
    }
    
    /**
     * @dev Mint tokens to an address (only callable by authorized minters)
     * @param to Address to mint tokens to
     * @param amount Amount of tokens to mint
     */
    function mint(address to, uint256 amount) external {
        require(minters[msg.sender], "Caller is not a minter");
        require(to != address(0), "Cannot mint to zero address");
        _mint(to, amount);
    }
    
    /**
     * @dev Faucet function - allows users to claim test tokens once
     */
    function faucet() external {
        require(!hasClaimed[msg.sender], "Already claimed from faucet");
        hasClaimed[msg.sender] = true;
        _mint(msg.sender, FAUCET_AMOUNT);
        emit FaucetClaimed(msg.sender, FAUCET_AMOUNT);
    }
}
