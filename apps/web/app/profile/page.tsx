'use client'
import React, { useEffect, useState } from 'react'
import styles from './page.module.css'

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

  const handleLogout = () => {
    window.location.href = '/'
  }

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <p>Carregando...</p>
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className={styles.errorContainer}>
        <p className={styles.errorMessage}>
          {error || 'Erro ao carregar perfil'}
        </p>
        <a href="/" className={styles.errorLink}>Voltar para home</a>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      {profile.images?.[0] && (
        <img 
          src={profile.images[0].url} 
          alt={profile.display_name}
          width={160} 
          height={160} 
          className={styles.profileImage}
        />
      )}
      
      <h1 className={styles.profileName}>
        {profile.display_name}
      </h1>

      <button
        onClick={handleLogout}
        className={styles.logoutButton}
      >
        Sair
      </button>
    </div>
  )
}
