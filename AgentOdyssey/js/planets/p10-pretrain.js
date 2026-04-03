// 关卡 10：预训练星

PLANETS.push({
  id: 'p10',
  icon: '🏋️',
  num: '星球 10',
  name: '预训练星',
  desc: '了解 AI 是怎么从零开始"上学"的！',

  difficulties: {
    // 🟢 简单模式
    easy: {
      sections: [
        {
          type: 'story',
          html: `
            <div class="speaker">🚀 进入训练场星球</div>
            <p>这颗星球上有一个巨大的图书馆，里面装着整个互联网的内容！ARIA 感慨道：</p>
            <div class="chat-bubble robot">
              🤖 ARIA：船长，你知道 Claude、GPT 这些 AI 是怎么变聪明的吗？
              它们要经历好几个阶段的训练——第一步叫做 <strong>预训练（Pre-training）</strong>！
            </div>
            <div class="chat-bubble">
              👦 你：预训练？就像我上学之前先上幼儿园？
            </div>
            <div class="chat-bubble robot">
              🤖 ARIA：超棒的比喻！预训练就是让 AI 读海量文字，
              学习语言的基础规律——就像小婴儿慢慢学会说话！
            </div>
          `
        },
        {
          type: 'concept',
          title: '🏋️ 预训练（Pre-training）是什么？',
          html: `
            <p>预训练的目标很简单：<strong style="color:var(--purple)">给我前面的词，预测下一个词！</strong></p>
            <div style="margin:14px 0;padding:16px;background:#060d18;border-radius:12px;font-family:monospace;font-size:.9rem;line-height:2">
              <div>输入：「今天天气真的很」</div>
              <div style="color:var(--purple)">预测：「好」✅  or  「差」✅  or  「飞机」❌</div>
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:14px">
              <div style="background:rgba(168,85,247,.08);border:1px solid rgba(168,85,247,.2);border-radius:12px;padding:14px">
                <strong style="color:var(--purple)">📚 训练数据</strong>
                <ul style="margin-top:8px;font-size:.82rem;color:var(--muted);line-height:2;list-style:none">
                  <li>🌐 整个互联网的网页</li>
                  <li>📖 数十亿本书</li>
                  <li>💻 GitHub 所有代码</li>
                  <li>📰 新闻、论文……</li>
                </ul>
              </div>
              <div style="background:rgba(239,68,68,.08);border:1px solid rgba(239,68,68,.2);border-radius:12px;padding:14px">
                <strong style="color:#fca5a5">💸 训练成本</strong>
                <ul style="margin-top:8px;font-size:.82rem;color:var(--muted);line-height:2;list-style:none">
                  <li>🖥️ 数千张 GPU</li>
                  <li>⏱️ 几个月时间</li>
                  <li>💰 数千万到数亿美元</li>
                  <li>⚡ 耗电量惊人</li>
                </ul>
              </div>
            </div>
          `
        },
        {
          type: 'quiz',
          q: '预训练阶段，AI 的主要学习任务是什么？',
          opts: [
            '学会画画和音乐创作',
            '根据前面的文字，预测下一个词，不断降低预测错误率',
            '学会和人类礼貌对话',
            '记住所有人的名字和生日'
          ],
          ans: 1,
          feedback_ok: '🎯 完全正确！就是这么简单的任务——预测下一个词——重复万亿次，AI 就学会了理解语言！',
          feedback_err: '预训练只做一件事：给你前面的词，猜下一个词！简单但威力巨大！'
        }
      ]
    },

    // 🟡 困难模式
    hard: {
      sections: [
        {
          type: 'story',
          html: `
            <div class="speaker">🚀 预训练星（技术版）</div>
            <div class="chat-bubble robot">
              🤖 ARIA：船长！让我给你讲讲预训练的技术细节。
              这是 AI 训练中最昂贵、最关键的阶段！
            </div>
          `
        },
        {
          type: 'concept',
          title: '🏋️ 预训练的核心要素',
          html: `
            <p>预训练的关键技术：</p>
            <ul style="margin:10px 0 0 16px;line-height:2">
              <li><strong>训练数据</strong>：数万亿 tokens 的文本数据</li>
              <li><strong>Loss 函数</strong>：交叉熵损失，衡量预测准确度</li>
              <li><strong>优化器</strong>：Adam 优化器，调整模型参数</li>
              <li><strong>学习率调度</strong>：动态调整学习速度</li>
            </ul>
          `
        },
        {
          type: 'code',
          title: '📟 预训练核心循环（伪代码）',
          code: `for epoch in range(num_epochs):
    for batch in dataloader:
        # 前向传播
        logits = model(batch.input_ids)

        # 计算 Loss（交叉熵）
        loss = cross_entropy(logits, batch.labels)

        # 反向传播
        loss.backward()

        # 更新参数
        optimizer.step()
        optimizer.zero_grad()`,
          explanation: `
            <strong>关键点：</strong><br>
            • Loss 越低，预测越准确<br>
            • 反向传播调整模型参数<br>
            • 这个循环重复数万亿次<br>
            • GPT-4 约有 1.8 万亿参数
          `
        },
        {
          type: 'pitfalls',
          title: '⚠️ 预训练的挑战',
          items: [
            '数据质量问题 → 垃圾数据会导致模型学到错误知识',
            '训练不稳定 → 需要梯度裁剪、学习率调度等技巧',
            '成本极高 → 普通公司无法承担从头预训练',
            '数据偏见 → 训练数据的偏见会被模型学习'
          ]
        },
        {
          type: 'quiz',
          q: '为什么预训练成本这么高？',
          opts: [
            '因为需要很多工程师',
            '需要数千张 GPU、几个月时间、处理数万亿 tokens',
            '因为数据很贵',
            '因为算法很复杂'
          ],
          ans: 1,
          feedback_ok: '✅ 正确！预训练需要海量计算资源和时间，这就是为什么只有大公司能做！',
          feedback_err: '预训练的成本主要来自计算资源（GPU）和时间！'
        }
      ]
    },

    // 🔴 地狱模式
    hell: {
      sections: [
        {
          type: 'story',
          html: `
            <div class="speaker">🔥 地狱模式 - GPT-3 论文深度解读</div>
            <div class="chat-bubble robot" style="border-color:var(--red)">
              🤖 ARIA：船长，欢迎来到预训练的巅峰——<br>
              <strong>GPT-3: Language Models are Few-Shot Learners</strong><br><br>
              这篇 2020 年的论文改变了整个 AI 行业。<br>
              175B 参数、In-Context Learning、Few-Shot 能力……<br>
              让我们深入这个里程碑。
            </div>
          `
        },
        {
          type: 'concept',
          title: '📄 论文背景',
          html: `
            <div style="margin:14px 0;padding:14px;background:rgba(0,229,255,.06);border-radius:12px;line-height:1.9">
              <strong>论文信息：</strong><br>
              • 标题：Language Models are Few-Shot Learners<br>
              • 作者：OpenAI（Tom Brown 等 31 人）<br>
              • 发表：NeurIPS 2020<br>
              • 引用：超过 20,000 次（截至 2024）<br>
              • 影响：催生了 ChatGPT、Claude 等产品<br><br>

              <strong>核心发现：</strong><br>
              当语言模型足够大时，它可以通过<strong>上下文学习</strong>（In-Context Learning）<br>
              完成任务——不需要梯度更新，只需要在 prompt 里给几个例子！
            </div>
          `
        },
        {
          type: 'concept',
          title: '💡 Few-Shot Learning 的突破',
          html: `
            <p><strong>三种学习范式对比：</strong></p>
            <div style="margin:14px 0;padding:14px;background:rgba(0,229,255,.06);border-radius:12px;font-size:.9rem;line-height:1.8">
              <strong>Zero-Shot（零样本）</strong><br>
              只给任务描述，不给例子：<br>
              <code style="background:rgba(0,0,0,.3);padding:2px 6px;border-radius:4px">
              Translate to French: Hello → </code><br><br>

              <strong>One-Shot（单样本）</strong><br>
              给 1 个例子：<br>
              <code style="background:rgba(0,0,0,.3);padding:2px 6px;border-radius:4px">
              sea otter → loutre de mer<br>
              peppermint → </code><br><br>

              <strong>Few-Shot（少样本）</strong><br>
              给 2-64 个例子：<br>
              <code style="background:rgba(0,0,0,.3);padding:2px 6px;border-radius:4px">
              sea otter → loutre de mer<br>
              peppermint → menthe poivrée<br>
              plush giraffe → girafe en peluche<br>
              cheese → </code>
            </div>
            <div style="margin-top:16px;padding:12px;background:rgba(251,191,36,.1);border-left:3px solid var(--yellow);border-radius:8px;font-size:.9rem">
              💡 <strong>关键发现：</strong>GPT-3 的 Few-Shot 性能随模型规模急剧提升。<br>
              1.3B 参数模型几乎不会 Few-Shot，而 175B 模型接近人类水平！
            </div>
          `
        },
        {
          type: 'concept',
          title: '🏗️ GPT-3 架构细节',
          html: `
            <div style="margin:14px 0;padding:14px;background:rgba(0,229,255,.06);border-radius:12px;font-size:.9rem;line-height:1.9">
              <strong>模型规模（8 个版本）：</strong><br>
              • GPT-3 Small: 125M 参数<br>
              • GPT-3 Medium: 350M 参数<br>
              • GPT-3 Large: 760M 参数<br>
              • GPT-3 XL: 1.3B 参数<br>
              • GPT-3 2.7B: 2.7B 参数<br>
              • GPT-3 6.7B: 6.7B 参数<br>
              • GPT-3 13B: 13B 参数<br>
              • <strong style="color:var(--cyan)">GPT-3 175B: 175B 参数</strong>（主力模型）<br><br>

              <strong>GPT-3 175B 配置：</strong><br>
              • 层数（Layers）：96<br>
              • 隐藏维度（d_model）：12,288<br>
              • 注意力头数（Heads）：96<br>
              • Context Window：2,048 tokens<br>
              • Batch Size：3.2M tokens<br>
              • 训练数据：300B tokens（过滤后）<br>
              • 训练时长：数月（具体未公开）<br>
              • 训练成本：估计 $4-12M
            </div>
          `
        },
        {
          type: 'code',
          title: '📊 Scaling Laws（规模定律）',
          code: `# GPT-3 论文的核心发现：性能随规模的幂律关系

import numpy as np
import matplotlib.pyplot as plt

# 模型规模（参数量）
params = np.array([0.125, 0.35, 0.76, 1.3, 2.7, 6.7, 13, 175])  # 单位：B

# SuperGLUE 性能（Few-Shot，论文 Figure 3.8）
superglue_scores = np.array([
    30.5,  # 125M
    35.2,  # 350M
    42.1,  # 760M
    45.3,  # 1.3B
    52.8,  # 2.7B
    60.4,  # 6.7B
    65.2,  # 13B
    71.8   # 175B（接近人类 89.8）
])

# 幂律拟合：Performance ∝ N^α
# 论文发现 α ≈ 0.095（对数尺度下近似线性）

print("关键观察：")
print("1. 性能随规模持续提升，未见饱和")
print("2. 175B 比 13B 提升 6.6 个百分点")
print("3. 暗示更大模型（GPT-4）会更强")`,
          explanation: `
            <strong>Scaling Laws 的三大发现：</strong><br>
            • <strong>性能 ∝ 参数量^α</strong>：模型越大，能力越强，且关系可预测<br>
            • <strong>未见饱和</strong>：175B 仍在上升曲线上，更大模型会更强<br>
            • <strong>Few-Shot 能力涌现</strong>：小模型几乎不会 Few-Shot，大模型突然"学会"<br><br>
            这直接催生了 GPT-4（估计 1.8T 参数）、Claude Opus 等超大模型。
          `
        },
        {
          type: 'concept',
          title: '📊 关键实验结果',
          html: `
            <p><strong>GPT-3 在多个基准测试上的表现：</strong></p>
            <div style="margin:14px 0;padding:14px;background:rgba(0,229,255,.06);border-radius:12px;font-size:.85rem;line-height:1.8">
              <strong>1. SuperGLUE（语言理解）</strong><br>
              • Few-Shot GPT-3 175B: 71.8%<br>
              • Fine-tuned BERT Large: 69.0%<br>
              • 人类基准: 89.8%<br>
              → GPT-3 不微调就超过了微调的 BERT！<br><br>

              <strong>2. 翻译任务（WMT'14 En→Fr）</strong><br>
              • Few-Shot GPT-3: 39.2 BLEU<br>
              • 监督学习 SOTA: 45.6 BLEU<br>
              → 未见过翻译训练数据，仅靠 Few-Shot 达到可用水平<br><br>

              <strong>3. 算术推理（2 位数加法）</strong><br>
              • GPT-3 175B: 100% 准确率<br>
              • GPT-3 13B: 80% 准确率<br>
              → 大模型"涌现"出算术能力<br><br>

              <strong>4. 代码生成（HumanEval，后续研究）</strong><br>
              • GPT-3 Zero-Shot: ~0%<br>
              • GPT-3 Few-Shot: ~10%<br>
              → 催生了 Codex（GitHub Copilot 的基础）
            </div>
          `
        },
        {
          type: 'pitfalls',
          title: '⚠️ GPT-3 的局限性（论文坦诚讨论）',
          items: [
            '幻觉问题：会自信地生成错误信息，尤其是需要精确知识的任务',
            '常识推理弱：在需要物理常识、因果推理的任务上表现不佳',
            '长文本理解：2048 tokens 的 Context Window 限制了长文档处理',
            '偏见和有害内容：训练数据包含互联网内容，继承了社会偏见',
            '样本效率低：Few-Shot 需要 10-100 个例子，人类只需 1-2 个',
            '无法持续学习：预训练后知识冻结，无法更新到新信息'
          ]
        },
        {
          type: 'concept',
          title: '🔮 GPT-3 的历史影响',
          html: `
            <div style="margin:14px 0;padding:14px;background:rgba(251,191,36,.1);border-left:3px solid var(--yellow);border-radius:8px;line-height:1.9">
              <strong>GPT-3 之后的演进路径：</strong><br><br>

              <strong>2021 - Codex</strong><br>
              在代码数据上继续训练 GPT-3 → GitHub Copilot<br><br>

              <strong>2022 - InstructGPT</strong><br>
              用 RLHF 对齐 GPT-3 → ChatGPT 的技术基础<br><br>

              <strong>2022 - ChatGPT</strong><br>
              InstructGPT + 对话优化 → 引爆 AI 热潮<br><br>

              <strong>2023 - GPT-4</strong><br>
              更大规模（估计 1.8T）+ 多模态 → 当前 SOTA<br><br>

              <strong>2024 - Claude 3 / Gemini 1.5</strong><br>
              长上下文（200K tokens）+ 更强推理能力
            </div>
            <div style="margin-top:16px;padding:12px;background:rgba(0,229,255,.05);border-left:3px solid var(--cyan);border-radius:8px;font-size:.9rem">
              💡 <strong>核心启示：</strong><br>
              GPT-3 证明了"规模是关键"——足够大的模型会涌现出新能力。<br>
              这个发现重塑了整个 AI 行业的研发方向。
            </div>
          `
        },
        {
          type: 'quiz',
          q: 'GPT-3 论文最核心的发现是什么？',
          opts: [
            'Transformer 架构比 RNN 更好',
            '当模型足够大时，可以通过 In-Context Learning（Few-Shot）完成任务，无需微调',
            'RLHF 可以让模型更安全',
            '代码生成能力很强'
          ],
          ans: 1,
          feedback_ok: '🔥 完美！In-Context Learning 是 GPT-3 的核心突破。这个发现改变了 AI 的使用方式——从"每个任务都要微调"变成"给几个例子就能做"。这也是为什么 ChatGPT 可以做各种任务而不需要专门训练。',
          feedback_err: 'GPT-3 的核心贡献是发现了 In-Context Learning（Few-Shot）能力。当模型足够大（175B），只需要在 prompt 里给几个例子，模型就能理解任务并完成——不需要梯度更新！这是预训练范式的重大突破。'
        }
      ]
    }
  }
});
