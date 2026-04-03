# 🔥 地狱模式扩展计划

## 当前状态

**已有地狱模式的关卡：**
- ✅ P9 - Transformer 星（《Attention is All You Need》论文）
- ✅ P17-P21 - 帝国篇全系列（EDICT 生产级实践）

**待添加地狱模式的关卡：** P1-P8, P10-P16（共 15 个）

---

## 优先级分级

### 🔴 高优先级（经典论文解读）

这些关卡对应重要的学术突破，适合深度论文解读：

| 关卡 | 论文 | 理由 |
|------|------|------|
| **P10 预训练星** | GPT-3: Language Models are Few-Shot Learners | 预训练范式的里程碑，In-Context Learning 的起点 |
| **P11 后训练星** | InstructGPT: Training language models to follow instructions with human feedback | RLHF 的开山之作，ChatGPT 的技术基础 |
| **P5 ReAct 星 2** | ReAct: Synergizing Reasoning and Acting in Language Models | Agent 推理的核心论文 |
| **P7 记忆星 2** | RAG: Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks | RAG 的原始论文 |
| **P8 多 Agent 星** | CAMEL: Communicative Agents for "Mind" Exploration of Large Scale Language Model Society | 多 Agent 协作的经典研究 |

### 🟡 中优先级（工程实践深度）

这些关卡更偏工程，适合生产级实现和最佳实践：

| 关卡 | 内容方向 |
|------|---------|
| **P4 ReAct 星 1** | 生产级 ReAct 循环：超时控制、死循环检测、成本预算、日志审计 |
| **P6 记忆星 1** | Context 压缩算法：LongLLMLingua、Selective Context、动态摘要 |
| **P12 实战星 1** | 天气 Agent 的完整生产部署：Docker、监控、告警、灰度发布 |
| **P13 实战星 2** | 代码审查 Agent 的 CI/CD 集成：GitHub Actions、质量门禁、自动修复 |
| **P14 框架星 1** | LangGraph 深度：StateGraph 源码解析、Checkpointer 机制、流式输出 |
| **P15 框架星 2** | CrewAI 深度：任务编排引擎、Agent 通信协议、性能优化 |

### 🟢 低优先级（补充完整性）

这些关卡内容相对基础，地狱模式可以简化或延后：

| 关卡 | 内容方向 |
|------|---------|
| **P1 LLM 星** | Tokenizer 深度：BPE/WordPiece/SentencePiece 算法对比、多语言处理 |
| **P2 工具星 1** | JSON Schema 高级特性：oneOf/anyOf、$ref 引用、自定义验证器 |
| **P3 工具星 2** | 工具安全：沙箱隔离、权限控制、注入攻击防御 |
| **P16 毕业星** | Agent 职业路径：研究方向、开源项目、求职建议 |

---

## 第一批实施计划（5 个高优先级）

### P10 - GPT-3 论文解读

**论文：** Language Models are Few-Shot Learners (2020)

**地狱模式内容：**
1. **Few-Shot Learning 的突破**
   - Zero-shot / One-shot / Few-shot 对比
   - In-Context Learning 的发现
   - 为什么规模是关键（Scaling Laws）

2. **GPT-3 架构细节**
   - 175B 参数分布（96 层 Transformer）
   - Sparse Attention 优化
   - 训练数据集（CommonCrawl + Books + Wikipedia）

3. **关键实验结果**
   - SuperGLUE 基准测试
   - 翻译、问答、代码生成能力
   - Few-shot 性能随模型规模的变化曲线

4. **局限性与启示**
   - 幻觉问题（Hallucination）
   - 偏见和有害内容
   - 为什么需要 RLHF（引出 P11）

---

### P11 - InstructGPT 论文解读

**论文：** Training language models to follow instructions with human feedback (2022)

**地狱模式内容：**
1. **RLHF 三阶段流程**
   - SFT：监督微调（Supervised Fine-Tuning）
   - RM：奖励模型训练（Reward Model）
   - PPO：强化学习优化（Proximal Policy Optimization）

2. **人类反馈的收集**
   - 标注员招募和培训
   - 偏好数据标注（A vs B 哪个更好）
   - 质量控制和一致性检查

3. **关键技术细节**
   - PPO 算法的 KL 散度约束（防止过度优化）
   - Reward Hacking 问题和解决方案
   - 为什么 1.3B InstructGPT 优于 175B GPT-3

