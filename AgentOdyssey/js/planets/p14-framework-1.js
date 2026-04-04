// 关卡 14：框架星 1 - LangChain & LangGraph（完整重构）

PLANETS.push({
  id: 'p14',
  icon: '🔗',
  num: '星球 14',
  name: '框架星 1：LangChain & LangGraph',
  desc: '学习最流行的 Agent 框架，快速构建复杂系统！',

  difficulties: {
    // 🟢 简单模式
    easy: {
      sections: [
        {
          type: 'story',
          html: `
            <div class="speaker">🔗 框架星 1</div>
            <p>飞船来到框架星，这里有各种现成的工具箱！</p>
            <div class="chat-bubble robot">
              🤖 ARIA：船长！从零写 Agent 很复杂，所以有人做了"框架"——<br>
              就像做蛋糕可以买预拌粉，不用自己准备每种材料！
            </div>
            <div class="chat-bubble">
              👦 你：那我们学哪个框架？
            </div>
            <div class="chat-bubble robot">
              🤖 ARIA：最流行的两个：<strong>LangChain</strong>（简单快速）<br>
              和 <strong>LangGraph</strong>（灵活强大）！
            </div>
          `
        },
        {
          type: 'concept',
          title: '🔗 LangChain vs LangGraph',
          html: `
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:8px">
              <div style="background:rgba(0,229,255,.08);border:1px solid rgba(0,229,255,.2);border-radius:12px;padding:14px">
                <strong style="color:var(--cyan)">🔗 LangChain</strong>
                <p style="font-size:.82rem;color:var(--muted);margin-top:8px;line-height:1.8">
                  • 像流水线，一步接一步<br>
                  • 有大量现成工具<br>
                  • 适合简单线性流程<br>
                  • 快速原型开发
                </p>
              </div>
              <div style="background:rgba(168,85,247,.08);border:1px solid rgba(168,85,247,.2);border-radius:12px;padding:14px">
                <strong style="color:var(--purple)">🗺️ LangGraph</strong>
                <p style="font-size:.82rem;color:var(--muted);margin-top:8px;line-height:1.8">
                  • 像地图，可以选路线<br>
                  • 支持循环和分支<br>
                  • 适合复杂决策逻辑<br>
                  • 精确控制状态
                </p>
              </div>
            </div>
            <div style="margin-top:14px;padding:12px;background:rgba(251,191,36,.08);border-left:3px solid var(--yellow);border-radius:8px;font-size:.9rem">
              💡 简单任务用 LangChain，复杂任务用 LangGraph！
            </div>
          `
        },
        {
          type: 'quiz',
          q: '如果你要做一个"搜索→分析→如果结果不好就重新搜索"的 Agent，应该用哪个框架？',
          opts: [
            'LangChain，因为它更流行',
            'LangGraph，因为它支持循环和条件分支',
            '两个都不用，自己写',
            'LangChain，因为它有现成工具'
          ],
          ans: 1,
          feedback_ok: '🎯 正确！有循环（重新搜索）和条件（结果不好才重搜），这正是 LangGraph 擅长的！',
          feedback_err: '有循环逻辑（重新搜索）的场景，LangGraph 的图结构更合适！'
        }
      ]
    },

    // 🟡 困难模式
    hard: {
      sections: [
        {
          type: 'story',
          html: `
            <div class="speaker">🔗 框架星 1（技术版）</div>
            <div class="chat-bubble robot">
              🤖 ARIA：船长！让我们看看 LangChain 和 LangGraph 的实际代码。<br>
              理解框架的设计思路，比记住 API 更重要！
            </div>
          `
        },
        {
          type: 'code',
          title: '💻 LangGraph 状态机 Agent',
          code: `from langgraph.graph import StateGraph, END
from typing import TypedDict, Annotated
import operator

# 1. 定义状态（TypedDict 保证类型安全）
class AgentState(TypedDict):
    query: str
    search_results: list[str]
    answer: str
    retry_count: int

# 2. 定义节点函数（每个节点接收状态，返回更新）
def search_node(state: AgentState) -> dict:
    results = web_search(state["query"])
    return {"search_results": results}

def evaluate_node(state: AgentState) -> dict:
    """评估搜索结果质量"""
    if len(state["search_results"]) < 2:
        return {"retry_count": state["retry_count"] + 1}
    return {}

def answer_node(state: AgentState) -> dict:
    context = "\\n".join(state["search_results"])
    answer = llm_call(f"基于以下资料回答：{context}\\n问题：{state['query']}")
    return {"answer": answer}

# 3. 条件路由函数
def should_retry(state: AgentState) -> str:
    if state["retry_count"] < 2 and len(state["search_results"]) < 2:
        return "retry"
    return "answer"

# 4. 构建图
workflow = StateGraph(AgentState)

workflow.add_node("search", search_node)
workflow.add_node("evaluate", evaluate_node)
workflow.add_node("answer", answer_node)

# 5. 添加边（包括条件边）
workflow.set_entry_point("search")
workflow.add_edge("search", "evaluate")
workflow.add_conditional_edges(
    "evaluate",
    should_retry,
    {
        "retry": "search",   # 结果不好，重新搜索
        "answer": "answer"   # 结果够好，生成答案
    }
)
workflow.add_edge("answer", END)

# 6. 编译并运行
app = workflow.compile()
result = app.invoke({
    "query": "2024年诺贝尔物理学奖得主",
    "search_results": [],
    "answer": "",
    "retry_count": 0
})`,
          explanation: `
            <strong>LangGraph 的核心概念：</strong><br>
            • <strong>State</strong>：整个工作流共享的数据，每个节点可以更新部分字段<br>
            • <strong>Node</strong>：处理函数，接收完整状态，返回要更新的字段<br>
            • <strong>Edge</strong>：节点之间的连接，可以是固定的或条件的<br>
            • <strong>条件边</strong>：根据状态决定走哪条路——这是 LangGraph 的核心优势
          `
        },
        {
          type: 'pitfalls',
          title: '⚠️ 框架使用的常见坑',
          items: [
            '过度抽象：框架封装太深，出错时不知道哪里出问题——启用 LangSmith 追踪',
            '版本不兼容：LangChain 更新极快，0.1→0.2→0.3 API 变化很大——锁定版本',
            '状态爆炸：LangGraph 状态越来越大，每个节点都往里加字段——定期清理无用字段',
            '框架依赖锁定：业务逻辑和框架代码混在一起，换框架时全部重写——保持核心逻辑独立'
          ]
        },
        {
          type: 'quiz',
          q: 'LangGraph 中"条件边"（conditional_edges）的作用是什么？',
          opts: [
            '让代码运行更快',
            '根据当前状态动态决定下一步走哪个节点，实现分支和循环',
            '连接两个节点',
            '保存状态到数据库'
          ],
          ans: 1,
          feedback_ok: '✅ 正确！条件边是 LangGraph 的灵魂——它让 Agent 能根据结果动态调整路径，而不是固定流程！',
          feedback_err: '条件边让 Agent 能"思考"下一步：结果好就继续，结果差就重试——这就是智能决策！'
        }
      ]
    },

    // 🔴 地狱模式
    hell: {
      sections: [
        {
          type: 'story',
          html: `
            <div class="speaker">🔥 地狱模式 - LangGraph 源码级理解</div>
            <div class="chat-bubble robot" style="border-color:var(--red)">
              🤖 ARIA：船长，LangGraph 的设计灵感来自哪里？<br><br>
              它借鉴了两个经典概念：<br>
              <strong>Pregel</strong>（Google 的图计算框架）<br>
              <strong>Actor 模型</strong>（Erlang/Akka 的并发模型）<br><br>
              理解这些，你就能理解为什么 LangGraph 这样设计，<br>
              以及什么时候它会出问题！
            </div>
          `
        },
        {
          type: 'concept',
          title: '🏗️ LangGraph 的底层模型：Pregel',
          html: `
            <div style="margin:14px 0;padding:14px;background:rgba(0,229,255,.06);border-radius:12px;font-size:.9rem;line-height:1.9">
              <strong>Pregel 模型（Google，2010）：</strong><br>
              • 图中每个节点独立计算，通过消息传递通信<br>
              • 计算分为多个"超步"（Superstep）<br>
              • 每个超步：所有节点接收消息 → 计算 → 发送消息<br>
              • 直到没有消息传递，计算结束<br><br>

              <strong>LangGraph 的映射：</strong><br>
              • 节点 = Agent 或处理函数<br>
              • 消息 = State 的更新<br>
              • 超步 = 一轮节点执行<br>
              • 终止条件 = 到达 END 节点
            </div>
            <div style="margin-top:14px;padding:12px;background:rgba(251,191,36,.1);border-left:3px solid var(--yellow);border-radius:8px;font-size:.9rem">
              💡 <strong>为什么这很重要？</strong><br>
              Pregel 模型天然支持并行——同一超步中的多个节点可以并发执行！<br>
              LangGraph 的 <code>add_node</code> 并行执行就是基于这个原理。
            </div>
          `
        },
        {
          type: 'code',
          title: '💻 LangGraph 高级特性：子图 + 并行节点',
          code: `from langgraph.graph import StateGraph, END
from langgraph.checkpoint.memory import MemorySaver
from typing import TypedDict

# ===== 子图（Subgraph）：把复杂逻辑封装成可复用的子图 =====

class SearchState(TypedDict):
    query: str
    results: list[str]

def web_search(state):
    return {"results": [f"网页结果: {state['query']}"]}

def news_search(state):
    return {"results": [f"新闻结果: {state['query']}"]}

# 构建搜索子图
search_subgraph = StateGraph(SearchState)
search_subgraph.add_node("web", web_search)
search_subgraph.add_node("news", news_search)
search_subgraph.set_entry_point("web")
search_subgraph.add_edge("web", "news")
search_subgraph.add_edge("news", END)
compiled_search = search_subgraph.compile()

# ===== 主图：使用子图 + 并行节点 =====

class MainState(TypedDict):
    query: str
    search_results: list[str]
    analysis: str
    final_answer: str

def run_search(state):
    result = compiled_search.invoke({"query": state["query"], "results": []})
    return {"search_results": result["results"]}

def analyze(state):
    return {"analysis": f"分析: {len(state['search_results'])} 条结果"}

def synthesize(state):
    return {"final_answer": f"综合答案: {state['analysis']}"}

main_graph = StateGraph(MainState)
main_graph.add_node("search", run_search)
main_graph.add_node("analyze", analyze)
main_graph.add_node("synthesize", synthesize)

main_graph.set_entry_point("search")
main_graph.add_edge("search", "analyze")
main_graph.add_edge("analyze", "synthesize")
main_graph.add_edge("synthesize", END)

# ===== Checkpointing：持久化状态，支持中断恢复 =====
memory = MemorySaver()
app = main_graph.compile(checkpointer=memory)

# 每次调用都有 thread_id，同一 thread 的状态会被保存
config = {"configurable": {"thread_id": "user_123"}}
result = app.invoke({"query": "AI 最新进展", "search_results": [],
                     "analysis": "", "final_answer": ""}, config)

# 可以随时查看某个 thread 的历史状态
history = list(app.get_state_history(config))
print(f"共 {len(history)} 个检查点")`,
          explanation: `
            <strong>高级特性解析：</strong><br>
            • <strong>子图（Subgraph）</strong>：把复杂逻辑封装成可复用模块，主图保持简洁<br>
            • <strong>Checkpointing</strong>：每个节点执行后自动保存状态，支持中断恢复和时间旅行调试<br>
            • <strong>thread_id</strong>：区分不同用户/会话的状态，实现多用户隔离<br>
            • <strong>get_state_history</strong>：查看完整执行历史，方便调试和审计
          `
        },
        {
          type: 'concept',
          title: '📊 LangGraph vs 直接调用 Claude API',
          html: `
            <div style="margin:14px 0;padding:14px;background:rgba(0,229,255,.06);border-radius:12px;font-size:.9rem;line-height:1.8">
              <strong>什么时候用 LangGraph：</strong><br>
              ✅ 复杂的多步骤工作流（5+ 个节点）<br>
              ✅ 需要循环和条件分支<br>
              ✅ 需要持久化状态（用户会话）<br>
              ✅ 需要人工介入（Human-in-the-loop）<br>
              ✅ 团队协作，需要可视化工作流<br><br>

              <strong>什么时候直接用 Claude API：</strong><br>
              ✅ 简单的单次调用<br>
              ✅ 需要最大灵活性<br>
              ✅ 框架开销不可接受（延迟敏感）<br>
              ✅ 学习阶段，理解底层原理<br><br>

              <strong>Anthropic 官方建议：</strong><br>
              对于简单 Agent，直接用 API 更清晰。<br>
              框架适合复杂编排，但不要为了用框架而用框架。
            </div>
          `
        },
        {
          type: 'pitfalls',
          title: '⚠️ LangGraph 的深层陷阱',
          items: [
            '状态序列化问题：State 中包含不可序列化的对象（如文件句柄），Checkpointing 会失败——State 只存可序列化的数据',
            '并行节点的竞争条件：两个并行节点同时更新同一个 State 字段，结果不确定——用 Annotated + operator.add 定义合并策略',
            '子图状态隔离：子图有自己的 State，主图无法直接访问子图内部状态——需要显式映射',
            '调试困难：多层嵌套的图，出错时堆栈很深——使用 LangSmith 可视化追踪',
            '版本锁定风险：LangGraph 0.1→0.2 有 breaking changes，升级需要重写部分代码'
          ]
        },
        {
          type: 'quiz',
          q: 'LangGraph 的 Checkpointing 功能最重要的用途是什么？',
          opts: [
            '让代码运行更快',
            '保存每个节点执行后的状态，支持中断恢复、时间旅行调试和多用户会话隔离',
            '减少 API 调用次数',
            '自动优化 prompt'
          ],
          ans: 1,
          feedback_ok: '🔥 完美！Checkpointing 是 LangGraph 的杀手级特性。想象一个需要 30 分钟的复杂工作流，中途网络断了——有 Checkpointing 可以从断点继续，没有就要从头来！',
          feedback_err: 'Checkpointing 解决了长时间工作流的可靠性问题。它保存每一步的状态，让你可以：1) 中断后恢复 2) 回溯到任意历史状态调试 3) 区分不同用户的会话'
        }
      ]
    }
  }
});
