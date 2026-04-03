import type { LeaderMilestones } from "@/types/milestone";

export const RBG_MILESTONES: LeaderMilestones = {
  leaderId: "rbg",
  leaderName: "Ruth Bader Ginsburg",
  branches: [
    {
      attribute: "equality",
      branchName: "平权意识",
      color: "#50FA7B",
      levels: [
        {
          threshold: 3,
          sbtId: "rbg_eq_l1",
          sbtName: "【不请自来的席位】",
          sbtIcon: "🪑",
          situation:
            "法学院院长在晚宴上质问你：「你为什么要占用一个本属于男性的名额？」\n\n你保持风度，用学业表现证明女性的价值。",
          flavor:
            "即便桌边没有你的椅子，也要带着你自己的才华入座。纪念你在偏见中夺回教育权的勇气。",
        },
        {
          threshold: 6,
          sbtId: "rbg_eq_l2",
          sbtName: "【无处投递的履历】",
          sbtIcon: "📋",
          situation:
            "尽管你是法学院第一名，但全纽约没有一家律师事务所愿意雇佣女性。\n\n你拒绝放弃，转入学术界研究「性别歧视」的法律根源。",
          flavor:
            "当大门紧闭，你没有选择哭泣，而是选择亲手锻造一把能打开所有锁的法理钥匙。",
        },
        {
          threshold: 9,
          sbtId: "rbg_eq_l3",
          sbtName: "【锋利的辩护状】",
          sbtIcon: "⚔️",
          situation:
            "你代表一位被空军歧视的女性军官辩护，对方认为这是「传统」。\n\n在最高法院面前，你首次引用宪法第十四修正案挑战传统。",
          flavor:
            "文字是你的武器。这枚勋章致敬你用宪法的笔触，划破了长久以来笼罩在女性头上的「传统」阴影。",
        },
        {
          threshold: 12,
          sbtId: "rbg_eq_l4",
          sbtName: "【粉碎的隔离墙】",
          sbtIcon: "🧱",
          situation:
            "军事学院拒绝招收女性。你面对的是整个保守体制的围攻。\n\n你撰写意见书，宣称「这种隔离本身就是不平等」。",
          flavor:
            "你证明了「隔离」绝不等于「平等」。此勋章代表你拆除了制度中那堵名为性别的隐形围墙。",
        },
        {
          threshold: 15,
          sbtId: "rbg_eq_l5",
          sbtName: "【正义之袍】",
          sbtIcon: "👗",
          situation:
            "你被提名为大法官。有人认为你太激进，有人认为你太温和。\n\n你坚守中立而坚定的立场，正式踏入正义的最高殿堂。",
          flavor:
            "这不仅仅是一件长袍，更是千万女性的期望。你终于登上了最高殿堂，成为了公平的化身。",
        },
      ],
    },
    {
      attribute: "legality",
      branchName: "法理精神",
      color: "#FFD700",
      levels: [
        {
          threshold: 3,
          sbtId: "rbg_leg_l1",
          sbtName: "【常春藤逻辑】",
          sbtIcon: "🌿",
          situation:
            "作为《法律评论》编辑，你需要处理堆积如山的枯燥文献，且不能出半点差错。\n\n你极致严谨，确保每一处引文都无懈可击。",
          flavor:
            "卓越没有性别之分。你在浩如烟海的法典中，淬炼出了最坚不可摧的学术基石。",
        },
        {
          threshold: 6,
          sbtId: "rbg_leg_l2",
          sbtName: "【隐形的斗篷】",
          sbtIcon: "🧣",
          situation:
            "你在任教期间怀孕，为了不失去教职，你必须穿大一码的衣服掩盖身孕。\n\n你忍耐不公，用这种「隐忍的智慧」保护研究权力。",
          flavor:
            "有时候，暂时的隐忍是为了更长远的爆发。此勋章纪念你在困境中保护理想、静待时机的智慧。",
        },
        {
          threshold: 9,
          sbtId: "rbg_leg_l3",
          sbtName: "【逻辑守门人】",
          sbtIcon: "🚪",
          situation:
            "一个法律漏洞可以让你的当事人获胜，但会破坏法律的整体逻辑。\n\n你放弃捷径，寻求一种更符合长远法理的胜诉路径。",
          flavor:
            "拒绝捷径，维护真理。你守住了法律最严苛的逻辑边界，确保正义不是空中楼阁。",
        },
        {
          threshold: 12,
          sbtId: "rbg_leg_l4",
          sbtName: "【程序的阶梯】",
          sbtIcon: "📈",
          situation:
            "被任命为巡回法院法官，面对堆积如山的琐碎行政案件。\n\n你将每一个小案件都视为法律大厦的一块基石，认真裁决。",
          flavor:
            "正义是漫长的马拉松。这枚勋章代表你对法律程序的敬畏，以及一步一个脚印改变世界的耐心。",
        },
        {
          threshold: 15,
          sbtId: "rbg_leg_l5",
          sbtName: "【金色的异议】",
          sbtIcon: "💛",
          situation:
            "法院内部意见分裂，你成为了极少数派，你的声音可能被淹没。\n\n你戴上那枚著名的「异议领饰」，撰写流传百世的异议书。",
          flavor:
            "当世界都在向左，你勇敢地站在右边。这枚异议领饰证明：少数人的声音，终将成为未来的共识。",
        },
      ],
    },
  ],
};

// 快速查询函数
export function getMilestoneByThreshold(
  attribute: string,
  threshold: number
): { sbtId: string; sbtName: string; situation: string; flavor: string } | null {
  const branch = RBG_MILESTONES.branches.find((b) => b.attribute === attribute);
  if (!branch) return null;
  const level = branch.levels.find((l) => l.threshold === threshold);
  if (!level) return null;
  return {
    sbtId: level.sbtId,
    sbtName: level.sbtName,
    situation: level.situation,
    flavor: level.flavor,
  };
}
