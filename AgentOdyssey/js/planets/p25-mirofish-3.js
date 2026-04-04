// 关卡 25：MiroFish 系列 3 - 仿真引擎星（完整互动版）

PLANETS.push({
  id: 'p25',
  icon: '⚙️',
  num: '星球 25',
  name: 'MiroFish 3：仿真引擎',
  desc: '学习如何调度 1000 个 Agent 同时运行！',

  difficulties: {
    // 🟢 简单模式
    easy: {
      sections: [
        {
          type: 'story',
          html: `
            <div class="speaker">⚙️ 仿真引擎星</div>
            <p>飞船降落在一个巨大的机械星球——这里是仿真引擎的世界！</p>
            <div class="chat-bubble robot">
              🤖 ARIA：船长！欢迎来到 MiroFish 系列的第三关。<br>
              今天我们要学习最复杂的部分——<strong>如何指挥 1000 个 Agent 同时行动</strong>！
            </div>
            <div class="chat-bubble">
              👦 你：1000 个？！这怎么管理？
            </div>
            <div class="chat-bubble robot">
              🤖 ARIA：让我给你讲个故事。<br><br>

              想象你是一个电影导演，要拍一场有 1000 个群众演员的戏。<br>
              你会怎么做？<br><br>

              <strong>方法 1（失败）</strong>：一个一个告诉每个演员该做什么。<br>
              → 你会累死，而且拍不完。<br><br>

              <strong>方法 2（成功）</strong>：<br>
              • 把演员分成几组（学生、老师、路人）<br>
              • 给每组设定"活动规则"（学生：活跃、爱讨论）<br>
              • 设定"作息时间"（早上 8 点上课，晚上 10 点睡觉）<br>
              • 让他们自己按规则行动<br><br>

              → 你只需要监控全局，偶尔调整参数！
            </div>
          `
        },
        {
          type: 'concept',
          title: '⚙️ 什么是仿真引擎？',
          html: `
            <div style="margin:14px 0;padding:14px;background:rgba(0,229,255,.06);border-radius:12px">
              <strong>仿真引擎 = 调度器 + 规则引擎 + 状态管理</strong><br><br>

              <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:12px">
                <div style="background:rgba(0,229,255,.08);border:1px solid rgba(0,229,255,.2);border-radius:10px;padding:12px">
                  <strong style="color:var(--cyan)">📅 调度器（Scheduler）</strong>
                  <p style="font-size:.85rem;color:var(--muted);margin-top:8px;line-height:1.7">
                    • 决定每个 Agent 什么时候行动<br>
                    • 按照"作息时间"分配活动<br>
                    • 避免所有 Agent 同时行动
                  </p>
                </div>
                <div style="background:rgba(168,85,247,.08);border:1px solid rgba(168,85,247,.2);border-radius:10px;padding:12px">
                  <strong style="color:var(--purple)">📜 规则引擎（Rules）</strong>
                  <p style="font-size:.85rem;color:var(--muted);margin-top:8px;line-height:1.7">
                    • 定义 Agent 的行为规则<br>
                    • 活跃度、发帖频率、情感倾向<br>
                    • 不同 Agent 有不同规则
                  </p>
                </div>
                <div style="background:rgba(34,197,94,.08);border:1px solid rgba(34,197,94,.2);border-radius:10px;padding:12px">
                  <strong style="color:var(--green)">💾 状态管理（State）</strong>
                  <p style="font-size:.85rem;color:var(--muted);margin-top:8px;line-height:1.7">
                    • 记录每个 Agent 的状态<br>
                    • 谁发了什么帖子<br>
                    • 谁关注了谁
                  </p>
                </div>
                <div style="background:rgba(251,191,36,.08);border:1px solid rgba(251,191,36,.2);border-radius:10px;padding:12px">
                  <strong style="color:var(--yellow)">🔄 事件循环（Loop）</strong>
                  <p style="font-size:.85rem;color:var(--muted);margin-top:8px;line-height:1.7">
                    • 一轮一轮地推进模拟<br>
                    • 每轮所有 Agent 行动一次<br>
                    • 直到达到目标轮次
                  </p>
                </div>
              </div>
            </div>

            <div style="margin-top:14px;padding:12px;background:rgba(251,191,36,.08);border-left:3px solid var(--yellow);border-radius:8px;font-size:.9rem">
              💡 <strong>为什么需要仿真引擎？</strong><br>
              如果手动控制每个 Agent，1000 个 Agent 需要 1000 次操作。<br>
              有了仿真引擎，你只需要设置规则，引擎自动运行！
            </div>
          `
        },
        {
          type: 'concept',
          title: '🎯 MiroFish 的双平台模拟',
          html: `
            <div style="margin:14px 0">
              <div style="background:rgba(0,229,255,.08);border:1px solid rgba(0,229,255,.2);border-radius:10px;padding:14px;margin-bottom:12px">
                <strong style="color:var(--cyan)">🐦 Twitter 平台</strong>
                <p style="font-size:.85rem;color:var(--muted);margin-top:8px;line-height:1.8">
                  <strong>特点：</strong>快速、碎片化、传播快<br>
                  <strong>动作：</strong>发推文、转发、点赞、关注<br>
                  <strong>适合：</strong>热点事件、舆论传播
                </p>
              </div>

              <div style="background:rgba(239,68,68,.08);border:1px solid rgba(239,68,68,.2);border-radius:10px;padding:14px">
                <strong style="color:var(--red)">🔴 Reddit 平台</strong>
                <p style="font-size:.85rem;color:var(--muted);margin-top:8px;line-height:1.8">
                  <strong>特点：</strong>深度讨论、社区化、投票机制<br>
                  <strong>动作：</strong>发帖、评论、点赞/踩、搜索<br>
                  <strong>适合：</strong>深度分析、社区观点
                </p>
              </div>
            </div>

            <div style="margin-top:14px;padding:12px;background:rgba(251,191,36,.08);border-left:3px solid var(--yellow);border-radius:8px;font-size:.9rem">
              💡 <strong>为什么要双平台？</strong><br>
              Twitter 看"表面舆论"，Reddit 看"深层讨论"。<br>
              两个平台结合，才能全面了解舆情！
            </div>
          `
        },
        {
          type: 'quiz',
          q: '如果要模拟"武汉大学舆情事件"，应该让 Agent 在什么时间最活跃？',
          opts: [
            '凌晨 2-4 点（大家都在睡觉）',
            '晚上 8-10 点（下课后的高峰期）',
            '全天 24 小时均匀分布',
            '只在白天 9-5 点'
          ],
          ans: 1,
          feedback_ok: '🎯 正确！大学生晚上 8-10 点最活跃——下课了、吃完饭了、开始刷手机了！这就是"作息时间配置"的重要性！',
          feedback_err: '想想大学生的作息：白天上课，晚上才有时间刷社交媒体。晚上 8-10 点是社交媒体的黄金时段！'
        }
      ]
    },

    // 🟡 困难模式
    hard: {
      sections: [
        {
          type: 'story',
          html: `
            <div class="speaker">⚙️ 仿真引擎星（技术版）</div>
            <div class="chat-bubble robot">
              🤖 ARIA：船长！现在让我们看看 MiroFish 的仿真引擎是如何工作的。<br>
              核心流程：<strong>配置生成 → 环境初始化 → 事件循环 → 状态更新</strong>！
            </div>
          `
        },
        {
          type: 'concept',
          title: '📐 Agent 活动配置',
          html: `
            <div style="margin:14px 0;padding:14px;background:rgba(0,229,255,.06);border-radius:12px;font-size:.9rem;line-height:1.9">
              <strong>每个 Agent 都有一套活动配置：</strong><br><br>

              <strong>活跃度（activity_level）：</strong>0.0-1.0<br>
              • 0.0 = 完全不活跃（潜水）<br>
              • 0.5 = 中等活跃<br>
              • 1.0 = 非常活跃（意见领袖）<br><br>

              <strong>发帖频率（posts_per_hour）：</strong><br>
              • 每小时预期发帖次数<br>
              • 例如：2.0 = 每小时发 2 条帖子<br><br>

              <strong>评论频率（comments_per_hour）：</strong><br>
              • 每小时预期评论次数<br>
              • 通常比发帖频率高<br><br>

              <strong>活跃时间段（active_hours）：</strong><br>
              • 24 小时制的时间列表<br>
              • 例如：[8, 9, 10, ..., 22] = 早 8 点到晚 10 点<br><br>

              <strong>情感倾向（sentiment_bias）：</strong>-1.0 到 1.0<br>
              • -1.0 = 非常负面<br>
              • 0.0 = 中立<br>
              • 1.0 = 非常正面
            </div>
          `
        },
        {
          type: 'code',
          title: '💻 Agent 活动配置数据结构',
          code: `from dataclasses import dataclass, field
from typing import List

@dataclass
class AgentActivityConfig:
    agent_id: int
    entity_uuid: str
    entity_name: str
    entity_type: str

    # 活跃度配置 (0.0-1.0)
    activity_level: float = 0.5

    # 发言频率（每小时预期次数）
    posts_per_hour: float = 1.0
    comments_per_hour: float = 2.0

    # 活跃时间段（24小时制）
    active_hours: List[int] = field(
        default_factory=lambda: list(range(8, 23))
    )

    # 响应速度（对热点事件的反应延迟，单位：模拟分钟）
    response_delay_min: int = 5
    response_delay_max: int = 60

    # 情感倾向 (-1.0到1.0，负面到正面)
    sentiment_bias: float = 0.0

    # 立场（对特定话题的态度）
    stance: str = "neutral"  # supportive, opposing, neutral, observer

    # 影响力权重（影响其他 Agent 的能力）
    influence_weight: float = 1.0


# 示例：张三教授的活动配置
zhang_san_config = AgentActivityConfig(
    agent_id=1,
    entity_uuid="uuid-123",
    entity_name="张三",
    entity_type="Person",

    # 教授比较活跃，但不是意见领袖
    activity_level=0.6,

    # 发帖不多，但会认真回复评论
    posts_per_hour=0.5,  # 每 2 小时发 1 条
    comments_per_hour=1.5,

    # 工作时间活跃
    active_hours=[9, 10, 11, 12, 14, 15, 16, 17, 20, 21],

    # 反应较慢，会深思熟虑
    response_delay_min=30,
    response_delay_max=120,

    # 对学术话题持正面态度
    sentiment_bias=0.3,
    stance="supportive",

    # 教授有一定影响力
    influence_weight=2.0
)`,
          explanation: `
            <strong>关键设计：</strong><br>
            • <strong>activity_level</strong>：控制总体活跃度<br>
            • <strong>active_hours</strong>：符合真实作息<br>
            • <strong>response_delay</strong>：不同人反应速度不同<br>
            • <strong>influence_weight</strong>：意见领袖的影响力更大
          `
        },
        {
          type: 'challenge',
          title: '🎯 实战挑战：设计活动配置',
          task: '请为"李四"（一个 25 岁的活跃学生）设计活动配置。要求：activity_level > 0.7，晚上更活跃！',
          starter_code: `const li_si_config = {
  agent_id: 2,
  entity_name: "李四",
  entity_type: "Person",

  // TODO: 设置活跃度（> 0.7）
  activity_level: 0.0,

  // TODO: 设置发帖频率（学生发帖多）
  posts_per_hour: 0.0,
  comments_per_hour: 0.0,

  // TODO: 设置活跃时间（晚上为主）
  active_hours: [],

  // TODO: 设置情感倾向
  sentiment_bias: 0.0,

  stance: "neutral",
  influence_weight: 1.0
};

console.log(li_si_config);`,
          hints: [
            '学生通常很活跃，activity_level 可以设置 0.8',
            '学生发帖多，posts_per_hour 可以设置 3-5',
            '晚上 8 点到凌晨 1 点是学生的活跃时段'
          ]
        },
        {
          type: 'concept',
          title: '🕐 中国作息时间配置',
          html: `
            <div style="margin:14px 0;padding:14px;background:rgba(0,229,255,.06);border-radius:12px;font-size:.9rem;line-height:1.9">
              <strong>MiroFish 的作息时间系统：</strong><br><br>

              <strong>凌晨时段（0-5 点）：</strong><br>
              • 活动倍率：0.05（几乎无人）<br>
              • 只有极少数夜猫子<br><br>

              <strong>早晨时段（6-8 点）：</strong><br>
              • 活动倍率：0.4（逐渐醒来）<br>
              • 开始刷手机<br><br>

              <strong>工作时段（9-18 点）：</strong><br>
              • 活动倍率：0.7（中等活跃）<br>
              • 上课/上班，偶尔刷手机<br><br>

              <strong>晚间高峰（19-22 点）：</strong><br>
              • 活动倍率：1.5（最活跃）<br>
              • 下课/下班，社交媒体黄金时段<br><br>

              <strong>深夜时段（23 点）：</strong><br>
              • 活动倍率：0.5（逐渐减少）<br>
              • 准备睡觉
            </div>
          `
        },
        {
          type: 'code',
          title: '💻 仿真事件循环',
          code: `async def run_simulation(
    agents: List[Agent],
    platforms: List[Platform],  # Twitter, Reddit
    max_rounds: int = 100
):
    """
    运行多轮仿真

    Args:
        agents: 所有 Agent 列表
        platforms: 平台列表
        max_rounds: 最大轮次
    """
    for round_num in range(1, max_rounds + 1):
        print(f"\\n=== 第 {round_num} 轮 ===")

        # 获取当前模拟时间（假设每轮 = 1 小时）
        current_hour = round_num % 24

        # 计算活动倍率
        activity_multiplier = get_activity_multiplier(current_hour)

        # 每个平台并行运行
        for platform in platforms:
            print(f"\\n[{platform.name}] 开始运行...")

            # 每个 Agent 决定是否行动
            for agent in agents:
                # 检查是否在活跃时间
                if current_hour not in agent.config.active_hours:
                    continue

                # 根据活跃度和时间倍率决定是否行动
                action_prob = (
                    agent.config.activity_level *
                    activity_multiplier
                )

                if random.random() > action_prob:
                    continue  # 这轮不行动

                # Agent 决定做什么
                action = agent.decide_action(platform)

                # 执行动作
                result = platform.execute(action)

                # 记录活动
                log_action(agent, action, result, round_num)

                # 更新记忆
                update_memory(agent, action, result)

        # 每轮结束后的统计
        print_round_stats(round_num)

        # 定期保存状态
        if round_num % 10 == 0:
            save_checkpoint(round_num)


def get_activity_multiplier(hour: int) -> float:
    """根据时间返回活动倍率"""
    if hour in [0, 1, 2, 3, 4, 5]:
        return 0.05  # 凌晨
    elif hour in [6, 7, 8]:
        return 0.4   # 早晨
    elif hour in [9, 10, 11, 12, 13, 14, 15, 16, 17, 18]:
        return 0.7   # 工作时段
    elif hour in [19, 20, 21, 22]:
        return 1.5   # 晚间高峰
    elif hour == 23:
        return 0.5   # 深夜
    return 0.7`,
          explanation: `
            <strong>事件循环的关键：</strong><br>
            • <strong>轮次制</strong>：每轮所有 Agent 有机会行动一次<br>
            • <strong>概率行动</strong>：不是每轮都行动，根据活跃度决定<br>
            • <strong>时间倍率</strong>：晚上行动概率更高<br>
            • <strong>并行平台</strong>：Twitter 和 Reddit 同时运行
          `
        },
        {
          type: 'sandbox',
          title: '🧪 沙盒实验：调整仿真参数',
          description: '调整 Agent 数量和活跃度，观察模拟效果。目标：让总互动次数超过 500！',
          params: [
            { name: 'agent_count', min: 10, max: 100, step: 10, default: 50 },
            { name: 'avg_activity', min: 0.1, max: 1.0, step: 0.1, default: 0.5 },
            { name: 'rounds', min: 10, max: 100, step: 10, default: 50 }
          ],
          goal: '找到最优参数，让模拟既真实又高效'
        },
        {
          type: 'concept',
          title: '🔄 IPC 进程间通信',
          html: `
            <div style="margin:14px 0;padding:14px;background:rgba(0,229,255,.06);border-radius:12px;font-size:.9rem;line-height:1.9">
              <strong>为什么需要 IPC？</strong><br>
              • Flask 后端和 OASIS 仿真引擎是两个独立进程<br>
              • 后端需要和仿真引擎通信（如"采访某个 Agent"）<br>
              • 不能直接调用函数，需要进程间通信<br><br>

              <strong>MiroFish 的 IPC 方案：基于文件系统</strong><br>
              • 后端写命令到 <code>commands/</code> 目录<br>
              • 仿真引擎读取命令并执行<br>
              • 仿真引擎写响应到 <code>responses/</code> 目录<br>
              • 后端读取响应<br><br>

              <strong>支持的命令：</strong><br>
              • INTERVIEW：采访单个 Agent<br>
              • BATCH_INTERVIEW：批量采访<br>
              • CLOSE_ENV：关闭环境
            </div>
          `
        },
        {
          type: 'code',
          title: '💻 IPC 通信实现',
          code: `# 后端：发送命令
class SimulationIPCClient:
    def __init__(self, sim_dir: str):
        self.commands_dir = f"{sim_dir}/commands"
        self.responses_dir = f"{sim_dir}/responses"

    def send_command(self, command: dict) -> str:
        """发送命令到仿真进程"""
        command_id = str(uuid.uuid4())
        command_file = f"{self.commands_dir}/{command_id}.json"

        # 写入命令文件
        with open(command_file, 'w') as f:
            json.dump({
                "command_id": command_id,
                "type": command["type"],
                "params": command["params"],
                "timestamp": time.time()
            }, f)

        return command_id

    def wait_response(self, command_id: str,
                      timeout: int = 30) -> dict:
        """等待仿真进程的响应"""
        response_file = f"{self.responses_dir}/{command_id}.json"
        start_time = time.time()

        while time.time() - start_time < timeout:
            if os.path.exists(response_file):
                with open(response_file, 'r') as f:
                    response = json.load(f)
                # 删除响应文件
                os.remove(response_file)
                return response
            time.sleep(0.5)

        raise TimeoutError(f"Command {command_id} timeout")


# 仿真引擎：处理命令
class SimulationIPCServer:
    def __init__(self, sim_dir: str, env):
        self.commands_dir = f"{sim_dir}/commands"
        self.responses_dir = f"{sim_dir}/responses"
        self.env = env  # OASIS 环境

    def process_commands(self):
        """处理所有待处理的命令"""
        for command_file in os.listdir(self.commands_dir):
            if not command_file.endswith('.json'):
                continue

            # 读取命令
            with open(f"{self.commands_dir}/{command_file}", 'r') as f:
                command = json.load(f)

            # 执行命令
            response = self.execute_command(command)

            # 写入响应
            response_file = f"{self.responses_dir}/{command['command_id']}.json"
            with open(response_file, 'w') as f:
                json.dump(response, f)

            # 删除命令文件
            os.remove(f"{self.commands_dir}/{command_file}")

    def execute_command(self, command: dict) -> dict:
        """执行单个命令"""
        if command["type"] == "INTERVIEW":
            agent_id = command["params"]["agent_id"]
            question = command["params"]["question"]

            # 调用 OASIS 环境的采访功能
            answer = self.env.interview_agent(agent_id, question)

            return {
                "success": True,
                "data": {
                    "agent_id": agent_id,
                    "question": question,
                    "answer": answer
                }
            }

        elif command["type"] == "CLOSE_ENV":
            self.env.close()
            return {"success": True}

        return {"success": False, "error": "Unknown command"}


# 使用示例
client = SimulationIPCClient("/path/to/sim")

# 发送采访命令
command_id = client.send_command({
    "type": "INTERVIEW",
    "params": {
        "agent_id": 1,
        "question": "你对这个事件怎么看？"
    }
})

# 等待响应
response = client.wait_response(command_id)
print(response["data"]["answer"])`,
          explanation: `
            <strong>IPC 设计的优势：</strong><br>
            • <strong>简单</strong>：基于文件系统，不需要复杂的消息队列<br>
            • <strong>可靠</strong>：文件系统保证原子性<br>
            • <strong>可调试</strong>：可以直接查看命令和响应文件<br>
            • <strong>跨语言</strong>：Python 和任何语言都能读写文件
          `
        },
        {
          type: 'debug',
          title: '🐛 调试挑战：修复并发问题',
          scenario: '多个 Agent 同时发帖时，有时会出现"帖子 ID 冲突"的错误',
          buggy_code: `def create_post(agent_id, content):
    # Bug: 没有加锁，多个 Agent 可能获得相同的 post_id
    post_id = get_next_post_id()  # Bug 1
    post = {
        "id": post_id,
        "author": agent_id,
        "content": content
    }
    posts.append(post)  # Bug 2
    return post_id`,
          error_log: `Error: Duplicate post_id detected
Post ID 123 already exists
at line 3: post_id = get_next_post_id()`,
          bug_count: 2,
          hints: [
            'Bug 1: get_next_post_id() 不是线程安全的',
            'Bug 2: posts.append() 也不是线程安全的',
            '需要使用锁（threading.Lock）保护临界区'
          ]
        },
        {
          type: 'pitfalls',
          title: '⚠️ 常见坑点',
          items: [
            '并发冲突：多个 Agent 同时修改同一个帖子，导致数据不一致——需要加锁或使用原子操作',
            '内存爆炸：1000 个 Agent × 100 轮 × 每轮 10 条记忆 = 100 万条记忆——需要定期清理或分页存储',
            '性能瓶颈：所有 Agent 串行执行，1000 个 Agent 需要很长时间——需要并行处理',
            'IPC 超时：仿真引擎处理命令太慢，后端等待超时——需要异步处理或增加超时时间',
            '作息时间不合理：所有 Agent 在同一时间活跃，不符合真实情况——需要根据角色设置不同的作息'
          ]
        },
        {
          type: 'quiz',
          q: 'MiroFish 为什么要用"基于文件系统的 IPC"而不是消息队列（如 RabbitMQ）？',
          opts: [
            '因为文件系统更快',
            '因为文件系统更简单、易调试，对于中小规模仿真足够用',
            '因为消息队列不支持 Python',
            '因为文件系统更安全'
          ],
          ans: 1,
          feedback_ok: '✅ 正确！对于 MiroFish 这种规模（几百个 Agent），文件系统 IPC 足够简单可靠。如果是百万级 Agent，才需要考虑消息队列！',
          feedback_err: '工程设计的原则：选择"足够好"的方案，而不是"最完美"的方案。文件系统 IPC 简单、可靠、易调试，对于中小规模完全够用！'
        }
      ]
    },

    // 🔴 地狱模式
    hell: {
      sections: [
        {
          type: 'story',
          html: `
            <div class="speaker">🔥 地狱模式 - OASIS 论文</div>
            <div class="chat-bubble robot" style="border-color:var(--red)">
              🤖 ARIA：船长，准备好了吗？<br>
              我们要深入仿真引擎的核心——<br>
              <strong>CAMEL-AI 2024 年的 OASIS 论文</strong>！<br><br>

              OASIS 是 MiroFish 的仿真引擎基础，<br>
              它提出了一个开放的社交媒体仿真平台——<br>
              <strong>让 AI Agent 能在虚拟社交网络中自由互动</strong>！<br><br>

              论文的核心创新：<br>
              • 双平台架构（Twitter + Reddit）<br>
              • 可扩展的动作空间<br>
              • 真实的社交网络拓扑<br>
              • 大规模并发支持
            </div>
          `
        },
        {
          type: 'concept',
          title: '📄 论文核心：开放社交仿真',
          html: `
            <div style="margin:14px 0;padding:14px;background:rgba(0,229,255,.06);border-radius:12px;font-size:.9rem;line-height:1.9">
              <strong>论文信息：</strong><br>
              • 标题：OASIS: Open Agent Social Interaction Simulations<br>
              • 作者：CAMEL-AI Team（2024）<br>
              • 核心贡献：提出开放的社交媒体仿真框架<br><br>

              <strong>传统仿真的问题：</strong><br>
              • 封闭环境，不支持自定义<br>
              • 单一平台，无法对比<br>
              • 动作空间有限<br>
              • 难以扩展到大规模<br><br>

              <strong>OASIS 的创新：</strong><br>
              • <strong>双平台</strong>：Twitter（快速传播）+ Reddit（深度讨论）<br>
              • <strong>开放动作</strong>：支持自定义新动作<br>
              • <strong>真实拓扑</strong>：模拟真实的社交网络结构<br>
              • <strong>可扩展</strong>：支持数千个 Agent 并发
            </div>
          `
        },
        {
          type: 'concept',
          title: '🏗️ OASIS 的架构设计',
          html: `
            <div style="margin:14px 0;padding:14px;background:rgba(0,229,255,.06);border-radius:12px;font-size:.9rem;line-height:1.9">
              <strong>三层架构：</strong><br><br>

              <strong>1. 平台层（Platform Layer）</strong><br>
              • TwitterEnv：模拟 Twitter 的行为<br>
              • RedditEnv：模拟 Reddit 的行为<br>
              • 每个平台有独立的状态和规则<br><br>

              <strong>2. Agent 层（Agent Layer）</strong><br>
              • 每个 Agent 有独立的 Profile<br>
              • Agent 可以在多个平台活动<br>
              • Agent 之间可以互相关注、互动<br><br>

              <strong>3. 调度层（Scheduler Layer）</strong><br>
              • 控制 Agent 的行动顺序<br>
              • 处理并发冲突<br>
              • 记录所有活动日志
            </div>
          `
        },
        {
          type: 'code',
          title: '💻 OASIS 的动作空间',
          code: `# OASIS 支持的所有动作

# Twitter 平台动作
class TwitterAction(Enum):
    CREATE_POST = "create_post"      # 发推文
    LIKE_POST = "like_post"          # 点赞
    REPOST = "repost"                # 转发
    QUOTE_POST = "quote_post"        # 引用转发
    FOLLOW = "follow"                # 关注
    UNFOLLOW = "unfollow"            # 取消关注
    MUTE = "mute"                    # 屏蔽
    REFRESH = "refresh"              # 刷新时间线
    DO_NOTHING = "do_nothing"        # 不行动


# Reddit 平台动作
class RedditAction(Enum):
    CREATE_POST = "create_post"      # 发帖
    CREATE_COMMENT = "create_comment" # 评论
    LIKE_POST = "like_post"          # 点赞帖子
    DISLIKE_POST = "dislike_post"    # 踩帖子
    LIKE_COMMENT = "like_comment"    # 点赞评论
    DISLIKE_COMMENT = "dislike_comment" # 踩评论
    SEARCH_POSTS = "search_posts"    # 搜索帖子
    SEARCH_USER = "search_user"      # 搜索用户
    TREND = "trend"                  # 查看热门
    FOLLOW = "follow"                # 关注
    MUTE = "mute"                    # 屏蔽
    REFRESH = "refresh"              # 刷新
    DO_NOTHING = "do_nothing"        # 不行动


# Agent 决策流程
def agent_decide_action(agent, platform):
    """
    Agent 根据当前状态决定下一步动作

    Args:
        agent: Agent 对象
        platform: 平台对象（Twitter 或 Reddit）

    Returns:
        选择的动作
    """
    # 1. 获取当前平台状态
    timeline = platform.get_timeline(agent.id)
    trending = platform.get_trending()

    # 2. 检索 Agent 的记忆
    relevant_memories = agent.memory.retrieve(
        query="我最近在关注什么话题？"
    )

    # 3. 构建 Prompt
    prompt = f"""你是 {agent.name}。

**你的人设：**
{agent.persona}

**当前平台：**{platform.name}

**你的时间线：**
{format_timeline(timeline)}

**热门话题：**
{format_trending(trending)}

**你的记忆：**
{format_memories(relevant_memories)}

**可选动作：**
{list_available_actions(platform)}

**请决定：**
1. 你要做什么动作？
2. 如果是发帖/评论，内容是什么？

输出 JSON 格式：
{{"action": "动作名称", "params": {{...}}}}
"""

    # 4. LLM 决策
    response = llm.generate(prompt)
    action = parse_action(response.text)

    return action`,
          explanation: `
            <strong>动作空间的设计哲学：</strong><br>
            • <strong>真实性</strong>：动作来自真实社交媒体平台<br>
            • <strong>完整性</strong>：覆盖所有主要互动方式<br>
            • <strong>可扩展</strong>：可以轻松添加新动作<br>
            • <strong>DO_NOTHING</strong>：允许 Agent 选择不行动（很重要！）
          `
        },
        {
          type: 'concept',
          title: '⚡ 大规模并发的技术挑战',
          html: `
            <div style="margin:14px 0;padding:14px;background:rgba(0,229,255,.06);border-radius:12px;font-size:.9rem;line-height:1.9">
              <strong>挑战 1：状态同步</strong><br>
              • 1000 个 Agent 同时读写状态<br>
              • 需要保证数据一致性<br>
              • 解决方案：读写锁、事务、乐观锁<br><br>

              <strong>挑战 2：LLM 调用瓶颈</strong><br>
              • 每个 Agent 每轮调用 1 次 LLM<br>
              • 1000 个 Agent = 1000 次调用<br>
              • 解决方案：批量调用、缓存、异步处理<br><br>

              <strong>挑战 3：内存占用</strong><br>
              • 每个 Agent 的记忆越来越多<br>
              • 1000 个 Agent × 1000 条记忆 = 100 万条<br>
              • 解决方案：分页加载、定期清理、压缩存储<br><br>

              <strong>挑战 4：日志爆炸</strong><br>
              • 每个动作都要记录日志<br>
              • 1000 个 Agent × 100 轮 × 5 动作 = 50 万条日志<br>
              • 解决方案：异步写入、批量写入、日志轮转
            </div>
          `
        },
        {
          type: 'code',
          title: '💻 并发控制实现',
          code: `import threading
import asyncio
from concurrent.futures import ThreadPoolExecutor

class ConcurrentSimulation:
    def __init__(self, agents, platforms):
        self.agents = agents
        self.platforms = platforms
        self.lock = threading.Lock()
        self.executor = ThreadPoolExecutor(max_workers=10)

    async def run_round_concurrent(self, round_num):
        """
        并发执行一轮模拟

        策略：
        1. 所有 Agent 并发决策（读操作）
        2. 串行执行动作（写操作，避免冲突）
        """
        # Phase 1: 并发决策（只读，无冲突）
        decision_tasks = []
        for agent in self.agents:
            task = asyncio.create_task(
                self.agent_decide_async(agent, round_num)
            )
            decision_tasks.append(task)

        # 等待所有决策完成
        decisions = await asyncio.gather(*decision_tasks)

        # Phase 2: 串行执行（写操作，需要加锁）
        for agent, action in zip(self.agents, decisions):
            if action is None:
                continue

            # 执行动作（加锁保护）
            with self.lock:
                result = self.execute_action(agent, action)
                self.log_action(agent, action, result)

    async def agent_decide_async(self, agent, round_num):
        """
        异步决策（可以并发）

        使用线程池执行 LLM 调用，避免阻塞
        """
        loop = asyncio.get_event_loop()
        decision = await loop.run_in_executor(
            self.executor,
            agent.decide_action,
            self.platforms[0]  # 简化：只用一个平台
        )
        return decision

    def execute_action(self, agent, action):
        """
        执行动作（需要加锁）

        这里会修改共享状态，必须串行
        """
        platform = self.platforms[0]

        if action.type == "CREATE_POST":
            # 生成唯一 ID（临界区）
            post_id = self.get_next_post_id()
            post = {
                "id": post_id,
                "author": agent.id,
                "content": action.content,
                "timestamp": time.time()
            }
            platform.posts.append(post)
            return {"success": True, "post_id": post_id}

        elif action.type == "LIKE_POST":
            post = platform.get_post(action.post_id)
            if post:
                post["likes"].append(agent.id)
                return {"success": True}
            return {"success": False, "error": "Post not found"}

        return {"success": False, "error": "Unknown action"}

    def get_next_post_id(self):
        """
        生成下一个帖子 ID（线程安全）

        使用原子操作保证唯一性
        """
        with self.lock:
            self.post_id_counter += 1
            return self.post_id_counter


# 使用示例
sim = ConcurrentSimulation(agents, platforms)

# 运行 100 轮
for round_num in range(100):
    asyncio.run(sim.run_round_concurrent(round_num))`,
          explanation: `
            <strong>并发优化的关键：</strong><br>
            • <strong>读写分离</strong>：决策（读）并发，执行（写）串行<br>
            • <strong>异步 LLM</strong>：用线程池避免阻塞<br>
            • <strong>锁保护</strong>：临界区用锁保护，避免冲突<br>
            • <strong>性能提升</strong>：决策并发可以提升 10 倍速度
          `
        },
        {
          type: 'pitfalls',
          title: '⚠️ 大规模仿真的深层陷阱',
          items: [
            '死锁问题：Agent A 等待 Agent B，Agent B 等待 Agent A——需要避免循环等待，使用超时机制',
            '雪崩效应：一个热门帖子导致所有 Agent 都去评论，系统崩溃——需要限流和负载均衡',
            '记忆泄漏：Agent 的记忆只增不减，最终耗尽内存——需要 LRU 缓存或定期清理',
            '时间漂移：长时间运行后，模拟时间和真实时间不同步——需要时间校准机制',
            '幸存者偏差：只有活跃的 Agent 被记录，沉默的大多数被忽略——需要记录"不行动"',
            '评估困难：如何判断仿真是否"真实"？没有标准答案——需要多维度指标（活跃度分布、互动模式、舆论演化）'
          ]
        },
        {
          type: 'quiz',
          q: 'OASIS 论文的核心创新是什么？',
          opts: [
            '用 LLM 驱动 Agent',
            '提出开放的双平台社交仿真框架，支持自定义动作和大规模并发',
            '实现了 Twitter 和 Reddit',
            '用向量数据库存储记忆'
          ],
          ans: 1,
          feedback_ok: '🔥 完美！OASIS 的核心是"开放"和"可扩展"。不同于封闭的仿真环境，OASIS 允许研究者自定义平台、动作、Agent，并支持大规模并发——这是它成为 MiroFish 基础的原因！',
          feedback_err: 'OASIS 的核心价值是提供了一个开放的框架。想象一个"社交媒体模拟器"——你可以自定义规则、添加新平台、扩展到数千 Agent。这种灵活性是传统仿真做不到的！'
        }
      ]
    }
  }
});

