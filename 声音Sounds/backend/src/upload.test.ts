import request from 'supertest'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { app } from './server'
import * as pinataModule from './pinata'

afterEach(() => {
  vi.restoreAllMocks()
})

describe('upload route', () => {
  it('rejects unsupported file types', async () => {
    const response = await request(app)
      .post('/api/upload')
      .attach('file', Buffer.from('hello'), {
        filename: 'note.txt',
        contentType: 'text/plain',
      })

    expect(response.status).toBe(415)
    expect(response.body).toEqual({ error: '不支持的文件格式' })
  })

  it('rejects files larger than 20MB', async () => {
    const response = await request(app)
      .post('/api/upload')
      .attach('file', Buffer.alloc(20 * 1024 * 1024 + 1), {
        filename: 'big.m4a',
        contentType: 'audio/mp4',
      })

    expect(response.status).toBe(413)
    expect(response.body).toEqual({ error: '文件过大' })
  })

  it('returns fileName, cid and ipfsUrl for a valid m4a upload', async () => {
    vi.spyOn(pinataModule, 'uploadToPinata').mockResolvedValue({
      cid: 'bafy123',
      ipfsUrl: 'https://gateway.pinata.cloud/ipfs/bafy123',
    })

    const response = await request(app)
      .post('/api/upload')
      .attach('file', Buffer.from('audio'), {
        filename: 'rain.m4a',
        contentType: 'audio/mp4',
      })

    expect(response.status).toBe(200)
    expect(response.body).toEqual({
      fileName: 'rain.m4a',
      cid: 'bafy123',
      ipfsUrl: 'https://gateway.pinata.cloud/ipfs/bafy123',
    })
  })

  it('preserves utf-8 file names for valid uploads', async () => {
    const uploadToPinata = vi.spyOn(pinataModule, 'uploadToPinata').mockResolvedValue({
      cid: 'bafy456',
      ipfsUrl: 'https://gateway.pinata.cloud/ipfs/bafy456',
    })

    const response = await request(app)
      .post('/api/upload')
      .attach('file', Buffer.from('audio'), {
        filename: '雨声.m4a',
        contentType: 'audio/mp4',
      })

    expect(response.status).toBe(200)
    expect(response.body).toEqual({
      fileName: '雨声.m4a',
      cid: 'bafy456',
      ipfsUrl: 'https://gateway.pinata.cloud/ipfs/bafy456',
    })
    expect(uploadToPinata).toHaveBeenCalledWith(
      expect.objectContaining({ originalname: '雨声.m4a' }),
    )
  })

  it('returns 502 when pinata upload fails', async () => {
    vi.spyOn(pinataModule, 'uploadToPinata').mockRejectedValue(new Error('pinata failed'))

    const response = await request(app)
      .post('/api/upload')
      .attach('file', Buffer.from('audio'), {
        filename: 'rain.m4a',
        contentType: 'audio/mp4',
      })

    expect(response.status).toBe(502)
    expect(response.body).toEqual({ error: '上传失败' })
  })
})
