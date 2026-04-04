// 关卡 19：帝国篇 - 实时观测：Event-Driven 架构

PLANETS.push({
  id: 'p19',
  icon: '📡',
  num: '星球 19',
  name: '帝国星 - 实时观测',
  desc: 'Event-Driven 架构：让 AI 系统的每一个动作都透明可见！',

  difficulties: {
    // 🟢 简单模式
    easy: {
      sections: [
        {
          type: 'story',
          html: `
            <div class="speaker">📡 帝国星 - 实时观测</div>
            <p>飞船驶向帝国星的第三层：观测塔……</p>
            <div class="chat-bubble robot">
              🤖 ARIA：船长，我们已经有了三省六部的架构，
              也有了状态机保证流程不乱。<br><br>
              但还有一个问题：<strong>我们怎么知道现在发生了什么？</strong><br><br>
              12 个 Agent 同时在工作，你怎么知道谁在做什么？
              出了问题怎么找？
            </div>
            <div class="chat-bubble">
              👦 你：能不能弄个公告板，所有人都在上面贴消息？
            </div>
            <div class="chat-bubble robot">
              🤖 ARIA：完全正确！这就是
              <strong style="color:var(--cyan)">Event-Driven（事件驱动）架构</strong>！<br>
              每个 Agent 做了任何事情，都往公告板发一条消息。<br>
              所有人都能订阅这个公告板，实时知道发生了什么。
            </div>
          `
        },
        {
          type: 'concept',
          title: '📋 班级公告板',
          html: `
            <p>继续用小明的班级来理解：</p>
            <div style="margin:14px 0;padding:14px;background:rgba(0,229,255,.06);border-radius:12px;line-height:1.8">
              班级有一块<strong>公告板</strong>，所有的大小事都贴在上面：<br><br>

              📌 10:00 - 小明发布了任务：「准备运动会」<br>
              📌 10:05 - 计划委员：「我开始制定计划了」<br>
              📌 10:30 - 计划委员：「计划制定完成，交检查员」<br>
              📌 11:00 - 检查员：「❌ 计划有漏洞，打回重做」<br>
              📌 11:30 - 计划委员：「计划已修改」<br>
              📌 12:00 - 检查员：「✅ 计划通过」<br>
              📌 14:00 - 体育组：「开始准备跑道」<br>
              📌 15:00 - 文艺组：「开始排练节目」<br>
            </div>
            <div style="margin-top:16px;padding:12px;background:rgba(251,191,36,.1);border-left:3px solid var(--yellow);border-radius:8px">
              💡 <strong>公告板的好处：</strong><br>
              • 任何人都能看到进度（透明）<br>
              • 不需要每个人互相打电话问（解耦）<br>
              • 出了问题，查公告板就能回溯（可追溯）
            </div>
          `
        },
        {
          type: 'concept',
          title: '📻 发布者 vs 订阅者',
          html: `
            <p><strong>公告板有两种角色：</strong></p>
            <div style="margin:14px 0;padding:14px;background:rgba(0,229,255,.06);border-radius:12px;line-height:1.8">
              <strong>📢 发布者（Publisher）</strong><br>
              贴公告的人：各个小组、委员<br>
              「我做了什么」→ 贴到公告板<br><br>

              <strong>👀 订阅者（Subscriber）</strong><br>
              看公告的人：班主任、家长、同学<br>
              「发生了什么」→ 从公告板获取<br><br>

              <strong>📋 公告板（Event Bus）</strong><br>
              中间人：负责接收和分发公告<br>
              让发布者和订阅者不需要认识对方
            </div>
            <p style="margin-top:12px;font-size:.9rem;color:var(--muted)">
              计划委员只管贴公告，不需要知道谁在看。<br>
              班主任只管订阅，不需要知道是谁贴的。<br>
              这叫<strong>解耦</strong>——互相不依赖！
            </p>
          `
        },
        {
          type: 'quiz',
          q: '如果 ARIA 想实时知道"门下省审核了一个方案"，应该怎么做？',
          opts: [
            '每隔 1 秒问一次门下省：你审完了吗？',
            '订阅"门下省审核完成"事件，有结果时自动收到通知',
            '等所有任务都完成后统一查看',
            '让门下省直接告诉 ARIA'
          ],
          ans: 1,
          feedback_ok: '🎉 正确！订阅事件比轮询（每秒问一次）好多了。事件驱动是"有消息推给你"而不是"你去问有没有消息"。更高效，也更解耦！',
          feedback_err: '轮询（每秒问一次）太浪费了！正确做法是订阅事件——门下省审核完成时，主动发布一个事件，所有订阅者自动收到通知。这就是"推"模式的优势。'
        }
      ]
    },

    // 🟡 困难模式
    hard: {
      sections: [
        {
          type: 'story',
          html: `
            <div class="speaker">📡 帝国星 - 技术版</div>
            <div class="chat-bubble robot">
              🤖 ARIA：让我们看看 Event-Driven 架构的代码实现。<br>
              EDICT 用事件总线（Event Bus）实现实时可观测性，
              配合 WebSocket 把数据推送到 Dashboard。
            </div>
          `
        },
        {
          type: 'code',
          title: '💻 事件定义与事件总线',
          code: `from dataclasses import dataclass, field
from datetime import datetime
from typing import Any, Dict, Callable
import asyncio, uuid

@dataclass
class Event:
    topic:      str          # 事件类型，如 "agent.thought"
    producer:   str          # 谁发布的，如 "menxia-agent"
    payload:    Dict[str, Any]
    trace_id:   str          # 任务 ID（关联同一任务的所有事件）
    event_id:   str = field(default_factory=lambda: str(uuid.uuid4()))
    timestamp:  str = field(default_factory=lambda:
                    datetime.utcnow().isoformat() + "Z")

class EventBus:
    def __init__(self):
        self._handlers: Dict[str, list[Callable]] = {}

    def subscribe(self, topic_pattern: str, handler: Callable):
        """订阅事件。支持通配符，如 'agent.*' 匹配所有 agent 事件"""
        if topic_pattern not in self._handlers:
            self._handlers[topic_pattern] = []
        self._handlers[topic_pattern].append(handler)

    async def publish(self, event: Event):
        """发布事件：持久化 + 通知所有订阅者"""
        # 1. 持久化（append-only）
        await self._store(event)

        # 2. 通知订阅者（并行执行）
        handlers = self._match_handlers(event.topic)
        await asyncio.gather(
            *[h(event) for h in handlers],
            return_exceptions=True  # 单个订阅者失败不影响其他
        )

    def _match_handlers(self, topic: str) -> list:
        result = []
        for pattern, handlers in self._handlers.items():
            if pattern == topic or pattern.endswith('*') and \
               topic.startswith(pattern[:-1]):
                result.extend(handlers)
        return result`,
          explanation: `
            <strong>核心设计：</strong><br>
            • <code>trace_id</code>：同一个任务的所有事件共享，可以过滤出完整链路<br>
            • 通配符订阅：<code>agent.*</code> 可以订阅所有 agent 事件<br>
            • 并行通知：<code>asyncio.gather</code> 同时通知多个订阅者<br>
            • <code>return_exceptions=True</code>：一个订阅者崩溃不影响其他订阅者
          `
        },
        {
          type: 'code',
          title: '🤖 Agent 发布事件',
          code: `class MenxiaAgent:
    def __init__(self, event_bus: EventBus):
        self.bus = event_bus

    async def review(self, task, plan):
        # 发布"开始审核"事件
        await self.bus.publish(Event(
            topic="agent.thought",
            producer="menxia-agent",
            trace_id=task.id,
            payload={
                "content": f"开始审核方案，共 {len(plan.steps)} 步",
                "step": "review_start"
            }
        ))

        # 调用 LLM 审核
        result = await self._llm_review(plan)

        if result.approved:
            # 准奏事件
            await self.bus.publish(Event(
                topic="task.state.assigned",
                producer="menxia-agent",
                trace_id=task.id,
                payload={"verdict": "准奏", "reason": result.reason}
            ))
        else:
            # 封驳事件
            await self.bus.publish(Event(
                topic="task.state.zhongshu",  # 回退
                producer="menxia-agent",
                trace_id=task.id,
                payload={"verdict": "封驳", "reason": result.reason}
            ))

        return result`,
          explanation: `
            <strong>Agent 与事件总线的集成：</strong><br>
            • Agent 在关键步骤发布事件，不需要知道谁在监听<br>
            • <code>agent.thought</code>：Agent 的思考过程（流式）<br>
            • <code>task.state.*</code>：状态变更事件（触发状态机）<br>
            • Dashboard 订阅所有事件，实时展示给用户
          `
        },
        {
          type: 'code',
          title: '🖥️ WebSocket 实时推送到 Dashboard',
          code: `# Dashboard 订阅所有事件，通过 WebSocket 推送给前端
class DashboardHandler:
    def __init__(self, websocket):
        self.ws = websocket

    async def handle(self, event: Event):
        """将事件转换为前端可用的格式并推送"""
        await self.ws.send_json({
            "type":     event.topic,
            "taskId":   event.trace_id,
            "producer": event.producer,
            "data":     event.payload,
            "ts":       event.timestamp
        })

# 连接时订阅所有事件
async def on_websocket_connect(websocket, task_id: str):
    handler = DashboardHandler(websocket)

    # 订阅该任务的所有事件
    event_bus.subscribe(f"agent.*",    handler.handle)
    event_bus.subscribe(f"task.state.*", handler.handle)

    # 推送历史事件（回放）
    history = await event_store.get_by_trace(task_id)
    for event in history:
        await handler.handle(event)

    # 保持连接，持续接收新事件
    await websocket.wait_closed()`,
          explanation: `
            <strong>实时推送架构：</strong><br>
            • WebSocket：服务器主动推送，无需前端轮询<br>
            • 历史回放：新连接时先推送历史事件，再接收实时事件<br>
            • 这样刷新页面后也能看到完整的任务历史<br>
            • 前端根据 <code>type</code> 字段更新对应的 UI 组件
          `
        },
        {
          type: 'pitfalls',
          title: '⚠️ 常见问题',
          items: [
            '不要用轮询替代事件 → 每秒查询数据库会造成性能浪费，用 WebSocket 推送',
            '不要让事件携带过多数据 → 事件应该是"通知"，大数据用 ID 引用，按需查询',
            '不要忽略事件顺序 → 分布式系统中事件可能乱序，用 seq 字段保证顺序',
            '不要让订阅者失败阻塞发布 → 用 return_exceptions=True，隔离订阅者的异常',
            '不要丢失事件 → 先持久化再通知订阅者，保证事件不丢失'
          ]
        },
        {
          type: 'quiz',
          q: '为什么 EventBus.publish() 要先持久化事件，再通知订阅者？',
          opts: [
            '因为持久化比通知快',
            '保证事件不丢失：即使通知失败，事件已经记录，可以重放',
            '因为订阅者需要从数据库读取',
            '为了减少内存使用'
          ],
          ans: 1,
          feedback_ok: '✅ 完全正确！"先存后发"是事件驱动系统的黄金法则。如果先通知再存储，通知成功但存储失败，事件就永远消失了。先存储保证了：即使 WebSocket 断了、订阅者崩了，事件都在，可以重放。',
          feedback_err: '关键在于"可靠性"。如果先通知再存储，通知可以成功但存储失败，事件就丢了。"先存后发"保证事件永久记录，订阅者可以随时通过历史回放获取。'
        }
      ]
    },

    // 🔴 地狱模式
    hell: {
      sections: [
        {
          type: 'story',
          html: `
            <div class="speaker">🔥 地狱模式 - EDICT 可观测性架构</div>
            <div class="chat-bubble robot" style="border-color:var(--red)">
              🤖 ARIA：生产级的事件驱动系统远比示例复杂。<br><br>
              EDICT 的可观测性分三层：<br>
              • <strong>Thoughts</strong>：Agent 实时思考流（流式 SSE）<br>
              • <strong>Todos</strong>：结构化任务列表（增量更新）<br>
              • <strong>Events</strong>：状态变更日志（WebSocket 推送）<br><br>
              三层数据，三种传输协议，一个统一的 Dashboard。
            </div>
          `
        },
        {
          type: 'concept',
          title: '🔭 三层可观测性数据',
          html: `
            <div style="margin:14px 0">
              <p><strong>第一层：Thoughts（思考流）</strong></p>
              <div style="padding:12px;background:rgba(0,229,255,.05);border-left:3px solid var(--cyan);border-radius:8px;margin-bottom:12px;font-size:.9rem;line-height:1.7">
                Agent 在"思考"时的实时输出，类似 ChatGPT 的流式回复。<br>
                技术：<strong>Server-Sent Events (SSE)</strong> 或 WebSocket 流<br>
                特点：字符级推送，延迟 &lt; 50ms<br>
                用途：让用户看到 Agent 在"想什么"，不是黑盒
              </div>

              <p><strong>第二层：Todos（任务列表）</strong></p>
              <div style="padding:12px;background:rgba(251,191,36,.08);border-left:3px solid var(--yellow);border-radius:8px;margin-bottom:12px;font-size:.9rem;line-height:1.7">
                每个 Agent 的结构化待办事项，格式化展示进度。<br>
                技术：<strong>WebSocket + 增量 patch</strong><br>
                特点：结构化数据，支持嵌套子任务<br>
                用途：让用户看到"做了什么"，类似 Claude Code 的 TodoList
              </div>

              <p><strong>第三层：Events（状态事件）</strong></p>
              <div style="padding:12px;background:rgba(239,68,68,.05);border-left:3px solid var(--red);border-radius:8px;font-size:.9rem;line-height:1.7">
                任务状态机的变更事件，驱动 Dashboard 状态更新。<br>
                技术：<strong>WebSocket + append-only 事件流</strong><br>
                特点：不可变日志，支持时间线回放<br>
                用途：审计、调试、故障排查
              </div>
            </div>
          `
        },
        {
          type: 'code',
          title: '⚡ 生产级 Event Store（Append-Only）',
          code: `import aiosqlite
from typing import AsyncIterator

class EventStore:
    """Append-Only 事件存储，基于 SQLite（生产用 PostgreSQL/Kafka）"""

    async def append(self, event: Event) -> None:
        """写入事件（只追加，不更新不删除）"""
        async with aiosqlite.connect(self.db_path) as db:
            await db.execute("""
                INSERT INTO events
                    (event_id, trace_id, topic, producer,
                     payload, timestamp)
                VALUES (?, ?, ?, ?, ?, ?)
            """, (
                event.event_id, event.trace_id, event.topic,
                event.producer, json.dumps(event.payload),
                event.timestamp
            ))
            await db.commit()

    async def replay(self, trace_id: str,
                     since: str = None) -> AsyncIterator[Event]:
        """按 trace_id 回放事件，支持从指定时间点开始"""
        query = """
            SELECT * FROM events WHERE trace_id = ?
            {} ORDER BY rowid ASC
        """.format("AND timestamp > ?" if since else "")

        params = (trace_id, since) if since else (trace_id,)
        async with aiosqlite.connect(self.db_path) as db:
            async for row in await db.execute(query, params):
                yield Event.from_row(row)

    async def tail(self, trace_id: str) -> AsyncIterator[Event]:
        """实时订阅新事件（长轮询模式，生产用 Kafka consumer）"""
        last_rowid = 0
        while True:
            events = await self._fetch_after(trace_id, last_rowid)
            for event in events:
                last_rowid = event.rowid
                yield event
            if not events:
                await asyncio.sleep(0.1)  # 100ms 轮询间隔`,
          explanation: `
            <strong>Append-Only 的工程实践：</strong><br>
            • 数据库层：禁止 UPDATE/DELETE，只允许 INSERT<br>
            • <code>rowid</code>：SQLite 自带单调递增 ID，是天然的顺序保证<br>
            • <code>replay()</code>：支持从任意时间点回放，用于页面刷新和调试<br>
            • 生产环境用 <strong>Kafka</strong>：天然 append-only，分区并行，Consumer Group 隔离<br>
            • <code>tail()</code> 模拟 Kafka Consumer 的 long-poll 模式
          `
        },
        {
          type: 'code',
          title: '🌊 Thoughts 流式推送（SSE + 增量）',
          code: `from fastapi import FastAPI
from fastapi.responses import StreamingResponse
import asyncio

app = FastAPI()

@app.get("/tasks/{task_id}/thoughts/stream")
async def stream_thoughts(task_id: str):
    """Server-Sent Events 流式推送 Agent 思考过程"""

    async def generator():
        # 1. 先推送历史 thoughts
        history = await thought_store.get_history(task_id)
        for chunk in history:
            yield f"data: {json.dumps(chunk)}\n\n"

        # 2. 实时推送新 thoughts
        async for chunk in thought_bus.subscribe(task_id):
            yield f"data: {json.dumps(chunk)}\n\n"

            # SSE 心跳，防止连接超时
            if chunk.get("type") == "heartbeat":
                yield ": heartbeat\n\n"

    return StreamingResponse(
        generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no"  # 禁用 Nginx 缓冲
        }
    )

# Agent 发布 thought（每个 token 一条）
async def publish_thought(task_id: str, token: str, agent: str):
    chunk = {
        "type":    "thought.token",
        "agent":   agent,
        "content": token,
        "ts":      datetime.utcnow().isoformat()
    }
    await thought_store.append(task_id, chunk)  # 持久化
    await thought_bus.broadcast(task_id, chunk)  # 推送`,
          explanation: `
            <strong>流式架构关键点：</strong><br>
            • <strong>SSE vs WebSocket</strong>：Thoughts 用 SSE（单向推送更简单），状态事件用 WebSocket（双向）<br>
            • <code>X-Accel-Buffering: no</code>：必须禁用 Nginx/CDN 缓冲，否则字符流会积攒后一次性发送<br>
            • token 级粒度：每个 LLM 输出的 token 立即推送，用户感知延迟 &lt; 100ms<br>
            • 历史回放 + 实时流：刷新页面后立即看到完整历史，然后无缝衔接实时流
          `
        },
        {
          type: 'concept',
          title: '📐 EDICT Dashboard 数据架构',
          html: `
            <div style="margin:14px 0;padding:14px;background:rgba(0,229,255,.06);border-radius:12px;font-family:monospace;font-size:.85rem;line-height:1.8">
              <strong>前端 Dashboard 数据流：</strong><br><br>

              WebSocket /ws/{task_id}<br>
              &nbsp;&nbsp;├─ task.state.* → 更新状态流转图<br>
              &nbsp;&nbsp;├─ agent.todo.update → 更新各部门 TodoList<br>
              &nbsp;&nbsp;└─ agent.progress → 更新进度条<br><br>

              SSE /tasks/{id}/thoughts/stream<br>
              &nbsp;&nbsp;└─ thought.token → 流式渲染 Agent 思考<br><br>

              REST GET /tasks/{id}<br>
              &nbsp;&nbsp;└─ 页面加载时获取完整快照<br><br>

              <strong>三种协议分工：</strong><br>
              • REST：页面初始化，获取完整状态<br>
              • WebSocket：结构化事件，双向通信<br>
              • SSE：流式文本，单向高频推送
            </div>
            <div style="margin-top:16px;padding:12px;background:rgba(251,191,36,.1);border-left:3px solid var(--yellow);border-radius:8px;font-size:.9rem">
              💡 <strong>为什么不全用 WebSocket？</strong><br>
              SSE 更简单、HTTP/2 原生支持、自动重连、CDN 友好。<br>
              流式文本用 SSE，结构化事件用 WebSocket，各取所长。
            </div>
          `
        },
        {
          type: 'quiz',
          q: 'EDICT 用 SSE（Server-Sent Events）推送 Agent 思考流，而不是 WebSocket，核心原因是什么？',
          opts: [
            'SSE 性能比 WebSocket 更高',
            'Thoughts 是单向推送，SSE 更简单且 HTTP/2 原生支持；WebSocket 的双向能力此处用不到',
            'WebSocket 不支持流式文本',
            'SSE 延迟更低'
          ],
          ans: 1,
          feedback_ok: '🔥 精准！技术选型要看需求：Thoughts 只需要"服务器→客户端"单向推送，SSE 天然适合；状态事件需要双向通信（客户端可以发送控制指令），所以用 WebSocket。用最简单的工具解决问题，这是工程实践的核心原则。',
          feedback_err: '关键在于"单向 vs 双向"。Thoughts 流只需要服务器推给客户端，SSE 完全够用，而且比 WebSocket 更简单、更标准。WebSocket 留给需要双向通信的场景（如客户端发送取消指令）。'
        }
      ]
    }
  }
});
