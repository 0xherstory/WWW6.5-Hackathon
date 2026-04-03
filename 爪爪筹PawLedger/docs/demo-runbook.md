# PawLedger Demo Runbook

> Pink HerSolidity Hackathon 2026 现场演示手册（中文在前，英文在后）

---

## 中文版

### 1. 演示目标

在 Avalanche Fuji 上完整演示一次“可审计、低信任依赖”的动物救助筹款闭环：

1. 救助者提交案例
2. 审核者通过案例
3. 捐助者捐款
4. 救助者提交里程碑证明
5. 捐助者投票通过里程碑
6. 救助者提取已通过的里程碑资金

### 2. 环境检查清单（T-30 分钟）

#### 合约

```bash
cd projects/pawledger/src/contracts
npx hardhat test
```

预期：全部测试通过（当前基线：61 passing）。

#### 前端

```bash
cd projects/pawledger/src/ui
npm install
npm run build
npm run dev
```

预期：开发服务器在 http://localhost:5173 正常启动，且无构建报错。

#### 钱包与网络

- 钱包 A（救助者 + 初始审核者/Owner）有足够 Fuji AVAX 支付 gas
- 钱包 B（捐助者）有足够 Fuji AVAX 用于捐款和 gas
- 两个钱包都连接 Avalanche Fuji（chainId 43113）
- 水龙头备用：https://faucet.avax.network

#### 可选项（图片上传）

- projects/pawledger/src/ui/.env 中配置 VITE_PINATA_JWT=...
- 若不可用，可使用纯文本元数据完成演示（不影响核心流程）

### 3. 现场演示脚本（6-8 分钟）

#### 3.1 开场（30 秒）

- 讲清问题：传统捐助流程中“资金流向不透明、打款缺乏约束”。
- 讲清方案：托管资金 + 里程碑投票 + 链上流水可审计。

#### 3.2 提交案例（钱包 A，1-2 分钟）

1. 打开 /submit
2. 填写标题、描述、目标金额、截止日期、里程碑数量
3. 提交交易
4. 在救助者面板确认案例状态为待审核

讲解点：案例元数据通过 IPFS 引用与链上状态关联。

#### 3.3 审核案例（钱包 A 作为初始审核者，45 秒）

1. 打开 /dashboard/reviewer
2. 审核通过该待审案例
3. 确认状态从 PENDING 进入 ACTIVE

讲解点：审核动作上链，并铸造审核激励代币 PAW。

#### 3.4 捐款（钱包 B，45 秒）

1. 切换到钱包 B
2. 打开 /case/:id
3. 发起 AVAX 捐款
4. 确认筹款进度条增长

讲解点：交易确认速度快，确认时间可在前端反馈中体现。

#### 3.5 里程碑提交与投票（钱包 A 后钱包 B，2 分钟）

1. 钱包 A 提交里程碑证明与请款金额
2. 钱包 B 在同案例下投票 Approve
3. 确认投票权重和进度在 UI 中更新

讲解点：投票权重与捐款占比相关，减少女巫攻击风险。

#### 3.6 提取已通过里程碑资金（钱包 A，45 秒）

1. 钱包 A 发起里程碑提取
2. 确认状态变化和事件时间线更新

讲解点：只有满足治理阈值后，资金才会释放。

#### 3.7 收尾（30 秒）

- 回顾完整链路：提交 -> 审核 -> 捐款 -> 里程碑 -> 投票 -> 释放
- 强调价值：透明可追溯 + 社区监督拨款

### 4. 兜底方案

- 钱包弹窗被拒绝：重试操作，并强调界面有显式错误提示
- 网络不匹配：先切换 Fuji，再重试
- 缺少 Pinata/JWT：跳过图片上传，改为文本提交
- Gas 不足：先给两个钱包补充 faucet

### 5. 演示操作建议

- 提前打开并固定标签页：首页、案例详情、救助者面板、审核者面板、捐助者面板
- 两个钱包建议使用不同浏览器配置或隐身窗口
- 屏幕共享时避免展示私钥和助记词
- 预留一个已创建案例，防止现场 RPC 抖动影响节奏

