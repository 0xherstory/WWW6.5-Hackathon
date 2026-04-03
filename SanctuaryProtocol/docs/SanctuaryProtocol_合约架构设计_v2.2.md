# SanctuaryProtocol v2.2 合约架构设计

> **版本**: v2.2.0 | **更新日期**: 2026-03-27
> **重大更新**: 从单一资金池升级为平台化生态架构

---

## 架构演进对比

| 特性 | v1.0 (旧架构) | v2.2 (新架构) |
|------|---------------|---------------|
| **核心定位** | 单一资金池 | 平台化生态基础设施 |
| **扩展方式** | 修改主合约 | 插件即插即用 |
| **治理模式** | onlyOwner | 3/5多签治理 |
| **安全机制** | 基础防护 | 审计+沙盒+预算隔离 |
| **升级能力** | 重新部署 | UUPS代理模式 |
| **Gas优化** | 单交易 | 合并交易+Relay代付 |

---

## 核心架构图

```
┌─────────────────────────────────────────────────────────────────┐
│                     Layer 3: 前端应用层                          │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐               │
│  │  OH卡界面    │ │ 咨询预约界面 │ │ 日记书写界面 │               │
│  └─────────────┘ └─────────────┘ └─────────────┘               │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Layer 2: 范式插件层                          │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐   │
│  │ PlantOHCard     │ │ CounselorService│ │   CBTJournal    │   │
│  │    子合约        │ │    子合约        │ │    子合约        │   │
│  │                 │ │                 │ │                 │   │
│  │ - 验证PoW       │ │ - 匹配咨询师     │ │ - 记录日记      │   │
│  │ - 触发拨付指令   │ │ - 托管资金       │ │ - 触发鼓励金    │   │
│  └─────────────────┘ └─────────────────┘ └─────────────────┘   │
│  职责：业务逻辑、PoW验证、指令触发                                 │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Layer 1: 庇护所协议层                        │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              SanctuaryProtocol (可升级)                  │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐   │   │
│  │  │ 资金托管  │ │ 插件注册表│ │ 预算隔离  │ │ 争议仲裁  │   │   │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘   │   │
│  │                                                         │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐   │   │
│  │  │ 多签治理  │ │ 储备金   │ │ 动态调整  │ │ 紧急开关  │   │   │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘   │   │
│  └─────────────────────────────────────────────────────────┘   │
│  职责：资金安全、插件准入、资金路由、风控治理                      │
└─────────────────────────────────────────────────────────────────┘
```

---

## 核心合约接口

### ISanctuaryProtocol (v2.2)

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title ISanctuaryProtocol
 * @dev 庇护所协议 v2.2 接口
 */
interface ISanctuaryProtocol {
    
    // ============ 插件管理 ============
    
    /// @notice 提交插件审核申请
    function submitPluginForAudit(
        address plugin,
        string calldata pluginType,
        string calldata pluginName,
        bytes32 auditReportHash
    ) external;
    
    /// @notice 审计机构确认审计结果
    function confirmAudit(address plugin, bool passed) external;
    
    /// @notice 正式注册插件（多签）
    function registerPlugin(
        address plugin,
        string calldata pluginType,
        string calldata pluginName
    ) external;
    
    /// @notice 设置插件提款额度
    function setPluginAllowance(address plugin, uint256 allowance) external;
    
    // ============ 资金拨付 ============
    
    /// @notice 插件请求资金拨付
    function pluginRequestPayout(
        address user,
        address payee,
        uint256 amount,
        string calldata payoutType,
        bytes32 proofHash
    ) external;
    
    /// @notice 请求资金托管（人力范式）
    function requestEscrow(
        bytes32 sessionId,
        address user,
        address provider,
        uint256 amount,
        bytes32 proofHash
    ) external;
    
    /// @notice 释放托管资金
    function releaseEscrow(bytes32 sessionId) external;
    
    /// @notice 发起争议
    function disputeEscrow(bytes32 sessionId, string calldata reason) external;
    
    /// @notice 解决争议
    function resolveDispute(
        bytes32 sessionId,
        bool refundToUser,
        string calldata resolution
    ) external;
    
    // ============ 用户额度 ============
    
    /// @notice 验证通过后自动授予额度
    function onVerificationSuccess(address user, bytes32 emailHash) external;
    
    /// @notice 管理员手动提额
    function upgradeWelfareQuota(address user, uint8 tier) external;
    
