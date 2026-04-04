import request from 'supertest'
import { describe, expect, it } from 'vitest'
import { app } from './server'

describe('server', () => {
  it('returns ok from health endpoint', async () => {
    const response = await request(app).get('/health')

    expect(response.status).toBe(200)
    expect(response.body).toEqual({ ok: true })
  })
})
