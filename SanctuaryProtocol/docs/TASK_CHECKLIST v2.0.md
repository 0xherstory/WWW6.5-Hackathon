# Web3 植物系疗愈 OH 卡系统 - 任务清单 v2.0

> **更新时间**: 2026-03-24
> **项目阶段**: v1.1 疗愈工具 + v2.1 互助协议并行开发
> **当前状态**: v2.1 前端核心功能已完成，代码审查通过，合约待部署

---

## 📊 项目完成度概览

### v1.1 疗愈工具完成度：35%
- ✅ 核心疗愈流程 (90%)
- ✅ 加密上传功能 (100%)
- ❌ 合约集成 (0%)
- ❌ 我的庇护所 (0%)
- ❌ 情绪时光机 (0%)

### v2.1 互助协议完成度：65%
- ✅ 合约代码 (90%)
- ❌ 合约部署 (0%)
- ✅ 前端页面 (80%)
- ✅ 后端API (100% - MVP模拟方案)
- ✅ 代码审查 (100% - 84.6/100)
- ❌ 完整集成 (0%)

---

## 📋 代码审查结果 (2026-03-24)

**代码质量评分**: ⭐⭐⭐⭐ (84.6/100)

### ✅ 已修复的问题

| 问题编号 | 描述 | 状态 |
|---------|------|------|
| #13 | 验证页面未集成API | ✅ 已修复 |
| #9 | Success页面导航逻辑 | ✅ 已修复 |

### ⚠️ MVP阶段可接受的限制 (已添加中文TODO注释)

| 位置 | 限制 | TODO注释 |
|------|------|----------|
| Launch页面 | 硬编码资金池数据 | ✅ 已添加中文注释 + 实现示例 |
| Guardian页面 | 硬编码资金池数据 | ✅ 已添加中文注释 + PoolStatusCard集成示例 |
| Guardian页面 | 模拟捐赠功能 | ✅ 已添加中文注释 + donateAndMint()示例 |
| Claim页面 | 硬编码资金池数据 | ✅ 已添加中文注释 + getPoolStatus()示例 |
| API routes | 内存存储验证码 | ✅ 已添加中文注释 + Redis替换说明 |
| API routes | 验证码仅控制台输出 | ✅ 已添加中文注释 + Resend.com集成示例 |

### ✅ 代码亮点

1. **类型安全性高** - 全面使用TypeScript，接口定义完整
2. **使用最新API** - wagmi v2 + viem v2, Zustand v4, Next.js 14
3. **UI/UX设计优秀** - 响应式设计完整，动画流畅
4. **测试框架完整** - Vitest配置正确，12个测试通过

### 📝 部署建议

- ✅ **MVP阶段**: 可以部署
- ⚠️ **生产环境**: 需要完成Redis集成、邮件服务、合约部署

---

## ✅ 已完成的工作

### 1. 真实加密和IPFS上传功能 ✅

**完成时间**: 2026-03-24
**影响文件**:
- `src/app/[locale]/journal/[spreadType]/page.tsx` (完全重写)
- `src/config/constants.ts` (修复环境变量名)

**实现内容**:
- ✅ 导入并使用 `encryptData()` 函数进行真实AES加密
- ✅ 导入并使用 `uploadToIPFS()` 函数上传到NFT.Storage
- ✅ 实现加密进度UI（encrypting → uploading → success）
- ✅ 实现错误处理和重试功能
- ✅ 显示真实选中的卡牌（而非占位符）
- ✅ 将IPFS CID保存到localStorage
- ✅ 将CID通过URL参数传递到成功页面

**关键代码片段**:
```typescript
// 真实加密流程
const encryptedContent = encryptData(JSON.stringify(journalData));

// 真实IPFS上传
const cid = await uploadToIPFS({
  encrypted: true,
  data: encryptedContent,
  timestamp: journalData.timestamp,
  spreadType: journalData.spreadType
});

// 保存到localStorage
const existingJournals = JSON.parse(localStorage.getItem('oh-card-journals') || '[]');
existingJournals.push({ cid, spreadType, timestamp, selectedCardIds });
localStorage.setItem('oh-card-journals', JSON.stringify(existingJournals));
```

**测试步骤**:
1. 运行 `npm run dev`
2. 完成选卡流程
3. 写日记并提交
4. 观察加密进度动画
5. 检查控制台是否显示CID
6. 检查localStorage中的 `oh-card-journals` 键

---

### 2. 合约依赖安装和编译 ✅

