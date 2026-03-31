export type ExperienceLocale = "zh" | "en";

/** 与首页 `messages[locale].topics` 标题一一对应的占位正文，可后续替换为真实姐妹经验。 */
export const experienceBodies: Record<ExperienceLocale, Record<string, string>> = {
  zh: {
    我解决了痛经: `这是一篇占位姐妹经验，后续可替换为真实分享。

我曾长期被痛经困扰，试过热敷、适度运动和调整作息后，疼痛逐渐减轻。每个人的身体不同，若疼痛剧烈或伴随异常出血，请务必咨询专业医生。

愿你的身体被温柔对待。`,
    女性妇科医生推荐: `这是一篇占位姐妹经验，后续可替换为真实分享。

选择医生时，我会留意对方是否尊重隐私、耐心解释检查步骤，并支持女性患者的感受。你也可以向信任的朋友打听口碑，或查阅正规医疗机构信息。

本页内容为示例，具体请以当地医疗资源为准。`,
    "如何在成年后改姓随母姓？": `这是一篇占位姐妹经验，后续可替换为真实分享。

改姓涉及户籍与法律流程，各地规定不同。一般需要准备相关材料并向户籍部门咨询。建议同时寻求法律或政务窗口的专业指导。

以下为占位说明，请以自己的实际情况为准。`,
    "保护婚内财产的小Tips": `这是一篇占位姐妹经验，后续可替换为真实分享。

了解夫妻共同财产与个人财产的基本界限、保留重要凭证、在重大决定前咨询律师，都是常见的自我保护方式。沟通与边界同样重要。

本文非法律意见，仅为温和提醒与示例文案。`,
    月经杯使用心得: `这是一篇占位姐妹经验，后续可替换为真实分享。

初次使用月经杯需要耐心练习折叠与放置，选择合适尺码并注意清洁消毒。若感到不适或反复失败，可以暂停并咨询医护人员。

每个人的体验不同，请以自身舒适与安全为先。`,
    经前期综合症: `这是一篇占位姐妹经验，后续可替换为真实分享。

经前期情绪波动、胀痛或疲劳很常见。记录周期、保证睡眠、减少咖啡因与适度运动，有时会带来缓解。若症状严重影响生活，建议寻求妇科或心理支持。

你并不孤单，这些症状值得被认真对待。`,
  },
  en: {
    "I solved period pain": `This is placeholder sister wisdom—you can replace it with a real story later.

I struggled with painful periods for years. Gentle heat, light movement, and steadier sleep helped ease my symptoms. Every body is different; if pain is severe or unusual, please see a clinician.

May you be kind to your body.`,
    "Trusted female gynecologists": `This is placeholder guidance—swap in real recommendations when ready.

I look for doctors who respect privacy, explain exams clearly, and listen without judgment. Word of mouth from people you trust and verified clinic listings can be good starting points.

This page is an example only; follow local healthcare resources.`,
    "How to change surname to mother's?": `This is placeholder information—please verify with official sources.

Name changes depend on local civil registration rules. You may need specific documents and appointments. Legal aid or government service desks can walk you through the steps.

Treat this text as a sample, not legal advice.`,
    "Tips to protect marital assets": `This is placeholder sister-to-sister notes—not legal counsel.

Understanding what counts as shared vs. personal property, keeping records of major decisions, and talking to a lawyer before big moves are common protective habits. Boundaries and communication matter too.`,
    "Menstrual cup user notes": `This is placeholder experience—replace with your own journey.

Learning folds and placement takes practice. Pick a size that fits your body, sterilize as directed, and pause if you feel pain. A healthcare provider can help if it never feels right.

Comfort and safety come first.`,
    "Premenstrual syndrome": `This is placeholder reassurance—you deserve real care.

Mood shifts, soreness, or fatigue before a period are common. Tracking cycles, sleep, less caffeine, and gentle movement sometimes help. If symptoms disrupt life, consider gynecology or mental health support.

You are not alone, and your symptoms matter.`,
  },
};

export function getExperienceBody(locale: ExperienceLocale, topicTitle: string): string {
  return experienceBodies[locale][topicTitle] ?? "";
}
