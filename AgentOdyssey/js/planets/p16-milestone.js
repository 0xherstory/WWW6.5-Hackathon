// P16 完成后的里程碑 2

const MILESTONE_2 = {
  type: 'milestone',
  icon: '🚀',
  title: '里程碑 2：生产级 Agent 开发者',
  subtitle: '恭喜你掌握了生产级 Agent 开发的所有技能！',

  message: `
    太棒了！你已经完成了深度篇的学习，从底层原理到实战项目，再到框架应用——<br>
    你现在具备了开发<strong>生产级 Agent 应用</strong>的能力！<br><br>

    你不仅理解了 LLM 的工作原理（Transformer、预训练、后训练），<br>
    还亲手实现了真实的 Agent 项目（天气助手、代码审查），<br>
    并且学会了使用主流框架（LangGraph、AutoGen、CrewAI）。<br><br>

    现在，你可以：<br>
    • 独立开发一个完整的 Agent 应用并部署上线<br>
    • 选择合适的框架快速构建复杂的 Agent 系统<br>
    • 理解 LLM 的底层原理，优化 Agent 性能<br>
    • 处理生产环境中的各种挑战（错误处理、性能优化、成本控制）
  `,

  achievements: [
    {
      icon: '🧠',
      title: 'LLM 原理专家',
      description: '深入理解 Transformer、Attention 机制、预训练和后训练流程'
    },
    {
      icon: '🛠️',
      title: '实战项目大师',
      description: '完成了天气助手和代码审查两个真实项目，具备实战经验'
    },
    {
      icon: '📦',
      title: '框架应用专家',
      description: '掌握了 LangGraph、AutoGen、CrewAI 三大主流框架'
    },
    {
      icon: '⚡',
      title: '性能优化高手',
      description: '学会了并发处理、缓存策略、成本控制等优化技巧'
    },
    {
      icon: '🔒',
      title: '生产级思维',
      description: '具备了错误处理、日志监控、安全防护的生产级意识'
    }
  ],

  skills: [
    'Transformer 架构',
    'Attention 机制',
    'LLM 预训练',
    'RLHF 后训练',
    'LangGraph 状态图',
    'AutoGen 对话框架',
    'CrewAI 团队协作',
    '错误处理与重试',
    '并发与异步',
    '成本优化',
    'CI/CD 集成',
    '日志与监控'
  ],

  project: {
    icon: '🔍',
    title: '里程碑项目：智能代码审查系统',
    description: '构建一个生产级的代码审查 Agent，能自动检查代码质量、生成审查报告、集成到 CI/CD 流程',
    requirements: [
      '使用 LangGraph 或 AutoGen 框架构建',
      '实现多维度代码检查（命名规范、复杂度、安全漏洞、性能问题）',
      '生成结构化的审查报告（Markdown 格式）',
      '支持多种编程语言（至少 Python 和 JavaScript）',
      '实现错误处理和重试机制',
      '添加日志记录和性能监控',
      '（可选）集成到 GitHub Actions 或 GitLab CI'
    ],
    hints: [
      '可以参考 P13 实战星 2 的架构设计',
      '使用 LangGraph 的状态图管理审查流程',
      '每个检查维度可以是一个独立的节点',
      '使用 AST（抽象语法树）分析代码结构',
      '考虑使用缓存避免重复分析相同代码',
      '测试时用真实的开源项目代码'
    ]
  },

  next_steps: [
    '完成里程碑项目，将所学知识应用到实战中',
    '选择一条高级路径：帝国篇（P17-P21）或 MiroFish 篇（P23-P25）',
    '帝国篇：学习如何构建制度化的 Multi-Agent 系统（适合企业应用）',
    'MiroFish 篇：学习如何构建自由演化的群体智能系统（适合社会仿真）',
    '完成 P21 或 P25 后，你将达到里程碑 3 或里程碑 4'
  ]
};

// 使用说明：
// 将这个 milestone section 添加到 p16-final.js 的 sections 数组末尾
