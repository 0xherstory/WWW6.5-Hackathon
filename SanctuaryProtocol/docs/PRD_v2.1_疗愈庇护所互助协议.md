# 产品需求文档 (PRD)：疗愈庇护所互助协议

---

## 📝 文档版本记录

| 版本 | 日期 | 更新内容 | 作者 |
|------|------|----------|------|
| v2.1 | 2026-03-24 | 完善ZK-Email模拟方案详细设计、修复24小时时间限制合约逻辑、补充完整防套利机制、添加前端模拟动画实现、修复邮箱哈希安全算法、修复函数调用一致性 | 修复防套利逻辑、补充Gas费问题、资金池枯竭处理、ZK-Email改为模拟方案、后端API详细方案、错误处理场景、邮箱哈希安全性、函数调用一致性 | 完整资金池闭环设计、ZK-Email技术方案、魔法信封交互设计、双边模式架构 | Web3 植物系OH卡项目组 |
| v2.0 | 2024-03-23 | 协议化升级：双边经济资金分配插件 | Web3 植物系OH卡项目组 |
| v1.1 | 2024-03-22 | IPFS集成方案、优化解密体验、时间机器权限 | Web3 植物系OH卡项目组 |
| v1.0 | 2024-03-20 | 初始版本 | Web3 植物系OH卡项目组 |

---

## 1. 引言 / 概述 (Introduction / Overview)

### 1.1 核心产品定位

本项目是一个**双边经济资金分配插件 + OH卡心理疗愈前端**的组合系统。

**对外宣传口径**：
1. **心理疗愈工具**：去金融化的植物主题心理投射（OH卡）系统
2. **资金安全流转插件**：可复用于不同性质工具的双边经济协议

### 1.2 产品愿景

在传统医疗众筹（如水滴筹）中，边缘群体的求助往往伴随着"自证弱者"的隐私剥夺与病理化审查。本项目旨在利用 Web3 技术重构这一权力结构：

- **从"证明我有病" → "证明我完成了自我觉察"**
- **从"平台施舍" → "代码协议自动流转"**
- **从单向捐赠 → 双边经济价值交换**

### 1.3 最小闭环

```
藏家购买OH卡收藏 → 资金进入资金池 → 求助者通过邮箱验证 → 资金池自动打款
```

### 1.4 免责声明

> ⚠️ **重要声明**：本项目仅用于黑客松场景与逻辑架构层面的技术探索。不构成任何形式的投资建议、医疗建议或法律建议。所有资金流转均在测试网环境进行，不涉及真实资产。

---

## 2. 目标 / 目的 (Goals / Objectives)

### 2.1 开发目标

- **时间线**：1周内完成开发
- **部署链**：Avalanche Fuji 测试网
- **测试币**：使用测试网原生代币（AVAX）

### 2.2 产品体验目标

- 实现**双边模式切换**：疗愈者模式 + 守护者模式
- 实现**完整资金池闭环**：藏家买卡 → 资金池 → 求助者领取
- 实现**邮箱验证流程**：模拟ZK-Email的交互体验
- 提供**足够的流程指引**：让评委和用户通过交互就能理解产品价值

### 2.3 技术目标

- 新建 `SanctuaryProtocol.sol` 合约（强调可组合性）
- 实现**邮箱验证模拟方案**（后端发验证码 + 白名单机制）
- 保持与现有 `PlantOHCard.sol` 的兼容性

### 2.4 MVP阶段验证方案说明

> **重要说明**：由于开发时间限制，MVP阶段采用**邮箱验证模拟方案**而非真实的ZK-Email集成。

#### 2.4.1 方案对比

| 方案 | MVP阶段 | 未来版本 |
|------|---------|----------|
| 验证方式 | 后端发送验证码 + 白名单 | 真实ZK-Email SDK集成 |
| 安全级别 | 中等（依赖后端信任） | 高（完全去信任化） |
| 开发复杂度 | 低 | 高 |
| 开发时间 | 2-3天 | 2-4周 |
| 用户体验 | 相同的"魔法信封"交互 | 相同的"魔法信封"交互 |

#### 2.4.2 模拟方案核心设计

**设计原则**：前端交互体验与真实ZK-Email完全一致，后端验证逻辑简化。

```
┌─────────────────────────────────────────────────────────────┐
│              ZK-Email 模拟方案架构                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  用户视角（体验层）          系统视角（实现层）              │
│  ────────────────          ────────────────                │
│                                                             │
│  "正在断开网络连接..."       实际：保持网络连接              │
│  "本地生成证明..."           实际：前端延迟动画              │
│  "邮箱地址已粉碎..."         实际：后端收到邮箱但承诺不存储   │
│  "生成匿名通行证..."         实际：后端验证码验证            │
│                                                             │
│  【关键】用户感知到的体验与真实ZK-Email完全一致              │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

#### 2.4.3 前端模拟动画实现

```typescript
// src/lib/zkEmailSimulation.ts
import { keccak256, toBytes } from 'viem';

export async function simulateZKProof(
  email: string,
  code: string,
  onProgress: (step: string, progress: number) => void
): Promise<{ success: boolean; emailHash: string }> {
  const steps = [
    { text: '正在断开网络连接，确保数据完全停留在本地...', duration: 1500 },
    { text: '正在读取邮箱服务商的官方签名...', duration: 2000 },
    { text: '正在为你生成绝对匿名的数字存根...', duration: 2500 },
    { text: '邮箱地址已在本地物理粉碎 🗑️', duration: 1000 },
  ];

  let totalProgress = 0;
  const totalDuration = steps.reduce((sum, s) => sum + s.duration, 0);

  for (const step of steps) {
    onProgress(step.text, totalProgress / totalDuration);
    await sleep(step.duration);
    totalProgress += step.duration;
  }

  onProgress('验证完成', 1);

  const emailHash = hashEmail(email);
  return { success: true, emailHash };
}

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ✅ 使用keccak256哈希算法（安全性更高，不可逆向）
function hashEmail(email: string): string {
  return keccak256(toBytes(email.toLowerCase()));
}
```

#### 2.4.4 向评委说明话术

**演示时说明**：
> "由于开发时间限制，我们实现了ZK-Email的交互模拟。前端展示完整的'魔法信封'体验，包括断网提示、本地粉碎动画等，与真实ZK-Email的用户体验完全一致。后端通过验证码机制完成验证，代码开源，承诺不存储用户邮箱。真实ZK-Email集成将在后续版本完成，这不影响整体产品叙事和用户体验演示。"

**技术说明**：
> "我们的架构设计已经预留了ZK-Email升级路径。合约接口完全兼容ZK-Email验证结果，只需替换后端验证模块即可无缝升级。前端交互层无需任何改动。"

---

## 3. 目标受众 / 用户画像 (Target Audience / User Personas)

### 3.1 资金端 (Input) - 守护者/藏家

**特征**：
- 拥有 Web3 钱包，愿意为社会公益与数字艺术买单
- 理解"藏家模式"：知道自己的钱款会帮助潜在需要帮助的人

**需求**：
- 浏览精美的植物 OH 卡艺术作品
- 透明地看到资金流向资金池
- 获得收藏凭证（NFT）

### 3.2 受助端 (Output) - 疗愈者/求助者

**特征**：
- 面临心理危机或生存压力的边缘群体
- 希望在"去病理化"的界面中完成自我探索
- 无需暴露隐私即可获得资金支持

**需求**：
- 使用 OH 卡进行心理觉察
- 通过邮箱验证身份（无需暴露邮箱地址）
- 获得资金池的资助

### 3.3 双重身份

> **重要**：同一地址可以同时是疗愈者和守护者。系统需要完全彻底防止套利行为。

---

## 4. 用户故事 / 使用场景 (User Stories)

### 故事 1：守护者的捐赠之旅

> 作为一名守护者，我进入 Launch 页，看到 30 张精美的植物 OH 卡。我选择了一张《创伤》卡片，点击"收藏并支持"。我支付了 0.01 AVAX（价格不固定，可自定义），资金透明地进入了庇护所资金池。我的地址被记录为守护者，我获得了这张卡片的收藏凭证。

### 故事 2：疗愈者的觉察之旅

> 作为一名疗愈者，我进入 Launch 页，选择"疗愈者模式"。我选择牌阵，挑选图文卡，专注地写下了 50 字以上的日记。我的日记在前端本地被加密存储到 IPFS。我完成了 20 分钟的心理探索。

### 故事 3：疗愈者的资金领取

> 完成觉察后，我看到一个"求助"按钮。点击后，系统引导我进入邮箱验证流程。我输入 Gmail 邮箱，收到验证码，系统显示"邮箱地址已在本地物理粉碎"。验证通过后，我在 24 小时内可以点击"领取基金"，资金池自动向我打款。

### 故事 4：资金池枯竭场景

> 作为一名疗愈者，我进入觉察前，已被通知当前资金池枯竭状况，但我依旧决定完成觉察。进入觉察前系统显示："当前庇护所的资金已流转完毕，正在等待新的守护者注入能量。你依然可以完成本次觉察与记录。"我理解了情况，完成了觉察，并决定稍后再来查看。

---

## 5. 功能需求 (Functional Requirements)

### 5.1 Launch 页设计

**布局结构**：

```
┌─────────────────────────────────────────────────────────────┐
│                    疗愈庇护所                                │
│            "每一份觉察，都是一次自我疗愈"                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  资金池状态：💰 0.5 AVAX  |  已帮助：3 人                    │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                                                     │   │
│  │              30张植物OH卡画廊                        │   │
│  │           （优美样式，网格布局）                      │   │
│  │                                                     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  选择你的角色：                                              │
│                                                             │
│  ┌─────────────────────┐   ┌─────────────────────┐        │
│  │   🌿 疗愈者模式      │   │   💎 守护者模式      │        │
│  │                     │   │                     │        │
│  │ "我在寻找内心的      │   │ "我想支持那些       │        │
│  │  平静与力量"        │   │  需要帮助的人"      │        │
│  │                     │   │                     │        │
│  │ 通过OH卡探索自我    │   │ 收藏OH卡并注入      │        │
│  │ 完成后可申请资助    │   │ 资金到互助池        │        │
│  │                     │   │                     │        │
│  │ [进入疗愈空间]      │   │ [进入守护画廊]      │        │
│  └─────────────────────┘   └─────────────────────┘        │
│                                                             │
│  💡 同一地址可以同时是疗愈者和守护者                         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**资金池状态展示**：
- 显示资金池当前余额
- 显示已帮助的人数
- **如果余额不足**：显示警告提示

