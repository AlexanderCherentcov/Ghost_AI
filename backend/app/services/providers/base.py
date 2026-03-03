from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import AsyncGenerator, Optional


@dataclass
class LLMResponse:
    content: str
    tokens_in: int
    tokens_out: int
    model: str
    provider: str
    latency_ms: int


@dataclass
class ImageResponse:
    image_url: str
    provider: str
    model: str
    latency_ms: int


@dataclass
class STTResponse:
    transcript: str
    duration_sec: float
    provider: str


@dataclass
class TTSResponse:
    audio_url: str
    provider: str
    duration_sec: float


class BaseLLMProvider(ABC):
    @abstractmethod
    async def chat_complete(
        self,
        messages: list,
        model: str,
        max_tokens: int = 2048,
        temperature: float = 0.7,
        system_prompt: str = None,
    ) -> LLMResponse:
        pass

    @abstractmethod
    async def chat_stream(
        self,
        messages: list,
        model: str,
        max_tokens: int = 2048,
        system_prompt: str = None,
    ) -> AsyncGenerator[str, None]:
        pass


class BaseImageProvider(ABC):
    @abstractmethod
    async def generate(
        self,
        prompt: str,
        negative_prompt: str = None,
        width: int = 512,
        height: int = 512,
        steps: int = 20,
    ) -> ImageResponse:
        pass


class BaseSTTProvider(ABC):
    @abstractmethod
    async def transcribe(self, audio_bytes: bytes, filename: str = "audio.ogg") -> STTResponse:
        pass


class BaseTTSProvider(ABC):
    @abstractmethod
    async def synthesize(self, text: str, voice_id: str = None) -> TTSResponse:
        pass
