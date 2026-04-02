# 黑客松仓库同步指南

> **目的**：将本地开发目录的代码同步到黑客松 fork 仓库，提交 PR
> **原则**：所有开发、调试、部署在本地目录完成，黑客松仓库只做最终提交
> **时机**：功能测试通过后同步

## 目录

- [路径说明](#路径说明)
- [第一次设置（只需做一次）](#第一次设置只需做一次)
- [日常同步（每次提交前做）](#日常同步每次提交前做)
 
- [提交 PR](#提交-pr)
- [给 AI 用的 Prompt](#给-ai-用的-prompt)

---

## 路径说明

| 用途 | 路径 |
|------|------|
| 本地开发目录 | `d:/OneDrive/creating/2512-Vibe Coding/MyWorks/web3-plant-oh-card/SanctuaryProtocol` |
| 黑客松仓库 | `D:/BaiduSyncdisk/study/2602Hersolidity/WWW6.5-Hackathon` |
| 项目在黑客松仓库中的位置 | `SanctuaryProtocol/`（仓库根目录下，不在 projects/ 内） |
| fork 来源 | `https://github.com/0xherstory/WWW6.5-Hackathon` |
| 你的 fork | `https://github.com/Tenlossiby/WWW6.5-Hackathon` |
| 黑客松仓库页面 | `https://github.com/Tenlossiby/WWW6.5-Hackathon/tree/main/SanctuaryProtocol` |

---

## 第一次设置（只需做一次）

### 1. Clone 你的 fork

```bash
git clone https://github.com/Tenlossiby/WWW6.5-Hackathon.git "D:/BaiduSyncdisk/study/2602Hersolidity/WWW6.5-Hackathon"
cd "D:/BaiduSyncdisk/study/2602Hersolidity/WWW6.5-Hackathon"
```

### 2. 添加上游仓库（用于同步最新变化）

```bash
git remote add upstream https://github.com/0xherstory/WWW6.5-Hackathon.git
```

### 3. 执行第一次同步（见下方"日常同步"步骤）

---

## 日常同步（每次提交前做）

 
### 步骤 1：同步上游最新代码

```bash
cd "D:/BaiduSyncdisk/study/2602Hersolidity/WWW6.5-Hackathon"
git fetch upstream
git merge upstream/main
```

### 步骤 2：复制文件（排除不需要的文件）
 
**只复制 v2.2 活跃代码，排除旧版遗留文件：**
 
**Windows PowerShell（推荐）：**
```powershell
$source = "d:\OneDrive\creating\2512-Vibe Coding\MyWorks\web3-plant-oh-card\SanctuaryProtocol"
$dest = "D:\BaiduSyncdisk\study\2602Hersolidity\WWW6.5-Hackathon\SanctuaryProtocol"

# 创建目标目录
New-Item -ItemType Directory -Force -Path $dest

# ===== 要复制的目录（v2.2 活跃代码）=====
$includeDirs = @(
    "contracts\interfaces",          # v2.2 接口
    "contracts\plugins",             # 插件
    "src",                         # 前端
    "public",                       # 静态资源
    "messages"                      # i18n
)

# 复制 v2.2 合约文件（非整个 contracts 目录）
@("SanctuaryProtocolV2.sol") | ForEach-Object {
    Copy-Item -Path (Join-Path $source "contracts" $_) -Destination (Join-Path $dest "contracts" $_) -Force
}
@("interfaces", "plugins") | ForEach-Object {
    $subDir = $_
    $src = Join-Path $source "contracts\$subDir"
    $dst = Join-Path $dest "contracts\$subDir"
    if (Test-Path $src) {
        Copy-Item -Path $src -Destination $dst -Recurse -Force
    }
}

# 复制其他目录
$includeDirs | ForEach-Object {
    $src = Join-Path $source $_
    $dst = Join-Path $dest $_
    if (Test-Path $src) {
        Copy-Item -Path $src -Destination $dst -Recurse -Force
    }
}

# Documents 目录映射为 docs
$docsSrc = Join-Path $source "Documents"
$docsDst = Join-Path $dest "docs"
if (Test-Path $docsSrc) {
    Copy-Item -Path $docsSrc -Destination $docsDst -Recurse -Force
}

# 复制 v2.2 脚本（排除旧版脚本）
$legacyScripts = @("deploy.ts", "move-pages.js", "restore-pages.js")
Get-ChildItem -Path (Join-Path $source "scripts") -Filter "*.ts" | ForEach-Object {
    if ($legacyScripts -notcontains $_.Name) {
        Copy-Item -Path $_.FullName -Destination (Join-Path $dest "scripts" $_.Name) -Force
    }
}

# 复制根目录配置文件
@("package.json", "hardhat.config.ts", "tsconfig.json", "next.config.js",
  "tailwind.config.ts", "postcss.config.js", ".gitignore", ".env.example",
  ".env.local.example", "vitest.config.ts", "README.md") | ForEach-Object {
    $f = Join-Path $source $_
    if (Test-Path $f) {
        Copy-Item -Path $f -Destination (Join-Path $dest $_) -Force
    }
}

# ===== 删除旧版遗留文件（不应出现在黑客松仓库）=====
$legacyFiles = @(
    "contracts\SanctuaryProtocol.sol",     # 旧版 v2.1 主合约
    "contracts\PlantOHCard.sol",         # 旧版 v1 NFT 合约
    "contracts\IVerifier.sol",         # 旧版 ZK-Email 概念
    "contracts\ISanctuaryProtocol.sol",   # 旧版接口（根目录）
    "scripts\deploy.ts",             # 旧版部署脚本
  "scripts\move-pages.js",         # 临时修复脚本
  "scripts\restore-pages.js",      # 临时修复脚本
  "test\PlantOHCard.test.js",      # 旧版测试
)
$legacyFiles | ForEach-Object {
    $p = Join-Path $dest $_
    if (Test-Path $p) { Remove-Item -Path $p -Force }
}

# 删除临时修复脚本（根目录）
@("fix-chain.ps1", "fix-sanctuary.ps1") | ForEach-Object {
    $p = Join-Path $dest $_
    if (Test-Path $p) { Remove-Item -Path $p -Force }
}

# 删除 node_modules 等自动生成目录
@("node_modules", ".next", "artifacts", "cache", "typechain-types", "coverage", ".claude") | ForEach-Object {
    $p = Join-Path $dest $_
    if (Test-Path $p) { Remove-Item -Path $p -Recurse -Force }
}

# 删除敏感文件
@(".env.local", ".env") | ForEach-Object {
    $p = Join-Path $dest $_
    if (Test-Path $p) { Remove-Item -Path $p -Force }
}

Write-Host "Sync complete!"
```

**Git Bash / WSL（备选）：**
```bash
SOURCE="d:/OneDrive/creating/2512-Vibe Coding/MyWorks/web3-plant-oh-card/SanctuaryProtocol"
DEST="D:/BaiduSyncdisk/study/2602Hersolidity/WWW6.5-Hackathon/SanctuaryProtocol"

mkdir -p "$DEST"

rsync -av --delete \
  --exclude='node_modules' \
  --exclude='.next' \
  --exclude='.git' \
  --exclude='.claude' \
  --exclude='artifacts' \
  --exclude='cache' \
  --exclude='typechain-types' \
  --exclude='coverage' \
  --exclude='.env.local' \
  --exclude='.env' \
  --exclude='contracts/SanctuaryProtocol.sol' \
  --exclude='contracts/PlantOHCard.sol' \
  --exclude='contracts/IVerifier.sol' \
  --exclude='contracts/ISanctuaryProtocol.sol' \
  --exclude='scripts/deploy.ts' \
  --exclude='scripts/move-pages.js' \
  --exclude='scripts/restore-pages.js' \
  --exclude='test/PlantOHCard.test.js' \
  --exclude='fix-chain.ps1' \
  --exclude='fix-sanctuary.ps1' \
  "$SOURCE/" "$DEST/"

# 把 Documents 映射为 docs
rm -rf "$DEST/docs"
cp -r "$SOURCE/Documents" "$DEST/docs"
```

### 步骤 3：提交
 
```bash
cd "D:/BaiduSyncdisk/study/2602Hersolidity/WWW6.5-Hackathon"
git add SanctuaryProtocol/
git status   # 检查要提交的文件是否正确
git commit -m "Update SanctuaryProtocol - <简短描述变更内容>"
```

### 步骤 4：推送
```bash
git push
```

---

## 提交 PR

1. 打开 `https://github.com/Tenlossiby/WWW6.5-Hackathon`
2. 点击 **"Compare & pull request"**
3. 确认：
   - **base**: `0xherstory/WWW6.5-Hackathon` 的 `main`
   - **compare**: `Tenlossiby/WWW6.5-Hackathon` 的 `main`
4. 填写标题和描述
5. 提交 PR

---

## 给 AI 用的 Prompt

把下面的内容复制给新的 AI 会话，它就知道怎么做：

---

### Prompt 1: 第一次设置
```
我需要把我的项目同步到一个黑客松 fork 仓库，请帮我执行以下操作：

1. Clone 我的 fork：
   git clone https://github.com/Tenlossiby/WWW6.5-Hackathon.git "D:/BaiduSyncdisk/study/2602Hersolidity/WWW6.5-Hackathon"

2. 进入目录，添加上游：
   cd "D:/BaiduSyncdisk/study/2602Hersolidity/WWW6.5-Hackathon"
   git remote add upstream https://github.com/0xherstory/WWW6.5-Hackathon.git

3. 然后执行"同步操作"（见 Prompt 2）

完成后告诉我状态。
```

---

### Prompt 2: 日常同步
```
帮我执行项目同步，把本地开发代码复制到黑客松仓库。

源目录：d:\OneDrive\creating\2512-Vibe Coding\MyWorks\web3-plant-oh-card\SanctuaryProtocol
目标目录：D:\BaiduSyncdisk\study\2602Hersolidity\WWW6.5-Hackathon\SanctuaryProtocol

步骤：
1. 先在黑客松仓库拉取上游最新代码：
   cd "D:/BaiduSyncdisk/study/2602Hersolidity/WWW6.5-Hackathon" && git fetch upstream && git merge upstream/main

2. 复制文件到 SanctuaryProtocol/，注意：
   - 只复制 v2.2 活跃代码，排除旧版遗留文件
   - 必须排除：node_modules, .next, .git, .claude, artifacts, cache, typechain-types, coverage
   - 必须排除：.env.local, .env（包含私钥和敏感信息，绝对不能上传）
   - 必须排除旧版文件：contracts/SanctuaryProtocol.sol, contracts/PlantOHCard.sol, contracts/IVerifier.sol, contracts/ISanctuaryProtocol.sol, scripts/deploy.ts, test/PlantOHCard.test.js, fix-chain.ps1, fix-sanctuary.ps1

3. 特殊映射：源目录的 Documents/ → 目标的 docs/

4. 需要复制的目录：contracts/interfaces/, contracts/plugins/, src/, public/, messages/
5. 需要复制的合约文件：contracts/SanctuaryProtocolV2.sol
6. 需要复制的脚本：scripts/ 目录下所有 .ts 文件（排除 deploy.ts）
7. 需要复制的配置文件：package.json, hardhat.config.ts, tsconfig.json, next.config.js, tailwind.config.ts, postcss.config.js, .gitignore, .env.example, .env.local.example, vitest.config.ts, README.md

8. 复制完成后：git add SanctuaryProtocol/
9. 运行 git status 让我检查
10. 不要自动 commit，等我确认后再提交

注意事项：
- 只修改 SanctuaryProtocol/ 目录下的文件
- 不要修改黑客松仓库的其他任何文件
- 如果不确定某个文件是否应该复制，先问我
```

---

### Prompt 3: 提交并推送
```
帮我在黑客松仓库提交并推送代码：

cd "D:/BaiduSyncdisk/study/2602Hersolidity/WWW6.5-Hackathon"

提交信息格式：
git commit -m "Update SanctuaryProtocol - <一句话描述这次更新了什么>"

然后推送：
git push

注意：
- 确保当前在 main 分支上
- 确保只提交了 SanctuaryProtocol/ 下的文件
- 推送前让我确认 commit 信息
```

---

### Prompt 4: 创建 PR
```
帮我用 gh CLI 创建一个 PR：

仓库：Tenlossiby/WWW6.5-Hackathon
分支：main → main（fork main 到 upstream main）
上游：0xherstory/WWW6.5-Hackathon

PR 标题：SanctuaryProtocol - Web3 植物系疗愈 OH 卡系统

PR 正文应包含：
- 项目简介
- 技术栈（Next.js 14, Solidity, Hardhat, UUPS, 多签治理）
- 核心功能（插件化架构、资金池、OH卡疗愈）
- 如何运行（npm install, npm run dev 等）
```

---

## 排除文件清单

以下文件/目录**绝对不能**同步到公开仓库：

### 安全相关（含私钥/密钥）

| 文件 | 原因 |
|------|------|
| `.env.local` | 包含私钥、API key |
| `.env` | 同上 |
| `.claude/` | Claude Code 本地配置 |

### 开发/Hardhat 产物（可重新生成）

| 文件 | 原因 |
|------|------|
| `node_modules/` | 太大，可通过 npm install 恢复 |
| `.next/` | 构建缓存，可重新生成 |
| `artifacts/` | Hardhat 编译产物，可重新编译 |
| `cache/` | Hardhat 缓存 |
| `typechain-types/` | 自动生成的类型 |
| `coverage/` | 测试覆盖率报告 |

### 旧版 v2.1/v1 遗留文件（已弃用，不需要）

| 文件 | 原因 |
|------|------|
| `contracts/SanctuaryProtocol.sol` | 旧版 v2.1 主合约（不可升级，被 V2 取代）|
| `contracts/PlantOHCard.sol` | 旧版 v1 NFT 合约（被插件替代）|
| `contracts/IVerifier.sol` | 旧版 ZK-Email 概念（未使用）|
| `contracts/ISanctuaryProtocol.sol` | 旧版接口（根目录，与 interfaces/ 同名不同）|
| `scripts/deploy.ts` | 旧版 v1 部署脚本（用 deploy-v2.ts）|
| `scripts/move-pages.js` | 临时修复脚本 |
| `scripts/restore-pages.js` | 临时修复脚本 |
| `fix-chain.ps1` | 临时修复脚本 |
| `fix-sanctuary.ps1` | 临时修复脚本 |
| `test/PlantOHCard.test.js` | 旧版测试（针对旧 NFT 合约）|

### v2.2 活跃代码（只同步这些）

| 文件 | 说明 |
|------|------|
| `contracts/SanctuaryProtocolV2.sol` | 主协议（UUPS 可升级） |
| `contracts/interfaces/ISanctuaryPlugin.sol` | 插件标准接口 |
| `contracts/interfaces/ISanctuaryProtocol.sol` | v2.2 协议接口 |
| `contracts/plugins/PlantOHCardPlugin.sol` | 唯一范例插件 |
| `scripts/*.ts`（排除 deploy.ts） | 全部 v2.2 脚本 |
| `src/**` | 全部前端代码 |
| `public/**` | 静态资源 |
| `messages/**` | i18n 国际化 |
| `Documents/**` | 映射为 `docs/` |
| `README.md` | 中英双语项目说明 |
| `vitest.config.ts` | 前端测试配置 |
| `.env.example` | 环境变量模板（仅占位符） |
| `.env.local.example` | 环境变量模板（仅占位符） |

---

## 时间线

| 日期 | 任务 |
|------|------|
| 4月3日 24:00 前 | 初始化项目目录（创建文件夹 + README）|
| 4月4日 24:00 前 | 最终 PR 提交 |
