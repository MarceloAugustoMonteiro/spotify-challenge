'use client'
import React, { useEffect, useState, useCallback } from 'react'

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
    <main style={{ padding: 24 }}>
      <h1>Artistas mais ouvidos</h1>
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', 
        gap: 20,
        marginTop: 24
      }}>
        {items.map((a) => (
          <div 
            key={a.id} 
            style={{ 
              border: '1px solid #ddd',
              borderRadius: 8,
              padding: 12,
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'transform 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            onClick={() => window.location.href = `/artists/${a.id}`}
          >
            <img 
              src={a.images?.[0]?.url} 
              alt={a.name}
              width={150} 
              height={150} 
              style={{ borderRadius: '50%', width: '100%', height: 'auto' }} 
            />
            <h3 style={{ marginTop: 12, fontSize: 16 }}>{a.name}</h3>
            <p style={{ fontSize: 12, color: '#1db954', marginTop: 8 }}>
              Ver álbuns →
            </p>
          </div>
        ))}
      </div>
      
      {items.length === 0 && !loading && (
        <p style={{ textAlign: 'center', marginTop: 24, color: '#666' }}>
          Nenhum artista encontrado. Ouça mais músicas no Spotify para ver seus artistas favoritos aqui!
        </p>
      )}
      
      {hasMore && items.length > 0 && (
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
            {loading ? 'Carregando...' : 'Carregar mais artistas'}
          </button>
        </div>
      )}
      
      {!hasMore && items.length > 0 && (
        <p style={{ textAlign: 'center', marginTop: 24, color: '#666' }}>
          Você chegou ao final da lista!
        </p>
      )}
      
      <div style={{ marginTop: 32 }}>
        <a href="/">← Voltar para home</a>
      </div>
    </main>
  )
}