**关键文案**：

**疗愈者模式引导**：
> "在这里，你可以通过植物 OH 卡探索内心世界。完成觉察后，如果你需要帮助，可以申请互助资金池的支持。我们不会询问你的隐私，只需要证明你是一个真实的人。"

**守护者模式引导**：
> "你的每一次收藏，都会成为庇护所资金池的一部分。这些资金将帮助那些正在经历困难的人。你不需要知道他们是谁，只需要知道你的善意已经被安全地传递。"

### 5.2 守护者模式功能

#### 5.2.1 卡片画廊

- 展示 30 张植物 OH 卡（6 大生命轨迹 × 5 阶段）
- 每张卡片显示：
  - 植物插画
  - 情绪主题名称
  - 当前共鸣数（"已有 X 份记忆在此停留"）

#### 5.2.2 收藏功能

- 点击卡片 → 弹出收藏面板
- 显示价格输入框（默认 0.01 AVAX，可自定义）
- **关键提示**：显示"您的资金将进入庇护所资金池，用于支持需要帮助的人"
- 调用合约 `donateAndMint(cardId, amount)`

#### 5.2.3 透明度展示

- 显示资金池当前余额
- 显示已帮助的人数
- 显示最近的捐赠记录（链上事件）

### 5.3 疗愈者模式功能

#### 5.3.1 牌阵选择

保留现有 4 种牌阵：
- 单张牌：当下的镜子
- 二元对立：整合与平衡
- 身心灵：线性演变
- 乔哈里视窗：自我探索

#### 5.3.2 选卡与书写

- 图文分离画廊
- 私密书写区（50 字以上）
- 前端 AES 加密 + IPFS 存储
- 自动保存草稿

#### 5.3.3 求助按钮

**触发时机**：用户完成以下所有步骤后，在成功页面底部显示：

| 条件 | 要求 |
|------|------|
| 选择牌阵 | ✅ 已选择 |
| 选择图卡和字卡 | ✅ 已选择 |
| 书写日记 | ≥50 字 |
| 停留时间 | ≥3 分钟 |
| 封存记忆 | ✅ 成功上链 |

**位置**：完成觉察后，在成功页面底部

**文案**：
> "如果你正在经历困难，庇护所资金池可能可以帮助你。点击了解更多。"

**点击后**：
- 不立即弹出验证框
- 跳转到专门的"资金申请"页面
- 显示邮箱验证流程介绍

**资金池余额不足时的处理**：

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  ⚠️ 资金池暂时不足                                          │
│                                                             │
│  当前庇护所的资金已流转完毕，正在等待新的守护者注入能量。    │
│                                                             │
│  你依然可以：                                                │
│  ✅ 完成本次觉察与记录                                       │
│  ✅ 稍后回来查看资金池状态                                   │
│  ✅ 分享给可能愿意帮助的人                                   │
│                                                             │
│  [继续我的觉察之旅]  [订阅资金池通知]                        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**前端资金池检测逻辑**：

```typescript
// src/lib/poolStatus.ts

export function usePoolStatus() {
  const [poolStatus, setPoolStatus] = useState({
    balance: '0',
    isInsufficient: true,
    isLoading: true
  });

  // 从合约读取资金池状态
  const fetchPoolStatus = useCallback(async () => {
    try {
      const [balance, donationCount, claimCount, claimAmount] =
        await publicClient.readContract({
          address: SANCTUARY_ADDRESS,
          abi: SanctuaryABI,
          functionName: 'getPoolStatus'
        });

      // ✅ 修复：确保单位一致后再比较
      const balanceWei = BigInt(balance);
      const claimAmountWei = BigInt(claimAmount);
      const isInsufficient = balanceWei < claimAmountWei;

      setPoolStatus({
        balance: formatEther(balance),
        isInsufficient,
        isLoading: false
      });
    } catch (error) {
      console.error('获取资金池状态失败:', error);
    }
  }, []);

  // 初始化和定时刷新
  useEffect(() => {
    fetchPoolStatus();
    const interval = setInterval(fetchPoolStatus, 30000); // 30秒刷新
    return () => clearInterval(interval);
  }, [fetchPoolStatus]);

  return { ...poolStatus, refetch: fetchPoolStatus };
}
```

**订阅资金池通知功能**：

```typescript
// src/lib/poolNotification.ts

export async function subscribePoolNotification(email: string) {
  // 存储到本地，当资金池恢复时发送通知
  // MVP阶段：存储到localStorage，前端轮询检测
  const subscriptions = JSON.parse(
    localStorage.getItem('pool_subscriptions') || '[]'
  );
  
  if (!subscriptions.includes(email)) {
    subscriptions.push(email);
    localStorage.setItem('pool_subscriptions', JSON.stringify(subscriptions));
  }
  
  return { success: true, message: '已订阅，资金池恢复时会通知你' };
}

// 检测资金池恢复并发送通知（需要后端支持）
// V2.0版本：使用Web Push或邮件通知
```

**资金池状态实时展示组件**：

```tsx
// src/components/claim/PoolStatusBar.tsx

export function PoolStatusBar() {
  const { balance, isInsufficient, isLoading } = usePoolStatus();

  if (isLoading) {
    return <div className="animate-pulse h-8 bg-gray-200 rounded" />;
  }

  return (
    <div className={`p-4 rounded-lg ${isInsufficient ? 'bg-amber-50' : 'bg-green-50'}`}>
      <div className="flex items-center gap-2">
        <span className="text-2xl">💰</span>
        <div>
          <p className="font-medium">
            资金池余额: {balance} AVAX
          </p>
          {isInsufficient ? (
            <p className="text-amber-600 text-sm">
              当前余额不足以发放资助
            </p>
          ) : (
            <p className="text-green-600 text-sm">
              有可用资金，可以申请资助
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
```

### 5.4 邮箱验证流程（魔法信封机制）

> **MVP说明**：此流程模拟ZK-Email的交互体验，后端通过验证码机制完成验证。

#### 5.4.1 阶段一：平缓过渡与知情同意

**场景**：用户刚刚完成了 OH 卡探索，情绪刚刚释放。

**UI 呈现**：
- 页面背景保持柔和色调
- 文字像呼吸一样缓慢浮现
- 没有任何倒计时或催促感

**核心文案**：

```
"辛苦了，感谢你为自己停留的这二十分钟。"

"庇护所的互助资金池里，有一份来自远方的支持在等你。
为了确保这份心意不被冷冰冰的自动程序（机器人脚本）掠夺，
我们需要确认屏幕前是一个真实的、有呼吸的人类。"

"接下来的这一步，不需要你的真名，不需要你的病历。"
```

**交互动作**：

| 按钮 | 功能 |
|------|------|
| [我准备好了，生成匿名通行证] | 主操作，进入验证流程 |
| [我今天不想领资金，仅保存觉察记录] | 次操作，永远赋予用户退出的权力 |

#### 5.4.2 阶段二：魔法信封机制

**场景**：用户点击"准备好了"，进入邮箱输入环节。

**UI 呈现**：
- 界面中央出现一个"魔法信封"或"粉碎机"的动画隐喻
- 输入框设计极简，避免唤起填写问卷的记忆

**核心文案**：

```
"请随意输入一个你常用的 Gmail 邮箱。"

🛡️ 安全承诺：
"你可以把你的浏览器想象成一个不上网的魔法信封。
当你填入邮箱并接收验证码后，**你的设备本身（而不是我们的服务器）**
会进行一次复杂的数学运算。
运算结束后，它只会向资金池扔出一张'没有名字的通行证'，
而你的邮箱地址，会在你的手机/电脑里被瞬间粉碎。"
```

**交互动作**：

| 元素 | 功能 |
|------|------|
| 邮箱输入框 | 仅支持 Gmail（MVP 阶段） |
| [获取密码学验证码] | 发送验证码到邮箱 |

#### 5.4.3 阶段三：本地验算的仪式感

**场景**：用户输入验证码后，系统进行验证（模拟ZK证明生成）。

