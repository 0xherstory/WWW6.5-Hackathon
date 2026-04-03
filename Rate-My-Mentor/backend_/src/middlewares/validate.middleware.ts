import { Request, Response, NextFunction } from 'express';
import { AnyZodObject } from 'zod';
import { errorResponse } from '../utils/response.util';

// 校验接口请求参数是否符合格式，比如邮箱是不是正确的格式
export const validateMiddleware = (schema: AnyZodObject) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // 校验请求体、查询参数、路径参数
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next(); // 校验通过，放行
    } catch (error: any) {
      // 校验失败，返回错误信息
      const errorMessage = error.errors?.map((e: any) => e.message).join(', ') || '参数格式错误';
      res.status(400).json(errorResponse(errorMessage, 'VALIDATION_ERROR'));
    }
  };
};