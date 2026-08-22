# Local Document Voice Reader — Architecture Decision

## Objective

The product is a **private, hands-free document reader**. A user imports their own PDF, TXT, or Markdown document. The application indexes text on the device, listens for a user-selected wake phrase while the reader is active, transcribes the following document request locally, finds the relevant document passage, and reads it aloud through a custom text-to-speech voice trained solely from the user’s consented Ugandan English recordings.

No microphone recording, extracted document text, query, transcript, or generated audio will be sent by the application to a third-party runtime API. The user retains control of the microphone state and can pause or disable hands-free listening from the visible application settings.

## System Boundary

| Layer | Local responsibility | Runtime network access |
| --- | --- | --- |
| Document import | User selects a local PDF, TXT, or Markdown file. | None |
| PDF extraction | Embedded text is extracted page-by-page; encrypted files request a local password. | None |
| Search index | The application stores normalized passages, page numbers, titles, and keyword terms locally. | None |
| Wake phrase | A compact local detector identifies the user-configured short phrase while the reader is active. | None |
| Speech-to-text | An embedded English recognition model converts the post-wake request to text. | None |
| Request resolver | Deterministic commands resolve requests such as read, search, next result, previous result, and stop. | None |
| Custom speech output | A trained custom TTS model generates the selected text in the user’s voice. | None |

## Document Processing

Digital PDFs contain a text layer that can be extracted directly rather than recognised from images. The mobile implementation will use a native extractor capable of reading PDF text and page structure locally; it will index passages by document and page so commands such as “read page five” and “search installation” are deterministic. Scanned PDFs are different because they contain page images instead of selectable text; offline OCR is a later, separate addition and is not assumed in the initial release. [1]

The first search implementation will be transparent and deterministic. It will lowercase and tokenize the extracted text, retain page numbers, score phrase and keyword matches, and return the closest passages. It will not claim to answer questions beyond the documents supplied by the user. The resolver will recognize a limited grammar: `read <section/page>`, `search <phrase>`, `read next result`, `read previous result`, `continue`, `pause`, and `stop`.

## Speech Architecture

The app should not use the phone’s built-in speech engine. Instead, it will package speech models together with a local inference runtime. An ONNX-compatible mobile speech runtime supports local speech recognition, speech synthesis, and keyword spotting on Android and iOS. The runtime is a software component inside the application, not a remote API. [2] [3]

| Component | First implementation | Customization boundary |
| --- | --- | --- |
| Wake phrase | User selects a short word or phrase and records enrollment examples. The assistant listens only while the reader is enabled. | Reliable custom keyword training also needs negative/background speech samples. |
| Speech-to-text | Bundled offline English ASR model, adapted through document-specific phrase hints. | Training ASR entirely from scratch is a future research project requiring a much larger transcribed audio corpus. |
| Text-to-speech | Custom model trained only from the owner’s narrated Ugandan English recordings, exported for local mobile inference. | The user’s consented corpus, voice style, vocabulary, and model-quality target define the voice. |
| Audio controls | Visible listening state, immediate pause/disable control, and local generated-audio playback. | No background calls, messages, or external actions are permitted. |

## Custom Voice Training Process

The custom text-to-speech voice is created outside the phone, then embedded inside the app. The source recordings must be owned by the user, clean, and paired with matching transcripts. Data preparation validates duration, sample rate, text alignment, and speaker consistency. Training creates a voice model from the consented corpus; evaluation checks intelligibility, pronunciation of document terms, pace, and generation failures. The validated model is exported to an ONNX inference format and included as an app asset.

> **Important distinction:** the model can run locally with no API after it is packaged, but a natural custom voice model must first be trained using specialized compute. The recording guide builds the dataset; it does not yet constitute a completed trained voice.

## Practical Release Sequence

| Release | User-visible capability | Definition of done |
| --- | --- | --- |
| Recording Studio | Guided reading script, local recordings, transcript metadata, consent confirmation, and quality checks. | A clean, structured Ugandan English voice dataset is ready for training. |
| Document Reader | PDF/TXT/Markdown import, local extraction, search, and a readable result viewer. | Digital documents can be indexed and navigated without network upload. |
| Voice Control | Configurable wake phrase, local speech-to-text, and deterministic document commands. | A user can say a supported request while the reader is active. |
| Custom Voice | Locally bundled custom TTS model and voice playback controls. | The selected passage is spoken in the owner’s trained custom voice with no runtime API calls. |

## Platform Constraints

The production reader requires a custom native app build because local PDF extraction and embedded speech inference use native modules; a lightweight web preview cannot verify these native features. The full, bundled models also make app size and device performance part of the quality assessment. The app will therefore show clear capability status and preserve typed navigation when a model is unavailable.

## References

[1]: https://github.com/gr8pathik/expo-pdf-text-extract "expo-pdf-text-extract documentation"
[2]: https://github.com/k2-fsa/sherpa-onnx "sherpa-onnx project documentation"
[3]: https://github.com/XDcobra/react-native-sherpa-onnx "react-native-sherpa-onnx documentation"
