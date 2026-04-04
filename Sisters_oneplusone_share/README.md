
# 🌸 Sisters-OnePlusOne-Share (SOOS)

**Sisters-OnePlusOne-Share** 是一个基于以太坊智能合约的去中心化互助拼单平台。旨在解决女性在“买一送一”或“多件打折”消费场景下的信任博弈问题，通过区块链托管资金，确保购物过程安全、透明且仅限女性社区互助。

---

## 🌟 项目愿景 (Vision)
在传统的社交平台拼单中，用户常面临“谁先打款”和“对方不发货”的信任博弈。**SOOS** 通过 Web3 技术构建了一个**零信任 (Zero-Trust)** 的互助协议：
* **双向安全托管**：智能合约作为公正的第三方锁定资金，确保买卖双方行为受逻辑约束。
* **隐私身份验证 (DID)**：利用 ZK 证明或 SBT 验证性别属性，在不泄露隐私的前提下构建纯净的女性互助空间。
* **资金安全保障**：引入申诉与超时机制，确保资金不会因意外情况被永久锁死，保障资产安全。

---

## 🛠️ 核心功能 (Features)

### 1. 双向身份准入 (Mutual Verification) 🔒
* **发起与加入限制**：不仅是参与者，**发起者 (A)** 也必须通过身份验证。
* **技术实现**：集成 **Polygon ID** 或检查地址是否持有特定的 **Soulbound Token (SBT)**。只有经过认证的“姐妹地址”才能调用合约接口。

### 2. 智能拼单与超时取消 (Timed-out Auto-Escrow) ⏳
* **发起拼单 (Create Deal)**：姐妹 A 发布优惠并设定总价，系统自动为该订单设置 **24小时有效期**。
* **自动失效**：若规定时间内无人加入，合约允许 A 一键撤回拼单，避免资金或挂单信息长期滞留。

### 3. 资金锁定与托管 (Join & Locked) 💰
* **加入拼单 (Join Deal)**：姐妹 B 支付 50% 资金进入合约托管。
* **锁定状态**：一旦 B 加入，资金即进入“锁定状态”，任何一方在未达成共识前均无法单方面取走资金。

### 4. 多路径结算与申诉 (Settlement & Appeal) ⚖️
* **正常结算**：B 确认收到货后点击确认，合约立即将托管资金释放给 A。
* **申诉机制 (Appeal)**：若商品不符或未收到货，B 可在确认前发起**申诉**。资金将转入冻结状态，等待社区仲裁或提供证明材料，防止欺诈。

---

## 🎨 Preview

<p align="center">
  <img src="./docs/screenshots/landing_page.png" alt="SOOS Landing Page Preview" width="800px" style="border-radius: 15px; shadow: 10px 10px 30px rgba(0,0,0,0.1);">
</p>



## 📊 业务流程图 (Workflow)

```mermaid
graph TD
    Start[发现优惠] --> AuthA{A 身份验证?}
    AuthA -- 失败 --> RejectA[禁止发起]
    AuthA -- 成功 --> Create[A 创建拼单并预设超时]
    
    Create --> WaitB{等待 B 加入}
    WaitB -- 超过 24h --> Cancel[自动失效: A 取回保证金]
    
    WaitB -- B 申请加入 --> AuthB{B 身份验证?}
    AuthB -- 失败 --> RejectB[禁止加入]
    AuthB -- 成功 --> Locked[资金锁定在合约托管]
    
    Locked --> Receive{B 收到货并满意?}
    Receive -- 是: 确认 --> Success[合约转账给 A: 交易完成 🌸]
    Receive -- 否: 申诉 --> Appeal[资金冻结: 进入仲裁流程]




## 📂 文件夹结构 (Directory Structure)
```text
├── contracts/        # Solidity 智能合约 (Hardhat)
├── frontend/         # Next.js + Tailwind CSS 前端界面
├── test/             # 核心逻辑单元测试
├── scripts/          # 合约部署脚本
└── .env.example      # 环境变量模版（不含私钥）




# 🌸 Sisters-OnePlusOne-Share (SOOS)

**Sisters-OnePlusOne-Share** is a decentralized mutual-aid group-buying platform built on Ethereum smart contracts. It is designed to solve the trust dilemma for women in "Buy One Get One Free" (BOGO) or multi-item discount scenarios by using blockchain as an escrow to ensure a secure, transparent, and female-exclusive shopping experience.

---

## 🌟 Vision
In traditional social media group-buying, users often face the "Who pays first?" and "Will they actually ship?" standoff. SOOS leverages Web3 technology to provide:
- **Fund Escrow**: Funds are locked in a smart contract and only released to the initiator after the participant confirms receipt.
- **Privacy Protection**: Utilizes decentralized identity for verification without exposing phone numbers or real names.
- **Safe Space**: Integrated female-identity verification protocols to build a trusted mutual-aid community.

## 🛠️ Key Features
- **Create Deal**: User A (Initiator) finds a discount, sets the total price, and locks the item details.
- **Join Deal**: User B (Participant) pays exactly half the amount into the contract's escrow.
- **Confirm & Release**: Once B receives the item, they confirm on-chain, and the funds are automatically transferred to A.
- **🔒 Sisterhood Verification (Female-Only)**: 
  - Integration with **Polygon ID / World ID** or specific **Soulbound Tokens (SBT)**.
  - Only addresses verified as female through privacy-preserving protocols can call the `joinDeal` function.




## 📂 Directory Structure
```text
├── contracts/        # Solidity Smart Contracts (Hardhat)
├── frontend/         # Next.js + Tailwind CSS + Ethers.js
├── test/             # Unit tests for core logic
├── scripts/          # Deployment scripts for Sepolia/Mainnet
└── .env.example      # Environment variables template