    // ============ 资金池管理 ============
    
    /// @notice 捐赠并收藏
    function donateAndMint(uint256 cardId) external payable;
    
    /// @notice 获取动态拨付金额
    function getDynamicClaimAmount() external view returns (uint256);
    
    /// @notice 获取可用余额（扣除储备金）
    function getAvailableBalance() external view returns (uint256);
    
    /// @notice 检查资金池状态
    function checkPoolStatus() external;
    
    // ============ 治理 ============
    
    /// @notice 设置多签治理地址
    function setMultisigGovernance(address _multisig) external;
    
    /// @notice 添加审计机构
    function addAuditor(address auditor) external;
    
    /// @notice 设置低余额预警阈值
    function setLowBalanceThreshold(uint256 threshold) external;
    
    /// @notice 紧急提取储备金
    function emergencyWithdrawReserve(uint256 amount) external;
    
    // ============ 查询 ============
    
    /// @notice 获取插件信息
    function approvedPlugins(address plugin) external view returns (
        address pluginAddress,
        string memory pluginType,
        string memory pluginName,
        bool isActive,
        uint256 registeredAt,
        uint256 totalPayouts,
        uint256 totalAmount
    );
    
    /// @notice 获取用户福利额度
    function userWelfareQuota(address user) external view returns (uint256);
    
    /// @notice 获取用户已使用额度
    function userWelfareUsed(address user) external view returns (uint256);
    
    /// @notice 获取插件提款额度
    function pluginAllowance(address plugin) external view returns (uint256);
    
    /// @notice 获取托管信息
    function escrows(bytes32 sessionId) external view returns (
        address user,
        address provider,
        uint256 amount,
        uint256 lockedAt,
        uint256 releaseTime,
        bool disputed,
        bool released
    );
}
```

---

### ISanctuaryPlugin (插件标准接口)

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title ISanctuaryPlugin
 * @dev 庇护所范式插件标准接口 v2.2
 */
interface ISanctuaryPlugin {
    
    /// @notice 插件类型枚举
    enum PluginType { SELF_HELP, HUMAN_SERVICE, HYBRID }
    
    /// @notice 获取插件信息
    function getPluginInfo() external view returns (
        string memory name,
        string memory version,
        PluginType pluginType,
        string memory description
    );
    
    /// @notice 验证用户是否完成工作量证明
    function verifyProofOfWork(address user, bytes calldata proofData) external view returns (bool);
    
    /// @notice 记录用户行为
    function recordActivity(
        address user, 
        string calldata activityType, 
        bytes32 proofHash
    ) external;
    
    /// @notice 触发资金拨付请求
    function requestPayout(
        address user,
        address payee,
        uint256 amount,
        string calldata payoutType,
        bytes32 proofHash
    ) external;
    
    /// @notice 记录并请求资金拨付（Gas优化：合并交易）
    /// @dev PRD 8.6.1：将记录和拨付合并为一次交易
    function recordAndRequestPayout(
        address user,
        bytes32 proofHash,
        uint256[] calldata cardIds,      // OH卡ID列表
        uint256 duration,                // 活动时长
        uint256 journalLength            // 日记长度
    ) external;
    
    /// @notice 获取用户在当前插件的统计数据
    function getUserStats(address user) external view returns (
        uint256 activityCount,
        uint256 lastActivityTime,
        bool isEligibleForAid
    );
    
    /// @notice 插件激活状态
    function isActive() external view returns (bool);
    
    // --- 事件 ---
    
    event ActivityRecorded(
        address indexed user,
        string activityType,
        bytes32 proofHash,
        uint256 timestamp
    );
    
    event PayoutRequested(
        address indexed user,
        address indexed payee,
        uint256 amount,
        string payoutType
    );
}
```

---

## 核心数据结构

### 插件信息

