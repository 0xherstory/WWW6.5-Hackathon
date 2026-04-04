// 关卡 3：工具星 2 - 工具执行（完整重构）

PLANETS.push({
  id: 'p3',
  icon: '🔧',
  num: '星球 03',
  name: '工具星 2：工具执行',
  desc: '学习如何执行工具和处理错误。',

  difficulties: {
    // 🟢 简单模式
    easy: {
      sections: [
        {
          type: 'story',
          html: `
            <div class="speaker">🚀 工具星深处</div>
            <p>ARIA 带你来到工具星的核心区域：</p>
            <div class="chat-bubble robot">
              🤖 ARIA：船长！定义工具只是第一步，更重要的是<strong>执行工具</strong>！
              当 LLM 决定使用工具时，我们要真正地调用代码，获取结果，再返回给 LLM。
            </div>
            <div class="chat-bubble">
              👦 你：如果工具出错了怎么办？
            </div>
            <div class="chat-bubble robot">
              🤖 ARIA：好问题！这就是<strong>错误处理</strong>的重要性！
              我们要捕获错误，并把错误信息告诉 LLM，让它能自我修复！
            </div>
          `
        },
        {
          type: 'concept',
          title: '⚙️ 工具执行流程',
          html: `
            <p>完整的工具执行包含：</p>
            <ul style="margin:10px 0 0 16px;line-height:2.2">
              <li>1️⃣ LLM 决定调用工具，返回工具名和参数</li>
              <li>2️⃣ 程序执行对应的函数</li>
              <li>3️⃣ 捕获可能的错误</li>
              <li>4️⃣ 把结果（或错误）返回给 LLM</li>
              <li>5️⃣ LLM 继续处理或重试</li>
            </ul>
          `
        },
        {
          type: 'quiz',
          q: '如果工具执行出错，应该怎么办？',
          opts: [
            '直接让程序崩溃',
            '捕获错误，把错误信息返回给 LLM，让它能自我修复',
            '忽略错误，假装成功',
            '重启整个 Agent'
          ],
          ans: 1,
          feedback_ok: '✅ 正确！把错误信息返回给 LLM，它就能知道出了什么问题，并尝试修复！',
          feedback_err: '记住：错误信息对 LLM 很重要，它能根据错误调整策略！'
        }
      ]
    },

    // 🟡 困难模式
    hard: {
      sections: [
        {
          type: 'story',
          html: `
            <div class="speaker">🚀 工具星深处（技术版）</div>
            <div class="chat-bubble robot">
              🤖 ARIA：船长！让我给你讲讲工具执行的技术细节。
              错误处理是生产级 Agent 的关键！
            </div>
          `
        },
        {
          type: 'concept',
          title: '⚙️ 工具执行的关键要素',
          html: `
            <p>生产级工具执行需要考虑：</p>
            <ul style="margin:10px 0 0 16px;line-height:2">
              <li><strong>参数验证</strong>：检查参数类型和必需字段</li>
              <li><strong>超时处理</strong>：避免工具执行时间过长</li>
              <li><strong>错误捕获</strong>：try-catch 捕获所有异常</li>
              <li><strong>错误信息</strong>：返回清晰的错误描述给 LLM</li>
              <li><strong>重试机制</strong>：对于网络错误等可重试的情况</li>
            </ul>
          `
        },
        {
          type: 'code',
          title: '📟 工具执行示例',
          code: `def execute_tool(tool_name, tool_input):
    try:
        if tool_name == "get_weather":
            return get_weather(**tool_input)
    except KeyError as e:
        return {"error": f"缺少参数: {e}"}
    except Timeout:
        return {"error": "API 超时"}
    except Exception as e:
        return {"error": str(e)}`,
          explanation: `
            <strong>关键点：</strong><br>
            • 使用 try-catch 捕获所有可能的异常<br>
            • 针对不同错误类型返回不同的错误信息<br>
            • 错误信息要清晰，让 LLM 能理解出了什么问题
          `
        },
        {
          type: 'pitfalls',
          title: '⚠️ 常见坑点',
          items: [
            '工具超时没处理 → Agent 卡死，用户体验极差',
            '错误信息不返回给 LLM → Agent 无法自我修复，一直重复错误',
            '没有参数验证 → 可能导致安全问题（如 SQL 注入）',
            '同步执行耗时工具 → 阻塞整个 Agent，应该用异步'
          ]
        },
        {
          type: 'quiz',
          q: '为什么要把错误信息返回给 LLM？',
          opts: [
            '让 LLM 知道出错了，可以调整策略或重试',
            '为了让程序崩溃',
            '为了记录日志',
            '没有必要返回错误信息'
          ],
          ans: 0,
          feedback_ok: '✅ 完全正确！LLM 能根据错误信息调整策略，这是 Agent 自我修复的关键！',
          feedback_err: '错误信息是 LLM 自我修复的关键！它能根据错误调整策略。'
        }
      ]
    }
  }
});
