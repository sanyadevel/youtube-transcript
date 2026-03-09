# Transcript App — React + TypeScript

## Структура проекта

```
transcript-react/
├── index.html
├── vite.config.ts          # Vite + proxy /api → localhost:8765
├── tsconfig.json
├── package.json
└── src/
    ├── main.tsx             # Точка входа
    ├── App.tsx              # Главный компонент
    ├── App.module.css
    ├── types/
    │   └── index.ts         # TypeScript типы
    ├── utils/
    │   ├── index.ts         # formatTime, extractVideoId
    │   └── api.ts           # fetchTranscript → /api/transcript
    ├── hooks/
    │   ├── useTranscript.ts      # Загрузка транскрипции
    │   ├── useYouTubePlayer.ts   # YouTube IFrame API
    │   └── useCurrentSegment.ts  # Активный сегмент по времени
    ├── components/
    │   ├── Header.tsx / .module.css
    │   ├── SearchBar.tsx / .module.css
    │   ├── VideoPlayer.tsx / .module.css
    │   ├── SegmentItem.tsx / .module.css
    │   ├── TranscriptPanel.tsx / .module.css
    │   ├── ErrorStrip.tsx / .module.css
    │   └── index.ts         # Barrel exports
    └── styles/
        └── globals.css      # CSS переменные + reset
```

## Запуск

### 1. Запусти Python сервер (из папки transcript-app)
```bash
cd ../transcript-app
python3 server.py
```

### 2. Установи зависимости и запусти React
```bash
cd transcript-react
npm install
npm run dev
```

Открой: http://localhost:3000

Vite автоматически проксирует `/api/*` → `http://localhost:8765/api/*`
