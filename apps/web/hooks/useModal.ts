'use client'
import { useState } from 'react'

interface ModalState {
  isOpen: boolean
  title: string
  message: string
  type: 'success' | 'error' | 'info'
}

export function useModal() {
  const [modalState, setModalState] = useState<ModalState>({
    isOpen: false,
    title: '',
    message: '',
    type: 'info',
  })

  const showSuccess = (title: string, message: string) => {
    setModalState({
      isOpen: true,
      title,
      message,
      type: 'success',
    })
  }

  const showError = (title: string, message: string) => {
    setModalState({
      isOpen: true,
      title,
      message,
      type: 'error',
    })
  }

  const showInfo = (title: string, message: string) => {
    setModalState({
      isOpen: true,
      title,
      message,
      type: 'info',
    })
  }

  const closeModal = () => {
    setModalState((prev) => ({
      ...prev,
      isOpen: false,
    }))
  }

  return {
    modalState,
    showSuccess,
    showError,
    showInfo,
    closeModal,
  }
}

