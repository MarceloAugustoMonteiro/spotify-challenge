import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useRequireAuth } from '../useRequireAuth'

vi.mock('../useAuth', () => ({
  useAuth: vi.fn()
}))

vi.mock('next/navigation', () => ({
  useRouter: vi.fn()
}))

import { useAuth } from '../useAuth'
import { useRouter } from 'next/navigation'

describe('useRequireAuth', () => {
  const mockPush = vi.fn()
  const mockUseAuth = vi.mocked(useAuth)
  const mockUseRouter = vi.mocked(useRouter)

  beforeEach(() => {
    vi.clearAllMocks()
    mockUseRouter.mockReturnValue({ push: mockPush } as any)
  })

  it('should return loading true while checking authentication', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      loading: true
    })

    const { result } = renderHook(() => useRequireAuth())

    expect(result.current.loading).toBe(true)
    expect(result.current.isAuthenticated).toBe(false)
    expect(mockPush).not.toHaveBeenCalled()
  })

  it('should return isAuthenticated true when user is authenticated', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      loading: false
    })

    const { result } = renderHook(() => useRequireAuth())

    expect(result.current.isAuthenticated).toBe(true)
    expect(result.current.loading).toBe(false)
    expect(mockPush).not.toHaveBeenCalled()
  })

  it('should redirect to home when user is not authenticated', async () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      loading: false
    })

    renderHook(() => useRequireAuth())

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/')
    })
  })

  it('should not redirect while loading', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      loading: true
    })

    renderHook(() => useRequireAuth())

    expect(mockPush).not.toHaveBeenCalled()
  })

  it('should handle authentication state changes', async () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      loading: true
    })

    const { rerender } = renderHook(() => useRequireAuth())

    expect(mockPush).not.toHaveBeenCalled()

    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      loading: false
    })

    rerender()

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/')
    })
  })

  it('should only redirect once when not authenticated', async () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      loading: false
    })

    const { rerender } = renderHook(() => useRequireAuth())

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledTimes(1)
    })

    rerender()
    rerender()

    expect(mockPush).toHaveBeenCalledTimes(1)
  })

  it('should not redirect when transitioning from loading to authenticated', async () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      loading: true
    })

    const { rerender } = renderHook(() => useRequireAuth())

    expect(mockPush).not.toHaveBeenCalled()

    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      loading: false
    })

    rerender()

    await waitFor(() => {
      expect(mockPush).not.toHaveBeenCalled()
    })
  })

  it('should redirect immediately if already not authenticated and not loading', async () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      loading: false
    })

    renderHook(() => useRequireAuth())

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/')
      expect(mockPush).toHaveBeenCalledTimes(1)
    })
  })

  it('should handle rapid state changes correctly', async () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      loading: true
    })

    const { rerender } = renderHook(() => useRequireAuth())

    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      loading: false
    })
    rerender()

    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      loading: false
    })
    rerender()

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/')
    })
  })
})
