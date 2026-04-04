# Demo 预览模式 — 前端接入完整指南

---

## 一、后端 Demo 逻辑说明

### 1.1 状态管理原理

后端维护一个全局布尔变量 `_demoMode`（默认 `false`），存在服务器内存中。

```
_demoMode = false   ← 服务器启动默认值
_demoMode = true    ← 调用 POST /api/demo/on 后
_demoMode = false   ← 调用 POST /api/demo/off 或后端重启后
```

前端通过以下 3 个端点控制开关：

| 端点 | 方法 | 返回 |
|------|------|------|
| `/api/demo/status` | GET  | `{ demo: true/false }` |
| `/api/demo/on`     | POST | `{ demo: true,  message: "Demo 模式已开启..." }` |
| `/api/demo/off`    | POST | `{ demo: false, message: "Demo 模式已关闭..." }` |

> 重要：后端重启后状态归零，需重新调用 `/api/demo/on` 开启。

---

### 1.2 smelt Demo 分支逻辑

**触发条件（两个必须同时满足）**

```
条件一：请求体 mode === "B" 或 mode === "C"（即 needsImage = true）
条件二：后端 _demoMode === true
```

**执行流程（跳过 GPT + DALL-E）**

```
Step 1  从选中矿石中提取 ore.type 集合（去重）
          例：["技术", "创作"]

Step 2  并行查询
        ├── card-images 存储桶内所有已有图片列表（含 cardId + publicUrl）
        └── 与上述 type 关联的 cardId 列表

Step 3  图片匹配
        ├── 优先：类型匹配的卡片图片（exact match）
        └── 兜底：随机取一张已有图片（不会返回空）

Step 4  查询该 cardId 对应的卡片名称 → 作为 milestoneTitle

Step 5  直接返回，不写入任何新数据到数据库
```

**smelt Demo 响应结构**

```json
{
  "cardId": 12,
  "name": "深度工作实践者",
  "description": "用户输入的描述",
  "rarity": "COMMON",
  "oreIds": [3, 7],
  "milestoneTitle": "深度工作实践者",
  "illustrationDescription": null,
  "supabaseImageUrl": "https://xxx.supabase.co/.../card-images/abc.png",
  "isDemo": true
}
```

---

### 1.3 forge Demo 分支逻辑

**触发条件（只需一个）**

```
条件：后端 _demoMode === true
（不依赖 mode 参数，Demo ON 即自动触发）
```

**执行流程（跳过 GPT + DALL-E + 上链）**

```
Step 1  根据传入 cardIds 查询这些卡片关联的所有矿石
          例：cardIds=[12,8] → oreIds=[3,7,5]

Step 2  从矿石中提取 ore.type 集合（去重）
          例：["技术", "创作"]

Step 3  并行查询
        ├── badge-images 存储桶内所有已有勋章图片列表
        └── 与上述 type 关联的 cardId → badge 映射

Step 4  勋章匹配
        ├── 优先：类型匹配的勋章图片（exact match）
        └── 兜底：随机取一张已有图片（不会返回空）

Step 5  直接返回，不写入数据库，不上链，minted = false
```

**forge Demo 响应结构**

```json
{
  "id": null,
  "name": "炼金术士徽章",
  "description": "",
  "tokenId": 1,
  "cardIds": [12, 8],
  "rarity": "RARE",
  "walletAddress": null,
  "illustrationDescription": null,
  "previousBadgeId": null,
  "supabaseImageUrl": "https://xxx.supabase.co/.../badge-images/xyz.png",
  "ipfsMetadataUrl": null,
  "onChainTokenId": null,
  "txHash": null,
  "minted": false,
  "isDemo": true
}
```

---

## 二、前端接入步骤
改动量极小：
|步骤|改动方案|工作量|
|------|------|------|
|Step 1|新建 DemoToggle.tsx|复制粘贴即可|
|Step 2|App.tsx 引入组件|2 行代码|
|Step 3|Refine.tsx 改 mode: "A" → "B"|改 1 个字符|
|Step 4|forge 调用|不需要改|

改完后右下角出现悬浮按钮，点一下开启演示模式，smelt 和 forge 都在 3 秒内返回，整个 mine → smelt → forge 链路可以流畅演示

### Step 1：新建悬浮 Demo 开关组件

新建文件路径：`src/app/components/DemoToggle.tsx`

```tsx
import { useState, useEffect } from 'react';

export default function DemoToggle() {
  const [isDemo, setIsDemo] = useState(false);
  const [loading, setLoading] = useState(false);

  // 页面加载时同步后端当前 Demo 状态
  useEffect(() => {
    fetch('/api/demo/status')
      .then(r => r.json())
      .then(data => setIsDemo(data.demo))
      .catch(() => {});
  }, []);

  const toggle = async () => {
    setLoading(true);
    try {
      const endpoint = isDemo ? '/api/demo/off' : '/api/demo/on';
      const res = await fetch(endpoint, { method: 'POST' });
      const data = await res.json();
      setIsDemo(data.demo);
    } catch (e) {
      console.error('Demo 切换失败', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={toggle}
      disabled={loading}
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 9999,
        padding: '10px 18px',
        borderRadius: '999px',
        border: '2px solid',
        borderColor: isDemo ? '#d4af37' : '#666',
        background: isDemo
          ? 'linear-gradient(135deg, #f4d03f 0%, #daa520 100%)'
          : 'rgba(30, 30, 30, 0.85)',
        color: isDemo ? '#3d2817' : '#aaa',
        fontFamily: "'Cinzel', serif",
        fontSize: '0.75rem',
        fontWeight: 700,
        letterSpacing: '1px',
        cursor: loading ? 'not-allowed' : 'pointer',
        boxShadow: isDemo
          ? '0 4px 16px rgba(218, 165, 32, 0.5)'
          : '0 4px 16px rgba(0,0,0,0.4)',
        backdropFilter: 'blur(8px)',
        transition: 'all 0.25s ease',
        opacity: loading ? 0.6 : 1,
      }}
    >
      {loading ? '...' : isDemo ? '⚡ DEMO ON' : '○ DEMO OFF'}
    </button>
  );
}
```

