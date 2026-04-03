import { NextRequest, NextResponse } from 'next/server';
import { setCode, getStoredCode } from '@/lib/verificationStore';

const CODE_EXPIRY_MS = 5 * 60 * 1000;
const RATE_LIMIT_MS = 60 * 1000;

function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function isGmail(email: string): boolean {
  return email.toLowerCase().endsWith('@gmail.com');
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      );
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email format' },
        { status: 400 }
      );
    }

    if (!isGmail(email)) {
      return NextResponse.json(
        { success: false, error: 'Only Gmail is supported currently' },
        { status: 400 }
      );
    }

    const existing = getStoredCode(email);
    const now = Date.now();

    if (existing && now - existing.expiresAt < RATE_LIMIT_MS + CODE_EXPIRY_MS - CODE_EXPIRY_MS) {
      // 简化速率限制检查
      const stored = getStoredCode(email);
      if (stored) {
        const remainingSeconds = Math.ceil((stored.expiresAt - now) / 1000);
        if (remainingSeconds > 240) { // 如果还有超过4分钟有效期，限制发送
          return NextResponse.json(
            { 
              success: false, 
              error: `Please wait ${Math.ceil((remainingSeconds - 240) / 60)} minutes before requesting a new code`,
              remainingSeconds: remainingSeconds - 240
            },
            { status: 429 }
          );
        }
      }
    }

    const code = generateCode();
    const expiresAt = now + CODE_EXPIRY_MS;

    setCode(email, {
      code,
      expiresAt,
      lastSentAt: now,
    });

    // TODO: 集成 Resend.com 实现真实邮件发送
    // MVP阶段：验证码输出到控制台
    console.log(`[DEV] Verification code for ${email}: ${code}`);

    return NextResponse.json({
      success: true,
      message: 'Verification code sent successfully',
      expiresIn: CODE_EXPIRY_MS,
      // MVP阶段：在响应中返回验证码，方便前端测试
      // 生产环境应该删除这个字段
      devCode: code,
    });

  } catch (error) {
    console.error('Send code error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
