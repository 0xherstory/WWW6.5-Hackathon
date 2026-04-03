import type { Card, SBTDefinition, Domain, SBTId } from "@/types/game";

// ─── SBT Definitions ────────────────────────────────────────────────────────

export const SBT_DEFINITIONS: SBTDefinition[] = [
  {
    id: "spark",
    domain: "art",
    attribute: "creativity",
    name: "灵感火花",
    icon: "✦",
    color: "#FF6B9D",
    highlightTitle: "灵感火花 · 觉醒",
    highlightStory:
      "有人问弗里达·卡洛，为什么总是画自己。\n她说：「因为我是我最了解的主题。」\n\n你的创作不需要向任何人解释——\n它本身，就是答案。\n\n你已点燃属于自己的灵感火花。",
  },
  {
    id: "brush",
    domain: "art",
    attribute: "resilience",
    name: "执着画笔",
    icon: "⊘",
    color: "#FFB347",
    highlightTitle: "执着画笔 · 淬炼",
    highlightStory:
      "格奥尔基亚·欧姬芙在沙漠独居数十年，\n外界称她疯了。\n她只是继续画。\n\n后来那片沙漠成了世界上\n最著名的艺术风景。\n\n坚持，是另一种天才。",
  },
  {
    id: "explorer",
    domain: "science",
    attribute: "curiosity",
    name: "探索者徽章",
    icon: "◎",
    color: "#00D4FF",
    highlightTitle: "探索者 · 燃起",
    highlightStory:
      "屠呦呦翻遍了两千年的中医典籍，\n只为找到那一味草药。\n\n她说：「不要因为看不见终点\n就停下来。」\n\n每一个问题，都值得被认真对待。",
  },
  {
    id: "experiment",
    domain: "science",
    attribute: "rigor",
    name: "实验精神",
    icon: "⊕",
    color: "#50FA7B",
    highlightTitle: "实验精神 · 铸就",
    highlightStory:
      "居里夫人在实验笔记里写道：\n每一次失败都是数据。\n\n她没有失败过——\n她只是在排除错误答案。\n\n严谨，是通往真相最诚实的路。",
  },
  {
    id: "scale",
    domain: "law",
    attribute: "justice",
    name: "天平守护",
    icon: "⚖",
    color: "#FFD700",
    highlightTitle: "天平守护 · 立誓",
    highlightStory:
      "RBG 说：\n「当你遇到不公正，\n不要愤怒地砸墙。\n找到门，走进去，改变它。」\n\n正义不是感受，\n是行动。",
  },
  {
    id: "warrior",
    domain: "law",
    attribute: "courage",
    name: "无畏斗士",
    icon: "⚡",
    color: "#FF79C6",
    highlightTitle: "无畏斗士 · 破门",
    highlightStory:
      "第一位登上最高法院的女性大法官，\n是在所有人都说「这不可能」的时候\n走进去的。\n\n勇气不是不害怕——\n是害怕了，还是去做。",
  },
];

export function getSBTByAttr(attribute: string): SBTDefinition | undefined {
  return SBT_DEFINITIONS.find((s) => s.attribute === attribute);
}

export function getDomainSBTs(domain: Domain): SBTDefinition[] {
  return SBT_DEFINITIONS.filter((s) => s.domain === domain);
}

export function isMilestoneUnlocked(
  domain: Domain,
  mintedSBTs: SBTId[]
): boolean {
  const needed = getDomainSBTs(domain).map((s) => s.id);
  return needed.every((id) => mintedSBTs.includes(id));
}

// ─── Cards ───────────────────────────────────────────────────────────────────

