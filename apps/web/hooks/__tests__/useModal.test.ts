import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useModal } from '../useModal'

const SUCCESS_TITLE = 'Success'
const SUCCESS_MESSAGE = 'Operation completed successfully'
const ERROR_TITLE = 'Error'
const ERROR_MESSAGE = 'Something went wrong'
const INFO_TITLE = 'Information'
const INFO_MESSAGE = 'Please note'

describe('useModal', () => {
  it('should initialize with modal closed', () => {
    const { result } = renderHook(() => useModal())

    expect(result.current.modalState.isOpen).toBe(false)
    expect(result.current.modalState.title).toBe('')
    expect(result.current.modalState.message).toBe('')
    expect(result.current.modalState.type).toBe('info')
  })

  it('should open success modal with correct data', () => {
    const { result } = renderHook(() => useModal())

    act(() => {
      result.current.showSuccess(SUCCESS_TITLE, SUCCESS_MESSAGE)
    })

    expect(result.current.modalState.isOpen).toBe(true)
    expect(result.current.modalState.title).toBe(SUCCESS_TITLE)
    expect(result.current.modalState.message).toBe(SUCCESS_MESSAGE)
    expect(result.current.modalState.type).toBe('success')
  })

  it('should open error modal with correct data', () => {
    const { result } = renderHook(() => useModal())

    act(() => {
      result.current.showError(ERROR_TITLE, ERROR_MESSAGE)
    })

    expect(result.current.modalState.isOpen).toBe(true)
    expect(result.current.modalState.title).toBe(ERROR_TITLE)
    expect(result.current.modalState.message).toBe(ERROR_MESSAGE)
    expect(result.current.modalState.type).toBe('error')
  })

  it('should open info modal with correct data', () => {
    const { result } = renderHook(() => useModal())

    act(() => {
      result.current.showInfo(INFO_TITLE, INFO_MESSAGE)
    })

    expect(result.current.modalState.isOpen).toBe(true)
    expect(result.current.modalState.title).toBe(INFO_TITLE)
    expect(result.current.modalState.message).toBe(INFO_MESSAGE)
    expect(result.current.modalState.type).toBe('info')
  })

  it('should close modal when closeModal is called', () => {
    const { result } = renderHook(() => useModal())

    act(() => {
      result.current.showSuccess(SUCCESS_TITLE, SUCCESS_MESSAGE)
    })

    expect(result.current.modalState.isOpen).toBe(true)

    act(() => {
      result.current.closeModal()
    })

    expect(result.current.modalState.isOpen).toBe(false)
  })

  it('should preserve title and message when closing modal', () => {
    const { result } = renderHook(() => useModal())

    act(() => {
      result.current.showError(ERROR_TITLE, ERROR_MESSAGE)
    })

    act(() => {
      result.current.closeModal()
    })

    expect(result.current.modalState.isOpen).toBe(false)
    expect(result.current.modalState.title).toBe(ERROR_TITLE)
    expect(result.current.modalState.message).toBe(ERROR_MESSAGE)
    expect(result.current.modalState.type).toBe('error')
  })

  it('should override previous modal when opening new one', () => {
    const { result } = renderHook(() => useModal())

    act(() => {
      result.current.showSuccess(SUCCESS_TITLE, SUCCESS_MESSAGE)
    })

    expect(result.current.modalState.type).toBe('success')

    act(() => {
      result.current.showError(ERROR_TITLE, ERROR_MESSAGE)
    })

    expect(result.current.modalState.isOpen).toBe(true)
    expect(result.current.modalState.title).toBe(ERROR_TITLE)
    expect(result.current.modalState.message).toBe(ERROR_MESSAGE)
    expect(result.current.modalState.type).toBe('error')
  })

  it('should handle empty strings for title and message', () => {
    const { result } = renderHook(() => useModal())

    act(() => {
      result.current.showInfo('', '')
    })

    expect(result.current.modalState.isOpen).toBe(true)
    expect(result.current.modalState.title).toBe('')
    expect(result.current.modalState.message).toBe('')
    expect(result.current.modalState.type).toBe('info')
  })

  it('should handle long strings for title and message', () => {
    const longTitle = 'A'.repeat(100)
    const longMessage = 'B'.repeat(500)
    
    const { result } = renderHook(() => useModal())

    act(() => {
      result.current.showSuccess(longTitle, longMessage)
    })

    expect(result.current.modalState.title).toBe(longTitle)
    expect(result.current.modalState.message).toBe(longMessage)
  })

  it('should handle special characters in title and message', () => {
    const specialTitle = 'Test <script>alert("xss")</script>'
    const specialMessage = 'Message with & < > " \' characters'
    
    const { result } = renderHook(() => useModal())

    act(() => {
      result.current.showError(specialTitle, specialMessage)
    })

    expect(result.current.modalState.title).toBe(specialTitle)
    expect(result.current.modalState.message).toBe(specialMessage)
  })
})
