import { apiFetch } from "@/hooks/useApi";

type ApiResponse<T> =
  | { success: true; data: T; message: string }
  | { success: false; message: string; errorCode?: string };

export type UploadReviewResult = {
  cid: string;
  ipfsUrl: string;
  cidBytes32: `0x${string}`;
};

/**
 * 上传 review 正文到后端（后端负责加密并上传 Pinata/IPFS），返回真实 CID。
 *
 * 默认走 NEXT_PUBLIC_API_BASE（如 http://localhost:3001/api/v1）。
 * 若未配置，则回退到 http://localhost:3001/api/v1。
 */
export async function uploadReview(rawContent: string): Promise<UploadReviewResult> {
  const trimmed = rawContent.trim();
  if (!trimmed) throw new Error("rawContent 不能为空");

  const base = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:3001/api/v1";
  const path = `${base}/ipfs/reviews`;

  const res = await apiFetch<ApiResponse<UploadReviewResult>>(path, {
    method: "POST",
    body: JSON.stringify({ rawContent: trimmed }),
  });

  if (!res.success) throw new Error(res.message || "上传失败");
  return res.data;
}

