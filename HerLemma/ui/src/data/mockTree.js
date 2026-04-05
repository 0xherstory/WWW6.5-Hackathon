export const TOPICS = [
  { id: 'derivative', name: '导数', emoji: '📐', active: true },
  { id: 'function', name: '函数', emoji: '📈', active: false },
  { id: 'sequence', name: '数列', emoji: '🔢', active: false },
  { id: 'probability', name: '概率', emoji: '🎲', active: false },
]

const avatars = ['🦊','🐱','🌸','🌙','🦋','🐰','🌺','⭐','🍀','🎀','🦄','🌻','💫','🐚','🌷','🍓','🦢','🌈']
const addr = (i) => `0x${i.toString(16).padStart(4,'0')}...${(i*7+3).toString(16).padStart(4,'0')}`

// ── 第一层：知识点逻辑图 ──
export const CONCEPT_GRAPH = {
  nodes: [
    { id: 'c1', label: '函数基础', emoji: '📈', desc: '函数的概念、定义域、值域', explanationCount: 23, color: '#a29bfe' },
    { id: 'c2', label: '极限思想', emoji: '♾️', desc: '极限的直觉理解与ε-δ语言', explanationCount: 18, color: '#a29bfe' },
    { id: 'c3', label: '导数的定义', emoji: '📐', desc: '瞬时变化率、导数的极限定义', explanationCount: 17, color: '#ff6b6b', active: true },
    { id: 'c4', label: '导数的几何意义', emoji: '📏', desc: '切线斜率、函数图像的倾斜程度', explanationCount: 14, color: '#ff6b6b' },
    { id: 'c5', label: '求导法则', emoji: '⚙️', desc: '基本初等函数求导、四则运算', explanationCount: 21, color: '#f9ca24' },
    { id: 'c6', label: '链式法则', emoji: '🔗', desc: '复合函数的求导方法', explanationCount: 11, color: '#f9ca24' },
    { id: 'c7', label: '单调性与极值', emoji: '⛰️', desc: '用导数判断函数的增减和极值', explanationCount: 19, color: '#00d2d3' },
    { id: 'c8', label: '最值与应用', emoji: '🎯', desc: '闭区间最值、实际问题优化', explanationCount: 15, color: '#00d2d3' },
  ],
  links: [
    { source: 'c1', target: 'c2', label: '引出' },
    { source: 'c2', target: 'c3', label: '定义' },
    { source: 'c3', target: 'c4', label: '几何理解' },
    { source: 'c3', target: 'c5', label: '计算方法' },
    { source: 'c5', target: 'c6', label: '进阶' },
    { source: 'c4', target: 'c7', label: '应用' },
    { source: 'c5', target: 'c7', label: '工具' },
    { source: 'c7', target: 'c8', label: '深入' },
  ],
}