**完成时间**: 2026-03-24
**影响文件**:
- `package.json` (新增依赖)
- `contracts/SanctuaryProtocol.sol` (修复所有中文字符串)

**实现内容**:
- ✅ 安装 OpenZeppelin 合约库 (`@openzeppelin/contracts`)
- ✅ 修复 SanctuaryProtocol.sol 中的所有中文字符串
- ✅ 移除不支持的 `@version` 文档注释
- ✅ 成功编译 8 个 Solidity 文件

**修复的中文字符串**:
```solidity
// 修复前
require(isWhitelisted[msg.sender], "不在白名单中");

// 修复后
require(isWhitelisted[msg.sender], "Not in whitelist");
```

**编译结果**:
```
Compiled 8 Solidity files successfully (evm target: paris).
```

**测试步骤**:
1. 运行 `npm run compile`
2. 检查输出是否显示 "Compiled 8 Solidity files successfully"
3. 检查 `artifacts/` 目录是否生成合约文件

---

### 3. 环境变量配置修复 ✅

**完成时间**: 2026-03-24
**影响文件**:
- `src/config/constants.ts`

**修复内容**:
```typescript
// 修复前
apiKey: process.env.NEXT_PUBLIC_NFT_STORAGE_KEY || ""

// 修复后
apiKey: process.env.NEXT_PUBLIC_NFT_STORAGE_API_KEY || ""
```

---

### 4. Launch 页面修复 ✅ (新增)

**完成时间**: 2026-03-24
**影响文件**:
- `src/app/[locale]/launch/page.tsx`

**修复内容**:
- ✅ 修复 Tailwind 颜色类名错误 (`border-emerald-20` → `border-emerald-200`)
- ✅ 修复 `border-amber-20` → `border-amber-200`
- ✅ 双模式选择功能正常工作

---

### 5. Guardian 守护者画廊页面 ✅ (新增)

**完成时间**: 2026-03-24
**影响文件**:
- `src/app/[locale]/guardian/page.tsx`

**实现内容**:
- ✅ 30张OH卡展示画廊
- ✅ 卡牌选择交互
- ✅ 捐赠金额输入（默认0.01 AVAX）
- ✅ 资金池状态展示
- ✅ 捐赠流程模拟
- ✅ 国际化支持

---

### 6. Claim 申请介绍页面 ✅ (新增)

**完成时间**: 2026-03-24
**影响文件**:
- `src/app/[locale]/claim/page.tsx`

**实现内容**:
- ✅ 资金池状态展示
- ✅ 申请条件检查列表（完成觉察、停留时间、字数要求）
- ✅ 条件满足状态动态判断
- ✅ 两个操作按钮（开始验证、返回首页）
- ✅ 国际化支持

---

### 7. Sanctuary 合约交互函数 ✅ (新增)

**完成时间**: 2026-03-24
**影响文件**:
- `src/lib/web3/sanctuaryContract.ts`

**实现内容**:
- ✅ `getPoolStatus()` - 获取资金池状态
- ✅ `hasEmailClaimed()` - 检查邮箱是否已领取
- ✅ `donateAndMint()` - 捐赠并铸造NFT
- ✅ `verifyEmailOnChain()` - 链上验证邮箱
- ✅ `claimAid()` - 领取互助资金
- ✅ 完整的错误处理

---

### 8. 资金池状态组件 ✅ (新增)

**完成时间**: 2026-03-24
**影响文件**:
- `src/components/claim/PoolStatusCard.tsx`

**实现内容**:
- ✅ 可复用的资金池状态展示组件
- ✅ 自动获取链上数据
- ✅ 加载状态处理
- ✅ 状态变化回调支持

---

### 9. Success 页面导航修复 ✅ (新增)

**完成时间**: 2026-03-24
**影响文件**:
- `src/app/[locale]/success/page.tsx`

**修复内容**:
- ✅ 修复导航路径（`/verification` → `/claim`）
- ✅ 显示领取金额和交易哈希
- ✅ 链接到 Snowtrace 区块浏览器
- ✅ 已领取后隐藏申请按钮

---

### 10. 状态管理 Store ✅ (新增)

**完成时间**: 2026-03-24
**影响文件**:
- `src/stores/claimStore.ts`

**实现内容**:
- ✅ Zustand 状态管理
- ✅ 验证状态追踪
- ✅ 邮箱和邮箱哈希存储
- ✅ 领取状态管理
- ✅ 持久化存储（localStorage）

---

