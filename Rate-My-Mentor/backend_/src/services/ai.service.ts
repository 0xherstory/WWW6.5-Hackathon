import { miniMaxChatCompletion } from '../config/minimax';

//service 不自己读 process.env，只消费已经验证过的配置。
import { getAIEnv } from '../config/env'; //原版：import { env } from '../config/env';
import { AIReviewResult, ReviewDimension } from '../types/review.types';

export class AIService {
  // 从用户自然语言评价中提取结构化评分
  static async extractStructuredReview(rawContent: string): Promise<AIReviewResult> {
    const prompt = `
      你是一个专业的[职场企业/工作组]评价分析专家，请严格按照以下要求处理用户的评价内容：
      1. 评价维度：${Object.values(ReviewDimension).join('、')}，每个维度必须打1-5的整数分，并给出简短的维度评语
      2. 综合评分：1-5分，基于各维度评分加权计算，保留1位小数
      3. 生成3-5个精准的标签，总结导师的特点
      4. 生成100字以内的评价总结
      5. 判断评价是否有效：无恶意攻击、无灌水、内容真实和导师相关，无效请给出明确原因
      6. 必须严格返回JSON格式，不要任何额外的解释内容

      用户的原始评价内容：${rawContent}

      返回的JSON格式必须严格如下：
      {
        "overallScore": 数字,
        "dimensionScores": [
          {
            "dimension": "维度名称",
            "score": 数字,
            "comment": "该维度的评语"
          }
        ],
        "summary": "评价总结",
        "tags": ["标签1", "标签2"],
        "isQualified": true,
        "unqualifiedReason": ""
      }
      `;
    
    const { MINIMAX_MODEL } = getAIEnv();

    const result = await miniMaxChatCompletion({
      model: MINIMAX_MODEL,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
    });

    let jsonStr = result.trim();
    const codeBlockMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (codeBlockMatch) jsonStr = codeBlockMatch[1].trim();

    return JSON.parse(jsonStr) as AIReviewResult;
  }
}
