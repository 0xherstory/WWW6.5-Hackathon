# HerLemma Fuji 部署与初始化清单

这份清单按最短路径安排，适合黑客松现场部署和验收。

## 1. 部署前准备

- 准备一个部署钱包
- 确认钱包在 Avalanche Fuji 上有测试币
- 准备一个平台手续费归集地址 `TREASURY`
- 准备 SBT 元数据目录，例如：
  - `ipfs://<cid>/first-voice.json`
  - `ipfs://<cid>/first-earning.json`
  - `ipfs://<cid>/math-translator.json`
  - `ipfs://<cid>/trusted-reviewer.json`
  - `ipfs://<cid>/viral-explainer.json`
  - `ipfs://<cid>/brand-pick.json`

## 2. 合约部署

进入合约目录：

```bash
cd /Users/jchen/Desktop/herstory_hackathon/WWW6.5-Hackathon/SheProves/contracts
cp .env.example .env
```

填写：

```bash
PRIVATE_KEY=0x...
AVALANCHE_FUJI_RPC=https://api.avax-test.network/ext/bc/C/rpc
TREASURY=0x...
BADGE_BASE_URI=ipfs://<your-badge-folder>/
```

部署：

```bash
source .env
forge script script/DeployHerLemma.s.sol:DeployHerLemma \
  --rpc-url "$AVALANCHE_FUJI_RPC" \
  --broadcast
```

如果这里不是正常编译报错，而是 Foundry 直接 panic，先回到 `contracts/README.md` 里的排障段处理本机 Foundry / `solc 0.8.24` 环境，再重跑。

如果你不想继续排 Foundry，也可以直接改走 Node 版：

```bash
cd /Users/jchen/Desktop/herstory_hackathon/WWW6.5-Hackathon/SheProves/contracts
npm install
npm run compile:node
npm run deploy:fuji
```

部署后记下这四个地址：

- `ExplanationManager`
- `ProveToken`
- `STEMIndex`
- `HerLemmaCredential`

地址位置：

```text
SheProves/contracts/broadcast/DeployHerLemma.s.sol/43113/run-latest.json
```

如果装了 `jq`，可以直接提取：

```bash
cat /Users/jchen/Desktop/herstory_hackathon/WWW6.5-Hackathon/SheProves/contracts/broadcast/DeployHerLemma.s.sol/43113/run-latest.json | jq '.transactions[] | {contractName, contractAddress}'
```

或者直接同步到前端本地环境：

```bash
cd /Users/jchen/Desktop/herstory_hackathon/WWW6.5-Hackathon/SheProves/contracts
node tools/sync-frontend-env.mjs
```

## 3. 前端环境变量

进入前端目录：

```bash
cd /Users/jchen/Desktop/herstory_hackathon/WWW6.5-Hackathon/SheProves/ui
cp .env.example .env.local
```

确认并补齐：

```bash
VITE_OPENROUTER_API_KEY=...
VITE_AVALANCHE_FUJI_RPC=https://api.avax-test.network/ext/bc/C/rpc
VITE_EXPLANATION_MANAGER_ADDRESS=0x...
VITE_PROVE_TOKEN_ADDRESS=0x...
VITE_STEM_INDEX_ADDRESS=0x...
VITE_CREDENTIAL_ADDRESS=0x...
```

如果上一步已经执行了 `node tools/sync-frontend-env.mjs`，这里通常只需要补 `VITE_OPENROUTER_API_KEY`。

## 4. 前端启动

```bash
cd /Users/jchen/Desktop/herstory_hackathon/WWW6.5-Hackathon/SheProves/ui
npm install
npm run dev
```

## 5. 最小功能验收

### A. 钱包连接

- 打开首页
- 点击右上角 `连接钱包`
- 确认自动切到 Avalanche Fuji

### B. 创建一条讲解

- 进入 `知识树`
- 点亮一个知识点
- 点击 `我也来讲讲`
- 生成 AI 草稿并编辑
- 点击 `提交上链`

验收点：

- 页面出现交易哈希
- Snowtrace 可打开交易
- 对应讲解出现在知识点讲解列表中

### C. 给讲解投票

- 用第二个钱包打开同一条讲解详情
- 点击 `我听懂了！`

验收点：

- 投票交易成功
- 票数增长
- 作者拿到 `$PROVE`
- 投票者也拿到 `$PROVE`

### D. 查看个人档案

- 进入 `我的档案`

验收点：

- 能看到当前地址
- `$PROVE` 余额正确
- 讲解数、被听懂次数、已赚金额可读

### E. 打赏与提现

- 在控制台或后续页面里对某条讲解调用 `tipExplanation`
- 返回作者账号
- 在 `我的档案` 页面点击 `提现`

验收点：

- `pendingWithdrawals` 先增加
- 提现交易成功后归零

## 6. 建议的 Demo 顺序

路演时建议按这个顺序演示：

1. 首页说明“女生为女生讲数学”
2. 进入知识树
3. 打开一个知识点，看讲解排行
4. 打开讲解详情，展示“我听懂了”
5. 切到创建页，演示 AI 草稿到链上提交
6. 切到个人页，展示 `$PROVE`、讲解数和提现

## 7. 如果现场来不及做的部分

优先保证这三件事是真的：

- `createExplanation`
- `voteUnderstood`
- `Profile` 能读到 `$PROVE` 和统计

这三条跑通，MVP 就成立。
