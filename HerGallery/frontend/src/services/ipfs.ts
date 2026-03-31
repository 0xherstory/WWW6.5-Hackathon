const IPFS_GATEWAY = 'https://ipfs.io/ipfs/';

export function getIPFSUrl(hash: string): string {
  if (!hash) return '';
  if (hash.startsWith('http')) return hash;
  if (hash.startsWith('ipfs://')) return hash.replace('ipfs://', IPFS_GATEWAY);
  return `${IPFS_GATEWAY}${hash}`;
}

export async function getFromIPFS(hash: string): Promise<any> {
  const url = getIPFSUrl(hash);
  const res = await fetch(url);
  return res.json();
}

// Placeholder: replace with web3.storage or pinata implementation
export async function uploadToIPFS(content: string | object): Promise<string> {
  console.log('IPFS upload placeholder — integrate web3.storage or pinata');
  // Return a mock hash for demo
  return 'QmDemo' + Math.random().toString(36).substring(7);
}

export async function uploadFileToIPFS(file: File): Promise<string> {
  console.log('IPFS file upload placeholder — integrate web3.storage or pinata');
  return 'QmDemo' + Math.random().toString(36).substring(7);
}
