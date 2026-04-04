# 🚀 Agent 星际冒险 - 完整升级方案（最终版）

## 📋 升级目标

将现有的 8 个关卡游戏升级为支持难度分级的完整学习系统：
- ✅ 每个关卡包含 3 个难度：🟢 简单、🟡 困难、🔴 地狱（锁定）
- ✅ 所有关卡可随意进入（已完成）
- ✅ 代码示例精简到 20-30 行，聚焦核心逻辑
- ✅ 保持游戏性和趣味性

---

## 🎮 难度分级设计

### 三个难度等级

| 难度 | 图标 | 目标用户 | 内容特点 | 代码量 |
|------|------|----------|----------|--------|
| **简单** | 🟢 | 小学生、初学者 | 故事化讲解、互动游戏、概念理解 | 无代码或伪代码 |
| **困难** | 🟡 | 工程师、开发者 | 技术细节、精简代码示例、最佳实践、常见坑点 | 20-30 行核心代码 |
| **地狱** | 🔴 | 研究者（未来） | 论文级深度、数学公式、完整实现 | 锁定状态 |

### UI 设计

每个关卡顶部显示难度切换器：
```
┌─────────────────────────────────────┐
│  🟢 简单   🟡 困难   🔴 地狱 🔒     │
└─────────────────────────────────────┘
```

点击切换难度，内容动态切换，无需重新加载。

---

## 📚 完整关卡内容规划（8 关）

### 1. 🌍 LLM 星

#### 🟢 简单模式
- **故事**：ARIA 介绍 LLM 是什么
- **概念**：语言模型、预测下一个词
- **互动**：管道动画展示 LLM 工作流程
- **测试**：2 个选择题

#### 🟡 困难模式
- **故事**：同简单模式
- **技术细节**：
  ```python
  # LLM API 调用示例
  import anthropic

  client = anthropic.Anthropic(api_key="your-key")

  response = client.messages.create(
      model="claude-opus-4-6",
      max_tokens=1024,
      messages=[
          {"role": "user", "content": "解释量子计算"}
      ]
  )

  print(response.content[0].text)
  ```
- **核心参数**：
  - `temperature`: 0-1，控制随机性
  - `max_tokens`: 最大输出长度
  - `top_p`: 核采样参数
- **常见坑点**：
  - ⚠️ Context Window 超限导致报错
  - ⚠️ Temperature 设置不当影响输出质量
  - ⚠️ 没有处理 API 超时和重试
- **测试**：3 个技术问题

---

### 2. 🔧 工具星（拆分为 2 关）

#### 2.1 🔧 工具星 1：工具定义

##### 🟢 简单模式
- **故事**：给 AI 装上"手脚"
- **概念**：什么是工具、工具的作用
- **拖拽游戏**：匹配任务和工具
- **测试**：工具的作用是什么？

##### 🟡 困难模式
- **工具定义示例**：
  ```python
  # 定义一个工具
  tools = [{
      "name": "get_weather",
      "description": "获取指定城市的天气信息",
      "input_schema": {
          "type": "object",
          "properties": {
              "city": {
                  "type": "string",
                  "description": "城市名称"
              }
          },
          "required": ["city"]
      }
  }]
  ```
- **最佳实践**：
  - ✅ description 要清晰明确
  - ✅ 参数类型要严格定义
  - ✅ 提供示例值
- **常见坑点**：
  - ⚠️ description 模糊导致 LLM 误用工具
  - ⚠️ 缺少 required 字段导致参数缺失
- **测试**：如何定义一个好的工具？

#### 2.2 🔧 工具星 2：工具执行

##### 🟢 简单模式
- **故事**：工具怎么被调用
- **模拟器**：点击操控 Agent 调用工具
- **测试**：工具调用的流程

##### 🟡 困难模式
- **工具执行示例**：
  ```python
  # 工具执行与错误处理
  def execute_tool(tool_name, tool_input):
      try:
          if tool_name == "get_weather":
              return get_weather(**tool_input)
      except KeyError as e:
          return {"error": f"缺少参数: {e}"}
      except Timeout:
          return {"error": "API 超时"}
      except Exception as e:
          return {"error": str(e)}
  ```
- **错误处理策略**：
  - 参数验证
  - 超时处理
  - 重试机制
  - 错误信息返回给 LLM
