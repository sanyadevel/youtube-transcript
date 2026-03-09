import { useEffect, useRef, useCallback, useState } from 'react'

interface UseYouTubePlayerOptions {
  containerId: string
  videoId: string | null
  onTimeUpdate?: (time: number) => void
}

export function useYouTubePlayer({ containerId, videoId, onTimeUpdate }: UseYouTubePlayerOptions) {
  const playerRef = useRef<YT.Player | null>(null)
  const syncTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const [playerReady, setPlayerReady] = useState(false)

  const destroyPlayer = useCallback(() => {
    if (syncTimerRef.current) {
      clearInterval(syncTimerRef.current)
      syncTimerRef.current = null
    }
    if (playerRef.current) {
      try { playerRef.current.destroy() } catch (_) {}
      playerRef.current = null
    }
    setPlayerReady(false)
  }, [])

  const seekTo = useCallback((seconds: number) => {
    if (!playerRef.current) return
    try {
      playerRef.current.seekTo(seconds, true)
      playerRef.current.playVideo()
    } catch (_) {}
  }, [])

  useEffect(() => {
    if (!videoId) return

    const initPlayer = () => {
      destroyPlayer()

      playerRef.current = new window.YT.Player(containerId, {
        videoId,
        width: '100%',
        height: '100%',
        playerVars: { autoplay: 0, modestbranding: 1, rel: 0 },
        events: {
          onReady: () => {
            setPlayerReady(true)
            if (onTimeUpdate) {
              syncTimerRef.current = setInterval(() => {
                try {
                  const t = playerRef.current?.getCurrentTime?.()
                  if (t != null) onTimeUpdate(t)
                } catch (_) {}
              }, 400)
            }
          },
        },
      })
    }

    // YouTube API might not be ready yet
    if (window.YT?.Player) {
      initPlayer()
    } else {
      const prev = window.onYouTubeIframeAPIReady
      window.onYouTubeIframeAPIReady = () => {
        prev?.()
        initPlayer()
      }
    }

    return destroyPlayer
  }, [videoId, containerId, destroyPlayer, onTimeUpdate])

  return { seekTo, playerReady }
}
