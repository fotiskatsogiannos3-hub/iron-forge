import { useEffect, type ReactNode } from 'react'
import { X } from 'lucide-react'
import './ui.css'

interface ModalProps {
  title: string
  onClose: () => void
  children: ReactNode
  maxWidth?: number
}

export function Modal({ title, onClose, children, maxWidth }: ModalProps) {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  return (
    <div className="if-modal-overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="if-modal" style={maxWidth ? { maxWidth } : undefined} role="dialog" aria-modal="true" aria-label={title}>
        <div className="if-modal-header">
          <h2 className="if-modal-title">{title}</h2>
          <button className="if-modal-close" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
