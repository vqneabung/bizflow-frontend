/**
 * combobox.tsx — Searchable dropdown with inline "Add new" support.
 *
 * Features:
 * - Filter items when typing
 * - Keyboard navigation (↑↓ to move, Enter to select)
 * - "Add new" button at bottom when search doesn't match
 * - Controlled mode (value + onChange)
 * - Loading state
 *
 * Uses shadcn-ui Popover + Command patterns but implemented
 * with native input + dropdown to minimize dependencies.
 */
'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export interface ComboboxItem {
  id: string      // UUID
  name: string    // Display name
}

interface ComboboxProps {
  /** Items to display */
  items: ComboboxItem[]
  /** Selected item ID (UUID) */
  value: string
  /** Called when item selected */
  onChange: (value: string) => void
  /** Label for the field */
  label: string
  /** Placeholder text */
  placeholder?: string
  /** Show "Add new" button? */
  enableAdd?: boolean
  /** Called when "Add new" clicked with the typed name */
  onAddNew?: (name: string) => void
  /** Loading state */
  isLoading?: boolean
  /** Error state */
  error?: string
  /** Disabled state */
  disabled?: boolean
  /** Required marker */
  required?: boolean
}

export default function Combobox({
  items,
  value,
  onChange,
  label,
  placeholder = 'Tìm kiếm...',
  enableAdd = false,
  onAddNew,
  isLoading = false,
  error,
  disabled = false,
  required = false,
}: ComboboxProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [highlightIndex, setHighlightIndex] = useState(-1)
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  // Find selected item
  const selectedItem = items.find(i => i.id === value)
  const displayText = selectedItem?.name ?? ''

  // Filter items based on search
  const filtered = search
    ? items.filter(i => i.name.toLowerCase().includes(search.toLowerCase()))
    : items

  const showAddNew = enableAdd && onAddNew && search.length > 0
    && !filtered.some(i => i.name.toLowerCase() === search.toLowerCase())

  // Reset highlight when list changes
  useEffect(() => {
    setHighlightIndex(-1)
  }, [search, items])

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
        setSearch('')
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelect = useCallback((itemId: string) => {
    onChange(itemId)
    setIsOpen(false)
    setSearch('')
    inputRef.current?.blur()
  }, [onChange])

  const handleAddNew = useCallback(() => {
    if (onAddNew && search.trim()) {
      onAddNew(search.trim())
      setIsOpen(false)
      setSearch('')
    }
  }, [onAddNew, search])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        setIsOpen(true)
        e.preventDefault()
      }
      return
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setHighlightIndex(prev =>
          prev < filtered.length + (showAddNew ? 1 : 0) - 1 ? prev + 1 : 0
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setHighlightIndex(prev =>
          prev > 0 ? prev - 1 : filtered.length + (showAddNew ? 1 : 0) - 1
        )
        break
      case 'Enter':
        e.preventDefault()
        if (highlightIndex >= 0 && highlightIndex < filtered.length) {
          handleSelect(filtered[highlightIndex].id)
        } else if (showAddNew && highlightIndex === filtered.length) {
          handleAddNew()
        }
        break
      case 'Escape':
        setIsOpen(false)
        setSearch('')
        break
    }
  }

  // Scroll highlighted item into view
  useEffect(() => {
    if (highlightIndex >= 0 && listRef.current) {
      const items = listRef.current.children
      if (items[highlightIndex]) {
        (items[highlightIndex] as HTMLElement).scrollIntoView({ block: 'nearest' })
      }
    }
  }, [highlightIndex])

  return (
    <div className="space-y-2" ref={containerRef}>
      <Label htmlFor={`combobox-${label}`}>
        {label} {required && <span className="text-destructive">*</span>}
      </Label>
      <div className="relative">
        {/* Trigger / search input */}
        <Input
          ref={inputRef}
          id={`combobox-${label}`}
          value={isOpen ? search : displayText}
          onChange={(e) => {
            setSearch(e.target.value)
            if (!isOpen) setIsOpen(true)
            if (!e.target.value && value) {
              onChange('')
            }
          }}
          onFocus={() => {
            setIsOpen(true)
            setSearch('')
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className={error ? 'border-destructive' : ''}
          autoComplete="off"
        />

        {/* Dropdown */}
        {isOpen && !disabled && (
          <div className="absolute z-50 mt-1 w-full bg-popover border border-border rounded-md shadow-md max-h-60 overflow-auto" ref={listRef}>
            {isLoading ? (
              <div className="px-3 py-6 text-center text-sm text-muted-foreground">
                Đang tải...
              </div>
            ) : filtered.length === 0 && !showAddNew ? (
              <div className="px-3 py-6 text-center text-sm text-muted-foreground">
                Không có dữ liệu
              </div>
            ) : (
              <>
                {filtered.map((item, index) => (
                  <button
                    key={item.id}
                    type="button"
                    className={`w-full text-left px-3 py-2 text-sm transition-colors
                      ${value === item.id ? 'bg-primary/10 text-primary font-medium' : ''}
                      ${highlightIndex === index ? 'bg-accent text-accent-foreground' : 'hover:bg-accent hover:text-accent-foreground'}
                    `}
                    onClick={() => handleSelect(item.id)}
                    onMouseEnter={() => setHighlightIndex(index)}
                  >
                    {item.name}
                  </button>
                ))}

                {/* Add new option */}
                {showAddNew && (
                  <button
                    type="button"
                    className={`w-full text-left px-3 py-2 text-sm border-t border-border
                      text-primary font-medium
                      ${highlightIndex === filtered.length ? 'bg-accent' : 'hover:bg-accent'}
                    `}
                    onClick={handleAddNew}
                    onMouseEnter={() => setHighlightIndex(filtered.length)}
                  >
                    + Thêm &quot;{search}&quot;
                  </button>
                )}
              </>
            )}
          </div>
        )}
      </div>
      {error && (
        <p className="text-xs text-destructive">{error}</p>
      )}
    </div>
  )
}
