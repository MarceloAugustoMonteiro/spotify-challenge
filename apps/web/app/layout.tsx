import React from 'react'
import './globals.css'
import styles from './layout.module.css'
import { ReactQueryProvider } from '../providers/react-query'
import Sidebar from '../components/Sidebar'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <ReactQueryProvider>
          <div className={styles.layoutWrapper}>
            <Sidebar />
            <main className={styles.mainContent}>
              {children}
            </main>
          </div>
        </ReactQueryProvider>
      </body>
    </html>
  )
}
