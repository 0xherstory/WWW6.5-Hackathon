# SanctuaryProtocol 合约架构设计

> 本文档包含两个部分：
> - **第一部分**：面向产品的架构说明（适合非技术人员阅读）
> - **第二部分**：技术架构设计（适合开发者阅读）

---

# 第一部分：产品架构文档

## 概念：像乐高积木一样可组合

SanctuaryProtocol 不是一个封闭的黑盒，而是一个**可以和其他dApp组合的模块**。

### 举个例子：

```
🎮 Web3游戏 dApp
├── 游戏逻辑（自己开发）
└── SanctuaryProtocol（直接集成）
    └── 资金池功能
        └── 玩家互助系统

📚 教育平台 dApp
├── 课程内容（自己开发）
└── SanctuaryProtocol（直接集成）
    └── 奖学金资金池
        └── 学生申请资助

🌱 植物疗愈 OH 卡
├── OH卡功能（自己开发）
└── SanctuaryProtocol（直接集成）
    └── 疗愈者资助池
        └── ZK-Email验证
```

**核心优势**：其他项目不需要重新开发资金池功能，直接用你们的合约。

---

## 核心功能模块

### 模块1：资金池
**功能**：接收和发放资金

**支持**：
- 💰 稳定币（USDC、USDT）
- ⛏️ 原生币（AVAX、ETH等）
- 🪙 任何ERC20代币

**流程**：
```
藏家买NFT → 资金进入池子 → 疗愈者验证 → 资金发放
```

### 模块2：验证器
**功能**：检查这个人是否符合领取条件

**当前**：ZK-Email验证器
- 用户输入邮箱
- 生成零知识证明
- 合约验证证明
- 发放资金

**未来可扩展**：
- ZK-Twitter验证器
- ZK-WorldID验证器
- 多签人工审核

**优势**：**不用改合约**，只需要更换验证器模块

### 模块3：紧急开关
**功能**：发现问题时可以暂停

**场景**：
- 🔴 发现漏洞
- 🔴 异常大量领取
- 🔴 需要紧急升级

**权限**：只有 Guardian 可以操作

### 模块4：事件记录
**功能**：记录所有重要操作

**作用**：
- 前端显示实时数据
- 数据平台生成报告
- 监控异常行为

---

## 可组合性体现

### 1. 其他dApp如何集成？

只需要3步：

```solidity
// 1. 引入接口
import "./ISanctuaryProtocol.sol";

// 2. 指向合约地址
ISanctuaryProtocol sanctuary = ISanctuaryProtocol(0x合约地址);

// 3. 调用功能
sanctuary.deposit(usdcAddress, 1000 * 1e6);  // 存入1000 USDC
sanctuary.claimAid(zkProof);                // 领取资助
```

### 2. 如何更换验证方式？

```solidity
// 只需要一行代码
sanctuary.setVerifier(newZKTwitterVerifier);
```

### 3. 如何支持新代币？

```solidity
// 自动支持所有ERC20代币
sanctuary.deposit(daiAddress, amount);
sanctuary.deposit(wbtcAddress, amount);
```

---

## 安全措施

✅ **防重复领取**：每个地址只能领一次
✅ **防重入攻击**：使用ReentrancyGuard
✅ **紧急暂停**：可随时冻结合约
✅ **验证器权限**：只有管理员可更换
✅ **资金保护**：资金只能通过验证后提取

---

## 版本管理

当前版本：`v1.0.0`

未来升级时：
- 部署 `v2.0.0` 合约
- 前端检测版本
- 平滑迁移用户

---

# 第二部分：技术架构设计

## 1. 合约概述
SanctuaryProtocol 是一个可组合的去中心化互助资金池合约，支持：
- 多种资产支持（ERC20、Native）
- 验证逻辑可插拔
- 暂停/紧急开关
- 版本化管理

## 2. 核心接口

### 2.1 验证器接口
```solidity
interface IVerifier {
    /// @notice 验证申请者是否符合资助条件
    /// @param applicant 申请者地址
    /// @param proof 零知识证明数据
    /// @return true 验证通过，false 验证失败
    function verify(address applicant, bytes calldata proof) external returns (bool);
}
```

