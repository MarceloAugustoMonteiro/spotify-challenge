import axios from 'axios'

const SPOTIFY_API_BASE_URL = 'https://api.spotify.com/v1'

export class SpotifyService {
  async getUserProfile(accessToken: string) {
    const { data } = await axios.get(`${SPOTIFY_API_BASE_URL}/me`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    })
    return data
  }

  async getTopArtists(
    accessToken: string,
    params: {
      limit?: number
      offset?: number
      timeRange?: string
    } = {}
  ) {
    const { limit = 20, offset = 0, timeRange = 'short_term' } = params
    
    const { data } = await axios.get(
      `${SPOTIFY_API_BASE_URL}/me/top/artists?limit=${limit}&offset=${offset}&time_range=${timeRange}`,
      {
        headers: { Authorization: `Bearer ${accessToken}` }
      }
    )
    return data
  }

  async getArtist(accessToken: string, artistId: string) {
    const { data } = await axios.get(
      `${SPOTIFY_API_BASE_URL}/artists/${artistId}`,
      {
        headers: { Authorization: `Bearer ${accessToken}` }
      }
    )
    return data
  }

  async getArtistAlbums(
    accessToken: string,
    artistId: string,
    params: {
      limit?: number
      offset?: number
      includeGroups?: string
    } = {}
  ) {
    const { limit = 20, offset = 0, includeGroups = 'album,single' } = params
    
    const { data } = await axios.get(
      `${SPOTIFY_API_BASE_URL}/artists/${artistId}/albums?limit=${limit}&offset=${offset}&include_groups=${includeGroups}`,
      {
        headers: { Authorization: `Bearer ${accessToken}` }
      }
    )
    return data
  }

  async getUserPlaylists(
    accessToken: string,
    params: {
      limit?: number
      offset?: number
    } = {}
  ) {
    const { limit = 20, offset = 0 } = params
    
    const { data } = await axios.get(
      `${SPOTIFY_API_BASE_URL}/me/playlists?limit=${limit}&offset=${offset}`,
      {
        headers: { Authorization: `Bearer ${accessToken}` }
      }
    )
    return data
  }

  async createPlaylist(
    accessToken: string,
    userId: string,
    playlistData: {
      name: string
      description?: string
      public?: boolean
    }
  ) {
    const { data } = await axios.post(
      `${SPOTIFY_API_BASE_URL}/users/${userId}/playlists`,
      {
        name: playlistData.name,
        description: playlistData.description,
        public: Boolean(playlistData.public)
      },
      {
        headers: { Authorization: `Bearer ${accessToken}` }
      }
    )
    return data
  }
}

export const spotifyService = new SpotifyService()

