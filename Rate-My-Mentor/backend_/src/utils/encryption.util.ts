import CryptoJS from 'crypto-js';
import { getEncryptionEnv } from '../config/env';

// 加密评价内容，加密后再上传到IPFS，保证隐私
export function encryptContent(content: string): string {
  const { ENCRYPTION_KEY } = getEncryptionEnv();
  
  return CryptoJS.AES.encrypt(content, ENCRYPTION_KEY).toString();
}

// 解密评价内容，只有验证用户持有SBT后才解密返回
export function decryptContent(encryptedContent: string): string {
  const { ENCRYPTION_KEY } = getEncryptionEnv();

  const bytes = CryptoJS.AES.decrypt(encryptedContent, ENCRYPTION_KEY);
  const result = bytes.toString(CryptoJS.enc.Utf8);

  if (!result) {
    throw new Error('解密失败，可能密钥错误或数据损坏');
  }

  //G补充这部分的理由：ryptoJS 的行为是如果key 错了、内容损坏或者数据格式不对它不会 throw，而是返回：空字符串
// 如果你不判断：前端会拿到空内容，你根本不知道是错误还是空评价
// 所以这里要：把 silent failure → 显式错误
  return result;
}

//修改备注：
// 现在整个项目已经在建立一个非常正确的模式：
// config 层统一负责：
// - 读取 env
// - 校验 env
// - 提供模块级配置
// 所以：
// AI → getAIEnv()
// IPFS → getIpfsEnv()
// Contract → getContractAddress()
// Encryption → 也应该有 getEncryptionEnv()
// 这样整个系统是对称的
