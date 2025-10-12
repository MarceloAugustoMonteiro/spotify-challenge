'use client'
import React from 'react'
import styles from './page.module.css'
import { useAuth } from '../hooks/useAuth'

const API = process.env.NEXT_PUBLIC_API_BASE_URL!

const Logo = () => (
  <svg width="131" height="40" viewBox="0 0 131 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="20" cy="20" r="20" fill="white"/>
    <path d="M20 8C13.373 8 8 13.373 8 20s5.373 12 12 12 12-5.373 12-12S26.627 8 20 8zm5.494 17.318c-.216.356-.676.468-1.032.252-2.83-1.728-6.392-2.118-10.594-1.16-.404.092-.804-.186-.896-.588-.092-.404.184-.804.588-.896 4.598-1.048 8.514-.596 11.638 1.34.356.216.468.676.252 1.032zm1.474-3.278c-.272.448-.848.588-1.296.316-3.238-1.99-8.17-2.566-11.998-1.404-.488.148-.996-.126-1.144-.612-.148-.488.126-.996.612-1.144 4.38-1.332 9.858-.684 13.542 1.596.448.272.588.848.316 1.296zm.126-3.416c-3.882-2.306-10.286-2.518-13.994-1.392-.588.18-1.208-.15-1.388-.736-.18-.588.15-1.208.736-1.388 4.262-1.296 11.37-1.046 15.834 1.61.524.31.696 1 .386 1.524-.31.524-1 .696-1.524.386z" fill="#090707"/>
    <text x="50" y="28" fill="white" fontSize="20" fontWeight="bold" fontFamily="Rubik, sans-serif">Spotify</text>
  </svg>
)

function LoginScreen() {
  function login() {
    window.location.href = `${API}/auth/login`
  }

  return (
    <div className={styles.container}>
      <div className={styles.logoWrapper}>
        <Logo />
      </div>
      
      <p className={styles.description}>
        Entra com sua conta Spotify clicando no botão abaixo
      </p>

      <button onClick={login} className={styles.loginButton}>
        Entrar
      </button>
    </div>
  )
}

function DashboardHome() {
  return <div className={styles.emptyHome}></div>
}

export default function Home() {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return (
      <div className={styles.container}>
        <p className={styles.description}>Carregando...</p>
      </div>
    )
  }

  return isAuthenticated ? <DashboardHome /> : <LoginScreen />
}
