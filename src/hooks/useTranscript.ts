import { useState, useCallback } from 'react'
import type { Segment, LoadState } from '../types'
import { fetchTranscript } from '../utils/api'

interface UseTranscriptReturn {
  segments: Segment[]
  videoId: string | null
  state: LoadState
  error: string | null
  load: (url: string) => Promise<void>
}

export function useTranscript(): UseTranscriptReturn {
  const [segments, setSegments] = useState<Segment[]>([])
  const [videoId, setVideoId] = useState<string | null>(null)
  const [state, setState] = useState<LoadState>('idle')
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async (url: string) => {
    if (!url.trim()) return
    setState('loading')
    setError(null)
    setSegments([])
    setVideoId(null)

    try {
      const data = await fetchTranscript(url)
      setSegments(data.segments)
      setVideoId(data.video_id)
      setState('success')
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Неизвестная ошибка'
      setError(msg)
      setState('error')
    }
  }, [])

  return { segments, videoId, state, error, load }
}