```solidity
/// @dev 插件信息
struct PluginInfo {
    address pluginAddress;      // 插件合约地址
    string pluginType;          // 插件类型
    string pluginName;          // 插件名称
    bool isActive;              // 是否激活
    uint256 registeredAt;       // 注册时间
    uint256 totalPayouts;       // 总拨付次数
    uint256 totalAmount;        // 总拨付金额
}

/// @dev 插件审核信息
struct PluginAudit {
    address plugin;
    AuditStatus status;         // 审核状态
    uint256 submittedAt;        // 提交时间
    uint256 auditCompletedAt;   // 审计完成时间
    uint256 sandboxEndTime;     // 沙盒结束时间
    bytes32 auditReportHash;    // 审计报告IPFS哈希
    address[] auditors;         // 审计机构列表
    bool hasSecurityAudit;      // 是否通过安全审计
    uint256 initialAllowance;   // 初始额度限制
}

enum AuditStatus { 
    PENDING,    // 待审核
    AUDITING,   // 审核中
    SANDBOX,    // 沙盒测试
    APPROVED,   // 已批准
    REJECTED    // 已拒绝
}
```

### 资金相关

```solidity
/// @dev 托管资金结构
struct Escrow {
    address user;           // 受助者
    address provider;       // 服务提供者
    uint256 amount;         // 金额
    uint256 lockedAt;       // 锁定时间
    uint256 releaseTime;    // 可释放时间
    bool disputed;          // 是否有争议
    bool released;          // 是否已释放
}

/// @dev 支付请求
struct PayoutRequest {
    address user;           // 受助者地址
    address payee;          // 实际收款人
    uint256 amount;         // 金额
    string payoutType;      // 支付类型
    bytes32 proofHash;      // 工作量证明哈希
    uint256 requestedAt;    // 请求时间
}
```

---

## 状态变量

```solidity
contract SanctuaryProtocol is 
    UUPSUpgradeable, 
    OwnableUpgradeable, 
    ReentrancyGuardUpgradeable,
    PausableUpgradeable
{
    // ===== 版本 =====
    string public constant VERSION = "2.2.0";
    
    // ===== 资金池 =====
    uint256 public poolBalance;                     // 资金池总余额
    uint256 public constant RESERVE_RATIO = 20;     // 储备金比例 20%
    uint256 public lowBalanceThreshold;             // 低余额预警阈值
    bool public lowBalanceWarningTriggered;         // 是否已触发预警
    bool public emergencyMode;                      // 紧急模式
    
    // ===== 每日限额 =====
    uint256 public dailyPayoutLimit;                // 每日最大拨付限额
    uint256 public todayPayoutAmount;               // 当日已拨付金额
    uint256 public lastPayoutDay;                   // 最后拨付日期
    
    // ===== 插件管理 =====
    mapping(address => PluginInfo) public approvedPlugins;      // 合法插件
    mapping(address => PluginAudit) public pluginAudits;        // 插件审核信息
    mapping(address => uint256) public pluginAllowance;         // 插件提款额度
    mapping(address => uint256) public pluginPayoutToday;       // 插件当日拨付
    address[] public pluginList;                                // 插件列表
    
    // ===== 治理 =====
    address public multisigGovernance;              // 多签治理地址
    mapping(address => bool) public approvedAuditors; // 审计机构白名单
    
    // ===== 用户额度 =====
    mapping(address => uint256) public userWelfareQuota;  // 用户福利额度
    mapping(address => uint256) public userWelfareUsed;   // 用户已使用额度
    
    // ===== 托管 =====
    mapping(bytes32 => Escrow) public escrows;      // 托管记录
    bytes32[] public escrowList;                    // 托管列表
    
    // ===== 支付记录 =====
    PayoutRequest[] public payoutHistory;           // 支付历史
    
    // ===== 捐赠记录 =====
    mapping(address => uint256) public totalDonated;    // 地址累计捐赠
    Donation[] public donations;                        // 捐赠记录
    
    // ===== 常量 =====
    uint256 public constant VERIFICATION_VALIDITY = 24 hours;   // 验证有效期
    uint256 public constant DISPUTE_PERIOD = 24 hours;          // 争议期
    uint256 public constant SANDBOX_PERIOD = 7 days;            // 沙盒期
    uint256 public constant INITIAL_PLUGIN_ALLOWANCE = 1 ether; // 初始插件额度
    uint256 public constant BASE_QUOTA = 0.05 ether;            // 基础额度
}
```

---

## 核心功能实现

### 1. 插件准入流程

