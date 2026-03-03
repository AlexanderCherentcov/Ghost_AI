import time
import httpx
from typing import AsyncGenerator
from app.services.providers.base import BaseLLMProvider, LLMResponse
from app.core.config import settings


class OpenAIProvider(BaseLLMProvider):
    """OpenAI-compatible API provider (works for OpenAI, Together AI, etc.)"""

    def __init__(self, api_key: str, base_url: str, default_model: str):
        self.api_key = api_key
        self.base_url = base_url.rstrip("/")
        self.default_model = default_model
        self.headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        }

    def _build_messages(self, messages: list, system_prompt: str = None) -> list:
        result = []
        if system_prompt:
            result.append({"role": "system", "content": system_prompt})
        result.extend(messages)
        return result

    async def chat_complete(
        self,
        messages: list,
        model: str = None,
        max_tokens: int = 2048,
        temperature: float = 0.7,
        system_prompt: str = None,
    ) -> LLMResponse:
        model = model or self.default_model
        start = time.time()

        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(
                f"{self.base_url}/chat/completions",
                headers=self.headers,
                json={
                    "model": model,
                    "messages": self._build_messages(messages, system_prompt),
                    "max_tokens": max_tokens,
                    "temperature": temperature,
                },
            )
            response.raise_for_status()
            data = response.json()

        latency = int((time.time() - start) * 1000)
        usage = data.get("usage", {})

        return LLMResponse(
            content=data["choices"][0]["message"]["content"],
            tokens_in=usage.get("prompt_tokens", 0),
            tokens_out=usage.get("completion_tokens", 0),
            model=model,
            provider="openai",
            latency_ms=latency,
        )

    async def chat_stream(
        self,
        messages: list,
        model: str = None,
        max_tokens: int = 2048,
        system_prompt: str = None,
    ) -> AsyncGenerator[str, None]:
        model = model or self.default_model

        async with httpx.AsyncClient(timeout=120.0) as client:
            async with client.stream(
                "POST",
                f"{self.base_url}/chat/completions",
                headers=self.headers,
                json={
                    "model": model,
                    "messages": self._build_messages(messages, system_prompt),
                    "max_tokens": max_tokens,
                    "stream": True,
                },
            ) as response:
                response.raise_for_status()
                async for line in response.aiter_lines():
                    if line.startswith("data: "):
                        chunk = line[6:]
                        if chunk == "[DONE]":
                            break
                        try:
                            import json
                            data = json.loads(chunk)
                            delta = data["choices"][0]["delta"].get("content", "")
                            if delta:
                                yield delta
                        except Exception:
                            continue


# Singleton instances
_premium_provider = None
_economy_provider = None


def get_premium_provider() -> OpenAIProvider:
    global _premium_provider
    if _premium_provider is None:
        _premium_provider = OpenAIProvider(
            api_key=settings.LLM_PREMIUM_API_KEY,
            base_url=settings.LLM_PREMIUM_BASE_URL,
            default_model=settings.LLM_PREMIUM_MODEL,
        )
    return _premium_provider


def get_economy_provider() -> OpenAIProvider:
    global _economy_provider
    if _economy_provider is None:
        _economy_provider = OpenAIProvider(
            api_key=settings.LLM_ECONOMY_API_KEY,
            base_url=settings.LLM_ECONOMY_BASE_URL,
            default_model=settings.LLM_ECONOMY_MODEL,
        )
    return _economy_provider
