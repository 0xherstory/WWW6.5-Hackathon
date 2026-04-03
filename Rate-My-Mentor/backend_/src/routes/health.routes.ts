import { Router } from 'express';
import { HealthController } from '../controllers/health.controller';

const healthRouter = Router();

// 健康检查接口
healthRouter.get('/', HealthController.checkHealth);

export default healthRouter;