### 6. 演示后验证

演示结束后快速检查：

1. 案例状态完成 PENDING -> ACTIVE
2. 捐款金额体现在 raisedAmount
3. 里程碑投票改变审批权重
4. 提款仅在通过后成功
5. 事件/支出时间线记录了关键动作

---

## English Version

### 1. Demo Goal

Show one complete, trust-minimized rescue-funding lifecycle on Avalanche Fuji:

1. Rescuer submits a case
2. Reviewer approves the case
3. Donor donates
4. Rescuer submits milestone evidence
5. Donor votes to approve
6. Rescuer withdraws approved milestone funds

### 2. Environment Checklist (T-30 min)

#### Contracts

```bash
cd projects/pawledger/src/contracts
npx hardhat test
```

Expected: all tests pass (current baseline: 61 passing).

#### Frontend

```bash
cd projects/pawledger/src/ui
npm install
npm run build
npm run dev
```

Expected: dev server starts at http://localhost:5173 with no build errors.

#### Wallets and Network

- Wallet A (Rescuer + initial Reviewer/Owner) has enough Fuji AVAX for gas
- Wallet B (Donor) has enough Fuji AVAX for donation and gas
- Both wallets are on Avalanche Fuji (chainId 43113)
- Faucet ready: https://faucet.avax.network

#### Optional (Image Upload)

- projects/pawledger/src/ui/.env contains VITE_PINATA_JWT=...
- If unavailable, run the demo with text-only metadata (core flow remains valid)

### 3. Live Demo Script (6-8 min)

#### 3.1 Opening (30s)

- Explain the problem: weak trust in donation flow and payout transparency.
- Explain the solution: escrow + milestone voting + on-chain ledger.

#### 3.2 Submit Case (Wallet A, 1-2 min)

1. Open /submit
2. Fill title, description, goal amount, deadline, milestone count
3. Submit transaction
4. Confirm case appears as pending in rescuer dashboard

Talking point: metadata is linked on-chain via an IPFS reference.

#### 3.3 Review Case (Wallet A as initial reviewer, 45s)

1. Open /dashboard/reviewer
2. Approve the pending case
3. Confirm status moves from PENDING to ACTIVE

Talking point: review action is on-chain and mints PAW reviewer incentives.

#### 3.4 Donate (Wallet B, 45s)

1. Switch to Wallet B
2. Open /case/:id
3. Donate AVAX
4. Confirm funding progress increases

Talking point: fast confirmation is visible in transaction feedback.

#### 3.5 Milestone + Vote (Wallet A then Wallet B, 2 min)

1. Wallet A submits milestone evidence and requested amount
2. Wallet B opens the same case and votes Approve
3. Confirm vote weights/progress update in UI

Talking point: vote weight is proportional to donation share.

#### 3.6 Withdraw Approved Milestone (Wallet A, 45s)

1. Wallet A withdraws approved milestone funds
2. Confirm status and event timeline update

Talking point: funds are released only after governance conditions are met.

#### 3.7 Close (30s)

- Recap full flow: submit -> review -> donate -> milestone -> vote -> release
- Emphasize transparent auditability and community-supervised disbursement

### 4. Fallback Paths

- Wallet popup rejected: retry and highlight explicit UI error handling
- Network mismatch: switch to Fuji and retry
- Missing Pinata/JWT: skip image upload and continue with text-only submission
- Insufficient gas: top up both wallets via faucet

### 5. Demo Operator Notes

- Keep tabs ready: Home, Case Detail, Rescuer Dashboard, Reviewer Dashboard, Donor Dashboard
- Use two wallet sessions (separate profiles/incognito)
- Never expose private keys or seed phrases on screen
- Keep one pre-created backup case in case of temporary RPC instability

### 6. Post-Demo Verification

After the demo, run this quick confidence check:

1. Case status transition observed: PENDING -> ACTIVE
2. Donation reflected in raised amount
3. Milestone vote changed approval weight
4. Withdraw succeeded only after approval
5. Expense/event timeline captured each key action
