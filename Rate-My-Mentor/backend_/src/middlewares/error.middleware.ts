import { Request, Response, NextFunction } from 'express';
import { errorResponse } from '../utils/response.util';

// 所有接口的报错都会被这里捕获，统一返回格式，不会让服务直接崩掉
export const errorMiddleware = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('❌ 接口报错：', err);

  // 常见 multer 解析错误：表单不是 multipart/form-data 或 boundary 缺失
  if (err.message.includes('Multipart: Boundary not found') || err.message.includes('Unexpected field') || err.message.includes('No multipart boundary found')) {
    return res.status(400).json(errorResponse('请使用 multipart/form-data 上传文件，字段名必须是 offer'));
  }

  // 如果是缓存的泛错误，保持原有 500 逻辑
  res.status(500).json(errorResponse('服务器内部错误，请稍后重试', 'SERVER_ERROR'));
};
