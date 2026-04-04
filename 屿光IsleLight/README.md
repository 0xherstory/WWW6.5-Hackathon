# IsleLight · 屿光

> 在宇宙星尘中点亮你的习惯灯塔 —— 一个基于区块链的去中心化习惯追踪 DApp

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Network: Avalanche Fuji](https://img.shields.io/badge/Network-Avalanche%20Fuji-blue)](https://testnet.snowtrace.io/)
[![React](https://img.shields.io/badge/React-18.2-61DAFB?logo=react)](https://reactjs.org/)
[![Solidity](https://img.shields.io/badge/Solidity-0.8.19-363636?logo=solidity)](https://soliditylang.org/)

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

| 功能 | 描述 |
|------|------|
| 🏝️ **习惯岛屿** | 创建个人习惯，支持自定义图标、颜色和目标 |
| ⛓️ **链上证明** | 公开习惯的打卡记录永久存储在区块链上 |
| 🎯 **连胜追踪** | 可视化展示你的坚持历程和热力图 |
| 💭 **打卡备注** | 为每次打卡添加想法和心得（本地存储） |
| 🌐 **探索广场** | 发现其他用户公开的习惯灯塔 |
| 🔍 **智能搜索** | 模糊搜索习惯名称、用户地址和打卡备注 |
| 🎨 **哈希图标** | 基于习惯名称生成唯一且固定的视觉标识 |
| 🔐 **身份系统** | 链上注册唯一昵称，建立 Web3 身份 |
| 📊 **数据导出** | 支持 JSON / CSV 格式导出所有数据 |
| 🌙 **沉浸式 UI** | 宇宙星空主题，流畅的交互动效 |

### 🚧 开发中

| 功能 | 描述 | 预计版本 |
|------|------|----------|
| 📝 **备注上链** | 打卡想法存储到区块链（合约已支持，前端对接中） | v0.2.0 |
| 🏆 **成就徽章** | 完成特定里程碑获得 NFT 徽章 | v0.3.0 |
| 📈 **统计面板** | 个人数据可视化大盘 | v0.3.0 |

### 💡 规划中

| 功能 | 描述 |
|------|------|
| 🎞️ **成长海报** | 生成月度/年度习惯总结图片，一键分享 |
| 👥 **社交功能** | 关注、点赞、评论、提醒 |
| 🏅 **激励经济** | 质押代币达成目标，失败则分配给成功者 |
| 📱 **移动端 PWA** | 原生移动应用体验 |
| 🔔 **智能提醒** | 可配置的打卡提醒通知 |
| 🤝 **习惯小组** | 创建或加入习惯社群，互相监督 |

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

   | 参数 | 值 |
   |------|-----|
   | 网络名称 | Avalanche Fuji Testnet |
   | RPC URL | https://api.avax-test.network/ext/bc/C/rpc |
   | 链 ID | 43113 |
   | 货币符号 | AVAX |
   | 区块浏览器 | https://testnet.snowtrace.io |

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

| 字段 | 说明 |
|------|------|
| 岛屿之名 | 习惯的名称，如"每日阅读" |
| 守护元素 | 选择一个图标代表你的习惯 |
| 岛屿色彩 | 自定义主题颜色 |
| 月度目标 | 设置每月打卡次数（0 = 无限制） |
| 可见性 | **私密**：仅本地存储<br>**公开**：打卡记录上链 |

### 第四步：打卡

点击习惯卡片上的 **激活能量** 按钮完成打卡：

- 私密习惯：打卡数据存储在浏览器本地
- 公开习惯：可选择将打卡记录上链，获得不可篡改的证明

### 第五步：探索

点击导航栏的 **探索** 按钮，发现其他用户公开的习惯灯塔。

---

## 项目结构

```
islelight/
├── src/
│   ├── components/
│   │   ├── App.jsx            # 应用入口组件
│   │   ├── HabitDashboard.jsx # 主仪表盘（习惯管理）
│   │   ├── ExplorePage.jsx    # 探索页面
│   │   └── HabitForm.jsx      # 习惯表单组件
│   ├── config/
│   │   └── contract.js        # 合约地址与 ABI
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

---

## 数据隐私

| 数据类型 | 存储位置 | 公开性 |
|----------|----------|--------|
| 私密习惯数据 | 浏览器 localStorage | 仅本地可见 |
| 公开习惯元数据 | 区块链 | 完全公开，不可篡改 |
| 打卡备注（公开习惯） | 区块链 | 完全公开 |
| 打卡备注（私密习惯） | 浏览器 localStorage | 仅本地可见 |
| 钱包地址 | 区块链 | 公开 |
| 用户昵称 | 区块链 | 公开，永久不可修改 |

---

## 技术栈

| 类别 | 技术 |
|------|------|
| **前端框架** | React 18 + Vite |
| **样式方案** | Tailwind CSS + 内联 CSS-in-JS |
| **动画效果** | Framer Motion |
| **Web3 连接** | wagmi v2 + RainbowKit |
| **合约交互** | ethers.js v5 |
| **智能合约** | Solidity 0.8.19 |
| **区块链网络** | Avalanche Fuji Testnet |
| **图标库** | Lucide React |

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

| 特性 | 私密习惯 | 公开习惯 |
|------|----------|----------|
| 存储位置 | 本地浏览器 | 区块链 |
| 数据持久性 | 清除浏览器数据会丢失 | 永久保存 |
| 可验证性 | 无 | 可公开验证 |
| 可被发现 | 否 | 是 |
| Gas 费用 | 无 | 需要 |

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
- [x] 基础习惯管理
- [x] 链上身份注册
- [x] 公开习惯上链
- [x] 探索页面
- [x] 搜索功能
- [x] 数据导出

### v0.2.0 (下一个版本)
- [ ] 打卡备注上链
- [ ] 单条记录选择性上链
- [ ] 优化移动端体验

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
- **区块浏览器**: [Snowtrace](https://testnet.snowtrace.io/address/0x2fc9192E29d514De1A496D5b3BAb37E227082BB9)

---

<p align="center">
  <strong>在宇宙星尘中，点亮属于你的灯塔 🌌</strong>
</p>
