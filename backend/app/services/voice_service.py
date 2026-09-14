import re
import httpx
from typing import Optional, AsyncGenerator
import edge_tts

class VoiceService:
    """
    ARVIX Neural Voice Synthesizer & Speech Cache Service
    Supports trilingual speech synthesis (Bengali, Hindi, English).
    """

    BENGALI_VOICE = "bn-IN-BashkarNeural"
    HINDI_VOICE = "hi-IN-MadhurNeural"
    ENGLISH_VOICE = "en-GB-RyanNeural"

    def __init__(self):
        self._cache: dict = {}

    @staticmethod
    def detect_language(text: str) -> str:
        """Detect language from Unicode scripts"""
        if re.search(r"[\u0980-\u09ff]", text):
            return "bn"
        if re.search(r"[\u0900-\u097f]", text):
            return "hi"
        return "en"

    @staticmethod
    def clean_for_speech(text: str) -> str:
        """Strips markdown, emojis, symbols, and links for crystal-clear TTS pronunciation"""
        cleaned = re.sub(r"\*\*|__", "", text)
        cleaned = re.sub(r"[*#`_~>\[\]()]", "", cleaned)
        cleaned = re.sub(r"https?://\S+", "link", cleaned)
        cleaned = re.sub(r"[\U00010000-\U0010ffff]", "", cleaned)
        cleaned = re.sub(r"\s+", " ", cleaned).strip()
        return cleaned

    def get_cached_audio(self, cache_key: str) -> Optional[bytes]:
        return self._cache.get(cache_key)

    def set_cached_audio(self, cache_key: str, audio: bytes) -> None:
        if len(self._cache) < 250:
            self._cache[cache_key] = audio

    def select_voice(self, lang: str, preferred_voice: Optional[str] = None) -> str:
        if preferred_voice:
            return preferred_voice
        if lang == "bn":
            return self.BENGALI_VOICE
        elif lang == "hi":
            return self.HINDI_VOICE
        return self.ENGLISH_VOICE

    async def stream_audio(self, clean_text: str, voice_id: str, lang: str) -> AsyncGenerator[bytes, None]:
        """Streams synthesized speech chunks via Edge TTS with Google TTS fallback"""
        audio_buffer = bytearray()
        cache_key = f"{voice_id}_deep_{clean_text}"

        try:
            # Consistent deep authoritative male voice (-8Hz pitch, rich resonant delivery)
            communicate = edge_tts.Communicate(clean_text, voice_id, rate="+0%", volume="+25%", pitch="-8Hz")
            async for chunk in communicate.stream():
                if chunk["type"] == "audio":
                    audio_buffer.extend(chunk["data"])
                    yield chunk["data"]
            if audio_buffer:
                self.set_cached_audio(cache_key, bytes(audio_buffer))
        except Exception as e:
            print(f"[VoiceService] Edge TTS notice: {e}, falling back to Google TTS...")
            url = "https://translate.google.com/translate_tts"
            params = {
                "ie": "UTF-8",
                "tl": lang,
                "client": "tw-ob",
                "q": clean_text[:200]
            }
            async with httpx.AsyncClient() as client:
                resp = await client.get(url, params=params, headers={"User-Agent": "Mozilla/5.0"})
                if resp.status_code == 200:
                    yield resp.content

voice_service = VoiceService()
