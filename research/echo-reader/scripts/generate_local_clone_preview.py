#!/usr/bin/env python3
"""Generate a private offline ZipVoice clone-preview sample for Echo Reader.

This script uses only the owner's consented local reference clip and bundled
ZipVoice model files. It does not make network requests.
"""

from pathlib import Path
import time
import argparse
import json
import re

import numpy as np
import sherpa_onnx
import soundfile as sf


PROJECT_ROOT = Path(__file__).resolve().parents[1]
MODEL_ROOT = PROJECT_ROOT / "models" / "zipvoice"
MODEL_DIR = MODEL_ROOT / "sherpa-onnx-zipvoice-distill-int8-zh-en-emilia"
REFERENCE_AUDIO = PROJECT_ROOT / "data" / "voice-samples" / "clone-preview" / "ug-en-guide-lines-001-003-trusted.wav"
OUTPUT_DIR = PROJECT_ROOT / "data" / "voice-samples" / "clone-preview" / "outputs"

REFERENCE_TEXT = (
    "Hello. My voice is clear, calm, and natural. "
    "Good morning. I am ready to read this document. "
    "Good afternoon. Let us continue from the previous section."
)
PREVIEW_TEXT = (
    "This is a private local voice clone preview for Echo Reader. "
    "Your document reader is ready to find and read the selected passage."
)
PRONUNCIATION_PROFILES = PROJECT_ROOT / "scripts" / "pronunciation-overrides.json"


def create_tts() -> sherpa_onnx.OfflineTts:
    config = sherpa_onnx.OfflineTtsConfig(
        model=sherpa_onnx.OfflineTtsModelConfig(
            zipvoice=sherpa_onnx.OfflineTtsZipvoiceModelConfig(
                tokens=str(MODEL_DIR / "tokens.txt"),
                encoder=str(MODEL_DIR / "encoder.int8.onnx"),
                decoder=str(MODEL_DIR / "decoder.int8.onnx"),
                data_dir=str(MODEL_DIR / "espeak-ng-data"),
                lexicon=str(MODEL_DIR / "lexicon.txt"),
                vocoder=str(MODEL_ROOT / "vocos_24khz.onnx"),
            ),
            debug=False,
            num_threads=2,
            provider="cpu",
        )
    )
    if not config.validate():
        raise RuntimeError("The local ZipVoice configuration did not validate.")
    return sherpa_onnx.OfflineTts(config)


def prepare_speech_text(text: str, profile_name: str | None, emphasise_words: str) -> str:
    """Apply explicit, local-only pronunciation and emphasis hints before cloning."""
    prepared = re.sub(r"\s+", " ", text).strip()
    if not profile_name:
        return prepared

    profiles = json.loads(PRONUNCIATION_PROFILES.read_text(encoding="utf-8"))
    profile = profiles.get(profile_name)
    if not profile:
        raise ValueError(f"Unknown pronunciation profile: {profile_name}")

    emphasised = {word.strip().lower() for word in emphasise_words.split(",") if word.strip()}
    for word, rule in profile["words"].items():
        replacement = rule["emphasised"] if word.lower() in emphasised else rule["clear"]
        prepared = re.sub(rf"\b{re.escape(word)}\b", replacement, prepared, flags=re.IGNORECASE)
    return prepared


def split_into_sentences(text: str) -> list[str]:
    sentences = [part.strip() for part in re.split(r"(?<=[.!?])\s+", text) if part.strip()]
    return sentences or [text]


def audio_quality_report(samples: np.ndarray, sample_rate: int, label: str) -> dict[str, float]:
    absolute = np.abs(samples)
    duration = len(samples) / sample_rate if sample_rate else 0.0
    peak = float(absolute.max()) if len(absolute) else 0.0
    rms = float(np.sqrt(np.mean(np.square(samples)))) if len(samples) else 0.0
    clipping = float(np.mean(absolute >= 0.99)) if len(absolute) else 0.0
    quiet = absolute < 0.012
    leading = float(np.argmax(~quiet) / sample_rate) if np.any(~quiet) else duration
    print(f"{label} duration: {duration:.3f}s | peak: {peak:.3f} | RMS: {rms:.3f} | clipping: {clipping * 100:.3f}% | leading silence: {leading:.3f}s")
    if clipping > 0.001:
        print(f"WARNING: {label} has measurable clipping and should not be accepted as a clear sample.")
    if rms < 0.012:
        print(f"WARNING: {label} is unusually quiet and may make consonants unclear.")
    return {"duration": duration, "peak": peak, "rms": rms, "clipping": clipping, "leading_silence": leading}


