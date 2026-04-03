import { Request, Response } from 'express';
import { successResponse } from '../utils/response.util';

export class HealthController {
  static checkHealth(req: Request, res: Response) {
    res.json(
      successResponse(
        {
          status: 'ok',
          timestamp: new Date().toISOString(),
          service: 'Rate My Mentor Backend',
        },
        '服务运行正常'
      )
    );
  }
}