// 关卡 8：多 Agent 星（完整重构）

PLANETS.push({
  id: 'p8',
  icon: '🌐',
  num: '星球 08',
  name: '多 Agent 星',
  desc: '学习多 Agent 协作和架构模式。',

  difficulties: {
    // 🟢 简单模式
    easy: {
      sections: [
        {
          type: 'story',
          html: `
            <div class="speaker">🚀 最终星球！</div>
            <p>这颗巨大的星球上有无数个 Agent 机器人在协同工作，场面壮观！</p>
            <div class="chat-bubble robot">
              🤖 ARIA：船长！单个 Agent 能力有限，但如果把多个专业 Agent 组合起来，
              就能完成超级复杂的任务！这就是<strong>多 Agent 系统</strong>！
            </div>
            <div class="chat-bubble">
              👦 你：就像足球队？有守门员、前锋、中场……各有分工？
            </div>
            <div class="chat-bubble robot">
              🤖 ARIA：完美比喻！有一个「指挥官 Agent」负责分配任务，
              其他 Agent 各司其职，最后汇总结果！
            </div>
          `
        },
        {
          type: 'concept',
          title: '🌐 多 Agent 系统架构',
          html: `
            <div style="text-align:center;margin:10px 0">
              <div style="display:inline-block;background:rgba(239,68,68,.15);border:1px solid rgba(239,68,68,.4);border-radius:12px;padding:10px 20px;font-weight:700;color:#fca5a5">
                🎯 指挥官 Agent（Orchestrator）
              </div>
            </div>
            <div style="display:flex;justify-content:center;gap:4px;margin:8px 0;color:var(--muted)">↙ &nbsp; ↓ &nbsp; ↘</div>
            <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-top:4px">
              <div style="background:rgba(0,229,255,.08);border:1px solid rgba(0,229,255,.2);border-radius:10px;padding:12px;text-align:center;font-size:.82rem">
                🔍<br><strong>搜索 Agent</strong><br><span style="color:var(--muted)">负责收集资料</span>
              </div>
              <div style="background:rgba(168,85,247,.08);border:1px solid rgba(168,85,247,.2);border-radius:10px;padding:12px;text-align:center;font-size:.82rem">
                📊<br><strong>分析 Agent</strong><br><span style="color:var(--muted)">负责分析数据</span>
              </div>
              <div style="background:rgba(34,197,94,.08);border:1px solid rgba(34,197,94,.2);border-radius:10px;padding:12px;text-align:center;font-size:.82rem">
                ✍️<br><strong>写作 Agent</strong><br><span style="color:var(--muted)">负责生成报告</span>
              </div>
            </div>
            <p style="margin-top:14px;font-size:.85rem;color:var(--muted);line-height:1.7">
              真实案例：你让 Agent「帮我分析今年的销售数据并写报告」——<br>
              搜索 Agent 收集数据 → 分析 Agent 处理数字 → 写作 Agent 生成报告 → 指挥官汇总给你！
            </p>
          `
        },
        {
          type: 'quiz',
          q: '多 Agent 系统中「指挥官 Agent」的主要作用是什么？',
          opts: [
            '自己完成所有任务，不需要其他 Agent',
            '分配任务给其他专业 Agent，并汇总结果',
            '只负责和用户聊天',
            '控制飞船导航系统'
          ],
          ans: 1,
          feedback_ok: '🏆 完美！指挥官 Agent 就像球队队长，负责战术分配，让每个 Agent 发挥专长！',
          feedback_err: '指挥官不是"全能选手"，而是"分配任务的人"！'
        }
      ]
    },

    // 🟡 困难模式
    hard: {
      sections: [
        {
          type: 'story',
          html: `
            <div class="speaker">🚀 多 Agent 星（技术版）</div>
            <div class="chat-bubble robot">
              🤖 ARIA：船长！让我给你讲讲多 Agent 系统的架构模式。
              这是构建复杂 Agent 系统的关键！
            </div>
          `
        },
        {
          type: 'concept',
          title: '🌐 多 Agent 架构模式',
          html: `
            <p>常见的多 Agent 架构：</p>
            <ul style="margin:10px 0 0 16px;line-height:2">
              <li><strong>Supervisor 模式</strong>：一个指挥官 Agent 分配任务给其他 Agent</li>
              <li><strong>Pipeline 模式</strong>：Agent 串行处理，输出传递给下一个</li>
              <li><strong>Parallel 模式</strong>：多个 Agent 并行工作，最后汇总</li>
              <li><strong>Hierarchical 模式</strong>：多层级的 Agent 组织</li>
            </ul>
          `
        },
        {
          type: 'code',
          title: '📟 Supervisor 模式示例',
          code: `def supervisor_agent(task):
    # 1. 分析任务
    plan = llm_call(f"分解任务：{task}")

    # 2. 分配给专业 Agent
    results = []
    if "搜索" in plan:
        results.append(search_agent.run())
    if "分析" in plan:
        results.append(analysis_agent.run())

    # 3. 汇总结果
    final = llm_call(f"汇总：{results}")
    return final`,
          explanation: `
            <strong>关键点：</strong><br>
            • Supervisor 负责任务分解和分配<br>
            • 各个专业 Agent 独立完成子任务<br>
            • Supervisor 汇总所有结果
          `
        },
        {
          type: 'pitfalls',
          title: '⚠️ 常见坑点',
          items: [
            '没有错误处理 → 一个 Agent 失败导致整个系统失败',
            'Agent 之间通信格式不统一 → 难以集成',
            '没有超时机制 → 某个 Agent 卡住导致整个系统卡住',
            '过度设计 → 简单任务不需要多 Agent，单 Agent 就够了'
          ]
        },
        {
          type: 'quiz',
          q: '什么时候应该使用多 Agent 系统？',
          opts: [
            '所有任务都应该用多 Agent',
            '任务复杂，需要不同专业能力协作时',
            '只有在有很多用户时才需要',
            '永远不应该用多 Agent'
          ],
          ans: 1,
          feedback_ok: '✅ 正确！多 Agent 适合复杂任务，简单任务用单 Agent 就够了！',
          feedback_err: '多 Agent 是为了处理复杂任务，不是所有情况都需要！'
        },
        {
          type: 'quiz',
          q: '完成了这个游戏，你学会了哪些概念？（选最全的）',
          opts: [
            '只学了 LLM 是什么',
            'LLM + 工具调用 + ReAct + 记忆 + 多Agent，这是完整的 Agent 知识体系！',
            '学会了如何制造真正的机器人',
            '学会了怎么开飞船'
          ],
          ans: 1,
          feedback_ok: '🚀🏆🌟 你太厉害了！你和爸爸都完整地了解了 Agent 开发的核心知识体系！冲冲冲！',
          feedback_err: '回想一下，我们探索了 8 颗星球：LLM、工具调用、ReAct、记忆、多Agent！'
        }
      ]
    },

    // 🔴 地狱模式
    hell: {
      sections: [
        {
          type: 'story',
          html: `
            <div class="speaker">🔥 地狱模式 - CAMEL 论文深度解读</div>
            <div class="chat-bubble robot" style="border-color:var(--red)">
              🤖 ARIA：船长，多 Agent 系统有一个根本问题——<br>
              <strong>Agent 之间怎么沟通？</strong><br><br>
              2023 年，一篇论文系统研究了这个问题：<br>
              <strong>CAMEL: Communicative Agents for "Mind" Exploration</strong><br><br>
              它设计了一个"AI 用户 + AI 助手"的角色扮演框架，<br>
              让两个 Agent 自主协作完成任务！
            </div>
          `
        },
        {
          type: 'concept',
          title: '📄 论文背景',
          html: `
            <div style="margin:14px 0;padding:14px;background:rgba(0,229,255,.06);border-radius:12px;line-height:1.9">
              <strong>论文信息：</strong><br>
              • 标题：CAMEL: Communicative Agents for "Mind" Exploration of Large Scale Language Model Society<br>
              • 作者：Guohao Li 等（KAUST，沙特阿卜杜拉国王科技大学）<br>
              • 发表：NeurIPS 2023<br>
              • 引用：超过 1,000 次<br>
              • 开源：github.com/camel-ai/camel<br><br>

              <strong>核心问题：</strong><br>
              让多个 LLM Agent 协作时，最大的挑战是什么？<br>
              → <strong>角色混淆</strong>：Agent 忘记自己的角色<br>
              → <strong>对话发散</strong>：偏离原始任务<br>
              → <strong>终止困难</strong>：不知道什么时候算完成
            </div>
          `
        },
        {
          type: 'concept',
          title: '💡 CAMEL 的核心设计：角色扮演 + Inception Prompting',
          html: `
            <p><strong>CAMEL 的架构：两个 Agent，一个任务</strong></p>
            <div style="margin:14px 0;padding:14px;background:rgba(0,229,255,.06);border-radius:12px;font-size:.9rem;line-height:1.8">
              <strong>AI User Agent（用户角色）</strong><br>
              • 扮演：提出需求的人（如"产品经理"）<br>
              • 职责：给出指令，推进任务进展<br>
              • Prompt：告诉它"你是一个产品经理，你的目标是……"<br><br>

              <strong>AI Assistant Agent（助手角色）</strong><br>
              • 扮演：执行任务的人（如"Python 程序员"）<br>
              • 职责：接收指令，完成具体工作<br>
              • Prompt：告诉它"你是一个 Python 程序员，你要帮助……"<br><br>

              <strong>Human（真实用户）</strong><br>
              • 只需要在开始时指定任务<br>
              • 之后两个 AI 自主协作，直到完成
            </div>
            <div style="margin-top:16px;padding:12px;background:rgba(251,191,36,.1);border-left:3px solid var(--yellow);border-radius:8px;font-size:.9rem">
              💡 <strong>Inception Prompting（初始化提示）：</strong><br>
              在对话开始时，给每个 Agent 详细的角色设定和任务背景，<br>
              让它们"入戏"，不会忘记自己是谁、要做什么。
            </div>
          `
        },
        {
          type: 'code',
          title: '💻 CAMEL 角色扮演实现',
          code: `import anthropic

client = anthropic.Anthropic()

def create_agent(role: str, task: str, counterpart: str) -> dict:
    """创建一个角色扮演 Agent 的系统 Prompt"""
    return {
        "system": f"""你正在扮演一个{role}。
你的任务是与{counterpart}合作完成以下目标：{task}

规则：
1. 始终保持你的角色，不要偏离
2. 每次只给出一个具体的指令或回应
3. 当任务完成时，说"任务完成"
4. 不要重复已经完成的工作""",
        "history": []
    }

def camel_chat(user_agent: dict, assistant_agent: dict,
               max_turns: int = 10) -> list:
    """CAMEL 对话循环"""
    conversation = []

    # 用户 Agent 先发起第一条指令
    user_msg = "让我们开始吧。请先告诉我你的计划。"

    for turn in range(max_turns):
        # 助手 Agent 回应
        assistant_agent["history"].append(
            {"role": "user", "content": user_msg}
        )
        assistant_resp = client.messages.create(
            model="claude-opus-4-6", max_tokens=512,
            system=assistant_agent["system"],
            messages=assistant_agent["history"]
        ).content[0].text
        assistant_agent["history"].append(
            {"role": "assistant", "content": assistant_resp}
        )

        conversation.append(("助手", assistant_resp))
        if "任务完成" in assistant_resp:
            break

        # 用户 Agent 给出下一条指令
        user_agent["history"].append(
            {"role": "user", "content": assistant_resp}
        )
        user_msg = client.messages.create(
            model="claude-opus-4-6", max_tokens=256,
            system=user_agent["system"],
            messages=user_agent["history"]
        ).content[0].text
        user_agent["history"].append(
            {"role": "assistant", "content": user_msg}
        )
        conversation.append(("用户", user_msg))

    return conversation`,
          explanation: `
            <strong>CAMEL 实现的关键：</strong><br>
            • <strong>独立历史</strong>：每个 Agent 维护自己的对话历史，互不干扰<br>
            • <strong>角色互换</strong>：助手的回应变成用户的"用户消息"，形成对话循环<br>
            • <strong>终止条件</strong>："任务完成"关键词，防止无限循环<br>
            • <strong>max_turns</strong>：硬性上限，防止 token 消耗失控
          `
        },
        {
          type: 'concept',
          title: '📊 论文实验：AI 社会的涌现行为',
          html: `
            <p><strong>CAMEL 最有趣的发现：</strong></p>
            <div style="margin:14px 0;padding:14px;background:rgba(0,229,255,.06);border-radius:12px;font-size:.9rem;line-height:1.8">
              <strong>实验规模：</strong><br>
              • 50 种职业角色 × 50 种任务 = 2,500 个对话<br>
              • 每个对话平均 15-20 轮<br>
              • 总计约 50,000 轮 Agent 对话<br><br>

              <strong>发现 1：角色扮演有效</strong><br>
              有 Inception Prompting 的 Agent 比没有的更专注，<br>
              任务完成率从 45% 提升到 78%<br><br>

              <strong>发现 2：涌现出意外行为</strong><br>
              • Agent 会主动提问澄清需求<br>
              • Agent 会拒绝不合理的指令<br>
              • Agent 会提出原始任务没有要求的改进建议<br><br>

              <strong>发现 3：对话发散问题</strong><br>
              约 15% 的对话会偏离原始任务，<br>
              这是多 Agent 系统的核心挑战之一
            </div>
          `
        },
        {
          type: 'concept',
          title: '🔮 CAMEL 之后：多 Agent 框架的演进',
          html: `
            <div style="margin:14px 0;padding:14px;background:rgba(251,191,36,.1);border-left:3px solid var(--yellow);border-radius:12px;line-height:1.9;font-size:.9rem">
              <strong>2023 - AutoGen（微软）</strong><br>
              CAMEL 的工程化版本，支持人类随时介入对话<br><br>

              <strong>2023 - MetaGPT</strong><br>
              模拟软件公司：产品经理 + 架构师 + 程序员 + 测试<br>
              给每个角色分配标准化的输出格式（PRD、代码、测试报告）<br><br>

              <strong>2023 - CrewAI</strong><br>
              更简洁的 API，专注于任务导向的多 Agent 协作<br><br>

              <strong>2024 - EDICT（三省六部）</strong><br>
              加入强制审核机制（门下省），解决 CAMEL 的质量控制问题<br>
              这就是我们帝国篇学的内容！
            </div>
          `
        },
        {
          type: 'pitfalls',
          title: '⚠️ 多 Agent 系统的核心挑战',
          items: [
            '角色混淆（Role Confusion）：Agent 忘记自己的角色，开始扮演对方——用 Inception Prompting 解决',
            '对话发散（Conversation Drift）：偏离原始任务，越聊越远——用任务检查点和强制终止解决',
            '奉承行为（Sycophancy）：AI 助手总是同意 AI 用户，不提出真正的异议——用独立评估解决',
            'Token 消耗失控：多轮对话 × 多个 Agent，成本急剧上升——设置 max_turns 和 token 预算',
            '质量无保证：两个 Agent 可能互相"认可"错误答案——这就是为什么需要门下省！'
          ]
        },
        {
          type: 'quiz',
          q: 'CAMEL 论文中，"Inception Prompting"的作用是什么？',
          opts: [
            '让 Agent 运行更快',
            '在对话开始时给每个 Agent 详细的角色设定，防止角色混淆和任务偏离',
            '减少 API 调用次数',
            '让 Agent 生成更长的回答'
          ],
          ans: 1,
          feedback_ok: '🔥 完美！Inception Prompting 是 CAMEL 的核心贡献之一。就像演员在开拍前要深入了解角色背景，Inception Prompting 让 Agent 在对话开始时就"入戏"，整个协作过程中都不会忘记自己是谁、要做什么。',
          feedback_err: 'Inception Prompting 解决的是"角色混淆"问题。在多 Agent 对话中，LLM 很容易忘记自己的角色。Inception Prompting 在开始时给出详细的角色设定和任务背景，让 Agent 始终保持专注。'
        }
      ]
    }
  }
});
