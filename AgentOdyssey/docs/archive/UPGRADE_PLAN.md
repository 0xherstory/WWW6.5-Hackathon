# 🚀 Agent 星际冒险 - 升级方案

## 📋 总体目标

将现有的 8 个关卡游戏升级为：
- ✅ 支持难度分级（简单/困难/地狱）
- ✅ 拆分 Agent 关卡为更细致的小关卡
- ✅ 新增深度内容（Transformer 论文、实战代码、框架对比）
- ✅ 所有关卡可随意进入（已完成）

---

## 🎮 难度分级系统设计

### 三个难度等级

| 难度 | 图标 | 目标用户 | 内容特点 |
|------|------|----------|----------|
| **简单** | 🟢 | 小学生、初学者 | 故事化讲解、互动游戏、概念理解 |
| **困难** | 🟡 | 工程师、开发者 | 技术细节、代码示例、最佳实践、常见坑点 |
| **地狱** | 🔴 | 研究者（未来） | 论文级深度、数学公式、完整实现、性能优化 |

### UI 设计

每个关卡进入后，顶部显示难度切换器：
```
┌─────────────────────────────────────┐
│  🟢 简单   🟡 困难   🔴 地狱(锁定)  │
└─────────────────────────────────────┘
```

点击切换难度，内容动态切换，无需重新加载页面。

---

## 📚 新的关卡结构（共 16 关）

### 第一部分：AI 基础（4 关）

#### 1. 🌍 LLM 星
- 🟢 简单：什么是语言模型、预测下一个词
- 🟡 困难：Token 化、Context Window、Temperature/Top-p 参数详解

#### 2. ⚡ Transformer 星（深化）
- 🟢 简单：Attention 注意力机制的直观理解
- 🟡 困难：Q/K/V 矩阵、Multi-Head Attention、Position Encoding、论文核心公式

#### 3. 🏋️ 预训练星
- 🟢 简单：AI 怎么"上学"、Loss 损失函数
- 🟡 困难：训练数据集、优化器（Adam/SGD）、学习率调度、梯度裁剪

#### 4. 🎓 后训练星
- 🟢 简单：SFT、RLHF、对齐
- 🟡 困难：PPO 算法、Reward Model、Constitutional AI、红队测试

---

### 第二部分：Agent 核心（8 关，拆分细化）

#### 5. 🔧 工具星 1：工具定义
- 🟢 简单：什么是工具、工具的作用
- 🟡 困难：
  ```python
  # 完整的工具定义示例
  tools = [{
      "name": "get_weather",
      "description": "获取指定城市的天气信息",
      "input_schema": {
          "type": "object",
          "properties": {
              "city": {
                  "type": "string",
                  "description": "城市名称，如'北京'"
              },
              "unit": {
                  "type": "string",
                  "enum": ["celsius", "fahrenheit"],
                  "description": "温度单位"
              }
          },
          "required": ["city"]
      }
  }]

  # 最佳实践：
  # 1. description 要清晰明确
  # 2. 参数类型要严格定义
  # 3. 提供默认值和枚举值
  ```

#### 6. 🔧 工具星 2：工具执行与错误处理
- 🟢 简单：工具怎么被调用、返回结果
- 🟡 困难：
  ```python
  # 错误处理最佳实践
  def execute_tool(tool_name, tool_input):
      try:
          if tool_name == "get_weather":
              result = get_weather(**tool_input)
              return {"success": True, "data": result}
      except KeyError as e:
          return {"success": False, "error": f"缺少参数: {e}"}
      except requests.Timeout:
          return {"success": False, "error": "API 超时"}
      except Exception as e:
          return {"success": False, "error": str(e)}

  # 常见坑点：
  # 1. 工具超时没处理 → 整个 Agent 卡死
  # 2. 参数验证不严格 → 注入攻击风险
  # 3. 错误信息不返回给 LLM → Agent 无法自我修复
  ```