export const CARDS: Card[] = [
  // ── ART ──────────────────────────────────────────────────────────────────
  {
    id: "A1",
    domain: "art",
    scene: "创作初成，质疑先至——",
    text: "你刚完成第一幅重要作品。\n导师看完说：\n「技巧不错，但女生很难在这行出头。」",
    options: [
      { text: "沉默。把愤怒化成笔下\n最有力的一笔。", attribute: "resilience", value: 2 },
      { text: "当天开始新系列——\n专门描绘那些被压制的女性面孔。", attribute: "creativity", value: 2 },
    ],
  },
  {
    id: "A2",
    domain: "art",
    scene: "机会来了，但附带条件——",
    text: "画廊邀请你参展，\n但要求将风格改得「更柔和、更市场化」。",
    options: [
      { text: "拒绝修改，\n另寻真正支持原创的展览。", attribute: "resilience", value: 1 },
      { text: "带着原风格参展，\n用作品本身说服他们。", attribute: "creativity", value: 2 },
    ],
  },
  {
    id: "A3",
    domain: "art",
    scene: "真实的伤疤，能成为作品吗——",
    text: "你想把亲历的骚扰经历做成装置艺术。\n朋友劝你：\n「这样会影响你的形象。」",
    options: [
      { text: "把这段经历完整保留，\n决定让它被看见。", attribute: "creativity", value: 2 },
      { text: "一遍遍打磨，\n直到它成为你迄今最强的表达。", attribute: "resilience", value: 2 },
    ],
  },
  {
    id: "A4",
    domain: "art",
    scene: "走红之后——",
    text: "作品在网上走红，\n但评论区大量留言在评论你的外貌\n而非作品本身。",
    options: [
      { text: "截图这些评论，\n把它们做成新作品的素材。", attribute: "creativity", value: 2 },
      { text: "关掉评论区，继续创作，\n不让噪音进入工作室。", attribute: "resilience", value: 1 },
    ],
  },
  {
    id: "A5",
    domain: "art",
    scene: "远方的机会，家人的担忧——",
    text: "你获得了海外驻留创作机会。\n家人认为：\n「女儿不该独自去陌生地方。」",
    options: [
      { text: "出发。带着家人的担忧\n和自己的期待一起去。", attribute: "resilience", value: 2 },
      { text: "把这段矛盾本身\n作为驻留期间的创作主题。", attribute: "creativity", value: 2 },
    ],
  },
  {
    id: "A6",
    domain: "art",
    scene: "成功之后，嫉妒随之而来——",
    text: "资深男性艺术家当众声称：\n「你的成功得益于性别优势。」",
    options: [
      { text: "公开列出你十年来\n被拒绝的展览申请清单。", attribute: "creativity", value: 1 },
      { text: "不理会。把今晚的愤怒\n全部投入明天的创作。", attribute: "resilience", value: 2 },
    ],
  },

  // ── SCIENCE ───────────────────────────────────────────────────────────────
  {
    id: "S1",
    domain: "science",
    scene: "你的想法被转走了——",
    text: "导师把你的研究想法转给男同学执行，\n说：「你更适合做数据整理。」",
    options: [
      { text: "私下继续推进自己的实验，\n用结果说话。", attribute: "rigor", value: 2 },
      { text: "系统阅读该领域所有文献，\n成为组里最懂这个方向的人。", attribute: "curiosity", value: 2 },
    ],
  },
  {
    id: "S2",
    domain: "science",
    scene: "你的声音消失在会议室——",
    text: "学术会议上你的观点被无视。\n5分钟后，男同事重复同样的话\n获得了掌声。",
    options: [
      { text: "当场指出：\n「这正是我刚才说的。」", attribute: "rigor", value: 1 },
      { text: "把这个观点写成论文发表，\n让记录说话。", attribute: "curiosity", value: 2 },
    ],
  },
  {
    id: "S3",
    domain: "science",
    scene: "数据有问题，但论文已投出——",
    text: "你发现实验数据存在异常。\n导师说：「别声张，\n论文已经投出去了。」",
    options: [
      { text: "坚持要求重新验证，\n哪怕推迟发表。", attribute: "rigor", value: 2 },
      { text: "悄悄记录所有异常，\n开始独立验证实验。", attribute: "curiosity", value: 1 },
    ],
  },
  {
    id: "S4",
    domain: "science",
    scene: "采访变成了另一种凝视——",
    text: "媒体采访你的研究成果，\n却不停追问：\n「女科学家如何平衡家庭和工作？」",
    options: [
      { text: "直接说：「我的男性同事\n从未被问过这个问题。我们聊研究吧。」", attribute: "rigor", value: 2 },
      { text: "把这个问题写进下一篇课题：\n性别偏见如何影响女性科研产出。", attribute: "curiosity", value: 2 },
    ],
  },
  {
    id: "S5",
    domain: "science",
    scene: "女性健康研究，不够主流？——",
    text: "你的女性健康研究经费申请被拒，\n理由是：「方向不够主流。」",
    options: [
      { text: "重新申请，\n这次把数据做得无可挑剔。", attribute: "rigor", value: 2 },
      { text: "联系其他女性健康研究者，\n组建研究联盟共同申请。", attribute: "curiosity", value: 1 },
    ],
  },
  {
    id: "S6",
    domain: "science",
    scene: "师妹找到了你——",
    text: "师妹告诉你导师对她有不当行为，\n但她不敢举报。",
    options: [
      { text: "陪她整理证据，\n告诉她你会一直支持她。", attribute: "rigor", value: 1 },
      { text: "研究学校举报流程和成功案例，\n找到最有效的路径。", attribute: "curiosity", value: 2 },
    ],
  },

  // ── LAW ───────────────────────────────────────────────────────────────────
  {
    id: "L1",
    domain: "law",
    scene: "对方试图改写受害者的故事——",
    text: "你的当事人是家暴受害者。\n对方律师反复强调她\n「不够顺从才导致婚姻破裂」。",
    options: [
      { text: "在法庭上系统拆解这套逻辑，\n让每一个论点都站不住脚。", attribute: "justice", value: 2 },
      { text: "站起来，清晰说出当事人的陈述，\n不被对方叙事带走。", attribute: "courage", value: 2 },
    ],
  },
  {
    id: "L2",
    domain: "law",
    scene: "有人在威胁你的职业生涯——",
    text: "公司法务暗示你：\n「和解比胜诉\n对你的职业生涯更好。」",
    options: [
      { text: "拒绝和解，\n继续准备庭审材料。", attribute: "courage", value: 2 },
      { text: "把这次施压记录下来，\n作为职场文化问题的补充证据。", attribute: "justice", value: 2 },
    ],
  },
  {
    id: "L3",
    domain: "law",
    scene: "当事人想放弃了——",
    text: "当事人因经济原因准备撤诉。\n你知道放弃意味着\n施害者不受任何惩处。",
    options: [
      { text: "告知所有可能的法律援助资源，\n让她有更多选择。", attribute: "justice", value: 2 },
      { text: "尊重她的决定，\n但提出以公益诉讼继续推进。", attribute: "courage", value: 1 },
    ],
  },
  {
    id: "L4",
    domain: "law",
    scene: "为她发声，威胁随之而来——",
    text: "你在社交媒体为争议案发声，\n遭到大量网络暴力和人身威胁。",
    options: [
      { text: "不删帖，\n继续用法律视角分析事件。", attribute: "courage", value: 2 },
      { text: "整理威胁内容，向平台和警方\n双线举报，把每条威胁变成证据。", attribute: "justice", value: 2 },
    ],
  },
  {
    id: "L5",
    domain: "law",
    scene: "不公就在你自己所在的地方——",
    text: "你发现律所系统性\n压低女律师薪资。",
    options: [
      { text: "收集数据，联合其他女律师，\n向人力部门正式提出质疑。", attribute: "justice", value: 2 },
      { text: "如内部无法解决，\n将材料提交劳动监察机构。", attribute: "courage", value: 1 },
    ],
  },
  {
    id: "L6",
    domain: "law",
    scene: "庭审上的双重标准——",
    text: "法官在庭审中多次打断你，\n对同案男律师却畅通无阻。",
    options: [
      { text: "平静要求：「请允许我说完。」\n然后继续陈述。", attribute: "courage", value: 2 },
      { text: "庭后记录全程，\n向律师协会提交程序异议。", attribute: "justice", value: 2 },
    ],
  },
];

export function getDomainCards(domain: Domain): Card[] {
  return CARDS.filter((c) => c.domain === domain);
}

export function drawCard(domain: Domain, drawnIds: string[]): Card | null {
  const pool = getDomainCards(domain);
  const remaining = pool.filter((c) => !drawnIds.includes(c.id));
  // reshuffle if all drawn
  const source = remaining.length > 0 ? remaining : pool;
  return source[Math.floor(Math.random() * source.length)] ?? null;
}
