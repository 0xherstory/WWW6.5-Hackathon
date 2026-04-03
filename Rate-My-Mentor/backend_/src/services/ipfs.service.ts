//本文件：
// 一条能力负责把评价加密后上传到 IPFS，
// 另一条能力负责按 CID 取回加密内容并解密，给上层 ReputationService 使用。
//仍然坚持：service 在调用时按需拿 client，所以用 getPinataClient()
//但不再“只保留上传”，因为现在 ReputationService 已经明确要读取并解密评价原文
//所以要把 getDecryptedReview() 正式恢复回来

import { getPinataClient } from '../config/pinata';
import { encryptContent, decryptContent } from '../utils/encryption.util';

export class IPFSService {
  // 1. 加密评价内容并上传到 IPFS，返回 CID 和可访问链接
  static async uploadEncryptedReview(
    rawContent: string
  ): Promise<{ cid: string; ipfsUrl: string }> {
    const encryptedContent = encryptContent(rawContent);

    const uploadResult = await getPinataClient().pinJSONToIPFS(
      {
        encryptedContent,
        uploadTime: new Date().toISOString(),
      },
      {
        pinataMetadata: {
          name: 'mentor-review-encrypted',
        },
      }
    );

    const cid = uploadResult.IpfsHash;

    return {
      cid,
      ipfsUrl: `https://gateway.pinata.cloud/ipfs/${cid}`,
    };
  }

  // 2. 从 IPFS 获取加密内容，解密后返回原始评价
  static async getDecryptedReview(cid: string): Promise<string> {
    try {
      const response = await fetch(`https://gateway.pinata.cloud/ipfs/${cid}`);

      if (!response.ok) {
        throw new Error(`IPFS 内容获取失败，status=${response.status}`);
      }

      const data = await response.json();

      if (!data?.encryptedContent) {
        throw new Error('IPFS 返回内容缺少 encryptedContent 字段');
      }

      const rawContent = decryptContent(data.encryptedContent);

      return rawContent;
    } catch (error) {
      console.error('IPFS 内容解密失败：', error);
      throw new Error('评价内容获取失败');
    }
  }
}

//G的修改理由：收缩为只保留 uploadEncryptedReview() 这一条当前主链路必需能力。当前主链路真正必须的是上传，不是读取。
// 你们现在走的是：
// 前端交 rawContent
// 后端加密上传
// 后端返回 cid/ipfsUrl/cidBytes32
// 前端继续链上提交
// 这个闭环只依赖 uploadEncryptedReview()。
// 既然最终保留版是在为当前系统“定边界”，那 service 就应该围绕这个必要能力收缩，而不是为了“看起来完整”把非核心接口一起带着。

//     return {
//       cid: uploadResult.IpfsHash,
//       ipfsUrl: `https://gateway.pinata.cloud/ipfs/${uploadResult.IpfsHash}`,
//     };
//   }

//   // 2. 从IPFS获取加密内容，解密后返回原始评价
//   static async getDecryptedReview(cid: string): Promise<string> {
//     try {
//       // 从IPFS网关获取内容
//       const response = await fetch(`https://gateway.pinata.cloud/ipfs/${cid}`);
//       if (!response.ok) throw new Error('IPFS内容获取失败');

//       const data = await response.json();
//       // 解密内容
//       const rawContent = decryptContent(data.encryptedContent);

//       return rawContent;
//     } catch (error) {
//       console.error('IPFS内容解密失败：', error);
//       throw new Error('评价内容获取失败');
//     }
//   }
// }
