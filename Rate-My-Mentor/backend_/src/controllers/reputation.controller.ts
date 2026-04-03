import { Request, Response } from 'express';
import { ReputationService } from '../services/reputation.service';
import { successResponse, errorResponse } from '../utils/response.util';
import { z } from 'zod';

// 获取公司声誉数据请求参数校验（仅保留公司名称）
const getCompanyReputationSchema = z.object({
  body: z.object({
    mentorCompany: z.string().min(1, '公司名称不能为空'),
    viewerWalletAddress: z.string().optional(),
  }),
});

export class ReputationController {
  // 获取公司声誉数据接口（用于声誉看板）
  static async getCompanyReputation(req: Request, res: Response) {
    try {
      const { mentorCompany, viewerWalletAddress } = req.body;
      const reputationData = await ReputationService.getCompanyReputation(
        mentorCompany,
        viewerWalletAddress as `0x${string}` | undefined
      );
      res.json(successResponse(reputationData, '获取成功'));
    } catch (error: any) {
      console.error('获取声誉数据失败：', error);
      res.status(500).json(errorResponse('获取声誉数据失败，请稍后重试'));
    }
  }

  // 获取热门公司榜单接口
  static async getHotCompanyList(req: Request, res: Response) {
    try {
      const { limit = 10 } = req.query;
      const list = await ReputationService.getHotCompanyList(Number(limit));
      res.json(successResponse(list, '获取成功'));
    } catch (error: any) {
      console.error('获取热门榜单失败：', error);
      res.status(500).json(errorResponse('获取榜单失败，请稍后重试'));
    }
  }
}