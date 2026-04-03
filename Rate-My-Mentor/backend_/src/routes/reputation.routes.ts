import { Router } from 'express';
import { ReputationController } from '../controllers/reputation.controller';

const reputationRouter = Router();

// 获取公司声誉数据
reputationRouter.post('/company', ReputationController.getCompanyReputation);

// 获取热门公司榜单
reputationRouter.get('/hot-list', ReputationController.getHotCompanyList);

export default reputationRouter;