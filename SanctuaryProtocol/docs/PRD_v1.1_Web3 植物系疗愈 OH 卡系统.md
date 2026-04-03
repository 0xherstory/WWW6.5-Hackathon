# 产品需求文档 (PRD)：Web3 植物系疗愈 OH 卡系统

---

## 📝 文档版本记录

| 版本 | 日期 | 更新内容 | 作者 |
|------|------|----------|------|
| v1.1 | 2024-03-22 | 更新IPFS集成方案、优化解密体验、修改时间机器权限、更新伪随机机制、添加草稿保存功能 | Web3 植物系OH卡项目组 |
| v1.0 | 2024-03-20 | 初始版本 | Web3 植物系OH卡项目组 |

---

## 1. 引言 / 概述 (Introduction / Overview)

### 核心产品理念

这是一款去金融化的植物主题 Web3 心理投射（OH卡）系统。在传统的中心化网络中，个人的私密情绪、创伤记录或自我探索往往面临被审查、凝视或数据泄露的风险。本项目利用区块链的"不可篡改性"与前端的"非对称/对称加密"技术，为女性、非二元性别群体及所有需要疗愈的人，打造一个绝对安全的"情绪疗愈工具"。它不仅是一个公共的心理投射工具，更是一个受代码法则保护的私人记忆容器。时间在这里不是流逝的证明，而是植物（情绪）生长与消化的养分。

---

## 2. 目标 / 目的 (Goals / Objectives)

### 2.1 业务/学术目标

在约定工期内完成结课作业，在 demo day 交付一个包含智能合约部署与前端交互的 MVP（最小可行性产品），并在测试网平稳运行。

### 2.2 产品体验目标

- 实现 4 种经典的 OH 卡探索牌阵，支持图文分离搭配
- 提供绝对私密的情绪封存体验（前端 IPFS 存储 + AES 加密）
- 实现基于情绪主题的心理探索，提供"情绪时光机"功能提升用户留存

### 2.3 技术可行性目标

结合 Solidity 课程所学（参考 Day 10 事件追踪、Day 14 私密存款箱、Day 21 NFT基础等），采用"前端伪随机 + IPFS 存储"的架构，确保 Vibe-coding 过程简单、线性、不出错，同时具备实际部署的可行性。

---

## 3. 目标受众 / 用户画像 (Target Audience / User Personas)

### 3.1 直接受众（MVP 阶段 - 评委/导师/同学）

**特征**：

- 拥有 Web3 钱包（MetaMask），熟悉测试网交互

**需求**：

- 需要清晰看到合约逻辑的闭环，包括 IPFS 存储引用、时间锁验证、状态流转以及事件广播的成功执行
- 展现架构完整视野和成本优化意识

### 3.2 核心受众（未来推向市场）

**特征**：

- 关注内心成长、心理学爱好者、寻求安全情绪发泄渠道的女性或非二元性别群体

**需求**：

- 极简美观的 UI（去技术化表现）
- 无需担心日记被偷窥的绝对安全感
- 通过数字卡牌连接产生的"不孤单感"
- 愿意在一周、一个月后返回查看情绪演变的长期疗愈体验

---

## 4. 用户故事 / 使用场景 (User Stories / Use Cases)

### 故事 1：小白模板探索（公共选卡）

> 作为一名访客，我希望进入画廊时能看到一套使用模板（单张牌、二元对立、身心灵、乔哈里视窗）。我可以选择一个模板，在对应的卡槽中自由挑选（或使用伪随机一键抽取）植物图卡和文字卡进行搭配。

### 故事 2：无痕迹的私密封存（情绪保险箱）

> 作为一名持卡人，我希望在选定牌阵并写下解读后，点击"封存上链"时，我的文字会在屏幕上瞬间化为乱码再存入 IPFS。区块链上只保存一个短哈希（CID），任何在区块链浏览器上偷窥的人都一无所获。

### 故事 3：时间与植物的演变（状态推进）

> 作为一名疗愈者，我希望通过"情绪时光机"预览未来30天后的情绪状态，激励自己持续疗愈。一周后返回，查看真实的情绪演变，看到自己的成长。