### 2.2 主合约接口
```solidity
interface ISanctuaryProtocol {
    // --- 核心功能 ---

    /// @notice 存入资金到资金池
    /// @param token 代币地址（address(0)表示原生币）
    /// @param amount 存入金额
    function deposit(address token, uint256 amount) external payable;

    /// @notice 申请并领取资助
    /// @param proof ZK证明
    function claimAid(bytes calldata proof) external;

    /// @notice 更换验证器
    /// @param newVerifier 新验证器地址
    function setVerifier(IVerifier newVerifier) external;

    // --- 紧急控制 ---

    /// @notice 暂停合约
    function pause() external;

    /// @notice 恢复合约
    function unpause() external;

    // --- 查询功能 ---

    /// @notice 获取合约版本
    function version() external pure returns (string memory);

    /// @notice 检查地址是否已领取
    function hasClaimed(address) external view returns (bool);

    /// @notice 获取资金池余额
    function getPoolBalance(address token) external view returns (uint256);
}
```

## 3. 事件定义

### 3.1 为什么需要标准化事件？

**类比说明**：
- 传统餐厅：收银员收钱 → 没记录 → 老板不知道卖了多少钱
- 有收银系统：收银员收钱 → 打印小票 → 可以统计、审计

**智能合约事件 = 链上"小票系统"**

### 3.2 事件定义

```solidity
/// @notice 资金存入事件
/// @param donor 捐赠者地址
/// @param token 代币地址（address(0)表示原生币）
/// @param amount 存入金额
/// @param timestamp 时间戳
event FundDeposited(
    address indexed donor,
    address indexed token,
    uint256 amount,
    uint256 timestamp
);

/// @notice 资助领取事件
/// @param recipient 领取者地址
/// @param token 代币地址
/// @param amount 领取金额
/// @param timestamp 时间戳
event AidClaimed(
    address indexed recipient,
    address indexed token,
    uint256 amount,
    uint256 timestamp
);

/// @notice 验证器更新事件
/// @param oldVerifier 旧验证器地址
/// @param newVerifier 新验证器地址
event VerifierUpdated(
    address indexed oldVerifier,
    address indexed newVerifier
);

/// @notice 合约暂停事件
event ContractPaused(
    address indexed pausedBy,
    uint256 timestamp
);

/// @notice 合约恢复事件
event ContractUnpaused(
    address indexed unpausedBy,
    uint256 timestamp
);
```

### 3.3 事件的实际用途

**前端DApp**：
```javascript
// 监听资金存入事件
sanctuary.on("FundDeposited", (donor, token, amount, timestamp) => {
    updatePoolBalance();
    showNotification(`收到 ${formatAmount(amount)} ${token}`);
});

// 监听资助领取事件
sanctuary.on("AidClaimed", (recipient, token, amount, timestamp) => {
    updateStats();
    showNotification(`新用户领取了资助`);
});
```

**数据平台（The Graph、Dune）**：
```graphql
query GetFundingStats {
    fundDepositeds {
        amount
        timestamp
    }
    aidClaimeds {
        amount
        timestamp
    }
}
```

**监控工具**：
```javascript
// 设置警报
if (dailyClaims > THRESHOLD) {
    alert("异常：今日领取数量超过阈值");
}
```

## 4. 架构设计图