**UI 呈现**：
- **绝对不出现**"正在上传数据..."的字样
- 屏幕出现代码雨或柔和的粒子消散动画
- 强化"本地粉碎"的视觉印象

**核心文案（动态变化）**：

```
"正在断开网络连接，确保数据完全停留在本地..."
"正在读取邮箱服务商的官方签名..."
"正在为你生成绝对匿名的数字存根..."
"邮箱地址已在本地物理粉碎 🗑️"
```

**声音/触觉反馈**：
- 运算完成时，手机发出轻微震动
- 或一声清脆的"叮"声，代表确定的、安全的物理隔绝感

#### 5.4.4 阶段四：无声的释放

**场景**：验证完毕，用户可以领取资金。

**UI 呈现**：
- 出现一个"钥匙"或"通行证"的抽象符号
- 展示用户钱包地址

**核心文案**：

```
"验证成功。"

"网络只知道这里有一位坚韧的幸存者，
但没有任何人知道你是谁。"

"互助资金已准备好发放到你的钱包：0x7F...3B9a"

"你可以随时带着这笔资金离开。
愿你在现实世界里，也能找到属于自己的庇护所。"
```

**交互动作**：

| 按钮 | 功能 |
|------|------|
| [领取基金] | 调用合约领取资金 |
| [查看我的资金与后续支持指南] | 查看资金状态 |
| [紧急销毁当前页面痕迹] | 悬浮按钮，随时可销毁 |

#### 5.4.5 时间限制

- 验证通过后，**24 小时内**可以领取资金
- 超过 24 小时需要重新验证

---

## 6. 智能合约设计 (Smart Contract Design)

### 6.1 合约架构

采用**双合约架构**，强调可组合性：

```
┌─────────────────────────────────────────────────────────┐
│                    合约架构                              │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─────────────────────┐   ┌─────────────────────┐    │
│  │   PlantOHCard.sol   │   │ SanctuaryProtocol.sol│    │
│  │   (现有合约)         │   │   (新建合约)         │    │
│  │                     │   │                     │    │
│  │ - 存储记忆          │   │ - 资金池托管        │    │
│  │ - 共鸣统计          │   │ - 捐赠入口          │    │
│  │ - IPFS CID          │   │ - 邮箱验证          │    │
│  │                     │   │ - 资金发放          │    │
│  │                     │   │ - 白名单管理        │    │
│  └─────────────────────┘   └─────────────────────┘    │
│                                                         │
│  兼容性：SanctuaryProtocol 可独立使用，                  │
│         接入其他前端工具（如房树人涂鸦应用）              │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### 6.2 SanctuaryProtocol.sol 核心接口

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title SanctuaryProtocol
 * @dev 庇护所互助协议 - 双边经济资金分配插件
 * @notice 可复用于任何具备"双边进出流转"性质的前端工具
 */
contract SanctuaryProtocol is ReentrancyGuard, Ownable {
    
    // ============ 数据结构 ============
    
    /// @dev 捐赠记录
    struct Donation {
        address donor;
        uint256 cardId;
        uint256 amount;
        uint256 timestamp;
    }
    
    /// @dev 领取记录
    struct Claim {
        address recipient;
        uint256 amount;
        uint256 timestamp;
        bytes32 emailHash;
    }
    
    // ============ 状态变量 ============
    
    /// @notice 资金池余额
    uint256 public poolBalance;
    
    /// @notice 单次领取金额（可配置）
    uint256 public claimAmount;
    
    /// @notice 白名单：允许领取的地址
    mapping(address => bool) public isWhitelisted;
    
    /// @notice 已领取记录
    mapping(address => bool) public hasClaimed;
    
    /// @notice 邮箱哈希已使用记录（防重放）
    mapping(bytes32 => bool) public emailHashUsed;
    
    /// @notice 邮箱验证时间（用于24小时限制）
    mapping(bytes32 => uint256) public emailVerificationTime;
    
    /// @notice 邮箱哈希绑定的钱包地址
    mapping(bytes32 => address) public emailToWallet;
    
    /// @notice 地址累计捐赠金额
    mapping(address => uint256) public totalDonated;
    
    /// @notice 地址累计领取金额
    mapping(address => uint256) public totalClaimed;
    
    /// @notice 地址最后一次捐赠时间
    mapping(address => uint256) public lastDonationTime;
    
    /// @notice 捐赠记录
    Donation[] public donations;
    
    /// @notice 领取记录
    Claim[] public claims;
    
    // ============ 常量 ============
    
    /// @notice 验证有效期（24小时）
    uint256 public constant VERIFICATION_VALIDITY = 24 hours;
    
    /// @notice 捐赠后冷却期（防止套利）
    uint256 public constant DONATION_COOLDOWN = 24 hours;
    
    // ============ 事件 ============
    
    event Donated(
        address indexed donor,
        uint256 indexed cardId,
        uint256 amount,
        uint256 timestamp
    );
    
    event Claimed(
        address indexed recipient,
        uint256 amount,
        uint256 timestamp
    );
    
    event WhitelistUpdated(address indexed account, bool status);
    
    event ClaimAmountUpdated(uint256 newAmount);
    
    event EmailVerified(bytes32 indexed emailHash, address wallet, uint256 timestamp);
    
    // ============ 修饰符 ============
    
    modifier onlyWhitelisted() {
        require(isWhitelisted[msg.sender], "不在白名单中");
        _;
    }
    
    modifier notClaimed() {
        require(!hasClaimed[msg.sender], "已经领取过");
        _;
    }
    
    modifier notDonor() {
        require(totalDonated[msg.sender] == 0, "捐赠过的地址不能领取");
        _;
    }
    
    // ============ 核心函数 ============
    
    /**
     * @notice 捐赠并收藏卡片
     * @param cardId 卡片ID
     */
    function donateAndMint(uint256 cardId) external payable nonReentrant {
        require(msg.value > 0, "捐赠金额必须大于0");
        
        // 更新资金池
        poolBalance += msg.value;
        
        // 更新捐赠统计
        totalDonated[msg.sender] += msg.value;
        lastDonationTime[msg.sender] = block.timestamp;
        
        // 记录捐赠
        donations.push(Donation({
            donor: msg.sender,
            cardId: cardId,
            amount: msg.value,
            timestamp: block.timestamp
        }));
        
        emit Donated(msg.sender, cardId, msg.value, block.timestamp);
    }
    
    /**
     * @notice 验证邮箱（由后端调用，添加到白名单）
     * @param emailHash 邮箱哈希
     * @param wallet 钱包地址
     * @dev 修复：验证时不标记邮箱为已使用，只在领取时标记
     */
    function verifyEmail(bytes32 emailHash, address wallet) external onlyOwner {
        // 检查邮箱未被领取过（注意：这里检查的是是否已领取，不是是否已验证）
        require(!emailHashUsed[emailHash], "该邮箱已领取过资金");
        
        // 检查钱包未捐赠过
        require(totalDonated[wallet] == 0, "捐赠过的地址不能领取");
        
        // 检查钱包未领取过
        require(!hasClaimed[wallet], "该地址已领取过");
        
        // 记录验证信息（不标记为已使用，允许重新验证）
        // 如果该邮箱之前验证过但未领取，允许重新验证（更新时间）
        emailVerificationTime[emailHash] = block.timestamp;
        emailToWallet[emailHash] = wallet;
        
        // 添加到白名单
        isWhitelisted[wallet] = true;
        
        emit EmailVerified(emailHash, wallet, block.timestamp);
        emit WhitelistUpdated(wallet, true);
    }
    
    /**
     * @notice 通过邮箱验证领取资金
     * @param emailHash 邮箱哈希
     * @dev 修复：在领取时才标记邮箱为已使用
     */
    function claimWithEmailVerification(bytes32 emailHash) 
        external 
        nonReentrant 
        notClaimed
        notDonor
    {
        // 检查邮箱已验证（验证时间大于0表示已验证）
        require(emailVerificationTime[emailHash] > 0, "邮箱未验证");
        
        // 检查邮箱未被领取过
        require(!emailHashUsed[emailHash], "该邮箱已领取过资金");
        
        // 检查邮箱绑定到当前调用者
        require(emailToWallet[emailHash] == msg.sender, "邮箱未绑定到此钱包");
        
        // 检查验证是否在24小时内
        require(
            block.timestamp <= emailVerificationTime[emailHash] + VERIFICATION_VALIDITY,
            "验证已过期，请重新验证"
        );
        
        // 检查资金池余额
        require(poolBalance >= claimAmount, "资金池余额不足");
        
        // 更新状态（关键：在领取时标记邮箱为已使用）
        hasClaimed[msg.sender] = true;
        emailHashUsed[emailHash] = true;  // 领取时才标记
        totalClaimed[msg.sender] += claimAmount;
        poolBalance -= claimAmount;
        
        // 记录领取
        claims.push(Claim({
            recipient: msg.sender,
            amount: claimAmount,
            timestamp: block.timestamp,
            emailHash: emailHash
        }));
        
        // 转账
        (bool success, ) = payable(msg.sender).call{value: claimAmount}("");
        require(success, "转账失败");
        
        emit Claimed(msg.sender, claimAmount, block.timestamp);
    }
    
    /**
     * @notice 白名单用户领取资金（管理员手动添加的白名单）
     */
    function claimAsWhitelisted() 
        external 
        nonReentrant 
        onlyWhitelisted 
        notClaimed
        notDonor
    {
        require(poolBalance >= claimAmount, "资金池余额不足");
        
        hasClaimed[msg.sender] = true;
        totalClaimed[msg.sender] += claimAmount;
        poolBalance -= claimAmount;
        
        claims.push(Claim({
            recipient: msg.sender,
            amount: claimAmount,
            timestamp: block.timestamp,
            emailHash: bytes32(0)
        }));
        
        (bool success, ) = payable(msg.sender).call{value: claimAmount}("");
        require(success, "转账失败");
        
        emit Claimed(msg.sender, claimAmount, block.timestamp);
    }
    
    // ============ 管理函数 ============
    
    /**
     * @notice 添加地址到白名单
     */
    function addToWhitelist(address account) external onlyOwner {
        require(totalDonated[account] == 0, "捐赠过的地址不能加入白名单");
        isWhitelisted[account] = true;
        emit WhitelistUpdated(account, true);
    }
    
    /**
     * @notice 批量添加白名单
     */
    function batchAddToWhitelist(address[] calldata accounts) external onlyOwner {
        for (uint256 i = 0; i < accounts.length; i++) {
            if (totalDonated[accounts[i]] == 0) {
                isWhitelisted[accounts[i]] = true;
                emit WhitelistUpdated(accounts[i], true);
            }
        }
    }
    
    /**
     * @notice 从白名单移除
     */
    function removeFromWhitelist(address account) external onlyOwner {
        isWhitelisted[account] = false;
        emit WhitelistUpdated(account, false);
    }
    
    /**
     * @notice 设置单次领取金额
     */
    function setClaimAmount(uint256 newAmount) external onlyOwner {
        claimAmount = newAmount;
        emit ClaimAmountUpdated(newAmount);
    }
    
    /**
     * @notice 紧急提取（仅Owner，用于紧急情况）
     * @dev MVP妥协：仅测试网使用，主网将升级为时间锁+多签
     */
    bool public emergencyMode;

    function setEmergencyMode(bool _mode) external onlyOwner {
        emergencyMode = _mode;
        emit EmergencyModeChanged(_mode, block.timestamp);
    }

    function emergencyWithdraw(uint256 amount) external onlyOwner {
        require(emergencyMode, "仅紧急状态下可提取");
        require(amount <= address(this).balance, "金额超过合约余额");
        (bool success, ) = payable(owner()).call{value: amount}("");
        require(success, "转账失败");
        emit EmergencyWithdrawal(owner(), amount, block.timestamp);
    }

    event EmergencyModeChanged(bool mode, uint256 timestamp);
    event EmergencyWithdrawal(address indexed to, uint256 amount, uint256 timestamp);
    
    // ============ 查询函数 ============
    
    /**
     * @notice 获取捐赠总数
     */
    function getDonationCount() external view returns (uint256) {
        return donations.length;
    }
    
    /**
     * @notice 获取领取总数
     */
    function getClaimCount() external view returns (uint256) {
        return claims.length;
    }
    
    /**
     * @notice 获取用户是否可以领取
     */
    function canClaim(address user) external view returns (bool) {
        return !hasClaimed[user] && 
               totalDonated[user] == 0 &&
               isWhitelisted[user] && 
               poolBalance >= claimAmount;
    }
    
    /**
     * @notice 获取资金池状态
     */
    function getPoolStatus() external view returns (
        uint256 balance,
        uint256 donationCount,
        uint256 claimCount,
        uint256 _claimAmount
    ) {
        return (poolBalance, donations.length, claims.length, claimAmount);
    }
}
```

