import dotenv from 'dotenv';

dotenv.config();

const PINATA_API_KEY = process.env.PINATA_API_KEY;
const PINATA_SECRET_KEY = process.env.PINATA_SECRET_KEY;

let usePinata = false;
if (PINATA_API_KEY && PINATA_SECRET_KEY) {
  usePinata = true;
} else {
  console.warn('Pinata credentials not configured. Images will use DALL-E hosted URLs.');
}

// Upload image from URL to IPFS via Pinata
export async function uploadImageToIPFS(imageUrl) {
  if (!usePinata) {
    return imageUrl; // Return original URL if Pinata not configured
  }

  try {
    // Fetch the image
    const imageResponse = await fetch(imageUrl);
    const imageBuffer = await imageResponse.arrayBuffer();

    // Upload to Pinata
    const formData = new FormData();
    const blob = new Blob([imageBuffer], { type: 'image/png' });
    formData.append('file', blob, 'image.png');

    const pinataMetadata = JSON.stringify({
      name: 'alcheme-asset'
    });
    formData.append('pinataMetadata', pinataMetadata);

    const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
      method: 'POST',
      headers: {
        pinata_api_key: PINATA_API_KEY,
        pinata_secret_api_key: PINATA_SECRET_KEY
      },
      body: formData
    });

    if (!response.ok) {
      throw new Error(`Pinata upload failed: ${response.statusText}`);
    }

    const data = await response.json();
    return `ipfs://${data.IpfsHash}`;
  } catch (error) {
    console.error('Error uploading to IPFS:', error);
    return imageUrl; // Fallback to original URL
  }
}

// Upload JSON metadata to IPFS via Pinata
export async function uploadMetadataToIPFS(metadata) {
  if (!usePinata) {
    return null;
  }

  try {
    const response = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        pinata_api_key: PINATA_API_KEY,
        pinata_secret_api_key: PINATA_SECRET_KEY
      },
      body: JSON.stringify({
        pinataContent: metadata,
        pinataMetadata: { name: 'alcheme-metadata' }
      })
    });

    if (!response.ok) {
      throw new Error(`Pinata metadata upload failed: ${response.statusText}`);
    }

    const data = await response.json();
    return `ipfs://${data.IpfsHash}`;
  } catch (error) {
    console.error('Error uploading metadata to IPFS:', error);
    return null;
  }
}
