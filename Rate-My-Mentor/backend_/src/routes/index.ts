import { Router } from 'express';
import aiRouter from './ai.routes';
import authRouter from './auth.routes';
import ipfsRouter from './ipfs.routes';

const rootRouter = Router();

rootRouter.use('/auth', authRouter);
rootRouter.use('/ai', aiRouter);
rootRouter.use('/ipfs', ipfsRouter);

export default rootRouter;