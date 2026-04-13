import json
import os
from urllib.parse import urlencode
from http.server import BaseHTTPRequestHandler

import requests

SPOTIFY_TOKEN_ENDPOINT = "https://accounts.spotify.com/api/token"


class handler(BaseHTTPRequestHandler):
    def _send_json(self, status_code, payload):
        self.send_response(status_code)
        self.send_header("Content-type", "application/json")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.send_header("Access-Control-Allow-Methods", "POST, OPTIONS")
        self.end_headers()
        self.wfile.write(json.dumps(payload).encode())

    def do_OPTIONS(self):
        self._send_json(200, {"ok": True})

    def do_POST(self):
        client_id = os.environ.get("SPOTIFY_CLIENT_ID")
        client_secret = os.environ.get("SPOTIFY_CLIENT_SECRET")
        redirect_uri = os.environ.get("SPOTIFY_REDIRECT_URI")

        if not client_id or not client_secret or not redirect_uri:
            return self._send_json(500, {"error": "Spotify environment variables are not configured."})

        try:
            content_length = int(self.headers.get("Content-Length", 0))
            post_data = self.rfile.read(content_length) if content_length > 0 else b"{}"
            payload = json.loads(post_data)
            code = (payload.get("code") or "").strip()
        except Exception:
            return self._send_json(400, {"error": "Invalid JSON payload."})

        if not code:
            return self._send_json(400, {"error": "Authorization code is required."})

        request_body = {
            "client_id": client_id,
            "client_secret": client_secret,
            "grant_type": "authorization_code",
            "code": code,
            "redirect_uri": redirect_uri,
        }

        try:
            response = requests.post(
                SPOTIFY_TOKEN_ENDPOINT,
                data=urlencode(request_body),
                headers={"Content-Type": "application/x-www-form-urlencoded"},
                timeout=20,
            )
            token_data = response.json()
        except Exception:
            return self._send_json(502, {"error": "Failed to communicate with Spotify token API."})

        if response.status_code >= 400:
            return self._send_json(response.status_code, {"error": token_data.get("error_description", "Token exchange failed.")})

        return self._send_json(200, token_data)