### 故事 4：灵魂的无声共鸣（集体回声）

> 作为一名访客或持卡人，我希望在查看某张植物卡片时，能看到一个柔和的提示词（如："已有 24 份记忆在此停留"），让我感受到集体潜意识的连结。

---

## 5. 功能需求 (Functional Requirements)

### 5.1 前端页面规划 (Frontend Modules)

#### 5.1.1 静态资产与字典映射 (Static Assets & Config)

**图卡资产**：

采用本地预制的精美图片资源（存放于前端 `public/cards/images` 目录下，最终精简为 30 张，命名规则如 `1-1.jpg`, `1-2.jpg` 等）。

根据心理学与植物生命周期，分为 6 组轨迹，每组 5 个阶段。命名规则为 `{轨迹ID}-{阶段ID}.jpg`（如 `1-1.jpg` 为第一组创伤）。

| 轨迹   | 阶段1              | 阶段2                       | 阶段3              | 阶段4              | 阶段5               |
| ---- | ---------------- | ------------------------- | ---------------- | ---------------- | ----------------- |
| 疗愈复原 | Trauma 创伤        | Protection/Isolation 保护隔离 | Recovery 复原      | Hope 希望          | Letting Go 放手     |
| 潜能突破 | Potential 潜能     | Resilience 韧性             | Adaptability 适应力 | Strength 力量      | Integration 整合    |
| 自我建构 | Unconscious 潜意识  | Aspiration 渴望             | Self 自我          | Joy 喜悦           | Transformation 转化 |
| 关系演变 | Emotion 情绪       | Dependency 依赖             | Defense 防御       | Relationships 关系 | Collective 集体     |
| 内在秩序 | Inner World 内心世界 | Nurture 养育                | Control 控制       | Complexity 复杂性   | Balance 平衡        |
| 生命流转 | Journey 旅程       | Masking 伪装                | Diversity 多样性    | Grief 哀伤         | Cycle 循环          |

**字卡资产**：

由纯文本配置文件驱动（存放以上 30 个对应的词汇文本）。

**映射机制**：

前端代码需维护一个"卡牌 ID 到本地图片路径/词汇"的字典。智能合约中仅存储数字 ID，前端负责将链上拉取的 ID 渲染为对应的图片和文字。

---

#### 5.1.2 首页 & 牌阵选择页 (Home & Spreads)

**功能**：

- 展示项目宣言（融入独立、安全、庇护所视角的文案）
- 提供 4 种经典 OH 卡牌阵入口（单张、双张、三张、四张组合）

**常见的经典 OH 卡牌阵模板**：

**单张牌：当下的镜子（最基础）**

- 玩法：凭直觉抽一张图卡（或图+字组合）
- 意义：反映Ta当下的核心情绪、最大的困扰，或者今天潜意识想给Ta的一个提示

**两张牌阵：二元对立与整合（最常用）**

- 【现在的我】 vs 【隐藏的我】（表层与潜意识）：一张代表Ta展现出来的样子，一张代表Ta压抑或未察觉的心理状态
- 【遇到的阻碍】 vs 【拥有的资源】：一张代表当下的困难，一张代表Ta内在已经具备的解决力量
- 【现实状态】 vs 【理想目标】：评估现状与期望的差距

**三张牌阵：线性演变与结构分析**

- 【身】-【心】-【灵】：分别投射身体的状态、理智的想法、内在灵魂的需求
- 【过去】-【现在】-【未来】：探索一个特定情绪或事件的发展轨迹
- 【问题】-【根源】-【建议】：偏向解决问题的实用主义牌阵

**四张牌阵：乔哈里视窗（Johari Window）**

- 探索四个维度的自我：公开的我（大家都知道）、盲区的我（别人知道但我不知道）、隐藏的我（我知道但别人不知道）、未知的我（潜意识）

**牌阵数量规则**：

| 牌阵类型 | 图卡数量 | 字卡数量 | 命名 |
|----------|----------|----------|------|
| 单张牌 | 1张 | 0-1张 | 当下的镜子 |
| 二元对立 | 2张 | 0-2张 | 整合与平衡 |
| 身心灵 | 3张 | 0-3张 | 线性演变 |
| 乔哈里视窗 | 4张 | 0-4张 | 自我探索 |

