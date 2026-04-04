// 关卡 12：实战星 1 - 天气助手 Agent（完整重构）

PLANETS.push({
  id: 'p12',
  icon: '🌤️',
  num: '星球 12',
  name: '实战星 1：天气助手',
  desc: '从零构建一个真正能用的天气查询 Agent！',

  difficulties: {
    // 🟢 简单模式
    easy: {
      sections: [
        {
          type: 'story',
          html: `
            <div class="speaker">🌤️ 实战星 1</div>
            <p>飞船降落在实战星，这里是真正动手的地方！</p>
            <div class="chat-bubble robot">
              🤖 ARIA：船长！理论学完了，现在来做一个真正能用的 Agent！<br>
              我们先从最经典的开始——<strong>天气助手</strong>！
            </div>
            <div class="chat-bubble">
              👦 你：就是那种"明天要不要带伞？"的助手？
            </div>
            <div class="chat-bubble robot">
              🤖 ARIA：完全正确！它需要理解你的问题，调用天气工具，再给你答案。<br>
              这就是一个完整的 Agent 工作流程！
            </div>
          `
        },
        {
          type: 'concept',
          title: '🌤️ 天气助手的工作流程',
          html: `
            <div style="margin:14px 0;padding:14px;background:rgba(0,229,255,.06);border-radius:12px;font-family:monospace;font-size:.9rem;line-height:2">
              👤 用户："明天要不要带伞？"<br>
              &nbsp;&nbsp;↓<br>
              🧠 Agent 思考：需要知道位置和明天的天气<br>
              &nbsp;&nbsp;↓<br>
              🔧 调用 get_location() → "北京"<br>
              &nbsp;&nbsp;↓<br>
              🔧 调用 get_weather("北京", "明天") → "小雨，18°C"<br>
              &nbsp;&nbsp;↓<br>
              💬 回答："明天北京有小雨，建议带伞！"
            </div>
            <div style="margin-top:14px;display:grid;grid-template-columns:1fr 1fr;gap:10px">
              <div style="background:rgba(0,229,255,.08);border:1px solid rgba(0,229,255,.2);border-radius:10px;padding:12px;font-size:.82rem">
                🔍 <strong>get_location()</strong><br>
                <span style="color:var(--muted)">获取用户当前位置</span>
              </div>
              <div style="background:rgba(168,85,247,.08);border:1px solid rgba(168,85,247,.2);border-radius:10px;padding:12px;font-size:.82rem">
                🌡️ <strong>get_weather(city, date)</strong><br>
                <span style="color:var(--muted)">查询指定城市天气</span>
              </div>
            </div>
          `
        },
        {
          type: 'quiz',
          q: '天气助手 Agent 的工作顺序是什么？',
          opts: [
            '先回答，再查天气',
            '理解问题 → 调用工具 → 整合结果 → 给出回答',
            '只调用工具，不需要理解问题',
            '先查所有城市的天气，再找到用户要的'
          ],
          ans: 1,
          feedback_ok: '🎯 完全正确！这就是 Agent 的标准工作流：理解→工具→整合→回答！',
          feedback_err: 'Agent 必须先理解问题，才知道要调用哪个工具！'
        }
      ]
    },

    // 🟡 困难模式
    hard: {
      sections: [
        {
          type: 'story',
          html: `
            <div class="speaker">🌤️ 实战星 1（技术版）</div>
            <div class="chat-bubble robot">
              🤖 ARIA：船长！让我们用 Claude API 实现一个真正的天气助手。<br>
              这会用到 tool_use 功能——让 Claude 自己决定何时调用工具！
            </div>
          `
        },
        {
          type: 'code',
          title: '💻 天气助手完整实现',
          code: `import anthropic
import json

client = anthropic.Anthropic()

# 定义工具
tools = [
    {
        "name": "get_weather",
        "description": "查询指定城市和日期的天气",
        "input_schema": {
            "type": "object",
            "properties": {
                "city": {"type": "string", "description": "城市名"},
                "date": {"type": "string", "description": "日期，如 today/tomorrow"}
            },
            "required": ["city", "date"]
        }
    },
    {
        "name": "get_location",
        "description": "获取用户当前位置",
        "input_schema": {"type": "object", "properties": {}}
    }
]

def execute_tool(name, inputs):
    """模拟工具执行"""
    if name == "get_location":
        return {"city": "北京"}
    if name == "get_weather":
        return {"temp": 18, "condition": "小雨", "humidity": 80}

def weather_agent(query: str) -> str:
    messages = [{"role": "user", "content": query}]

    while True:
        response = client.messages.create(
            model="claude-opus-4-6",
            max_tokens=1024,
            tools=tools,
            messages=messages
        )

        # 没有工具调用，直接返回文本
        if response.stop_reason == "end_turn":
            return response.content[0].text

        # 处理工具调用
        tool_results = []
        for block in response.content:
            if block.type == "tool_use":
                result = execute_tool(block.name, block.input)
                tool_results.append({
                    "type": "tool_result",
                    "tool_use_id": block.id,
                    "content": json.dumps(result, ensure_ascii=False)
                })

        # 把工具结果加回对话
        messages.append({"role": "assistant", "content": response.content})
        messages.append({"role": "user", "content": tool_results})`,
          explanation: `
            <strong>关键设计：</strong><br>
            • <strong>tool_use 循环</strong>：Claude 自己决定调用哪个工具，不需要手动解析意图<br>
            • <strong>stop_reason</strong>：<code>tool_use</code> 表示需要执行工具，<code>end_turn</code> 表示完成<br>
            • <strong>tool_result</strong>：把工具结果以特定格式返回给 Claude<br>
            • <strong>while True</strong>：循环直到 Claude 不再需要工具
          `
        },
        {
          type: 'pitfalls',
          title: '⚠️ 常见坑点',
          items: [
            '工具执行失败没有处理 → Claude 会困惑，应该返回 error 字段',
            '工具描述不清晰 → Claude 可能调用错误的工具或传错参数',
            '没有 max_iterations 限制 → 极端情况下可能无限循环',
            '工具结果太长 → 超出 Context Window，需要截断或摘要'
          ]
        },
        {
          type: 'quiz',
          q: 'Claude 的 tool_use 模式中，stop_reason 为 "end_turn" 意味着什么？',
          opts: [
            'Claude 出错了，需要重试',
            'Claude 不再需要调用工具，已经可以给出最终回答',
            'Claude 需要更多工具',
            '对话结束，不会再有回复'
          ],
          ans: 1,
          feedback_ok: '✅ 正确！end_turn 表示 Claude 已经有足够信息，可以直接回答了！',
          feedback_err: 'stop_reason 是 Claude 告诉你"下一步该怎么做"的信号！'
        }
      ]
    },

    // 🔴 地狱模式
    hell: {
      sections: [
        {
          type: 'story',
          html: `
            <div class="speaker">🔥 地狱模式 - 生产级天气 Agent</div>
            <div class="chat-bubble robot" style="border-color:var(--red)">
              🤖 ARIA：船长，把 Agent 从 demo 变成生产系统，<br>
              需要解决三个核心问题：<br><br>
              <strong>1. 可靠性</strong>：工具超时、API 失败怎么办？<br>
              <strong>2. 成本控制</strong>：Token 消耗失控怎么办？<br>
              <strong>3. 可观测性</strong>：出问题了怎么排查？<br><br>
              这三个问题，是所有生产 Agent 都必须解决的！
            </div>
          `
        },
        {
          type: 'code',
          title: '💻 生产级天气 Agent',
          code: `import anthropic
import asyncio
import time
import json
from dataclasses import dataclass, field

client = anthropic.Anthropic()

@dataclass
class RunMetrics:
    start_time: float = field(default_factory=time.time)
    tool_calls: int = 0
    input_tokens: int = 0
    output_tokens: int = 0
    errors: list = field(default_factory=list)

    @property
    def cost_usd(self):
        # claude-opus-4-6 定价（近似）
        return self.input_tokens / 1e6 * 15 + self.output_tokens / 1e6 * 75

    @property
    def elapsed_ms(self):
        return (time.time() - self.start_time) * 1000

async def call_tool_with_timeout(name: str, inputs: dict,
                                  timeout: float = 5.0) -> dict:
    """带超时的工具调用"""
    try:
        result = await asyncio.wait_for(
            asyncio.to_thread(execute_tool, name, inputs),
            timeout=timeout
        )
        return {"success": True, "data": result}
    except asyncio.TimeoutError:
        return {"success": False, "error": f"工具 {name} 超时（>{timeout}s）"}
    except Exception as e:
        return {"success": False, "error": str(e)}

async def weather_agent_production(query: str,
                                    token_budget: int = 2000) -> dict:
    metrics = RunMetrics()
    messages = [{"role": "user", "content": query}]
    MAX_TURNS = 5

    for turn in range(MAX_TURNS):
        # Token 预算检查
        if metrics.input_tokens + metrics.output_tokens > token_budget:
            return {
                "answer": "抱歉，查询超出预算，请简化问题",
                "metrics": metrics
            }

        response = client.messages.create(
            model="claude-opus-4-6",
            max_tokens=512,
            tools=tools,
            messages=messages
        )

        # 更新 token 统计
        metrics.input_tokens += response.usage.input_tokens
        metrics.output_tokens += response.usage.output_tokens

        if response.stop_reason == "end_turn":
            answer = next(
                (b.text for b in response.content if hasattr(b, "text")), ""
            )
            return {"answer": answer, "metrics": metrics}

        # 并发执行所有工具调用
        tool_blocks = [b for b in response.content if b.type == "tool_use"]
        metrics.tool_calls += len(tool_blocks)

        tasks = [
            call_tool_with_timeout(b.name, b.input)
            for b in tool_blocks
        ]
        results = await asyncio.gather(*tasks)

        tool_results = []
        for block, result in zip(tool_blocks, results):
            if not result["success"]:
                metrics.errors.append(result["error"])
            tool_results.append({
                "type": "tool_result",
                "tool_use_id": block.id,
                "content": json.dumps(
                    result.get("data", {"error": result.get("error")}),
                    ensure_ascii=False
                )
            })

        messages.append({"role": "assistant", "content": response.content})
        messages.append({"role": "user", "content": tool_results})

    return {"answer": "达到最大轮次", "metrics": metrics}`,
          explanation: `
            <strong>生产级设计要点：</strong><br>
            • <strong>RunMetrics</strong>：追踪每次调用的 token 消耗、工具调用次数、错误<br>
            • <strong>asyncio.wait_for</strong>：工具超时保护，防止单个工具卡住整个 Agent<br>
            • <strong>asyncio.gather</strong>：多个工具并发执行，减少总延迟<br>
            • <strong>token_budget</strong>：硬性成本上限，防止失控<br>
            • <strong>MAX_TURNS</strong>：防止无限循环的安全阀
          `
        },
        {
          type: 'concept',
          title: '📊 生产监控指标',
          html: `
            <div style="margin:14px 0;padding:14px;background:rgba(0,229,255,.06);border-radius:12px;font-size:.9rem;line-height:1.9">
              <strong>必须监控的 4 类指标：</strong><br><br>

              <strong>1. 延迟（Latency）</strong><br>
              • P50/P95/P99 响应时间<br>
              • 工具调用耗时分布<br>
              • 目标：P95 &lt; 5s<br><br>

              <strong>2. 成本（Cost）</strong><br>
              • 每次请求的 token 消耗<br>
              • 每日/每月 API 费用<br>
              • 异常高消耗告警<br><br>

              <strong>3. 质量（Quality）</strong><br>
              • 工具调用成功率<br>
              • 用户满意度（点赞/踩）<br>
              • 答案准确率（抽样评估）<br><br>

              <strong>4. 可靠性（Reliability）</strong><br>
              • 错误率（工具失败、API 超时）<br>
              • 重试成功率<br>
              • 降级触发频率
            </div>
          `
        },
        {
          type: 'pitfalls',
          title: '⚠️ 生产环境的深层陷阱',
          items: [
            '并发竞争：多用户同时请求同一工具（如天气 API），触发限流——需要请求队列或缓存',
            '幂等性问题：工具调用失败后重试，可能导致重复操作（如重复发送通知）——工具需要设计为幂等',
            '成本尖峰：某类查询触发大量工具调用，单次请求消耗数千 token——需要 token 预算 + 告警',
            '模型漂移：Claude 更新后，工具调用行为可能改变——需要回归测试和金丝雀发布',
            '级联超时：工具 A 超时 → 工具 B 等待 A 的结果 → 整个链路超时——需要独立超时 + 熔断器'
          ]
        },
        {
          type: 'quiz',
          q: '生产级 Agent 中，为什么要用 asyncio.gather 并发执行多个工具调用？',
          opts: [
            '因为 asyncio 代码更好看',
            '多个工具可以同时执行，总延迟 = 最慢工具的时间，而不是所有工具时间之和',
            '并发可以减少 token 消耗',
            'Claude API 要求并发调用'
          ],
          ans: 1,
          feedback_ok: '🔥 完美！如果 get_location 需要 1s，get_weather 需要 2s，串行需要 3s，并发只需要 2s。在高并发场景下，这个优化非常关键！',
          feedback_err: '想象一下：如果你要同时查北京和上海的天气，串行需要 2 次等待，并发只需要 1 次！asyncio.gather 就是让多个工具同时跑，总时间取决于最慢的那个。'
        }
      ]
    }
  }
});
