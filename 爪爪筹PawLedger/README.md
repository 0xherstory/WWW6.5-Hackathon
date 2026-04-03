# 爪爪筹 · PawLedger

> 透明、可信的动物救助众筹 + 链上宠物领养平台 · Transparent animal rescue crowdfunding + on-chain pet adoption

**Pink HerSolidity Hackathon 2026** — 赛道1 生命与共存 + 赛道3 Avalanche 生态

## 新手入口 · Start Here First

- 在线演示（先打开）: https://hikorido.github.io/pawledger/
- 使用流程（截图版 PDF）: https://hikorido.github.io/pawledger/guides/使用流程.pdf
- PRD 文档（网页版）: https://hikorido.github.io/pawledger/PRD.md

---

## 简介 · About

爪爪筹是一个部署在 Avalanche C-Chain 上的 Web3 DApp，包含两个核心模块：

1. **救助筹款模块** — 通过智能合约里程碑锁仓 + 捐助者投票，让每一笔捐款可追溯、每一次拨款有投票，彻底解决传统动物救助筹款中的信任问题。
2. **宠物领养模块** — 链上实名哈希存证 + 领养申请审核，从「救助筹款」到「康复领养」的完整可信闭环。

PawLedger is a Web3 DApp on Avalanche C-Chain with two core modules:

1. **Rescue Crowdfunding** — Milestone-locked escrow + donor voting makes every donation traceable and every disbursement accountable.
2. **Pet Adoption** — On-chain hashed real-name attestation + adoption audit creates a complete lifecycle from rescue to adoption.

---

## 用户角色 · User Roles

### 救助筹款模块

| 角色 | 说明 |
|------|------|
| 🐾 **救助者 (Rescuer)** | 提交救助申请 → 等待审核 → 公开募捐 → 按里程碑提取资金 |
| 💙 **捐助者 (Donor)** | 浏览案例 → 捐款 AVAX → 对里程碑投票 → 累计达标可晋升审核者 |
| ✅ **审核者 (Reviewer)** | 由捐助者晋升（累计捐款 ≥ 0.1 AVAX），审核新案例，获得 $PAW 代币奖励 |

### 宠物领养模块

| 角色 | 说明 |
|------|------|
| 🏠 **发布者 (Publisher)** | 发布待领养宠物 → 查看申请 → 审核通过/拒绝领养申请 |
| 🐶 **领养人 (Adopter)** | 完成实名哈希登记 → 浏览宠物 → 提交领养申请 → 等待审核 |

---

## 核心机制 · Key Mechanics

### 救助筹款
- **里程碑锁仓** — 资金按阶段释放，救助者提交证明后触发投票
- **权重投票** — 投票权重与捐款比例挂钩，防 Sybil 攻击；>50% 赞成自动通过，48h 内 >30% 反对自动拒绝
- **动态审核池** — 捐助者晋升审核者，审核案例获 $PAW 奖励（每次 10 $PAW）
- **$PAW 代币** — ERC-20 治理代币，审核行为的链上激励
- **自动退款** — 截止日期未关闭则资金按捐款比例退回

### 宠物领养
- **实名哈希存证** — 仅存姓名/证件/手机号的哈希，兼顾隐私与可验证性
- **一地址一登记** — 同一钱包仅可实名登记一次，防止重复申请
- **仅发布者可审核** — 权限严格隔离，防止越权操作
- **一宠物一领养** — 审核通过后自动阻断新申请，状态链上永久记录

---

## 技术栈 · Stack

| Layer | Tech |
|-------|------|
| Blockchain | Avalanche Fuji Testnet (C-Chain, chainId 43113) |
| Smart Contracts | Solidity 0.8.22 + Hardhat + OpenZeppelin v5 |
| Upgrade Pattern | UUPS Proxy (ERC-1967) on PawLedger |
| Frontend | React 18 + Vite + Tailwind CSS |
| Web3 | Ethers.js v6 |
| Storage | IPFS via Pinata |
| i18n | 中文默认，支持英文切换 |

