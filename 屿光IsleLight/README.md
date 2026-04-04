<div align="center">


# IsleLight · 屿光

> 在宇宙星尘中点亮你的习惯灯塔 —— 一个基于区块链的去中心化习惯追踪 DApp

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Network: Avalanche Fuji](https://img.shields.io/badge/Network-Avalanche%20Fuji-blue)](https://testnet.snowtrace.io/)
[![React](https://img.shields.io/badge/React-18.2-61DAFB?logo=react)](https://reactjs.org/)
[![Solidity](https://img.shields.io/badge/Solidity-0.8.19-363636?logo=solidity)](https://soliditylang.org/)

---

**🌍 Language / 语言**

[🇨🇳 中文 (当前)](#) | [🇺🇸 English](docs/README_EN.md)

</div>

---

## 为什么需要 IsleLight

传统的习惯追踪应用存在一个核心问题：**数据不属于你**。

- 数据存储在中心化服务器上，随时可能丢失
- 平台可以随意修改或删除你的记录
- 无法证明你的坚持是真实的
- 缺乏社区激励和社交认同

**IsleLight** 将你的习惯记录永久锚定在区块链上，创造不可篡改、可公开验证的"习惯证明"。每一次打卡都是一次链上签名，每一座岛屿都是你在 Web3 世界中的自律足迹。

---

## 核心特性

### ✅ 已实现

| 功能                     | 描述                                           |
| ------------------------ | ---------------------------------------------- |
| 🏝️**习惯岛屿**   | 创建个人习惯，支持自定义图标、颜色和目标       |
| ⛓️**链上证明**   | 公开习惯的打卡记录永久存储在区块链上           |
| 📝**打卡备注上链** | 打卡时可添加备注，与记录一起永久存储在链上     |
| 🔗**单条记录上链** | 支持选择性将某一条打卡记录上链，灵活管理       |
| 🎯**连胜追踪**     | 可视化展示你的坚持历程和热力图                 |
| 💭**打卡备注**     | 为每次打卡添加想法和心得                       |
| 🌐**探索广场**     | 发现其他用户公开的习惯灯塔                     |
| 🔍**增强搜索**     | 支持搜索用户昵称、习惯名称、打卡内容的模糊匹配 |
| 📊**搜索索引**     | 本地构建搜索索引，实时更新搜索结果             |
| 🎨**哈希图标**     | 基于习惯名称生成唯一且固定的视觉标识           |
| 🔐**身份系统**     | 链上注册唯一昵称，建立 Web3 身份               |
| 📊**数据导出**     | 支持 JSON / CSV 格式导出所有数据               |
| 🌙**沉浸式 UI**    | 宇宙星空主题，流畅的交互动效                   |

### 🚧 开发中

| 功能                 | 描述                        | 预计版本 |
| -------------------- | --------------------------- | -------- |
| 🏆**成就徽章** | 完成特定里程碑获得 NFT 徽章 | v0.3.0   |
| 📈**统计面板** | 个人数据可视化大盘          | v0.3.0   |

### 💡 规划中

| 功能                   | 描述                                 |
| ---------------------- | ------------------------------------ |
| 🎞️**成长海报** | 生成月度/年度习惯总结图片，一键分享  |
| 👥**社交功能**   | 关注、点赞、评论、提醒               |
| 🏅**激励经济**   | 质押代币达成目标，失败则分配给成功者 |
| 📱**移动端 PWA** | 原生移动应用体验                     |
| 🔔**智能提醒**   | 可配置的打卡提醒通知                 |
| 🤝**习惯小组**   | 创建或加入习惯社群，互相监督         |

---

## 技术架构

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend Layer                        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │  React 18   │  │  Tailwind   │  │   Framer Motion     │  │
│  │   + Vite    │  │    CSS      │  │   (Animations)      │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
├─────────────────────────────────────────────────────────────┤
│                      Web3 Layer (wagmi)                      │
│  ┌─────────────────────┐  ┌─────────────────────────────┐   │
│  │   RainbowKit        │  │        ethers.js v5         │   │
│  │  (Wallet Connect)   │  │     (Contract Interaction)  │   │
│  └─────────────────────┘  └─────────────────────────────┘   │
├─────────────────────────────────────────────────────────────┤
│                    Smart Contract Layer                      │
│  ┌───────────────────────────────────────────────────────┐  │
│  │              IsleLight.sol (Solidity 0.8.19)          │  │
│  │  • Identity Management   • Lighthouse Registry        │  │
│  │  • Check-in Records      • Event Emissions            │  │
│  │  • Thought Storage       • Pagination Support         │  │
│  └───────────────────────────────────────────────────────┘  │
├─────────────────────────────────────────────────────────────┤
│                    Blockchain Network                        │
│  ┌───────────────────────────────────────────────────────┐  │
│  │              Avalanche Fuji Testnet                    │  │
│  │         (Chain ID: 43113, 免费 Gas 费用)               │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## 快速开始

### 前置条件

- [Node.js](https://nodejs.org/) 18.0 或更高版本
- [npm](https://www.npmjs.com/) 9.0 或更高版本
- [MetaMask](https://metamask.io/) 浏览器扩展

### 安装

```bash
# 克隆仓库
git clone https://github.com/your-username/islelight.git
cd islelight

# 安装依赖
npm install
```

### 配置

1. **添加 Avalanche Fuji 测试网到 MetaMask**

   | 参数       | 值                                         |
   | ---------- | ------------------------------------------ |
   | 网络名称   | Avalanche Fuji Testnet                     |
   | RPC URL    | https://api.avax-test.network/ext/bc/C/rpc |
   | 链 ID      | 43113                                      |
   | 货币符号   | AVAX                                       |
   | 区块浏览器 | https://testnet.snowtrace.io               |
2. **获取测试代币**

   访问 [Avalanche Fuji Faucet](https://faucet.avax.network/) 领取免费测试 AVAX。
3. **（可选）配置 WalletConnect Project ID**

   编辑 `src/wagmi.js`，替换 `projectId`：

   ```javascript
   const projectId = 'your-walletconnect-project-id';
   ```

   从 [WalletConnect Cloud](https://cloud.walletconnect.com/) 获取免费的 Project ID。

### 运行

```bash
# 启动开发服务器
npm run dev

# 访问 http://localhost:5173
```

---

## 使用指南

### 第一步：连接钱包

点击右上角 **Connect Wallet** 按钮，使用 MetaMask 连接 Avalanche Fuji 测试网。

### 第二步：注册身份

首次创建公开习惯时，系统会提示你注册链上身份：

1. 输入你的昵称（永久记录，无法修改）
2. 确认交易
3. 身份创建成功

### 第三步：创建习惯岛屿

点击 **唤醒岛屿** 按钮：

| 字段     | 说明                                                           |
| -------- | -------------------------------------------------------------- |
| 岛屿之名 | 习惯的名称，如"每日阅读"                                       |
| 守护元素 | 选择一个图标代表你的习惯                                       |
| 岛屿色彩 | 自定义主题颜色                                                 |
| 月度目标 | 设置每月打卡次数（0 = 无限制）                                 |
| 可见性   | **私密**：仅本地存储`<br>`**公开**：打卡记录上链 |

### 第四步：打卡

点击习惯卡片上的 **激活能量** 按钮完成打卡：

- 私密习惯：打卡数据存储在浏览器本地
- 公开习惯：可选择将打卡记录上链，获得不可篡改的证明

### 第五步：打卡备注上链

在公开习惯详情页，点击 **打卡上链** 按钮：

1. 在弹窗中输入打卡备注（最多 200 字）
2. 点击 **确认上链**
3. 钱包确认交易
4. 备注内容与打卡记录一起永久存储在区块链上

### 第六步：单条记录上链

在公开习惯的打卡记录列表中：

1. 找到需要上链的记录
2. 点击记录右侧的链状图标按钮 🔗
3. 在弹窗中确认或编辑备注内容
4. 点击 **确认上链** 完成交易
5. 已上链的记录会显示"已上链"标识

### 第七步：探索与搜索

点击导航栏的 **探索** 按钮：

1. **浏览公开岛屿**：查看所有用户公开的习惯灯塔
2. **搜索功能**：
   - 输入关键词搜索用户昵称
   - 搜索习惯名称
   - 搜索打卡内容
3. **分类结果**：搜索结果按用户、打卡记录、岛屿分类显示
4. **查看详情**：点击卡片查看用户详情和打卡历史

---

## 智能合约 API

### 合约信息

| 参数       | 值                                                                                       |
| ---------- | ---------------------------------------------------------------------------------------- |
| 合约地址   | `0x44011ffB344443f5bfA8264b5caf7852Cc139bEB`                                           |
| 网络       | Avalanche Fuji Testnet                                                                   |
| 区块浏览器 | [查看合约](https://testnet.snowtrace.io/address/0x44011ffB344443f5bfA8264b5caf7852Cc139bEB) |

### 核心方法

#### 身份管理

```solidity
// 创建身份
function createIdentity(string memory _nickname) public

// 查询身份
function getIdentity(address _user) public view returns (
    string memory nickname,
    uint256 joinTime,
    uint256 lighthouseCount
)

// 检查是否已注册
function hasIdentity(address) public view returns (bool)
```

#### 灯塔管理

```solidity
// 创建灯塔
function addLighthouse(string memory _contentHash, string memory _title) public

// 获取所有灯塔
function getAllLighthouses() public view returns (Lighthouse[] memory)

// 分页获取灯塔
function getLighthousesPaginated(uint256 _offset, uint256 _limit) public view returns (Lighthouse[] memory, uint256)

// 获取用户的灯塔
function getUserLighthouses(address _user) public view returns (Lighthouse[] memory)
```

#### 打卡管理

```solidity
// 打卡（支持备注上链）
function checkIn(string memory _cid, string memory _thought) public

// 获取用户打卡记录
function getUserCheckIns(address _user) public view returns (CheckIn[] memory)

// 分页获取打卡记录
function getUserCheckInsPaginated(address _user, uint256 _offset, uint256 _limit) public view returns (CheckIn[] memory, uint256)

// 获取打卡次数
function getCheckInCount(address _user) public view returns (uint256)
```

### 事件

```solidity
event IdentityCreated(address indexed user, string nickname, uint256 joinTime);
event LighthouseAdded(address indexed user, string title, string contentHash, uint256 timestamp);
event CheckInAdded(address indexed user, string cid, string thought, uint256 timestamp);
```

### 数据结构

```solidity
struct Identity {
    string nickname;        // 昵称
    uint256 joinTime;       // 加入时间
    uint256 lighthouseCount; // 创建的灯塔数量
}

struct Lighthouse {
    string contentHash;     // 内容哈希（习惯ID）
    string title;           // 习惯名称
    uint256 timestamp;      // 创建时间
    address author;         // 创建者地址
}

struct CheckIn {
    uint256 timestamp;      // 打卡时间
    string cid;             // 习惯ID
    string thought;         // 打卡备注（支持上链）
}
```

---

## 项目结构

```
islelight/
├── src/
│   ├── components/
│   │   ├── App.jsx            # 应用入口组件
│   │   ├── HabitDashboard.jsx # 主仪表盘（习惯管理、打卡上链）
│   │   ├── ExplorePage.jsx    # 探索页面（搜索索引、模糊搜索）
│   │   └── HabitForm.jsx      # 习惯表单组件
│   ├── config/
│   │   └── contract.js        # 合约地址、ABI、搜索索引配置
│   ├── wagmi.js               # wagmi 配置
│   ├── main.jsx               # React 入口
│   └── index.css              # 全局样式
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
└── README.md
```

---

## 开发指南

### 本地开发

```bash
# 启动开发服务器（热重载）
npm run dev

# 构建生产版本
npm run build

# 预览生产版本
npm run preview
```

### 合约部署（开发者）

如需部署自己的合约实例：

1. 安装 Hardhat

   ```bash
   npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox
   ```
2. 初始化 Hardhat 项目

   ```bash
   npx hardhat init
   ```
3. 将 `contracts/IsleLight.sol` 复制到 Hardhat 项目
4. 配置 `hardhat.config.js`

   ```javascript
   module.exports = {
     solidity: "0.8.19",
     networks: {
       fuji: {
         url: "https://api.avax-test.network/ext/bc/C/rpc",
         accounts: ["YOUR_PRIVATE_KEY"]
       }
     }
   };
   ```
5. 编译并部署

   ```bash
   npx hardhat compile
   npx hardhat run scripts/deploy.js --network fuji
   ```
6. 更新 `src/config/contract.js` 中的合约地址

> **注意**：测试网部署免费，但需要测试代币支付 Gas。

---

## 数据隐私

| 数据类型             | 存储位置            | 公开性             |
| -------------------- | ------------------- | ------------------ |
| 私密习惯数据         | 浏览器 localStorage | 仅本地可见         |
| 公开习惯元数据       | 区块链              | 完全公开，不可篡改 |
| 打卡备注（公开习惯） | 区块链              | 完全公开，永久存储 |
| 打卡备注（私密习惯） | 浏览器 localStorage | 仅本地可见         |
| 钱包地址             | 区块链              | 公开               |
| 用户昵称             | 区块链              | 公开，永久不可修改 |
| 搜索索引             | 浏览器 localStorage | 仅本地可见         |

---

## 技术栈

| 类别                 | 技术                          |
| -------------------- | ----------------------------- |
| **前端框架**   | React 18 + Vite               |
| **样式方案**   | Tailwind CSS + 内联 CSS-in-JS |
| **动画效果**   | Framer Motion                 |
| **Web3 连接**  | wagmi v2 + RainbowKit         |
| **合约交互**   | ethers.js v5                  |
| **智能合约**   | Solidity 0.8.19               |
| **区块链网络** | Avalanche Fuji Testnet        |
| **图标库**     | Lucide React                  |

---

## 常见问题

### Q: 为什么我的交易失败了？

**A:** 常见原因：

1. 未注册身份就尝试创建公开习惯
2. 钱包余额不足以支付 Gas
3. 网络拥堵导致超时

### Q: 如何备份数据？

**A:** 点击 **导出数据** 按钮，选择 JSON 或 CSV 格式下载。

### Q: 公开习惯和私密习惯有什么区别？

**A:**

| 特性       | 私密习惯             | 公开习惯   |
| ---------- | -------------------- | ---------- |
| 存储位置   | 本地浏览器           | 区块链     |
| 数据持久性 | 清除浏览器数据会丢失 | 永久保存   |
| 可验证性   | 无                   | 可公开验证 |
| 可被发现   | 否                   | 是         |
| Gas 费用   | 无                   | 需要       |

### Q: 打卡备注上链后可以修改吗？

**A:** 不可以。区块链数据的不可篡改性意味着一旦上链，备注内容将永久保存，无法修改或删除。

### Q: 搜索索引是如何工作的？

**A:** 探索页面会从区块链获取所有公开数据，在本地构建搜索索引并缓存。索引每小时自动刷新，也可以手动点击"刷新数据"按钮更新。

### Q: 测试网代币有实际价值吗？

**A:** 没有。测试网代币仅用于开发和测试，无任何实际价值。

---

## 贡献指南

欢迎贡献代码、报告问题或提出建议！

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建 Pull Request

### 代码规范

- 使用 ESLint 进行代码检查
- 组件使用函数式组件 + Hooks
- 样式优先使用 Tailwind CSS
- 新功能需要更新文档

---

## 路线图

### v0.1.0 (当前)

- [X] 基础习惯管理
- [X] 链上身份注册
- [X] 公开习惯上链
- [X] 探索页面
- [X] 搜索功能
- [X] 数据导出

### v0.2.0 (已实现)

- [X] 打卡备注上链
- [X] 单条记录选择性上链
- [X] 增强搜索（支持用户昵称、打卡内容）
- [X] 搜索索引本地缓存
- [X] 优化移动端体验

### v0.3.0

- [ ] 成就徽章系统
- [ ] 统计数据面板
- [ ] 社交功能（关注、点赞）

### v1.0.0

- [ ] 主网部署
- [ ] 激励经济模型
- [ ] 移动端 PWA

---

## 许可证

本项目采用 MIT 许可证 - 详见 [LICENSE](LICENSE) 文件。

---

## 联系方式

- **项目主页**: [GitHub](https://github.com/your-username/islelight)
- **问题反馈**: [Issues](https://github.com/your-username/islelight/issues)
- **区块浏览器**: [Snowtrace](https://testnet.snowtrace.io/address/0x44011ffB344443f5bfA8264b5caf7852Cc139bEB)

---

<p align="center">
  <strong>在宇宙星尘中，点亮属于你的灯塔 🌌</strong>
</p>
