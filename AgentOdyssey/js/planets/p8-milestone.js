// P8 完成后的里程碑 1

// 在 P8 的最后一个 section 后添加这个 milestone
// 注意：这需要手动添加到 p8-multi-agent.js 的 sections 数组末尾

const MILESTONE_1 = {
  type: 'milestone',
  icon: '🎓',
  title: '里程碑 1：Agent 基础大师',
  subtitle: '恭喜你完成了 Agent 开发的基础篇！',

  message: `
    太棒了！你已经完成了前 8 关的学习，掌握了 Agent 开发的所有基础知识。<br><br>

    从最简单的 LLM 调用，到工具调用，再到 ReAct 循环，最后到多 Agent 协作——<br>
    你已经具备了开发实用 Agent 的能力！<br><br>

    现在，你可以：<br>
    • 开发一个能调用工具的智能助手<br>
    • 实现一个具有记忆的对话 Agent<br>
    • 构建一个简单的多 Agent 协作系统
  `,

  achievements: [
    {
      icon: '🤖',
      title: 'LLM 调用大师',
      description: '掌握了 LLM 的基本调用、参数调优、Prompt 工程'
    },
    {
      icon: '🔧',
      title: '工具调用专家',
      description: '学会了设计工具定义、实现工具执行、处理工具错误'
    },
    {
      icon: '🔄',
      title: 'ReAct 循环实践者',
      description: '理解了 Thought-Action-Observation 循环，能实现自主决策'
    },
    {
      icon: '🧠',
      title: '记忆系统架构师',
      description: '掌握了滑动窗口、RAG 检索、向量数据库的使用'
    },
    {
      icon: '👥',
      title: 'Multi-Agent 入门者',
      description: '学会了设计多 Agent 架构、实现 Agent 间通信'
    }
  ],

  skills: [
    'LLM API 调用',
    'Prompt 工程',
    '工具定义与执行',
    'ReAct 循环',
    '滑动窗口记忆',
    'RAG 检索',
    '向量数据库',
    'Multi-Agent 通信',
    'Agent 协作模式'
  ],

  project: {
    icon: '🌤️',
    title: '里程碑项目：天气查询 Agent',
    description: '从零实现一个能查询天气、记住用户偏好、主动提醒的智能助手',
    requirements: [
      '实现 LLM 调用和 Prompt 设计',
      '集成天气 API 工具（如 OpenWeatherMap）',
      '实现 ReAct 循环，让 Agent 自主决定何时调用工具',
      '添加记忆系统，记住用户的常用城市',
      '实现对话历史管理（滑动窗口）',
      '（可选）添加主动提醒功能（如"明天会下雨，记得带伞"）'
    ],
    hints: [
      '可以参考 P12 实战星 1 的代码结构',
      '先实现基础功能，再逐步添加记忆和主动提醒',
      '测试时多问几个不同的问题，检验 ReAct 循环是否正确',
      '记忆系统可以用简单的 JSON 文件存储，不一定要用向量数据库'
    ]
  },

  next_steps: [
    '完成里程碑项目，巩固所学知识',
    '继续学习 P9-P11（深入 LLM 底层原理）或直接跳到 P12（实战项目）',
    '如果想深入理论，选择 P9-P11；如果想快速实践，选择 P12-P13',
    '完成 P16 后，你将达到里程碑 2：生产级 Agent 开发者'
  ]
};

// 使用说明：
// 将这个 milestone section 添加到 p8-multi-agent.js 的 sections 数组末尾
// 例如：
// easy: {
//   sections: [
//     { type: 'story', ... },
//     { type: 'concept', ... },
//     ...
//     { type: 'quiz', ... },
//     MILESTONE_1  // 添加在这里
//   ]
// }