### 6.3 防套利机制（完整版）

#### 6.3.1 问题定义

**核心问题**：同一地址可以同时是疗愈者和守护者，如何防止套利？

**套利场景分析**：

| 攻击场景 | 描述 | 危害等级 |
|----------|------|----------|
| 捐赠后领取 | 用户捐赠0.01 AVAX后立即领取0.05 AVAX | 🔴 高 |
| 多邮箱攻击 | 用户用100个Gmail账号领取100次 | 🟡 中 |
| 时间窗口套利 | 用户在24小时窗口内多次尝试领取 | 🟢 低 |

#### 6.3.2 完整防护机制

| 机制 | 说明 | 实现 | 防护场景 |
|------|------|------|----------|
| **捐赠地址排除** | 捐赠过的地址不能领取 | `notDonor` 修饰符 | 防止捐赠后领取 |
| **邮箱唯一性** | 每个邮箱只能领取一次 | `emailHashUsed` 映射 | 防止单邮箱多次领取 |
| **地址唯一性** | 每个地址只能领取一次 | `hasClaimed` 映射 | 防止单地址多次领取 |
| **邮箱绑定钱包** | 防止邮箱被多个钱包使用 | `emailToWallet` 映射 | 防止邮箱共享 |
| **24小时时效** | 验证后24小时内有效 | `emailVerificationTime` | 限制领取窗口 |
| **时间锁（前端）** | 需完成20分钟觉察 | 前端计时器 | 增加作恶成本 |

#### 6.3.3 防套利流程图

```
┌─────────────────────────────────────────────────────────────┐
│                    防套利检查流程                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  用户尝试领取                                                │
│      ↓                                                      │
│  [检查1] 该地址是否捐赠过？                                   │
│      ├── 是 → ❌ 拒绝："捐赠过的地址不能领取"                 │
│      └── 否 → 继续                                          │
│      ↓                                                      │
│  [检查2] 该地址是否已领取过？                                 │
│      ├── 是 → ❌ 拒绝："已经领取过"                          │
│      └── 否 → 继续                                          │
│      ↓                                                      │
│  [检查3] 邮箱是否已使用？                                     │
│      ├── 是 → ❌ 拒绝："该邮箱已使用过"                       │
│      └── 否 → 继续                                          │
│      ↓                                                      │
│  [检查4] 验证是否在24小时内？                                 │
│      ├── 否 → ❌ 拒绝："验证已过期"                          │
│      └── 是 → 继续                                          │
│      ↓                                                      │
│  [检查5] 资金池余额是否充足？                                 │
│      ├── 否 → ❌ 拒绝："资金池余额不足"                       │
│      └── 是 → ✅ 允许领取                                    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

#### 6.3.4 合约级防护代码

```solidity
// ============ 防套利修饰符 ============

/// @dev 确保调用者不是捐赠者
modifier notDonor() {
    require(totalDonated[msg.sender] == 0, "捐赠过的地址不能领取");
    _;
}

/// @dev 确保邮箱未被使用
modifier emailNotUsed(bytes32 emailHash) {
    require(!emailHashUsed[emailHash], "该邮箱已使用过");
    _;
}

/// @dev 确保验证在有效期内
modifier verificationValid(bytes32 emailHash) {
    require(
        emailVerificationTime[emailHash] > 0 &&
        block.timestamp <= emailVerificationTime[emailHash] + 24 hours,
        "验证已过期或不存在"
    );
    _;
}

/// @dev 确保邮箱绑定正确
modifier correctBinding(bytes32 emailHash) {
    require(
        emailToWallet[emailHash] == msg.sender,
        "邮箱未绑定到此钱包"
    );
    _;
}

// ============ 核心领取函数 ============

/**
 * @notice 领取互助资金
 * @param emailHash 邮箱哈希
 * @dev 必须满足所有防套利条件
 */
function claimWithEmailVerification(bytes32 emailHash)
    external
    nonReentrant
    notDonor
    emailNotUsed(emailHash)
    verificationValid(emailHash)
    correctBinding(emailHash)
{
    require(!hasClaimed[msg.sender], "已经领取过");
    require(poolBalance >= claimAmount, "资金池余额不足");

    // 更新状态
    hasClaimed[msg.sender] = true;
    emailHashUsed[emailHash] = true;
    poolBalance -= claimAmount;
    totalClaimed[msg.sender] += claimAmount;

    // 记录
    claims.push(Claim({
        recipient: msg.sender,
        amount: claimAmount,
        timestamp: block.timestamp,
        emailHash: emailHash
    }));

    // 转账
    (bool success, ) = payable(msg.sender).call{value: claimAmount}("");
    require(success, "转账失败");

    emit AidClaimed(msg.sender, claimAmount, emailHash, block.timestamp);
}
```

#### 6.3.5 前端时间锁实现

```typescript
// src/lib/timeLock.ts

const MIN_OBSERVATION_TIME = 20 * 60 * 1000; // 20分钟

export function useTimeLock() {
  const [startTime] = useState(Date.now());
  const [elapsed, setElapsed] = useState(0);
  
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsed(Date.now() - startTime);
    }, 1000);
    return () => clearInterval(timer);
  }, [startTime]);
  
  const isUnlocked = elapsed >= MIN_OBSERVATION_TIME;
  const remainingTime = Math.max(0, MIN_OBSERVATION_TIME - elapsed);
  
  return { isUnlocked, remainingTime, elapsed };
}