---

## 已部署合约 · Deployed Contracts (Fuji Testnet)

| 合约 | 地址 |
|------|------|
| PawToken ($PAW) | `0x2B3F619dF5d9b4f855cC2a634a2db4E4A9837267` |
| PawLedger (Proxy) | `0x7C2BBb15Cc5becD532ad10B696C35ebbDbFE92C3` |
| PawAdoption | `0xa666392dc14B8dECc3b3BD4FF9e790821444e03F` |

区块浏览器 · Explorer: `https://testnet.snowtrace.io`

---

## 快速开始 · Quick Start

### 环境变量 · Environment

在 `pawledger/contracts/` 创建 `.env`：

```
PRIVATE_KEY=<your_deployer_wallet_key>
```

在 `pawledger/ui/` 创建 `.env`（用于 IPFS 上传）：

```
VITE_PINATA_JWT=<your_pinata_jwt>
```

### 合约 · Contracts

```bash
cd pawledger/contracts
npm install
npx hardhat compile
npx hardhat test                                    # 61 tests
npx hardhat run deploy.js --network fuji            # 重新部署
```

### 前端 · Frontend

```bash
cd pawledger/ui
npm install
npm run dev                                         # 本地开发 http://localhost:5173
npm run build                                       # 生产构建
npm run deploy                                      # 生成并同步 Pages 静态文件到仓库根目录 docs/
```

GitHub Pages 仓库设置：

- Branch: `main`
- Folder: `/爪爪筹PawLedger/docs`

---

## 合约架构 · Contract Architecture

| 合约 | 用途 |
|------|------|
| `PawLedgerV1.sol` | 核心托管合约（UUPS 可升级）：案例、捐款、里程碑、投票、审核逻辑 |
| `PawToken.sol` | $PAW ERC-20 治理代币，由 PawLedger 合约铸造 |
| `PawAdoption.sol` | 宠物领养合约：宠物发布、实名登记、领养申请、审核逻辑 |

**部署顺序 · Deploy Order:**

1. Deploy `PawToken(deployer)`
2. Deploy `PawLedgerV1` implementation
3. Deploy `ERC1967Proxy(impl, initCalldata)` → 此地址为用户交互地址
4. Call `pawToken.setMinter(proxyAddr)`
5. Deploy `PawAdoption()`

---

## 页面路由 · Routes

### 救助筹款

| 路径 | 页面 | 角色 |
|------|------|------|
| `/` | Home | 所有人 |
| `/cases` | CaseBrowser | 所有人 |
| `/case/:id` | CaseDetail | 所有人 |
| `/submit` | SubmitCase | 救助者 |
| `/dashboard/rescuer` | RescuerDashboard | 救助者 |
| `/dashboard/donor` | DonorDashboard | 捐助者 |
| `/dashboard/reviewer` | ReviewerDashboard | 审核者 |

### 宠物领养

| 路径 | 页面 | 角色 |
|------|------|------|
| `/adoption` | AdoptionBrowser | 所有人 |
| `/adoption/:id` | AdoptionDetail | 所有人 |
| `/adoption/publish` | PublishPet | 发布者 |
| `/dashboard/publisher` | PublisherDashboard | 发布者 |
| `/dashboard/adopter` | AdopterDashboard | 领养人 |

---

## 网络配置 · Network

- Testnet: Avalanche Fuji (`chainId: 43113`)
- RPC: `https://api.avax-test.network/ext/bc/C/rpc`
- Faucet: `faucet.avax.network`
- Native currency: AVAX

---

## 文档 · Docs

- [`docs/PRD.md`](docs/PRD.md) — 完整产品需求文档（救助筹款 + 宠物领养）
- [`docs/demo-runbook.md`](docs/demo-runbook.md) — 现场演示手册
- [`docs/guides/使用流程.pdf`](docs/guides/%E4%BD%BF%E7%94%A8%E6%B5%81%E7%A8%8B.pdf) — 面向非技术同学的截图流程说明
