interface UploadReviewResponse {
  cid: string;
  ipfsUrl: string;
  cidBytes32: string;
}

export async function uploadReview(rawContent: string): Promise<UploadReviewResponse> {
  const apiBase = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:3001/api/v1";

  const response = await fetch(`${apiBase}/ipfs/reviews`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ rawContent }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`上传失败: ${error}`);
  }

  const json = await response.json();

  if (!json.success) {
    throw new Error(json.message ?? "上传失败");
  }

  return json.data as UploadReviewResponse;
}
