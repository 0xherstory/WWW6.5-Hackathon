# HerPath Smart Contracts

智能合约系统，支持女性领袖主题Web3游戏的核心功能。

## 合约概述

### HerPathSBT - 成就徽章合约
- **类型**: ERC721 Soulbound Token (不可转移)
- **功能**: 玩家达成属性阈值后铸造SBT徽章
- **徽章类型**: 6种
  - 艺术领域: 灵感火花 ✦、执着画笔 ⊘
  - 科学领域: 探索者 ◎、实验精神 ⊕
  - 法律领域: 天平守护 ⚖、无畏斗士 ⚡

### HerPathShop - 领袖NFT商店
- **类型**: ERC721
- **功能**: 出售领袖NFT，资金自动分账至公益机构
- **购买条件**: 必须拥有对应领域全部SBT（里程碑）
- **分账机制**: 根据领域自动分配到对应公益机构

## 项目结构

```
contracts/
├── HerPathSBT.sol          # SBT徽章合约
├── HerPathShop.sol         # 商店+NFT合约
├── hardhat.config.js       # Hardhat配置
├── package.json            # 依赖管理
├── scripts/
│   └── deploy.js           # 部署脚本
└── test/
    └── HerPath.test.js     # 测试文件
```

## 安装

```bash
cd contracts
npm install
```

## 编译

```bash
npx hardhat compile
```

## 测试

```bash
npx hardhat test
```

## 部署

### 本地网络
```bash
# 启动本地节点
npx hardhat node

# 部署合约
npx hardhat run scripts/deploy.js --network localhost
```

### 测试网络
```bash
# 设置环境变量
export SEPOLIA_RPC_URL="your_rpc_url"
export PRIVATE_KEY="your_private_key"

# 部署
npx hardhat run scripts/deploy.js --network sepolia
```

## 合约功能说明

### HerPathSBT

#### 主要函数
- `mintSBT(uint256 sbtIndex, uint256 attributeValue)` - 铸造SBT
- `hasSBT(address user, uint256 sbtIndex)` - 检查是否拥有SBT
- `hasDomainMilestone(address user, string domain)` - 检查是否达成领域里程碑
- `getUserSBTs(address user)` - 获取用户所有SBT
- `batchMintSBT(address[] users, uint256[] indexes)` - 批量铸造(仅管理员)

#### SBT类型定义
| 索引 | 名称 | 领域 | 属性 | 阈值 |
|------|------|------|------|------|
| 0 | 灵感火花 | art | creativity | 5 |
| 1 | 执着画笔 | art | resilience | 5 |
| 2 | 探索者 | science | curiosity | 5 |
| 3 | 实验精神 | science | rigor | 5 |
| 4 | 天平守护 | law | justice | 5 |
| 5 | 无畏斗士 | law | courage | 5 |

### HerPathShop

#### 主要函数
- `purchaseLeaderNFT(uint256 leaderId)` - 购买领袖NFT
- `canPurchase(address user, uint256 leaderId)` - 检查购买资格
- `getLeader(uint256 leaderId)` - 获取领袖详情
- `getAllLeaderIds()` - 获取所有领袖ID
- `setSBTContract(address sbtAddress)` - 设置SBT合约地址
- `addLeader(...)` - 添加领袖(仅管理员)
- `setCharity(...)` - 设置公益机构(仅管理员)

#### 领袖NFT列表
| ID | 姓名 | 领域 | 价格 |
|----|------|------|------|
| 1 | Frida Kahlo | art | 0.05 ETH |
| 2 | Georgia O'Keeffe | art | 0.05 ETH |
| 3 | Tu Youyou | science | 0.05 ETH |
| 4 | Marie Curie | science | 0.05 ETH |
| 5 | Ruth Bader Ginsburg | law | 0.05 ETH |
| 6 | Sandra Day O'Connor | law | 0.05 ETH |

#### 公益分账
| 领域 | 机构 | 分账比例 |
|------|------|----------|
| art | Women in Arts Foundation | 35% |
| science | Girls in Science Initiative | 35% |
| law | Women's Legal Defense Fund | 30% |

## 游戏流程

1. **入门测试**: 玩家完成快问快答，获得初始属性
2. **抽取卡牌**: 在领域内抽取命运卡牌，做出抉择积累属性
3. **铸造SBT**: 属性达到阈值后铸造对应徽章
4. **解锁里程碑**: 集齐领域内全部SBT，解锁领袖里程碑
5. **购买NFT**: 购买对应领袖NFT，资金自动分账至公益机构

## 安全特性

- **SBT不可转移**: 通过重写 `_update` 函数实现
- **重入保护**: 使用 ReentrancyGuard
- **里程碑验证**: 必须通过SBT合约验证
- **自动分账**: 购买时自动分配到公益机构

## License

MIT
