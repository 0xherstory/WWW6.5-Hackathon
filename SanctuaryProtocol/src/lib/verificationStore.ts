// 验证码存储 - 使用内存存储（MVP阶段）
// 注意：服务器重启后数据会丢失，生产环境应使用 Redis

type VerificationData = {
  code: string;
  expiresAt: number;
  lastSentAt: number;
};

// 使用全局变量确保在多个 API 路由之间共享
declare global {
  // eslint-disable-next-line no-var
  var __verificationCodes: Map<string, VerificationData> | undefined;
}

globalThis.__verificationCodes = globalThis.__verificationCodes || new Map<string, VerificationData>();

const verificationCodes: Map<string, VerificationData> = globalThis.__verificationCodes;

export function setCode(email: string, data: VerificationData): void {
  verificationCodes.set(email.toLowerCase(), data);
}

export function getStoredCode(email: string): { code: string; expiresAt: number } | null {
  const stored = verificationCodes.get(email.toLowerCase());
  if (!stored) return null;
  
  if (Date.now() > stored.expiresAt) {
    verificationCodes.delete(email.toLowerCase());
    return null;
  }
  
  return { code: stored.code, expiresAt: stored.expiresAt };
}

export function deleteCode(email: string): void {
  verificationCodes.delete(email.toLowerCase());
}

export function hasCode(email: string): boolean {
  const stored = verificationCodes.get(email.toLowerCase());
  if (!stored) return false;
  
  if (Date.now() > stored.expiresAt) {
    verificationCodes.delete(email.toLowerCase());
    return false;
  }
  
  return true;
}