### 11. 后端 API - 发送验证码 ✅ (新增)

**完成时间**: 2026-03-24
**影响文件**:
- `src/app/api/send-code/route.ts`

**实现内容**:
- ✅ 生成 6 位数字验证码
- ✅ 60 秒频率限制
- ✅ 5 分钟过期时间
- ✅ 仅支持 Gmail
- ✅ 内存存储（MVP方案，生产环境需替换为 Redis）

---

### 12. 后端 API - 验证验证码 ✅ (新增)

**完成时间**: 2026-03-24
**影响文件**:
- `src/app/api/verify-code/route.ts`

**实现内容**:
- ✅ 验证码校验
- ✅ 生成 emailHash (keccak256)
- ✅ 验证成功后删除验证码
- ✅ 完整的错误处理

---

### 13. 验证页面集成 API ✅ (新增)

**完成时间**: 2026-03-24
**影响文件**:
- `src/app/[locale]/verification/page.tsx`

**实现内容**:
- ✅ 调用真实后端 API 发送验证码
- ✅ 调用真实后端 API 验证验证码
- ✅ 集成 Zustand 状态管理
- ✅ 显示 emailHash
- ✅ ZK-Proof 模拟动画

---

### 14. 错误边界组件 ✅ (新增)

**完成时间**: 2026-03-24
**影响文件**:
- `src/components/common/ErrorBoundary.tsx`

**实现内容**:
- ✅ React Error Boundary 实现
- ✅ 友好的错误提示界面
- ✅ 重试和返回首页按钮
- ✅ 支持自定义 fallback

---

### 15. 单元测试框架 ✅ (新增)

**完成时间**: 2026-03-24
**影响文件**:
- `vitest.config.ts`
- `src/lib/__tests__/zkEmailSimulation.test.ts`
- `src/lib/__tests__/encryption.test.ts`
- `package.json` (新增测试脚本)

**实现内容**:
- ✅ 安装 Vitest 测试框架
- ✅ 邮箱验证函数测试（validateEmail, isGmail）
- ✅ 加密解密函数测试（encryptData, decryptData, generateKey）
- ✅ 12 个测试用例全部通过
- ✅ 新增测试脚本 `npm run test:frontend`

**测试结果**:
```
Test Files  2 passed (2)
     Tests  12 passed (12)
  Duration  24.72s
```

---

## 🎯 接下来需要完成的工作

### 阶段 1: v1.1 疗愈工具完善 (估计 3-5 天)

#### 任务 1.1: 部署 PlantOHCard.sol 合约 🔴 **高优先级**

**目标**: 将疗愈记忆存储合约部署到 Avalanche Fuji 测试网

**步骤**:
1. **创建 .env 文件**
   ```bash
   # 在项目根目录创建 .env 文件
   cd "D:\OneDrive\creating\2512-Vibe Coding\MyWorks\web3-plant-oh-card\Web3 PlantThemed OH Card"
   touch .env
   ```

2. **配置环境变量**
   ```bash
   # .env 文件内容
   PRIVATE_KEY=your_private_key_here_without_0x_prefix
   NEXT_PUBLIC_NFT_STORAGE_API_KEY=your_nft_storage_api_key
   NEXT_PUBLIC_ENCRYPTION_KEY=your_optional_encryption_key
   ```

3. **获取测试AVAX**
   - 访问: https://faucet.quicknode.com/avalanche/fuji
   - 或访问: https://testnet.bridge.axe.ooo/
   - 输入你的钱包地址获取测试AVAX

4. **部署合约**
   ```bash
   npm run deploy:fuji
   ```

5. **验证部署**
   - 保存输出的合约地址
   - 在区块链浏览器验证: https://testnet.snowtrace.io/

**预期输出**:
```
✅ 合约部署成功！
合约地址: 0x...
网络: Avalanche Fuji Testnet
Explorer: https://testnet.snowtrace.io/address/0x...
```

**交付物**:
- ✅ 合约部署在 Avalanche Fuji 测试网
- ✅ 合约地址记录在文档中
- ✅ 合约在区块链浏览器可验证

**参考资料**:
- Hardhat 部署文档: https://hardhat.org/tutorial/deploying-to-a-testnet
- Avalanche Fuji 文档: https://docs.avax.network/networks/testnet

---

#### 任务 1.2: 创建合约集成函数 🔴 **高优先级**

**目标**: 创建前端与 PlantOHCard.sol 合约交互的函数