#### 7. 🔁 ReAct 星 1：基础循环
- 🟢 简单：思考→行动→观察的循环
- 🟡 困难：
  ```python
  # 完整的 ReAct 循环实现
  def react_loop(user_query, max_iterations=10):
      messages = [{"role": "user", "content": user_query}]

      for i in range(max_iterations):
          response = client.messages.create(
              model="claude-opus-4-6",
              max_tokens=4096,
              tools=tools,
              messages=messages
          )

          # 检查是否要调用工具
          if response.stop_reason == "tool_use":
              # 提取工具调用
              tool_use = next(b for b in response.content if b.type == "tool_use")

              # 执行工具
              tool_result = execute_tool(tool_use.name, tool_use.input)

              # 构建工具结果消息
              messages.append({"role": "assistant", "content": response.content})
              messages.append({
                  "role": "user",
                  "content": [{
                      "type": "tool_result",
                      "tool_use_id": tool_use.id,
                      "content": json.dumps(tool_result)
                  }]
              })
          elif response.stop_reason == "end_turn":
              # Agent 完成任务
              return response.content[0].text
          else:
              # 异常情况
              break

      return "达到最大迭代次数"
  ```

#### 8. 🔁 ReAct 星 2：多步推理与规划
- 🟢 简单：复杂任务的分解
- 🟡 困难：Chain-of-Thought、思维树（Tree of Thoughts）、规划策略

#### 9. 🧠 记忆星 1：短期记忆
- 🟢 简单：对话上下文、Context Window
- 🟡 困难：
  - Token 计数与管理
  - 上下文压缩策略
  - 滑动窗口 vs 摘要压缩

#### 10. 🧠 记忆星 2：长期记忆
- 🟢 简单：数据库存储、RAG 检索
- 🟡 困难：
  ```python
  # 向量数据库 + RAG 实现
  from anthropic import Anthropic
  import chromadb

  # 1. 初始化向量数据库
  chroma_client = chromadb.Client()
  collection = chroma_client.create_collection("agent_memory")

  # 2. 存储记忆
  def store_memory(text, metadata):
      collection.add(
          documents=[text],
          metadatas=[metadata],
          ids=[f"mem_{timestamp}"]
      )

  # 3. 检索相关记忆
  def retrieve_memory(query, n_results=3):
      results = collection.query(
          query_texts=[query],
          n_results=n_results
      )
      return results['documents'][0]

  # 4. 在 Agent 中使用
  def agent_with_memory(user_query):
      # 检索相关历史
      relevant_memories = retrieve_memory(user_query)

      # 构建增强的 prompt
      enhanced_prompt = f"""
      相关历史记忆：
      {relevant_memories}

      用户问题：
      {user_query}
      """

      # 调用 LLM
      response = client.messages.create(...)
  ```

#### 11. 🌐 多 Agent 星 1：架构模式
- 🟢 简单：指挥官 + 专业 Agent 的团队协作
- 🟡 困难：
  - Supervisor 模式
  - Pipeline 模式
  - Parallel 模式
  - Hierarchical 模式

#### 12. 🌐 多 Agent 星 2：通信与协作
- 🟢 简单：Agent 之间怎么传递信息
- 🟡 困难：
  - 消息队列设计
  - 状态同步
  - 冲突解决
  - 性能优化

---

### 第三部分：实战与框架（4 关）

#### 13. 💻 实战 1：最简 Agent
- 🟢 简单：跟着步骤做一个天气查询 Agent
- 🟡 困难：
  ```python
  # 完整的生产级代码
  import anthropic
  import os
  import logging
  from typing import Dict, Any, List

  # 配置日志
  logging.basicConfig(level=logging.INFO)
  logger = logging.getLogger(__name__)

  class WeatherAgent:
      def __init__(self, api_key: str):
          self.client = anthropic.Anthropic(api_key=api_key)
          self.tools = self._define_tools()

      def _define_tools(self) -> List[Dict]:
          return [{
              "name": "get_weather",
              "description": "获取指定城市的实时天气信息",
              "input_schema": {
                  "type": "object",
                  "properties": {
                      "city": {"type": "string", "description": "城市名称"}
                  },
                  "required": ["city"]
              }
          }]

      def get_weather(self, city: str) -> Dict[str, Any]:
          """实际的天气 API 调用"""
          # 这里应该调用真实的天气 API
          # 示例使用模拟数据
          return {
              "city": city,
              "temperature": 22,
              "condition": "晴天",
              "humidity": 65
          }

      def run(self, user_query: str, max_iterations: int = 5) -> str:
          """运行 Agent"""
          messages = [{"role": "user", "content": user_query}]

          for iteration in range(max_iterations):
              logger.info(f"迭代 {iteration + 1}/{max_iterations}")

              try:
                  response = self.client.messages.create(
                      model="claude-opus-4-6",
                      max_tokens=2048,
                      tools=self.tools,
                      messages=messages
                  )

                  if response.stop_reason == "tool_use":
                      # 处理工具调用
                      tool_use = next(b for b in response.content if b.type == "tool_use")
                      logger.info(f"调用工具: {tool_use.name}")

                      # 执行工具
                      if tool_use.name == "get_weather":
                          result = self.get_weather(**tool_use.input)
                      else:
                          result = {"error": "未知工具"}

                      # 添加到消息历史
                      messages.append({"role": "assistant", "content": response.content})
                      messages.append({
                          "role": "user",
                          "content": [{
                              "type": "tool_result",
                              "tool_use_id": tool_use.id,
                              "content": json.dumps(result, ensure_ascii=False)
                          }]
                      })

                  elif response.stop_reason == "end_turn":
                      # 任务完成
                      final_text = next(b.text for b in response.content if hasattr(b, 'text'))
                      logger.info("任务完成")
                      return final_text

              except Exception as e:
                  logger.error(f"错误: {e}")
                  return f"发生错误: {str(e)}"

          return "达到最大迭代次数"

  # 使用示例
  if __name__ == "__main__":
      agent = WeatherAgent(api_key=os.getenv("ANTHROPIC_API_KEY"))
      result = agent.run("北京今天天气怎么样？适合出门吗？")
      print(result)
  ```

