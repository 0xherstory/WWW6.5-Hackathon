# 心契（Pacta）—— 你的承诺，链上生效

[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)
[![Solidity](https://img.shields.io/badge/Solidity-^0.8.24-blue)](https://soliditylang.org/)
[![Avalanche](https://img.shields.io/badge/Network-Avalanche%20Fuji-red)](https://testnet.avax.network/)
[![Built with Love](https://img.shields.io/badge/Built%20with-❤️-ff69b4)](https://pacta.lovable.app)

**把微小的坚持，写进区块链；把犹豫的自己，锁进智能合约。**

---

## 项目简介

心契（Pacta）是一个**链上微习惯自律协议**，致力于帮助用户将“我应该”转化为“我承诺”。

用户通过在 Avalanche Fuji Testnet 上质押 AVAX 创建挑战，一旦开始就无法随意反悔。成功坚持可赎回质押并获得奖励池分红，未完成则质押自动进入奖励池，形成真正的 **Check-in-to-Earn** 激励机制。

我们相信：**真正的自由源于自律，而自律需要不可撤销的契约**。

---

## 核心特性

- **内置《65种微习惯》挑战体系**  
  涵盖脑力、身体、健康、幸福、商业、生产力六大领域，直接源自畅销书微习惯理念

- **真金白银的经济约束**  
  每个挑战必须质押 AVAX，违约成本真实且不可逆

- **奖励池机制（Check-in-to-Earn）**  
  未完成者的质押进入公共奖励池，坚持打卡的用户可获得额外奖励

- **用户可自定义挑战**  
  支持完全自定义习惯名称、频率、持续天数和质押金额

- **AI 智能分析与鼓励**  
  基于打卡数据，AI 给出个性化调整建议和温暖鼓励话语

- **链上永久记录**  
  所有创建、打卡、奖励、slash 操作均在 Avalanche 区块链上不可篡改

---

## 技术栈

- **前端**：React + Vite + TypeScript + Tailwind CSS + Wagmi + Viem（手账风格 UI）
- **智能合约**：Solidity ^0.8.24（部署于 Avalanche Fuji Testnet）
- **后端**：Node.js + Express + Prisma + SQLite（事件索引与缓存）
- **AI 集成**：Grok / OpenAI API（分析打卡数据并生成鼓励）
- **区块链**：Avalanche Fuji Testnet（Chain ID: 43113）

---

## 快速开始

### 1. 访问应用
[🚀 立即体验心契（Pacta）](https://你的lovable域名.lovable.app)  
（请使用 MetaMask 连接 Avalanche Fuji Testnet）

### 2. 获取测试 AVAX
访问 [Avalanche Fuji 水龙头](https://faucet.avax.network/)

### 3. 本地开发（Frontend）

```bash
git clone https://github.com/你的用户名/pacta.git
cd pacta
npm install
npm run dev