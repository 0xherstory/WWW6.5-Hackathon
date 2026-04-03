import { z } from 'zod';
import { ReviewDimension } from '../types/review.types';

// 邮箱校验规则，必须是企业邮箱（可以后续加禁止qq/163等个人邮箱）
export const emailSchema = z.string().email('请输入正确的邮箱格式');

// OTP验证码校验规则，必须是6位数字
export const otpSchema = z.string().length(6, '验证码必须是6位数字');

// 评价内容校验规则，最少10个字，最多2000字
export const reviewContentSchema = z.string().min(10, '评价内容最少10个字').max(2000, '评价内容最多2000字');

// AI评分维度校验规则
export const dimensionScoreSchema = z.object({
  dimension: z.enum(Object.values(ReviewDimension) as [string, ...string[]]),
  score: z.number().int().min(1).max(5, '评分必须是1-5分'),
  comment: z.string(),
});