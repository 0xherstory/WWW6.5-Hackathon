# 🏛️ 帝国篇关卡设计文档

基于 EDICT 项目（三省六部 Multi-Agent 系统），设计 5 个实战关卡。

---

## 关卡 17：帝国基础 - 三省六部架构

### 学习目标
- 理解三省六部的历史背景和设计哲学
- 掌握 Multi-Agent 协作的制度化设计
- 了解分权制衡在 AI 系统中的应用

### 简单模式（小学生）
**故事：小明的班级管理系统**

小明当了班长，要管理班级的各种事务。他发现一个人做不过来，于是：
- **值日生（太子）**：接收同学的请求，判断是重要的还是闲聊
- **计划委员（中书省）**：制定计划，比如"运动会需要准备什么"
- **检查委员（门下省）**：检查计划是否合理，不合理就打回重做
- **执行委员（尚书省）**：把任务分配给不同的小组
- **各个小组（六部）**：体育组、文艺组、卫生组等，各司其职

**关键概念：**
- 分工合作
- 质量检查
- 不能越级（体育组不能直接找计划委员）

### 困难模式（工程师）
**核心架构：**

```python
# 三省六部架构示例
class ImperialSystem:
    def __init__(self):
        self.taizi = TaiziAgent()      # 分拣
        self.zhongshu = ZhongshuAgent() # 规划
        self.menxia = MenxiaAgent()     # 审核
        self.shangshu = ShangshuAgent() # 派发
        self.departments = {
            'li': LibuAgent(),    # 礼部
            'hu': HubuAgent(),    # 户部
            'bing': BingbuAgent(), # 兵部
            'xing': XingbuAgent(), # 刑部
            'gong': GongbuAgent(), # 工部
            'li_hr': LibuHRAgent() # 吏部
        }

    async def process_task(self, task):
        # 1. 太子分拣
        if not await self.taizi.is_important(task):
            return await self.taizi.reply_directly(task)

        # 2. 中书省规划
        plan = await self.zhongshu.create_plan(task)

        # 3. 门下省审核（最多3轮）
        for attempt in range(3):
            review = await self.menxia.review(plan)
            if review.approved:
                break
            plan = await self.zhongshu.revise(plan, review.feedback)

        # 4. 尚书省派发
        assignments = await self.shangshu.dispatch(plan)

        # 5. 六部执行
        results = await self.execute_departments(assignments)

        # 6. 汇总回奏
        return await self.zhongshu.report(results)
```

**关键点：**
- 严格的调用权限矩阵
- 门下省的封驳机制
- 状态机管理

### 地狱模式（论文级）
**EDICT 架构深度解析：**

1. **权限矩阵设计**
   - 太子只能调用中书省
   - 中书省只能调用门下省和尚书省
   - 门下省可以封驳，强制返回中书省
   - 尚书省只能调用六部，不能越权

2. **状态机设计**
   ```
   Pending → Taizi → Zhongshu → Menxia →
   (封驳循环) → Assigned → Doing → Review → Done
   ```

3. **为什么这样设计？**
   - 防止 Agent 相互制造假数据
   - 强制质量关卡（门下省审核）
   - 完全可观测（每一步都有记录）
   - 可干预（可以随时叫停）

---

## 关卡 18：制度设计 - 分权制衡与状态机

### 学习目标
- 掌握状态机在 Multi-Agent 系统中的应用
- 理解权限矩阵的设计原则
- 学会设计可靠的任务流转机制

### 简单模式
**故事：游戏关卡的状态管理**

玩游戏时，角色有不同的状态：
- 待机 → 移动 → 攻击 → 受伤 → 死亡
- 不能从"待机"直接跳到"死亡"
- 每个状态转换都有条件

三省六部也是这样：
- 任务不能跳过门下省直接到六部
- 每个状态转换都要检查是否合法

### 困难模式
**状态机实现：**

```python
from enum import Enum
from typing import Dict, Set

class TaskState(Enum):
    PENDING = "pending"
    TAIZI = "taizi"
    ZHONGSHU = "zhongshu"
    MENXIA = "menxia"
    ASSIGNED = "assigned"
    DOING = "doing"
    REVIEW = "review"
    DONE = "done"
    CANCELLED = "cancelled"

class StateTransitionValidator:
    # 合法的状态转换
    VALID_TRANSITIONS: Dict[TaskState, Set[TaskState]] = {
        TaskState.PENDING: {TaskState.TAIZI},
        TaskState.TAIZI: {TaskState.ZHONGSHU, TaskState.CANCELLED},
        TaskState.ZHONGSHU: {TaskState.MENXIA, TaskState.CANCELLED},
        TaskState.MENXIA: {
            TaskState.ASSIGNED,  # 准奏
            TaskState.ZHONGSHU,  # 封驳
            TaskState.CANCELLED
        },
        TaskState.ASSIGNED: {TaskState.DOING, TaskState.CANCELLED},
        TaskState.DOING: {TaskState.REVIEW, TaskState.CANCELLED},
        TaskState.REVIEW: {TaskState.DONE, TaskState.CANCELLED},
        TaskState.DONE: set(),
        TaskState.CANCELLED: set()
    }

    @classmethod
    def can_transition(cls, from_state: TaskState,
                      to_state: TaskState) -> bool:
        return to_state in cls.VALID_TRANSITIONS.get(from_state, set())

    @classmethod
    def validate_transition(cls, task, new_state: TaskState):
        if not cls.can_transition(task.state, new_state):
            raise ValueError(
                f"Invalid transition: {task.state} → {new_state}"
            )
```

