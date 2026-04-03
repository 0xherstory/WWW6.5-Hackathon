# HerRise MVP 💜

[English](#english) | [中文](#中文)

---

<a name="english"></a>
## English

HerRise is a blockchain-based collaborative financial learning platform designed to empower women through collective investment and educational incentivization. This MVP is built for the Avalanche Fuji testnet.

### 🌟 Key Features
- **Wallet Integration**: Secure login via MetaMask.
- **HRT Faucet**: Claim 1000 test HerRise Tokens (HRT) to start your journey.
- **Micro-Investment Pools**: Create or join decentralized savings/investment pools with flexible strategies.
- **Learn-to-Earn**: Complete financial literacy quizzes to earn HRT rewards.
- **Profit Distribution**: Real-time on-chain profit sharing based on contribution ratios.
- **Personal Dashboard**: Track your investments, rewards, and reputation score in one place.

### 🛠 Tech Stack
- **Smart Contracts**: Solidity 0.8.20, Hardhat, OpenZeppelin.
- **Frontend**: React 18, Vite, Ethers.js v6.
- **Network**: Avalanche Fuji Testnet.

### 🚀 Quick Start

#### Prerequisites
- Node.js v18+
- MetaMask extension installed on your browser.
- Some Fuji AVAX for gas (Get it from [faucet.avax.network](https://faucet.avax.network/)).

#### 1. Install Dependencies
```bash
# Clone the repo
cd HerRise
npm install && cd frontend && npm install && cd ../contracts && npm install
```

#### 2. Configuration
Create a `.env` file in the `contracts/` directory using `.env.example` as a template and add your private key.

#### 3. Setup Demo Environment (Fuji)
Deploy contracts and initialize demo data with one command:
```bash
cd contracts
npx hardhat run scripts/demo-all-in-one.js --network fuji
```

#### 4. Launch Frontend
```bash
cd frontend
npm run dev
```
Visit `http://localhost:3000` to see the app!

---

<a name="中文"></a>
## 中文

HerRise 是一个基于区块链的女性协作理财学习平台，旨在通过集体投资和教育激励赋能全球女性。此 MVP 版本专为 Avalanche Fuji 测试网开发。

### 🌟 核心功能
-   **钱包连接**：通过 MetaMask 安全登录。
-   **HRT 水龙头**：领取 1000 个测试 HerRise 代币 (HRT) 开启理财之旅。
-   **微型理财池**：创建或加入具有灵活投资策略的去中心化协作池。
-   **学习激励 (Learn-to-Earn)**：完成理财知识测验，赢取 HRT 奖励。
-   **收益分配**：基于链上贡献比例的实时收益发放。
-   **个人仪表板**：一站式追踪你的投资、奖励和个人信誉分。

### 🛠 技术栈
-   **智能合约**：Solidity 0.8.20, Hardhat, OpenZeppelin.
-   **前端**：React 18, Vite, Ethers.js v6.
-   **区块链网络**：Avalanche Fuji 测试网。

### 🚀 快速开始

#### 前置要求
- Node.js v18+
- 浏览器已安装 MetaMask 插件。
- 账户内有少量 Fuji AVAX 作为燃料费（可前往 [faucet.avax.network](https://faucet.avax.network/) 领取）。

#### 1. 安装依赖
```bash
cd HerRise
# 安装全局及子项目依赖
npm install && cd frontend && npm install && cd ../contracts && npm install
```

#### 2. 配置环境
在 `contracts/` 目录下根据 `.env.example` 创建 `.env` 文件，并填入你的私钥。

#### 3. 准备演示环境 (Fuji)
一键部署合约并初始化演示数据：
```bash
cd contracts
npx hardhat run scripts/demo-all-in-one.js --network fuji
```

#### 4. 启动前端
```bash
cd frontend
npm run dev
```
访问 `http://localhost:3000` 即可开始使用！

---

## 📄 License
MIT License
