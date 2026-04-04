import dotenv from 'dotenv';
import { z } from 'zod';

// 加载 .env 文件
dotenv.config();

/**
 * 仅校验“基础启动项”：
 * 保证服务本身可以启动，避免因为某个暂时不用的功能缺 env 而整体无法运行
 */
const baseEnvSchema = z.object({
  PORT: z.string().default('3001'),
  NODE_ENV: z.enum(['development', 'production']).default('development'),
});

const parsedBaseEnv = baseEnvSchema.safeParse(process.env);

if (!parsedBaseEnv.success) {
  console.error(
    '❌ 基础环境变量校验失败，请检查 .env 文件：',
    parsedBaseEnv.error.format()
  );
  process.exit(1);
}

/**
 * 导出完整的 env 对象
 */
export const env = {
  ...parsedBaseEnv.data,
  OTP_EXPIRE_MINUTES: process.env.OTP_EXPIRE_MINUTES || '5',
  EMAIL_USER: process.env.EMAIL_USER || '',
  MINIMAX_MODEL: process.env.MINIMAX_MODEL || 'MiniMax-M2.7',
  ENCRYPTION_KEY: process.env.ENCRYPTION_KEY || '',
  CONTRACT_ADDRESS: process.env.CONTRACT_ADDRESS || ''
};

/**
 * 工具函数：判断 env 是否缺失
 */
function isMissing(v: unknown): boolean {
  return v == null || (typeof v === 'string' && v.trim().length === 0);
}

/**
 * 工具函数：先检查是否缺失，再做 schema 校验
 */
function parseFeatureEnv<T extends z.ZodRawShape>(
  featureName: string,
  schema: z.ZodObject<T>
): z.infer<typeof schema> {
  const shape = schema.shape;
  const raw: Record<string, string> = {};
  const missing: string[] = [];

  for (const key of Object.keys(shape)) {
    const value = process.env[key];
    if (isMissing(value)) {
      missing.push(key);
    } else {
      raw[key] = String(value);
    }
  }

  if (missing.length > 0) {
    // 🚨 这里本来会报错，我们临时注释掉！让项目先跑起来
    //throw new Error(
      //`缺少 ${featureName} 所需环境变量：${missing.join(', ')}。请在 backend_/.env 中补齐后重试。`
    //);
  }

  const parsed = schema.safeParse(raw);

  if (!parsed.success) {
    throw new Error(
      `❌ ${featureName} 环境变量格式校验失败：${JSON.stringify(
        parsed.error.format(),
        null,
        2
      )}`
    );
  }

  return parsed.data;
}

/**
 * 可选项读取：带默认值
 */
export function getEnv(key: string, defaultValue: string): string {
  const v = process.env[key];
  if (v == null || String(v).trim().length === 0) return defaultValue;
  return String(v);
}

/**
 * 必选项读取（修复报错：requireEnv 不存在）
 */
