// 关卡 23：MiroFish 系列 1 - 知识图谱星（完整互动版）

PLANETS.push({
  id: 'p23',
  icon: '🕸️',
  num: '星球 23',
  name: 'MiroFish 1：知识图谱',
  desc: '学习如何用 GraphRAG 构建智能知识图谱！',

  difficulties: {
    // 🟢 简单模式
    easy: {
      sections: [
        {
          type: 'story',
          html: `
            <div class="speaker">🕸️ 知识图谱星</div>
            <p>飞船降落在一个被光网覆盖的星球——这里是知识图谱的世界！</p>
            <div class="chat-bubble robot">
              🤖 ARIA：船长！欢迎来到 <strong>MiroFish 系列</strong>的第一关！<br><br>

              在开始之前，让我先解释一下你即将学习的两个高级篇章：
            </div>
            <div class="chat-bubble">
              👦 你：两个篇章？
            </div>
            <div class="chat-bubble robot">
              🤖 ARIA：是的！你已经完成了基础篇和深度篇，甚至可能完成了帝国篇。<br>
              现在有两条高级路径供你选择：<br><br>

              <strong>🏛️ 帝国篇（P17-P21）：制度化的 Multi-Agent</strong><br>
              • 核心思想：<strong>让 Agent 按规矩办事</strong><br>
              • 特点：强控制、审核机制、权限矩阵<br>
              • 适用场景：企业级应用、需要可控性的系统<br>
              • 代表项目：EDICT（三省六部架构）<br><br>

              <strong>🐟 MiroFish 篇（P23-P25）：自由演化的 Multi-Agent</strong><br>
              • 核心思想：<strong>让 Agent 自由互动，观察涌现行为</strong><br>
              • 特点：群体智能、社交网络、舆论预测<br>
              • 适用场景：社会仿真、舆情分析、趋势预测<br>
              • 代表项目：MiroFish（群体智能预测引擎）<br><br>

              <strong>两者的本质区别：</strong><br>
              • 帝国篇：自上而下的控制（皇帝 → 大臣 → 执行）<br>
              • MiroFish 篇：自下而上的涌现（个体 → 互动 → 群体智能）
            </div>
            <div class="chat-bubble">
              👦 你：明白了！那我们现在学哪个？
            </div>
            <div class="chat-bubble robot">
              🤖 ARIA：我们现在学 MiroFish 篇！<br>
              今天的第一课是 MiroFish 的核心技术——<strong>GraphRAG</strong>！
            </div>
            <div class="chat-bubble">
              👦 你：GraphRAG？听起来很复杂...
            </div>
            <div class="chat-bubble robot">
              🤖 ARIA：别担心！让我先给你讲个故事。<br><br>

              想象你是一个图书馆管理员，面对 10 万本书。<br>
              有人问你："张三和李四是什么关系？"<br><br>

              <strong>传统方法</strong>：你要翻遍所有书，找到提到他们的地方。<br>
              <strong>GraphRAG 方法</strong>：你早就画了一张关系图，一眼就能看出来！
            </div>
          `
        },
        {
          type: 'concept',
          title: '🕸️ 什么是知识图谱？',
          html: `
            <div style="margin:14px 0;padding:14px;background:rgba(0,229,255,.06);border-radius:12px">
              <strong>知识图谱 = 实体 + 关系</strong><br><br>

              <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:12px">
                <div style="background:rgba(0,229,255,.08);border:1px solid rgba(0,229,255,.2);border-radius:10px;padding:12px">
                  <strong style="color:var(--cyan)">🔵 实体（Entity）</strong>
                  <p style="font-size:.85rem;color:var(--muted);margin-top:8px;line-height:1.7">
                    现实世界中的"东西"<br>
                    • 人物：张三、李四<br>
                    • 地点：北京、上海<br>
                    • 组织：北京大学<br>
                    • 概念：AI 研究
                  </p>
                </div>
                <div style="background:rgba(168,85,247,.08);border:1px solid rgba(168,85,247,.2);border-radius:10px;padding:12px">
                  <strong style="color:var(--purple)">🟣 关系（Relation）</strong>
                  <p style="font-size:.85rem;color:var(--muted);margin-top:8px;line-height:1.7">
                    实体之间的连接<br>
                    • 张三 → WORKS_AT → 北京大学<br>
                    • 张三 → KNOWS → 李四<br>
                    • 李四 → INTERESTED_IN → AI 研究
                  </p>
                </div>
              </div>
            </div>

            <div style="margin-top:14px;padding:12px;background:rgba(251,191,36,.08);border-left:3px solid var(--yellow);border-radius:8px;font-size:.9rem">
              💡 <strong>为什么叫"图"？</strong><br>
              因为画出来就像一张网：圆圈是实体，线是关系！
            </div>
          `
        },
        {
          type: 'concept',
          title: '🎯 GraphRAG vs 传统 RAG',
          html: `
            <div style="margin:14px 0">
              <div style="background:rgba(239,68,68,.08);border:1px solid rgba(239,68,68,.2);border-radius:10px;padding:14px;margin-bottom:12px">
                <strong style="color:var(--red)">❌ 传统 RAG（向量检索）</strong>
                <p style="font-size:.85rem;color:var(--muted);margin-top:8px;line-height:1.8">
                  • 把文本切成小块，转成向量<br>
                  • 搜索时找"相似"的文本块<br>
                  • <strong>问题</strong>：找不到"隐藏"的关系<br>
                  • 例如：问"张三的同事的老师是谁？"——传统 RAG 很难回答
                </p>
              </div>

              <div style="background:rgba(34,197,94,.08);border:1px solid rgba(34,197,94,.2);border-radius:10px;padding:14px">
                <strong style="color:var(--green)">✅ GraphRAG（图谱检索）</strong>
                <p style="font-size:.85rem;color:var(--muted);margin-top:8px;line-height:1.8">
                  • 提取实体和关系，构建知识图谱<br>
                  • 搜索时可以"跳跃"多层关系<br>
                  • <strong>优势</strong>：能回答复杂的关系问题<br>
                  • 例如：张三 → 同事 → 李四 → 老师 → 王五（3 跳就找到了！）
                </p>
              </div>
            </div>
          `
        },
        {
          type: 'quiz',
          q: '如果要回答"张三的朋友的老板是谁？"，哪种方法更合适？',
          opts: [
            '传统 RAG（向量检索）',
            'GraphRAG（知识图谱）',
            '直接问 ChatGPT',
            '用搜索引擎'
          ],
          ans: 1,
          feedback_ok: '🎯 正确！GraphRAG 可以沿着"张三→朋友→老板"这条关系链找到答案，传统 RAG 很难做到！',
          feedback_err: 'GraphRAG 的核心优势就是能处理多跳关系查询！想象一下在图谱上"走路"——从张三走到朋友，再走到老板。'
        }
      ]
    },

    // 🟡 困难模式
    hard: {
      sections: [
        {
          type: 'story',
          html: `
            <div class="speaker">🕸️ 知识图谱星（技术版）</div>
            <div class="chat-bubble robot">
              🤖 ARIA：船长！现在让我们看看 MiroFish 是如何构建知识图谱的。<br>
              核心流程只有 3 步：<strong>本体设计 → 文本分块 → 实体提取</strong>！
            </div>
          `
        },
        {
          type: 'concept',
          title: '📐 第 1 步：本体设计（Ontology）',
          html: `
            <div style="margin:14px 0;padding:14px;background:rgba(0,229,255,.06);border-radius:12px;font-size:.9rem;line-height:1.9">
              <strong>本体 = 实体类型 + 关系类型的定义</strong><br><br>

              就像建房子前要画设计图，构建图谱前要定义"允许哪些实体和关系"。<br><br>

              <strong>MiroFish 的本体约束：</strong><br>
              • 必须正好 10 个实体类型<br>
              • 实体必须是真实存在、能在社交媒体发声的主体<br>
              • 不能是抽象概念（❌"舆论"、"情绪"）<br>
              • 必须是具体的人/组织/地点（✅"张三"、"北京大学"）
            </div>

            <div style="margin-top:14px;padding:12px;background:rgba(251,191,36,.08);border-left:3px solid var(--yellow);border-radius:8px;font-size:.9rem">
              💡 <strong>为什么要约束？</strong><br>
              因为 MiroFish 要模拟社交媒体舆论——只有真实的人和组织才能发帖、评论！
            </div>
          `
        },
        {
          type: 'code',
          title: '💻 本体数据结构（MiroFish 真实代码）',
          code: `# MiroFish 的本体结构
ontology = {
    "entity_types": [
        {
            "name": "Person",
            "description": "具体的个人（公众人物、当事人、意见领袖）",
            "attributes": [
                {"name": "age", "type": "int"},
                {"name": "profession", "type": "text"},
                {"name": "stance", "type": "text"}
            ],
            "examples": ["张三", "李四", "王教授"]
        },
        {
            "name": "Organization",
            "description": "组织机构（公司、学校、政府部门）",
            "attributes": [
                {"name": "type", "type": "text"},
                {"name": "location", "type": "text"}
            ],
            "examples": ["北京大学", "某科技公司"]
        }
        # ... 还有 8 个实体类型
    ],
    "edge_types": [
        {
            "name": "WORKS_AT",
            "description": "工作关系",
            "source_targets": [
                {"source": "Person", "target": "Organization"}
            ]
        },
        {
            "name": "KNOWS",
            "description": "认识关系",
            "source_targets": [
                {"source": "Person", "target": "Person"}
            ]
        }
        # ... 更多关系类型
    ]
}`,
          explanation: `
            <strong>关键设计：</strong><br>
            • <strong>attributes</strong>：每个实体可以有属性（年龄、职业等）<br>
            • <strong>examples</strong>：给 LLM 提供示例，提高提取准确率<br>
            • <strong>source_targets</strong>：约束哪些实体之间可以有哪些关系<br>
            • <strong>MiroFish 用 LLM 自动生成本体</strong>：分析文档内容后自动设计
          `
        },
        {
          type: 'concept',
          title: '✂️ 第 2 步：文本分块（Chunking）',
          html: `
            <div style="margin:14px 0;padding:14px;background:rgba(0,229,255,.06);border-radius:12px;font-size:.9rem;line-height:1.9">
              <strong>为什么要分块？</strong><br>
              • LLM 有 Context Window 限制（如 128K tokens）<br>
              • 长文本一次性处理容易漏掉信息<br>
              • 分块后可以并行处理，提高速度<br><br>

              <strong>MiroFish 的分块策略：</strong><br>
              • <code>chunk_size = 500</code> 字符<br>
              • <code>overlap = 50</code> 字符（块之间有重叠）<br>
              • 重叠的目的：避免实体被"切断"
            </div>

            <div style="margin-top:14px;padding:12px;background:rgba(239,68,68,.08);border-left:3px solid var(--red);border-radius:8px;font-size:.9rem">
              ⚠️ <strong>常见错误：</strong><br>
              chunk_size 太大 → 超出 Context Window<br>
              chunk_size 太小 → 丢失上下文信息<br>
              没有 overlap → 跨块的实体被切断
            </div>
          `
        },
        {
          type: 'code',
          title: '💻 文本分块实现',
          code: `def chunk_text(text: str, chunk_size: int = 500,
                overlap: int = 50) -> List[str]:
    """
    将长文本分成多个重叠的块

    Args:
        text: 输入文本
        chunk_size: 每块的大小（字符数）
        overlap: 块之间的重叠（字符数）

    Returns:
        文本块列表
    """
    chunks = []
    start = 0
    text_length = len(text)

    while start < text_length:
        # 计算当前块的结束位置
        end = start + chunk_size

        # 提取当前块
        chunk = text[start:end]
        chunks.append(chunk)

        # 下一块的起始位置（考虑重叠）
        start = end - overlap

    return chunks

# 使用示例
text = "张三在北京大学工作..." * 1000  # 很长的文本
chunks = chunk_text(text, chunk_size=500, overlap=50)
print(f"分成了 {len(chunks)} 个块")`,
          explanation: `
            <strong>滑动窗口算法：</strong><br>
            • 每次向前移动 <code>chunk_size - overlap</code> 个字符<br>
            • 保证相邻块之间有 <code>overlap</code> 字符的重叠<br>
            • 最后一块可能小于 chunk_size（边界情况）
          `
        },
        {
          type: 'challenge',
          title: '🎯 实战挑战：实现文本分块',
          task: '请实现 chunk_text 函数，将长文本分成多个重叠的块。要求通过测试用例！',
          starter_code: `function chunk_text(text, chunk_size = 500, overlap = 50) {
  // TODO: 你的代码
  // 提示：使用 while 循环和字符串切片
  const chunks = [];


  return chunks;
}

// 测试
const text = "这是一段很长的文本...".repeat(100);
const result = chunk_text(text, 500, 50);
console.log("分成了", result.length, "个块");`,
          hints: [
            '使用 while (start < text.length) 循环',
            '每次提取 text.slice(start, start + chunk_size)',
            '下一块的起始位置是 start = end - overlap'
          ]
        },
        {
          type: 'concept',
          title: '🔍 第 3 步：实体和关系提取',
          html: `
            <div style="margin:14px 0;padding:14px;background:rgba(0,229,255,.06);border-radius:12px;font-size:.9rem;line-height:1.9">
              <strong>MiroFish 使用 Zep Cloud 进行提取：</strong><br><br>

              <strong>Zep Cloud 是什么？</strong><br>
              • 专门为 Agent 设计的记忆和知识图谱服务<br>
              • 内置 GraphRAG 功能<br>
              • 支持本体约束提取<br>
              • 提供向量检索 + 图谱检索<br><br>

              <strong>工作流程：</strong><br>
              1️⃣ 把文本块 + 本体定义发送给 Zep<br>
              2️⃣ Zep 用 LLM 提取实体和关系<br>
              3️⃣ Zep 自动构建知识图谱<br>
              4️⃣ 返回 graph_id（图谱的唯一标识）
            </div>
          `
        },
        {
          type: 'code',
          title: '💻 调用 Zep 构建图谱',
          code: `from zep_cloud.client import Zep

# 初始化 Zep 客户端
zep = Zep(api_key="your_zep_api_key")

# 创建图谱
graph = zep.graph.add(
    name="武汉大学舆情图谱",
    description="基于武大舆情报告构建的知识图谱"
)

# 添加本体约束
zep.graph.ontology.add(
    graph_id=graph.graph_id,
    ontology=ontology  # 前面定义的本体
)

# 批量添加文本块
for chunk in chunks:
    zep.graph.episodes.add(
        graph_id=graph.graph_id,
        episodes=[{
            "content": chunk,
            "metadata": {"source": "武大报告"}
        }]
    )

# Zep 会自动提取实体和关系，构建图谱
print(f"图谱 ID: {graph.graph_id}")

# 查询图谱统计
stats = zep.graph.get(graph.graph_id)
print(f"实体数量: {stats.node_count}")
print(f"关系数量: {stats.edge_count}")`,
          explanation: `
            <strong>Zep 的优势：</strong><br>
            • <strong>自动化</strong>：不需要手动写提取 prompt<br>
            • <strong>增量更新</strong>：可以随时添加新文本，自动更新图谱<br>
            • <strong>本体约束</strong>：保证提取的实体符合预定义类型<br>
            • <strong>去重</strong>：自动识别同一实体的不同表述（"张三" = "张老师"）
          `
        },
        {
          type: 'pitfalls',
          title: '⚠️ 常见坑点',
          items: [
            '本体设计太宽泛：定义了"概念"、"情绪"等抽象实体，导致提取结果不可用',
            '分块太大：单个 chunk 超过 LLM 的 Context Window，Zep 调用失败',
            '没有 overlap：跨块的实体关系丢失（如"张三在北京"被切成两块）',
            '忘记设置本体约束：Zep 提取出大量无关实体，图谱噪音太多',
            '批量添加时没有错误处理：某个 chunk 失败导致整个流程中断'
          ]
        },
        {
          type: 'debug',
          title: '🐛 调试挑战：修复图谱构建代码',
          scenario: '用户报告：处理长文本时程序崩溃，错误日志如下',
          buggy_code: `async function buildGraph(text) {
  const chunks = chunkText(text, 10000);  // Bug 1
  const entities = await extractEntities(chunks[0]);  // Bug 2
  return { entities };  // Bug 3
}`,
          error_log: `Error: Context length exceeded
at line 2: chunkText(text, 10000)

Warning: Only processing first chunk
at line 3: chunks[0]

Error: Missing relations in output
at line 4: return { entities }`,
          bug_count: 3,
          hints: [
            'Bug 1: chunk_size 太大了，应该是 500 左右',
            'Bug 2: 只处理了第一个 chunk，应该遍历所有 chunks',
            'Bug 3: 返回值缺少 relations 字段'
          ]
        },
        {
          type: 'sandbox',
          title: '🧪 沙盒实验：调整分块参数',
          description: '调整 chunk_size 和 overlap 参数，观察对图谱构建的影响。目标：让总发帖数超过 100！',
          params: [
            { name: 'chunk_size', min: 100, max: 1000, step: 50, default: 500 },
            { name: 'overlap', min: 0, max: 200, step: 10, default: 50 },
            { name: 'batch_size', min: 1, max: 10, step: 1, default: 5 }
          ],
          goal: '找到最优参数组合，让处理速度最快且准确率最高'
        },
        {
          type: 'quiz',
          q: 'MiroFish 为什么要用 Zep Cloud 而不是自己写实体提取代码？',
          opts: [
            '因为 Zep 是免费的',
            'Zep 提供本体约束提取、自动去重、增量更新等生产级功能，自己实现成本太高',
            '因为 Zep 速度更快',
            '因为 Zep 不需要 API key'
          ],
          ans: 1,
          feedback_ok: '✅ 正确！Zep 是专门为 Agent 设计的知识图谱服务，提供了很多生产级功能。自己实现这些功能需要几个月的开发时间！',
          feedback_err: 'Zep 的核心价值是提供生产级的 GraphRAG 功能——本体约束、实体去重、增量更新、混合检索等。这些功能自己实现非常复杂！'
        }
      ]
    },

    // 🔴 地狱模式
    hell: {
      sections: [
        {
          type: 'story',
          html: `
            <div class="speaker">🔥 地狱模式 - GraphRAG 深度解析</div>
            <div class="chat-bubble robot" style="border-color:var(--red)">
              🤖 ARIA：船长，准备好了吗？<br>
              我们要深入 GraphRAG 的核心——<br>
              <strong>微软 2024 年发布的革命性论文</strong>！<br><br>

              这篇论文解决了一个困扰 RAG 系统多年的问题：<br>
              <strong>如何回答需要"全局理解"的问题？</strong><br><br>

              传统 RAG 只能回答局部问题（"张三是谁？"）<br>
              GraphRAG 能回答全局问题（"这个事件的主要矛盾是什么？"）
            </div>
          `
        },
        {
          type: 'concept',
          title: '📄 论文核心：From Local to Global',
          html: `
            <div style="margin:14px 0;padding:14px;background:rgba(0,229,255,.06);border-radius:12px;font-size:.9rem;line-height:1.9">
              <strong>论文信息：</strong><br>
              • 标题：From Local to Global: A Graph RAG Approach to Query-Focused Summarization<br>
              • 作者：Microsoft Research（2024）<br>
              • 核心贡献：提出基于社区检测的全局检索方法<br><br>

              <strong>传统 RAG 的局限：</strong><br>
              • 只能检索"相似"的文本块<br>
              • 无法回答需要综合多个来源的问题<br>
              • 例如："这份报告的主要主题是什么？"——需要看完整份报告才能回答<br><br>

              <strong>GraphRAG 的创新：</strong><br>
              • 构建实体关系图谱<br>
              • 用社区检测算法（Leiden）将图谱分成多个"社区"<br>
              • 为每个社区生成摘要<br>
              • 查询时先检索相关社区，再检索具体实体
            </div>
          `
        },
        {
          type: 'concept',
          title: '🏘️ 社区检测（Community Detection）',
          html: `
            <div style="margin:14px 0;padding:14px;background:rgba(0,229,255,.06);border-radius:12px;font-size:.9rem;line-height:1.9">
              <strong>什么是社区？</strong><br>
              在知识图谱中，"社区"是一组紧密连接的实体。<br><br>

              <strong>例子：武汉大学舆情图谱</strong><br>
              • 社区 1：学生群体（学生会、班级、宿舍）<br>
              • 社区 2：校方管理层（校长、教务处、保卫处）<br>
              • 社区 3：媒体和舆论（记者、自媒体、网友）<br><br>

              <strong>Leiden 算法：</strong><br>
              • 一种图聚类算法<br>
              • 自动识别图谱中的"社区"<br>
              • 比传统的 Louvain 算法更准确<br>
              • 时间复杂度：O(n log n)
            </div>

            <div style="margin-top:14px;padding:12px;background:rgba(251,191,36,.08);border-left:3px solid var(--yellow);border-radius:8px;font-size:.9rem">
              💡 <strong>为什么需要社区？</strong><br>
              当用户问"这个事件的主要矛盾是什么？"时，<br>
              我们需要理解不同群体（社区）之间的冲突，<br>
              而不是单个实体的信息！
            </div>
          `
        },
        {
          type: 'code',
          title: '💻 GraphRAG 的三层检索架构',
          code: `# MiroFish 实现的三层检索工具

# 1. QuickSearch - 快速检索（传统向量检索）
def quick_search(query: str, graph_id: str) -> List[str]:
    """
    最快但最简单的检索
    适用场景：简单的事实查询（"张三是谁？"）
    """
    results = zep.memory.search(
        graph_id=graph_id,
        query=query,
        limit=10
    )
    return [r.content for r in results]


# 2. PanoramaSearch - 全景搜索（图谱遍历）
def panorama_search(query: str, graph_id: str) -> Dict:
    """
    遍历整个图谱，返回所有相关节点和边
    适用场景：需要全局视角（"有哪些人参与了这个事件？"）
    """
    # 获取所有节点
    all_nodes = zep.graph.nodes.list(graph_id=graph_id)

    # 获取所有边
    all_edges = zep.graph.edges.list(graph_id=graph_id)

    # 过滤相关节点（基于语义相似度）
    relevant_nodes = [
        n for n in all_nodes
        if semantic_similarity(query, n.summary) > 0.7
    ]

    return {
        "nodes": relevant_nodes,
        "edges": all_edges,
        "total_nodes": len(all_nodes),
        "relevant_nodes": len(relevant_nodes)
    }


# 3. InsightForge - 深度洞察（GraphRAG 核心）
def insight_forge(query: str, graph_id: str,
                  simulation_requirement: str) -> Dict:
    """
    最强大的检索工具，实现 GraphRAG 论文的核心思想
    适用场景：复杂的分析问题（"这个事件的主要矛盾是什么？"）
    """
    # Step 1: 生成子问题
    sub_queries = generate_sub_queries(query, simulation_requirement)

    # Step 2: 对每个子问题进行多维度检索
    results = {
        "semantic_facts": [],      # 语义搜索结果
        "entity_insights": [],     # 实体洞察
        "relationship_chains": []  # 关系链
    }

    for sub_q in sub_queries:
        # 2.1 语义搜索（向量检索）
        semantic = zep.memory.search(graph_id, sub_q)
        results["semantic_facts"].extend(semantic)

        # 2.2 实体检索（图谱检索）
        entities = zep.graph.nodes.search(graph_id, sub_q)
        for entity in entities:
            # 获取实体的所有关系
            edges = zep.graph.edges.list(
                graph_id=graph_id,
                node_uuid=entity.uuid
            )
            results["entity_insights"].append({
                "entity": entity,
                "relations": edges
            })

        # 2.3 关系链检索（多跳查询）
        chains = find_relationship_chains(
            graph_id, sub_q, max_hops=3
        )
        results["relationship_chains"].extend(chains)

    # Step 3: 综合分析
    insights = synthesize_insights(results)

    return insights`,
          explanation: `
            <strong>三层检索的设计哲学：</strong><br>
            • <strong>QuickSearch</strong>：速度优先，适合简单查询<br>
            • <strong>PanoramaSearch</strong>：全面性优先，适合探索性查询<br>
            • <strong>InsightForge</strong>：深度优先，适合分析性查询<br><br>

            <strong>InsightForge 的核心创新：</strong><br>
            • 自动生成子问题（Query Decomposition）<br>
            • 多维度检索（向量 + 图谱 + 关系链）<br>
            • 综合分析（Synthesis）
          `
        },
        {
          type: 'concept',
          title: '🔬 GraphRAG vs 传统 RAG 的实验对比',
          html: `
            <div style="margin:14px 0;padding:14px;background:rgba(0,229,255,.06);border-radius:12px;font-size:.9rem;line-height:1.9">
              <strong>微软论文的实验结果：</strong><br><br>

              <strong>数据集：</strong>Podcast 转录文本（1M tokens）<br><br>

              <strong>任务：</strong>回答需要全局理解的问题<br>
              • "这个播客的主要主题是什么？"<br>
              • "不同嘉宾的观点有什么冲突？"<br><br>

              <strong>结果：</strong><br>
              • <strong>传统 RAG</strong>：准确率 45%，经常遗漏关键信息<br>
              • <strong>GraphRAG</strong>：准确率 78%，能综合多个来源<br>
              • <strong>成本</strong>：GraphRAG 的索引成本高 3 倍，但查询成本相同<br><br>

              <strong>结论：</strong><br>
              对于需要全局理解的任务，GraphRAG 的准确率提升值得额外的索引成本！
            </div>
          `
        },
        {
          type: 'concept',
          title: '🏗️ MiroFish 的 GraphRAG 实现细节',
          html: `
            <div style="margin:14px 0;padding:14px;background:rgba(0,229,255,.06);border-radius:12px;font-size:.9rem;line-height:1.9">
              <strong>MiroFish 在论文基础上的工程优化：</strong><br><br>

              <strong>1. 本体约束提取</strong><br>
              • 论文：自由提取所有实体<br>
              • MiroFish：用本体约束，只提取社交媒体相关实体<br>
              • 优势：减少噪音，提高准确率<br><br>

              <strong>2. 增量更新</strong><br>
              • 论文：静态图谱<br>
              • MiroFish：支持动态更新（模拟过程中 Agent 的活动会更新图谱）<br>
              • 实现：Zep 的 add_episode API<br><br>

              <strong>3. 混合检索</strong><br>
              • 论文：只用图谱检索<br>
              • MiroFish：向量检索 + 图谱检索 + 关系链检索<br>
              • 优势：兼顾速度和准确率<br><br>

              <strong>4. 时序记忆</strong><br>
              • 论文：没有时间维度<br>
              • MiroFish：每个事实都有时间戳，支持"某个时间点的图谱状态"<br>
              • 应用：回溯分析（"事件发生前后，舆论如何变化？"）
            </div>
          `
        },
        {
          type: 'pitfalls',
          title: '⚠️ 生产级 GraphRAG 的深层陷阱',
          items: [
            '实体消歧问题：同一个人的不同称呼（"张三"、"张老师"、"小张"）被识别为不同实体——需要实体链接（Entity Linking）',
            '关系抽取准确率：LLM 容易产生幻觉关系（两个实体在同一段落出现，但实际没有关系）——需要关系验证',
            '图谱规模爆炸：100 万字文档可能产生 10 万个实体，图谱太大无法加载——需要社区检测和分层存储',
            '增量更新的一致性：新增文本可能与旧图谱冲突（"张三离职了"vs"张三在职"）——需要冲突检测和版本管理',
            '检索成本：多跳查询（3 跳以上）的计算复杂度是 O(n³)，大图谱会很慢——需要索引优化和缓存',
            '社区检测的稳定性：Leiden 算法是随机的，每次运行结果可能不同——需要固定随机种子或使用确定性算法'
          ]
        },
        {
          type: 'quiz',
          q: 'GraphRAG 论文的核心创新是什么？',
          opts: [
            '用 LLM 提取实体和关系',
            '用社区检测将图谱分层，支持全局查询',
            '用向量数据库存储图谱',
            '用 Transformer 编码图结构'
          ],
          ans: 1,
          feedback_ok: '🔥 完美！社区检测是 GraphRAG 的核心创新。通过将图谱分成多个社区，并为每个社区生成摘要，GraphRAG 能够回答需要全局理解的问题——这是传统 RAG 做不到的！',
          feedback_err: '论文的核心创新是"社区检测 + 分层摘要"。想象一个有 10 万个节点的图谱——如果不分层，查询时需要遍历所有节点。但如果先分成 100 个社区，每个社区 1000 个节点，查询时只需要先找到相关社区，再在社区内查询，效率提升 100 倍！'
        }
      ]
    }
  }
});

