// P21 完成后的里程碑 3

const MILESTONE_3 = {
  type: 'milestone',
  icon: '🏛️',
  title: '里程碑 3：Multi-Agent 系统架构师',
  subtitle: '恭喜你掌握了制度化 Multi-Agent 系统的设计与实现！',

  message: `
    太棒了！你已经完成了帝国篇的学习，深入理解了<strong>制度化 Multi-Agent 系统</strong>的设计哲学。<br><br>

    从三省六部的架构设计，到审核机制、权限矩阵、消息路由——<br>
    你已经掌握了构建<strong>可控、可靠、可扩展</strong>的大规模 Agent 系统的能力！<br><br>

    帝国篇的核心思想是：<strong>让 Agent 按规矩办事</strong>。<br>
    通过制度化的设计，确保系统的可控性和可靠性。<br><br>

    现在，你可以：<br>
    • 设计复杂的 Multi-Agent 架构（10+ Agent）<br>
    • 实现审核机制和权限控制<br>
    • 构建可扩展的消息路由系统<br>
    • 处理 Agent 间的协作和冲突<br>
    • 将 Multi-Agent 系统应用到企业级场景
  `,

  achievements: [
    {
      icon: '🏗️',
      title: '架构设计大师',
      description: '掌握了三省六部架构，能设计复杂的 Multi-Agent 系统'
    },
    {
      icon: '✅',
      title: '审核机制专家',
      description: '理解了多层审核、权限矩阵、审核流程的设计'
    },
    {
      icon: '📮',
      title: '消息路由高手',
      description: '学会了设计消息路由、处理 Agent 间通信'
    },
    {
      icon: '⚖️',
      title: '制度化思维',
      description: '具备了"让 Agent 按规矩办事"的制度化设计思维'
    },
    {
      icon: '🎯',
      title: 'EDICT 实践者',
      description: '深入学习了 EDICT 开源项目，理解了生产级实现'
    }
  ],

  skills: [
    '三省六部架构',
    'Multi-Agent 协作',
    '审核机制设计',
    '权限矩阵',
    '消息路由',
    'Agent 角色设计',
    '冲突解决',
    '状态同步',
    '分布式协调',
    '可扩展性设计',
    '企业级应用',
    'EDICT 框架'
  ],

  project: {
    icon: '🏢',
    title: '里程碑项目：智能客服系统',
    description: '构建一个制度化的 Multi-Agent 客服系统，包含接待、技术支持、主管审核三个角色',
    requirements: [
      '设计 3-Agent 架构：接待 Agent、技术 Agent、主管 Agent',
      '实现消息路由：根据问题类型自动分配给合适的 Agent',
      '实现审核机制：技术 Agent 的回答需要主管审核',
      '实现权限控制：不同 Agent 有不同的操作权限',
      '实现对话历史管理：所有 Agent 共享对话上下文',
      '实现升级机制：接待 Agent 无法解决时升级给技术 Agent',
      '（可选）实现知识库：Agent 可以查询 FAQ 和文档'
    ],
    hints: [
      '参考帝国篇的三省六部架构设计',
      '接待 Agent：负责初步分类和简单问题',
      '技术 Agent：负责复杂技术问题，需要主管审核',
      '主管 Agent：负责审核和最终决策',
      '使用状态机管理对话流程',
      '测试时模拟各种客服场景（简单问题、复杂问题、投诉）'
    ]
  },

  next_steps: [
    '完成里程碑项目，巩固制度化 Multi-Agent 的设计能力',
    '如果还没学习 MiroFish 篇，可以继续学习 P23-P25',
    'MiroFish 篇是另一种 Multi-Agent 架构：自由演化、群体智能',
    '对比两种架构的区别：制度化 vs 自由演化',
    '完成 P25 后，你将达到里程碑 4：全栈 Agent 开发者'
  ]
};

// 使用说明：
// 将这个 milestone section 添加到 p21-empire-5.js 的 sections 数组末尾
