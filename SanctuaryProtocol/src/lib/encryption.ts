import CryptoJS from "crypto-js";

// 派生密钥缓存（内存中缓存，浏览器关闭即失效）
let cachedKey: string | null = null;

// 应用特定的盐值，防止与其他 DApp 产生相同密钥
const APP_SALT = "SanctuaryProtocol-v1";

/**
 * 从钱包签名派生加密密钥
 * 使用完整签名 + PBKDF2 生成 256-bit 密钥
 * @param signMessage 钱包签名函数
 * @param userAddress 用户钱包地址，作为派生的一部分
 * @returns 派生的密钥（32字节 = 256-bit）
 */
export async function deriveKeyFromWallet(
  signMessage: (message: string) => Promise<string>,
  userAddress?: string
): Promise<string> {
  // 如果缓存中有密钥，直接返回
  if (cachedKey) {
    return cachedKey;
  }

  try {
    // 使用应用特定的消息，包含版本号和用户地址（如果提供）
    // 这确保不同应用、不同用户产生不同的密钥
    // 地址统一转换为小写，避免 checksum 大小写不一致导致密钥不同
    const normalizedAddress = userAddress?.toLowerCase();
    const message = normalizedAddress
      ? `${APP_SALT}|${normalizedAddress}|DeriveEncryptionKey`
      : `${APP_SALT}|DeriveEncryptionKey`;

    const signature = await signMessage(message);

    // 使用完整签名（去掉 0x 前缀）作为熵源
    // 以太坊签名是 65 字节，以 132 字符的十六进制字符串表示（含 0x）
    const fullSignature = signature.startsWith("0x")
      ? signature.slice(2)
      : signature;

    // 使用 PBKDF2 派生 256-bit (32 字节) 密钥
    // PBKDF2 比简单 SHA256 更安全，支持迭代次数增加计算难度
    const key = CryptoJS.PBKDF2(fullSignature, APP_SALT, {
      keySize: 256 / 32, // 32 字节 = 256 bit
      iterations: 10000, // 迭代次数，增加暴力破解难度
    }).toString();

    // 缓存密钥
    cachedKey = key;

    return key;
  } catch (error) {
    console.error("Failed to derive key from wallet:", error);
    throw new Error("无法从钱包派生加密密钥");
  }
}

/**
 * 清除缓存的密钥（用户断开钱包时调用）
 */
export function clearCachedKey(): void {
  cachedKey = null;
}

/**
 * 检查是否有缓存的密钥
 * @returns 是否有缓存密钥
 */
export function hasCachedKey(): boolean {
  return !!cachedKey;
}

/**
 * 加密数据
 * @param data 要加密的数据
 * @param key 加密密钥（从钱包派生，32字节 = 256-bit）
 * @returns 加密后的字符串
 */
export function encryptData(data: string, key: string): string {
  if (!key) {
    throw new Error("Encryption key is required");
  }
  return CryptoJS.AES.encrypt(data, key).toString();
}

/**
 * 解密数据
 * @param encryptedData 加密后的数据
 * @param key 解密密钥（从钱包派生，32字节 = 256-bit）
 * @returns 解密后的字符串
 */
export function decryptData(encryptedData: string, key: string): string {
  if (!key) {
    throw new Error("Decryption key is required");
  }
  const bytes = CryptoJS.AES.decrypt(encryptedData, key);
  const result = bytes.toString(CryptoJS.enc.Utf8);

  if (!result) {
    throw new Error("Decryption failed - invalid key or corrupted data");
  }

  return result;
}

/**
 * 尝试使用多种方式派生密钥并解密
 * 用于兼容旧数据（之前没有统一小写地址）
 * @param encryptedData 加密后的数据
 * @param signMessage 钱包签名函数
 * @param userAddress 用户钱包地址
 * @returns 解密后的字符串
 */
export async function decryptWithFallback(
  encryptedData: string,
  signMessage: (message: string) => Promise<string>,
  userAddress?: string
): Promise<string> {
  // 首先尝试使用标准化的密钥（小写地址）
  try {
    const normalizedAddress = userAddress?.toLowerCase();
    const message = normalizedAddress
      ? `${APP_SALT}|${normalizedAddress}|DeriveEncryptionKey`
      : `${APP_SALT}|DeriveEncryptionKey`;
    const signature = await signMessage(message);
    const fullSignature = signature.startsWith("0x")
      ? signature.slice(2)
      : signature;
    const key = CryptoJS.PBKDF2(fullSignature, APP_SALT, {
      keySize: 256 / 32,
      iterations: 10000,
    }).toString();
    
    const result = decryptData(encryptedData, key);
    // 缓存成功的密钥
    cachedKey = key;
    return result;
  } catch (e) {
    // 标准化密钥失败，尝试原始地址格式（兼容旧数据）
    console.log("Standardized key failed, trying original format...");
  }

  // 尝试使用原始地址格式（兼容旧数据）
  if (userAddress) {
    try {
      const message = `${APP_SALT}|${userAddress}|DeriveEncryptionKey`;
      const signature = await signMessage(message);
      const fullSignature = signature.startsWith("0x")
        ? signature.slice(2)
        : signature;
      const key = CryptoJS.PBKDF2(fullSignature, APP_SALT, {
        keySize: 256 / 32,
        iterations: 10000,
      }).toString();
      
      const result = decryptData(encryptedData, key);
      // 缓存成功的密钥
      cachedKey = key;
      return result;
    } catch (e) {
      console.log("Original format key failed...");
    }
  }

  // 尝试不带地址的格式（最早期的数据）
  try {
    const message = `${APP_SALT}|DeriveEncryptionKey`;
    const signature = await signMessage(message);
    const fullSignature = signature.startsWith("0x")
      ? signature.slice(2)
      : signature;
    const key = CryptoJS.PBKDF2(fullSignature, APP_SALT, {
      keySize: 256 / 32,
      iterations: 10000,
    }).toString();
    
    const result = decryptData(encryptedData, key);
    // 缓存成功的密钥
    cachedKey = key;
    return result;
  } catch (e) {
    console.log("No-address format key failed");
  }

  throw new Error("Decryption failed - unable to decrypt with any key format");
}

/**
 * 生成随机密钥（备用方案）
 * @returns 随机生成的密钥（32字节 = 256-bit）
 */
export function generateKey(): string {
  return CryptoJS.lib.WordArray.random(32).toString();
}
