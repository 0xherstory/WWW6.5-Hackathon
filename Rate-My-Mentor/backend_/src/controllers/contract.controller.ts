import { Request, Response } from 'express';
import { ContractService } from '../services/contract.service';
import { successResponse, errorResponse } from '../utils/response.util';
import { z } from 'zod';

// 校验钱包地址格式
const walletAddressSchema = z.string().startsWith('0x').length(42, '钱包地址格式错误');

// 验证SBT请求参数校验
const checkSBTSchema = z.object({
  params: z.object({
    walletAddress: walletAddressSchema,
  }),
});

// 获取公司评价请求参数校验（仅保留公司名称）
const getCompanyReviewsSchema = z.object({
  body: z.object({
    mentorCompany: z.string().min(1, '公司名称不能为空'),
  }),
});

export class ContractController {
  // 验证用户是否持有SBT接口（不变）
  static async checkUserHasSBT(req: Request, res: Response) {
    try {
      const { walletAddress } = req.params;
      const hasSBT = await ContractService.checkUserHasSBT(walletAddress as `0x${string}`);
      res.json(successResponse({ hasSBT }, '验证完成'));
    } catch (error: any) {
      console.error('SBT验证失败：', error);
      res.status(500).json(errorResponse('SBT验证失败，请稍后重试'));
    }
  }

  // 获取用户SBT信息接口（不变）
  static async getUserSBTInfo(req: Request, res: Response) {
    try {
      const { walletAddress } = req.params;
      const sbtInfo = await ContractService.getUserSBTInfo(walletAddress as `0x${string}`);

      if (!sbtInfo) {
        return res.status(404).json(errorResponse('该用户暂无SBT凭证', 'SBT_NOT_FOUND'));
      }

      res.json(successResponse(sbtInfo, '获取成功'));
    } catch (error: any) {
      console.error('获取SBT信息失败：', error);
      res.status(500).json(errorResponse('获取SBT信息失败，请稍后重试'));
    }
  }

  // 获取公司的所有链上评价接口（仅保留公司参数）
  static async getCompanyReviews(req: Request, res: Response) {
    try {
      const { mentorCompany } = req.body;
      const reviews = await ContractService.getCompanyReviews(mentorCompany);
      res.json(successResponse(reviews, '获取成功'));
    } catch (error: any) {
      console.error('获取公司评价失败：', error);
      res.status(500).json(errorResponse('获取评价失败，请稍后重试'));
    }
  }
}