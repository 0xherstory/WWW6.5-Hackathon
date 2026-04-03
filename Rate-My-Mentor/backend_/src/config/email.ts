import nodemailer from 'nodemailer';
import { getEmailEnv } from './env';

let _emailTransporter: nodemailer.Transporter | null = null;

// 懒加载：只有真正调用邮件功能时才校验配置并初始化
export function getEmailTransporter(): nodemailer.Transporter {
  if (_emailTransporter) return _emailTransporter;

  const { EMAIL_HOST, EMAIL_USER, EMAIL_PASS, EMAIL_PORT } = getEmailEnv();

  _emailTransporter = nodemailer.createTransport({
    host: EMAIL_HOST,
    port: Number(EMAIL_PORT),
    secure: true, // 465 端口通常使用 true
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASS,
    },
  });

  return _emailTransporter;
}

// 兼容旧代码导入，修复报错：has no exported member 'emailTransporter'
export const emailTransporter = getEmailTransporter();

//import nodemailer from 'nodemailer';
//import { env } from './env';

// 初始化邮箱发送客户端，用于发送OTP验证码
//export const emailTransporter = nodemailer.createTransport({
//  host: env.EMAIL_HOST,
//  port: Number(env.EMAIL_PORT),
//  secure: true, // 465端口必须用true
//  auth: {
//    user: env.EMAIL_USER,
//    pass: env.EMAIL_PASS,
//  },
//});

// 启动时验证邮箱服务是否可用
//emailTransporter.verify().then(() => {
//  console.log('📧 邮箱服务连接成功');
//}).catch((err) => {
//  console.error('❌ 邮箱服务连接失败，请检查配置：', err);
//});

//G的修改思路：
//凡是这种“外部依赖客户端初始化类文件”，比如：
//contract.ts
//email.ts
//可能还有 openai.ts
//pinata.ts
//优先保留这种设计：
//懒加载
//按需校验 env
//避免模块级副作用
//尽量不在 import 时就联网/初始化
//这个方向总体是对的。
