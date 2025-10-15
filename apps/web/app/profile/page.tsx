'use client'
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useRequireAuth } from '../../hooks/useRequireAuth'
import { useModal } from '../../hooks/useModal'
import Modal from '../../components/Modal'
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
  const router = useRouter()
  const { isAuthenticated, loading: authLoading } = useRequireAuth()
  const { modalState, showSuccess, showError, closeModal } = useModal()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  useEffect(() => {
    if (!isAuthenticated || authLoading) return

    async function loadProfile() {
      try {
        const res = await fetch(`${API}/api/me`, { credentials: 'include' })
        if (res.ok) {
          const data = await res.json()
          setProfile(data)
        } else {
          if (res.status !== 401) {
            setError('Erro ao carregar perfil')
          }
        }
      } catch (err) {
        setError('Erro ao carregar perfil')
      } finally {
        setLoading(false)
      }
    }
    loadProfile()
  }, [isAuthenticated, authLoading])

  const handleLogout = async () => {
    if (isLoggingOut) return
    
    setIsLoggingOut(true)

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://127.0.0.1:3001'
      const response = await fetch(`${apiUrl}/auth/logout`, {
        method: 'POST',
        credentials: 'include'
      })

      if (response.ok) {
        showSuccess('Logout realizado', 'Você foi desconectado com sucesso!')
        
        setTimeout(() => {
          window.location.href = '/'
        }, 2000)
      } else {
        showError('Erro', 'Não foi possível realizar o logout. Tente novamente.')
        setIsLoggingOut(false)
      }
    } catch (error) {
      console.error('Logout error:', error)
      showError('Erro', 'Ocorreu um erro ao tentar deslogar. Tente novamente.')
      setIsLoggingOut(false)
    }
  }

  if (authLoading || loading) {
    return (
      <div className={styles.loadingContainer}>
        <p>Carregando...</p>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  if (error || !profile) {
    return (
      <div className={styles.errorContainer}>
        <p className={styles.errorMessage}>
          {error || 'Erro ao carregar perfil'}
        </p>
        <button onClick={() => router.push('/')} className={styles.errorLink}>
          Voltar para home
        </button>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      {profile.images?.[0] && (
        <img 
          src={profile.images[0].url} 
          alt={profile.display_name}
          width={128} 
          height={128} 
          className={styles.profileImage}
        />
      )}
      
      <h1 className={styles.profileName}>
        {profile.display_name}
      </h1>

      <button
        onClick={handleLogout}
        className={styles.logoutButton}
        disabled={isLoggingOut}
      >
        {isLoggingOut ? 'Saindo...' : 'Sair'}
      </button>

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