---

#### 5.1.3 选卡与解读页 (Selection & Journaling)

**图文分离画廊**：

- 左侧展示图卡库（读取本地配置表渲染）
- 右侧展示字卡库
- 支持手动挑选或伪随机抽取

**私密书写区**：

- 提供 textarea 文本输入框
- 实时字数统计（最多300字）
- 使用 localStorage 自动保存草稿（每10秒自动保存，防止页面刷新丢失）

**加密与上链引擎（核心）**：

| 项目 | 说明 |
|------|------|
| **加密方案** | 采用 AES-256-GCM 对称加密算法 |
| **密钥派生** | 使用用户钱包签名（`personal_sign`）作为派生密钥的种子 |
| **加密流程** | 用户在 textarea 输入日记 → 点击"封存" → 前端调用钱包签名获取密钥 → AES加密文本 → 屏幕上展示加密后的乱码效果 → 上传到 IPFS → 获取 CID → 调用合约 `depositMemory` 方法上链 |
| **解密流程** | 用户进入"我的庇护所" → 点击"解密阅读" → 检查 sessionStorage 是否有缓存的密钥 → 如有则直接解密，无则唤起钱包签名 → 将密钥缓存到 sessionStorage（浏览器关闭即失效） → AES解密显示原文 |
| **数据存储** | IPFS 存储加密密文，区块链仅存储 CID（约几十字节）和卡牌ID |
| **Gas 优化** | 由于只存储短 CID，单次交易 Gas 成本大幅降低 |
| **密钥缓存** | 首次解密后，密钥会缓存到 sessionStorage，本次会话期间无需重复签名 |

**IPFS 集成方案**：

> ⚠️ **重要变更（2024年更新）**：NFT.Storage已于2024年停止免费服务，需迁移至替代方案。

**方案对比**：

| 服务商 | 免费额度 | 稳定性 | 迁移成本 | 推荐度 |
|--------|----------|--------|----------|--------|
| ~~NFT.Storage~~ | ~~已停服~~ | - | - | ❌ 废弃 |
| **Pinata** | 1GB/月 | ⭐⭐⭐⭐⭐ | 低 | ✅ 推荐 |
| **web3.storage** | 5GB/月 | ⭐⭐⭐⭐ | 低 | ✅ 备选 |
| **Lighthouse** | 永久存储 | ⭐⭐⭐ | 中 | 🟡 可选 |

**推荐方案：Pinata**

```typescript
// src/lib/ipfs.ts（更新后）
import { PinataSDK } from "pinata-web3";

const pinata = new PinataSDK({
  pinataJwt: process.env.NEXT_PUBLIC_PINATA_JWT,
  pinataGateway: "gateway.pinata.cloud",
});

export async function uploadToIPFS(data: JournalData): Promise<string> {
  const blob = new Blob([JSON.stringify(data)], { type: "application/json" });
  const file = new File([blob], `journal-${Date.now()}.json`);
  
  const upload = await pinata.upload.file(file);
  return upload.IpfsHash; // 返回CID
}

export async function downloadFromIPFS(cid: string): Promise<JournalData> {
  const response = await fetch(`https://gateway.pinata.cloud/ipfs/${cid}`);
  return response.json();
}
```

**迁移步骤**：
1. 注册Pinata账号：https://app.pinata.cloud/
2. 创建API Key，获取JWT
3. 更新 `.env.local`：
   ```bash
   NEXT_PUBLIC_PINATA_JWT=your_pinata_jwt_here
   ```
4. 安装新依赖：`npm install pinata-web3`
5. 卸载旧依赖：`npm uninstall nft.storage`
6. 更新 `src/lib/ipfs.ts`

**向后兼容**：
- 已存储在NFT.Storage的数据仍然可以通过公共网关访问
- 只需迁移上传功能，不影响已存储的数据

**原方案（已废弃，仅作参考）**：
~~- **服务商**：NFT.Storage（Protocol Labs 官方服务，完全免费）~~
~~- **上传方式**：前端通过 REST API 上传加密后的日记文件~~
~~- **返回结果**：IPFS CID（Content Identifier，如 `QmXyZ...`）~~
~~- **读取方式**：通过公共网关 `https://ipfs.io/ipfs/{CID}` 获取~~
~~- **永久性**：NFT.Storage 自动做冗余备份，数据永久保存~~

