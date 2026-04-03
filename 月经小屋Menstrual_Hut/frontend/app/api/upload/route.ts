import { NextResponse } from "next/server";

const MAX_CONTENT_SIZE = 10 * 1024; // 10KB 限制

export async function POST(request: Request) {
  try {
    // 检查 Content-Type
    const contentType = request.headers.get("content-type");
    if (!contentType?.includes("application/json")) {
      return NextResponse.json(
        { error: "Content-Type must be application/json" },
        { status: 400 }
      );
    }

    const body = await request.json();
    
    // 验证上传的数据结构
    if (
      typeof body.content !== "string" ||
      typeof body.timestamp !== "string" ||
      typeof body.isPublic !== "boolean"
    ) {
      return NextResponse.json(
        { error: "Invalid request body structure" },
        { status: 400 }
      );
    }

    // 验证内容长度
    if (body.content.length > 1000) {
      return NextResponse.json(
        { error: "Content exceeds maximum length of 1000 characters" },
        { status: 400 }
      );
    }

    // 验证内容非空
    if (!body.content.trim()) {
      return NextResponse.json(
        { error: "Content cannot be empty" },
        { status: 400 }
      );
    }

    // 验证时间戳格式
    const timestamp = new Date(body.timestamp);
    if (isNaN(timestamp.getTime())) {
      return NextResponse.json(
        { error: "Invalid timestamp format" },
        { status: 400 }
      );
    }

    // 检查时间戳不是未来的（防止时间戳欺骗）
    const now = new Date();
    if (timestamp.getTime() > now.getTime() + 5 * 60 * 1000) {
      return NextResponse.json(
        { error: "Timestamp cannot be in the future" },
        { status: 400 }
      );
    }

    // 检查 PINATA_JWT 是否存在
    if (!process.env.PINATA_JWT) {
      console.error("PINATA_JWT is not configured");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }
    
    // 调用 Pinata 的 API 上传 JSON
    const res = await fetch("https://api.pinata.cloud/pinning/pinJSONToIPFS", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.PINATA_JWT}`,
      },
      body: JSON.stringify({
        pinataContent: body,
        pinataMetadata: { name: "Hut_Record.json" }
      }),
    });

    if (!res.ok) {
      console.error(`Pinata API error: ${res.status} ${res.statusText}`);
      return NextResponse.json(
        { error: "Failed to upload to IPFS" },
        { status: 502 }
      );
    }

    const data = await res.json();
    
    // 验证返回的 CID
    if (!data.IpfsHash || typeof data.IpfsHash !== "string") {
      console.error("Invalid response from Pinata API");
      return NextResponse.json(
        { error: "Invalid IPFS response" },
        { status: 502 }
      );
    }

    return NextResponse.json({ cid: data.IpfsHash });
  } catch (error) {
    if (error instanceof SyntaxError) {
      console.error("Invalid JSON in request:", error);
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 }
      );
    }

    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Upload failed, please try again" },
      { status: 500 }
    );
  }
}
