# PurrChain 项目文档

> 部署在 Avalanche C-Chain（Fuji 测试网，chainId: 43113）上的去中心化猫咪领养平台。
> 用户通过捐款支持真实收容所的猫咪，获得动态成长 NFT，并在放置类游戏中养育虚拟猫咪。
> 所有资金流向链上透明可查，捐款直达机构钱包，平台不经手。

---

## 目录

1. [项目结构](#1-项目结构)
2. [技术栈](#2-技术栈)
3. [NFT 类型说明](#3-nft-类型说明)
4. [完整运行逻辑](#4-完整运行逻辑)
5. [合约说明](#5-合约说明)
6. [环境准备](#6-环境准备)
7. [IPFS 资源管理](#7-ipfs-资源管理)
8. [编译](#8-编译)
9. [本地测试](#9-本地测试)
10. [Fuji 测试网部署](#10-fuji-测试网部署)
11. [演示 Demo 操作指南](#11-演示-demo-操作指南)
12. [已知技术债务](#12-已知技术债务)

---

## 1. 项目结构

```
purrchain/
├── contracts/
│   ├── CatRegistry.sol       # 机构注册 + 猫咪档案
│   ├── CatNFT.sol            # 所有 NFT 类型（ERC-721）
│   ├── PurrToken.sol         # $PURR 代币（ERC-20）
│   ├── DonationVault.sol     # 捐款 + 云领养触发
│   ├── AdoptionVault.sol     # 真实领养保证金
│   ├── EquipmentNFT.sol      # 游戏装备 NFT
│   └── GameContract.sol      # 放置类游戏逻辑
├── scripts/
│   ├── deploy.js             # 一键部署 + 权限配置 + 模板初始化
│   ├── setShares.js          # 单独配置 AVAX 收益分配比例
│   └── test_flow.js          # 端到端主流程测试
├── nft_assets/               # NFT 资源文件（本地备份）
│   ├── images/               # 处理后的 1000x1000 PNG 图片（上传到 Pinata 图片文件夹）
│   │   ├── season1_family.png
│   │   ├── cat_stage1_kitten.png
│   │   ├── cat_stage2_junior.png
│   │   ├── cat_stage2_adult.png
│   │   ├── genesis.png
│   │   ├── equip_weapon.png
│   │   ├── equip_bag.png
│   │   ├── equip_boots.png
│   │   ├── col_playing.png
│   │   ├── col_companion.png
│   │   └── col_sleeping.png
│   └── metadata/             # 11 个 metadata JSON 文件（上传到 Pinata metadata 文件夹）
│       ├── season1_family.json
│       ├── cat_stage1.json
│       ├── cat_stage2_junior.json
│       ├── cat_stage3.json
│       ├── genesis.json
│       ├── equip_weapon.json
│       ├── equip_bag.json
│       ├── equip_boots.json
│       ├── col_playing.json
│       ├── col_companion.json
│       └── col_sleeping.json
├── convert_nft_images.py     # 图片格式统一处理脚本（转为 1000x1000 真 PNG）
├── hardhat.config.js
├── package.json
├── .env                      # 从 .env.example 复制后填入私钥（禁止提交 Git）
├── .env.example
└── .gitignore
```

---

## 2. 技术栈

| 层级 | 技术 |
|------|------|
| 合约 | Solidity ^0.8.20 + Hardhat + OpenZeppelin v5 |
| 链 | Avalanche C-Chain（Fuji 测试网，chainId: 43113） |
| 存储 | IPFS via Pinata（Public） |
| 代币 | ERC-20（$PURR） |
| NFT | ERC-721 |
| 测试 | Hardhat + ethers.js v6 |

---

## 3. NFT 类型说明

合约内 `NFTType` 枚举共 6 种，`nftType()` 函数返回对应数字：

| 数字 | 类型 | 获取方式 | 用途 |
|------|------|---------|------|
| 0 | Starter | `claimStarter()`，旧版，已废弃保留兼容 | 可领 20 PURR / 销毁换 30 PURR |
| 1 | CloudAdopted | 向某只猫捐款达阈值，DonationVault 触发 | 云领养成长 NFT（stage 1~3），每周领抽卡券 |
| 2 | Genesis | 真实领养回访通过，AdoptionVault 触发 | 真实领养专属（stage 4），每周领抽卡券 |
| 3 | FamilyPortrait | `claimFamilyPortrait()`，每地址一次 | 新版入场凭证，按季度换图，可领 20 PURR / 销毁换 30 PURR |
| 4 | StarterCat | `GameContract.claimStarterCat()`，每地址一次 | 免费初始猫，绑定一只真实猫，可成长，每周领抽卡券 |
| 5 | Collection | 出猎结算时按概率掉落 | 收藏向 NFT（玩耍/同伴/睡觉系列），无游戏功能 |

### 猫咪成长阶段映射

成长阶段对应 `CatRegistry` 里 `stageURIs[4]` 数组：

| stage 值 | 含义 | 取哪个 URI | 谁能拥有 |
|---------|------|-----------|---------|
| 1 | 幼猫 | `stageURIs[0]` | StarterCat / CloudAdopted |
| 2 | 少年猫 | `stageURIs[1]` | StarterCat / CloudAdopted |
| 3 | 成年猫 | `stageURIs[2]` | StarterCat / CloudAdopted |
| 4 | Genesis | `stageURIs[3]` | Genesis 专属 |

URI 取法公式：`stageURIs[stage - 1]`

---

## 4. 完整运行逻辑

### 4.1 链下准备：机构入驻

```
机构调用 CatRegistry.registerShelter(name, location)
→ 平台 owner 调用 approveShelter(shelterAddress)
→ 机构调用 addCat(name, age, gender, desc, stageURIs[4])
```

`stageURIs` 四个槽：`[幼猫URI, 少年猫URI, 成年猫URI, Genesis URI]`
如果救助时猫已是成年，前几个槽填空字符串 `""` 即可。

Demo 登记雀猫时使用以下 stageURIs：
```
[
  "ipfs://bafybeiewjp2e4gmewiotq6pi2snbfta2gltblnaymdhbzkhv2hcq3psij4/cat_stage1.json",
  "ipfs://bafybeiewjp2e4gmewiotq6pi2snbfta2gltblnaymdhbzkhv2hcq3psij4/cat_stage2_junior.json",
  "ipfs://bafybeiewjp2e4gmewiotq6pi2snbfta2gltblnaymdhbzkhv2hcq3psij4/cat_stage3.json",
  "ipfs://bafybeiewjp2e4gmewiotq6pi2snbfta2gltblnaymdhbzkhv2hcq3psij4/genesis.json",
]
```

### 4.2 新用户入场（三步）

```
① CatNFT.claimFamilyPortrait()
   → 免费获得当季全家福 NFT（type=3），链上记录 season 编号
   → 每季度 owner 调用 advanceSeason(uri) 更新，新用户拿新季图

② PurrToken.claimWelcomeTokens(portraitTokenId)
   → 凭全家福 NFT 验证身份，领取 20 PURR
   → 每地址只能领一次（type=0 或 type=3 均可验证）

③ GameContract.claimStarterCat(realCatId)
   → 从 CatRegistry 选一只真实猫，免费领 StarterCat NFT（type=4）
   → 合约自动判断初始阶段（有幼猫URI从幼猫开始，否则从少年/成年）
   → 每地址只能领一次
```

### 4.3 免费初始猫的成长

机构调用 `CatRegistry.updateCatStageURI()` 更新对应阶段图片后，前端监听链上事件推送通知。用户调用：

```
CatNFT.claimGrowthNFT(realCatId)
→ 检查用户持有该猫的 StarterCat NFT
→ 检查 CatRegistry 里下一阶段 URI 已填入
→ mint 下一阶段 NFT，免费
```

### 4.4 云领养（第二只及以上的猫）

```
DonationVault.donate(realCatId) + AVAX
→ AVAX 直接转给机构钱包（平台不经手）
→ 记录用户累计捐款额（donationStage 映射，独立于 StarterCat 进度）
→ 每累计达到阈值（默认 0.1 AVAX）自动 mint CloudAdopted NFT（type=1）
→ 最多 stage 3（成年猫），Genesis 不通过捐款获得
→ 首次触发时猫咪状态从 Available 更新为 CloudAdopted
```

> **重要**：DonationVault 使用独立的 `donationStage` 映射记录捐款解锁阶段，
> 不依赖 `CatNFT.userCatStage`，避免 StarterCat 进度（stage=1）干扰捐款触发逻辑。

### 4.5 游戏日常循环

**体力系统**

- 共享体力池，上限 5 点，每 8 小时自然恢复 1 点
- 存储：`{stamina, lastUpdateTime}`，读取时动态计算，零头时间不丢失
- 多只猫同时出猎，体力从同一个池子扣（例：短途+长途 = 1+3 = 4 点）

**商店（花 $PURR）**

| 道具 | 价格 | 效果 |
|------|------|------|
| 猫粮 | 5 PURR | 携带出猎，带回 NFT 概率：普通80% / 稀有15% / 珍稀5% |
| 罐罐 | 15 PURR | 携带出猎，带回 NFT 概率：普通50% / 稀有35% / 珍稀15% |
| 体力 | 8 PURR/点 | 直接恢复，不能超上限 5 |
| 加速符 | 10 PURR | 本次出猎时长减半，可与靴子装备叠加 |

**出猎（startHunt）**

- 指定猫（StarterCat / CloudAdopted / Genesis 均可）
- 选时长：短途 2h（1点体力）/ 中途 4h（2点）/ 长途 8h（3点）
- 选携带道具（None / Food / Can），**出发时立即扣除**
- 是否用加速符：时长先减半，再叠加靴子 speedBonus，最低不低于基础时长 10%
- 多只猫独立出猎，状态互不影响，体力共享

**结算（settleHunt）**

- 随机数：`prevrandao + nonce`（不依赖 blockhash，Avalanche 出块2秒，最短出猎2h≈1800块，远超256块窗口）
- 产出：
  - 材料碎片（基础量 × 背包 carryBonus 加成）
  - Collection NFT（带道具才有，按道具类型和武器 rarityBonus 决定稀有度层级）

**Collection NFT 稀有度分层规则**

- `seriesId % 3`：0=普通，1=稀有，2=珍稀
- 当前注册的三个系列：玩耍(id=0,普通) / 同伴(id=1,稀有) / 睡觉(id=2,珍稀)

### 4.6 抽卡与装备

**获取抽卡券途径**

1. 持有 CloudAdopted(1) / Genesis(2) / StarterCat(4) NFT，每只猫每 7 天领 1 张，调用 `claimWeeklyTicket(catTokenId)`
2. 累计消费每满 50 PURR 自动奖励 1 张（`_spendPurr` 内部计算）
3. 10 个材料碎片合成 1 张，调用 `mergeFragments()`

**抽卡（gacha）**

- 消耗 1 张券
- 稀有度分布：传说 3% / 稀有 12% / 精良 25% / 普通 60%
- 12 个装备模板，每个稀有度 3 个（武器/背包/靴子各一），从对应稀有度池随机取

**装备槽位（3 槽）**

| 槽位 | slot 值 | 功能 | 对应 bonus |
|------|---------|------|-----------|
| 武器 | 0 | 提升出猎 NFT 稀有度概率 | rarityBonus（万分比） |
| 背包 | 1 | 提升材料碎片产出量 | carryBonus（万分比） |
| 靴子 | 2 | 缩短出猎时长 | speedBonus（万分比） |

- 每只猫独立穿装备，穿新装备同槽旧装备自动卸下
- 猫出猎期间不能换装备（catIdle 校验）

### 4.7 真实领养流程

```
用户 applyAdoption(catId)         → 猫状态: PendingAdoption
机构 approveApplication(catId)    → 等用户缴款
用户 payDeposit(catId) + 0.1 AVAX → 保证金锁入合约，锁定 1 年

（一年后，owner 回访）
confirmVisit(catId, true)         → 退还保证金 + mint Genesis NFT，猫状态: Adopted
confirmVisit(catId, false)        → 保证金没收转给机构，猫状态: Available

（用户中途取消）
用户 cancelAdoption(catId)        → 状态: PendingReturn
机构 confirmReturn(catId, true)   → 健康归还，全额退款，猫状态: Available
机构 confirmReturn(catId, false)  → 不健康，保证金转机构，猫状态: Available
机构超时未确认(30天)               → 用户可 forceWithdraw(catId) 强制取回
```

### 4.8 $PURR 资金流向

| 来源 | 去向 |
|------|------|
| `buyTokens()` 收到的 AVAX | 留在 PurrToken 合约，由 `distribute()` 按比例分配给各收款方 |
| `donate()` 收到的 AVAX | 直接转给机构钱包，平台完全不经手 |
| `payDeposit()` 收到的 AVAX | 锁在 AdoptionVault，回访后退还或转给机构 |
| 游戏内花费的 PURR | `gameSpend` 直接销毁（burn） |
| 全家福 / Starter 销毁换 PURR | `_mint` 增发 |

---

## 5. 合约说明

### CatRegistry.sol

机构注册与猫咪档案，无依赖，最先部署。

**状态流转（只有授权合约可触发）：**
```
Available       → CloudAdopted    （DonationVault 首次云领养）
Available       → PendingAdoption （AdoptionVault 提交申请）
CloudAdopted    → PendingAdoption （AdoptionVault 提交申请）
PendingAdoption → Adopted         （AdoptionVault 回访通过）
PendingAdoption → Available       （申请取消/拒绝时回退）
```

### CatNFT.sol

所有 NFT 类型的统一合约（ERC-721）。

**构造函数参数：**
```
CatNFT(catRegistryAddr, starterURI, genesisURI, season1URI)
```

- `season1URI`：第 1 季全家福的 metadata URI（合约里 `currentSeason` 从 1 开始）
- `getCollectionSeries` 返回三个独立字段（非结构体），与 GameContract 内接口声明一致

### PurrToken.sol

ERC-20，符号 $PURR，18 位小数。

**用户最多可获得 50 PURR 启动资金：**
```
① claimFamilyPortrait()（CatNFT）
② claimWelcomeTokens(portraitId) → +20 PURR
③ 可选：burnFamilyPortraitForTokens() → +30 PURR（销毁后不可恢复）
```

**AVAX 收益分配：**
- `buyTokens()` 收到的 AVAX 留存合约
- owner 调用 `setShares(recipients, shares)` 设置分配比例（万分比，总和须等于 10000）
- `distribute()` 触发按比例分配，最后一个收款方拿走所有剩余（消除整除截断的 wei 残留）

### DonationVault.sol

**关键设计：使用独立的 `donationStage` 映射**

不依赖 `CatNFT.userCatStage`，避免免费初始猫（StarterCat）进度（stage=1）导致云领养首次捐款无法触发的 bug。

`ICatRegistry` 接口枚举必须包含四个值（`Available / CloudAdopted / PendingAdoption / Adopted`），顺序与主合约一致。

### EquipmentNFT.sol

装备 NFT，只有 `gameContract` 可调用核心函数。

**重要细节：**
- `_catEquipment` 使用偏移存储（值 = tokenId + 1），避免 tokenId=0 与"空槽"语义冲突
- `equippedOnCat` 用 `type(uint256).max` 表示未装备
- `equip()` 会校验装备存在性（防止穿戴已 burn 的装备）

### GameContract.sol

**体力系统细节：**
- 新用户默认满体力（5点），`lastUpdateTime == 0` 时 `getStamina` 返回 MAX_STAMINA
- `_consumeStamina` 写入 `lastUpdateTime` 时推进到最后一个完整恢复周期，零头时间隐式保留，不丢失

**随机数：** `block.prevrandao + nonce`，不依赖 blockhash（Avalanche 出块2秒，最短出猎2h≈1800块，远超256块窗口）

---

## 6. 环境准备

### 前提条件

- Node.js >= 18
- npm >= 9
- 钱包（MetaMask），已添加 Fuji 测试网（chainId: 43113）
- Fuji 测试网 AVAX：从 [https://faucet.avax.network](https://faucet.avax.network) 领取

### 安装步骤

```bash
# 1. 克隆项目
git clone <repo_url>
cd purrchain

# 2. 安装依赖
npm install

# 3. 配置环境变量
cp .env.example .env
# 编辑 .env，填入：
# PRIVATE_KEY=你的钱包私钥（不含0x前缀也可以）
# SNOWTRACE_API_KEY=可选，用于合约验证
```

> ⚠️ `.env` 已在 `.gitignore` 中，不会被提交。私钥绝对不要泄露给任何人。

### Fuji 测试网网络配置

`hardhat.config.js` 已配置好，关键参数：
- 网络名：`fuji`
- chainId：43113
- RPC：`https://api.avax-test.network/ext/bc/C/rpc`

在 MetaMask 添加 Fuji 测试网：
- 网络名称：Avalanche Fuji C-Chain
- RPC URL：`https://api.avax-test.network/ext/bc/C/rpc`
- 链 ID：43113
- 代币符号：AVAX
- 区块浏览器：`https://testnet.snowtrace.io`

---

## 7. IPFS 资源管理

### 当前已上传的 CID（无需重新上传）

| 内容 | CID |
|------|-----|
| 图片文件夹 | `bafybeicqf2rahmot2yjexnmcmj6q5cui2z23bevwlisugejeg7o567o6uq` |
| Metadata 文件夹 | `bafybeiewjp2e4gmewiotq6pi2snbfta2gltblnaymdhbzkhv2hcq3psij4` |

访问格式：`ipfs://<CID>/<文件名>`，例如：
```
ipfs://bafybeicqf2rahmot2yjexnmcmj6q5cui2z23bevwlisugejeg7o567o6uq/season1_family.png
ipfs://bafybeiewjp2e4gmewiotq6pi2snbfta2gltblnaymdhbzkhv2hcq3psij4/season1_family.json
```

### 图片与 Metadata 对应关系

| 图片文件名 | Metadata 文件名 | 用途 |
|-----------|----------------|------|
| `season1_family.png` | `season1_family.json` | 全家福 NFT Season 1 |
| `cat_stage1_kitten.png` | `cat_stage1.json` | 雀猫幼年（stage 1） |
| `cat_stage2_junior.png` | `cat_stage2_junior.json` | 雀猫少年（stage 2） |
| `cat_stage2_adult.png` | `cat_stage3.json` | 雀猫成年（stage 3） |
| `genesis.png` | `genesis.json` | Genesis 真实领养 NFT |
| `equip_weapon.png` | `equip_weapon.json` | 武器装备（4个模板共用此图） |
| `equip_bag.png` | `equip_bag.json` | 背包装备（4个模板共用此图） |
| `equip_boots.png` | `equip_boots.json` | 靴子装备（4个模板共用此图） |
| `col_playing.png` | `col_playing.json` | 小猫玩耍系列（id=0,普通） |
| `col_companion.png` | `col_companion.json` | 小猫同伴系列（id=1,稀有） |
| `col_sleeping.png` | `col_sleeping.json` | 小猫睡觉系列（id=2,珍稀） |

### 如需更换图片重新上传

1. 处理图片为 1000×1000 PNG（用 `convert_nft_images.py`）：
   ```bash
   pip install Pillow
   # 编辑脚本里的 FILE_MAP 后执行
   python convert_nft_images.py
   # 输出到 nft_output/ 文件夹
   ```

2. 将图片文件夹整体上传到 [Pinata](https://pinata.cloud)（选 Public），得到图片 CID

3. 修改 `nft_assets/metadata/` 下各 JSON 文件里的 `"image"` 字段，替换为新图片 CID

4. 将 metadata 文件夹整体上传到 Pinata（Public），得到 metadata CID

5. 更新 `scripts/deploy.js` 顶部的 `IMG` 和 `META` 变量

---

## 8. 编译

```bash
npx hardhat compile
```

正常输出：`Compiled N Solidity files successfully (evm target: shanghai)`

如果出现警告（Warning），不影响部署，但建议修复。出现错误（Error）则必须修复后再部署。

---

## 9. 本地测试

本地测试速度快、免费，建议每次修改合约后先本地跑通再上链。

### 步骤

**终端 1（保持运行，不要关闭）：**

```bash
npx hardhat node
```

启动后看到 20 个测试账户和私钥，以及 `Started HTTP and WebSocket JSON-RPC server at http://127.0.0.1:8545/`，此终端必须一直开着。

**终端 2（每次重新部署+测试）：**

```bash
# 部署到本地节点
npx hardhat run scripts/deploy.js --network localhost

# 复制输出的七个合约地址，填入 test_flow.js 的 localhost 地址区
# 然后运行测试
npx hardhat run scripts/test_flow.js --network localhost
```

### 重要说明

每次关闭终端 1（hardhat node）再重开，链从零开始，**必须重新部署**，地址也会重置。

### test_flow.js 地址配置

文件内有两套地址配置：

```js
const isLocalhost = process.env.HARDHAT_NETWORK === "localhost";

const ADDRESSES = isLocalhost ? {
  // 每次本地部署后，从 deploy.js 输出复制这七个地址到这里
  catRegistry:   "0x5FbDB2315678afecb367f032d93F642f64180aa3",
  catNFT:        "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",
  purrToken:     "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0",
  equipmentNFT:  "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9",
  gameContract:  "0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9",
  donationVault: "0x5FC8d32690cc91D4c39d9d3abcBD16989F875707",
  adoptionVault: "0x0165878A594ca255338adfa4d48449f69242Eb8F",
} : {
  // fuji 链上地址，部署一次后长期有效，填入后不需要再改
  catRegistry:   "0x填入fuji部署后的地址",
  catNFT:        "0x填入fuji部署后的地址",
  purrToken:     "0x填入fuji部署后的地址",
  equipmentNFT:  "0x填入fuji部署后的地址",
  gameContract:  "0x填入fuji部署后的地址",
  donationVault: "0x填入fuji部署后的地址",
  adoptionVault: "0x填入fuji部署后的地址",
};
```

---

## 10. Fuji 测试网部署

### 前提

- `.env` 里已填入有 AVAX 余额的钱包私钥
- 编译通过（`npx hardhat compile` 无报错）

### 部署

```bash
npx hardhat run scripts/deploy.js --network fuji
```

`deploy.js` 会自动完成：
1. 按顺序部署 7 个合约
2. 配置所有权限（setAuthorizedMinter × 4、setAuthorizedContract × 2、setGameContract × 2）
3. 初始化 12 个装备模板（武器/背包/靴子各 4 个稀有度）
4. 初始化 3 个 Collection 收藏系列（玩耍/同伴/睡觉）
5. 输出所有合约地址

### 部署后立即执行

**第一步：配置 AVAX 收益分配**

编辑 `scripts/setShares.js`，填入 PurrToken 合约地址：

```bash
npx hardhat run scripts/setShares.js --network fuji
```

Demo 阶段 deployer 独占 100%，正式上线时修改 `recipients` 和 `shares` 数组再调用一次即可（不需要重新部署合约）。

**第二步：登记机构和雀猫**

可以在 Hardhat console 或写脚本执行：

```js
// 注册机构（机构地址调用，或 demo 阶段用 deployer 模拟）
await catRegistry.registerShelter("爱心猫舍", "台湾彰化");

// owner 审批
await catRegistry.approveShelter(shelterAddress);

// 机构登记雀猫
await catRegistry.addCat(
  "雀猫",
  1,
  "female",
  "活泼好动的小雀猫，等待有缘人的守护",
  [
    "ipfs://bafybeiewjp2e4gmewiotq6pi2snbfta2gltblnaymdhbzkhv2hcq3psij4/cat_stage1.json",
    "ipfs://bafybeiewjp2e4gmewiotq6pi2snbfta2gltblnaymdhbzkhv2hcq3psij4/cat_stage2_junior.json",
    "ipfs://bafybeiewjp2e4gmewiotq6pi2snbfta2gltblnaymdhbzkhv2hcq3psij4/cat_stage3.json",
    "ipfs://bafybeiewjp2e4gmewiotq6pi2snbfta2gltblnaymdhbzkhv2hcq3psij4/genesis.json",
  ]
);
```

**第三步：将合约地址填入 test_flow.js，跑链上测试确认全流程通**

```bash
npx hardhat run scripts/test_flow.js --network fuji
```

> ⚠️ 链上测试出猎需要等待真实时间（默认短途 2 小时）。建议先调短时长（见演示指南），测完再改回。

---

## 11. 演示 Demo 操作指南

### 演示前准备（提前完成）

**调短出猎时间（owner 操作，演示当天执行）：**

```js
// 把短途改为 60 秒，方便现场演示
await gameContract.setHuntParams(
  [60, 120, 180],   // 短途60s / 中途120s / 长途180s
  [1, 2, 3],        // 体力消耗不变
  [2, 5, 15]        // 材料产出不变
);
```

**确认链上已完成：**
- 机构已注册并审批
- 雀猫已登记（catId = 0）
- Collection 系列已注册（3个）
- setShares 已配置

### 演示流程（约 10 分钟）

```
① 展示合约部署记录
   → 打开 Snowtrace testnet，搜索合约地址，展示代码和交易记录
   → 强调链上透明、资金流向可查

② 新用户入场
   → CatNFT.claimFamilyPortrait()         领全家福 NFT（展示 Season 1 图片）
   → PurrToken.claimWelcomeTokens()        领 20 PURR
   → PurrToken.buyTokens() + 0.1 AVAX      购买更多 PURR
   → GameContract.claimStarterCat(0)       选雀猫，领幼年 NFT

③ 商店购买道具
   → buyCatFood(2)  购买猫粮
   → buyCatCan(1)   购买罐罐
   → buyBooster(1)  购买加速符

④ 出猎与结算
   → startHunt(catTokenId, 0, 2, true)    短途+罐罐+加速符出发
   → 等待 60 秒
   → settleHunt(catTokenId)               结算，展示带回的 Collection NFT + 碎片

⑤ 抽卡与装备
   → claimWeeklyTicket(catTokenId)        领每周抽卡券
   → gacha()                              抽卡，展示装备 NFT（名字/稀有度）
   → equipItem(catTokenId, equipTokenId)  给雀猫穿装备

⑥ 云领养
   → DonationVault.donate(0) + 0.1 AVAX  捐款给雀猫
   → 展示 CloudAdopted NFT 自动 mint（type=1）
   → 强调 AVAX 直接到机构钱包，平台不经手

⑦ 收尾
   → 展示雀猫的三个成长阶段 NFT（幼年/少年/成年）
   → 简介真实领养流程（AdoptionVault）和 Genesis NFT
```

### 演示后恢复出猎时长

```js
await gameContract.setHuntParams(
  [2 * 3600, 4 * 3600, 8 * 3600],  // 恢复正常时长
  [1, 2, 3],
  [2, 5, 15]
);
```

---

## 12. 已知技术债务

| 级别 | 描述 | 建议 |
|------|------|------|
| 🔴 | `prevrandao + nonce` 伪随机，矿工可操控 | 正式上线接入 Chainlink VRF |
| 🟠 | `PurrToken.setCatNFT` 允许 owner 随时更换合约地址 | 生产环境改为 immutable 或多签 |
| 🟠 | `buyTokens` 整数除法存在精度损失 | 生产环境使用 Chainlink Price Feed |
| 🟡 | `AdoptionVault.lockPeriod` 修改会影响已有申请 | 考虑快照记录申请时的 lockPeriod |
| 🟡 | Collection 系列稀有度靠 `seriesId % 3` 简单分层 | 正式运营可在合约内显式记录每个系列的稀有度 |
| 🟢 | `distribute()` 前面收款方失败时份额归入最后一位 | 确保收款方地址均为可接收 AVAX 的地址 |
