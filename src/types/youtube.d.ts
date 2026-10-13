declare global {
  namespace YT {
    interface Player {
      cueVideoById(videoId: string): void
      destroy(): void
      getCurrentTime(): number
      playVideo(): void
      seekTo(seconds: number, allowSeekAhead: boolean): void
    }

    interface PlayerOptions {
      videoId: string
      width: string
      height: string
      playerVars?: {
        autoplay?: 0 | 1
        modestbranding?: 0 | 1
        rel?: 0 | 1
      }
      events?: {
        onReady?: () => void
      }
    }
  }

  interface Window {
    onYouTubeIframeAPIReady: () => void
    YT: {
      Player: new (elementId: string, options: YT.PlayerOptions) => YT.Player
    }
  }
}

export {}
