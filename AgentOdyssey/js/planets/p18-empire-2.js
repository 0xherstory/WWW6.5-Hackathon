// 关卡 18：帝国篇 - 制度设计：状态机与分权制衡

PLANETS.push({
  id: 'p18',
  icon: '⚖️',
  num: '星球 18',
  name: '帝国星 - 制度设计',
  desc: '状态机 + 分权制衡：让 AI 系统无法越权、无法乱来！',

  difficulties: {
    // 🟢 简单模式
    easy: {
      sections: [
        {
          type: 'story',
          html: `
            <div class="speaker">⚖️ 帝国星 - 制度设计</div>
            <p>ARIA 带你深入帝国星的核心机制……</p>
            <div class="chat-bubble robot">
              🤖 ARIA：上次我们学了三省六部的整体架构。
              但你有没有想过一个问题——<br><br>
              <strong>谁来保证 Agent 真的按规矩来？</strong><br><br>
              如果中书省"偷懒"跳过门下省，直接让尚书省执行，怎么办？<br>
              如果六部"越级"直接修改中书省的方案，怎么办？
            </div>
            <div class="chat-bubble">
              👦 你：呃……靠 Agent 自觉？
            </div>
            <div class="chat-bubble robot">
              🤖 ARIA：哈哈，AI 可没有"自觉"！<br><br>
              答案是：<strong>状态机</strong> + <strong>权限矩阵</strong>。<br>
              这两个机制从代码层面强制保证——想越规？直接报错！
            </div>
          `
        },
        {
          type: 'concept',
          title: '🚦 什么是状态机？',
          html: `
            <p>你见过红绿灯吗？它就是一个状态机：</p>
            <div style="margin:14px 0;padding:14px;background:rgba(0,229,255,.06);border-radius:12px;line-height:2">
              🔴 红灯（停止）<br>
              &nbsp;&nbsp;↓ 60秒后<br>
              🟡 黄灯（准备）<br>
              &nbsp;&nbsp;↓ 3秒后<br>
              🟢 绿灯（通行）<br>
              &nbsp;&nbsp;↓ 45秒后<br>
              🔴 红灯（停止）<br><br>
              <strong>关键规则：</strong>不能从红灯直接跳到绿灯！必须经过黄灯。
            </div>
            <p>三省六部的任务也是这样：</p>
            <div style="margin:14px 0;padding:14px;background:rgba(0,229,255,.06);border-radius:12px;font-family:monospace;font-size:.85rem;line-height:1.8">
              待处理 → 太子分拣 → 中书规划 → 门下审核<br>
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;↑__（封驳）__|<br>
              门下审核通过 → 派发执行 → 执行中 → 已完成
            </div>
            <div style="margin-top:16px;padding:12px;background:rgba(251,191,36,.1);border-left:3px solid var(--yellow);border-radius:8px">
              💡 任务不能从"待处理"直接跳到"执行中"！<br>
              每一步都必须经过前一步，这叫<strong>状态机约束</strong>。
            </div>
          `
        },
        {
          type: 'concept',
          title: '🔐 什么是分权制衡？',
          html: `
            <p>想象学校里的职责分工：</p>
            <div style="margin:14px 0;padding:14px;background:rgba(0,229,255,.06);border-radius:12px;line-height:1.8">
              <strong>班长（太子）</strong> → 只能安排课代表（中书省）<br>
              <strong>课代表（中书省）</strong> → 只能找检查员和执行员<br>
              <strong>检查员（门下省）</strong> → 可以退回课代表，或放行给执行员<br>
              <strong>执行员（尚书省）</strong> → 只能安排各小组<br>
              <strong>各小组（六部）</strong> → 只能做自己的事，不能找别人
            </div>
            <p><strong>如果体育小组想改变计划怎么办？</strong></p>
            <div style="margin:14px 0;padding:12px;background:rgba(239,68,68,.05);border-left:3px solid var(--red);border-radius:8px">
              ❌ 不行！体育小组只能向执行员汇报，<br>
              由执行员反映给上级，层层传递。<br>
              直接"越级"在代码里会直接报错！
            </div>
          `
        },
        {
          type: 'quiz',
          q: '如果尚书省想修改中书省制定的方案，应该怎么办？',
          opts: [
            '直接修改中书省的方案文件',
            '尚书省没有权限修改方案，必须通过门下省反馈给中书省',
            '让六部自己决定要不要执行这个方案',
            '绕过门下省直接执行'
          ],
          ans: 1,
          feedback_ok: '🎉 正确！权限矩阵规定：尚书省只能调用六部，无权回调中书省。发现方案有问题，必须通过门下省封驳机制反馈。这就是"分权制衡"的力量！',
          feedback_err: '记住权限矩阵：尚书省 → 只能调用六部。它无权直接接触中书省。如果方案有问题，是门下省的职责来审核和封驳，而不是尚书省。'
        }
      ]
    },

    // 🟡 困难模式
    hard: {
      sections: [
        {
          type: 'story',
          html: `
            <div class="speaker">⚖️ 帝国星 - 技术版</div>
            <div class="chat-bubble robot">
              🤖 ARIA：让我们看看状态机和权限矩阵的代码实现。
              这两个机制是三省六部架构的"护城河"——
              从代码层面<strong>强制</strong>所有 Agent 守规矩。
            </div>
          `
        },
        {
          type: 'code',
          title: '💻 任务状态机实现',
          code: `from enum import Enum
from typing import Dict, Set

class TaskState(Enum):
    PENDING   = "pending"    # 待处理
    TAIZI     = "taizi"      # 太子分拣中
    ZHONGSHU  = "zhongshu"   # 中书规划中
    MENXIA    = "menxia"     # 门下审核中
    ASSIGNED  = "assigned"   # 已派发
    DOING     = "doing"      # 执行中
    REVIEW    = "review"     # 复核中
    DONE      = "done"       # 已完成
    CANCELLED = "cancelled"  # 已取消

# 合法的状态转换白名单
VALID_TRANSITIONS: Dict[TaskState, Set[TaskState]] = {
    TaskState.PENDING:   {TaskState.TAIZI},
    TaskState.TAIZI:     {TaskState.ZHONGSHU, TaskState.CANCELLED},
    TaskState.ZHONGSHU:  {TaskState.MENXIA,   TaskState.CANCELLED},
    TaskState.MENXIA:    {TaskState.ASSIGNED,  TaskState.ZHONGSHU,
                          TaskState.CANCELLED},  # 封驳回中书
    TaskState.ASSIGNED:  {TaskState.DOING,     TaskState.CANCELLED},
    TaskState.DOING:     {TaskState.REVIEW,    TaskState.CANCELLED},
    TaskState.REVIEW:    {TaskState.DONE,      TaskState.CANCELLED},
    TaskState.DONE:      set(),     # 终态，不可转换
    TaskState.CANCELLED: set(),     # 终态，不可转换
}

def transition(task, new_state: TaskState):
    allowed = VALID_TRANSITIONS.get(task.state, set())
    if new_state not in allowed:
        raise ValueError(
            f"非法转换: {task.state.value} → {new_state.value}"
        )
    task.state = new_state`,
          explanation: `
            <strong>核心要点：</strong><br>
            • 9 个状态，用枚举定义，不允许自造状态<br>
            • 白名单机制：只有列出的转换才合法<br>
            • 门下省可以转换到 ZHONGSHU（封驳）或 ASSIGNED（准奏）<br>
            • DONE 和 CANCELLED 是终态，无法再转换<br>
            • 非法转换直接抛出异常，Agent 无法越规
          `
        },
        {
          type: 'code',
          title: '🔐 权限矩阵 + 调用审计',
          code: `# 权限白名单：谁可以调用谁
PERMISSION_MATRIX = {
    'taizi':    ['zhongshu'],
    'zhongshu': ['menxia', 'shangshu'],
    'menxia':   ['shangshu', 'zhongshu'],  # 封驳时可回调中书
    'shangshu': ['libu', 'hubu', 'bingbu',
                 'xingbu', 'gongbu', 'libu_hr'],
    # 六部：空列表，不能调用任何 Agent
}

class Agent:
    def __init__(self, name: str):
        self.name = name

    async def call(self, target: str, task, payload):
        # 1. 权限检查（运行时强制）
        allowed = PERMISSION_MATRIX.get(self.name, [])
        if target not in allowed:
            raise PermissionError(
                f"[权限拒绝] {self.name} → {target} 未授权"
            )

        # 2. 记录调用审计日志
        task.flow_log.append({
            "from":    self.name,
            "to":      target,
            "ts":      datetime.now().isoformat(),
            "payload": payload
        })

        # 3. 执行调用
        return await agents[target].process(task, payload)`,
          explanation: `
            <strong>两层保障：</strong><br>
            • 权限矩阵：每次调用前检查白名单，越权立即报错<br>
            • 审计日志（flow_log）：记录完整调用链，可追溯<br>
            • flow_log 只追加、不可修改，保证审计可信<br>
            • 这样即使 Agent 的 LLM "想"越权，代码层面也拒绝
          `
        },
        {
          type: 'concept',
          title: '📅 真实任务流转时间线',
          html: `
            <p>一个实际任务在三省六部系统中的流转：</p>
            <div style="margin:14px 0;padding:14px;background:rgba(0,229,255,.06);border-radius:12px;font-family:monospace;font-size:.85rem;line-height:1.8">
              <strong>任务：开发一个用户登录功能</strong><br><br>
              DAY 1 10:00 → 太子分拣：判断为重要任务<br>
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 状态: PENDING → TAIZI → ZHONGSHU<br><br>
              DAY 1 10:30 → 中书省规划：制定 4 步方案<br>
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 状态: ZHONGSHU → MENXIA<br><br>
              DAY 1 11:00 → 门下省审核：<span style="color:var(--red)">❌ 封驳</span><br>
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 原因：未包含 SQL 注入防护<br>
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 状态: MENXIA → ZHONGSHU（封驳）<br><br>
              DAY 1 11:30 → 中书省修改：补充安全措施<br>
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 状态: ZHONGSHU → MENXIA（第2轮）<br><br>
              DAY 1 12:00 → 门下省审核：<span style="color:var(--cyan)">✅ 准奏</span><br>
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 状态: MENXIA → ASSIGNED<br><br>
              DAY 1 14:00 → 兵部/刑部并行执行<br>
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 状态: ASSIGNED → DOING<br><br>
              DAY 3 16:00 → 完成并复核<br>
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 状态: DOING → REVIEW → DONE
            </div>
            <p style="font-size:.9rem;color:var(--muted)">
              关键：门下省在第一轮<strong>封驳</strong>了未考虑安全的方案，
              这在传统框架（CrewAI/AutoGen）中是不存在的！
            </p>
          `
        },
        {
          type: 'pitfalls',
          title: '⚠️ 常见设计错误',
          items: [
            '不要用字符串表示状态 → 用枚举（Enum），避免拼写错误导致无效状态',
            '不要在状态转换外修改 task.state → 必须通过 transition() 函数，保证白名单检查',
            '不要忽略并发问题 → 多个 Agent 同时操作同一任务时，需要加锁防止竞态条件',
            '不要让权限矩阵硬编码在 Agent 内部 → 集中管理，修改时只需改一处',
            '不要遗漏 CANCELLED 状态的处理 → 任何状态都可能被取消，要处理中途取消的情况'
          ]
        },
        {
          type: 'quiz',
          q: '任务状态为 DOING（执行中）时，下列哪个状态转换是合法的？',
          opts: [
            'DOING → ZHONGSHU（回退到中书省重新规划）',
            'DOING → REVIEW（进入复核）',
            'DOING → MENXIA（重新审核）',
            'DOING → ASSIGNED（重新派发）'
          ],
          ans: 1,
          feedback_ok: '✅ 正确！DOING 只能转换到 REVIEW（正常完成）或 CANCELLED（取消）。不能回退到中书省或重新派发——状态机保证了流程的单向性！',
          feedback_err: '看看 VALID_TRANSITIONS：DOING 只能转换到 REVIEW 或 CANCELLED。状态机不允许随意回退，这保证了系统的可预测性。'
        }
      ]
    },

    // 🔴 地狱模式
    hell: {
      sections: [
        {
          type: 'story',
          html: `
            <div class="speaker">🔥 地狱模式 - 状态机工程实践</div>
            <div class="chat-bubble robot" style="border-color:var(--red)">
              🤖 ARIA：船长，生产环境的状态机远比示例复杂。<br><br>
              我们要面对：<strong>并发竞态、分布式一致性、幂等性、超时回滚、
              审计合规</strong>……<br><br>
              这一关，我们深入 EDICT 的真实实现。
            </div>
          `
        },
        {
          type: 'code',
          title: '🏭 生产级状态机实现',
          code: `import asyncio
from datetime import datetime
from typing import Optional

class TaskStateMachine:
    def __init__(self, event_bus):
        self._lock = asyncio.Lock()   # 防并发竞态
        self.event_bus = event_bus

    async def transition(self, task, new_state: TaskState,
                         actor: str, reason: str = ""):
        async with self._lock:  # 原子操作
            # 1. 合法性检查
            allowed = VALID_TRANSITIONS.get(task.state, set())
            if new_state not in allowed:
                raise ValueError(
                    f"非法转换: {task.state} → {new_state}"
                )

            old_state = task.state

            # 2. 写入不可变审计日志
            task.flow_log.append({
                "seq":       len(task.flow_log) + 1,
                "from":      old_state.value,
                "to":        new_state.value,
                "actor":     actor,
                "reason":    reason,
                "ts":        datetime.utcnow().isoformat() + "Z",
                "immutable": True   # 标记不可修改
            })

            # 3. 更新状态
            task.state = new_state
            task.updated_at = datetime.utcnow()

            # 4. 发布事件（触发 Dashboard 更新）
            await self.event_bus.publish(Event(
                topic=f"task.state.{new_state.value}",
                payload={
                    "task_id":   task.id,
                    "old_state": old_state.value,
                    "new_state": new_state.value,
                    "actor":     actor
                }
            ))

            return task`,
          explanation: `
            <strong>生产级关键设计：</strong><br>
            • <code>asyncio.Lock</code>：防止并发竞态，保证转换原子性<br>
            • 不可变 flow_log：seq 单调递增，immutable 标记，禁止篡改<br>
            • actor + reason：记录"谁"因为"什么原因"触发了转换<br>
            • Event Bus 联动：状态变更实时推送到 Dashboard<br>
            • 分布式场景需换用数据库乐观锁（version 字段 + CAS 操作）
          `
        },
        {
          type: 'code',
          title: '📋 EDICT Task JSON Schema（真实数据结构）',
          code: `{
  "id": "task-20260324-001",
  "title": "开发用户登录功能",
  "state": "done",
  "created_at": "2026-03-24T10:00:00Z",
  "updated_at": "2026-03-24T16:00:00Z",

  "flow_log": [
    {
      "seq": 1,
      "from": "pending",
      "to": "taizi",
      "actor": "system",
      "reason": "用户提交任务",
      "ts": "2026-03-24T10:00:01Z"
    },
    {
      "seq": 2,
      "from": "taizi",
      "to": "zhongshu",
      "actor": "taizi-agent",
      "reason": "判断为重要任务，需要规划",
      "ts": "2026-03-24T10:05:00Z"
    },
    {
      "seq": 3,
      "from": "menxia",
      "to": "zhongshu",
      "actor": "menxia-agent",
      "reason": "封驳：未包含 SQL 注入防护，请补充安全设计",
      "ts": "2026-03-24T11:00:00Z"
    },
    {
      "seq": 4,
      "from": "menxia",
      "to": "assigned",
      "actor": "menxia-agent",
      "reason": "准奏：方案完整，安全措施已补充",
      "ts": "2026-03-24T12:00:00Z"
    }
  ],

  "plan": { "steps": [...], "review_rounds": 2 },
  "assignments": { "bingbu": [...], "xingbu": [...] },
  "results": { "status": "success", "artifacts": [...] }
}`,
          explanation: `
            <strong>flow_log 的设计精髓：</strong><br>
            • <strong>只追加、不可修改</strong>：seq 单调递增，是天然的篡改检测<br>
            • 每条记录包含 from/to/actor/reason/ts，完整还原决策过程<br>
            • 封驳记录（seq:3）清晰说明了"为什么封驳"——这是合规审计的核心<br>
            • 可以完整"回放"任务的生命周期，定位任何历史问题
          `
        },
        {
          type: 'concept',
          title: '🖥️ 为什么状态机必须配合 Dashboard？',
          html: `
            <p><strong>黑盒 vs 白盒：</strong></p>
            <div style="margin:14px 0;padding:14px;background:rgba(239,68,68,.05);border-left:3px solid var(--red);line-height:1.8">
              <strong>传统 Multi-Agent（黑盒）：</strong><br>
              你提交任务 → 等待 → 得到结果<br>
              中间发生了什么？你不知道。<br>
              出错了怎么定位？不知道。<br>
              能不能中途干预？不能。
            </div>
            <div style="margin:14px 0;padding:14px;background:rgba(0,229,255,.05);border-left:3px solid var(--cyan);line-height:1.8">
              <strong>三省六部 + Dashboard（白盒）：</strong><br>
              实时看到每个 Agent 的"思考"（Thoughts）<br>
              实时看到任务状态流转（State Flow）<br>
              实时看到各部门的待办（Todos）<br>
              可以随时叫停（Cancel）、恢复（Resume）<br>
              flow_log 提供完整的事后审计
            </div>
            <div style="margin:14px 0;padding:14px;background:rgba(251,191,36,.1);border-left:3px solid var(--yellow);border-radius:8px">
              💡 <strong>EDICT 的三层可观测性数据：</strong><br>
              1. <strong>Thoughts</strong>：Agent 的实时思考流（流式输出）<br>
              2. <strong>Todos</strong>：每个 Agent 的任务清单（结构化）<br>
              3. <strong>Events</strong>：状态变更事件（用于 Dashboard 推送）
            </div>
          `
        },
        {
          type: 'pitfalls',
          title: '🔥 分布式状态机的深层问题',
          items: [
            '乐观锁（Optimistic Lock）：数据库用 version 字段，UPDATE WHERE version=old_version，失败则重试，防止并发写冲突',
            '幂等性（Idempotency）：同一个 transition 请求可能因网络重试被执行多次——用 event_id 去重，保证状态机最终一致',
            '超时与补偿：Agent 执行超时怎么办？EDICT 用 Saga 模式，超时后触发补偿事务回滚到安全状态',
            '状态爆炸：复杂业务可能导致状态数量爆炸——用层次状态机（HSM）或正交状态机拆分，保持可维护性',
            'flow_log 的不可变性：在分布式系统中，用 append-only 数据结构（如 Kafka topic 或 immutable DB table）保证日志无法被篡改'
          ]
        },
        {
          type: 'quiz',
          q: 'EDICT 的 flow_log 为什么设计成"只追加、不可修改"？',
          opts: [
            '因为数据库性能更好',
            '保证审计合规：任何决策（包括封驳）都有完整记录，无法事后篡改',
            '因为代码更简单',
            '为了节省存储空间'
          ],
          ans: 1,
          feedback_ok: '🔥 深刻理解！Append-only 的 flow_log 是信任的基础——你可以验证"门下省确实在时间 T 封驳了方案，原因是 X"，没有人能事后修改这条记录。这在合规审计、责任追溯、故障排查中至关重要。',
          feedback_err: '核心在于"信任"和"合规"。如果 flow_log 可以修改，那审计就失去了意义——谁能保证记录没被篡改？Append-only 通过不可变性建立信任，这是 EDICT 的核心设计原则之一。'
        }
      ]
    }
  }
});
