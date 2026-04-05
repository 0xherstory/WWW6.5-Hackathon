# HerLemma Contracts

SheProves/HerLemma 的链上 MVP 由 4 个合约组成：

- `ExplanationManager.sol`
  - 讲解提交
  - “我听懂了”投票
  - 打赏自动分账
  - 悬赏创建 / 回答 / 到期结算
- `ProveToken.sol`
  - 不可转账的 `$PROVE` 声誉代币
- `STEMIndex.sol`
  - 链上聚合统计
- `HerLemmaCredential.sol`
  - Soulbound 成就凭证

## 目录结构

```text
contracts/
├── foundry.toml
├── .env.example
├── src/
│   ├── Owned.sol
│   ├── ProveToken.sol
│   ├── STEMIndex.sol
│   ├── HerLemmaCredential.sol
│   └── ExplanationManager.sol
└── script/
    └── DeployHerLemma.s.sol
```

## 先决条件

需要本机安装 Foundry：

```bash
curl -L https://foundry.paradigm.xyz | bash
foundryup
```

确认版本：

```bash
forge --version
cast --version
```

## 环境变量

复制一份环境变量模板：

```bash
cd SheProves/contracts
cp .env.example .env
```

填写以下变量：

```bash
PRIVATE_KEY=0x你的部署私钥
AVALANCHE_FUJI_RPC=https://api.avax-test.network/ext/bc/C/rpc
TREASURY=0x你的平台手续费地址
BADGE_BASE_URI=ipfs://你的成就元数据目录/
```

说明：

- `PRIVATE_KEY`
  - 用于在 Fuji 测试网部署合约的私钥
- `TREASURY`
  - 平台费归集地址
- `BADGE_BASE_URI`
  - SBT 元数据目录前缀
  - 脚本会自动拼接：
    - `first-voice.json`
    - `first-earning.json`
    - `math-translator.json`
    - `trusted-reviewer.json`
    - `viral-explainer.json`
    - `brand-pick.json`

## 本地编译

```bash
cd SheProves/contracts
source .env
forge build
```

### 如果 `forge build` 没有报 Solidity 错，而是直接 panic

这类情况通常不是合约代码问题，而是本机 Foundry / `solc` 环境初始化失败。先做这几件事：

1. 确认 Foundry 本身可用
```bash
forge --version
```

2. 确认本机可正常安装或读取 `solc 0.8.24`
```bash
foundryup
```

3. 在干净 shell 里重试
```bash
cd SheProves/contracts
forge build
```

如果仍然是环境级崩溃，而不是 Solidity 报错，优先换一台正常安装了 Foundry 的机器执行部署。

## Node 备用链路：不依赖 Foundry 编译

如果你当前机器上的 Foundry 一直 panic，可以直接走 Node 版编译和部署：

```bash
cd SheProves/contracts
npm install
npm run compile:node
```

编译产物会写到：

```text
SheProves/contracts/artifacts/
```

## 部署到 Avalanche Fuji

```bash
cd SheProves/contracts
source .env
forge script script/DeployHerLemma.s.sol:DeployHerLemma \
  --rpc-url "$AVALANCHE_FUJI_RPC" \
  --broadcast
```

如果你希望部署后自动验签并等待确认：

```bash
forge script script/DeployHerLemma.s.sol:DeployHerLemma \
  --rpc-url "$AVALANCHE_FUJI_RPC" \
  --broadcast \
  --slow
```

### 如果改走 Node 版部署

```bash
cd SheProves/contracts
npm run deploy:fuji
```

它会直接：

- 读取 `.env`
- 用 `solc` 编译产物部署 4 个合约
- 完成 `setMinter` / `setManager`
- 写入 `deployments/fuji.json`

部署完成后：

- 合约地址会写入 `broadcast/DeployHerLemma.s.sol/43113/run-latest.json`
- 你可以从该文件里取出：
  - `ProveToken`
  - `HerLemmaCredential`
  - `STEMIndex`
  - `ExplanationManager`

如果你装了 `jq`，可以直接读取最近一次部署结果：

```bash
cat broadcast/DeployHerLemma.s.sol/43113/run-latest.json | jq '.transactions[] | {contractName, contractAddress}'
```

也可以直接把最新部署地址同步到前端本地环境：

```bash
node tools/sync-frontend-env.mjs
```

默认会把地址写到：

```text
SheProves/ui/.env.local
```

脚本会优先读取 Foundry 的 `broadcast/.../run-latest.json`；如果找不到，则自动读取 Node 版部署结果 `deployments/fuji.json`。

如果你已经在 `ui/.env.local` 里填过 `VITE_OPENROUTER_API_KEY`，脚本会保留它。

## 最小验收流程

部署完成后，建议按下面顺序手动验证：

1. 创建一个讲解
2. 用第二个钱包对该讲解调用 `voteUnderstood`
3. 查看：
  - 作者拿到 `$PROVE`
  - 投票者拿到 `$PROVE`
  - `STEMIndex` 统计增长
4. 对该讲解调用 `tipExplanation`
5. 调用 `withdraw` 提现作者收益
6. 创建一个 bounty，提交两个 response，投票后调用 `settleBounty`

## 前端对接建议

前端最常用的合约读写入口是 `ExplanationManager`：

- `createExplanation`
- `voteUnderstood`
- `tipExplanation`
- `createBounty`
- `submitBountyResponse`
- `voteBountyResponse`
- `settleBounty`
- `withdraw`
- `getConceptExplanationIds`
- `getAuthorExplanationIds`
- `getBountyResponseIds`

页面所需的聚合数据可从：

- `ExplanationManager`
- `STEMIndex`
- `ProveToken`
- `HerLemmaCredential`

组合读取。