```solidity
/**
 * @notice 提交插件审核申请
 * @dev 任何人都可以提交，但需要提供审计报告
 */
function submitPluginForAudit(
    address plugin,
    string calldata pluginType,
    string calldata pluginName,
    bytes32 auditReportHash
) external {
    require(plugin.code.length > 0, "Not a contract");
    require(auditReportHash != bytes32(0), "Audit report required");
    
    pluginAudits[plugin] = PluginAudit({
        plugin: plugin,
        status: AuditStatus.PENDING,
        submittedAt: block.timestamp,
        auditCompletedAt: 0,
        sandboxEndTime: 0,
        auditReportHash: auditReportHash,
        auditors: new address[](0),
        hasSecurityAudit: false,
        initialAllowance: 0
    });
    
    emit PluginAuditSubmitted(plugin, msg.sender, auditReportHash);
}

/**
 * @notice 审计机构确认审计结果
 * @dev 仅白名单审计机构可调用
 */
function confirmAudit(address plugin, bool passed) external {
    require(approvedAuditors[msg.sender], "Not approved auditor");
    PluginAudit storage audit = pluginAudits[plugin];
    require(audit.status == AuditStatus.PENDING, "Invalid status");
    
    audit.auditors.push(msg.sender);
    
    if (passed) {
        audit.hasSecurityAudit = true;
        audit.status = AuditStatus.SANDBOX;
        audit.sandboxEndTime = block.timestamp + SANDBOX_PERIOD;
        audit.initialAllowance = INITIAL_PLUGIN_ALLOWANCE;
        emit PluginEnterSandbox(plugin, audit.sandboxEndTime);
    } else {
        audit.status = AuditStatus.REJECTED;
        emit PluginAuditRejected(plugin, msg.sender);
    }
}

/**
 * @notice 正式注册插件
 * @dev 需要多签批准，且沙盒期已结束
 */
function registerPlugin(
    address plugin,
    string calldata pluginType,
    string calldata pluginName
) external onlyMultisig {
    PluginAudit storage audit = pluginAudits[plugin];
    
    require(audit.status == AuditStatus.SANDBOX, "Not in sandbox");
    require(block.timestamp >= audit.sandboxEndTime, "Sandbox not ended");
    require(audit.hasSecurityAudit, "Security audit required");
    
    // 审计机构数量要求（测试网 vs 主网）
    // 测试网：1家审计机构即可
    // 主网：至少2家审计机构
    uint256 requiredAuditors = block.chainid == 1 ? 2 : 1;  // 1 = Ethereum Mainnet
    require(audit.auditors.length >= requiredAuditors, "Insufficient auditors");
    
    // 验证接口
    try ISanctuaryPlugin(plugin).getPluginInfo() returns (
        string memory, string memory, ISanctuaryPlugin.PluginType, string memory
    ) {} catch {
        revert("Invalid plugin interface");
    }
    
    // 注册插件
    approvedPlugins[plugin] = PluginInfo({
        pluginAddress: plugin,
        pluginType: pluginType,
        pluginName: pluginName,
        isActive: true,
        registeredAt: block.timestamp,
        totalPayouts: 0,
        totalAmount: 0
    });
    
    pluginAllowance[plugin] = audit.initialAllowance;
    pluginList.push(plugin);
    audit.status = AuditStatus.APPROVED;
    
    emit PluginRegistered(plugin, pluginType, pluginName, block.timestamp);
}
```

### 2. 资金拨付

