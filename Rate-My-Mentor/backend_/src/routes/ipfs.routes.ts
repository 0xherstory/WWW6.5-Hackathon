import { Router } from 'express';
import { IPFSController } from '../controllers/ipfs.controller';

const ipfsRouter = Router();

// 最小闭环：上传正文（后端加密）到 Pinata/IPFS，返回真实 CID + cidBytes32
ipfsRouter.post('/reviews', IPFSController.uploadReview);

export default ipfsRouter;

