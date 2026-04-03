const PINATA_JWT = import.meta.env.VITE_PINATA_JWT;

/**
 * Uploads a file to IPFS via Pinata.
 * Returns the IPFS CID, or null if no JWT is configured.
 */
export async function uploadFileToIPFS(file) {
  if (!PINATA_JWT) return null;

  const formData = new FormData();
  formData.append("file", file);
  formData.append("pinataMetadata", JSON.stringify({ name: file.name }));
  formData.append("pinataOptions", JSON.stringify({ cidVersion: 0 }));

  const res = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
    method: "POST",
    headers: { Authorization: `Bearer ${PINATA_JWT}` },
    body: formData,
  });

  if (!res.ok) throw new Error(`IPFS upload failed: ${res.statusText}`);
  const data = await res.json();
  return data.IpfsHash;
}

/** Returns a public gateway URL for an IPFS CID. */
export function ipfsToGateway(cid) {
  return `https://gateway.pinata.cloud/ipfs/${cid}`;
}

export const hasPinataConfig = !!PINATA_JWT;