export function requireEnv(key: keyof typeof env): string {
  const value = env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

/* ------------------------------------------------------------------ */
/* 各功能模块 schema */
/* ------------------------------------------------------------------ */

const aiEnvSchema = z.object({
  MINIMAX_API_KEY: z.string().min(1, 'MINIMAX_API_KEY 必填（MiniMax 开放平台 / Coding Plan）'),
  MINIMAX_MODEL: z.string().default('MiniMax-M2.7'),
  /** chatcompletion_v2 的 API 根域名（无路径）；国内可改为 https://api.minimaxi.com */
  MINIMAX_NATIVE_BASE_URL: z.string().url().default('https://api.minimax.io'),
  /** Offer 图片识别用；若 M2.7 多模态异常可改为 MiniMax-Text-01 */
  MINIMAX_VISION_MODEL: z.string().default('MiniMax-M2.7'),
});

const ipfsEnvSchema = z.object({
  PINATA_API_KEY: z.string().min(1, 'PINATA_API_KEY 必填'),
  PINATA_API_SECRET: z.string().min(1, 'PINATA_API_SECRET 必填'),
});

const emailEnvSchema = z.object({
  EMAIL_HOST: z.string().min(1, 'EMAIL_HOST 必填'),
  EMAIL_PORT: z.string().default('465'),
  EMAIL_USER: z.string().min(1, 'EMAIL_USER 必填'),
  EMAIL_PASS: z.string().min(1, 'EMAIL_PASS 必填'),
  OTP_EXPIRE_MINUTES: z.string().default('10'),
});

const chainEnvSchema = z.object({
  CONTRACT_ADDRESS: z.string().min(1, 'CONTRACT_ADDRESS 必填'),
  CONTRACT_ABI: z
    .string()
    .default('[]')
    .refine((val) => {
      try {
        JSON.parse(val);
        return true;
      } catch {
        return false;
      }
    }, 'CONTRACT_ABI 必须是合法 JSON 字符串'),
  RPC_URL: z.string().url('RPC_URL 必须是合法 URL'),
  CHAIN_ID: z.string().regex(/^\d+$/, 'CHAIN_ID 必须是数字字符串').default('11155111'),
});

const encryptionEnvSchema = z.object({
  ENCRYPTION_KEY: z.string().length(32, 'ENCRYPTION_KEY 必须正好为 32 位'),
});

/* ------------------------------------------------------------------ */
/* 各功能模块导出函数 */
/* ------------------------------------------------------------------ */

export function getAIEnv() {
  return parseFeatureEnv('AI 功能', aiEnvSchema);
}

export function getIpfsEnv() {
  return parseFeatureEnv('IPFS 功能', ipfsEnvSchema);
}

export function getEmailEnv() {
  return parseFeatureEnv('邮件功能', emailEnvSchema);
}

export function getChainEnv() {
  return parseFeatureEnv('链上功能', chainEnvSchema);
}

export function getEncryptionEnv() {
  return parseFeatureEnv('加密功能', encryptionEnvSchema);
}
//import dotenv from 'dotenv';
//import { z } from 'zod';

// 加载.env文件
//dotenv.config();

// 环境变量校验规则，确保必填项不缺失
//const envSchema = z.object({
//  PORT: z.string().default('3001'),
//  NODE_ENV: z.enum(['development', 'production']).default('development'),
//  OPENAI_API_KEY: z.string().min(1, ''),
//  OPENAI_MODEL: z.string().default('gpt-4o'),
//  PINATA_API_KEY: z.string().min(1, 'Pinata API Key 必填'),
//  PINATA_API_SECRET: z.string().min(1, 'Pinata API Secret 必填'),
//  EMAIL_HOST: z.string().min(1, '邮箱SMTP地址 必填'),
//  EMAIL_PORT: z.string().default('465'),
//  EMAIL_USER: z.string().min(1, '发件邮箱 必填'),
//  EMAIL_PASS: z.string().min(1, '邮箱授权码 必填'),
//  OTP_EXPIRE_MINUTES: z.string().default('10'),
//  CONTRACT_ADDRESS: z.string().min(1, '合约地址 必填'),
//  CONTRACT_ABI: z.string().default('[]'),
//  RPC_URL: z.string().min(1, '区块链RPC地址 必填'),
//  CHAIN_ID: z.string().default('11155111'),
//  ENCRYPTION_KEY: z.string().length(32, ''),
//});

// 校验并导出环境变量
//const parsedEnv = envSchema.safeParse(process.env);

//if (!parsedEnv.success) {
//  console.error('❌ 环境变量校验失败，请检查.env文件：', parsedEnv.error.format());
//  process.exit(1);
//}

//export const env = parsedEnv.data;

//G的修改建议：我建议当前先采用“易为版本”的思路作为最终版本，因为它更适合我们现在的联调阶段：
//服务可以先启动，具体功能在调用时再按需校验环境变量，避免因为某个暂时不用的模块缺配置导致整个后端起不来。
//同时我建议吸收“福安版本”里 zod 的格式校验能力，把 env 按 IPFS、邮件、链上、加密、AI 等模块分组，在 requireEnv 之后继续做 schema 校验。
//这样能兼顾联调灵活性和配置严谨性。等后面接近部署时，再考虑切到更接近“福安版本”的全量启动校验。
