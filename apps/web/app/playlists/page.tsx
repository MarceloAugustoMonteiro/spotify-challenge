'use client'
import React, { useEffect, useState, useCallback } from 'react'
import { useRequireAuth } from '../../hooks/useRequireAuth'
import Modal from '../../components/Modal'
import { useModal } from '../../hooks/useModal'
import styles from './page.module.css'

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
  const { isAuthenticated, loading: authLoading } = useRequireAuth()
  const [playlists, setPlaylists] = useState<Playlist[]>([])
  const [offset, setOffset] = useState(0)
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newPlaylistName, setNewPlaylistName] = useState('')
  const { modalState, showSuccess, showError, closeModal } = useModal()
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
          setPlaylists(p => {
            const existingIds = new Set(p.map(pl => pl.id))
            const newItems = data.items.filter((item: Playlist) => !existingIds.has(item.id))
            return [...p, ...newItems]
          })
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
          isPublic: true
        })
      })

      if (res.ok) {
        const newPlaylist = await res.json()
        setPlaylists(prevPlaylists => {
          const exists = prevPlaylists.some(p => p.id === newPlaylist.id)
          if (exists) return prevPlaylists
          return [newPlaylist, ...prevPlaylists]
        })
        setNewPlaylistName('')
        setShowCreateModal(false)
        showSuccess('Sucesso!', 'Playlist criada.')
      } else {
        showError('Erro', 'Não foi possível criar a playlist. Tente novamente.')
      }
    } catch (error) {
      showError('Erro', 'Ocorreu um erro ao criar a playlist. Verifique sua conexão.')
    }
  }

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
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>Minhas Playlists</h1>
          <p className={styles.subtitle}>Sua coleção pessoal de playlists</p>
        </div>
        <button 
          onClick={() => setShowCreateModal(true)}
          className={styles.createButton}
        >
          Criar playlist
        </button>
      </header>

      <div className={styles.playlistsList}>
        {playlists.map((playlist) => (
          <div 
            key={playlist.id}
            className={styles.playlistCard}
            onClick={() => {
              if (playlist.external_urls?.spotify) {
                window.open(playlist.external_urls.spotify, '_blank')
              }
            }}
          >
            {playlist.images?.[0] ? (
              <img 
                src={playlist.images[0].url} 
                alt={playlist.name}
                width={64} 
                height={64} 
                className={styles.playlistImage}
              />
            ) : (
              <div className={styles.playlistPlaceholder}>🎵</div>
            )}
            <div className={styles.playlistInfo}>
              <h3 className={styles.playlistName}>{playlist.name}</h3>
              <p className={styles.playlistOwner}>
                {playlist.owner?.display_name}
              </p>
            </div>
          </div>
        ))}
      </div>

      {playlists.length === 0 && !loading && (
        <p className={styles.emptyState}>
          Nenhuma playlist encontrada. Crie sua primeira playlist!
        </p>
      )}

      {hasMore && playlists.length > 0 && (
        <div className={styles.loadMoreWrapper}>
          <button 
            onClick={load} 
            disabled={loading}
            className={styles.loadMoreButton}
          >
            {loading ? 'Carregando...' : 'Carregar mais'}
          </button>
        </div>
      )}

      {showCreateModal && (
        <div 
          className={styles.modalOverlay}
          onClick={() => setShowCreateModal(false)}
        >
          <div 
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowCreateModal(false)}
              className={styles.modalClose}
            >
              ×
            </button>

            <h2 className={styles.modalTitle}>
              Dê um nome a sua playlist
            </h2>

            <form onSubmit={createPlaylist} className={styles.modalForm}>
              <input
                type="text"
                value={newPlaylistName}
                onChange={(e) => setNewPlaylistName(e.target.value)}
                placeholder="Minha playlist #1"
                required
                autoFocus
                className={styles.modalInput}
              />
              
              <button type="submit" className={styles.modalSubmitButton}>
                Criar
              </button>
            </form>
          </div>
        </div>
      )}

      <Modal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        title={modalState.title}
        message={modalState.message}
        type={modalState.type}
      />
    </div>
  )
}
