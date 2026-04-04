import { Router } from 'express';
import authRouter from './auth.routes';
import ipfsRouter from './ipfs.routes';
import aiRouter from './ai.routes';

const rootRouter = Router();
/**
 * 当前 MVP 主链路相关模块
 */
//修改接口
rootRouter.use('/api/auth', authRouter);  // 提交 offer → 签发 credential
rootRouter.use('/ipfs', ipfsRouter);   // 上传 review → 返回 cid + bytes32
rootRouter.use('/ai', aiRouter);       // （如果 OCR / AI 已接入，否则可临时移除）


export default rootRouter;



// G的修改理由：
// 之前的版本假设“所有模块都已经是当前系统的一部分”
// 但你们现在真实状态是：
// 有些模块还没接完（contract / reputation）
// 有些模块甚至不在当前主链路上
// 有些模块只是未来设计（health 也不是必须）
// 如果现在全挂：
// 会出现“接口存在，但实际上不可用 / 未联调 / 未定义清楚”的情况



// import { Router } from 'express';
// import healthRouter from './health.routes';
// import authRouter from './auth.routes';
// import aiRouter from './ai.routes';
// import ipfsRouter from './ipfs.routes';
// import contractRouter from './contract.routes';
// import reputationRouter from './reputation.routes';

// const rootRouter = Router();

// // 挂载所有模块的路由
// rootRouter.use('/health', healthRouter);
// rootRouter.use('/auth', authRouter);
// rootRouter.use('/ai', aiRouter);
// rootRouter.use('/ipfs', ipfsRouter);
// rootRouter.use('/contract', contractRouter);
// rootRouter.use('/reputation', reputationRouter);

// export default rootRouter;