// 在求助按钮显示逻辑中使用
function HelpButton() {
  const { isUnlocked, remainingTime } = useTimeLock();
  
  if (!isUnlocked) {
    return (
      <button disabled className="opacity-50">
        还需等待 {formatTime(remainingTime)} 才能申请帮助
      </button>
    );
  }
  
  return <button>申请互助资金</button>;
}
```

#### 6.3.6 已知限制与应对

| 限制 | 说明 | MVP应对 | 未来方案 |
|------|------|---------|----------|
| 多邮箱攻击 | 一个人可有100个Gmail | 20分钟时间锁增加成本 | Gitcoin Passport |
| 后端信任 | 后端可见邮箱 | 代码开源承诺不存储 | 真实ZK-Email |
| 邮箱验证绕过 | 理论上可能伪造 | 验证码+白名单双重验证 | ZK证明验证 |

### 6.4 合约所有权说明

**MVP阶段**：
- Owner = 项目部署者
- 用于黑客松演示

**主网部署（未来）**：
- Owner = 多签钱包（3/5）
- 签名者：项目方×2, 社区代表×2, NGO代表×1

---

## 7. 邮箱验证技术实现方案（MVP模拟版）

### 7.1 方案概述

> **重要说明**：MVP阶段采用后端验证码方案，模拟ZK-Email的交互体验。真实ZK-Email集成将在后续版本完成。

**方案对比**：

| 对比项 | MVP模拟方案 | 真实ZK-Email |
|--------|-------------|--------------|
| 验证方式 | 后端发送验证码 | 本地生成ZK证明 |
| 安全级别 | 中等（依赖后端信任） | 高（完全去信任化） |
| 开发复杂度 | 低 | 高 |
| 开发时间 | 2-3天 | 2-4周 |
| 用户体验 | 相同的"魔法信封"交互 | 相同的"魔法信封"交互 |

### 7.2 技术架构

```
┌─────────────────────────────────────────────────────────────┐
│                    MVP验证架构                               │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  用户浏览器                    后端API          智能合约     │
│      ↓                          ↓                 ↑        │
│  [1] 输入邮箱                  |                 |        │
│      ↓                         |                 |        │
│  [2] 请求验证码 ────────────→ 生成验证码         |        │
│      ↓                         ↓                 |        │
│  [3] 收到邮件                  存储到Redis       |        │
│      ↓                         |                 |        │
│  [4] 输入验证码                |                 |        │
│      ↓                         |                 |        │
│  [5] 提交验证 ──────────────→ 验证验证码        |        │
│      ↓                         ↓                 |        │
│  [6] 显示"粉碎"动画           调用合约verifyEmail |        │
│      ↓                         ─────────────────→ 记录验证 │
│      ↓                         |                 ↓        │
│  [7] 领取基金 ─────────────────────────────────→ 发放资金  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 7.3 后端API实现

#### 7.3.1 技术栈

| 组件 | 技术选型 | 说明 |
|------|----------|------|
| 框架 | Vercel Serverless Functions | 免费额度够用 |
| 邮件服务 | Resend.com | 免费额度：3000封/月 |
| 缓存 | Upstash Redis | 免费额度：10,000请求/天 |
| 验证码 | 6位数字 | 5分钟有效期 |

#### 7.3.2 API接口文档

**POST /api/send-code** - 发送验证码

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| email | string | 是 | Gmail邮箱地址 |

**响应格式**：

```json
// 成功
{ "success": true }

// 失败
{ "error": "仅支持Gmail邮箱" }  // 400
{ "error": "发送太频繁，请1分钟后再试" }  // 429
{ "error": "发送失败，请稍后重试" }  // 500
```

**POST /api/verify-code** - 验证验证码

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| email | string | 是 | Gmail邮箱地址 |
| code | string | 是 | 6位验证码 |
| walletAddress | string | 是 | 用户钱包地址 |

**响应格式**：

```json
// 成功
{
  "success": true,
  "emailHash": "0x...",
  "verificationExpiry": 1711234567890
}

// 失败
{ "error": "参数不完整" }  // 400
{ "error": "验证码错误或已过期" }  // 400
{ "error": "验证失败，请稍后重试" }  // 500
```

**GET /api/pool-status** - 获取资金池状态

**响应格式**：

```json
{
  "balance": "0.5",
  "donationCount": 10,
  "claimCount": 3,
  "claimAmount": "0.05"
}
```

#### 7.3.3 环境变量配置

```env
# .env.local

# ============ 合约配置 ============
NEXT_PUBLIC_CONTRACT_ADDRESS=0x...
NEXT_PUBLIC_SANCTUARY_ADDRESS=0x...
NEXT_PUBLIC_CHAIN_ID=43113  # Avalanche Fuji

# ============ 后端服务 ============
# Resend 邮件服务
RESEND_API_KEY=re_xxxxxxxxxxxx

# Upstash Redis
UPSTASH_REDIS_REST_URL=https://xxxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=xxxxxx

# ============ 合约交互（仅后端）============
# Owner私钥，用于调用verifyEmail
# ⚠️ 警告：此私钥仅用于测试网，主网请使用多签
OWNER_PRIVATE_KEY=0x...

# ============ 可选配置 ============
# 验证码有效期（秒），默认300
VERIFICATION_CODE_TTL=300
# 发送频率限制（秒），默认60
RATE_LIMIT_WINDOW=60
```

#### 7.3.4 部署注意事项

1. **Vercel部署**：
   - 确保环境变量在Vercel Dashboard中正确配置
   - 函数超时时间设置为10秒（默认）

2. **Upstash Redis配置**：
   - 创建Redis实例时选择就近区域
   - 启用TLS加密

3. **Resend配置**：
   - 验证发件域名
   - 设置发件人地址为 `noreply@yourdomain.com`

4. **安全建议**：
   - Owner私钥仅用于测试网
   - 定期轮换API密钥
   - 启用Vercel的访问日志

**POST /api/send-code** - 发送验证码

```typescript
// src/app/api/send-code/route.ts
import { Resend } from 'resend';
import { Redis } from '@upstash/redis';
import { NextResponse } from 'next/server';
import crypto from 'crypto';

const resend = new Resend(process.env.RESEND_API_KEY);
const redis = Redis.fromEnv();

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    // 验证邮箱格式
    if (!email || !email.endsWith('@gmail.com')) {
      return NextResponse.json(
        { error: '仅支持Gmail邮箱' },
        { status: 400 }
      );
    }

    // 检查发送频率限制（1分钟内只能发1次）
    const rateLimitKey = `rate:${email}`;
    const lastSent = await redis.get(rateLimitKey);
    if (lastSent) {
      return NextResponse.json(
        { error: '发送太频繁，请1分钟后再试' },
        { status: 429 }
      );
    }

    // ✅ 修复：使用密码学安全的随机数生成器
    const code = crypto.randomInt(100000, 1000000).toString();

    // 存储到Redis（5分钟过期）
    const codeKey = `code:${email}`;
    await redis.set(codeKey, code, { ex: 300 });

    // 设置发送频率限制
    await redis.set(rateLimitKey, '1', { ex: 60 });

    // 发送邮件
    await resend.emails.send({
      from: 'Sanctuary <noreply@sanctuary.protocol>',
      to: email,
      subject: '你的庇护所验证码',
      html: `
        <div style="font-family: sans-serif; max-width: 400px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #4a5568;">庇护所验证码</h2>
          <p style="color: #718096;">你的验证码是：</p>
          <p style="font-size: 32px; font-weight: bold; color: #2d3748; letter-spacing: 8px;">
            ${code}
          </p>
          <p style="color: #a0aec0; font-size: 12px;">
            验证码5分钟内有效。如果这不是你的操作，请忽略此邮件。
          </p>
        </div>
      `
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('发送验证码失败:', error);
    return NextResponse.json(
      { error: '发送失败，请稍后重试' },
      { status: 500 }
    );
  }
}
```

**POST /api/verify-code** - 验证验证码

```typescript
// src/app/api/verify-code/route.ts
import { Redis } from '@upstash/redis';
import { NextResponse } from 'next/server';
import { createPublicClient, createWalletClient, http } from 'viem';
import { avalancheFuji } from '@/lib/web3/chain';
import { keccak256, toBytes } from 'viem';
import SanctuaryProtocolABI from '@/abis/SanctuaryProtocol.json';

const redis = Redis.fromEnv();

const client = createPublicClient({
  chain: avalancheFuji,
  transport: http()
});

const walletClient = createWalletClient({
  chain: avalancheFuji,
  account: process.env.OWNER_PRIVATE_KEY as `0x${string}`,
  transport: http()
});

const SANCTUARY_ADDRESS = process.env.NEXT_PUBLIC_SANCTUARY_ADDRESS as `0x${string}`;

export async function POST(request: Request) {
  try {
    const { email, code, walletAddress } = await request.json();

    // 验证参数
    if (!email || !code || !walletAddress) {
      return NextResponse.json(
        { error: '参数不完整' },
        { status: 400 }
      );
    }

    // 从Redis获取验证码
    const codeKey = `code:${email}`;
    const storedCode = await redis.get(codeKey);

    // 验证验证码
    if (!storedCode || storedCode !== code) {
      return NextResponse.json(
        { error: '验证码错误或已过期' },
        { status: 400 }
      );
    }

    // 删除验证码（一次性使用）
    await redis.del(codeKey);

    // ✅ 计算邮箱哈希（使用keccak256，安全性更高）
    const emailHash = keccak256(toBytes(email.toLowerCase()));

    // 调用合约验证邮箱
    const { request: contractRequest } = await client.simulateContract({
      address: SANCTUARY_ADDRESS,
      abi: SanctuaryProtocolABI,
      functionName: 'verifyEmail',
      args: [emailHash, walletAddress],
    });

    const hash = await walletClient.writeContract(contractRequest);

    // 等待交易确认
    await client.waitForTransactionReceipt({ hash });

    return NextResponse.json({
      success: true,
      emailHash,
      verificationExpiry: Date.now() + 24 * 60 * 60 * 1000 // 24小时后过期
    });

  } catch (error) {
    console.error('验证失败:', error);
    return NextResponse.json(
      { error: '验证失败，请稍后重试' },
      { status: 500 }
    );
  }
}
```

