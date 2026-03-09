import type { TranscriptResponse } from '../types'

const BASE = '/api'

export async function fetchTranscript(url: string): Promise<TranscriptResponse> {
  const res = await fetch(`${BASE}/transcript?url=${encodeURIComponent(url)}`)
  const data = await res.json()

  if (data.error) throw new Error(data.error)
  if (!data.segments?.length) throw new Error('Субтитры не найдены для этого видео')

  return data as TranscriptResponse
}
