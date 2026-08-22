from __future__ import annotations

import json
from pathlib import Path

from fastapi.testclient import TestClient

from app.config import Settings
from app.main import create_app


class StubCloneEngine:
    def __init__(self) -> None:
        self.calls: list[dict[str, str | None]] = []

    def generate(
        self,
        *,
        text: str,
        voice_profile_id: str,
        pronunciation_profile: str | None,
        quality: str,
    ) -> bytes:
        self.calls.append(
            {
                "text": text,
                "voice_profile_id": voice_profile_id,
                "pronunciation_profile": pronunciation_profile,
                "quality": quality,
            }
        )
        return b"RIFF-private-cloned-audio"


def build_client(tmp_path: Path, *, max_text_chars: int = 1200) -> tuple[TestClient, StubCloneEngine]:
    profiles_file = tmp_path / "voice-profiles.json"
    profiles_file.write_text(
        json.dumps(
            {
                "profiles": {
                    "owner-primary": {
                        "referenceAudioPath": "/private/owner-primary.wav",
                        "referenceText": "Private transcript.",
                    }
                }
            }
        ),
        encoding="utf-8",
    )
    settings = Settings(
        api_token="test-private-token",
        profiles_file=profiles_file,
        model_dir=tmp_path / "models",
        vocoder_path=tmp_path / "vocoder.onnx",
        pronunciation_profiles_file=tmp_path / "pronunciation.json",
        max_text_chars=max_text_chars,
        rate_limit_per_minute=12,
        tts_steps=4,
    )
    engine = StubCloneEngine()
    return TestClient(create_app(settings=settings, engine=engine)), engine


def test_speech_uses_the_selected_private_profile_and_returns_uncached_wav(tmp_path: Path) -> None:
    client, engine = build_client(tmp_path)

    response = client.post(
        "/v1/speech",
        headers={"Authorization": "Bearer test-private-token"},
        json={
            "text": "Please review the source passage carefully.",
            "voiceProfileId": "owner-primary",
            "pronunciationProfile": "ug-en-document-reader",
            "quality": "clarity",
        },
    )

    assert response.status_code == 200
    assert response.headers["content-type"] == "audio/wav"
    assert response.headers["cache-control"] == "no-store"
    assert response.content == b"RIFF-private-cloned-audio"
    assert engine.calls == [
        {
            "text": "Please review the source passage carefully.",
            "voice_profile_id": "owner-primary",
            "pronunciation_profile": "ug-en-document-reader",
            "quality": "clarity",
        }
    ]


def test_speech_rejects_unauthenticated_requests(tmp_path: Path) -> None:
    client, _ = build_client(tmp_path)

    response = client.post(
        "/v1/speech",
        json={"text": "Read this.", "voiceProfileId": "owner-primary"},
    )

    assert response.status_code == 401


def test_speech_rejects_a_profile_that_is_not_private_and_configured(tmp_path: Path) -> None:
    client, engine = build_client(tmp_path)

    response = client.post(
        "/v1/speech",
        headers={"Authorization": "Bearer test-private-token"},
        json={"text": "Read this.", "voiceProfileId": "someone-else"},
    )

    assert response.status_code == 404
    assert engine.calls == []


def test_speech_rejects_oversized_text_without_calling_the_engine(tmp_path: Path) -> None:
    client, engine = build_client(tmp_path, max_text_chars=12)

    response = client.post(
        "/v1/speech",
        headers={"Authorization": "Bearer test-private-token"},
        json={"text": "This sentence is deliberately too long.", "voiceProfileId": "owner-primary"},
    )

    assert response.status_code == 413
    assert engine.calls == []
