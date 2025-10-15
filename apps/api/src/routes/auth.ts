import { Router } from 'express'
import jwt from 'jsonwebtoken'
import axios from 'axios'

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID!
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET!
const REDIRECT_URI = process.env.SPOTIFY_REDIRECT_URI!
const JWT_SECRET = process.env.JWT_SECRET!
const COOKIE_NAME = process.env.COOKIE_NAME ?? 'sp_session'

export const authRouter = Router()

authRouter.get('/login', (_req, res) => {
  const scope = [
    'user-read-email','user-read-private',
    'playlist-read-private','playlist-modify-private','playlist-modify-public',
    'user-top-read'
  ].join(' ')
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: CLIENT_ID,
    scope,
    redirect_uri: REDIRECT_URI
  })
  res.redirect(`https://accounts.spotify.com/authorize?${params.toString()}`)
})

authRouter.get('/callback', async (req, res) => {
  const code = String(req.query.code ?? '')
  if (!code) return res.status(400).json({ error: 'missing_code' })

  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    redirect_uri: REDIRECT_URI
  })
  const basic = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64')

  const { data } = await axios.post('https://accounts.spotify.com/api/token', body.toString(), {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', Authorization: `Basic ${basic}` }
  })

  const payload = { access_token: data.access_token, refresh_token: data.refresh_token }
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: Math.floor(data.expires_in * 0.9) })

  res.cookie(COOKIE_NAME, token, {
    httpOnly: true, 
    secure: false, 
    sameSite: 'lax',
    path: '/', 
    maxAge: data.expires_in * 1000
  })
  res.redirect(process.env.CORS_ORIGIN ?? 'http://127.0.0.1:3000')
})

authRouter.post('/refresh', async (req, res) => {
  try {
    const cookie = req.cookies?.[COOKIE_NAME]
    if (!cookie) return res.status(401).json({ error: 'no_session' })
    const decoded = jwt.verify(cookie, JWT_SECRET) as { refresh_token: string }
    const basic = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64')
    const body = new URLSearchParams({ grant_type: 'refresh_token', refresh_token: decoded.refresh_token })
    const { data } = await axios.post('https://accounts.spotify.com/api/token', body.toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', Authorization: `Basic ${basic}` }
    })
    const payload = { access_token: data.access_token, refresh_token: decoded.refresh_token }
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: Math.floor(data.expires_in * 0.9) })
    res.cookie(COOKIE_NAME, token, {
      httpOnly: true, 
      secure: false, 
      sameSite: 'lax',
      path: '/', 
      maxAge: data.expires_in * 1000
    })
    res.json({ ok: true })
  } catch {
    res.status(401).json({ error: 'refresh_failed' })
  }
})

authRouter.post('/logout', (__req, res) => {
  res.clearCookie(COOKIE_NAME, {
    httpOnly: true,
    secure: false,
    sameSite: 'lax',
    path: '/'
  })
  res.json({ ok: true, message: 'Logged out successfully' })
})
