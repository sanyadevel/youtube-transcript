import styles from './VideoPlayer.module.css'

interface VideoPlayerProps {
  videoId: string | null
}

export function VideoPlayer({ videoId }: VideoPlayerProps) {
  return (
    <div className={styles.panel}>
      <div className={styles.stage}>
        {!videoId && (
          <div className={styles.empty}>
            <div className={styles.emptyRing}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="var(--border2)">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
            <p className={styles.emptyText}>Видео загрузится здесь</p>
          </div>
        )}
        <div
          id="yt-player"
          className={styles.player}
          style={{ display: videoId ? 'block' : 'none' }}
        />
      </div>

      <div className={styles.info}>
        {videoId && (
          <>
            <div className={styles.infoId}>video_id: {videoId}</div>
            <div className={styles.tips}>
              <div className={styles.tip}>
                <span className={styles.tipIcon}>▶</span>
                <span>Нажми на видео чтобы смотреть</span>
              </div>
              <div className={styles.tip}>
                <span className={styles.tipIcon}>⏱</span>
                <span>Нажми на <strong>тайминг</strong> в транскрипции — перемотка</span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
