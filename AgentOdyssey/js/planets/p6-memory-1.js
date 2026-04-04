// 关卡 6：记忆星 1 - 短期记忆（完整重构）

PLANETS.push({
  id: 'p6',
  icon: '🧠',
  num: '星球 06',
  name: '记忆星 1：短期记忆',
  desc: '学习对话上下文和 Context Window。',

  difficulties: {
    // 🟢 简单模式
    easy: {
      sections: [
        {
          type: 'story',
          html: `
            <div class="speaker">🚀 降落记忆星</div>
            <p>这颗星球上到处都是水晶球，每个球里面都保存着一段记忆。ARIA 感慨地说：</p>
            <div class="chat-bubble robot">
              🤖 ARIA：Agent 如果没有记忆，每次对话都从零开始，这太糟糕了！
              记忆系统分两种：<strong>短期记忆</strong>和<strong>长期记忆</strong>。
            </div>
            <div class="chat-bubble">
              👦 你：就像我上课记笔记（短期），和回家后把知识记进大脑（长期）？
            </div>
            <div class="chat-bubble robot">
              🤖 ARIA：哇！你这个比喻太完美了！完全正确！
            </div>
          `
        },
        {
          type: 'concept',
          title: '🧠 短期记忆 = 对话上下文',
          html: `
            <div style="display:grid;grid-template-columns:1fr;gap:14px;margin-top:8px">
              <div style="background:rgba(0,229,255,.08);border:1px solid rgba(0,229,255,.2);border-radius:12px;padding:16px">
                <div style="font-size:1.5rem;margin-bottom:8px">📋</div>
                <strong style="color:var(--cyan)">短期记忆（Context Window）</strong>
                <p style="font-size:.82rem;color:var(--muted);margin-top:6px;line-height:1.6">
                  • 就是「对话历史」<br>
                  • 对话结束就消失<br>
                  • 像黑板，课后擦掉<br>
                  • Claude 支持 200K tokens（约 15 万字）
                </p>
              </div>
            </div>
            <p style="margin-top:14px;color:var(--muted);font-size:.85rem">
              💡 例如：你问「我叫什么名字？」，如果你之前在这次对话中说过，Agent 能记住。
              但如果是上次对话说的，Agent 就不记得了。
            </p>
          `
        },
        {
          type: 'quiz',
          q: '你问 AI「我上次告诉你我叫什么名字？」它却说不知道。这是什么问题？',
          opts: [
            'AI 太笨了，需要换一个更聪明的',
            '对话结束后短期记忆清空了，AI 没有长期记忆存你的名字',
            'AI 故意不告诉你',
            '网络问题导致数据丢失'
          ],
          ans: 1,
          feedback_ok: '✅ 正确！这就是「短期记忆」的限制——对话结束就清空了。需要长期记忆系统才能记住跨对话的信息！',
          feedback_err: '想想记忆的两种类型：对话内容属于「短期记忆」，对话结束后就消失了！'
        }
      ]
    },

    // 🟡 困难模式
    hard: {
      sections: [
        {
          type: 'story',
          html: `
            <div class="speaker">🚀 记忆星（技术版）</div>
            <div class="chat-bubble robot">
              🤖 ARIA：船长！让我给你讲讲 Context Window 的技术细节。
              这是 Agent 开发中最容易遇到的问题之一！
            </div>
          `
        },
        {
          type: 'concept',
          title: '🧠 Context Window 管理',
          html: `
            <p>Context Window 的关键问题：</p>
            <ul style="margin:10px 0 0 16px;line-height:2">
              <li><strong>Token 限制</strong>：每个模型都有最大 token 数（Claude: 200K）</li>
              <li><strong>超限报错</strong>：超过限制会导致 API 报错</li>
              <li><strong>成本问题</strong>：token 越多，成本越高</li>
              <li><strong>压缩策略</strong>：需要主动管理和压缩历史消息</li>
            </ul>
          `
        },
        {
          type: 'code',
          title: '📟 Context 管理示例',
          code: `def trim_context(messages, max_tokens=100000):
    """压缩对话历史，保持在 token 限制内"""

    # 简单策略：保留系统消息和最近的消息
    system_msgs = [m for m in messages if m["role"] == "system"]
    other_msgs = [m for m in messages if m["role"] != "system"]

    # 估算 token 数（粗略估计：1 token ≈ 4 字符）
    while len(str(other_msgs)) // 4 > max_tokens:
        if len(other_msgs) > 2:
            other_msgs.pop(0)  # 移除最早的消息
        else:
            break

    return system_msgs + other_msgs`,
          explanation: `
            <strong>关键点：</strong><br>
            • 保留系统消息（包含重要指令）<br>
            • 移除最早的对话（保留最近的上下文）<br>
            • 可以用更复杂的策略：摘要压缩、关键信息提取
          `
        },
        {
          type: 'pitfalls',
          title: '⚠️ 常见坑点',
          items: [
            'Context 超限导致 API 报错 → 需要主动监控和压缩',
            '盲目删除导致丢失关键信息 → 应该保留系统消息和重要上下文',
            '没有 token 计数 → 无法预知何时超限',
            '每次都发送完整历史 → 成本高，应该只发送必要的上下文'
          ]
        },
        {
          type: 'quiz',
          q: 'Context Window 超限时应该怎么办？',
          opts: [
            '直接报错，让用户重新开始',
            '压缩历史消息，保留系统消息和最近的对话',
            '增加 max_tokens 参数',
            '换一个更大的模型'
          ],
          ans: 1,
          feedback_ok: '✅ 正确！主动压缩历史消息是最常用的策略！',
          feedback_err: 'Context Window 是硬限制，需要主动压缩历史消息！'
        }
      ]
    }
  }
});
