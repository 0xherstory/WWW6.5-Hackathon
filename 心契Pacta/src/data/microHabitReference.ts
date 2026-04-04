export type ReferenceModuleKey = "behavior" | "mindset" | "emotion" | "environment";

export type ReferenceHabit = {
  id: string;
  methodNo: number;
  module: ReferenceModuleKey;
  title: string;
  icon: string;
  content: string;
  quote: string;
};

export const moduleMeta: Record<
  ReferenceModuleKey,
  {
    name: string;
    icon: string;
    themeClass: string;
    buttonClass: string;
    pages: number[];
  }
> = {
  behavior: {
    name: "行为",
    icon: "👣",
    themeClass: "ref-theme-behavior",
    buttonClass: "bg-[hsl(201_95%_93%)]",
    pages: [7, 7, 7, 5],
  },
  mindset: {
    name: "思维",
    icon: "🧠",
    themeClass: "ref-theme-mindset",
    buttonClass: "bg-[hsl(151_70%_91%)]",
    pages: [6, 6, 6],
  },
  emotion: {
    name: "情绪",
    icon: "😊",
    themeClass: "ref-theme-emotion",
    buttonClass: "bg-[hsl(333_83%_93%)]",
    pages: [5, 5, 5],
  },
  environment: {
    name: "环境",
    icon: "🏠",
    themeClass: "ref-theme-environment",
    buttonClass: "bg-[hsl(45_96%_89%)]",
    pages: [6],
  },
};