```
┌─────────────────────────────────────────────────────────┐
│                   SanctuaryProtocol                      │
│  ┌───────────────────────────────────────────────────┐  │
│  │              紧急控制模块                          │  │
│  │  - pause() / unpause()                            │  │
│  │  - pauseGuardian (可设置)                         │  │
│  └───────────────────────────────────────────────────┘  │
│                                                         │
│  ┌───────────────────────────────────────────────────┐  │
│  │              资金池管理                            │  │
│  │  - mapping(token => balance)                      │  │
│  │  - deposit() - 多资产支持                          │  │
│  │  - claimAid() - 验证后领取                         │  │
│  └───────────────────────────────────────────────────┘  │
│                                                         │
│  ┌───────────────────────────────────────────────────┐  │
│  │           可插拔验证器接口                          │  │
│  │  IVerifier verifier                               │  │
│  │  ┌─────────────────────────────────────────┐     │  │
│  │  │ ZKEmailVerifier (当前)                  │     │  │
│  │  │ ZKTwitterVerifier (未来)                │     │  │
│  │  │ MultiSigVerifier (未来)                 │     │  │
│  │  └─────────────────────────────────────────┘     │  │
│  └───────────────────────────────────────────────────┘  │
│                                                         │
│  ┌───────────────────────────────────────────────────┐  │
│  │              版本管理                              │  │
│  │  version() -> "1.0.0"                             │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

## 5. 合约状态变量

```solidity
contract SanctuaryProtocol is ISanctuaryProtocol, Pausable, ReentrancyGuard {
    // ===== 验证器 =====
    IVerifier public verifier;              // 当前验证器

    // ===== 资金池 =====
    mapping(address => uint256) public poolBalances;  // token => balance

    // ===== 领取记录 =====
    mapping(address => bool) public hasClaimed;       // address => 是否已领取

    // ===== 权限控制 =====
    address public owner;                  // 合约所有者
    address public pauseGuardian;          // 暂停守护者

    // ===== 版本信息 =====
    string public constant VERSION = "1.0.0";

    // ===== 配置 =====
    uint256 public aidAmount;              // 资助金额（可配置）
}
```

## 6. 核心功能实现

### 6.1 存入资金
```solidity
function deposit(address token, uint256 amount) external payable nonReentrant whenNotPaused {
    // 处理原生币（AVAX/ETH）
    if (token == address(0)) {
        require(msg.value > 0, "Must send native token");
        poolBalances[address(0)] += msg.value;
        emit FundDeposited(msg.sender, address(0), msg.value, block.timestamp);
        return;
    }

    // 处理ERC20代币
    require(amount > 0, "Amount must be greater than 0");
    IERC20(token).transferFrom(msg.sender, address(this), amount);
    poolBalances[token] += amount;

    emit FundDeposited(msg.sender, token, amount, block.timestamp);
}
```

### 6.2 领取资助
```solidity
function claimAid(bytes calldata proof) external nonReentrant whenNotPaused {
    // 检查是否已领取
    require(!hasClaimed[msg.sender], "Already claimed");

    // 验证ZK证明
    require(verifier.verify(msg.sender, proof), "Invalid proof");

    // 标记已领取
    hasClaimed[msg.sender] = true;

    // 发放资助（从原生币池）
    uint256 amount = aidAmount;
    require(poolBalances[address(0)] >= amount, "Insufficient funds");
    poolBalances[address(0)] -= amount;
    payable(msg.sender).transfer(amount);

    emit AidClaimed(msg.sender, address(0), amount, block.timestamp);
}
```

### 6.3 更换验证器
```solidity
function setVerifier(IVerifier newVerifier) external onlyOwner {
    require(address(newVerifier) != address(0), "Invalid verifier");

    address oldVerifier = address(verifier);
    verifier = newVerifier;

    emit VerifierUpdated(oldVerifier, address(newVerifier));
}
```

### 6.4 紧急控制
```solidity
function pause() external {
    require(msg.sender == pauseGuardian, "Not guardian");
    _pause();
    emit ContractPaused(msg.sender, block.timestamp);
}

