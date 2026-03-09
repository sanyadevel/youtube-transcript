import { memo } from 'react'
import type { Segment } from '../types'
import { formatTime } from '../utils'
import styles from './SegmentItem.module.css'

interface SegmentItemProps {
  segment: Segment
  index: number
  isActive: boolean
  onSeek: (seconds: number) => void
}

export const SegmentItem = memo(function SegmentItem({
  segment,
  isActive,
  onSeek,
}: SegmentItemProps) {
  return (
    <div
      className={`${styles.seg} ${isActive ? styles.active : ''}`}
      onClick={() => onSeek(segment.start)}
    >
      <span
        className={styles.timestamp}
        title={`Перемотать на ${formatTime(segment.start)}`}
        onClick={e => { e.stopPropagation(); onSeek(segment.start) }}
      >
        {formatTime(segment.start)}
      </span>
      <span className={styles.text}>{segment.text}</span>
    </div>
  )
})
