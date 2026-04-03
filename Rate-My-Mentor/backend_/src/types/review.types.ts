// 产品定义的AI评价维度，需要修改直接在这里改就行
export enum ReviewDimension {
  PROFESSIONAL_SKILL = '专业能力',
  COMMUNICATION = '沟通效率',
  GUIDANCE = '指导能力',
  RESPONSIBILITY = '责任心',
  GROWTH_HELP = '成长帮助',
}

// 单个维度的评分结构
export interface DimensionScore {
  dimension: ReviewDimension; // 维度名称
  score: number; // 1-5分，整数
  comment: string; // 该维度的评语
}

// AI提取的结构化评价结果
export interface AIReviewResult {
  overallScore: number; // 1-5综合分
  dimensionScores: DimensionScore[]; // 各维度评分
  summary: string; // 100字以内的评价总结
  tags: string[]; // 3-5个标签
  isQualified: boolean; // 是否为有效评价（无恶意、无灌水）
  unqualifiedReason?: string; // 无效原因
}

// 用户提交评价的核心参数（已删除导师姓名）
export interface ReviewSubmitParams {
  walletAddress: string; // 用户钱包地址
  mentorCompany: string; // 导师所在公司
  rawReviewContent: string; // 用户输入的原始评价内容
  aiResult: AIReviewResult; // AI提取的结构化结果
  ipfsCid: string; // 加密内容存在IPFS的CID
}

// 公司声誉聚合数据（已删除导师姓名）
export interface CompanyReputation {
  mentorCompany: string;
  reviewCount: number; // 评价总数
  overallAverageScore: number; // 综合平均分
  dimensionAverageScores: DimensionScore[]; // 各维度平均分
  latestReviews: ReviewSubmitParams[]; // 最新评价
}