**用户体验优化**：

- 首次解密时提示："🔒 点击'解密阅读'需要钱包签名。提示：本次会话期间无需重复签名，关闭浏览器后密钥自动失效"
- 草稿自动保存：每 10 秒自动保存到 localStorage，刷新页面后提示恢复
- 草稿超过24小时：提示"你有一个未完成的探索（已保存超过24小时），是否继续？"

---

#### 5.1.4 我的庇护所 (My Sanctuary)

**功能**：

- 要求用户连接钱包，读取该地址下所有的存入记录
- 提供"解密阅读"按钮（通过唤起钱包签名授权，自动在前端静默完成密文到明文的转换，确保只有持卡人可见）
- 动态渲染卡牌的情绪主题和封存天数

**记忆列表展示**：

- 每条记忆显示：选中的图卡、字卡、封存时间、当前天数
- 使用 `memoryCount` 快速显示总数，避免遍历整个数组
- 支持按时间、轨迹筛选

**情绪阶段计算**：

- 根据封存天数计算当前阶段（每7天一个阶段，共5阶段）
- 达到第5阶段后不再变化，保持最终状态

---

#### 5.1.5 情绪时光机 (Time Machine)

**路由**：独立的功能页面（如 `/timemachine`）

**产品定位**：

- **核心价值**：提升用户留存，让用户愿意在一周、一个月后返回查看情绪演变
- **使用场景**：用户可以预览"如果持续疗愈，30天后我会到达什么阶段"，获得正向激励

**功能**：

- 权限控制：用户只能修改自己的时间偏移（通过 `msg.sender` 验证）
- 时间偏移：支持设置自己的时间偏移量（如 +7天、+30天）
- 预览效果：即时看到自己的所有记忆卡片的"未来状态"（不改变链上数据，仅改变前端渲染）
- 重置功能：一键重置为当前时间

**UI 设计**：

```
┌─────────────────────────────────────────┐
│  情绪时光机                              │
│  "看见未来的自己，激励当下的成长"          │
├─────────────────────────────────────────┤
│                                         │
│  你的当前时间偏移：+0 天                 │
│                                         │
│  [快速预设]                             │
│  [+7天] [+14天] [+30天] [+60天] [+90天] │
│                                         │
│  预览效果：                             │
│  ┌──────────────────────────────┐      │
│  │ [图卡预览 - 计算后的阶段]     │      │
│  │ 30天后，你将到达：复原期      │      │
│  │ "继续保持，你正在疗愈中"      │      │
│  └──────────────────────────────┘      │
│                                         │
│  [应用偏移]  [重置为当前时间]            │
│                                         │
└─────────────────────────────────────────┘
```

---

### 5.2 智能合约映射 (Smart Contract Mapping & Logic)

基于 30 Days of Solidity 课程知识点，为确保 AI 辅助开发顺利，设定以下清晰逻辑：

#### 5.2.1 核心数据结构 (Day 2 State Variables)

```solidity
struct MemoryRecord {
    uint256[] imageIds;      // 选中的植物图卡ID数组 (支持多张牌阵)
    uint256[] wordIds;       // 选中的字卡ID数组
    string ipfsCID;          // IPFS内容标识符（替代encryptedJournal）
    uint256 timestamp;       // 存入时间
}

mapping(address => MemoryRecord[]) private userMemories;
mapping(address => uint256) public memoryCount;  // 新增：记录用户记忆总数
mapping(address => uint256) public userTimeOffset;  // 用户的时间偏移量
mapping(uint256 => uint256) public resonanceCount;  // 卡牌共鸣统计
```

> **说明**：使用 IPFS 存储加密日记，合约仅存储 CID（约几十字节），大幅降低 Gas 成本。`memoryCount` 用于快速查询总数，避免遍历数组。