4. **对齐的哲学**
   - Helpful、Honest、Harmless（3H 原则）
   - Constitutional AI 的思想
   - 红队测试（Red Teaming）

---

### P5 - ReAct 论文解读

**论文：** ReAct: Synergizing Reasoning and Acting in Language Models (2023)

**地狱模式内容：**
1. **ReAct 的核心创新**
   - Thought（推理）+ Action（行动）的交替
   - 与 Chain-of-Thought 的区别
   - 与 ReWOO（Reasoning WithOut Observation）的对比

2. **实验设计**
   - HotpotQA（多跳问答）
   - FEVER（事实验证）
   - ALFWorld（交互式环境）
   - 成功率对比：ReAct vs CoT vs Act-only

3. **Prompt 工程**
   - Few-shot 示例的设计
   - Thought 的格式化（"I need to..."）
   - 错误恢复机制（"This didn't work, I should try..."）

4. **局限性与改进方向**
   - 幻觉导致的错误行动
   - 工具调用成本
   - Reflexion（自我反思）的改进

---

### P7 - RAG 论文解读

**论文：** Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks (2020)

**地狱模式内容：**
1. **RAG 的动机**
   - 参数化知识 vs 非参数化知识
   - 知识更新的困境
   - 幻觉问题的缓解

2. **RAG 架构**
   - Dense Passage Retrieval (DPR)
   - FAISS 向量索引
   - Generator（BART）与 Retriever 的联合训练

3. **两种 RAG 变体**
   - RAG-Sequence：整个序列用同一组文档
   - RAG-Token：每个 token 可以用不同文档
   - 性能和效率的权衡

4. **现代 RAG 的演进**
   - Self-RAG（自我检索）
   - CRAG（纠正式 RAG）
   - HyDE（假设文档嵌入）
   - Reranking 和 Query Rewriting

---

### P8 - CAMEL 论文解读

**论文：** CAMEL: Communicative Agents for "Mind" Exploration of Large Scale Language Model Society (2023)

**地狱模式内容：**
1. **角色扮演框架**
   - AI User Agent + AI Assistant Agent
   - 任务分解和协作
   - Inception Prompting（初始化对话）

2. **实验设计**
   - 代码生成任务
   - 数学推理任务
   - 对话质量评估

3. **多 Agent 的挑战**
   - 对话发散（Conversation Drift）
   - 角色混淆（Role Confusion）
   - 终止条件设计

4. **与其他框架对比**
   - CAMEL vs AutoGen vs MetaGPT
   - 角色驱动 vs 任务驱动
   - 适用场景分析

---

## 实施步骤

### 阶段 1：高优先级论文（本次）
- [ ] P10 - GPT-3 论文
- [ ] P11 - InstructGPT 论文
- [ ] P5 - ReAct 论文
- [ ] P7 - RAG 论文
- [ ] P8 - CAMEL 论文

### 阶段 2：中优先级工程实践
- [ ] P4, P6, P12-P15（6 个关卡）

### 阶段 3：低优先级补充
- [ ] P1-P3, P16（4 个关卡）

---

## 内容结构模板

每个地狱模式包含：

```javascript
hell: {
  sections: [
    {
      type: 'story',
      html: `🔥 地狱模式 - 论文深度解读`
    },
    {
      type: 'concept',
      title: '📄 论文背景',
      html: `作者、发表时间、引用量、影响力`
    },
    {
      type: 'concept',
      title: '💡 核心创新',
      html: `3-5 个关键突破点`
    },
    {
      type: 'code',
      title: '💻 关键算法实现',
      code: `...`,
      explanation: `...`
    },
    {
      type: 'concept',
      title: '📊 实验结果',
      html: `基准测试、对比实验、消融实验`
    },
    {
      type: 'pitfalls',
      title: '⚠️ 局限性与改进方向',
      items: [...]
    },
    {
      type: 'quiz',
      q: '论文的核心贡献是什么？',
      opts: [...],
      ans: 1
    }
  ]
}
```

---

## 预期成果

完成后：
- ✅ 21 个关卡全部拥有地狱模式
- ✅ 覆盖 6 篇经典论文（Attention、GPT-3、InstructGPT、ReAct、RAG、CAMEL）
- ✅ 成为最全面的 AI Agent 学习资源

用户可以：
- 🟢 简单模式：快速入门
- 🟡 困难模式：工程实践
- 🔴 地狱模式：论文级深度

从小学生到研究者，一站式学习路径！
