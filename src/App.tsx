import { useCallback } from 'react'
import { useTranscript } from './hooks/useTranscript'
import { useCurrentSegment } from './hooks/useCurrentSegment'
import { useYouTubePlayer } from './hooks/useYouTubePlayer'
import {
  Header,
  SearchBar,
  VideoPlayer,
  TranscriptPanel,
  ErrorStrip,
} from './components'
import styles from './App.module.css'

export function App() {
  const { segments, videoId, state, error, load } = useTranscript()
  const { currentIndex, update } = useCurrentSegment(segments)

  const { seekTo } = useYouTubePlayer({
    containerId: 'yt-player',
    videoId,
    onTimeUpdate: update,
  })

  const handleSeek = useCallback((seconds: number) => {
    seekTo(seconds)
  }, [seekTo])

  return (
    <div className={styles.app}>
      <Header />
      <SearchBar state={state} onLoad={load} />
      <ErrorStrip message={error} />

      <div className={styles.workspace}>
        <VideoPlayer videoId={videoId} />
        <TranscriptPanel
          segments={segments}
          currentIndex={currentIndex}
          onSeek={handleSeek}
        />
      </div>
    </div>
  )
}
