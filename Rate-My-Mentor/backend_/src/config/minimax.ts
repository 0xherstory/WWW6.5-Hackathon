import { getAIEnv } from './env';

interface MiniMaxChatResponse {
  choices?: Array<{ message?: { content?: string } }>;
  base_resp?: { status_code?: number; status_msg?: string };
}

/**
 * MiniMax 官方文本接口：纯文本对话与多模态（含图片）均走此端点。
 * @see https://platform.minimax.io/docs/api-reference/text-post
 */
export async function miniMaxChatCompletion(
  body: Record<string, unknown>
): Promise<string> {
  const { MINIMAX_API_KEY, MINIMAX_NATIVE_BASE_URL } = getAIEnv();
  const origin = MINIMAX_NATIVE_BASE_URL.replace(/\/$/, '');
  const url = `${origin}/v1/text/chatcompletion_v2`;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${MINIMAX_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  const text = await res.text();
  let data: MiniMaxChatResponse;
  try {
    data = JSON.parse(text) as MiniMaxChatResponse;
  } catch {
    throw new Error(`MiniMax API 返回非 JSON：${text.slice(0, 200)}`);
  }

  if (!res.ok) {
    throw new Error(`MiniMax API HTTP ${res.status}：${text.slice(0, 500)}`);
  }

  const code = data.base_resp?.status_code;
  if (code != null && code !== 0) {
    throw new Error(`MiniMax API 错误 ${code}：${data.base_resp?.status_msg ?? ''}`);
  }

  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error('MiniMax 无返回内容');
  }
  return content;
}
