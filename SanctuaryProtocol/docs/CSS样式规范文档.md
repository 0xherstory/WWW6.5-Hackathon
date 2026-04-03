# CSS 样式规范文档

## 项目概述
Web3 植物系疗愈 OH 卡系统 - 极简几何装饰风格

---

## 一、设计哲学

### 1.1 风格定位
- **极简主义**：去除多余装饰，保持界面清爽
- **几何装饰**：使用简洁的几何线条作为点缀
- **微华丽感**：通过精致的细节体现品质感
- **纸张质感**：模拟真实纸张的温润触感

### 1.2 色彩系统

#### 主色调
| 名称 | 色值 | 用途 |
|------|------|------|
| Primary | `#2C2C2C` | 主要文字、按钮背景 |
| Primary Light | `#4A4A4A` | 次要文字、悬停状态 |
| Primary Dark | `#1A1A1A` | 强调文字、深色背景 |

#### 背景色
| 名称 | 色值 | 用途 |
|------|------|------|
| Background | `#FFFFFF` | 主背景（纯白） |
| Background Alt | `#FAFAFA` | 次级背景、卡片背景 |
| Secondary | `#F5F5F5` | 浅灰背景区域 |

#### 强调色
| 名称 | 色值 | 用途 |
|------|------|------|
| Accent | `#8B7355` | 暖棕色强调、选中状态 |
| Accent Light | `#A68B6A` | 悬停状态、轻强调 |
| Accent Dark | `#6B5A45` | 深强调色 |

#### 文字色
| 名称 | 色值 | 用途 |
|------|------|------|
| Text | `#2C2C2C` | 主要文字 |
| Text Light | `#FFFFFF` | 深色背景上的文字 |
| Text Muted | `#6B6B6B` | 次要文字、说明文字 |

#### 状态色
| 名称 | 色值 | 用途 |
|------|------|------|
| Success | `#4A4A4A` | 成功状态（灰调） |
| Warning | `#8B7355` | 警告状态（暖棕） |
| Error | `#8B6B6B` | 错误状态（柔和红） |

---

## 二、排版规范

### 2.1 字体系统

#### 中文字体
- **标题字体**：`font-serif` - 衬线体，优雅古典
- **正文字体**：系统默认无衬线体
- **字卡字体**：`font-serif` - 衬线体，增加仪式感

#### 字号规范
| 级别 | 类名 | 尺寸 | 用途 |
|------|------|------|------|
| H1 | `text-h1` | `2.5rem` (40px) | 页面主标题 |
| H2 | `text-h2` | `2rem` (32px) | 区块标题 |
| H3 | `text-h3` | `1.5rem` (24px) | 小标题 |
| Body | `text-body` | `1rem` (16px) | 正文内容 |
| Small | `text-small` | `0.875rem` (14px) | 辅助文字 |
| Tag | `text-tag` | `0.75rem` (12px) | 标签、提示 |

### 2.2 间距系统
| 名称 | 值 | 用途 |
|------|-----|------|
| xs | `0.25rem` (4px) | 极小间距 |
| sm | `0.5rem` (8px) | 小组件间距 |
| md | `1rem` (16px) | 标准间距 |
| lg | `1.5rem` (24px) | 区块间距 |
| xl | `2rem` (32px) | 大区块间距 |
| 2xl | `3rem` (48px) | 页面间距 |

---

## 三、组件样式

### 3.1 按钮 (Button)

#### 主按钮
```
背景: bg-primary (#2C2C2C)
文字: text-white
边框: border border-primary
悬停: hover:bg-primary-light hover:shadow-geometric
过渡: transition-all duration-300
```

#### 次按钮
```
背景: bg-transparent
文字: text-primary
边框: border border-primary
悬停: hover:bg-primary hover:text-white
```

#### 幽灵按钮
```
背景: bg-transparent
文字: text-muted
边框: 无
悬停: hover:text-accent
```

### 3.2 卡片 (Card)

