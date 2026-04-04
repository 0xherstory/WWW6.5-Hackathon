# MarkMeow 🐱

基于区块链的流浪猫绝育登记平台，帮助追踪和管理流浪猫的绝育状态。

## 项目预览
https://markmeow.lovable.app

## 项目结构

```
MarkMeow/
├── contracts/                 # 智能合约
│   └── MarkMeow.sol           # Solidity 合约（Avalanche Fuji 测试网）
├── frontend/                  # 前端应用（React + Vite + TypeScript）
│   ├── public/                # 静态资源
│   ├── src/
│   │   ├── components/        # UI 组件（猫咪卡片、登记表单、捐款箱等）
│   │   ├── contracts/         # 合约 ABI 和地址配置
│   │   ├── hooks/             # 自定义 Hooks（useWeb3 钱包连接等）
│   │   ├── integrations/      # Supabase 数据库集成
│   │   ├── pages/             # 页面组件
│   │   └── index.css          # 全局样式（绿色/黄色/白色清新主题）
│   ├── supabase/              # 数据库迁移和配置
│   ├── package.json
│   ├── vite.config.ts
│   └── tailwind.config.ts
└── ReadMe.md
```

## 核心功能

1. **流浪猫身份证** — 每只猫咪在链上拥有唯一 ID，数据库存储照片、城市等详细信息
2. **绝育登记与证明** — 链上记录绝育状态，支持上传绝育证明图片
3. **绝育基金捐款** — 通过智能合约捐赠 AVAX，余额实时从链上读取
4. **展览墙筛选** — 按性别、城市、绝育状态筛选猫咪

## 技术栈

| 层级 | 技术 |
|------|------|
| 智能合约 | Solidity ^0.8.19 |
| 区块链网络 | Avalanche Fuji Testnet |
| 前端框架 | React 18 + TypeScript + Vite |
| UI 样式 | Tailwind CSS + shadcn/ui |
| 钱包交互 | ethers.js v6 + MetaMask |
| 数据库 | Supabase（辅助存储照片、城市等链上无法存储的信息） |
| 文件存储 | Supabase Storage（猫咪照片、绝育证明） |

## 智能合约

- **合约地址**: `0x88aa67548C080eFd168379b9567A4c863BdB99F8`
- **网络**: Avalanche Fuji Testnet (Chain ID: 43113)

### 合约方法

| 方法 | 说明 |
|------|------|
| `registerCat(gender, isNeutered)` | 注册猫咪 |
| `updateNeuterStatus(catId, isNeutered)` | 更新绝育状态 |
| `uploadNeuterProof(catId, ipfsHash)` | 上传绝育证明哈希 |
| `donate()` | 捐赠 AVAX |
| `totalCats()` | 查询猫咪总数 |
| `totalDonations()` | 查询捐赠总额 |
| `getContractBalance()` | 查询合约余额 |

## 本地运行前端

```bash
cd frontend
npm install
npm run dev
```

访问给出的链接，如 `http://localhost:8080`，需安装 MetaMask 并切换到 Avalanche Fuji 测试网。

## 获取测试代币

前往 [Avalanche Fuji Faucet](https://faucet.avax.network/) 获取测试用 AVAX。
