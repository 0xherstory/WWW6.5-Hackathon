# 🚀 AgentOdyssey - AI Agent 互动学习游戏

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![GitHub stars](https://img.shields.io/github/stars/whyyue/AgentOdyssey?style=social)](https://github.com/whyyue/AgentOdyssey/stargazers)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/whyyue/AgentOdyssey/pulls)

一个互动式的 AI Agent 学习游戏，支持三级难度分级（简单/困难/地狱），适合所有年龄段的学习者。从 LLM 基础到生产级 Multi-Agent 系统，从理论到实践，全方位掌握 Agent 开发技能！

🎮 **[在线体验](https://whyyue.github.io/AgentOdyssey/)** | 📖 **[变更日志](CHANGELOG.md)** | 📊 **[改进报告](COMPLETION_REPORT.md)** | 🤝 **[贡献指南](#贡献)**

---

## ✨ 核心特性

- 🎯 **三级难度系统**：简单模式适合小白，困难模式适合工程师，地狱模式深度解读论文
- 🌍 **27 个完整关卡**：从 LLM 基础到 Multi-Agent 系统，从理论到实践
- 🏆 **成就系统**：10+ 个成就徽章，激励学习进度
- 🎓 **里程碑系统**：4 个阶段性里程碑，明确学习目标
- 🔥 **论文深度解读**：地狱模式包含 10+ 篇经典论文完整解析
- 💻 **互动学习**：代码挑战、调试任务、沙盒实验
- 📱 **响应式设计**：支持桌面和移动设备
- 🎨 **精美 UI**：太空主题，星空背景，流畅动画

---

## 🗺️ 学习路径

### 📚 基础篇（P1-P8）：Agent 开发基础

掌握 Agent 开发的核心概念和基本技能。

| 关卡 | 名称 | 核心内容 | 地狱模式 |
|------|------|---------|---------|
| P1 | 🌍 LLM 星 | LLM 基础、API 调用、参数调优 | - |
| P2 | 🔧 工具星 1 | 工具定义、JSON Schema | - |
| P3 | 🔧 工具星 2 | 工具执行、错误处理 | - |
| P4 | 🔁 ReAct 星 1 | 基础循环、Thought-Action-Observation | - |
| P5 | 🔁 ReAct 星 2 | 多步推理、Chain-of-Thought | ✅ ReAct 论文 |
| P6 | 🧠 记忆星 1 | 短期记忆、滑动窗口 | - |
| P7 | 🧠 记忆星 2 | 长期记忆、RAG 检索 | ✅ RAG 论文 |
| P8 | 👥 多 Agent 星 | Multi-Agent 架构、协作模式 | ✅ CAMEL 论文 |

**里程碑 1**：完成 P8 后，你将成为 **Agent 基础大师** 🎓

---

### 🚀 深度篇（P9-P16）：生产级 Agent 开发

深入理解 LLM 原理，掌握生产级 Agent 开发技能。

| 关卡 | 名称 | 核心内容 | 地狱模式 |
|------|------|---------|---------|
| P9 | ⚡ Transformer 星 | Attention 机制、Self-Attention | ✅ Attention is All You Need |
| P10 | 🏋️ 预训练星 | 预训练流程、训练数据 | ✅ GPT-3 论文 |
| P11 | 🎓 后训练星 | SFT、RLHF、对齐 | ✅ InstructGPT 论文 |
| P12 | 🌤️ 实战星 1 | 天气助手、完整实现 | ✅ 生产级实现 |
| P13 | 🔍 实战星 2 | 代码审查、并行处理 | ✅ CI/CD 集成 |
| P14 | 🔗 框架星 1 | LangGraph、状态图 | ✅ Pregel 模型 |
| P15 | 🤖 框架星 2 | AutoGen、CrewAI | ✅ GroupChat 协议 |
| P16 | 🎓 毕业星 | 完整架构、最佳实践 | ✅ Agent 评估体系 |

**里程碑 2**：完成 P16 后，你将成为 **生产级 Agent 开发者** 🚀

💡 **提示**：P9-P11 是可选内容，如果只想学 Agent 开发，可以跳过直接去 P12。

---

### 🏛️ 帝国篇（P17-P21）：制度化 Multi-Agent 系统

学习如何构建可控、可靠、可扩展的大规模 Agent 系统。

| 关卡 | 名称 | 核心内容 | 地狱模式 |
|------|------|---------|---------|
| P17 | 🏛️ 帝国星 1 | 三省六部架构、权限矩阵 | ✅ EDICT 项目解析 |
| P18 | ⚖️ 帝国星 2 | 状态机、制度设计 | ✅ 分布式状态机 |
| P19 | 📡 帝国星 3 | Event-Driven、实时观测 | ✅ 三层可观测性 |
| P20 | 🔍 帝国星 4 | 审核机制、质量保障 | ✅ 审核效能分析 |
| P21 | 👑 帝国星 5 | 完整项目、Token 预算 | ✅ Saga 模式 |

**核心思想**：让 Agent 按规矩办事（自上而下的控制）

**里程碑 3**：完成 P21 后，你将成为 **Multi-Agent 系统架构师** 🏛️

---

### 🐟 MiroFish 篇（P23-P25）：自由演化的群体智能

学习如何构建自由演化的 Agent 系统，实现群体智能和舆论预测。

| 关卡 | 名称 | 核心内容 | 地狱模式 |
|------|------|---------|---------|
| P23 | 🕸️ 知识图谱星 | GraphRAG、本体设计 | ✅ 微软 GraphRAG 论文 |
| P24 | 🎭 Agent 人格星 | 人格生成、记忆系统 | ✅ Generative Agents 论文 |
| P25 | ⚙️ 仿真引擎星 | 大规模调度、IPC 通信 | ✅ OASIS 论文 |

**核心思想**：让 Agent 自由互动，观察涌现行为（自下而上的演化）

**里程碑 4**：完成 P25 后，你将成为 **全栈 Agent 开发者** 🌟

💡 **对比**：帝国篇 vs MiroFish 篇
- 帝国篇：制度化、强控制、适合企业应用
- MiroFish 篇：自由演化、群体智能、适合社会仿真

---

## 🏆 成就系统

完成特定挑战解锁成就徽章：

| 成就 | 图标 | 解锁条件 |
|------|------|---------|
| 代码新手 | 🏆 | 完成第一个代码挑战 |
| 调试高手 | 🐛 | 通过第一个调试任务 |
| 硬核玩家 | 🔥 | 完成第一个地狱模式 |
| 基础大师 | 🎓 | 完成所有基础篇（P1-P8）|
| 深度探索者 | 🚀 | 完成所有深度篇（P9-P16）|
| 帝国建造者 | 🏛️ | 完成帝国篇（P17-P21）|
| 群体智能专家 | 🐟 | 完成 MiroFish 篇（P23-P25）|
| Agent 大师 | 🌟 | 完成所有关卡 |
| 完美主义者 | 💎 | 所有关卡都获得 3 星 |

---

## 📁 项目结构

```
AgentOdyssey/
├── index.html              # 主 HTML 文件
├── css/
│   └── styles.css         # 所有样式（包含成就、里程碑样式）
├── js/
│   ├── main.js            # 主逻辑和初始化
│   ├── game-state.js      # 游戏状态管理
│   ├── renderer.js        # 渲染逻辑（支持 milestone）
│   ├── interactions.js    # 交互逻辑（challenge、debug、sandbox）
│   ├── achievements.js    # 成就系统 🆕
│   └── planets/           # 关卡数据
│       ├── p1-llm.js ~ p8-multi-agent.js      # 基础篇
│       ├── p9-transformer.js ~ p16-final.js   # 深度篇
│       ├── p17-empire-1.js ~ p21-empire-5.js  # 帝国篇
│       ├── p23-mirofish-1.js ~ p25-mirofish-3.js # MiroFish 篇
│       ├── p8-milestone.js                    # 里程碑 1 🆕
│       ├── p16-milestone.js                   # 里程碑 2 🆕
│       ├── p21-milestone.js                   # 里程碑 3 🆕
│       └── p27-milestone.js                   # 里程碑 4 🆕
├── docs/
│   ├── DESIGN.md          # 设计文档
│   └── ...
├── CHANGELOG.md           # 变更日志
├── COMPLETION_REPORT.md   # 改进完成报告 🆕
├── IMPROVEMENT_PROGRESS.md # 改进进度报告 🆕
└── README.md              # 本文件
```

---

## 🚀 快速开始

### 方法 1：在线体验（推荐）

直接访问：https://whyyue.github.io/AgentOdyssey/

### 方法 2：本地运行

```bash
# 克隆仓库
git clone https://github.com/whyyue/AgentOdyssey.git
cd AgentOdyssey

# 直接打开
open index.html  # macOS
start index.html # Windows

# 或使用本地服务器
python -m http.server 8000
# 访问 http://localhost:8000
```

---

## 🎯 学习建议

### 对于初学者（简单模式）
1. 按顺序完成所有关卡
2. 理解每个概念的基本原理
3. 完成所有互动测试
4. 目标：完成基础篇（P1-P8）

### 对于工程师（困难模式）
1. 可以跳过简单模式，直接切换到困难模式
2. 仔细阅读代码示例和常见坑点
3. 尝试在本地实现示例代码
4. 完成里程碑项目
5. 目标：完成深度篇（P9-P16）

### 对于研究者（地狱模式）
1. 深入学习论文解读
2. 理解数学推导和实验结果
3. 对比不同论文的方法
4. 目标：完成所有地狱模式

---

## 🔧 技术栈

- **纯前端**：HTML + CSS + JavaScript（无需构建工具）
- **模块化**：每个关卡独立文件，易于维护和扩展
- **响应式**：支持桌面和移动设备
- **无依赖**：不依赖任何第三方库

---

## 📝 最近更新（v5.0.0）

### 🆕 新增功能
- ✅ **成就系统**：10+ 个成就徽章，激励学习进度
- ✅ **里程碑系统**：4 个阶段性里程碑，明确学习目标
- ✅ **互动元素**：代码挑战、调试任务、沙盒实验（P23-P25）
- ✅ **架构对比**：明确帝国篇 vs MiroFish 篇的区别
- ✅ **可跳过提示**：P9-P11 可选，降低劝退率

### 🎓 里程碑项目
- 里程碑 1：天气查询 Agent
- 里程碑 2：智能代码审查系统
- 里程碑 3：智能客服系统（3-Agent 协作）
- 里程碑 4：mini MiroFish（完整项目）

### 📊 课程质量提升
- 学习动机：⭐⭐⭐⭐ → ⭐⭐⭐⭐⭐
- 难度梯度：⭐⭐⭐⭐ → ⭐⭐⭐⭐⭐
- 课程连贯性：⭐⭐⭐⭐ → ⭐⭐⭐⭐⭐
- **总体评分**：⭐⭐⭐⭐ (4/5) → ⭐⭐⭐⭐⭐ (4.5/5)

详见 [改进完成报告](COMPLETION_REPORT.md)

---

## 🤝 贡献

欢迎贡献新的关卡内容或改进现有内容！

1. Fork 本仓库
2. 创建你的特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交你的改动 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启一个 Pull Request

---

## 📄 许可

MIT License - 详见 [LICENSE](LICENSE) 文件

---

## 🙏 致谢

- 感谢所有贡献者和用户的反馈
- 特别感谢 [EDICT](https://github.com/cft0808/edict) 和 [MiroFish](https://github.com/your-repo/mirofish) 项目的启发
- 感谢 Claude (Anthropic) 提供的技术支持

---

**当前版本**：v5.0.0 - Achievement & Milestone System 🏆

**最后更新**：2026-04-04

**作者**：[@whyyue](https://github.com/whyyue)

---

⭐ 如果这个项目对你有帮助，请给个 Star！

🐛 发现问题？[提交 Issue](https://github.com/whyyue/AgentOdyssey/issues)

💬 想要讨论？[加入 Discussions](https://github.com/whyyue/AgentOdyssey/discussions)
