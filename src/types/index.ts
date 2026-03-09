export interface Segment {
  start: number
  text: string
}

export interface TranscriptResponse {
  video_id: string
  segments: Segment[]
}

export type LoadState = 'idle' | 'loading' | 'success' | 'error'

// Extend window for YouTube IFrame API
declare global {
  interface Window {
    onYouTubeIframeAPIReady: () => void
    YT: typeof YT
  }
}