function unpause() external {
    require(msg.sender == pauseGuardian, "Not guardian");
    _unpause();
    emit ContractUnpaused(msg.sender, block.timestamp);
}
```

## 7. 验证器实现示例

### 7.1 ZK-Email验证器
```solidity
contract ZKEmailVerifier is IVerifier {
    // ZKP验证合约地址（如zk.email的Verifier）
    IZKPVerifier public zkpVerifier;

    constructor(address _zkpVerifier) {
        zkpVerifier = IZKPVerifier(_zkpVerifier);
    }

    function verify(address applicant, bytes calldata proof) external override returns (bool) {
        // 解析proof中的ZKP数据
        (bytes calldata zkp, uint256[2] calldata publicSignals) = abi.decode(proof, (bytes, uint256[2]));

        // 验证ZKP
        bool isValid = zkpVerifier.verifyProof(zkp, publicSignals);

        // 额外检查：确保publicSignals中的地址与申请者匹配
        // (具体逻辑取决于zk.email的实现)

        return isValid;
    }
}
```

### 7.2 未来可扩展的验证器

**ZK-Twitter验证器**：
```solidity
contract ZKTwitterVerifier is IVerifier {
    function verify(address applicant, bytes calldata proof) external override returns (bool) {
        // 验证Twitter账号的ZKP
        // ...
    }
}
```

**多签人工审核验证器**：
```solidity
contract MultiSigVerifier is IVerifier {
    mapping(address => bool) public approvedList;

    function verify(address applicant, bytes calldata) external override returns (bool) {
        return approvedList[applicant];
    }

    // 管理员添加白名单
    function addToWhitelist(address applicant) external onlyOwner {
        approvedList[applicant] = true;
    }
}
```

## 8. 安全设计

### 8.1 重入保护
```solidity
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract SanctuaryProtocol is ReentrancyGuard {
    function claimAid(bytes calldata proof) external nonReentrant {
        // 确保调用不能重入
        // ...
    }
}
```

### 8.2 暂停机制
```solidity
import "@openzeppelin/contracts/utils/Pausable.sol";

contract SanctuaryProtocol is Pausable {
    function claimAid(bytes calldata proof) external whenNotPaused {
        // 暂停时无法领取
        // ...
    }
}
```

### 8.3 一次性领取限制
```solidity
mapping(address => bool) public hasClaimed;

function claimAid(bytes calldata proof) external {
    require(!hasClaimed[msg.sender], "Already claimed");
    hasClaimed[msg.sender] = true;
    // ...
}
```

### 8.4 验证器权限控制
```solidity
function setVerifier(IVerifier newVerifier) external onlyOwner {
    // 只有owner可以更换验证器
    // ...
}
```

### 8.5 资金保护
```solidity
// 资金只能通过claimAid提取，没有直接提取函数
// 防止管理员直接提取资金
```

## 9. 可组合性设计

### 9.1 其他dApp集成示例

```solidity
// 其他dApp的合约
contract GameApp {
    ISanctuaryProtocol public sanctuary;

    constructor(address _sanctuary) {
        sanctuary = ISanctuaryProtocol(_sanctuary);
    }

    // 玩家购买道具时，部分资金进入互助池
    function buyItem(uint256 itemId) external payable {
        // 90%归游戏方
        payable(owner()).transfer(msg.value * 90 / 100);

        // 10%进入互助池
        sanctuary.deposit{value: msg.value * 10 / 100}(address(0), 0);
    }
}
```

### 9.2 支持多种代币

```solidity
// 自动支持所有ERC20代币
sanctuary.deposit(usdcAddress, 1000 * 1e6);
sanctuary.deposit(usdtAddress, 1000 * 1e6);
sanctuary.deposit(daiAddress, 1000 * 1e18);

// 也支持原生币
sanctuary.deposit{value: 1 ether}(address(0), 0);
```

### 9.3 验证器热替换

```solidity
// 部署新的验证器
ZKTwitterVerifier newVerifier = new ZKTwitterVerifier();

// 更换验证器（无需重新部署主合约）
sanctuary.setVerifier(newVerifier);
```

## 10. 部署参数

### 10.1 构造函数参数
```solidity
constructor(
    address _initialVerifier,    // 初始验证器地址
    address _pauseGuardian,      // 暂停守护者地址
    uint256 _aidAmount           // 资助金额
) {
    verifier = IVerifier(_initialVerifier);
    pauseGuardian = _pauseGuardian;
    owner = msg.sender;
    aidAmount = _aidAmount;
}
```

### 10.2 初始配置
```javascript
// 部署参数示例
const deploymentParams = {
    initialVerifier: "0x...",          // ZKEmailVerifier地址
    pauseGuardian: "0x...",             // 部署者地址（可后续转移）
    aidAmount: ethers.utils.parseEther("100")  // 100 AVAX
};

