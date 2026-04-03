# HerGallery｜她的展厅

链上女性主题策展平台，基于 Avalanche Fuji 测试网。

## 项目结构

```
HerGallery/
├── contract/                  # 智能合约（Hardhat）
│   ├── contracts/
│   │   └── HerGallery.sol     # 主合约
│   ├── scripts/
│   │   └── deploy.js          # 部署脚本
│   ├── hardhat.config.js
│   ├── .env                   # 私钥配置
│   └── package.json
│
└── frontend/                  # 前端应用（Vite + React）
    ├── src/
    │   ├── config/
    │   │   ├── contract.ts    # 合约地址、ABI、类型定义
    │   │   └── wagmi.ts      # wagmi v3 配置
    │   ├── hooks/
    │   │   └── useContract.ts # 所有合约交互 Hooks
    │   ├── components/        # UI 组件
    │   ├── pages/             # 页面
    │   └── lib/
    │       └── format.ts      # 格式化工具
    ├── vite.config.ts
    └── package.json
```

## 前置条件

- **Node.js** >= 18
- **npm** 或 **bun**
- **MetaMask** 钱包（或其他支持 injected 的钱包）
- **Avalanche Fuji 测试网** 添加到 MetaMask：[链 ID: 43113](https://testnet.snowtrace.io/)
- **测试 AVAX**：从 [Avalanche Fuji Faucet](https://faucet.avax.network/) 领取

## 智能合约部署

### 1. 安装依赖

```bash
cd HerGallery/contract
npm install
```

### 2. 配置环境变量

编辑 `contract/.env`：

```env
PRIVATE_KEY=your_wallet_private_key_here
```

### 3. 编译合约

```bash
npm run compile
```

### 4. 部署到 Fuji 测试网

```bash
npm run deploy:fuji
```

部署成功后会输出合约地址。部署脚本在 `scripts/deploy.js`。

### 5. 更新前端合约地址（如有变更）

如部署到新地址，修改以下文件中的 `CONTRACT_ADDRESS`：

```
frontend/src/config/contract.ts
```

## 前端运行

### 1. 安装依赖

```bash
cd HerGallery/frontend
npm install
```

### 2. 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:8080

## 合约交互说明

### 合约地址（Avalanche Fuji）

```
0x320900FA245b5E44ebab6B5f2006E2187C83e396
```

[Snowtrace 测试网浏览器查看](https://testnet.snowtrace.io/address/0x320900FA245b5E44ebab6B5f2006E2187C83e396)

### 核心函数

| 函数 | 说明 | 费用 |
|------|------|------|
| `createExhibition(title, contentHash, coverHash)` | 创建展厅 | 0.001 AVAX |
| `submitToExhibition(exhibitionId, contentType, contentHash, title, description)` | 投稿 | 免费 |
| `recommend(exhibitionId, submissionId)` | 推荐投稿 | 免费 |
| `setUsername(username)` | 设置昵称（1-20字符） | 免费 |

### 内容类型（contentType）

| 值 | 类型 |
|----|------|
| `"0"` | 二创 |
| `"1"` | 证言 |
| `"2"` | 截图 |
| `"3"` | 链接 |

### 读取函数

| 函数 | 说明 |
|------|------|
| `getAllExhibitions()` | 获取所有展厅 |
| `getExhibition(id)` | 获取单个展厅 |
| `getSubmissions(exhibitionId)` | 获取展厅所有投稿 |
| `usernames(address)` | 获取用户昵称 |
| `hasSetUsername(address)` | 查询是否已设置昵称 |
| `hasRecommended(exhibitionId, submissionId, user)` | 查询用户是否已推荐 |
| `getRecommendedStatus(exhibitionId, user)` | 批量查询用户的推荐状态 |

### 事件

| 事件 | 触发条件 |
|------|----------|
| `ExhibitionCreated` | 创建展厅 |
| `SubmissionCreated` | 新投稿 |
| `Recommended` | 被推荐 |
| `FirstSubmission` | 用户首次投稿 |
| `RecommendMilestone` | 推荐数达到 10 的倍数 |
| `UsernameSet` | 用户设置昵称 |

## 前端技术栈

| 技术 | 说明 |
|------|------|
| Vite + React 18 | 构建工具 + UI 框架 |
| TypeScript | 类型安全 |
| wagmi v3 | 合约交互（useReadContract / useSimulateContract + useWriteContract） |
| viem | 以太坊交互库 |
| Tailwind CSS + shadcn/ui | 样式组件库 |
| framer-motion | 动画 |
| react-dropzone | 图片上传 |
| React Router v6 | 路由 |

## 常见问题

**Q: 钱包连接不上？**
- 确认 MetaMask 已安装且已解锁
- 确认当前网络为 Avalanche Fuji（链 ID 43113）
- 尝试刷新页面

**Q: 交易失败？**
- 确认钱包有足够的 AVAX 测试币（支付创建展厅费用）
- 确认在 Fuji 测试网上操作

**Q: 内容不显示？**
- 刷新页面重新读取合约数据
- 检查浏览器控制台是否有错误

**Q: 如何修改合约地址？**
- 编辑 `frontend/src/config/contract.ts` 中的 `CONTRACT_ADDRESS`
- 同时确认 `CONTRACT_ABI` 与部署的合约匹配

**Q: 如何设置昵称？**
- 连接钱包后，点击右上角"设置昵称"按钮
- 输入1-20字符的昵称后确认交易
- 设置成功后，昵称将替代地址显示在策展人/创作者位置

## 有用的链接

| 资源 | 地址 |
|------|------|
| Avalanche Fuji 水龙头 | https://faucet.avax.network/ |
| Snowtrace 测试网浏览器 | https://testnet.snowtrace.io/ |
| wagmi 文档 | https://wagmi.sh/ |
| viem 文档 | https://viem.sh/ |
| React Router | https://reactrouter.com/ |
