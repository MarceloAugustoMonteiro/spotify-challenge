'use client'
import React, { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { use } from 'react'
import { useRequireAuth } from '../../../hooks/useRequireAuth'
import styles from './page.module.css'
import { formatDate } from '../../../utils/formatDate'

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
  const router = useRouter()
  const resolvedParams = use(params)
  const { isAuthenticated, loading: authLoading } = useRequireAuth()
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
          setAlbums(p => {
            const existingIds = new Set(p.map(album => album.id))
            const newItems = data.items.filter((item: Album) => !existingIds.has(item.id))
            return [...p, ...newItems]
          })
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

  if (authLoading) {
    return (
      <div className={styles.container}>
        <p className={styles.emptyState}>Carregando...</p>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className={styles.container}>
      {artist && (
        <header className={styles.header}>
          <button
            onClick={() => router.back()}
            className={styles.backButton}
          >
            ←
          </button>
          
          {artist.images?.[0] && (
            <img 
              src={artist.images[0].url} 
              alt={artist.name}
              width={120} 
              height={120} 
              className={styles.artistImage}
            />
          )}
          
          <div className={styles.artistInfo}>
            <h1 className={styles.artistName}>{artist.name}</h1>
            {artist.followers && (
              <p className={styles.artistFollowers}>
                {artist.followers.total.toLocaleString('pt-BR')} seguidores
              </p>
            )}
          </div>
        </header>
      )}

      <div className={styles.albumsList}>
        {albums.map((album) => (
          <div 
            key={album.id}
            onClick={() => {
              if (album.external_urls?.spotify) {
                window.open(album.external_urls.spotify, '_blank')
              }
            }}
            className={styles.albumCard}
          >
            {album.images?.[0] ? (
              <img 
                src={album.images[0].url} 
                alt={album.name}
                width={64} 
                height={64} 
                className={styles.albumImage}
              />
            ) : (
              <div className={styles.albumPlaceholder}>💿</div>
            )}
            <div className={styles.albumInfo}>
              <h3 className={styles.albumName}>{album.name}</h3>
              <p className={styles.albumYear}>
                {formatDate(album.release_date)}
              </p>
            </div>
          </div>
        ))}
      </div>

      {albums.length === 0 && !loading && (
        <p className={styles.emptyState}>
          Nenhum álbum encontrado para este artista.
        </p>
      )}

      {hasMore && albums.length > 0 && (
        <div className={styles.loadMoreWrapper}>
          <button 
            onClick={load} 
            disabled={loading}
            className={styles.loadMoreButton}
          >
            {loading ? 'Carregando...' : 'Carregar mais álbuns'}
          </button>
        </div>
      )}
    </div>
  )
}
