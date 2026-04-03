// 关卡 5：ReAct 星 2 - 多步推理（完整重构）

PLANETS.push({
  id: 'p5',
  icon: '🔁',
  num: '星球 05',
  name: 'ReAct 星 2：多步推理',
  desc: '学习复杂任务的分解和规划。',

  difficulties: {
    // 🟢 简单模式
    easy: {
      sections: [
        {
          type: 'story',
          html: `
            <div class="speaker">🚀 ReAct 星深处</div>
            <p>ARIA 带你来到 ReAct 星的核心区域：</p>
            <div class="chat-bubble robot">
              🤖 ARIA：船长！简单的任务用一次循环就能完成，但复杂的任务需要<strong>多步推理</strong>！
              就像你做作业，要先读题、再列步骤、再一步步解决。
            </div>
            <div class="chat-bubble">
              👦 你：所以 Agent 也要学会"规划"？
            </div>
            <div class="chat-bubble robot">
              🤖 ARIA：完全正确！这叫 <strong>Chain-of-Thought（思维链）</strong>！
              让 Agent 先想清楚要做什么，再一步步执行。
            </div>
          `
        },
        {
          type: 'concept',
          title: '🧠 Chain-of-Thought（思维链）',
          html: `
            <p>多步推理的关键：</p>
            <ul style="margin:10px 0 0 16px;line-height:2.2">
              <li>📋 <strong>任务分解</strong>：把大任务拆成小步骤</li>
              <li>🔗 <strong>依赖关系</strong>：哪些步骤要先做，哪些可以并行</li>
              <li>🎯 <strong>逐步执行</strong>：一步一步完成，不跳步</li>
              <li>✅ <strong>验证结果</strong>：每步完成后检查是否正确</li>
            </ul>
            <p style="margin-top:12px;color:var(--muted);font-size:.85rem">
              💡 例如：「帮我分析今年的销售数据并写报告」<br>
              → 步骤1：搜索销售数据<br>
              → 步骤2：分析数据趋势<br>
              → 步骤3：生成报告
            </p>
          `
        },
        {
          type: 'quiz',
          q: 'Chain-of-Thought 的作用是什么？',
          opts: [
            '让 Agent 运行得更快',
            '让 Agent 先规划步骤，再逐步执行复杂任务',
            '让 Agent 说话更流利',
            '让 Agent 能同时做很多事'
          ],
          ans: 1,
          feedback_ok: '🎯 完全正确！Chain-of-Thought 让 Agent 能处理复杂的多步骤任务！',
          feedback_err: '记住：Chain-of-Thought 是关于"规划"和"分步执行"的！'
        }
      ]
    },

    // 🟡 困难模式
    hard: {
      sections: [
        {
          type: 'story',
          html: `
            <div class="speaker">🚀 ReAct 星深处（技术版）</div>
            <div class="chat-bubble robot">
              🤖 ARIA：船长！让我给你讲讲如何引导 LLM 进行多步推理。
              这需要精心设计 prompt 和系统消息。
            </div>
          `
        },
        {
          type: 'concept',
          title: '🧠 引导多步推理的技术',
          html: `
            <p>实现多步推理的方法：</p>
            <ul style="margin:10px 0 0 16px;line-height:2">
              <li><strong>System Prompt</strong>：在系统消息中引导 LLM 分步思考</li>
              <li><strong>Few-shot Examples</strong>：提供示例展示如何分步解决问题</li>
              <li><strong>显式规划</strong>：让 LLM 先输出计划，再执行</li>
              <li><strong>中间验证</strong>：每步完成后验证结果</li>
            </ul>
          `
        },
        {
          type: 'code',
          title: '📟 引导多步推理的 Prompt',
          code: `system_prompt = """
在回答问题前，请按以下步骤思考：

1. 分析问题：我需要什么信息？
2. 规划步骤：我应该先做什么，再做什么？
3. 执行：逐步调用工具
4. 总结：整合结果给出答案

每一步都要说明你的思考过程。
"""

response = client.messages.create(
    model="claude-opus-4-6",
    max_tokens=4096,
    system=system_prompt,
    messages=[{"role": "user", "content": query}]
)`,
          explanation: `
            <strong>关键点：</strong><br>
            • System Prompt 引导 LLM 分步思考<br>
            • 明确要求 LLM 说明思考过程<br>
            • 这样 LLM 会更有条理地解决复杂问题
          `
        },
        {
          type: 'pitfalls',
          title: '⚠️ 常见坑点',
          items: [
            'Prompt 不够明确 → LLM 可能跳步或遗漏关键步骤',
            '没有中间验证 → 前面的错误会影响后续步骤',
            '步骤过多 → 可能超出 Context Window 或 max_iterations',
            '没有处理步骤失败 → 整个任务失败，应该有重试或回退机制'
          ]
        },
        {
          type: 'quiz',
          q: '如何引导 LLM 进行多步推理？',
          opts: [
            '直接问问题，LLM 会自动分步',
            '在 System Prompt 中明确要求 LLM 分步思考和规划',
            '增加 Temperature 参数',
            '使用更大的模型'
          ],
          ans: 1,
          feedback_ok: '✅ 正确！System Prompt 是引导 LLM 行为的关键！',
          feedback_err: 'System Prompt 是引导 LLM 分步思考的最有效方法！'
        }
      ]
    },

    // 🔴 地狱模式
    hell: {
      sections: [
        {
          type: 'story',
          html: `
            <div class="speaker">🔥 地狱模式 - ReAct 论文深度解读</div>
            <div class="chat-bubble robot" style="border-color:var(--red)">
              🤖 ARIA：船长，你知道 Agent 的"思考+行动"模式是怎么来的吗？<br><br>
              2023 年，一篇论文正式定义了这个范式：<br>
              <strong>ReAct: Synergizing Reasoning and Acting in Language Models</strong><br><br>
              作者来自普林斯顿大学和 Google Research。<br>
              这篇论文是所有 Agent 框架的理论基础！
            </div>
          `
        },
        {
          type: 'concept',
          title: '📄 论文背景：两个世界的碰撞',
          html: `
            <div style="margin:14px 0;padding:14px;background:rgba(0,229,255,.06);border-radius:12px;line-height:1.9">
              <strong>论文信息：</strong><br>
              • 标题：ReAct: Synergizing Reasoning and Acting in Language Models<br>
              • 作者：Shunyu Yao 等（普林斯顿 + Google Research）<br>
              • 发表：ICLR 2023<br>
              • 引用：超过 2,000 次（2023 年论文，增长极快）<br><br>

              <strong>论文解决的问题：</strong><br>
              在 ReAct 之前，有两种方法各有缺陷：
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:14px 0">
              <div style="padding:12px;background:rgba(239,68,68,.05);border:1px solid rgba(239,68,68,.2);border-radius:12px;font-size:.85rem;line-height:1.7">
                <strong style="color:var(--red)">❌ 只推理（CoT）</strong><br>
                让 LLM 一直思考<br>
                问题：思考可能出错，<br>
                没有外部信息纠正
              </div>
              <div style="padding:12px;background:rgba(239,68,68,.05);border:1px solid rgba(239,68,68,.2);border-radius:12px;font-size:.85rem;line-height:1.7">
                <strong style="color:var(--red)">❌ 只行动（Act）</strong><br>
                直接调用工具<br>
                问题：没有推理，<br>
                不知道为什么这样做
              </div>
            </div>
            <div style="padding:12px;background:rgba(0,229,255,.05);border:1px solid rgba(0,229,255,.2);border-radius:12px;font-size:.85rem;line-height:1.7;text-align:center">
              <strong style="color:var(--cyan)">✅ ReAct = 推理 + 行动交替</strong><br>
              思考 → 行动 → 观察 → 思考 → 行动……<br>
              两者互相补充，互相纠正！
            </div>
          `
        },
        {
          type: 'concept',
          title: '💡 ReAct 的核心创新：Thought 的格式',
          html: `
            <p>ReAct 最关键的设计是让 LLM 输出<strong>可读的思考过程</strong>：</p>
            <div style="margin:14px 0;padding:14px;background:rgba(0,0,0,.3);border-radius:12px;font-family:monospace;font-size:.82rem;line-height:1.9">
              <span style="color:#fca5a5">问题：</span>科罗拉多造山运动东部区域的海拔范围是多少？<br><br>

              <span style="color:var(--yellow)">Thought 1:</span> 我需要先搜索科罗拉多造山运动，找到东部区域。<br>
              <span style="color:var(--cyan)">Action 1:</span> Search[科罗拉多造山运动]<br>
              <span style="color:#a3e635">Observation 1:</span> 科罗拉多造山运动是一次古老的造山运动，东部区域包括高原地带……<br><br>

              <span style="color:var(--yellow)">Thought 2:</span> 我找到了东部区域，但还没有海拔数据。需要搜索高原地带的海拔。<br>
              <span style="color:var(--cyan)">Action 2:</span> Search[高原地带海拔范围]<br>
              <span style="color:#a3e635">Observation 2:</span> 高原地带海拔约 1,800 到 2,100 米……<br><br>

              <span style="color:var(--yellow)">Thought 3:</span> 我已经找到了答案。<br>
              <span style="color:var(--cyan)">Action 3:</span> Finish[1,800 到 2,100 米]
            </div>
            <div style="margin-top:16px;padding:12px;background:rgba(251,191,36,.1);border-left:3px solid var(--yellow);border-radius:8px;font-size:.9rem">
              💡 <strong>Thought 的作用：</strong><br>
              • 让 LLM 解释"为什么"要做这个行动<br>
              • 让 LLM 分析上一步的结果<br>
              • 让 LLM 规划下一步<br>
              • 出错时可以在 Thought 里自我纠正！
            </div>
          `
        },
        {
          type: 'code',
          title: '💻 ReAct 的 Prompt 设计（Few-Shot）',
          code: `# ReAct 的核心是 Few-Shot Prompt，给 LLM 示范格式
REACT_PROMPT = """
解决问题时，请交替使用 Thought、Action、Observation。

Thought: 分析当前情况，决定下一步
Action: search[查询词] 或 lookup[关键词] 或 finish[答案]
Observation: 工具返回的结果（由系统填入）

示例：
问题：苹果公司的创始人是谁？他出生在哪个城市？

Thought: 我需要找到苹果公司的创始人。
Action: search[苹果公司创始人]
Observation: 苹果公司由史蒂夫·乔布斯、史蒂夫·沃兹尼亚克和罗纳德·韦恩创立。

Thought: 找到了创始人，现在需要找乔布斯的出生城市。
Action: search[史蒂夫·乔布斯出生地]
Observation: 史蒂夫·乔布斯于1955年2月24日出生于美国加利福尼亚州旧金山。

Thought: 我已经有了完整答案。
Action: finish[苹果公司创始人是史蒂夫·乔布斯，他出生在旧金山]

现在解决这个问题：
{question}
"""

def react_agent(question, max_steps=6):
    prompt = REACT_PROMPT.format(question=question)
    trajectory = []

    for step in range(max_steps):
        # LLM 生成 Thought + Action
        response = llm.generate(prompt, stop=["Observation:"])

        # 解析 Action
        action = parse_action(response)  # search/lookup/finish

        if action.type == "finish":
            return action.answer

        # 执行工具，获取 Observation
        observation = execute_tool(action)

        # 把 Observation 加回 prompt，继续循环
        prompt += response + f"Observation: {observation}\n\n"
        trajectory.append((response, observation))

    return "达到最大步数"`,
          explanation: `
            <strong>ReAct 实现的关键：</strong><br>
            • <strong>Few-Shot 示例</strong>：给 LLM 看完整的 Thought/Action/Observation 格式<br>
            • <strong>stop=["Observation:"]</strong>：让 LLM 在 Action 后停止，等待工具结果<br>
            • <strong>追加 Observation</strong>：把工具结果加回 prompt，形成完整轨迹<br>
            • <strong>finish 动作</strong>：LLM 自己决定何时结束，不需要外部判断
          `
        },
        {
          type: 'concept',
          title: '📊 论文实验结果',
          html: `
            <p><strong>ReAct 在三个任务上的表现：</strong></p>
            <div style="margin:14px 0;padding:14px;background:rgba(0,229,255,.06);border-radius:12px;font-size:.9rem;line-height:1.8">
              <strong>1. HotpotQA（多跳问答）</strong><br>
              需要多步搜索才能回答的问题<br>
              • 只用 CoT（思维链）：29.4% 准确率<br>
              • 只用 Act（直接行动）：25.7% 准确率<br>
              • <strong style="color:var(--cyan)">ReAct：35.1% 准确率</strong> ✅ 最高！<br><br>

              <strong>2. FEVER（事实验证）</strong><br>
              判断一个陈述是否为真<br>
              • 只用 CoT：56.3%<br>
              • 只用 Act：58.9%<br>
              • <strong style="color:var(--cyan)">ReAct：63.1%</strong> ✅ 最高！<br><br>

              <strong>3. ALFWorld（交互式环境）</strong><br>
              在虚拟房间里完成任务（找物品、开关等）<br>
              • 只用 Act：45%<br>
              • <strong style="color:var(--cyan)">ReAct：71%</strong> ✅ 大幅领先！
            </div>
            <div style="margin-top:16px;padding:12px;background:rgba(251,191,36,.1);border-left:3px solid var(--yellow);border-radius:8px;font-size:.9rem">
              💡 <strong>为什么 ReAct 更好？</strong><br>
              Thought 让 LLM 能分析 Observation 的结果，<br>
              发现错误时可以在下一个 Thought 里纠正方向！
            </div>
          `
        },
        {
          type: 'pitfalls',
          title: '⚠️ ReAct 的局限性（论文坦诚讨论）',
          items: [
            '幻觉导致错误行动：LLM 在 Thought 里编造信息，然后基于错误信息行动',
            'Token 消耗大：每步都要输出 Thought，比直接行动多 2-3 倍 token',
            '步数限制：复杂任务可能需要很多步，超出 Context Window',
            '格式敏感：LLM 有时不严格遵循 Thought/Action/Observation 格式',
            '改进方向：Reflexion（自我反思）让 Agent 从失败中学习，效果更好'
          ]
        },
        {
          type: 'concept',
          title: '🔮 ReAct 之后的演进',
          html: `
            <div style="margin:14px 0;padding:14px;background:rgba(251,191,36,.1);border-left:3px solid var(--yellow);border-radius:12px;line-height:1.9">
              <strong>2023 - Reflexion</strong><br>
              Agent 失败后，用语言反思错误，下次避免同样的错误<br>
              就像人类从失败中学习！<br><br>

              <strong>2023 - Tree of Thoughts (ToT)</strong><br>
              不只是一条思维链，而是探索多条路径，选最好的<br>
              就像下棋时考虑多种走法！<br><br>

              <strong>2023 - LangChain / LangGraph</strong><br>
              把 ReAct 封装成框架，开发者不需要手写 Prompt<br><br>

              <strong>2024 - Claude / GPT-4 内置推理</strong><br>
              模型本身就会 ReAct 式推理，不需要特殊 Prompt
            </div>
          `
        },
        {
          type: 'quiz',
          q: 'ReAct 论文中，Thought 的最重要作用是什么？',
          opts: [
            '让输出更长，看起来更专业',
            '让 LLM 能分析 Observation 结果并自我纠正方向，而不是盲目行动',
            '减少 API 调用次数',
            '让代码更容易解析'
          ],
          ans: 1,
          feedback_ok: '🔥 完美！Thought 是 ReAct 的灵魂。它让 LLM 在每次行动前先"想清楚"，在看到结果后能"分析对不对"。这种自我纠正能力是 ReAct 比纯行动（Act-only）强的核心原因！',
          feedback_err: 'Thought 的价值在于"自我纠正"。当工具返回意外结果时，LLM 可以在下一个 Thought 里分析"这不对，我应该换个方向"。这是 ReAct 比 CoT 和 Act-only 都强的关键！'
        }
      ]
    }
  }
});
