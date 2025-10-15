import axios from 'axios'
import jwt from 'jsonwebtoken'

const SPOTIFY_AUTH_URL = 'https://accounts.spotify.com/api/token'
const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID!
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET!
const REDIRECT_URI = process.env.SPOTIFY_REDIRECT_URI!
const JWT_SECRET = process.env.JWT_SECRET!

interface SpotifyTokenResponse {
  access_token: string
  refresh_token: string
  expires_in: number
}

interface JWTPayload {
  access_token: string
  refresh_token: string
}

export class AuthService {
  async exchangeCodeForToken(code: string): Promise<SpotifyTokenResponse> {
    const body = new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: REDIRECT_URI
    })

    const basic = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64')

    const { data } = await axios.post<SpotifyTokenResponse>(
      SPOTIFY_AUTH_URL,
      body.toString(),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Basic ${basic}`
        }
      }
    )

    return data
  }

  createJWTToken(spotifyTokens: SpotifyTokenResponse): string {
    const payload: JWTPayload = {
      access_token: spotifyTokens.access_token,
      refresh_token: spotifyTokens.refresh_token
    }

    const expiresIn = Math.floor(spotifyTokens.expires_in * 0.9)
    
    return jwt.sign(payload, JWT_SECRET, { expiresIn })
  }

  verifyJWTToken(token: string): JWTPayload {
    return jwt.verify(token, JWT_SECRET) as JWTPayload
  }

  extractAccessToken(jwtToken: string): string {
    const decoded = this.verifyJWTToken(jwtToken)
    return decoded.access_token
  }

  async refreshAccessToken(refreshToken: string): Promise<SpotifyTokenResponse> {
    const body = new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken
    })

    const basic = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64')

    const { data } = await axios.post<SpotifyTokenResponse>(
      SPOTIFY_AUTH_URL,
      body.toString(),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Basic ${basic}`
        }
      }
    )

    return data
  }

  generateAuthorizationUrl(): string {
    const scopes = [
      'user-read-email',
      'user-read-private',
      'playlist-read-private',
      'playlist-modify-private',
      'playlist-modify-public',
      'user-top-read'
    ]

    const params = new URLSearchParams({
      response_type: 'code',
      client_id: CLIENT_ID,
      scope: scopes.join(' '),
      redirect_uri: REDIRECT_URI
    })

    return `https://accounts.spotify.com/authorize?${params.toString()}`
  }
}

export const authService = new AuthService()

