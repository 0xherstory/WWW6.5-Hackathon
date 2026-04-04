// P27 完成后的里程碑 4（待 P26-P27 创建后完善）

const MILESTONE_4 = {
  type: 'milestone',
  icon: '🌟',
  title: '里程碑 4：全栈 Agent 开发者',
  subtitle: '恭喜你完成了 AgentOdyssey 的全部学习！',

  message: `
    🎉 <strong>恭喜你！</strong>你已经完成了 AgentOdyssey 的全部课程！<br><br>

    从最基础的 LLM 调用，到复杂的 Multi-Agent 系统，<br>
    从底层原理到生产实践，从框架应用到全栈开发——<br>
    你已经成为了一名<strong>全栈 Agent 开发者</strong>！<br><br>

    你不仅掌握了两种 Multi-Agent 架构：<br>
    • <strong>帝国篇</strong>：制度化、可控、适合企业应用<br>
    • <strong>MiroFish 篇</strong>：自由演化、群体智能、适合社会仿真<br><br>

    还学会了：<br>
    • GraphRAG 知识图谱构建<br>
    • Agent 人格和记忆系统设计<br>
    • 大规模 Agent 仿真引擎<br>
    • ReACT 模式的深度报告生成<br>
    • 前后端分离的全栈架构<br><br>

    现在，你可以：<br>
    • 独立开发类似 MiroFish 的复杂 Agent 系统<br>
    • 根据需求选择合适的架构（制度化 vs 自由演化）<br>
    • 处理生产环境中的各种技术挑战<br>
    • 成为 Agent 开发领域的专家
  `,

  achievements: [
    {
      icon: '🕸️',
      title: 'GraphRAG 大师',
      description: '掌握了知识图谱构建、本体设计、多维度检索'
    },
    {
      icon: '🎭',
      title: 'Agent 人格专家',
      description: '学会了设计真实的 Agent 人格、记忆系统、行为模式'
    },
    {
      icon: '⚙️',
      title: '仿真引擎架构师',
      description: '掌握了大规模 Agent 调度、IPC 通信、并发控制'
    },
    {
      icon: '📊',
      title: 'ReACT 报告专家',
      description: '学会了用 ReACT 模式生成深度分析报告'
    },
    {
      icon: '🚀',
      title: '全栈开发者',
      description: '掌握了前后端分离、异步任务、项目管理的全栈技能'
    },
    {
      icon: '🏆',
      title: 'AgentOdyssey 毕业生',
      description: '完成了全部 27 关的学习，成为 Agent 开发专家'
    }
  ],

  skills: [
    // 基础技能（P1-P8）
    'LLM API 调用',
    'Prompt 工程',
    '工具调用',
    'ReAct 循环',
    '记忆系统',
    'RAG 检索',
    'Multi-Agent 协作',

    // 深度技能（P9-P16）
    'Transformer 架构',
    'LLM 预训练',
    'RLHF 后训练',
    'LangGraph',
    'AutoGen',
    'CrewAI',

    // 帝国篇技能（P17-P21）
    '三省六部架构',
    '审核机制',
    '权限矩阵',
    '消息路由',

    // MiroFish 篇技能（P23-P25）
    'GraphRAG',
    '本体设计',
    'Agent 人格',
    '记忆系统',
    '仿真引擎',
    'IPC 通信',

    // 全栈技能（P26-P27）
    'ReACT 报告',
    '前后端分离',
    '异步任务',
    '项目管理'
  ],

  project: {
    icon: '🐟',
    title: '终极项目：mini MiroFish',
    description: '从零构建一个简化版的 MiroFish 系统，整合所有学到的知识',
    requirements: [
      '实现知识图谱构建（GraphRAG）',
      '实现 10-20 个 Agent 的人格生成',
      '实现社交媒体仿真（Twitter 或 Reddit）',
      '实现 Agent 活动配置和调度',
      '实现动态记忆更新',
      '实现 ReACT 模式的报告生成',
      '实现前后端分离架构（Vue + Flask）',
      '实现异步任务管理',
      '（可选）部署到云服务器'
    ],
    hints: [
      '可以参考 MiroFish 的开源代码，但要自己实现核心功能',
      '先实现最小可用版本（MVP），再逐步添加功能',
      '知识图谱可以用简化版（不一定要用 Zep）',
      'Agent 数量可以从 10 个开始，不需要 1000 个',
      '仿真轮次可以从 10 轮开始，不需要 100 轮',
      '重点是理解架构设计，而不是完全复刻 MiroFish',
      '完成后可以写一篇技术博客分享你的实现'
    ]
  },

  next_steps: [
    '完成终极项目，展示你的全栈 Agent 开发能力',
    '将项目开源到 GitHub，建立个人技术品牌',
    '写技术博客分享学习心得和项目经验',
    '关注 Agent 领域的最新进展（新论文、新框架）',
    '加入 Agent 开发社区，与其他开发者交流',
    '考虑将 Agent 技术应用到实际工作或创业项目中',
    '继续深入学习：Multi-Agent 强化学习、Agent 安全、Agent 评估等高级话题'
  ]
};

// 使用说明：
// 将这个 milestone section 添加到 p27-xxx.js 的 sections 数组末尾
// 注意：P27 还未创建，这是一个占位文件
