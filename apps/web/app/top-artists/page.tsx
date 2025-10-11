'use client'
import { useEffect, useState } from 'react'
const API = process.env.NEXT_PUBLIC_API_BASE_URL!
export default function TopArtists() {
  const [items, setItems] = useState<any[]>([])
  const [offset, setOffset] = useState(0)
  const limit = 20
  async function load() {
    const res = await fetch(`${API}/api/top-artists?limit=${limit}&offset=${offset}`, { credentials: 'include' })
    if (res.ok) {
      const data = await res.json()
      setItems(p => [...p, ...data.items])
      setOffset(p => p + limit)
    }
  }
  useEffect(() => { load() }, [])
  return (
    <main style={{ padding: 24 }}>
      <h2>Artistas mais ouvidos</h2>
      <ul>
        {items.map((a:any) => (
          <li key={a.id} style={{ display:'flex', gap:12, alignItems:'center', margin:'12px 0' }}>
            <img src={a.images?.[0]?.url} width={48} height={48} style={{ borderRadius: 6 }} />
            <span>{a.name}</span>
          </li>
        ))}
      </ul>
      <button onClick={load}>Carregar mais</button>
    </main>
  )
}