```solidity
/**
 * @notice 插件请求资金拨付
 * @dev 仅合法插件可调用，受多重限制
 */
function pluginRequestPayout(
    address user,
    address payee,
    uint256 amount,
    string calldata payoutType,
    bytes32 proofHash
) external nonReentrant whenNotPaused withinDailyLimit(amount) {
    // 验证插件合法性
    require(approvedPlugins[msg.sender].isActive, "Not approved plugin");
    
    // 检查插件额度（预算隔离）
    require(amount <= pluginAllowance[msg.sender], "Exceeds plugin allowance");
    require(pluginPayoutToday[msg.sender] + amount <= pluginAllowance[msg.sender], 
            "Plugin daily limit exceeded");
    
    // 验证用户身份
    require(totalDonated[user] == 0, "Donors cannot receive aid");
    require(userWelfareUsed[user] + amount <= userWelfareQuota[user], 
            "Exceeds welfare quota");
    
    // 检查资金池
    require(poolBalance >= amount, "Insufficient pool balance");
    require(!emergencyMode || amount <= 0.005 ether, "Emergency mode: amount too high");
    
    // 更新状态
    userWelfareUsed[user] += amount;
    pluginPayoutToday[msg.sender] += amount;
    poolBalance -= amount;
    
    // 更新插件统计
    approvedPlugins[msg.sender].totalPayouts++;
    approvedPlugins[msg.sender].totalAmount += amount;
    
    // 记录支付
    payoutHistory.push(PayoutRequest({
        user: user,
        payee: payee,
        amount: amount,
        payoutType: payoutType,
        proofHash: proofHash,
        requestedAt: block.timestamp
    }));
    
    // 转账
    (bool success, ) = payable(payee).call{value: amount}("");
    require(success, "Transfer failed");
    
    emit PluginPayout(msg.sender, user, payee, amount, payoutType);
}

/**
 * @notice 记录并请求资金拨付（Gas优化：合并交易）
 * @dev PRD 8.6.1：将记录和拨付合并为一次交易，节省约50% Gas
 */
function recordAndRequestPayout(
    address user,
    bytes32 proofHash,
    uint256[] calldata cardIds,
    uint256 duration,
    uint256 journalLength
) external nonReentrant whenNotPaused withinDailyLimit(getDynamicClaimAmount()) {
    // 验证插件合法性
    require(approvedPlugins[msg.sender].isActive, "Not approved plugin");
    
    uint256 amount = getDynamicClaimAmount();
    
    // 检查插件额度
    require(amount <= pluginAllowance[msg.sender], "Exceeds plugin allowance");
    require(pluginPayoutToday[msg.sender] + amount <= pluginAllowance[msg.sender], 
            "Plugin daily limit exceeded");
    
    // 验证用户身份
    require(totalDonated[user] == 0, "Donors cannot receive aid");
    require(userWelfareUsed[user] + amount <= userWelfareQuota[user], 
            "Exceeds welfare quota");
    
    // 检查资金池
    require(poolBalance >= amount, "Insufficient pool balance");
    
    // 记录活动数据（Gas优化：一次交易中完成记录和拨付）
    // 这些数据可用于后续分析和验证
    emit ActivityRecorded(user, msg.sender, proofHash, cardIds, duration, journalLength);
    
    // 更新状态
    userWelfareUsed[user] += amount;
    pluginPayoutToday[msg.sender] += amount;
    poolBalance -= amount;
    
    // 更新插件统计
    approvedPlugins[msg.sender].totalPayouts++;
    approvedPlugins[msg.sender].totalAmount += amount;
    
    // 记录支付
    payoutHistory.push(PayoutRequest({
        user: user,
        payee: user,
        amount: amount,
        payoutType: "self-help-combined",
        proofHash: proofHash,
        requestedAt: block.timestamp
    }));
    
    // 转账
    (bool success, ) = payable(user).call{value: amount}("");
    require(success, "Transfer failed");
    
    emit PluginPayout(msg.sender, user, user, amount, "self-help-combined");
}

### 3. 资金托管（人力范式）

```solidity
/**
 * @notice 请求资金托管
 * @dev 人力范式专用，资金锁定24小时
 */
function requestEscrow(
    bytes32 sessionId,
    address user,
    address provider,
    uint256 amount,
    bytes32 proofHash
) external nonReentrant whenNotPaused {
    require(approvedPlugins[msg.sender].isActive, "Not approved plugin");
    require(
        keccak256(bytes(approvedPlugins[msg.sender].pluginType)) == 
        keccak256(bytes("human-service")), 
        "Only human-service plugins"
    );
    
    require(userWelfareUsed[user] + amount <= userWelfareQuota[user], 
            "Exceeds welfare quota");
    require(poolBalance >= amount, "Insufficient pool balance");
    
    // 创建托管
    escrows[sessionId] = Escrow({
        user: user,
        provider: provider,
        amount: amount,
        lockedAt: block.timestamp,
        releaseTime: block.timestamp + DISPUTE_PERIOD,
        disputed: false,
        released: false
    });
    
    escrowList.push(sessionId);
    
    // 预扣资金
    userWelfareUsed[user] += amount;
    poolBalance -= amount;
    
    emit EscrowCreated(sessionId, user, provider, amount, block.timestamp + DISPUTE_PERIOD);
}

/**
 * @notice 释放托管资金
 */
