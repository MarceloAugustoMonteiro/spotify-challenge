import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import Modal from '../Modal'

const MOCK_TITLE = 'Test Title'
const MOCK_MESSAGE = 'Test message content'

describe('Modal Component', () => {
  const mockOnClose = vi.fn()

  const defaultProps = {
    isOpen: true,
    onClose: mockOnClose,
    title: MOCK_TITLE,
    message: MOCK_MESSAGE
  }

  beforeEach(() => {
    mockOnClose.mockClear()
  })

  it('should not render when isOpen is false', () => {
    const { container } = render(<Modal {...defaultProps} isOpen={false} />)
    
    expect(container.firstChild).toBeNull()
  })

  it('should render when isOpen is true', () => {
    render(<Modal {...defaultProps} />)
    
    expect(screen.getByText(MOCK_TITLE)).toBeInTheDocument()
    expect(screen.getByText(MOCK_MESSAGE)).toBeInTheDocument()
  })

  it('should display success icon when type is success', () => {
    render(<Modal {...defaultProps} type="success" />)
    
    const icon = screen.getByText('✓')
    expect(icon).toBeInTheDocument()
  })

  it('should display error icon when type is error', () => {
    render(<Modal {...defaultProps} type="error" />)
    
    const icon = screen.getByText('✕')
    expect(icon).toBeInTheDocument()
  })

  it('should display info icon when type is info', () => {
    render(<Modal {...defaultProps} type="info" />)
    
    const icon = screen.getByText('ℹ')
    expect(icon).toBeInTheDocument()
  })

  it('should display info icon by default when type is not provided', () => {
    render(<Modal {...defaultProps} type={undefined} />)
    
    const icon = screen.getByText('ℹ')
    expect(icon).toBeInTheDocument()
  })

  it('should call onClose when X button is clicked', () => {
    render(<Modal {...defaultProps} />)
    
    const closeButton = screen.getByText('×')
    fireEvent.click(closeButton)
    
    expect(mockOnClose).toHaveBeenCalledTimes(1)
  })

  it('should call onClose when OK button is clicked', () => {
    render(<Modal {...defaultProps} />)
    
    const okButton = screen.getByText('OK')
    fireEvent.click(okButton)
    
    expect(mockOnClose).toHaveBeenCalledTimes(1)
  })

  it('should call onClose when overlay is clicked', () => {
    render(<Modal {...defaultProps} />)
    
    const overlay = screen.getByText(MOCK_TITLE).parentElement?.parentElement
    if (overlay) {
      fireEvent.click(overlay)
      expect(mockOnClose).toHaveBeenCalledTimes(1)
    }
  })

  it('should not call onClose when modal content is clicked', () => {
    render(<Modal {...defaultProps} />)
    
    const modalContent = screen.getByText(MOCK_TITLE).parentElement
    if (modalContent) {
      fireEvent.click(modalContent)
      expect(mockOnClose).not.toHaveBeenCalled()
    }
  })

  it('should render custom title correctly', () => {
    render(<Modal {...defaultProps} title="Custom Title" />)
    
    expect(screen.getByText('Custom Title')).toBeInTheDocument()
  })

  it('should render custom message correctly', () => {
    render(<Modal {...defaultProps} message="Custom message" />)
    
    expect(screen.getByText('Custom message')).toBeInTheDocument()
  })

  it('should apply correct CSS class for each type', () => {
    const { rerender, container } = render(<Modal {...defaultProps} type="success" />)
    
    let iconElement = container.querySelector('[class*="success"]')
    expect(iconElement).toBeInTheDocument()

    rerender(<Modal {...defaultProps} type="error" />)
    iconElement = container.querySelector('[class*="error"]')
    expect(iconElement).toBeInTheDocument()

    rerender(<Modal {...defaultProps} type="info" />)
    iconElement = container.querySelector('[class*="info"]')
    expect(iconElement).toBeInTheDocument()
  })

  it('should display multiple different messages', () => {
    const { rerender } = render(<Modal {...defaultProps} title="First" message="Message 1" />)
    
    expect(screen.getByText('First')).toBeInTheDocument()
    expect(screen.getByText('Message 1')).toBeInTheDocument()

    rerender(<Modal {...defaultProps} title="Second" message="Message 2" />)
    
    expect(screen.getByText('Second')).toBeInTheDocument()
    expect(screen.getByText('Message 2')).toBeInTheDocument()
  })

  it('should handle empty title', () => {
    render(<Modal {...defaultProps} title="" />)
    
    expect(screen.getByText(MOCK_MESSAGE)).toBeInTheDocument()
  })

  it('should handle empty message', () => {
    render(<Modal {...defaultProps} message="" />)
    
    expect(screen.getByText(MOCK_TITLE)).toBeInTheDocument()
  })

  it('should handle long title text', () => {
    const longTitle = 'A'.repeat(100)
    render(<Modal {...defaultProps} title={longTitle} />)
    
    expect(screen.getByText(longTitle)).toBeInTheDocument()
  })

  it('should handle long message text', () => {
    const longMessage = 'B'.repeat(500)
    render(<Modal {...defaultProps} message={longMessage} />)
    
    expect(screen.getByText(longMessage)).toBeInTheDocument()
  })

  it('should handle special characters in title and message', () => {
    const specialTitle = 'Test <>&"'
    const specialMessage = 'Message with special chars: <>&"\''
    
    render(<Modal {...defaultProps} title={specialTitle} message={specialMessage} />)
    
    expect(screen.getByText(specialTitle)).toBeInTheDocument()
    expect(screen.getByText(specialMessage)).toBeInTheDocument()
  })
})
