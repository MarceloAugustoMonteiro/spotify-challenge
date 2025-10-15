import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import Sidebar from '../Sidebar'

const mockPathname = vi.fn()
vi.mock('next/navigation', () => ({
  usePathname: () => mockPathname(),
  useRouter: vi.fn()
}))

const ROUTE_HOME = '/'
const ROUTE_TOP_ARTISTS = '/top-artists'
const ROUTE_PLAYLISTS = '/playlists'
const ROUTE_PROFILE = '/profile'

const NAV_TEXT = {
  home: 'Home',
  artists: 'Artistas',
  playlists: 'Playlists',
  profile: 'Perfil',
  pwa: 'Instalar PWA'
}

describe('Sidebar Component', () => {
  beforeEach(() => {
    mockPathname.mockReturnValue(ROUTE_HOME)
    vi.clearAllMocks()
  })

  it('should render all navigation items', () => {
    render(<Sidebar />)
    
    expect(screen.getByText(NAV_TEXT.home)).toBeInTheDocument()
    expect(screen.getByText(NAV_TEXT.artists)).toBeInTheDocument()
    expect(screen.getByText(NAV_TEXT.playlists)).toBeInTheDocument()
    expect(screen.getByText(NAV_TEXT.profile)).toBeInTheDocument()
  })

  it('should render Install PWA button', () => {
    render(<Sidebar />)
    
    expect(screen.getByText(NAV_TEXT.pwa)).toBeInTheDocument()
  })

  it('should mark Home as active when pathname is "/"', () => {
    mockPathname.mockReturnValue(ROUTE_HOME)
    
    render(<Sidebar />)
    
    const homeLink = screen.getByText(NAV_TEXT.home).closest('a')
    expect(homeLink?.className).toMatch(/active/)
  })

  it('should mark Artists as active when pathname is "/top-artists"', () => {
    mockPathname.mockReturnValue(ROUTE_TOP_ARTISTS)
    
    render(<Sidebar />)
    
    const artistsLink = screen.getByText(NAV_TEXT.artists).closest('a')
    expect(artistsLink?.className).toMatch(/active/)
  })

  it('should mark Playlists as active when pathname is "/playlists"', () => {
    mockPathname.mockReturnValue(ROUTE_PLAYLISTS)
    
    render(<Sidebar />)
    
    const playlistsLink = screen.getByText(NAV_TEXT.playlists).closest('a')
    expect(playlistsLink?.className).toMatch(/active/)
  })

  it('should mark Profile as active when pathname is "/profile"', () => {
    mockPathname.mockReturnValue(ROUTE_PROFILE)
    
    render(<Sidebar />)
    
    const profileLink = screen.getByText(NAV_TEXT.profile).closest('a')
    expect(profileLink?.className).toMatch(/active/)
  })

  it('should have correct links for each page', () => {
    render(<Sidebar />)
    
    const homeLink = screen.getByText(NAV_TEXT.home).closest('a')
    const artistsLink = screen.getByText(NAV_TEXT.artists).closest('a')
    const playlistsLink = screen.getByText(NAV_TEXT.playlists).closest('a')
    const profileLink = screen.getByText(NAV_TEXT.profile).closest('a')
    
    expect(homeLink).toHaveAttribute('href', ROUTE_HOME)
    expect(artistsLink).toHaveAttribute('href', ROUTE_TOP_ARTISTS)
    expect(playlistsLink).toHaveAttribute('href', ROUTE_PLAYLISTS)
    expect(profileLink).toHaveAttribute('href', ROUTE_PROFILE)
  })

  it('should render hamburger menu button', () => {
    render(<Sidebar />)
    
    const hamburgerButton = screen.getByLabelText('Menu')
    expect(hamburgerButton).toBeInTheDocument()
  })

  it('should open mobile menu when hamburger is clicked', () => {
    const { container } = render(<Sidebar />)
    
    const hamburgerButton = screen.getByLabelText('Menu')
    
    const sidebar = container.querySelector('[class*="sidebar"]')
    expect(sidebar).not.toHaveClass('sidebarOpen')
    
    fireEvent.click(hamburgerButton)
    
    const overlay = container.querySelector('[class*="overlay"]')
    expect(overlay).toBeInTheDocument()
  })

  it('should close mobile menu when overlay is clicked', () => {
    const { container } = render(<Sidebar />)
    
    const hamburgerButton = screen.getByLabelText('Menu')
    
    fireEvent.click(hamburgerButton)
    
    let overlay = container.querySelector('[class*="overlay"]')
    expect(overlay).toBeInTheDocument()
    
    if (overlay) {
      fireEvent.click(overlay)
    }
    
    overlay = container.querySelector('[class*="overlay"]')
    expect(overlay).not.toBeInTheDocument()
  })

  it('should close mobile menu when a link is clicked', () => {
    const { container } = render(<Sidebar />)
    
    const hamburgerButton = screen.getByLabelText('Menu')
    
    fireEvent.click(hamburgerButton)
    
    let overlay = container.querySelector('[class*="overlay"]')
    expect(overlay).toBeInTheDocument()
    
    const homeLink = screen.getByText(NAV_TEXT.home)
    fireEvent.click(homeLink)
    
    overlay = container.querySelector('[class*="overlay"]')
    expect(overlay).not.toBeInTheDocument()
  })

  it('should render Spotify logo', () => {
    const { container } = render(<Sidebar />)
    
    const logos = container.querySelectorAll('svg')
    expect(logos.length).toBeGreaterThan(0)
  })

  it('should render icons for each navigation item', () => {
    const { container } = render(<Sidebar />)
    
    const icons = container.querySelectorAll('svg')
    expect(icons.length).toBeGreaterThan(4)
  })

  it('should have only one active item at a time', () => {
    mockPathname.mockReturnValue(ROUTE_TOP_ARTISTS)
    
    const { container } = render(<Sidebar />)
    
    const activeLinks = container.querySelectorAll('a[class*="active"]')
    expect(activeLinks).toHaveLength(1)
  })

  it('should not mark any item as active for unknown route', () => {
    mockPathname.mockReturnValue('/unknown-route')
    
    const { container } = render(<Sidebar />)
    
    const activeLinks = container.querySelectorAll('a[class*="active"]')
    expect(activeLinks).toHaveLength(0)
  })

  it('should toggle menu state on multiple clicks', () => {
    const { container } = render(<Sidebar />)
    
    const hamburgerButton = screen.getByLabelText('Menu')
    
    fireEvent.click(hamburgerButton)
    let overlay = container.querySelector('[class*="overlay"]')
    expect(overlay).toBeInTheDocument()
    
    fireEvent.click(hamburgerButton)
    overlay = container.querySelector('[class*="overlay"]')
    expect(overlay).not.toBeInTheDocument()
    
    fireEvent.click(hamburgerButton)
    overlay = container.querySelector('[class*="overlay"]')
    expect(overlay).toBeInTheDocument()
  })

  it('should maintain active state when menu is toggled', () => {
    mockPathname.mockReturnValue(ROUTE_PLAYLISTS)
    
    render(<Sidebar />)
    
    const hamburgerButton = screen.getByLabelText('Menu')
    
    fireEvent.click(hamburgerButton)
    
    const playlistsLink = screen.getByText(NAV_TEXT.playlists).closest('a')
    expect(playlistsLink?.className).toMatch(/active/)
    
    fireEvent.click(hamburgerButton)
    
    expect(playlistsLink?.className).toMatch(/active/)
  })
})
