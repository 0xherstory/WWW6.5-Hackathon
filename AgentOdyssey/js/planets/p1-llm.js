// 关卡 1：LLM 星（完整重构，包含简单和困难两个难度）

PLANETS.push({
  id: 'p1',
  icon: '🌍',
  num: '星球 01',
  name: 'LLM 星',
  desc: '认识 AI 大脑！了解语言模型是什么。',

  difficulties: {
    // 🟢 简单模式：适合小学生
    easy: {
      sections: [
        {
          type: 'story',
          html: `
            <div class="speaker">🚀 船长日志 — 第1天</div>
            <p>你驾驶飞船来到了第一颗星球 —— <strong style="color:var(--cyan)">LLM 星</strong>。</p>
            <p style="margin-top:10px">你的副驾驶机器人 <strong>ARIA</strong> 跳了出来说：</p>
            <div class="chat-bubble robot">
              🤖 ARIA：船长！这颗星球住着一个超级大脑！它叫 <strong>LLM</strong>（Large Language Model，大语言模型）。
              它读过地球上几乎所有的书！所以你问它什么，它都能回答！
            </div>
            <p>你好奇地问道：</p>
            <div class="chat-bubble">
              👦 你：那它是怎么工作的？
            </div>
            <div class="chat-bubble robot">
              🤖 ARIA：很简单！你给它一段话，它就预测下一个词最可能是什么，
              然后再预测下下个词……就这样一个词一个词地接下去，就变成了一段完整的回答！
            </div>
          `
        },
        {
          type: 'concept',
          title: '💡 核心概念',
          html: `
            <p><strong style="color:var(--cyan)">LLM = 大语言模型</strong></p>
            <p style="margin-top:8px">它就像一个超级读书机器：</p>
            <ul style="margin:10px 0 0 16px;line-height:2">
              <li>📖 学过几乎所有人类写过的文字</li>
              <li>🔮 每次预测「下一个词」来生成回答</li>
              <li>💬 只能处理文字——不能自己上网、不能自己执行代码</li>
            </ul>
            <p style="margin-top:12px;color:var(--muted);font-size:.85rem">
              ⚠️ 重点：LLM 本身<strong>只会说话</strong>，不会<strong>做事</strong>。这就是为什么我们需要 Agent！
            </p>
          `
        },
        {
          type: 'pipe',
          title: '🔁 LLM 工作流程',
          nodes: [
            {icon:'💬', label:'你的问题'},
            {icon:'🧠', label:'LLM 思考'},
            {icon:'📝', label:'预测词语'},
            {icon:'✅', label:'输出答案'},
          ]
        },
        {
          type: 'quiz',
          q: 'LLM 最擅长做什么事情？',
          opts: ['自动上网搜索资料','控制机器人手臂','理解和生成文字','计算超级复杂的数学题'],
          ans: 2,
          feedback_ok: '🎉 完全正确！LLM 的核心能力就是理解和生成文字！',
          feedback_err: '再想想～LLM 的名字里有"Language"（语言），它最擅长的当然是文字！'
        }
      ]
    },

    // 🟡 困难模式：适合工程师
    hard: {
      sections: [
        {
          type: 'story',
          html: `
            <div class="speaker">🚀 船长日志 — 第1天（技术版）</div>
            <p>你驾驶飞船来到了第一颗星球 —— <strong style="color:var(--cyan)">LLM 星</strong>。</p>
            <div class="chat-bubble robot">
              🤖 ARIA：船长！让我给你讲讲 LLM 的技术细节。
              现代 LLM（如 GPT-4、Claude）都是基于 Transformer 架构的自回归语言模型。
            </div>
          `
        },
        {
          type: 'concept',
          title: '🔧 LLM 核心技术',
          html: `
            <p><strong style="color:var(--cyan)">LLM 的工作原理</strong></p>
            <ul style="margin:10px 0 0 16px;line-height:2">
              <li><strong>Token 化</strong>：将文本切分成 token（词元），每个 token 对应一个数字 ID</li>
              <li><strong>自回归生成</strong>：根据前面的 token 预测下一个 token，逐个生成</li>
              <li><strong>Context Window</strong>：模型能"记住"的上下文长度（如 Claude 支持 200K tokens）</li>
              <li><strong>Temperature</strong>：控制输出随机性，0=确定性，1=创造性</li>
            </ul>
          `
        },
        {
          type: 'code',
          title: '📟 LLM API 调用示例',
          code: `import anthropic

client = anthropic.Anthropic(api_key="your-key")

response = client.messages.create(
    model="claude-opus-4-6",
    max_tokens=1024,
    temperature=0.7,  # 控制随机性
    messages=[
        {"role": "user", "content": "解释量子计算"}
    ]
)

print(response.content[0].text)`,
          explanation: `
            <strong>核心参数说明：</strong><br>
            • <code>model</code>: 选择模型（opus 最强，sonnet 平衡，haiku 最快）<br>
            • <code>max_tokens</code>: 最大输出长度<br>
            • <code>temperature</code>: 0-1，越高越有创造性<br>
            • <code>messages</code>: 对话历史，包含 role 和 content
          `
        },
        {
          type: 'pitfalls',
          title: '⚠️ 常见坑点',
          items: [
            'Context Window 超限导致 API 报错 → 需要压缩或截断历史消息',
            'Temperature 设置不当：0 太死板，1 太随机 → 通常用 0.7',
            '没有处理 API 超时和重试 → 生产环境必须加 try-catch 和重试逻辑',
            '忘记计算 token 成本 → 大量调用可能产生高额费用'
          ]
        },
        {
          type: 'quiz',
          q: 'Context Window 的作用是什么？',
          opts: [
            '控制 LLM 输出的随机性',
            '限制 LLM 能"记住"的上下文长度',
            '加快 LLM 的推理速度',
            '提高 LLM 的准确性'
          ],
          ans: 1,
          feedback_ok: '✅ 正确！Context Window 决定了 LLM 能处理多长的上下文。超过限制就会报错。',
          feedback_err: 'Context Window 是关于"记忆长度"的概念，不是速度或准确性！'
        }
      ]
    }
  }
});
