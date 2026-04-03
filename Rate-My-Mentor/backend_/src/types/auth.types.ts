// 发送OTP验证码请求参数
export interface SendOTPParams {
  email: string; // 企业邮箱
}

// 验证OTP请求参数
export interface VerifyOTPParams {
  email: string;
  otpCode: string;
}

// Offer Letter OCR识别结果
export interface OfferOCRResult {
  companyName: string;    // 公司名称
  isValid: boolean;       // 是否为有效Offer
  expireDate?: string;    // 有效期
}

// 身份验证结果
export interface AuthResult {
  isVerified: boolean;
  userInfo: {
    email: string;
    companyName?: string;
    walletAddress: string;
  };
}