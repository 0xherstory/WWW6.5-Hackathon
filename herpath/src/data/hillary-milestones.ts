import type { LeaderMilestones } from "@/types/milestone";

export const HILLARY_MILESTONES: LeaderMilestones = {
  leaderId: "hillary",
  leaderName: "Hillary Clinton",
  branches: [
    {
      attribute: "impact",
      branchName: "影响力",
      color: "#FF6B9D",
      levels: [
        {
          threshold: 3,
          sbtId: "hillary_impact_l1",
          sbtName: "【风暴中心的博弈】",
          sbtIcon: "⚡",
          situation:
            "医疗改革陷入僵局，利益集团在电视上疯狂攻击你的计划。\n\n你组建专门的游说团队，在系统内部进行权力交换。",
          flavor:
            "在各方利益的绞肉机里，你精准地找到了共赢的平衡点。权力在你手中化作了治愈的工具。",
        },
        {
          threshold: 6,
          sbtId: "hillary_impact_l2",
          sbtName: "【十八万次裂痕】",
          sbtIcon: "🔨",
          situation:
            "竞选议员时，对手称你只是一个「靠丈夫名声的过客」。\n\n你深入每一个社区，用详尽的数据和盟友网络证明实力。",
          flavor:
            "每一次握手，每一次演讲，都在那天花板上留下了一道裂痕。此勋章代表你永不停歇的基层动员力。",
        },
        {
          threshold: 9,
          sbtId: "hillary_impact_l3",
          sbtName: "【外交之网】",
          sbtIcon: "🌐",
          situation:
            "担任国务卿期间，面对紧张的国际局势，硬实力无法解决问题。\n\n你提出「聪明权力」外交，在全球范围内建立弹性联盟。",
          flavor:
            "世界不再是零和博弈。你用「聪明权力」连接全球，将原本敌对的力量编织成进步的纽带。",
        },
        {
          threshold: 12,
          sbtId: "hillary_impact_l4",
          sbtName: "【资源的共振】",
          sbtIcon: "💎",
          situation:
            "全球公益项目需要巨额资金，但传统捐赠模式效率低下。\n\n你整合全球资源，建立跨领域的互助倡议平台。",
          flavor:
            "你懂得如何放大善良的力量。通过整合资源，你让微弱的呼喊变成了震撼世界的全球倡议。",
        },
        {
          threshold: 15,
          sbtId: "hillary_impact_l5",
          sbtName: "【巅峰的冠冕】",
          sbtIcon: "👑",
          situation:
            "登上权力的巅峰舞台，所有的聚光灯和质疑都指向你。\n\n你接受这份重量，将个人影响力转化为推动文明的齿轮。",
          flavor:
            "站在聚光灯下，你承载了所有的野心与责任。这枚勋章代表你作为领导者，对整个系统进行重塑的影响力。",
        },
      ],
    },
    {
      attribute: "resilience",
      branchName: "韧性",
      color: "#00D4FF",
      levels: [
        {
          threshold: 3,
          sbtId: "hillary_resilience_l1",
          sbtName: "【第一道伤痕】",
          sbtIcon: "💔",
          situation:
            "第一次司法考试失败（DC Bar），这在你的人生中前所未有。\n\n你接受失败，立即转身投入另一条更广阔的道路。",
          flavor:
            "失败是强者的勋章。你从挫折中站起的速度，定义了你未来的高度。",
        },
        {
          threshold: 6,
          sbtId: "hillary_resilience_l2",
          sbtName: "【不碎的盔甲】",
          sbtIcon: "🛡️",
          situation:
            "面对家庭与事业的双重风暴，全世界都在看你崩溃的笑话。\n\n你保持职业风度，在公众面前展现惊人的克制力。",
          flavor:
            "当流言蜚语试图击碎你的尊严，你用职业精神筑起了最坚固的防线。泰山崩于前而色不变。",
        },
        {
          threshold: 9,
          sbtId: "hillary_resilience_l3",
          sbtName: "【马拉松式的耐心】",
          sbtIcon: "⏱️",
          situation:
            "在长达 11 小时的恶意听证会上，对方试图激怒你，让你失态。\n\n你保持微笑，平静地用事实回击每一个尖锐的问题。",
          flavor:
            "在长达十数小时的审问与折磨中，你的微笑从未消失。这枚勋章致敬你那深不见底的心理韧性。",
        },
        {
          threshold: 12,
          sbtId: "hillary_resilience_l4",
          sbtName: "【折不断的脊梁】",
          sbtIcon: "🌲",
          situation:
            "在竞选初选中失利，你的支持者感到绝望。\n\n你加入昔日对手的团队，为了更大的目标继续服务。",
          flavor:
            "哪怕梦想转弯，使命依然向前。你为了更大的目标，甘愿在新的阵地继续发光发热。",
        },
        {
          threshold: 15,
          sbtId: "hillary_resilience_l5",
          sbtName: "【永恒的斗志】",
          sbtIcon: "🔥",
          situation:
            "最终的目标近在咫尺却遗憾错过，所有人都以为你完了。\n\n你优雅地发表谢幕演讲，宣称「女孩们，继续去撞击那堵墙」。",
          flavor:
            "谢幕并不代表结束。你的勋章闪耀着永不熄灭的火焰，激励着后来者继续撞击那道尚未全碎的墙。",
        },
      ],
    },
  ],
};
