'use client'
import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import styles from './Sidebar.module.css'
import { HomeIcon, ArtistsIcon, PlaylistsIcon, ProfileIcon, PwaIcon } from './icons'
import Logo from './Logo'

export default function Sidebar() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  const navItems = [
    { name: 'Home', path: '/', icon: HomeIcon },
    { name: 'Artistas', path: '/top-artists', icon: ArtistsIcon },
    { name: 'Playlists', path: '/playlists', icon: PlaylistsIcon },
    { name: 'Perfil', path: '/profile', icon: ProfileIcon }
  ]

  const handleLinkClick = () => {
    setIsOpen(false)
  }

  return (
    <>
      <header className={styles.mobileHeader}>
        <button 
          className={styles.hamburger}
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Menu"
        >
          <span className={`${styles.hamburgerLine} ${isOpen ? styles.hamburgerLineOpen : ''}`}></span>
          <span className={`${styles.hamburgerLine} ${isOpen ? styles.hamburgerLineOpen : ''}`}></span>
          <span className={`${styles.hamburgerLine} ${isOpen ? styles.hamburgerLineOpen : ''}`}></span>
        </button>

        <div className={styles.mobileHeaderLogo}>
          <Logo />
        </div>
      </header>

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
            const IconComponent = item.icon
            return (
              <Link
                key={item.path}
                href={item.path}
                onClick={handleLinkClick}
                className={`${styles.navLink} ${isActive ? styles.active : ''}`}
              >
                <span className={styles.navIcon}>
                  <IconComponent color={isActive ? '#FFFFFF' : '#949EA2'} />
                </span>
                {item.name}
              </Link>
            )
          })}
        </nav>

        <div className={styles.footer}>
          <button className={styles.installButton}>
            <span className={styles.installIcon}><PwaIcon /></span>
            Instalar PWA
          </button>
        </div>
      </aside>
    </>
  )
}
