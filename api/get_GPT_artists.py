from http.server import BaseHTTPRequestHandler
from json import dumps, loads

from api.helpers.openai_helper import PlaylistMakerGPT


class handler(BaseHTTPRequestHandler):
    def _send_json(self, status_code, payload):
        self.send_response(status_code)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.end_headers()
        self.wfile.write(dumps(payload).encode())

    def do_OPTIONS(self):
        self._send_json(200, {"ok": True})

    def do_POST(self):
        try:
            content_length = int(self.headers.get('Content-Length', 0))
            if content_length <= 0:
                return self._send_json(400, {"error": "Request body is required."})
            post_data = self.rfile.read(content_length)
            request_body = loads(post_data)
        except Exception:
            return self._send_json(400, {"error": "Invalid JSON payload."})

        user_input = (request_body.get('input') or "").strip()
        top_artists = request_body.get('artist_ids') or []
        api_key = (request_body.get("openai_api_key") or "").strip()

        if not user_input:
            return self._send_json(400, {"error": "A vibe phrase is required."})
        if not isinstance(top_artists, list):
            return self._send_json(400, {"error": "artist_ids must be an array."})
        if len(top_artists) == 0:
            return self._send_json(400, {"error": "artist_ids cannot be empty."})
        if not api_key:
            return self._send_json(400, {"error": "OpenAI API key is required."})
        if len(api_key) < 20:
            return self._send_json(400, {"error": "OpenAI API key format looks invalid."})

        oah = PlaylistMakerGPT(api_key)

        try:
            [user_artists, public_artists] = oah.get_artists_from_input(user_input, top_artists[:20])
        except Exception as error:
            return self._send_json(502, {"error": f"OpenAI request failed: {str(error)}"})

        response_data = {"public_artists": public_artists, "user_artists": user_artists}
        self._send_json(200, response_data)