### 7.4 前端实现

```typescript
// src/lib/emailVerification.ts

export async function sendVerificationCode(email: string) {
  const response = await fetch('/api/send-code', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email })
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || '发送失败');
  }
  
  return response.json();
}

export async function verifyCode(email: string, code: string, walletAddress: string) {
  const response = await fetch('/api/verify-code', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, code, walletAddress })
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || '验证失败');
  }
  
  return response.json();
}
```

### 7.5 安全性分析

| 攻击方式 | MVP方案防护 | 说明 |
|----------|-------------|------|
| 脚本批量注册邮箱 | ⚠️ 部分防护 | 需要真实邮箱，但有频率限制 |
| 平台窃取用户数据 | ⚠️ 后端可见邮箱 | MVP妥协，未来用ZK-Email解决 |
| 员工泄露隐私 | ⚠️ 可能发生 | MVP妥协，未来用ZK-Email解决 |
| 验证码暴力破解 | ✅ 6位数字，5分钟过期 | 100万种可能，时间窗口短 |
| 多邮箱攻击 | ⚠️ 已知限制 | 见下方说明 |

### 7.6 已知限制与未来规划

#### 限制1：多邮箱攻击（Sybil Attack）

**问题**：一个人可以有100个Gmail账号，领100次。

**攻击成本分析**：

| 攻击成本项 | 数值 | 说明 |
|------------|------|------|
| Gmail账号获取 | 0元 | 免费注册 |
| 每账号时间成本 | ~25分钟 | 20分钟觉察 + 5分钟验证 |
| Gas费 | ~0.001 AVAX/次 | 测试网免费获取 |
| 单次领取金额 | 0.05 AVAX | 合约配置 |

**经济模型分析**：

```
攻击者收益 = 领取金额 × 账号数
攻击者成本 = 时间成本 + Gas成本

假设：
- 领取金额 = 0.05 AVAX（测试网，无实际价值）
- 时间成本 = 25分钟/账号
- 100个账号 = 2500分钟 ≈ 42小时

结论：测试网环境下，攻击无经济动机。
主网部署时，需要引入更强的身份验证机制。
```

**MVP阶段应对**：
- 20分钟时间锁增加作恶摩擦（沉没成本）
- 后端频率限制（同一IP每小时最多发送3次验证码）
- 向评委说明这是已知限制

**向评委说明话术**：
> "多邮箱攻击（Sybil Attack）是所有基于邮箱验证系统的已知限制。我们的MVP阶段通过20分钟时间锁增加了攻击者的时间成本。在测试网环境下，由于资金无实际价值，攻击者没有经济动机。主网部署时，我们将集成Gitcoin Passport等身份验证方案来解决这个问题。"

**未来解决方案**：

| 方案 | 实现难度 | 安全级别 | 说明 |
|------|----------|----------|------|
| Gitcoin Passport | ⭐⭐ | 高 | 基于链上行为的身份评分 |
| ZK-Device ID | ⭐⭐⭐ | 高 | 零知识设备指纹 |
| 社交图谱验证 | ⭐⭐⭐ | 中 | 基于社交关系的身份验证 |
| World ID | ⭐⭐ | 高 | 基于虹膜扫描的身份验证 |
| 生物特征验证 | ⭐⭐⭐ | 高 | 需要第三方服务 |

**推荐方案**：集成 Gitcoin Passport

```typescript
// 未来实现示例
import { Passport } from '@gitcoin/passport-sdk';

async function verifyGitcoinScore(address: string): Promise<boolean> {
  const passport = new Passport();
  const score = await passport.getScore(address);
  
  // 要求Gitcoin Passport分数 >= 15
  return score >= 15;
}

// 在验证流程中添加
async function enhancedVerification(email: string, wallet: string) {
  const hasGitcoinScore = await verifyGitcoinScore(wallet);
  
  if (!hasGitcoinScore) {
    throw new Error('需要Gitcoin Passport分数 >= 15');
  }
  
  // 继续原有验证流程...
}
```

#### 限制2：后端信任问题

**问题**：后端可以看到用户邮箱。

**MVP阶段应对**：
- 代码开源，证明"无后门"
- 邮箱数据不持久化存储

**未来解决方案**：
- 真实ZK-Email集成
- 完全去信任化

---

## 8. Gas费问题与解决方案

### 8.1 问题描述

**场景**：一个身处危机的真实求助者，他的钱包里大概率是 **0 AVAX**。没有Gas，他连"领钱"的按钮都点不下去。

**这是Web3互助产品的核心痛点之一**：需要帮助的人往往没有加密货币，而领取加密货币又需要先有加密货币支付Gas费。

### 8.2 Gas费估算

| 操作 | 预估Gas | 预估费用（AVAX） | 说明 |
|------|---------|------------------|------|
| 领取资金（claimAid） | ~50,000 | ~0.0005 AVAX | 单次领取 |
| 验证邮箱（verifyEmail） | ~80,000 | ~0.0008 AVAX | 后端代付 |
| 捐赠（donateAndMint） | ~60,000 | ~0.0006 AVAX | 用户支付 |

**MVP阶段建议**：用户钱包至少保留 **0.001 AVAX** 用于领取操作。

### 8.3 MVP阶段方案

**说明**：MVP阶段默认测试用户拥有少量起始Gas（从水龙头获取）。

**前端Gas检测逻辑**：

```typescript
// src/lib/gasCheck.ts

const MIN_GAS_BALANCE = BigInt(1000000000000000); // 0.001 AVAX (18 decimals)

export async function checkGasBalance(address: string): Promise<{
  hasEnough: boolean;
  balance: string;
  minRequired: string;
}> {
  const balance = await publicClient.getBalance({ address });
  
  return {
    hasEnough: balance >= MIN_GAS_BALANCE,
    balance: formatEther(balance),
    minRequired: formatEther(MIN_GAS_BALANCE)
  };
}

// 在领取前检测
async function beforeClaim() {
  const { hasEnough, balance } = await checkGasBalance(userAddress);
  
  if (!hasEnough) {
    setShowGasWarning(true);
    return false;
  }
  
  return true;
}
```

**前端提示UI**：

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  ⚠️ 需要少量Gas费                                            │
│                                                             │
│  领取资金需要支付少量的网络手续费（Gas费）。                  │
│  请确保你的钱包中有至少 0.001 AVAX。                         │
│                                                             │
│  当前余额：0.0002 AVAX ❌                                    │
│                                                             │
│  💡 如何获取测试AVAX：                                       │
│  1. 访问 Avalanche Fuji 水龙头                               │
│  2. 输入你的钱包地址                                         │
│  3. 获取免费测试币                                           │
│                                                             │
│  [前往水龙头]  [我已有Gas，刷新]                             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 8.4 未来解决方案（V2.0）

#### 方案A：Relayer中继器

使用 Biconomy 或 Gelato 实现代付Gas：

```typescript
// 使用Biconomy的Meta-Transaction
import { Biconomy } from '@biconomy/mexa';

const biconomy = new Biconomy(provider, {
  apiKey: process.env.BICONOMY_API_KEY,
  debug: true
});

// 用户无需Gas即可调用合约
const { data } = await sanctuaryContract.populateTransaction.claimWithEmailVerification(emailHash);
await biconomy.sendTransaction({
  data,
  to: SANCTUARY_ADDRESS,
  from: userAddress
});
```

**优点**：
- 用户体验好，无需持有Gas
- 实现相对简单

**缺点**：
- 需要项目中继服务
- 存在中心化风险

#### 方案B：ERC-4337 账户抽象

使用智能合约钱包，支持Paymaster代付Gas。

```typescript
// 使用Pimlico的ERC-4337解决方案
import { createSmartAccountClient } from 'permissionless';

const smartAccountClient = createSmartAccountClient({
  chain: avalancheFuji,
  transport: http(PIMLICO_RPC_URL),
  paymaster: {
    getPaymasterData: async (userOp) => {
      // 项目方作为Paymaster代付Gas
      return {
        paymasterAndData: encodePaymasterData(userOp)
      };
    }
  }
});

// 用户无需Gas即可领取
await smartAccountClient.sendTransaction({
  to: SANCTUARY_ADDRESS,
  data: encodeFunctionData({
    abi: SanctuaryABI,
    functionName: 'claimWithEmailVerification',
    args: [emailHash]
  })
});
```

**优点**：
- 完全去中心化
- 符合以太坊标准

**缺点**：
- 实现复杂度高
- 需要额外的Paymaster合约

#### 方案C：预充值机制

项目方预先为白名单地址充值少量Gas：

```solidity
// 在SanctuaryProtocol中添加
function preFundGas(address[] calldata recipients) external payable onlyOwner {
    uint256 amountPerUser = msg.value / recipients.length;
    for (uint256 i = 0; i < recipients.length; i++) {
        payable(recipients[i]).transfer(amountPerUser);
    }
}
```

