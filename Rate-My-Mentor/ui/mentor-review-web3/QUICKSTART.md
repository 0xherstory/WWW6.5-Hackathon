# 🎯 快速开始 - 评论弹窗功能

## 核心特性 ✨

✅ **评价内容置顶** - 输入框在最上面，专注评价内容  
✅ **自动 AI 分析** - 完成输入后自动分析  
✅ **标签自动提取** - AI 识别关键词，自动提取标签  
✅ **评分自动生成** - 计算沟通、技术、响应速度等维度评分  
✅ **实时结果展示** - 分析结果即时反显在页面上  

---

## 项目已运行

```
✓ 开发服务器: http://localhost:3001
```

---

## 功能演示

### 1️⃣ 访问评论页面
```
http://localhost:3001/review
```

### 2️⃣ 选择 Mentor 并点击"评价"
- 会弹出评论弹窗
- 评价内容框在最上面

### 3️⃣ 输入评价内容示例
```
Alex 的技术非常卓越，讲解也很清楚，响应速度非常快，
架构设计思想非常深入，代码质量很高，非常推荐！
```

### 4️⃣ 观看 AI 自动分析
- ⏳ 500ms 后自动开始分析
- 🏷️ 自动提取标签（技术卓越、耐心教学等）
- 📊 显示各维度评分进度条
- 😊 识别情感（积极/中立/消极）

### 5️⃣ 点击"提交评价"完成
- 评论会显示在列表中
- 包含 AI 生成的标签

---

## 技术实现细节

### 🔄 评论流程图
```
用户输入 
   ↓
防抖 500ms
   ↓
调用 /api/analyze-review (POST)
   ↓
AI 分析评论文本
   ↓
返回: { tags, scores, sentiment }
   ↓
前端实时显示结果
   ↓
用户提交
```

### 📁 新增文件
| 文件 | 说明 |
|------|------|
| `src/components/common/ReviewDialog.tsx` | 评论弹窗组件 |
| `src/app/api/analyze-review/route.ts` | AI 分析 API |
| `src/hooks/useAIAnalysis.ts` | AI 分析 Hook |

### 🎨 UI 组件集成
| 位置 | 修改 |
|------|------|
| `/review` 页面 | 完整重写，集成弹窗 |
| `/mentor/[id]` 详情页 | 替换旧弹窗为新组件 |

---

## 关键代码片段

### 在任何地方使用评论弹窗
```tsx
import { ReviewDialog } from "@/components/common/ReviewDialog";

export function MyComponent() {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <>
      <button onClick={() => setDialogOpen(true)}>
        写评价
      </button>

      <ReviewDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        mentorId="m-demo-01"
        mentorName="Alex Chen"
        onSubmit={async (review) => {
          console.log("提交评价:", review);
          // 这里可以调用合约上链或存入数据库
        }}
      />
    </>
  );
}
```

### AI 分析的返回结果格式
```typescript
{
  // 提取的标签
  tags: [
    "技术卓越",
    "耐心教学",
    "反应迅速",
    "推荐"
  ],
  
  // 各维度评分（0-1 范围）
  scores: {
    communication: 0.9,  // 沟通能力
    technical: 0.95,     // 技术水平
    responsiveness: 0.9, // 响应速度
    overall: 1.0         // 综合评分
  },
  
  // 情感分析
  sentiment: "positive"  // "positive" | "neutral" | "negative"
}
```

---

## 关键词识别库

### 正面标签（会自动识别）
- **技术卓越**: 卓越、精深、技术强、代码质量、架构、算法、优化
- **耐心教学**: 耐心、细致、讲解清楚、易理解、循循善诱
- **反应迅速**: 快速、及时、秒回、响应快、高效
- **业界经验**: 经验丰富、见识广、实战、项目经验、行业、深度
- **亲切和善**: 和善、友好、热心、亲切、热情、认真、专业

### 负面标签（会自动识别）
- **沟通困难**: 难理解、表达不清、沟通差、听不懂、模糊
- **不够耐心**: 不耐烦、生硬、冷淡、敷衍、急躁
- **响应缓慢**: 回复慢、没回应、冷漠、懒散、不及时

---

## 调试技巧

### 🐛 检查 AI 分析是否工作
1. 打开浏览器开发者工具（F12）
2. 切到 Network 标签
3. 在评论框输入内容
4. 看是否有 `POST /api/analyze-review` 请求
5. 检查响应数据是否正确

### 📊 查看完整的分析结果
在浏览器控制台运行：
```javascript
// 假设你已经提交了评论
console.log(analysis);
```

### 🔧 临时禁用 AI 分析（测试用）
编辑 `src/components/common/ReviewDialog.tsx`，注释 `analyzeReview()` 函数调用

---

## 下一步优化建议

### 🚀 立即可做
1. **集成合约上链** - 在 `onSubmit` 中调用 wagmi 合约函数
2. **持久化存储** - 用数据库保存评论而不是内存
3. **用户认证** - 记录真实的钱包地址而不是 "0x0000...0001"

### 📈 后期增强
1. **升级 AI 服务** - 集成 OpenAI/Claude 获得更准确的分析
2. **多语言支持** - 添加对英文、日文等语言的支持
3. **高级功能** - 评论点赞、回复、举报等社区功能

---

## 常见问题

### Q: 为什么 AI 分析没有运行？
A: 
1. 确保在评价框中输入了内容
2. 等待 500ms（防抖延迟）
3. 检查 F12 开发者工具的 Network 标签

### Q: 如何修改关键词库？
A: 编辑 `src/app/api/analyze-review/route.ts`：
```typescript
const keywordTags: Record<string, string[]> = {
  "你的标签": ["关键词1", "关键词2"],
  // ...
};
```

### Q: 评论提交后数据哪里了？
A: 目前存在内存中。要持久化需要：
1. 添加数据库（MongoDB/PostgreSQL）
2. 或者调用智能合约上链
3. 编辑 `handleSubmitReview` 函数

### Q: 可以修改弹窗样式吗？
A: 完全可以！编辑 `src/components/common/ReviewDialog.tsx` 中的样式类名。

---

## 文件导航

```
📦 mentor-review-web3/
├── 📄 src/
│   ├── app/
│   │   ├── 📝 review/page.tsx           ← 评论页面（已修改）
│   │   ├── 📝 mentor/[id]/page.tsx      ← Mentor 详情（已修改）
│   │   └── api/
│   │       └── 🆕 analyze-review/route.ts ← AI 分析 API
│   ├── components/
│   │   └── common/
│   │       └── 🆕 ReviewDialog.tsx      ← 评论弹窗组件
│   └── hooks/
│       └── 🆕 useAIAnalysis.ts          ← AI 分析 Hook
│
└── 📄 REVIEW_FEATURE.md                 ← 详细文档
```

---

## 总结

你的项目现在拥有一个完整的、AI 驱动的评论系统：

✨ **评价内容置顶**  
✨ **智能 AI 分析**  
✨ **自动标签提取**  
✨ **实时结果展示**  

开发服务器正在运行，访问 http://localhost:3001 体验功能吧！

---

**需要帮助？** 查看 `REVIEW_FEATURE.md` 了解更多技术细节。