---

#### 5.2.2 情绪时光机支持

- 用户只能设置自己的时间偏移（通过 `msg.sender` 验证）
- 提供函数 `function setTimeOffset(uint256 _offset) external` 允许用户设置自己的时间偏移
- 合约内所有计算流逝时间的逻辑使用 `(block.timestamp + userTimeOffset[msg.sender])`

```solidity
/**
 * @dev 用户设置自己的时间偏移（预览未来状态）
 * @param offset - 时间偏移量（秒）
 */
function setTimeOffset(uint256 offset) external {
    userTimeOffset[msg.sender] = offset;
    emit TimeOffsetUpdated(msg.sender, offset);
}

/**
 * @dev 重置用户的时间偏移
 */
function resetTimeOffset() external {
    userTimeOffset[msg.sender] = 0;
    emit TimeOffsetUpdated(msg.sender, 0);
}

/**
 * @dev 计算当前情绪阶段
 * @param user - 用户地址
 * @param index - 记忆索引
 * @return 当前阶段（1-5）
 */
function getCurrentStage(address user, uint256 index) external view returns (uint256) {
    require(index < userMemories[user].length, "索引超出范围");

    uint256 depositTime = userMemories[user][index].timestamp;
    uint256 effectiveTime = block.timestamp + userTimeOffset[user];
    uint256 daysPassed = (effectiveTime - depositTime) / 1 days;

    // 每7天一个阶段，最大5阶段
    if (daysPassed < 7) return 1;
    if (daysPassed < 14) return 2;
    if (daysPassed < 21) return 3;
    if (daysPassed < 28) return 4;
    return 5;
}
```

---

#### 5.2.3 隐私与确权 (Day 14 SafeDeposit & Day 21 SimpleNFT)

- 仅限 `msg.sender` 可以调用读取自己日记的接口
- 链上仅保存 IPFS CID，不保存任何明文或密钥信息
- 加密数据存储在 IPFS，仅持有密钥的用户可解密

---

#### 5.2.4 集体回声追踪 (Day 10 ActivityTracker)

| 项目 | 说明 |
|------|------|
| **合约内存储** | `mapping(uint256 => uint256) public resonanceCount` 记录每张卡牌的共鸣次数 |
| **事件触发** | `event CardResonated(uint256 indexed cardId, uint256 newCount)` |
| **统计逻辑** | 用户上链封存记忆时，合约一次性更新所有选中卡牌的共鸣数 |
| **前端展示** | 读取合约 `resonanceCount(cardId)` 显示"已有 X 份记忆在此停留" |
| **访客支持** | 访客连接钱包后可免费更新共鸣数（通过批量更新接口） |
| **未来扩展** | MVP后可通过 The Graph 索引事件，实现更复杂的共鸣数据分析 |

---

#### 5.2.5 伪随机机制 (Day 22 替代方案)

**MVP版本（当前）**：

采用**前端伪随机**方案，平衡安全性、复杂度和用户体验。

**为什么不用 Chainlink VRF？**

| 对比项 | Chainlink VRF | 前端伪随机 |
|--------|---------------|------------|
| **安全性** | ⭐⭐⭐⭐⭐ 真随机 | ⭐⭐⭐ 足够安全（非博彩场景） |
| **用户体验** | ⭐⭐ 需等待30秒 | ⭐⭐⭐⭐⭐ 即时反馈 |
| **Gas 成本** | ⭐⭐ 需要 LINK | ⭐⭐⭐⭐⭐ 无额外成本 |
| **实现复杂度** | ⭐⭐ 复杂 | ⭐⭐⭐⭐⭐ 简单 |

**前端伪随机实现**：

