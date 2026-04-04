// 关卡 2：工具星 1 - 工具定义（完整重构）

PLANETS.push({
  id: 'p2',
  icon: '🔧',
  num: '星球 02',
  name: '工具星 1：工具定义',
  desc: '给 AI 装上手脚！学习如何定义工具。',

  difficulties: {
    // 🟢 简单模式
    easy: {
      sections: [
        {
          type: 'story',
          html: `
            <div class="speaker">🚀 到达工具星！</div>
            <p>飞船降落在一个到处都是机械臂和工具的星球。ARIA 激动地说：</p>
            <div class="chat-bubble robot">
              🤖 ARIA：船长！这就是赋予 AI 力量的秘密！
              光靠说话没用，我们得给 LLM 安上<strong>工具（Tools）</strong>，让它能真正做事！
            </div>
            <div class="chat-bubble">
              👦 你：什么样的工具？
            </div>
            <div class="chat-bubble robot">
              🤖 ARIA：比如——搜索网络、查天气、操作文件、查数据库……
              有了工具，LLM 就从"只会说"变成了"既会说又会做"！
            </div>
          `
        },
        {
          type: 'concept',
          title: '🔧 Tool Use = 给 AI 装手脚',
          html: `
            <p>Tool Use 是 Agent 最核心的机制：</p>
            <ul style="margin:10px 0 0 16px;line-height:2.2">
              <li>🧠 LLM 决定<strong>要不要用工具</strong>、用<strong>哪个工具</strong></li>
              <li>⚙️ 程序员写好工具的<strong>实际代码</strong></li>
              <li>📨 工具把结果<strong>返回给 LLM</strong></li>
              <li>💬 LLM 用结果生成<strong>最终回答</strong></li>
            </ul>
          `
        },
        {
          type: 'quiz',
          q: 'Tool Use 的作用是什么？',
          opts: [
            '让 LLM 变得更聪明',
            '让 LLM 能执行真实的操作，比如搜索、读文件',
            '让 LLM 说话更流利',
            '让 AI 学会开飞船'
          ],
          ans: 1,
          feedback_ok: '🎉 完全正确！Tool Use 给 LLM 装上了"手脚"，让它能真正地做事！',
          feedback_err: '再想想～ Tool Use 的目标不是让 AI 更聪明，而是让它能 **执行** 真实操作！'
        }
      ]
    },

    // 🟡 困难模式
    hard: {
      sections: [
        {
          type: 'story',
          html: `
            <div class="speaker">🚀 到达工具星（技术版）</div>
            <div class="chat-bubble robot">
              🤖 ARIA：船长！让我给你讲讲工具定义的技术细节。
              在 Anthropic 的 API 中，工具定义遵循 JSON Schema 规范。
            </div>
          `
        },
        {
          type: 'concept',
          title: '🔧 工具定义的核心要素',
          html: `
            <p>一个完整的工具定义包含：</p>
            <ul style="margin:10px 0 0 16px;line-height:2">
              <li><strong>name</strong>：工具名称（函数名风格，如 get_weather）</li>
              <li><strong>description</strong>：清晰描述工具的作用（LLM 靠这个决定是否使用）</li>
              <li><strong>input_schema</strong>：参数定义（JSON Schema 格式）</li>
            </ul>
          `
        },
        {
          type: 'code',
          title: '📟 工具定义示例',
          code: `tools = [{
    "name": "get_weather",
    "description": "获取指定城市的天气信息",
    "input_schema": {
        "type": "object",
        "properties": {
            "city": {
                "type": "string",
                "description": "城市名称，如'北京'"
            }
        },
        "required": ["city"]
    }
}]`,
          explanation: `
            <strong>关键点：</strong><br>
            • <code>description</code> 要清晰明确，LLM 靠它判断是否使用这个工具<br>
            • <code>properties</code> 定义每个参数的类型和说明<br>
            • <code>required</code> 指定哪些参数是必需的
          `
        },
        {
          type: 'pitfalls',
          title: '⚠️ 常见坑点',
          items: [
            'description 模糊导致 LLM 误用工具 → 要写清楚工具的具体用途',
            '缺少 required 字段导致参数缺失 → 必须明确哪些参数是必需的',
            '参数类型定义不严格 → 可能导致运行时错误',
            '工具名称不规范 → 使用 snake_case，避免特殊字符'
          ]
        },
        {
          type: 'quiz',
          q: '工具定义中最重要的是什么？',
          opts: [
            '工具的名称要好听',
            'description 要清晰明确，让 LLM 知道何时使用',
            '参数越多越好',
            '工具的代码要写得很复杂'
          ],
          ans: 1,
          feedback_ok: '✅ 正确！description 是 LLM 决定是否使用工具的关键依据！',
          feedback_err: '记住：LLM 靠 description 来判断是否使用工具，所以它最重要！'
        }
      ]
    }
  }
});
