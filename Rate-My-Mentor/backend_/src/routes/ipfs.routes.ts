import { Router } from 'express';
import { IPFSController } from '../controllers/ipfs.controller';

const ipfsRouter = Router();

/**
 * POST /api/v1/ipfs/reviews
 * body: { rawContent: string }
 *
 * 最小闭环：
 * - 后端加密评价正文
 * - 上传到 Pinata / IPFS
 * - 返回 cid / ipfsUrl / cidBytes32
 */
ipfsRouter.post('/reviews', IPFSController.uploadReview);

export default ipfsRouter;

//G的修改理由：
//ipfs.routes.ts 只保留 POST /reviews，对应 IPFSController.uploadReview，不暴露读取解密接口。



// import { Router } from 'express';
// import { IPFSController } from '../controllers/ipfs.controller';
// import { validateMiddleware } from '../middlewares/validate.middleware';
// import { z } from 'zod';
// import { reviewContentSchema } from '../utils/validator.util';

// const ipfsRouter = Router();

// // 加密上传评价内容
// ipfsRouter.post(
//   '/upload',
//   validateMiddleware(z.object({ body: z.object({ rawContent: reviewContentSchema }) })),
//   IPFSController.uploadEncryptedReview
// );

// // 获取并解密评价内容
// ipfsRouter.get(
//   '/review/:cid',
//   IPFSController.getDecryptedReview
// );

// export default ipfsRouter;