```typescript
/**
 * 生成安全的随机数
 */
function generateSecureNonce(): number {
  const array = new Uint32Array(1)
  window.crypto.getRandomValues(array)
  return array[0]
}

/**
 * 前端伪随机抽卡
 * @param totalCards - 总卡牌数量
 * @param count - 需要抽取的数量
 * @param userAddress - 用户地址（作为种子的一部分）
 * @returns 抽中的卡牌ID数组
 */
export function drawRandomCards(
  totalCards: number,
  count: number,
  userAddress: string
): number[] {
  const selected: number[] = []
  const nonce = generateSecureNonce()

  // 生成种子：用户地址 + 随机nonce + 当前时间
  const seed = userAddress + nonce.toString() + Date.now()

  // 使用简单的哈希函数生成伪随机序列
  for (let i = 0; i < count; i++) {
    const hash = simpleHash(seed + i)
    const cardId = (hash % totalCards) + 1

    // 确保不重复
    if (!selected.includes(cardId)) {
      selected.push(cardId)
    } else {
      i-- // 重复则重新抽取
    }
  }

  return selected
}

/**
 * 简单的字符串哈希函数
 */
function simpleHash(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32bit integer
  }
  return Math.abs(hash)
}
```

**优点**：
- 用户体验好（即时反馈）
- 无需额外 Gas 费用
- 实现简单，易维护
- 安全性足够（非博彩场景）

**未来增强**（可选）：
- 引入 Commit-Reveal 方案增加公平性
- 或使用 Chainlink VRF（如果需要真随机）

---

## 6. 非功能需求 (Non-Functional Requirements)

### 6.1 性能

- 由于文字加密发生在前端，前端打包体积需保持轻量
- 利用 Vercel 静态托管本地图片资产，确保极速加载
- IPFS 通过公共网关访问，使用 CDN 缓存提升加载速度

### 6.2 易用性 (小白引导)

- 在"连接钱包"和"支付 Gas"等区块链独有环节，提供类似"获取疗愈能量（连接钱包）"、"支付以太坊邮费（Gas费说明）"的温柔文案引导
- 首次解密时明确提示 sessionStorage 的缓存机制
- 草稿自动保存，防止意外刷新丢失数据

### 6.3 安全性

- 即使智能合约开源，也绝对不可以在合约中留下能够读取其他地址日记的后门函数（Admin 也不行）
- 钱包签名机制确保了即便平台方也无法解密用户的数据
- 加密密钥仅在用户浏览器内存中存在，关闭浏览器即失效
- IPFS 数据仅可通过 CID 访问，无密钥无法解密

---

## 7. 设计考量 (Design Considerations)

### 7.1 视觉语言 (女性/非二元友好)

- **真实插画资产优先**：图卡优先采用高品质预制植物插画，以保证高水准的情绪感染力
- **摒弃传统的深色赛博朋克风或加密货币的霓虹风**
- **采用低饱和度的自然大地色系**、水彩或单线勾勒的植物插画
- **UI 元素追求极简、留白、圆角**，传达"呼吸感"

### 7.2 文案风格

- **避免使用**："交易"、"资产"、"质押"等词汇
- **替代为**："封存"、"映射"、"生长"、"回声"

---

## 8. 成功指标 (Success Metrics - MVP阶段)

- [ ] 智能合约在测试网（如 Sepolia）成功部署，无严重安全漏洞
- [ ] 能够走通至少 1 个完整的牌阵（如图+字+前端钱包签名加密的日记），并成功上传到 IPFS + 上链
- [ ] "情绪时光机"通过合约级的 timeOffset 变量，成功模拟并展示未来的情绪状态
- [ ] 解密体验流畅，sessionStorage 缓存机制正常工作
- [ ] 草稿自动保存功能正常，防止数据丢失
- [ ] 获得评委或测试用户的正向情感反馈（体验流畅、立意独特、具有工程化落地考量）

---

## 9. 待解决问题 / 未来规划 (Open Questions / Future Considerations)

### 未来规划 1 - 账户抽象 (AA/无Gas交互)

考虑引入 ERC-4337，让真实小白用户无需购买 ETH 即可使用邮箱登录并免费（由项目方代付 Gas）封存日记。

### 未来规划 2 - 动态 NFT (ERC-1155/ERC-6551)

将这组记忆直接铸造为绑定的 Soulbound Token (灵魂绑定代币)，情绪的演变真正刻在 NFT 的元数据里，可在 Opensea 等平台呈现动态变化。

### 未来规划 3 - 星空回声 UI

