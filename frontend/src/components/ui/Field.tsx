import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from 'react'
import './ui.css'

interface FieldProps {
  label: string
  htmlFor: string
  children: ReactNode
  hint?: string
  error?: string
}

export function Field({ label, htmlFor, children, hint, error }: FieldProps) {
  return (
    <div className="if-field">
      <label className="if-label" htmlFor={htmlFor}>
        {label}
      </label>
      {children}
      {error ? <span className="if-field-error">{error}</span> : hint ? <span className="if-field-hint">{hint}</span> : null}
    </div>
  )
}

export function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input className="if-input" {...props} />
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className="if-select" {...props} />
}
