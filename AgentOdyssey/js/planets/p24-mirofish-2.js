// 关卡 24：MiroFish 系列 2 - Agent 人格星（完整互动版）

PLANETS.push({
  id: 'p24',
  icon: '🎭',
  num: '星球 24',
  name: 'MiroFish 2：Agent 人格',
  desc: '学习如何让 AI Agent 拥有真实的人格和记忆！',

  difficulties: {
    // 🟢 简单模式
    easy: {
      sections: [
        {
          type: 'story',
          html: `
            <div class="speaker">🎭 Agent 人格星</div>
            <p>飞船降落在一个充满面具的星球——这里是人格的世界！</p>
            <div class="chat-bubble robot">
              🤖 ARIA：船长！欢迎来到 MiroFish 系列的第二关。<br>
              今天我们要学习最神奇的部分——<strong>如何让 AI 有"灵魂"</strong>！
            </div>
            <div class="chat-bubble">
              👦 你：AI 也能有灵魂？
            </div>
            <div class="chat-bubble robot">
              🤖 ARIA：当然！让我给你讲个故事。<br><br>

              想象你是一个导演，要让演员扮演"张三"这个角色。<br>
              你会怎么做？<br><br>

              <strong>方法 1（失败）</strong>：告诉演员"你叫张三"。<br>
              → 演员演得很假，观众一眼看穿。<br><br>

              <strong>方法 2（成功）</strong>：给演员一份详细的人物小传：<br>
              • 张三，35 岁，北京大学教授<br>
              • 性格：严谨、理想主义、有点固执<br>
              • 经历：从农村考上大学，一路奋斗<br>
              • 价值观：相信教育能改变命运<br>
              • 说话风格：喜欢引用名言，语速较慢<br><br>

              → 演员有了"灵魂"，演得活灵活现！
            </div>
          `
        },
        {
          type: 'concept',
          title: '🎭 什么是 Agent 人格？',
          html: `
            <div style="margin:14px 0;padding:14px;background:rgba(0,229,255,.06);border-radius:12px">
              <strong>Agent 人格 = 身份 + 性格 + 记忆 + 行为模式</strong><br><br>

              <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:12px">
                <div style="background:rgba(0,229,255,.08);border:1px solid rgba(0,229,255,.2);border-radius:10px;padding:12px">
                  <strong style="color:var(--cyan)">🆔 身份（Identity）</strong>
                  <p style="font-size:.85rem;color:var(--muted);margin-top:8px;line-height:1.7">
                    • 姓名、年龄、职业<br>
                    • 教育背景、家庭状况<br>
                    • 社会角色、地位
                  </p>
                </div>
                <div style="background:rgba(168,85,247,.08);border:1px solid rgba(168,85,247,.2);border-radius:10px;padding:12px">
                  <strong style="color:var(--purple)">💭 性格（Personality）</strong>
                  <p style="font-size:.85rem;color:var(--muted);margin-top:8px;line-height:1.7">
                    • MBTI 类型（如 INTJ）<br>
                    • 情感倾向（乐观/悲观）<br>
                    • 价值观、信念
                  </p>
                </div>
                <div style="background:rgba(34,197,94,.08);border:1px solid rgba(34,197,94,.2);border-radius:10px;padding:12px">
                  <strong style="color:var(--green)">🧠 记忆（Memory）</strong>
                  <p style="font-size:.85rem;color:var(--muted);margin-top:8px;line-height:1.7">
                    • 过去的经历<br>
                    • 重要的事件<br>
                    • 人际关系
                  </p>
                </div>
                <div style="background:rgba(251,191,36,.08);border:1px solid rgba(251,191,36,.2);border-radius:10px;padding:12px">
                  <strong style="color:var(--yellow)">🎬 行为（Behavior）</strong>
                  <p style="font-size:.85rem;color:var(--muted);margin-top:8px;line-height:1.7">
                    • 说话风格<br>
                    • 决策模式<br>
                    • 社交习惯
                  </p>
                </div>
              </div>
            </div>

            <div style="margin-top:14px;padding:12px;background:rgba(251,191,36,.08);border-left:3px solid var(--yellow);border-radius:8px;font-size:.9rem">
              💡 <strong>为什么需要人格？</strong><br>
              没有人格的 Agent 就像没有灵魂的机器人——<br>
              它的回答虽然正确，但缺少"人味"，用户感觉不到真实感！
            </div>
          `
        },
        {
          type: 'concept',
          title: '🎯 好人格 vs 坏人格',
          html: `
            <div style="margin:14px 0">
              <div style="background:rgba(239,68,68,.08);border:1px solid rgba(239,68,68,.2);border-radius:10px;padding:14px;margin-bottom:12px">
                <strong style="color:var(--red)">❌ 坏人格（不一致、不可信）</strong>
                <p style="font-size:.85rem;color:var(--muted);margin-top:8px;line-height:1.8">
                  <strong>示例：</strong>张三教授<br>
                  • 第 1 次对话："我是严谨的学者，不喜欢网络流行语。"<br>
                  • 第 2 次对话："哈哈哈，这个梗太好笑了！666！"<br>
                  • <strong>问题</strong>：前后矛盾，用户感觉"人设崩了"
                </p>
              </div>

              <div style="background:rgba(34,197,94,.08);border:1px solid rgba(34,197,94,.2);border-radius:10px;padding:14px">
                <strong style="color:var(--green)">✅ 好人格（一致、可信）</strong>
                <p style="font-size:.85rem;color:var(--muted);margin-top:8px;line-height:1.8">
                  <strong>示例：</strong>张三教授<br>
                  • 第 1 次对话："作为学者，我认为应该用严谨的态度对待知识。"<br>
                  • 第 2 次对话："这个现象很有趣，让我想起了康德的一句话..."<br>
                  • <strong>优点</strong>：始终保持学者风格，引用名言，语气严谨
                </p>
              </div>
            </div>
          `
        },
        {
          type: 'quiz',
          q: '如果要让 Agent 扮演一个"乐观的创业者"，下面哪个回答最符合人设？',
          opts: [
            '"这个项目失败了，我很沮丧。"',
            '"虽然这次失败了，但我学到了很多！下次一定能成功！"',
            '"失败就是失败，没什么好说的。"',
            '"我不想谈这个话题。"'
          ],
          ans: 1,
          feedback_ok: '🎯 正确！乐观的创业者会从失败中看到机会，保持积极的态度！这就是人格一致性！',
          feedback_err: '乐观的创业者应该保持积极态度，即使失败也能看到希望。人格要前后一致！'
        }
      ]
    },

    // 🟡 困难模式
    hard: {
      sections: [
        {
          type: 'story',
          html: `
            <div class="speaker">🎭 Agent 人格星（技术版）</div>
            <div class="chat-bubble robot">
              🤖 ARIA：船长！现在让我们看看 MiroFish 是如何生成 Agent 人设的。<br>
              核心流程：<strong>实体信息 → Zep 检索 → LLM 生成人设 → OASIS Profile</strong>！
            </div>
          `
        },
        {
          type: 'concept',
          title: '📐 MiroFish 的 Agent Profile 结构',
          html: `
            <div style="margin:14px 0;padding:14px;background:rgba(0,229,255,.06);border-radius:12px;font-size:.9rem;line-height:1.9">
              <strong>OASIS Profile = 基础信息 + 详细人设 + 社交数据</strong><br><br>

              <strong>基础信息：</strong><br>
              • user_id：唯一标识<br>
              • user_name：用户名（如 @zhangsan）<br>
              • name：真实姓名<br>
              • bio：简介（一句话）<br><br>

              <strong>详细人设（persona）：</strong><br>
              • 年龄、性别、职业<br>
              • MBTI 类型<br>
              • 兴趣爱好<br>
              • 价值观、立场<br>
              • 说话风格<br><br>

              <strong>社交数据：</strong><br>
              • follower_count：粉丝数<br>
              • friend_count：关注数<br>
              • statuses_count：发帖数<br>
              • karma：声望值（Reddit）
            </div>
          `
        },
        {
          type: 'code',
          title: '💻 Agent Profile 数据结构',
          code: `from dataclasses import dataclass
from typing import Optional, List

@dataclass
class OasisAgentProfile:
    # 基础信息
    user_id: int
    user_name: str  # @zhangsan
    name: str       # 张三
    bio: str        # "北京大学教授，AI 研究者"

    # 详细人设（这是核心！）
    persona: str    # 多段落的详细描述

    # 社交数据
    follower_count: int = 150
    friend_count: int = 100
    statuses_count: int = 500
    karma: int = 1000  # Reddit 专用

    # 人设属性（可选）
    age: Optional[int] = None
    gender: Optional[str] = None
    mbti: Optional[str] = None  # INTJ, ENFP, etc.
    country: Optional[str] = None
    profession: Optional[str] = None
    interested_topics: List[str] = None

    # 来源信息
    source_entity_uuid: Optional[str] = None
    source_entity_type: Optional[str] = None


# 示例：张三教授的 Profile
zhang_san = OasisAgentProfile(
    user_id=1,
    user_name="@prof_zhang",
    name="张三",
    bio="北京大学 AI 教授 | 理想主义者 | 相信教育改变命运",

    persona="""
张三，35 岁，北京大学人工智能系教授。

**背景：**
出生于河南农村，通过高考改变命运，一路从本科读到博士。
深知教育的重要性，对学生要求严格但充满关怀。

**性格：**
INTJ 类型，理性、严谨、有远见。
理想主义者，相信技术能让世界更美好。
有点固执，一旦认定的事情很难改变。

**价值观：**
• 教育公平是社会进步的基石
• 科研应该服务于人类福祉
• 反对学术不端和急功近利

**说话风格：**
• 喜欢引用名言和学术观点
• 语速较慢，用词精准
• 很少使用网络流行语
• 会用"我认为"、"从学术角度看"等表达

**社交习惯：**
• 主要发布学术相关内容
• 偶尔分享教育观点
• 不参与娱乐八卦讨论
• 对学生的问题会认真回复
    """,

    age=35,
    gender="男",
    mbti="INTJ",
    country="中国",
    profession="大学教授",
    interested_topics=["人工智能", "教育", "学术伦理"],

    follower_count=5000,  # 学术圈有一定影响力
    friend_count=300,
    statuses_count=1200,
    karma=8000
)`,
          explanation: `
            <strong>关键设计：</strong><br>
            • <strong>persona 字段</strong>：这是最重要的！包含完整的人物小传<br>
            • <strong>多维度描述</strong>：背景、性格、价值观、说话风格、社交习惯<br>
            • <strong>MBTI</strong>：用成熟的人格模型，保证一致性<br>
            • <strong>社交数据</strong>：影响 Agent 在模拟中的"权重"
          `
        },
        {
          type: 'challenge',
          title: '🎯 实战挑战：设计一个 Agent 人设',
          task: '请为"李四"（一个 25 岁的互联网创业者）设计完整的 persona。要求包含：背景、性格、价值观、说话风格！',
          starter_code: `const li_si_persona = \`
李四，25 岁，互联网创业者。

**背景：**
// TODO: 填写背景（出生地、教育、创业经历）


**性格：**
// TODO: 填写性格（MBTI、特点）


**价值观：**
// TODO: 填写价值观（3-5 条）


**说话风格：**
// TODO: 填写说话风格（用词、语气）

\`;

console.log(li_si_persona);`,
          hints: [
            '创业者通常乐观、冒险、行动力强',
            '可以参考 ENFP 或 ENTP 类型',
            '说话风格可能更口语化、喜欢用"我觉得"、"试试看"'
          ]
        },
        {
          type: 'concept',
          title: '🔄 人设生成流程',
          html: `
            <div style="margin:14px 0;padding:14px;background:rgba(0,229,255,.06);border-radius:12px;font-size:.9rem;line-height:1.9">
              <strong>MiroFish 的人设生成分 3 步：</strong><br><br>

              <strong>Step 1: 从知识图谱获取实体信息</strong><br>
              • 实体名称：张三<br>
              • 实体类型：Person<br>
              • 属性：age=35, profession="教授"<br>
              • 关系：WORKS_AT → 北京大学<br><br>

              <strong>Step 2: 用 Zep 检索丰富信息</strong><br>
              • 查询："张三的详细信息"<br>
              • 返回：所有提到张三的文本片段<br>
              • 目的：获取更多上下文<br><br>

              <strong>Step 3: 用 LLM 生成详细人设</strong><br>
              • Prompt：基于实体信息 + 检索结果，生成完整 persona<br>
              • 要求：包含背景、性格、价值观、说话风格<br>
              • 输出：结构化的人设文本
            </div>
          `
        },
        {
          type: 'code',
          title: '💻 人设生成实现',
          code: `async function generatePersona(entity, graph_id):
    """
    为单个实体生成详细人设

    Args:
        entity: 实体信息（从知识图谱获取）
        graph_id: 图谱 ID（用于检索）

    Returns:
        完整的 OasisAgentProfile
    """
    # Step 1: 从实体获取基础信息
    name = entity.name
    entity_type = entity.get_entity_type()
    attributes = entity.attributes

    # Step 2: 用 Zep 检索相关信息
    search_query = f"{name}的详细信息、背景、性格、观点"
    search_results = zep.memory.search(
        graph_id=graph_id,
        query=search_query,
        limit=10
    )

    # 整理检索结果
    context = "\\n".join([r.content for r in search_results])

    # Step 3: 用 LLM 生成人设
    prompt = f"""你是一个专业的角色设计师。请基于以下信息，为"{name}"生成一个非常详细的人设。

**实体信息：**
- 姓名：{name}
- 类型：{entity_type}
- 属性：{attributes}

**相关上下文：**
{context}

**要求：**
1. 生成的人设必须符合社交媒体用户的特点（能发帖、评论、互动）
2. 包含以下维度：
   - 背景（年龄、职业、教育、经历）
   - 性格（MBTI 类型、特点）
   - 价值观（3-5 条核心信念）
   - 说话风格（用词、语气、习惯）
   - 社交习惯（发帖频率、互动方式）
3. 人设要具体、生动、有细节
4. 保持一致性，避免矛盾

**输出格式：**
\`\`\`
\${name}，[年龄]，[职业]。

**背景：**
[详细背景]

**性格：**
[MBTI + 详细描述]

**价值观：**
• [价值观 1]
• [价值观 2]
...

**说话风格：**
• [特点 1]
• [特点 2]
...

**社交习惯：**
• [习惯 1]
• [习惯 2]
...
\`\`\`
"""

    response = llm.generate(prompt)
    persona_text = response.text

    # Step 4: 构建 Profile
    profile = OasisAgentProfile(
        user_id=entity.user_id,
        user_name=f"@{name.lower().replace(' ', '_')}",
        name=name,
        bio=extract_bio(persona_text),  # 从 persona 提取一句话简介
        persona=persona_text,

        # 从属性提取
        age=attributes.get("age"),
        gender=attributes.get("gender"),
        profession=attributes.get("profession"),

        # 社交数据（根据实体类型设置）
        follower_count=calculate_followers(entity_type),
        friend_count=calculate_friends(entity_type),
        statuses_count=500,
        karma=1000,

        # 来源信息
        source_entity_uuid=entity.uuid,
        source_entity_type=entity_type
    )

    return profile`,
          explanation: `
            <strong>关键技巧：</strong><br>
            • <strong>Zep 检索</strong>：不只用实体本身的信息，还检索所有相关文本<br>
            • <strong>详细 Prompt</strong>：明确要求输出格式和维度，保证质量<br>
            • <strong>社交数据计算</strong>：根据实体类型（教授 vs 学生）设置不同的粉丝数<br>
            • <strong>一致性检查</strong>：生成后可以用另一个 LLM 检查是否有矛盾
          `
        },
        {
          type: 'sandbox',
          title: '🧪 沙盒实验：调整人格参数',
          description: '调整 Agent 的性格参数，观察它在模拟中的行为变化。目标：让 Agent 发帖数超过 20！',
          params: [
            { name: 'extraversion', min: 0, max: 1, step: 0.1, default: 0.5 },
            { name: 'agreeableness', min: 0, max: 1, step: 0.1, default: 0.5 },
            { name: 'openness', min: 0, max: 1, step: 0.1, default: 0.5 }
          ],
          goal: '找到最优人格参数，让 Agent 既活跃又不失真实感'
        },
        {
          type: 'concept',
          title: '🧠 长期记忆系统',
          html: `
            <div style="margin:14px 0;padding:14px;background:rgba(0,229,255,.06);border-radius:12px;font-size:.9rem;line-height:1.9">
              <strong>MiroFish 的记忆系统 = 静态人设 + 动态记忆</strong><br><br>

              <strong>静态人设（不变）：</strong><br>
              • 背景、性格、价值观<br>
              • 在模拟开始前生成<br>
              • 整个模拟过程中保持不变<br><br>

              <strong>动态记忆（更新）：</strong><br>
              • Agent 在模拟中的活动<br>
              • 发帖、评论、点赞、关注<br>
              • 实时更新到 Zep 图谱<br><br>

              <strong>为什么需要动态记忆？</strong><br>
              • Agent 需要"记住"自己做过什么<br>
              • 避免重复发相同的帖子<br>
              • 保持行为的连贯性
            </div>
          `
        },
        {
          type: 'code',
          title: '💻 动态记忆更新',
          code: `# Agent 活动 → 自然语言 → Zep 图谱

def update_agent_memory(agent_id, action, graph_id):
    """
    将 Agent 的活动更新到记忆系统

    Args:
        agent_id: Agent ID
        action: 活动信息（发帖、评论等）
        graph_id: 图谱 ID
    """
    # 将活动转换为自然语言
    episode_text = action_to_text(action)

    # 添加到 Zep 图谱
    zep.graph.episodes.add(
        graph_id=graph_id,
        episodes=[{
            "content": episode_text,
            "metadata": {
                "agent_id": agent_id,
                "action_type": action.type,
                "timestamp": action.timestamp
            }
        }]
    )


def action_to_text(action):
    """将 Agent 活动转换为自然语言描述"""
    if action.type == "CREATE_POST":
        return f"{action.agent_name}: 发布了一条帖子：「{action.content}」"

    elif action.type == "LIKE_POST":
        return f"{action.agent_name}: 点赞了 {action.target_name} 的帖子"

    elif action.type == "COMMENT":
        return f"{action.agent_name}: 评论了 {action.target_name} 的帖子：「{action.content}」"

    elif action.type == "FOLLOW":
        return f"{action.agent_name}: 关注了 {action.target_name}"

    return f"{action.agent_name}: 执行了 {action.type}"


# 示例：张三发了一条帖子
action = AgentAction(
    agent_id=1,
    agent_name="张三",
    type="CREATE_POST",
    content="今天的 AI 课程很精彩，学生们提出了很多好问题。",
    timestamp="2024-03-25 10:30:00"
)

update_agent_memory(1, action, graph_id="武汉大学舆情")

# Zep 图谱中会新增一条记忆：
# "张三: 发布了一条帖子：「今天的 AI 课程很精彩，学生们提出了很多好问题。」"`,
          explanation: `
            <strong>动态记忆的作用：</strong><br>
            • <strong>行为连贯性</strong>：Agent 下次发帖时会参考之前的内容<br>
            • <strong>避免重复</strong>：不会连续发 10 条相同的帖子<br>
            • <strong>关系演化</strong>：记住谁关注了谁、谁和谁互动过<br>
            • <strong>时序分析</strong>：可以回溯"某个时间点 Agent 在做什么"
          `
        },
        {
          type: 'pitfalls',
          title: '⚠️ 常见坑点',
          items: [
            '人设太简单：只有"张三，35 岁，教授"，缺少性格和说话风格，导致 Agent 行为不真实',
            '人设矛盾：说"我是内向的人"，但行为却很外向（频繁发帖、到处评论）',
            '记忆爆炸：每个 Agent 的记忆越来越多，检索变慢——需要定期清理或分层存储',
            '人格漂移：Agent 在长时间模拟后"人设崩了"，说话风格变了——需要定期用原始 persona 校准',
            '社交数据不合理：一个普通学生有 10 万粉丝——需要根据实体类型设置合理的社交数据'
          ]
        },
        {
          type: 'quiz',
          q: 'MiroFish 为什么要把 Agent 的活动转换成自然语言再存入 Zep？',
          opts: [
            '因为 Zep 只支持文本格式',
            '自然语言更容易被 LLM 理解和检索，Agent 下次行动时能参考之前的记忆',
            '因为自然语言占用空间更小',
            '因为自然语言更好看'
          ],
          ans: 1,
          feedback_ok: '✅ 正确！自然语言是 LLM 的"母语"。当 Agent 下次要发帖时，LLM 会检索记忆，看到"我之前发过类似的内容"，就会避免重复！',
          feedback_err: '想象一下：如果记忆是 JSON 格式 {"action": "post", "content": "..."}，LLM 很难理解。但如果是"张三发布了一条帖子：..."，LLM 一眼就懂！'
        }
      ]
    },

    // 🔴 地狱模式
    hell: {
      sections: [
        {
          type: 'story',
          html: `
            <div class="speaker">🔥 地狱模式 - Generative Agents 论文</div>
            <div class="chat-bubble robot" style="border-color:var(--red)">
              🤖 ARIA：船长，准备好了吗？<br>
              我们要深入 Agent 人格的核心——<br>
              <strong>斯坦福 2023 年的革命性论文</strong>！<br><br>

              这篇论文创造了 25 个 AI Agent，<br>
              让它们在一个虚拟小镇里生活、工作、社交——<br>
              <strong>它们展现出了惊人的"人性"</strong>！<br><br>

              有 Agent 自发组织了情人节派对，<br>
              有 Agent 因为失恋而伤心，<br>
              有 Agent 竞选市长并拉票...<br><br>

              这一切都没有预先编程，完全是涌现出来的！
            </div>
          `
        },
        {
          type: 'concept',
          title: '📄 论文核心：记忆、规划、反思',
          html: `
            <div style="margin:14px 0;padding:14px;background:rgba(0,229,255,.06);border-radius:12px;font-size:.9rem;line-height:1.9">
              <strong>论文信息：</strong><br>
              • 标题：Generative Agents: Interactive Simulacra of Human Behavior<br>
              • 作者：Stanford University（2023）<br>
              • 核心贡献：提出 Agent 的三层架构——记忆、规划、反思<br><br>

              <strong>传统 Agent 的问题：</strong><br>
              • 只有短期记忆（Context Window）<br>
              • 没有长期规划能力<br>
              • 不会从经验中学习<br>
              • 行为缺少连贯性<br><br>

              <strong>Generative Agents 的创新：</strong><br>
              • <strong>记忆流（Memory Stream）</strong>：记录所有经历<br>
              • <strong>规划（Planning）</strong>：制定长期计划<br>
              • <strong>反思（Reflection）</strong>：从经历中提炼洞察<br>
              • <strong>检索（Retrieval）</strong>：根据相关性、重要性、时效性检索记忆
            </div>
          `
        },
        {
          type: 'concept',
          title: '🧠 三层架构详解',
          html: `
            <div style="margin:14px 0;padding:14px;background:rgba(0,229,255,.06);border-radius:12px;font-size:.9rem;line-height:1.9">
              <strong>1. 记忆流（Memory Stream）</strong><br>
              • 记录 Agent 的所有观察和行动<br>
              • 每条记忆有：内容、时间戳、重要性评分<br>
              • 示例："张三在咖啡馆遇到了李四，他们讨论了 AI 伦理问题。"<br><br>

              <strong>2. 规划（Planning）</strong><br>
              • Agent 会制定一天的计划<br>
              • 计划会根据新情况动态调整<br>
              • 示例：早上 8 点起床 → 9 点去实验室 → 12 点吃午饭 → ...<br><br>

              <strong>3. 反思（Reflection）</strong><br>
              • 定期（如每 100 条记忆）进行反思<br>
              • 从具体经历中提炼抽象洞察<br>
              • 示例：从"多次和李四讨论 AI"反思出"李四是我的学术伙伴"<br><br>

              <strong>4. 检索（Retrieval）</strong><br>
              • 根据当前情境检索相关记忆<br>
              • 评分 = 相关性 × 重要性 × 时效性<br>
              • 只检索最相关的 Top-K 条记忆
            </div>
          `
        },
        {
          type: 'code',
          title: '💻 Generative Agents 的记忆检索算法',
          code: `# 论文中的记忆检索算法

def retrieve_memories(query, memory_stream, k=10):
    """
    检索最相关的 k 条记忆

    Args:
        query: 当前情境（如"张三遇到了李四"）
        memory_stream: 所有记忆
        k: 返回 Top-K

    Returns:
        最相关的 k 条记忆
    """
    scored_memories = []

    for memory in memory_stream:
        # 1. 相关性（Relevance）：语义相似度
        relevance = cosine_similarity(
            embed(query),
            embed(memory.content)
        )

        # 2. 重要性（Importance）：记忆创建时的评分
        importance = memory.importance_score  # 1-10

        # 3. 时效性（Recency）：时间衰减
        hours_ago = (now() - memory.timestamp).hours
        recency = 0.99 ** hours_ago  # 指数衰减

        # 综合评分
        score = relevance * importance * recency

        scored_memories.append((memory, score))

    # 返回 Top-K
    scored_memories.sort(key=lambda x: x[1], reverse=True)
    return [m for m, s in scored_memories[:k]]


# 示例：张三要决定是否参加派对
query = "张三收到了派对邀请，他应该去吗？"

relevant_memories = retrieve_memories(query, zhang_san_memories)

# 可能检索到：
# - "张三是内向的人，不喜欢热闹的场合"（高相关性、高重要性）
# - "上次派对张三感觉很不自在"（高相关性、中等时效性）
# - "李四也会参加这个派对"（中等相关性、高时效性）

# 基于这些记忆，LLM 决定：张三可能不会去`,
          explanation: `
            <strong>检索算法的精妙之处：</strong><br>
            • <strong>相关性</strong>：确保检索到的记忆和当前情境有关<br>
            • <strong>重要性</strong>：重要的记忆（如"我是内向的人"）权重更高<br>
            • <strong>时效性</strong>：最近的记忆更重要（昨天的经历 > 一年前的）<br>
            • <strong>三者相乘</strong>：平衡长期特质和短期经历
          `
        },
        {
          type: 'code',
          title: '💻 反思机制实现',
          code: `# 论文中的反思机制

def reflect(memory_stream, threshold=100):
    """
    当记忆达到阈值时，进行反思

    Args:
        memory_stream: 所有记忆
        threshold: 触发反思的记忆数量

    Returns:
        反思得出的高层洞察
    """
    if len(memory_stream) < threshold:
        return []

    # 获取最近的记忆
    recent_memories = memory_stream[-threshold:]

    # 用 LLM 提炼洞察
    prompt = f"""基于以下记忆，提炼出 3-5 条高层洞察。

**记忆：**
{format_memories(recent_memories)}

**要求：**
1. 洞察应该是抽象的、概括性的
2. 从具体事件中提炼出模式和规律
3. 每条洞察用一句话表达

**示例：**
- 从"多次和李四讨论 AI"提炼出"李四是我的学术伙伴"
- 从"每次派对都感觉不自在"提炼出"我不适合大型社交场合"

**输出格式：**
1. [洞察 1]
2. [洞察 2]
...
"""

    response = llm.generate(prompt)
    insights = parse_insights(response.text)

    # 将洞察作为新的记忆添加到记忆流
    for insight in insights:
        memory_stream.append(Memory(
            content=insight,
            timestamp=now(),
            importance_score=8,  # 反思得出的洞察很重要
            type="reflection"
        ))

    return insights


# 示例：张三的反思
zhang_san_memories = [
    "张三和李四讨论了 AI 伦理",
    "张三和李四一起写论文",
    "张三邀请李四参加研讨会",
    "张三和李四在咖啡馆聊天",
    # ... 100 条记忆
]

insights = reflect(zhang_san_memories)

# 可能得出的洞察：
# 1. "李四是我最重要的学术合作伙伴"
# 2. "我和李四在 AI 伦理方面有共同兴趣"
# 3. "我倾向于和李四进行深度讨论而不是闲聊"`,
          explanation: `
            <strong>反思的作用：</strong><br>
            • <strong>压缩记忆</strong>：100 条具体记忆 → 3 条抽象洞察<br>
            • <strong>提升效率</strong>：下次检索时，洞察的权重更高<br>
            • <strong>形成人格</strong>：长期的反思塑造了 Agent 的"世界观"<br>
            • <strong>避免遗忘</strong>：重要的模式被提炼成洞察，不会被遗忘
          `
        },
        {
          type: 'concept',
          title: '🏗️ MiroFish vs Generative Agents',
          html: `
            <div style="margin:14px 0;padding:14px;background:rgba(0,229,255,.06);border-radius:12px;font-size:.9rem;line-height:1.9">
              <strong>MiroFish 在论文基础上的简化和优化：</strong><br><br>

              <strong>1. 记忆系统</strong><br>
              • 论文：自己实现记忆流、检索、反思<br>
              • MiroFish：用 Zep Cloud 的 GraphRAG，自动处理检索和去重<br>
              • 优势：开发成本低，性能更好<br><br>

              <strong>2. 规划系统</strong><br>
              • 论文：Agent 每天制定详细计划<br>
              • MiroFish：用活动配置（activity_level、posts_per_hour）简化<br>
              • 优势：更适合社交媒体场景（不需要"8 点起床"这种细节）<br><br>

              <strong>3. 反思机制</strong><br>
              • 论文：每 100 条记忆触发反思<br>
              • MiroFish：暂未实现（未来可以加入）<br>
              • 原因：社交媒体模拟周期短（几十轮），反思的收益不大<br><br>

              <strong>4. 人格一致性</strong><br>
              • 论文：依赖记忆检索保证一致性<br>
              • MiroFish：用详细的 persona + 定期校准<br>
              • 优势：更直接，避免"人设漂移"
            </div>
          `
        },
        {
          type: 'pitfalls',
          title: '⚠️ 生产级人格系统的深层陷阱',
          items: [
            '记忆检索的冷启动问题：新 Agent 没有记忆，行为不稳定——需要用 persona 作为"种子记忆"',
            '反思的计算成本：每 100 条记忆调用一次 LLM，成本很高——需要异步处理或降低频率',
            '人格漂移（Personality Drift）：长时间模拟后，Agent 的行为偏离原始人设——需要定期用 persona 重新校准',
            '记忆冲突：新记忆和旧记忆矛盾（"我讨厌派对" vs "我参加了派对"）——需要冲突检测和解决机制',
            '社交网络效应：Agent 的行为受其他 Agent 影响，可能导致"群体极化"——需要监控和干预',
            '评估困难：如何量化"人格一致性"？没有标准答案——需要人工评估 + 自动化指标'
          ]
        },
        {
          type: 'quiz',
          q: 'Generative Agents 论文的核心创新是什么？',
          opts: [
            '用 LLM 生成 Agent',
            '提出记忆流 + 规划 + 反思的三层架构，让 Agent 有长期记忆和学习能力',
            '让 Agent 能在虚拟世界生活',
            '用向量数据库存储记忆'
          ],
          ans: 1,
          feedback_ok: '🔥 完美！三层架构是论文的灵魂。记忆流让 Agent 记住经历，规划让 Agent 有目标，反思让 Agent 从经验中学习——这三者结合，Agent 才真正"活"了起来！',
          feedback_err: '论文的核心是"记忆 + 规划 + 反思"。想象一个人：记忆是过去，规划是未来，反思是从过去学习以指导未来。三者缺一不可！'
        }
      ]
    }
  }
});

