import { encodeAbiParameters, keccak256, toBytes } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { getEmailTransporter } from '../config/email';
import { getEnv, requireEnv } from '../config/env';
import { getOpenAIClient } from '../config/openai';
import { IssuedCredential, OfferOCRResult } from '../types/auth.types';
import { generateOTP, getOTPExpireTime } from '../utils/otp.util';

// 内存存储OTP（黑客松MVP够用，生产环境可以换Redis）
const otpStore = new Map<string, { code: string; expireAt: number }>();

export class AuthService {
  // 1. 生成并发送OTP验证码到企业邮箱
  static async sendOTP(email: string): Promise<void> {
    // 生成6位验证码
    const otpCode = generateOTP();
    // 计算过期时间
    const OTP_EXPIRE_MINUTES = getEnv('OTP_EXPIRE_MINUTES', '10');
    const expireAt = getOTPExpireTime(Number(OTP_EXPIRE_MINUTES));

    // 把验证码存起来，后续验证用
    otpStore.set(email.toLowerCase(), { code: otpCode, expireAt });

    // 发送邮件
    const EMAIL_USER = getEnv('EMAIL_USER', '');
    await getEmailTransporter().sendMail({
      from: `"Rate My Mentor" <${EMAIL_USER}>`,
      to: email,
      subject: '你的Rate My Mentor邮箱验证验证码',
      html: `
        <h3>欢迎使用 Rate My Mentor</h3>
        <p>你的邮箱验证验证码是：<b style="font-size: 20px;">${otpCode}</b></p>
        <p>验证码有效期为 ${OTP_EXPIRE_MINUTES} 分钟，请勿泄露给他人</p>
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

  // 3. OCR识别Offer Letter，提取公司信息
  static async extractOfferInfo(base64Image: string): Promise<OfferOCRResult> {
    const OPENAI_MODEL = getEnv('OPENAI_MODEL', 'gpt-4o');
    const response = await getOpenAIClient().chat.completions.create({
      model: OPENAI_MODEL,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `
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
              `,
            },
            {
              type: 'image_url',
              image_url: { url: `data:image/jpeg;base64,${base64Image}` },
            },
          ],
        },
      ],
      temperature: 0.2, // 温度越低，结果越稳定
      response_format: { type: 'json_object' }, // 强制返回JSON
    });

    const result = response.choices[0].message.content;
    if (!result) throw new Error('OCR识别失败，无返回结果');

    return JSON.parse(result) as OfferOCRResult;
  }

  // 4. 签发链上可验证凭证（OCR 通过后调用）
  static async issueCredential(
    userAddress: string,
    ocrResult: OfferOCRResult
  ): Promise<IssuedCredential> {
    const { BACKEND_PRIVATE_KEY } = requireEnv(['BACKEND_PRIVATE_KEY'] as const);

    const credentialId = crypto.randomUUID();
    const companyId = ocrResult.companyName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    const credentialHash = keccak256(toBytes(credentialId));

    // 有效期：优先用 OCR 抽取的到期日，否则默认一年
    let expireTime: number;
    if (ocrResult.expireDate) {
      const parsed = Date.parse(ocrResult.expireDate);
      expireTime = !isNaN(parsed)
        ? Math.floor(parsed / 1000)
        : Math.floor(Date.now() / 1000) + 365 * 24 * 3600;
    } else {
      expireTime = Math.floor(Date.now() / 1000) + 365 * 24 * 3600;
    }

    // 签名方式与 generateSignature.ts / testMintSBT.ts 完全一致：
    // keccak256(abi.encode(credentialId, userAddress, companyId, credentialHash, expireTime))
    const encoded = encodeAbiParameters(
      [
        { type: 'string' },
        { type: 'address' },
        { type: 'string' },
        { type: 'bytes32' },
        { type: 'uint256' },
      ],
      [
        credentialId,
        userAddress as `0x${string}`,
        companyId,
        credentialHash as `0x${string}`,
        BigInt(expireTime),
      ]
    );
    const messageHash = keccak256(encoded);
    const account = privateKeyToAccount(BACKEND_PRIVATE_KEY as `0x${string}`);
    const signature = await account.signMessage({ message: { raw: messageHash } });

    return {
      credentialId,
      companyId,
      companyName: ocrResult.companyName,
      credentialHash,
      expireTime,
      signature,
    };
  }
}