**权限矩阵：**

```python
PERMISSION_MATRIX = {
    'taizi': ['zhongshu'],
    'zhongshu': ['menxia', 'shangshu'],
    'menxia': ['shangshu', 'zhongshu'],  # 可以封驳回中书
    'shangshu': ['libu', 'hubu', 'bingbu', 'xingbu', 'gongbu', 'libu_hr'],
    # 六部不能调用其他 Agent
}

def can_call(caller: str, callee: str) -> bool:
    return callee in PERMISSION_MATRIX.get(caller, [])
```

### 地狱模式
**完整的状态机设计模式：**

1. **状态转换的原子性**
   - 使用数据库事务保证状态转换的原子性
   - 乐观锁防止并发冲突

2. **状态转换的审计**
   - 每次状态转换都记录：谁、什么时候、为什么
   - 完整的审计日志用于回溯

3. **异常处理**
   - 超时自动回滚
   - 失败重试机制
   - 人工干预接口

---

## 关卡 19：实时观测 - Event-Driven 架构

### 学习目标
- 理解事件驱动架构的优势
- 掌握实时数据流的设计
- 学会构建可观测的 Agent 系统

### 简单模式
**故事：班级的公告板**

班级有一个公告板，所有重要的事情都贴在上面：
- 小明发布了一个任务 → 贴公告
- 计划委员制定了计划 → 贴公告
- 检查委员审核通过 → 贴公告
- 各个小组完成任务 → 贴公告

所有人都能看到公告板，知道现在进行到哪一步了。

### 困难模式
**Event-Driven 架构：**

```python
from dataclasses import dataclass
from datetime import datetime
from typing import Any, Dict
import asyncio

@dataclass
class Event:
    event_id: str
    trace_id: str  # 任务ID
    timestamp: datetime
    topic: str
    event_type: str
    producer: str
    payload: Dict[str, Any]

class EventBus:
    def __init__(self):
        self.subscribers = {}

    def subscribe(self, topic: str, handler):
        if topic not in self.subscribers:
            self.subscribers[topic] = []
        self.subscribers[topic].append(handler)

    async def publish(self, event: Event):
        # 持久化事件
        await self.store_event(event)

        # 通知订阅者
        handlers = self.subscribers.get(event.topic, [])
        await asyncio.gather(*[h(event) for h in handlers])

# 使用示例
event_bus = EventBus()

# Dashboard 订阅所有事件
event_bus.subscribe('task.*', dashboard_handler)
event_bus.subscribe('agent.thoughts', thoughts_handler)
event_bus.subscribe('agent.todo.update', todo_handler)

# Agent 发布事件
await event_bus.publish(Event(
    event_id=uuid4(),
    trace_id=task_id,
    timestamp=datetime.now(),
    topic='agent.thoughts',
    event_type='thought.append',
    producer='zhongshu-agent',
    payload={'content': '正在分析任务...', 'step': 1}
))
```

**实时 Dashboard：**

```python
# WebSocket 推送
async def websocket_handler(websocket):
    async def push_to_client(event):
        await websocket.send_json({
            'event': event.topic,
            'data': event.payload
        })

    # 订阅事件
    event_bus.subscribe('*', push_to_client)
```

### 地狱模式
**完整的可观测性架构：**

1. **三层数据流**
   - Thoughts（思考过程）
   - Todos（任务列表）
   - Events（状态变更）

2. **实时性保证**
   - WebSocket 推送（< 100ms 延迟）
   - 事件流式处理
   - 增量更新

3. **回放机制**
   - 完整的事件存储
   - 时间线回放
   - 调试和审计

---

## 关卡 20：质量保障 - 门下省审核机制

### 学习目标
- 理解质量关卡的重要性
- 掌握审核机制的设计
- 学会实现可封驳的流程

### 简单模式
**故事：作业检查员**

老师让小明写作业，但不是写完就交：
1. 小明写完作业
2. 课代表检查：字写得清楚吗？答案对吗？
3. 如果不合格，打回重写
4. 最多检查 3 次，如果还不行就告诉老师

这就是"门下省"的工作！

### 困难模式
**门下省审核实现：**