function releaseEscrow(bytes32 sessionId) external nonReentrant {
    Escrow storage escrow = escrows[sessionId];
    
    require(!escrow.released, "Already released");
    require(!escrow.disputed, "Under dispute");
    require(block.timestamp >= escrow.releaseTime, "Dispute period not ended");
    require(msg.sender == escrow.provider, "Only provider can release");
    
    escrow.released = true;
    
    (bool success, ) = payable(escrow.provider).call{value: escrow.amount}("");
    require(success, "Transfer failed");
    
    emit EscrowReleased(sessionId, escrow.provider, escrow.amount);
}

/**
 * @notice 发起争议
 */
function disputeEscrow(bytes32 sessionId, string calldata reason) external {
    Escrow storage escrow = escrows[sessionId];
    
    require(msg.sender == escrow.user, "Only user can dispute");
    require(block.timestamp < escrow.releaseTime, "Dispute period ended");
    require(!escrow.disputed, "Already disputed");
    require(!escrow.released, "Already released");
    
    escrow.disputed = true;
    emit EscrowDisputed(sessionId, msg.sender, reason);
}

/**
 * @notice 解决争议
 */
function resolveDispute(
    bytes32 sessionId, 
    bool refundToUser,
    string calldata resolution
) external onlyMultisig {
    Escrow storage escrow = escrows[sessionId];
    
    require(escrow.disputed, "Not disputed");
    require(!escrow.released, "Already released");
    
    escrow.released = true;
    
    if (refundToUser) {
        userWelfareUsed[escrow.user] -= escrow.amount;
        (bool success, ) = payable(escrow.user).call{value: escrow.amount}("");
        require(success, "Refund failed");
    } else {
        (bool success, ) = payable(escrow.provider).call{value: escrow.amount}("");
        require(success, "Transfer failed");
    }
    
    emit EscrowResolved(sessionId, refundToUser, resolution);
}
```

### 4. 动态资金调整

```solidity
/**
 * @notice 获取动态拨付金额
 * @dev 根据资金池余额自动调整
 */
function getDynamicClaimAmount() public view returns (uint256) {
    if (emergencyMode) {
        return 0.005 ether;  // 紧急模式
    }
    if (poolBalance < 10 ether) {
        return 0.01 ether;   // 低余额模式
    }
    if (poolBalance < 50 ether) {
        return 0.015 ether;  // 节约模式
    }
    return 0.02 ether;       // 正常模式
}

/**
 * @notice 检查资金池状态
 * @dev 任何人都可以调用，触发状态转换
 */
function checkPoolStatus() external {
    if (poolBalance <= lowBalanceThreshold && !lowBalanceWarningTriggered) {
        lowBalanceWarningTriggered = true;
        emit PoolLowWarning(poolBalance, lowBalanceThreshold);
    }
    
    if (poolBalance < 5 ether && !emergencyMode) {
        emergencyMode = true;
        emit EmergencyModeActivated(poolBalance);
    }
    
    if (poolBalance > lowBalanceThreshold * 2 && lowBalanceWarningTriggered) {
        lowBalanceWarningTriggered = false;
        emergencyMode = false;
        emit PoolStatusRecovered(poolBalance);
    }
}
```

### 5. 用户额度管理

```solidity
/**
 * @notice 验证通过后自动授予额度
 * @dev 由ZK-Email验证器调用
 */
function onVerificationSuccess(address user, bytes32 emailHash) external {
    require(msg.sender == zkEmailVerifier, "Only verifier");
    require(totalDonated[user] == 0, "Donors cannot receive quota");
    
    // 自动授予基础额度
    if (userWelfareQuota[user] == 0) {
        userWelfareQuota[user] = BASE_QUOTA;
        emit WelfareQuotaAutoGranted(user, BASE_QUOTA, "tier-1-auto");
    }
    
    emailVerificationTime[emailHash] = block.timestamp;
    emailToWallet[emailHash] = user;
    
    emit EmailVerified(emailHash, user, block.timestamp);
}

/**
 * @notice 管理员手动提额
 */
function upgradeWelfareQuota(address user, uint8 tier) external onlyMultisig {
    uint256 newQuota;
    if (tier == 2) {
        newQuota = 0.1 ether;  // 中级
    } else if (tier == 3) {
        newQuota = 0.5 ether;  // 高级
    }
    
    require(newQuota > userWelfareQuota[user], "Must be higher");
    userWelfareQuota[user] = newQuota;
    
    emit WelfareQuotaUpgraded(user, newQuota, tier);
}
```

---

## 事件定义

```solidity
// ===== 插件事件 =====
event PluginAuditSubmitted(address indexed plugin, address indexed submitter, bytes32 auditReportHash);
event PluginEnterSandbox(address indexed plugin, uint256 sandboxEndTime);
event PluginAuditRejected(address indexed plugin, address indexed auditor);
event PluginRegistered(address indexed plugin, string pluginType, string pluginName, uint256 timestamp);
event PluginAllowanceSet(address indexed plugin, uint256 allowance);

