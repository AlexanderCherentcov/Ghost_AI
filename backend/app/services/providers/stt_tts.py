import time
import httpx
import uuid
import os
from app.services.providers.base import BaseSTTProvider, BaseTTSProvider, STTResponse, TTSResponse
from app.core.config import settings


class WhisperSTTProvider(BaseSTTProvider):
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.base_url = "https://api.openai.com/v1"

    async def transcribe(self, audio_bytes: bytes, filename: str = "audio.ogg") -> STTResponse:
        # Estimate duration from file size (rough: ~16KB/sec for ogg)
        duration_sec = len(audio_bytes) / 16000

        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(
                f"{self.base_url}/audio/transcriptions",
                headers={"Authorization": f"Bearer {self.api_key}"},
                files={"file": (filename, audio_bytes, "audio/ogg")},
                data={"model": "whisper-1", "language": "ru"},
            )
            response.raise_for_status()
            data = response.json()

        return STTResponse(
            transcript=data["text"],
            duration_sec=duration_sec,
            provider="whisper",
        )


class OpenAITTSProvider(BaseTTSProvider):
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.base_url = "https://api.openai.com/v1"

    async def synthesize(self, text: str, voice_id: str = None) -> TTSResponse:
        voice = voice_id or settings.TTS_VOICE_ID

        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(
                f"{self.base_url}/audio/speech",
                headers={
                    "Authorization": f"Bearer {self.api_key}",
                    "Content-Type": "application/json",
                },
                json={
                    "model": "tts-1",
                    "input": text,
                    "voice": voice,
                    "response_format": "mp3",
                },
            )
            response.raise_for_status()
            audio_bytes = response.content

        filename = f"{uuid.uuid4()}.mp3"
        filepath = f"/app/uploads/{filename}"
        os.makedirs("/app/uploads", exist_ok=True)
        with open(filepath, "wb") as f:
            f.write(audio_bytes)

        # Estimate duration: ~8KB/sec for mp3
        duration_sec = len(audio_bytes) / 8000

        return TTSResponse(
            audio_url=f"/uploads/{filename}",
            provider="openai_tts",
            duration_sec=duration_sec,
        )


_stt_provider = None
_tts_provider = None


def get_stt_provider() -> WhisperSTTProvider:
    global _stt_provider
    if _stt_provider is None:
        _stt_provider = WhisperSTTProvider(api_key=settings.WHISPER_API_KEY or settings.LLM_PREMIUM_API_KEY)
    return _stt_provider


def get_tts_provider() -> OpenAITTSProvider:
    global _tts_provider
    if _tts_provider is None:
        _tts_provider = OpenAITTSProvider(api_key=settings.TTS_API_KEY or settings.LLM_PREMIUM_API_KEY)
    return _tts_provider
