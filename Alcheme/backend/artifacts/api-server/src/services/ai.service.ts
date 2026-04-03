import { openai } from "@workspace/integrations-openai-ai-server";

export interface CardMetaResult {
  milestoneTitle: string;
  illustrationDescription: string;
}

export async function generateCardMeta(oreContents: string[]): Promise<CardMetaResult> {
  const combined = oreContents.join("\n\n").slice(0, 1200);

  const systemPrompt = `你是一个奇幻卡牌设计师。用户会提供若干条碎碎念/学习笔记，请你：
1. 提取所有内容中的核心动词和名词（代表用户的行动与收获）
2. 据此生成一个简洁有力的「里程碑标题」（中文，8字以内，像一枚传奇卡牌的名字）
3. 根据这些关键词，撰写一段 [New Assignment] 描述（英文，100-120词），格式严格如下：
   - Generate a single vertical rectangular card asset.
   - 描述外框材质时，必须使用高饱和度、明亮色彩的版本（如：jewel-toned amber-gold bronze / vivid emerald-verdigris copper / cobalt-veined luminous marble / royal violet gilded wood），并注明边框颜色必须鲜艳饱满而非暗沉灰旧；同时描述框上集成的具体机械或自然元素（如 miniature clockwork gears, carved waves, living vines 等）
   - 列出嵌入符号（2个，与主题直接相关，如 compass and seahorse / quill and atom / dagger and key）
   - 描述中央水彩插图：根据主题自由选择最合适的视觉形式，可以是：象征性物件组合（如书卷、水晶球、星盘、钥匙）、奇幻风景（如漂浮岛、宇宙图书馆、光之神殿）、抽象魔法场景（如流动符文、星座图谱、能量漩涡）、神秘生物（如凤凰、龙、精灵）、或人物场景；不强制出现人物，优先选择与主题最贴切的形式；使用魔法柔和色调（lavender mist, rose gold shimmer, mint-teal haze, peach-amber warmth, celestial periwinkle），含 star-connect-dot constellations、arcane mist、floating spell particles、golden bokeh
   - 安全规则：若插图中选择出现人物，必须为 elegant young woman
   - 重要空间约束：所有插图元素（人物、迷雾、粒子、光线）必须严格限定在边框内侧，不得超出或遮盖边框
   - 结尾固定写：All illustration elements are strictly contained within the frame boundary. No text, no letters, no numbers in the image. Set against a checkered transparent background. Maintain the exact thickness and style of the frames.

参考示例（请模仿这种具体程度和详细程度）：
[New Assignment]: Generate a single vertical rectangular card asset. The outer frame is made of aged copper and brass, integrated with actual moving, miniature clockwork gears and carved waves. It has inset symbols of a compass and a seahorse. The central illustration, in the watercolor style, shows a three-masted sailing ship with billowing sails, navigating a sea of swirling teal and orange mists under a complex, star-connect-dot constellation sky. Golden fireflies are scattered throughout the mists. Ensure all other elements of the protocol (materials, lighting, checkerboard background) are present.

只返回如下 JSON，不要有其他内容：
{
  "milestoneTitle": "里程碑标题",
  "illustrationDescription": "[New Assignment] English description following the format above"
}`;

  const response = await openai.chat.completions.create({
    model: "gpt-5.2",
    max_completion_tokens: 512,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: combined },
    ],
  });

  const raw = response.choices[0]?.message?.content ?? "{}";
  try {
    const parsed = JSON.parse(raw) as CardMetaResult;
    return {
      milestoneTitle: parsed.milestoneTitle?.trim() || "成长里程碑",
      illustrationDescription: parsed.illustrationDescription?.trim() || "",
    };
  } catch {
    return { milestoneTitle: "成长里程碑", illustrationDescription: "" };
  }
}

export interface BadgeEvolutionResult {
  /** 进化后的封号（中文，6字以内，高级感，体现成长层次） */
  title: string;
  /** 进化后勋章的插图描述（英文，50词以内，场景要体现从旧到新的进阶感） */
  illustrationDescription: string;
  /** 进化叙述（中文，一句话，写入勋章 description） */
  evolutionNarrative: string;
}

