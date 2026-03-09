import { useState, type KeyboardEvent } from 'react'
import type { LoadState } from '../types'
import styles from './SearchBar.module.css'

interface SearchBarProps {
  state: LoadState
  onLoad: (url: string) => void
}

export function SearchBar({ state, onLoad }: SearchBarProps) {
  const [value, setValue] = useState('')
  const loading = state === 'loading'

  const handleLoad = () => {
    if (!value.trim() || loading) return
    onLoad(value.trim())
  }

  const handleKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleLoad()
  }

  return (
    <div className={styles.bar}>
      <div className={styles.inputWrap}>
        <span className={styles.icon}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2">
            <path d="M10 3a7 7 0 100 14A7 7 0 0010 3zM21 21l-4.35-4.35" />
          </svg>
        </span>
        <input
          className={styles.input}
          type="text"
          value={value}
          onChange={e => setValue(e.target.value)}
          onKeyDown={handleKey}
          placeholder="https://www.youtube.com/watch?v=..."
          disabled={loading}
        />
      </div>
      <button
        className={styles.btn}
        onClick={handleLoad}
        disabled={loading || !value.trim()}
      >
        {loading ? (
          <>
            <span className={styles.spinner} />
            Загрузка...
          </>
        ) : (
          <>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.5">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z" />
            </svg>
            Загрузить
          </>
        )}
      </button>
    </div>
  )
}