- **常见坑点**：
  - ⚠️ 工具超时没处理 → Agent 卡死
  - ⚠️ 错误信息不返回给 LLM → Agent 无法自我修复
- **测试**：错误处理的重要性

---

### 3. 🔁 ReAct 星（拆分为 2 关）

#### 3.1 🔁 ReAct 星 1：基础循环

##### 🟢 简单模式
- **故事**：Agent 的思维方式
- **概念**：思考 → 行动 → 观察
- **管道动画**：展示 ReAct 循环
- **测试**：ReAct 的顺序

##### 🟡 困难模式
- **ReAct 循环实现**：
  ```python
  # 完整的 ReAct 循环
  def react_loop(query, max_iter=5):
      messages = [{"role": "user", "content": query}]

      for i in range(max_iter):
          response = client.messages.create(
              model="claude-opus-4-6",
              max_tokens=2048,
              tools=tools,
              messages=messages
          )

          if response.stop_reason == "tool_use":
              tool_use = next(b for b in response.content
                            if b.type == "tool_use")
              result = execute_tool(tool_use.name, tool_use.input)

              messages.append({"role": "assistant", "content": response.content})
              messages.append({
                  "role": "user",
                  "content": [{
                      "type": "tool_result",
                      "tool_use_id": tool_use.id,
                      "content": json.dumps(result)
                  }]
              })
          elif response.stop_reason == "end_turn":
              return response.content[0].text

      return "达到最大迭代次数"
  ```
- **关键点**：
  - 循环控制（max_iterations）
  - 消息历史管理
  - 停止条件判断
- **常见坑点**：
  - ⚠️ 没有设置 max_iterations → 无限循环
  - ⚠️ 消息历史过长 → Context Window 超限
- **测试**：ReAct 循环的关键要素

#### 3.2 🔁 ReAct 星 2：多步推理

##### 🟢 简单模式
- **故事**：复杂任务的分解
- **概念**：Chain-of-Thought
- **测试**：多步推理的好处

##### 🟡 困难模式
- **多步推理示例**：
  ```python
  # 引导 LLM 进行多步推理
  system_prompt = """
  在回答问题前，请按以下步骤思考：
  1. 分析问题：我需要什么信息？
  2. 规划步骤：我应该先做什么，再做什么？
  3. 执行：逐步调用工具
  4. 总结：整合结果给出答案
  """
  ```
- **规划策略**：
  - 任务分解
  - 依赖关系分析
  - 并行执行优化
- **测试**：如何引导 Agent 进行规划？

---

### 4. 🧠 记忆星（拆分为 2 关）

#### 4.1 🧠 记忆星 1：短期记忆

##### 🟢 简单模式
- **故事**：对话上下文
- **概念**：Context Window
- **测试**：短期记忆的特点

##### 🟡 困难模式
- **Context 管理**：
  ```python
  # Token 计数与管理
  def count_tokens(messages):
      # 使用 tiktoken 或 API 估算
      return sum(len(m["content"]) // 4 for m in messages)

  def trim_context(messages, max_tokens=100000):
      while count_tokens(messages) > max_tokens:
          # 保留系统消息和最近的消息
          if len(messages) > 3:
              messages.pop(1)  # 移除最早的用户消息
          else:
              break
      return messages
  ```
- **压缩策略**：
  - 滑动窗口
  - 摘要压缩
  - 关键信息提取
- **常见坑点**：
  - ⚠️ Context 超限导致 API 报错
  - ⚠️ 盲目删除导致丢失关键信息
- **测试**：Context 管理的策略

#### 4.2 🧠 记忆星 2：长期记忆

##### 🟢 简单模式
- **故事**：数据库存储
- **概念**：RAG 检索增强生成
- **测试**：长期记忆的作用

##### 🟡 困难模式
- **RAG 实现**：
  ```python
  # 向量数据库 + RAG
  import chromadb

  # 初始化
  client = chromadb.Client()
  collection = client.create_collection("memory")

  # 存储记忆
  collection.add(
      documents=["用户喜欢喝咖啡"],
      ids=["mem_1"]
  )

  # 检索相关记忆
  results = collection.query(
      query_texts=["用户的饮品偏好"],
      n_results=3
  )

  # 在 Agent 中使用
  relevant_memories = results['documents'][0]
  enhanced_prompt = f"相关记忆：{relevant_memories}\n\n用户问题：{query}"
  ```
