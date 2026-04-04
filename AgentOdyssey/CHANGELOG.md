# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [4.0.0] - 2026-03-24

### 👑 Added - Empire Series Complete!
- **帝国篇全部 5 关完成**（p17-p21），星球总数 19 → 21

- **p20-empire-4.js**：质量保障：门下省审核机制
  - 简单模式：作业检查员故事、早发现早修复的价值
  - 困难模式：MenxiaAgent 三维审核 Prompt（可行性/完整性/安全性）、review_with_retry 封驳循环、ZhongshuAgent 收到反馈后修改方案、为什么门下省需要不同 temperature
  - 地狱模式：ReviewCriteria 量化评分（维度权重+最低分门槛）、人工介入协议（24h 超时+审计记录+三种决策）、审核效能指标分析

- **p21-empire-5.js**：实战项目：构建完整帝国系统
  - 简单模式：班级任务助手蓝图、帝国篇五关总结
  - 困难模式：完整项目文件结构、ImperialWorkflow 串联所有步骤（sm+审核+并行执行+异常处理）、FastAPI 异步任务入口+WebSocket Dashboard
  - 地狱模式：Token 预算系统（阶段分配+模型分级+Prompt缓存）、Saga 模式（补偿操作+幂等性）、五层知识图谱、ACID vs Saga 本质取舍

### 🎓 Empire Series Summary
- 5 关卡覆盖架构层/控制层/观测层/质量层/工程层
- 基于真实开源项目 EDICT（github.com/cft0808/edict）
- 三级难度：故事类比 → 工程实现 → 生产最佳实践

### 📚 Documentation
- 更新 README 包含全部帝国篇关卡说明
- 更新星球数量：19 → 21
- 版本升级到 v4.0.0

---

## [3.4.0] - 2026-03-24

### 📡 Added - Empire Series p19!
- **新增\"帝国星 3\"关卡**：实时观测：Event-Driven 架构
- **p19-empire-3.js**：
  - 简单模式：班级公告板类比、发布者 vs 订阅者、推模式 vs 拉模式
  - 困难模式：Event 数据结构（trace_id/event_id）、EventBus 实现（通配符 + asyncio.gather 并行）、Agent 发布 thought/state 事件、WebSocket 推送 + 历史回放
  - 地狱模式：三层可观测性（Thoughts SSE/Todos WebSocket/Events append-only）、Append-Only EventStore（SQLite + replay + tail）、token 级流式 SSE、REST+WebSocket+SSE 三协议分工架构

### 📚 Documentation
- 更新 README 包含 p19 关卡说明
- 更新星球数量：18 → 19

---

## [3.3.0] - 2026-03-24

### ⚖️ Added - Empire Series p18!
- **新增\"帝国星 2\"关卡**：制度设计：状态机与分权制衡
- **p18-empire-2.js**：
  - 简单模式：红绿灯状态机类比、学校角色分权故事
  - 困难模式：TaskState 枚举 + VALID_TRANSITIONS 白名单、权限矩阵实现、调用审计日志、真实 EDICT 任务流转时间线（含封驳场景）
  - 地狱模式：生产级 TaskStateMachine（asyncio.Lock + 不可变 flow_log + EventBus）、EDICT Task JSON Schema、分布式状态机深层问题（乐观锁/幂等性/Saga/状态爆炸/Append-only 合规审计）

### 📚 Documentation
- 更新 README 包含 p18 关卡说明
- 更新星球数量：17 → 18

---

## [3.2.0] - 2026-03-23

### 🏛️ Added - Empire Series Begins!
- **新增"帝国篇"关卡系列**：基于真实开源项目 EDICT
- **p17-empire-1.js**：三省六部架构基础
  - 简单模式：小明的班级管理系统故事
  - 困难模式：三省六部 Multi-Agent 架构实现
  - 地狱模式：EDICT 项目深度解析
    - 制度化协作 vs 自由协作
    - 权限矩阵设计
    - 门下省封驳机制
    - 与 CrewAI/AutoGen 的对比
- **设计文档**：`docs/empire-series-design.md`
  - 完整的 5 个关卡规划（p17-p21）
  - 每个关卡的详细设计
  - 学习路径和游戏化设计

### 📚 Documentation
- 添加帝国篇设计文档
- 更新 README 包含新关卡说明
- 更新星球数量：16 → 17

