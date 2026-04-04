import axios from 'axios'
import FormData from 'form-data'

export async function uploadToPinata(file: Express.Multer.File) {
  const jwt = process.env.PINATA_JWT

  if (!jwt) {
    throw new Error('missing pinata jwt')
  }

  const formData = new FormData()
  formData.append('file', file.buffer, {
    filename: file.originalname,
    contentType: file.mimetype,
  })

  const response = await axios.post('https://uploads.pinata.cloud/v3/files', formData, {
    headers: {
      Authorization: `Bearer ${jwt}`,
      ...formData.getHeaders(),
    },
  })

  const cid = response.data.data.cid as string

  return {
    cid,
    ipfsUrl: `https://gateway.pinata.cloud/ipfs/${cid}`,
  }
}
