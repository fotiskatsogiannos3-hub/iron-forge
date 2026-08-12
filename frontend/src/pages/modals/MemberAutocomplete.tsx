import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { membersApi } from '@/api/members'
import { useDebouncedValue } from '@/lib/useDebouncedValue'
import type { MemberReadOnly } from '@/types'
import '../pages.css'

interface MemberAutocompleteProps {
  id?: string
  value: MemberReadOnly | null
  onChange: (member: MemberReadOnly | null) => void
}

export function MemberAutocomplete({ id, value, onChange }: MemberAutocompleteProps) {
  const [query, setQuery] = useState('')
  const debouncedQuery = useDebouncedValue(query, 300)
  const [results, setResults] = useState<MemberReadOnly[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isOpen || debouncedQuery.trim().length === 0) {
      setResults([])
      return
    }
    let cancelled = false
    setIsLoading(true)
    membersApi
      .list({ search: debouncedQuery, size: 8 })
      .then((page) => {
        if (!cancelled) setResults(page.content)
      })
      .finally(() => !cancelled && setIsLoading(false))
    return () => {
      cancelled = true
    }
  }, [debouncedQuery, isOpen])

  // Reset keyboard highlight when the result list changes.
  useEffect(() => {
    setHighlightedIndex(results.length > 0 ? 0 : -1)
  }, [results])

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  const isListShown = isOpen && query.trim().length > 0 && !value

  const selectMember = (m: MemberReadOnly) => {
    onChange(m)
    setQuery('')
    setIsOpen(false)
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!isListShown || results.length === 0) return

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlightedIndex((i) => (i + 1) % results.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlightedIndex((i) => (i - 1 + results.length) % results.length)
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (highlightedIndex >= 0) selectMember(results[highlightedIndex])
    } else if (e.key === 'Escape') {
      setIsOpen(false)
    }
  }

  return (
    <div className="if-autocomplete" ref={containerRef}>
      <input
        id={id}
        className="if-input"
        placeholder="Search member…"
        value={value ? `${value.firstName} ${value.lastName}` : query}
        onChange={(e) => {
          onChange(null)
          setQuery(e.target.value)
          setIsOpen(true)
        }}
        onFocus={() => setIsOpen(true)}
        onKeyDown={handleKeyDown}
        role="combobox"
        aria-expanded={isListShown}
        aria-autocomplete="list"
      />
      {isListShown && (
        <div className="if-autocomplete-list" role="listbox">
          {isLoading ? (
            <div className="if-autocomplete-empty">Searching…</div>
          ) : results.length === 0 ? (
            <div className="if-autocomplete-empty">No members found.</div>
          ) : (
            results.map((m, index) => (
              <div
                key={m.id}
                role="option"
                aria-selected={index === highlightedIndex}
                className={`if-autocomplete-item ${index === highlightedIndex ? 'active' : ''}`}
                onMouseEnter={() => setHighlightedIndex(index)}
                onClick={() => selectMember(m)}
              >
                {m.firstName} {m.lastName} · {m.email}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}