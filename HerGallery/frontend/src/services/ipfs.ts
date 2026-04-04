const IPFS_GATEWAYS = [
  'https://gateway.pinata.cloud/ipfs/',
  'https://ipfs.io/ipfs/',
  'https://cloudflare-ipfs.com/ipfs/',
  'https://dweb.link/ipfs/',
];

const PINATA_API = 'https://api.pinata.cloud';

export function getIPFSUrl(hash: string): string {
  if (!hash) return '';
  if (hash.startsWith('http')) return hash;
  if (hash.startsWith('ipfs://')) return hash.replace('ipfs://', IPFS_GATEWAYS[0]);
  return `${IPFS_GATEWAYS[0]}${hash}`;
}

export function getAllIPFSUrls(hash: string): string[] {
  if (!hash) return [];
  if (hash.startsWith('http')) return [hash];
  if (hash.startsWith('ipfs://')) {
    return IPFS_GATEWAYS.map(gw => hash.replace('ipfs://', gw));
  }
  return IPFS_GATEWAYS.map(gw => `${gw}${hash}`);
}

export async function getFromIPFS(hash: string): Promise<any> {
  const url = getIPFSUrl(hash);
  const res = await fetch(url);
  return res.json();
}

export async function uploadToIPFS(content: string | object): Promise<string> {
  const body = typeof content === 'string' ? content : JSON.stringify(content);
  const blob = new Blob([body], { type: 'application/json' });
  const file = new File([blob], 'data.json');
  return uploadFileToIPFS(file);
}

export async function uploadFileToIPFS(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);

  const pinataMetadata = JSON.stringify({
    name: file.name,
  });
  formData.append('pinataMetadata', pinataMetadata);

  const pinataOptions = JSON.stringify({
    cidVersion: 1,
  });
  formData.append('pinataOptions', pinataOptions);

  const apiKey = import.meta.env.VITE_PINATA_API_KEY;
  const secretKey = import.meta.env.VITE_PINATA_SECRET_KEY;

  if (!apiKey || !secretKey) {
    throw new Error('Pinata API credentials not configured. Please set VITE_PINATA_API_KEY and VITE_PINATA_SECRET_KEY in your .env file.');
  }

  const res = await fetch(`${PINATA_API}/pinning/pinFileToIPFS`, {
    method: 'POST',
    headers: {
      pinata_api_key: apiKey,
      pinata_secret_api_key: secretKey,
    },
    body: formData,
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`IPFS upload failed: ${error}`);
  }

  const result = await res.json();
  return result.IpfsHash;
}