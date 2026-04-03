// 关卡 17：帝国篇 - 三省六部架构

PLANETS.push({
  id: 'p17',
  icon: '🏛️',
  num: '星球 17',
  name: '帝国星 - 三省六部',
  desc: '用 1300 年前的制度，重新设计 AI 协作架构！',

  difficulties: {
    // 🟢 简单模式
    easy: {
      sections: [
        {
          type: 'story',
          html: `
            <div class="speaker">🏛️ 发现古老的帝国星球！</div>
            <p>ARIA 在星图上发现了一颗神秘的星球，上面闪烁着古老的文明光芒……</p>
            <div class="chat-bubble robot">
              🤖 ARIA：船长！这颗星球上有一个运行了 1300 年的系统！
              它叫<strong style="color:var(--cyan)">三省六部</strong>——
              是中国唐朝的官僚制度，用来管理整个帝国！
            </div>
            <div class="chat-bubble">
              👦 你：古代的制度？这和 AI Agent 有什么关系？
            </div>
            <div class="chat-bubble robot">
              🤖 ARIA：关系大了！现代的 Multi-Agent 系统都有一个问题：
              <strong>Agent 之间自由协作，容易出错，无法控制</strong>。<br><br>
              但三省六部不一样——它有<strong>分权制衡</strong>、<strong>强制审核</strong>、
              <strong>完全可观测</strong>！这正是现代 AI 系统需要的！
            </div>
          `
        },
        {
          type: 'concept',
          title: '📚 小明的班级管理系统',
          html: `
            <p>让我们用一个故事来理解三省六部：</p>
            <div style="margin:14px 0;padding:14px;background:rgba(0,229,255,.06);border-radius:12px;line-height:1.8">
              小明当了班长，要管理班级的各种事务。他发现一个人做不过来，于是建立了一个系统：<br><br>

              <strong>🎯 值日生（太子）</strong><br>
              • 接收同学的请求<br>
              • 判断：这是重要的事还是闲聊？<br>
              • 闲聊直接回复，重要的事交给计划委员<br><br>

              <strong>📋 计划委员（中书省）</strong><br>
              • 制定详细计划<br>
              • 比如"运动会需要准备什么？"<br>
              • 把计划交给检查委员审核<br><br>

              <strong>✅ 检查委员（门下省）</strong><br>
              • 检查计划是否合理<br>
              • 不合理就打回重做<br>
              • 合理才放行<br><br>

              <strong>📤 执行委员（尚书省）</strong><br>
              • 把任务分配给不同的小组<br>
              • 监督各小组的进度<br><br>

              <strong>👥 各个小组（六部）</strong><br>
              • 体育组、文艺组、卫生组等<br>
              • 各司其职，并行工作
            </div>
          `
        },
        {
          type: 'concept',
          title: '🔑 三个关键原则',
          html: `
            <p><strong>1. 分工合作</strong></p>
            <p style="margin-left:20px;color:var(--muted)">
              每个角色都有明确的职责，不会乱套
            </p>

            <p style="margin-top:12px"><strong>2. 质量检查</strong></p>
            <p style="margin-left:20px;color:var(--muted)">
              检查委员会审核计划，不合格就打回重做
            </p>

            <p style="margin-top:12px"><strong>3. 不能越级</strong></p>
            <p style="margin-left:20px;color:var(--muted)">
              体育组不能直接找计划委员，必须通过执行委员
            </p>

            <div style="margin-top:16px;padding:12px;background:rgba(251,191,36,.1);border-left:3px solid var(--yellow);border-radius:8px">
              💡 <strong>为什么这样设计？</strong><br>
              因为如果大家随便找人，就会乱成一团！<br>
              有了制度，每个人都知道该找谁，该做什么。
            </div>
          `
        },
        {
          type: 'quiz',
          q: '如果体育组发现计划有问题，应该怎么办？',
          opts: [
            '直接找计划委员修改',
            '告诉执行委员，让执行委员协调',
            '自己改了就行',
            '不管它，继续执行'
          ],
          ans: 1,
          feedback_ok: '🎉 正确！必须通过执行委员协调，不能越级！这就是"制度化协作"的核心——每个角色都有明确的沟通路径。',
          feedback_err: '记住：不能越级！体育组只能和执行委员沟通，由执行委员去协调其他角色。这样才能保证系统有序运行。'
        }
      ]
    },

    // 🟡 困难模式
    hard: {
      sections: [
        {
          type: 'story',
          html: `
            <div class="speaker">🏛️ 帝国星 - 技术版</div>
            <div class="chat-bubble robot">
              🤖 ARIA：船长，让我给你讲讲三省六部的技术实现。
              这是一个真实的开源项目：<strong>EDICT</strong>！
            </div>
          `
        },
        {
          type: 'concept',
          title: '🏗️ 三省六部架构',
          html: `
            <p>完整的 Multi-Agent 协作流程：</p>
            <div style="margin:14px 0;padding:14px;background:rgba(0,229,255,.06);border-radius:12px;font-family:monospace;font-size:.9rem;line-height:1.8">
              用户（皇上）<br>
              &nbsp;&nbsp;↓<br>
              太子（分拣）→ 判断是否重要<br>
              &nbsp;&nbsp;↓<br>
              中书省（规划）→ 制定方案<br>
              &nbsp;&nbsp;↓<br>
              门下省（审核）→ 审查方案<br>
              &nbsp;&nbsp;├─ ✅ 准奏 → 继续<br>
              &nbsp;&nbsp;└─ ❌ 封驳 → 返回中书省修改<br>
              &nbsp;&nbsp;↓<br>
              尚书省（派发）→ 分配任务<br>
              &nbsp;&nbsp;↓<br>
              六部（执行）→ 并行工作<br>
              &nbsp;&nbsp;├─ 礼部（文档）<br>
              &nbsp;&nbsp;├─ 户部（数据）<br>
              &nbsp;&nbsp;├─ 兵部（代码）<br>
              &nbsp;&nbsp;├─ 刑部（测试）<br>
              &nbsp;&nbsp;├─ 工部（基建）<br>
              &nbsp;&nbsp;└─ 吏部（人力）<br>
              &nbsp;&nbsp;↓<br>
              回奏（完成）
            </div>
          `
        },
        {
          type: 'code',
          title: '💻 三省六部系统实现',
          code: `class ImperialSystem:
    def __init__(self):
        self.taizi = TaiziAgent()
        self.zhongshu = ZhongshuAgent()
        self.menxia = MenxiaAgent()
        self.shangshu = ShangshuAgent()
        self.departments = {
            'li': LibuAgent(),
            'hu': HubuAgent(),
            'bing': BingbuAgent()
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
            plan = await self.zhongshu.revise(plan)

        # 4. 尚书省派发
        assignments = await self.shangshu.dispatch(plan)

        # 5. 六部执行
        results = await self.execute_departments(assignments)

        return await self.zhongshu.report(results)`,
          explanation: `
            <strong>核心要点：</strong><br>
            • 严格的流程顺序：太子 → 中书 → 门下 → 尚书 → 六部<br>
            • 门下省可以封驳：最多 3 轮审核<br>
            • 六部并行执行：提高效率<br>
            • 中书省负责回奏：汇总结果
          `
        },
        {
          type: 'pitfalls',
          title: '⚠️ 常见问题',
          items: [
            '不要让 Agent 自由协作 → 必须遵循制度化流程',
            '不要跳过门下省审核 → 这是质量保障的关键',
            '不要让六部直接调用中书省 → 必须通过尚书省',
            '不要无限重试 → 门下省审核最多 3 轮，避免死循环'
          ]
        },
        {
          type: 'quiz',
          q: '三省六部架构相比传统 Multi-Agent 框架的核心优势是什么？',
          opts: [
            'Agent 数量更多',
            '有强制的质量审核关卡（门下省）',
            '运行速度更快',
            '代码更简单'
          ],
          ans: 1,
          feedback_ok: '⭐ 正确！门下省的强制审核是三省六部的杀手锏。CrewAI 和 AutoGen 都没有这个机制，导致产出质量无法保证。',
          feedback_err: '关键在于"制度性审核"！门下省可以封驳不合格的方案，强制返工，这是传统框架没有的。'
        }
      ]
    },

    // 🔴 地狱模式
    hell: {
      sections: [
        {
          type: 'story',
          html: `
            <div class="speaker">🔥 地狱模式 - EDICT 架构深度解析</div>
            <div class="chat-bubble robot" style="border-color:var(--red)">
              🤖 ARIA：船长，让我带你深入 EDICT 项目的核心设计！
              这是一个真实的生产级 Multi-Agent 系统。<br><br>
              <strong>EDICT 项目</strong><br>
              • GitHub: cft0808/edict<br>
              • 12 个 Agent 协作<br>
              • 实时 Dashboard 看板<br>
              • Event-Driven 架构<br>
              • 完整的审计日志
            </div>
          `
        },
        {
          type: 'concept',
          title: '🎯 设计哲学：为什么需要制度化？',
          html: `
            <p><strong>传统 Multi-Agent 框架的问题：</strong></p>
            <div style="margin:14px 0;padding:14px;background:rgba(239,68,68,.05);border-left:3px solid var(--red);line-height:1.8">
              <strong>CrewAI / AutoGen 的模式：</strong><br>
              "来，你们几个 AI 自己聊，聊完把结果给我。"<br><br>

              <strong>问题：</strong><br>
              • Agent 可能相互制造假数据<br>
              • 没有质量控制机制<br>
              • 无法审计和回溯<br>
              • 不能实时干预<br>
              • 结果不可靠
            </div>

            <p style="margin-top:16px"><strong>三省六部的解决方案：</strong></p>
            <div style="margin:14px 0;padding:14px;background:rgba(0,229,255,.05);border-left:3px solid var(--cyan);line-height:1.8">
              <strong>制度化协作：</strong><br>
              • 严格的权限矩阵：谁能调用谁<br>
              • 强制审核关卡：门下省封驳<br>
              • 完全可观测：实时看板<br>
              • 可干预：随时叫停/取消/恢复<br>
              • 可审计：完整的流转记录
            </div>
          `
        },
        {
          type: 'concept',
          title: '🔐 权限矩阵设计',
          html: `
            <p>严格的调用权限控制：</p>
            <div style="margin:14px 0;padding:14px;background:rgba(0,229,255,.06);border-radius:12px;font-family:monospace;font-size:.85rem;line-height:1.8">
              <strong>权限矩阵：</strong><br>
              • 太子 → 只能调用中书省<br>
              • 中书省 → 只能调用门下省、尚书省<br>
              • 门下省 → 可以调用尚书省、回调中书省<br>
              • 尚书省 → 只能调用六部<br>
              • 六部 → 不能调用其他 Agent<br><br>

              <strong>为什么这样设计？</strong><br>
              1. 防止越级：保证流程有序<br>
              2. 防止循环：避免死锁<br>
              3. 职责清晰：每个角色知道该找谁<br>
              4. 可追溯：调用链完整记录
            </div>
          `
        },
        {
          type: 'code',
          title: '🔧 权限矩阵实现',
          code: `# 权限矩阵定义
PERMISSION_MATRIX = {
    'taizi': ['zhongshu'],
    'zhongshu': ['menxia', 'shangshu'],
    'menxia': ['shangshu', 'zhongshu'],  # 可封驳
    'shangshu': ['libu', 'hubu', 'bingbu',
                 'xingbu', 'gongbu', 'libu_hr'],
    # 六部不能调用其他 Agent
}

def can_call(caller: str, callee: str) -> bool:
    """检查调用权限"""
    return callee in PERMISSION_MATRIX.get(caller, [])

class Agent:
    def __init__(self, name: str):
        self.name = name

    async def call_subagent(self, target: str, task):
        # 权限检查
        if not can_call(self.name, target):
            raise PermissionError(
                f"{self.name} 无权调用 {target}"
            )

        # 记录调用
        log_call(self.name, target, task)

        # 执行调用
        return await agents[target].process(task)`,
          explanation: `
            <strong>关键设计：</strong><br>
            • 白名单机制：只允许明确授权的调用<br>
            • 运行时检查：每次调用都验证权限<br>
            • 完整日志：记录所有调用链<br>
            • 异常处理：越权调用直接拒绝
          `
        },
        {
          type: 'concept',
          title: '🚫 门下省封驳机制',
          html: `
            <p><strong>这是三省六部的杀手锏！</strong></p>
            <div style="margin:14px 0;padding:14px;background:rgba(239,68,68,.05);border-left:3px solid var(--red);line-height:1.8">
              <strong>门下省的职责：</strong><br>
              • 审查中书省的方案<br>
              • 检查可行性、完整性、风险性<br>
              • 不合格直接打回重做<br>
              • 最多审核 3 轮<br><br>

              <strong>为什么重要？</strong><br>
              CrewAI 和 AutoGen 的 Agent 做完就交，没有人检查质量。<br>
              就像公司没有 QA 部门，工程师写完代码直接上线。<br><br>

              门下省是<strong>强制的质量关卡</strong>，不是可选的插件。<br>
              每一个任务都必须经过门下省，没有例外。
            </div>
          `
        },
        {
          type: 'code',
          title: '✅ 门下省审核实现',
          code: `class MenxiaAgent:
    MAX_REVIEW_ROUNDS = 3

    async def review_with_retry(self, plan):
        """带重试的审核流程"""
        for round_num in range(self.MAX_REVIEW_ROUNDS):
            # 调用 LLM 审核
            review = await self.review(plan)

            if review.approved:
                return plan  # 准奏

            # 封驳：返回中书省修改
            plan = await self.zhongshu.revise(
                plan,
                review.feedback
            )

        # 3 轮都不通过，升级处理
        raise ReviewFailedException(
            f"方案经过 {self.MAX_REVIEW_ROUNDS} 轮仍未通过"
        )

    async def review(self, plan):
        prompt = f"""
        审查方案：{plan.content}

        从以下角度审查：
        1. 可行性：方案是否可以执行？
        2. 完整性：是否遗漏了重要步骤？
        3. 风险性：是否有潜在风险？

        如果合格，回复"准奏"。
        如果不合格，说明原因并给出修改建议。
        """
        return await self.llm.call(prompt)`,
          explanation: `
            <strong>核心机制：</strong><br>
            • 强制审核：不是可选的<br>
            • 可封驳：有权打回重做<br>
            • 有限重试：防止无限循环<br>
            • 升级机制：3 轮不过通知人类
          `
        },
        {
          type: 'concept',
          title: '📊 与其他框架的对比',
          html: `
            <table style="width:100%;border-collapse:collapse;margin:14px 0">
              <tr style="background:rgba(0,229,255,.1)">
                <th style="padding:8px;border:1px solid var(--border)">特性</th>
                <th style="padding:8px;border:1px solid var(--border)">CrewAI</th>
                <th style="padding:8px;border:1px solid var(--border)">AutoGen</th>
                <th style="padding:8px;border:1px solid var(--border)">三省六部</th>
              </tr>
              <tr>
                <td style="padding:8px;border:1px solid var(--border)">审核机制</td>
                <td style="padding:8px;border:1px solid var(--border)">❌ 无</td>
                <td style="padding:8px;border:1px solid var(--border)">⚠️ 可选</td>
                <td style="padding:8px;border:1px solid var(--border)">✅ 强制</td>
              </tr>
              <tr>
                <td style="padding:8px;border:1px solid var(--border)">实时看板</td>
                <td style="padding:8px;border:1px solid var(--border)">❌</td>
                <td style="padding:8px;border:1px solid var(--border)">❌</td>
                <td style="padding:8px;border:1px solid var(--border)">✅</td>
              </tr>
              <tr>
                <td style="padding:8px;border:1px solid var(--border)">任务干预</td>
                <td style="padding:8px;border:1px solid var(--border)">❌</td>
                <td style="padding:8px;border:1px solid var(--border)">❌</td>
                <td style="padding:8px;border:1px solid var(--border)">✅</td>
              </tr>
              <tr>
                <td style="padding:8px;border:1px solid var(--border)">流转审计</td>
                <td style="padding:8px;border:1px solid var(--border)">⚠️</td>
                <td style="padding:8px;border:1px solid var(--border)">❌</td>
                <td style="padding:8px;border:1px solid var(--border)">✅</td>
              </tr>
            </table>
            <p style="margin-top:12px;font-size:.9rem;color:var(--muted)">
              核心差异：<strong>制度性审核 + 完全可观测 + 实时可干预</strong>
            </p>
          `
        },
        {
          type: 'quiz',
          q: '为什么三省六部要限制门下省审核最多 3 轮？',
          opts: [
            '为了节省计算资源',
            '防止中书省和门下省陷入无限循环',
            '因为 3 是个吉利数字',
            '为了加快处理速度'
          ],
          ans: 1,
          feedback_ok: '🔥 完全正确！如果不限制轮数，中书省和门下省可能陷入死循环：中书提方案 → 门下封驳 → 中书修改 → 门下再封驳……永远结束不了。3 轮是一个合理的平衡点。',
          feedback_err: '关键在于"防止死循环"！如果没有限制，两个 Agent 可能永远达不成一致。3 轮后如果还不通过，就需要人工介入了。'
        }
      ]
    }
  }
});