- **关键技术**：
  - 向量数据库（Chroma/Pinecone）
  - Embedding 模型
  - 相似度检索
- **常见坑点**：
  - ⚠️ 检索结果不相关 → Embedding 模型选择问题
  - ⚠️ 记忆过多导致检索慢
- **测试**：RAG 的核心流程

---

### 5. 🌐 多 Agent 星（拆分为 2 关）

#### 5.1 🌐 多 Agent 星 1：架构模式

##### 🟢 简单模式
- **故事**：Agent 团队协作
- **概念**：指挥官 + 专业 Agent
- **测试**：多 Agent 的优势

##### 🟡 困难模式
- **Supervisor 模式**：
  ```python
  # 指挥官 Agent 分配任务
  def supervisor_agent(task):
      # 1. 分析任务
      plan = llm_call(f"分解任务：{task}")

      # 2. 分配给专业 Agent
      results = []
      if "搜索" in plan:
          results.append(search_agent.run())
      if "分析" in plan:
          results.append(analysis_agent.run())

      # 3. 汇总结果
      final = llm_call(f"汇总：{results}")
      return final
  ```
- **架构模式**：
  - Supervisor（监督者）
  - Pipeline（流水线）
  - Parallel（并行）
- **测试**：如何选择架构模式？

#### 5.2 🌐 多 Agent 星 2：通信协作

##### 🟢 简单模式
- **故事**：Agent 之间怎么传递信息
- **概念**：消息队列
- **测试**：通信的重要性

##### 🟡 困难模式
- **Agent 通信**：
  ```python
  # 简单的消息传递
  class AgentMessage:
      def __init__(self, from_agent, to_agent, content):
          self.from_agent = from_agent
          self.to_agent = to_agent
          self.content = content

  # Agent 之间通信
  search_result = search_agent.run(query)
  message = AgentMessage("search", "analysis", search_result)
  analysis_result = analysis_agent.run(message.content)
  ```
- **关键问题**：
  - 消息格式标准化
  - 状态同步
  - 冲突解决
- **测试**：多 Agent 通信的挑战

---

### 6. ⚡ Transformer 星

#### 🟢 简单模式
- **故事**：AI 大脑的核心零件
- **概念**：Attention 注意力机制
- **管道动画**：Transformer 处理流程
- **测试**：Attention 的作用

#### 🟡 困难模式
- **Attention 机制**：
  ```python
  # Self-Attention 核心计算（简化版）
  import numpy as np

  # Q, K, V 矩阵
  Q = np.random.rand(seq_len, d_model)
  K = np.random.rand(seq_len, d_model)
  V = np.random.rand(seq_len, d_model)

  # 计算注意力权重
  scores = Q @ K.T / np.sqrt(d_model)
  attention_weights = softmax(scores)

  # 加权求和
  output = attention_weights @ V
  ```
- **核心概念**：
  - Q/K/V 矩阵的含义
  - Multi-Head Attention
  - Position Encoding
- **论文要点**：
  - 《Attention Is All You Need》核心公式
  - Transformer 架构图解
- **测试**：Transformer 的核心创新

---

### 7. 🏋️ 预训练星

#### 🟢 简单模式
- **故事**：AI 怎么"上学"
- **概念**：预测下一个词、Loss 损失
- **测试**：预训练的目标

#### 🟡 困难模式
- **训练过程**：
  ```python
  # 预训练的核心循环（伪代码）
  for epoch in range(num_epochs):
      for batch in dataloader:
          # 前向传播
          logits = model(batch.input_ids)

          # 计算 Loss
          loss = cross_entropy(logits, batch.labels)

          # 反向传播
          loss.backward()

          # 更新参数
          optimizer.step()
          optimizer.zero_grad()
  ```
- **关键概念**：
  - 训练数据规模
  - Loss 函数
  - 优化器（Adam）
  - 学习率调度
- **成本分析**：
  - GPU 数量
  - 训练时间
  - 电力消耗
- **测试**：预训练的关键要素

---

### 8. 🎓 后训练星