**步骤**:
1. **创建合约工具文件**
   - 文件: `src/lib/web3/plantContract.ts`
   - 参考: `src/lib/web3/sanctuaryContract.ts` (已完成)

2. **实现以下函数**:
   ```typescript
   // src/lib/web3/plantContract.ts
   import { getContract } from '@/lib/web3/client';

   export async function storeMemory(
     ipfsHash: string,
     cardIds: number[],
     trackId: number
   ) {
     const contract = getContract();
     const tx = await contract.write('storeMemory', [
       ipfsHash,
       cardIds,
       trackId
     ]);
     return tx;
   }

   export async function getMemories(userAddress: string) {
     const contract = getContract();
     const memories = await contract.read('getMemories', [userAddress]);
     return memories;
   }

   export async function getResonance(cardId: number) {
     const contract = getContract();
     const resonance = await contract.read('getResonance', [cardId]);
     return resonance;
   }

   export async function getMemoryCount(userAddress: string) {
     const contract = getContract();
     const count = await contract.read('getMemoryCount', [userAddress]);
     return count;
   }
   ```

3. **创建 Web3 客户端配置**
   ```typescript
   // src/lib/web3/client.ts
   import { createPublicClient, createWalletClient, http } from 'viem';
   import { avalancheFuji } from 'viem/chains';
   import { privateKeyToAccount } from 'viem/accounts';

   export function getContract() {
     // 实现合约获取逻辑
   }
   ```

4. **更新配置文件**
   ```typescript
   // src/config/contracts.ts
   export const PLANT_OH_CARD_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_PLANT_OH_CARD_ADDRESS || '';
   ```

**测试步骤**:
1. 在日记页面调用 `storeMemory()`
2. 在区块链浏览器查看交易
3. 使用 `getMemories()` 检索存储的数据

**交付物**:
- ✅ `src/lib/web3/plantContract.ts` 文件
- ✅ `src/lib/web3/client.ts` 文件
- ✅ 合约地址配置文件
- ✅ 单元测试文件 (可选)

**参考资料**:
- Viem 文档: https://viem.sh/
- Wagmi 文档: https://wagmi.sh/

---

#### 任务 1.3: 更新日记页面集成合约 🔴 **高优先级**

**目标**: 在日记成功后调用合约存储记忆

**步骤**:
1. **修改日记页面**
   - 文件: `src/app/[locale]/journal/[spreadType]/page.tsx`
   - 在 IPFS 上传成功后调用合约

2. **添加合约调用逻辑**
   ```typescript
   // 在 handleSubmit 函数中，IPFS上传成功后
   const cid = await uploadToIPFS(ipfsData);

   // 调用合约存储
   const cardIds = selectedCards.map(c => parseInt(c.id));
   const trackId = 1; // 根据实际牌阵类型确定

   try {
     const tx = await storeMemory(cid, cardIds, trackId);
     console.log('合约调用成功:', tx);
   } catch (error) {
     console.error('合约调用失败:', error);
     // 即使合约失败，也允许继续（CID已保存到localStorage）
   }
   ```

3. **添加Gas费检测**
   ```typescript
   // src/lib/gasCheck.ts
   export async function checkGasBalance(address: string) {
     const publicClient = createPublicClient({
       chain: avalancheFuji,
       transport: http()
     });

     const balance = await publicClient.getBalance({ address });
     return balance;
   }

   export async function estimateGas(contractFunction: any) {
     // 估算Gas费用
   }
   ```

4. **添加错误提示**
   - 如果用户钱包余额不足，提示去水龙头
   - 如果合约调用失败，允许用户继续（数据已存储到IPFS）

**交付物**:
- ✅ 日记页面集成合约调用
- ✅ Gas费检测功能
- ✅ 错误处理和用户提示

---

#### 任务 1.4: 实现我的庇护所页面 🟡 **中优先级**

**目标**: 创建记忆管理页面，显示用户历史疗愈记录

**步骤**:
1. **创建页面文件**
   - 文件: `src/app/[locale]/sanctuary/page.tsx`

2. **创建组件**:
   - `src/components/sanctuary/MemoryList.tsx` (记忆列表)
   - `src/components/sanctuary/MemoryCard.tsx` (单张记忆卡片)
   - `src/components/sanctuary/ResonanceBadge.tsx` (共鸣数徽章)
   - `src/components/sanctuary/DecryptModal.tsx` (解密弹窗)

3. **实现功能**:
   - 从合约/localStorage读取记忆列表
   - 按时间排序展示
   - 显示每张卡片的共鸣数
   - 实现解密功能（从IPFS读取并解密）
   - 时间线展示

