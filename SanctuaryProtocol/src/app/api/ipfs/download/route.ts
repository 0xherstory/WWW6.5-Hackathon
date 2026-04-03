import { NextRequest, NextResponse } from 'next/server';

/**
 * IPFS 下载 API Route
 * 代理 IPFS 下载请求，避免浏览器的 CORS 限制
 */
export async function GET(request: NextRequest) {
  try {
    // 从 URL 参数获取 CID
    const { searchParams } = new URL(request.url);
    const cid = searchParams.get('cid');

    if (!cid) {
      return NextResponse.json(
        { success: false, error: 'CID is required' },
        { status: 400 }
      );
    }

    // 尝试多个 IPFS 网关
    const gateways = [
      `https://ipfs.io/ipfs/${cid}`,
      `https://gateway.pinata.cloud/ipfs/${cid}`,
      `https://cloudflare-ipfs.com/ipfs/${cid}`,
      `https://dweb.link/ipfs/${cid}`,
    ];

    let response = null;
    let lastError = null;

    for (const gatewayUrl of gateways) {
      try {
        response = await fetch(gatewayUrl, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
          // 设置超时
          signal: AbortSignal.timeout(10000),
        });

        if (response.ok) {
          break;
        }
      } catch (error) {
        lastError = error;
        console.warn(`Gateway failed: ${gatewayUrl}`, error);
        continue;
      }
    }

    if (!response || !response.ok) {
      console.error('All IPFS gateways failed:', lastError);
      return NextResponse.json(
        { success: false, error: 'All IPFS gateways failed' },
        { status: 502 }
      );
    }

    // 获取数据并返回
    const data = await response.json();
    
    return NextResponse.json({
      success: true,
      data,
    });

  } catch (error) {
    console.error('IPFS download error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}
