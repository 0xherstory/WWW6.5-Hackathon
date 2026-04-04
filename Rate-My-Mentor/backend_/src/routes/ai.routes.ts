import { Router } from 'express';
import { AIController } from '../controllers/ai.controller';

const aiRouter = Router();

aiRouter.post('/extract-review', AIController.extractReview);
aiRouter.post('/verify-offer', AIController.ocrOffer); // 前端调用的验证 offer 端点

export default aiRouter;
