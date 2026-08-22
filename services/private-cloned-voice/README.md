# Private Cloned Voice Service

This is a standalone private HTTP service for the user’s cloned voice. Rounds sends text and the configured profile identifier; the service returns generated WAV audio. It never accepts raw voice recordings from Rounds and it does not contain a device text-to-speech fallback.

## What this repository contains

| Included | Deliberately excluded |
| --- | --- |
| API source code, tests, public pronunciation rules, and example configuration | Voice recordings, active references, generated WAV output, API tokens, model binaries, and private profile configuration |

The service defaults to the approved `owner-primary` profile name. The actual audio path and matching transcript belong only in the private `voice-profiles.json` file installed on the service machine.

## Private setup

Install the requirements on the dedicated server, then create a private configuration directory outside the repository:

```bash
mkdir -p /srv/private-voice/config /srv/private-voice/private-data /srv/private-voice/models
cp config/voice-profiles.example.json /srv/private-voice/config/voice-profiles.json
```

Use `config/runtime-environment.template.txt` only as a list of required environment variable names. Set their real values in the private process environment on the service host. Place only the approved reference and model files in `/srv/private-voice/`. Update the private profile configuration with their real paths. Do not commit those files or copy them to Rounds.

## Run locally

```bash
uvicorn app.main:create_configured_app --factory --host 127.0.0.1 --port 8090
```

The development address is intentionally loopback-only. A deployed private service must use HTTPS, a firewall, and an authenticated reverse proxy or secured application endpoint.

## API behavior

`POST /v1/speech` requires a bearer token and accepts `text`, `voiceProfileId`, an optional `pronunciationProfile`, and `quality: "clarity"`. It sends an `audio/wav` response with `Cache-Control: no-store`.

`GET /health` reports only service readiness. It does not expose voice-profile paths, model details, or personal data.

## Tests

The unit tests replace the actual synthesis engine with an in-memory stub. They validate authentication, configured-profile enforcement, input limits, and uncached WAV responses without requiring a model or any personal recording.

```bash
./scripts/run-tests.sh
```
