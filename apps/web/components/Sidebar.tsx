'use client'
import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import styles from './Sidebar.module.css'

const Logo = () => (
  <svg width="131" height="40" viewBox="0 0 131 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="20" cy="20" r="20" fill="white"/>
    <path d="M20 8C13.373 8 8 13.373 8 20s5.373 12 12 12 12-5.373 12-12S26.627 8 20 8zm5.494 17.318c-.216.356-.676.468-1.032.252-2.83-1.728-6.392-2.118-10.594-1.16-.404.092-.804-.186-.896-.588-.092-.404.184-.804.588-.896 4.598-1.048 8.514-.596 11.638 1.34.356.216.468.676.252 1.032zm1.474-3.278c-.272.448-.848.588-1.296.316-3.238-1.99-8.17-2.566-11.998-1.404-.488.148-.996-.126-1.144-.612-.148-.488.126-.996.612-1.144 4.38-1.332 9.858-.684 13.542 1.596.448.272.588.848.316 1.296zm.126-3.416c-3.882-2.306-10.286-2.518-13.994-1.392-.588.18-1.208-.15-1.388-.736-.18-.588.15-1.208.736-1.388 4.262-1.296 11.37-1.046 15.834 1.61.524.31.696 1 .386 1.524-.31.524-1 .696-1.524.386z" fill="#090707"/>
  </svg>
)

export default function Sidebar() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  const navItems = [
    { name: 'Home', path: '/', icon: '🏠' },
    { name: 'Artistas', path: '/top-artists', icon: '🎵' },
    { name: 'Playlists', path: '/playlists', icon: '▶' },
    { name: 'Perfil', path: '/profile', icon: '👤' }
  ]

  const handleLinkClick = () => {
    setIsOpen(false)
  }

  return (
    <>
      <button 
        className={styles.hamburger}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Menu"
      >
        <span className={`${styles.hamburgerLine} ${isOpen ? styles.hamburgerLineOpen : ''}`}></span>
        <span className={`${styles.hamburgerLine} ${isOpen ? styles.hamburgerLineOpen : ''}`}></span>
        <span className={`${styles.hamburgerLine} ${isOpen ? styles.hamburgerLineOpen : ''}`}></span>
      </button>

      {isOpen && (
        <div 
          className={styles.overlay}
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside className={`${styles.sidebar} ${isOpen ? styles.sidebarOpen : ''}`}>
        <div className={styles.logo}>
          <Logo />
        </div>

        <nav className={styles.nav}>
          {navItems.map((item) => {
            const isActive = pathname === item.path
            return (
              <Link
                key={item.path}
                href={item.path}
                onClick={handleLinkClick}
                className={`${styles.navLink} ${isActive ? styles.active : ''}`}
              >
                <span className={styles.navIcon}>{item.icon}</span>
                {item.name}
              </Link>
            )
          })}
        </nav>

        <div className={styles.footer}>
          <button className={styles.installButton}>
            <span className={styles.installIcon}>⬇️</span>
            Instalar PWA
          </button>
        </div>
      </aside>
    </>
  )
}
