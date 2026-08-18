# Rounds Local Voice Quality Strategy

## Decision

Rounds will not rely on a device’s default system language or default voice. Instead, it will find the English voices installed on that device, choose an eligible English candidate deliberately, let the learner preview and select it, and remember that choice for all Rounds spoken learning features.

This is a no-cost improvement that reduces the risk of an unclear regional default voice, such as an English voice whose accent or language pack is not suitable for the learner. It does not create a cloud neural voice or guarantee identical sound across all phones. A truly identical tutor voice requires Rounds to provide the generated audio itself through a licensed voice service or a large bundled model.

## Engine Roles

| Situation | Selected engine | Rounds behavior |
|---|---|---|
| A selected English voice is installed | **Chosen local English voice** | Reads questions, feedback, rationales, PDF passages, and Voice Tutor replies. |
| Selected voice has been removed | **Best eligible installed English voice** | Uses the best ranked local English voice and asks the learner to review the choice in Settings. |
| No eligible English voice is available | **Text-only recovery** | Leaves the response visible and explains that an English voice pack must be installed before spoken delivery can resume. |
| Learner chooses another voice | **New chosen local English voice** | Stops current speech, saves the new voice ID locally, and uses it for the next utterance. |

Only one engine speaks at a time. Starting a new response, recording an answer, leaving a screen, or pressing **Stop voice** clears queued local speech before the next action begins.

## Voice Ranking

Rounds will only consider voices whose language begins with `en`. It will prioritize English variants in this order: `en-US`, `en-GB`, `en-AU`, `en-CA`, then another installed English variant. Within the same language, it will prefer the provider’s higher reported quality when available. The ranking chooses a starting point, not a promise of quality; a learner can always preview and choose a different installed English voice.

## Pronunciation Preparation

Before local speech is sent to the device engine, Rounds will format common Nursing notation into words that are more likely to be pronounced clearly. For example, symbols become spoken comparisons, `mL` becomes “milliliters,” `mg` becomes “milligrams,” `SpO₂` becomes “S P O two,” and common abbreviations such as `BP` and `IV` become their full clinical terms where the Rounds teaching text uses them. This formatting is only for audio delivery; it never changes the learner’s visible question, response, private PDF, or record.

## Learner Controls

Settings will show the selected local English voice, provide a short Nursing-focused preview, offer the available English voices one at a time, retain speech pace and spoken-rationale controls, and explain the device limitation honestly. The selection remains local to the learner’s device, without adding voice preference data to Community, Owner Control, or private data exports.

## Quality Boundary

This release improves consistency and gives learners control without a paid API. It cannot promise a fault-free identical voice on every handset because the voice files remain supplied by the operating system or device vendor. If Rounds later adopts a licensed neural voice service, the same settings architecture can route connected dynamic replies to that single Rounds voice while retaining the local voice as the offline fallback.
