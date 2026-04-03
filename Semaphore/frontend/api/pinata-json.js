import { handlePinataJsonRequest } from "../server/pinata.js";

export default async function handler(request, response) {
  if (request.method !== "POST") {
    response.status(405).json({
      error: "Method Not Allowed",
    });
    return;
  }

  try {
    const payload = await handlePinataJsonRequest(request.body);

    response.status(200).json(payload);
  } catch (error) {
    response.status(500).json({
      error: error instanceof Error ? error.message : "Pinata 上传失败。",
    });
  }
}
