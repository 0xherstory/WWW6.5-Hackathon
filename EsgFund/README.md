# Reactive ESG Fund (Hackathon MVP)

Reactive ESG Fund 是一个黑客松规模的 Web3 演示项目：  
通过 ESG 评分变化和事件触发策略，而不是价格波动，驱动组合调仓。

核心链路：

`Off-chain score -> Oracle update -> Reactive policy -> Portfolio rebalance (accounting model)`

## 功能范围

已实现（MVP）：
- 单页 Dashboard（Next.js App Router + TypeScript）
- 最小后端 4 个 API
  - `GET /api/protocols`
  - `POST /api/calculate-score`
  - `GET /api/history`
  - `GET /api/events`
- SQLite 最小三表
  - `protocols`
  - `score_history`
  - `events`
- ESG 评分模型（E/S/G + Rating）
- Simulator 场景推演
- Oracle 链上写入与状态读取
- Reactive/Portfolio 链路追踪（timeline tx）
- 中英文语言切换

明确不做：
- 认证
- cron
- 真实 DEX swap
- 多用户/多链/重基础设施

## 技术栈

- Frontend: Next.js 14 + TypeScript
- Styling: Tailwind + 自定义 CSS
- Backend: Next.js Route Handlers
- DB: SQLite (`node:sqlite`)
- Contracts: Solidity 0.8.x + OpenZeppelin
- Wallet: MetaMask
- Network: Sepolia + Reactive

## 目录结构（核心）

- `app/`：页面与 API route
- `components/dashboard/`：Dashboard 组件
- `lib/`：评分模型、数据库、链上客户端
- `data/`：seed 与 mock 数据
- `contracts/`：Solidity 合约

## 本地启动

```bash
npm install
npm run dev -- --port 3005
```

浏览器打开：`http://localhost:3005`

## 环境变量

在项目根目录创建 `.env.local`：

```env
NEXT_PUBLIC_ESG_ORACLE_ADDRESS=
NEXT_PUBLIC_SEPOLIA_RPC_URL=
NEXT_PUBLIC_REACTIVE_RPC_URL=
NEXT_PUBLIC_REACTIVE_POLICY_ADDRESS=
NEXT_PUBLIC_POLICY_EXECUTOR_ADDRESS=
NEXT_PUBLIC_REACTIVE_PORTFOLIO_ADDRESS=

NEXT_PUBLIC_AQUALEND_ADDRESS=
NEXT_PUBLIC_GRIDVAULT_ADDRESS=
NEXT_PUBLIC_TERRASWAP_ADDRESS=
NEXT_PUBLIC_NORTHBRIDGE_ADDRESS=
```

## 合约清单

- `contracts/MockERC20.sol`
- `contracts/EsgOracle.sol`
- `contracts/ReactiveEsgPortfolio.sol`
- `contracts/EsgReactivePolicy.sol`
- `contracts/EsgPolicyCallbackExecutor.sol`

## 演示建议流程

1. 连接钱包（Sepolia）  
2. 在 Simulator 选择协议并触发场景（如 `rating_upgrade` / `rating_downgrade`）  
3. 观察：
   - ESG 看板评分变化
   - ESG 策略配置（数据库建议仓位）
   - Timeline 的 Oracle / Reactive / Portfolio tx（若链路已打通）

## 备注

- 当前组合执行是 accounting model，不进行真实 swap。  
- 若仅演示策略建议，可使用 MANUAL 口径，仅展示数据库建议仓位。  
- 若要演示自动执行，需完成 Reactive 回调链路部署与初始化。