def generate_sentence_by_sentence(tts: sherpa_onnx.OfflineTts, text: str, generation: sherpa_onnx.GenerationConfig, sample_rate: int) -> np.ndarray:
    parts: list[np.ndarray] = []
    silence = np.zeros(int(sample_rate * 0.18), dtype=np.float32)
    for sentence in split_into_sentences(text):
        generated = tts.generate(sentence, generation)
        if len(generated.samples) == 0:
            raise RuntimeError(f"Local ZipVoice produced no audio for sentence: {sentence}")
        parts.append(np.asarray(generated.samples, dtype=np.float32))
        parts.append(silence)
    return np.concatenate(parts[:-1]) if len(parts) > 1 else parts[0]


def main() -> None:
    parser = argparse.ArgumentParser(description="Generate a private offline Echo Reader clone preview.")
    parser.add_argument("--steps", type=int, default=4, help="ZipVoice generation steps; higher values favour quality over speed.")
    parser.add_argument("--output-name", default="echo-reader-local-clone-preview.wav", help="Output WAV filename stored inside the private preview folder.")
    parser.add_argument("--text", default=PREVIEW_TEXT, help="New document-answer text to speak in the consented cloned voice.")
    parser.add_argument("--text-file", help="Optional UTF-8 text file containing the document-answer text to speak.")
    parser.add_argument("--pronunciation-profile", choices=["ug-en-document-reader"], help="Optional local profile for authorised pronunciation hints.")
    parser.add_argument("--emphasise", default="", help="Comma-separated profile words that need stronger syllable emphasis.")
    parser.add_argument("--single-pass", action="store_true", help="Generate the full text in one pass instead of sentence-by-sentence quality mode.")
    parser.add_argument("--reference-audio", default=str(REFERENCE_AUDIO), help="Authorised local WAV reference clip used to condition the clone model.")
    parser.add_argument("--reference-text", default=REFERENCE_TEXT, help="Exact transcript of the authorised local reference clip.")
    args = parser.parse_args()
    if args.steps < 1 or args.steps > 12:
        raise ValueError("--steps must be between 1 and 12.")

    source_text = Path(args.text_file).read_text(encoding="utf-8").strip() if args.text_file else args.text.strip()
    speech_text = prepare_speech_text(source_text, args.pronunciation_profile, args.emphasise)
    if not speech_text:
        raise ValueError("Provide non-empty --text or --text-file content for local clone generation.")

    reference_path = Path(args.reference_audio)
    if not reference_path.is_file():
        raise FileNotFoundError(f"Trusted local reference clip not found: {reference_path}")

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    output_audio = OUTPUT_DIR / Path(args.output_name).name
    reference_audio, sample_rate = sf.read(reference_path, dtype="float32")
    if reference_audio.ndim > 1:
        reference_audio = reference_audio[:, 0]
    audio_quality_report(np.asarray(reference_audio), sample_rate, "Reference audio")

    tts = create_tts()
    generation = sherpa_onnx.GenerationConfig()
    generation.reference_audio = reference_audio
    generation.reference_sample_rate = sample_rate
    generation.reference_text = args.reference_text.strip()
    if not generation.reference_text:
        raise ValueError("Provide a non-empty --reference-text matching the authorised reference audio.")
    generation.num_steps = args.steps
    generation.extra["min_char_in_sentence"] = "30"

    start = time.time()
    if args.single_pass:
        generated = tts.generate(speech_text, generation)
        generated_samples = np.asarray(generated.samples, dtype=np.float32)
        generated_sample_rate = generated.sample_rate
    else:
        generated_sample_rate = 24000
        generated_samples = generate_sentence_by_sentence(tts, speech_text, generation, generated_sample_rate)
    elapsed = time.time() - start
    if len(generated_samples) == 0:
        raise RuntimeError("Local ZipVoice produced no audio samples.")

    quality = audio_quality_report(generated_samples, generated_sample_rate, "Generated audio")
    if quality["clipping"] > 0.003 or quality["rms"] < 0.012:
        raise RuntimeError("Generated audio failed the local clarity gate. Try a cleaner reference or a higher-quality model pass.")

    sf.write(output_audio, generated_samples, generated_sample_rate, subtype="PCM_16")
    duration = len(generated_samples) / generated_sample_rate
    print(f"Saved offline clone preview: {output_audio}")
    print(f"Generation steps: {args.steps}")
    if args.pronunciation_profile:
        print(f"Pronunciation profile: {args.pronunciation_profile} ({args.emphasise or 'clarity only'})")
    print(f"Generation mode: {'single-pass' if args.single_pass else 'sentence-by-sentence clarity mode'}")
    print(f"Output duration: {duration:.3f} seconds")
    print(f"Generation time: {elapsed:.3f} seconds")
    print(f"Real-time factor: {elapsed / duration:.3f}")


if __name__ == "__main__":
    main()
