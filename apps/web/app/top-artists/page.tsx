'use client'
import React, { useEffect, useState, useCallback } from 'react'
import styles from './page.module.css'

const API = process.env.NEXT_PUBLIC_API_BASE_URL!

interface SpotifyImage {
  url: string
  height: number
  width: number
}

interface SpotifyArtist {
  id: string
  name: string
  images?: SpotifyImage[]
}

export default function TopArtists() {
  const [items, setItems] = useState<SpotifyArtist[]>([])
  const [offset, setOffset] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const [loading, setLoading] = useState(false)
  const limit = 20

  const load = useCallback(async () => {
    if (loading || !hasMore) return
    
    setLoading(true)
    try {
      const res = await fetch(`${API}/api/top-artists?limit=${limit}&offset=${offset}`, { credentials: 'include' })
      if (res.ok) {
        const data = await res.json()
        
        if (data.items && data.items.length > 0) {
          setItems(p => [...p, ...data.items])
          setOffset(p => p + data.items.length)
        }
        
        if (!data.next || data.items.length === 0) {
          setHasMore(false)
        }
      }
    } finally {
      setLoading(false)
    }
  }, [offset, loading, hasMore])

  useEffect(() => {
    if (offset === 0) {
      load()
    }
  }, [])

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Top Artistas</h1>
        <p className={styles.subtitle}>
          Aqui você encontra seus artistas preferidos
        </p>
      </header>

      <div className={styles.artistsList}>
        {items.map((artist) => (
          <div 
            key={artist.id}
            onClick={() => window.location.href = `/artists/${artist.id}`}
            className={styles.artistCard}
          >
            <img 
              src={artist.images?.[0]?.url || 'https://via.placeholder.com/64'} 
              alt={artist.name}
              width={64} 
              height={64} 
              className={styles.artistImage}
            />
            <h3 className={styles.artistName}>{artist.name}</h3>
          </div>
        ))}
      </div>
      
      {items.length === 0 && !loading && (
        <p className={styles.emptyState}>
          Nenhum artista encontrado. Ouça mais músicas no Spotify para ver seus artistas favoritos aqui!
        </p>
      )}
      
      {hasMore && items.length > 0 && (
        <div className={styles.loadMoreWrapper}>
          <button 
            onClick={load} 
            disabled={loading}
            className={styles.loadMoreButton}
          >
            {loading ? 'Carregando...' : 'Carregar mais artistas'}
          </button>
        </div>
      )}
      
      {!hasMore && items.length > 0 && (
        <p className={styles.endMessage}>
          Você chegou ao final da lista!
        </p>
      )}
    </div>
  )
}
