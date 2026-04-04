const allowedExtensions = new Set(['.m4a', '.mp3', '.wav', '.ogg', '.aac', '.flac'])
const allowedMimeTypes = new Set([
  'audio/mp4',
  'audio/x-m4a',
  'audio/mpeg',
  'audio/wav',
  'audio/ogg',
  'audio/aac',
  'audio/flac',
])

export const maxFileSize = 20 * 1024 * 1024

export function isAllowedAudioFile(fileName: string, mimeType: string) {
  const extension = fileName.slice(fileName.lastIndexOf('.')).toLowerCase()
  return allowedExtensions.has(extension) && allowedMimeTypes.has(mimeType.toLowerCase())
}
