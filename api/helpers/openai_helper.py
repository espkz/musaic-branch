import os
import re
import requests

class PlaylistMakerGPT:

    def __init__(self, api_key, model=None):
        self.api_key = (api_key or "").strip()
        self.model = model or os.environ.get("OPENAI_MODEL", "gpt-5-mini")
        self.base_url = os.environ.get("OPENAI_BASE_URL", "https://api.openai.com/v1").rstrip("/")

    def _chat_completion(self, prompt):
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }
        payload = {
            "model": self.model,
            "temperature": 0.25,
            "messages": [
                {"role": "system", "content": "You generate only clean comma-separated artist names with no extra text."},
                {"role": "user", "content": prompt},
            ],
        }
        response = requests.post(
            f"{self.base_url}/chat/completions",
            headers=headers,
            json=payload,
            timeout=30,
        )
        response.raise_for_status()
        response_data = response.json()
        return response_data["choices"][0]["message"]["content"]

    def _process_artist_list(self, artist_list_text):
        split_text = re.split(r",|\n|;", artist_list_text)
        cleaned = []
        for artist in split_text:
            normalized = artist.strip().strip('"').strip("'")
            normalized = re.sub(r"^\d+[\.\)]\s*", "", normalized)
            normalized = normalized.replace("•", "").strip()
            if normalized:
                cleaned.append(normalized)

        deduped = []
        seen = set()
        for artist in cleaned:
            key = artist.lower()
            if key not in seen:
                seen.add(key)
                deduped.append(artist)

        return deduped[:8]

    def get_artists_from_input(self, user_input, top_artists):
        prompt = (
            "Based on the following input phrase, provide a comma separated list consisting of "
            "nothing but the names of 8 artists on Spotify that best evoke the feeling in the phrase. "
            "If the phrase is vague, use your best judgment. "
            f"Input phrase: '{user_input}'"
        )
        public_response = self._chat_completion(prompt)
        artist_list_1 = self._process_artist_list(public_response)

        prompt = (
            "Based on the following input phrase and list of artists, provide a comma separated list "
            "consisting of nothing but the names of 8 artists from the provided list that best evoke "
            "the feeling in the phrase. "
            f"Input phrase: '{user_input}'. Artist list: '{', '.join(top_artists)}'"
        )
        user_response = self._chat_completion(prompt)
        artist_list_2 = self._process_artist_list(user_response)

        return [artist_list_2, artist_list_1]