将枯燥的"共鸣次数"升级为星空连线图，展示一张牌在不同群体中产生的情感星云。

### 未来规划 4 - Layer 2 主网部署

为了进一步降低成本，考虑在 Polygon、Arbitrum 或 Optimism 等 Layer 2 网络部署主网版本，Gas 成本可降低至 $0.001 以下。

### 未来规划 5 - 社群疗愈功能

引入多人共享牌阵，允许好友之间共同探索情绪主题，形成疗愈社群。

---

## 10. 技术栈选型 (Tech Stack)

### 10.1 前端框架

| 技术 | 说明 |
|------|------|
| Next.js 14 (App Router) | React框架，支持SSG/SSR，部署友好 |
| TypeScript | 类型安全，减少运行时错误 |
| Tailwind CSS | 原子化CSS，快速实现定制化UI |

### 10.2 Web3集成

| 技术 | 说明 |
|------|------|
| wagmi | React hooks for Ethereum，现代化的Web3开发体验 |
| viem | 轻量级以太坊工具库，替代ethers.js |
| RainbowKit | 美观的钱包连接组件，支持MetaMask、WalletConnect等多种钱包 |

### 10.3 加密与安全

| 技术 | 说明 |
|------|------|
| crypto-js | AES-256-GCM加密实现 |
| ethers.js (仅用于签名) | 钱包签名派生密钥 |
| nft.storage | IPFS存储服务（Protocol Labs官方，完全免费） |

### 10.4 部署与托管

| 技术 | 说明 |
|------|------|
| Vercel | 前端静态托管，自动CI/CD |
| Sepolia测试网 | 智能合约部署目标网络 |
| Hardhat/Foundry | 智能合约开发框架（待定） |

### 10.5 开发工具

- ESLint + Prettier - 代码规范
- Git - 版本控制

---

## 11. 用户旅程流程图 (User Journey)

### 11.1 访客路径（无需钱包）

1. 进入首页 → 阅读项目宣言
2. 点击"开始探索" → 进入牌阵选择页
3. 选择牌阵类型（单张/二元/身心灵/乔哈里）
4. 进入选卡页面
   - 浏览图卡画廊（看到共鸣次数）
   - 浏览字卡列表
   - 手动选择或随机抽取
5. 查看选中的卡牌组合
6. （可选）连接钱包继续封存，或重新开始

### 11.2 持卡人路径（需连接MetaMask钱包）

1. 连接钱包（MetaMask等）
2. 选择牌阵并挑选卡牌（同上）
3. 在书写区输入日记解读（最多300字）
   - 草稿每10秒自动保存到 localStorage
4. 点击"封存上链"
   - 唤起MetaMask签名获取加密密钥
   - 屏幕显示加密动画（文字渐变为乱码）
   - 上传到 IPFS 获取 CID
   - 提交交易，支付Gas费
   - 显示"封存成功"确认
5. 进入"我的庇护所"
   - 查看所有已封存记忆列表
   - 每张卡片显示当前天数和情绪主题
   - 点击"解密阅读" → 首次需要唤起钱包签名 → 密钥缓存到 sessionStorage → 显示原文
   - 再次点击"解密阅读" → 直接使用缓存密钥 → 无需重复签名
6. （用户留存）进入"情绪时光机"
   - 设置时间偏移（+30天）
   - 预览未来的情绪状态
   - 获得激励："继续保持，你正在疗愈中"
   - 一周后返回，查看真实的情绪演变

---

## 12. 错误处理策略 (Error Handling)

### 12.1 钱包相关错误

| 错误场景 | 提示文案 |
|----------|----------|
| 未安装MetaMask | "请安装MetaMask获取疗愈能量" |
| 用户拒绝连接 | "连接钱包才能封存你的记忆" |
| 网络错误 | 自动提示切换至Sepolia测试网 |
| 余额不足 | "你的以太坊邮费不足，请去水龙头领取测试币" |

### 12.2 交易相关错误

