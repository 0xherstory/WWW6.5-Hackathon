# 月经小屋 | Menstrual Hut



**用 Web3 守护女性身体主权与生命记忆**  

**Decentralized, Immutable Sanctuary for Women's Bodily Experiences**



<p style="font-weight: bold; color: #ff4757; background: #2f3542; padding: 10px; border-radius: 5px; display: inline-block;">
  No Uterus, No Opinion
</p>



## 项目简介 / About the Project



**月经小屋 Menstrual Hut** 是一个专注于**生命与共生**赛道的 Web3 黑客松项目。



它不是一个普通的社区，而是一个**去中心化不可篡改的身体感受信息交换站**。每一位女性都可以在这里匿名记录自己的感受经验与情绪，这些记录一旦上链，将永远存在，不会被任何中心化平台删除或审查。



核心理念：**“照顾与结盟”** —— 女性通过分享经验互相治愈，同时用区块链技术重建对身体的主权。



> “No uterus, no opinion.”  

> 这里只属于有子宫的人发声，也欢迎所有尊重女性身体主权的人共同守护。



## 用户角色 / User Roles



| 角色       | 英文          | 主要功能 |
|------------|---------------|----------|
| 使用者     | User          | 上传感受记录经期查看自己的帖子与 MOON 余额浏览公开/付费经验贴 |
| 审核者     | Reviewer      | 审核公开内容（MVP 阶段由合约 + 手动结合实现） |



## 核心功能（MVP） / Core Features (MVP)



### 1. 上传感受与经历 / Upload Feelings & Experiences

- 连接钱包（Avalanche Fuji）

- 匿名输入文本

- 选择：公开 / 私有（放入小屋保险箱）

- 文本上传至 **Pinata IPFS** → 生成永久 CID

- 调用智能合约存储 CID时间戳贡献值

- 自动铸造少量 **MOON** 代币作为奖励



### 2. 浏览数字资产 / My Digital Archive

- 查看自己所有上链记录（时间 + 地址前缀 + 预览）

- 一键打开 IPFS 原文（永久可访问）



### 3. 月经记录与周期守护 / Menstrual Tracking

- 记录经期日期

- 可视化周期提醒（玻璃小人动态展示）



### 4. 经验分享市场 / Experience Marketplace

- 免费查看官方性教育与生理知识贴

- 付费查看其他用户公开的经验贴（使用 MOON 代币支付）



## 技术栈 / Tech Stack



### 区块链层

- **链**：Avalanche Fuji Testnet (C-Chain)

- **Chain ID**：43113

- **智能合约**：Solidity ^0.8.22

- **开发框架**：Hardhat

- **代币标准**：ERC-20 (MoonToken)

- **合约库**：OpenZeppelin Contracts v5



### 前端

- **框架**：Next.js 15 (App Router) + React 19 + TypeScript

- **Web3 集成**：thirdweb SDK

- **样式**：Tailwind CSS + shadcn/ui

- **国际化**：next-intl（中英双语切换）



### 存储层

- **去中心化存储**：Pinata IPFS（文本 + 元数据）



### 其他工具

- **钱包连接**：MetaMask / Core Wallet

- **部署**：thirdweb CLI + Hardhat

- **测试**：Hardhat + Avalanche Fuji 测试网



## 合约架构 / Smart Contract Architecture



- **MoonToken.sol**：ERC-20 治理与奖励代币（MOON）

- **MenstrualHut.sol**：核心合约

&nbsp; - 用户注册与身份管理

&nbsp; - 感受上传与 CID 存储

&nbsp; - 经期数据记录

&nbsp; - MOON 代币铸造与发放逻辑

&nbsp; - 内容审核与公开/私有权限控制

&nbsp; - 付费查看经验贴的支付与访问控制



## 项目结构（页面路由） / Page Routes



| 路径                    | 页面名称                    | 主要功能                         | 访问权限     |
|-------------------------|-----------------------------|----------------------------------|--------------|
| `/`                     | Home / 首页                 | 项目介绍Slogan快速入口       | Public       |
| `/upload`               | Upload Feeling              | 上传身体感受                     | User         |
| `/my-archive`           | My Archive / 我的小屋       | 查看自己的所有记录               | User         |
| `/cycle`                | Cycle Tracker / 周期记录    | 经期记录与玻璃小人可视化         | User         |
| `/explore`              | Explore / 探索              | 浏览公开经验贴（免费+付费）      | Public/User  |
| `/knowledge`            | Knowledge Base / 生理知识   | 免费性教育与月经知识（静态+动态）| Public       |
| `/profile`              | Profile / 个人中心          | MOON 余额设置审核者入口      | User         |



## 黑客松信息 / Hackathon Info



- **赛道**：生命与共生 (Life & Co-existence)

- **Slogan**：No uterus, no opinion

- **核心理念**：去中心化 + 不可篡改 + 照顾与结盟

- **开发周期**：赛前准备 + 48小时现场冲刺

- **团队**：2人（创意 & 内容 / 合约 & 前端）



## 未来展望 / Future Roadmap



- 真实月经用品捐赠机制（贡献值兑换）

- 线下签名活动 + NFT 证书

- DAO 治理（MOON 持有者共同决策）

- 多链部署（主网 + Subnet）

- 心理疗愈社区模块



---



**Made with ❤️ for every woman who wants her body to be heard, remembered, and never erased.**



**用代码守护每一次身体的低语，让女性的生命经验成为链上永恒的光。**



---



## 如何运行 / How to Run



```bash

# 克隆项目

git clone https://github.com/BareerahBenjamin/Menstrual_Hut.git



# 安装依赖

cd Menstrual_Hut

npm install



# 运行前端

npm run dev

