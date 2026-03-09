import styles from './Header.module.css'

export function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.logoMark}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z" />
        </svg>
      </div>
      <span className={styles.logoText}>Transcript</span>
      <span className={styles.logoDivider}>/</span>
      <span className={styles.logoSub}>YouTube</span>
    </header>
  )
}
