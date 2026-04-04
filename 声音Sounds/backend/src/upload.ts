import multer from 'multer'
import { Router } from 'express'
import { uploadToPinata } from './pinata'
import { isAllowedAudioFile, maxFileSize } from './whitelist'

const upload = multer({ storage: multer.memoryStorage() })

function decodeFileName(fileName: string) {
  const decoded = Buffer.from(fileName, 'latin1').toString('utf8')

  if (Buffer.from(decoded, 'utf8').toString('latin1') === fileName) {
    return decoded
  }

  return fileName
}

export const uploadRouter = Router()

uploadRouter.post('/', upload.single('file'), async (request, response) => {
  const file = request.file

  if (!file) {
    response.status(400).json({ error: '缺少文件' })
    return
  }

  const fileName = decodeFileName(file.originalname)
  const uploadFile = { ...file, originalname: fileName }

  if (file.size > maxFileSize) {
    response.status(413).json({ error: '文件过大' })
    return
  }

  if (!isAllowedAudioFile(fileName, file.mimetype)) {
    response.status(415).json({ error: '不支持的文件格式' })
    return
  }

  try {
    const result = await uploadToPinata(uploadFile)
    response.json({
      fileName,
      cid: result.cid,
      ipfsUrl: result.ipfsUrl,
    })
  } catch {
    response.status(502).json({ error: '上传失败' })
  }
})