#### 图卡 (ImageCard)
```
尺寸: w-full (自适应容器)
比例: aspect-[9/16] (竖版卡牌比例)
边框: border border-gray-200
悬停: hover:border-accent
过渡: transition-all duration-500
选中: ring-2 ring-accent
```

#### 字卡 (WordCard)
```
尺寸: w-full h-32 (固定高度)
边框: border border-gray-200
角落装饰: 四角L形几何线条
悬停: hover:border-accent/50
选中: border-accent bg-accent/5 shadow-geometric

特殊排版:
- 2-3字: 单行居中 text-2xl
- 4字(含斜杠): 双行排列 text-xl
  例: "保护/隔离" → 
    保护/
    隔离
```

### 3.3 输入框 (Input)
```
背景: bg-white
边框: border border-gray-200
聚焦: focus:border-accent focus:outline-none
占位符: placeholder:text-muted
```

### 3.4 模态框 (Modal)
```
遮罩: bg-black/90
内容: max-w-[90vw] max-h-[90vh]
动画: animate-fade-in, animate-zoom-in
关闭按钮: 右上角，白色
```

---

## 四、布局规范

### 4.1 容器
```
最大宽度: max-w-7xl (1280px)
水平内边距: px-4 (移动端) / px-8 (桌面端)
居中: mx-auto
```

### 4.2 网格系统

#### 牌阵布局 (CSS Grid)
使用 `grid-template-areas` 实现不同牌阵的特定布局：

**单卡探索 (1张)**
```
网格: 1列
布局: "center"
```

**过去-现在-未来 (3张)**
```
网格: 3列
布局: "past present future"
```

**十字牌阵 (5张)**
```
网格: 3列
布局:
  ". top ."
  "left center right"
  ". bottom ."
```

**十字牌阵 (5张)**
```
网格: 3列 × 3行
布局:
  ". top ."
  "left center right"
  ". bottom ."
位置: 现状(中)、挑战(上)、过去(左)、未来(右)、潜在(下)
```

**七星探索 (7张)**
```
网格: 5列 × 5行
布局:
  ". . crown . ."
  "wisdom . . . understanding"
  ". . beauty . ."
  "victory . . . glory"
  ". . kingdom . ."
位置: 王冠、智慧、理解、美丽、胜利、荣耀、王国
```

**生命之树 (10张)**
```
网格: 5列 × 7行
布局:
  ". . kether . ."
  "chokmah . . . binah"
  ". chesed . gevurah ."
  ". . tiferet . ."
  "netzach . . . hod"
  ". . yesod . ."
  ". . malkuth . ."
位置: Kether(王冠)、Chokmah(智慧)、Binah(理解)、Chesed(慈悲)、
      Gevurah(严厉)、Tiferet(美丽)、Netzach(胜利)、Hod(荣耀)、
      Yesod(基础)、Malkuth(王国)
```

**牌阵尺寸计算**
```typescript
// 基于容器宽度和网格行列数自动计算
function getCardSize(spread) {
  const containerWidth = 520;  // 左侧区块宽度
  const gap = 8;               // 卡牌间距
  
  // 计算每列可用宽度
  const availableWidth = (containerWidth - (spread.gridCols - 1) * gap) / spread.gridCols;
  let imageWidth = availableWidth * 0.98;
  
  // 根据总高度限制调整
  const maxHeight = 700;
  const totalHeight = spread.gridRows * (imageWidth * 1.6 + 24) + (spread.gridRows - 1) * gap;
  if (totalHeight > maxHeight) {
    imageWidth = imageWidth * (maxHeight / totalHeight);
  }
  
  return { imageWidth, wordHeight: 24 };
}
```

### 4.3 响应式断点
| 断点 | 宽度 | 用途 |
|------|------|------|
| sm | 640px | 小屏手机 |
| md | 768px | 平板 |
| lg | 1024px | 小桌面 |
| xl | 1280px | 大桌面 |

---

## 五、交互动效

