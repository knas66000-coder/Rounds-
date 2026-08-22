"""Configuration and private voice-profile registry for the clone service."""

from __future__ import annotations

from dataclasses import dataclass
import json
import os
from pathlib import Path


APP_ROOT = Path(__file__).resolve().parents[1]


class ServiceConfigurationError(RuntimeError):
    """Raised when required private service configuration is absent or invalid."""


@dataclass(frozen=True)
class VoiceProfile:
    identifier: str
    reference_audio_path: Path
    reference_text: str


class VoiceProfileRegistry:
    """Loads named private references from a file excluded from source control."""

    def __init__(self, profiles: dict[str, VoiceProfile]):
        self._profiles = profiles

    @classmethod
    def from_file(cls, path: Path) -> "VoiceProfileRegistry":
        if not path.is_file():
            raise ServiceConfigurationError("Private voice-profile configuration is not available.")

        try:
            payload = json.loads(path.read_text(encoding="utf-8"))
            raw_profiles = payload["profiles"]
        except (OSError, ValueError, KeyError, TypeError) as error:
            raise ServiceConfigurationError("Private voice-profile configuration is invalid.") from error

        profiles: dict[str, VoiceProfile] = {}
        for identifier, record in raw_profiles.items():
            reference_audio = str(record.get("referenceAudioPath", "")).strip()
            reference_text = str(record.get("referenceText", "")).strip()
            if not identifier or not reference_audio or not reference_text:
                raise ServiceConfigurationError("A private voice profile is incomplete.")
            profiles[identifier] = VoiceProfile(
                identifier=identifier,
                reference_audio_path=Path(reference_audio),
                reference_text=reference_text,
            )

        if not profiles:
            raise ServiceConfigurationError("No private voice profile is configured.")
        return cls(profiles)

    def get(self, identifier: str) -> VoiceProfile | None:
        return self._profiles.get(identifier)

    def contains(self, identifier: str) -> bool:
        return identifier in self._profiles


@dataclass(frozen=True)
class Settings:
    api_token: str
    profiles_file: Path
    model_dir: Path
    vocoder_path: Path
    pronunciation_profiles_file: Path
    max_text_chars: int = 1200
    rate_limit_per_minute: int = 12
    tts_steps: int = 4

    @classmethod
    def from_environment(cls) -> "Settings":
        token = os.environ.get("VOICE_SERVICE_API_TOKEN", "").strip()
        if not token or token == "replace-with-a-long-random-token":
            raise ServiceConfigurationError("VOICE_SERVICE_API_TOKEN must be configured privately.")

        profiles_file = os.environ.get("VOICE_PROFILES_FILE", "").strip()
        model_dir = os.environ.get("ZIPVOICE_MODEL_DIR", "").strip()
        vocoder_path = os.environ.get("ZIPVOICE_VOCODER_PATH", "").strip()
        if not profiles_file or not model_dir or not vocoder_path:
            raise ServiceConfigurationError("Private profile and model locations must be configured.")

        return cls(
            api_token=token,
            profiles_file=Path(profiles_file),
            model_dir=Path(model_dir),
            vocoder_path=Path(vocoder_path),
            pronunciation_profiles_file=APP_ROOT / "config" / "pronunciation-profiles.json",
            max_text_chars=_positive_int("VOICE_SERVICE_MAX_TEXT_CHARS", 1200),
            rate_limit_per_minute=_positive_int("VOICE_SERVICE_RATE_LIMIT_PER_MINUTE", 12),
            tts_steps=_bounded_int("VOICE_SERVICE_TTS_STEPS", 4, 1, 12),
        )


def _positive_int(name: str, default: int) -> int:
    value = int(os.environ.get(name, str(default)))
    if value < 1:
        raise ServiceConfigurationError(f"{name} must be a positive integer.")
    return value


def _bounded_int(name: str, default: int, minimum: int, maximum: int) -> int:
    value = _positive_int(name, default)
    if not minimum <= value <= maximum:
        raise ServiceConfigurationError(f"{name} must be between {minimum} and {maximum}.")
    return value
