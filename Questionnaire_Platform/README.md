
🧠项目名称：链上问卷平台Questionnaire_Platform
---

一句话描述：
一个基于 Avalanche 的去中心化问卷与数据收集平台，通过链上资金托管与秒级结算，实现可信的人类数据获取。

项目背景 & 问题（Problem）
---
当前主流问卷平台存在以下问题：

数据来源不透明，容易刷量或造假
被试质量不可控，缺乏身份验证机制
激励分发效率低，依赖中心化平台
发布问卷成本高，需要购买会员或依赖社交传播

👉 本质问题：
---
缺乏一个“可信、开放、可激励”的数据收集基础设施

项目内容（Solution）
---
我们提出一个链上数据收集协议，将“问卷”升级为一种可验证的数据交易行为：

核心机制：
---
问卷发布（Requester）

用户创建问卷（链下存储）

设置奖励与参与人数

将资金存入智能合约（escrow）

问卷填写（Responder）

用户通过钱包参与问卷

提交答案（链下）+ 答案哈希（链上）

验证机制（Validation）
---
基于规则 / 行为检测 / 简单审核

判断答案有效性

自动结算（Settlement）

合约自动释放奖励

用户完成问卷后可秒级到账

Web3 的核心优势（Why Web3）
---
1）信任最小化（Trustless）

所有奖励通过智能合约托管（escrow）
避免平台或问卷发起方“拒付”

2）数据可验证（Verifiable Data）

每份问卷提交都记录 hash

数据来源可追溯、不可篡改

3）开放参与（Permissionless）

全球用户可直接参与

不依赖中心化平台或身份体系

4）可编程激励（Programmable Incentives）

自动化奖励分发

支持质押、防作弊机制（可扩展）


为什么选择 Avalanche（Why Avalanche）
---
相比 Ethereum 等传统链，我们选择 Avalanche 的原因：

⚡ 1）低延迟（Sub-second Finality）
用户提交问卷后可快速确认交易
👉 实现“实时奖励结算”

💸 2）低交易费用
支持高频、小额支付场景
非常适合问卷（每人少量奖励）

🚀 3）高吞吐量
支持大规模用户同时参与问卷
👉 可扩展为全球数据收集网络

🧩 4）子网（Subnet）潜力（未来规划）
可构建专属“数据网络”
支持隐私保护与高性能数据处理

---

# 🧩 项目核心

* **链上负责钱（信任）**
* **链下负责数据（效率 + 隐私）**
* **人工参与验证（现实可行）**

---

# ⚙️ 核心流程

## 1）发布问卷（Requester）

* 连接钱包（MetaMask）
* 输入：

  * 问卷标题 / 内容（链下）
  * 奖励：例如 0.5 AVAX × 5人
* 调用合约：

  * 存入 AVAX（escrow）

✅ 合约状态：

* 问卷创建成功
* 资金锁仓

---

## 2）填写问卷（Responder）

* 用户连接钱包
* 填写问卷（前端）
* 提交答案（链下）
* 同时提交：

  * answer hash（链上）
---

## 3）验证机制

👉 **双层验证

### 第一层：自动规则（基础防作弊）

* 填写时间检测
* 必答题检查
* 简单逻辑校验
---

### 第二层：人工审核（核心）

* 问卷发起者查看答案
* 手动选择：

  * ✅ accept（通过）
  * ❌ reject（拒绝）

---

## 4）奖励发放

* 审核通过后：
  * 合约自动转账 AVAX
* 用户**几秒内到账**

---


# 🏗 技术实现

## 1）智能合约（Solidity）

部署在：
👉 Avalanche C-Chain（Fuji测试网）

---

### 合约核心功能：

```solidity
struct Survey {
    address creator;
    uint reward;
    uint maxResponses;
    uint acceptedCount;
    bool active;
}
```

功能函数：

* `createSurvey()`
* `submitResponse()`
* `approveResponse()`
* `rejectResponse()`
* `claimReward()`

👉 核心逻辑：

* 钱先锁住
* 审核通过才发

---

## 2）前端

建议：

* React / Next.js
* wagmi + ethers.js
* MetaMask 连接


