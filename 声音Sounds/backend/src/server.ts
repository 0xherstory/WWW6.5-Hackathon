import 'dotenv/config'
import cors from 'cors'
import express from 'express'
import { uploadRouter } from './upload'

export const app = express()

app.use(cors())

app.get('/health', (_request, response) => {
  response.json({ ok: true })
})

app.use('/api/upload', uploadRouter)

if (process.env.NODE_ENV !== 'test') {
  const port = Number(process.env.PORT ?? 3001)
  app.listen(port, () => {
    console.log(`backend listening on http://127.0.0.1:${port}`)
  })
}
