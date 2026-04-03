import { Request, Response } from 'express';
import { z } from 'zod';
import { keccak256, toBytes } from 'viem';

import { IPFSService } from '../services/ipfs.service';
import { errorResponse, successResponse } from '../utils/response.util';

const uploadReviewSchema = z.object({
  rawContent: z.string().min(1, '评价内容不能为空'),
});

export class IPFSController {
  /**
   * 加密评价内容并上传到 Pinata / IPFS
   * 返回：
   * - cid: 真实 IPFS CID
   * - ipfsUrl: 可访问链接
   * - cidBytes32: 供链上 submitReview 使用的 bytes32 哈希
   */
  static async uploadReview(req: Request, res: Response) {
    try {
      const parsed = uploadReviewSchema.safeParse(req.body);

      if (!parsed.success) {
        const msg = parsed.error.issues[0]?.message ?? '参数错误';
        return res.status(400).json(errorResponse(msg, 'BAD_REQUEST'));
      }

      const { rawContent } = parsed.data;

      const { cid, ipfsUrl } = await IPFSService.uploadEncryptedReview(rawContent);
      const cidBytes32 = keccak256(toBytes(cid));

      return res.json(
        successResponse(
          {
            cid,
            ipfsUrl,
            cidBytes32,
          },
          'IPFS 上传成功'
        )
      );
    } catch (error) {
      console.error('IPFS 上传失败：', error);
      return res.status(500).json(errorResponse('IPFS 上传失败，请稍后重试'));
    }
  }
}



//G：以易为版本为骨架，保留 uploadReview 单一主链路接口，继续返回 cid / ipfsUrl / cidBytes32，暂不并入福安版本的读取接口。
//getDecryptedReview 这个接口现在最大的问题，不是技术上做不到，而是它在你们当前这条 MVP 主链路里，还没有一个足够清晰、足够安全、足够必要的产品位置。所以不建议现在并进去。
//会把你们提前拖进“权限模型”问题，而你们现在还没定义这个问题。

// import { Request, Response } from 'express';
// import { IPFSService } from '../services/ipfs.service';
// import { successResponse, errorResponse } from '../utils/response.util';
// import { z } from 'zod';
// import { reviewContentSchema } from '../utils/validator.util';

// // 上传评价请求参数校验
// const uploadReviewSchema = z.object({
//   body: z.object({
//     rawContent: reviewContentSchema,
//   }),
// });

// // 获取评价请求参数校验
// const getReviewSchema = z.object({
//   params: z.object({
//     cid: z.string().min(1, 'CID不能为空'),
//   }),
// });

// export class IPFSController {
//   // 加密上传评价内容到IPFS接口
//   static async uploadEncryptedReview(req: Request, res: Response) {
//     try {
//       const { rawContent } = req.body;
//       const result = await IPFSService.uploadEncryptedReview(rawContent);
//       res.json(successResponse(result, '内容上传成功'));
//     } catch (error: any) {
//       console.error('IPFS上传失败：', error);
//       res.status(500).json(errorResponse('内容上传失败，请稍后重试'));
//     }
//   }

//   // 从IPFS获取并解密评价内容接口
//   static async getDecryptedReview(req: Request, res: Response) {
//     try {
//       const { cid } = req.params;
//       const rawContent = await IPFSService.getDecryptedReview(cid);
//       res.json(successResponse({ rawContent }, '内容获取成功'));
//     } catch (error: any) {
//       console.error('IPFS内容获取失败：', error);
//       res.status(500).json(errorResponse('内容获取失败，请稍后重试'));
//     }
//   }
// }
