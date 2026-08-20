# Rounds

Rounds is a voice-first, local-first mobile learning application built with Expo and React Native. It supports NCLEX nursing practice, University course packs, and Uganda-focused Senior 1–6 high-school subjects. Learners can study without an account; an optional secure profile is only needed for Community features.

## Live application

The current public application is available at [roundsnclex-mjcssreo.manus.space](https://roundsnclex-mjcssreo.manus.space).

## Learning portals

Rounds deliberately separates education levels. **University** contains Nursing, Foundation Year, Computing, Business, Engineering, Natural Sciences, Education, and Social Sciences. **High School** contains Uganda-focused subject packs. Learners choose a portal before browsing its catalogue, and Nursing remains within University.

## Included capabilities

| Area | What is included |
|---|---|
| Practice | NCLEX-style practice, verbal responses, typed fallback, feedback, bookmarks, adaptive review, and timed mock exams. |
| Voice | Installed-English voice selection, question narration, optional spoken rationales, and native microphone transcription. |
| University | Dedicated University portal, per-pack local topic pathways, no-repeat four-topic sessions, offline search, private progress, saved review, and reflections. |
| High School | Dedicated Uganda High School portal, 19 subject packs, Senior 1–6 scope, varied topic sessions, private milestones, weekly rhythm, saved topics, and offline search. |
| Privacy | Local-first learner profile, encrypted local study-backup export, and optional account access only for Community and notifications. |
| Community | Secure Rounds-native email/password profiles, moderated study updates, replies, reactions, reports, and notifications. |

## Technology

- Expo SDK 54, React Native 0.81, Expo Router, TypeScript, and NativeWind.
- AsyncStorage for private on-device learning state.
- Express, tRPC, Drizzle ORM, and MySQL for optional online Community functionality.
- Expo Speech, Audio, File System, Sharing, and Secure Store for native capabilities.
- Vitest for deterministic tests.

## Run locally

Use Node.js 22 and pnpm 9 or newer.

```bash
pnpm install
pnpm dev
```

The mobile preview starts through Expo. The development server also starts the optional backend used by Community and account-only features.

| Command | Purpose |
|---|---|
| `pnpm check` | Type-check the source. |
| `pnpm lint` | Run Expo linting. |
| `pnpm test -- --run` | Run deterministic test coverage. |
| `pnpm build` | Build the production server bundle. |
| `npx expo export --platform web` | Produce the web export. |

## Environment configuration

Read [docs/local-configuration.md](./docs/local-configuration.md) for the names and purpose of local configuration values. Do not commit `.env`, `.env.local`, service credentials, database connection strings, learner exports, or generated build files. The offline learning experience can be explored without an account. Online Community, notifications, and production services require appropriately configured infrastructure.

## Collaborating

Read [CONTRIBUTING.md](./CONTRIBUTING.md) before opening a pull request. In particular, do not add patient information, recalled exam items, private learner data, API keys, or unreviewed academic content. See [SECURITY.md](./SECURITY.md) for responsible disclosure guidance.

## Public-repository status

This source tree is prepared for a public repository. The owner must select the destination repository and approve the publication action before it is pushed publicly. Choose a software licence before public release if you want to grant reuse rights beyond collaborator access.
