# 爪爪筹 · PawLedger

> 透明、可信的动物救助众筹平台 · Transparent animal rescue crowdfunding on-chain

**HerSolidity Hackathon 2026** — 赛道1 生命与共存 + 赛道3 Avalanche 生态

---

## 简介 · About

爪爪筹是一个部署在 Avalanche C-Chain 上的 Web3 DApp。通过智能合约里程碑锁仓 + 捐助者投票机制，让每一笔捐款可追溯、每一次拨款有投票，彻底解决传统动物救助筹款中的信任问题。

PawLedger is a Web3 DApp on Avalanche C-Chain. Milestone-locked escrow + donor voting makes every donation traceable and every disbursement accountable.

---

## 用户角色 · User Roles

| 角色 | 说明 |
|------|------|
| 🐾 **救助者 (Rescuer)** | 提交救助申请 → 等待审核 → 公开募捐 → 按里程碑提取资金 |
| 💙 **捐助者 (Donor)** | 浏览案例 → 捐款 AVAX → 对里程碑投票 → 累计达标可晋升审核者 |
| ✅ **审核者 (Reviewer)** | 由捐助者晋升，审核新案例，获得 $PAW 代币奖励 |

审核者由捐助者自愿晋升（累计捐款 ≥ 0.1 AVAX），产品 Owner 为初始审核者，随平台生长动态扩容审核池。

---

## 核心机制 · Key Mechanics

- **里程碑锁仓** — 资金按阶段释放，救助者提交证明后触发投票
- **权重投票** — 投票权重与捐款比例挂钩，防 Sybil 攻击；>50% 赞成自动通过，48h 内 >30% 反对自动拒绝
- **动态审核池** — 捐助者晋升审核者，审核案例获 $PAW 奖励（每次 10 $PAW）
- **$PAW 代币** — ERC-20 治理代币，审核行为的链上激励
- **自动退款** — 截止日期未关闭则资金按捐款比例退回

---

## 技术栈 · Stack

| Layer | Tech |
|-------|------|
| Blockchain | Avalanche Fuji Testnet (C-Chain, chainId 43113) |
| Smart Contracts | Solidity 0.8.22 + Hardhat + OpenZeppelin v5 |
| Upgrade Pattern | UUPS Proxy (ERC-1967) |
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

区块浏览器 · Explorer: `https://testnet.snowtrace.io`

---

## 快速开始 · Quick Start

### 环境变量 · Environment

在 `projects/pawledger/src/contracts/` 创建 `.env`：

```
PRIVATE_KEY=<your_deployer_wallet_key>
```

在 `projects/pawledger/src/ui/` 创建 `.env`（用于 IPFS 上传）：

```
VITE_PINATA_JWT=<your_pinata_jwt>
```

### 合约 · Contracts

```bash
cd projects/pawledger/src/contracts
npm install
npx hardhat compile
npx hardhat test                                    # 61 tests
npx hardhat run deploy.js --network fuji            # 重新部署
```

### 前端 · Frontend

```bash
cd projects/pawledger/src/ui
npm install
npm run dev                                         # 本地开发 http://localhost:5173
npm run build                                       # 生产构建
npm run deploy                                      # 部署到 GitHub Pages
```

---

## 合约架构 · Contract Architecture

| 合约 | 用途 |
|------|------|
| `PawLedgerV1.sol` | 核心托管合约（UUPS 可升级）：案例、捐款、里程碑、投票、审核逻辑 |
| `PawToken.sol` | $PAW ERC-20 治理代币，由 PawLedger 合约铸造 |

**部署顺序 · Deploy Order:**

1. Deploy `PawToken(deployer)`
2. Deploy `PawLedgerV1` implementation
3. Deploy `ERC1967Proxy(impl, initCalldata)` → 此地址为用户交互地址
4. Call `pawToken.setMinter(proxyAddr)`

---

## 页面路由 · Routes

| 路径 | 页面 | 角色 |
|------|------|------|
| `/` | Home | 所有人 |
| `/cases` | CaseBrowser | 所有人 |
| `/case/:id` | CaseDetail | 所有人 |
| `/submit` | SubmitCase | 救助者 |
| `/dashboard/rescuer` | RescuerDashboard | 救助者 |
| `/dashboard/donor` | DonorDashboard | 捐助者 |
| `/dashboard/reviewer` | ReviewerDashboard | 审核者 |

---

## 网络配置 · Network

- Testnet: Avalanche Fuji (`chainId: 43113`)
- RPC: `https://api.avax-test.network/ext/bc/C/rpc`
- Faucet: `faucet.avax.network`
- Native currency: AVAX

---

## 文档 · Docs

- [`projects/pawledger/docs/prd.md`](projects/pawledger/docs/prd.md) — 完整产品需求文档 (v2.0)