export const referenceHabits: ReferenceHabit[] = [
  { id: "m1", methodNo: 1, module: "behavior", title: "开心就好", icon: "🙂", content: "从“想做什么”起步，先坚持喜欢的动作，不强迫自己做讨厌的事。", quote: "坚持自己喜欢的，放弃自己不喜欢的是人之常情。" },
  { id: "m2", methodNo: 2, module: "behavior", title: "婴儿学步式", icon: "🦶", content: "早起先提前 15 分钟、打扫先做 5 分钟，小到不可能失败。", quote: "把 0 变成 1 需要巨大能量，把 1 变成 2 却很容易。" },
  { id: "m3", methodNo: 3, module: "behavior", title: "先尝试再改变", icon: "🧪", content: "先小范围试 3 天或 1 周，合适就保留，不合适就调整。", quote: "合适的方法坚持，不合适的方法果断舍弃。" },
  { id: "m4", methodNo: 4, module: "behavior", title: "例外规则", icon: "⚡", content: "忙时降级执行，哪怕只读 1 页，也别让行动归零。", quote: "关键是步入正轨之前不能让行动归零。" },
  { id: "m5", methodNo: 5, module: "behavior", title: "给自己一套顶配", icon: "🎁", content: "用顺手、喜欢的工具提升行动意愿，增加仪式感。", quote: "注重仪式感能提高积极性。" },
  { id: "m6", methodNo: 6, module: "behavior", title: "抱团式", icon: "👥", content: "和朋友一起跑步、学习、打卡，在同频氛围里坚持。", quote: "在好氛围中，习惯养成更轻松。" },
  { id: "m7", methodNo: 7, module: "behavior", title: "学会模仿别人", icon: "🪞", content: "借鉴他人的方法模板，再改造成适合自己的版本。", quote: "模仿是养成微习惯的捷径。" },
  { id: "m8", methodNo: 8, module: "behavior", title: "胡萝卜奖励法", icon: "🥕", content: "给阶段行动配小奖励，保持持续热情。", quote: "利用各种机会犒劳自己，保持积极性。" },
  { id: "m9", methodNo: 9, module: "behavior", title: "马克笔记录法", icon: "🖊️", content: "把努力量化记录，形成可见进步。", quote: "将成绩数据化，是很实用的方法。" },
  { id: "m10", methodNo: 10, module: "behavior", title: "朋友圈法", icon: "📣", content: "公开进度获取外部反馈，提高坚持动力。", quote: "被别人认可的满足感，会成为重要动力。" },
  { id: "m11", methodNo: 11, module: "behavior", title: "提高干劲的小装备", icon: "🧰", content: "用计时器、舒适环境和小工具降低执行阻力。", quote: "在随手用的物品上动脑筋，就能提高干劲。" },
  { id: "m12", methodNo: 12, module: "behavior", title: "把时间节点编入计划", icon: "⏰", content: "给习惯绑定明确时点：会后、通勤、睡前。", quote: "明确什么时候做，行动力会大幅提高。" },
  { id: "m13", methodNo: 13, module: "behavior", title: "向大家宣布", icon: "📢", content: "借助外部承诺约束自己，提高执行概率。", quote: "与他人的约定往往更易坚持。" },
  { id: "m14", methodNo: 14, module: "behavior", title: "激情目标", icon: "🔥", content: "用更有画面感的目标激活行动动机。", quote: "重要的是用激情目标点燃干劲。" },
  { id: "m15", methodNo: 15, module: "behavior", title: "年卡式", icon: "🪪", content: "提前投入成本，借沉没成本反向推动坚持。", quote: "合理利用沉没成本激发动力。" },
  { id: "m16", methodNo: 16, module: "behavior", title: "爱豆式", icon: "🌟", content: "把“想成为那样的人”转化为今天的行动。", quote: "憧憬会成为坚持下去的精神食粮。" },
  { id: "m17", methodNo: 17, module: "behavior", title: "一刻钟习惯法", icon: "⌛", content: "用 15 分钟分段执行，降低开始难度。", quote: "有一个美好的早晨，就更容易控制自己。" },
  { id: "m18", methodNo: 18, module: "behavior", title: "一心二用", icon: "↔️", content: "把通勤、打扫等碎片时间与习惯叠加。", quote: "一心二用，让习惯养成不占额外精力。" },
  { id: "m19", methodNo: 19, module: "behavior", title: "氛围式", icon: "☕", content: "换个地点和氛围，专注与行动力会提升。", quote: "仅仅换个地方，就能提高干劲。" },
  { id: "m20", methodNo: 20, module: "behavior", title: "倒推热情递减法则", icon: "🔁", content: "引入变化，避免习惯过程过度公式化。", quote: "加入变化和刺激，能避免枯燥感。" },
  { id: "m21", methodNo: 21, module: "behavior", title: "15 分钟单位克拖延", icon: "⏱️", content: "把任务切成 15 分钟块逐个完成。", quote: "15 分钟是让行动产生魔力的单位。" },
  { id: "m22", methodNo: 22, module: "behavior", title: "列清单勾掉", icon: "✅", content: "做完就勾掉，用可见完成感推动下一步。", quote: "勾掉任务的成就感会推着你前进。" },
  { id: "m23", methodNo: 23, module: "behavior", title: "工作细分", icon: "🧩", content: "复杂任务拆成小步骤，降低心理压力。", quote: "面对细小任务时，不会感到压力。" },
  { id: "m24", methodNo: 24, module: "behavior", title: "聚焦具体事项", icon: "🎯", content: "把目标变成可执行动作，不空谈抽象口号。", quote: "聚焦具体行动，才能避免半途而废。" },
  { id: "m25", methodNo: 25, module: "behavior", title: "停止情绪内耗", icon: "🫧", content: "不抱怨、不抵触，用平常心执行困难任务。", quote: "保持冷静踏实做事，才不会浪费能量。" },
  { id: "m26", methodNo: 26, module: "behavior", title: "当场就做", icon: "⏩", content: "5 分钟内可完成的事立即执行。", quote: "我现在就做，是最有力量的一句话。" },

  { id: "m27", methodNo: 27, module: "mindset", title: "1厘米超越思维", icon: "⬆️", content: "只和昨天的自己比较，每天进步一点点。", quote: "每天超越自己就是胜利。" },
  { id: "m28", methodNo: 28, module: "mindset", title: "最大化思维", icon: "📈", content: "从现有资源起步，不被欠缺条件拖住。", quote: "凭借目前资源起步，视野会被打开。" },
  { id: "m29", methodNo: 29, module: "mindset", title: "概率思维", icon: "🎲", content: "增加尝试次数，提高成功概率。", quote: "行动量决定成功概率。" },
  { id: "m30", methodNo: 30, module: "mindset", title: "焦点思维", icon: "🔍", content: "只盯可控事项，减少无效焦虑。", quote: "把注意力放在能做到的事上。" },
  { id: "m31", methodNo: 31, module: "mindset", title: "发散思维", icon: "💡", content: "为难题生成更多选项，打破卡点。", quote: "增加选项，就会发现更多可能。" },
  { id: "m32", methodNo: 32, module: "mindset", title: "量变思维", icon: "➗", content: "先做 1% 改变，不追求一步到位。", quote: "先行动，再优化。" },
  { id: "m33", methodNo: 33, module: "mindset", title: "共赢思维", icon: "🤝", content: "找到双方核心需求，不做零和博弈。", quote: "共赢不是妥协，而是成全彼此。" },
  { id: "m34", methodNo: 34, module: "mindset", title: "去结果思维", icon: "🍃", content: "准备充分后专注过程，不过分执念结果。", quote: "专注当下行动就好。" },
  { id: "m35", methodNo: 35, module: "mindset", title: "接力棒思维", icon: "🏃", content: "今天做到最好，明天继续接力。", quote: "把接力棒交给明天的自己。" },
  { id: "m36", methodNo: 36, module: "mindset", title: "底线思维", icon: "🧱", content: "降低不合理期待，提升对现实的包容。", quote: "接受不完美，才能减少不安。" },
  { id: "m37", methodNo: 37, module: "mindset", title: "长期思维", icon: "🪷", content: "接受气馁时段，保持长期视角。", quote: "坚持下去，终会迎来裂变式成长。" },
  { id: "m38", methodNo: 38, module: "mindset", title: "初心思维", icon: "🧭", content: "把“为什么做”写清楚，困难时回看。", quote: "找到初心，才不会轻易放弃。" },
  { id: "m39", methodNo: 39, module: "mindset", title: "故事思维", icon: "📚", content: "用真实成长故事在低谷期给自己续航。", quote: "故事能在痛苦时给予重整旗鼓的力量。" },
  { id: "m40", methodNo: 40, module: "mindset", title: "价值思维", icon: "⭐", content: "为麻烦任务赋予意义，增强坚持感。", quote: "为事情找到意义，就能激发动力。" },
  { id: "m41", methodNo: 41, module: "mindset", title: "联想思维", icon: "🧠", content: "把旧成功经验迁移到新场景。", quote: "过去的成功经验能应对未知情况。" },
  { id: "m42", methodNo: 42, module: "mindset", title: "成长思维", icon: "🌱", content: "用主动词替换被动词，重建行动者身份。", quote: "语言变了，思维和行动都会变。" },
  { id: "m43", methodNo: 43, module: "mindset", title: "生活禅思维", icon: "🪨", content: "接受试错和弯路，把经历当成长伏笔。", quote: "你经历的所有事情都有意义。" },
  { id: "m44", methodNo: 44, module: "mindset", title: "感恩思维", icon: "💚", content: "每天记录一件感恩小事，稀释负能量。", quote: "常怀感恩之心，心胸会更宽广。" },

  { id: "m45", methodNo: 45, module: "emotion", title: "充电 vs 放电", icon: "🔋", content: "维护充电清单，减少放电行为。", quote: "减少放电，增加充电，情绪能量才会充足。" },
  { id: "m46", methodNo: 46, module: "emotion", title: "投入情绪", icon: "🌊", content: "进入心流，缓解精神压力。", quote: "全身心投入一件事，心灵会得到治愈。" },
  { id: "m47", methodNo: 47, module: "emotion", title: "主动情绪", icon: "🛶", content: "主动设定生活边界，提升掌控感。", quote: "夺回主动权，幸福感会陡增。" },
  { id: "m48", methodNo: 48, module: "emotion", title: "好奇情绪", icon: "❓", content: "持续探索心动事项，给生活注入新鲜感。", quote: "好奇心越强，人生选择越多。" },
  { id: "m49", methodNo: 49, module: "emotion", title: "戒掉否定情绪", icon: "🫶", content: "接纳自己的特质，不盲目比较。", quote: "不同不等于差距，接受真实的自己。" },
  { id: "m50", methodNo: 50, module: "emotion", title: "戒掉讨好情绪", icon: "💞", content: "不靠过度付出换认可，练习无条件自我接纳。", quote: "不努力也会被爱。" },
  { id: "m51", methodNo: 51, module: "emotion", title: "不被外界左右", icon: "🧷", content: "不把价值感建立在外部评价上。", quote: "自我价值不会因他人评价而改变。" },
  { id: "m52", methodNo: 52, module: "emotion", title: "戒掉不安", icon: "🛡️", content: "接受低谷期，稳住节奏持续行动。", quote: "稳定的情绪会在痛苦时期支撑你。" },
  { id: "m53", methodNo: 53, module: "emotion", title: "戒掉慌乱", icon: "🪶", content: "回看过往成功经验，提炼可复用信念。", quote: "信念会成为前行的支撑力量。" },
  { id: "m54", methodNo: 54, module: "emotion", title: "座右铭激励", icon: "“”", content: "用一句积极话语做日常自我对话锚点。", quote: "没有失败，只有反馈。" },
  { id: "m55", methodNo: 55, module: "emotion", title: "区分应该做和想做", icon: "🧭", content: "识别内心真实意愿再行动。", quote: "问问自己是应该做，还是想做。" },
  { id: "m56", methodNo: 56, module: "emotion", title: "了解性格类型", icon: "🧩", content: "识别情绪模式，做更匹配自己的策略。", quote: "了解自己，才能抓住调整原理。" },
  { id: "m57", methodNo: 57, module: "emotion", title: "重视热衷之事", icon: "❤️", content: "回到让你真正投入的兴趣源头。", quote: "童年着迷的事情里藏着欲望种子。" },
  { id: "m58", methodNo: 58, module: "emotion", title: "谁都想听好话", icon: "🎧", content: "理解被认可需求，但行动核心仍回到自我。", quote: "行动核心应是自我欲望，动力才长久。" },
  { id: "m59", methodNo: 59, module: "emotion", title: "找到使命", icon: "🚩", content: "将目标扩展到对他人和社会的价值。", quote: "使命感会迸发更持久的积极性。" },

  { id: "m60", methodNo: 60, module: "environment", title: "尝试改变环境", icon: "🚪", content: "进入新圈层，借新环境激活新行为。", quote: "近朱者赤，近墨者黑。" },
  { id: "m61", methodNo: 61, module: "environment", title: "和榜样成为朋友", icon: "🌟", content: "靠近标杆人物，在追赶中进步。", quote: "与榜样相遇，可能成为人生转折。" },
  { id: "m62", methodNo: 62, module: "environment", title: "结交志同道合伙伴", icon: "👥", content: "找到合拍团队，让坚持更轻松。", quote: "在合拍团体中能找到舒服的成长位置。" },
  { id: "m63", methodNo: 63, module: "environment", title: "提高机会敏感度", icon: "☄️", content: "捕捉书、对话、场景中的机会信号。", quote: "机会很多，但善观察者才能发现。" },
  { id: "m64", methodNo: 64, module: "environment", title: "等待好机会", icon: "⏳", content: "耐心准备，在关键契机出现时果断行动。", quote: "改变常以突变为契机，耐心等待并准备。" },
  { id: "m65", methodNo: 65, module: "environment", title: "获得反馈", icon: "💬", content: "把反馈当成长养分，及时修正方向。", quote: "没有反馈就没有成长。" },
];

export function getModuleHabits(module: ReferenceModuleKey): ReferenceHabit[] {
  return referenceHabits.filter((item) => item.module === module);
}

export function getPagedHabits(module: ReferenceModuleKey, page: number): ReferenceHabit[] {
  const data = getModuleHabits(module);
  const sizes = moduleMeta[module].pages;
  const pageIndex = Math.max(0, Math.min(page, sizes.length - 1));
  const start = sizes.slice(0, pageIndex).reduce((a, b) => a + b, 0);
  const end = start + sizes[pageIndex];
  return data.slice(start, end);
}

