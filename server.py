#!/usr/bin/env python3
"""
YouTube Transcript Server
Запуск: python3 server.py
"""

from http.server import HTTPServer, BaseHTTPRequestHandler
import json, re, urllib.parse, os

def get_video_id(url):
    patterns = [
        r'(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)',
        r'^([a-zA-Z0-9_-]{11})$'
    ]
    for p in patterns:
        m = re.search(p, url)
        if m: return m.group(1)
    return None

def fetch_transcript(video_id):
    from youtube_transcript_api import YouTubeTranscriptApi
    ytt = YouTubeTranscriptApi()
    for langs in (['ru'], ['en'], None):
        try:
            t = ytt.fetch(video_id, languages=langs) if langs else \
                next(iter(ytt.list(video_id))).fetch()
            return [{"start": round(s.start, 2), "text": s.text.strip()}
                    for s in t if s.text.strip()]
        except Exception:
            continue
    raise Exception("Субтитры не найдены для этого видео")


class Handler(BaseHTTPRequestHandler):
    def log_message(self, fmt, *args):
        print(f"  {self.address_string()} → {fmt % args}")

    def do_OPTIONS(self):
        self._cors(200)

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        path   = parsed.path
        params = urllib.parse.parse_qs(parsed.query)

        # ── /api/transcript  (hidden proxy — this is what browser sees) ──
        if path == '/api/transcript':
            url = params.get('url', [''])[0]
            if not url:
                return self._json(400, {"error": "Укажи параметр url"})
            vid = get_video_id(url)
            if not vid:
                return self._json(400, {"error": "Не удалось определить ID видео"})
            try:
                segs = fetch_transcript(vid)
                self._json(200, {"video_id": vid, "segments": segs})
            except Exception as e:
                err = str(e)
                code = 404 if "не найден" in err.lower() or "disabled" in err.lower() else 500
                self._json(code, {"error": err})

        # ── / and static ──
        elif path in ('/', '/index.html'):
            self._file('frontend/index.html', 'text/html; charset=utf-8')
        else:
            self._json(404, {"error": "Not found"})

    # ── helpers ──
    def _cors(self, status):
        self.send_response(status)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def _json(self, status, data):
        body = json.dumps(data, ensure_ascii=False).encode()
        self.send_response(status)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Content-Length', len(body))
        self.end_headers()
        self.wfile.write(body)

    def _file(self, filepath, ctype):
        try:
            with open(filepath, 'rb') as f:
                body = f.read()
            self.send_response(200)
            self.send_header('Content-Type', ctype)
            self.send_header('Content-Length', len(body))
            self.end_headers()
            self.wfile.write(body)
        except FileNotFoundError:
            self._json(404, {"error": f"{filepath} not found"})


if __name__ == '__main__':
    port = 8765
    print(f"\n  ✅  Сервер: http://localhost:{port}")
    print(f"  📺  Открой: http://localhost:{port}")
    print(f"  🔒  API:    http://localhost:{port}/api/transcript?url=...")
    print(f"  🛑  Стоп:   Ctrl+C\n")
    server = HTTPServer(('localhost', port), Handler)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n  👋  Остановлен")