// ===== 活动记录事件（Gas优化：合并交易） =====
event ActivityRecorded(
    address indexed user,
    address indexed plugin,
    bytes32 proofHash,
    uint256[] cardIds,
    uint256 duration,
    uint256 journalLength,
    uint256 timestamp
);

// ===== 资金事件 =====
event PluginPayout(address indexed plugin, address indexed user, address indexed payee, uint256 amount, string payoutType);
event Donated(address indexed donor, uint256 indexed cardId, uint256 amount, uint256 timestamp);

// ===== 托管事件 =====
event EscrowCreated(bytes32 indexed sessionId, address indexed user, address indexed provider, uint256 amount, uint256 releaseTime);
event EscrowReleased(bytes32 indexed sessionId, address indexed provider, uint256 amount);
event EscrowDisputed(bytes32 indexed sessionId, address indexed user, string reason);
event EscrowResolved(bytes32 indexed sessionId, bool refundToUser, string resolution);

// ===== 额度事件 =====
event WelfareQuotaAutoGranted(address indexed user, uint256 quota, string tier);
event WelfareQuotaUpgraded(address indexed user, uint256 quota, uint8 tier);
event EmailVerified(bytes32 indexed emailHash, address wallet, uint256 timestamp);

// ===== 资金池事件 =====
event PoolLowWarning(uint256 balance, uint256 threshold);
event EmergencyModeActivated(uint256 balance);
event PoolStatusRecovered(uint256 balance);
event EmergencyWithdrawal(uint256 amount, uint256 timestamp);

// ===== 治理事件 =====
event MultisigGovernanceSet(address indexed multisig);
event AuditorAdded(address indexed auditor);
event UpgradeAuthorized(address indexed newImplementation);
```

---

## 部署流程

### 1. 部署准备

```typescript
// 部署参数
const deploymentParams = {
    owner: deployer.address,                    // 初始所有者
    multisig: "0x...",                          // 3/5多签地址
    claimAmount: ethers.parseEther("0.01"),     // 初始单次拨付金额
    dailyPayoutLimit: ethers.parseEther("1"),   // 每日限额
    lowBalanceThreshold: ethers.parseEther("10") // 低余额预警
};
```

### 2. 部署步骤

```typescript
// 1. 部署实现合约
const Implementation = await ethers.getContractFactory("SanctuaryProtocol");
const implementation = await Implementation.deploy();

// 2. 部署代理合约
const Proxy = await ethers.getContractFactory("ERC1967Proxy");
const proxy = await Proxy.deploy(
    implementation.address,
    Implementation.interface.encodeFunctionData("initialize", [
        deploymentParams.owner,
        deploymentParams.multisig,
        deploymentParams.claimAmount
    ])
);

// 3. 配置初始参数
const sanctuary = Implementation.attach(proxy.address);
await sanctuary.setDailyPayoutLimit(deploymentParams.dailyPayoutLimit);
await sanctuary.setLowBalanceThreshold(deploymentParams.lowBalanceThreshold);

// 4. 添加审计机构
await sanctuary.addAuditor("0x审计机构1...");
await sanctuary.addAuditor("0x审计机构2...");

console.log("SanctuaryProtocol deployed at:", proxy.address);
```

### 3. 插件部署示例

```typescript
// 部署 PlantOHCard 插件
const PlantOHCard = await ethers.getContractFactory("PlantOHCardPlugin");
const plantOHCard = await PlantOHCard.deploy(proxy.address);

// 提交审核
await sanctuary.submitPluginForAudit(
    plantOHCard.address,
    "self-help",
    "PlantOHCard",
    "0x审计报告IPFS哈希..."
);

// 审计机构确认（需要2家）
await sanctuary.connect(auditor1).confirmAudit(plantOHCard.address, true);
await sanctuary.connect(auditor2).confirmAudit(plantOHCard.address, true);

// 等待7天沙盒期...

