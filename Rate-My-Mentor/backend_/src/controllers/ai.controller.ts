import { Request, Response } from 'express';
import { AIService } from '../services/ai.service';
import { AuthService } from '../services/auth.service';
import { successResponse, errorResponse } from '../utils/response.util';

export class AIController {
  // 提取结构化评价
  static async extractReview(req: Request, res: Response) {
    try {
      const { rawContent } = req.body;
      if (!rawContent) return res.status(400).json(errorResponse('评价内容不能为空'));

      const result = await AIService.extractStructuredReview(rawContent);
      res.json(successResponse(result, 'AI提取成功'));
    } catch (error) {
      console.error('AI提取失败：', error);
      res.status(500).json(errorResponse('AI提取失败，请稍后重试'));
    }
  }

  // OCR识别Offer Letter
  static async ocrOffer(req: Request, res: Response) {
    try {
      const { base64Image } = req.body;
      if (!base64Image) return res.status(400).json(errorResponse('图片不能为空'));

      const result = await AuthService.extractOfferInfo(base64Image);
      res.json(successResponse(result, 'OCR识别成功'));
    } catch (error) {
      console.error('OCR识别失败：', error);
      res.status(500).json(errorResponse('OCR识别失败，请稍后重试'));
    }
  }
}