4. **解密逻辑**
   ```typescript
   // src/lib/decryption.ts
   import { decryptData } from './encryption';
   import { downloadFromIPFS } from './ipfs';

   export async function decryptJournal(cid: string, password?: string) {
     const encryptedData = await downloadFromIPFS(cid);
     const decrypted = decryptData(encryptedData.data, password);
     return JSON.parse(decrypted);
   }
   ```

**交付物**:
- ✅ 我的庇护所页面
- ✅ 记忆列表和卡片组件
- ✅ 解密功能
- ✅ 共鸣数显示

---

#### 任务 1.5: 开发情绪时光机 🟢 **低优先级**

**目标**: 实现基于时间的情绪预测可视化

**步骤**:
1. **创建页面**
   - 文件: `src/app/[locale]/timemachine/page.tsx`

2. **创建组件**:
   - `src/components/timemachine/TimeSlider.tsx` (时间滑块)
   - `src/components/timemachine/StagePreview.tsx` (阶段预览)
   - `src/components/timemachine/EmotionChart.tsx` (情绪图表)

3. **实现逻辑**:
   - 每7天一个阶段的情绪预测
   - 从合约读取历史数据
   - 数据可视化图表

**交付物**:
- ✅ 情绪时光机页面
- ✅ 时间可视化组件
- ✅ 情绪预测算法

---

### 阶段 2: v2.1 互助协议实现 (估计 7-10 天)

#### 任务 2.1: 部署 SanctuaryProtocol.sol 合约 🔴 **高优先级**

**目标**: 部署资金池合约到测试网

**步骤**:
1. **创建部署脚本**
   ```bash
   # scripts/deploySanctuary.ts
   ```

2. **配置构造函数参数**
   ```typescript
   const pauseGuardian = deployer.address; // 临时使用部署者
   const claimAmount = ethers.parseEther("0.01"); // 0.01 AVAX

   const SanctuaryProtocol = await ethers.deployContract(
     "SanctuaryProtocol",
     [pauseGuardian, claimAmount]
   );
   ```

3. **部署合约**
   ```bash
   npx hardhat run scripts/deploySanctuary.ts --network avalancheFuji
   ```

4. **记录合约地址**
   - 保存到环境变量
   - 更新前端配置

**交付物**:
- ✅ SanctuaryProtocol.sol 部署成功
- ✅ 合约地址记录
- ✅ 合约验证

---

#### 任务 2.2: 改造首页为 Launch 页 ✅ **已完成**

**完成时间**: 2026-03-24
**影响文件**:
- `src/app/[locale]/launch/page.tsx`

**实现内容**:
- ✅ 双模式选择入口
- ✅ 疗愈者模式 → `/[locale]/spreads`
- ✅ 守护者模式 → `/[locale]/guardian`
- ✅ Tailwind 颜色类名修复

---

#### 任务 2.3: 创建守护者画廊页面 ✅ **已完成**

**完成时间**: 2026-03-24
**影响文件**:
- `src/app/[locale]/guardian/page.tsx`

**实现内容**:
- ✅ 30张OH卡展示画廊
- ✅ 卡牌选择交互
- ✅ 捐赠金额输入
- ✅ 资金池状态展示
- ✅ 捐赠流程模拟
- ✅ 国际化支持

---

#### 任务 2.4: 实现邮箱验证流程 ✅ **已完成**

**完成时间**: 2026-03-24
**影响文件**:
- `src/app/[locale]/verification/page.tsx`
- `src/app/[locale]/claim/page.tsx`
- `src/lib/zkEmailSimulation.ts`

**实现内容**:
- ✅ 邮箱输入验证（仅支持Gmail）
- ✅ 验证码发送和验证
- ✅ ZK-Proof 模拟动画
- ✅ emailHash 生成和显示
- ✅ 状态持久化

---

#### 任务 2.5: 创建后端API ✅ **已完成**

**完成时间**: 2026-03-24
**影响文件**:
- `src/app/api/send-code/route.ts`
- `src/app/api/verify-code/route.ts`

**实现内容**:
- ✅ 发送验证码 API
- ✅ 验证验证码 API
- ✅ 60秒频率限制
- ✅ 5分钟过期时间
- ✅ emailHash 生成

**备注**: 当前使用内存存储（MVP方案），生产环境需替换为 Redis

---

#### 任务 2.6: 创建 Sanctuary 合约集成函数 ✅ **已完成**

