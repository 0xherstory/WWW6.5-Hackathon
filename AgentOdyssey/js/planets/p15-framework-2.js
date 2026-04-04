// 关卡 15：框架星 2 - AutoGen & CrewAI（完整重构）

PLANETS.push({
  id: 'p15',
  icon: '🤖',
  num: '星球 15',
  name: '框架星 2：AutoGen & CrewAI',
  desc: '学习多 Agent 协作框架，组建你的 AI 团队！',

  difficulties: {
    // 🟢 简单模式
    easy: {
      sections: [
        {
          type: 'story',
          html: `
            <div class="speaker">🤖 框架星 2</div>
            <p>飞船来到多 Agent 框架星，这里有各种 AI 团队！</p>
            <div class="chat-bubble robot">
              🤖 ARIA：船长！上一颗星球学了 LangGraph，<br>
              今天学两个专门为多 Agent 协作设计的框架：<br>
              <strong>AutoGen</strong>（微软）和 <strong>CrewAI</strong>！
            </div>
            <div class="chat-bubble">
              👦 你：它们和 LangGraph 有什么不同？
            </div>
            <div class="chat-bubble robot">
              🤖 ARIA：LangGraph 关注"流程控制"，<br>
              AutoGen 和 CrewAI 更关注"Agent 之间的对话和协作"！
            </div>
          `
        },
        {
          type: 'concept',
          title: '🤖 AutoGen vs CrewAI',
          html: `
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:8px">
              <div style="background:rgba(0,229,255,.08);border:1px solid rgba(0,229,255,.2);border-radius:12px;padding:14px">
                <strong style="color:var(--cyan)">🤖 AutoGen（微软）</strong>
                <p style="font-size:.82rem;color:var(--muted);margin-top:8px;line-height:1.8">
                  • 多个 Agent 互相对话<br>
                  • 像小组讨论<br>
                  • 支持代码执行<br>
                  • 人类可以随时介入
                </p>
              </div>
              <div style="background:rgba(34,197,94,.08);border:1px solid rgba(34,197,94,.2);border-radius:12px;padding:14px">
                <strong style="color:var(--green)">👥 CrewAI</strong>
                <p style="font-size:.82rem;color:var(--muted);margin-top:8px;line-height:1.8">
                  • 像公司组织架构<br>
                  • 每个 Agent 有明确角色<br>
                  • 任务分配清晰<br>
                  • 适合流程化工作
                </p>
              </div>
            </div>
            <div style="margin-top:14px;padding:12px;background:rgba(251,191,36,.08);border-left:3px solid var(--yellow);border-radius:8px;font-size:.9rem">
              💡 AutoGen 适合需要"讨论"的任务，CrewAI 适合需要"分工"的任务！
            </div>
          `
        },
        {
          type: 'quiz',
          q: '如果你要做一个"产品经理+工程师+测试员"协作完成项目的系统，哪个框架最合适？',
          opts: [
            'AutoGen，因为它是微软做的',
            'CrewAI，因为它专门为明确角色分工的团队协作设计',
            'LangChain，因为工具最多',
            '直接用 Claude API'
          ],
          ans: 1,
          feedback_ok: '🎯 正确！CrewAI 的 Agent/Task/Crew 模型完美对应"角色/任务/团队"的组织结构！',
          feedback_err: 'CrewAI 的设计理念就是模拟公司组织——每个 Agent 有角色，每个任务有负责人！'
        }
      ]
    },

    // 🟡 困难模式
    hard: {
      sections: [
        {
          type: 'story',
          html: `
            <div class="speaker">🤖 框架星 2（技术版）</div>
            <div class="chat-bubble robot">
              🤖 ARIA：船长！让我们看看 AutoGen 和 CrewAI 的实际代码。<br>
              重点理解它们的设计哲学，而不只是 API！
            </div>
          `
        },
        {
          type: 'code',
          title: '💻 CrewAI 完整实现：AI 研究团队',
          code: `from crewai import Agent, Task, Crew, Process
from crewai_tools import SerperDevTool, WebsiteSearchTool

# 工具
search_tool = SerperDevTool()

# ===== 定义 Agent 团队 =====

researcher = Agent(
    role="AI 研究员",
    goal="收集关于指定主题的最新、最准确的信息",
    backstory="""你是一个经验丰富的研究员，擅长从互联网上
    找到高质量的信息来源，并能快速识别关键信息。""",
    tools=[search_tool],
    verbose=True,
    allow_delegation=False  # 不允许把任务转给其他 Agent
)

analyst = Agent(
    role="数据分析师",
    goal="分析研究员收集的信息，找出关键趋势和洞察",
    backstory="""你是一个分析专家，擅长从大量信息中
    提炼出有价值的洞察，并用清晰的逻辑呈现。""",
    verbose=True,
    allow_delegation=False
)

writer = Agent(
    role="技术写作专家",
    goal="把分析结果写成清晰、专业的报告",
    backstory="""你是一个技术写作专家，能把复杂的技术内容
    写成普通人也能理解的文章。""",
    verbose=True,
    allow_delegation=False
)

# ===== 定义任务（注意：任务有依赖关系）=====

research_task = Task(
    description="""搜索关于"{topic}"的最新信息。
    收集至少 5 个可靠来源，记录关键数据和观点。
    输出：结构化的信息列表，包含来源 URL。""",
    expected_output="包含来源的结构化信息列表",
    agent=researcher
)

analysis_task = Task(
    description="""基于研究员收集的信息，进行深度分析：
    1. 识别 3-5 个关键趋势
    2. 找出不同来源的共识和分歧
    3. 评估信息的可靠性
    输出：分析报告（500字以内）""",
    expected_output="趋势分析报告",
    agent=analyst,
    context=[research_task]  # 依赖 research_task 的输出
)

writing_task = Task(
    description="""基于分析报告，写一篇面向普通读者的文章：
    - 标题吸引人
    - 开头用一个具体例子引入
    - 用简单语言解释复杂概念
    - 结尾给出实际建议
    字数：800-1000字""",
    expected_output="完整的文章",
    agent=writer,
    context=[analysis_task]  # 依赖 analysis_task 的输出
)

# ===== 组建团队并执行 =====

crew = Crew(
    agents=[researcher, analyst, writer],
    tasks=[research_task, analysis_task, writing_task],
    process=Process.sequential,  # 顺序执行（也可以 parallel）
    verbose=True
)

result = crew.kickoff(inputs={"topic": "2024年大模型技术进展"})
print(result)`,
          explanation: `
            <strong>CrewAI 的核心设计：</strong><br>
            • <strong>backstory</strong>：给 Agent 设定背景故事，影响它的"性格"和决策风格<br>
            • <strong>context</strong>：任务依赖，后一个任务自动获得前一个任务的输出<br>
            • <strong>allow_delegation</strong>：控制 Agent 是否可以把任务转给其他 Agent<br>
            • <strong>Process.sequential</strong>：顺序执行；<code>Process.hierarchical</code> 则有 Manager Agent 统筹
          `
        },
        {
          type: 'pitfalls',
          title: '⚠️ 常见坑点',
          items: [
            'Agent 角色设计太模糊：backstory 不清晰导致 Agent 行为不可预测——角色描述要具体',
            '任务依赖链太长：5+ 个任务串行，总时间很长——考虑哪些任务可以并行',
            'Token 消耗失控：每个 Agent 都有完整对话历史，多 Agent 系统 token 消耗是单 Agent 的 N 倍',
            '奉承行为：Agent 之间互相同意，不提出真正的异议——需要明确要求 Agent 批判性思考'
          ]
        },
        {
          type: 'quiz',
          q: 'CrewAI 中 Task 的 context 参数有什么作用？',
          opts: [
            '设置任务的优先级',
            '指定该任务依赖哪些前置任务，自动获取前置任务的输出作为输入',
            '设置任务的超时时间',
            '指定任务使用哪个工具'
          ],
          ans: 1,
          feedback_ok: '✅ 正确！context 建立了任务之间的依赖关系，让后续任务能自动获得前置任务的结果！',
          feedback_err: 'context 是 CrewAI 的任务编排核心——它告诉框架"这个任务需要等那个任务完成，并使用它的输出"！'
        }
      ]
    },

    // 🔴 地狱模式
    hell: {
      sections: [
        {
          type: 'story',
          html: `
            <div class="speaker">🔥 地狱模式 - 框架背后的设计哲学</div>
            <div class="chat-bubble robot" style="border-color:var(--red)">
              🤖 ARIA：船长，AutoGen 和 CrewAI 都很好用，<br>
              但它们背后有一个共同的问题：<br><br>
              <strong>多 Agent 系统的"奉承问题"（Sycophancy）</strong><br><br>
              当 AI 用户 Agent 提出一个方案，AI 助手 Agent 会倾向于同意——<br>
              即使方案有明显问题！<br><br>
              这就是为什么我们的帝国篇需要"门下省"（审核 Agent）！
            </div>
          `
        },
        {
          type: 'concept',
          title: '🔬 AutoGen 的对话协议深度解析',
          html: `
            <div style="margin:14px 0;padding:14px;background:rgba(0,229,255,.06);border-radius:12px;font-size:.9rem;line-height:1.9">
              <strong>AutoGen 的核心：GroupChat 协议</strong><br><br>

              <strong>消息路由策略：</strong><br>
              • <code>auto</code>：LLM 决定下一个发言的 Agent<br>
              • <code>round_robin</code>：轮流发言<br>
              • <code>random</code>：随机选择<br>
              • <code>custom</code>：自定义路由函数<br><br>

              <strong>终止条件：</strong><br>
              • 关键词检测（如"TERMINATE"）<br>
              • 最大轮次限制<br>
              • 自定义函数判断<br><br>

              <strong>人类介入（Human-in-the-loop）：</strong><br>
              • <code>human_input_mode="ALWAYS"</code>：每轮都询问人类<br>
              • <code>human_input_mode="TERMINATE"</code>：只在终止时询问<br>
              • <code>human_input_mode="NEVER"</code>：全自动
            </div>
          `
        },
        {
          type: 'code',
          title: '💻 AutoGen 高级用法：带审核的多 Agent 系统',
          code: `import autogen

config_list = [{"model": "claude-opus-4-6", "api_key": "..."}]
llm_config = {"config_list": config_list, "temperature": 0}

# ===== 定义 Agent =====

user_proxy = autogen.UserProxyAgent(
    name="用户",
    human_input_mode="TERMINATE",  # 只在结束时询问人类
    max_consecutive_auto_reply=10,
    code_execution_config={"work_dir": "workspace", "use_docker": False},
    is_termination_msg=lambda x: "TERMINATE" in x.get("content", "")
)

engineer = autogen.AssistantAgent(
    name="工程师",
    llm_config=llm_config,
    system_message="""你是一个 Python 工程师。
    完成任务后，在消息末尾加上 TERMINATE。
    如果需要审核员批准，等待审核结果再继续。"""
)

critic = autogen.AssistantAgent(
    name="审核员",
    llm_config=llm_config,
    system_message="""你是一个严格的代码审核员。
    你的职责是找出代码中的问题，而不是赞美。
    如果代码有问题，明确指出并要求修改。
    只有代码完全正确时，才说"审核通过"。"""
)

# ===== GroupChat：控制对话流程 =====

def custom_speaker_selection(last_speaker, groupchat):
    """自定义发言顺序：工程师 → 审核员 → 工程师（循环）"""
    messages = groupchat.messages
    if last_speaker is user_proxy:
        return engineer
    elif last_speaker is engineer:
        return critic
    elif last_speaker is critic:
        # 审核通过则结束，否则让工程师修改
        last_msg = messages[-1]["content"]
        if "审核通过" in last_msg:
            return user_proxy
        return engineer
    return engineer

groupchat = autogen.GroupChat(
    agents=[user_proxy, engineer, critic],
    messages=[],
    max_round=20,
    speaker_selection_method=custom_speaker_selection
)

manager = autogen.GroupChatManager(
    groupchat=groupchat,
    llm_config=llm_config
)

# ===== 启动对话 =====
user_proxy.initiate_chat(
    manager,
    message="写一个 Python 函数，计算斐波那契数列的第 n 项，要求有错误处理和测试"
)`,
          explanation: `
            <strong>关键设计：</strong><br>
            • <strong>custom_speaker_selection</strong>：自定义发言顺序，实现"工程师→审核→修改"循环<br>
            • <strong>审核员的 system_message</strong>：明确要求批判性思考，对抗奉承行为<br>
            • <strong>终止条件</strong>：审核通过才结束，防止低质量代码通过<br>
            • <strong>human_input_mode="TERMINATE"</strong>：最终由人类决定是否接受结果
          `
        },
        {
          type: 'concept',
          title: '📊 三大框架横向对比（2024）',
          html: `
            <div style="margin:14px 0;padding:14px;background:rgba(0,229,255,.06);border-radius:12px;font-size:.85rem;line-height:1.8">
              <strong>LangGraph（LangChain 出品）</strong><br>
              ✅ 最灵活的流程控制<br>
              ✅ Checkpointing 支持最好<br>
              ✅ 与 LangChain 生态无缝集成<br>
              ❌ 学习曲线最陡<br>
              ❌ 版本更新频繁<br><br>

              <strong>AutoGen（微软）</strong><br>
              ✅ 多 Agent 对话最自然<br>
              ✅ 代码执行能力强<br>
              ✅ Human-in-the-loop 设计最好<br>
              ❌ 对话流程控制较弱<br>
              ❌ 成本难以预测<br><br>

              <strong>CrewAI</strong><br>
              ✅ 角色分工最清晰<br>
              ✅ API 最简洁易用<br>
              ✅ 适合非技术用户理解<br>
              ❌ 相对较新，生态较小<br>
              ❌ 复杂流程控制能力弱<br><br>

              <strong>2024 年趋势：</strong><br>
              Anthropic 官方推荐：对于大多数场景，<br>
              直接用 Claude API + 简单的 Python 代码，<br>
              比引入框架更清晰、更可控。
            </div>
          `
        },
        {
          type: 'pitfalls',
          title: '⚠️ 多 Agent 框架的深层陷阱',
          items: [
            '奉承问题（Sycophancy）：Agent 之间互相同意，形成"回音室"——需要专门的批评者 Agent 和独立评估',
            '成本爆炸：3 个 Agent × 10 轮对话 × 每轮 2K token = 60K token，是单 Agent 的 30 倍',
            '调试地狱：多 Agent 对话中，一个 Agent 的错误会传播给所有 Agent——需要完整的对话日志',
            '框架版本地狱：AutoGen 0.2→0.4 是完全重写，CrewAI 也有多次 breaking changes——生产环境锁定版本',
            '过度工程化：很多用单 Agent 就能解决的问题，被强行拆成多 Agent——增加复杂度但没有收益'
          ]
        },
        {
          type: 'quiz',
          q: '为什么在 AutoGen 的多 Agent 系统中，需要专门设计一个"批评者 Agent"？',
          opts: [
            '因为批评者 Agent 运行更快',
            '对抗 AI 的奉承行为——没有批评者时，Agent 之间会互相同意，即使方案有明显问题',
            '因为框架要求必须有批评者',
            '批评者 Agent 可以减少 token 消耗'
          ],
          ans: 1,
          feedback_ok: '🔥 完美！这是多 Agent 系统设计的核心洞察。LLM 天然倾向于同意对方（奉承行为），在多 Agent 系统中这会被放大。专门的批评者 Agent 打破这个循环，确保质量！',
          feedback_err: '奉承行为（Sycophancy）是多 Agent 系统的核心挑战。当 AI 用户提出方案，AI 助手会倾向于同意——即使方案有问题。批评者 Agent 的职责就是打破这个"互相吹捧"的循环！'
        }
      ]
    }
  }
});