// 多签注册
await sanctuary.connect(multisig).registerPlugin(
    plantOHCard.address,
    "self-help",
    "PlantOHCard"
);
```

---

## 安全考虑

### 1. 权限控制矩阵

| 操作 | onlyOwner | onlyMultisig | 插件 | 任何人 |
|------|-----------|--------------|------|--------|
| 升级合约 | - | ✅ | - | - |
| 注册插件 | - | ✅ | - | - |
| 设置插件额度 | - | ✅ | - | - |
| 请求资金拨付 | - | - | ✅ | - |
| 解决争议 | - | ✅ | - | - |
| 紧急提取 | - | ✅ | - | - |
| 检查资金池 | - | - | - | ✅ |
| 捐赠 | - | - | - | ✅ |

### 2. 关键安全机制

```solidity
// 重入保护
modifier nonReentrant { ... }

// 暂停保护
modifier whenNotPaused { ... }

// 多签验证
modifier onlyMultisig {
    require(msg.sender == multisigGovernance, "Only multisig");
    _;
}

// 每日限额
modifier withinDailyLimit(uint256 amount) { ... }

// 插件验证
modifier onlyApprovedPlugin {
    require(approvedPlugins[msg.sender].isActive, "Not approved");
    _;
}
```

### 3. 风险控制

| 风险 | 控制措施 |
|------|----------|
| 插件作恶 | 预算隔离 + 审计 + 沙盒 |
| 资金枯竭 | 储备金 + 动态调整 + 预警 |
| 重入攻击 | ReentrancyGuard |
| 权限滥用 | 多签治理 + 时间锁 |
| 合约Bug | UUPS可升级 |
| Gas攻击 | 限额 + 批量处理 |

---

## Gas优化策略

### 1. 交易合并（Phase 1-2）

PRD 8.6.1 提出的核心优化，将原本需要2-3次交易的流程合并为1次：

```
优化前：
1. recordActivity()    - Gas: ~45,000
2. requestPayout()     - Gas: ~65,000
3. 用户确认收款        - Gas: ~21,000
总计：~131,000 Gas

优化后：
1. recordAndRequestPayout() - Gas: ~85,000
节省：~35% Gas
```

### 2. 实现细节

```solidity
/**
 * @notice Gas优化：合并记录和拨付
 * @dev 适用于自助范式（OH卡、日记等）
 */
function recordAndRequestPayout(
    address user,
    bytes32 proofHash,
    uint256[] calldata cardIds,      // 选中的OH卡
    uint256 duration,                // 活动时长
    uint256 journalLength            // 日记字数
) external {
    // 一次交易中完成：
    // 1. 验证工作量证明
    // 2. 记录活动数据
    // 3. 计算拨付金额
    // 4. 执行资金转账
}
```

### 3. Relay网络（Phase 3）

可选的高级优化，需要额外基础设施：

```typescript
// Biconomy/Gelato 集成示例
const biconomy = new Biconomy(provider, {
    apiKey: "YOUR_API_KEY",
    strictMode: true
});

// 用户无需支付Gas，由Relayer代付
const tx = await contract.recordAndRequestPayout(
    user,
    proofHash,
    cardIds,
    duration,
    journalLength,
    { metaTx: true }  // 标记为元交易
);
```

**实施建议：**

| 阶段 | 策略 | 复杂度 | 节省Gas |
|------|------|--------|---------|
| Phase 1 | 交易合并 | 低 | 35% |
| Phase 2 | 批量处理 | 中 | 50% |
| Phase 3 | Relay网络 | 高 | 100%（用户端）|

**推荐路线：**
- ✅ **MVP阶段**：先实现交易合并（`recordAndRequestPayout`）
- ✅ **上线后**：根据实际Gas成本评估是否需要Relay网络
- ⚠️ **Relay网络需要**：额外的运维成本、Relayer资金管理、服务商依赖

---

## 升级路径

### v2.2.0 (当前)
- ✅ 平台化架构
- ✅ 插件系统
- ✅ 多签治理
- ✅ 资金托管

### v2.3.0 (未来)
- 🔄 跨链支持
- 🔄 多资产池
- 🔄 声誉系统

### v3.0.0 (长期)
- 🔄 DAO治理
- 🔄 流动性挖矿
- 🔄 保险机制

---

**文档结束**

*本文档为 Sanctuary Protocol v2.2 的合约架构设计，基于 PRD v2.2 平台化生态架构。*
