// 关卡 4：ReAct 星 1 - 基础循环（完整重构）

PLANETS.push({
  id: 'p4',
  icon: '🔁',
  num: '星球 04',
  name: 'ReAct 星 1：基础循环',
  desc: '学会 Agent 的思维方式：思考→行动→观察！',

  difficulties: {
    // 🟢 简单模式
    easy: {
      sections: [
        {
          type: 'story',
          html: `
            <div class="speaker">🚀 进入 ReAct 星轨道</div>
            <p>这颗星球的大气层里有奇怪的循环气流。ARIA 解释说：</p>
            <div class="chat-bubble robot">
              🤖 ARIA：这颗星球代表 Agent 最重要的思维模式——<strong>ReAct</strong>！
              它不是一步到位，而是循环运作的：
              <br><br>
              🧠 <strong>Reason（思考）</strong>→ 🎯 <strong>Act（行动）</strong>→ 👀 <strong>Observe（观察）</strong>→ 再思考……
            </div>
            <div class="chat-bubble">
              👦 你：就像我解数学题一样？看题→列式→算→检查答案？
            </div>
            <div class="chat-bubble robot">
              🤖 ARIA：完全正确！你真聪明！Agent 就是这样一步一步解决问题的！
            </div>
          `
        },
        {
          type: 'concept',
          title: '🔁 ReAct 循环',
          html: `
            <p><strong style="color:var(--yellow)">ReAct = Reasoning + Acting</strong></p>
            <div style="margin-top:14px;display:flex;flex-direction:column;gap:10px">
              <div style="background:rgba(0,229,255,.08);border-radius:10px;padding:12px 16px;border-left:3px solid var(--cyan)">
                <strong>1. 🧠 思考（Reason）</strong><br>
                <span style="color:var(--muted);font-size:.85rem">Agent 分析问题：我现在知道什么？我还缺什么信息？</span>
              </div>
              <div style="background:rgba(168,85,247,.08);border-radius:10px;padding:12px 16px;border-left:3px solid var(--purple)">
                <strong>2. 🎯 行动（Act）</strong><br>
                <span style="color:var(--muted);font-size:.85rem">决定调用哪个工具，传什么参数</span>
              </div>
              <div style="background:rgba(251,191,36,.08);border-radius:10px;padding:12px 16px;border-left:3px solid var(--yellow)">
                <strong>3. 👀 观察（Observe）</strong><br>
                <span style="color:var(--muted);font-size:.85rem">看工具返回的结果，判断任务是否完成</span>
              </div>
              <div style="background:rgba(34,197,94,.08);border-radius:10px;padding:12px 16px;border-left:3px solid var(--green)">
                <strong>4. 🔄 重复或结束</strong><br>
                <span style="color:var(--muted);font-size:.85rem">如果没完成，回到第1步继续；如果完成了，输出最终答案</span>
              </div>
            </div>
          `
        },
        {
          type: 'pipe',
          title: '🔁 ReAct 循环流程',
          nodes: [
            {icon:'💬', label:'用户问题'},
            {icon:'🧠', label:'思考'},
            {icon:'🎯', label:'调用工具'},
            {icon:'👀', label:'观察结果'},
            {icon:'🔄', label:'继续或结束'},
          ]
        },
        {
          type: 'quiz',
          q: 'ReAct 循环的顺序是什么？',
          opts: [
            '行动 → 思考 → 观察',
            '思考 → 行动 → 观察',
            '观察 → 行动 → 思考',
            '直接输出答案，不需要循环'
          ],
          ans: 1,
          feedback_ok: '🎯 完全正确！思考 → 行动 → 观察 → 再思考，这就是 Agent 解决问题的方式！',
          feedback_err: '记住：要先 **思考**（我需要什么），再 **行动**（调用工具），再 **观察**（结果怎样）！'
        }
      ]
    },

    // 🟡 困难模式
    hard: {
      sections: [
        {
          type: 'story',
          html: `
            <div class="speaker">🚀 ReAct 星（技术版）</div>
            <div class="chat-bubble robot">
              🤖 ARIA：船长！让我给你讲讲 ReAct 循环的技术实现。
              这是 Agent 系统的核心循环，需要仔细处理每个步骤。
            </div>
          `
        },
        {
          type: 'concept',
          title: '🔁 ReAct 循环的关键要素',
          html: `
            <p>实现 ReAct 循环需要考虑：</p>
            <ul style="margin:10px 0 0 16px;line-height:2">
              <li><strong>循环控制</strong>：设置 max_iterations 防止无限循环</li>
              <li><strong>消息历史</strong>：维护完整的对话历史</li>
              <li><strong>停止条件</strong>：判断何时结束循环</li>
              <li><strong>错误处理</strong>：捕获工具执行错误</li>
            </ul>
          `
        },
        {
          type: 'code',
          title: '📟 ReAct 循环实现',
          code: `def react_loop(query, max_iter=5):
    messages = [{"role": "user", "content": query}]

    for i in range(max_iter):
        response = client.messages.create(
            model="claude-opus-4-6",
            max_tokens=2048,
            tools=tools,
            messages=messages
        )

        if response.stop_reason == "tool_use":
            tool_use = next(b for b in response.content
                          if b.type == "tool_use")
            result = execute_tool(tool_use.name, tool_use.input)

            messages.append({"role": "assistant", "content": response.content})
            messages.append({
                "role": "user",
                "content": [{
                    "type": "tool_result",
                    "tool_use_id": tool_use.id,
                    "content": json.dumps(result)
                }]
            })
        elif response.stop_reason == "end_turn":
            return response.content[0].text

    return "达到最大迭代次数"`,
          explanation: `
            <strong>关键点：</strong><br>
            • <code>max_iter</code>: 防止无限循环<br>
            • <code>messages</code>: 维护完整的对话历史<br>
            • <code>stop_reason</code>: 判断 LLM 是要调用工具还是结束<br>
            • 工具结果要添加到消息历史中
          `
        },
        {
          type: 'pitfalls',
          title: '⚠️ 常见坑点',
          items: [
            '没有设置 max_iterations → 可能无限循环，消耗大量 token',
            '消息历史过长 → Context Window 超限，需要压缩',
            '没有处理 stop_reason → 可能错误地继续循环',
            '工具结果格式错误 → LLM 无法理解，导致循环失败'
          ]
        },
        {
          type: 'quiz',
          q: '为什么要设置 max_iterations？',
          opts: [
            '为了让 Agent 运行得更快',
            '防止无限循环，避免消耗大量 token 和时间',
            '为了让代码看起来更专业',
            '这个参数没有实际作用'
          ],
          ans: 1,
          feedback_ok: '✅ 正确！max_iterations 是防止无限循环的关键保护机制！',
          feedback_err: 'max_iterations 是安全机制，防止 Agent 陷入无限循环！'
        }
      ]
    }
  }
});
