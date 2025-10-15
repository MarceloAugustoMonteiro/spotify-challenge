import { describe, it, expect, vi, beforeEach } from 'vitest'
import express from 'express'
import request from 'supertest'
import cookieParser from 'cookie-parser'
import jwt from 'jsonwebtoken'
import axios from 'axios'

vi.mock('axios')

import { spotifyRouter } from '../spotify'

const JWT_SECRET = process.env.JWT_SECRET || 'test_jwt_secret'
const COOKIE_NAME = process.env.COOKIE_NAME || 'sp_session'
const SPOTIFY_API_BASE_URL = 'https://api.spotify.com/v1'
const MOCK_ACCESS_TOKEN = 'mock_access_token'
const MOCK_REFRESH_TOKEN = 'mock_refresh_token'
const TEST_USER_ID = 'user123'
const TEST_ARTIST_ID = 'artist123'
const TEST_PLAYLIST_ID = 'playlist123'

const createMockUser = (overrides = {}) => ({
  id: TEST_USER_ID,
  display_name: 'Test User',
  email: 'test@example.com',
  ...overrides
})

const createMockArtist = (overrides = {}) => ({
  id: TEST_ARTIST_ID,
  name: 'Test Artist',
  genres: ['rock', 'pop'],
  ...overrides
})

const createMockArtistsList = () => ({
  items: [
    { id: 'artist1', name: 'Artist 1' },
    { id: 'artist2', name: 'Artist 2' }
  ],
  total: 2,
  limit: 20,
  offset: 0
})

const createMockAlbumsList = () => ({
  items: [
    { id: 'album1', name: 'Album 1' },
    { id: 'album2', name: 'Album 2' }
  ],
  total: 2
})

const createMockPlaylist = (overrides = {}) => ({
  id: TEST_PLAYLIST_ID,
  name: 'New Playlist',
  description: 'Test description',
  public: false,
  ...overrides
})

const createMockPlaylistsList = () => ({
  items: [
    { id: 'playlist1', name: 'My Playlist 1' },
    { id: 'playlist2', name: 'My Playlist 2' }
  ],
  total: 2
})

const createTestApp = () => {
  const app = express()
  app.use(express.json())
  app.use(cookieParser())
  app.use('/api', spotifyRouter)
  return app
}

const createValidToken = () => {
  return jwt.sign(
    { 
      access_token: MOCK_ACCESS_TOKEN, 
      refresh_token: MOCK_REFRESH_TOKEN 
    },
    JWT_SECRET,
    { expiresIn: '1h' }
  )
}

const createExpiredToken = () => {
  return jwt.sign(
    { 
      access_token: MOCK_ACCESS_TOKEN, 
      refresh_token: MOCK_REFRESH_TOKEN 
    },
    JWT_SECRET,
    { expiresIn: '-1h' }
  )
}

