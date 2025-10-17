import { Router } from 'express'
import { authService } from '../services/AuthService'

const COOKIE_NAME = process.env.COOKIE_NAME ?? 'sp_session'
const CORS_ORIGIN = process.env.CORS_ORIGIN ?? 'http://127.0.0.1:3000'

export const authRouter = Router()

authRouter.get('/login', (_req, res) => {
  const authUrl = authService.generateAuthorizationUrl()
  res.redirect(authUrl)
})

authRouter.get('/callback', async (req, res) => {
  try {
    const code = String(req.query.code ?? '')
    if (!code) {
      return res.status(400).json({ error: 'missing_code' })
    }

    const spotifyTokens = await authService.exchangeCodeForToken(code)

    const jwtToken = authService.createJWTToken(spotifyTokens)

    res.cookie(COOKIE_NAME, jwtToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      path: '/',
      maxAge: spotifyTokens.expires_in * 1000
    })

    res.redirect(CORS_ORIGIN)
  } catch (error) {
    console.error('Auth callback error:', error)
    res.status(500).json({ error: 'authentication_failed' })
  }
})

authRouter.post('/refresh', async (req, res) => {
  try {
    const cookie = req.cookies?.[COOKIE_NAME]
    if (!cookie) {
      return res.status(401).json({ error: 'no_session' })
    }

    const decoded = authService.verifyJWTToken(cookie)
    
    const newTokens = await authService.refreshAccessToken(decoded.refresh_token)

    const newJwtToken = authService.createJWTToken({
      ...newTokens,
      refresh_token: decoded.refresh_token
    })

    res.cookie(COOKIE_NAME, newJwtToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      path: '/',
      maxAge: newTokens.expires_in * 1000
    })

    res.json({ ok: true })
  } catch (error) {
    console.error('Token refresh error:', error)
    res.status(401).json({ error: 'refresh_failed' })
  }
})

authRouter.post('/logout', (_req, res) => {
  res.clearCookie(COOKIE_NAME, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/'
  })
  res.json({ ok: true, message: 'Logged out successfully' })
})
