import { useState } from 'react'
import type { Segment } from '../types'
import { formatTime } from '../utils'
import { SegmentItem } from './SegmentItem'
import styles from './TranscriptPanel.module.css'

interface TranscriptPanelProps {
  segments: Segment[]
  currentIndex: number
  onSeek: (seconds: number) => void
}

export function TranscriptPanel({ segments, currentIndex, onSeek }: TranscriptPanelProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    const text = segments.map(s => `[${formatTime(s.start)}] ${s.text}`).join('\n')
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2200)
    })
  }

  const lastSegment = segments[segments.length - 1]

  return (
    <div className={styles.panel}>
      <div className={styles.topbar}>
        {segments.length > 0 ? (
          <div className={styles.stats}>
            <strong>{segments.length}</strong> сегментов
            <span className={styles.dot}>·</span>
            <strong>{formatTime(lastSegment?.start ?? 0)}</strong> длительность
          </div>
        ) : (
          <div className={styles.statsEmpty}>Транскрипция</div>
        )}

        {segments.length > 0 && (
          <button
            className={`${styles.copyBtn} ${copied ? styles.copied : ''}`}
            onClick={handleCopy}
          >
            {copied ? (
              <>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2.5">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
                Скопировано
              </>
            ) : (
              <>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2.5">
                  <rect x="9" y="9" width="13" height="13" rx="2" />
                  <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                </svg>
                Копировать
              </>
            )}
          </button>
        )}
      </div>

      <div className={styles.list}>
        {segments.length === 0 ? (
          <div className={styles.empty}>
            <div className={styles.emptyIcon}>◈</div>
            <p>Введи ссылку на видео<br />и нажми «Загрузить»</p>
          </div>
        ) : (
          segments.map((seg, i) => (
            <SegmentItem
              key={`${seg.start}-${i}`}
              segment={seg}
              index={i}
              isActive={i === currentIndex}
              onSeek={onSeek}
            />
          ))
        )}
      </div>

      {segments.length > 0 && (
        <div className={styles.footer}>
          <span className={styles.kbd}>клик на тайминг</span>
          <span className={styles.footerText}>— перемотка видео</span>
        </div>
      )}
    </div>
  )
}
