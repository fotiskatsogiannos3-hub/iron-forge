import type { ButtonHTMLAttributes, ReactNode } from 'react'
import './ui.css'

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  children: ReactNode
  isLoading?: boolean
}

export function Button({ variant = 'primary', children, isLoading, className, disabled, ...rest }: ButtonProps) {
  return (
    <button
      className={`if-btn if-btn-${variant} ${className ?? ''}`}
      disabled={disabled || isLoading}
      {...rest}
    >
      {isLoading && <span className="if-btn-spinner" aria-hidden="true" />}
      {children}
    </button>
  )
}