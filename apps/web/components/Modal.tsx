'use client'
import React from 'react'
import styles from './Modal.module.css'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  message: string
  type?: 'success' | 'error' | 'info'
}

export default function Modal({ isOpen, onClose, title, message, type = 'info' }: ModalProps) {
  if (!isOpen) return null

  const getIcon = () => {
    switch (type) {
      case 'success':
        return '✓'
      case 'error':
        return '✕'
      default:
        return 'ℹ'
    }
  }

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className={styles.modalClose}>
          ×
        </button>

        <div className={`${styles.modalIcon} ${styles[type]}`}>
          {getIcon()}
        </div>

        <h2 className={styles.modalTitle}>{title}</h2>
        <p className={styles.modalMessage}>{message}</p>

        <button onClick={onClose} className={styles.modalButton}>
          OK
        </button>
      </div>
    </div>
  )
}