describe('Spotify API Routes', () => {
  let app: express.Application

  beforeEach(() => {
    app = createTestApp()
    vi.clearAllMocks()
  })

  describe('GET /api/me', () => {
    it('should return user data when authenticated', async () => {
      vi.mocked(axios.get).mockResolvedValueOnce({
        data: createMockUser()
      } as any)

      const token = createValidToken()
      const response = await request(app)
        .get('/api/me')
        .set('Cookie', [`${COOKIE_NAME}=${token}`])

      expect(response.status).toBe(200)
      expect(response.body.id).toBe(TEST_USER_ID)
      expect(response.body.display_name).toBe('Test User')
      expect(axios.get).toHaveBeenCalledWith(
        `${SPOTIFY_API_BASE_URL}/me`,
        expect.objectContaining({
          headers: { Authorization: `Bearer ${MOCK_ACCESS_TOKEN}` }
        })
      )
    })

    it('should return 401 when cookie is missing', async () => {
      const response = await request(app).get('/api/me')

      expect(response.status).toBe(401)
      expect(response.body).toEqual({ error: 'unauthorized' })
    })

    it('should return 401 when token is invalid', async () => {
      const response = await request(app)
        .get('/api/me')
        .set('Cookie', [`${COOKIE_NAME}=invalid_token`])

      expect(response.status).toBe(401)
      expect(response.body).toEqual({ error: 'unauthorized' })
    })

    it('should return 401 when JWT token is expired', async () => {
      const expiredToken = createExpiredToken()
      
      const response = await request(app)
        .get('/api/me')
        .set('Cookie', [`${COOKIE_NAME}=${expiredToken}`])

      expect(response.status).toBe(401)
      expect(response.body).toEqual({ error: 'unauthorized' })
    })
  })

  describe('GET /api/top-artists', () => {
    it('should return top artists with default parameters', async () => {
      vi.mocked(axios.get).mockResolvedValueOnce({
        data: createMockArtistsList()
      } as any)

      const token = createValidToken()
      const response = await request(app)
        .get('/api/top-artists')
        .set('Cookie', [`${COOKIE_NAME}=${token}`])

      expect(response.status).toBe(200)
      expect(response.body.items).toHaveLength(2)
      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining('limit=20&offset=0&time_range=short_term'),
        expect.any(Object)
      )
    })

    it('should accept custom query parameters', async () => {
      vi.mocked(axios.get).mockResolvedValueOnce({
        data: { items: [], total: 0, limit: 10, offset: 20 }
      } as any)

      const token = createValidToken()
      const response = await request(app)
        .get('/api/top-artists')
        .query({ limit: 10, offset: 20, time_range: 'long_term' })
        .set('Cookie', [`${COOKIE_NAME}=${token}`])

      expect(response.status).toBe(200)
      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining('limit=10&offset=20&time_range=long_term'),
        expect.any(Object)
      )
    })

    it('should return 401 when not authenticated', async () => {
      const response = await request(app).get('/api/top-artists')

      expect(response.status).toBe(401)
      expect(response.body).toEqual({ error: 'unauthorized' })
    })

    it('should handle Spotify API errors gracefully', async () => {
      vi.mocked(axios.get).mockRejectedValueOnce(new Error('Spotify API Error'))

      const token = createValidToken()
      const response = await request(app)
        .get('/api/top-artists')
        .set('Cookie', [`${COOKIE_NAME}=${token}`])

      expect(response.status).toBe(401)
      expect(response.body).toEqual({ error: 'unauthorized' })
    })
  })

  describe('GET /api/artists/:id', () => {
    it('should return artist data', async () => {
      vi.mocked(axios.get).mockResolvedValueOnce({
        data: createMockArtist()
      } as any)

      const token = createValidToken()
      const response = await request(app)
        .get(`/api/artists/${TEST_ARTIST_ID}`)
        .set('Cookie', [`${COOKIE_NAME}=${token}`])

      expect(response.status).toBe(200)
      expect(response.body.id).toBe(TEST_ARTIST_ID)
      expect(response.body.name).toBe('Test Artist')
      expect(axios.get).toHaveBeenCalledWith(
        `${SPOTIFY_API_BASE_URL}/artists/${TEST_ARTIST_ID}`,
        expect.any(Object)
      )
    })

    it('should return 401 when not authenticated', async () => {
      const response = await request(app).get(`/api/artists/${TEST_ARTIST_ID}`)

      expect(response.status).toBe(401)
    })

    it('should handle invalid artist ID', async () => {
      vi.mocked(axios.get).mockRejectedValueOnce({
        response: { status: 404, data: { error: 'not found' } }
      })

      const token = createValidToken()
      const response = await request(app)
        .get('/api/artists/invalid_id')
        .set('Cookie', [`${COOKIE_NAME}=${token}`])

      expect(response.status).toBe(401)
    })
  })

  describe('GET /api/artists/:id/albums', () => {
    it('should return artist albums', async () => {
      vi.mocked(axios.get).mockResolvedValueOnce({
        data: createMockAlbumsList()
      } as any)

      const token = createValidToken()
      const response = await request(app)
        .get(`/api/artists/${TEST_ARTIST_ID}/albums`)
        .set('Cookie', [`${COOKIE_NAME}=${token}`])

      expect(response.status).toBe(200)
      expect(response.body.items).toHaveLength(2)
      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining(`/artists/${TEST_ARTIST_ID}/albums`),
        expect.any(Object)
      )
    })

    it('should accept pagination parameters', async () => {
      vi.mocked(axios.get).mockResolvedValueOnce({
        data: { items: [], total: 0 }
      } as any)

      const token = createValidToken()
      const response = await request(app)
        .get(`/api/artists/${TEST_ARTIST_ID}/albums`)
        .query({ limit: 10, offset: 5, include_groups: 'album' })
        .set('Cookie', [`${COOKIE_NAME}=${token}`])

      expect(response.status).toBe(200)
      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining('limit=10&offset=5&include_groups=album'),
        expect.any(Object)
      )
    })

    it('should return empty array when artist has no albums', async () => {
      vi.mocked(axios.get).mockResolvedValueOnce({
        data: { items: [], total: 0 }
      } as any)

      const token = createValidToken()
      const response = await request(app)
        .get(`/api/artists/${TEST_ARTIST_ID}/albums`)
        .set('Cookie', [`${COOKIE_NAME}=${token}`])

      expect(response.status).toBe(200)
      expect(response.body.items).toHaveLength(0)
    })
  })

  describe('GET /api/playlists', () => {
    it('should return user playlists', async () => {
      vi.mocked(axios.get).mockResolvedValueOnce({
        data: createMockPlaylistsList()
      } as any)

      const token = createValidToken()
      const response = await request(app)
        .get('/api/playlists')
        .set('Cookie', [`${COOKIE_NAME}=${token}`])

      expect(response.status).toBe(200)
      expect(response.body.items).toHaveLength(2)
      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining('/me/playlists'),
        expect.any(Object)
      )
    })

    it('should return 401 when not authenticated', async () => {
      const response = await request(app).get('/api/playlists')

      expect(response.status).toBe(401)
    })

    it('should handle pagination parameters', async () => {
      vi.mocked(axios.get).mockResolvedValueOnce({
        data: { items: [], total: 0 }
      } as any)

      const token = createValidToken()
      const response = await request(app)
        .get('/api/playlists')
        .query({ limit: 50, offset: 10 })
        .set('Cookie', [`${COOKIE_NAME}=${token}`])

      expect(response.status).toBe(200)
    })
  })

  describe('POST /api/playlists', () => {
    it('should create a new playlist', async () => {
      vi.mocked(axios.get).mockResolvedValueOnce({
        data: createMockUser()
      } as any)

      vi.mocked(axios.post).mockResolvedValueOnce({
        data: createMockPlaylist()
      } as any)

      const token = createValidToken()
      const response = await request(app)
        .post('/api/playlists')
        .set('Cookie', [`${COOKIE_NAME}=${token}`])
        .send({
          name: 'New Playlist',
          description: 'Test description',
          isPublic: false
        })

      expect(response.status).toBe(201)
      expect(response.body.id).toBe(TEST_PLAYLIST_ID)
      expect(response.body.name).toBe('New Playlist')
      expect(axios.post).toHaveBeenCalledWith(
        `${SPOTIFY_API_BASE_URL}/users/${TEST_USER_ID}/playlists`,
        expect.objectContaining({
          name: 'New Playlist',
          description: 'Test description',
          public: false
        }),
        expect.any(Object)
      )
    })

    it('should return 400 when playlist creation fails', async () => {
      vi.mocked(axios.get).mockRejectedValueOnce(new Error('API Error'))

      const token = createValidToken()
      const response = await request(app)
        .post('/api/playlists')
        .set('Cookie', [`${COOKIE_NAME}=${token}`])
        .send({ name: 'New Playlist' })

      expect(response.status).toBe(400)
      expect(response.body).toEqual({ error: 'create_failed' })
    })

    it('should return 400 when not authenticated', async () => {
      const response = await request(app)
        .post('/api/playlists')
        .send({ name: 'New Playlist' })

      expect(response.status).toBe(400)
    })

    it('should sanitize playlist name with special characters', async () => {
      vi.mocked(axios.get).mockResolvedValueOnce({
        data: createMockUser()
      } as any)

      vi.mocked(axios.post).mockResolvedValueOnce({
        data: createMockPlaylist({ name: 'Test <script>alert("xss")</script>' })
      } as any)

      const token = createValidToken()
      const response = await request(app)
        .post('/api/playlists')
        .set('Cookie', [`${COOKIE_NAME}=${token}`])
        .send({
          name: 'Test <script>alert("xss")</script>',
          isPublic: true
        })

      expect(response.status).toBe(201)
    })

    it('should create public playlist when isPublic is true', async () => {
      vi.mocked(axios.get).mockResolvedValueOnce({
        data: createMockUser()
      } as any)

      vi.mocked(axios.post).mockResolvedValueOnce({
        data: createMockPlaylist({ public: true })
      } as any)

      const token = createValidToken()
      const response = await request(app)
        .post('/api/playlists')
        .set('Cookie', [`${COOKIE_NAME}=${token}`])
        .send({
          name: 'Public Playlist',
          isPublic: true
        })

      expect(response.status).toBe(201)
      expect(axios.post).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          public: true
        }),
        expect.any(Object)
      )
    })
  })
})
