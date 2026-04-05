export interface Habit {
  id: string;
  name: string;
  description: string;
  category: HabitCategory;
  type: "quantity" | "time";
  defaultStake: number;
  emoji: string;
}

export type HabitCategory = "mental" | "physical" | "diet" | "happiness" | "business" | "productivity";

export const categoryInfo: Record<HabitCategory, { label: string; labelEn: string; emoji: string; color: string }> = {
  mental:       { label: "脑力与知识", labelEn: "Mental Fitness",   emoji: "🧠", color: "from-sky-200/50 to-cyan-100/40" },
  physical:     { label: "身体健康",   labelEn: "Physical Fitness", emoji: "💪", color: "from-rose-200/50 to-orange-100/40" },
  diet:         { label: "健康与饮食", labelEn: "Health & Diet",    emoji: "🥗", color: "from-emerald-200/45 to-teal-100/35" },
  happiness:    { label: "幸福与心态", labelEn: "Happiness",        emoji: "😊", color: "from-amber-200/50 to-yellow-50/40" },
  business:     { label: "商业与工作", labelEn: "Business",         emoji: "💼", color: "from-violet-200/45 to-purple-100/35" },
  productivity: { label: "生产力与创作", labelEn: "Productivity",   emoji: "🚀", color: "from-fuchsia-200/40 to-pink-100/35" },
};

