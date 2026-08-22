# Echo Reader — Private Document Voice Assistant Design

## Product Direction

Echo Reader is a **document-only voice assistant**. It imports documents that the user supplies, searches them locally, and answers only from retrieved passages. Every answer displays the source document, page number, and matching context so the user can verify it. When local clone voice output is available, the assistant can read that grounded answer in the owner’s consented cloned voice. It does not pretend to know information outside the loaded PDF, TXT, or Markdown documents.

## Screen List

| Screen | Primary content and functionality |
| --- | --- |
| Reader | Imports and privately indexes PDF, TXT, and Markdown files; shows search results and selected passage context. |
| Ask | Accepts a typed document request, resolves it against the local index, presents a concise answer with source passage and page number, and queues the answer for local clone-voice playback. |
| Study | Creates deterministic study questions from selected passages, shows the source context for each question, and offers manual next-question or auto-study mode. |
| Voice Studio | Guides consented voice recording, tracks the local training dataset, and indicates the state of the experimental local clone preview. |

## Layout and Interaction

The app is built for portrait 9:16 use with the primary action in the lower thumb zone. The **Ask** workspace opens with the selected document and a visible “Local only” status. A single text field accepts a question such as “Look up installation requirements.” Below it, a substantial indigo action button runs the local search. The answer card always separates the assistant’s short response from the quoted document context. Page metadata appears immediately above the passage, and a clone-voice playback control is present only when a local generated-audio asset is available.

The **Study** workspace uses a calm card stack. The top card identifies the selected passage; beneath it, a generated question card has a source-reference chip and an answer-reveal control. **Manual mode** lets the user move through questions one at a time. **Auto mode** automatically advances to the next question after the answer is revealed, while remaining fully user-controlled through pause and stop buttons. The first release supports typed questions; local voice transcription and hands-free wake-word input will be activated after their model assets are bundled in the custom mobile build.

## Key User Flows

| User goal | Interaction flow |
| --- | --- |
| Ask about a loaded document | User imports a document → selects **Ask** → enters a request → Echo searches local passages → Echo shows a concise grounded answer, page number, and source context → user may request local clone-voice playback. |
| Verify an answer | User taps the source card → the Reader opens the matching selected passage and page marker. |
| Generate study questions | User selects a passage → opens **Study** → taps **Generate questions** → Echo creates questions from the passage’s sentences and headings → each question retains the original source context. |
| Study automatically | User enables **Auto mode** → reveals a question answer → Echo advances to the next question after a short local delay → user can pause at any time. |
| Read answer in cloned voice | User taps **Read in my voice** → the app uses the local clone-preview output or the later custom voice model → the response plays from the device without a remote speech request. |

## Answer Boundaries

Echo uses deterministic local retrieval. It may summarise the highest-scoring passage, but it must never invent external facts or state that it found support where no loaded passage matches. When no result is found, it responds: “I could not find that in the documents loaded on this device.” The study-question generator derives questions only from the selected passage’s actual terms and sentences and shows the source alongside each item.

## Local Domain Model

`LocalDocument` holds the document title, type, page count, and indexed passages. `DocumentAnswer` holds the user question, a concise response, selected `DocumentPassage`, matched terms, and creation time. `StudyQuestion` holds an identifier, question text, answer text, question type, and the source passage identifier. `AssistantMode` is `manual` or `auto`. `CloneVoiceStatus` is `unavailable`, `reference_ready`, `preview_ready`, or `custom_model_ready`. No answer history, document text, microphone audio, source passage, or generated clone output is sent to an external runtime service.

## Color Choices

The established palette continues to give each state a useful semantic role. **Midnight #0B1020** holds the workspace, **Slate #151D33** distinguishes document and answer cards, **Electric Iris #7C6CFF** marks the selected local action, and **Aqua Signal #4FD1C5** highlights grounded source context and local readiness. **Mint #57D69A** indicates a verified local model or completed study action; **Coral #FF7A8A** communicates missing document evidence or errors. These colors support a calm, readable research experience rather than a generic chatbot interface.

## Technical Boundaries

PDF text extraction and search run locally. The experimental voice preview uses a bundled local cloning model, a trusted voice-owner reference clip, and its exact transcript. The custom trained voice remains a future replacement for the preview after additional aligned Ugandan English recordings are collected. Any general conversation or question not grounded in a loaded document is out of scope for the first version.
