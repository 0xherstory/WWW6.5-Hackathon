import nodemailer from 'nodemailer';
import { getEnv, requireEnv } from './env';

let _emailTransporter: nodemailer.Transporter | null = null;

// 懒加载：调用 OTP/邮件功能时才校验邮箱配置
export function getEmailTransporter(): nodemailer.Transporter {
  if (_emailTransporter) return _emailTransporter;
  const { EMAIL_HOST, EMAIL_USER, EMAIL_PASS } = requireEnv([
    'EMAIL_HOST',
    'EMAIL_USER',
    'EMAIL_PASS',
  ] as const);
  const EMAIL_PORT = getEnv('EMAIL_PORT', '465');

  _emailTransporter = nodemailer.createTransport({
    host: EMAIL_HOST,
    port: Number(EMAIL_PORT),
    secure: true, // 465端口必须用true
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASS,
    },
  });

  return _emailTransporter;
}