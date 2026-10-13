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

## Запуск в разработке

Установи зависимости один раз:

```bash
npm install
python -m pip install -r requirements.txt
```

Для Python 3.15 pre-release используй `python -m pip install --ignore-requires-python -r requirements.txt`: библиотека пока официально ограничивает Python версией ниже 3.15.

Запусти API и React вместе одной командой:

```bash
npm run dev
```

Открой `http://localhost:3000`. `npm run dev` запускает Python API на `8765` и Vite на `3000`; останови оба сочетанием Ctrl+C.

## Запуск готового приложения

Собери React-приложение и запусти Python-сервер одной командой:

```bash
npm start
```

Открой `http://localhost:3000`. `npm start` сначала собирает React в `dist/`, затем запускает Python-сервер, который раздаёт приложение и API. Чтобы запустить уже собранную версию без повторной сборки, используй `npm run serve`.
