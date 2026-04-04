// 关卡 7：记忆星 2 - 长期记忆（完整重构）

PLANETS.push({
  id: 'p7',
  icon: '🧠',
  num: '星球 07',
  name: '记忆星 2：长期记忆',
  desc: '学习 RAG 和向量数据库。',

  difficulties: {
    // 🟢 简单模式
    easy: {
      sections: [
        {
          type: 'story',
          html: `
            <div class="speaker">🚀 记忆星核心区域</div>
            <p>ARIA 带你来到记忆星的核心区域，这里有巨大的数据库：</p>
            <div class="chat-bubble robot">
              🤖 ARIA：船长！短期记忆会消失，但<strong>长期记忆</strong>可以永久保存！
              我们把重要的信息存进数据库，需要时再检索出来。
            </div>
            <div class="chat-bubble">
              👦 你：就像我把知识记在笔记本里，考试前再翻出来复习？
            </div>
            <div class="chat-bubble robot">
              🤖 ARIA：完美比喻！这就是 <strong>RAG（检索增强生成）</strong>！
              让 Agent 在回答前先去查资料库，就像开卷考试！
            </div>
          `
        },
        {
          type: 'concept',
          title: '💾 长期记忆 = 数据库',
          html: `
            <div style="display:grid;grid-template-columns:1fr;gap:14px;margin-top:8px">
              <div style="background:rgba(34,197,94,.08);border:1px solid rgba(34,197,94,.2);border-radius:12px;padding:16px">
                <div style="font-size:1.5rem;margin-bottom:8px">💾</div>
                <strong style="color:var(--green)">长期记忆</strong>
                <p style="font-size:.82rem;color:var(--muted);margin-top:6px;line-height:1.6">
                  • 存进数据库<br>
                  • 永久保存<br>
                  • 像课本，随时查<br>
                  • 可以跨对话使用
                </p>
              </div>
            </div>
            <div style="margin-top:14px;padding:12px 16px;background:rgba(251,191,36,.06);border-radius:10px;border:1px solid rgba(251,191,36,.2)">
              <strong style="color:var(--yellow)">🔍 RAG</strong>（检索增强生成）= 让 Agent 在回答前先去查资料库，就像开卷考试！
            </div>
          `
        },
        {
          type: 'quiz',
          q: 'RAG 是什么？',
          opts: [
            '一种让 AI 变聪明的训练方法',
            '让 Agent 在回答前先检索外部知识库',
            '一种编程语言',
            '机器人的型号名称'
          ],
          ans: 1,
          feedback_ok: '🎉 太棒了！RAG = 检索增强生成，就像给 AI 一本可以随时查的参考书！',
          feedback_err: 'RAG 的关键词是「检索」——让 Agent 在回答前先去查找相关资料！'
        }
      ]
    },

    // 🟡 困难模式
    hard: {
      sections: [
        {
          type: 'story',
          html: `
            <div class="speaker">🚀 记忆星核心区域（技术版）</div>
            <div class="chat-bubble robot">
              🤖 ARIA：船长！让我给你讲讲 RAG 和向量数据库的技术细节。
              这是现代 Agent 系统的核心技术之一！
            </div>
          `
        },
        {
          type: 'concept',
          title: '💾 RAG 的核心技术',
          html: `
            <p>RAG 系统的关键组件：</p>
            <ul style="margin:10px 0 0 16px;line-height:2">
              <li><strong>向量数据库</strong>：存储文本的向量表示（Chroma、Pinecone）</li>
              <li><strong>Embedding 模型</strong>：将文本转换为向量</li>
              <li><strong>相似度检索</strong>：找到与查询最相关的文档</li>
              <li><strong>上下文增强</strong>：将检索结果添加到 prompt 中</li>
            </ul>
          `
        },
        {
          type: 'code',
          title: '📟 RAG 实现示例',
          code: `import chromadb

# 1. 初始化向量数据库
client = chromadb.Client()
collection = client.create_collection("memory")

# 2. 存储记忆
collection.add(
    documents=["用户喜欢喝咖啡"],
    ids=["mem_1"]
)

# 3. 检索相关记忆
results = collection.query(
    query_texts=["用户的饮品偏好"],
    n_results=3
)

# 4. 在 Agent 中使用
relevant_memories = results['documents'][0]
enhanced_prompt = f"""
相关记忆：{relevant_memories}

用户问题：{query}
"""`,
          explanation: `
            <strong>关键点：</strong><br>
            • 向量数据库自动计算文本相似度<br>
            • 检索出最相关的记忆<br>
            • 将记忆添加到 prompt 中增强 LLM 的回答
          `
        },
        {
          type: 'pitfalls',
          title: '⚠️ 常见坑点',
          items: [
            '检索结果不相关 → Embedding 模型选择或 query 构造问题',
            '记忆过多导致检索慢 → 需要建立索引和优化',
            '检索结果太长超出 Context Window → 需要摘要或截断',
            '没有更新机制 → 过时的记忆会误导 Agent'
          ]
        },
        {
          type: 'quiz',
          q: 'RAG 的核心流程是什么？',
          opts: [
            '直接把所有数据都给 LLM',
            '检索相关文档 → 添加到 prompt → LLM 生成回答',
            '训练一个新的模型',
            '把数据存在 Context Window 里'
          ],
          ans: 1,
          feedback_ok: '✅ 完全正确！RAG 的核心是「检索 + 增强 + 生成」！',
          feedback_err: 'RAG = 检索增强生成，关键是先检索，再增强 prompt！'
        }
      ]
    },

    // 🔴 地狱模式
    hell: {
      sections: [
        {
          type: 'story',
          html: `
            <div class="speaker">🔥 地狱模式 - RAG 论文深度解读</div>
            <div class="chat-bubble robot" style="border-color:var(--red)">
              🤖 ARIA：船长，你有没有想过——<br>
              LLM 的知识是训练时"记住"的，但世界每天都在变化！<br><br>
              2020 年，Meta AI 发表了一篇论文，提出了解决方案：<br>
              <strong>RAG: Retrieval-Augmented Generation</strong><br><br>
              让 LLM 在回答时"查资料"，而不是只靠记忆！
            </div>
          `
        },
        {
          type: 'concept',
          title: '📄 论文背景：两种知识的困境',
          html: `
            <div style="margin:14px 0;padding:14px;background:rgba(0,229,255,.06);border-radius:12px;line-height:1.9">
              <strong>论文信息：</strong><br>
              • 标题：Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks<br>
              • 作者：Patrick Lewis 等（Meta AI Research）<br>
              • 发表：NeurIPS 2020<br>
              • 引用：超过 4,000 次<br>
              • 影响：现代 AI 应用的标配技术<br>
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:14px 0">
              <div style="padding:12px;background:rgba(239,68,68,.05);border:1px solid rgba(239,68,68,.2);border-radius:12px;font-size:.85rem;line-height:1.7">
                <strong style="color:var(--red)">参数化知识（记忆）</strong><br>
                存在模型权重里<br>
                ✅ 快速访问<br>
                ❌ 训练后无法更新<br>
                ❌ 容量有限，会遗忘<br>
                ❌ 无法追溯来源
              </div>
              <div style="padding:12px;background:rgba(0,229,255,.05);border:1px solid rgba(0,229,255,.2);border-radius:12px;font-size:.85rem;line-height:1.7">
                <strong style="color:var(--cyan)">非参数化知识（检索）</strong><br>
                存在外部数据库<br>
                ✅ 随时更新<br>
                ✅ 容量无限<br>
                ✅ 可追溯来源<br>
                ❌ 需要检索时间
              </div>
            </div>
            <div style="padding:12px;background:rgba(251,191,36,.08);border-left:3px solid var(--yellow);border-radius:8px;font-size:.9rem">
              💡 <strong>RAG 的思路：</strong>结合两者优点！<br>
              用检索找到相关文档，再让 LLM 基于文档生成答案。
            </div>
          `
        },
        {
          type: 'concept',
          title: '🏗️ RAG 的完整架构',
          html: `
            <div style="margin:14px 0;padding:14px;background:rgba(0,229,255,.06);border-radius:12px;font-family:monospace;font-size:.85rem;line-height:1.9">
              <strong>离线阶段（建库）：</strong><br>
              文档集合<br>
              &nbsp;&nbsp;↓ Encoder（DPR）<br>
              向量表示（每段文字 → 一个向量）<br>
              &nbsp;&nbsp;↓ FAISS 索引<br>
              向量数据库（可快速检索）<br><br>

              <strong>在线阶段（查询）：</strong><br>
              用户问题<br>
              &nbsp;&nbsp;↓ Query Encoder（同一个 DPR）<br>
              问题向量<br>
              &nbsp;&nbsp;↓ 向量相似度搜索（Top-K）<br>
              最相关的 K 段文档<br>
              &nbsp;&nbsp;↓ Generator（BART）<br>
              最终答案
            </div>
            <div style="margin-top:16px;padding:12px;background:rgba(251,191,36,.1);border-left:3px solid var(--yellow);border-radius:8px;font-size:.9rem">
              💡 <strong>关键：</strong>问题和文档用<strong>同一个 Encoder</strong> 编码，<br>
              这样"语义相似"的问题和文档会有相近的向量！
            </div>
          `
        },
        {
          type: 'code',
          title: '💻 现代 RAG 实现（基于 Claude + ChromaDB）',
          code: `import anthropic
import chromadb
from chromadb.utils import embedding_functions

client = anthropic.Anthropic()
chroma = chromadb.Client()

# 使用 Claude 的 Embedding（或 OpenAI/本地模型）
ef = embedding_functions.DefaultEmbeddingFunction()
collection = chroma.create_collection("knowledge", embedding_function=ef)

def build_index(documents: list[dict]):
    """离线建库：把文档转成向量存入数据库"""
    collection.add(
        documents=[d["text"] for d in documents],
        metadatas=[{"source": d["source"]} for d in documents],
        ids=[f"doc_{i}" for i in range(len(documents))]
    )

def rag_query(question: str, top_k: int = 3) -> str:
    """在线查询：检索 + 生成"""
    # 1. 检索最相关的 K 段文档
    results = collection.query(
        query_texts=[question],
        n_results=top_k
    )
    docs = results["documents"][0]
    sources = [m["source"] for m in results["metadatas"][0]]

    # 2. 构建增强 Prompt
    context = "\n\n".join(
        f"[来源: {src}]\n{doc}"
        for doc, src in zip(docs, sources)
    )

    # 3. 让 LLM 基于检索结果回答
    response = client.messages.create(
        model="claude-opus-4-6",
        max_tokens=1024,
        messages=[{"role": "user", "content":
            f"根据以下资料回答问题。如果资料中没有答案，请说明。\n\n"
            f"资料：\n{context}\n\n问题：{question}"
        }]
    )
    return response.content[0].text`,
          explanation: `
            <strong>现代 RAG 的关键设计：</strong><br>
            • <strong>来源标注</strong>：每段文档附上来源，LLM 可以引用，用户可以验证<br>
            • <strong>明确指令</strong>："如果资料中没有答案，请说明"——防止 LLM 用记忆瞎编<br>
            • <strong>Top-K 检索</strong>：K=3 是常用值，太少信息不足，太多超出 Context<br>
            • <strong>Embedding 一致性</strong>：建库和查询必须用同一个 Embedding 模型
          `
        },
        {
          type: 'concept',
          title: '📊 RAG 的两种变体（论文核心）',
          html: `
            <p><strong>论文提出了两种 RAG 架构：</strong></p>
            <div style="margin:14px 0;padding:14px;background:rgba(0,229,255,.06);border-radius:12px;font-size:.9rem;line-height:1.8">
              <strong>RAG-Sequence（序列级）</strong><br>
              整个回答用同一组检索文档<br>
              • 适合：需要连贯叙述的任务（写文章、总结）<br>
              • 特点：检索一次，生成整个回答<br><br>

              <strong>RAG-Token（Token 级）</strong><br>
              每个 token 可以用不同的检索文档<br>
              • 适合：需要整合多个来源的任务（问答、事实核查）<br>
              • 特点：更灵活，但计算成本更高<br><br>

              <strong>实验结果：</strong><br>
              • Open-domain QA：RAG-Token 更好（多来源整合）<br>
              • 摘要生成：RAG-Sequence 更好（连贯性更重要）
            </div>
          `
        },
        {
          type: 'concept',
          title: '🚀 现代 RAG 的演进（2020→2024）',
          html: `
            <div style="margin:14px 0;padding:14px;background:rgba(251,191,36,.1);border-left:3px solid var(--yellow);border-radius:12px;line-height:1.9;font-size:.9rem">
              <strong>2020 - 原始 RAG（论文）</strong><br>
              DPR 检索 + BART 生成，学术验证<br><br>

              <strong>2022 - 工程化 RAG</strong><br>
              LangChain 封装 RAG，开发者可以 5 行代码实现<br><br>

              <strong>2023 - Advanced RAG</strong><br>
              • <strong>HyDE</strong>：先让 LLM 生成假设答案，再用假设答案检索<br>
              • <strong>Reranking</strong>：检索后用 Cross-Encoder 重新排序，提高精度<br>
              • <strong>Query Rewriting</strong>：把用户问题改写成更适合检索的形式<br><br>

              <strong>2024 - Self-RAG / CRAG</strong><br>
              • <strong>Self-RAG</strong>：LLM 自己决定是否需要检索，以及检索结果是否可信<br>
              • <strong>CRAG</strong>：检索结果质量差时，自动触发网络搜索补充
            </div>
          `
        },
        {
          type: 'pitfalls',
          title: '⚠️ RAG 的常见问题',
          items: [
            '检索不到相关文档：Embedding 模型选择不当，或文档分块策略有问题（太长/太短）',
            '检索到了但 LLM 忽略：Prompt 设计不当，LLM 还是用自己的记忆回答',
            '文档分块破坏语义：在句子中间切断，导致检索到的片段不完整',
            '向量数据库冷启动：新系统没有文档，需要先建库才能使用',
            '多语言问题：中文问题检索英文文档，Embedding 跨语言效果差'
          ]
        },
        {
          type: 'quiz',
          q: 'RAG 相比"直接把所有文档塞进 Context"的核心优势是什么？',
          opts: [
            'RAG 生成的答案更准确',
            '文档库可以无限大，检索只取最相关的部分，不受 Context Window 限制',
            'RAG 不需要向量数据库',
            'RAG 速度更快'
          ],
          ans: 1,
          feedback_ok: '🔥 完美！这是 RAG 最根本的价值。如果把所有文档都塞进 Context，一个公司的知识库可能有几百万页，根本塞不下。RAG 通过检索只取最相关的 3-5 段，让 LLM 可以访问"无限大"的知识库！',
          feedback_err: 'RAG 的核心价值是突破 Context Window 的限制。一个公司的知识库可能有几百万页文档，全部塞进 Context 是不可能的。RAG 通过向量检索，只取最相关的几段，让 LLM 可以访问任意大的知识库！'
        }
      ]
    }
  }
});
