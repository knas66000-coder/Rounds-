# Contributing to Rounds

Thank you for improving Rounds. The project is a learner-facing mobile application, so each contribution must protect learner privacy, accessibility, and academic integrity.

## Collaboration workflow

Create a branch from `main`, make one focused change, run the validation suite, and open a pull request with a clear summary. Keep pull requests small enough to review. A reviewer should check learner-facing language, navigation, device storage boundaries, and test coverage before merging.

```bash
pnpm check
pnpm lint
pnpm test -- --run
```

## Content boundaries

Do not submit private learner information, patient details, health records, recalled NCLEX or school examination items, copyrighted source text without permission, or content that presents itself as official curriculum, medical advice, grades, or examination prediction. New learning content should be original, subject-specific, educationally clear, and reviewed before release.

## Security and privacy

Never commit environment files, passwords, opaque session tokens, database connection strings, generated learner backups, production data, or service keys. Use `.env.example` for variable names only. Keep offline learner state local unless a learner explicitly elects to use an account-only feature.

## Design expectations

Maintain portrait-first, one-handed mobile layouts. University and High School content must remain in their separate portals; Nursing is a University pack. Use clear labels, accessible touch targets, visible loading/error states, and deterministic tests for new business logic.