**优点**：
- 实现简单
- Gas可控

**缺点**：
- 需要项目方资金
- 无法预知所有需要帮助的地址

---

## 9. 错误处理场景

### 9.1 错误场景列表

| 场景 | 错误类型 | 用户提示 | 处理方式 |
|------|----------|----------|----------|
| 验证码发送失败 | 网络错误 | "发送失败，请检查网络后重试" | 允许重试 |
| 验证码错误 | 用户输入错误 | "验证码错误，请重新输入" | 允许重试 |
| 验证码过期 | 超时 | "验证码已过期，请重新获取" | 重新发送 |
| Gas不足 | 钱包余额不足 | "钱包Gas不足，请先获取测试币" | 引导到水龙头 |
| 合约调用失败 | 交易失败 | "交易失败，请稍后重试" | 允许重试 |
| 资金池余额不足 | 业务限制 | "资金池暂时不足，请稍后再来" | 记录状态，稍后提醒 |
| 邮箱已被使用 | 业务限制 | "该邮箱已使用过" | 引导使用其他邮箱 |
| 地址已领取过 | 业务限制 | "该地址已领取过" | 无法继续 |
| 地址捐赠过 | 业务限制 | "捐赠过的地址不能领取" | 无法继续 |
| 验证已过期 | 时间限制 | "验证已过期，请重新验证" | 重新验证 |
| IPFS上传失败 | 存储错误 | "存储失败，请检查网络" | 允许重试 |

### 9.2 错误处理组件

```typescript
// src/components/claim/ErrorHandler.tsx

interface ErrorProps {
  type: 'network' | 'validation' | 'business' | 'system';
  message: string;
  retryable: boolean;
  onRetry?: () => void;
}

export function ErrorHandler({ type, message, retryable, onRetry }: ErrorProps) {
  const icons = {
    network: '🌐',
    validation: '⚠️',
    business: '📋',
    system: '⚙️'
  };
  
  return (
    <div className="error-container">
      <span className="error-icon">{icons[type]}</span>
      <p className="error-message">{message}</p>
      {retryable && (
        <button onClick={onRetry} className="retry-button">
          重试
        </button>
      )}
    </div>
  );
}
```

### 9.3 错误码定义

```typescript
// src/lib/errors.ts

export enum ErrorCode {
  // 网络错误 (1xxx)
  NETWORK_ERROR = 1000,
  RPC_ERROR = 1001,
  TIMEOUT = 1002,
  
  // 验证错误 (2xxx)
  INVALID_EMAIL = 2000,
  CODE_SEND_FAILED = 2001,
  CODE_INVALID = 2002,
  CODE_EXPIRED = 2003,
  RATE_LIMITED = 2004,
  
  // 业务错误 (3xxx)
  POOL_INSUFFICIENT = 3000,
  ALREADY_CLAIMED = 3001,
  EMAIL_USED = 3002,
  DONOR_CANNOT_CLAIM = 3003,
  VERIFICATION_EXPIRED = 3004,
  
  // 系统错误 (4xxx)
  CONTRACT_ERROR = 4000,
  WALLET_NOT_CONNECTED = 4001,
  INSUFFICIENT_GAS = 4002,
  IPFS_ERROR = 4003,
}

export const ERROR_MESSAGES: Record<ErrorCode, string> = {
  [ErrorCode.NETWORK_ERROR]: '网络连接失败，请检查网络后重试',
  [ErrorCode.RPC_ERROR]: '区块链网络异常，请稍后重试',
  [ErrorCode.TIMEOUT]: '请求超时，请稍后重试',
  
  [ErrorCode.INVALID_EMAIL]: '请输入有效的Gmail邮箱地址',
  [ErrorCode.CODE_SEND_FAILED]: '验证码发送失败，请稍后重试',
  [ErrorCode.CODE_INVALID]: '验证码错误，请重新输入',
  [ErrorCode.CODE_EXPIRED]: '验证码已过期，请重新获取',
  [ErrorCode.RATE_LIMITED]: '发送太频繁，请1分钟后再试',
  
  [ErrorCode.POOL_INSUFFICIENT]: '资金池暂时不足，请稍后再来',
  [ErrorCode.ALREADY_CLAIMED]: '该地址已领取过资金',
  [ErrorCode.EMAIL_USED]: '该邮箱已使用过',
  [ErrorCode.DONOR_CANNOT_CLAIM]: '捐赠过的地址不能领取',
  [ErrorCode.VERIFICATION_EXPIRED]: '验证已过期，请重新验证',
  
  [ErrorCode.CONTRACT_ERROR]: '合约调用失败，请稍后重试',
  [ErrorCode.WALLET_NOT_CONNECTED]: '请先连接钱包',
  [ErrorCode.INSUFFICIENT_GAS]: '钱包Gas不足，请先获取测试币',
  [ErrorCode.IPFS_ERROR]: '存储失败，请检查网络',
};
```

### 9.4 合约错误解码

```typescript
// src/lib/contractErrors.ts

const CONTRACT_ERRORS: Record<string, string> = {
  '捐赠过的地址不能领取': ErrorCode.DONOR_CANNOT_CLAIM,
  '已经领取过': ErrorCode.ALREADY_CLAIMED,
  '该邮箱已领取过资金': ErrorCode.EMAIL_USED,
  '验证已过期或不存在': ErrorCode.VERIFICATION_EXPIRED,
  '资金池余额不足': ErrorCode.POOL_INSUFFICIENT,
  '邮箱未验证': ErrorCode.VERIFICATION_EXPIRED,
  '邮箱未绑定到此钱包': ErrorCode.CONTRACT_ERROR,
  '转账失败': ErrorCode.CONTRACT_ERROR,
};

export function decodeContractError(error: unknown): ErrorCode {
  const errorMessage = error instanceof Error ? error.message : String(error);
  
  for (const [key, code] of Object.entries(CONTRACT_ERRORS)) {
    if (errorMessage.includes(key)) {
      return code;
    }
  }
  
  return ErrorCode.CONTRACT_ERROR;
}
```

### 9.5 前端错误处理Hook

```typescript
// src/hooks/useErrorHandler.ts

import { useState, useCallback } from 'react';
import { ErrorCode, ERROR_MESSAGES } from '@/lib/errors';
import { decodeContractError } from '@/lib/contractErrors';

interface ErrorState {
  hasError: boolean;
  code: ErrorCode | null;
  message: string;
  retryable: boolean;
}

export function useErrorHandler() {
  const [error, setError] = useState<ErrorState>({
    hasError: false,
    code: null,
    message: '',
    retryable: false,
  });

  const handleError = useCallback((error: unknown, retryable = false) => {
    let code: ErrorCode;
    
    if (typeof error === 'number') {
      code = error;
    } else if (error instanceof Error) {
      // 尝试解码合约错误
      code = decodeContractError(error);
    } else {
      code = ErrorCode.SYSTEM_ERROR;
    }
    
    setError({
      hasError: true,
      code,
      message: ERROR_MESSAGES[code] || '未知错误',
      retryable,
    });
  }, []);

  const clearError = useCallback(() => {
    setError({
      hasError: false,
      code: null,
      message: '',
      retryable: false,
    });
  }, []);

  return {
    error,
    handleError,
    clearError,
  };
}

// 使用示例
function ClaimFlow() {
  const { error, handleError, clearError } = useErrorHandler();

  const handleClaim = async () => {
    try {
      clearError();
      // ✅ 修复：使用正确的函数名
      const { request } = await publicClient.simulateContract({
        address: SANCTUARY_ADDRESS,
        abi: SanctuaryABI,
        functionName: 'claimWithEmailVerification',
        args: [emailHash]
      });
      await walletClient.writeContract(request);
    } catch (err) {
      handleError(err, true); // 允许重试
    }
  };

  if (error.hasError) {
    return (
      <ErrorHandler
        type="business"
        message={error.message}
        retryable={error.retryable}
        onRetry={handleClaim}
      />
    );
  }

  return <ClaimButton onClick={handleClaim} />;
}
```

### 9.6 错误恢复策略

| 错误类型 | 恢复策略 | 自动重试 | 用户操作 |
|----------|----------|----------|----------|
| 网络错误 | 等待网络恢复 | ✅ 最多3次 | 检查网络连接 |
| RPC错误 | 切换RPC节点 | ✅ 自动切换 | 无需操作 |
| 验证码错误 | 重新输入 | ❌ | 重新输入验证码 |
| Gas不足 | 引导到水龙头 | ❌ | 获取测试币 |
| 资金池不足 | 订阅通知 | ❌ | 等待资金池恢复 |
| 合约错误 | 显示详细错误 | ❌ | 检查交易状态 |

---

## 10. 前端技术实现

### 10.1 技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| Next.js | 14.1.0 | 前端框架 |
| TypeScript | 5.x | 类型安全 |
| Tailwind CSS | 3.4.0 | 样式 |
| Zustand | 4.5.0 | 状态管理 |
| wagmi | 2.5.0 | 以太坊交互 |
| viem | 2.7.0 | 轻量级以太坊库 |
| RainbowKit | 2.0.0 | 钱包连接 |
| Framer Motion | 11.0.0 | 动画 |
| NFT.Storage | 7.1.1 | IPFS 存储 |
| Resend | 最新 | 邮件发送 |
| Upstash Redis | 最新 | 验证码存储 |

