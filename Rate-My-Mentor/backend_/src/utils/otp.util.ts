// 生成6位数字的OTP验证码
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// 计算验证码过期时间
export function getOTPExpireTime(minutes: number): number {
  return Date.now() + minutes * 60 * 1000;
}