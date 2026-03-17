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

    const startSyncTimer = () => {
      if (syncTimerRef.current) clearInterval(syncTimerRef.current)
      if (onTimeUpdate) {
        syncTimerRef.current = setInterval(() => {
          try {
            const t = playerRef.current?.getCurrentTime?.()
            if (t != null) onTimeUpdate(t)
          } catch (_) {}
        }, 400)
      }
    }

    // If player already exists, just load the new video — don't destroy/recreate,
    // because YT.Player replaces the div with an iframe; destroy() removes it from
    // the DOM so the container no longer exists for the next YT.Player() call.
    if (playerRef.current) {
      try {
        playerRef.current.cueVideoById(videoId)
        startSyncTimer()
      } catch (_) {
        // If the existing player is in a broken state, fall through to full reinit below
        destroyPlayer()
      }
      if (playerRef.current) return
    }

    const createContainer = () => {
      // The original div may have been replaced by an iframe and then removed.
      // Re-insert a fresh div so YT.Player has a target element.
      let el = document.getElementById(containerId)
      if (!el) {
        const parent = document.querySelector(`[data-yt-container="${containerId}"]`)
        if (parent) {
          el = document.createElement('div')
          el.id = containerId
          parent.appendChild(el)
        }
      }
    }

    const initPlayer = () => {
      createContainer()
      const el = document.getElementById(containerId)
      if (!el) return

      playerRef.current = new window.YT.Player(containerId, {
        videoId,
        width: '100%',
        height: '100%',
        playerVars: { autoplay: 0, modestbranding: 1, rel: 0 },
        events: {
          onReady: () => {
            setPlayerReady(true)
            startSyncTimer()
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
