import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import { authRouter } from './routes/auth'
import { spotifyRouter } from './routes/spotify'

const app = express()
app.use(express.json())
app.use(cookieParser())

const origin = process.env.CORS_ORIGIN ?? 'http://127.0.0.1:3000'
app.use(cors({ origin, credentials: true }))

app.get('/health', (_, res) => res.json({ ok: true }))
app.use('/auth', authRouter)
app.use('/api', spotifyRouter)

const port = Number(process.env.PORT ?? 3001)
app.listen(port, '0.0.0.0', () => console.log(`[api] http://localhost:${port}`))
