// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title MoodToken (MOOD)
 * @notice ERC-20 token for 情绪星域.
 *         - claimWelcomeBonus()  : 首次连接钱包奖励 10 MOOD，每个地址只能领一次
 *         - mint(to, amount)     : owner 铸币（用于完成练习、共鸣等后续奖励）
 *         - transferOwnership()  : 转移合约控制权
 */
contract MoodToken {

    /* ─── ERC-20 基础字段 ─── */
    string  public constant name     = "MOOD Token";
    string  public constant symbol   = "MOOD";
    uint8   public constant decimals = 18;

    uint256 public totalSupply;

    mapping(address => uint256)                     public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    /* ─── 业务字段 ─── */
    uint256 public constant WELCOME_BONUS = 10 * 10 ** 18; // 10 MOOD

    mapping(address => bool) public hasClaimed; // 是否已领取首次连接奖励

    address public owner;

    /* ─── 事件 ─── */
    event Transfer(address indexed from,    address indexed to,      uint256 value);
    event Approval(address indexed _owner,  address indexed spender, uint256 value);
    event WelcomeClaimed(address indexed user, uint256 amount);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    /* ─── 修饰符 ─── */
    modifier onlyOwner() {
        require(msg.sender == owner, "MoodToken: not owner");
        _;
    }

    /* ─── 构造函数 ─── */
    constructor() {
        owner = msg.sender;
    }

    /* ─── ERC-20 标准函数 ─── */
    function transfer(address to, uint256 amount) external returns (bool) {
        require(balanceOf[msg.sender] >= amount, "MoodToken: insufficient balance");
        unchecked {
            balanceOf[msg.sender] -= amount;
            balanceOf[to]         += amount;
        }
        emit Transfer(msg.sender, to, amount);
        return true;
    }

    function approve(address spender, uint256 amount) external returns (bool) {
        allowance[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);
        return true;
    }

    function transferFrom(address from, address to, uint256 amount) external returns (bool) {
        require(balanceOf[from]             >= amount, "MoodToken: insufficient balance");
        require(allowance[from][msg.sender] >= amount, "MoodToken: insufficient allowance");
        unchecked {
            allowance[from][msg.sender] -= amount;
            balanceOf[from]             -= amount;
            balanceOf[to]               += amount;
        }
        emit Transfer(from, to, amount);
        return true;
    }

    /* ─── 内部铸币 ─── */
    function _mint(address to, uint256 amount) internal {
        require(to != address(0), "MoodToken: mint to zero address");
        totalSupply    += amount;
        balanceOf[to]  += amount;
        emit Transfer(address(0), to, amount);
    }

    /* ─── 业务函数 ─── */

    /**
     * @notice 首次连接钱包奖励。每个地址只能调用一次。
     *         前端在 connectMetaMask() 连接成功后调用此函数。
     */
    function claimWelcomeBonus() external {
        require(!hasClaimed[msg.sender], "MoodToken: already claimed");
        hasClaimed[msg.sender] = true;
        _mint(msg.sender, WELCOME_BONUS);
        emit WelcomeClaimed(msg.sender, WELCOME_BONUS);
    }

    /**
     * @notice owner 铸币——用于后端奖励（完成练习 +1 MOOD、共鸣 +5 MOOD 等）。
     * @param to     接收地址
     * @param amount 数量（注意需乘以 10**18，例如 1 MOOD = 1e18）
     */
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }

    /**
     * @notice 转移合约控制权。
     */
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "MoodToken: zero address");
        emit OwnershipTransferred(owner, newOwner);
        owner = newOwner;
    }
}
