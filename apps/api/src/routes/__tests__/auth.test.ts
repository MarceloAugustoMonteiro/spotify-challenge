import { describe, it, expect, vi, beforeEach } from 'vitest'
import express from 'express'
import request from 'supertest'
import cookieParser from 'cookie-parser'
import axios from 'axios'

vi.mock('axios')

import { authRouter } from '../auth'

const SPOTIFY_AUTH_URL = 'https://accounts.spotify.com/authorize'
const TEST_CLIENT_ID = 'test_client_id'
const TEST_CODE = 'test_authorization_code'
const FRONTEND_URL = 'http://127.0.0.1:3000'
const COOKIE_NAME = 'sp_session'

const createMockSpotifyTokenResponse = () => ({
  access_token: 'mock_access_token',
  refresh_token: 'mock_refresh_token',
  expires_in: 3600
})

const createTestApp = () => {
  const app = express()
  app.use(express.json())
  app.use(cookieParser())
  app.use('/auth', authRouter)
  return app
}

describe('Auth Routes', () => {
  let app: express.Application

  beforeEach(() => {
    app = createTestApp()
    vi.clearAllMocks()
  })

  describe('GET /auth/login', () => {
    it('should redirect to Spotify authorization page', async () => {
      const response = await request(app).get('/auth/login')

      expect(response.status).toBe(302)
      expect(response.headers.location).toContain(SPOTIFY_AUTH_URL)
      expect(response.headers.location).toContain(`client_id=${TEST_CLIENT_ID}`)
      expect(response.headers.location).toContain('response_type=code')
      expect(response.headers.location).toContain('user-top-read')
    })

    it('should include all required scopes', async () => {
      const response = await request(app).get('/auth/login')

      const location = response.headers.location as string
      const requiredScopes = [
        'user-read-email',
        'user-read-private',
        'playlist-read-private',
        'playlist-modify-private',
        'playlist-modify-public',
        'user-top-read'
      ]

      requiredScopes.forEach(scope => {
        expect(location).toContain(scope)
      })
    })
  })

  describe('GET /auth/callback', () => {
    it('should return 400 error when code is missing', async () => {
      const response = await request(app).get('/auth/callback')

      expect(response.status).toBe(400)
      expect(response.body).toEqual({ error: 'missing_code' })
    })

    it('should process callback with valid code', async () => {
      vi.mocked(axios.post).mockResolvedValueOnce({
        data: createMockSpotifyTokenResponse()
      } as any)

      const response = await request(app)
        .get('/auth/callback')
        .query({ code: TEST_CODE })

      expect(response.status).toBe(302)
      expect(response.headers.location).toBe(FRONTEND_URL)
      expect(response.headers['set-cookie']).toBeDefined()
      
      const cookieHeader = Array.isArray(response.headers['set-cookie']) 
        ? response.headers['set-cookie'] 
        : [response.headers['set-cookie'] as string]
      expect(cookieHeader[0]).toContain(`${COOKIE_NAME}=`)
      expect(cookieHeader[0]).toContain('HttpOnly')
    })

    it('should handle Spotify API errors during token exchange', async () => {
      vi.mocked(axios.post).mockRejectedValueOnce(new Error('Spotify API Error'))

      const response = await request(app)
        .get('/auth/callback')
        .query({ code: TEST_CODE })

      expect(response.status).toBe(500)
    })

    it('should handle invalid authorization code', async () => {
      vi.mocked(axios.post).mockRejectedValueOnce({
        response: {
          status: 400,
          data: { error: 'invalid_grant' }
        }
      })

      const response = await request(app)
        .get('/auth/callback')
        .query({ code: 'invalid_code' })

      expect(response.status).toBe(500)
    })
  })

  describe('POST /auth/logout', () => {
    it('should clear cookie and return success', async () => {
      const response = await request(app)
        .post('/auth/logout')
        .set('Cookie', [`${COOKIE_NAME}=test_token`])

      expect(response.status).toBe(200)
      expect(response.body).toEqual({
        ok: true,
        message: 'Logged out successfully'
      })
      
      const cookieHeader = Array.isArray(response.headers['set-cookie']) 
        ? response.headers['set-cookie'] 
        : [response.headers['set-cookie'] as string]
      expect(cookieHeader[0]).toContain(`${COOKIE_NAME}=`)
      expect(cookieHeader[0]).toContain('HttpOnly')
    })

    it('should work even without cookie present', async () => {
      const response = await request(app).post('/auth/logout')

      expect(response.status).toBe(200)
      expect(response.body.ok).toBe(true)
    })
  })

  describe('POST /auth/refresh', () => {
    it('should return 401 when cookie is missing', async () => {
      const response = await request(app).post('/auth/refresh')

      expect(response.status).toBe(401)
      expect(response.body).toEqual({ error: 'no_session' })
    })

    it('should return 401 when JWT token is invalid', async () => {
      const response = await request(app)
        .post('/auth/refresh')
        .set('Cookie', [`${COOKIE_NAME}=invalid_token`])

      expect(response.status).toBe(401)
      expect(response.body).toEqual({ error: 'refresh_failed' })
    })

    it('should return 401 when JWT token is malformed', async () => {
      const response = await request(app)
        .post('/auth/refresh')
        .set('Cookie', [`${COOKIE_NAME}=not.a.valid.jwt`])

      expect(response.status).toBe(401)
      expect(response.body).toEqual({ error: 'refresh_failed' })
    })
  })
})
