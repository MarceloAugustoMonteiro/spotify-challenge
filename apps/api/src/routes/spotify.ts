import { Router } from 'express'
import { authService } from '../services/AuthService'
import { spotifyService } from '../services/SpotifyService'

const COOKIE_NAME = process.env.COOKIE_NAME ?? 'sp_session'

export const spotifyRouter = Router()

function getAccessTokenFromCookie(cookie?: string): string {
  if (!cookie) {
    throw new Error('no_session')
  }
  return authService.extractAccessToken(cookie)
}

spotifyRouter.get('/me', async (req, res) => {
  try {
    const accessToken = getAccessTokenFromCookie(req.cookies?.[COOKIE_NAME])
    const data = await spotifyService.getUserProfile(accessToken)
    res.json(data)
  } catch (error) {
    console.error('Get user profile error:', error)
    res.status(401).json({ error: 'unauthorized' })
  }
})

spotifyRouter.get('/top-artists', async (req, res) => {
  try {
    const accessToken = getAccessTokenFromCookie(req.cookies?.[COOKIE_NAME])
    
    const params = {
      limit: Number(req.query.limit ?? 20),
      offset: Number(req.query.offset ?? 0),
      timeRange: (req.query.time_range as string) ?? 'short_term'
    }

    const data = await spotifyService.getTopArtists(accessToken, params)
    res.json(data)
  } catch (error) {
    console.error('Get top artists error:', error)
    res.status(401).json({ error: 'unauthorized' })
  }
})

spotifyRouter.get('/artists/:id', async (req, res) => {
  try {
    const accessToken = getAccessTokenFromCookie(req.cookies?.[COOKIE_NAME])
    const { id } = req.params
    
    const data = await spotifyService.getArtist(accessToken, id)
    res.json(data)
  } catch (error) {
    console.error('Get artist error:', error)
    res.status(401).json({ error: 'unauthorized' })
  }
})

spotifyRouter.get('/artists/:id/albums', async (req, res) => {
  try {
    const accessToken = getAccessTokenFromCookie(req.cookies?.[COOKIE_NAME])
    const { id } = req.params
    
    const params = {
      limit: Number(req.query.limit ?? 20),
      offset: Number(req.query.offset ?? 0),
      includeGroups: (req.query.include_groups as string) ?? 'album,single'
    }

    const data = await spotifyService.getArtistAlbums(accessToken, id, params)
    res.json(data)
  } catch (error) {
    console.error('Get artist albums error:', error)
    res.status(401).json({ error: 'unauthorized' })
  }
})

spotifyRouter.get('/playlists', async (req, res) => {
  try {
    const accessToken = getAccessTokenFromCookie(req.cookies?.[COOKIE_NAME])
    
    const params = {
      limit: Number(req.query.limit ?? 20),
      offset: Number(req.query.offset ?? 0)
    }

    const data = await spotifyService.getUserPlaylists(accessToken, params)
    res.json(data)
  } catch (error) {
    console.error('Get playlists error:', error)
    res.status(401).json({ error: 'unauthorized' })
  }
})

spotifyRouter.post('/playlists', async (req, res) => {
  try {
    const accessToken = getAccessTokenFromCookie(req.cookies?.[COOKIE_NAME])
    
    const user = await spotifyService.getUserProfile(accessToken)
    
    const { name, description, isPublic } = req.body as {
      name: string
      description?: string
      isPublic?: boolean
    }

    const data = await spotifyService.createPlaylist(
      accessToken,
      user.id,
      {
        name,
        description,
        public: isPublic
      }
    )

    res.status(201).json(data)
  } catch (error) {
    console.error('Create playlist error:', error)
    res.status(400).json({ error: 'create_failed' })
  }
})
