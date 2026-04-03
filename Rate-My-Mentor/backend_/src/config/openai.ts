import OpenAI from 'openai';
import { getAIEnv } from './env';

let _openaiClient: OpenAI | null = null;

/**
 * 获取 OpenAI Client（懒加载 + 单例）
 * - 只有在真正调用 AI 功能时才校验环境变量
 * - 全项目复用同一个实例
 */
export function getOpenAIClient(): OpenAI {
  if (_openaiClient) return _openaiClient;

  const { OPENAI_API_KEY } = getAIEnv();

  _openaiClient = new OpenAI({
    apiKey: OPENAI_API_KEY,
    dangerouslyAllowBrowser: true
  });

  return _openaiClient;
}

// 兼容旧代码导入：openaiClient（修复你项目里的报错）
export const openaiClient = getOpenAIClient();



//import OpenAI from 'openai';
//import { env } from './env';

// 初始化OpenAI客户端，整个项目共用这一个实例
//export const openaiClient = new OpenAI({
//  apiKey: env.OPENAI_API_KEY,
//});
