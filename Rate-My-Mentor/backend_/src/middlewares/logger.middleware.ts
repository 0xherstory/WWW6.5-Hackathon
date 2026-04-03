import { Request, Response, NextFunction } from 'express';

// 所有请求都会经过这里，打印请求信息，方便你看接口有没有被调用
export const loggerMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const { method, url, ip } = req;
  const startTime = Date.now();

  // 响应结束后打印日志
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const { statusCode } = res;
    console.log(`[${new Date().toLocaleString()}] ${method} ${url} ${statusCode} - ${duration}ms - IP: ${ip}`);
  });

  next(); // 放行，继续执行后续逻辑
};