// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./HerRiseToken.sol";

/**
 * @title HerRiseMain
 * @dev Core contract for HerRise platform - manages pools, tasks, and profit distribution
 */
contract HerRiseMain is Ownable {
    HerRiseToken public token;
    
    // ========== Data Structures ==========
    
    struct Pool {
        uint256 id;
        string name;
        string strategy;
        address creator;
        uint256 maxMembers;
        uint256 minDeposit;
        uint256 totalDeposits;
        uint256 memberCount;
        bool isActive;
    }
    
    struct Member {
        uint256 depositAmount;
        uint256 earnedProfit;
        bool exists;
    }
    
    struct Task {
        string title;
        string description;
        uint256 reward;
        bool isActive;
    }
    
    // ========== Storage ==========
    
    // Pool management
    uint256 public poolCount;
    mapping(uint256 => Pool) public pools;
    mapping(uint256 => mapping(address => Member)) public poolMembers;
    mapping(uint256 => address[]) public poolMemberList;
    mapping(address => uint256[]) public userPools;
    
    // Task management
    uint256 public taskCount;
    mapping(uint256 => Task) public tasks;
    mapping(address => mapping(uint256 => bool)) public completedTasks;
    mapping(address => uint256) public userTasksCompleted;
    mapping(address => uint256) public reputationScore;
    
    // ========== Events ==========
    
    event PoolCreated(uint256 indexed poolId, string name, address creator);
    event PoolJoined(uint256 indexed poolId, address member, uint256 amount);
    event DepositMade(uint256 indexed poolId, address member, uint256 amount);
    event TaskCompleted(address indexed user, uint256 taskId, uint256 reward);
    event ProfitDistributed(uint256 indexed poolId, uint256 totalProfit);
    event ReputationUpdated(address indexed user, uint256 newScore);
    
    // ========== Constructor ==========
    
    constructor(address tokenAddress) Ownable(msg.sender) {
        require(tokenAddress != address(0), "Invalid token address");
        token = HerRiseToken(tokenAddress);
    }
    
    // ========== Pool Management Functions ==========
    
    /**
     * @dev Create a new pool
     * @param name Pool name
     * @param strategy Investment strategy description
     * @param maxMembers Maximum number of members
     * @param minDeposit Minimum deposit amount
     * @return poolId The ID of the newly created pool
     */
    function createPool(
        string memory name,
        string memory strategy,
        uint256 maxMembers,
        uint256 minDeposit
    ) external returns (uint256) {
        require(bytes(name).length > 0, "Pool name cannot be empty");
        require(bytes(strategy).length > 0, "Strategy cannot be empty");
        require(maxMembers > 0, "Max members must be greater than 0");
        
        poolCount++;
        
        pools[poolCount] = Pool({
            id: poolCount,
            name: name,
            strategy: strategy,
            creator: msg.sender,
            maxMembers: maxMembers,
            minDeposit: minDeposit,
            totalDeposits: 0,
            memberCount: 1,
            isActive: true
        });
        
        // Creator automatically becomes a member with 0 initial deposit
        poolMembers[poolCount][msg.sender] = Member({
            depositAmount: 0,
            earnedProfit: 0,
            exists: true
        });
        
        poolMemberList[poolCount].push(msg.sender);
        userPools[msg.sender].push(poolCount);
        
        emit PoolCreated(poolCount, name, msg.sender);
        
        return poolCount;
    }
    
    /**
     * @dev Join an existing pool with initial deposit
     * @param poolId ID of the pool to join
     * @param amount Amount of tokens to deposit
     */
    function joinPool(uint256 poolId, uint256 amount) external {
        Pool storage pool = pools[poolId];
        require(pool.isActive, "Pool is not active");
        require(pool.memberCount < pool.maxMembers, "Pool is full");
        require(!poolMembers[poolId][msg.sender].exists, "Already a member");
        require(amount >= pool.minDeposit, "Amount below minimum deposit");
        
        // Transfer tokens from user to contract
        require(
            token.transferFrom(msg.sender, address(this), amount),
            "Token transfer failed"
        );
        
        // Add member
        poolMembers[poolId][msg.sender] = Member({
            depositAmount: amount,
            earnedProfit: 0,
            exists: true
        });
        
        poolMemberList[poolId].push(msg.sender);
        userPools[msg.sender].push(poolId);
        
        pool.memberCount++;
        pool.totalDeposits += amount;
        
        emit PoolJoined(poolId, msg.sender, amount);
    }
    
    /**
     * @dev Deposit additional tokens to a pool
     * @param poolId ID of the pool
     * @param amount Amount of tokens to deposit
     */
    function deposit(uint256 poolId, uint256 amount) external {
        Pool storage pool = pools[poolId];
        require(pool.isActive, "Pool is not active");
        require(poolMembers[poolId][msg.sender].exists, "Not a member");
        require(amount > 0, "Amount must be greater than 0");
        
        // Transfer tokens from user to contract
        require(
            token.transferFrom(msg.sender, address(this), amount),
            "Token transfer failed"
        );
        
        // Update member deposit
        poolMembers[poolId][msg.sender].depositAmount += amount;
        pool.totalDeposits += amount;
        
        emit DepositMade(poolId, msg.sender, amount);
    }
    
    /**
     * @dev Get pool information
     * @param poolId ID of the pool
     * @return Pool struct with all pool information
     */
    function getPoolInfo(uint256 poolId) external view returns (Pool memory) {
        require(poolId > 0 && poolId <= poolCount, "Invalid pool ID");
        return pools[poolId];
    }
    
    /**
     * @dev Get user's information in a specific pool
     * @param poolId ID of the pool
     * @param user Address of the user
     * @return Member struct with user's pool information
     */
    function getUserPoolInfo(uint256 poolId, address user) external view returns (Member memory) {
        require(poolId > 0 && poolId <= poolCount, "Invalid pool ID");
        return poolMembers[poolId][user];
    }
    
    /**
     * @dev Get all pools
     * @return Array of all pools
     */
    function getAllPools() external view returns (Pool[] memory) {
        Pool[] memory allPools = new Pool[](poolCount);
        for (uint256 i = 1; i <= poolCount; i++) {
            allPools[i - 1] = pools[i];
        }
        return allPools;
    }
    
    // ========== Task Management Functions ==========
    
    /**
     * @dev Add a new learning task (only owner)
     * @param title Task title
     * @param description Task description
     * @param reward Reward amount in wei
     */
    function addTask(
        string memory title,
        string memory description,
        uint256 reward
    ) external onlyOwner {
        taskCount++;
        tasks[taskCount] = Task({
            title: title,
            description: description,
            reward: reward,
            isActive: true
        });
    }
    
    /**
     * @dev Complete a learning task and receive reward
     * @param taskId ID of the task to complete
     */
    function completeTask(uint256 taskId) external {
        require(tasks[taskId].isActive, "Task does not exist");
        require(!completedTasks[msg.sender][taskId], "Task already completed");
        
        completedTasks[msg.sender][taskId] = true;
        userTasksCompleted[msg.sender]++;
        
        uint256 reward = tasks[taskId].reward;
        token.mint(msg.sender, reward);
        
        reputationScore[msg.sender] += 10;
        
        emit TaskCompleted(msg.sender, taskId, reward);
        emit ReputationUpdated(msg.sender, reputationScore[msg.sender]);
    }
    
    /**
     * @dev Check if user has completed a task
     * @param user Address of the user
     * @param taskId ID of the task
     * @return True if completed, false otherwise
     */
    function hasCompleted(address user, uint256 taskId) external view returns (bool) {
        return completedTasks[user][taskId];
    }
    
    // ========== Profit Distribution Functions ==========
    
    /**
     * @dev Distribute profit to pool members (only owner)
     * @param poolId ID of the pool
     * @param totalProfit Total profit to distribute
     */
    function distributeProfit(uint256 poolId, uint256 totalProfit) external onlyOwner {
        Pool storage pool = pools[poolId];
        require(pool.isActive, "Pool is not active");
        require(pool.totalDeposits > 0, "No deposits in pool");
        
        address[] memory members = poolMemberList[poolId];
        for (uint256 i = 0; i < members.length; i++) {
            address memberAddr = members[i];
            Member storage member = poolMembers[poolId][memberAddr];
            
            if (member.depositAmount > 0) {
                uint256 memberProfit = (totalProfit * member.depositAmount) / pool.totalDeposits;
                member.earnedProfit += memberProfit;
                token.mint(memberAddr, memberProfit);
            }
        }
        
        emit ProfitDistributed(poolId, totalProfit);
    }
    
    /**
     * @dev Get user statistics across all pools
     * @param user Address of the user
     * @return totalInvested Total amount invested
     * @return totalProfit Total profit earned
     * @return tasksCompleted Number of tasks completed
     * @return reputation Reputation score
     * @return poolsJoined Number of pools joined
     */
    function getUserStats(address user) external view returns (
        uint256 totalInvested,
        uint256 totalProfit,
        uint256 tasksCompleted,
        uint256 reputation,
        uint256 poolsJoined
    ) {
        uint256[] memory joined = userPools[user];
        poolsJoined = joined.length;
        
        for (uint256 i = 0; i < joined.length; i++) {
            uint256 pid = joined[i];
            Member memory m = poolMembers[pid][user];
            totalInvested += m.depositAmount;
            totalProfit += m.earnedProfit;
        }
        
        tasksCompleted = userTasksCompleted[user];
        reputation = reputationScore[user];
    }
}
