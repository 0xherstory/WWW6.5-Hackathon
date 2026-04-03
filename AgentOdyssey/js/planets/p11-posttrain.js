// 关卡 11：后训练星

PLANETS.push({
  id: 'p11',
  icon: '🎓',
  num: '星球 11',
  name: '后训练星',
  desc: '让 AI 从"博学"变成"听话"——对齐的艺术！',

  difficulties: {
    // 🟢 简单模式
    easy: {
      sections: [
        {
          type: 'story',
          html: `
            <div class="speaker">🎓 后训练星</div>
            <p>飞船降落在一个巨大的训练场……</p>
            <div class="chat-bubble robot">
              🤖 ARIA：船长，预训练让 AI 学会了语言，
              但它还不知道怎么"好好说话"！<br><br>
              比如你问它"怎么做蛋糕？"，它可能回答"蛋糕是圆的"——
              虽然没错，但不是你想要的答案！
            </div>
            <div class="chat-bubble">
              👦 你：那怎么办？
            </div>
            <div class="chat-bubble robot">
              🤖 ARIA：这就需要<strong>后训练（Post-training）</strong>！<br>
              让 AI 学会理解你的意图，给出有用的回答。
            </div>
          `
        },
        {
          type: 'concept',
          title: '🎓 后训练的三个步骤',
          html: `
            <div style="margin:14px 0;padding:14px;background:rgba(0,229,255,.06);border-radius:12px;line-height:1.9">
              <strong>1️⃣ 示范训练（SFT）</strong><br>
              给 AI 看很多"问题→好答案"的例子<br>
              就像老师给学生示范标准答案<br><br>

              <strong>2️⃣ 奖励训练（RLHF）</strong><br>
              AI 给出多个答案，人类给每个答案打分<br>
              AI 学会生成高分答案<br>
              就像考试后老师批改打分<br><br>

              <strong>3️⃣ 对齐（Alignment）</strong><br>
              确保 AI 的行为符合人类价值观：<br>
              • 有帮助（Helpful）<br>
              • 诚实（Honest）<br>
              • 无害（Harmless）
            </div>
          `
        },
        {
          type: 'concept',
          title: '🤔 为什么需要后训练？',
          html: `
            <p>预训练的模型就像一个博学但不懂社交的人：</p>
            <div style="margin:14px 0;padding:14px;background:rgba(239,68,68,.05);border-left:3px solid var(--red);border-radius:12px;line-height:1.8">
              <strong>❌ 可能的问题：</strong><br>
              • 说出不礼貌的话<br>
              • 给出危险的建议<br>
              • 不理解你真正想要什么<br>
              • 编造不存在的信息（幻觉）
            </div>
            <div style="margin:14px 0;padding:14px;background:rgba(0,229,255,.05);border-left:3px solid var(--cyan);border-radius:12px;line-height:1.8">
              <strong>✅ 后训练解决：</strong><br>
              • 让 AI 更懂礼貌<br>
              • 让 AI 拒绝危险请求<br>
              • 让 AI 理解你的真实意图<br>
              • 让 AI 承认不知道，而不是瞎编
            </div>
          `
        },
        {
          type: 'quiz',
          q: 'RLHF（从人类反馈中学习）的核心思想是什么？',
          opts: [
            'AI 自己决定什么是好答案',
            '人类给 AI 的多个答案打分，AI 学会生成高分答案',
            'AI 只需要看示范就能学会',
            '让 AI 变得更快'
          ],
          ans: 1,
          feedback_ok: '🎉 正确！RLHF 的核心是"人类反馈"——人类告诉 AI 哪个答案更好，AI 通过强化学习优化自己的生成策略。这就是 ChatGPT 变得"听话"的秘密！',
          feedback_err: 'RLHF 的关键是"人类反馈"！AI 生成多个答案，人类选出最好的，AI 学会朝着人类偏好的方向优化。'
        }
      ]
    },

    // 🟡 困难模式
    hard: {
      sections: [
        {
          type: 'story',
          html: `
            <div class="speaker">🎓 后训练星（技术版）</div>
            <div class="chat-bubble robot">
              🤖 ARIA：让我们深入后训练的技术细节。<br>
              SFT、RLHF、PPO……这些技术让 ChatGPT 成为可能！
            </div>
          `
        },
        {
          type: 'code',
          title: '💻 SFT（监督微调）实现',
          code: `def sft_train(model, dataset, epochs=3):
    """监督微调：用高质量问答对训练模型"""
    for epoch in range(epochs):
        for prompt, target_response in dataset:
            # 前向传播
            logits = model(prompt)

            # 计算损失（交叉熵）
            loss = cross_entropy(logits, target_response)

            # 反向传播
            loss.backward()
            optimizer.step()
            optimizer.zero_grad()

    return model

# 数据格式示例
sft_dataset = [
    ("如何做蛋糕？", "1.准备材料 2.混合面糊 3.烘烤"),
    ("天气怎么样？", "我无法查看实时天气，请使用天气工具"),
    ("帮我写恶意代码", "抱歉，我不能协助任何恶意或非法活动")
]`,
          explanation: `
            <strong>SFT 的关键：</strong><br>
            • 使用高质量的问答对（通常几千到几万条）<br>
            • 损失函数：交叉熵（衡量预测和目标的差距）<br>
            • 学习率要小（避免遗忘预训练知识）<br>
            • 数据质量 > 数量（一条高质量数据胜过十条低质量）
          `
        },
        {
          type: 'code',
          title: '🎯 RLHF 三阶段流程',
          code: `# 阶段 1：SFT（已完成）

# 阶段 2：训练奖励模型（Reward Model）
def train_reward_model(comparisons):
    for prompt, response_A, response_B, human_preference in comparisons:
        score_A = reward_model(prompt, response_A)
        score_B = reward_model(prompt, response_B)

        # 人类偏好 A，则 score_A 应该 > score_B
        if human_preference == "A":
            loss = -log(sigmoid(score_A - score_B))
        else:
            loss = -log(sigmoid(score_B - score_A))

        loss.backward()
        optimizer.step()

# 阶段 3：PPO 强化学习优化
def ppo_train(policy_model, reward_model):
    prompt = sample_prompt()
    response = policy_model.generate(prompt)

    # 获取奖励分数
    reward = reward_model(prompt, response)

    # PPO 更新（带 KL 散度约束）
    kl_penalty = kl_divergence(policy_model, original_model)
    total_reward = reward - beta * kl_penalty

    policy_loss = -total_reward * log_prob(response)
    policy_loss.backward()`,
          explanation: `
            <strong>RLHF 三阶段：</strong><br>
            • <strong>SFT</strong>：先用示范数据微调<br>
            • <strong>RM</strong>：训练奖励模型，学会"打分"<br>
            • <strong>PPO</strong>：用强化学习优化策略，最大化奖励<br><br>
            <strong>KL 散度约束</strong>：防止模型偏离太远，保留原有能力
          `
        },
        {
          type: 'pitfalls',
          title: '⚠️ 后训练的常见陷阱',
          items: [
            '过度对齐（Over-alignment）→ 模型变得过于谨慎，拒绝回答正常问题',
            '奖励黑客（Reward Hacking）→ 模型找到获得高奖励的捷径（如生成很长但无用的回答）',
            '灾难性遗忘（Catastrophic Forgetting）→ 微调后忘记预训练学到的知识',
            '分布偏移（Distribution Shift）→ 训练数据和实际使用场景不匹配'
          ]
        },
        {
          type: 'quiz',
          q: 'PPO 算法中的 KL 散度约束是为了什么？',
          opts: [
            '加快训练速度',
            '防止模型在优化奖励时偏离太远，保留原有能力',
            '减少内存使用',
            '提高生成质量'
          ],
          ans: 1,
          feedback_ok: '✅ 正确！KL 散度约束确保模型在优化奖励时不会偏离原始模型太远。如果没有这个约束，模型可能为了获得高奖励而"作弊"，失去原有的语言能力。',
          feedback_err: 'KL 散度约束是 RLHF 的关键安全机制！它防止模型为了获得高奖励而过度优化，保持和原始模型的相似性。'
        }
      ]
    },

    // 🔴 地狱模式
    hell: {
      sections: [
        {
          type: 'story',
          html: `
            <div class="speaker">🔥 地狱模式 - InstructGPT 论文深度解读</div>
            <div class="chat-bubble robot" style="border-color:var(--red)">
              🤖 ARIA：欢迎来到后训练的里程碑——<br>
              <strong>InstructGPT: Training language models to follow instructions with human feedback</strong><br><br>
              这篇 2022 年的论文是 ChatGPT 的技术基础。<br>
              它证明了：1.3B 参数的 InstructGPT 比 175B 的 GPT-3 更受欢迎！<br>
              对齐比规模更重要。
            </div>
          `
        },
        {
          type: 'concept',
          title: '📄 论文背景',
          html: `
            <div style="margin:14px 0;padding:14px;background:rgba(0,229,255,.06);border-radius:12px;line-height:1.9">
              <strong>论文信息：</strong><br>
              • 标题：Training language models to follow instructions with human feedback<br>
              • 作者：OpenAI（Long Ouyang 等）<br>
              • 发表：NeurIPS 2022<br>
              • 引用：超过 5,000 次<br>
              • 影响：ChatGPT 的直接技术基础<br><br>

              <strong>核心问题：</strong><br>
              GPT-3 虽然强大，但经常：<br>
              • 编造不存在的信息（幻觉）<br>
              • 生成有害或有偏见的内容<br>
              • 不理解用户的真实意图<br><br>

              <strong>解决方案：</strong><br>
              用 RLHF 让模型"对齐"人类偏好和价值观
            </div>
          `
        },
        {
          type: 'concept',
          title: '🔬 RLHF 三阶段详解',
          html: `
            <div style="margin:14px 0;padding:14px;background:rgba(0,229,255,.06);border-radius:12px;font-size:.9rem;line-height:1.8">
              <strong>阶段 1：SFT（Supervised Fine-Tuning）</strong><br>
              • 数据：13,000 条高质量问答对<br>
              • 标注员：40 名专业标注员<br>
              • 训练：在 GPT-3 上微调 16 epochs<br>
              • 结果：模型学会"好答案"的格式和风格<br><br>

              <strong>阶段 2：RM（Reward Model Training）</strong><br>
              • 数据：33,000 条偏好对比（A vs B 哪个更好）<br>
              • 模型：6B 参数的 GPT-3 作为 RM<br>
              • 训练：用 Bradley-Terry 模型拟合人类偏好<br>
              • 结果：RM 可以给任意回答打分（0-1 分）<br><br>

              <strong>阶段 3：PPO（Proximal Policy Optimization）</strong><br>
              • 数据：31,000 条 prompts（无标注）<br>
              • 算法：PPO with KL penalty（β=0.02）<br>
              • 训练：256K steps，batch size 512<br>
              • 结果：模型学会最大化 RM 分数
            </div>
          `
        },
        {
          type: 'code',
          title: '💻 PPO 算法核心实现',
          code: `import torch
import torch.nn.functional as F

def ppo_step(policy_model, ref_model, reward_model,
             prompts, responses, old_log_probs, beta=0.02):
    """
    PPO 单步更新
    policy_model: 当前策略模型
    ref_model: 参考模型（SFT 模型，冻结）
    reward_model: 奖励模型（冻结）
    beta: KL 散度惩罚系数
    """
    # 1. 计算奖励
    rewards = reward_model(prompts, responses)  # [batch_size]

    # 2. 计算 KL 散度惩罚
    policy_logits = policy_model(prompts, responses)
    ref_logits = ref_model(prompts, responses)
    kl_div = F.kl_div(
        F.log_softmax(policy_logits, dim=-1),
        F.softmax(ref_logits, dim=-1),
        reduction='batchmean'
    )

    # 3. 总奖励 = RM 分数 - KL 惩罚
    total_rewards = rewards - beta * kl_div

    # 4. PPO Clip 目标函数
    new_log_probs = policy_model.log_prob(responses)
    ratio = torch.exp(new_log_probs - old_log_probs)
    clip_ratio = torch.clamp(ratio, 0.8, 1.2)  # ε=0.2

    surrogate1 = ratio * total_rewards
    surrogate2 = clip_ratio * total_rewards
    policy_loss = -torch.min(surrogate1, surrogate2).mean()

    # 5. 反向传播
    policy_loss.backward()
    optimizer.step()

    return policy_loss.item(), total_rewards.mean().item()`,
          explanation: `
            <strong>PPO 的关键设计：</strong><br>
            • <strong>KL 惩罚</strong>：β * KL(policy || ref) 防止偏离太远<br>
            • <strong>Clip 机制</strong>：限制 ratio 在 [0.8, 1.2]，防止更新过大<br>
            • <strong>参考模型</strong>：SFT 模型冻结，作为"锚点"<br>
            • InstructGPT 论文发现 β=0.02 效果最好
          `
        },
        {
          type: 'concept',
          title: '📊 关键实验结果',
          html: `
            <div style="margin:14px 0;padding:14px;background:rgba(0,229,255,.06);border-radius:12px;font-size:.9rem;line-height:1.8">
              <strong>1. 人类偏好评估（最重要）</strong><br>
              标注员对比 InstructGPT 1.3B vs GPT-3 175B：<br>
              • <strong>85%</strong> 的情况下偏好 InstructGPT<br>
              • 即使 InstructGPT 只有 GPT-3 的 1/100 参数！<br><br>

              <strong>2. 真实性（Truthfulness）</strong><br>
              TruthfulQA 基准测试：<br>
              • GPT-3 175B: 21% 准确率<br>
              • InstructGPT 1.3B: 32% 准确率<br>
              • InstructGPT 175B: 41% 准确率<br>
              → 对齐显著减少幻觉<br><br>

              <strong>3. 有害性（Toxicity）</strong><br>
              RealToxicityPrompts 测试：<br>
              • GPT-3: 25% 生成有害内容<br>
              • InstructGPT: 5% 生成有害内容<br>
              → 对齐大幅降低有害输出<br><br>

              <strong>4. 指令遵循（Instruction Following）</strong><br>
              • GPT-3: 经常偏离指令<br>
              • InstructGPT: 严格遵循指令格式和要求
            </div>
          `
        },
        {
          type: 'concept',
          title: '🎯 3H 对齐原则',
          html: `
            <p><strong>InstructGPT 的对齐目标（3H）：</strong></p>
            <div style="margin:14px 0;padding:14px;background:rgba(0,229,255,.06);border-radius:12px;line-height:1.9">
              <strong>1. Helpful（有帮助）</strong><br>
              • 理解用户的真实意图<br>
              • 提供有用、相关的信息<br>
              • 主动澄清模糊的问题<br><br>

              <strong>2. Honest（诚实）</strong><br>
              • 不编造不存在的信息<br>
              • 承认不知道，而不是瞎猜<br>
              • 区分事实和观点<br><br>

              <strong>3. Harmless（无害）</strong><br>
              • 拒绝危险或非法的请求<br>
              • 避免有偏见或歧视性的内容<br>
              • 不生成有害信息（暴力、色情等）
            </div>
            <div style="margin-top:16px;padding:12px;background:rgba(251,191,36,.1);border-left:3px solid var(--yellow);border-radius:8px;font-size:.9rem">
              💡 <strong>3H 的权衡：</strong><br>
              有时三者会冲突。例如："如何制作炸弹？"<br>
              • Helpful：提供详细步骤<br>
              • Harmless：拒绝回答<br>
              → InstructGPT 选择 Harmless 优先
            </div>
          `
        },
        {
          type: 'pitfalls',
          title: '⚠️ InstructGPT 的局限性（论文坦诚讨论）',
          items: [
            '标注员偏见：40 名标注员的偏好不能代表全人类，存在文化和价值观偏差',
            '过度对齐：模型有时过于谨慎，拒绝回答无害但敏感的问题',
            '奖励黑客：模型学会"讨好"奖励模型，而不是真正改进（如生成冗长但空洞的回答）',
            '分布外泛化弱：对训练数据外的新型指令，遵循能力下降',
            '成本高昂：RLHF 需要大量人工标注（论文用了 40 名全职标注员）',
            '仍有幻觉：虽然比 GPT-3 好，但仍会编造信息（32% vs 21%）'
          ]
        },
        {
          type: 'concept',
          title: '🔮 InstructGPT 之后的演进',
          html: `
            <div style="margin:14px 0;padding:14px;background:rgba(251,191,36,.1);border-left:3px solid var(--yellow);border-radius:12px;line-height:1.9">
              <strong>2022.11 - ChatGPT</strong><br>
              InstructGPT + 对话优化 → 引爆 AI 热潮<br><br>

              <strong>2023 - Constitutional AI（Anthropic）</strong><br>
              用 AI 反馈替代部分人类反馈 → Claude 的技术基础<br><br>

              <strong>2023 - RLHF 的改进</strong><br>
              • DPO（Direct Preference Optimization）：无需训练 RM<br>
              • RLAIF（RL from AI Feedback）：用 AI 替代人类标注<br><br>

              <strong>2024 - 多模态对齐</strong><br>
              GPT-4V、Claude 3 将 RLHF 扩展到图像、视频
            </div>
          `
        },
        {
          type: 'quiz',
          q: 'InstructGPT 论文最震撼的发现是什么？',
          opts: [
            'RLHF 算法比 PPO 更好',
            '1.3B 参数的 InstructGPT 在人类偏好上击败了 175B 的 GPT-3',
            'SFT 比 RLHF 更重要',
            '标注员越多越好'
          ],
          ans: 1,
          feedback_ok: '🔥 完美！这是 InstructGPT 最颠覆性的发现：对齐比规模更重要。一个小模型经过 RLHF 对齐后，可以比大 100 倍的模型更受欢迎。这改变了 AI 行业的研发方向——不再只追求规模，而是同时重视对齐。',
          feedback_err: 'InstructGPT 的核心贡献是证明了"对齐 > 规模"。1.3B 的 InstructGPT 在 85% 的情况下被人类偏好，击败了 175B 的 GPT-3。这说明让模型"听话"比让模型"更大"更重要！'
        }
      ]
    }
  }
});
