// src/hooks/useIPFS.ts
import { useState } from 'react';

export function useIPFS() {
  const [uploading, setUploading] = useState(false);

  const uploadFile = async (file: File) => {
    try {
      setUploading(true);
      
      const formData = new FormData();
      formData.append('file', file);
      
      // 使用 Pinata 免费上传
      const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiJjNThhYzFlMi1mYWVkLTQ4MTUtODJiMi0xZTU5Y2IzMjZiNTQiLCJlbWFpbCI6IjEwMDk2MzMyMTJAcXEuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsInBpbl9wb2xpY3kiOnsicmVnaW9ucyI6W3siZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjEsImlkIjoiRlJBMSJ9LHsiZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjEsImlkIjoiTllDMSJ9XSwidmVyc2lvbiI6MX0sIm1mYV9lbmFibGVkIjpmYWxzZSwic3RhdHVzIjoiQUNUSVZFIn0sImF1dGhlbnRpY2F0aW9uVHlwZSI6InNjb3BlZEtleSIsInNjb3BlZEtleUtleSI6IjY1ZmY1MTE4ZTU0ZDc1ZDc3NTJhIiwic2NvcGVkS2V5U2VjcmV0IjoiMGNkMGVlZDRhMTk5N2YwZjdjOTg3MTE3MzZkNmEwNTY1ZWJjYzIzMWM4ZjA2MDUxNDRmMDFjYjljOGViMzU2ZCIsImV4cCI6MTgwNjMyNTY1Mn0.Wlts8AzB9CTzG_dSkabOLtc6NdIOXDld60j0SahJKYw'
        },
        body: formData
      });

      const result = await response.json();
      
      if (result.IpfsHash) {
        const cid = result.IpfsHash;
        const url = `https://gateway.pinata.cloud/ipfs/${cid}`;
        
        return {
          cid: cid,
          url: url,
          name: file.name
        };
      }
      
      return null;
    } catch (error) {
      console.error('IPFS upload error:', error);
      return null;
    } finally {
      setUploading(false);
    }
  };

  return { uploadFile, uploading };
}