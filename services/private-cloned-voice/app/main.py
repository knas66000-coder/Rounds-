"""Authenticated HTTP interface for the private cloned-voice service."""

from __future__ import annotations

from collections import defaultdict, deque
import hmac
import time
from typing import Annotated, Literal

from fastapi import Depends, FastAPI, Header, HTTPException, Request, status
from fastapi.responses import Response
from pydantic import BaseModel, ConfigDict, Field

from app.config import ServiceConfigurationError, Settings, VoiceProfileRegistry
from app.speech_engine import CloneSpeechEngine, ZipVoiceCloneEngine, normalise_text


class SpeechRequest(BaseModel):
    model_config = ConfigDict(populate_by_name=True, extra="forbid")

    text: str = Field(min_length=1)
    voice_profile_id: str = Field(alias="voiceProfileId", min_length=1, max_length=80)
    pronunciation_profile: str | None = Field(default="ug-en-document-reader", alias="pronunciationProfile", max_length=80)
    quality: Literal["clarity"] = "clarity"


class RequestRateLimiter:
    """In-memory request limiter. It intentionally retains only short-lived timestamps."""

    def __init__(self, per_minute: int):
        self._per_minute = per_minute
        self._requests: dict[str, deque[float]] = defaultdict(deque)

    def allow(self, key: str) -> bool:
        now = time.monotonic()
        boundary = now - 60
        entries = self._requests[key]
        while entries and entries[0] <= boundary:
            entries.popleft()
        if len(entries) >= self._per_minute:
            return False
        entries.append(now)
        return True


def create_app(settings: Settings | None = None, engine: CloneSpeechEngine | None = None) -> FastAPI:
    settings = settings or Settings.from_environment()
    profiles = VoiceProfileRegistry.from_file(settings.profiles_file)
    engine = engine or ZipVoiceCloneEngine(settings, profiles)
    limiter = RequestRateLimiter(settings.rate_limit_per_minute)

    app = FastAPI(
        title="Private Cloned Voice Service",
        docs_url=None,
        redoc_url=None,
        openapi_url=None,
    )

    def authorize(
        authorization: Annotated[str | None, Header()] = None,
    ) -> None:
        expected = f"Bearer {settings.api_token}"
        if authorization is None or not hmac.compare_digest(authorization, expected):
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Unauthorized")

    @app.get("/health")
    def health() -> dict[str, str]:
        return {"status": "ready", "service": "private-cloned-voice"}

    @app.post("/v1/speech", dependencies=[Depends(authorize)])
    def create_speech(payload: SpeechRequest, request: Request) -> Response:
        client_key = request.client.host if request.client else "unknown"
        if not limiter.allow(client_key):
            raise HTTPException(status_code=status.HTTP_429_TOO_MANY_REQUESTS, detail="Too many requests")

        text = normalise_text(payload.text)
        if not text:
            raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Text is required")
        if len(text) > settings.max_text_chars:
            raise HTTPException(status_code=status.HTTP_413_CONTENT_TOO_LARGE, detail="Text is too long")
        if not profiles.contains(payload.voice_profile_id):
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Voice profile is not available")

        try:
            audio = engine.generate(
                text=text,
                voice_profile_id=payload.voice_profile_id,
                pronunciation_profile=payload.pronunciation_profile,
                quality=payload.quality,
            )
        except ServiceConfigurationError:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Private cloned speech is unavailable",
            ) from None

        return Response(
            content=audio,
            media_type="audio/wav",
            headers={
                "Cache-Control": "no-store",
                "X-Content-Type-Options": "nosniff",
            },
        )

    return app


def create_configured_app() -> FastAPI:
    """Uvicorn factory used only after the private host environment is configured."""
    return create_app()
