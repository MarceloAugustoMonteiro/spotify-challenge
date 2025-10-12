'use client'
import { useState, useEffect } from 'react'

const API = process.env.NEXT_PUBLIC_API_BASE_URL!

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch(`${API}/api/me`, { 
          credentials: 'include',
          cache: 'no-store'
        })
        setIsAuthenticated(res.ok)
      } catch (error) {
        setIsAuthenticated(false)
      } finally {
        setLoading(false)
      }
    }
    
    checkAuth()
  }, [])

  return { isAuthenticated, loading }
}

