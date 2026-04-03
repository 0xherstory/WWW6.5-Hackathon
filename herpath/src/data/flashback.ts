import type { MemoryCard, Dimension, Leader } from "@/types/flashback";

export const MEMORY_CARDS: MemoryCard[] = [
  {
    id: "M01",
    scene: "你面前有一台损坏的精密仪器。",
    leftText: "拆开它，研究其运行逻辑。",
    leftDim: "sci",
    rightText: "感受它的残缺，记录这种遗憾。",
    rightDim: "art",
    imageKey: "broken_instrument",
  },
  {
    id: "M02",
    scene: "规则手册上有一行明显不公的条文。",
    leftText: "撰写修正案，发起申诉。",
    leftDim: "law",
    rightText: "撕掉那一页，在上面作画。",
    rightDim: "art",
    imageKey: "rule_book",
  },
  {
    id: "M03",
    scene: "实验室的黑板上留下了一串未知公式。",
    leftText: "尝试推导证明，寻找真相。",
    leftDim: "sci",
    rightText: "把它看作一种神谕般的秩序。",
    rightDim: "law",
    imageKey: "blackboard_formula",
  },
  {
    id: "M04",
    scene: "远方传来一阵不息的噪音。",
    leftText: "去调查干扰源，排除故障。",
    leftDim: "sci",
    rightText: "去维护现场秩序，调解纷争。",
    rightDim: "law",
    imageKey: "distant_noise",
  },
  {
    id: "M05",
    scene: "你在空白的墙壁前停下。",
    leftText: "涂抹色彩，表达你的愤怒。",
    leftDim: "art",
    rightText: "刻下信条，宣誓你的立场。",
    rightDim: "law",
    imageKey: "blank_wall",
  },
  {
    id: "M06",
    scene: "你发现了一卷被遗忘的古老卷轴。",
    leftText: "破译其中隐藏的数学密码。",
    leftDim: "sci",
    rightText: "临摹其中优美的线条与构图。",
    rightDim: "art",
    imageKey: "ancient_scroll",
  },
  {
    id: "M07",
    scene: "街道上，两群人正因为资源分配争吵。",
    leftText: "制定一套绝对公平的分配协议。",
    leftDim: "law",
    rightText: "搭建一个舞台，缓解紧张氛围。",
    rightDim: "art",
    imageKey: "street_dispute",
  },
  {
    id: "M08",
    scene: "森林里有一株闪着微光的未知植物。",
    leftText: "采集样本进行生物特性分析。",
    leftDim: "sci",
    rightText: "赋予它一个带有诗意的名字。",
    rightDim: "art",
    imageKey: "glowing_plant",
  },
  {
    id: "M09",
    scene: "你手中的代码出现了无法解释的死循环。",
    leftText: "逐行调试，定位逻辑漏洞。",
    leftDim: "sci",
    rightText: "引入一套新的系统运行准则。",
    rightDim: "law",
    imageKey: "code_loop",
  },
  {
    id: "M10",
    scene: "一场暴雨摧毁了小镇的公共广场。",
    leftText: "组织大家重建，确保程序合规。",
    leftDim: "law",
    rightText: "在废墟上创作一首关于重生的诗。",
    rightDim: "art",
    imageKey: "ruined_plaza",
  },
  {
    id: "M11",
    scene: "你被要求为未来的城市设计一枚徽章。",
    leftText: "必须包含几何对称与黄金比例。",
    leftDim: "sci",
    rightText: "必须代表平等与正义的契约。",
    rightDim: "law",
    imageKey: "city_badge",
  },
  {
    id: "M12",
    scene: "夜空中出现了一颗从未见过的流星。",
    leftText: "立即计算它的运行轨道与速度。",
    leftDim: "sci",
    rightText: "向它许愿，祈祷世界的和平。",
    rightDim: "law",
    imageKey: "meteor",
  },
  {
    id: "M13",
    scene: "你走进一座废弃的法院。",
    leftText: "翻阅判例，寻找正义的痕迹。",
    leftDim: "law",
    rightText: "聆听回声，感受空间的宏伟。",
    rightDim: "art",
    imageKey: "abandoned_court",
  },
  {
    id: "M14",
    scene: "一个智能机器人试图理解什么是\"爱\"。",
    leftText: "向它展示一堆情感分析数据。",
    leftDim: "sci",
    rightText: "带它去看一场感人至深的戏剧。",
    rightDim: "art",
    imageKey: "robot_love",
  },
  {
    id: "M15",
    scene: "世界即将重启，你只能保留一样东西。",
    leftText: "刻满人类所有公约的石碑。",
    leftDim: "law",
    rightText: "装满世间所有色彩的调色盘。",
    rightDim: "art",
    imageKey: "world_restart",
  },
];

export function drawMemoryCards(count: number = 6): MemoryCard[] {
  const shuffled = [...MEMORY_CARDS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

export function determineLeader(scores: Record<Dimension, number>): Leader {
  const maxDim = Object.entries(scores).sort(([, a], [, b]) => b - a)[0][0];
  if (maxDim === "law") return "rbg";
  return "hillary"; // art or sci
}

export const LEADER_META: Record<Leader, { name: string; icon: string; title: string; color: string }> = {
  rbg: {
    name: "Ruth Bader Ginsburg",
    icon: "⚖",
    title: "法理与平权的守护者",
    color: "#FFD700",
  },
  hillary: {
    name: "Hillary Clinton",
    icon: "🎭",
    title: "影响力与韧性的化身",
    color: "#FF6B9D",
  },
};
