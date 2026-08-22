# Echo Reader

Echo Reader is a **private, document-only mobile assistant** built with Expo and React Native. It imports user-supplied PDF, TXT, and Markdown files, searches them locally, produces source-grounded answers, and generates study questions without a general internet chatbot or an external document API.

## What is included

| Area | Capability |
| --- | --- |
| Reader | Private import and local indexing for digital PDF, TXT, and Markdown documents. |
| Ask | Manual or automatic local lookup, source-grounded answers, visible page context, and no-evidence safeguards. |
| Study | Local study-question generation from selected passages. |
| Voice Studio | Consent-aware recording workflow and documentation for a private Ugandan English voice dataset. |
| Local voice pack | Architecture and scripts for optional offline cloned-voice synthesis; it is not bundled with this repository. |

## Privacy boundary

This repository intentionally excludes **all owner voice recordings, prepared reference clips, generated clone audio, and large model binaries**. The source code, tests, configuration, recording guidance, data schemas, local generation scripts, and local voice-pack documentation remain fully available.

No application route sends a document, a question, or voice data to an external AI or speech provider. A future voice pack is designed to be explicitly installed as a managed local asset and to run offline after installation.

## Local development

```bash
pnpm install
pnpm dev
```

Run deterministic validation with:

```bash
pnpm test
pnpm check
pnpm lint
```

## Private local voice pack

The local clone runtime and voice-quality scripts are included under `scripts/`. To activate cloned speech, follow [`docs/optional-local-voice-pack.md`](docs/optional-local-voice-pack.md) and use only recordings you own or are explicitly authorised to use. Do not commit personal recordings or downloaded model binaries.

## Key documents

- [`design.md`](design.md): Mobile experience and private document-assistant behavior.
- [`docs/ugandan-english-voice-recording-guide.md`](docs/ugandan-english-voice-recording-guide.md): Consented recording guide.
- [`docs/dedicated-local-clone-model.md`](docs/dedicated-local-clone-model.md): Dedicated clone-model boundary.
- [`docs/local-voice-clarity-design.md`](docs/local-voice-clarity-design.md): Clarity and quality-gating design.
- [`docs/optional-local-voice-pack.md`](docs/optional-local-voice-pack.md): Optional local voice-pack packaging design.