### 5.1 过渡时间
| 类型 | 时长 | 用途 |
|------|------|------|
| 快速 | 150ms | 按钮反馈 |
| 标准 | 300ms | 悬停、切换 |
| 缓慢 | 500ms | 卡片动画 |

### 5.2 缓动函数
```
默认: ease (标准)
弹性: cubic-bezier(0.34, 1.56, 0.64, 1) (弹出效果)
```

### 5.3 常用动画
```css
/* 淡入 */
animate-fade-in: opacity 0→1, 300ms

/* 缩放进入 */
animate-zoom-in: scale 0.95→1, opacity 0→1, 300ms

/* 上滑 */
animate-slide-up: translateY 20px→0, opacity 0→1, 500ms

/* 悬停上浮 */
hover:-translate-y-1: Y轴上移4px
```

---

## 六、交互逻辑规范

### 6.1 选卡页面布局

#### 左侧区块 - 牌阵展示（图卡+字卡合并）
```
┌─────────────────────────────┐
│        已选卡牌              │
│  图卡 3/7    字卡 3/7  ✓完成 │
├─────────────────────────────┤
│                             │
│      ┌───┐                  │
│      │ 1 │ 王冠             │
│      └───┘ 选字卡           │
│    ┌───┐   ┌───┐            │
│    │ 2 │   │ 3 │            │
│    └───┘   └───┘            │
│    智慧    理解              │
│                             │
│      ┌───┐                  │
│      │ 4 │                  │
│      └───┘                  │
│      美丽                    │
│                             │
└─────────────────────────────┘
```

- 图卡在上，字卡文字在下，合并为一个整体
- 点击图卡区域 → 切换到图卡选择模式
- 点击字卡文字 → 切换到字卡选择模式
- 未选择图卡时显示位置名称（如"王冠"、"智慧"）
- 未选择字卡时显示"选字卡"提示

#### 右侧区块 - 卡牌选择器
- 选项卡切换：图卡 / 字卡
- 显示当前激活位置的提示

### 6.2 选卡流程

#### 图卡选择
1. **进入选卡页**
   - 位置1自动激活（高亮显示）
   - 右侧显示"位置 1 (位置名称) 已激活"

2. **选择卡牌**
   - 点击右侧图卡 → 填充到激活位置
   - 自动激活下一个空位

3. **替换卡牌（直接点击替换）**
   - 单击左侧已选图卡 → 激活该位置
   - 点击右侧新图卡 → 直接替换（无需重置）
   - 无需进入"更换模式"，简化交互

4. **查看大图**
   - 双击左侧已选图卡 → 打开大图模态框
   - 模态框内禁止右键保存

5. **随机选择**
   - 点击"全部随机"按钮 → 同时随机图卡和字卡

6. **重置**
   - 点击"重置"按钮 → 清空所有选择

#### 字卡选择
- 交互逻辑与图卡相同
- 四字词特殊排版：双行显示，每行两字（含斜杠）
  - 例："保护/隔离" → 第一行"保护/"，第二行"隔离"

### 6.2 选中状态
```
视觉反馈:
- 边框: border-accent (强调色边框)
- 背景: bg-accent/5 (淡强调色背景)
- 阴影: shadow-geometric (几何阴影)
- 标记: 右上角显示✓图标
- 提示: 显示"点击替换"文字
```

### 6.3 完成状态
```
- 显示"✓ 完成"标记
- 激活"查看解读"按钮
```

---

## 七、特殊效果

### 7.1 几何阴影
```css
shadow-geometric:
  box-shadow: 4px 4px 0 0 rgba(139, 115, 85, 0.1);
```

### 7.2 角落装饰
字卡四角使用L形边框装饰：
```
左上: border-t border-l
右上: border-t border-r
左下: border-b border-l
右下: border-b border-r
```

### 7.3 图片保护
大图查看时防止保存：
```
- draggable={false}
- onContextMenu={(e) => e.preventDefault()}
- 透明遮罩层覆盖
- user-select: none
```

---

## 八、后续计划

