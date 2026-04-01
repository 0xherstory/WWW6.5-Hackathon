import OpenAI from 'openai';
import { requireEnv } from './env';

let _openaiClient: OpenAI | null = null;

// 懒加载：调用 AI 功能时才校验 OpenAI 配置
export function getOpenAIClient(): OpenAI {
  if (_openaiClient) return _openaiClient;
  const { OPENAI_API_KEY } = requireEnv(['OPENAI_API_KEY'] as const);
  _openaiClient = new OpenAI({ apiKey: OPENAI_API_KEY });
  return _openaiClient;
}