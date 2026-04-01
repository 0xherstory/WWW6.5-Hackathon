import { Request, Response } from 'express';
import { z } from 'zod';
import { keccak256, toBytes } from 'viem';

import { IPFSService } from '../services/ipfs.service';
import { errorResponse, successResponse } from '../utils/response.util';

const uploadReviewSchema = z.object({
  rawContent: z.string().min(1, '评价内容不能为空'),
});

export class IPFSController {
  // 加密评价内容并上传到 Pinata/IPFS，返回真实 CID + bytes32 哈希
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
    } catch (e) {
      console.error('IPFS 上传失败：', e);
      return res.status(500).json(errorResponse('IPFS 上传失败，请稍后重试'));
    }
  }
}

