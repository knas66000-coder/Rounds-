# Private Cloned Voice API Contract

## Purpose

This service turns permitted text into audio in the owner’s approved cloned voice. It is not a general chat system and it does not receive raw voice recordings from Rounds.

## Read-aloud request

```http
POST /v1/speech
Authorization: Bearer <private-service-token>
Content-Type: application/json
Accept: audio/wav
```

```json
{
  "text": "Please review the source passage carefully.",
  "voiceProfileId": "owner-primary",
  "pronunciationProfile": "ug-en-document-reader",
  "quality": "clarity"
}
```

| Field | Service rule |
| --- | --- |
| `text` | Required. Plain text only, limited to a safe maximum length and split into sentences internally. |
| `voiceProfileId` | Required. The service accepts only configured private profile identifiers. `owner-primary` is the default profile. |
| `pronunciationProfile` | Optional named server-side pronunciation rules. The current approved choice is `ug-en-document-reader`. |
| `quality` | Optional. `clarity` prefers clearer sentence-by-sentence synthesis over speed. |

The successful response is `audio/wav`. Rounds plays this file as generated audio and never calls device text-to-speech.

## Service flow

```text
Rounds
  sends text + profile ID + cloned-voice access token
        |
        v
Private voice API validates request and selects the configured private profile
        |
        v
Speech engine generates audio conditioned on that profile
        |
        v
Private voice API returns WAV bytes over HTTPS
        |
        v
Rounds plays returned audio
```

## Service endpoints

| Endpoint | Purpose | Privacy behavior |
| --- | --- | --- |
| `POST /v1/speech` | Generate cloned speech from text. | Authenticated; accepts no raw recording; does not retain text or audio after the response. |
| `GET /health` | Confirm that the private service is ready. | Returns only service readiness and version information. |

## Security and privacy controls

The API must use HTTPS in deployment. It must validate a private bearer token, rate-limit requests, reject oversized text, and return generic errors without model or filesystem details. The service records no request text, no generated audio, no source-document content, and no voice audio in application logs.

The token is stored in protected device storage on Rounds, not in source code or ordinary app preferences. The private voice recordings, selected reference audio, model files, and voice-profile configuration remain on the private service and are excluded from GitHub.

## Strict failure rule

If the private service is unavailable or rejects a request, Rounds keeps the text on screen and shows that cloned speech is unavailable. It does not substitute phone speech, another voice provider, or a different voice profile.
