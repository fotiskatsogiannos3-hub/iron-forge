import { useEffect, useState } from 'react'

interface DateFieldInputProps {
  id?: string
  /** ISO yyyy-MM-dd, or empty string / null for no value. */
  value: string | null
  onChange: (isoValue: string | null) => void
  required?: boolean
  disabled?: boolean
}

/** Converts an ISO yyyy-MM-dd string to a display DD/MM/YYYY string. */
function isoToDisplay(iso: string | null): string {
  if (!iso) return ''
  const [y, m, d] = iso.split('-')
  if (!y || !m || !d) return ''
  return `${d}/${m}/${y}`
}

/** Converts a fully-typed DD/MM/YYYY display string to ISO, or null if incomplete/invalid. */
function displayToIso(display: string): string | null {
  const match = display.match(/^(\d{2})\/(\d{2})\/(\d{4})$/)
  if (!match) return null
  const [, d, m, y] = match
  const day = Number(d)
  const month = Number(m)
  const year = Number(y)
  if (month < 1 || month > 12 || day < 1 || day > 31 || year < 1900) return null
  return `${y}-${m}-${d}`
}

/**
 * A plain masked text input for DD/MM/YYYY dates, matching the Figma spec's
 * text-field date inputs. Deliberately avoids the native <input type="date">
 * (its browser-native calendar popup felt slow) in favor of instant,
 * lightweight typing with auto-inserted slashes.
 */
export function DateFieldInput({ id, value, onChange, required, disabled }: DateFieldInputProps) {
  const [text, setText] = useState(isoToDisplay(value))

  // Keep local text in sync if the value is set programmatically (e.g. form reset).
  useEffect(() => {
    setText(isoToDisplay(value))
  }, [value])

  const handleChange = (raw: string) => {
    // Strip everything but digits, then re-insert slashes as the user types.
    const digits = raw.replace(/\D/g, '').slice(0, 8)
    let formatted = digits
    if (digits.length > 4) {
      formatted = `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`
    } else if (digits.length > 2) {
      formatted = `${digits.slice(0, 2)}/${digits.slice(2)}`
    }
    setText(formatted)

    const iso = displayToIso(formatted)
    onChange(iso)
  }

  return (
    <input
      id={id}
      className="if-input"
      inputMode="numeric"
      placeholder="DD/MM/YYYY"
      value={text}
      onChange={(e) => handleChange(e.target.value)}
      maxLength={10}
      required={required}
      disabled={disabled}
    />
  )
}
