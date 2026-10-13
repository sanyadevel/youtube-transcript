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

Запусти Python API и Vite в двух терминалах:

```bash
& "$env:LOCALAPPDATA\Programs\Python\Python315\python.exe" server.py --port 8765
```

```bash
npm run dev
```

Открой адрес, который напечатает Vite (обычно `http://localhost:3000`). Vite проксирует `/api/*` на Python-сервер `http://localhost:8765`.

## Запуск готового приложения

Собери React-приложение и запусти Python-сервер:

```bash
npm run build
& "$env:LOCALAPPDATA\Programs\Python\Python315\python.exe" server.py --port 8765
```

Открой `http://localhost:3000`. Python-сервер раздаёт файлы из `dist/` и обрабатывает `/api/transcript` на том же порту. Если `dist/` ещё не создан, сначала выполни `npm run build`.
