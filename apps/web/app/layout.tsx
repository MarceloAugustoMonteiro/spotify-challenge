'use client'
import React from 'react'
import './globals.css'
import styles from './layout.module.css'
import { ReactQueryProvider } from '../providers/react-query'
import Sidebar from '../components/Sidebar'
import { useAuth } from '../hooks/useAuth'

function LayoutContent({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <p>Carregando...</p>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <>{children}</>
  }

  return (
    <div className={styles.layoutWrapper}>
      <Sidebar />
      <main className={styles.mainContent}>
        {children}
      </main>
    </div>
  )
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <ReactQueryProvider>
          <LayoutContent>{children}</LayoutContent>
        </ReactQueryProvider>
      </body>
    </html>
  )
}
