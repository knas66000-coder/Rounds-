# Dedicated Local Voice-Clone Model

## Purpose

The central speech component in Echo Reader is a **dedicated local voice-cloning model**. Its only responsibility is to receive text and generate audio that reflects the owner’s consented Ugandan English voice. It is not a general chatbot, document search system, or phone speech engine.

> **The document reader decides what text should be spoken. The clone model decides how that text sounds.**

## Component Separation

| Component | Input | Output | Responsibility |
| --- | --- | --- | --- |
| Local document retriever | Imported document and request text | Grounded answer plus source passage | Finds evidence in user-supplied PDF, TXT, and Markdown content. |
| Study-question generator | Selected source passage | Source-linked question and answer | Creates revision prompts from the passage only. |
| Dedicated clone model | Answer/question text, consented reference clip, reference transcript | PCM/WAV speech audio | Generates a voice that resembles the consented speaker. |
| Audio player | Generated local WAV | Device playback | Plays the clone-model output. It does not create the voice itself. |

## Local Clone Generation Contract

The clone model receives three required inputs. `text` is the new answer or passage that must be spoken. `referenceAudio` is a short, clean recording owned by the voice subject. `referenceText` is the exact transcript of that reference recording. The model outputs a new audio waveform for the supplied `text`.

The current trusted reference is the owner’s authorised Echo Reader guide recording of lines 001–003. The larger authorised 001–070 guide recording is reserved for later training and quality evaluation. Manual/Bible recordings with unknown or third-party text rights remain excluded from the training corpus.

## Quality and Ownership Boundary

The initial clone-preview model is a compact, local inference model bundled with the application. It already knows how to pronounce English and uses the authorised reference recording to condition the generated voice. This avoids training a language-pronunciation system from zero before the voice can be heard.

The final custom voice model remains a later improvement. It will be adapted using the owner’s aligned Ugandan English dataset so it can improve long-form document reading, pronunciation stability, and vocal consistency. This does not change the boundary: only the documented voice owner’s recordings may be used for the model.

## Mobile Packaging Requirement

Dynamic clone generation needs the local inference runtime, the trusted reference clip, and the model asset bundle inside a custom native build. The current compact model bundle is approximately 146 MB before app packaging overhead, so it must be handled as managed application/file-storage assets rather than a small source-code attachment. The installed document assistant must never replace this model with the phone’s built-in voice engine or a remote runtime API.

## User-Visible Status

| Status | Meaning |
| --- | --- |
| Clone preview ready | The user can hear a fixed, locally generated comparison sample from their consented reference. |
| Dynamic clone ready | Any retrieved document answer can be synthesised locally by the clone model. |
| Custom voice adapted | The clone model has been improved using the owner’s larger aligned Ugandan English training dataset. |