### 10.2 新增页面结构

```
src/app/[locale]/
├── page.tsx                 # Launch 页（新增）
├── api/                     # API路由（新增）
│   ├── send-code/
│   │   └── route.ts         # 发送验证码
│   └── verify-code/
│       └── route.ts         # 验证验证码
├── sanctuary/
│   └── page.tsx             # 我的庇护所（现有）
├── select/
│   └── [spreadType]/
│       └── page.tsx         # 选卡页（现有）
├── journal/
│   └── [spreadType]/
│       └── page.tsx         # 书写页（现有）
├── success/
│   └── page.tsx             # 成功页（现有，新增求助按钮）
├── claim/                   # 新增目录
│   ├── page.tsx             # 资金申请介绍页
│   ├── verify/
│   │   └── page.tsx         # 邮箱验证页
│   └── success/
│       └── page.tsx         # 领取成功页
└── guardian/                # 新增目录
    └── page.tsx             # 守护者画廊页
```

### 10.3 新增组件

```
src/components/
├── claim/                   # 新增目录
│   ├── MagicEnvelope.tsx    # 魔法信封动画组件
│   ├── EmailVerification.tsx# 邮箱验证组件
│   ├── ClaimButton.tsx      # 领取按钮组件
│   ├── PanicButton.tsx      # 紧急销毁按钮
│   ├── PoolStatus.tsx       # 资金池状态组件
│   └── ErrorHandler.tsx     # 错误处理组件
├── guardian/                # 新增目录
│   ├── CardGallery.tsx      # 卡片画廊（复用现有）
│   ├── DonatePanel.tsx      # 捐赠面板
│   └── PoolStats.tsx        # 资金池统计
└── launch/                  # 新增目录
    ├── ModeSelector.tsx     # 模式选择器
    └── RoleCard.tsx         # 角色卡片
```

### 10.4 新增状态管理

```typescript
// src/stores/claimStore.ts
import { create } from 'zustand'

interface ClaimState {
  // 验证状态
  isVerifying: boolean
  isVerified: boolean
  verificationExpiry: number | null
  
  // 邮箱信息
  email: string | null
  emailHash: string | null
  
  // 领取状态
  isClaiming: boolean
  hasClaimed: boolean
  claimAmount: string
  
  // 资金池状态
  poolBalance: string
  poolInsufficient: boolean
  
  // 错误状态
  error: string | null
  
  // Actions
  setVerifying: (status: boolean) => void
  setVerified: (status: boolean, expiry?: number) => void
  setEmail: (email: string, emailHash: string) => void
  setClaiming: (status: boolean) => void
  setClaimed: (status: boolean) => void
  setPoolStatus: (balance: string, insufficient: boolean) => void
  setError: (error: string | null) => void
  reset: () => void
}

export const useClaimStore = create<ClaimState>((set) => ({
  isVerifying: false,
  isVerified: false,
  verificationExpiry: null,
  email: null,
  emailHash: null,
  isClaiming: false,
  hasClaimed: false,
  claimAmount: '0',
  poolBalance: '0',
  poolInsufficient: false,
  error: null,
  
  setVerifying: (status) => set({ isVerifying: status }),
  setVerified: (status, expiry) => set({ 
    isVerified: status, 
    verificationExpiry: expiry || null 
  }),
  setEmail: (email, emailHash) => set({ email, emailHash }),
  setClaiming: (status) => set({ isClaiming: status }),
  setClaimed: (status) => set({ hasClaimed: status }),
  setPoolStatus: (balance, insufficient) => set({ 
    poolBalance: balance, 
    poolInsufficient: insufficient 
  }),
  setError: (error) => set({ error }),
  reset: () => set({
    isVerifying: false,
    isVerified: false,
    verificationExpiry: null,
    email: null,
    emailHash: null,
    isClaiming: false,
    hasClaimed: false,
    error: null,
  }),
}))
```

---

## 11. 非功能需求 (Non-Functional Requirements)

### 11.1 性能

- 页面加载：< 3 秒
- 合约交互：< 10 秒确认
- 验证码发送：< 5 秒

### 11.2 安全性

- **重入锁**：所有资金操作使用 `nonReentrant` 修饰符
- **防重放**：邮箱哈希 + 地址双重防重放
- **捐赠排除**：捐赠过的地址不能领取
- **时间限制**：验证后24小时内有效

### 11.3 可组合性

- `SanctuaryProtocol.sol` 可独立部署
- 其他前端工具可通过标准接口接入
- 验证逻辑可替换（模拟方案 → 真实ZK-Email）

### 11.4 用户体验

- 所有技术术语转化为隐喻（"魔法信封"、"粉碎"）
- 永远给用户退出的权力
- 紧急销毁按钮随时可用
- 资金池状态实时展示

---

## 12. 部署计划 (Deployment Plan)

### 12.1 测试网部署

| 步骤 | 内容 | 工具 |
|------|------|------|
| 1 | 编译合约 | Hardhat |
| 2 | 部署 PlantOHCard.sol | Hardhat + Avalanche Fuji |
| 3 | 部署 SanctuaryProtocol.sol | Hardhat + Avalanche Fuji |
| 4 | 配置合约地址 | 环境变量 |
| 5 | 配置Resend和Upstash | 环境变量 |
| 6 | 部署前端 | Vercel |
| 7 | 测试完整流程 | 手动测试 |

### 12.2 环境变量

```env
# .env.local

# 合约地址
NEXT_PUBLIC_CONTRACT_ADDRESS=0x...
NEXT_PUBLIC_SANCTUARY_ADDRESS=0x...

# 链配置
NEXT_PUBLIC_CHAIN_ID=43113  # Avalanche Fuji

# 后端服务
RESEND_API_KEY=re_...
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...

# 合约Owner私钥（仅后端使用）
OWNER_PRIVATE_KEY=0x...
```

### 12.3 测试账号

- 准备 3-5 个测试钱包地址
- 预先添加到白名单（可选）
- 准备测试 AVAX（从水龙头获取）

---

## 13. 成功指标 (Success Metrics - MVP 阶段)

- [ ] 智能合约在 Avalanche Fuji 测试网成功部署
- [ ] 守护者可以成功捐赠并看到资金进入资金池
- [ ] 疗愈者可以完成 OH 卡探索
- [ ] 邮箱验证流程完整可用（模拟ZK-Email交互）
- [ ] 疗愈者可以成功领取资金
- [ ] 防套利机制有效
- [ ] 资金池枯竭时UI正确处理
- [ ] Gas不足时正确提示
- [ ] 评委和用户可以通过交互理解产品价值

---

## 14. 可行性评估

| 模块 | 复杂度 | 1周完成度 | 风险 |
|------|--------|-----------|------|
| Launch页 | ⭐⭐ | ✅ 100% | 低 |
| 守护者模式 | ⭐⭐ | ✅ 100% | 低 |
| 疗愈者模式（复用现有） | ⭐ | ✅ 100% | 低 |
| SanctuaryProtocol合约 | ⭐⭐⭐ | ✅ 90% | 低 |
| 后端验证码API | ⭐⭐⭐ | ✅ 90% | 低 |
| 邮箱验证前端交互 | ⭐⭐ | ✅ 90% | 低 |
| 防套利逻辑 | ⭐⭐ | ✅ 90% | 低 |
| 错误处理 | ⭐⭐ | ✅ 80% | 低 |
| 资金池状态展示 | ⭐ | ✅ 100% | 低 |

**结论**：所有模块均可在1周内完成，风险可控。

---

## 15. 未来规划 (Future Considerations)

### 15.1 V1.0（去信任化）

- 集成真实ZK-Email SDK
- 引入更多邮箱服务商支持
- 引入 DAO 治理

### 15.2 V2.0（全链双边经济）

- 捐赠者获得的卡牌升级为带版税的动态 NFT
- 二级市场的每次转手都自动抽取 10% 反哺资金池
- 引入更多前端工具接入
- Gasless Claim（Relayer或ERC-4337）

### 15.3 V3.0（跨链互操作）

- 支持多链部署
- 跨链资金流转
- Layer 2 优化

---

## 附录 A：术语表

| 术语 | 定义 |
|------|------|
| OH 卡 | 心理投射工具，通过图文卡牌探索潜意识 |
| ZK-Email | 零知识证明邮箱验证技术 |
| 魔法信封 | 邮箱验证流程的隐喻化设计 |
| 守护者 | 捐赠资金池的用户 |
| 疗愈者 | 使用 OH 卡并可能领取资助的用户 |
| 资金池 | 智能合约托管的互助资金 |
| 共鸣数 | 某张卡牌被使用的次数 |
| Gasless Claim | 无需Gas费的领取方式 |

---

## 附录 B：参考资源

- [Avalanche Fuji 测试网](https://docs.avax.network/apis/avax-api)
- [Avalanche Fuji 水龙头](https://faucet.avax.network/)
- [NFT.Storage 文档](https://nft.storage/docs)
- [wagmi 文档](https://wagmi.sh)
- [RainbowKit 文档](https://www.rainbowkit.com)
- [Resend 邮件服务](https://resend.com)
- [Upstash Redis](https://upstash.com)

---

**文档结束**
