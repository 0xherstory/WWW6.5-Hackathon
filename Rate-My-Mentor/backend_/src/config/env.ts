import dotenv from 'dotenv';
import { z } from 'zod';

// 加载.env文件
dotenv.config();

// 仅校验“基础启动项”：确保服务能启动
const baseEnvSchema = z.object({
  PORT: z.string().default('3001'),
  NODE_ENV: z.enum(['development', 'production']).default('development'),
});

const parsedBaseEnv = baseEnvSchema.safeParse(process.env);
if (!parsedBaseEnv.success) {
  console.error('❌ 基础环境变量校验失败，请检查.env文件：', parsedBaseEnv.error.format());
  process.exit(1);
}

export const env = parsedBaseEnv.data;

function isMissing(v: unknown): boolean {
  return v == null || (typeof v === 'string' && v.trim().length === 0);
}

/**
 * 按需校验：在具体功能调用时检查必需环境变量
 * - 缺失时抛出明确错误（不会影响服务启动）
 */
export function requireEnv<K extends string>(
  keys: readonly K[]
): Record<K, string> {
  const missing: string[] = [];
  const out = {} as Record<K, string>;
  for (const k of keys) {
    const v = process.env[k];
    if (isMissing(v)) missing.push(k);
    else out[k] = String(v);
  }
  if (missing.length > 0) {
    throw new Error(
      `缺少环境变量：${missing.join(', ')}。请在 backend_/.env 中补齐后重试。`
    );
  }
  return out;
}

/**
 * 带默认值的读取（可选项）
 */
export function getEnv(key: string, defaultValue: string): string {
  const v = process.env[key];
  if (v == null || String(v).trim().length === 0) return defaultValue;
  return String(v);
}