#### 🟢 简单模式
- **故事**：让 AI 变得有礼貌
- **概念**：SFT、RLHF、对齐
- **管道动画**：AI 成长路线
- **测试**：后训练的作用

#### 🟡 困难模式
- **RLHF 流程**：
  ```python
  # RLHF 简化流程
  # 1. 生成多个回答
  responses = [model.generate(prompt) for _ in range(4)]

  # 2. 人类排名
  rankings = human_rank(responses)  # [1, 3, 2, 4]

  # 3. 训练 Reward Model
  reward_model.train(responses, rankings)

  # 4. 用 Reward Model 引导训练
  for prompt in prompts:
      response = model.generate(prompt)
      reward = reward_model.score(response)
      model.update(reward)  # PPO 算法
  ```
- **核心概念**：
  - SFT（监督微调）
  - Reward Model
  - PPO 算法
  - HHH 原则（Helpful, Harmless, Honest）
- **微调应用**：
  - 医疗、法律、代码等领域微调
  - 成本对比：预训练 vs 微调
- **测试**：RLHF 的核心流程

---

## 🛠️ 技术实现方案

### 1. 数据结构设计

```javascript
const PLANETS = [
  {
    id: 'p1',
    icon: '🌍',
    name: 'LLM 星',
    desc: '认识 AI 大脑',

    // 每个关卡包含多个难度
    difficulties: {
      easy: {
        sections: [
          { type: 'story', html: '...' },
          { type: 'concept', title: '...', html: '...' },
          { type: 'quiz', q: '...', opts: [...], ans: 0 }
        ]
      },
      hard: {
        sections: [
          { type: 'story', html: '...' },
          { type: 'concept', title: '...', html: '...' },
          { type: 'code', title: '...', code: '...', explanation: '...' },
          { type: 'pitfalls', title: '常见坑点', items: [...] },
          { type: 'quiz', q: '...', opts: [...], ans: 0 }
        ]
      },
      hell: {
        locked: true,
        sections: []
      }
    }
  },
  // ... 更多关卡
];
```

### 2. 新增内容类型

- **code**：代码示例 + 解释
- **pitfalls**：常见坑点列表
- **bestpractices**：最佳实践

### 3. 渲染逻辑

```javascript
function renderLevel() {
  const planet = PLANETS.find(p => p.id === currentPlanetId);
  const difficulty = state.currentDifficulty; // 'easy' | 'hard' | 'hell'
  const sections = planet.difficulties[difficulty].sections;

  // 渲染难度切换器
  html += renderDifficultySwitcher();

  // 渲染当前难度的内容
  sections.forEach(section => {
    html += renderSection(section);
  });
}
```

---

## 📅 实施步骤

### 第一步：修改核心框架（30 分钟）
1. ✅ 添加难度切换器 CSS
2. ✅ 修改游戏状态，支持 currentDifficulty
3. ✅ 修改数据结构，支持 difficulties
4. ✅ 修改渲染逻辑，支持难度切换

### 第二步：重构所有关卡内容（1.5-2 小时）
1. 重构 LLM 星（简单 + 困难）
2. 重构工具星 1 & 2（简单 + 困难）
3. 重构 ReAct 星 1 & 2（简单 + 困难）
4. 重构记忆星 1 & 2（简单 + 困难）
5. 重构多 Agent 星 1 & 2（简单 + 困难）
6. 重构 Transformer 星（简单 + 困难）
7. 重构预训练星（简单 + 困难）
8. 重构后训练星（简单 + 困难）

### 第三步：测试和优化（30 分钟）
1. 测试所有关卡的难度切换
2. 测试代码示例的可读性
3. 优化响应式布局
4. 修复 bug

---

## ✅ 完成标准

- ✅ 所有 8 个关卡都有简单和困难两个难度
- ✅ 困难模式的代码示例精简到 20-30 行
- ✅ 每个关卡都有常见坑点和最佳实践
- ✅ 难度切换流畅，无需重新加载
- ✅ 保持游戏性和趣味性

---

## 🎯 预期效果

完成后，这个游戏将成为：
- **孩子的 AI 启蒙工具**（简单模式）
- **工程师的 Agent 开发速成指南**（困难模式）
- **未来可扩展的深度学习平台**（地狱模式）

---

**现在开始执行！预计总时间：2-3 小时**
