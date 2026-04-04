export type UploadResult = {
  fileName: string
  cid: string
  ipfsUrl: string
}

export async function uploadAudio(file: File): Promise<UploadResult> {
  const formData = new FormData()
  formData.append('file', file)

  const response = await fetch('/api/upload', {
    method: 'POST',
    body: formData,
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error ?? '上传失败')
  }

  return data as UploadResult
}