// 支持代币列表（无需配置，自动支持所有ERC20）
```

## 11. Gas优化考虑

### 11.1 使用事件而非存储
```solidity
// ❌ Gas成本高
mapping(address => uint256) public claimTimestamps;

// ✅ Gas成本低
event AidClaimed(address indexed recipient, uint256 timestamp);
// 前端可以从事件中查询
```

### 11.2 批量操作
```solidity
// 未来可添加批量领取功能（降低Gas分摊成本）
function batchClaimAid(bytes[] calldata proofs) external {
    // ...
}
```

## 12. 测试覆盖

### 12.1 单元测试
- ✅ deposit() - 存入原生币
- ✅ deposit() - 存入ERC20代币
- ✅ claimAid() - 正常领取
- ✅ claimAid() - 重复领取（应失败）
- ✅ claimAid() - 无效证明（应失败）
- ✅ setVerifier() - 更换验证器
- ✅ pause() / unpause() - 暂停/恢复

### 12.2 集成测试
- ✅ 完整流程：存入 → 验证 → 领取
- ✅ 验证器替换流程
- ✅ 紧急暂停流程

### 12.3 安全测试
- ✅ 重入攻击测试
- ✅ 权限控制测试
- ✅ 整数溢出测试（Solidity 0.8+自动检查）

## 13. 未来升级路径

### v1.0.0（当前版本）
- ✅ 基础资金池
- ✅ ZK-Email验证
- ✅ 多资产支持
- ✅ 暂停机制

### v2.0.0（未来规划）
- 🔄 批量领取（降低Gas成本）
- 🔄 多级资金池
- 🔄 资助金额动态调整
- 🔄 DAO治理

### v3.0.0（长期规划）
- 🔄 跨链支持
- 🔄 资助时间锁（分批释放）
- 🔄 声誉系统
- 🔄 流动性挖矿激励

---

## 附录A：完整合约代码示例

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

interface IVerifier {
    function verify(address applicant, bytes calldata proof) external returns (bool);
}

interface ISanctuaryProtocol {
    function deposit(address token, uint256 amount) external payable;
    function claimAid(bytes calldata proof) external;
    function setVerifier(IVerifier newVerifier) external;
    function pause() external;
    function unpause() external;
    function version() external pure returns (string memory);
    function hasClaimed(address) external view returns (bool);
    function getPoolBalance(address token) external view returns (uint256);
}

contract SanctuaryProtocol is ISanctuaryProtocol, Pausable, ReentrancyGuard, Ownable {
    // ===== 状态变量 =====
    IVerifier public verifier;
    mapping(address => uint256) public poolBalances;
    mapping(address => bool) public hasClaimed;
    address public pauseGuardian;
    uint256 public aidAmount;

    string public constant VERSION = "1.0.0";

    // ===== 事件 =====
    event FundDeposited(
        address indexed donor,
        address indexed token,
        uint256 amount,
        uint256 timestamp
    );

    event AidClaimed(
        address indexed recipient,
        address indexed token,
        uint256 amount,
        uint256 timestamp
    );

    event VerifierUpdated(
        address indexed oldVerifier,
        address indexed newVerifier
    );

    event ContractPaused(
        address indexed pausedBy,
        uint256 timestamp
    );

    event ContractUnpaused(
        address indexed unpausedBy,
        uint256 timestamp
    );

    // ===== 构造函数 =====
    constructor(
        address _initialVerifier,
        address _pauseGuardian,
        uint256 _aidAmount
    ) Ownable(msg.sender) {
        verifier = IVerifier(_initialVerifier);
        pauseGuardian = _pauseGuardian;
        aidAmount = _aidAmount;
    }

    // ===== 核心功能 =====

    function deposit(address token, uint256 amount) external payable override nonReentrant whenNotPaused {
        if (token == address(0)) {
            require(msg.value > 0, "Must send native token");
            poolBalances[address(0)] += msg.value;
            emit FundDeposited(msg.sender, address(0), msg.value, block.timestamp);
        } else {
            require(amount > 0, "Amount must be greater than 0");
            IERC20(token).transferFrom(msg.sender, address(this), amount);
            poolBalances[token] += amount;
            emit FundDeposited(msg.sender, token, amount, block.timestamp);
        }
    }

    function claimAid(bytes calldata proof) external override nonReentrant whenNotPaused {
        require(!hasClaimed[msg.sender], "Already claimed");
        require(verifier.verify(msg.sender, proof), "Invalid proof");

        hasClaimed[msg.sender] = true;

        uint256 amount = aidAmount;
        require(poolBalances[address(0)] >= amount, "Insufficient funds");
        poolBalances[address(0)] -= amount;
        payable(msg.sender).transfer(amount);

        emit AidClaimed(msg.sender, address(0), amount, block.timestamp);
    }

    // ===== 管理功能 =====

    function setVerifier(IVerifier newVerifier) external override onlyOwner {
        require(address(newVerifier) != address(0), "Invalid verifier");
        address oldVerifier = address(verifier);
        verifier = newVerifier;
        emit VerifierUpdated(oldVerifier, address(newVerifier));
    }

    function setAidAmount(uint256 _newAmount) external onlyOwner {
        aidAmount = _newAmount;
    }

    function pause() external override {
        require(msg.sender == pauseGuardian, "Not guardian");
        _pause();
        emit ContractPaused(msg.sender, block.timestamp);
    }

    function unpause() external override {
        require(msg.sender == pauseGuardian, "Not guardian");
        _unpause();
        emit ContractUnpaused(msg.sender, block.timestamp);
    }

    function setPauseGuardian(address _newGuardian) external onlyOwner {
        require(_newGuardian != address(0), "Invalid guardian");
        pauseGuardian = _newGuardian;
    }

    // ===== 查询功能 =====

    function version() external pure override returns (string memory) {
        return VERSION;
    }

    function getPoolBalance(address token) external view override returns (uint256) {
        return poolBalances[token];
    }
}
```

