# Private Cloned Voice Boundary

## Product rule

> Every feature that reads text aloud must use the owner’s approved cloned voice. Device text-to-speech is not a speech fallback.

Rounds is responsible for finding or preparing the text to read. It does not generate speech itself and it must not select a phone-installed voice.

## Component responsibilities

| Component | Responsibility | May access private voice recordings? |
| --- | --- | --- |
| Rounds | Finds document passages, prepares answer text, requests speech, and plays returned audio. | No |
| Private voice service | Accepts approved text, selects the owner’s named voice profile, generates cloned audio, and returns it. | Yes, only within private service storage |
| Voice profile | Private configuration and approved reference audio used to make generated speech sound like the owner. | Never leaves the private service |
| Speech engine | Converts text into spoken audio while conditioned on the selected private voice profile. | Uses the profile inside the private service only |

## Required read-aloud flow

```text
User chooses Read aloud
        |
        v
Rounds prepares permitted text
        |
        v
Private voice service receives text + approved profile identifier
        |
        v
Speech engine generates audio in the owner’s cloned voice
        |
        v
Rounds plays returned audio
```

The profile identifier is an internal name such as `owner-primary`. Rounds sends this identifier, never a raw recording, reference waveform, speaker embedding, or model file.

## Failure behavior

If cloned speech cannot be generated, Rounds must keep the text visible and state that cloned speech is unavailable. It must not silently switch to the device speech engine or another provider.

## Privacy requirements

The service will use authentication, encrypted transport, a maximum text length, request rate limits, and no retention of read-aloud text or generated audio beyond the immediate request. The source recordings, active reference selection, clone model, and generated quality artifacts remain private service-side assets and are excluded from GitHub.
