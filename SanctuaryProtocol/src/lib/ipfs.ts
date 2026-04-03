/**
 * 上传数据到 IPFS (通过后端 API Route)
 * JWT 隐藏在服务器端，避免暴露在客户端
 * @param data 要上传的数据对象
 * @returns CID (Content Identifier)
 */
export async function uploadToIPFS(data: object): Promise<string> {
  try {
    // 调用后端 API Route 进行上传
    const response = await fetch('/api/ipfs/upload', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        data,
        filename: `journal-${Date.now()}.json`,
      }),
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      console.error('IPFS upload error:', result);
      throw new Error(result.error || 'Failed to upload to IPFS');
    }

    console.log('IPFS upload success:', result.cid);
    return result.cid;
    
  } catch (error) {
    console.error('Failed to upload to IPFS:', error);
    throw new Error(`IPFS upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * 从 IPFS 下载数据
 * 通过后端 API Route 代理，避免 CORS 问题
 * @param cid IPFS CID
 * @returns 数据对象
 */
export async function downloadFromIPFS(cid: string): Promise<unknown> {
  try {
    // 使用后端 API Route 代理请求，避免 CORS
    const response = await fetch(`/api/ipfs/download?cid=${encodeURIComponent(cid)}`);
    
    const result = await response.json();

    if (!response.ok || !result.success) {
      console.error('IPFS download error:', result);
      throw new Error(result.error || 'Failed to download from IPFS');
    }

    return result.data;
  } catch (error) {
    console.error('Failed to download from IPFS:', error);
    throw new Error('IPFS download failed');
  }
}

/**
 * 获取 IPFS 网关 URL
 * @param cid IPFS CID
 * @returns 完整的网关 URL
 */
export function getIPFSUrl(cid: string): string {
  return `https://amber-implicit-heron-963.mypinata.cloud/ipfs/${cid}`;
}

/**
 * 检查 IPFS 服务是否配置
 * @returns 配置是否有效
 */
export function isIPFSConfigured(): boolean {
  // 现在由服务器端检查配置
  return true;
}