```python
class MenxiaAgent:
    MAX_REVIEW_ROUNDS = 3

    async def review(self, plan: Plan) -> ReviewResult:
        # 1. 调用 LLM 审核
        review_prompt = f"""
        你是门下省审议官，负责审查中书省的方案。

        方案内容：
        {plan.content}

        请从以下角度审查：
        1. 可行性：方案是否可以执行？
        2. 完整性：是否遗漏了重要步骤？
        3. 风险性：是否有潜在风险？

        如果合格，回复"准奏"。
        如果不合格，说明原因并给出修改建议。
        """

        response = await self.llm.call(review_prompt)

        # 2. 解析审核结果
        if '准奏' in response:
            return ReviewResult(
                approved=True,
                feedback=response
            )
        else:
            return ReviewResult(
                approved=False,
                feedback=response,
                suggestions=self.extract_suggestions(response)
            )

    async def review_with_retry(self, plan: Plan) -> Plan:
        """带重试的审核流程"""
        for round_num in range(self.MAX_REVIEW_ROUNDS):
            review = await self.review(plan)

            if review.approved:
                return plan

            # 封驳：返回中书省修改
            plan = await self.zhongshu.revise(
                plan,
                review.feedback
            )

        # 3 轮都不通过，升级处理
        raise ReviewFailedException(
            f"方案经过 {self.MAX_REVIEW_ROUNDS} 轮审核仍未通过"
        )
```

**关键设计：**
- 强制审核（不是可选的）
- 可封驳（有权打回重做）
- 有限重试（防止无限循环）

### 地狱模式
**审核机制的深度设计：**

1. **审核标准的量化**
   ```python
   class ReviewCriteria:
       feasibility_score: float  # 可行性评分
       completeness_score: float # 完整性评分
       risk_score: float         # 风险评分

       def is_approved(self) -> bool:
           return (
               self.feasibility_score >= 0.8 and
               self.completeness_score >= 0.7 and
               self.risk_score <= 0.3
           )
   ```

2. **审核历史追踪**
   - 记录每一轮的审核意见
   - 追踪修改历史
   - 分析审核通过率

3. **人工介入机制**
   - 3 轮不通过时，通知人类
   - 人类可以强制通过或取消
   - 记录人工决策原因

---

## 关卡 21：实战项目 - 构建你的帝国系统

### 学习目标
- 综合运用前面学到的所有知识
- 从零构建一个完整的三省六部系统
- 理解生产环境的最佳实践

### 简单模式
**项目：班级任务管理系统**

帮小明的班级建立一个完整的任务管理系统：
1. 设计角色（值日生、计划委员、检查委员、各小组）
2. 定义流程（接收 → 规划 → 审核 → 执行 → 完成）
3. 实现检查机制（不合格就重做）
4. 添加看板（能看到每个任务的进度）

### 困难模式
**完整项目实现：**

```python
# 项目结构
imperial_system/
├── agents/
│   ├── taizi.py
│   ├── zhongshu.py
│   ├── menxia.py
│   ├── shangshu.py
│   └── departments/
│       ├── libu.py
│       ├── hubu.py
│       └── ...
├── core/
│   ├── state_machine.py
│   ├── event_bus.py
│   ├── permission.py
│   └── workflow.py
├── api/
│   ├── tasks.py
│   ├── websocket.py
│   └── admin.py
├── dashboard/
│   ├── components/
│   └── App.tsx
└── tests/
    └── ...

# 核心实现步骤
1. 实现状态机和权限矩阵
2. 实现事件总线
3. 实现各个 Agent
4. 实现 API 和 WebSocket
5. 实现 Dashboard
6. 编写测试
7. 部署和监控
```

### 地狱模式
**生产环境最佳实践：**

1. **可靠性**
   - 事务保证
   - 失败重试
   - 降级策略

2. **性能**
   - 异步处理
   - 并行执行
   - 缓存优化

3. **可观测性**
   - 完整日志
   - 性能监控
   - 告警机制

4. **安全性**
   - 权限验证
   - 数据加密
   - 审计日志

---

## 🎯 学习路径

```
关卡 17: 理解架构 → 知道"是什么"
关卡 18: 掌握机制 → 知道"为什么"
关卡 19: 实现观测 → 知道"怎么看"
关卡 20: 保障质量 → 知道"怎么控"
关卡 21: 综合实战 → 知道"怎么做"
```

---

## 📚 参考资料

- EDICT 项目：https://github.com/cft0808/edict
- 架构文档：edict_agent_architecture.md
- 任务分发文档：docs/task-dispatch-architecture.md

---

## 🎮 游戏化设计

每个关卡包含：
- 📖 故事模式（简单）：用故事讲解概念
- 💻 代码模式（困难）：实际代码实现
- 🔥 论文模式（地狱）：深度架构分析
- 🎯 实战挑战：动手实现一个小功能
- ⭐ 成就系统：完成挑战获得徽章

---

**设计原则：**
1. 从具体到抽象：先讲故事，再讲代码，最后讲原理
2. 循序渐进：每个关卡都基于前一个关卡
3. 学以致用：每个关卡都有实战练习
4. 真实案例：所有代码都来自 EDICT 真实项目
