# 🎨 AgentOdyssey 视觉风格对比

## 两种主题

### 🌌 原版：太空探索主题
**文件**：`index.html` + `css/styles.css` + `js/main.js`

**风格特点**：
- 🎨 柔和的渐变色（cyan → purple）
- ⭐ 闪烁的星空背景
- 🔵 圆角卡片设计
- 💫 温和的悬停效果
- 📱 现代 UI 风格

**适合人群**：
- 喜欢温和、友好界面的用户
- 儿童和初学者
- 追求可读性和舒适感

---

### ⚡ 赛博朋克：黑客终端主题
**文件**：`index-cyberpunk.html` + `css/styles-cyberpunk.css` + `js/main-cyberpunk.js`

**风格特点**：
- 🟢 霓虹绿主色调（黑客帝国风格）
- 💻 矩阵雨背景（日文片假名下落）
- 🔲 硬边框 + 等宽字体
- ⚡ 扫描线 + 故障效果
- 🎆 全息投影感

**适合人群**：
- 喜欢硬核科幻风格的用户
- 追求视觉冲击力
- 赛博朋克爱好者

---

## 核心设计差异

| 元素 | 太空主题 | 赛博朋克主题 |
|------|---------|-------------|
| **背景** | 闪烁星空 | 矩阵雨（日文字符下落） |
| **主色调** | Cyan (#00e5ff) + Purple (#a855f7) | Neon Green (#00ff41) |
| **字体** | Segoe UI（无衬线） | Courier New（等宽） |
| **边框** | 圆角 20px | 硬边框 0px |
| **按钮** | 渐变 + 柔和阴影 | 霓虹边框 + 发光效果 |
| **卡片** | 柔和渐变背景 | 纯黑 + 霓虹边框 |
| **动画** | 平滑过渡 | 故障效果 + 扫描线 |
| **文字** | 标准大小写 | 全大写 + 字母间距 |

---

## 特殊效果对比

### 太空主题
```css
/* 星星闪烁 */
@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-14px); }
}

/* 柔和发光 */
box-shadow: 0 0 60px rgba(0,229,255,.08);
```

### 赛博朋克主题
```css
/* 矩阵雨 */
ctx.fillStyle = 'rgba(0, 0, 0, 0.05)'; // 拖尾效果
ctx.fillStyle = `rgba(0, 255, 65, ${alpha})`;

/* 扫描线 */
background: repeating-linear-gradient(
  0deg,
  rgba(0, 255, 65, 0.03) 0px,
  transparent 1px,
  transparent 2px
);

/* 故障效果 */
@keyframes screen-glitch {
  20% { transform: translate(-2px, 2px); }
  40% { transform: translate(-2px, -2px); }
}

/* 霓虹发光 */
text-shadow:
  0 0 10px var(--neon-green),
  0 0 20px var(--neon-green),
  0 0 30px var(--neon-green);
```

---

## 如何切换主题

### 方法 1：直接访问不同文件
- **太空主题**：打开 `index.html`
- **赛博朋克主题**：打开 `index-cyberpunk.html`

### 方法 2：动态切换（未来可实现）
在 `index.html` 中添加主题切换按钮：

```html
<button onclick="switchTheme('cyberpunk')">切换到赛博朋克</button>
```

```javascript
function switchTheme(theme) {
  const link = document.querySelector('link[rel="stylesheet"]');
  const script = document.querySelector('script[src*="main"]');

  if (theme === 'cyberpunk') {
    link.href = 'css/styles-cyberpunk.css';
    script.src = 'js/main-cyberpunk.js';
  } else {
    link.href = 'css/styles.css';
    script.src = 'js/main.js';
  }

  location.reload(); // 重新加载页面
}
```

---

## 视觉效果预览

### 太空主题
```
┌─────────────────────────────────┐
│  🚀 Agent 星际冒险               │
│  和你的 AI 机器人搭档一起探索    │
│                                  │
│  ⭐ ⭐ ⭐ (闪烁的星星)           │
│                                  │
│  [🟢 简单] [🟡 困难] [🔴 地狱]  │
│                                  │
│  ╭──────────────────────╮       │
│  │ 🌍 LLM 星            │       │
│  │ Token、API 调用      │       │
│  ╰──────────────────────╯       │
└─────────────────────────────────┘
```

### 赛博朋克主题
```
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃  ⚡ AGENT ODYSSEY                ┃
┃  // NEURAL NETWORK PROTOCOL      ┃
┃                                   ┃
┃  ｱ ｲ ｳ (矩阵雨下落)              ┃
┃  0 1 A B                          ┃
┃                                   ┃
┃  [🟢 LEVEL 1] [🟡 LEVEL 2] [🔴 3]┃
┃                                   ┃
┃  ┌──────────────────────┐        ┃
┃  │ 🌍 LLM SECTOR        │        ┃
┃  │ TOKEN PROTOCOL       │        ┃
┃  └──────────────────────┘        ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
```

---

## 技术实现细节

### 矩阵雨效果
```javascript
// 字符集：日文片假名 + 数字 + 字母
const chars = 'ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';

// 每列独立下落
for (let i = 0; i < drops.length; i++) {
  const char = charArray[Math.floor(Math.random() * charArray.length)];
  const y = drops[i] * fontSize;
  const alpha = Math.min(1, (c.height - y) / c.height + 0.3);

  ctx.fillStyle = `rgba(0, 255, 65, ${alpha})`;
  ctx.fillText(char, i * fontSize, y);

  drops[i]++;
}
```

### 扫描线效果
```css
body::before {
  content: '';
  position: fixed;
  inset: 0;
  background: repeating-linear-gradient(
    0deg,
    rgba(0, 255, 65, 0.03) 0px,
    transparent 1px,
    transparent 2px,
    rgba(0, 255, 65, 0.03) 3px
  );
  animation: scanlines 8s linear infinite;
}

@keyframes scanlines {
  0% { transform: translateY(0); }
  100% { transform: translateY(10px); }
}
```

### 随机故障效果
```javascript
function triggerGlitch() {
  const screens = document.querySelectorAll('.screen.active');
  screens.forEach(screen => {
    screen.style.transform = `translate(${Math.random() * 4 - 2}px, ${Math.random() * 4 - 2}px)`;
    setTimeout(() => {
      screen.style.transform = 'translate(0, 0)';
    }, 50);
  });
}

// 每 5-15 秒随机触发
function scheduleGlitch() {
  const delay = 5000 + Math.random() * 10000;
  setTimeout(() => {
    if (Math.random() > 0.5) triggerGlitch();
    scheduleGlitch();
  }, delay);
}
```

---

## 性能对比

| 指标 | 太空主题 | 赛博朋克主题 |
|------|---------|-------------|
| **CPU 占用** | 低（静态星星） | 中（矩阵雨动画） |
| **内存占用** | ~5MB | ~8MB |
| **FPS** | 60 | 50-60 |
| **加载时间** | 快 | 稍慢（更多动画） |

**优化建议**：
- 移动设备可以减少矩阵雨的列数
- 可以添加"性能模式"开关，关闭部分特效

---

## 未来扩展

### 可能的新主题
1. **🌸 赛博和风**：霓虹 + 日式元素
2. **🌊 深海探索**：蓝色 + 水波纹效果
3. **🔥 末日废土**：橙红色 + 火焰粒子
4. **❄️ 冰雪王国**：冰蓝色 + 雪花飘落

### 主题切换系统
```javascript
const themes = {
  space: {
    css: 'styles.css',
    js: 'main.js',
    name: '太空探索'
  },
  cyberpunk: {
    css: 'styles-cyberpunk.css',
    js: 'main-cyberpunk.js',
    name: '赛博朋克'
  }
};

function applyTheme(themeName) {
  const theme = themes[themeName];
  localStorage.setItem('theme', themeName);
  // 动态加载 CSS 和 JS
}
```

---

## 总结

**太空主题**：温和、友好、适合所有人
**赛博朋克主题**：硬核、炫酷、视觉冲击力强

两种主题都保持了完整的功能，只是视觉风格不同。用户可以根据自己的喜好选择！

**推荐**：
- 儿童/初学者 → 太空主题
- 极客/开发者 → 赛博朋克主题