// ── 第二层：每个知识点下的翻译链 ──
export const TRANSLATIONS = {
  c3: {
    textbook: {
      title: '导数的定义',
      content: '函数 f(x) 在 x₀ 处的导数 f\'(x₀) = lim(Δx→0) [f(x₀+Δx) - f(x₀)] / Δx',
      source: '人教版高中数学选择性必修第二册 §5.1',
    },
    nodes: [
      { id: 6, author: '小鹿', avatar: avatars[13], address: addr(14), translation: '你在画眉毛。导数就是"眉笔在这一点应该往哪个方向画"。眉头上扬 = 正斜率，眉峰转折 = 导数为零，眉尾下降 = 负斜率。你每天化妆其实都在做微积分。', votes: 321, prove: 1356, earned: 0.9, parent: null, isRoleModel: true, roleModelInfo: { university: 'MIT 数学系全奖', year: 2026, quote: '在 HerLemma 上写讲解让我发现，我不只是会解题，我能让别人听懂。这个能力帮我拿到了 MIT 的面试。', impact: '她的"画眉毛"讲解成为平台阅读量最高的内容，被 5 家教育媒体转载' }},
      { id: 1, author: '小雨', avatar: avatars[0], address: addr(1), translation: '你在山坡上骑车，导数就是你当前脚底下这一小段路有多陡。f\'(x)>0 是在上坡，<0 是在下坡，=0 就是到了山顶或山谷。Δx 就是你往前迈的那一小步，步子越小测得越准。', votes: 312, prove: 1247, earned: 0.8, parent: null, isRoleModel: true, roleModelInfo: { university: '北京大学数学科学学院', year: 2025, quote: '高二时我只是在帮室友讲题。后来发现，讲题的过程让我真正理解了数学。', impact: '她的讲解启发了 12 位女生写出自己的版本，其中 3 位考入 985 理科专业' }},
      { id: 5, author: '一一', avatar: avatars[8], address: addr(9), translation: '你拍延时摄影看花开。导数就是"花瓣此刻张开的速度"。含苞的时候慢，盛开前最快，全开之后就不动了。', votes: 267, prove: 1089, earned: 0.65, parent: null, isRoleModel: false },
    ],
  },
  c4: {
    textbook: { title: '导数的几何意义', content: '函数 y=f(x) 在点 x₀ 处的导数 f\'(x₀) 的几何意义，就是曲线 y=f(x) 在点 P(x₀, f(x₀)) 处的切线的斜率。', source: '人教版 §5.2' },
    nodes: [
      { id: 101, author: '小月', avatar: avatars[3], address: addr(4), translation: '你看股票 K 线图，导数就是那条线在某一点的"倾斜程度"。线往上翘 = 导数为正 = 在涨；线走平 = 到了最高点或最低点。', votes: 89, prove: 534, earned: 0.3, parent: null, isRoleModel: true, roleModelInfo: { university: 'CMO 银牌 → 清华大学姚班', year: 2025, quote: '数学竞赛不是男生的专利。', impact: '她的讲解被 3 所高中引用为教学参考' }},
      { id: 102, author: '圆圆', avatar: avatars[12], address: addr(13), translation: '你在游乐园坐过山车。导数就是你在轨道某一点的"飞驰方向"。上坡段方向朝上，最高点那一瞬间方向是水平的——那就是极值点。', votes: 201, prove: 978, earned: 0.6, parent: 101, isRoleModel: false },
      { id: 103, author: '小夏', avatar: avatars[9], address: addr(10), translation: '用手指沿着曲线滑动，导数就是你手指在每一点指向的方向。手指朝右上方 = 正导数，朝右下方 = 负导数，水平 = 零。', votes: 167, prove: 723, earned: 0.45, parent: null, isRoleModel: false },
    ],
  },
}

export const conceptToGraphData = () => {
  const nodes = CONCEPT_GRAPH.nodes.map(n => ({
    ...n,
    val: 20 + n.explanationCount * 0.8,
  }))
  return { nodes, links: [...CONCEPT_GRAPH.links] }
}

export const translationToGraphData = (conceptId) => {
  const data = TRANSLATIONS[conceptId]
  if (!data) return { nodes: [], links: [] }
  const nodes = data.nodes.map(n => ({
    id: n.id,
    name: n.author,
    avatar: n.avatar,
    val: Math.max(8, Math.sqrt(n.votes) * 2),
    votes: n.votes,
    translation: n.translation,
    isRoleModel: n.isRoleModel,
    roleModelInfo: n.roleModelInfo,
    address: n.address,
    prove: n.prove,
    earned: n.earned,
    parent: n.parent,
  }))
  const links = data.nodes
    .filter(n => n.parent !== null)
    .map(n => ({ source: n.parent, target: n.id }))
  return { nodes, links }
}

// 保持向后兼容
export const DERIVATIVE_TREE = TRANSLATIONS.c3
export const treeToGraphData = () => translationToGraphData('c3')
