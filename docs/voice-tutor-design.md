# Rounds Conversational Voice Tutor

## Purpose

The Rounds Voice Tutor is a **voice-first study companion**, not a replacement for the installed Nursing question bank, verified Rounds rationales, a clinician, local policy, or emergency services. A learner may speak or type a focused study question, review the recognised transcript, and receive a short spoken and written educational response.

The first release is deliberately turn-based rather than always listening. This keeps microphone use explicit, lets learners correct a transcript before sending it, gives them a reliable stop control, and avoids storing a private conversation history on the server.

## Conversation Flow

| Step | Learner action | Rounds behavior |
|---|---|---|
| 1 | Opens **Voice Tutor** from the Nursing Study hub | Greets the learner and explains voice, text, and privacy controls. |
| 2 | Taps **Speak to Rounds** or writes a message | Records only after device permission; typed input is always available. |
| 3 | Stops recording | Transcribes the utterance and shows the editable transcript before sending. |
| 4 | Taps **Send to tutor** | Sends only the last short conversation window to the protected tutor service. |
| 5 | Receives a reply | Shows a concise response and speaks it using the learner’s saved Rounds pace. |
| 6 | Taps **Stop voice**, starts another turn, or leaves | Immediately stops queued speech. Conversation remains only on that device while the screen is open. |

## Scope and Boundaries

The tutor may explain general Nursing study concepts, clarify terminology, help the learner plan a focused practice topic, and direct the learner to existing Rounds tools. It must identify official Rounds content only when it is actually using that content. It must not claim to diagnose, prescribe, calculate individualized dosing, determine a patient-specific plan, replace emergency care, or turn learner-uploaded content into official clinical guidance.

When a learner asks for patient-specific care, an emergency response, treatment instructions, medication dosing, or another unsafe clinical decision, the service returns a fixed safety redirect rather than a generated answer. The redirect tells the learner to use their local protocol, instructor, licensed supervisor, or emergency services as appropriate.

## Privacy Model

The tutor route requires the learner’s authenticated Rounds session. Raw audio follows the existing transcription flow and is not added to a tutor history. The temporary text conversation lives in the current screen state only; Rounds does not write it to the community feed, learner analytics, owner tools, or a database in this release. Private PDFs are not supplied to the conversational tutor in this first release. Their separate Reader and source-cited practice flows remain private and visibly distinct.

## Voice Design

Responses use device text-to-speech and the learner’s existing saved speech pace. Every spoken response has a visible **Stop voice** control. Starting a recording, sending another message, changing the topic, or leaving the screen interrupts current speech. The user-facing copy reminds iPhone learners that Silent Mode may prevent device speech.

## Quality Rules

Responses should be concise enough to hear comfortably in one turn. They should ask one clarifying question when a study request is too broad, state uncertainty rather than inventing details, and suggest a specific existing Rounds action when useful, such as starting Oral Exam, opening Adaptive Review, or reading a private PDF section. The conversational model is a constrained assistant layer; verified question-bank feedback remains the authoritative Rounds teaching pathway.