| 错误场景 | 提示文案 |
|----------|----------|
| 用户拒绝签名 | 返回选卡页面，保留已选内容 |
| Gas估算失败 | "网络拥堵，请稍后重试" |
| 交易超时 | "封存可能需要一些时间，请耐心等待" |
| 交易回滚 | 显示具体错误信息（如"CID无效"等） |

### 12.3 输入验证

| 验证项 | 处理方式 |
|--------|----------|
| 日记超过300字 | 实时显示字数"287/300"，超限后红色提示并拦截提交 |
| 未选择卡牌 | 提示"请先选择你的植物伙伴" |
| 空日记提交 | 提示"写下你的感受，即使是只言片语" |

### 12.4 加密相关错误

| 错误场景 | 提示文案 |
|----------|----------|
| 解密失败（签名不匹配） | "这似乎不是你的记忆" |
| 密钥派生失败 | "请重新连接钱包" |
| IPFS获取失败 | "记忆暂时无法读取，请稍后重试" |

### 12.5 草稿恢复

| 场景 | 处理方式 |
|------|----------|
| 页面刷新后 | 检测到 localStorage 有草稿，提示："发现未完成的探索，是否继续？" |
| 草稿超过24小时 | 提示："你有一个未完成的探索（已保存超过24小时），是否继续？" |

---

## 13. MVP功能优先级 (MVP Prioritization)

### P0 - 必须实现（Demo Day展示核心）

- [ ] 首页与牌阵选择页面
- [ ] 图卡/字卡画廊展示（本地静态资源）
- [ ] 单张牌阵的完整流程（选卡→书写→加密→IPFS→上链）
- [ ] MetaMask钱包连接与基础交互
- [ ] 我的庇护所页面（列表+解密阅读+sessionStorage缓存）
- [ ] 智能合约部署（Sepolia测试网）
- [ ] 情绪时光机功能（用户自己设置时间偏移）
- [ ] localStorage 草稿自动保存

### P1 - 应该实现（提升完整性）

- [ ] 二元对立、身心灵、乔哈里三种牌阵
- [ ] 伪随机抽卡功能（前端实现）
- [ ] 共鸣次数统计与展示
- [ ] 加密动画视觉效果
- [ ] 响应式移动端适配

### P2 - 可以延后（锦上添花）

- [ ] 情绪阶段演化的平滑动画
- [ ] 多语言支持
- [ ] 分享功能（分享卡牌到社交媒体）
- [ ] 音效与背景音乐

---

## 14. 合约安全审计清单 (Security Checklist)

### 14.1 访问控制

- [ ] `setTimeOffset` 函数只能由用户自己调用（msg.sender 验证）
- [ ] `getUserMemories` 等读取函数严格限制为 `msg.sender` 只能读取自己的数据
- [ ] 不存在任何可以读取其他地址日记的后门函数

### 14.2 数据隐私

- [ ] 合约中不存储任何明文内容
- [ ] 加密密钥不在链上存储或传输
- [ ] 事件日志中不泄露敏感信息
- [ ] IPFS 数据仅可通过 CID 访问，无密钥无法解密

### 14.3 输入验证

- [ ] `depositMemory` 函数验证数组长度不超过牌阵最大限制（4张）
- [ ] 验证 `ipfsCID` 格式正确（以 "Qm" 或 "b" 开头，长度合理）
- [ ] 验证卡牌ID在有效范围内（1-30）

### 14.4 重入攻击防护

- [ ] 遵循 Checks-Effects-Interactions 模式
- [ ] 状态变更在对外调用之前完成

### 14.5 溢出保护

- [ ] 使用 Solidity 0.8+ 内置溢出检查
- [ ] 数组操作有长度限制

### 14.6 时间操控

- [ ] `timeOffset` 只能由用户自己设置
- [ ] 时间计算使用 `block.timestamp + timeOffset`，避免负数溢出

### 14.7 测试覆盖

- [ ] 单元测试覆盖所有公共函数
- [ ] 集成测试覆盖完整用户流程
- [ ] 边界条件测试（空日记、最大长度、最大卡牌数等）
- [ ] IPFS 集成测试（上传、获取、错误处理）

---

**文档版本**: v1.1
**最后更新**: 2024-03-22
**作者**: Web3 植物系OH卡项目组
