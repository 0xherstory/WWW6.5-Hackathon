import { NextRequest, NextResponse } from "next/server";

interface AnalyzeReviewRequest {
  comment: string;
  rating: number;
}

interface AnalyzeReviewResponse {
  tags: string[];
  scores: Record<string, number>;
  sentiment: "positive" | "neutral" | "negative";
}

/**
 * 使用 MiniMax AI 分析评论内容
 */
async function analyzeCommentWithMiniMax(
  comment: string,
  rating: number
): Promise<AnalyzeReviewResponse> {
  const apiKey = process.env.MINIMAX_API_KEY;

  if (!apiKey) {
    throw new Error("MINIMAX_API_KEY not configured");
  }

  const systemPrompt = `你是一个专业的评价分析助手。你的任务是分析用户对导师(Mentor)的评价内容。

请根据评价文本分析并返回以下JSON格式的结果：
{
  "tags": ["标签1", "标签2", ...], // 最多个标签，从以下候选标签中选择：技术卓越、耐心教学、反应迅速、业界经验、亲切和善、沟通困难、不够耐心、响应缓慢、推荐、需改进
  "scores": {
    "communication": 0.0-1.0, // 沟通能力
    "technical": 0.0-1.0,     // 技术水平
    "responsiveness": 0.0-1.0, // 响应速度
    "overall": 0.0-1.0        // 综合评分
  },
  "sentiment": "positive" | "neutral" | "negative" // 情感分析
}

注意：
1. tags 最多返回5个标签
2. scores 各维度值为0-1之间的小数
3. 只返回JSON，不要其他内容`;

  const userPrompt = `请分析以下评价内容：\n\n评价文本：${comment}\n\n评分：${rating}/5`;

  const response = await fetch("https://api.minimax.chat/v1/text/chatcompletion_v2", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "abab6.5s-chat",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.3,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error("MiniMax API error:", error);
    throw new Error(`MiniMax API error: ${error}`);
  }

  const data = await response.json();
  console.log("MiniMax response:", JSON.stringify(data, null, 2));

  // 解析 AI 返回的 JSON - MiniMax v2 返回格式
  const content = data.choices?.[0]?.message?.content || "";

  // 尝试解析
  try {
    // 尝试提取 JSON（可能包含在 markdown 代码块中）
    let jsonStr = content;

    // 如果有 markdown 代码块，提取其中的内容
    const codeBlockMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (codeBlockMatch) {
      jsonStr = codeBlockMatch[1];
    }

    const result = JSON.parse(jsonStr.trim());
    return {
      tags: result.tags || [],
      scores: {
        communication: Math.min(1, Math.max(0, result.scores?.communication || 0.5)),
        technical: Math.min(1, Math.max(0, result.scores?.technical || 0.5)),
        responsiveness: Math.min(1, Math.max(0, result.scores?.responsiveness || 0.5)),
        overall: Math.min(1, Math.max(0, result.scores?.overall || rating / 5)),
      },
      sentiment: ["positive", "neutral", "negative"].includes(result.sentiment)
        ? result.sentiment
        : "neutral",
    };
  } catch (parseError) {
    console.error("Failed to parse AI response:", content, parseError);
  }

  // 如果解析失败，使用规则引擎作为后备
  return analyzeCommentWithRules(comment, rating);
}

/**
 * 规则引擎分析（作为后备方案）
 */
function analyzeCommentWithRules(
  comment: string,
  rating: number
): AnalyzeReviewResponse {
  const lowerComment = comment.toLowerCase();

  const keywordTags: Record<string, string[]> = {
    "技术卓越": ["卓越", "精深", "技术强", "代码质量", "架构", "算法", "优化", "高效"],
    "耐心教学": ["耐心", "细致", "讲解清楚", "易理解", "循循善诱", "讲得好"],
    "反应迅速": ["快速", "及时", "秒回", "响应快", "高效", "迅速", "立即"],
    "业界经验": ["经验丰富", "见识广", "实战", "项目经验", "行业", "深度"],
    "亲切和善": ["和善", "友好", "热心", "亲切", "热情", "认真", "专业"],
    "沟通困难": ["难理解", "表达不清", "沟通差", "听不懂", "模糊"],
    "不够耐心": ["不耐烦", "生硬", "冷淡", "敷衍", "急躁"],
    "响应缓慢": ["回复慢", "没回应", "冷漠", "懒散", "不及时"],
  };

  const tags: string[] = [];
  Object.entries(keywordTags).forEach(([tag, keywords]) => {
    if (keywords.some((kw) => lowerComment.includes(kw))) {
      tags.push(tag);
    }
  });

  if (tags.length === 0) {
    tags.push(rating >= 4 ? "推荐" : rating <= 2 ? "需改进" : "一般");
  }

  const scores: Record<string, number> = {
    communication: 0.5,
    technical: 0.5,
    responsiveness: 0.5,
    overall: Math.min(1, rating / 5),
  };

  const positiveWords = ["好", "很", "真", "棒", "不错", "推荐", "优秀", "赞"];
  const negativeWords = ["差", "不好", "糟", "差劲", "失望", "后悔", "不满", "问题"];

  const positiveCount = positiveWords.filter((w) => lowerComment.includes(w)).length;
  const negativeCount = negativeWords.filter((w) => lowerComment.includes(w)).length;

  let sentiment: "positive" | "neutral" | "negative" = "neutral";
  if (positiveCount > negativeCount) sentiment = "positive";
  else if (negativeCount > positiveCount) sentiment = "negative";
  else if (rating >= 4) sentiment = "positive";
  else if (rating <= 2) sentiment = "negative";

  return {
    tags: Array.from(new Set(tags)).slice(0, 5),
    scores,
    sentiment,
  };
}

export async function POST(request: NextRequest) {
  try {
    const body: AnalyzeReviewRequest = await request.json();

    if (!body.comment || typeof body.comment !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid 'comment' field" },
        { status: 400 }
      );
    }

    if (!body.rating || typeof body.rating !== "number") {
      return NextResponse.json(
        { error: "Missing or invalid 'rating' field" },
        { status: 400 }
      );
    }

    // 使用 MiniMax AI 分析
    const result = await analyzeCommentWithMiniMax(body.comment, body.rating);

    return NextResponse.json(result, {
      headers: {
        "Cache-Control": "no-cache",
      },
    });
  } catch (error) {
    console.error("Error analyzing review:", error);
    return NextResponse.json(
      { error: "Failed to analyze review" },
      { status: 500 }
    );
  }
}
