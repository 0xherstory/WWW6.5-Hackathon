const PINATA_JSON_ENDPOINT = "https://api.pinata.cloud/pinning/pinJSONToIPFS";

function getPinataJwt() {
  const jwt = process.env.PINATA_JWT;

  if (!jwt) {
    throw new Error("服务端缺少 PINATA_JWT，请先在本地环境或 Vercel 环境变量中配置。");
  }

  return jwt;
}

export async function pinJsonToPinata({ content, keyvalues, name }) {
  const response = await fetch(PINATA_JSON_ENDPOINT, {
    body: JSON.stringify({
      pinataContent: content,
      pinataMetadata: {
        keyvalues,
        name,
      },
    }),
    headers: {
      Authorization: `Bearer ${getPinataJwt()}`,
      "Content-Type": "application/json",
    },
    method: "POST",
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Pinata 上传失败。");
  }

  const payload = await response.json();

  if (!payload.IpfsHash) {
    throw new Error("Pinata 没有返回有效的 CID。");
  }

  return payload.IpfsHash;
}

export async function handlePinataJsonRequest(rawBody) {
  if (!rawBody || typeof rawBody !== "object" || !("content" in rawBody)) {
    throw new Error("上传请求缺少 content。");
  }

  const { content, keyvalues, name } = rawBody;
  const cid = await pinJsonToPinata({
    content,
    keyvalues,
    name: typeof name === "string" && name.trim() ? name : `seamphore-${Date.now()}`,
  });

  return {
    cid,
  };
}
