import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useAuth } from '../useAuth'

const API_BASE_URL = 'http://127.0.0.1:3001'
const API_ME_ENDPOINT = `${API_BASE_URL}/api/me`

const createMockUserResponse = (overrides = {}) => ({
  id: 'user123',
  display_name: 'Test User',
  email: 'test@example.com',
  ...overrides
})

const createMockSuccessResponse = (data = createMockUserResponse()): Response => ({
  ok: true,
  status: 200,
  json: async () => data,
} as Response)

const createMockErrorResponse = (status: number): Response => ({
  ok: false,
  status,
  json: async () => ({ error: 'unauthorized' }),
} as Response)

describe('useAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    global.fetch = vi.fn()
  })

  it('should initialize with loading true', () => {
    const mockFetch = vi.mocked(global.fetch)
    mockFetch.mockImplementation(() => new Promise(() => {})) 

    const { result } = renderHook(() => useAuth())

    expect(result.current.loading).toBe(true)
    expect(result.current.isAuthenticated).toBe(false)
  })

  it('should set isAuthenticated to true when /api/me returns 200', async () => {
    const mockFetch = vi.mocked(global.fetch)
    mockFetch.mockResolvedValueOnce(createMockSuccessResponse())

    const { result } = renderHook(() => useAuth())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.isAuthenticated).toBe(true)
    expect(mockFetch).toHaveBeenCalledWith(
      API_ME_ENDPOINT,
      expect.objectContaining({
        credentials: 'include',
        cache: 'no-store'
      })
    )
  })

  it('should set isAuthenticated to false when /api/me returns 401', async () => {
    const mockFetch = vi.mocked(global.fetch)
    mockFetch.mockResolvedValueOnce(createMockErrorResponse(401))

    const { result } = renderHook(() => useAuth())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.isAuthenticated).toBe(false)
  })

  it('should set isAuthenticated to false when fetch fails', async () => {
    const mockFetch = vi.mocked(global.fetch)
    mockFetch.mockRejectedValueOnce(new Error('Network error'))

    const { result } = renderHook(() => useAuth())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.isAuthenticated).toBe(false)
  })

  it('should use NEXT_PUBLIC_API_BASE_URL environment variable', async () => {
    const mockFetch = vi.mocked(global.fetch)
    mockFetch.mockResolvedValueOnce(createMockSuccessResponse())

    renderHook(() => useAuth())

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining(API_ME_ENDPOINT),
        expect.any(Object)
      )
    })
  })

  it('should include credentials and cache: no-store in request', async () => {
    const mockFetch = vi.mocked(global.fetch)
    mockFetch.mockResolvedValueOnce(createMockSuccessResponse())

    renderHook(() => useAuth())

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          credentials: 'include',
          cache: 'no-store'
        })
      )
    })
  })

  it('should handle 403 forbidden error', async () => {
    const mockFetch = vi.mocked(global.fetch)
    mockFetch.mockResolvedValueOnce(createMockErrorResponse(403))

    const { result } = renderHook(() => useAuth())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.isAuthenticated).toBe(false)
  })

  it('should handle 500 server error', async () => {
    const mockFetch = vi.mocked(global.fetch)
    mockFetch.mockResolvedValueOnce(createMockErrorResponse(500))

    const { result } = renderHook(() => useAuth())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.isAuthenticated).toBe(false)
  })

  it('should handle network timeout', async () => {
    const mockFetch = vi.mocked(global.fetch)
    mockFetch.mockRejectedValueOnce(new Error('Network timeout'))

    const { result } = renderHook(() => useAuth())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.isAuthenticated).toBe(false)
  })
})
