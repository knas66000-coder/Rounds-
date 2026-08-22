"""Private ZipVoice-backed synthesis implementation.

The module deliberately loads model files only inside the service process. Rounds
supplies text and a profile identifier; it never reads the reference audio.
"""

from __future__ import annotations

from io import BytesIO
import json
from pathlib import Path
import re
from typing import Protocol

import numpy as np
import soundfile as sf

from app.config import ServiceConfigurationError, Settings, VoiceProfile, VoiceProfileRegistry


class CloneSpeechEngine(Protocol):
    def generate(
        self,
        *,
        text: str,
        voice_profile_id: str,
        pronunciation_profile: str | None,
        quality: str,
    ) -> bytes: ...


def normalise_text(text: str) -> str:
    return re.sub(r"\s+", " ", text).strip()


def split_into_sentences(text: str) -> list[str]:
    sentences = [part.strip() for part in re.split(r"(?<=[.!?])\s+", text) if part.strip()]
    return sentences or [text]


def apply_pronunciation_profile(text: str, profiles_file: Path, profile_name: str | None) -> str:
    prepared = normalise_text(text)
    if not profile_name:
        return prepared
    try:
        profiles = json.loads(profiles_file.read_text(encoding="utf-8"))
        profile = profiles[profile_name]
    except (OSError, ValueError, KeyError, TypeError) as error:
        raise ServiceConfigurationError("Requested pronunciation profile is not available.") from error

    for word, rule in profile.get("words", {}).items():
        replacement = str(rule.get("clear", "")).strip()
        if replacement:
            prepared = re.sub(rf"\b{re.escape(word)}\b", replacement, prepared, flags=re.IGNORECASE)
    return prepared


def _quality_is_acceptable(samples: np.ndarray) -> bool:
    if len(samples) == 0:
        return False
    absolute = np.abs(samples)
    clipping = float(np.mean(absolute >= 0.99))
    rms = float(np.sqrt(np.mean(np.square(samples))))
    return clipping <= 0.003 and rms >= 0.012


class ZipVoiceCloneEngine:
    """Loads the approved local model only when the first speech request arrives."""

    def __init__(self, settings: Settings, profiles: VoiceProfileRegistry):
        self._settings = settings
        self._profiles = profiles
        self._tts: object | None = None

    def generate(
        self,
        *,
        text: str,
        voice_profile_id: str,
        pronunciation_profile: str | None,
        quality: str,
    ) -> bytes:
        profile = self._profiles.get(voice_profile_id)
        if profile is None:
            raise ServiceConfigurationError("Requested private voice profile is not available.")
        if not profile.reference_audio_path.is_file():
            raise ServiceConfigurationError("Approved private reference audio is not available.")

        speech_text = apply_pronunciation_profile(
            text,
            self._settings.pronunciation_profiles_file,
            pronunciation_profile,
        )
        if not speech_text:
            raise ServiceConfigurationError("Speech text is empty.")

        reference_audio, reference_sample_rate = sf.read(profile.reference_audio_path, dtype="float32")
        if reference_audio.ndim > 1:
            reference_audio = reference_audio[:, 0]

        tts = self._load_tts()
        sherpa_onnx = _load_sherpa_onnx()
        generation = sherpa_onnx.GenerationConfig()
        generation.reference_audio = np.asarray(reference_audio, dtype=np.float32)
        generation.reference_sample_rate = reference_sample_rate
        generation.reference_text = profile.reference_text
        generation.num_steps = self._settings.tts_steps
        generation.extra["min_char_in_sentence"] = "30"

        generated_sample_rate = 24000
        segments: list[np.ndarray] = []
        pause = np.zeros(int(generated_sample_rate * 0.18), dtype=np.float32)
        for sentence in split_into_sentences(speech_text):
            generated = tts.generate(sentence, generation)
            samples = np.asarray(generated.samples, dtype=np.float32)
            if not _quality_is_acceptable(samples):
                raise ServiceConfigurationError("Generated cloned speech did not pass the clarity gate.")
            segments.extend((samples, pause))

        output = np.concatenate(segments[:-1]) if len(segments) > 1 else segments[0]
        buffer = BytesIO()
        sf.write(buffer, output, generated_sample_rate, format="WAV", subtype="PCM_16")
        return buffer.getvalue()

    def _load_tts(self):
        if self._tts is not None:
            return self._tts

        required_files = (
            self._settings.model_dir / "tokens.txt",
            self._settings.model_dir / "encoder.int8.onnx",
            self._settings.model_dir / "decoder.int8.onnx",
            self._settings.model_dir / "espeak-ng-data",
            self._settings.model_dir / "lexicon.txt",
            self._settings.vocoder_path,
        )
        if not all(path.exists() for path in required_files):
            raise ServiceConfigurationError("Private voice model assets are not available.")

        sherpa_onnx = _load_sherpa_onnx()
        config = sherpa_onnx.OfflineTtsConfig(
            model=sherpa_onnx.OfflineTtsModelConfig(
                zipvoice=sherpa_onnx.OfflineTtsZipvoiceModelConfig(
                    tokens=str(self._settings.model_dir / "tokens.txt"),
                    encoder=str(self._settings.model_dir / "encoder.int8.onnx"),
                    decoder=str(self._settings.model_dir / "decoder.int8.onnx"),
                    data_dir=str(self._settings.model_dir / "espeak-ng-data"),
                    lexicon=str(self._settings.model_dir / "lexicon.txt"),
                    vocoder=str(self._settings.vocoder_path),
                ),
                debug=False,
                num_threads=2,
                provider="cpu",
            )
        )
        if not config.validate():
            raise ServiceConfigurationError("Private voice model configuration is invalid.")
        self._tts = sherpa_onnx.OfflineTts(config)
        return self._tts


def _load_sherpa_onnx():
    try:
        import sherpa_onnx
    except ImportError as error:
        raise ServiceConfigurationError("Private voice runtime is not installed.") from error
    return sherpa_onnx
