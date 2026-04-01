import { getPinataClient } from '../config/pinata';
import { encryptContent, decryptContent } from '../utils/encryption.util';

export class IPFSService {
  // 1. 加密评价内容，上传到IPFS，返回CID
  static async uploadEncryptedReview(rawContent: string): Promise<{ cid: string; ipfsUrl: string }> {
    // 先加密原始评价内容
    const encryptedContent = encryptContent(rawContent);

    // 上传到Pinata IPFS
    const uploadResult = await getPinataClient().pinJSONToIPFS(
      {
        encryptedContent,
        uploadTime: new Date().toISOString(),
      },
      {
        pinataMetadata: { name: 'mentor-review-encrypted' },
      }
    );

    return {
      cid: uploadResult.IpfsHash,
      ipfsUrl: `https://gateway.pinata.cloud/ipfs/${uploadResult.IpfsHash}`,
    };
  }

  // 2. 从IPFS获取加密内容，解密后返回原始评价
  static async getDecryptedReview(cid: string): Promise<string> {
    try {
      // 从IPFS网关获取内容
      const response = await fetch(`https://gateway.pinata.cloud/ipfs/${cid}`);
      if (!response.ok) throw new Error('IPFS内容获取失败');

      const data = await response.json();
      // 解密内容
      const rawContent = decryptContent(data.encryptedContent);

      return rawContent;
    } catch (error) {
      console.error('IPFS内容解密失败：', error);
      throw new Error('评价内容获取失败');
    }
  }
}