// 关卡 9：Transformer 星（深化版）

PLANETS.push({
  id: 'p9',
  icon: '⚡',
  num: '星球 09',
  name: 'Transformer 星',
  desc: '揭秘 AI 大脑的核心零件！Attention 注意力机制！',

  difficulties: {
    // 🟢 简单模式
    easy: {
      sections: [
        {
          type: 'concept',
          title: '💡 关于 P9-P11 的说明',
          html: `
            <div style="margin:14px 0;padding:16px;background:rgba(251,191,36,.08);border-left:4px solid var(--yellow);border-radius:10px">
              <strong style="color:var(--yellow);font-size:1.1rem">💡 可选内容提示</strong><br><br>

              <p style="line-height:1.8;margin:12px 0">
                P9-P11 是深入 LLM 底层原理的<strong>可选内容</strong>：<br>
                • P9：Transformer 架构<br>
                • P10：预训练流程<br>
                • P11：后训练（RLHF）<br><br>

                <strong>如果你的目标是：</strong><br>
                ✅ 快速学会 Agent 开发 → <strong>可以跳过 P9-P11，直接去 P12 实战星</strong><br>
                ✅ 深入理解 LLM 原理 → 继续学习 P9-P11<br>
                ✅ 成为 AI 研究者 → 强烈推荐学习地狱模式<br><br>

                <strong>跳过不影响后续学习！</strong>P12 之后的内容不依赖 P9-P11 的知识。
              </p>
            </div>
          `
        },
        {
          type: 'story',
          html: `
            <div class="speaker">🚀 发现隐藏星球！</div>
            <p>ARIA 突然在雷达上发现了一颗之前没注意到的星球，闪烁着耀眼的光芒……</p>
            <div class="chat-bubble robot">
              🤖 ARIA：船长！这是 <strong style="color:var(--cyan)">Transformer 星</strong>！
              这里藏着 LLM 大脑最核心的秘密——<strong>Transformer 架构</strong>！
              现在几乎所有强大的 AI（GPT、Claude、Gemini）都用它！
            </div>
            <div class="chat-bubble">
              👦 你：Transformer？像变形金刚吗？！
            </div>
            <div class="chat-bubble robot">
              🤖 ARIA：哈哈！名字确实很酷！它是 2017 年 Google 的科学家们发明的，
              论文名字叫《Attention Is All You Need》（只需要注意力）。
              核心秘诀就是一种叫 <strong>Attention（注意力）</strong> 的机制！
            </div>
          `
        },
        {
          type: 'concept',
          title: '👁️ Attention（注意力）是什么？',
          html: `
            <p>举个例子，读这句话：</p>
            <div style="margin:14px 0;padding:14px 18px;background:rgba(0,229,255,.06);border-radius:12px;font-size:1rem;line-height:2">
              「<strong>银行</strong>的利率下降了，我去<strong>河</strong>边钓鱼。」
            </div>
            <p style="font-size:.9rem;line-height:1.7">
              人脑理解「银行」时，会<strong>注意到</strong>「利率」这个词，而不是「河」。<br>
              理解「河」时，会注意到「钓鱼」，而不是「利率」。<br><br>
              <strong style="color:var(--cyan)">Attention 机制就是让 AI 也能这样做！</strong><br>
              处理每个词时，它会计算「我应该重点看哪些其他词」——这叫做 <strong>Self-Attention（自注意力）</strong>。
            </p>
          `
        },
        {
          type: 'pipe',
          title: '⚡ Transformer 处理一句话的流程',
          nodes: [
            {icon:'📝', label:'输入文字'},
            {icon:'🔢', label:'Token化'},
            {icon:'👁️', label:'Self-Attention'},
            {icon:'🔗', label:'前馈网络'},
            {icon:'🔁', label:'重复N层'},
            {icon:'✅', label:'输出结果'},
          ]
        },
        {
          type: 'quiz',
          q: 'Transformer 的核心创新是什么？',
          opts: [
            '让 AI 从左到右一个个字地读，记住每个字',
            'Self-Attention：处理每个词时同时参考所有其他词，判断哪些最重要',
            '用更大的数据库存储所有答案',
            '让 AI 用眼睛直接看图片'
          ],
          ans: 1,
          feedback_ok: '🎉 完全正确！Self-Attention 是 Transformer 最核心的创新，让 AI 能理解上下文关系！',
          feedback_err: '关键词是「同时看所有词」！Transformer 不是一个一个字读的，而是同时处理所有词，用 Attention 决定哪些词重要！'
        }
      ]
    },

    // 🟡 困难模式
    hard: {
      sections: [
        {
          type: 'story',
          html: `
            <div class="speaker">🚀 Transformer 星（技术版）</div>
            <div class="chat-bubble robot">
              🤖 ARIA：船长！让我给你讲讲 Transformer 的技术细节。
              这是现代 LLM 的基础架构！
            </div>
          `
        },
        {
          type: 'concept',
          title: '⚡ Transformer 的核心组件',
          html: `
            <p>Transformer 的关键技术：</p>
            <ul style="margin:10px 0 0 16px;line-height:2">
              <li><strong>Self-Attention</strong>：计算每个词与其他词的关联度</li>
              <li><strong>Multi-Head Attention</strong>：从多个角度同时分析</li>
              <li><strong>Position Encoding</strong>：告诉模型词的位置信息</li>
              <li><strong>Feed Forward</strong>：每个位置独立的深度处理</li>
            </ul>
          `
        },
        {
          type: 'code',
          title: '📟 Self-Attention 核心计算',
          code: `import numpy as np

# Q, K, V 矩阵（简化版）
Q = np.random.rand(seq_len, d_model)  # Query
K = np.random.rand(seq_len, d_model)  # Key
V = np.random.rand(seq_len, d_model)  # Value

# 计算注意力权重
scores = Q @ K.T / np.sqrt(d_model)
attention_weights = softmax(scores)

# 加权求和得到输出
output = attention_weights @ V`,
          explanation: `
            <strong>关键点：</strong><br>
            • Q (Query): 当前词的"查询"<br>
            • K (Key): 其他词的"键"<br>
            • V (Value): 其他词的"值"<br>
            • Attention 权重决定每个词对当前词的重要性
          `
        },
        {
          type: 'pitfalls',
          title: '⚠️ 常见误解',
          items: [
            'Transformer 不是 RNN，不需要按顺序处理 → 可以并行计算',
            'Position Encoding 很重要 → 没有它，模型不知道词的顺序',
            'Multi-Head 不是多个模型 → 是从多个角度分析同一个输入',
            'Transformer 本身不限制长度 → 限制来自实现和计算资源'
          ]
        },
        {
          type: 'quiz',
          q: '「Attention Is All You Need」这篇论文的意思是？',
          opts: [
            'AI 需要人类时刻关注它',
            '只需要注意力机制就能建造强大的语言模型，不需要老方法',
            'AI 只能回答关于注意力的问题',
            '训练 AI 需要非常专注的工程师'
          ],
          ans: 1,
          feedback_ok: '⭐ 正确！这篇 2017 年的论文彻底改变了 AI 世界，证明仅靠 Attention 机制就能超越所有之前的方法！',
          feedback_err: '这是一篇开创时代的论文标题，意思是「只需要注意力机制」就够了！'
        }
      ]
    },

    // 🔴 地狱模式 - Attention is All You Need 论文深度解读
    hell: {
      sections: [
        {
          type: 'story',
          html: `
            <div class="speaker">🔥 地狱模式已解锁！</div>
            <div class="chat-bubble robot" style="border-color:var(--red)">
              🤖 ARIA：船长，欢迎来到地狱模式！这里我们将深度解读 2017 年改变 AI 世界的论文：
              <strong style="color:var(--red)">《Attention Is All You Need》</strong><br><br>
              作者：Vaswani et al. (Google Brain & Google Research)<br>
              发表：NIPS 2017<br>
              引用次数：>100,000+<br><br>
              这篇论文提出的 Transformer 架构成为了 GPT、BERT、T5、Claude 等所有现代 LLM 的基础！
            </div>
          `
        },
        {
          type: 'concept',
          title: '📜 论文背景与动机',
          html: `
            <p><strong>2017 年之前的问题：</strong></p>
            <ul style="margin:10px 0 0 16px;line-height:2">
              <li><strong>RNN/LSTM</strong>：必须按顺序处理，无法并行，训练慢</li>
              <li><strong>长距离依赖</strong>：信息在长序列中会衰减</li>
              <li><strong>计算效率</strong>：GPU 无法充分利用</li>
            </ul>
            <p style="margin-top:16px"><strong>Transformer 的创新：</strong></p>
            <ul style="margin:10px 0 0 16px;line-height:2">
              <li>完全基于 <strong>Attention 机制</strong>，抛弃递归和卷积</li>
              <li>可以 <strong>并行计算</strong> 所有位置</li>
              <li>直接建模 <strong>任意距离</strong> 的依赖关系</li>
              <li>训练速度提升 <strong>10x+</strong></li>
            </ul>
          `
        },
        {
          type: 'concept',
          title: '🏗️ Transformer 完整架构',
          html: `
            <p><strong>Encoder-Decoder 结构：</strong></p>
            <div style="margin:14px 0;padding:14px;background:rgba(255,0,0,.05);border-left:3px solid var(--red);line-height:1.8">
              <strong>Encoder (左侧)：</strong><br>
              • Input Embedding + Positional Encoding<br>
              • N × [ Multi-Head Self-Attention → Add&Norm → Feed Forward → Add&Norm ]<br>
              • 输出：编码后的表示<br><br>

              <strong>Decoder (右侧)：</strong><br>
              • Output Embedding + Positional Encoding<br>
              • N × [ Masked Multi-Head Self-Attention → Add&Norm → Cross-Attention → Add&Norm → Feed Forward → Add&Norm ]<br>
              • Linear + Softmax → 输出概率分布
            </div>
            <p style="font-size:.9rem;color:var(--muted)">
              论文中使用 N=6 层，d_model=512，h=8 个注意力头
            </p>
          `
        },
        {
          type: 'code',
          title: '📐 Scaled Dot-Product Attention 数学推导',
          code: `import torch
import torch.nn.functional as F

def scaled_dot_product_attention(Q, K, V, mask=None):
    """
    Q: Query  [batch, heads, seq_len, d_k]
    K: Key    [batch, heads, seq_len, d_k]
    V: Value  [batch, heads, seq_len, d_v]

    公式: Attention(Q,K,V) = softmax(QK^T / √d_k)V
    """
    d_k = Q.size(-1)

    # 1. 计算注意力分数: QK^T
    scores = torch.matmul(Q, K.transpose(-2, -1))

    # 2. 缩放: 除以 √d_k (防止梯度消失)
    scores = scores / torch.sqrt(torch.tensor(d_k, dtype=torch.float32))

    # 3. 可选：应用 mask (用于 decoder 的因果注意力)
    if mask is not None:
        scores = scores.masked_fill(mask == 0, -1e9)

    # 4. Softmax 归一化
    attention_weights = F.softmax(scores, dim=-1)

    # 5. 加权求和
    output = torch.matmul(attention_weights, V)

    return output, attention_weights`,
          explanation: `
            <strong>为什么要除以 √d_k？</strong><br>
            • 当 d_k 很大时，QK^T 的方差会很大<br>
            • 导致 softmax 进入饱和区，梯度接近 0<br>
            • 除以 √d_k 可以保持方差稳定<br><br>
            <strong>论文中的数学证明：</strong><br>
            假设 Q 和 K 的元素是独立的随机变量，均值为 0，方差为 1，<br>
            则 QK^T 的方差为 d_k，除以 √d_k 后方差变为 1
          `
        },
        {
          type: 'code',
          title: '🎯 Multi-Head Attention 完整实现',
          code: `class MultiHeadAttention(nn.Module):
    def __init__(self, d_model=512, num_heads=8):
        super().__init__()
        assert d_model % num_heads == 0

        self.d_model = d_model
        self.num_heads = num_heads
        self.d_k = d_model // num_heads  # 每个头的维度

        # 线性投影层
        self.W_q = nn.Linear(d_model, d_model)
        self.W_k = nn.Linear(d_model, d_model)
        self.W_v = nn.Linear(d_model, d_model)
        self.W_o = nn.Linear(d_model, d_model)

    def forward(self, Q, K, V, mask=None):
        batch_size = Q.size(0)

        # 1. 线性投影并分割成多个头
        Q = self.W_q(Q).view(batch_size, -1, self.num_heads, self.d_k).transpose(1, 2)
        K = self.W_k(K).view(batch_size, -1, self.num_heads, self.d_k).transpose(1, 2)
        V = self.W_v(V).view(batch_size, -1, self.num_heads, self.d_k).transpose(1, 2)

        # 2. 应用 scaled dot-product attention
        attn_output, _ = scaled_dot_product_attention(Q, K, V, mask)

        # 3. 合并多个头
        attn_output = attn_output.transpose(1, 2).contiguous()
        attn_output = attn_output.view(batch_size, -1, self.d_model)

        # 4. 最终线性投影
        output = self.W_o(attn_output)
        return output`,
          explanation: `
            <strong>Multi-Head 的优势：</strong><br>
            • 允许模型在不同的表示子空间关注不同的信息<br>
            • 8 个头可以学习 8 种不同的注意力模式<br>
            • 例如：语法关系、语义关系、位置关系等<br><br>
            <strong>参数量：</strong> 4 × d_model² (4 个线性层)
          `
        },
        {
          type: 'code',
          title: '📍 Positional Encoding 数学原理',
          code: `import numpy as np

def positional_encoding(seq_len, d_model):
    """
    PE(pos, 2i)   = sin(pos / 10000^(2i/d_model))
    PE(pos, 2i+1) = cos(pos / 10000^(2i/d_model))

    pos: 位置 (0 到 seq_len-1)
    i: 维度索引 (0 到 d_model/2-1)
    """
    pe = np.zeros((seq_len, d_model))

    position = np.arange(seq_len)[:, np.newaxis]
    div_term = np.exp(np.arange(0, d_model, 2) *
                      -(np.log(10000.0) / d_model))

    # 偶数维度使用 sin
    pe[:, 0::2] = np.sin(position * div_term)
    # 奇数维度使用 cos
    pe[:, 1::2] = np.cos(position * div_term)

    return pe`,
          explanation: `
            <strong>为什么用 sin/cos？</strong><br>
            • 可以表示任意长度的序列（外推性）<br>
            • 相对位置关系可以通过线性变换表示<br>
            • PE(pos+k) 可以表示为 PE(pos) 的线性函数<br><br>
            <strong>论文中的数学性质：</strong><br>
            对于任意固定的偏移 k，PE(pos+k) 可以表示为 PE(pos) 的线性函数，<br>
            这使得模型容易学习相对位置关系
          `
        },
        {
          type: 'concept',
          title: '🔬 论文实验结果',
          html: `
            <p><strong>机器翻译任务 (WMT 2014)：</strong></p>
            <ul style="margin:10px 0 0 16px;line-height:2">
              <li><strong>英德翻译</strong>：BLEU 28.4 (超越之前最好的模型)</li>
              <li><strong>英法翻译</strong>：BLEU 41.8 (新的 SOTA)</li>
              <li><strong>训练时间</strong>：8 个 P100 GPU，3.5 天</li>
              <li><strong>对比</strong>：之前最好的模型需要训练数周</li>
            </ul>
            <p style="margin-top:16px"><strong>消融实验 (Ablation Study)：</strong></p>
            <ul style="margin:10px 0 0 16px;line-height:2">
              <li>去掉 Positional Encoding → 性能大幅下降</li>
              <li>减少注意力头数 → 性能下降</li>
              <li>增加 d_model → 性能提升但收益递减</li>
              <li>使用学习的位置编码 vs 固定的 sin/cos → 效果相当</li>
            </ul>
          `
        },
        {
          type: 'concept',
          title: '🌟 对后续研究的影响',
          html: `
            <p><strong>Transformer 催生的重要模型：</strong></p>
            <div style="margin:14px 0;padding:14px;background:rgba(255,0,0,.05);border-left:3px solid var(--red);line-height:1.8">
              <strong>2018 - BERT</strong> (Google)：只用 Encoder，双向预训练<br>
              <strong>2018 - GPT</strong> (OpenAI)：只用 Decoder，单向生成<br>
              <strong>2019 - GPT-2</strong>：扩大规模，1.5B 参数<br>
              <strong>2019 - T5</strong> (Google)：统一的 Text-to-Text 框架<br>
              <strong>2020 - GPT-3</strong>：175B 参数，涌现能力<br>
              <strong>2021 - CLIP</strong> (OpenAI)：视觉-语言 Transformer<br>
              <strong>2022 - ChatGPT</strong>：GPT-3.5 + RLHF<br>
              <strong>2023 - GPT-4</strong>：多模态 Transformer<br>
              <strong>2024 - Claude 3</strong>：长上下文 Transformer
            </div>
            <p style="margin-top:16px;font-size:.9rem;color:var(--muted)">
              Transformer 不仅改变了 NLP，还影响了计算机视觉 (ViT)、语音识别 (Whisper)、<br>
              蛋白质结构预测 (AlphaFold2) 等多个领域！
            </p>
          `
        },
        {
          type: 'pitfalls',
          title: '⚠️ 实现中的关键细节',
          items: [
            'Layer Normalization 的位置：论文用 Post-LN，但 Pre-LN 训练更稳定（GPT-2 开始采用）',
            'Warmup 学习率调度：前 4000 步线性增加，然后按 step^(-0.5) 衰减，这对训练稳定性至关重要',
            'Dropout 的使用：在 Attention 权重、残差连接、Embedding 上都要加 Dropout (p=0.1)',
            'Label Smoothing：使用 ε=0.1 的标签平滑，防止过拟合',
            'Gradient Clipping：梯度裁剪防止梯度爆炸',
            'Attention Mask：Decoder 必须使用因果 mask，防止看到未来信息',
            '参数初始化：Xavier 初始化，对训练收敛速度影响很大',
            'Batch Size：论文使用约 25000 个 tokens/batch，需要梯度累积'
          ]
        },
        {
          type: 'quiz',
          q: 'Transformer 为什么比 RNN/LSTM 训练更快？',
          opts: [
            '因为 Transformer 的参数更少',
            '因为 Self-Attention 可以并行计算所有位置，而 RNN 必须按顺序处理',
            '因为 Transformer 使用了更好的优化器',
            '因为 Transformer 的模型更简单'
          ],
          ans: 1,
          feedback_ok: '🔥 完全正确！并行化是 Transformer 的核心优势。RNN 的 t 时刻依赖 t-1 时刻，无法并行；而 Self-Attention 可以同时计算所有位置的表示，充分利用 GPU 的并行计算能力！',
          feedback_err: '关键在于「并行计算」！RNN 必须等前一个时间步计算完才能计算下一个，而 Transformer 的 Self-Attention 可以同时处理所有位置，这是训练速度提升 10x+ 的根本原因！'
        }
      ]
    }
  }
});