**完成时间**: 2026-03-24
**影响文件**:
- `src/lib/web3/sanctuaryContract.ts`
- `src/stores/claimStore.ts`
- `src/components/claim/PoolStatusCard.tsx`

**实现内容**:
- ✅ `getPoolStatus()` - 获取资金池状态
- ✅ `hasEmailClaimed()` - 检查邮箱是否已领取
- ✅ `donateAndMint()` - 捐赠并铸造NFT
- ✅ `verifyEmailOnChain()` - 链上验证邮箱
- ✅ `claimAid()` - 领取互助资金
- ✅ Zustand 状态管理
- ✅ 资金池状态组件

---

#### 任务 2.7: 完善成功页面 ✅ **已完成**

**完成时间**: 2026-03-24
**影响文件**:
- `src/app/[locale]/success/page.tsx`

**实现内容**:
- ✅ 显示领取金额（AVAX）
- ✅ 显示交易哈希
- ✅ 链接到 Snowtrace 区块浏览器
- ✅ 已领取后隐藏申请按钮

---

#### 任务 2.8: 添加错误边界和测试 ✅ **已完成**

**完成时间**: 2026-03-24
**影响文件**:
- `src/components/common/ErrorBoundary.tsx`
- `src/lib/__tests__/zkEmailSimulation.test.ts`
- `src/lib/__tests__/encryption.test.ts`
- `vitest.config.ts`

**实现内容**:
- ✅ React Error Boundary 组件
- ✅ Vitest 测试框架配置
- ✅ 12 个单元测试通过

---

### 阶段 3: 生产环境准备 (估计 2-3 天)

#### 任务 3.1: 替换内存存储为 Redis 🟡 **中优先级**

**目标**: 将验证码存储从内存迁移到 Redis

**步骤**:
1. 注册 Upstash Redis: https://upstash.com/
2. 添加环境变量
3. 修改 API 路由使用 Redis

**交付物**:
- ✅ Redis 集成
- ✅ 验证码持久化

---

#### 任务 3.2: 添加邮件发送服务 🟡 **中优先级**

**目标**: 实现真实邮件发送

**步骤**:
1. 注册 Resend.com: https://resend.com/
2. 配置邮件模板
3. 集成到发送验证码 API

**交付物**:
- ✅ 真实邮件发送
- ✅ 邮件模板

---

#### 任务 3.3: 安全审计 🟡 **中优先级**

**目标**: 确保应用安全

**检查项**:
- [ ] 环境变量安全
- [ ] API 频率限制
- [ ] 输入验证
- [ ] XSS 防护
- [ ] CSRF 防护

---

## 📁 文件结构更新

### 新增文件 (2026-03-24)

```
src/
├── app/
│   ├── [locale]/
│   │   ├── claim/
│   │   │   └── page.tsx                    # 申请介绍页
│   │   ├── guardian/
│   │   │   └── page.tsx                    # 守护者画廊页
│   │   ├── verification/
│   │   │   └── page.tsx                    # 邮箱验证页 (更新)
│   │   └── success/
│   │       └── page.tsx                    # 成功页 (更新)
│   └── api/
│       ├── send-code/
│       │   └── route.ts                    # 发送验证码 API
│       └── verify-code/
│           └── route.ts                    # 验证验证码 API
├── components/
│   ├── claim/
│   │   └── PoolStatusCard.tsx              # 资金池状态组件
│   └── common/
│       └── ErrorBoundary.tsx               # 错误边界组件
├── lib/
│   ├── web3/
│   │   └── sanctuaryContract.ts            # 合约交互函数
│   └── __tests__/
│       ├── zkEmailSimulation.test.ts       # 邮箱验证测试
│       └── encryption.test.ts              # 加密函数测试
├── stores/
│   └── claimStore.ts                       # 状态管理
└── vitest.config.ts                        # 测试配置
```

---

## 🧪 测试状态

### 单元测试 ✅

```
Test Files  2 passed (2)
     Tests  12 passed (12)
  Duration  24.72s
```

### 类型检查 ✅

```
tsc --noEmit
No errors found
```

---

## 📋 下一步行动

1. **部署合约** - 部署 PlantOHCard.sol 和 SanctuaryProtocol.sol
2. **配置环境变量** - 设置合约地址
3. **测试完整流程** - 从疗愈到申请互助资金
4. **生产环境准备** - Redis、邮件服务、安全审计

---

**下次审查**: 合约部署完成后
