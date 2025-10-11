'use client'
const API = process.env.NEXT_PUBLIC_API_BASE_URL!
export default function Home() {
  async function login() {
    window.location.href = `${API}/auth/login`
  }
  return (
    <main style={{ padding: 24 }}>
      <h1>Spotify Challenge</h1>
      <button onClick={login}>Entrar com Spotify</button>
    </main>
  )
}
