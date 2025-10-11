import { Router } from 'express'
import axios from 'axios'
import jwt from 'jsonwebtoken'

const COOKIE_NAME = process.env.COOKIE_NAME ?? 'sp_session'
const JWT_SECRET = process.env.JWT_SECRET!

export const spotifyRouter = Router()

function getBearerFromCookie(cookie?: string) {
  if (!cookie) throw new Error('no_session')
  const decoded = jwt.verify(cookie, JWT_SECRET) as { access_token: string }
  return decoded.access_token
}

spotifyRouter.get('/me', async (req, res) => {
  try {
    const token = getBearerFromCookie(req.cookies?.[COOKIE_NAME])
    const { data } = await axios.get('https://api.spotify.com/v1/me', {
      headers: { Authorization: `Bearer ${token}` }
    })
    res.json(data)
  } catch {
    res.status(401).json({ error: 'unauthorized' })
  }
})

spotifyRouter.get('/top-artists', async (req, res) => {
  try {
    const token = getBearerFromCookie(req.cookies?.[COOKIE_NAME])
    const limit = Number(req.query.limit ?? 20)
    const offset = Number(req.query.offset ?? 0)
    const { data } = await axios.get(`https://api.spotify.com/v1/me/top/artists?limit=${limit}&offset=${offset}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    res.json(data)
  } catch {
    res.status(401).json({ error: 'unauthorized' })
  }
})

spotifyRouter.get('/playlists', async (req, res) => {
  try {
    const token = getBearerFromCookie(req.cookies?.[COOKIE_NAME])
    const limit = Number(req.query.limit ?? 20)
    const offset = Number(req.query.offset ?? 0)
    const { data } = await axios.get(`https://api.spotify.com/v1/me/playlists?limit=${limit}&offset=${offset}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    res.json(data)
  } catch {
    res.status(401).json({ error: 'unauthorized' })
  }
})

spotifyRouter.post('/playlists', async (req, res) => {
  try {
    const token = getBearerFromCookie(req.cookies?.[COOKIE_NAME])
    const me = await axios.get('https://api.spotify.com/v1/me', {
      headers: { Authorization: `Bearer ${token}` }
    })
    const { name, description, isPublic } = req.body as { name: string; description?: string; isPublic?: boolean }
    const { data } = await axios.post(
      `https://api.spotify.com/v1/users/${me.data.id}/playlists`,
      { name, description, public: Boolean(isPublic) },
      { headers: { Authorization: `Bearer ${token}` } }
    )
    res.status(201).json(data)
  } catch {
    res.status(400).json({ error: 'create_failed' })
  }
})
