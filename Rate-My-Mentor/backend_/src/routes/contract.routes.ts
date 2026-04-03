import { Router } from 'express';
import { ContractController } from '../controllers/contract.controller';

const contractRouter = Router();

// 验证用户是否持有SBT
contractRouter.get('/check-sbt/:walletAddress', ContractController.checkUserHasSBT);

// 获取用户SBT信息
contractRouter.get('/sbt-info/:walletAddress', ContractController.getUserSBTInfo);

// 获取公司的所有链上评价
contractRouter.post('/company-reviews', ContractController.getCompanyReviews);

export default contractRouter;