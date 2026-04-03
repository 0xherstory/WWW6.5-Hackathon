# 🚀 Agent Odyssey - AI Agent 学习游戏

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![GitHub stars](https://img.shields.io/github/stars/whyyue/AgentOdyssey?style=social)](https://github.com/whyyue/AgentOdyssey/stargazers)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/whyyue/AgentOdyssey/pulls)

一个互动式的 AI Agent 学习游戏，支持三级难度分级（简单/困难/地狱），适合所有年龄段的学习者。

🎮 **[在线体验](https://whyyue.github.io/AgentOdyssey/)** | 📖 **[变更日志](CHANGELOG.md)** | 📐 **[设计文档](docs/DESIGN.md)** | 🤝 **[贡献指南](#贡献)**

---

## ✨ 特性

- 🎯 **三级难度系统**：简单模式适合小学生，困难模式适合工程师，地狱模式深度解读论文
- 🌍 **16 个完整关卡**：从 LLM 基础到 Transformer 论文，从工具使用到多 Agent 协作
- 🔥 **论文深度解读**：地狱模式包含 "Attention is All You Need" 完整解析
- 💻 **纯前端实现**：无需构建工具，打开即用
- 📱 **响应式设计**：支持桌面和移动设备
- 🎨 **精美 UI**：太空主题，星空背景，流畅动画

## 📁 项目结构

```
agent-quest/
├── index.html              # 主 HTML 文件
├── css/
│   └── styles.css         # 所有样式
├── js/
│   ├── main.js            # 主逻辑和初始化
│   ├── game-state.js      # 游戏状态管理
│   ├── renderer.js        # 渲染逻辑
│   ├── interactions.js    # 交互逻辑（quiz、动画等）
│   └── planets/           # 关卡数据（每个关卡一个文件）
│       ├── p1-llm.js      # ✅ LLM 星
│       ├── p2-tool-1.js   # ✅ 工具星 1：工具定义
│       ├── p3-tool-2.js   # ✅ 工具星 2：工具执行
│       ├── p4-react-1.js  # ✅ ReAct 星 1：基础循环
│       ├── p5-react-2.js  # ✅ ReAct 星 2：多步推理
│       ├── p6-memory-1.js # ✅ 记忆星 1：短期记忆
│       ├── p7-memory-2.js # ✅ 记忆星 2：长期记忆
│       ├── p8-multi-agent.js # ✅ 多 Agent 星
│       ├── p9-transformer.js # ✅ Transformer 星
│       ├── p10-pretrain.js # ✅ 预训练星
│       ├── p11-posttrain.js # ✅ 后训练星
│       ├── p12-practice-1.js # ✅ 实战星 1：天气助手
│       ├── p13-practice-2.js # ✅ 实战星 2：代码审查
│       ├── p14-framework-1.js # ✅ 框架星 1：LangChain/LangGraph
│       ├── p15-framework-2.js # ✅ 框架星 2：AutoGen/CrewAI
│       └── p16-final.js # ✅ 毕业星：完整架构
└── README.md              # 本文件
```

## 🎮 功能特性

### ✅ 已完成功能

1. **难度分级系统**
   - 🟢 简单模式：适合小学生和初学者
   - 🟡 困难模式：适合工程师和开发者
   - 🔴 地狱模式：论文级深度解读（已开放！）

2. **完整的 17 个关卡**（全部完成！）
   - 🌍 LLM 星：认识 AI 大脑
   - 🔧 工具星 1：工具定义
   - 🔧 工具星 2：工具执行
   - 🔁 ReAct 星 1：基础循环
   - 🔁 ReAct 星 2：多步推理
   - 🧠 记忆星 1：短期记忆
   - 🧠 记忆星 2：长期记忆
   - 🌐 多 Agent 星：架构与协作
   - ⚡ Transformer 星：注意力机制
   - 🏋️ 预训练星：训练 AI 大脑
   - 🎓 后训练星：让 AI 更听话
   - 🌤️ 实战星 1：天气助手
   - 🔍 实战星 2：代码审查
   - 🔗 框架星 1：LangChain/LangGraph
   - 🤖 框架星 2：AutoGen/CrewAI
   - 🎓 毕业星：完整架构与最佳实践
   - 🏛️ **帝国星 1：三省六部架构** 🆕
   - ⚖️ **帝国星 2：制度设计** 🆕
   - 📡 **帝国星 3：实时观测** 🆕
   - 🔍 **帝国星 4：质量保障** 🆕
   - 👑 **帝国星 5：实战项目** 🆕

3. **核心系统**
   - 难度切换器（实时切换，无需重新加载）
   - 进度追踪系统
   - 星星收集系统
   - 响应式设计

## 🚀 如何使用

### 方法 1：直接打开（推荐）

直接用浏览器打开 `index.html` 文件即可开始游戏！

```bash
open index.html  # macOS
```

### 方法 2：本地服务器

如果遇到跨域问题，可以使用本地服务器：

```bash
# Python 3
python -m http.server 8000

# 然后访问 http://localhost:8000
```

## 📚 关卡内容

### 🌍 LLM 星
- **简单模式**：什么是语言模型、预测下一个词
- **困难模式**：Token 化、Context Window、Temperature 参数、API 调用示例、常见坑点

### 🔧 工具星 1：工具定义
- **简单模式**：什么是工具、工具的作用
- **困难模式**：工具定义规范、JSON Schema、最佳实践、常见坑点

### 🔧 工具星 2：工具执行
- **简单模式**：工具执行流程、错误处理
- **困难模式**：参数验证、超时处理、错误捕获、重试机制、常见坑点

### 🔁 ReAct 星 1：基础循环
- **简单模式**：思考→行动→观察的循环
- **困难模式**：完整的 ReAct 循环实现、循环控制、消息历史管理、常见坑点

### 🔁 ReAct 星 2：多步推理
- **简单模式**：任务分解、Chain-of-Thought
- **困难模式**：System Prompt 设计、引导多步推理、常见坑点

### 🧠 记忆星 1：短期记忆
- **简单模式**：对话上下文、Context Window
- **困难模式**：Context 管理、Token 计数、压缩策略、常见坑点

### 🧠 记忆星 2：长期记忆
- **简单模式**：数据库存储、RAG 检索增强生成
- **困难模式**：向量数据库、Embedding、相似度检索、常见坑点

### 🌐 多 Agent 星
- **简单模式**：指挥官 + 专业 Agent 的团队协作
- **困难模式**：Supervisor 模式、Pipeline 模式、架构设计、常见坑点

### ⚡ Transformer 星
- **简单模式**：注意力机制、为什么需要 Attention
- **困难模式**：Self-Attention 计算、Q/K/V 矩阵、Multi-Head Attention、常见坑点
- **地狱模式** 🔥：《Attention is All You Need》论文深度解读
  - 论文背景与动机
  - 完整 Encoder-Decoder 架构
  - Scaled Dot-Product Attention 数学推导
  - Multi-Head Attention 完整实现
  - Positional Encoding 数学原理
  - 论文实验结果与消融实验
  - 对后续研究的影响（GPT、BERT、T5 等）
  - 实现中的关键细节与陷阱

### 🏋️ 预训练星
- **简单模式**：预测下一个词、训练 AI 大脑
- **困难模式**：训练循环、Loss 函数、反向传播、常见坑点

### 🎓 后训练星
- **简单模式**：让 AI 更听话、SFT/RLHF/对齐
- **困难模式**：监督微调实现、RLHF 流程、常见陷阱

### 🌤️ 实战星 1：天气助手
- **简单模式**：做一个能查天气的小助手
- **困难模式**：完整 Agent 实现、ReAct 模式、错误处理

### 🔍 实战星 2：代码审查
- **简单模式**：代码审查小助手
- **困难模式**：多文件审查、并行处理、常见问题

### 🔗 框架星 1：LangChain/LangGraph
- **简单模式**：什么是 Agent 框架、LangChain vs LangGraph
- **困难模式**：LangChain 实现、LangGraph 状态机、如何选择

### 🤖 框架星 2：AutoGen/CrewAI
- **简单模式**：多 Agent 框架、AutoGen vs CrewAI
- **困难模式**：AutoGen 对话、CrewAI 团队、框架对比

### 🎓 毕业星
- **简单模式**：恭喜毕业、下一步做什么、学习建议
- **困难模式**：完整 Agent 架构、生产环境最佳实践、持续改进

### 👑 帝国星 5：实战项目 🆕
- **简单模式**：班级任务助手蓝图、帝国篇五关总结
- **困难模式**：完整项目结构、ImperialWorkflow 串联所有步骤、FastAPI 入口（异步任务 + WebSocket）
- **地狱模式** 🔥：Token 预算系统（模型分级 + Prompt 缓存）、Saga 模式处理分布式失败（补偿操作 + 幂等性）、帝国篇五层知识图谱、ACID vs Saga 的本质取舍

### 🔍 帝国星 4：质量保障 🆕
- **简单模式**：作业检查员故事、早发现早修复的价值
- **困难模式**：MenxiaAgent 量化审核 Prompt（可行性/完整性/安全性）、review_with_retry 封驳循环、ZhongshuAgent 收到建议后修改方案
- **地狱模式** 🔥：ReviewCriteria 量化评分（维度权重 + 最低分要求）、人工介入协议（超时保护 + 审计记录）、审核效能分析（一次通过率/平均轮次/人工介入率）

### 📡 帝国星 3：实时观测 🆕
- **简单模式**：班级公告板故事、发布者 vs 订阅者概念
- **困难模式**：Event 数据结构、EventBus 实现（通配符订阅 + 并行通知）、Agent 发布事件、WebSocket 实时推送 Dashboard
- **地狱模式** 🔥：三层可观测性（Thoughts/Todos/Events）、生产级 Append-Only EventStore、SSE 流式推送（token 级）、REST+WebSocket+SSE 三协议分工、EDICT Dashboard 数据架构

### ⚖️ 帝国星 2：制度设计 🆕
- **简单模式**：红绿灯状态机、分权制衡的学校故事
- **困难模式**：TaskState 枚举、VALID_TRANSITIONS 白名单、权限矩阵代码实现、真实任务时间线
- **地狱模式** 🔥：生产级状态机（asyncio.Lock + 审计日志 + EventBus）、EDICT Task JSON Schema、flow_log 不可变性、分布式状态机深层问题（乐观锁/幂等性/Saga/状态爆炸）

### 🏛️ 帝国星 1：三省六部架构 🆕
- **简单模式**：小明的班级管理系统、分工合作、质量检查
- **困难模式**：三省六部 Multi-Agent 架构、权限矩阵、门下省审核
- **地狱模式** 🔥：EDICT 项目深度解析、制度化协作、分权制衡设计哲学
  - 基于真实开源项目 [EDICT](https://github.com/cft0808/edict)
  - 12 个 Agent 协作系统
  - 强制审核机制（门下省封驳）
  - Event-Driven 架构
  - 实时 Dashboard 看板

## 🎯 设计理念

### 难度分级

- **简单模式**：故事化讲解、概念理解、互动游戏
- **困难模式**：技术细节、代码示例（20-30 行）、最佳实践、常见坑点
- **地狱模式** 🔥：论文级深度（已开放！）
  - 完整的数学推导和公式
  - 生产级代码实现
  - 论文实验结果分析
  - 对学术界和工业界的影响

### 代码示例原则

困难模式的代码示例遵循：
- ✅ 精简到 20-30 行
- ✅ 聚焦核心逻辑
- ✅ 包含清晰的注释和解释
- ✅ 展示最佳实践

## 🔧 技术栈

- **纯前端**：HTML + CSS + JavaScript（无需构建工具）
- **模块化**：每个关卡独立文件，易于维护和扩展
- **响应式**：支持桌面和移动设备

## 🎓 学习路径建议

### 对于小学生（简单模式）
1. 按顺序完成所有关卡
2. 理解每个概念的基本原理
3. 完成所有互动测试

### 对于工程师（困难模式）
1. 可以跳过简单模式，直接切换到困难模式
2. 仔细阅读代码示例和常见坑点
3. 尝试在本地实现示例代码
4. 参考完整升级方案文档（`COMPLETE_UPGRADE_PLAN.md`）

## 📝 下一步计划

1. **扩展地狱模式**
   - 为更多关卡添加论文级深度内容
   - 添加更多经典论文解读

2. **添加更多互动元素**
   - 代码编辑器（可运行代码）
   - 更多小游戏
   - 成就系统

3. **社区贡献**
   - 多语言支持
   - 更多实战案例
   - 视频教程

## 🤝 贡献

欢迎贡献新的关卡内容或改进现有内容！

1. Fork 本仓库
2. 创建你的特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交你的改动 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启一个 Pull Request

## 📄 许可

MIT License

---

**当前版本**：v4.0.0 - Empire Series Complete 👑

**最后更新**：2026-03-23

**作者**：[@whyyue](https://github.com/whyyue)

**特别感谢**：感谢所有贡献者和用户的反馈，让这个项目从单文件演变成结构化的完整学习系统！

---

⭐ 如果这个项目对你有帮助，请给个 Star！