#### 14. 💻 实战 2：代码审查 Agent
- 🟢 简单：Agent 怎么帮你审查代码
- 🟡 困难：完整的代码审查 Agent 实现（结合 GitHub API）

#### 15. 📚 框架对比：LangChain vs LangGraph
- 🟢 简单：各个框架的特点
- 🟡 困难：
  - 同一个任务用不同框架实现的对比
  - 性能对比
  - 适用场景分析
  - 迁移指南

#### 16. 📚 框架对比：AutoGen vs CrewAI
- 🟢 简单：多 Agent 框架的选择
- 🟡 困难：实际项目中的框架选型决策树

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
        label: '简单',
        icon: '🟢',
        sections: [
          { type: 'story', html: '...' },
          { type: 'concept', title: '...', html: '...' },
          { type: 'quiz', q: '...', opts: [...], ans: 0 }
        ]
      },
      hard: {
        label: '困难',
        icon: '🟡',
        sections: [
          { type: 'story', html: '...' },
          { type: 'concept', title: '...', html: '...' },
          { type: 'code', title: '...', code: '...', explanation: '...' },
          { type: 'pitfalls', title: '常见坑点', items: [...] },
          { type: 'quiz', q: '...', opts: [...], ans: 0 }
        ]
      },
      hell: {
        label: '地狱',
        icon: '🔴',
        locked: true, // 未来开放
        sections: []
      }
    }
  },
  // ... 更多关卡
];
```

### 2. 新增内容类型

除了现有的 story、concept、quiz、drag、sim、pipe，新增：

- **code**：完整代码示例 + 逐行解释
- **pitfalls**：常见坑点列表
- **comparison**：对比表格
- **practice**：实战练习（可编辑代码）
- **formula**：数学公式展示（用 KaTeX 渲染）

### 3. UI 改进

- 难度切换器（顶部固定）
- 代码高亮（使用 Prism.js 或内置）
- 可折叠的详细内容
- 进度追踪（每个难度独立追踪）

---

## 📅 实施计划

### 阶段 1（本次）：核心框架 + 示例关卡
- ✅ 实现难度分级系统的 UI 和逻辑
- ✅ 重构 2-3 个关卡作为示例（LLM 星、工具星 1、工具星 2）
- ✅ 验证方向和效果

### 阶段 2：完成 Agent 关卡拆分
- 完成 8 个 Agent 相关关卡的拆分和深化

### 阶段 3：深化 Transformer 和实战关卡
- Transformer 论文深度解读
- 实战代码教程

### 阶段 4：框架对比和地狱模式
- 框架对比关卡
- 开放地狱难度（论文级深度）

---

## ❓ 需要你确认的问题

1. **这个方案的方向对吗？** 特别是难度分级的内容划分
2. **代码示例的详细程度** - 困难模式的代码示例是否足够详细？
3. **关卡数量** - 16 个关卡会不会太多？需要调整吗？
4. **优先级** - 如果时间有限，哪些关卡最重要？

确认后我立即开始实现阶段 1！
