'use client'
import React, { useEffect, useState, useCallback } from 'react'

const API = process.env.NEXT_PUBLIC_API_BASE_URL!

interface SpotifyImage {
  url: string
  height: number
  width: number
}

interface SpotifyArtist {
  id: string
  name: string
  images?: SpotifyImage[]
}

export default function TopArtists() {
  const [items, setItems] = useState<SpotifyArtist[]>([])
  const [offset, setOffset] = useState(0)
  const limit = 20

  const load = useCallback(async () => {
    const res = await fetch(`${API}/api/top-artists?limit=${limit}&offset=${offset}`, { credentials: 'include' })
    if (res.ok) {
      const data = await res.json()
      setItems(p => [...p, ...data.items])
      setOffset(p => p + limit)
    }
  }, [offset])

  useEffect(() => {
    load()
  }, [load])

  return (
    <main style={{ padding: 24 }}>
      <h2>Artistas mais ouvidos</h2>
      <ul>
        {items.map((a) => (
          <li key={a.id} style={{ display:'flex', gap:12, alignItems:'center', margin:'12px 0' }}>
            <img 
              src={a.images?.[0]?.url} 
              alt={a.name}
              width={48} 
              height={48} 
              style={{ borderRadius: 6 }} 
            />
            <span>{a.name}</span>
          </li>
        ))}
      </ul>
      <button onClick={load}>Carregar mais</button>
    </main>
  )
}