---

## 附录B：集成示例代码

### B.1 前端集成（ethers.js）

```javascript
import { ethers } from 'ethers';

// 合约ABI（仅包含需要的函数）
const sanctuaryABI = [
    "function deposit(address token, uint256 amount) external payable",
    "function claimAid(bytes calldata proof) external",
    "function getPoolBalance(address token) external view returns (uint256)",
    "function hasClaimed(address) external view returns (bool)",
    "event FundDeposited(address indexed donor, address indexed token, uint256 amount, uint256 timestamp)",
    "event AidClaimed(address indexed recipient, address indexed token, uint256 amount, uint256 timestamp)"
];

// 连接合约
const sanctuary = new ethers.Contract(
    SANCTUARY_ADDRESS,
    sanctuaryABI,
    signer
);

// 存入资金
async function depositFunds() {
    const tx = await sanctuary.deposit(
        USDC_ADDRESS,  // token地址
        ethers.utils.parseUnits("100", 6),  // 100 USDC
        { gasLimit: 200000 }
    );
    await tx.wait();
}

// 领取资助
async function claimAid(zkProof) {
    const tx = await sanctuary.claimAid(zkProof, {
        gasLimit: 500000
    });
    await tx.wait();
}

// 监听事件
sanctuary.on("FundDeposited", (donor, token, amount, timestamp) => {
    console.log(`收到资金: ${amount} from ${donor}`);
    updateUI();
});

sanctuary.on("AidClaimed", (recipient, token, amount, timestamp) => {
    console.log(`新用户领取: ${amount} by ${recipient}`);
    updateStats();
});
```

### B.2 其他合约集成

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./ISanctuaryProtocol.sol";

contract YourDApp {
    ISanctuaryProtocol public sanctuary;

    constructor(address _sanctuary) {
        sanctuary = ISanctuaryProtocol(_sanctuary);
    }

    // 你的业务逻辑
    function purchase() external payable {
        // 你的逻辑...

        // 将部分收入存入互助池
        uint256 donation = msg.value / 10;  // 10%
        sanctuary.deposit{value: donation}(address(0), 0);
    }
}
```

---

**文档版本**: v1.0
**最后更新**: 2026-03-24
**维护者**: SanctuaryProtocol Team
