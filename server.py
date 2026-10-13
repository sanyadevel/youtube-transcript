#!/usr/bin/env python3
"""
YouTube Transcript Server
Запуск: python3 server.py
"""

from http.server import HTTPServer, BaseHTTPRequestHandler
import argparse
import json
import mimetypes
import os
import re
import urllib.parse

ROOT_DIR = os.path.dirname(os.path.abspath(__file__))
DIST_DIR = os.path.join(ROOT_DIR, 'dist')
NO_TRANSCRIPT_ERRORS = {'NoTranscriptFound', 'TranscriptsDisabled'}


class NoTranscriptAvailable(Exception):
    pass

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
            if hasattr(ytt, 'fetch'):
                # youtube-transcript-api 1.x
                if langs:
                    transcript = ytt.fetch(video_id, languages=langs)
                else:
                    transcript = next(iter(ytt.list(video_id))).fetch()
            elif langs:
                # youtube-transcript-api 0.x
                transcript = YouTubeTranscriptApi.get_transcript(video_id, languages=langs)
            else:
                transcript = next(iter(YouTubeTranscriptApi.list_transcripts(video_id))).fetch()

            segments = []
            for snippet in transcript:
                if isinstance(snippet, dict):
                    start, text = snippet.get('start', 0), snippet.get('text', '')
                else:
                    start, text = snippet.start, snippet.text
                text = text.strip()
                if text:
                    segments.append({"start": round(start, 2), "text": text})
            return segments
        except StopIteration:
            continue
        except Exception as e:
            if type(e).__name__ in NO_TRANSCRIPT_ERRORS:
                continue
            # Keep the upstream reason visible. Previously all exceptions were
            # swallowed and reported as a misleading 404 "no subtitles".
            raise RuntimeError(f"YouTube: {type(e).__name__}: {e}") from e
    raise NoTranscriptAvailable(
        "У видео нет доступных субтитров на русском, английском или других языках"
    )


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
            except NoTranscriptAvailable as e:
                self._json(404, {"error": str(e)})
            except Exception as e:
                self._json(502, {"error": str(e)})

        elif path.startswith('/api/') or path == '/api':
            self._json(404, {"error": "API endpoint not found"})

        # ── app shell and static assets ──
        else:
            self._static_file(path)

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

    def _static_file(self, path):
        # Serve the Vite build. For client-side routes, fall back to index.html.
        if not os.path.isdir(DIST_DIR):
            return self._json(503, {
                "error": "Frontend build not found. Run 'npm run build' first."
            })

        relative_path = urllib.parse.unquote(path).lstrip('/')
        filepath = os.path.realpath(os.path.join(DIST_DIR, relative_path))
        if os.path.normcase(os.path.commonpath((DIST_DIR, filepath))) != os.path.normcase(DIST_DIR):
            return self._json(404, {"error": "Not found"})

        if path == '/' or not os.path.isfile(filepath):
            # Missing asset requests should stay 404; extensionless paths are SPA routes.
            if path != '/' and os.path.splitext(relative_path)[1]:
                return self._json(404, {"error": "Not found"})
            filepath = os.path.join(DIST_DIR, 'index.html')

        try:
            with open(filepath, 'rb') as f:
                body = f.read()
            self.send_response(200)
            content_type = mimetypes.guess_type(filepath)[0] or 'application/octet-stream'
            if content_type.startswith('text/') or content_type in ('application/javascript', 'application/json'):
                content_type += '; charset=utf-8'
            self.send_header('Content-Type', content_type)
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Content-Length', len(body))
            self.end_headers()
            self.wfile.write(body)
        except FileNotFoundError:
            self._json(503, {
                "error": "Frontend build is incomplete. Run 'npm run build' first."
            })


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='YouTube transcript app server')
    parser.add_argument('--port', type=int, default=int(os.environ.get('PORT', '3000')))
    port = parser.parse_args().port
    print(f"\n  ✅  Сервер: http://localhost:{port}")
    print(f"  📺  Приложение: http://localhost:{port}")
    print(f"  🔒  API:         http://localhost:{port}/api/transcript?url=...")
    print(f"  🛑  Стоп:   Ctrl+C\n")
    server = HTTPServer(('localhost', port), Handler)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n  👋  Остановлен")
