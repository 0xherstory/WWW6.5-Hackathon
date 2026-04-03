# BeautyProof — MVP

## Overview | 项目概述

**BeautyProof** is a lightweight Web3 application that enables users to record and verify aesthetic procedure history on-chain.  

BeautyProof 是一个轻量级 Web3 应用，用于记录和验证医美/轻医疗行为的链上历史。

It transforms personal experiences into **tamper-proof, user-owned, and verifiable records**, addressing trust issues in real-world scenarios.  

它将个人经历转化为**不可篡改、用户持有、可验证的记录**，用于解决现实场景中的信任问题。

## Why This Matters | 为什么做这个

This idea comes from real-world frustration.

这个想法来源于真实的困惑与经历。

In aesthetic and light medical scenarios,  
users often lack control over their own records,  
and trust relies heavily on institutions.

在医美场景中，  
用户往往无法掌握自己的记录，  
信任建立在机构之上，而非数据本身。

BeautyProof explores a simple shift:

BeautyProof 想做一个很简单的改变：

> What if users could own their own proof?

如果用户能拥有自己的“证明”呢？

Not as a complex system —  
but as a minimal, verifiable layer.

不是复杂系统，  
而是一个最小的、可验证的信任层。

---

## Problem | 问题背景

In aesthetic and light medical industries, users often face:  

在医美与轻医疗行业中，用户常常面临：

- Lack of transparency in procedures and product usage  
  信息不透明（产品批次、操作记录不可追溯）

- Difficulty proving records in dispute scenarios  
  纠纷难以举证

- No ownership of personal data  
  数据不属于用户（掌握在机构手中）

At its core:  

本质问题是：

> **Trust is fragile because records are not verifiable or user-controlled.**  
> **信任脆弱，因为记录不可验证且不属于用户。**

---

## Solution | 解决方案

BeautyProof provides a minimal on-chain recording system where:  

BeautyProof 提供一个最小化的链上记录系统：

- Users log their procedure details directly  
  用户自行记录每次医美行为

- Records are written on-chain (immutable)  
  数据写入链上（不可篡改）

- Data can be queried and verified anytime  
  可随时查询与验证

### Key Properties | 核心特性

- User-owned data（用户持有数据）  
- Tamper-proof records（不可篡改）  
- Verifiable history（可验证历史）  

---

## MVP Scope | 功能范围

This MVP focuses on validating the **core value proposition**.  

本项目专注于验证核心价值，不做过度扩展。

---

### Features Implemented | 已实现功能

#### 1. Wallet Connection | 钱包连接
- MetaMask integration  
- Network validation (Avalanche Fuji Testnet)

---

#### 2. Record Submission (Write) | 数据写入

Users can submit:  

用户可输入：

- Procedure Type（项目类型）  
- Product Batch（产品批次）  
- Doctor ID（医生标识）  
- Notes（备注）  

→ Stored on-chain via `recordProcedure`

---

#### 3. Record Query (Read) | 数据查询

- Input record index  
- Query via `getProcedure`

返回数据包括：

- User address  
- Procedure type  
- Product batch  
- Doctor ID  
- Notes  
- Timestamp  

---

## User Flow | 用户流程

### Record Flow | 写入流程

Connect Wallet → Fill Form → Submit → Confirm → On-chain record  

连接钱包 → 填写信息 → 提交 → 钱包确认 → 链上记录

Contract deployed on Avalanche Fuji Testnet.

---

### Query Flow | 查询流程

Input Index → Query → Display Record  

输入索引 → 查询 → 展示结果

---

## Tech Stack | 技术架构

- **Frontend:** HTML + JavaScript  
- **Web3:** ethers.js  
- **Wallet:** MetaMask  
- **Network:** Avalanche Fuji Testnet  
- **Contract:** Solidity  

---

## Design Philosophy | 设计理念

BeautyProof is intentionally minimal.  

BeautyProof 采用极简设计理念：

- Focus on core trust mechanism（只验证核心信任机制）  
- Avoid unnecessary complexity（避免复杂系统）  
- Prioritize clarity（强调清晰与直观）  

UI direction:

- Clean & minimal（简洁）  
- Medical-professional tone（医疗信任感）  
- Calm and trustworthy（克制与可信）  

---

## What This Is Not (Yet) | 当前不包含

To keep MVP focused, the following are not included:  

为了保持 MVP 简洁，暂不包含：

- User accounts（用户系统）  
- Role permissions（权限体系）  
- Backend services（后端系统）  
- Data privacy layer（隐私层）  
- Institutional integration（机构接入）  

---

## Future Directions | 未来方向

- Verified doctor signatures（医生签名）  
- Institutional collaboration（机构参与）  
- Encrypted records（隐私记录）  
- Record list view（多记录展示）  
- Identity & reputation layer（身份与信誉体系）  

---

## Demo Narrative | 项目表达

BeautyProof demonstrates a simple idea:  

BeautyProof 想表达一个核心理念：

> Personal experiences can become verifiable, user-owned data.  
> 个人经历可以转化为可验证、由用户持有的数据。

It explores how blockchain can act as a **trust layer** in real-world scenarios.  

探索区块链如何成为现实世界中的“信任基础设施”。

---

## Project Status | 项目状态

- Smart contract deployed（合约已部署）  
- Frontend connected（前端已连接）  
- Write + Read functional（写入 + 查询完成）  
- UI upgraded（界面优化完成）  

---

## Author | 作者

Ryana Faye Yu （ 飞飞 ） 
Independent Builder | Exploring Web3 × Human-Centered Products