---

### Step 2：挂载到根组件

修改 `src/app/App.tsx`（或路由根文件），添加两行：

```tsx
import DemoToggle from './components/DemoToggle';   // 新增第1行

export default function App() {
  return (
    <>
      <Routes>
        ...
      </Routes>

      <DemoToggle />   {/* 新增第2行，全局挂载 */}
    </>
  );
}
```

挂载后，所有页面右下角都会出现悬浮按钮，状态实时同步后端。

---

### Step 3：smelt 调用改 mode（必须操作）

修改 `Refine.tsx` 第 96 行：

```tsx
// 改前（当前代码）
mode: "A"

// 改后（改这一个字符）
mode: "B"
```

完整 smelt 调用参考（含响应字段读取）：

```tsx
const response = await fetch("/api/smelt", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    name: cardText.trim() || undefined,
    description: "",
    oreIds,
    mode: "B"   // ← 已改
  })
});

const result = await response.json();

// 读取并展示以下字段：
console.log(result.cardId);           // 已有卡片 ID，传给 forge 的 cardIds 用
console.log(result.milestoneTitle);   // 卡片标题，展示在弹窗
console.log(result.supabaseImageUrl); // 卡片图片 URL，展示卡片图
console.log(result.isDemo);           // true（Demo 标志）
```

---

### Step 4：forge 调用无需改动

Demo ON 状态下 forge 自动走快速返回，现有代码不用改：

```tsx
// Awaken.tsx — 不需要修改任何内容
const response = await fetch("/api/forge", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    name: medalText,
    cardIds: cardIds,
    uploadToIpfs: true
  })
});

const result = await response.json();

// 读取并展示以下字段：
console.log(result.name);             // 勋章名称
console.log(result.supabaseImageUrl); // 勋章图片 URL
console.log(result.minted);           // false（Demo 不上链）
console.log(result.isDemo);           // true
```

---

### Step 5（可选）：展示 PREVIEW 角标

```tsx
const result = await response.json();

if (result.isDemo) {
  setIsPreview(true); // 在卡片/勋章弹窗右上角显示 "PREVIEW" 标签
}
```

---

## 三、正常模式 vs Demo 模式 完整对比

| 项目 | 正常模式 | Demo 模式 |
|------|---------|----------|
| smelt 响应时间 | ~65–80 秒 | < 3 秒 |
| forge 响应时间 | ~65–80 秒 | < 3 秒 |
| smelt 触发条件 | mode: "B" 即可 | mode: "B" + Demo ON |
| forge 触发条件 | 任意 mode | Demo ON 自动触发 |
| 图片来源 | DALL-E 实时生成 | 存储桶已有图片，按矿石类型匹配 |
| cardId | 写入新卡片，返回新 ID | 返回已有 cardId，不写入 |
| badge id | 写入新勋章，返回新 ID | 返回 null，不写入 |
| minted | true（已上链） | false（不上链） |
| isDemo 字段 | 响应中无此字段 | true |

---

## 四、完整演示操作流程

```
1. 启动前端应用
   → 右下角出现灰色 "○ DEMO OFF" 按钮

2. 开启 Demo 模式
   → 点击按钮
   → 变为金色 "⚡ DEMO ON"，后端状态切换成功

3. 采矿石（OreCollection 页面）
   → 正常点击采矿，矿石写入数据库
   → 此步骤 Demo 模式无影响

4. 炼卡（Refine 页面）
   → 选中矿石 → 输入卡片名（可选）→ 点击 REFINE
   → 后端按矿石 type 匹配已有卡片图片
   → < 3s 返回
   → 前端读取 milestoneTitle + supabaseImageUrl 展示弹窗

5. 锻造勋章（Awaken 页面）
   → CardGallery 选卡片 → 点击 AWAKEN
   → 后端追溯卡片矿石 type，匹配已有勋章图片
   → < 3s 返回
   → 前端读取 name + supabaseImageUrl 展示勋章弹窗

6. 演示结束
   → 点击按钮变回 "○ DEMO OFF"
   → 后端恢复正常 AI 生图模式
```

---

## 五、注意事项

| 项目 | 说明 |
|------|------|
| Demo 状态持久性 | 存服务器内存，**后端重启自动关闭**，演示前记得重新开启 |
| smelt mode 必须 "B" | mode: "A" 不满足 needsImage 条件，Demo 分支不会触发 |
| forge 数据隔离 | Demo 下 id 为 null，完全不写入数据库，不污染正式数据 |
| 图片无匹配时 | 随机取一张已有图片兜底，不会返回空或报错 |
| 上线前清理 | 删除 App.tsx 中的 `<DemoToggle />` 即可完全移除，不影响其他代码 |
| 总改动量 | 新增 1 个文件 + 改 1 个字符（`"A"` → `"B"`） |