### 🎯 Learning Content
- 基于真实项目 [EDICT](https://github.com/cft0808/edict) 的最佳实践
- 三省六部：1300 年前的制度，现代 AI 的架构
- 分权制衡、强制审核、完全可观测

---

## [3.1.0] - 2026-03-23

### 🔥 Added - Hell Mode Unlocked!
- **地狱模式激活**：为 Transformer 星球添加地狱难度
- **论文深度解读**：完整解析《Attention is All You Need》论文
  - 论文背景与动机
  - 完整 Encoder-Decoder 架构详解
  - Scaled Dot-Product Attention 数学推导
  - Multi-Head Attention 完整实现（PyTorch 代码）
  - Positional Encoding 数学原理与实现
  - 论文实验结果与消融实验分析
  - 对后续研究的影响（GPT、BERT、T5、Claude 等）
  - 实现中的 8 个关键细节与陷阱
- **三级难度系统**：支持简单/困难/地狱三个难度级别切换

### 🎨 Changed
- 更新 CSS 样式支持地狱模式的红色主题
- 优化难度切换器，地狱模式解锁后显示红色高亮效果
- 更新 README 添加 GitHub badges 和项目展示优化

### 🔧 Fixed
- 修复难度切换逻辑，支持动态检测星球是否有对应难度
- 优化地狱模式按钮状态（锁定/解锁）的显示逻辑

---

## [3.0.0] - 2026-03-23

### 🎉 Added - 完整 16 关卡
- 新增 8 个高级关卡：
  - **p9-transformer.js**：Transformer 架构与注意力机制
  - **p10-pretrain.js**：预训练 - 训练 AI 大脑
  - **p11-posttrain.js**：后训练 - SFT、RLHF、对齐
  - **p12-practice-1.js**：实战 - 天气助手 Agent
  - **p13-practice-2.js**：实战 - 代码审查 Agent
  - **p14-framework-1.js**：框架对比 - LangChain vs LangGraph
  - **p15-framework-2.js**：框架对比 - AutoGen vs CrewAI
  - **p16-final.js**：毕业关卡 - 完整架构与最佳实践

### 🎨 Changed
- 更新主页显示 16 颗星球
- 优化 README 文档，添加所有新关卡的详细说明
- 更新版本号到 v3.0.0

---

## [2.0.0] - 2026-03-22

### 🏗️ Changed - 项目重构
- **模块化重构**：从单文件 HTML 拆分为多文件项目结构
  - 创建 `css/` 文件夹存放样式
  - 创建 `js/` 文件夹存放逻辑
  - 创建 `js/planets/` 文件夹，每个关卡独立文件
- **代码优化**：困难模式代码示例精简到 20-30 行
- **文档完善**：添加完整的项目结构说明和使用指南

### 📁 Project Structure
```
agent-quest/
├── index.html
├── css/
│   └── styles.css
├── js/
│   ├── main.js
│   ├── game-state.js
│   ├── renderer.js
│   ├── interactions.js
│   └── planets/
│       ├── p1-llm.js
│       ├── p2-tool-1.js
│       ├── ... (8 planet files)
│       └── p8-multi-agent.js
└── README.md
```

---

## [1.0.0] - 2026-03-21

### 🎉 Initial Release
- **8 个基础关卡**：
  - LLM 星：认识 AI 大脑
  - 工具星 1：工具定义
  - 工具星 2：工具执行
  - ReAct 星 1：基础循环
  - ReAct 星 2：多步推理
  - 记忆星 1：短期记忆
  - 记忆星 2：长期记忆
  - 多 Agent 星：架构与协作

### ✨ Features
- **双难度系统**：简单模式 + 困难模式
- **互动式学习**：故事、概念、代码、测试题
- **进度追踪**：星星收集系统
- **响应式设计**：支持桌面和移动设备
- **太空主题 UI**：星空背景、流畅动画

---

## 版本说明

- **Major 版本**（x.0.0）：重大功能更新或架构变更
- **Minor 版本**（0.x.0）：新增关卡、新功能、重要改进
- **Patch 版本**（0.0.x）：Bug 修复、小优化、文档更新

---

## 贡献者

感谢所有为这个项目做出贡献的人！

- [@whyyue](https://github.com/whyyue) - 项目创建者和主要维护者

---

## 许可证

本项目采用 MIT 许可证 - 详见 [LICENSE](LICENSE) 文件

