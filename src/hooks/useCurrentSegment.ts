import { useState, useCallback } from 'react'
import type { Segment } from '../types'

export function useCurrentSegment(segments: Segment[]) {
  const [currentIndex, setCurrentIndex] = useState<number>(-1)

  const update = useCallback((time: number) => {
    if (!segments.length) return
    let idx = 0
    for (let i = 0; i < segments.length; i++) {
      if (segments[i].start <= time) idx = i
      else break
    }
    setCurrentIndex(prev => prev === idx ? prev : idx)
  }, [segments])

  return { currentIndex, update }
}
