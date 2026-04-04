import { emailTransporter } from '../config/email';
import { env, getAIEnv } from '../config/env';
import { miniMaxChatCompletion } from '../config/minimax';
import { OfferOCRResult } from '../types/auth.types';
import { generateOTP, getOTPExpireTime } from '../utils/otp.util';

// 内存存储OTP（黑客松MVP够用，生产环境可以换Redis）
const otpStore = new Map<string, { code: string; expireAt: number }>();

export class AuthService {
  // 1. 生成并发送OTP验证码到企业邮箱
  static async sendOTP(email: string): Promise<void> {
    // 生成6位验证码
    const otpCode = generateOTP();
    // 计算过期时间
    const expireAt = getOTPExpireTime(Number(env.OTP_EXPIRE_MINUTES));

    // 把验证码存起来，后续验证用
    otpStore.set(email.toLowerCase(), { code: otpCode, expireAt });

    // 发送邮件
    await emailTransporter.sendMail({
      from: `"Rate My Mentor" <${env.EMAIL_USER}>`,
      to: email,
      subject: '你的Rate My Mentor邮箱验证验证码',
      html: `
        <h3>欢迎使用 Rate My Mentor</h3>
        <p>你的邮箱验证验证码是：<b style="font-size: 20px;">${otpCode}</b></p>
        <p>验证码有效期为 ${env.OTP_EXPIRE_MINUTES} 分钟，请勿泄露给他人</p>
        <p>如非本人操作，请忽略此邮件</p>
      `,
    });
  }

  // 2. 验证OTP验证码是否正确
  static async verifyOTP(email: string, otpCode: string): Promise<boolean> {
    // 从存储里拿验证码记录
    const otpRecord = otpStore.get(email.toLowerCase());
    // 没有记录，说明没发过验证码，或者已经过期被删了
    if (!otpRecord) return false;

    // 检查是否过期
    if (Date.now() > otpRecord.expireAt) {
      otpStore.delete(email.toLowerCase()); // 过期了就删掉
      return false;
    }

    // 检查验证码是否正确
    const isCodeValid = otpRecord.code === otpCode;
    // 验证成功就删掉验证码，防止重复使用
    if (isCodeValid) otpStore.delete(email.toLowerCase());

    return isCodeValid;
  }

  // 3. OCR识别Offer Letter，提取公司信息（走 MiniMax 原生多模态；OpenAI 兼容层不支持图片）
  static async extractOfferInfo(base64Image: string): Promise<OfferOCRResult> {
    const { MINIMAX_VISION_MODEL } = getAIEnv();
    const textPrompt = `
                你是一个专业的Offer Letter识别专家，请识别这张Offer Letter图片，完成以下任务：
                1. 提取公司全称
                2. 判断这是不是真实有效的入职/实习Offer Letter
                3. 提取Offer的有效期（如果有）
                必须严格返回JSON格式，不要任何额外内容，格式如下：
                {
                  "companyName": "公司全称",
                  "isValid": true/false,
                  "expireDate": "有效期，没有就为空字符串"
                }
              `;

    const raw = await miniMaxChatCompletion({
      model: MINIMAX_VISION_MODEL,
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: textPrompt },
            {
              type: 'image_url',
              image_url: { url: `data:image/jpeg;base64,${base64Image}` },
            },
          ],
        },
      ],
      temperature: 0.2,
    });

    let jsonStr = raw.trim();
    const codeBlockMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (codeBlockMatch) jsonStr = codeBlockMatch[1].trim();

    return JSON.parse(jsonStr) as OfferOCRResult;
  }

  // 4. 签发凭证（用于铸造SBT）
  static async issueCredential(userAddress: string, ocrResult: OfferOCRResult) {
    // TODO: 实现签名逻辑
    // 暂时返回模拟数据
    return {
      credentialId: `cred-${Date.now()}`,
      companyId: `company-${ocrResult.companyName}`,
      credentialHash: '0x' + '0'.repeat(64),
      expireTime: Math.floor(Date.now() / 1000) + 3600,
      signature: '0x' + '0'.repeat(130),
    };
  }
}
