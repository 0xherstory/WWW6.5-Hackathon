import CryptoJS from 'crypto-js';
import { requireEnv } from '../config/env';

// 加密评价内容，加密后再上传到IPFS，保证隐私
export function encryptContent(content: string): string {
  const { ENCRYPTION_KEY } = requireEnv(['ENCRYPTION_KEY'] as const);
  if (ENCRYPTION_KEY.length !== 32) {
    throw new Error('ENCRYPTION_KEY 必须为 32 位字符串');
  }
  return CryptoJS.AES.encrypt(content, ENCRYPTION_KEY).toString();
}

// 解密评价内容，只有验证用户持有SBT后才解密返回
export function decryptContent(encryptedContent: string): string {
  const { ENCRYPTION_KEY } = requireEnv(['ENCRYPTION_KEY'] as const);
  if (ENCRYPTION_KEY.length !== 32) {
    throw new Error('ENCRYPTION_KEY 必须为 32 位字符串');
  }
  const bytes = CryptoJS.AES.decrypt(encryptedContent, ENCRYPTION_KEY);
  return bytes.toString(CryptoJS.enc.Utf8);
}