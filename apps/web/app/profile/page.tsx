'use client'
import React, { useEffect, useState } from 'react'

const API = process.env.NEXT_PUBLIC_API_BASE_URL!

interface UserProfile {
  id: string
  display_name: string
  email: string
  images?: { url: string }[]
  followers?: { total: number }
  country?: string
  product?: string
  external_urls?: { spotify: string }
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await fetch(`${API}/api/me`, { credentials: 'include' })
        if (res.ok) {
          const data = await res.json()
          setProfile(data)
        } else {
          setError('Erro ao carregar perfil')
        }
      } catch (err) {
        setError('Erro ao carregar perfil')
      } finally {
        setLoading(false)
      }
    }
    loadProfile()
  }, [])

  if (loading) {
    return (
      <main style={{ padding: 24 }}>
        <h1>Meu Perfil</h1>
        <p>Carregando...</p>
      </main>
    )
  }

  if (error || !profile) {
    return (
      <main style={{ padding: 24 }}>
        <h1>Meu Perfil</h1>
        <p style={{ color: 'red' }}>{error || 'Erro ao carregar perfil'}</p>
        <a href="/">Voltar para home</a>
      </main>
    )
  }

  return (
    <main style={{ padding: 24 }}>
      <h1>Meu Perfil do Spotify</h1>
      
      <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start', marginTop: 24 }}>
        {profile.images?.[0] && (
          <img 
            src={profile.images[0].url} 
            alt={profile.display_name}
            width={200} 
            height={200} 
            style={{ borderRadius: 100 }} 
          />
        )}
        
        <div style={{ flex: 1 }}>
          <h2>{profile.display_name}</h2>
          <p><strong>Email:</strong> {profile.email}</p>
          {profile.followers && (
            <p><strong>Seguidores:</strong> {profile.followers.total.toLocaleString('pt-BR')}</p>
          )}
          {profile.country && (
            <p><strong>País:</strong> {profile.country}</p>
          )}
          {profile.product && (
            <p><strong>Plano:</strong> {profile.product === 'premium' ? 'Premium' : 'Free'}</p>
          )}
          {profile.external_urls?.spotify && (
            <p>
              <a 
                href={profile.external_urls.spotify} 
                target="_blank" 
                rel="noopener noreferrer"
                style={{ color: '#1db954' }}
              >
                Ver no Spotify
              </a>
            </p>
          )}
        </div>
      </div>

      <div style={{ marginTop: 32 }}>
        <a href="/">← Voltar para home</a>
      </div>
    </main>
  )
}

