# Local Voice-Clarity Design

## Objective

Echo Reader must reject the idea that “louder” automatically means “clearer.” The goal is to produce intelligible, natural cloned speech from document-grounded text and avoid unclear non-word artifacts such as *mm*, *hm*, or *wah*. The pipeline remains local and uses only the voice owner’s consented recordings.

## Failure Modes and Controls

| Failure mode | Local cause | Control |
| --- | --- | --- |
| Blurred consonants or vowels | Quiet or poorly trimmed reference audio weakens voice conditioning. | Trim silent edges, normalise the reference to a safe peak, and reject clips that are unusually quiet or clipped. |
| Unclear word endings | Long text is generated as one acoustic unit and loses articulation near a boundary. | Split answer text into sentence-sized units and add a small natural pause between generated sentences. |
| A known word is unclear | The base model has insufficient pronunciation guidance for that word. | Apply an explicit local pronunciation and emphasis override, then add an authorised recording prompt for the word to the adaptation dataset. |
| High speed but lower fidelity | The current preview uses a compact distilled, INT8 model selected for mobile-friendly size and speed. | Compare against a higher-fidelity non-distilled local clone-model path before choosing the final bundled model. |
| Audible artifact remains | A generated waveform may contain clipping, low loudness, or unintended silence. | Run a local quality gate and retain user listening feedback as the final acceptance criterion. |

## Reference Roles

The application keeps two different kinds of authorised input separate. The **sentence reference** contains natural guide lines and supplies voice identity, tone, and cadence to the clone model. The **phonetic-support recording** contains vowel and consonant sequences and does not replace the sentence reference; it is used to create targeted prompts and assess vowel/consonant clarity during model adaptation.

| Reference | Approved use | Not used for |
| --- | --- | --- |
| Echo Reader guide lines 001–003 | Main local clone conditioning reference, with exact transcript. | General dataset training without the larger aligned corpus. |
| Echo Reader guide lines 001–070 | Future custom Ugandan English adaptation and evaluation dataset. | Immediate zero-shot reference without local alignment. |
| Vowel/consonant support clip | Phonetic clarity checks and targeted adaptation prompts. | Replacing natural sentence reference for clone identity. |

## Generation Pipeline

1. The document system retrieves a grounded answer and its source context.
2. The text preparation layer normalises whitespace, splits the answer into sentences, and applies any authorised pronunciation overrides.
3. The local clone model generates each sentence using the cleaned sentence reference and its exact reference transcript.
4. The quality gate checks reference and output duration, peak level, RMS loudness, clipping proportion, and silence boundaries.
5. The application plays only a passing local output. The owner’s listening feedback is stored as a quality decision for the next tuning pass.

## Model Direction

The current experiment uses a compact distilled and INT8-quantised clone model because it is suitable for proving offline mobile inference. The official ZipVoice documentation states that the non-distilled model is the default quality-oriented option, while the distilled and INT8 paths are designed for speed and introduce some quality degradation. [1] The final model selection must favour intelligibility over speed for document reading, subject to the size and device-performance cost of the bundled local model.

## References

[1]: https://github.com/k2-fsa/ZipVoice "ZipVoice official repository and usage guidance"
