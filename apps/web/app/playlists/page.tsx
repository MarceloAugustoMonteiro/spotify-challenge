'use client'
import React, { useEffect, useState, useCallback } from 'react'

const API = process.env.NEXT_PUBLIC_API_BASE_URL!

interface PlaylistImage {
  url: string
  height: number
  width: number
}

interface Playlist {
  id: string
  name: string
  description?: string
  images?: PlaylistImage[]
  tracks?: { total: number }
  public?: boolean
  owner?: { display_name: string }
  external_urls?: { spotify: string }
}

export default function PlaylistsPage() {
  const [playlists, setPlaylists] = useState<Playlist[]>([])
  const [offset, setOffset] = useState(0)
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newPlaylistName, setNewPlaylistName] = useState('')
  const [newPlaylistDescription, setNewPlaylistDescription] = useState('')
  const [isPublic, setIsPublic] = useState(true)
  const limit = 20

  const load = useCallback(async () => {
    if (loading || !hasMore) return
    
    setLoading(true)
    try {
      const res = await fetch(
        `${API}/api/playlists?limit=${limit}&offset=${offset}`, 
        { credentials: 'include' }
      )
      if (res.ok) {
        const data = await res.json()
        
        if (data.items && data.items.length > 0) {
          setPlaylists(p => [...p, ...data.items])
          setOffset(p => p + data.items.length)
        }
        
        setHasMore(data.next !== null && data.items.length > 0)
      }
    } catch (error) {
      console.error('Erro ao carregar playlists:', error)
    } finally {
      setLoading(false)
    }
  }, [offset, loading, hasMore])

  useEffect(() => {
    if (offset === 0) {
      load()
    }
  }, [])

  const createPlaylist = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newPlaylistName.trim()) return

    try {
      const res = await fetch(`${API}/api/playlists`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: newPlaylistName,
          description: newPlaylistDescription,
          isPublic
        })
      })

      if (res.ok) {
        const newPlaylist = await res.json()
        setPlaylists([newPlaylist, ...playlists])
        setNewPlaylistName('')
        setNewPlaylistDescription('')
        setShowCreateForm(false)
        alert('Playlist criada com sucesso!')
      } else {
        alert('Erro ao criar playlist')
      }
    } catch (error) {
      alert('Erro ao criar playlist')
    }
  }

  return (
    <main style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1>Minhas Playlists</h1>
        <button onClick={() => setShowCreateForm(!showCreateForm)}>
          {showCreateForm ? 'Cancelar' : '+ Nova Playlist'}
        </button>
      </div>

      {showCreateForm && (
        <div style={{ 
          backgroundColor: '#f5f5f5', 
          padding: 20, 
          borderRadius: 8, 
          marginBottom: 24 
        }}>
          <h3>Criar Nova Playlist</h3>
          <form onSubmit={createPlaylist}>
            <div style={{ marginBottom: 12 }}>
              <label>
                <strong>Nome:</strong>
                <input
                  type="text"
                  value={newPlaylistName}
                  onChange={(e) => setNewPlaylistName(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: 8,
                    marginTop: 4,
                    borderRadius: 4,
                    border: '1px solid #ccc'
                  }}
                />
              </label>
            </div>
            <div style={{ marginBottom: 12 }}>
              <label>
                <strong>Descrição (opcional):</strong>
                <textarea
                  value={newPlaylistDescription}
                  onChange={(e) => setNewPlaylistDescription(e.target.value)}
                  rows={3}
                  style={{
                    width: '100%',
                    padding: 8,
                    marginTop: 4,
                    borderRadius: 4,
                    border: '1px solid #ccc'
                  }}
                />
              </label>
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input
                  type="checkbox"
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                />
                <span>Playlist pública</span>
              </label>
            </div>
            <button type="submit" style={{ marginRight: 8 }}>
              Criar Playlist
            </button>
          </form>
        </div>
      )}

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', 
        gap: 20 
      }}>
        {playlists.map((playlist) => (
          <div 
            key={playlist.id} 
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
            {playlist.images?.[0] ? (
              <img 
                src={playlist.images[0].url} 
                alt={playlist.name}
                width={200} 
                height={200} 
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
                height: 200, 
                backgroundColor: '#333',
                borderRadius: 6,
                marginBottom: 8,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff'
              }}>
                🎵
              </div>
            )}
            <h3 style={{ margin: '8px 0', fontSize: 16 }}>{playlist.name}</h3>
            <p style={{ fontSize: 12, color: '#666', margin: '4px 0' }}>
              {playlist.tracks?.total || 0} músicas
            </p>
            {playlist.owner && (
              <p style={{ fontSize: 12, color: '#999', margin: '4px 0' }}>
                Por {playlist.owner.display_name}
              </p>
            )}
            {playlist.external_urls?.spotify && (
              <a 
                href={playlist.external_urls.spotify}
                target="_blank"
                rel="noopener noreferrer"
                style={{ fontSize: 12, color: '#1db954' }}
              >
                Abrir no Spotify →
              </a>
            )}
          </div>
        ))}
      </div>

      {playlists.length === 0 && !loading && (
        <p style={{ textAlign: 'center', marginTop: 24, color: '#666' }}>
          Nenhuma playlist encontrada. Crie sua primeira playlist!
        </p>
      )}

      {hasMore && playlists.length > 0 && (
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
            {loading ? 'Carregando...' : 'Carregar mais'}
          </button>
        </div>
      )}

      {!hasMore && playlists.length > 0 && (
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