export const habits: Habit[] = [
  // ===== Mental Fitness =====
  // By Quantity
  { id: "m1", name: "阅读", description: "读 2 页书", category: "mental", type: "quantity", defaultStake: 0.1, emoji: "📖" },
  { id: "m2", name: "新知", description: "了解 1 个新事实/冷知识", category: "mental", type: "quantity", defaultStake: 0.1, emoji: "💡" },
  { id: "m3", name: "脑力游戏", description: "完成 1 个脑力训练游戏", category: "mental", type: "quantity", defaultStake: 0.1, emoji: "🧩" },
  { id: "m4", name: "记忆", description: "背诵 5-10 个单词", category: "mental", type: "quantity", defaultStake: 0.1, emoji: "🔤" },
  // By Time (1 min)
  { id: "m5", name: "魔方", description: "练习魔方 1 分钟", category: "mental", type: "time", defaultStake: 0.1, emoji: "🎲" },
  { id: "m6", name: "数学", description: "简单累加 1 分钟", category: "mental", type: "time", defaultStake: 0.1, emoji: "🔢" },
  { id: "m7", name: "语言", description: "学习 1 个新单词", category: "mental", type: "time", defaultStake: 0.1, emoji: "🗣️" },

  // ===== Physical Fitness =====
  // By Quantity
  { id: "p1", name: "俯卧撑", description: "做 1 个俯卧撑", category: "physical", type: "quantity", defaultStake: 0.1, emoji: "🏋️" },
  { id: "p2", name: "仰卧起坐", description: "做 1 个仰卧起坐", category: "physical", type: "quantity", defaultStake: 0.1, emoji: "💪" },
  { id: "p3", name: "引体向上", description: "做 1 个引体向上", category: "physical", type: "quantity", defaultStake: 0.1, emoji: "🤸" },
  { id: "p4", name: "称重", description: "每日称重记录", category: "physical", type: "quantity", defaultStake: 0.1, emoji: "⚖️" },
  { id: "p5", name: "出门", description: "走出家门一次", category: "physical", type: "quantity", defaultStake: 0.1, emoji: "🚪" },
  { id: "p6", name: "准备", description: "穿健身服/铺瑜伽垫", category: "physical", type: "quantity", defaultStake: 0.1, emoji: "👟" },
  { id: "p7", name: "通勤", description: "步行或骑车通勤", category: "physical", type: "quantity", defaultStake: 0.1, emoji: "🚶" },
  // By Time (30s)
  { id: "p8", name: "有氧", description: "跑楼梯/原地跑/开合跳 30秒", category: "physical", type: "time", defaultStake: 0.1, emoji: "🏃" },
  { id: "p9", name: "散步/跳舞", description: "散步或跳舞 30秒", category: "physical", type: "time", defaultStake: 0.1, emoji: "💃" },

  // ===== Health & Diet =====
  // By Quantity
  { id: "d1", name: "喝水", description: "喝 1 杯水", category: "diet", type: "quantity", defaultStake: 0.1, emoji: "💧" },
  { id: "d2", name: "水果", description: "吃 1 份水果", category: "diet", type: "quantity", defaultStake: 0.1, emoji: "🍎" },
  { id: "d3", name: "蔬菜", description: "吃 1 份蔬菜", category: "diet", type: "quantity", defaultStake: 0.1, emoji: "🥦" },
  { id: "d4", name: "在家做饭", description: "在家做一餐饭", category: "diet", type: "quantity", defaultStake: 0.1, emoji: "🍳" },
  { id: "d5", name: "放松", description: "放松身心一次", category: "diet", type: "quantity", defaultStake: 0.1, emoji: "🧘" },
  { id: "d6", name: "拉伸", description: "拉伸 1 个部位", category: "diet", type: "quantity", defaultStake: 0.1, emoji: "🤸" },
  { id: "d7", name: "牙线", description: "用牙线清洁 1 颗牙", category: "diet", type: "quantity", defaultStake: 0.1, emoji: "🦷" },
  { id: "d8", name: "久坐提醒", description: "站起来活动一下", category: "diet", type: "quantity", defaultStake: 0.1, emoji: "🪑" },
  { id: "d9", name: "护眼", description: "远眺或闭眼休息", category: "diet", type: "quantity", defaultStake: 0.1, emoji: "👁️" },
  // By Time (1 min)
  { id: "d10", name: "晒太阳", description: "晒太阳 1 分钟", category: "diet", type: "time", defaultStake: 0.1, emoji: "☀️" },
  { id: "d11", name: "全身拉伸", description: "全身拉伸 1 分钟", category: "diet", type: "time", defaultStake: 0.1, emoji: "🧎" },

  // ===== Happiness =====
  // By Quantity
  { id: "h1", name: "感恩", description: "写下 1 件感恩的事", category: "happiness", type: "quantity", defaultStake: 0.1, emoji: "🙏" },
  { id: "h2", name: "积极念头", description: "想 1 个积极的念头", category: "happiness", type: "quantity", defaultStake: 0.1, emoji: "✨" },
  { id: "h3", name: "致谢", description: "向 1 个人表达感谢", category: "happiness", type: "quantity", defaultStake: 0.1, emoji: "💌" },
  { id: "h4", name: "社交", description: "和 1 个人聊天", category: "happiness", type: "quantity", defaultStake: 0.1, emoji: "👋" },
  { id: "h5", name: "眼神接触", description: "与人进行眼神接触", category: "happiness", type: "quantity", defaultStake: 0.1, emoji: "👀" },
  { id: "h6", name: "减压", description: "做 1 件减压的事", category: "happiness", type: "quantity", defaultStake: 0.1, emoji: "🎯" },
  { id: "h7", name: "助人", description: "帮助 1 个人", category: "happiness", type: "quantity", defaultStake: 0.1, emoji: "🤝" },
  { id: "h8", name: "拥抱", description: "给 1 个人一个拥抱", category: "happiness", type: "quantity", defaultStake: 0.1, emoji: "🫂" },
  { id: "h9", name: "正念饮食", description: "细嚼慢咽 1 口食物", category: "happiness", type: "quantity", defaultStake: 0.1, emoji: "🍽️" },
  { id: "h10", name: "微笑", description: "对着镜子微笑", category: "happiness", type: "quantity", defaultStake: 0.1, emoji: "😊" },
  // By Time (1 min)
  { id: "h11", name: "冥想", description: "冥想 1 分钟", category: "happiness", type: "time", defaultStake: 0.1, emoji: "🧘" },
  { id: "h12", name: "傻笑", description: "傻笑 10 秒", category: "happiness", type: "time", defaultStake: 0.1, emoji: "😂" },

  // ===== Business =====
  // By Quantity
  { id: "b1", name: "销售线索", description: "找 1 个潜在客户", category: "business", type: "quantity", defaultStake: 0.1, emoji: "🎯" },
  { id: "b2", name: "商业点子", description: "记录 1 个商业点子", category: "business", type: "quantity", defaultStake: 0.1, emoji: "💰" },
  { id: "b3", name: "服务客户", description: "回复 1 个客户消息", category: "business", type: "quantity", defaultStake: 0.1, emoji: "📞" },
  { id: "b4", name: "改进业务", description: "优化 1 个流程", category: "business", type: "quantity", defaultStake: 0.1, emoji: "📈" },
  { id: "b5", name: "简化方法", description: "简化 1 个工作方法", category: "business", type: "quantity", defaultStake: 0.1, emoji: "✂️" },
  // By Time (1 min)
  { id: "b6", name: "整理文件", description: "整理文件 1 分钟", category: "business", type: "time", defaultStake: 0.1, emoji: "📁" },
  { id: "b7", name: "评估模式", description: "评估商业模式 1 分钟", category: "business", type: "time", defaultStake: 0.1, emoji: "🔍" },
  { id: "b8", name: "头脑风暴", description: "头脑风暴 1 分钟", category: "business", type: "time", defaultStake: 0.1, emoji: "🌪️" },

  // ===== Productivity =====
  // By Quantity
  { id: "pr1", name: "弹奏", description: "弹奏一个键/一个和弦", category: "productivity", type: "quantity", defaultStake: 0.1, emoji: "🎹" },
  { id: "pr2", name: "清理", description: "清理一个小区域", category: "productivity", type: "quantity", defaultStake: 0.1, emoji: "🧹" },
  { id: "pr3", name: "文件", description: "处理 1 份文件", category: "productivity", type: "quantity", defaultStake: 0.1, emoji: "📄" },
  { id: "pr4", name: "待办", description: "决定 1 个待办事项", category: "productivity", type: "quantity", defaultStake: 0.1, emoji: "✅" },
  { id: "pr5", name: "写作", description: "写 50 个字", category: "productivity", type: "quantity", defaultStake: 0.1, emoji: "✍️" },
  { id: "pr6", name: "阅读", description: "读 2 页书", category: "productivity", type: "quantity", defaultStake: 0.1, emoji: "📚" },
  { id: "pr7", name: "想法", description: "写下 3 个新想法", category: "productivity", type: "quantity", defaultStake: 0.1, emoji: "💭" },
  // By Time (1 min)
  { id: "pr8", name: "杂务清理", description: "杂务清理 1 分钟（按周轮换）", category: "productivity", type: "time", defaultStake: 0.1, emoji: "🔄" },
];

export function getHabitsByCategory(category: HabitCategory): Habit[] {
  return habits.filter(h => h.category === category);
}

export function getRandomHabit(): Habit {
  return habits[Math.floor(Math.random() * habits.length)];
}
