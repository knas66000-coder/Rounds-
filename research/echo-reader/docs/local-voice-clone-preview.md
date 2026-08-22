# Experimental Local Voice-Clone Preview

## Purpose

This preview is an **experimental local voice-cloning path**, not the final custom-trained Echo Reader voice. It may use a bundled, pre-trained local cloning model with a recording supplied by the owner as a reference. The application will not use the phone speech engine or call a runtime speech API.

## Approved Source

The only approved source for the preview is the owner’s authorised Echo Reader guide recording. The guide’s long recording is suitable as an alignment source, but a voice-cloning model needs one short reference clip with its **exact matching transcript**.

## Reference Clip Requirements

| Requirement | Target |
| --- | --- |
| Voice owner | The user whose custom voice is being created. |
| Length | 8–15 seconds of uninterrupted speech. |
| Content | One to three original Echo Reader guide lines, read in order. |
| Transcript | Exact words spoken in the clip, including punctuation where practical. |
| Recording quality | Quiet indoor environment; no music, other speakers, or manual/Bible excerpts. |
| Consent | Used only for the owner’s private Echo Reader voice preview. |

## Runtime Path

1. The app keeps the reference recording and text locally.
2. A bundled ZipVoice-compatible ONNX model accepts local reference audio and its exact transcript.
3. The model generates speech from a selected document passage locally on the device.
4. The user can stop or delete the preview output. No voice data is uploaded.

## Current State

The mobile project contains the offline runtime dependency and the authorised guide transcript manifest. The preview remains inactive until a short aligned reference clip and the packaged model files are available in the custom mobile build. This avoids generating a low-quality or misleading voice result from a long, unsegmented recording.

## Reference

ZipVoice requires both a reference audio clip and matching reference text; transcript mismatches can materially reduce synthesis quality. [1]

[1]: https://k2-fsa.github.io/sherpa/onnx/tts/zipvoice.html "ZipVoice documentation"