### 8.1 黑夜模式 (Dark Mode)

#### 配色方案
| 名称 | 色值 | 用途 |
|------|------|------|
| Background Dark | `#1A1A1A` | 主背景 |
| Surface Dark | `#2C2C2C` | 卡片背景 |
| Text Primary Dark | `#F5F5F5` | 主要文字 |
| Text Secondary Dark | `#A0A0A0` | 次要文字 |
| Accent Dark | `#A68B6A` | 强调色（保持暖棕） |

#### 实现方式
- 使用 CSS 变量或 Tailwind dark mode
- 切换按钮放置在 Header
- 用户偏好存储在 localStorage

### 8.2 国际化 (i18n)

#### 支持语言
- 简体中文 (zh-CN) - 默认
- 英文 (en)

#### 实现方式
- 使用 next-intl 库
- 语言文件: `messages/zh.json`, `messages/en.json`
- 切换按钮放置在 Header
- 语言偏好存储在 localStorage

#### 翻译内容
- 所有 UI 文字
- 牌阵名称和描述
- 字卡文字（保持中文，或提供英文对照）
- 提示信息和错误消息

### 8.3 其他优化方向
- [ ] 卡牌收藏功能
- [ ] 历史记录查看
- [ ] 分享功能（图片生成）
- [ ] 音效反馈
- [ ] 动画优化（Framer Motion）

---

## 九、文件清单

### 配置文件
- `tailwind.config.ts` - Tailwind 配置
- `src/config/spreads.ts` - 牌阵配置
- `src/config/cards.ts` - 卡牌配置

### 样式文件
- `src/app/globals.css` - 全局样式
- `src/components/cards/WordCard.tsx` - 字卡组件
- `src/components/cards/ImageCard.tsx` - 图卡组件

### 页面文件
- `src/app/select/[spreadType]/page.tsx` - 选卡页面

---

## 十、更新日志

### 2025-03-22
- 创建 CSS 样式规范文档
- 定义色彩系统、排版规范、组件样式
- 记录交互逻辑规范
- 添加黑夜模式和国际化后续计划
- 修复生命之树牌阵布局问题（改为5列网格）
- 优化四字词字卡排版（支持斜杠显示）

### 2025-03-22（后续更新）
- **牌阵布局重构**
  - 生命之树扩展为10张牌的完整卡巴拉结构（Kether到Malkuth）
  - 七星探索改为5列网格布局
  - 所有牌阵使用 `grid-template-areas` 实现特定几何排列
  - 添加 `gridCols` 和 `gridRows` 属性到牌阵配置

- **统一卡牌尺寸计算规则**
  - 新增 `getCardSize()` 函数，基于容器宽度和网格行列数自动计算
  - 计算公式：`(容器宽度 - 间距总和) / 列数 × 0.98`
  - 根据总高度自动缩放，防止溢出（最大高度700px）
  - 间距优化为8px，最大化利用空间

- **选卡页面布局优化**
  - 图卡和字卡合并显示：图卡在上，字卡文字在下
  - 移除图卡/字卡分区域设计，改为统一牌阵展示
  - 点击图卡区域选择图卡，点击文字区域选择字卡
  - 未选择图卡时显示位置名称（如"王冠"、"智慧"）
  - 未选择字卡时显示"选字卡"提示

- **交互逻辑更新**
  - 支持直接点击替换：选中位置后点击新卡牌直接替换
  - 移除"更换模式"，简化交互流程
  - 双击图卡查看大图（模态框内禁止保存）
  - 单击已选卡牌激活该位置

- **视觉样式调整**
  - 移除所有绿色背景，改为纯白/透明
  - 字卡边框保持统一高度
  - 选中卡牌在左侧区块居中并放大显示
  - 字卡字号放大（四字词双行排列）

- **颜色系统调整**
  - 科技风渐变绿改为纸张风护眼浅绿
  - 移除卡牌标签（如"1-1 创伤"、"journey 旅程"）
  - 允许用户自由关联图像和文字