export async function generateBadgeEvolution(
  previousBadge: { name: string; description: string } | null,
  newCardContents: string[],
): Promise<BadgeEvolutionResult> {
  const combined = newCardContents.join("\n\n").slice(0, 1000);

  const previousContext = previousBadge
    ? `旧勋章封号：「${previousBadge.name}」\n旧勋章描述：${previousBadge.description}`
    : "（这是第一枚勋章，没有前序封号）";

  const systemPrompt = `你是一位奇幻勋章铸造师，负责为用户铸造进化勋章。
用户有一枚旧勋章（代表过去的成就），并带来了新的卡片内容（代表最新的努力与突破）。
请你：
1. 结合旧勋章封号与新卡片内容，生成一个更高级别的「进化封号」（中文，6字以内，比旧封号更有气势/层次感）
2. 撰写一段 [New Assignment] 描述（英文，100-120词），格式如下：
   - Generate a single circular medallion asset.
   - 描述圆形外框材质时，必须使用高饱和度、明亮色彩的版本（如：brilliant amber-gold sunstone marble / vivid jewel-toned bronze with emerald verdigris / royal-violet patinated copper with gold inlays），并注明边框颜色必须鲜艳饱满而非暗沉灰旧；同时描述框上具体嵌入的进阶符号（2个，如 lion's head and shield / wings and flame / spiral and star）
   - 描述中央水彩插图：根据主题自由选择最能体现"进阶升华"的视觉形式，可以是：象征进化的物件（如破壳的光蛋、绽放的星晶花、跃升的凤凰）、奇幻场景（如旧形态石壁碎裂化为新境星空）、能量图腾（如螺旋上升的星座图谱、融合的光环）、神秘生物、或人物场景；不强制出现人物，优先选择与主题最贴切的升华象征；使用魔法柔和色调（lavender mist, rose gold shimmer, mint-teal haze, peach-amber warmth, celestial periwinkle），含 ascending starlight connect-dot constellations、arcane mist、floating spell particles、golden bokeh、pearlescent upward light beams
   - 安全规则：若插图中选择出现人物，必须为 elegant young woman
   - 重要空间约束：所有插图元素（人物、迷雾、粒子、光线）必须严格限定在圆形边框内侧，不得超出或遮盖边框
   - 结尾固定写：All illustration elements are strictly contained within the circular frame boundary. No text, no letters, no numbers in the image. Set against a checkered transparent background. Maintain the exact thickness and style of the frames.

参考示例（请模仿这种具体程度和详细程度）：
[New Assignment]: Generate a single circular medallion asset. The outer frame is made of polished, sunstone-like marble and bronze, featuring inset symbols of a lion's head and a shield. The central illustration, done in the watercolor style, shows a glowing campfire in a dark, star-connect-dot constellation cave, emitting a soft, golden bokeh light. Ensure all other elements of the protocol (materials, wings, lighting, checkerboard background) are present.

3. 写一句「进化叙述」（中文，20字以内，记录这次成长跨越）

只返回如下 JSON：
{
  "title": "进化封号",
  "illustrationDescription": "[New Assignment] English description following the format above",
  "evolutionNarrative": "进化叙述一句话"
}`;

  const response = await openai.chat.completions.create({
    model: "gpt-5.2",
    max_completion_tokens: 512,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: `${previousContext}\n\n新卡片内容：\n${combined}` },
    ],
  });

  const raw = response.choices[0]?.message?.content ?? "{}";
  try {
    const parsed = JSON.parse(raw) as BadgeEvolutionResult;
    return {
      title: parsed.title?.trim() || "成长封号",
      illustrationDescription: parsed.illustrationDescription?.trim() || "",
      evolutionNarrative: parsed.evolutionNarrative?.trim() || "",
    };
  } catch {
    return { title: "成长封号", illustrationDescription: "", evolutionNarrative: "" };
  }
}

const PROMPTS = {
  refine: `你是一个成长型思维教练。用户将提交一段原始想法或笔记，
请将它提炼成一段清晰、有洞见、具有启发性的文字。
要求：
- 保留原意的核心价值
- 语言精炼，去掉冗余
- 以第一人称表达，更有力量感
- 不超过200字
直接输出提炼后的内容，不需要解释。`,

  summarize: `你是一个知识萃取专家。根据用户提供的内容，
请提取出以下信息并以 JSON 格式返回：
{
  "title": "一句话标题（不超过20字）",
  "summary": "核心摘要（50字以内）",
  "tags": ["标签1", "标签2", "标签3"],
  "type": "text | idea | insight | question | resource"
}
只返回 JSON，不要有其他内容。`,
};

export async function refineContent(rawContent: string): Promise<string> {
  const response = await openai.chat.completions.create({
    model: "gpt-5.2",
    max_completion_tokens: 8192,
    messages: [
      { role: "system", content: PROMPTS.refine },
      { role: "user", content: rawContent },
    ],
  });
  return response.choices[0]?.message?.content ?? rawContent;
}

export interface SummarizeResult {
  title: string;
  summary: string;
  tags: string[];
  type: string;
}

export async function summarizeContent(content: string): Promise<SummarizeResult> {
  const response = await openai.chat.completions.create({
    model: "gpt-5.2",
    max_completion_tokens: 8192,
    messages: [
      { role: "system", content: PROMPTS.summarize },
      { role: "user", content },
    ],
  });

  const raw = response.choices[0]?.message?.content ?? "{}";
  try {
    const parsed = JSON.parse(raw) as SummarizeResult;
    return {
      title: parsed.title ?? "未命名",
      summary: parsed.summary ?? "",
      tags: Array.isArray(parsed.tags) ? parsed.tags : [],
      type: parsed.type ?? "text",
    };
  } catch {
    return { title: "未命名", summary: raw, tags: [], type: "text" };
  }
}
