// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title Vault
 * @dev 资金托管合约：负责光合契约所有项目的资金存取，仅限 Manager 调用。
 */

contract Vault {
   // 记录每个 Goal ID 对应的总资金池（包含奖金、押金、仲裁费）
    mapping(uint => uint) public goalPools;
    address public manager;// GoalManager 合约地址
    address public treasury; //国库地址（用于接收罚没款和仲裁费）
// --- 事件 ---
    event Deposited(uint indexed goalId, uint amount);
    event PaidOut(uint indexed goalId, address indexed to, uint amount);
    event TreasuryUpdated(address indexed newTreasury);

// --- 权限控制 ---
    modifier onlyManager() {
        require(msg.sender == manager, "Vault: Only Manager can call");
        _;
    }
// 初始化时绑定 Manager 地址
    constructor(address _manager) {
        manager = _manager;
        treasury = msg.sender; // 默认初始化国库为部署者
    }

/**
     * @notice 设置/更新国库地址
     * @dev 只有 Manager（或后续通过 DAO）可以修改
     */
   function setTreasury(address _t) external onlyManager {
        require(_t != address(0), "Invalid address");
        treasury = _t;
        emit TreasuryUpdated(_t);
    }

/**
     * @notice 强制清空池子并上缴国库
     * @dev 用于处理 PARTNER_FAULT 时残留的押金或争议结余
     */
    function withdrawExcess(uint goalId) external onlyManager {
        uint remaining = goalPools[goalId];
        if (remaining > 0) {
            goalPools[goalId] = 0; 
            (bool success, ) = payable(treasury).call{value: remaining}("");
            require(success, "Vault: Treasury transfer failed");
        }
        
    }


/**
     * @notice 存入资金
     * @param goalId 目标 ID，用于将资金归类到特定项目池
     */
    function deposit(uint goalId) external payable onlyManager {
        goalPools[goalId] += msg.value;
        emit Deposited(goalId, msg.value);
    }

   /**
     * @notice 拨付资金
     * @param goalId 从哪个项目池出账
     * @param to 接收地址
     * @param amount 金额
     */
    function payout(uint goalId, address to, uint amount) external onlyManager {
        require(goalPools[goalId] >= amount, "Vault: Goal pool insufficient");

        goalPools[goalId] -= amount;

        (bool success, ) = payable(to).call{value: amount}("");
        require(success, "Vault: Transfer failed");
        
        emit PaidOut(goalId, to, amount);
    }
    // 显式声明，方便 GoalManager 查询国库地址
    function getTreasury() external view returns (address) {
        return treasury;
    }
    // 允许接收 ETH（用于某些特殊情况）
    receive() external payable {}
}