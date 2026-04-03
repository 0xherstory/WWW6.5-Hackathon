import type { Question, Domain, DomainScores } from "@/types/game";

export const QUESTIONS: Question[] = [
  {
    id: 1,
    scene: "今天，你被问了第十次——",
    text: "「你怎么还不结婚？」\n来自同事、亲戚、甚至陌生人。\n你的第一反应是……",
    options: [
      {
        id: "1a",
        text: "把这种窒息感记录下来——\n写成文字、拍成照片，\n让更多人看见它。",
        weights: { art: 3, science: 0, law: 1 },
      },
      {
        id: "1b",
        text: "冷静下来，想搞清楚\n这种压力背后的数据和社会根源。",
        weights: { art: 0, science: 3, law: 1 },
      },
      {
        id: "1c",
        text: "思考这句话是否构成骚扰，\n以及我是否有权利要求对方道歉。",
        weights: { art: 1, science: 0, law: 3 },
      },
    ],
  },
  {
    id: 2,
    scene: "你发现了一件事——",
    text: "你所在的行业里，女性高管不到 10%。\n你认为改变这件事，\n最有效的方式是……",
    options: [
      {
        id: "2a",
        text: "让更多女性故事被看见——\n用影视、文学、展览\n改变大众的想象力。",
        weights: { art: 3, science: 1, law: 0 },
      },
      {
        id: "2b",
        text: "做系统研究，找到根本原因，\n设计可量化的解决方案。",
        weights: { art: 0, science: 3, law: 1 },
      },
      {
        id: "2c",
        text: "推动强制配额立法，\n用制度倒逼结构性改变。",
        weights: { art: 1, science: 0, law: 3 },
      },
    ],
  },
  {
    id: 3,
    scene: "如果人生是一段旅程——",
    text: "你最希望在终点回头看到的是……",
    options: [
      {
        id: "3a",
        text: "我创造了让这个世界\n变得更温柔的东西。",
        weights: { art: 3, science: 1, law: 0 },
      },
      {
        id: "3b",
        text: "我弄清楚了一件\n从没有人弄清楚过的事。",
        weights: { art: 0, science: 3, law: 1 },
      },
      {
        id: "3c",
        text: "我让某些规则，\n对更多人变得公平了。",
        weights: { art: 1, science: 0, law: 3 },
      },
    ],
  },
];

export function calcScores(answers: Record<number, string>): DomainScores {
  const scores: DomainScores = { art: 0, science: 0, law: 0 };
  for (const q of QUESTIONS) {
    const optionId = answers[q.id];
    if (!optionId) continue;
    const option = q.options.find((o) => o.id === optionId);
    if (!option) continue;
    for (const domain of Object.keys(scores) as Domain[]) {
      scores[domain] += option.weights[domain];
    }
  }
  return scores;
}

export function getWinners(scores: DomainScores): Domain[] {
  const max = Math.max(...Object.values(scores));
  return (Object.keys(scores) as Domain[]).filter((d) => scores[d] === max);
}

export const DOMAIN_META: Record<
  Domain,
  { label: string; icon: string; tagline: string; lore: string; color: string }
> = {
  art: {
    label: "艺术领域",
    icon: "🎨",
    tagline: "用创作让沉默发声",
    lore: "你相信一幅画、一首诗、一个故事\n能让世界听见那些被压制的声音。\n你的武器是感知，你的战场是人心。",
    color: "art",
  },
  science: {
    label: "科学领域",
    icon: "🔬",
    tagline: "用知识突破偏见",
    lore: "你相信数据和事实是最锋利的武器。\n在充满偏见的世界里，\n你选择用证据说话。",
    color: "science",
  },
  law: {
    label: "法律领域",
    icon: "⚖️",
    tagline: "用规则保护权利",
    lore: "你相信改变规则才能改变命运。\n你愿意站在规则前，\n逼着它为更多人让路。",
    color: "law",
  },
};
