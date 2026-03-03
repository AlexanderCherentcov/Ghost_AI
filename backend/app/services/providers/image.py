import time
import httpx
import base64
import uuid
import os
from app.services.providers.base import BaseImageProvider, ImageResponse
from app.core.config import settings


class StabilityProvider(BaseImageProvider):
    def __init__(self, api_key: str, api_url: str):
        self.api_key = api_key
        self.api_url = api_url.rstrip("/")
        self.headers = {
            "Authorization": f"Bearer {api_key}",
            "Accept": "application/json",
        }

    async def generate(
        self,
        prompt: str,
        negative_prompt: str = None,
        width: int = 512,
        height: int = 512,
        steps: int = 20,
    ) -> ImageResponse:
        start = time.time()

        payload = {
            "text_prompts": [{"text": prompt, "weight": 1}],
            "width": width,
            "height": height,
            "steps": steps,
            "samples": 1,
        }
        if negative_prompt:
            payload["text_prompts"].append({"text": negative_prompt, "weight": -1})

        async with httpx.AsyncClient(timeout=120.0) as client:
            response = await client.post(
                f"{self.api_url}/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image",
                headers=self.headers,
                json=payload,
            )
            response.raise_for_status()
            data = response.json()

        latency = int((time.time() - start) * 1000)
        image_b64 = data["artifacts"][0]["base64"]

        # Save locally (in production use S3)
        filename = f"{uuid.uuid4()}.png"
        filepath = f"/app/uploads/{filename}"
        os.makedirs("/app/uploads", exist_ok=True)
        with open(filepath, "wb") as f:
            f.write(base64.b64decode(image_b64))

        image_url = f"/uploads/{filename}"

        return ImageResponse(
            image_url=image_url,
            provider="stability",
            model="sdxl-1024-v1-0",
            latency_ms=latency,
        )


_image_provider = None


def get_image_provider() -> StabilityProvider:
    global _image_provider
    if _image_provider is None:
        _image_provider = StabilityProvider(
            api_key=settings.IMAGE_API_KEY,
            api_url=settings.IMAGE_API_URL,
        )
    return _image_provider
