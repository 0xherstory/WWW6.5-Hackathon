// 关卡 21：帝国篇 - 实战项目：构建你的帝国系统

PLANETS.push({
  id: 'p21',
  icon: '👑',
  num: '星球 21',
  name: '帝国星 - 实战项目',
  desc: '综合运用三省六部：从零构建一个完整的帝国 AI 系统！',

  difficulties: {
    // 🟢 简单模式
    easy: {
      sections: [
        {
          type: 'story',
          html: `
            <div class="speaker">👑 帝国星 - 终极挑战！</div>
            <p>ARIA 和你到达了帝国星的核心——皇宫！</p>
            <div class="chat-bubble robot">
              🤖 ARIA：船长！这是帝国篇的最后一关！<br><br>
              你已经学完了所有的知识：<br>
              🏛️ 三省六部架构<br>
              ⚖️ 状态机 + 分权制衡<br>
              📡 Event-Driven 实时观测<br>
              🔍 门下省质量审核<br><br>
              现在，是时候把这些组合在一起，<br>
              <strong>建造你自己的帝国 AI 系统！</strong>
            </div>
            <div class="chat-bubble">
              👦 你：太棒了！但是……从哪里开始呢？
            </div>
            <div class="chat-bubble robot">
              🤖 ARIA：别担心，我们一步一步来。
              先设计好"蓝图"，再按蓝图建造！
            </div>
          `
        },
        {
          type: 'concept',
          title: '🗺️ 项目蓝图：班级任务助手',
          html: `
            <p>我们来建造一个真实的班级任务管理系统：</p>
            <div style="margin:14px 0;padding:14px;background:rgba(0,229,255,.06);border-radius:12px;line-height:1.9">
              <strong>📋 系统功能：</strong><br>
              同学提交任务 → AI 自动规划 → 质量审核 → 分配给各小组<br><br>

              <strong>🎭 角色设计：</strong><br>
              • 值日生 AI：判断任务是否需要规划<br>
              • 计划 AI：制定详细步骤<br>
              • 检查 AI：审核计划，挑毛病<br>
              • 分配 AI：把任务分配给各小组<br>
              • 执行小组（体育/文艺/卫生等）<br><br>

              <strong>📺 看板功能：</strong><br>
              实时看到每个任务在哪个阶段<br>
              看到 AI 在"想什么"<br>
              可以随时取消任务
            </div>
          `
        },
        {
          type: 'concept',
          title: '🏆 帝国篇总结：你学会了什么？',
          html: `
            <p>回顾一下帝国篇的五颗星球：</p>
            <div style="margin:14px 0;padding:14px;background:rgba(0,229,255,.06);border-radius:12px;line-height:2">
              🏛️ <strong>星球 17</strong>：三省六部架构<br>
              &nbsp;&nbsp;→ AI 团队需要制度，不能自由散漫<br><br>

              ⚖️ <strong>星球 18</strong>：状态机与分权制衡<br>
              &nbsp;&nbsp;→ 代码层面强制守规矩，不靠自觉<br><br>

              📡 <strong>星球 19</strong>：Event-Driven 实时观测<br>
              &nbsp;&nbsp;→ 公告板让一切透明可见<br><br>

              🔍 <strong>星球 20</strong>：门下省质量审核<br>
              &nbsp;&nbsp;→ 强制质量关卡，问题越早发现越好<br><br>

              👑 <strong>星球 21</strong>：综合实战<br>
              &nbsp;&nbsp;→ 把所有知识组合成真实系统！
            </div>
            <div style="margin-top:16px;padding:12px;background:rgba(251,191,36,.1);border-left:3px solid var(--yellow);border-radius:8px">
              🎉 <strong>你已经掌握了生产级 Multi-Agent 系统的核心设计！</strong><br>
              这些知识来自真实的开源项目 EDICT，可以直接用于实际工作。
            </div>
          `
        },
        {
          type: 'quiz',
          q: '三省六部架构相比"让 AI 自由协作"最核心的改进是什么？',
          opts: [
            'AI 更多，处理速度更快',
            '制度化流程 + 强制审核 = 可控、可观测、可信赖的 AI 系统',
            '代码更少，更容易维护',
            '不需要人工介入'
          ],
          ans: 1,
          feedback_ok: '🏆 完美！这正是帝国篇的核心思想。自由协作的 AI 像一盘散沙，有了制度化流程，每一步都可预测、可审计、可干预。这才是生产级 AI 系统应有的样子！',
          feedback_err: '核心在于"可控"。AI 自由协作虽然灵活，但不可控、不可观测、不可信赖。三省六部用制度化流程解决了这个问题——不是限制 AI 的能力，而是给 AI 配上了"制度的护栏"。'
        }
      ]
    },

    // 🟡 困难模式
    hard: {
      sections: [
        {
          type: 'story',
          html: `
            <div class="speaker">👑 帝国星 - 技术版</div>
            <div class="chat-bubble robot">
              🤖 ARIA：让我们把帝国篇所有技术组合在一起，
              构建完整的三省六部系统。
              这是一个可以直接部署的项目骨架。
            </div>
          `
        },
        {
          type: 'concept',
          title: '🏗️ 项目结构',
          html: `
            <div style="margin:14px 0;padding:14px;background:rgba(0,229,255,.06);border-radius:12px;font-family:monospace;font-size:.85rem;line-height:1.8">
              imperial_system/<br>
              ├── agents/<br>
              │&nbsp;&nbsp; ├── taizi.py&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;# 太子：分拣<br>
              │&nbsp;&nbsp; ├── zhongshu.py&nbsp;&nbsp;# 中书省：规划<br>
              │&nbsp;&nbsp; ├── menxia.py&nbsp;&nbsp;&nbsp;&nbsp;# 门下省：审核<br>
              │&nbsp;&nbsp; ├── shangshu.py&nbsp;&nbsp;# 尚书省：派发<br>
              │&nbsp;&nbsp; └── departments/ # 六部：执行<br>
              │&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ├── libu.py<br>
              │&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ├── hubu.py<br>
              │&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; └── bingbu.py<br>
              ├── core/<br>
              │&nbsp;&nbsp; ├── state_machine.py  # 状态机<br>
              │&nbsp;&nbsp; ├── event_bus.py&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;# 事件总线<br>
              │&nbsp;&nbsp; └── permissions.py&nbsp;&nbsp;&nbsp;&nbsp;# 权限矩阵<br>
              ├── api/<br>
              │&nbsp;&nbsp; ├── tasks.py&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;# REST API<br>
              │&nbsp;&nbsp; └── ws.py&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;# WebSocket<br>
              └── main.py&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;# 入口
            </div>
          `
        },
        {
          type: 'code',
          title: '💻 完整工作流：把一切串联起来',
          code: `class ImperialWorkflow:
    """三省六部完整工作流"""

    def __init__(self, llm, event_bus):
        self.sm  = TaskStateMachine(event_bus)
        self.bus = event_bus

        # 初始化所有 Agent
        self.taizi    = TaiziAgent(llm, event_bus)
        self.zhongshu = ZhongshuAgent(llm, event_bus)
        self.menxia   = MenxiaAgent(llm, event_bus)
        self.shangshu = ShangshuAgent(llm, event_bus)
        self.depts    = DepartmentPool(llm, event_bus)

    async def run(self, task: Task) -> TaskResult:
        try:
            # 1. 太子分拣
            await self.sm.transition(task, TaskState.TAIZI, "system")
            if not await self.taizi.is_important(task):
                return await self.taizi.reply_directly(task)

            # 2. 中书省规划
            await self.sm.transition(task, TaskState.ZHONGSHU, "taizi")
            plan = await self.zhongshu.create_plan(task)

            # 3. 门下省审核（含封驳循环）
            await self.sm.transition(task, TaskState.MENXIA, "zhongshu")
            plan = await self.menxia.review_with_retry(task, plan)

            # 4. 尚书省派发
            await self.sm.transition(task, TaskState.ASSIGNED, "menxia")
            assignments = await self.shangshu.dispatch(task, plan)

            # 5. 六部并行执行
            await self.sm.transition(task, TaskState.DOING, "shangshu")
            results = await asyncio.gather(
                *[self.depts.execute(a) for a in assignments]
            )

            # 6. 完成
            await self.sm.transition(task, TaskState.DONE, "shangshu")
            return TaskResult(success=True, outputs=results)

        except Exception as e:
            await self.sm.transition(task, TaskState.CANCELLED, "system")
            raise`,
          explanation: `
            <strong>整合所有帝国篇知识：</strong><br>
            • 状态机（p18）：每一步都调用 <code>sm.transition()</code><br>
            • 门下省审核（p20）：<code>review_with_retry</code> 含封驳循环<br>
            • 事件总线（p19）：所有 Agent 初始化时注入 <code>event_bus</code><br>
            • 并行执行：<code>asyncio.gather</code> 让六部同时工作<br>
            • 异常处理：任何步骤失败 → 状态转为 CANCELLED，不留"僵尸任务"
          `
        },
        {
          type: 'code',
          title: '🚀 FastAPI 入口 + 启动',
          code: `from fastapi import FastAPI, WebSocket
from contextlib import asynccontextmanager

app = FastAPI(title="Imperial System")
workflow: ImperialWorkflow = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    global workflow
    llm      = AnthropicClient(model="claude-opus-4-6")
    event_bus = EventBus(EventStore("events.db"))
    workflow  = ImperialWorkflow(llm, event_bus)
    yield  # 应用运行期间
    # 关闭清理（如有需要）

app = FastAPI(lifespan=lifespan)

@app.post("/tasks")
async def create_task(body: TaskRequest):
    task = Task(id=uuid4(), title=body.title)
    # 异步执行，立即返回 task_id
    asyncio.create_task(workflow.run(task))
    return {"task_id": str(task.id)}

@app.websocket("/ws/{task_id}")
async def websocket_endpoint(ws: WebSocket, task_id: str):
    await ws.accept()
    handler = DashboardHandler(ws)
    event_bus.subscribe("*", handler.handle)
    # 推送历史
    async for event in event_store.replay(task_id):
        await handler.handle(event)
    await ws.wait_closed()`,
          explanation: `
            <strong>生产级 API 设计：</strong><br>
            • 异步执行：<code>create_task()</code> 立即返回，任务在后台运行<br>
            • WebSocket：客户端连接后立即推送历史事件，再实时接收新事件<br>
            • 单例 Workflow：通过 <code>lifespan</code> 管理，共享 LLM 连接池<br>
            • 前端用 task_id 订阅 WebSocket，实现任务级别的实时更新
          `
        },
        {
          type: 'pitfalls',
          title: '⚠️ 生产部署常见问题',
          items: [
            'LLM 调用成本 → 用 token 计数监控，设置任务级别的 max_tokens 预算',
            '并发任务过多 → 用任务队列（Redis Queue / Celery）控制并发数',
            'WebSocket 连接数 → 用连接池 + 心跳检测，及时清理断开的连接',
            '状态机数据持久化 → 重启后状态丢失？用数据库持久化 task.state，启动时恢复',
            '测试困难 → 为每个 Agent 写单独的单元测试，Mock LLM 响应；集成测试用真实 LLM'
          ]
        },
        {
          type: 'quiz',
          q: '用户提交任务后，API 立即返回 task_id 而不是等待结果，这种设计模式叫什么？',
          opts: [
            '同步处理模式',
            '异步任务模式（Fire and Forget + Polling/WebSocket）',
            '批处理模式',
            '流式响应模式'
          ],
          ans: 1,
          feedback_ok: '✅ 正确！Multi-Agent 任务通常需要数分钟甚至数小时，不可能让 HTTP 请求等那么久。"提交→立即返回 ID→WebSocket 实时更新"是标准的异步任务模式。这和 CI/CD 系统（提交代码→立即返回构建 ID→等待构建结果）完全相同。',
          feedback_err: 'Multi-Agent 任务耗时很长，HTTP 请求不能等待。正确模式是"异步任务"：提交后立即返回 task_id，客户端通过 WebSocket 订阅实时状态更新。这样用户体验好，服务器也不会被长连接拖垮。'
        }
      ]
    },

    // 🔴 地狱模式
    hell: {
      sections: [
        {
          type: 'story',
          html: `
            <div class="speaker">🔥 地狱模式 - 生产环境最佳实践</div>
            <div class="chat-bubble robot" style="border-color:var(--red)">
              🤖 ARIA：你已经掌握了三省六部的核心设计。<br>
              最后这一关，我们讨论真正上线时需要面对的挑战：<br><br>
              <strong>可靠性、成本、安全、可扩展性</strong>。<br><br>
              这是 EDICT 项目在生产环境中真实面对的问题。
            </div>
          `
        },
        {
          type: 'concept',
          title: '💰 成本控制：Token 预算系统',
          html: `
            <p><strong>Multi-Agent 系统最大的隐患是成本失控。</strong></p>
            <div style="margin:14px 0;padding:14px;background:rgba(239,68,68,.05);border-left:3px solid var(--red);border-radius:8px;font-size:.9rem;line-height:1.7">
              场景：门下省封驳了 3 轮，中书省每次都用 4000 tokens 重写方案。<br>
              再加上 12 个 Agent 并行执行……<br>
              <strong>一个任务可能消耗 $5~50 的 API 费用！</strong>
            </div>
            <div style="margin:14px 0;padding:14px;background:rgba(0,229,255,.05);border-left:3px solid var(--cyan);border-radius:8px;font-size:.9rem;line-height:1.8">
              <strong>EDICT 的成本控制策略：</strong><br>
              • 任务级 Token 预算：每个任务设置 max_tokens 上限<br>
              • 阶段预算分配：规划 20%、审核 10%、执行 70%<br>
              • 超预算预警：消耗 80% 时通知人工介入<br>
              • 模型分级使用：简单任务用 Haiku，复杂规划用 Opus<br>
              • Prompt 缓存：相似任务复用历史规划，减少重复 tokens
            </div>
          `
        },
        {
          type: 'code',
          title: '🛡️ 可靠性：Saga 模式处理分布式失败',
          code: `class ImperialSaga:
    """Saga 模式：分布式任务的失败补偿"""

    # 每个步骤对应一个补偿操作
    COMPENSATIONS = {
        TaskState.ZHONGSHU: "cancel_plan",
        TaskState.ASSIGNED:  "unassign_departments",
        TaskState.DOING:     "abort_department_tasks",
    }

    async def run_with_compensation(self, task: Task):
        completed_steps = []
        try:
            for step in self.steps:
                await step.execute(task)
                completed_steps.append(step)

        except Exception as e:
            # 按相反顺序补偿已完成的步骤
            for step in reversed(completed_steps):
                compensation = self.COMPENSATIONS.get(step.state)
                if compensation:
                    try:
                        await getattr(self, compensation)(task)
                    except Exception as comp_err:
                        # 补偿失败：记录日志，人工处理
                        await self.alert_ops(task, comp_err)

            await self.sm.transition(
                task, TaskState.CANCELLED, "saga"
            )
            raise

# 幂等性保护：防止重试导致重复执行
async def idempotent_execute(task_id: str, step: str, fn):
    key = f"executed:{task_id}:{step}"
    if await redis.exists(key):
        return await redis.get(key)  # 返回缓存结果
    result = await fn()
    await redis.setex(key, 3600, result)  # 缓存1小时
    return result`,
          explanation: `
            <strong>分布式可靠性关键技术：</strong><br>
            • <strong>Saga 模式</strong>：无法用数据库事务的分布式场景，用补偿操作回滚<br>
            • 补偿顺序：必须按步骤的反序执行，才能正确撤销<br>
            • <strong>幂等性</strong>：用 Redis 记录已执行的步骤，网络重试不会重复执行<br>
            • 补偿失败兜底：补偿本身也可能失败，需要告警人工处理（二次事故）
          `
        },
        {
          type: 'concept',
          title: '📊 帝国篇知识图谱',
          html: `
            <p><strong>五颗星球，一个完整的生产级系统：</strong></p>
            <div style="margin:14px 0;padding:14px;background:rgba(0,229,255,.06);border-radius:12px;font-size:.85rem;line-height:1.9">
              <strong>架构层（p17）</strong><br>
              三省六部分工 → 解决"谁做什么"的问题<br><br>

              <strong>控制层（p18）</strong><br>
              状态机 + 权限矩阵 → 解决"怎么保证按规矩来"<br><br>

              <strong>观测层（p19）</strong><br>
              Event-Driven + Dashboard → 解决"怎么知道在发生什么"<br><br>

              <strong>质量层（p20）</strong><br>
              门下省审核 → 解决"怎么保证输出质量"<br><br>

              <strong>工程层（p21）</strong><br>
              成本控制 + Saga + 幂等性 → 解决"怎么真正上线"
            </div>
            <div style="margin-top:16px;padding:14px;background:rgba(251,191,36,.1);border-left:3px solid var(--yellow);border-radius:8px;font-size:.9rem">
              🏛️ <strong>三省六部的设计哲学：</strong><br>
              1300 年前，唐朝用制度解决了"如何让一个大帝国有序运转"。<br>
              今天，我们用同样的思想解决"如何让 12 个 AI Agent 可信协作"。<br><br>
              <strong>好的制度设计，跨越千年依然有效。</strong>
            </div>
          `
        },
        {
          type: 'quiz',
          q: 'EDICT 使用 Saga 模式而非数据库事务（ACID）来保证分布式一致性，根本原因是什么？',
          opts: [
            'Saga 性能比数据库事务更高',
            '跨多个 LLM API 调用和微服务的操作无法纳入单个数据库事务，Saga 用补偿操作实现最终一致性',
            '数据库事务不支持异步操作',
            'Saga 代码更简单'
          ],
          ans: 1,
          feedback_ok: '🔥 深刻！ACID 事务要求所有操作在同一个数据库连接内原子提交。但三省六部的每一步都是一次独立的 LLM API 调用，可能跨越多个服务和时间段，根本无法纳入单个事务。Saga 用"补偿操作"模拟回滚，牺牲强一致性换取可操作性——这是分布式系统的基本取舍。',
          feedback_err: '关键在于事务的边界。数据库事务要求操作在同一连接内瞬间完成。但三省六部的工作流可能持续数分钟、跨越多个 LLM API、多个微服务，这超出了单个 ACID 事务的能力范围。Saga 是分布式系统的标准解决方案。'
        }
      ]
    }
  }
});
