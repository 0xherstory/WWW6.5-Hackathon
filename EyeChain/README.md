# EyeChain
web3 hackathon

-----

# EyeChain: Blockchain-Based Vision Risk Monitoring & Collaboration Network
# 去中心化视觉风险智能协议

去中心化视觉风险智能协议
Live Demo 演示地址 | Contract (Avalanche Fuji)

## 🌟 Project Overview

**EyeChain** is a decentralized platform designed for high-risk vision populations (such as those with high myopia, retinal tears, or post-operative status). Unlike existing solutions for the blind, EyeChain focuses on the "364 days between hospital visits," providing behavioral risk monitoring and a patient-driven collaborative data network.


## 🌟 项目简介

**EyeChain** 是一个为视觉高风险人群（如高度近视、视网膜裂孔、术后恢复期人群）设计的去中心化平台。不同于针对盲人的辅助系统，EyeChain 关注的是“两次医院检查之间的 364 天”，提供行为风险监测和患者驱动的协作数据网络。

### 🚩 The Problem

  * **The Gap:** Doctors usually recommend one exam per year, leaving 364 days without monitoring.
  * **The Uncertainty:** Patients struggle to judge which daily activities (exercise, posture, acceleration) are safe for their specific retinal condition.
  * **The Data Silo:** Vital real-world experience and recovery data are scattered and not owned by the patients.


### 🚩 核心痛点

  * **监测真空：** 医生通常只建议一年检查一次，剩下的 364 天没有任何行为风险监测。医生或是庸医或给你下死罪永别运动。
  * **判断困难：** 患者无法判断哪些日常行为（运动、姿势、加速度）对自己脆弱的视网膜是危险的。
  * **数据孤岛：** 真实的康复经验和行为数据碎片化，且不被患者本人拥有。

### 💡 Our Solution

  * **Personalized Risk Scoring:** A smart contract-based profile that calculates a "Vulnerability Score."
  * **Behavioral Monitoring:** Tracks acceleration loads and physical activities to provide real-time alerts.
  * **Patient-Driven DAO:** A decentralized database where users own their health data and share experiences to help others.


### 💡 解决方案

  * **个性化风险评分：** 基于智能合约的用户档案，计算“脆弱性评分”。
  * **行为监测：** 追踪加速度负载和身体活动，提供实时风险预警。
  * **患者驱动 DAO：** 建立去中心化数据库，用户拥有自己的健康数据，并通过分享经验获取激励。
-----

## 🛠 Technical Stack

  * **Frontend:** React + TypeScript + Tailwind CSS + Framer Motion(Lovable.dev)
  * **Web3 Library:** Ethers.js
  * **Wallet:** MetaMask
  * **Blockchain:** Avalanche Fuji Testnet(ChainID: 43113)
  * **Smart Contracts:** Solidity (OpenZeppelin, AccessControl, ReentrancyGuard, Developed via Remix)

-----

## 🛠 技术栈

  * **前端:** React / Next.js (Lovable.dev)
  * **Web3 交互:** Ethers.js
  * **钱包:** MetaMask
  * **区块链:** Avalanche Fuji 测试网
  * **智能合约:** Solidity (Remix 部署)

Architecture: Lovable-driven UI with GitHub synchronized workflow
-----

## 🚀 MVP Features (v1.0)

1.  **On-chain User Registration:** Securely store eye health history (retinal detachment, laser treatment count, etc.).
2.  **Risk Assessment Dashboard:** Visualizes the user's current vulnerability based on medical history.
3.  **Risk Event Submission:** Log daily activities (e.g., heavy lifting, sports) to the blockchain to monitor cumulative risk.
4.  **Data Sharing Governance:** Choose between private data, anonymous sharing, or public contribution.

---



## 🚀 MVP 核心功能 (v1.0)

1.  **链上用户注册：** 安全存储眼科病史（视网膜脱离情况、激光治疗次数等）。
2.  **风险评估仪表盘：** 根据病史可视化用户当前的身体脆弱程度。
3.  **风险事件提交：** 将日常活动（如重物搬运、剧烈运动）记录在链上，监测累计风险。
4.  **数据共享管理：** 用户可自主选择私密数据、匿名共享或完全公开。

-----

## 📂 Project Structure / 项目结构

```text
/ (Project Root)
├── contracts/               # Smart Contract Source (SSOT) / 核心智能合约
│   ├── UserManagement.sol   # Role-based user profiling (8 medical parameters) / 角色管理与医学画像
│   ├── RiskManagement.sol   # FMEA RPN logic & risk event logging / FMEA 风险评估核心逻辑
│   └── DataSharingAndRewards.sol # B2B Marketplace & incentive distribution / B2B 数据市场与激励分配
├── src/                     # Frontend Application Source / 前端应用源码
│   ├── components/          # Modular UI Components / 模块化组件
│   │   ├── dashboard/       # Real-time FMEA monitors & Mermaid animations / 实时风险监控与动态图表
│   │   ├── marketplace/     # Institutional data purchasing & B2B portal / 机构数据采购与变现门户
│   │   └── registration/    # Multi-step medical data onboarding / 多步式医疗数据入库
│   ├── hooks/               # Custom React Hooks / 自定义逻辑钩子
│   │   └── useEyeChain.ts   # Unified Web3 contract interaction logic / 统一的 Web3 合约交互逻辑
│   ├── lib/                 # Core Libraries & Configurations / 核心库与配置
│   │   ├── contract.ts      # SSOT for ABIs and Avalanche Fuji addresses / 合约 ABI 与地址的唯一真理源
│   │   ├── constants.ts     # Clinical standards (20-20-20 rule) / 临床标准与护眼常识
│   │   └── knowledgeBase.ts # Decentralized eye-health wiki data / 去中心化眼健康知识库
│   └── pages/               # Application Routing & Views / 页面路由与主视图
├── public/                  # Static Assets / 静态资源
└── README.md                # Project documentation (Bilingual) / 项目说明文档（双语）
```


## 📝 License

This project is licensed under the MIT License.

-----

### 🔗 Deployment Info

  * **Contract Address (Fuji):your wallet address
  * **Network:** Avalanche Fuji Testnet
  * **Token:** AVAX (Testnet)
