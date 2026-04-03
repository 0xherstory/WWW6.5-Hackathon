// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuardTransient.sol";
import "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "./interfaces/ISanctuaryPlugin.sol";

/**
 * @title SanctuaryProtocolV2
 * @dev 庇护所协议 v2.2 - 平台化生态基础设施 (UUPS 可升级)
 * @notice 双边经济资金分配插件，支持即插即用的范式扩展
 */
contract SanctuaryProtocolV2 is 
    Initializable, 
    OwnableUpgradeable, 
    ReentrancyGuardTransient, 
    PausableUpgradeable,
    UUPSUpgradeable 
{
    
    // ============ 枚举 ============
    
    /// @dev 插件状态
    enum PluginStatus { NONE, PENDING_AUDIT, IN_SANDBOX, ACTIVE, SUSPENDED, DEPRECATED }
    
    // ============ 数据结构 ============
    
    /// @dev 插件信息
    struct PluginInfo {
        PluginType pluginType;
        PluginStatus status;
        uint256 allowance;           // 总预算
        uint256 spentToday;          // 今日已支出
        uint256 lastPayoutReset;     // 上次重置时间
        address auditor;             // 审计机构
        uint256 registeredAt;        // 注册时间
        uint256 sandboxEnd;          // 沙盒期结束时间
    }
    
    /// @dev 托管资金（预留接口，v2.3实现）
    struct Escrow {
        address user;
        address provider;
        uint256 amount;
        uint256 lockedAt;
        uint256 releaseTime;
        bool disputed;
        bool released;
    }
    
    /// @dev 捐赠记录
    struct Donation {
        address donor;
        uint256 amount;
        uint256 timestamp;
    }
    
    /// @dev 领取记录
    struct Claim {
        address recipient;
        uint256 amount;
        uint256 timestamp;
        bytes32 emailHash;
    }
    
    /// @dev 多签提案
    struct Proposal {
        bytes32 proposalHash;
        address target;
        bytes callData;
        uint256 value;
        uint256 createdAt;
        uint256 executedAt;
        uint256 approvalCount;
        bool executed;
        mapping(address => bool) hasApproved;
    }
    
    // ============ 常量 ============
    
    /// @notice 储备金比例 20%
    uint256 public constant RESERVE_RATIO = 20;
    
    /// @notice 验证有效期 24 小时
    uint256 public constant VERIFICATION_VALIDITY = 24 hours;
    
    /// @notice 合约版本
    string public constant VERSION = "2.2.0";
    
    // ============ 状态变量 ============
    
    /// @notice 资金池余额
    uint256 public poolBalance;
    
    /// @notice 沙盒期（可配置，默认7天）
    uint256 public sandboxPeriod;
    
    /// @notice 初始插件额度
    uint256 public initialPluginAllowance;
    
    /// @notice 紧急模式
    bool public emergencyMode;
    
    /// @notice 暂停守护者
    address public pauseGuardian;
    
    /// @notice 多签治理
    address[] public guardians;
    mapping(address => bool) public isGuardian;
    uint256 public requiredApprovals;
    mapping(bytes32 => Proposal) public proposals;
    bytes32[] public proposalList;
    
    /// @notice 插件注册表
    mapping(address => PluginInfo) public plugins;
    address[] public pluginList;
    
    /// @notice 角色分离：地址累计捐赠金额
    mapping(address => uint256) public totalDonated;
    
    /// @notice 角色分离：地址已领取
    mapping(address => bool) public hasClaimed;
    
    /// @notice 邮箱验证时间
    mapping(bytes32 => uint256) public emailVerificationTime;
    
    /// @notice 邮箱哈希绑定的钱包地址
    mapping(bytes32 => address) public emailToWallet;
    
    /// @notice 邮箱哈希已使用
    mapping(bytes32 => bool) public emailHashUsed;
    
    /// @notice 托管资金（预留）
    mapping(bytes32 => Escrow) public escrows;
    uint256 public escrowCount;
    
    /// @notice 捐赠记录
    Donation[] public donations;
    
    /// @notice 领取记录
    Claim[] public claims;
    
    // ============ 事件 ============
    
    event Donated(address indexed donor, uint256 amount, uint256 timestamp);
    event Claimed(address indexed recipient, uint256 amount, uint256 timestamp);
    event PluginSubmitted(address indexed plugin, address indexed auditor);
    event PluginAuditConfirmed(address indexed plugin);
    event PluginRegistered(address indexed plugin, uint256 allowance);
    event PluginSuspended(address indexed plugin);
    event PluginPayout(address indexed plugin, address indexed user, uint256 amount);
    event EmailVerified(bytes32 indexed emailHash, address wallet, uint256 timestamp);
    event GuardianUpdated(address indexed oldGuardian, address indexed newGuardian);
    event SandboxPeriodUpdated(uint256 newPeriod);
    event EmergencyModeToggled(bool enabled);
    event ProposalCreated(bytes32 indexed proposalHash, address indexed creator);
    event ProposalApproved(bytes32 indexed proposalHash, address indexed guardian);
    event ProposalExecuted(bytes32 indexed proposalHash);
    event GuardianAdded(address indexed guardian);
    event GuardianRemoved(address indexed guardian);
    
    // ============ 修饰符 ============

    modifier onlyGuardian() {
        require(isGuardian[msg.sender], "Not guardian");
        _;
    }

    modifier onlyActivePlugin() {
        require(plugins[msg.sender].status == PluginStatus.ACTIVE, "Not active plugin");
        _;
    }

    modifier notDonor() {
        require(totalDonated[msg.sender] == 0, "Donors cannot claim");
        _;
    }

    modifier notClaimed() {
        require(!hasClaimed[msg.sender], "Already claimed");
        _;
    }

    /// @dev 用于多签提案执行的上下文检查
    bool private _executingProposal;
    modifier onlyViaProposal() {
        require(_executingProposal, "Must be called via proposal");
        _;
    }

    // ============ 构造函数（仅用于实现合约部署） ============
    
    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }
    
    // ============ 初始化函数（替代构造函数） ============
    
    function initialize(
        address _initialOwner,
        address[] calldata _guardians,
        uint256 _requiredApprovals
    ) public initializer {
        require(_initialOwner != address(0), "Invalid owner");
        require(_guardians.length > 0, "Need at least one guardian");
        require(_requiredApprovals > 0 && _requiredApprovals <= _guardians.length, "Invalid required approvals");
        
        __Ownable_init(_initialOwner);
        __Pausable_init();
        // UUPSUpgradeable is stateless in v5, no initializer needed
        // ReentrancyGuard in v5 doesn't need initialization, _status defaults to 0 which means NOT_ENTERED
        
        // 设置默认参数
        sandboxPeriod = 7 days;
        initialPluginAllowance = 1 ether;
        
        // 设置多签治理
        for (uint256 i = 0; i < _guardians.length; i++) {
            require(_guardians[i] != address(0), "Invalid guardian");
            require(!isGuardian[_guardians[i]], "Duplicate guardian");
            isGuardian[_guardians[i]] = true;
            guardians.push(_guardians[i]);
        }
        requiredApprovals = _requiredApprovals;
        
        // 第一个守护者也是暂停守护者
        pauseGuardian = _guardians[0];
    }
    
    // ============ UUPS 授权升级 ============
    
    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}
    
    // ============ 核心功能：捐赠 ============
    
    function donate() external payable nonReentrant whenNotPaused {
        require(msg.value > 0, "Amount must be > 0");
        
        poolBalance += msg.value;
        totalDonated[msg.sender] += msg.value;
        
        donations.push(Donation({
            donor: msg.sender,
            amount: msg.value,
            timestamp: block.timestamp
        }));
        
        emit Donated(msg.sender, msg.value, block.timestamp);
    }
    
    // ============ 核心功能：邮箱验证领取 ============
    
    function verifyEmail(bytes32 emailHash, address wallet) external onlyOwner whenNotPaused {
        require(!emailHashUsed[emailHash], "Email already claimed");
        require(totalDonated[wallet] == 0, "Donors cannot claim");
        require(!hasClaimed[wallet], "Address already claimed");
        
        emailVerificationTime[emailHash] = block.timestamp;
        emailToWallet[emailHash] = wallet;
        
        emit EmailVerified(emailHash, wallet, block.timestamp);
    }
    
    function claimWithEmailVerification(bytes32 emailHash) 
        external 
        nonReentrant 
        whenNotPaused
        // 移除 notClaimed 修饰符，允许多次领取
        notDonor
    {
        require(emailVerificationTime[emailHash] > 0, "Email not verified");
        require(!emailHashUsed[emailHash], "Email already claimed");
        require(emailToWallet[emailHash] == msg.sender, "Email not bound to wallet");
        require(
            block.timestamp <= emailVerificationTime[emailHash] + VERIFICATION_VALIDITY,
            "Verification expired"
        );
        
        uint256 amount = getDynamicClaimAmount();
        require(amount > 0, "No funds available");
        require(poolBalance >= amount, "Insufficient pool");
        
        _executeClaim(msg.sender, amount, emailHash);
    }
    
    // ============ 核心功能：插件系统 ============
    
    function submitPlugin(address plugin, address auditor) external onlyOwner {
        require(plugin != address(0), "Invalid plugin");
        require(auditor != address(0), "Invalid auditor");
        require(plugins[plugin].status == PluginStatus.NONE, "Plugin already exists");
        
        try ISanctuaryPlugin(plugin).getPluginInfo() returns (string memory, string memory, PluginType, string memory) {
            // 接口检查通过
        } catch {
            revert("Plugin must implement ISanctuaryPlugin");
        }
        
        plugins[plugin] = PluginInfo({
            pluginType: PluginType.SELF_HELP,
            status: PluginStatus.PENDING_AUDIT,
            allowance: 0,
            spentToday: 0,
            lastPayoutReset: 0,
            auditor: auditor,
            registeredAt: 0,
            sandboxEnd: 0
        });
        
        pluginList.push(plugin);
        
        emit PluginSubmitted(plugin, auditor);
    }
    
    function confirmAudit(address plugin) external {
        PluginInfo storage info = plugins[plugin];
        require(info.status == PluginStatus.PENDING_AUDIT, "Not pending audit");
        require(msg.sender == info.auditor, "Not assigned auditor");
        
        info.status = PluginStatus.IN_SANDBOX;
        info.sandboxEnd = block.timestamp + sandboxPeriod;
        
        emit PluginAuditConfirmed(plugin);
    }
    
    function registerPlugin(address plugin) external {
        require(msg.sender == owner() || _executingProposal, "Only owner or proposal");
        PluginInfo storage info = plugins[plugin];
        require(info.status == PluginStatus.IN_SANDBOX, "Not in sandbox");
        // 移除沙盒期检查，允许立即注册
        // require(block.timestamp >= info.sandboxEnd, "Sandbox not ended");

        (, , PluginType pType, ) = ISanctuaryPlugin(plugin).getPluginInfo();

        info.pluginType = pType;
        info.status = PluginStatus.ACTIVE;
        info.allowance = initialPluginAllowance;
        info.registeredAt = block.timestamp;
        info.lastPayoutReset = block.timestamp;

        emit PluginRegistered(plugin, initialPluginAllowance);
    }

    function suspendPlugin(address plugin) external {
        require(msg.sender == owner() || _executingProposal, "Only owner or proposal");
        require(plugins[plugin].status == PluginStatus.ACTIVE, "Plugin not active");
        plugins[plugin].status = PluginStatus.SUSPENDED;
        emit PluginSuspended(plugin);
    }
    
    function pluginRequestPayout(address user, uint256 amount) 
        external 
        onlyActivePlugin 
        nonReentrant 
        whenNotPaused 
    {
        PluginInfo storage plugin = plugins[msg.sender];
        
        _resetDailySpending(plugin);
        
        require(amount > 0, "Amount must be > 0");
        require(poolBalance >= amount, "Insufficient pool");
        require(totalDonated[user] == 0, "Donors cannot claim");
        require(plugin.spentToday + amount <= plugin.allowance, "Exceeds allowance");
        
        uint256 available = _getAvailableBalance();
        require(amount <= available, "Exceeds available (reserve protected)");
        
        plugin.spentToday += amount;
        poolBalance -= amount;
        
        claims.push(Claim({
            recipient: user,
            amount: amount,
            timestamp: block.timestamp,
            emailHash: bytes32(0)
        }));
        
        emit PluginPayout(msg.sender, user, amount);
        
        (bool success, ) = payable(user).call{value: amount}("");
        require(success, "Transfer failed");
    }
    
    // ============ 多签治理 ============
    
    function createProposal(bytes calldata callData, address target, uint256 value)
        external
        onlyGuardian
        returns (bytes32)
    {
        bytes32 proposalHash = keccak256(abi.encodePacked(callData, target, value, block.timestamp, msg.sender));

        Proposal storage proposal = proposals[proposalHash];
        proposal.proposalHash = proposalHash;
        proposal.target = target;
        proposal.callData = callData;
        proposal.value = value;
        proposal.createdAt = block.timestamp;
        proposal.approvalCount = 0;
        proposal.executed = false;

        proposalList.push(proposalHash);

        emit ProposalCreated(proposalHash, msg.sender);

        // 创建者自动批准
        _approveProposal(proposalHash, msg.sender);

        return proposalHash;
    }
    
    function approveProposal(bytes32 proposalHash) external onlyGuardian {
        _approveProposal(proposalHash, msg.sender);
    }
    
    function _approveProposal(bytes32 proposalHash, address guardian) internal {
        Proposal storage proposal = proposals[proposalHash];
        require(proposal.proposalHash != bytes32(0), "Proposal not found");
        require(!proposal.executed, "Already executed");
        require(!proposal.hasApproved[guardian], "Already approved");
        require(block.timestamp <= proposal.createdAt + 7 days, "Proposal expired");
        
        proposal.hasApproved[guardian] = true;
        proposal.approvalCount++;
        
        emit ProposalApproved(proposalHash, guardian);
        
        // 如果达到所需批准数，自动执行
        if (proposal.approvalCount >= requiredApprovals) {
            executeProposal(proposalHash);
        }
    }
    
    function executeProposal(bytes32 proposalHash) public onlyGuardian nonReentrant {
        Proposal storage proposal = proposals[proposalHash];
        require(proposal.proposalHash != bytes32(0), "Proposal not found");
        require(!proposal.executed, "Already executed");
        require(proposal.approvalCount >= requiredApprovals, "Not enough approvals");

        // 先标记为已执行，防止重入
        proposal.executed = true;
        proposal.executedAt = block.timestamp;

        emit ProposalExecuted(proposalHash);

        // 实际执行提案调用（在状态变更之后，遵循 Checks-Effects-Interactions）
        _executingProposal = true;
        (bool success, ) = proposal.target.call{value: proposal.value}(proposal.callData);
        _executingProposal = false;

        require(success, "Proposal execution failed");
    }
    
    function addGuardian(address newGuardian) external onlyOwner {
        require(newGuardian != address(0), "Invalid address");
        require(!isGuardian[newGuardian], "Already guardian");
        
        isGuardian[newGuardian] = true;
        guardians.push(newGuardian);
        
        emit GuardianAdded(newGuardian);
    }
    
    function removeGuardian(address guardian) external onlyOwner {
        require(isGuardian[guardian], "Not guardian");
        require(guardians.length > requiredApprovals, "Cannot remove below required");
        
        isGuardian[guardian] = false;
        
        // 从数组中移除
        for (uint256 i = 0; i < guardians.length; i++) {
            if (guardians[i] == guardian) {
                guardians[i] = guardians[guardians.length - 1];
                guardians.pop();
                break;
            }
        }
        
        emit GuardianRemoved(guardian);
    }
    
    // ============ 预留接口：资金托管（v2.3实现） ============
    
    function requestEscrow(bytes32, address, address, uint256) external pure {
        revert("Escrow not available in v2.2");
    }
    
    function releaseEscrow(bytes32) external pure {
        revert("Escrow not available in v2.2");
    }
    
    function disputeEscrow(bytes32, string calldata) external pure {
        revert("Escrow not available in v2.2");
    }
    
    function resolveDispute(bytes32, bool) external pure {
        revert("Escrow not available in v2.2");
    }
    
    // ============ 管理员功能 ============
    
    function setSandboxPeriod(uint256 newPeriod) external {
        require(msg.sender == owner() || _executingProposal, "Only owner or proposal");
        sandboxPeriod = newPeriod;
        emit SandboxPeriodUpdated(newPeriod);
    }

    function setPluginAllowance(address plugin, uint256 allowance) external {
        require(msg.sender == owner() || _executingProposal, "Only owner or proposal");
        require(plugins[plugin].status == PluginStatus.ACTIVE, "Plugin not active");
        plugins[plugin].allowance = allowance;
    }

    function toggleEmergencyMode() external {
        require(msg.sender == owner() || _executingProposal, "Only owner or proposal");
        emergencyMode = !emergencyMode;
        emit EmergencyModeToggled(emergencyMode);
    }

    function setPauseGuardian(address newGuardian) external onlyOwner {
        require(newGuardian != address(0), "Invalid address");
        require(isGuardian[newGuardian], "Must be guardian");
        address old = pauseGuardian;
        pauseGuardian = newGuardian;
        emit GuardianUpdated(old, newGuardian);
    }
    
    function emergencyWithdrawReserve(uint256 amount) external onlyOwner {
        uint256 reserve = (poolBalance * RESERVE_RATIO) / 100;
        require(amount <= reserve, "Exceeds reserve");
        
        poolBalance -= amount;
        
        (bool success, ) = payable(owner()).call{value: amount}("");
        require(success, "Transfer failed");
    }
    
    function pause() external onlyGuardian {
        _pause();
    }
    
    function unpause() external onlyGuardian {
        _unpause();
    }
    
    // ============ 查询函数 ============
    
    function getDynamicClaimAmount() public view returns (uint256) {
        if (emergencyMode) return 0.005 ether;
        if (poolBalance < 5 ether) return 0.005 ether;
        if (poolBalance < 10 ether) return 0.01 ether;
        if (poolBalance < 50 ether) return 0.015 ether;
        return 0.02 ether;
    }
    
    function getPoolStatus() external view returns (
        uint256 balance,
        uint256 reserveAmount,
        uint256 available,
        uint256 donationCount,
        uint256 claimCount,
        uint256 currentClaimAmount,
        string memory mode
    ) {
        balance = poolBalance;
        reserveAmount = (poolBalance * RESERVE_RATIO) / 100;
        available = _getAvailableBalance();
        donationCount = donations.length;
        claimCount = claims.length;
        currentClaimAmount = getDynamicClaimAmount();
        
        if (emergencyMode) mode = "emergency";
        else if (poolBalance < 5 ether) mode = "emergency";
        else if (poolBalance < 10 ether) mode = "low";
        else if (poolBalance < 50 ether) mode = "conservative";
        else mode = "normal";
    }
    
    function getPluginCount() external view returns (uint256) {
        return pluginList.length;
    }
    
    function isDonor(address account) external view returns (bool) {
        return totalDonated[account] > 0;
    }
    
    function getGuardians() external view returns (address[] memory) {
        return guardians;
    }
    
    function getGuardianCount() external view returns (uint256) {
        return guardians.length;
    }
    
    // ============ 内部函数 ============
    
    function _executeClaim(address recipient, uint256 amount, bytes32 emailHash) internal {
        // 移除 hasClaimed 设置，允许多次领取
        // hasClaimed[recipient] = true;
        emailHashUsed[emailHash] = true;
        poolBalance -= amount;
        
        claims.push(Claim({
            recipient: recipient,
            amount: amount,
            timestamp: block.timestamp,
            emailHash: emailHash
        }));
        
        emit Claimed(recipient, amount, block.timestamp);
        
        (bool success, ) = payable(recipient).call{value: amount}("");
        require(success, "Transfer failed");
    }
    
    function _getAvailableBalance() internal view returns (uint256) {
        uint256 reserve = (poolBalance * RESERVE_RATIO) / 100;
        return poolBalance > reserve ? poolBalance - reserve : 0;
    }
    
    function _resetDailySpending(PluginInfo storage plugin) internal {
        if (block.timestamp >= plugin.lastPayoutReset + 1 days) {
            plugin.spentToday = 0;
            plugin.lastPayoutReset = block.timestamp;
        }
    }
    
    // ============ 接收函数 ============
    
    receive() external payable nonReentrant {
        if (msg.value > 0) {
            poolBalance += msg.value;
            totalDonated[msg.sender] += msg.value;
            donations.push(Donation(msg.sender, msg.value, block.timestamp));
            emit Donated(msg.sender, msg.value, block.timestamp);
        }
    }
}
