// 关卡 20：帝国篇 - 质量保障：门下省审核机制

PLANETS.push({
  id: 'p20',
  icon: '🔍',
  num: '星球 20',
  name: '帝国星 - 质量保障',
  desc: '门下省审核机制：AI 系统的强制质量关卡！',

  difficulties: {
    // 🟢 简单模式
    easy: {
      sections: [
        {
          type: 'story',
          html: `
            <div class="speaker">🔍 帝国星 - 质量保障</div>
            <p>ARIA 带你进入帝国星最关键的一环……</p>
            <div class="chat-bubble robot">
              🤖 ARIA：船长，你有没有遇到过这种情况——<br>
              让 AI 帮你写代码，写出来一堆 bug？<br>
              或者让 AI 做计划，漏掉了重要步骤？
            </div>
            <div class="chat-bubble">
              👦 你：太常见了！AI 经常自信满满地给出错误答案……
            </div>
            <div class="chat-bubble robot">
              🤖 ARIA：三省六部有一个解决方案：<br>
              <strong style="color:var(--cyan)">门下省</strong>——专门负责"挑毛病"的 Agent！<br><br>
              它不负责做任何实际工作，只负责一件事：<br>
              <strong>检查中书省的方案有没有问题。有问题就打回去重做！</strong>
            </div>
          `
        },
        {
          type: 'concept',
          title: '📝 作业检查员',
          html: `
            <p>用小明的故事来理解：</p>
            <div style="margin:14px 0;padding:14px;background:rgba(0,229,255,.06);border-radius:12px;line-height:1.9">
              老师让同学们写一篇关于运动会的计划书。<br>
              但不是写完就直接交给执行员——<br>
              中间还有一个<strong>课代表（门下省）</strong>来检查：<br><br>

              ✅ 计划写清楚了吗？<br>
              ✅ 有没有遗漏重要的步骤？<br>
              ✅ 有没有明显不合理的地方？<br><br>

              <strong>如果检查不通过：</strong><br>
              课代表会告诉计划委员哪里有问题，让他修改。<br>
              最多检查 3 次。3 次都不通过，就告诉老师。<br><br>

              <strong>如果检查通过：</strong><br>
              打上"✅ 准奏"的印章，交给执行员开始执行！
            </div>
          `
        },
        {
          type: 'concept',
          title: '🎯 为什么需要门下省？',
          html: `
            <p><strong>没有检查员的后果：</strong></p>
            <div style="margin:14px 0;padding:14px;background:rgba(239,68,68,.05);border-left:3px solid var(--red);border-radius:8px;line-height:1.8">
              计划委员写了计划 → 执行员直接开始执行<br>
              执行到一半发现：哎，计划漏了安全措施！<br>
              已经执行了一半，改起来很麻烦……<br><br>
              <strong>就像工程师写完代码直接上线，结果有 bug。</strong>
            </div>
            <p style="margin-top:16px"><strong>有检查员的好处：</strong></p>
            <div style="margin:14px 0;padding:14px;background:rgba(0,229,255,.05);border-left:3px solid var(--cyan);border-radius:8px;line-height:1.8">
              问题在计划阶段就被发现，修改成本最低！<br>
              执行员拿到的方案已经经过质量检查，放心执行。<br><br>
              <strong>就像有 Code Review 和 QA 的开发团队。</strong>
            </div>
            <div style="margin-top:16px;padding:12px;background:rgba(251,191,36,.1);border-left:3px solid var(--yellow);border-radius:8px">
              💡 发现问题越早，修复成本越低。<br>
              门下省把问题拦在"计划阶段"，代价最小！
            </div>
          `
        },
        {
          type: 'quiz',
          q: '门下省审核失败（封驳）后，任务会流转到哪里？',
          opts: [
            '直接取消任务',
            '返回给中书省重新制定方案',
            '交给尚书省去修改',
            '告诉用户失败了'
          ],
          ans: 1,
          feedback_ok: '🎉 正确！封驳就是"退回去重做"。门下省把审核意见告诉中书省，中书省修改方案后重新送审。最多 3 轮，3 轮都过不了才上报给人类处理。',
          feedback_err: '封驳不是取消！门下省会把具体的问题和修改建议告诉中书省，让中书省修改后重新提交审核。这是"迭代改进"而不是"直接放弃"。'
        }
      ]
    },

    // 🟡 困难模式
    hard: {
      sections: [
        {
          type: 'story',
          html: `
            <div class="speaker">🔍 帝国星 - 技术版</div>
            <div class="chat-bubble robot">
              🤖 ARIA：门下省是三省六部最有技术含量的部分。<br>
              一个好的审核机制需要：明确的审核标准、
              可操作的修改建议、有限的重试次数。<br>
              让我们看看怎么实现。
            </div>
          `
        },
        {
          type: 'code',
          title: '💻 门下省审核实现',
          code: `from dataclasses import dataclass
from typing import Optional, List

@dataclass
class ReviewResult:
    approved:    bool
    feedback:    str
    suggestions: List[str] = None  # 具体修改建议

class MenxiaAgent:
    MAX_ROUNDS = 3

    REVIEW_PROMPT = """
你是门下省审议官，负责审查中书省提交的方案。

方案内容：
{plan}

请从三个维度审查：
1. 可行性：方案能否被实际执行？步骤是否清晰？
2. 完整性：是否遗漏了关键步骤或风险点？
3. 安全性：是否存在潜在风险（数据丢失/安全漏洞等）？

如果合格，回复"准奏"并说明通过理由。
如果不合格，回复"封驳"并给出：
- 具体问题（列表）
- 修改建议（可操作的）
"""

    async def review(self, plan: str) -> ReviewResult:
        response = await self.llm.call(
            self.REVIEW_PROMPT.format(plan=plan)
        )
        approved = "准奏" in response
        return ReviewResult(
            approved=approved,
            feedback=response,
            suggestions=self._extract_suggestions(response)
        )

    async def review_with_retry(self, task, plan: str) -> str:
        for round_num in range(1, self.MAX_ROUNDS + 1):
            result = await self.review(plan)

            if result.approved:
                await self._log(task, round_num, "准奏")
                return plan

            # 封驳：把反馈交给中书省修改
            await self._log(task, round_num, f"封驳：{result.feedback}")
            plan = await self.zhongshu.revise(plan, result.suggestions)

        # 超过最大轮次，人工介入
        raise ReviewFailedException(
            f"经 {self.MAX_ROUNDS} 轮审核仍未通过，需要人工处理"
        )`,
          explanation: `
            <strong>核心设计：</strong><br>
            • 三维审查标准：可行性 / 完整性 / 安全性<br>
            • 结构化反馈：<code>suggestions</code> 是可操作的修改建议，不是模糊评语<br>
            • 有限轮次：<code>MAX_ROUNDS=3</code>，防止中书省和门下省死循环<br>
            • 升级机制：超过上限抛出异常，由上层决定是否人工介入
          `
        },
        {
          type: 'code',
          title: '🔄 中书省收到封驳后修改方案',
          code: `class ZhongshuAgent:

    REVISE_PROMPT = """
你是中书省规划官。你提交的方案被门下省封驳了。

原方案：
{original_plan}

门下省的审核意见：
{feedback}

具体修改建议：
{suggestions}

请根据以上意见修改方案。
注意：
- 直接解决每一条具体问题
- 保留原方案中合理的部分
- 不要引入新的风险
"""

    async def revise(self, plan: str,
                     suggestions: List[str]) -> str:
        prompt = self.REVISE_PROMPT.format(
            original_plan=plan,
            feedback="\n".join(suggestions),
            suggestions="\n".join(
                f"- {s}" for s in suggestions
            )
        )
        revised = await self.llm.call(prompt)

        # 记录修改历史（用于审计）
        self.revision_history.append({
            "version":   len(self.revision_history) + 1,
            "original":  plan,
            "revised":   revised,
            "triggered_by": "menxia_rejection"
        })
        return revised`,
          explanation: `
            <strong>有效修改的关键：</strong><br>
            • Prompt 明确告知"哪里有问题"和"怎么修改"<br>
            • 提示保留合理部分，避免全部推倒重来（浪费 token）<br>
            • 修改历史记录：可追溯每一版方案的演变过程<br>
            • 版本号（version）：便于后续分析"平均需要几轮才能通过"
          `
        },
        {
          type: 'pitfalls',
          title: '⚠️ 常见设计错误',
          items: [
            '审核标准太模糊 → 用结构化 Prompt 明确三个维度，避免 LLM 随意判断',
            '只说"不合格"不说原因 → 必须给出可操作的修改建议，否则中书省不知道怎么改',
            '无限重试 → 必须设置 MAX_ROUNDS，否则中书省和门下省可能永远达不成一致',
            '门下省和中书省用同一个 LLM 实例 → 容易互相"讨好"，失去独立审核的价值',
            '审核通过率 100% → 说明门下省标准太低，审核形同虚设'
          ]
        },
        {
          type: 'quiz',
          q: '为什么门下省和中书省最好使用不同的 LLM 配置（如不同 temperature）？',
          opts: [
            '节省 API 费用',
            '门下省需要更严格保守（低 temperature），中书省需要更有创造力（高 temperature）',
            '避免两个 Agent 使用相同的 token',
            '提高响应速度'
          ],
          ans: 1,
          feedback_ok: '⭐ 正确！中书省制定方案需要创造力（temperature 稍高），而门下省审核需要严格、保守、挑剔（temperature 低）。如果两者配置相同，门下省可能和中书省"想法一样"，失去独立审核的价值。',
          feedback_err: '想想各自的职责：中书省"制定方案"需要创造力，门下省"挑毛病"需要严谨保守。不同的工作性质需要不同的 LLM 参数配置，这样审核才有意义。'
        }
      ]
    },

    // 🔴 地狱模式
    hell: {
      sections: [
        {
          type: 'story',
          html: `
            <div class="speaker">🔥 地狱模式 - 审核机制深度设计</div>
            <div class="chat-bubble robot" style="border-color:var(--red)">
              🤖 ARIA：生产级的审核机制涉及：<br>
              量化评分、多维度权重、人工介入协议、
              审核效能分析……<br><br>
              这才是让 Multi-Agent 系统可信赖的核心工程。
            </div>
          `
        },
        {
          type: 'code',
          title: '📊 量化审核标准',
          code: `from dataclasses import dataclass
from typing import List

@dataclass
class ReviewCriteria:
    """量化审核标准：每个维度 0-1 分"""
    feasibility:   float  # 可行性：步骤是否可执行
    completeness:  float  # 完整性：是否遗漏关键点
    safety:        float  # 安全性：是否有潜在风险
    clarity:       float  # 清晰度：是否表达清楚

    # 各维度权重（可配置）
    WEIGHTS = {
        "feasibility":  0.35,
        "completeness": 0.30,
        "safety":       0.25,
        "clarity":      0.10,
    }

    def overall_score(self) -> float:
        return sum(
            getattr(self, dim) * weight
            for dim, weight in self.WEIGHTS.items()
        )

    def is_approved(self) -> bool:
        return (
            self.overall_score() >= 0.75 and  # 综合分 >= 75%
            self.safety >= 0.80               # 安全性必须达标
        )

    def weak_dimensions(self) -> List[str]:
        """返回评分低于阈值的维度，用于生成修改建议"""
        thresholds = {"feasibility": 0.7, "completeness": 0.7,
                      "safety": 0.8, "clarity": 0.6}
        return [
            dim for dim, threshold in thresholds.items()
            if getattr(self, dim) < threshold
        ]`,
          explanation: `
            <strong>量化审核的优势：</strong><br>
            • 可解释性：每个维度有独立分数，清楚哪里不足<br>
            • 可配置权重：安全性 weight=0.25，且有独立最低分要求（>=0.80）<br>
            • <code>weak_dimensions()</code>：自动定位问题，生成针对性修改建议<br>
            • 历史分析：可统计各维度平均分，持续优化审核 Prompt
          `
        },
        {
          type: 'code',
          title: '🤝 人工介入协议',
          code: `import asyncio
from enum import Enum

class HumanDecision(Enum):
    APPROVE  = "approve"   # 强制通过
    REJECT   = "reject"    # 直接拒绝任务
    RETRY    = "retry"     # 给更多轮次

class HumanInTheLoop:
    """人工介入接口：当自动审核无法达成一致时调用"""

    async def request_review(self, task, plan: str,
                             history: list) -> HumanDecision:
        # 1. 发送通知（邮件/Slack/钉钉）
        await self.notify({
            "task_id":       task.id,
            "title":         task.title,
            "current_plan":  plan,
            "review_rounds": len(history),
            "last_feedback": history[-1]["feedback"],
            "dashboard_url": f"/tasks/{task.id}"
        })

        # 2. 等待人工决策（超时 24h 自动取消）
        try:
            decision = await asyncio.wait_for(
                self._wait_for_decision(task.id),
                timeout=86400  # 24小时
            )
        except asyncio.TimeoutError:
            await self.cancel_task(task, "人工审核超时，自动取消")
            raise TaskCancelledException(task.id)

        # 3. 记录人工决策（合规审计）
        await self.audit_log.record({
            "type":     "human_intervention",
            "task_id":  task.id,
            "decision": decision.value,
            "reviewer": await self.get_reviewer_id(),
            "reason":   await self.get_decision_reason(),
            "ts":       datetime.utcnow().isoformat()
        })

        return decision`,
          explanation: `
            <strong>人工介入的工程要点：</strong><br>
            • 超时保护：24h 无响应自动取消，防止任务永久挂起<br>
            • 审计记录：人工决策也要写入 audit_log，合规性要求<br>
            • 三种决策：强制通过 / 直接拒绝 / 给更多轮次（灵活处理边界情况）<br>
            • Dashboard URL：通知中附上直达链接，降低人工审核的操作成本
          `
        },
        {
          type: 'concept',
          title: '📈 审核效能分析',
          html: `
            <p><strong>如何知道门下省工作是否有效？</strong></p>
            <div style="margin:14px 0;padding:14px;background:rgba(0,229,255,.06);border-radius:12px;font-size:.9rem;line-height:1.8">
              <strong>关键指标（Key Metrics）：</strong><br><br>

              📊 <strong>一次通过率</strong>（First-Pass Rate）<br>
              &nbsp;&nbsp;= 第一轮就通过的任务数 / 总任务数<br>
              &nbsp;&nbsp;目标：> 60%。过低说明中书省质量差，过高说明门下省标准太松<br><br>

              📊 <strong>平均审核轮次</strong>（Avg Review Rounds）<br>
              &nbsp;&nbsp;目标：< 1.5 轮。超过 2 轮说明需要优化中书省或审核标准<br><br>

              📊 <strong>人工介入率</strong>（Escalation Rate）<br>
              &nbsp;&nbsp;= 3 轮未通过的任务数 / 总任务数<br>
              &nbsp;&nbsp;目标：< 5%。过高说明审核标准不合理或中书省能力不足<br><br>

              📊 <strong>各维度平均分</strong><br>
              &nbsp;&nbsp;持续低分的维度 → 针对性优化对应 Agent 的 Prompt
            </div>
            <div style="margin-top:16px;padding:12px;background:rgba(251,191,36,.1);border-left:3px solid var(--yellow);border-radius:8px;font-size:.9rem">
              💡 把这些指标接入监控系统（Grafana/Datadog），<br>
              门下省的"工作质量"也变得可量化、可优化！
            </div>
          `
        },
        {
          type: 'quiz',
          q: '如果监控发现"人工介入率"持续在 20% 以上，最可能的根本原因是什么？',
          opts: [
            '服务器性能不够',
            '中书省制定方案的能力不足，或门下省审核标准设置不合理',
            '任务太复杂',
            '门下省的 LLM 版本太旧'
          ],
          ans: 1,
          feedback_ok: '🔥 正确！20% 的人工介入率远超 5% 的目标，说明系统性问题：要么中书省经常产出低质量方案（需要优化其 Prompt 或换更强的模型），要么门下省的审核标准设置不合理（太严苛或维度设置有问题）。这就是指标驱动优化的价值！',
          feedback_err: '人工介入率是系统性指标，反映的是 Agent 能力和审核标准的匹配度。20% 的高介入率说明中书省和门下省之间存在系统性问题，需要分析具体哪个维度经常不通过，针对性优化。'
        }
      ]
    }
  }
});
