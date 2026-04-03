import { NextRequest, NextResponse } from 'next/server';

/**
 * IPFS 上传 API Route
 * 将 Pinata JWT 隐藏在服务器端，避免暴露在客户端
 */
export async function POST(request: NextRequest) {
  try {
    // 从请求中获取数据
    const body = await request.json();
    const { data, filename } = body;

    if (!data) {
      return NextResponse.json(
        { success: false, error: 'Data is required' },
        { status: 400 }
      );
    }

    // 从服务器端环境变量获取 JWT（非 NEXT_PUBLIC_ 前缀）
    const jwt = process.env.PINATA_JWT;
    
    if (!jwt) {
      console.error('Pinata JWT is not configured on server');
      return NextResponse.json(
        { success: false, error: 'IPFS service is not configured' },
        { status: 500 }
      );
    }

    // 准备文件数据
    const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
    const fileName = filename || `journal-${Date.now()}.json`;
    
    const formData = new FormData();
    formData.append('file', blob, fileName);
    formData.append('pinataMetadata', JSON.stringify({
      name: fileName,
    }));

    // 上传到 Pinata
    const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${jwt}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Pinata upload error:', errorData);
      return NextResponse.json(
        { success: false, error: 'Failed to upload to IPFS', details: errorData },
        { status: 502 }
      );
    }

    const result = await response.json();
    
    return NextResponse.json({
      success: true,
      cid: result.IpfsHash,
      url: `https://amber-implicit-heron-963.mypinata.cloud/ipfs/${result.IpfsHash}`,
    });

  } catch (error) {
    console.error('IPFS upload error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}
