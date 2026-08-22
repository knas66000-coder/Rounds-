# Optional Local Voice Pack Architecture

## Purpose

Echo Reader separates its small document-reader application from the larger local cloning model. A user can import, search, study, and verify their own documents without installing the speech model. The cloned voice becomes available only when the user chooses to install or enable the **private local voice pack**.

## Package Composition

| Package | Contents | Intended size profile | Available without voice pack |
| --- | --- | --- | --- |
| Core Echo Reader | Local document import, PDF/TXT/Markdown indexing, source-grounded answers, study questions, and Voice Studio metadata. | Small mobile application. | Yes |
| Personal voice references | The approved 2–3 second natural reference and word-specific clarity references, plus exact transcripts. | Tiny private files. | Stored locally, not played until voice pack is enabled. |
| Local voice pack | Clone-model weights, pronunciation profile, model lexicon, and local inference runtime configuration. | Larger optional asset bundle. | No |
| Future adaptation pack | Owner-trained Ugandan English improvements and the aligned dataset manifest. | Separate, optional asset. | No |

## Installation Flow

1. The core app opens immediately and works fully as a private document reader.
2. The user explicitly enables **Read in my voice**.
3. The app checks for the local voice pack. If it is not installed, it explains the device storage requirement and asks the user to install the managed project asset pack once.
4. The pack is stored in the app’s private local storage. After installation, the clone model receives only the document-grounded text, the approved local reference clip, and its exact transcript.
5. Generated audio is played locally. No phone speech voice and no third-party speech API participate in the speaking path.

## Size and Quality Strategy

The current compact clone model is approximately 146 MB because it is a mobile-friendly distilled, quantised model. This makes it suitable as an optional pack, but it is not necessarily the best available quality path. The full, non-distilled model is expected to favour clarity over speed, while a smaller model would reduce storage at the cost of greater pronunciation risk. The final choice should be based on the owner’s listening tests, not size alone.

> **Core principle:** The document reader should stay lightweight. The clone model is a deliberate, visible capability that the user adds when the value of speaking in their own voice justifies the additional local storage.

## Privacy Boundary

The voice pack is a project-managed local asset. Its installation may require a one-time transfer from project storage, but it is not a runtime request to an external speech provider. Once installed, document text, reference audio, generated speech, and the model all stay on the device.

## References

[1]: https://github.com/k2-fsa/ZipVoice "ZipVoice official repository; model variants and quality-speed guidance"
