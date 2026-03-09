import styles from './ErrorStrip.module.css'

interface ErrorStripProps {
  message: string | null
}

export function ErrorStrip({ message }: ErrorStripProps) {
  if (!message) return null
  return (
    <div className={styles.strip}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0 }}>
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
      </svg>
      <span>{message}</span>
    </div>
  )
}
