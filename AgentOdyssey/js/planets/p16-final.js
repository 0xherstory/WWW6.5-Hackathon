// 关卡 16：毕业星（完整重构）

PLANETS.push({
  id: 'p16',
  icon: '🎓',
  num: '星球 16',
  name: '毕业星',
  desc: '总结所有知识，成为真正的 Agent 开发者！',

  difficulties: {
    // 🟢 简单模式
    easy: {
      sections: [
        {
          type: 'story',
          html: `
            <div class="speaker">🎓 毕业星</div>
            <p>飞船降落在最后一颗星球——毕业星！</p>
            <div class="chat-bubble robot">
              🤖 ARIA：船长！你完成了整个 Agent 宇宙的探索！<br>
              从 LLM 到多 Agent，从理论到实战，你已经掌握了核心知识！
            </div>
            <div class="chat-bubble">
              👦 你：感觉学了好多！但我真的学会了吗？
            </div>
            <div class="chat-bubble robot">
              🤖 ARIA：让我们来回顾一下你的旅程，<br>
              然后告诉你接下来该怎么做！
            </div>
          `
        },
        {
          type: 'concept',
          title: '🗺️ 你的 Agent 知识地图',
          html: `
            <div style="margin:14px 0;padding:14px;background:rgba(0,229,255,.06);border-radius:12px;line-height:2">
              <strong>基础层：</strong><br>
              ✅ LLM 是什么（预测下一个词）<br>
              ✅ 工具调用（让 AI 能做事）<br>
              ✅ ReAct（思考+行动循环）<br>
              ✅ 记忆系统（短期+长期）<br>
              ✅ 多 Agent 协作<br><br>

              <strong>原理层：</strong><br>
              ✅ Transformer 架构<br>
              ✅ 预训练（学语言）<br>
              ✅ 后训练（学听话）<br><br>

              <strong>实战层：</strong><br>
              ✅ 天气助手 Agent<br>
              ✅ 代码审查 Agent<br>
              ✅ LangGraph / CrewAI 框架<br>
              ✅ 帝国系列（生产级架构）
            </div>
          `
        },
        {
          type: 'quiz',
          q: '你现在最想做的第一个 Agent 项目是什么？',
          opts: [
            '天气查询助手（入门级）',
            '个人知识库 + RAG（中级）',
            '代码审查 CI/CD 集成（高级）',
            '多 Agent 研究团队（挑战级）'
          ],
          ans: 0,
          feedback_ok: '🚀 太棒了！从天气助手开始是最好的选择——简单、有趣、能看到效果！做完之后再挑战更复杂的！',
          feedback_err: '每个选择都很好！不管选哪个，记住：先做一个能跑起来的版本，再慢慢改进！'
        }
      ]
    },

    // 🟡 困难模式
    hard: {
      sections: [
        {
          type: 'story',
          html: `
            <div class="speaker">🎓 毕业星（技术版）</div>
            <div class="chat-bubble robot">
              🤖 ARIA：船长！让我们总结生产级 Agent 的核心设计原则，<br>
              这是你从学习走向实战最重要的知识！
            </div>
          `
        },
        {
          type: 'code',
          title: '💻 生产级 Agent 完整架构',
          code: `import anthropic
import asyncio
import logging
import time
from dataclasses import dataclass, field
from typing import Any

client = anthropic.Anthropic()
logger = logging.getLogger(__name__)

@dataclass
class AgentConfig:
    model: str = "claude-opus-4-6"
    max_tokens: int = 2048
    max_turns: int = 10
    token_budget: int = 50_000
    tool_timeout: float = 10.0

@dataclass
class AgentMetrics:
    start_time: float = field(default_factory=time.time)
    total_tokens: int = 0
    tool_calls: int = 0
    errors: list = field(default_factory=list)

    @property
    def elapsed_ms(self):
        return (time.time() - self.start_time) * 1000

class ProductionAgent:
    def __init__(self, tools: list, config: AgentConfig = None):
        self.tools = tools
        self.config = config or AgentConfig()

    async def run(self, query: str, context: str = "") -> dict:
        metrics = AgentMetrics()
        system = f"你是一个专业助手。{context}" if context else "你是一个专业助手。"
        messages = [{"role": "user", "content": query}]

        for turn in range(self.config.max_turns):
            # Token 预算检查
            if metrics.total_tokens > self.config.token_budget:
                logger.warning(f"Token budget exceeded: {metrics.total_tokens}")
                return self._budget_exceeded_response(metrics)

            try:
                response = client.messages.create(
                    model=self.config.model,
                    max_tokens=self.config.max_tokens,
                    system=system,
                    tools=self.tools,
                    messages=messages
                )
            except Exception as e:
                metrics.errors.append(str(e))
                logger.error(f"API error on turn {turn}: {e}")
                return self._error_response(e, metrics)

            metrics.total_tokens += (
                response.usage.input_tokens + response.usage.output_tokens
            )

            if response.stop_reason == "end_turn":
                answer = next(
                    (b.text for b in response.content if hasattr(b, "text")), ""
                )
                logger.info(
                    f"Completed in {turn+1} turns, "
                    f"{metrics.total_tokens} tokens, "
                    f"{metrics.elapsed_ms:.0f}ms"
                )
                return {"success": True, "answer": answer, "metrics": metrics}

            # 并发执行工具调用
            tool_blocks = [b for b in response.content if b.type == "tool_use"]
            metrics.tool_calls += len(tool_blocks)

            tasks = [
                self._execute_tool(b.name, b.input)
                for b in tool_blocks
            ]
            results = await asyncio.gather(*tasks, return_exceptions=True)

            tool_results = []
            for block, result in zip(tool_blocks, results):
                if isinstance(result, Exception):
                    metrics.errors.append(str(result))
                    content = {"error": str(result)}
                else:
                    content = result
                tool_results.append({
                    "type": "tool_result",
                    "tool_use_id": block.id,
                    "content": str(content)
                })

            messages.append({"role": "assistant", "content": response.content})
            messages.append({"role": "user", "content": tool_results})

        return {"success": False, "answer": "达到最大轮次", "metrics": metrics}

    async def _execute_tool(self, name: str, inputs: dict) -> Any:
        return await asyncio.wait_for(
            asyncio.to_thread(self._call_tool, name, inputs),
            timeout=self.config.tool_timeout
        )

    def _call_tool(self, name: str, inputs: dict) -> Any:
        raise NotImplementedError("子类实现具体工具调用")

    def _budget_exceeded_response(self, metrics):
        return {"success": False, "answer": "超出 Token 预算", "metrics": metrics}

    def _error_response(self, error, metrics):
        return {"success": False, "answer": f"系统错误: {error}", "metrics": metrics}`,
          explanation: `
            <strong>生产级 Agent 的核心设计原则：</strong><br>
            • <strong>可观测性</strong>：每次调用记录 token、时间、错误<br>
            • <strong>可靠性</strong>：工具超时保护、API 错误处理<br>
            • <strong>成本控制</strong>：Token 预算硬限制<br>
            • <strong>可扩展性</strong>：基类 + 子类，工具调用可替换
          `
        },
        {
          type: 'pitfalls',
          title: '⚠️ 生产环境最重要的 5 条原则',
          items: [
            '先让它能跑，再让它跑得好：不要一开始就追求完美，先有一个能用的版本',
            '每个工具都可能失败：网络超时、API 限流、数据格式错误——每个工具都要有错误处理',
            '监控一切：没有监控的 Agent 是黑盒，出问题时无从排查',
            '成本会超出预期：测试时 10 次调用，生产时 10,000 次——提前设置预算告警',
            '用户会问奇怪的问题：测试时想不到的边界情况，用户一定会遇到——持续收集失败案例'
          ]
        },
        {
          type: 'quiz',
          q: '生产级 Agent 最重要的非功能性需求是什么？',
          opts: [
            '使用最新的模型',
            '可观测性（监控）+ 可靠性（错误处理）+ 成本控制',
            '代码写得最优雅',
            '使用最多的工具'
          ],
          ans: 1,
          feedback_ok: '✅ 完全正确！功能只是基础，生产系统的挑战在于：出问题时能快速定位（可观测性）、不会崩溃（可靠性）、不会破产（成本控制）！',
          feedback_err: '生产系统和 demo 的最大区别不是功能，而是：出问题时能排查（监控）、不会崩溃（错误处理）、成本可控（预算）！'
        }
      ]
    },

    // 🔴 地狱模式
    hell: {
      sections: [
        {
          type: 'story',
          html: `
            <div class="speaker">🔥 地狱模式 - Agent 评估体系</div>
            <div class="chat-bubble robot" style="border-color:var(--red)">
              🤖 ARIA：船长，最后一个挑战——<br>
              <strong>如何知道你的 Agent 做得好不好？</strong><br><br>
              这是 Agent 开发中最难的问题之一。<br>
              不像传统软件有明确的对错，Agent 的输出是开放式的——<br>
              "好"和"不好"的边界很模糊。<br><br>
              2024 年，Anthropic 发布了一套 Agent 评估框架，<br>
              让我们深入学习！
            </div>
          `
        },
        {
          type: 'concept',
          title: '📊 Agent 评估的三个维度',
          html: `
            <div style="margin:14px 0;padding:14px;background:rgba(0,229,255,.06);border-radius:12px;font-size:.9rem;line-height:1.9">
              <strong>1. 任务完成率（Task Completion Rate）</strong><br>
              • 定义：Agent 成功完成任务的比例<br>
              • 挑战：如何定义"成功"？<br>
              • 方法：人工标注 + 自动化检查<br>
              • 目标：>85% 对于生产系统<br><br>

              <strong>2. 工具使用效率（Tool Use Efficiency）</strong><br>
              • 定义：完成任务所需的工具调用次数<br>
              • 挑战：最少调用 ≠ 最好（可能漏掉信息）<br>
              • 方法：对比人类专家的工具使用路径<br>
              • 目标：不超过最优路径的 1.5 倍<br><br>

              <strong>3. 答案质量（Answer Quality）</strong><br>
              • 定义：答案的准确性、完整性、相关性<br>
              • 挑战：主观性强，难以自动化<br>
              • 方法：LLM-as-Judge（用另一个 LLM 评分）<br>
              • 目标：评分 >4/5
            </div>
          `
        },
        {
          type: 'code',
          title: '💻 Agent 自动化评估系统',
          code: `import anthropic
import json
from dataclasses import dataclass

client = anthropic.Anthropic()

@dataclass
class EvalCase:
    """一个评估用例"""
    query: str
    expected_tools: list[str]  # 期望调用的工具
    expected_answer_keywords: list[str]  # 答案应包含的关键词
    ground_truth: str  # 标准答案（可选）

def llm_judge(query: str, agent_answer: str, ground_truth: str) -> dict:
    """用 LLM 评估 Agent 的回答质量"""
    prompt = f"""你是一个严格的评估员。请评估 AI 助手的回答质量。

用户问题：{query}

标准答案：{ground_truth}

AI 助手的回答：{agent_answer}

请从以下维度评分（1-5分）：
1. 准确性：回答是否正确？
2. 完整性：是否涵盖了关键信息？
3. 相关性：是否回答了用户真正的问题？

输出 JSON：
{{"accuracy": 分数, "completeness": 分数, "relevance": 分数,
  "overall": 平均分, "reasoning": "评分理由"}}"""

    response = client.messages.create(
        model="claude-opus-4-6",
        max_tokens=512,
        messages=[{"role": "user", "content": prompt}]
    )
    text = response.content[0].text
    start, end = text.find("{"), text.rfind("}") + 1
    return json.loads(text[start:end])

def evaluate_agent(agent_run_func, eval_cases: list[EvalCase]) -> dict:
    """批量评估 Agent"""
    results = []

    for case in eval_cases:
        # 运行 Agent
        agent_result = agent_run_func(case.query)

        # 1. 工具使用评估
        used_tools = agent_result.get("tools_used", [])
        tool_precision = len(
            set(used_tools) & set(case.expected_tools)
        ) / max(len(used_tools), 1)
        tool_recall = len(
            set(used_tools) & set(case.expected_tools)
        ) / max(len(case.expected_tools), 1)

        # 2. 关键词覆盖率
        answer = agent_result.get("answer", "")
        keyword_coverage = sum(
            1 for kw in case.expected_answer_keywords if kw in answer
        ) / max(len(case.expected_answer_keywords), 1)

        # 3. LLM 评分（如果有标准答案）
        llm_scores = {}
        if case.ground_truth:
            llm_scores = llm_judge(case.query, answer, case.ground_truth)

        results.append({
            "query": case.query,
            "tool_precision": tool_precision,
            "tool_recall": tool_recall,
            "keyword_coverage": keyword_coverage,
            "llm_scores": llm_scores,
            "tokens_used": agent_result.get("metrics", {}).total_tokens
        })

    # 汇总统计
    avg_precision = sum(r["tool_precision"] for r in results) / len(results)
    avg_coverage = sum(r["keyword_coverage"] for r in results) / len(results)
    avg_llm = sum(
        r["llm_scores"].get("overall", 0) for r in results
    ) / len(results)

    return {
        "total_cases": len(eval_cases),
        "avg_tool_precision": avg_precision,
        "avg_keyword_coverage": avg_coverage,
        "avg_llm_score": avg_llm,
        "details": results
    }

# 使用示例
eval_cases = [
    EvalCase(
        query="北京明天天气怎么样？",
        expected_tools=["get_location", "get_weather"],
        expected_answer_keywords=["北京", "明天", "温度"],
        ground_truth="北京明天晴天，气温 15-22°C，适合外出。"
    ),
    EvalCase(
        query="今天要不要带伞？",
        expected_tools=["get_location", "get_weather"],
        expected_answer_keywords=["带伞", "天气"],
        ground_truth="今天北京晴天，不需要带伞。"
    )
]`,
          explanation: `
            <strong>评估系统的关键设计：</strong><br>
            • <strong>多维度评估</strong>：工具使用 + 关键词覆盖 + LLM 评分，避免单一指标的盲点<br>
            • <strong>LLM-as-Judge</strong>：用另一个 LLM 评估答案质量，比人工标注便宜 100 倍<br>
            • <strong>Precision vs Recall</strong>：工具精确率（没有多余调用）和召回率（没有遗漏）<br>
            • <strong>持续评估</strong>：每次代码变更后自动运行，防止性能退化
          `
        },
        {
          type: 'concept',
          title: '🔮 Agent 开发的未来趋势（2024-2025）',
          html: `
            <div style="margin:14px 0;padding:14px;background:rgba(251,191,36,.1);border-left:3px solid var(--yellow);border-radius:12px;line-height:1.9;font-size:.9rem">
              <strong>趋势 1：模型原生工具调用</strong><br>
              Claude 3.5+、GPT-4o 内置工具调用能力越来越强，<br>
              不再需要复杂的 ReAct prompt 工程<br><br>

              <strong>趋势 2：Computer Use（计算机使用）</strong><br>
              Agent 直接操作浏览器、桌面应用——<br>
              不需要 API，直接"看屏幕、点鼠标"<br><br>

              <strong>趋势 3：长上下文 + 减少 RAG</strong><br>
              Claude 3.5 支持 200K tokens，<br>
              很多场景可以直接把文档塞进去，不需要 RAG<br><br>

              <strong>趋势 4：Agent 评估标准化</strong><br>
              SWE-bench、AgentBench 等基准测试成为行业标准，<br>
              就像 ImageNet 之于计算机视觉<br><br>

              <strong>趋势 5：多模态 Agent</strong><br>
              Agent 能看图、听声音、看视频——<br>
              不再局限于文本工具
            </div>
          `
        },
        {
          type: 'pitfalls',
          title: '⚠️ Agent 评估的深层陷阱',
          items: [
            'Goodhart 定律：当一个指标成为目标，它就不再是好指标——Agent 会"优化"评估指标而不是真正改进',
            'LLM-as-Judge 的偏见：评估 LLM 和被评估 LLM 来自同一家公司，可能有系统性偏见',
            '分布偏移：评估集和真实用户问题不一样，高分 Agent 在生产中可能表现差',
            '评估成本：每次评估都要调用 LLM，大规模评估成本很高——需要分层抽样',
            '人类评估的不一致性：不同标注员对"好答案"的标准不同，需要标注指南和一致性检验'
          ]
        },
        {
          type: 'quiz',
          q: '为什么 Agent 评估要用"LLM-as-Judge"而不是纯人工评估？',
          opts: [
            '因为 LLM 比人类更聪明',
            '人工评估成本高、速度慢、不一致；LLM 评估便宜 100 倍、可扩展、标准一致',
            '因为 LLM 评估更准确',
            '因为人类不懂技术'
          ],
          ans: 1,
          feedback_ok: '🔥 完美！这是 2024 年 AI 评估领域的重要进展。人工评估 1000 条需要几天时间和几千美元，LLM 评估只需要几分钟和几十美元。当然，LLM 评估也有偏见，需要定期用人工评估校准！',
          feedback_err: 'LLM-as-Judge 的核心价值是规模化。人工评估 10,000 条数据需要几周时间，LLM 评估只需要几小时。但 LLM 评估有自己的偏见，需要定期用人工评估来校准！'
        }
      ]
    }
  }
});
