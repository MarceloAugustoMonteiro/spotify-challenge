'use client'
import React from 'react'

const API = process.env.NEXT_PUBLIC_API_BASE_URL!

export default function Home() {
  async function login() {
    window.location.href = `${API}/auth/login`
  }
  
  return (
    <main style={{ padding: 24, maxWidth: 1200, margin: '0 auto' }}>
      <header style={{ textAlign: 'center', marginBottom: 48 }}>
        <h1 style={{ fontSize: 48, marginBottom: 16, color: '#1db954' }}>
          Spotify Challenge
        </h1>
        <p style={{ fontSize: 18, color: '#666' }}>
          Explore sua música favorita com o poder da API do Spotify
        </p>
      </header>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
        gap: 24,
        marginTop: 32
      }}>
        <div style={{ 
          border: '1px solid #ddd', 
          borderRadius: 12, 
          padding: 24,
          backgroundColor: '#fafafa',
          transition: 'transform 0.2s, box-shadow 0.2s',
          cursor: 'pointer'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-4px)'
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)'
          e.currentTarget.style.boxShadow = 'none'
        }}
        onClick={() => window.location.href = '/top-artists'}
        >
          <h2 style={{ marginBottom: 12, fontSize: 24 }}>Top Artistas</h2>
          <p style={{ color: '#666', lineHeight: 1.6 }}>
            Descubra os artistas que você mais ouve no Spotify
          </p>
        </div>

        <div style={{ 
          border: '1px solid #ddd', 
          borderRadius: 12, 
          padding: 24,
          backgroundColor: '#fafafa',
          transition: 'transform 0.2s, box-shadow 0.2s',
          cursor: 'pointer'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-4px)'
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)'
          e.currentTarget.style.boxShadow = 'none'
        }}
        onClick={() => window.location.href = '/playlists'}
        >
          <h2 style={{ marginBottom: 12, fontSize: 24 }}>Playlists</h2>
          <p style={{ color: '#666', lineHeight: 1.6 }}>
            Gerencie suas playlists e crie novas coleções de músicas
          </p>
        </div>

        <div style={{ 
          border: '1px solid #ddd', 
          borderRadius: 12, 
          padding: 24,
          backgroundColor: '#fafafa',
          transition: 'transform 0.2s, box-shadow 0.2s',
          cursor: 'pointer'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-4px)'
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)'
          e.currentTarget.style.boxShadow = 'none'
        }}
        onClick={() => window.location.href = '/profile'}
        >
          <h2 style={{ marginBottom: 12, fontSize: 24 }}>Meu Perfil</h2>
          <p style={{ color: '#666', lineHeight: 1.6 }}>
            Veja suas informações e estatísticas do Spotify
          </p>
        </div>
      </div>

      <div style={{ 
        textAlign: 'center', 
        marginTop: 48,
        padding: 32,
        border: '2px dashed #1db954',
        borderRadius: 12,
        backgroundColor: '#f0fff4'
      }}>
        <h3 style={{ marginBottom: 16, fontSize: 20 }}>Comece agora!</h3>
        <p style={{ color: '#666', marginBottom: 24 }}>
          Faça login com sua conta do Spotify para começar a explorar
        </p>
        <button 
          onClick={login}
          style={{
            fontSize: 18,
            padding: '12px 32px',
            backgroundColor: '#1db954',
            color: 'white',
            border: 'none',
            borderRadius: 24,
            cursor: 'pointer',
            fontWeight: 600,
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1ed760'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#1db954'}
        >
          Entrar com Spotify
        </button>
      </div>
    </main>
  )
}
