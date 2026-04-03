# 月经小屋 | Menstrual Hut

**用 Web3 守护女性身体主权与生命记忆**  
**Decentralized, Immutable Sanctuary for Women's Bodily Experiences**

<p style="font-weight: bold; color: #ff4757; background: #2f3542; padding: 10px; border-radius: 5px; display: inline-block;">
  No Uterus, No Opinion
</p>

**Landing Page** → [月经小屋](https://shiannona-cloud.github.io/menstrualhut-landing/)

**在线体验** → [Menstrual Hut | 月经小屋](https://menstrualhut.vercel.app/)  
**Live Experience** → [Menstrual Hut | 月经小屋](https://menstrualhut.vercel.app/)

## 项目简介 / About the Project

**月经小屋 Menstrual Hut** 是一个专注于**生命与共生**赛道的 Web3 黑客松项目。  
**Menstrual Hut** is a Web3 hackathon project focused on the **Life & Co-existence** track.

它不是一个普通的社区，而是一个**去中心化不可篡改的身体感受信息交换站**。  
It is not an ordinary community, but a **decentralized and immutable bodily experience information exchange station**.

每一位女性都可以在这里匿名记录自己的感受经验与情绪，这些记录一旦上链，将永远存在，不会被任何中心化平台删除或审查。  
Every woman can anonymously record her feelings, experiences, and emotions here. Once uploaded on-chain, these records will exist forever and cannot be deleted or censored by any centralized platform.

核心理念：**“照顾与结盟”** —— 女性通过分享经验互相治愈，同时用区块链技术重建对身体的主权。  
Core Philosophy: **"Care and Alliance"** — Women heal each other through sharing experiences, while using blockchain technology to reclaim sovereignty over their bodies.

> “No uterus, no opinion.”  

> 这里只属于有子宫的人发声，也欢迎所有尊重女性身体主权的人共同守护。  
> This space belongs to those with a uterus to speak, and welcomes all who respect women's bodily sovereignty to join in protecting it.

## 用户角色 / User Roles

| 角色       | 主要功能 |
|------------|----------|
| 使用者     | 上传感受记录经期查看自己的帖子与 MOON 余额浏览公开/付费经验贴 |
| 审核者     | 审核公开内容（MVP 阶段由合约 + 手动结合实现） |

| Role          | Main Functions |
|---------------|----------------|
| User          | Upload feelings, record periods, view own posts & MOON balance, browse public/paid experience posts |
| Reviewer      | Review public content (MVP stage implemented by contract + manual combination) |

## 核心功能（MVP） / Core Features (MVP)

### 1. 上传感受与经历 / Upload Feelings & Experiences

- 连接钱包（Avalanche Fuji）  
  - Connect Wallet (Avalanche Fuji)

- 匿名输入文本  
  - Anonymously input text

- 选择：公开 / 私有（放入小屋保险箱）  
  - Choose: Public / Private (stored in the Hut Safe)

- 文本上传至 **Pinata IPFS** → 生成永久 CID  
  - Upload text to **Pinata IPFS** → Generate permanent CID

- 调用智能合约存储 CID时间戳贡献值  
  - Call smart contract to store CID, timestamp, and contribution value

- 自动铸造少量 **MOON** 代币作为奖励  
  - Automatically mint a small amount of **MOON** tokens as reward

### 2. 浏览数字资产 / My Digital Archive

- 查看自己所有上链记录（时间 + 地址前缀 + 预览）  
  - View all on-chain records (time + address prefix + preview)

- 一键打开 IPFS 原文（永久可访问）  
  - Open original IPFS content with one click (permanently accessible)

### 3. 月经记录与周期守护 / Menstrual Tracking

- 记录经期日期  
  - Record menstrual dates

- 可视化周期提醒（玻璃小人动态展示）  
  - Visual cycle reminders (dynamic glass figure display)

### 4. 经验分享市场 / Experience Marketplace

- 免费查看官方性教育与生理知识贴  
  - Free access to official sex education and physiological knowledge posts

- 付费查看其他用户公开的经验贴（使用 MOON 代币支付）  
  - Pay to view other users’ public experience posts (paid with MOON tokens)

## 技术栈 / Tech Stack

### 区块链层 / Blockchain Layer

- **链**：Avalanche Fuji Testnet (C-Chain)  
  - **Chain**: Avalanche Fuji Testnet (C-Chain)

- **Chain ID**：43113  
  - **Chain ID**: 43113

- **智能合约**：Solidity ^0.8.22  
  - **Smart Contracts**: Solidity ^0.8.22

- **开发框架**：Hardhat  
  - **Development Framework**: Hardhat

- **代币标准**：ERC-20 (MoonToken)  
  - **Token Standard**: ERC-20 (MoonToken)

- **合约库**：OpenZeppelin Contracts v5  
  - **Contract Library**: OpenZeppelin Contracts v5

### 前端 / Frontend

- **框架**：Next.js 15 (App Router) + React 19 + TypeScript  
  - **Framework**: Next.js 15 (App Router) + React 19 + TypeScript

- **Web3 集成**：thirdweb SDK  
  - **Web3 Integration**: thirdweb SDK

- **样式**：Tailwind CSS + shadcn/ui  
  - **Styling**: Tailwind CSS + shadcn/ui

- **国际化**：next-intl（中英双语切换）  
  - **Internationalization**: next-intl (Chinese-English bilingual switching)

### 存储层 / Storage Layer

- **去中心化存储**：Pinata IPFS（文本 + 元数据）  
  - **Decentralized Storage**: Pinata IPFS (text + metadata)

### 其他工具 / Other Tools

- **钱包连接**：MetaMask / Core Wallet  
  - **Wallet Connection**: MetaMask / Core Wallet

- **部署**：thirdweb CLI + Hardhat  
  - **Deployment**: thirdweb CLI + Hardhat

- **测试**：Hardhat + Avalanche Fuji 测试网  
  - **Testing**: Hardhat + Avalanche Fuji Testnet

## 合约架构 / Smart Contract Architecture

- **MoonToken.sol**：ERC-20 治理与奖励代币（MOON）  
  - **MoonToken.sol**: ERC-20 governance and reward token (MOON)

- **MenstrualHut.sol**：核心合约  
  - **MenstrualHut.sol**: Core contract

&nbsp; - 用户注册与身份管理  
&nbsp;   - User registration and identity management

&nbsp; - 感受上传与 CID 存储  
&nbsp;   - Feeling upload and CID storage

&nbsp; - 经期数据记录  
&nbsp;   - Menstrual data recording

&nbsp; - MOON 代币铸造与发放逻辑  
&nbsp;   - MOON token minting and distribution logic

&nbsp; - 内容审核与公开/私有权限控制  
&nbsp;   - Content review and public/private permission control

&nbsp; - 付费查看经验贴的支付与访问控制  
&nbsp;   - Payment and access control for paid experience posts

## 项目结构（页面路由） / Page Routes

| 路径                    | 页面名称                    | 主要功能                         | 访问权限     |
|-------------------------|-----------------------------|----------------------------------|--------------|
| `/`                     | 首页                        | 上传感受，经期记录，搜索，浏览公开经验贴（免费+付费）| Public / User  |
| `/my-archive`           | 我的小屋                     | 查看自己的所有记录               | User         |
| `/experience`              | 经验贴详细                | 查看经验贴详细                   | Public/User  |
| `/profile`              | 个人中心                     | MOON 余额设置审核者入口          | User         |

| Path                    | Page Name                   | Main Function                            | Access       |
|-------------------------|-----------------------------|------------------------------------------|--------------|
| `/`                     | Home                        | Upload feelings，Period tracking，Browse， Browse public experience posts (free + paid).  | Public/user   |
| `/my-archive`           | My Archive                  | View all personal on-chain records       | User         |
| `/experience`              | Detailed experience post | View details of the experience post      | Public/User  |
| `/profile`              | Profile                     | MOON balance, reviewer entry             | User         |

## 黑客松信息 / Hackathon Info

- **赛道**：生命与共生 (Life & Co-existence)  
  - **Track**: Life & Co-existence

- **Slogan**：No uterus, no opinion  

- **核心理念**：去中心化 + 不可篡改 + 照顾与结盟  
  - **Core Idea**: Decentralization + Immutability + Care and Alliance


- **团队**：3人：Shi Annona / 海椰 Bareerah / lilibetti易为
  - **Team**: 3 people ：Shi Annona / 海椰 Bareerah / lilibetti易为

## 未来展望 / Future Roadmap

- 真实月经用品捐赠机制（贡献值兑换）  
  - Real menstrual product donation mechanism (contribution value redemption)

- 线下签名活动 + NFT 证书  
  - Offline signing events + NFT certificates

- DAO 治理（MOON 持有者共同决策）  
  - DAO governance (MOON holders make decisions together)

- 多链部署（主网 + Subnet）  
  - Multi-chain deployment (mainnet + Subnet)

- 心理疗愈社区模块  
  - Mental healing community module

---

**Made with ❤️ for every woman who wants her body to be heard, remembered, and never erased.**

**用代码守护每一次身体的低语，让女性的生命经验成为链上永恒的光。**  
**Using code to protect every whisper of the body, turning women's life experiences into eternal light on the chain.**

---

## 如何运行 / How to Run

```bash
# Clone the project
git clone https://github.com/BareerahBenjamin/Menstrual_Hut.git

# Install dependencies
cd Menstrual_Hut
npm install

# run
npm run dev
