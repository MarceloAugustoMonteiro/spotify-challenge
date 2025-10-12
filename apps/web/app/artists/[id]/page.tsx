'use client'
import React, { useEffect, useState, useCallback } from 'react'
import { use } from 'react'

const API = process.env.NEXT_PUBLIC_API_BASE_URL!

interface AlbumImage {
  url: string
  height: number
  width: number
}

interface Album {
  id: string
  name: string
  release_date: string
  images?: AlbumImage[]
  total_tracks: number
  album_type: string
  external_urls?: { spotify: string }
}

interface Artist {
  id: string
  name: string
  images?: AlbumImage[]
  followers?: { total: number }
  genres?: string[]
}

export default function ArtistAlbumsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const [artist, setArtist] = useState<Artist | null>(null)
  const [albums, setAlbums] = useState<Album[]>([])
  const [offset, setOffset] = useState(0)
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const limit = 20

  useEffect(() => {
    async function loadArtist() {
      try {
        const res = await fetch(`${API}/api/artists/${resolvedParams.id}`, { credentials: 'include' })
        if (res.ok) {
          const data = await res.json()
          setArtist(data)
        }
      } catch (error) {
        console.error('Erro ao carregar artista:', error)
      }
    }
    loadArtist()
  }, [resolvedParams.id])

  const load = useCallback(async () => {
    if (loading || !hasMore) return
    
    setLoading(true)
    try {
      const res = await fetch(
        `${API}/api/artists/${resolvedParams.id}/albums?limit=${limit}&offset=${offset}`,
        { credentials: 'include' }
      )
      if (res.ok) {
        const data = await res.json()
        
        if (data.items && data.items.length > 0) {
          setAlbums(p => [...p, ...data.items])
          setOffset(p => p + data.items.length)
        }
        
        setHasMore(data.next !== null && data.items.length > 0)
      }
    } catch (error) {
      console.error('Erro ao carregar álbuns:', error)
    } finally {
      setLoading(false)
    }
  }, [resolvedParams.id, offset, loading, hasMore])

  useEffect(() => {
    if (offset === 0) {
      load()
    }
  }, [])

  return (
    <main style={{ padding: 24 }}>
      {artist && (
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', gap: 24, alignItems: 'center', marginBottom: 24 }}>
            {artist.images?.[0] && (
              <img 
                src={artist.images[0].url} 
                alt={artist.name}
                width={150} 
                height={150} 
                style={{ borderRadius: '50%' }} 
              />
            )}
            <div>
              <h1 style={{ marginBottom: 8 }}>{artist.name}</h1>
              {artist.followers && (
                <p style={{ color: '#666', marginBottom: 4 }}>
                  {artist.followers.total.toLocaleString('pt-BR')} seguidores
                </p>
              )}
              {artist.genres && artist.genres.length > 0 && (
                <p style={{ color: '#666' }}>
                  {artist.genres.slice(0, 3).join(', ')}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      <h2 style={{ marginBottom: 16 }}>Álbuns e Singles</h2>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', 
        gap: 20 
      }}>
        {albums.map((album) => (
          <div 
            key={album.id} 
            style={{ 
              border: '1px solid #ddd', 
              borderRadius: 8, 
              padding: 12,
              cursor: 'pointer',
              transition: 'transform 0.2s',
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            {album.images?.[0] ? (
              <img 
                src={album.images[0].url} 
                alt={album.name}
                width={180} 
                height={180} 
                style={{ 
                  width: '100%', 
                  height: 'auto', 
                  borderRadius: 6,
                  marginBottom: 8
                }} 
              />
            ) : (
              <div style={{ 
                width: '100%', 
                height: 180, 
                backgroundColor: '#333',
                borderRadius: 6,
                marginBottom: 8,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontSize: 48
              }}>
                💿
              </div>
            )}
            <h3 style={{ margin: '8px 0', fontSize: 14, lineHeight: 1.4 }}>
              {album.name}
            </h3>
            <p style={{ fontSize: 12, color: '#666', margin: '4px 0' }}>
              {new Date(album.release_date).getFullYear()} • {album.total_tracks} faixas
            </p>
            <p style={{ fontSize: 11, color: '#999', margin: '4px 0', textTransform: 'capitalize' }}>
              {album.album_type === 'album' ? 'Álbum' : 
               album.album_type === 'single' ? 'Single' : 
               album.album_type}
            </p>
            {album.external_urls?.spotify && (
              <a 
                href={album.external_urls.spotify}
                target="_blank"
                rel="noopener noreferrer"
                style={{ fontSize: 12, color: '#1db954', marginTop: 8, display: 'block' }}
                onClick={(e) => e.stopPropagation()}
              >
                Ouvir no Spotify →
              </a>
            )}
          </div>
        ))}
      </div>

      {albums.length === 0 && !loading && (
        <p style={{ textAlign: 'center', marginTop: 24, color: '#666' }}>
          Nenhum álbum encontrado para este artista.
        </p>
      )}

      {hasMore && albums.length > 0 && (
        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <button 
            onClick={load} 
            disabled={loading}
            style={{
              padding: '12px 24px',
              fontSize: 16,
              backgroundColor: loading ? '#ccc' : '#1db954',
              color: 'white',
              border: 'none',
              borderRadius: 24,
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.2s'
            }}
          >
            {loading ? 'Carregando...' : 'Carregar mais álbuns'}
          </button>
        </div>
      )}

      {!hasMore && albums.length > 0 && (
        <p style={{ textAlign: 'center', marginTop: 24, color: '#666' }}>
          Você chegou ao final da lista! 
        </p>
      )}

      <div style={{ marginTop: 32 }}>
        <a href="/top-artists">← Voltar para artistas</a>
      </div>
    </main>
  )
}

