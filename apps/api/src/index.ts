import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import { authRouter } from './routes/auth'
import { spotifyRouter } from './routes/spotify'

const app = express()
app.use(express.json())
app.use(cookieParser())

const origin = process.env.CORS_ORIGIN ?? 'http://localhost:3000'
app.use(cors({ origin, credentials: true }))

app.get('/health', (_, res) => res.json({ ok: true }))
app.use('/auth', authRouter)
app.use('/api', spotifyRouter)

const port = Number(process.env.API_PORT ?? 3001)
app.listen(port, () => console.log(`[api] http://localhost:${port}`))
